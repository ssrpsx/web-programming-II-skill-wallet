import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../lib/auth";
import { User } from "../lib/schema";

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Fetch full user from database to check roles
  User.findById(decoded.userId)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Attach user to request object
      (req as any).user = user;
      (req as any).userId = decoded.userId;
      next();
    })
    .catch((err) => {
      return res.status(500).json({ error: "Server error during authentication" });
    });
};
