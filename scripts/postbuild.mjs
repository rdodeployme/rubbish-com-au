// GitHub Pages has no server routing. Copy index.html to 404.html so a deep link
// such as /my-pickups loads the app, which then routes on the client.
import { copyFileSync, writeFileSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
writeFileSync("dist/.nojekyll", "");
console.log("postbuild: 404.html and .nojekyll written");
