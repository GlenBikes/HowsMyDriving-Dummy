import {Citation} from 'howsmydriving-utils';
import {ICitation} from 'howsmydriving-utils';
import {IRegion} from 'howsmydriving-utils';

import {log} from './logging';

export class DummyRegion implements IRegion {
  readonly Name: string = "DummyCity";
  
  GetCitationsByPlate(plate: string, state: string): Promise<Array<Citation>> {
    return new Promise<Array<Citation>>( (resolve, reject) => {
      // We take the 1st set of numeric digits in the plate tnd return that # of citations
      let num_citations_regex = /[0-9]+/;
      
      let num_citations_string: Array<string> = num_citations_regex.exec(plate);
      
      let num_citations = 0;
      
      if (num_citations_string && parseInt(num_citations_string[0]) != NaN) {
        num_citations = parseInt(num_citations_string[0]);
      }
      
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

