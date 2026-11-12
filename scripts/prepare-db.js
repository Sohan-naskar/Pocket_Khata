const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let resolvedUrl = process.env.DATABASE_URL || "";
let resolvedDirectUrl = process.env.DIRECT_URL || "";

if (!resolvedUrl || !resolvedDirectUrl) {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    if (!resolvedUrl) {
      const matchUrl = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
      if (matchUrl) resolvedUrl = matchUrl[1];
    }
    if (!resolvedDirectUrl) {
      const matchDirect = envContent.match(/DIRECT_URL=["']?([^"'\r\n]+)/);
      if (matchDirect) resolvedDirectUrl = matchDirect[1];
    }
  }
}

const isPostgres = resolvedUrl.startsWith("postgres");
let newDatasourceBlock = "";

if (isPostgres) {
  if (resolvedDirectUrl) {
    newDatasourceBlock = `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`;
  } else {
    newDatasourceBlock = `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}`;
  }
} else {
  newDatasourceBlock = `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`;
}

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const datasourceRegex = /datasource db\s*\{[\s\S]*?\}/;
  const currentDatasource = schema.match(datasourceRegex)?.[0] || "";

  if (currentDatasource.trim() !== newDatasourceBlock.trim()) {
    schema = schema.replace(datasourceRegex, newDatasourceBlock);
    fs.writeFileSync(schemaPath, schema, "utf8");
    console.log(`[PocketKhata DB] Updated schema.prisma datasource block for ${isPostgres ? "PostgreSQL" : "SQLite"}.`);
  } else {
    console.log(`[PocketKhata DB] schema.prisma datasource already up-to-date.`);
  }
}
