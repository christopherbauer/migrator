import { mkdir, writeFile } from "fs";
import { sync } from "glob";
import SourceExtractor from "./src/extractor";
import Modeler from "./src/modeler";
const files = sync("../test/**/*.ts");
const extracted = Modeler.extract(SourceExtractor.getFilesFrom(files));
mkdir("state", () => {
	writeFile(
		"./state/output.json",
		JSON.stringify(extracted, null, 4),
		{},
		() => {}
	);
});
