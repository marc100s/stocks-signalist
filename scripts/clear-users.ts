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

    // Delete all documents from the users collection
    const result = await db.collection("users").deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} users from the database`);

    // Optionally, also clear sessions and accounts collections used by Better Auth
    const sessionsResult = await db.collection("sessions").deleteMany({});
    console.log(`✓ Deleted ${sessionsResult.deletedCount} sessions`);

    const accountsResult = await db.collection("accounts").deleteMany({});
    console.log(`✓ Deleted ${accountsResult.deletedCount} accounts`);

    const verificationsResult = await db
      .collection("verifications")
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
