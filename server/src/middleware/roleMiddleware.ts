import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to restrict access based on user role
 * Assumes authMiddleware has already run and attached `req.user`
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
