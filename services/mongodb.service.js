import { MongoClient } from "mongodb";
import { ENV } from "../config/env.js";

const client = new MongoClient(ENV.MONGODB_URI);
let db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(ENV.MONGODB_DB_NAME || "magicsub_db");
  }
  return db;
}
