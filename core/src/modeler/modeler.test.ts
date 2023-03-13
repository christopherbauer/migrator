import { describe, it, expect } from "@jest/globals";
import * as ts from "typescript";
import Modeler from ".";
import { Modifiers } from "../automigrate-api/types";

describe("Modeler", () => {
	describe("Base cases", () => {
		it(`returns chrisclass if it's the only class`, () => {
			//arrange
			const expected = "Chrisclass";
			class Chrisclass {}
			//act
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`export class Chrisclass {}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrisclass]
			);

			//assert
			expect(actual[0].name).toBe(expected);
		});
		it(`returns 2 classes if there are 2 classes`, () => {
			//arrange
			//act
			const actual = Modeler.extract(
				[
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
				],
				[]
			);

			//assert
			expect(actual[0].name).toBe("Chrisclass");
			expect(actual[1].name).toBe("Chrissecondclass");
		});
	});
	describe("Property Type cases", () => {
		it(`returns 2 classes with members if there are 2 classes`, () => {
			//arrange
			//act
			class Chrissecondclass {}
			class Chrisclass {
				related!: Chrissecondclass[];
			}
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`import { Chrissecondclass } from './MockFile2';
				export class Chrisclass {
					related!: Chrissecondclass[];
				}`,
						ts.ScriptTarget.ESNext
					),
					ts.createSourceFile(
						"MockFile2.ts",
						`export class Chrissecondclass {
				}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrissecondclass, Chrisclass]
			);

			//assert
			expect(actual[0].name).toBe("Chrisclass");
			expect(actual[0].relationships[0]).toBe("Chrissecondclass");

			expect(actual[1].name).toBe("Chrissecondclass");
		});
		it(`returns all attributes if there is many different types used`, () => {
			//arrange
			//act
			class Chrissecondclass {}
			class Chrisclass {}
			const actual = Modeler.extract(
				[
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
				],
				[Chrissecondclass, Chrisclass]
			);

			//assert
			expect(actual[0].name).toBe("Chrisclass");
			expect(actual[0].columns[0]?.fieldName).toBe("id");
			expect(actual[0].columns[0]?.type).toBe("number");

			expect(actual[0].columns[1]?.fieldName).toBe("name");
			expect(actual[0].columns[1]?.type).toBe("string");

			expect(actual[0].relationships[0]).toBe("Chrissecondclass");

			expect(actual[0].columns[2]?.fieldName).toBe("deleted");
			expect(actual[0].columns[2]?.type).toBe("boolean");

			expect(actual[0].columns[3]?.fieldName).toBe("deleted_at");
			expect(actual[0].columns[3]?.type).toBe("date");
		});
	});
	describe("Special Type cases", () => {
		it(`handles special types such as union and required types`, () => {
			//arrange
			//act
			class Chrisclass {}
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`						export class Chrisclass {
					id!: number;
					name: string | undefined;
					deleted_at: Date | undefined;
				}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrisclass]
			);

			//assert
			expect(actual[0].name).toBe("Chrisclass");
			expect(actual[0].columns[0]?.fieldName).toBe("id");
			expect(actual[0].columns[0]?.type).toBe("number");
			expect(actual[0].columns[0]?.nullable).toBe(false);

			expect(actual[0].columns[1]?.fieldName).toBe("name");
			expect(actual[0].columns[1]?.type).toBe("string");
			expect(actual[0].columns[1]?.nullable).toBe(true);

			expect(actual[0].columns[2]?.fieldName).toBe("deleted_at");
			expect(actual[0].columns[2]?.type).toBe("Date");
			expect(actual[0].columns[2]?.nullable).toBe(true);
		});
		it(`handles special types such as nullable`, () => {
			//arrange
			//act
			class Chrisclass {}
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`export class Chrisclass {
					name?: string;
				}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrisclass]
			);

			//assert
			expect(actual[0].name).toBe("Chrisclass");
			expect(actual[0].columns[0]?.fieldName).toBe("name");
			expect(actual[0].columns[0]?.type).toBe("string");
			expect(actual[0].columns[0]?.nullable).toBe(true);
		});
	});
	describe("Handles experimental decorators", () => {
		it(`handles primary key decorator`, () => {
			//arrange
			//act
			class Chrisclass {}
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`import { PrimaryKey } from './decorators';
				export class Chrisclass {
					@PrimaryKey("string")
					id!: string;
				}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrisclass]
			);

			//assert
			expect(actual[0].columns[0].modifiers?.[0].modifier).toBe(
				Modifiers.PrimaryKey
			);
		});
		it(`handles foreing key decorator`, () => {
			//arrange
			//act
			class Chrisclass {}
			class Chrisclass2 {}
			const actual = Modeler.extract(
				[
					ts.createSourceFile(
						"MockFile.ts",
						`import { ForeignKey } from './decorators';
				export class Chrisclass {
					@ForeignKey<Chrisclass2>("Chrisclass2", "id")
					id!: string;
				}
				export class Chrisclass2 {
					id!: string;
				}`,
						ts.ScriptTarget.ESNext
					),
				],
				[Chrisclass, Chrisclass2]
			);

			//assert
			expect(actual[0].columns[0].modifiers?.[0].modifier).toBe(
				Modifiers.ForeignKey
			);
		});
	});
});
