import ts, {
	isClassDeclaration,
	isPropertyDeclaration,
	SourceFile,
} from "typescript";
import {
	TableInfo,
	ColumnDefinition,
	Modifiers,
} from "../automigrate-api/types";
import { processClassProperty } from "./helpers";
const extractForeignKeyTables: (cols: ColumnDefinition[]) => string[] = (
	cols
) =>
	cols
		.flatMap((r) =>
			r.modifiers?.flatMap(
				(m) => m.modifier === Modifiers.ForeignKey && m.target
			)
		)
		.filter(Boolean) as string[];
const tryGetTargetInstance = (
	registeredTypes: any[],
	classDeclaration: ts.ClassDeclaration
) => {
	const name = String(classDeclaration.name?.escapedText);
	const target = registeredTypes.find((r) => r.name === name);
	try {
		const instance = new target();
		return instance;
	} catch {
		throw new Error(
			`Target '${name}' has no registered instance, did you add it to registeredTypes?`
		);
	}
};
const getColumnDefinitionsFrom: (
	classDeclaration: ts.ClassDeclaration,
	registeredTypes: any[]
) => ColumnDefinition[] = (classDeclaration, registeredTypes) =>
	classDeclaration.members
		.filter(isPropertyDeclaration)
		.map<ColumnDefinition | false>((prop) => {
			const { type } = prop;
			if (type) {
				return processClassProperty(
					tryGetTargetInstance(registeredTypes, classDeclaration),
					prop,
					type
				);
			}
			return false;
		})
		.filter(Boolean) as ColumnDefinition[];
const getClassesFrom = (file: ts.SourceFile) =>
	file.statements.filter(isClassDeclaration);
class Modeler {
	static extract: (
		files: SourceFile[],
		registeredTypes: any[]
	) => TableInfo[] = (files, registeredTypes) => {
		return files
			.flatMap((file) => {
				const classesInFile = getClassesFrom(file);
				return classesInFile.map<TableInfo>((theClass) => {
					const members = getColumnDefinitionsFrom(
						theClass,
						registeredTypes
					);
					const relationships = extractForeignKeyTables(members);
					return {
						name: String(theClass.name?.escapedText),
						columns: members,
						relationships,
					};
				});
			})
			.filter((table) => table.name);
	};
}

export default Modeler;
