export enum DatabaseType {
	string = "string",
	number = "number",
	boolean = "boolean",
	date = "date",
	undefined = "undefined",
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
export interface ColumnDefinition {
	fieldName: string;
	type: DatabaseType;
	nullable: boolean;
	modifiers?: KeyMetaData[];
}
export interface TableInfo {
	name: string;
	columns: ColumnDefinition[];
	relationships: string[];
}
