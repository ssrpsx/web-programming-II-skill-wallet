import { connectDB, disconnectDB } from "./lib/db";
import { User } from "./lib/schema";

async function check() {
  await connectDB();
  const users = await User.find({}, "email name");
  console.log(JSON.stringify(users, null, 2));
  await disconnectDB();
}

check();
