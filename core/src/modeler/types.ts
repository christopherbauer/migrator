export enum TypeClass {
	Base = "base",
	Relationship = "relationship",
}
export enum Modifiers {
	PrimaryKey,
	ForeignKey,
}
export interface ColumnDefinition {
	fieldName: string;
	type: string;
	typeClass: TypeClass;
	nullable: boolean;
	flags?: Modifiers[];
}
export interface TableInfo {
	name: string;
	columns: ColumnDefinition[];
	relationships: ColumnDefinition[];
}
export enum DatabaseType {
	string = "string",
	number = "number",
	boolean = "boolean",
	undefined = "undefined",
}
