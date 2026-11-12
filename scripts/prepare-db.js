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
  const currentProvider = schema.includes('provider = "postgresql"') ? "postgresql" : "sqlite";

  if (currentProvider !== targetProvider) {
    schema = schema.replace(
      /provider\s*=\s*"(postgresql|sqlite)"/,
      `provider = "${targetProvider}"`
    );
    fs.writeFileSync(schemaPath, schema, "utf8");
    console.log(`[PocketKhata DB] Adjusted schema.prisma provider to '${targetProvider}' to match DATABASE_URL.`);
  } else {
    console.log(`[PocketKhata DB] schema.prisma already configured for '${targetProvider}'.`);
  }
}

