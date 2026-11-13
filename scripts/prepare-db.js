const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let resolvedUrl = process.env.DATABASE_URL || "";

if (!resolvedUrl) {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
    if (match) {
      resolvedUrl = match[1];
    }
  }
}

const targetProvider = resolvedUrl.startsWith("postgres") ? "postgresql" : "sqlite";

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  let modified = false;

  const currentProvider = schema.includes('provider = "postgresql"') ? "postgresql" : "sqlite";

  if (currentProvider !== targetProvider) {
    schema = schema.replace(
      /provider\s*=\s*"(postgresql|sqlite)"/,
      `provider = "${targetProvider}"`
    );
    modified = true;
    console.log(`[PocketKhata DB] Adjusted schema.prisma provider to '${targetProvider}' to match DATABASE_URL.`);
  }

  if (targetProvider === "postgresql") {
    if (!schema.includes("directUrl")) {
      schema = schema.replace(
        /url\s*=\s*env\("DATABASE_URL"\)/,
        'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
      );
      modified = true;
      console.log(`[PocketKhata DB] Added directUrl to schema.prisma for PostgreSQL pooling.`);
    }
  } else {
    if (schema.includes("directUrl")) {
      schema = schema.replace(/\r?\n\s*directUrl\s*=\s*env\("DIRECT_URL"\)/, "");
      modified = true;
      console.log(`[PocketKhata DB] Removed directUrl for SQLite compatibility.`);
    }
  }

  if (modified) {
    fs.writeFileSync(schemaPath, schema, "utf8");
  } else {
    console.log(`[PocketKhata DB] schema.prisma already properly configured for '${targetProvider}'.`);
  }
}


