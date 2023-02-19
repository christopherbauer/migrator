import {
	isClassDeclaration,
	isPropertyDeclaration,
	SourceFile,
} from "typescript";
import { processNode } from "./helpers";
import { ClassInfo, MemberDefinition } from "./types";
class Modeler {
	static extract: (files: SourceFile[]) => ClassInfo[] = (files) => {
		const classDeclarations = files.flatMap((file) => {
			const classDeclarations =
				file.statements.filter(isClassDeclaration);
			return classDeclarations.map<ClassInfo>((classDeclaration) => {
				const name = String(classDeclaration.name?.escapedText);
				const members = classDeclaration.members
					.filter(isPropertyDeclaration)
					.map<MemberDefinition | false>((prop) => {
						const { type } = prop;
						if (type) {
							return processNode(prop, type);
						}
						return false;
					})
					.filter(Boolean) as MemberDefinition[];
				return { name, members };
			});
		});
		return classDeclarations.filter((classInfo) => classInfo.name);
	};
}

export default Modeler;
