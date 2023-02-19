import * as fs from "fs";
import ts from "typescript";
type GlobTarget = string[];

const getSourceFile = (file: string) =>
	ts.createSourceFile(
		file,
		fs.readFileSync(file, "utf-8"),
		ts.ScriptTarget.ES2015,
		true
	);
export const getFilesFrom = (files: GlobTarget) => files.map(getSourceFile);
