import Modeler, { PostgresPlugin } from "./modeler";
import { AutomigrateAPI, AutomigrateOutput } from "./automigrate-api";
import SourceExtractor from "./source-extractor";

export default {
	Modeler,
	SourceExtractor,
};
export { AutomigrateAPI, AutomigrateOutput };
exports.Plugins = { PostgresPlugin };
