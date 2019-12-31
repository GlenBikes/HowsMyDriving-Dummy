import { DumpObject } from 'howsmydriving-utils';

import { __MODULE_NAME__, __MODULE_VERSION__ } from './src/logging';
import { log } from './src/logging';

export { Region } from './src/dummyregion';

log.info(
  `howsmydriving-dummy: Module ${__MODULE_NAME__} version '${__MODULE_VERSION__}' loaded.`
);
