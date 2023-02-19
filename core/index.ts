import { writeFile } from "fs";
import { sync } from "glob";
import { getFilesFrom } from "./src/extractor";
import Modeler from "./src/modeler";
const files = sync("../test/**/*.ts");
const extracted = Modeler.extract(getFilesFrom(files));
writeFile("./output.txt", JSON.stringify(extracted, null, 4), {}, () => {});
