import { AutomigrateAPI, AutomigrateOutput } from "../automigrate-api";
import { TableInfo, ColumnDefinition } from "../modeler";
import { DatabaseType, Modifiers } from "../modeler/types";

const postgresMap: Record<DatabaseType, (size?: number) => string | null> = {
	[DatabaseType.string]: (size: number = 50) => `VARCHAR(${size})`,
	[DatabaseType.boolean]: () => "BOOLEAN",
	[DatabaseType.number]: () => "INTEGER",
	[DatabaseType.undefined]: () => null,
};
const columnMap = (tableName: string, c: ColumnDefinition) =>
	[
		c.fieldName,
		`${postgresMap[c.type]()}`,
		!c.nullable ? "NOT NULL" : undefined,
		c.modifiers?.map((m) => {
			switch (m.modifier) {
				case Modifiers.PrimaryKey:
					return "PRIMARY KEY";
				case Modifiers.ForeignKey:
					return relationshipMap(tableName, c, m.target, m.property);
			}
		}),
	].join(" ");
const relationshipMap = (
	sourceName: string,
	sourceMember: ColumnDefinition,
	targetName: string,
	targetMember: string
) =>
	`CONSTRAINT fk_${sourceName}_${targetName} FOREIGN KEY (${sourceMember.fieldName}) REFERENCES ${targetName} (${targetMember})`;
const tableCreateMapper = (t: TableInfo) =>
	[
		`CREATE TABLE ${t.name} (`,
		t.columns.map((c) => columnMap(t.name, c)).join(", "),
		t.relationships
			.map((r) => {
				console.log(r);
				return r.modifiers?.flatMap((m) => {
					console.log(m);
					if (m.modifier === Modifiers.ForeignKey) {
						return relationshipMap(t.name, r, m.target, m.property);
					}
					return null;
				});
			})
			.join("."),
		`);`,
	].join("");
const tableDropMapper = (t: TableInfo) => `DROP TABLE ${t.name};`;
export class PostgresConnector implements AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput> = (
		tables
	) => {
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
