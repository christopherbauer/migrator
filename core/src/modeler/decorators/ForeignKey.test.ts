import { describe, it, expect } from "@jest/globals";
import { ForeignKey, getForeignKeyData } from "./ForeignKey";
describe("ForeignKey", () => {
	it(`returns { key: "test" }`, () => {
		//arrange
		class ChildTest {
			id!: string;
		}
		class Test {
			@ForeignKey<ChildTest>("ChildTest", "id")
			id!: string;
		}

		//act
		const actual = new Test();

		//assert
		expect(getForeignKeyData(actual, "id")).toStrictEqual({
			key: "id",
			target: "ChildTest",
		});
	});
});
