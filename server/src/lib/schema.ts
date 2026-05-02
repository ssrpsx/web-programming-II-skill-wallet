import mongoose, { Schema, Document } from "mongoose";

// User Interface
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  photo?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Collection Interface
export interface ICollection extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  skills: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Skill Interface
export interface ISkill extends Document {
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Level Data Interface (for each verification level attempt)
export interface ILevelData {
  level: "choice" | "p2p_interview" | "interview";
  status: "pending" | "completed" | "failed";
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  link?: string; // Discord link for p2p_interview and interview
  choice?: {
    questions: Array<{
      question: string;
      options: string[];
      answer: string;
    }>;
    userAnswers?: string[];
    score?: number;
  };
  userAnswers?: string[];
  score?: number;
  _id?: mongoose.Types.ObjectId;
}

// Verification Interface
export interface IVerification extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  levelData: ILevelData[];
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    photo: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Collection Schema
const collectionSchema = new Schema<ICollection>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
  },
  { timestamps: true }
);

// Skill Schema
const skillSchema = new Schema<ISkill>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
  },
  { timestamps: true }
);

// Level Data Schema
const levelDataSchema = new Schema<ILevelData>(
  {
    level: {
      type: String,
      enum: ["choice", "p2p_interview", "interview"],
      required: [true, "Level is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    link: {
      type: String,
      trim: true,
    },
    choice: {
      questions: [{
        question: String,
        options: [String],
        answer: String,
      }],
      userAnswers: [String],
      score: Number,
    },
  },
  { _id: true, timestamps: false }
);

// Verification Schema
const verificationSchema = new Schema<IVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill ID is required"],
      index: true,
    },
    levelData: {
      type: [levelDataSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Create Models
export const User = mongoose.model<IUser>("User", userSchema);
export const Collection = mongoose.model<ICollection>("Collection", collectionSchema);
export const Skill = mongoose.model<ISkill>("Skill", skillSchema);
export const Verification = mongoose.model<IVerification>("Verification", verificationSchema);
