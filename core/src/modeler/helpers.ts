import {
	isIdentifier,
	SyntaxKind,
	TypeReferenceNode,
	isArrayTypeNode,
	isTypeNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	PropertyDeclaration,
	TypeNode,
	Identifier,
} from "typescript";
import { ColumnDefinition, DatabaseType, Modifiers, TypeClass } from "./types";

export const retrievePropName = (props: PropertyDeclaration) => {
	const { name } = props;
	if (props && isIdentifier(name)) {
		return String(name.escapedText);
	}
	throw new Error("Unexpected lack of identifier for prop");
};
const isDateType = (typeName: Identifier) => typeName.escapedText === "Date";
export const processFromTypeReferenceNode: (
	prop: PropertyDeclaration,
	elementType: TypeReferenceNode
) => ColumnDefinition = (prop, elementType) => {
	const { typeName } = elementType;
	if (isIdentifier(typeName)) {
		return {
			fieldName: retrievePropName(prop),
			type: String(typeName.escapedText),
			typeClass: isDateType(typeName)
				? TypeClass.Base
				: TypeClass.Relationship,
			nullable:
				typescriptSyntaxKindToDatabaseTypeMap(elementType.kind) !==
				DatabaseType.undefined,
		};
	}
	throw new Error("Unexpected type reference");
};
const isNodeUndefined = (prop: PropertyDeclaration, node: TypeNode) =>
	typescriptSyntaxKindToDatabaseTypeMap(node.kind) ===
		DatabaseType.undefined || prop.questionToken !== undefined;

const processSingularNode: (
	prop: PropertyDeclaration,
	type: TypeNode
) => ColumnDefinition = (prop, type) => {
	//For dates
	if (isTypeReferenceNode(type)) {
		return processFromTypeReferenceNode(prop, type);
	}
	//For arrays of classes
	if (isArrayTypeNode(type)) {
		const { elementType } = type;
		if (isTypeReferenceNode(elementType)) {
			return processFromTypeReferenceNode(prop, elementType);
		}
	}

	//For base types such as string, number, boolean
	if (isTypeNode(type)) {
		const mapKind = typescriptSyntaxKindToDatabaseTypeMap(type.kind);
		if (!mapKind) {
			throw new Error(
				"This error indicates a base type was found in an unexpected location"
			);
		}
		return {
			fieldName: retrievePropName(prop),
			type: mapKind,
			typeClass: TypeClass.Base,
			nullable: isNodeUndefined(prop, type),
			flags: getFlags(prop),
		};
	}
	throw new Error("Node was not classified");
};
const getFlags = (prop: PropertyDeclaration) => {
	const { modifiers } = prop;
	if (modifiers) {
		const decorators = modifiers.filter(
			(modifier) => modifier.kind === SyntaxKind.Decorator
		);
		let flags: [primary: boolean, foreign: boolean] = [false, false];
		console.log(decorators);
		return decorators.length > 0 ? [Modifiers.PrimaryKey] : undefined;
	}
	return undefined;
};
export const processNode: (
	prop: PropertyDeclaration,
	type: TypeNode
) => ColumnDefinition = (prop, type) => {
	//For union types
	if (isUnionTypeNode(type)) {
		const { types } = type;
		const isNullable = types.some((t) => isNodeUndefined(prop, t));
		const notUndefinedType = types.find((t) => !isNodeUndefined(prop, t));

		return {
			...processSingularNode(prop, notUndefinedType!),
			nullable: isNullable,
		};
	} else {
		return { ...processSingularNode(prop, type) };
	}
};

//going to remap these because they will be part of the interface for different dialects
export const typescriptSyntaxKindToDatabaseTypeMap = (kind: SyntaxKind) => {
	switch (kind) {
		case SyntaxKind.StringKeyword:
			return DatabaseType.string;
		case SyntaxKind.NumberKeyword:
			return DatabaseType.number;
		case SyntaxKind.BooleanKeyword:
			return DatabaseType.boolean;
		case SyntaxKind.UndefinedKeyword:
			return DatabaseType.undefined;
		case SyntaxKind.TypeReference:
			//We handle typereferences different elsewhere
			return null;
		default:
			//We want to know when a reference comes up with an unexpected value
			console.error(kind);
			return null;
	}
};
