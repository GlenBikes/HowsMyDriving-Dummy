// Imports
import {IRegion} from 'howsmydriving-utils';
import {ICitation} from 'howsmydriving-utils';
import {Citation} from 'howsmydriving-utils';
import {DumpObject} from 'howsmydriving-utils';
import {StatesAndProvinces} from 'howsmydriving-utils';
import {formatPlate} from 'howsmydriving-utils';
import {CompareNumericStrings} from 'howsmydriving-utils';
import {CitationIds} from 'howsmydriving-utils';

import {log} from './logging';

var path = require("path");

// TODO: Consolidate these.
const parkingAndCameraViolationsText = "Total parking and camera violations for #",
  violationsByYearText = "Violations by year for #",
  violationsByStatusText = "Violations by status for #",
  citationQueryText = "License #__LICENSE__ has been queried __COUNT__ times.";

// interfaces - TODO: Move to declaration files.
interface IDummyCitation extends ICitation {
  [index: string]: any;
  Citation: number;
  Type: string;
  Status: string;
  ViolationDate: string;
  ViolationLocation: string
}

class DummyCitation extends Citation implements IDummyCitation {
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

// Classes
export class DummyRegion implements IRegion {
  readonly Name: string = "DummyCity";
  
  GetCitationsByPlate(plate: string, state: string): Promise<Array<Citation>> {
    return new Promise<Array<Citation>>( (resolve, reject) => {
        resolve([]);
    });
  }

  ProcessCitationsForRequest(citations: ICitation[], query_count: number): Array<string> {
    // Return them in the order they should be rendered.
    return [
      "Here are the Dummy citations we found",
      "There are lots of them",
      "Summary by type:\nPARKING: 12\nCAMERA: 15",
      "Summary by year:\n2019: 27"
    ];
  }

}


