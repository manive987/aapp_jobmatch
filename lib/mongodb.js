import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URL) {
  throw new Error('Please add your Mongo URI to .env');
}

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'jobmatch_ai';
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function connectDB() {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;