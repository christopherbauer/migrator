import { AutomigrateAPI, AutomigrateOutput } from "../../automigrate-api";
import {
	ColumnDefinition,
	DatabaseType,
	Modifiers,
	TableInfo,
} from "../../automigrate-api/types";
import { tableRelationshipSort } from "../helpers";

/**
 * Create a map from the database type to the type in postgres
 */
const postgresMap: Record<DatabaseType, (size?: number) => string | null> = {
	[DatabaseType.string]: (size: number = 50) => `VARCHAR(${size})`,
	[DatabaseType.boolean]: () => "BOOLEAN",
	[DatabaseType.number]: () => "INTEGER",
	[DatabaseType.date]: () => "TIMESTAMP",
	[DatabaseType.undefined]: () => null,
};
/**
 *
 * @param c The column definition to build off of
 * @returns A script for creating one column in a table definition
 */
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
	]
		.filter(Boolean)
		.join(" ");

/**
 *
 * @param targetName The table name
 * @param targetMember The table's property
 * @returns
 */
const relationshipMap = (targetName: string, targetMember: string) =>
	`REFERENCES ${targetName} (${targetMember})`;

/**
 *
 * @param t The table info
 * @returns A script for creating one table from a table definition
 */
const tableCreateMapper = (t: TableInfo) =>
	[
		`CREATE TABLE ${t.name} (`,
		t.columns.map((c) => columnMap(c)).join(", "),
	].join("");

/**
 *
 * @param t The table information
 * @returns A script for dropping one table from the database
 */
const tableDropMapper = (t: TableInfo) => `DROP TABLE ${t.name};`;

/**
 * The postgres connector which implements the automigrate API
 */
export class PostgresPlugin implements AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput> = (
		tables
	) => {
		return Promise.resolve({
			up: tables.map(tableCreateMapper),
			down: tables.sort(tableRelationshipSort).map(tableDropMapper),
		});
	};
}
