import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment");
}

async function migrateWatchlists() {
  try {
    console.log("🔄 Starting migration from test to SignalisticsDB...\n");

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    // Connect to test database
    const testConnection = await mongoose
      .createConnection(MONGODB_URI.replace(/\/[^/]*\?/, "/test?"))
      .asPromise();
    console.log("✅ Connected to test database");

    // Connect to SignalisticsDB
    const signalisticsConnection = await mongoose
      .createConnection(MONGODB_URI.replace(/\/[^/]*\?/, "/SignalisticsDB?"))
      .asPromise();
    console.log("✅ Connected to SignalisticsDB\n");

    // Get watchlists collection from test database
    const testWatchlists = testConnection.collection("watchlists");
    const watchlistsCount = await testWatchlists.countDocuments();

    console.log(
      `📊 Found ${watchlistsCount} watchlist documents in test database`
    );

    if (watchlistsCount > 0) {
      // Get all watchlists from test
      const watchlists = await testWatchlists.find({}).toArray();

      // Insert into SignalisticsDB
      const signalisticsWatchlists =
        signalisticsConnection.collection("watchlists");
      const result = await signalisticsWatchlists.insertMany(watchlists);

      console.log(
        `✅ Migrated ${result.insertedCount} watchlists to SignalisticsDB\n`
      );

      // Show sample of migrated data
      console.log("📝 Sample migrated watchlist:");
      console.log(JSON.stringify(watchlists[0], null, 2));
    } else {
      console.log("ℹ️  No watchlists to migrate\n");
    }

    // Verify migration
    const signalisticsWatchlists =
      signalisticsConnection.collection("watchlists");
    const verifyCount = await signalisticsWatchlists.countDocuments();
    console.log(
      `\n✅ Verification: SignalisticsDB now has ${verifyCount} watchlist documents`
    );

    // Close connections
    await testConnection.close();
    await signalisticsConnection.close();

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Verify your local .env has MONGODB_URI with /SignalisticsDB"
    );
    console.log("2. Update MONGODB_URI in Vercel environment variables");
    console.log("3. Test the application locally");
    console.log("4. Deploy to Vercel");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrateWatchlists();
