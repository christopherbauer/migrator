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
} from "typescript";
import { MemberDefinition, MigratorKind } from "./types";

export const retrievePropName = (props: PropertyDeclaration) => {
	const { name } = props;
	if (props && isIdentifier(name)) {
		return String(name.escapedText);
	}
	throw new Error("Unexpected lack of identifier for prop");
};
export const processFromTypeReferenceNode: (
	prop: PropertyDeclaration,
	elementType: TypeReferenceNode
) => MemberDefinition = (prop, elementType) => {
	const { typeName } = elementType;
	if (isIdentifier(typeName)) {
		return {
			fieldName: retrievePropName(prop),
			type: String(typeName.escapedText),
			nullable:
				typescriptSyntaxKindToMigratorMap(elementType.kind) !==
				MigratorKind.undefined,
		};
	}
	throw new Error("Unexpected type reference");
};
const isNodeUndefined = (prop: PropertyDeclaration, node: TypeNode) =>
	typescriptSyntaxKindToMigratorMap(node.kind) === MigratorKind.undefined ||
	prop.questionToken !== undefined;

const processSingularNode: (
	prop: PropertyDeclaration,
	type: TypeNode
) => MemberDefinition = (prop, type) => {
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
		const mapKind = typescriptSyntaxKindToMigratorMap(type.kind);
		if (!mapKind) {
			throw new Error(
				"This error indicates a base type was found in an unexpected location"
			);
		}
		return {
			fieldName: retrievePropName(prop),
			type: mapKind,
			nullable: isNodeUndefined(prop, type),
		};
	}
	throw new Error("Node was not classified");
};

export const processNode: (
	prop: PropertyDeclaration,
	type: TypeNode
) => MemberDefinition = (prop, type) => {
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
		return processSingularNode(prop, type);
	}
};

//going to remap these because they will be part of the interface for different dialects
export const typescriptSyntaxKindToMigratorMap = (kind: SyntaxKind) => {
	switch (kind) {
		case SyntaxKind.StringKeyword:
			return MigratorKind.string;
		case SyntaxKind.NumberKeyword:
			return MigratorKind.number;
		case SyntaxKind.BooleanKeyword:
			return MigratorKind.boolean;
		case SyntaxKind.UndefinedKeyword:
			return MigratorKind.undefined;
		default:
			console.error(kind);
			return null;
	}
};
