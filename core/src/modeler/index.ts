import {
	isClassDeclaration,
	isPropertyDeclaration,
	SourceFile,
} from "typescript";
import {
	TableInfo,
	ColumnDefinition,
	Modifiers,
} from "../automigrate-api/types";
import { processNode } from "./helpers";
class Modeler {
	static extract: (
		files: SourceFile[],
		registeredTypes: any[]
	) => TableInfo[] = (files, registered) => {
		const classDeclarations = files.flatMap((file) => {
			const classDeclarations =
				file.statements.filter(isClassDeclaration);
			return classDeclarations.map<TableInfo>((classDeclaration) => {
				const name = String(classDeclaration.name?.escapedText);
				const members = classDeclaration.members
					.filter(isPropertyDeclaration)
					.map<ColumnDefinition | false>((prop) => {
						const { type } = prop;
						if (type) {
							const target = registered.find(
								(r) => r.name === name
							);
							try {
								const instance = new target();
								return processNode(instance, prop, type);
							} catch {
								throw new Error(
									`Target '${name}' has no registered instance, did you forget to add it to registeredTypes?`
								);
							}
						}
						return false;
					})
					.filter(Boolean) as ColumnDefinition[];
				const modFlatMap = members.flatMap((r) =>
					r.modifiers?.flatMap(
						(m) => m.modifier === Modifiers.ForeignKey && m.target
					)
				);
				const relationships = modFlatMap.filter(Boolean) as string[];
				return { name, columns: members, relationships };
			});
		});
		return classDeclarations.filter((classInfo) => classInfo.name);
	};
}

export default Modeler;
