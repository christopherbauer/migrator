import { describe, it, expect } from "@jest/globals";
import { PrimaryKey, getPrimaryKeyData } from "./PrimaryKey";
describe("PrimaryKey", () => {
	it(`returns expected`, () => {
		//arrange
		class Test {
			@PrimaryKey("string")
			id!: string;
		}

		//act
		const actual = new Test();

		//assert
		expect(getPrimaryKeyData(actual, "id")).toStrictEqual({
			key: "id",
			type: "string",
		});
	});
});
