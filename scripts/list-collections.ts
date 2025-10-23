import { config } from "dotenv";
config({ path: ".env" });

import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

async function listCollections() {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log(`\n📊 Database: ${db.databaseName}\n`);

    const collections = await db.listCollections().toArray();

    console.log(`Found ${collections.length} collections:\n`);

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📁 ${collection.name}: ${count} documents`);
    }

    console.log("\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

listCollections();
