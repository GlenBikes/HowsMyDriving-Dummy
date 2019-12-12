import {IRegion} from 'howsmydriving-utils';
import {DummyRegion} from './src/dummy';
import {log} from './src/logging';

var path = require('path'),
    pjson = require(path.resolve(__dirname + '/../package.json'));

export var Region: IRegion = new DummyRegion();

log.info(`Module ${pjson.name} version '${pjson.version}' loaded.`);
