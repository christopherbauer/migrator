import * as fs from "fs";
import ts from "typescript";
class SourceExtractor {
	static getSourceFile = (file: string) =>
		ts.createSourceFile(
			file,
			fs.readFileSync(file, "utf-8"),
			ts.ScriptTarget.ES2015,
			true
		);
	static getFilesFrom = (files: string[]) => files.map(this.getSourceFile);
}
export default SourceExtractor;
