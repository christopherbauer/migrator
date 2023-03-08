import { mkdir, writeFile, Mode } from "fs";
import { sync } from "glob";
import SourceExtractor from "../core/src/source-extractor";
import Modeler from "../core/src/modeler";
import { Project, Person, Feature, Project_Persons } from "./CodeFirst";
import { PostgresConnector } from "../core/src/automigrate-connectors/postgres-connector";
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
	const connector = new PostgresConnector();
	writeFile(
		"./scripts/scripts.json",
		JSON.stringify(await connector.createTables(extracted), null, 4),
		{},
		() => {}
	);
});
