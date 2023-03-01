import { mkdir, writeFile, Mode } from "fs";
import { sync } from "glob";
import SourceExtractor from "../core/src/source-extractor";
import Modeler from "../core/src/modeler";
import { Project, Person, Feature } from "./CodeFirst";
const files = sync("./**/CodeFirst.ts");
const extracted = Modeler.extract(SourceExtractor.getFilesFrom(files), [
	Project,
	Person,
	Feature,
]);
mkdir("state", { recursive: true }, () => {
	writeFile(
		"./state/output.json",
		JSON.stringify(extracted, null, 4),
		{},
		() => {}
	);
});
