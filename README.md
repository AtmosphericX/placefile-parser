
<h1 style='font-size: 65px'; align="center">🗺️ AtmosphericX - Placefile Parser 🌎</h1>
<div align="center">
  	<p align = "center">A Placefile is a structured text file used to provide geospatial data for mapping applications, often for weather alerts, storm reports, or points of interest. A Placefile contains instructions for displaying locations on a map, including coordinates, labels, colors, icons, and refresh intervals. This module is primarily intended for use with the https://github.com/k3yomi/AtmosphericX project.</small></p>
  	<p align = "center">Documentation written by @k3yomi</p>
	<div align="center" style="border: none;">
		<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/AtmosphericX/placefile-parser">
		<img alt="GitHub forks" src="https://img.shields.io/github/forks/AtmosphericX/placefile-parser">
		<img alt="GitHub issues" src="https://img.shields.io/github/issues/AtmosphericX/placefile-parser">
		<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/AtmosphericX/placefile-parser">
	</div>
</div>

## Installation (NPM)
```bash
npm install @atmosx/placefile-parser
```

## Example Usage
```javascript
const { PlacefileManager } = require('@atmosx/placefile-parser'); // CJS
import { PlacefileManager } from '@atmosx/placefile-parser'; // ESM


const sample = fs.readFileSync("test", "utf-8"); // For testing...

// Parsing a basic placefile
PlacefileManager.parsePlacefile(sample).then((objects) => {
    console.log("Parsed Objects:", objects);
})

// Parsing a table
PlacefileManager.parseTable(sample).then((table) => {
    console.log("Parsed Table:", table);
})


// Parsing GeoJSON
PlacefileManager.parseGeoJSON(sample).then((geojson) => {
    console.log("Parsed GeoJSON:", geojson);
})

// Creating a placefile 
PlacefileManager.createPlacefile({
    refresh: 60,
    threshold: 50,
    title: "Sample Placefile",
    settings: "ShowLabels, ShowIcons",
    type: "Point",
    objects: [
        {
            coordinates: [34.0522, -118.2437],
            label: "Los Angeles",
            color: "255 0 0",
        },
        {
            coordinates: [40.7128, -74.0060],
            label: "New York",
            color: "0 0 255",
        }
    ]
}).then((placefile) => {
    console.log("Generated Placefile:\n", placefile);
});
```

## References
[Documentation](https://atmosphericx.scriptkitty.cafe/documentation) |
[Discord Server](https://atmosphericx-discord.scriptkitty.cafe) |
[Project Board](https://github.com/users/AtmosphericX/projects/2) |\
[Code of Conduct](/CODE_OF_CONDUCT.md) |
[Contributing](/CONTRIBUTING.md) |
[License](/LICENSE) | 
[Security](/SECURITY.md) | 
[Changelogs](/CHANGELOGS.md) |

## Acknowledgements
- [k3yomi](https://github.com/k3yomi)
    - Lead developer @ AtmosphericX and maintainer of this module.
- [StarflightWx](https://x.com/starflightVR)
    - For testing and providing feedback (Co-Developer and Spotter @ AtmosphericX)