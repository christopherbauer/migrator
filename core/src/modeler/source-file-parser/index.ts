import {
	SourceFile,
	ClassDeclaration,
	isPropertyDeclaration,
	isClassDeclaration,
} from "typescript";
import { ColumnDefinition } from "../../automigrate-api/types";
import { processClassProperty } from "./helpers";

/**
 * Attemps to instantiate an instance of the current class. If the instance isn't found it throws an error that clarifies what might have went wrong.
 * @param registeredTypes Array of registered classes
 * @param classDeclaration The current class declaration
 * @returns An instance of the target class
 */
export const tryGetTargetInstance = (
	registeredTypes: any[],
	classDeclaration: ClassDeclaration
) => {
	const name = String(classDeclaration.name?.escapedText);
	try {
		const target = registeredTypes.find((r) => r.name === name);
		if (!target) {
			throw new Error(
				`Target '${name}' has no registered instance, did you add it to registeredTypes?`
			);
		}
		return new target();
	} catch (ex) {
		throw ex;
	}
};

export const getPropertiesOf = (classDeclaration: ClassDeclaration) =>
	classDeclaration.members.filter(isPropertyDeclaration);
export const getClassesFrom = (file: SourceFile) =>
	file.statements.filter(isClassDeclaration);

/**
 * Retrieves the column definition from a class declaration
 * @param classDeclaration Current class declaration
 * @param registeredTypes Array of registered classes
 * @returns A column definition or false if the properties cannot be parsed
 */
export const getColumnDefinitionsFrom: (
	classDeclaration: ClassDeclaration,
	registeredTypes: any[]
) => ColumnDefinition[] = (classDeclaration, registeredTypes) =>
	getPropertiesOf(classDeclaration)
		.map<ColumnDefinition | false>((prop) => {
			if (prop.type) {
				return processClassProperty(
					tryGetTargetInstance(registeredTypes, classDeclaration),
					prop,
					prop.type
				);
			}
			return false;
		})
		.filter(Boolean) as ColumnDefinition[];
