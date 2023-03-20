import {
	Expression,
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

/**
 * This method is used as an anti-corruption layer for Typescript's SyntaxKind
 * @param kind SyntaxKind from typescript
 * @returns The database type
 */
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
/**
 * Decorators are identified by the expression text, so this method converts the text of the decorator to the Modifer enum
 * @param text The text
 * @returns The modifier
 */
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

/**
 * Method for extracting the data for the key based on the decorators defined in the spec
 * @param instance An instance of the class
 * @param prop The property that we're inspecting
 * @param expression The typescript node expression
 * @returns The current decorator's KeyMetaData
 */
export const extractKeyData: <T>(
	instance: T,
	prop: PropertyDeclaration,
	expression: Expression
) => KeyMetaData = (instance, prop, expression) => {
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
			return {
				modifier: modifier,
				property: primaryKeyData.key,
			};
		case Modifiers.ForeignKey:
			const foreignKeyData = getForeignKeyData(
				instance,
				getPropName(prop)
			);
			return {
				modifier: modifier,
				target: foreignKeyData.target,
				property: foreignKeyData.key,
			};
		default:
			throw new Error(`Modifier ${modifier} unrecognized`);
	}
};
