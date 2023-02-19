import * as fs from "fs";
import ts from "typescript";
type GlobTarget = string[];
class SourceExtractor {
	static getSourceFile = (file: string) =>
		ts.createSourceFile(
			file,
			fs.readFileSync(file, "utf-8"),
			ts.ScriptTarget.ES2015,
			true
		);
	static getFilesFrom = (files: GlobTarget) => files.map(this.getSourceFile);
}
export default SourceExtractor;
