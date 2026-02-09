var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var PlacefileManager = class {
  /**
   * @function parsePlacefile
   * @description
   *     Parses a Placefile string and returns an array of PlacefileInput objects.
   *
   * @param data - The Placefile string to be parsed.
   */
  static parsePlacefile(data) {
    return __async(this, null, function* () {
      let objects = [];
      let currentObject = {};
      const lines = data.split(/\r?\n/);
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith("//")) {
          continue;
        }
        if (line.startsWith("Line:")) {
          const parts = line.replace(`Line:`, "").trim().split(",");
          currentObject.line = {
            width: parseFloat(parts[0]),
            style: parseFloat(parts[1]),
            text: parts.slice(2).join(",").trim()
          };
          currentObject.coordinates = [];
        }
        if (line.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
          const coords = line.split(",");
          if (currentObject.coordinates) {
            currentObject.coordinates.push([parseFloat(coords[1]), parseFloat(coords[0])]);
          }
        }
        if (line.startsWith("Object:")) {
          const coordinates = line.replace(`Object:`, "").trim().split(",");
          currentObject.object = {
            coordinates: [parseFloat(coordinates[1]), parseFloat(coordinates[0])],
            properties: {}
          };
        }
        if (line.startsWith("Color:")) {
          const parts = line.replace(`Color:`, "").trim().split(" ");
          currentObject.color = {
            r: parseInt(parts[0]),
            g: parseInt(parts[1]),
            b: parseInt(parts[2]),
            a: parseFloat(parts[3])
          };
        }
        if (line.startsWith("Icon:")) {
          const parts = line.replace(`Icon:`, "").trim().split(",");
          currentObject.icon = {
            x: parseFloat(parts[0]),
            y: parseFloat(parts[1]),
            scale: parseFloat(parts[3]),
            color: parts[2],
            type: parts[4],
            label: parts.slice(5).join(",").trim().replace(/^"|"$/g, "")
          };
        }
        if (line.startsWith("End:") && currentObject && Object.keys(currentObject).length > 0) {
          objects.push(currentObject);
          currentObject = {};
        }
        if (!lines.includes("End:") && currentObject && Object.keys(currentObject).length > 0) {
          objects.push(currentObject);
          currentObject = {};
        }
      }
      return objects;
    });
  }
  /**
   * @function parseTable
   * @description
   *     Parses a table-formatted string and returns an array of objects.
   *
   * @param data - The table-formatted string to be parsed.
   */
  static parseTable(data) {
    return __async(this, null, function* () {
      let lines = data.split(/\r?\n/);
      let objects = [];
      let dict = lines[0].split("|").map((key) => key.trim());
      for (let line of lines.slice(1)) {
        line = line.trim();
        if (!line || line.startsWith("//")) {
          continue;
        }
        if (line.includes("|")) {
          const parts = line.split("|");
          let obj = {};
          for (let i = 0; i < dict.length; i++) {
            obj[dict[i]] = parts[i] ? parts[i].trim() : `N/A`;
          }
          objects.push(obj);
        }
      }
      return objects;
    });
  }
  /**
   * @function parseGeoJSON
   * @description
   *     Parses a GeoJSON string and returns an array of PlacefileGeoOutput objects.
   *
   * @param data - The GeoJSON string to be parsed.
   */
  static parseGeoJSON(data) {
    return __async(this, null, function* () {
      let geojson;
      try {
        geojson = typeof data === "string" ? JSON.parse(data) : data;
      } catch (e) {
        return "Invalid JSON format";
      }
      if (!geojson || !geojson.type || geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
        return "Invalid GeoJSON format";
      }
      let features = geojson.features.map((feature) => {
        let geometry = feature.geometry || {};
        let properties = feature.properties || {};
        let parsedFeature = { type: geometry.type || "N/A", coordinates: geometry.coordinates || [], properties };
        return parsedFeature;
      });
      return features;
    });
  }
  /**
   * @function createPlacefile
   * @description
   *     Creates a Placefile string from the provided PlacefileCreationInput data.
   *
   * @param data
   * - refresh: The refresh interval for the Placefile.
   * - threshold: The threshold value for the Placefile.
   * - title: The title of the Placefile.
   * - settings: Additional settings for the Placefile.
   * - type: The type of Placefile to create ('point' or other).
   * - data: An array of data objects to include in the Placefile.
   */
  static createPlacefile(data) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      let placefileText = `Refresh: ${(_a = data == null ? void 0 : data.refresh) != null ? _a : `60`}
Threshold: ${(_b = data == null ? void 0 : data.threshold) != null ? _b : 9999}
Title: ${(_c = data == null ? void 0 : data.title) != null ? _c : `No Tile`}
${(_d = data == null ? void 0 : data.settings) != null ? _d : ``}
`;
      if ((data == null ? void 0 : data.type) === "point") {
        for (let item of data == null ? void 0 : data.data) {
          let { description = `No description provided`, point = [], icon = "0,0,000,1,19", text = "0, 15, 1", title = "" } = item || {};
          if (Array.isArray(point) && point.length == 2 && typeof point[0] == "number" && typeof point[1] == "number") {
            placefileText += [`
Object: ${point[1]},${point[0]}`, `Icon: ${icon},"${description.replace(/\n/g, "\\n")}"`, `Text: ${text}, "${title.split("\n")[0]}"`, `End:
`].join("\n");
          }
        }
      } else {
        for (const item of (_e = data == null ? void 0 : data.data) != null ? _e : []) {
          let { description = "No description provided", polygon, rgb = "255,255,255,255" } = item;
          if (!polygon) continue;
          rgb = rgb.replace(/,/g, " ");
          const polygons = [];
          if (polygon.type === "Polygon") {
            polygons.push(polygon.coordinates);
          } else if (polygon.type === "MultiPolygon") {
            for (const p of polygon.coordinates) {
              polygons.push(p);
            }
          } else if (Array.isArray(polygon)) {
            polygons.push(polygon);
          }
          if (polygons.length === 0) continue;
          for (const poly of polygons) {
            const outer = poly[0];
            if (!outer) continue;
            placefileText += `
Color: ${rgb}

Line: 3,0, ${description}
`;
            for (const pt of outer) {
              if (Array.isArray(pt) && pt.length === 2) {
                placefileText += `${pt[1]},${pt[0]}
`;
              }
            }
            placefileText += `End:
`;
          }
        }
      }
      return placefileText.trim();
    });
  }
};
var index_default = PlacefileManager;
export {
  PlacefileManager,
  index_default as default
};
