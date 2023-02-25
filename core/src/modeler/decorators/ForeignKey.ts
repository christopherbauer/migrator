import "reflect-metadata";
const FOREIGN_KEY_KEY = "foreign_key";
const FOREIGN_KEY_TARGET_NAME = "foreign_key_target_name";
export function ForeignKey<T>(name: string, key: keyof T) {
	return function (target: any, propertyName: string) {
		Reflect.defineMetadata(FOREIGN_KEY_KEY, key, target, propertyName);
		Reflect.defineMetadata(
			FOREIGN_KEY_TARGET_NAME,
			name,
			target,
			propertyName
		);
	};
}
type ForeignKeyData = { key: string; target: string };
export function getForeignKeyData(
	target: any,
	propertyKey: string
): ForeignKeyData {
	return {
		key: Reflect.getMetadata(FOREIGN_KEY_KEY, target, propertyKey),
		target: Reflect.getMetadata(
			FOREIGN_KEY_TARGET_NAME,
			target,
			propertyKey
		),
	};
}
