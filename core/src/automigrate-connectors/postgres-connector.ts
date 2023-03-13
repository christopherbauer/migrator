import { AutomigrateAPI, AutomigrateOutput } from "../automigrate-api";
import {
	ColumnDefinition,
	DatabaseType,
	Modifiers,
	TableInfo,
} from "../automigrate-api/types";

const postgresMap: Record<DatabaseType, (size?: number) => string | null> = {
	[DatabaseType.string]: (size: number = 50) => `VARCHAR(${size})`,
	[DatabaseType.boolean]: () => "BOOLEAN",
	[DatabaseType.number]: () => "INTEGER",
	[DatabaseType.date]: () => "TIMESTAMP",
	[DatabaseType.undefined]: () => null,
};
const columnMap = (c: ColumnDefinition) =>
	[
		c.fieldName,
		`${postgresMap[c.type]()}`,
		!c.nullable ? "NOT NULL" : undefined,
		c.modifiers?.map((m) => {
			switch (m.modifier) {
				case Modifiers.PrimaryKey:
					return "PRIMARY KEY";
				case Modifiers.ForeignKey:
					return relationshipMap(m.target, m.property);
			}
		}),
	].join(" ");
const relationshipMap = (targetName: string, targetMember: string) =>
	`REFERENCES ${targetName} (${targetMember})`;
const tableCreateMapper = (t: TableInfo) =>
	[
		`CREATE TABLE ${t.name} (`,
		t.columns.map((c) => columnMap(c)).join(", "),
	].join("");
const tableDropMapper = (t: TableInfo) => `DROP TABLE ${t.name};`;
const NOT_FOUND = -1;
export const tableRelationshipSort: (a: TableInfo, b: TableInfo) => number = (
	a,
	b
) => {
	return a.relationships.indexOf(b.name) === NOT_FOUND ? 1 : -1; //move b ahead of a if a is a relationship
};
export class PostgresConnector implements AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput> = (
		tables
	) => {
		return Promise.resolve({
			up: tables.map(tableCreateMapper),
			down: tables.sort(tableRelationshipSort).map(tableDropMapper),
		});
	};
}
