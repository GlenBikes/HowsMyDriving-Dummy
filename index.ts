const packpath = require('packpath');
const appRootDir = require('app-root-dir').get();
const appRootPath = require('app-root-path');

import * as path from 'path';

let packpath_parent = packpath.parent() ? packpath.parent() : packpath.self();
let packpath_self = packpath.self();

console.log(
  `howsmydriving-dummy:\n - packpath_self: ${packpath_self}\n - packpath_parent: ${packpath.parent()}\n - app-root-dir: ${appRootDir}\n - app-root-path: ${appRootPath}\n - app-root (current): see below\n - app-root (root): see below\n - __dirname: ${__dirname}\n - .: ${path.resolve(
    '.'
  )}`
);

export const log4js_config_path = path.resolve(
  appRootDir + '/dist/config/log4js.json'
);

console.log(
  `howsmydriving-dummy: log4js_config_path:\n - ${log4js_config_path}`
);

import { DumpObject } from 'howsmydriving-utils';

import { log } from './src/logging';

export { Region } from './src/dummyregion';

const package_config_path = path.resolve(packpath_self + '/package.json');

let pjson = require(package_config_path);

const __MODULE_NAME__ = pjson.name;
const __MODULE_VERSION__ = pjson.version;

log.info(
  `howsmydriving-dummy: package_config_path: ${package_config_path}, __MODULE_NAME__: ${__MODULE_NAME__}.`
);

log.info(
  `howsmydriving-dummy: Module ${__MODULE_NAME__} version '${__MODULE_VERSION__}' loaded.`
);
