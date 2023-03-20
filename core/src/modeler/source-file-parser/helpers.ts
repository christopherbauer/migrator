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
	isCallExpression,
	Identifier,
} from "typescript";
import {
	ColumnDefinition,
	DatabaseType,
	KeyMetaData,
} from "../../automigrate-api/types";
import {
	extractKeyData,
	typescriptSyntaxKindToDatabaseTypeMap,
} from "./interpreter";

export const getPropName = (props: PropertyDeclaration) => {
	const { name } = props;
	if (props && isIdentifier(name)) {
		return String(name.escapedText);
	}
	throw new Error("Unexpected lack of identifier for prop");
};
export const isDateType = (typeName: Identifier) =>
	typeName.escapedText === "Date";

export const processFromTypeReferenceNode: (
	prop: PropertyDeclaration,
	elementType: TypeReferenceNode
) => ColumnDefinition = (prop, elementType) => {
	const { typeName } = elementType;
	if (isIdentifier(typeName)) {
		const isDate = isDateType(typeName);
		return {
			fieldName: getPropName(prop),
			type: isDate
				? DatabaseType.date
				: typescriptSyntaxKindToDatabaseTypeMap(elementType.kind),
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

const extractDecoratorData: <T>(
	instance: T,
	prop: PropertyDeclaration
) => KeyMetaData[] = (instance, prop) => {
	const { modifiers } = prop;
	if (modifiers) {
		const decorators = modifiers.filter(
			(modifier) => modifier.kind === SyntaxKind.Decorator
		);
		return decorators.reduce<KeyMetaData[]>((keyData, current) => {
			if (current.kind === SyntaxKind.Decorator) {
				let { expression } = current;
				if (isCallExpression(expression)) {
					return keyData.concat(
						extractKeyData(instance, prop, expression.expression)
					);
				}
				return keyData.concat(
					extractKeyData(instance, prop, expression)
				);
			}
			return keyData;
		}, []);
	}
	return [];
};

const processSingularNode: <T>(
	instance: T,
	prop: PropertyDeclaration,
	type: TypeNode
) => ColumnDefinition = (instance, prop, type) => {
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
			fieldName: getPropName(prop),
			type: mapKind,
			nullable: isNodeUndefined(prop, type),
			modifiers: extractDecoratorData(instance, prop),
		};
	}
	throw new Error("Node was not classified");
};

export const processClassProperty: <T>(
	instance: T,
	prop: PropertyDeclaration,
	type: TypeNode
) => ColumnDefinition = (instance, prop, type) => {
	//For union types
	if (isUnionTypeNode(type)) {
		const { types } = type;
		const isNullable = types.some((t) => isNodeUndefined(prop, t));
		const notUndefinedType = types.filter((t) => !isNodeUndefined(prop, t));
		if (notUndefinedType.length !== 1) {
			throw new Error(
				`Property '${getPropName(
					prop
				)}' is either only undefined or has an unrepresentable type`
			);
		} else {
			return {
				...processSingularNode(instance, prop, notUndefinedType[0]),
				nullable: isNullable,
			};
		}
	} else {
		return processSingularNode(instance, prop, type);
	}
};
