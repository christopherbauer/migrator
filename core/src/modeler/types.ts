export interface MemberDefinition {
	fieldName: string;
	type: string;
	nullable: boolean;
}
export interface ClassInfo {
	name: string;
	members: MemberDefinition[];
}
export enum MigratorKind {
	string = "string",
	number = "number",
	boolean = "boolean",
	undefined = "undefined",
}
