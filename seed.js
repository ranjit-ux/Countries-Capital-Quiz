import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await db.connect();

const data = fs.readFileSync("capitals.csv", "utf8").trim().split("\n");
data.shift(); // remove header

for (let row of data) {
  const [country, capital] = row.split(",");
  await db.query(
    "INSERT INTO capitals (country, capital) VALUES ($1, $2)",
    [country, capital]
  );
}

console.log("Data imported successfully");
process.exit();
