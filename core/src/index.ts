import Modeler, { PostgresPlugin } from "./modeler";
import { AutomigrateAPI, AutomigrateOutput } from "./automigrate-api";
import SourceExtractor from "./source-extractor";
import { ForeignKey, PrimaryKey } from "./modeler/decorators";

export { Modeler, SourceExtractor, PostgresPlugin };
export { AutomigrateAPI, AutomigrateOutput };
export { PrimaryKey, ForeignKey };
