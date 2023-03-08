import { ForeignKey, PrimaryKey } from "../core/src/modeler/decorators";
export class Project {
	@PrimaryKey("string")
	id!: string;
	name!: string;
	codeName?: string;
	// features?: Feature[];
	// resources?: Person[];
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

export class Project_Persons {
	@PrimaryKey("string")
	id!: string;
	@ForeignKey<Project>("Project", "id")
	project_id!: string;
	@ForeignKey<Person>("Person", "id")
	person_id!: string;
}
