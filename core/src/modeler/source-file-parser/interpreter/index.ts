import {
	Expression,
	Identifier,
	isIdentifier,
	PropertyDeclaration,
	SyntaxKind,
} from "typescript";
import {
	DatabaseType,
	KeyMetaData,
	Modifiers,
} from "../../../automigrate-api/types";
import { getForeignKeyData } from "../../decorators/ForeignKey";
import { getPrimaryKeyData } from "../../decorators/PrimaryKey";
import { getPropName } from "../helpers";

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
		case SyntaxKind.TypeReference:
			return DatabaseType.undefined;
		default:
			//We want to know when a reference comes up with an unexpected value
			throw new Error(`Type not found for ${kind}`);
	}
};
const textToModifier = (text: string) => {
	switch (text) {
		case "PrimaryKey":
			return Modifiers.PrimaryKey;
		case "ForeignKey":
			return Modifiers.ForeignKey;
		default:
			throw new Error(`Modifier ${text} not found`);
	}
};
export const isDateType = (typeName: Identifier) =>
	typeName.escapedText === "Date";

export const extractKeyData = <T>(
	instance: T,
	prop: PropertyDeclaration,
	keyData: KeyMetaData[],
	expression: Expression
) => {
	if (!isIdentifier(expression)) {
		throw new Error("Unexpected non-identifier expression");
	}
	const modifier = textToModifier(String(expression.escapedText));
	switch (modifier) {
		case Modifiers.PrimaryKey:
			const primaryKeyData = getPrimaryKeyData(
				instance,
				getPropName(prop)
			);
			return keyData.concat({
				modifier: modifier,
				property: primaryKeyData.key,
			});
		case Modifiers.ForeignKey:
			const foreignKeyData = getForeignKeyData(
				instance,
				getPropName(prop)
			);
			return keyData.concat({
				modifier: modifier,
				target: foreignKeyData.target,
				property: foreignKeyData.key,
			});
		default:
			throw new Error(`Modifier ${modifier} unrecognized`);
	}
};
