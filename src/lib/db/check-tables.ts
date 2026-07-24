import * as dotenv from "dotenv";
dotenv.config();

import pg from "pg";

console.log("🔍 Checking columns in Postgres DB for table 'account'...");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'account';
`);

console.log("Columns in 'account' table:");
res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

const userCols = await client.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'user';
`);
console.log("\nColumns in 'user' table:");
userCols.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

await client.end();
process.exit(0);
