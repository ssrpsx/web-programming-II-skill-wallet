import { connectDB, disconnectDB } from "./lib/db";
import { User } from "./lib/schema";
import { comparePassword } from "./lib/auth";

async function check() {
  await connectDB();
  const user = await User.findOne({ email: "superuser@gmail.com" }).select("+password");
  if (!user) {
    console.log("User not found");
  } else {
    const isValid = await comparePassword("password123", user.password);
    console.log(`Password 'password123' is valid: ${isValid}`);
  }
  await disconnectDB();
}

check();
