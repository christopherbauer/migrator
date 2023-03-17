import { SourceFile } from "typescript";
import {
	TableInfo,
	ColumnDefinition,
	Modifiers,
} from "../automigrate-api/types";
import { getClassesFrom, getColumnDefinitionsFrom } from "./source-file-parser";
import { PostgresPlugin } from "../automigrate-plugins";
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
export { PostgresPlugin };
