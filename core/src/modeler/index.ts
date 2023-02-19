import {
	isArrayTypeNode,
	isClassDeclaration,
	isPropertyDeclaration,
	isTypeNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	PropertyDeclaration,
	SourceFile,
	TypeNode,
} from "typescript";
import {
	processFromTypeReferenceNode,
	retrievePropName,
	typescriptSyntaxKindToMigratorMap,
} from "./helpers";
import { MemberDefinition, MigratorKind } from "./types";
const isNodeUndefined = (node: TypeNode) =>
	typescriptSyntaxKindToMigratorMap(node.kind) === MigratorKind.undefined;

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
			nullable: isNodeUndefined(type),
		};
	}
	throw new Error("Node was not classified");
};

const processNode: (
	prop: PropertyDeclaration,
	type: TypeNode
) => MemberDefinition = (prop, type) => {
	//For union types
	if (isUnionTypeNode(type)) {
		const { types } = type;
		const isNullable = types.some((t) => isNodeUndefined(t));
		const notUndefinedType = types.find((t) => !isNodeUndefined(t));

		return {
			...processSingularNode(prop, notUndefinedType!),
			nullable: isNullable,
		};
	} else {
		return processSingularNode(prop, type);
	}
};
class Modeler {
	static extract = (files: SourceFile[]) => {
		const classDeclarations = files.flatMap((file) => {
			const classDeclarations =
				file.statements.filter(isClassDeclaration);
			return classDeclarations.map((classDeclaration) => {
				const name = classDeclaration.name?.escapedText;
				const members = classDeclaration.members
					.filter(isPropertyDeclaration)
					.map((prop) => {
						const { type } = prop;
						if (type) {
							return processNode(prop, type);
						}
						return null;
					})
					.filter(Boolean);
				return { name, members };
			});
		});
		return classDeclarations.filter((classInfo) => classInfo.name);
	};
}

export default Modeler;
