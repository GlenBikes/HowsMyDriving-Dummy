let app_root_dir = require('app-root-dir').get();

import { __REGION_NAME__ } from './common';

/**
 *  Standard logging for HowsMyDriving modules.
 *
 *  It is not required to use this. But if you do, your plugin module's
 *  logs will be integrated with the infrastructure logs and all the
 *  other plugin logs.
 **/
var log4js = require('log4js'),
  chokidar = require('chokidar'),
  path = require('path');

const config_path = path.resolve(app_root_dir + '/dist/config/log4js.json');

// Load the config.
log4js.configure(config_path);

// Create default logger to log that our module was loaded and for
// config update changes.
export var log = log4js.getLogger('result', `${__REGION_NAME__}: `);

log.addContext('module', __REGION_NAME__);
log.info(`app_root_dir: ${app_root_dir}.`);

/**
 * Monitor the log4js config file and reloading log instances if the file changes.
 **/
var watcher = chokidar.watch(config_path, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  awaitWriteFinish: true
});

/**
 * Reload log4js (when config changes).
 *
 * Params:
 *   reason: Reason why logs are being reloaded. This is logged before
 *           reloading log4js.
 *
 * TODO: Test to make sure this works. Do existing loggers still work? Do
 *       they update to the new log level?
 **/
function reloadlog(reason: string) {
  log.info(`Reloading log config due to config file ${reason}.`);
  log4js.shutdown(() => {
    log4js.configure(config_path);
    log = log4js.getLogger('reason');
  });
}

// Handle the change/add events for the log4js config file.
watcher
  .on('add', (path: string) => {
    reloadlog(`add of ${path}`);
  })
  .on('change', (path: string) => {
    reloadlog(`change of ${path}`);
  });
