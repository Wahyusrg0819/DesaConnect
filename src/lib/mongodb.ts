import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Extend the global object with our cached mongoose connection
declare global {
  var _mongooseCache: Promise<typeof mongoose> | null;
}

let cached = global._mongooseCache;

async function dbConnect() {
  if (cached) {
    return cached; // Return the existing promise
  }

  const opts = {
    bufferCommands: false,
  };

  // Create a new promise for the connection
  cached = mongoose.connect(MONGODB_URI!, opts);

  // Store the promise globally
  global._mongooseCache = cached;

  // Wait for the connection to resolve and return the instance
  return cached;
}

export default dbConnect;
