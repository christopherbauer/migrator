import { describe, it, expect } from "@jest/globals";
import { TableInfo } from "../modeler";
import { tableRelationshipSort } from "./postgres-connector";
describe("tableRelationshipSort", () => {
	it(`reorders tables based on the relationships`, () => {
		//arrange
		const tableA: TableInfo = {
			columns: [],
			name: "TableA",
			relationships: [],
		};
		const tableB: TableInfo = {
			columns: [],
			name: "TableB",
			relationships: ["TableA"],
		};
		const tables: TableInfo[] = [tableA, tableB];

		//act
		const sorted = tables.sort(tableRelationshipSort);

		//assert
		expect(sorted).toStrictEqual([tableB, tableA]);
	});
	it(`reorders tables based on complex relationships`, () => {
		//arrange
		const tableA: TableInfo = {
			columns: [],
			name: "TableA",
			relationships: [],
		};
		const tableB: TableInfo = {
			columns: [],
			name: "TableB",
			relationships: ["TableA"],
		};
		const tableC: TableInfo = {
			columns: [],
			name: "TableC",
			relationships: ["TableA"],
		};

		const tableD: TableInfo = {
			columns: [],
			name: "TableD",
			relationships: ["TableB"],
		};
		const tables: TableInfo[] = [tableD, tableA, tableC, tableB];

		//act
		const sorted = tables.sort(tableRelationshipSort);

		//assert
		expect(sorted[0]).toBe(tableD);
		expect(sorted[3]).toBe(tableA);
		//b + c can be either index 1 or 2
		expect(sorted).toStrictEqual([tableD, tableC, tableB, tableA]);
	});
});
