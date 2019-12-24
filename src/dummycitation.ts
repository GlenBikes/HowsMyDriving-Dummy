import { ICitation } from 'howsmydriving-utils';
import { Citation } from 'howsmydriving-utils';
import { IDummyCitation } from './interfaces/idummycitation';

import { log } from './logging';

export class DummyCitation extends Citation implements IDummyCitation {
  [index: string]: any;
  constructor();
  constructor(citation: IDummyCitation);
  constructor(citation?: IDummyCitation) {
    super(citation);

    Object.assign(this, citation);
  }

  Citation: number;
  Type: string;
  Status: string;
  ViolationDate: string;
  ViolationLocation: string;
}
