import mongoose from "mongoose";

const rawMongoUri = process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI;
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME ?? "volleyball";

if (!rawMongoUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const MONGODB_URI: string = rawMongoUri;

mongoose.set("strictQuery", true);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis._mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis._mongooseCache = globalCache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      dbName: DEFAULT_DB_NAME,
    });
  }

  globalCache.conn = await globalCache.promise;

  return globalCache.conn;
}

export type { mongoose };

