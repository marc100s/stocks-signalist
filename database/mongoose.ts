import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

declare global {
  var mongooseCache: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<mongoose.Mongoose> => {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  console.log(
    `Connected to ${process.env.NODE_ENV || "unknown env"} - ${MONGODB_URI}`
  );
  return cached.conn;
};
