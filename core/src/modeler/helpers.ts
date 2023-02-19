import ts, {
	isIdentifier,
	PropertyDeclaration,
	SyntaxKind,
	TypeReferenceNode,
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
	if (ts.isIdentifier(typeName)) {
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
