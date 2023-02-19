import { describe, it, expect } from "@jest/globals";
import * as ts from "typescript";
import Modeler from ".";

describe("Modeler", () => {
	it(`returns chrisclass if it's the only class`, () => {
		//arrange
		const expected = "Chrisclass";

		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`export class Chrisclass {}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe(expected);
	});
	it(`returns 2 classes if there are 2 classes`, () => {
		//arrange
		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`export class Chrisclass {
				}`,
				ts.ScriptTarget.ESNext
			),
			ts.createSourceFile(
				"MockFile2.ts",
				`export class Chrissecondclass {
				}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe("Chrisclass");
		expect(actual[1].name).toBe("Chrissecondclass");
	});
	it(`returns 2 classes with members if there are 2 classes`, () => {
		//arrange
		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`import { Chrissecondclass } from './MockFile2';
				export class Chrisclass {
					related: Chrissecondclass[];
				}`,
				ts.ScriptTarget.ESNext
			),
			ts.createSourceFile(
				"MockFile2.ts",
				`export class Chrissecondclass {
				}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe("Chrisclass");
		expect(actual[0].members[0]?.fieldName).toBe("related");
		expect(actual[0].members[0]?.type).toBe("Chrissecondclass");
		expect(actual[1].name).toBe("Chrissecondclass");
	});
	it(`returns all attributes if there is many different types used`, () => {
		//arrange
		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`import { Chrissecondclass } from './MockFile2';
				export class Chrisclass {
					id: number;
					name: string;
					related: Chrissecondclass[];
					deleted: boolean;
					deleted_at: Date;
				}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe("Chrisclass");
		expect(actual[0].members[0]?.fieldName).toBe("id");
		expect(actual[0].members[0]?.type).toBe("number");
		expect(actual[0].members[1]?.fieldName).toBe("name");
		expect(actual[0].members[1]?.type).toBe("string");
		expect(actual[0].members[2]?.fieldName).toBe("related");
		expect(actual[0].members[2]?.type).toBe("Chrissecondclass");
		expect(actual[0].members[3]?.fieldName).toBe("deleted");
		expect(actual[0].members[3]?.type).toBe("boolean");
		expect(actual[0].members[4]?.fieldName).toBe("deleted_at");
		expect(actual[0].members[4]?.type).toBe("Date");
	});

	it(`handles special types such as union and required types`, () => {
		//arrange
		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`export class Chrisclass {
					id!: number;
					name: string | undefined;
					deleted_at: Date | undefined;
				}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe("Chrisclass");
		expect(actual[0].members[0]?.fieldName).toBe("id");
		expect(actual[0].members[0]?.type).toBe("number");
		expect(actual[0].members[0]?.nullable).toBe(false);
		expect(actual[0].members[1]?.fieldName).toBe("name");
		expect(actual[0].members[1]?.type).toBe("string");
		expect(actual[0].members[1]?.nullable).toBe(true);
		expect(actual[0].members[2]?.fieldName).toBe("deleted_at");
		expect(actual[0].members[2]?.type).toBe("Date");
		expect(actual[0].members[2]?.nullable).toBe(true);
	});
	it(`handles special types such as nullable`, () => {
		//arrange
		//act
		const actual = Modeler.extract([
			ts.createSourceFile(
				"MockFile.ts",
				`export class Chrisclass {
					name?: string;
				}`,
				ts.ScriptTarget.ESNext
			),
		]);

		//assert
		expect(actual[0].name).toBe("Chrisclass");
		expect(actual[0].members[0]?.fieldName).toBe("name");
		expect(actual[0].members[0]?.type).toBe("string");
		expect(actual[0].members[0]?.nullable).toBe(true);
	});
});
