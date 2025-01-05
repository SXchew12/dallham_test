const router = require("express").Router();
const randomstring = require("randomstring");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminValidator = require("../middlewares/admin.js");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  updateUserPlan,
  addOrder,
  getFileExtension,
  sendEmail,
} = require("../functions/function.js");

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        msg: "Email and password are required",
      });
    }

    // Find admin by email using Prisma
    const admin = await prisma.admin.findFirst({
      where: {
        email: email
      }
    });

    if (!admin) {
      return res.json({
        success: false,
        msg: "No admin account found with this email",
      });
    }

    // Compare password
    const compare = await bcrypt.compare(password, admin.password);
    if (!compare) {
      return res.json({
        success: false,
        msg: "Invalid password",
      });
    }

    // Generate JWT token
    const token = sign(
      {
        uid: admin.uid,
        role: admin.role,
      },
      process.env.JWTKEY
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      admin: {
        uid: admin.uid,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.json({ success: false, msg: "server error", error: err.message });
  }
});

// Get admin profile
router.get("/profile", adminValidator, async (req, res) => {
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        uid: req.decode.uid
      }
    });

    if (!admin) {
      return res.json({ success: false, msg: "Admin not found" });
    }

    res.json({
      success: true,
      admin: {
        uid: admin.uid,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update admin profile
router.post("/update_profile", adminValidator, async (req, res) => {
  try {
    const { newPassword, email } = req.body;

    if (!email) {
      return res.json({ success: false, msg: "Email is required" });
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { uid: req.decode.uid },
        data: {
          email: email,
          password: hash
        }
      });
    } else {
      await prisma.admin.update({
        where: { uid: req.decode.uid },
        data: {
          email: email
        }
      });
    }

    res.json({ success: true, msg: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

module.exports = router;
