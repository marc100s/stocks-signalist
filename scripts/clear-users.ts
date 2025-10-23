import { config } from "dotenv";
// Load environment variables FIRST before any other imports
config({ path: ".env" });

import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

async function clearUsers() {
  try {
    await connectToDatabase();
    console.log("✓ Connected to database");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log(`📊 Database name: ${db.databaseName}`);
    console.log("⚠️  This will delete ALL users from this database!\n");

    // Better Auth uses singular collection names
    const userResult = await db.collection("user").deleteMany({});
    console.log(`✓ Deleted ${userResult.deletedCount} users from the database`);

    const sessionsResult = await db.collection("session").deleteMany({});
    console.log(`✓ Deleted ${sessionsResult.deletedCount} sessions`);

    const accountsResult = await db.collection("account").deleteMany({});
    console.log(`✓ Deleted ${accountsResult.deletedCount} accounts`);

    const verificationsResult = await db
      .collection("verification")
      .deleteMany({});
    console.log(
      `✓ Deleted ${verificationsResult.deletedCount} verification tokens`
    );

    console.log("\n✨ Database cleared successfully! All users removed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error clearing database:");
    console.error(err);
    process.exit(1);
  }
}

clearUsers();
