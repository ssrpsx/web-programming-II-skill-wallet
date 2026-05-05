import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../lib/auth";

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

  // Attach userId to request object
  (req as any).userId = decoded.userId;
  next();
};
