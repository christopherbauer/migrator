import { mkdir, writeFile, Mode } from "fs";
import { sync } from "glob";
import SourceExtractor from "./src/source-extractor";
import Modeler from "./src/modeler";
const files = sync("../test/**/*.ts");
const extracted = Modeler.extract(SourceExtractor.getFilesFrom(files));
mkdir("state", { recursive: true }, () => {
	writeFile(
		"./state/output.json",
		JSON.stringify(extracted, null, 4),
		{},
		() => {}
	);
});
