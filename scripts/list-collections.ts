import { config } from "dotenv";
config({ path: ".env" });

import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

async function listCollections() {
  try {
    console.log("\n" + "=".repeat(80));
    console.log("📋 LISTING DATABASE COLLECTIONS");
    console.log("=".repeat(80) + "\n");

    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log(`📊 Database: ${db.databaseName}\n`);

    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("   No collections found in this database.");
      console.log("   Collections will be created automatically when you:");
      console.log("   • Register your first user");
      console.log("   • Create your first watchlist entry\n");
    } else {
      console.log(`Found ${collections.length} collection(s):\n`);

      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   📁 ${collection.name}: ${count} document(s)`);
      }
      console.log("");
    }

    console.log("=".repeat(80) + "\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    console.log("\nTip: Make sure your .env file is configured correctly.");
    console.log("Run 'npm run db:check-config' to verify your database configuration.\n");
    process.exit(1);
  }
}

listCollections();
