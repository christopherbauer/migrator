import { AutomigrateAPI, AutomigrateOutput } from "../automigrate-api";
import { TableInfo, ColumnDefinition } from "../modeler";

const columnMap = (c: ColumnDefinition) =>
	`${c.fieldName} ${c.typeClass} ${!c.nullable && "NOT NULL"}`;
const relationshipMap = (
	sourceName: string,
	sourceMember: ColumnDefinition,
	targetName: string,
	targetMember: ColumnDefinition
) => `FOREIGN KEY (${sourceMember}) REFERENCES ${targetName} (${targetMember})`;
const tableCreateMapper = (t: TableInfo) => `CREATE TABLE ${t.name} (
				${t.columns.map(columnMap)}	
			);`;
const tableDropMapper = (t: TableInfo) => `DROP TABLE ${t.name};`;
export class PostgresConnector implements AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput> = (
		tables
	) => {
		// ${t.relationships.map(r => relationshipMap(t.name, generateRelationshipName(t.rel), r.type, r.fieldName))}
		return Promise.resolve({
			up: tables.map(tableCreateMapper),
			down: tables.map(tableDropMapper),
		});
	};

	createTable: (table: TableInfo) => Promise<AutomigrateOutput> = (table) => {
		return Promise.resolve({
			up: [tableCreateMapper(table)],
			down: [tableDropMapper(table)],
		});
	};
}
