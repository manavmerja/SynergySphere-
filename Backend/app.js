// app.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./connect.js";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB
await connectDB();

// Auto-load all route files that end with Routes.js
const routesPath = path.join(__dirname, "routes");
const routeFiles = readdirSync(routesPath).filter((f) => f.endsWith("Routes.js"));

for (const file of routeFiles) {
  const { default: route } = await import(`./routes/${file}`);
  const routeName = file.replace("Routes.js", "").toLowerCase();
  app.use(`/api/${routeName}`, route);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
