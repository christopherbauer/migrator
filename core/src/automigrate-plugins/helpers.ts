import { TableInfo } from "../automigrate-api/types";

const NOT_FOUND = -1;
export const tableRelationshipSort: (a: TableInfo, b: TableInfo) => number = (
	a,
	b
) => {
	return a.relationships.indexOf(b.name) === NOT_FOUND ? 1 : -1; //move b ahead of a if a is a relationship
};
