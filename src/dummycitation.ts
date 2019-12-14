import {ICitation} from 'howsmydriving-utils';
import {Citation} from 'howsmydriving-utils';
import {IDummyCitation} from './interfaces/idummycitation';

import {log} from './logging';

export class DummyCitation extends Citation implements IDummyCitation {
  [index: string]: any;
  constructor(citation: Citation) 
  {
    super(citation.citation_id, citation.license);
    
    // If passed an existing instance, copy over the properties.
    if(arguments.length > 0) {
      for (var p in citation) {
        if (citation.hasOwnProperty(p)) {
          this[p] = citation[p];
        }
      }
    }
  }
  
  Citation: number;
  Type: string;
  Status: string;
  ViolationDate: string;
  ViolationLocation: string
}

