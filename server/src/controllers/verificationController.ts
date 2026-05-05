import type { Request, Response } from "express";
import { Verification, Skill, User } from "../lib/schema";
import { createVerificationSchema, updateVerificationSchema, submitAnswersSchema, completeLevelSchema, verificationLevels, validateData } from "../lib/validation";
import { generateMockQuestions } from "../lib/mockQuestions";

export const createVerification = async (req: Request, res: Response) => {
  try {
    const result = validateData(createVerificationSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const data = result.data as any;
    let skillId = data.skillId;

    // Validate or Find/Create skill
    if (!skillId && data.skillTitle) {
      let skill = await Skill.findOne({ title: data.skillTitle });
      if (!skill) {
        skill = await Skill.create({
          title: data.skillTitle,
          category: "General", // Default category
          description: `Auto-created skill for ${data.skillTitle}`,
        });
      }
      skillId = skill._id;
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    const verification = await Verification.create({
      userId: data.userId,
      skillId: skillId,
      levelData: data.levelData || [],
    });

    // Auto-generate choice level with mock questions
    const mockQuestions = generateMockQuestions(skill.title);
    verification.levelData.push({
      level: "choice",
      status: "pending",
      choice: { questions: mockQuestions },
    });

    await verification.save();
    res.status(201).json(verification);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create verification";
    res.status(500).json({ error: message });
  }
};

export const getAllVerifications = async (req: Request, res: Response) => {
  try {
    const verifications = await Verification.find()
      .populate("userId")
      .populate("skillId")
      .populate("levelData.verifiedBy");
    res.json(verifications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch verifications";
    res.status(500).json({ error: message });
  }
};

export const getVerificationById = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.findById(req.params.id)
      .populate("userId")
      .populate("skillId")
      .populate("levelData.verifiedBy");
    if (!verification) return res.status(404).json({ error: "Verification not found" });
    res.json(verification);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch verification";
    res.status(500).json({ error: message });
  }
};

export const updateVerification = async (req: Request, res: Response) => {
  try {
    const result = validateData(updateVerificationSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const verification = await Verification.findByIdAndUpdate(req.params.id, result.data as any, { new: true })
      .populate("userId")
      .populate("skillId");
    if (!verification) return res.status(404).json({ error: "Verification not found" });
    res.json(verification);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update verification";
    res.status(500).json({ error: message });
  }
};

export const deleteVerification = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.findByIdAndDelete(req.params.id);
    if (!verification) return res.status(404).json({ error: "Verification not found" });
    res.json({ message: "Verification deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete verification";
    res.status(500).json({ error: message });
  }
};

export const submitAnswers = async (req: Request, res: Response) => {
  try {
    const result = validateData(submitAnswersSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    // Find choice level
    const choiceLevel = verification.levelData.find((level) => level.level === "choice");
    if (!choiceLevel) {
      return res.status(400).json({ error: "No choice level found on this verification" });
    }

    if (choiceLevel.status !== "pending") {
      return res.status(400).json({ error: `Choice level is not pending (status: ${choiceLevel.status})` });
    }

    const answers = (result.data as any).answers;
    const questions = choiceLevel.choice?.questions || [];

    if (answers.length !== questions.length) {
      return res.status(400).json({ error: `Expected ${questions.length} answers, got ${answers.length}` });
    }

    // Calculate score
    const correct = answers.filter((ans: string, i: number) => ans === questions[i].answer).length;
    const score = (correct / questions.length) * 100;

    // Update choice level with answers and score (inside the choice object)
    if (!choiceLevel.choice) {
      choiceLevel.choice = { questions };
    }
    choiceLevel.choice.userAnswers = answers;
    choiceLevel.choice.score = score;

    // Determine pass/fail and auto-create next level
    if (score >= 80) {
      choiceLevel.status = "completed";

      // TASK 9: สุ่ม user ที่ verify สกิลนั้นแล้ว 2 คน
      // Mocking the random selection logic
      const verifiedUsers = await Verification.find({
        skillId: verification.skillId,
        "levelData.level": "interview",
        "levelData.status": "completed"
      });
      
      const scheduledTime = new Date();
      scheduledTime.setDate(scheduledTime.getDate() + 1); // schedule for tomorrow

      const p2pRooms = [
        process.env.DISCORD_P2P_ROOM_1,
        process.env.DISCORD_P2P_ROOM_2,
        process.env.DISCORD_P2P_ROOM_3
      ].filter(Boolean);
      
      
      const selectedRoom = p2pRooms[Math.floor(Math.random() * p2pRooms.length)] || process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection";

      verification.levelData.push({
        level: "p2p_interview",
        status: "pending",
        link: selectedRoom,
      });

      console.log(`[EMAIL MOCK - P2P] สุ่มเลือก User 2 คนที่ผ่านสกิลนี้แล้ว`);
      console.log(`[EMAIL MOCK - P2P] ส่งอีเมลแจ้งเตือน P2P Review ในวันที่ ${scheduledTime.toLocaleString()}`);
      console.log(`[EMAIL MOCK - P2P] ลิ้งก์ Discord ห้องที่ว่าง: ${selectedRoom}`);

      await verification.save();
      return res.status(200).json({
        passed: true,
        score,
        message: "Level 1 passed! p2p_interview level created.",
        verification,
      });
    } else {
      choiceLevel.status = "failed";
      choiceLevel.verifiedAt = new Date();
      await verification.save();
      return res.status(200).json({
        passed: false,
        score,
        message: "Score too low. Retry to reset.",
        verification,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit answers";
    res.status(500).json({ error: message });
  }
};

export const completeLevel = async (req: Request, res: Response) => {
  try {
    // Validate level param
    if (!(verificationLevels as readonly string[]).includes(req.params.level)) {
      return res.status(400).json({ error: "Invalid verification level" });
    }

    // Cannot complete choice via this endpoint
    if (req.params.level === "choice") {
      return res.status(400).json({ error: "Cannot complete choice level via this endpoint. Use /submit instead." });
    }

    const result = validateData(completeLevelSchema, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    // Find level entry
    const levelEntry = verification.levelData.find((level) => level.level === req.params.level);
    if (!levelEntry) {
      return res.status(404).json({ error: `Level '${req.params.level}' not found on this verification` });
    }

    if (levelEntry.status !== "pending") {
      return res.status(409).json({ error: `Level '${req.params.level}' is not pending (status: ${levelEntry.status})` });
    }

    // Update status and metadata
    const data = result.data as any;
    levelEntry.status = data.status;
    levelEntry.verifiedAt = new Date();
    if (data.verifiedBy) {
      levelEntry.verifiedBy = data.verifiedBy as any;
    }

    // Auto-create next level ONLY IF completed
    if (data.status === "completed") {
      if (req.params.level === "p2p_interview") {
        // Create the interview level entry. The specific interviewer will be assigned via initiateInterview
        const interviewRooms = [
          process.env.DISCORD_INTERVIEW_ROOM_1,
          process.env.DISCORD_INTERVIEW_ROOM_2,
          process.env.DISCORD_INTERVIEW_ROOM_3
        ].filter(Boolean);

        const selectedRoom = interviewRooms[Math.floor(Math.random() * interviewRooms.length)] || process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection";

        verification.levelData.push({
          level: "interview",
          status: "pending",
          link: selectedRoom,
        });

        console.log(`[INTERVIEW] Level created. User needs to initiate interview to be assigned a ranked interviewer.`);
      }
    }

    await verification.save();
    res.status(200).json(verification);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete level";
    res.status(500).json({ error: message });
  }
};

export const initiateP2P = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.findById(req.params.id).populate("skillId").populate("userId");
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    let p2pLevel = verification.levelData.find(l => l.level === "p2p_interview");
    
    // Cooldown check for P2P (2 days)
    if (p2pLevel && p2pLevel.status === "failed" && p2pLevel.verifiedAt) {
      const lastFailedAt = new Date(p2pLevel.verifiedAt).getTime();
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - lastFailedAt < twoDays) {
        const remainingMs = twoDays - (now - lastFailedAt);
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return res.status(403).json({ 
          error: `Cooldown active. Please wait ${remainingHours} more hours before retrying P2P.` 
        });
      }
    }

    const skill = verification.skillId as any;
    const user = verification.userId as any;

    if (!skill || !user) {
      return res.status(400).json({ error: "Verification is missing skill or user data" });
    }

    const skillId = skill._id;
    const currentUserId = user._id;

    // Find users who have completed 'p2p_interview' or 'interview' level for this skill
    // and exclude those with role 'interviewer' (they only do final interviews)
    const potentialPeerVerifications = await Verification.find({
      skillId: skillId,
      userId: { $ne: currentUserId },
      "levelData": {
        $elemMatch: {
          level: { $in: ["p2p_interview", "interview"] },
          status: "completed"
        }
      }
    }).populate({
      path: "userId",
      match: { role: "user" } // Only include users, not interviewers
    });

    // Filter out verifications where the populated userId is null (didn't match role 'user')
    const potentialPeers = potentialPeerVerifications.filter(v => v.userId !== null);

    if (potentialPeers.length === 0) {
      return res.status(400).json({ error: "No verified peers found for this skill. At least one other user must pass Level 1 to be a peer." });
    }

    // Randomly select 1 peer
    const randomPeerVerification = potentialPeers[Math.floor(Math.random() * potentialPeers.length)];
    const peer = randomPeerVerification.userId as any;

    if (!peer) {
      return res.status(400).json({ error: "Failed to identify a peer user." });
    }

    // Select a random P2P room from env
    const p2pRooms = [
      process.env.DISCORD_P2P_ROOM_1,
      process.env.DISCORD_P2P_ROOM_2,
      process.env.DISCORD_P2P_ROOM_3
    ].filter(Boolean);
    
    const selectedRoom = p2pRooms[Math.floor(Math.random() * p2pRooms.length)] || process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection";

    // Find or update the P2P level
    if (!p2pLevel) {
       p2pLevel = {
         level: "p2p_interview",
         status: "pending",
       } as any;
       verification.levelData.push(p2pLevel!);
       p2pLevel = verification.levelData[verification.levelData.length - 1];
    }
    
    p2pLevel!.verifiedBy = peer._id;
    p2pLevel!.link = selectedRoom;
    p2pLevel!.status = "pending"; // Ensure it's pending

    await verification.save();

    // Mock Email sending
    console.log(`[P2P] Peer assigned: ${peer.email} for verification ${verification._id}`);

    res.json({
      message: "P2P initiated successfully",
      peerName: peer.name,
      verification
    });
  } catch (error: unknown) {
    console.error("Error in initiateP2P:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate P2P";
    res.status(500).json({ error: message });
  }
};

export const initiateInterview = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.findById(req.params.id).populate("skillId").populate("userId");
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    // Find the interview level
    let interviewLevel = verification.levelData.find(l => l.level === "interview");
    if (!interviewLevel) {
      return res.status(400).json({ error: "Interview level not found. Must pass P2P first." });
    }

    // Cooldown check for interview (3 days)
    if (interviewLevel.status === "failed" && interviewLevel.verifiedAt) {
      const lastFailedAt = new Date(interviewLevel.verifiedAt).getTime();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - lastFailedAt < threeDays) {
        const remainingMs = threeDays - (now - lastFailedAt);
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return res.status(403).json({ 
          error: `Cooldown active. Please wait ${remainingHours} more hours before retrying the interview.` 
        });
      }
    }

    // Find available interviewers with rank
    const availableInterviewers = await User.find({
      role: "interviewer",
      rank: { $ne: "", $exists: true }
    });

    if (availableInterviewers.length === 0) {
      return res.status(400).json({ error: "No ranked interviewers found. Please contact support." });
    }

    // Randomly select 1 interviewer
    const randomInterviewer = availableInterviewers[Math.floor(Math.random() * availableInterviewers.length)];

    // Select a random room
    const interviewRooms = [
      process.env.DISCORD_INTERVIEW_ROOM_1,
      process.env.DISCORD_INTERVIEW_ROOM_2,
      process.env.DISCORD_INTERVIEW_ROOM_3
    ].filter(Boolean);
    
    const selectedRoom = interviewRooms[Math.floor(Math.random() * interviewRooms.length)] || process.env.DISCORD_JOIN_LINK || "https://discord.gg/skillcollection";

    interviewLevel.verifiedBy = randomInterviewer._id;
    interviewLevel.link = selectedRoom;
    interviewLevel.status = "pending"; 

    await verification.save();

    console.log(`[INTERVIEW] Assigned ${randomInterviewer.name} (${randomInterviewer.rank}) to verification ${verification._id}`);

    res.json({
      message: "Interview initiated successfully. Please coordinate with the interviewer on Discord.",
      interviewerName: randomInterviewer.name,
      interviewerRank: randomInterviewer.rank,
      verification
    });
  } catch (error: unknown) {
    console.error("Error in initiateInterview:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate Interview";
    res.status(500).json({ error: message });
  }
};

export const retryChoice = async (req: Request, res: Response) => {
  try {
    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    // Find choice level
    const choiceLevel = verification.levelData.find((level) => level.level === "choice");
    if (!choiceLevel) {
      return res.status(400).json({ error: "No choice level found on this verification" });
    }

    if (choiceLevel.status !== "failed") {
      return res.status(409).json({ error: `Choice level is not failed (status: ${choiceLevel.status})` });
    }

    // Cooldown check (24 hours for Choice)
    if (choiceLevel.verifiedAt) {
      const lastFailedAt = new Date(choiceLevel.verifiedAt).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      if (now - lastFailedAt < oneDay) {
        const remainingMs = oneDay - (now - lastFailedAt);
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return res.status(403).json({ 
          error: `Cooldown active. Please wait ${remainingHours} more hours before retrying the test.` 
        });
      }
    }

    // Get skill to regenerate questions
    const skill = await Skill.findById(verification.skillId);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    // Reset choice level with fresh questions
    const mockQuestions = generateMockQuestions(skill.title);
    choiceLevel.status = "pending";
    choiceLevel.choice = { questions: mockQuestions };

    // Remove any levels beyond choice (user starts over)
    verification.levelData = verification.levelData.filter((level) => level.level === "choice");

    await verification.save();
    res.status(200).json(verification);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retry choice";
    res.status(500).json({ error: message });
  }
};

