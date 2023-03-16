import { ForeignKey, PrimaryKey } from "../core/src/modeler/decorators";
export class Project {
	@PrimaryKey()
	id!: string;
	name!: string;
	codeName?: string;
	deleted?: boolean;
}

export class Feature {
	@PrimaryKey()
	id!: string;
	@ForeignKey<Project>("Project", "id")
	project_id!: string;
	name!: string;
	time!: number;
	completedDate!: Date;
}

export class Person {
	@PrimaryKey()
	id!: string;
	name!: string;
	experience!: string;
}

export class Project_Persons {
	@PrimaryKey()
	id!: string;
	@ForeignKey<Project>("Project", "id")
	project_id!: string;
	@ForeignKey<Person>("Person", "id")
	person_id!: string;
}
