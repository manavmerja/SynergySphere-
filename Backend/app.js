import express from "express";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./connect.js";

const app = express();
app.use(express.json());

await connectDB();
// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.join(__dirname, "routes");
const routeFiles = readdirSync(routesPath).filter(f => f.endsWith("Routes.js"));

for (const file of routeFiles) {
  const { default: route } = await import(`./routes/${file}`);
  const routeName = file.replace("Routes.js", "").toLowerCase();
  app.use(`/api/${routeName}`, route);
}




app.listen(3000, () => {
  console.log("Server running on port 3000");
});
