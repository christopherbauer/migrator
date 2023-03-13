import { TableInfo } from "./types";

export type AutomigrateOutput = { up: string[]; down: string[] };
export interface AutomigrateAPI {
	createTables: (tables: TableInfo[]) => Promise<AutomigrateOutput>;
}
