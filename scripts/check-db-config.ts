import { config } from "dotenv";
config({ path: ".env" });

import { connectToDatabase } from "../database/mongoose";
import mongoose from "mongoose";

/**
 * Script to verify database configuration and connection
 * Helps identify common MongoDB configuration issues
 */
async function checkDatabaseConfig() {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 DATABASE CONFIGURATION CHECK");
  console.log("=".repeat(80) + "\n");

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI environment variable is not set!");
    console.log("\nPlease set MONGODB_URI in your .env file.");
    console.log("Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb?options\n");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  console.log("✓ MONGODB_URI is set\n");

  // Parse the URI to extract database name
  let databaseName = "UNKNOWN";
  try {
    const url = new URL(mongoUri.replace("mongodb+srv://", "https://"));
    databaseName = url.pathname.substring(1).split("?")[0];
  } catch (e) {
    console.warn("⚠️  Warning: Could not parse MongoDB URI");
  }

  console.log("📊 Configuration Details:");
  console.log("-".repeat(80));
  console.log(`Environment: ${process.env.NODE_ENV || "not set"}`);
  console.log(`Database Name from URI: ${databaseName || "(none specified - will use 'test')"}`);
  console.log(`Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || "not set"}`);
  console.log(`Auth URL: ${process.env.BETTER_AUTH_URL || "not set"}`);
  console.log("-".repeat(80) + "\n");

  // Check for common issues
  let hasWarnings = false;

  if (!databaseName || databaseName === "") {
    console.warn("⚠️  WARNING: No database name specified in MONGODB_URI!");
    console.warn("   MongoDB will default to the 'test' database.");
    console.warn("   This is usually not what you want.\n");
    console.warn("   Fix: Add your database name to the URI:");
    console.warn("   mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME?options\n");
    hasWarnings = true;
  }

  if (databaseName === "test") {
    console.warn("⚠️  WARNING: You are using the 'test' database!");
    console.warn("   This is MongoDB's default database and should not be used for production.");
    console.warn("   Consider using a named database like 'signalist_dev' or 'signalist_prod'\n");
    hasWarnings = true;
  }

  // Try to connect
  console.log("🔌 Attempting to connect to MongoDB...\n");
  
  try {
    await connectToDatabase();
    console.log("✅ Successfully connected to MongoDB!\n");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Get actual database name from connection
    const actualDbName = db.databaseName;
    console.log(`📊 Connected to database: ${actualDbName}\n`);

    if (actualDbName !== databaseName && databaseName !== "UNKNOWN") {
      console.warn(`⚠️  WARNING: Database name mismatch!`);
      console.warn(`   Expected: ${databaseName}`);
      console.warn(`   Actual: ${actualDbName}\n`);
      hasWarnings = true;
    }

    // List collections
    console.log("📁 Collections in database:");
    console.log("-".repeat(80));
    
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log("   (no collections yet - this is normal for a new database)\n");
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documents`);
      }
      console.log("");
    }

    // Check for Better Auth collections
    console.log("🔐 Better Auth Collections Check:");
    console.log("-".repeat(80));
    
    const expectedCollections = ["user", "account", "session", "verification"];
    const existingCollections = collections.map((c) => c.name);
    
    for (const collName of expectedCollections) {
      if (existingCollections.includes(collName)) {
        const count = await db.collection(collName).countDocuments();
        console.log(`   ✓ ${collName}: ${count} documents`);
      } else {
        console.log(`   - ${collName}: not created yet (will be created on first use)`);
      }
    }
    console.log("");

    // Check for incorrect collection names (plural)
    const incorrectCollections = ["users", "accounts", "sessions", "verifications"];
    const foundIncorrect = incorrectCollections.filter((name) =>
      existingCollections.includes(name)
    );

    if (foundIncorrect.length > 0) {
      console.warn("⚠️  WARNING: Found collections with incorrect names:");
      for (const name of foundIncorrect) {
        console.warn(`   • ${name} (should be ${name.slice(0, -1)})`);
      }
      console.warn("\n   Better Auth uses SINGULAR collection names.");
      console.warn("   These plural collections will not be used by the application.\n");
      hasWarnings = true;
    }

    // Summary
    console.log("=".repeat(80));
    if (!hasWarnings) {
      console.log("✅ All checks passed! Your database configuration looks good.");
    } else {
      console.log("⚠️  Some warnings were found. Please review them above.");
    }
    console.log("=".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to connect to MongoDB!");
    console.error("\nError details:");
    console.error(error);
    console.log("\n" + "=".repeat(80));
    console.log("TROUBLESHOOTING:");
    console.log("=".repeat(80));
    console.log("1. Check your MONGODB_URI is correct");
    console.log("2. Verify your MongoDB Atlas cluster is running");
    console.log("3. Check Network Access whitelist (allow 0.0.0.0/0 or your IP)");
    console.log("4. Verify database username and password are correct");
    console.log("5. Make sure you've added database name to the URI");
    console.log("=".repeat(80) + "\n");
    process.exit(1);
  }
}

checkDatabaseConfig();
