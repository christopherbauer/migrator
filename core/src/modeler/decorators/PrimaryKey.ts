import "reflect-metadata";

const PRIMARY_KEY_KEY = "primary_key";
const PRIMARY_KEY_TYPE_KEY = "primary_key_type";
type KeyType = "string" | "number" | "uuid";
export function PrimaryKey(type?: KeyType) {
	return function (target: any, propertyName: string) {
		Reflect.defineMetadata(
			PRIMARY_KEY_KEY,
			propertyName,
			target,
			propertyName
		);
		Reflect.defineMetadata(
			PRIMARY_KEY_TYPE_KEY,
			type,
			target,
			propertyName
		);
	};
}
type PrimaryKeyData = { key: string; type: KeyType };
export function getPrimaryKeyData(
	target: any,
	propertyKey: string
): PrimaryKeyData {
	return {
		key: Reflect.getMetadata(PRIMARY_KEY_KEY, target, propertyKey),
		type: Reflect.getMetadata(PRIMARY_KEY_TYPE_KEY, target, propertyKey),
	};
}
