import jwt from "jsonwebtoken";

export function optionalAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
  } catch {
    req.user = null;
  }

  next();
}