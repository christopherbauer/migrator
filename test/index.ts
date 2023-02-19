export class Project {
	id!: string;
	name!: string;
	codeName?: string;
	features?: Feature[];
	resources?: Person[];
	plannedFeatures?: Feature[];
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
