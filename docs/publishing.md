# Publishing Routefiles

Ranger displays a list of published routes on the route landing page, and you can add your route if it's ready for others to use! Routes are saved in the [central route repository](https://github.com/corvimae/ranger-routes) on GitHub, and thus publishing your route requires some basic knowledge of Git.

## Requirements

- Ranger must not show an error when you drag your route in.
- Your route must be runnable from start to finish - it doesn't necessarily need to be 100% perfected, but it must have instructions to complete a run as per the rules listed on [speedrun.com](https://speedrun.com/) for the category.
- All images must be included in the `assets/` folder, and image links must be relative to `assets/`.
- You must include a `route.json` metadata file.

## Creating a Submission

If you're ready to submit your route, [fork](https://guides.github.com/activities/forking/) the [`ranger-routes`](https://github.com/corvimae/ranger-routes) repository 
and create a new directory with the name of your route. Make sure the name does not conflict with any other published route.

Your directory should have this structure:

| File                       | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `route.mdr`                | The routefile.                                             |
| `route.json`               | The [route metadata file](#route-metadata).                |
| `assets/`                  | A directory with the images used by the routefile, if any. |

For an example, see [alpha-sapphire-any-percent](https://github.com/Corvimae/ranger-routes/tree/main/alpha-sapphire-any-percent).

Finally, open a [pull request](https://github.com/Corvimae/ranger-routes/compare).

If you make changes to your route after it is accepted, please open another pull request.

## Route Metadata

Ranger uses the information specified in `route.json` to show more detailed information in the selector.

```json
{
  "title": "My Route", // The name of your route.
  "author": "Corvimae", // The name of the author.
  "authorLink": "https://twitter.com/corvimae", // A link to the author's social media (optional).
  "game": "Alpha Sapphire", // The name of the game this route is for. Please be accurate.
  "generation": 6, // The generation of the game this route is for.
  "version": "1.0.0", // The version of the route. Please use semantic versioning: https://semver.org/
}
```

A complete list of games recognized by Ranger can be found [here](https://github.com/Corvimae/pokemon-ranger/blob/main/server/titles.ts#L8). Game names are not case sensitive.