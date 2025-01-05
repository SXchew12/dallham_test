const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminValidator = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.json({ msg: "No token found" });
    }

    const decode = jwt.verify(token, process.env.JWTKEY);
    if (!decode) {
      return res.json({ msg: "Invalid token" });
    }

    const admin = await prisma.admin.findFirst({
      where: {
        uid: decode.uid,
        role: 'admin'
      }
    });

    if (!admin) {
      return res.json({ msg: "Admin not found" });
    }

    req.decode = decode;
    next();
  } catch (err) {
    console.error(err);
    res.json({ msg: "Something went wrong", err });
  }
};

module.exports = adminValidator;