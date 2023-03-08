export interface ColumnDefinition {
	fieldName: string;
	type: DatabaseType;
	typeClass: TypeClass;
	nullable: boolean;
	modifiers?: KeyMetaData[];
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

export enum TypeClass {
	Base = "base",
	Relationship = "relationship",
}
export enum Modifiers {
	PrimaryKey,
	ForeignKey,
}
export type KeyMetaData =
	| {
			modifier: Modifiers.PrimaryKey;
			property: string;
	  }
	| {
			modifier: Modifiers.ForeignKey;
			target: string;
			property: string;
	  };
