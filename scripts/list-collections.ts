import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment");
}

async function listCollections() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    // Extract database name from connection string
    const dbNameMatch = MONGODB_URI.match(/\.net\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : "unknown";

    console.log(`\n📊 Connecting to database: ${dbName}\n`);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully\n");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const collections = await db.listCollections().toArray();

    console.log(`Found ${collections.length} collections:\n`);

    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`  📁 ${collection.name}: ${count} documents`);
    }

    console.log("\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
  }
}

listCollections();
