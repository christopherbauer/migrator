import {
	isClassDeclaration,
	isPropertyDeclaration,
	SourceFile,
} from "typescript";
import { processNode, retrievePropName } from "./helpers";
import { TableInfo, ColumnDefinition, TypeClass } from "./types";
class Modeler {
	static extract: (
		files: SourceFile[],
		registeredTypes: any[]
	) => TableInfo[] = (files, registered) => {
		const classDeclarations = files.flatMap((file) => {
			const classDeclarations =
				file.statements.filter(isClassDeclaration);
			return classDeclarations.map<TableInfo>((classDeclaration) => {
				const name = String(classDeclaration.name?.escapedText);
				const members = classDeclaration.members
					.filter(isPropertyDeclaration)
					.map<ColumnDefinition | false>((prop) => {
						const { type } = prop;
						if (type) {
							const target = registered.find(
								(r) =>
									r.name ===
									classDeclaration.name?.escapedText
							);
							console.log(target);
							return processNode(new target(), prop, type);
						}
						return false;
					})
					.filter(Boolean) as ColumnDefinition[];
				const columns = members.filter(
					(m) => m.typeClass === TypeClass.Base
				);
				const relationships = members.filter(
					(r) => r.typeClass === TypeClass.Relationship
				);
				return { name, columns, relationships };
			});
		});
		return classDeclarations.filter((classInfo) => classInfo.name);
	};
}

export default Modeler;
export { TableInfo, ColumnDefinition, TypeClass };
