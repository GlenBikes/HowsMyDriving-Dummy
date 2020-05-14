const moment = require('moment');

import { CompareNumericStrings } from 'howsmydriving-utils';
import {
  ICitation,
  Citation,
  ICollision,
  Collision,
  IRegion,
  Region,
  RegionFactory,
  IStateStore
} from 'howsmydriving-utils';
import { CitationIds } from 'howsmydriving-utils';
import { formatPlate } from 'howsmydriving-utils';
import { createTweet } from 'howsmydriving-utils';
import { DumpObject } from 'howsmydriving-utils';

import { IDummyCitation, DummyCitation } from './dummycitation';

import { IDummyCollision, DummyCollision } from './dummycollision';

import { __REGION_NAME__ } from './logging';

import { log } from './logging';

// TODO: Consolidate these.
const parkingAndCameraViolationsText =
    'Total __REGION__ parking and camera violations for #__LICENSE__: __COUNT__',
  violationsByYearText = 'Violations by year for #',
  violationsByStatusText = 'Violations by status for #',
  citationQueryText = 'License #__LICENSE__ has been queried __COUNT__ times.';

export class DummyRegionFactory extends RegionFactory {
  public name: string = __REGION_NAME__;

  public createRegion(state_store: IStateStore): Promise<Region> {
    let region: DummyRegion = new DummyRegion(state_store);

    return Promise.resolve(region);
  }
}

export class DummyRegion extends Region {
  constructor(state_store: IStateStore) {
    super(__REGION_NAME__, state_store);

    log.debug(
      `Creating instance of ${this.name} for region ${__REGION_NAME__}`
    );
  }

  GetCitationsByPlate(plate: string, state: string): Promise<Array<Citation>> {
    log.debug(
      `Getting citations for ${state}:${plate} in region ${__REGION_NAME__}.`
    );
    return new Promise<Array<Citation>>((resolve, reject) => {
      // We take all numeric digits in the license and total the numbers.
      // If license contains x > 2 alpha , return 0. Otherwise return the total.
      let num_digits_regex = /[0-9]/g;
      let num_alpha_regex = /[a-zA-Z]/g;

      let digits_found: Array<string> = plate.match(num_digits_regex); //<<<<<<<<< bug when no digits

      let total: number = 0;

      if (digits_found) {
        for (let i = 0; i < digits_found.length; i++) {
          total += parseInt(digits_found[i]);
        }
      }

      const req_alpha_for_no_citations: number = 4;
      let letters_found = ((plate || '').match(num_alpha_regex) || []).length;
      let xyz_found: boolean = letters_found >= req_alpha_for_no_citations;
      let num_citations: number = xyz_found ? 0 : total;

      log.debug(
        `License ${plate} has a numeric sum of ${total} and ${
          xyz_found ? 'more than' : 'less than'
        } ${req_alpha_for_no_citations} alpha characters exist to override that. Creating ${num_citations} citations.`
      );

      let citations: Array<ICitation> = [];

      for (let i = 0; i < num_citations; i++) {
        let citation: IDummyCitation = new DummyCitation({
          citation_id: i + 1000,
          license: `${state}:${plate}`,
          region: __REGION_NAME__,

          Citation: i + 2000,
          Type: CitationType(),
          Status: CitationStatus(),
          ViolationDate: CitationValidationDate(),
          ViolationLocation: CitationValidationLocation()
        });

        log.debug(
          `Creating citation id: ${citation.citation_id} license: ${citation.license} Type: ${citation.Type} Status: ${citation.Status} ViolationDate: ${citation.ViolationDate} ViolationLocation: ${citation.ViolationLocation}.`
        );

        citations.push(citation);
      }

      resolve(citations);
    });
  }

  ProcessCitationsForRequest(
    citations: ICitation[],
    query_count: number
  ): Array<string> {
    var categorizedCitations: { [request_id: string]: number } = {};
    // TODO: Does it work to convert Date's to string for sorting? Might have to use epoch.
    var chronologicalCitations: {
      [violation_date: string]: Array<ICitation>;
    } = {};
    var violationsByYear: { [violation_year: string]: number } = {};
    var violationsByStatus: { [status: string]: number } = {};

    if (!citations || Object.keys(citations).length == 0) {
      // Should never happen. jurisdictions must return at least a dummy citation
      throw new Error(
        'Jurisdiction modules must return at least one citation, a dummy one if there are none.'
      );
    }

    var license: string;
    var region: string;

    for (var i = 0; i < citations.length; i++) {
      var citation = citations[i];
      var year: number = 1970;
      var violationDate = new Date(Date.now());

      // All citations are from the same license
      if (license == null) {
        license = citation.license;
      }

      if (region == null) {
        region = citation.region;
      }

      try {
        violationDate = new Date(Date.parse(citation.ViolationDate));
      } catch (e) {
        // TODO: refactor error handling to a separate file
        throw new Error(e);
      }

      // TODO: Is it possible to have more than 1 citation with exact same time?
      // Maybe throw an exception if we ever encounter it...
      if (!(violationDate.getTime().toString() in chronologicalCitations)) {
        chronologicalCitations[
          violationDate.getTime().toString()
        ] = new Array();
      }

      chronologicalCitations[violationDate.getTime().toString()].push(citation);

      if (!(citation.Type in categorizedCitations)) {
        categorizedCitations[citation.Type] = 0;
      }
      categorizedCitations[citation.Type]++;

      if (!(citation.Status in violationsByStatus)) {
        violationsByStatus[citation.Status] = 0;
      }
      violationsByStatus[citation.Status]++;

      year = violationDate.getFullYear();

      if (!(year.toString() in violationsByYear)) {
        violationsByYear[year.toString()] = 0;
      }

      violationsByYear[year.toString()]++;
    }

    var general_summary = parkingAndCameraViolationsText
      .replace('__LICENSE__', formatPlate(license))
      .replace('__REGION__', region)
      .replace('__COUNT__', Object.keys(citations).length.toString());

    Object.keys(categorizedCitations).forEach(key => {
      var line = key + ': ' + categorizedCitations[key];

      // Max twitter username is 15 characters, plus the @
      general_summary += '\n';
      general_summary += line;
    });

    general_summary += '\n\n';
    general_summary += citationQueryText
      .replace('__LICENSE__', formatPlate(license))
      .replace('__COUNT__', query_count.toString());

    var detailed_list = '';

    var sortedChronoCitationKeys = Object.keys(chronologicalCitations).sort(
      function(a: string, b: string) {
        //return new Date(a).getTime() - new Date(b).getTime();
        return CompareNumericStrings(a, b); //(a === b) ? 0 : ( a < b ? -1 : 1);
      }
    );

    var first = true;

    for (var i = 0; i < sortedChronoCitationKeys.length; i++) {
      var key: string = sortedChronoCitationKeys[i];

      chronologicalCitations[key].forEach(citation => {
        if (first != true) {
          detailed_list += '\n';
        }
        first = false;
        detailed_list += `${citation.ViolationDate}, ${citation.Type}, ${citation.ViolationLocation}, ${citation.Status}`;
      });
    }

    var temporal_summary: string =
      violationsByYearText + formatPlate(license) + ':';
    Object.keys(violationsByYear).forEach(key => {
      temporal_summary += '\n';
      temporal_summary += `${key}: ${violationsByYear[key].toString()}`;
    });

    var type_summary = violationsByStatusText + formatPlate(license) + ':';
    Object.keys(violationsByStatus).forEach(key => {
      type_summary += '\n';
      type_summary += `${key}: ${violationsByStatus[key]}`;
    });

    // Return them in the order they should be rendered.
    return [general_summary, detailed_list, type_summary, temporal_summary];
  }

  GetRecentCollisions(): Promise<Array<ICollision>> {
    return new Promise<Array<ICollision>>((resolve, reject) => {
      log.info(`Getting recent ${this.name} collisions...`);

      Promise.all([
        this.getLastCollisionsWithCondition('FATALITIES>0', 1),
        this.getLastCollisionsWithCondition('SERIOUSINJURIES>0', 1),
        this.getLastCollisionsWithCondition('INJURIES>0', 1)
      ]).then(collisions => {
        log.info(`Returning ${collisions.length} collisions.`);

        resolve(collisions);
      });
    });
  }

  ProcessCollisions(collisions: Array<ICollision>): Promise<Array<string>> {
    return this.processCollisionsForTweets(collisions);
  }

  processCollisionsForTweets(
    collisions: Array<ICollision>
  ): Promise<Array<string>> {
    return new Promise<Array<string>>((resolve, reject) => {
      let now: number = Date.now();
      let tweets: Array<string> = [];

      let collision_types = {
        fatal: {
          last_tweet_date: 0,
          latest_collision: undefined,
          tweet_frequency_days: 7
        },
        'serious injury': {
          last_tweet_date: 0,
          latest_collision: undefined,
          tweet_frequency_days: 7
        },
        injury: {
          last_tweet_date: 0,
          latest_collision: undefined,
          tweet_frequency_days: 7
        }
      };

      log.debug(`Getting collision records for ${this.name}...`);

      let state_promises: Array<Promise<string>> = [];

      Object.keys(collision_types).forEach(collision_type => {
        let key: string = `last_${collision_type}_tweet_date`;
        log.trace(
          `Getting last tweet date for collision type ${collision_type}...`
        );

        let state_promise = this.state_store
          .GetStateValue(key)
          .then(value => {
            log.trace(
              `Retrieved last tweet date for collision type ${collision_type}: ${value}.`
            );
            collision_types[collision_type].last_tweet_date = parseInt(value);
            return value;
          })
          .catch((err: Error) => {
            throw err;
          });

        state_promises.push(state_promise);
      });

      Promise.all(state_promises)
        .then(() => {
          let store_updates: {
            [key: string]: string;
          } = {};

          log.debug(`Processing ${collisions.length} collision records...`);

          var fatality_collision: ICollision;
          var serious_injury_collision: ICollision;
          var injury_collision: ICollision;

          collisions.forEach(collision => {
            log.debug(`Processing collision ${collision.id}...`);
            let collision_type: string = this.getCollisionType(collision);

            if (
              !collision_types[collision_type].latest_collision ||
              collision_types[collision_type].latest_collision.date_time <
                collision.date_time
            ) {
              log.debug(
                `Collision ${collision.id} is so far the most recent ${collision_type} collision.`
              );
              collision_types[collision_type].latest_collision = collision;
            } else {
              log.warn(
                `Collision ${collision.id} was passed in but is not the most recent ${collision_type} collision.`
              );
            }
          });

          // Fatalities are serious injuries which are injuries.
          if (!collision_types['serious injury'].latest_collision) {
            collision_types['serious injury'].latest_collision;
          }
          if (!collision_types['injury'].latest_collision) {
            collision_types['injury'].latest_collision;
          }

          // Tweet last fatal collision once per month and
          // whenever there is a new one.
          Object.keys(collision_types).forEach(async collision_type => {
            if (
              collision_types[collision_type].latest_collision &&
              (collision_types[collision_type].latest_collision.date_time >
                collision_types[collision_type].last_tweet_date ||
                moment(Date.now()).diff(
                  moment(collision_types[collision_type].last_tweet_date),
                  'days'
                ) >= collision_types[collision_type].tweet_frequency_days)
            ) {
              let tweet: string = this.getTweetFromCollision(
                collision_types[collision_type].latest_collision,
                collision_type,
                collision_types[collision_type].last_tweet_date
              );
              if (tweet && tweet.length) {
                let key: string = `last_${collision_type}_tweet_date`;

                store_updates[key] = now.toString();
                tweets.push(tweet);
              }
            }
          });

          if (Object.keys(store_updates).length > 0) {
            log.trace(`Writing state values:\n${DumpObject(store_updates)}`);

            this.state_store
              .PutStateValues(store_updates)
              .then(() => {
                log.trace(`Returning ${tweets.length} tweets.`);
                resolve(tweets);
              })
              .catch((err: Error) => {
                throw err;
              });
          } else {
            log.trace(`No store updates to make.`);

            log.trace(`Returning ${tweets.length} tweets.`);
            resolve(tweets);
          }
        })
        .catch((err: Error) => {
          throw err;
        });
    });
  }

  private getLastCollisionsWithCondition(
    condition: string,
    count: number = 1
  ): Promise<ICollision> {
    return new Promise<any>((resolve, reject) => {
      let collision = new DummyCollision({
        id: `ID-${this.name}-${condition}`,
        x: -122.32143015695232,
        y: 47.57391033893609,
        date_time: 1581379200000,
        date_time_str: '3 days ago',
        location: 'FAKE AIRPORT WAY S BETWEEN S HORTON S ST AND S HINDS ST',
        ped_count: 1,
        cycler_count: 1,
        person_count: 3,
        vehicle_count: 1,
        injury_count: condition.includes('FATALITIES')
          ? 0
          : condition.includes('SERIOUSINJURIES')
          ? 0
          : condition.includes('INJURIES')
          ? 1
          : 0,
        serious_injury_count: condition.includes('FATALITIES')
          ? 0
          : condition.includes('SERIOUSINJURIES')
          ? 1
          : 0,
        fatality_count: condition.includes('FATALITIES') ? 1 : 0,
        dui: false
      } as any);

      resolve(collision);
    });
  }

  getCollisionType(collision: ICollision): string {
    var type: string;

    if (collision.fatality_count > 0) {
      type = 'fatal';
    } else if (collision.serious_injury_count > 0) {
      type = 'serious injury';
    } else if (collision.injury_count > 0) {
      type = 'injury';
    } else {
      throw new Error(
        `Invalid collision record found: ${DumpObject(collision)}`
      );
    }

    return type;
  }

  getTweetFromCollision(
    collision: ICollision,
    collision_type: string,
    last_tweeted: number
  ) {
    let tweet: string = undefined;

    log.info(
      `getTweetFromCollision: Looking at ${
        collision ? collision.id : '***null collision***'
      }:`
    );

    if (
      collision.date_time > last_tweeted ||
      new Date(last_tweeted).getMonth() < new Date().getMonth()
    ) {
      log.info(
        `Tweeting last ${collision_type} collision from ${collision.date_time_str}.`
      );

      tweet = `Last ${this.name} ${collision_type} collision from ${collision.date_time_str}.`;
    } else {
      log.info(
        `Not tweeting last ${collision_type} collision: ${
          collision.date_time
        } <= ${last_tweeted} or ${new Date(
          last_tweeted
        ).getMonth()} >= ${new Date().getMonth()}.`
      );
    }

    return tweet;
  }
}

function CitationType(): string {
  const citation_types = [
    'PARKING',
    'TRAFFIC CAMERA',
    'INFRACTION',
    'EXPLODING CAR',
    'G@SSHOLE DRIVIST',
    'PARKING IN BIKE LANE',
    'BOOMER ENTITLEMENT'
  ];

  return citation_types[Math.floor(Math.random() * citation_types.length)];
}

function CitationStatus(): string {
  const citation_statuses = [
    'PAID',
    'ACTIVE',
    'DISPOSED',
    'COLLECTIONS',
    'BUDDYS_A_JUDGE'
  ];

  return citation_statuses[
    Math.floor(Math.random() * citation_statuses.length)
  ];
}

function CitationValidationDate(): string {
  const days_in_month = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  };
  var month = Math.floor(Math.random() * 12) + 1;
  var day = Math.floor(Math.random() * days_in_month[month]) + 1;
  var year = Math.floor(Math.random() * 10) + 2010;

  return `${month}/${day}/${year}`;
}

function CitationValidationLocation(): string {
  const directions = ['NE', 'NW', 'SE', 'SW'];
  const street_types = ['St', 'Ave', 'Blvd', 'Circle', 'Ct'];
  var num = Math.floor(Math.random() * 100000) + 1;
  var dir = directions[Math.floor(Math.random() * 4)];
  var street = Math.floor(Math.random() * 145) + 1;
  var street_type =
    street_types[Math.floor(Math.random() * street_types.length)];

  return `${num} ${dir} ${street}th ${street_type}`;
}

let Factory: RegionFactory = new DummyRegionFactory();

export { Factory as default };
export { Factory };
