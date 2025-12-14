const fs = require("fs");
const path = require("path");

// Load env vars from .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
} catch (e) {
  console.error("Error loading .env.local", e);
}

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY not found in environment or .env.local");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((model) => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
