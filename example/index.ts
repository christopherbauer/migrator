import { mkdir, writeFile } from "fs";
import { sync } from "glob";
import { SourceExtractor } from "migrator";
import { Modeler } from "migrator";
import { Project, Person, Feature, Project_Persons } from "./CodeFirst";
import { PostgresPlugin } from "migrator";
const files = sync("./**/CodeFirst.ts");
const extracted = Modeler.extract(SourceExtractor.getFilesFrom(files), [
	Project,
	Person,
	Feature,
	Project_Persons,
]);
mkdir("state", { recursive: true }, () => {
	writeFile(
		"./state/output.json",
		JSON.stringify(extracted, null, 4),
		{},
		() => {}
	);
});
mkdir("scripts", { recursive: true }, async () => {
	const connector = new PostgresPlugin();
	writeFile(
		"./scripts/scripts.json",
		JSON.stringify(await connector.createTables(extracted), null, 4),
		{},
		() => {}
	);
});
