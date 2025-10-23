import { config } from "dotenv";
// Load environment variables FIRST before any other imports
config({ path: ".env" });

import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

async function clearUsers() {
  try {
    console.log("\n" + "=".repeat(80));
    console.log("🗑️  CLEARING ALL USERS FROM DATABASE");
    console.log("=".repeat(80) + "\n");

    await connectToDatabase();
    console.log("✓ Connected to database\n");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log(`📊 Database name: ${db.databaseName}`);
    console.log("⚠️  This will delete ALL users from this database!\n");

    // Check if we're in production
    if (process.env.NODE_ENV === "production") {
      console.error("❌ ERROR: This script should not be run in production!");
      console.error("   Set NODE_ENV=development to run this script.\n");
      process.exit(1);
    }

    // Better Auth uses singular collection names
    const userResult = await db.collection("user").deleteMany({});
    console.log(`✓ Deleted ${userResult.deletedCount} user(s) from the database`);

    const sessionsResult = await db.collection("session").deleteMany({});
    console.log(`✓ Deleted ${sessionsResult.deletedCount} session(s)`);

    const accountsResult = await db.collection("account").deleteMany({});
    console.log(`✓ Deleted ${accountsResult.deletedCount} account(s)`);

    const verificationsResult = await db
      .collection("verification")
      .deleteMany({});
    console.log(
      `✓ Deleted ${verificationsResult.deletedCount} verification token(s)`
    );

    console.log("\n✨ Database cleared successfully! All users removed.");
    console.log("=".repeat(80) + "\n");
    process.exit(0);
  } catch (err) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ ERROR CLEARING DATABASE");
    console.error("=".repeat(80));
    console.error(err);
    console.log("\nTip: Run 'npm run db:check-config' to verify your database configuration.\n");
    process.exit(1);
  }
}

clearUsers();
