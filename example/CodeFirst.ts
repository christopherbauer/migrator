import { ForeignKey, PrimaryKey } from "../core/src/modeler/decorators";
export class Project {
	@PrimaryKey("string")
	id!: string;
	name!: string;
	codeName?: string;
	features?: Feature[];
	resources?: Person[];
	plannedFeatures?: Feature[];
	deleted?: boolean;
}

export class Feature {
	@PrimaryKey("string")
	id!: string;
	@ForeignKey<Project>("Project", "id")
	project_id!: string;
	name!: string;
	time!: number;
	completedDate!: Date;
}

export class Person {
	@PrimaryKey("string")
	id!: string;
	name!: string;
	experience!: string;
}
