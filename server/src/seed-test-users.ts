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

    // 1. Create Interviewer from ENV
    const interviewerEmail = process.env.MOCK_INTERVIEWER_EMAIL?.toLowerCase();
    let interviewer;
    if (interviewerEmail) {
      interviewer = await User.findOne({ email: interviewerEmail });
      const interviewerHashedPassword = await hashPassword(process.env.MOCK_INTERVIEWER_PASSWORD || "password123");

      if (!interviewer) {
        interviewer = await User.create({
          name: process.env.MOCK_INTERVIEWER_NAME || "Senior Interviewer",
          email: interviewerEmail,
          password: interviewerHashedPassword,
          role: "interviewer",
          rank: process.env.MOCK_INTERVIEWER_RANK || "Senior Staff",
        });
        console.log("Created interviewer:", interviewerEmail);
      } else {
        interviewer.password = interviewerHashedPassword;
        interviewer.role = "interviewer";
        interviewer.rank = process.env.MOCK_INTERVIEWER_RANK || "Senior Staff";
        await interviewer.save();
        console.log("Updated interviewer:", interviewerEmail);
      }
    }

    // 2. Create 2 Super Users from ENV
    const superEmails = [
      process.env.MOCK_SUPERUSER1_EMAIL?.toLowerCase(),
      process.env.MOCK_SUPERUSER2_EMAIL?.toLowerCase(),
    ].filter(Boolean);

    for (const superEmail of superEmails) {
      if (!superEmail) continue;
      console.log(`Checking for super user: ${superEmail}`);
      let superUser = await User.findOne({ email: superEmail });
      
      // Determine password and name based on which superuser it is
      const isUser1 = superEmail === process.env.MOCK_SUPERUSER1_EMAIL?.toLowerCase();
      const pwd = isUser1 ? process.env.MOCK_SUPERUSER1_PASSWORD : process.env.MOCK_SUPERUSER2_PASSWORD;
      const name = isUser1 ? process.env.MOCK_SUPERUSER1_NAME : process.env.MOCK_SUPERUSER2_NAME;
      
      const superHashedPassword = await hashPassword(pwd || "password123");

      if (!superUser) {
        superUser = await User.create({
          name: name || "Super User",
          email: superEmail,
          password: superHashedPassword,
          role: "user",
        });
        console.log("Created super user:", superEmail);
      } else {
        superUser.password = superHashedPassword;
        superUser.name = name || "Super User";
        superUser.role = "user";
        await superUser.save();
        console.log("Updated super user:", superEmail);
      }

      // Verify ALL skills for super users up to P2P level (since they cannot interview)
      const skills = await Skill.find();
      console.log(`Verifying all ${skills.length} skills for super user ${superEmail} (Level 2/P2P)...`);
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
              }
            ]
          });
          console.log(`P2P verified skill '${skill.title}' for super user ${superEmail}`);
        } else {
          // Ensure choice and p2p are completed
          const levels = ["choice", "p2p_interview"];
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
            console.log(`Updated verification for '${skill.title}' for super user ${superEmail}`);
          }
        }
      }
    }

    // 3. (Optional) Verify interviewer for all skills up to Level 3
    if (interviewer) {
      const skills = await Skill.find();
      for (const skill of skills) {
        let verification = await Verification.findOne({ userId: interviewer._id, skillId: skill._id });
        if (!verification) {
          await Verification.create({
            userId: interviewer._id,
            skillId: skill._id,
            levelData: [
              { level: "choice", status: "completed", verifiedAt: new Date(), choice: { questions: [], score: 100 } },
              { level: "p2p_interview", status: "completed", verifiedAt: new Date(), verifiedBy: interviewer._id },
              { level: "interview", status: "completed", verifiedAt: new Date(), verifiedBy: interviewer._id }
            ]
          });
        }
      }
      console.log("Ensured interviewer is fully verified for all skills.");
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
