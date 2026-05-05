import { connectDB, disconnectDB } from "./lib/db";
import { User, Skill } from "./lib/schema";

async function check() {
  await connectDB();
  const userCount = await User.countDocuments();
  const skillCount = await Skill.countDocuments();
  console.log(`Users: ${userCount}, Skills: ${skillCount}`);
  await disconnectDB();
}

check();
