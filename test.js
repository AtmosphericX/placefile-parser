const { PlacefileManager } = require("@atmosx/placefile-parser");
const fs = require("fs");

const sample = fs.readFileSync("test.txt", "utf-8");

PlacefileManager.parsePlacefile(sample).then((objects) => {
  console.log("Parsed Objects:", objects);
})

