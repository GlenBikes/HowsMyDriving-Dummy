import { log } from './src/logging';
import * as path from 'path';

export { Region } from './src/dummyregion';

let pjson = require(path.resolve(__dirname + '/../package.json'));

log.info(`Module ${pjson.name} version '${pjson.version}' loaded.`);
