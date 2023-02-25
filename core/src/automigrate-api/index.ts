import { ColumnDefinition, TableInfo } from "../modeler";

export type AutomigrateOutput = { up: string[]; down: string[] };
export interface AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput>;
	createTable: (table: TableInfo) => Promise<AutomigrateOutput>;
	// createRelationship: (
	// 	sourceName: string,
	// 	sourceMember: ColumnDefinition,
	// 	targetName: string,
	// 	targetMember: ColumnDefinition
	// ) => Promise<AutomigrateOutput>;
}
