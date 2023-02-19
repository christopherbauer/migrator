export class Project {
	id!: string;
	name!: string;
	codeName: string | undefined;
	features: Feature[] | undefined;
	resources: Person[] | undefined;
	plannedFeatures: Feature[] | undefined;
	deleted: boolean;
}

export class Feature {
	id!: string;
	name!: string;
	time!: number;
	completedDate!: Date;
}

export class Person {
	id!: string;
	name!: string;
	experience!: string;
}
