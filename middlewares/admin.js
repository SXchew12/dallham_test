const { verify } = require("jsonwebtoken");
const prisma = require("../database/prisma");

module.exports = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        msg: "No token found"
      });
    }

    // Verify Bearer token format
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token format"
      });
    }

    // Verify token
    const decoded = verify(token, process.env.JWTKEY);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token"
      });
    }

    // Check if admin exists
    const admin = await prisma.admin.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        role: 'admin'
      }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized access"
      });
    }

    req.decode = decoded;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(401).json({
      success: false,
      msg: "Authentication failed",
      error: err.message
    });
  }
};