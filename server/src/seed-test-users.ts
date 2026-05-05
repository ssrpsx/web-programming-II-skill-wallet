import { connectDB, disconnectDB } from "./lib/db";
import { User, Skill, Verification } from "./lib/schema";
import { hashPassword } from "./lib/auth";
import fs from "fs";
import path from "path";

export async function runSeed(shouldDisconnect = true) {
  try {
    await connectDB();
    console.log("Seeding test users and all skills...");

    // 0. Load skills from JSON and create them if they don't exist
    let questionsPath = path.join(process.cwd(), "..", "question", "all_questions.json");
    if (!fs.existsSync(questionsPath)) {
      questionsPath = path.join(process.cwd(), "question", "all_questions.json");
    }
    
    if (fs.existsSync(questionsPath)) {
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
      for (const item of questionsData) {
        const subjectName = item.SubjectName;
        let skill = await Skill.findOne({ title: subjectName });
        if (!skill) {
          skill = await Skill.create({
            title: subjectName,
            category: "technical",
            description: `${subjectName} assessment skill`,
            level: "one"
          });
          console.log(`Created skill: ${subjectName}`);
        }
      }
    } else {
      console.warn(`Questions file not found at ${questionsPath}`);
    }

    // 1. Create Interviewer
    const interviewerEmail = "interviewer@test.com";
    let interviewer = await User.findOne({ email: interviewerEmail });
    const defaultHashedPassword = await hashPassword("password123");

    if (!interviewer) {
      interviewer = await User.create({
        name: "Test Interviewer",
        email: interviewerEmail,
        password: defaultHashedPassword,
        role: "interviewer",
      });
      console.log("Created interviewer:", interviewerEmail);
    } else {
      interviewer.password = defaultHashedPassword;
      await interviewer.save();
      console.log("Updated interviewer password");
    }

    // 2. Create 2 Users for P2P testing
    const p2pUserEmails = ["user1@test.com", "user2@test.com"];
    for (const email of p2pUserEmails) {
      let user = await User.findOne({ email: email });
      if (!user) {
        user = await User.create({
          name: `Test P2P User ${email.split("@")[0].slice(-1)}`,
          email: email,
          password: defaultHashedPassword,
          role: "user",
        });
        console.log("Created user:", email);
      } else {
        user.password = defaultHashedPassword;
        await user.save();
        console.log("Updated user password:", email);
      }

      // Ensure they have 1 skill verified at Level 1 (Choice)
      let skill = await Skill.findOne({ title: "Object-Oriented Programming" });
      if (skill) {
        let verification = await Verification.findOne({ userId: user._id, skillId: skill._id });
        if (!verification) {
          verification = await Verification.create({
            userId: user._id,
            skillId: skill._id,
            levelData: [
              {
                level: "choice",
                status: "completed",
                verifiedAt: new Date(),
                choice: {
                  questions: [],
                  score: 100,
                }
              }
            ]
          });
          console.log(`Verified skill for ${email}`);
        }
      }
    }

    // 3. Create Super User from ENV
    const superEmail = process.env.MOCK_USER_GMAIL?.toLowerCase();
    if (superEmail) {
      console.log(`Checking for super user: ${superEmail}`);
      let superUser = await User.findOne({ email: superEmail });
      const superHashedPassword = await hashPassword(process.env.MOCK_USER_PASSWORD || "password123");

      if (!superUser) {
        superUser = await User.create({
          name: `${process.env.MOCK_USER_FIRSTNAME || "Super"} ${process.env.MOCK_USER_LASTNAME || "User"}`,
          email: superEmail,
          password: superHashedPassword,
          role: "user",
          birthDate: process.env.MOCK_USER_BIRTHDAY ? new Date(process.env.MOCK_USER_BIRTHDAY) : undefined,
        });
        console.log("Created super user:", superEmail);
      } else {
        superUser.password = superHashedPassword;
        superUser.name = `${process.env.MOCK_USER_FIRSTNAME || "Super"} ${process.env.MOCK_USER_LASTNAME || "User"}`;
        await superUser.save();
        console.log("Updated super user credentials:", superEmail);
      }

      // Verify ALL skills for super user at Level 3
      const skills = await Skill.find();
      console.log(`Verifying all ${skills.length} skills for super user...`);
      for (const skill of skills) {
        let verification = await Verification.findOne({ userId: superUser._id, skillId: skill._id });
        if (!verification) {
          verification = await Verification.create({
            userId: superUser._id,
            skillId: skill._id,
            levelData: [
              {
                level: "choice",
                status: "completed",
                verifiedAt: new Date(),
                choice: { questions: [], score: 100 }
              },
              {
                level: "p2p_interview",
                status: "completed",
                verifiedAt: new Date(),
                verifiedBy: interviewer?._id
              },
              {
                level: "interview",
                status: "completed",
                verifiedAt: new Date(),
                verifiedBy: interviewer?._id
              }
            ]
          });
          console.log(`Fully verified skill '${skill.title}' for super user`);
        } else {
          // Ensure all 3 levels are completed if verification already exists
          const levels = ["choice", "p2p_interview", "interview"];
          let modified = false;
          levels.forEach(lvl => {
            let levelData = verification.levelData.find(l => l.level === lvl);
            if (!levelData) {
              verification.levelData.push({
                level: lvl as any,
                status: "completed",
                verifiedAt: new Date(),
                verifiedBy: interviewer?._id,
                choice: lvl === "choice" ? { questions: [], score: 100 } : undefined
              });
              modified = true;
            } else if (levelData.status !== "completed") {
              levelData.status = "completed";
              levelData.verifiedAt = new Date();
              levelData.verifiedBy = interviewer?._id;
              modified = true;
            }
          });
          if (modified) {
            await verification.save();
            console.log(`Updated verification for '${skill.title}' for super user`);
          }
        }
      }
    } else {
      console.log("MOCK_USER_GMAIL not found in environment, skipping super user creation.");
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed with error:", error);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await disconnectDB();
    }
  }
}

// Check if this script is being run directly
if (import.meta.url.includes(process.argv[1]?.replace(/\\/g, '/'))) {
  runSeed().catch(err => {
    console.error("Seed script fatal error:", err);
    process.exit(1);
  });
}
