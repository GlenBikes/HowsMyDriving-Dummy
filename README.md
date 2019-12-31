Region plugin template for @HowsMyDrivingWA to add a new city/region.
=====================================================================

@HowsMyDrivingWA supports plug-in npm modules to add additional cities/regions.

This project is a template that you can copy and add your code to in order to
implement your favorite region.

Requirements:
1. The region must have #OpenData citations searchable by license # (obvs).
2. The module must export an object named Region that implements the [IRegion
   interface](https://glitch.com/edit/#!/howsmydriving-utils?path=src/interfaces/iregion.ts:4:0) 
   (see [HowsMyDriving-Utils project](https://glitch.com/~howsmydriving-utils)).
3. The Region.name property must be unique among existing regions consumed
   by [HowsMyDrivingWA project](https://glitch.com/~howsmydrivingwa).
4. Implement the GetCitationsByPlate and ProcessCitationsForRequest methods.
5. Write unit tests and make sure they are 100% passing.
6. Test it within an actual Twitter bot (you can remix [this Glitch project](https://glitch.com/~howsmydrivingwa)).
7. Submit a pull request to [HowsMyDrivingWA project](https://glitch.com/~howsmydrivingwa).
8. Provide technical support if bugs are found in your module.

```TypeScript
export class DummyRegion extends Region {
  constructor(name: string) {
    super(name);
  }

  GetCitationsByPlate(plate: string, state: string): Promise<Array<Citation>> {
    return new Promise<Array<Citation>>((resolve, reject) => {
      // Your code to get the citations and return as an array.
      //
      // The objects you return must implement ICitation but can have
      // any number of additional properties.
      // Note: AWS DynamoDB is currently used as the store which means that
      //       none of the properties of your returned objects can be undefined
      //       or empty strings because the world's richest man seems to think
      //       that makes sense.
    });
  }

  ProcessCitationsForRequest(
    citations: ICitation[],
    query_count: number
  ): Array<string> 
    let tweets: Array<string> = [];
    
    // Your code to create the list of tweets you want posted.
    // It is OK for any or all of the strings to be > 280 chars
    // in length. They will be split into multiple tweets on a line
    // break if one exists (if not, it will be split at 280 chars).
    
    // Return the strings in the order they should be tweeted.
    return tweets;
  }
}

```

Adding a new region module to HowsMyDriving .env file (you'll need [@GlenBikes](http://twitter.com/GlenBikes) to invite you to the project as a collaborator):

The string you give for the region is the npm module name (i.e. what 
you'd specify in an import statement to import your project).

```JSON
{
  REGIONS="howsmydriving-seattle, howsmydriving-dummy, your-new-region"
}
```

How to contribute: [CONTRIBUTING.md](https://glitch.com/edit/#!/howsmydriving-dummy?path=CONTRIBUTING.md:1:0).

Find this useful? [Buy @GlenBikes a coffee](https://www.buymeacoffee.com/GlenBikes)

**Powered by [Glitch](https://glitch.com)**

\ ゜o゜)ノ
