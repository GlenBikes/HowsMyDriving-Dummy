const packpath = require('packpath');
import { DumpObject } from 'howsmydriving-utils';

import { log } from './src/logging';
import * as path from 'path';

export { Region } from './src/dummyregion';

let packpath_parent = packpath.parent() ? packpath.parent() : packpath.self();
let packpath_self = packpath.self();

const pjson_path = path.resolve(packpath_self + '/package.json');

let pjson = require(pjson_path);

log.info(`Module ${pjson.name} version '${pjson.version}' loaded.`);
