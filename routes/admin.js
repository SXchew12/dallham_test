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

    const admin = await prisma.admin.findFirst({
      where: { email }
    });

    if (!admin) {
      return res.json({
        success: false,
        msg: "Invalid credentials"
      });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.json({
        success: false,
        msg: "Invalid credentials"
      });
    }

    const token = sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        uid: admin.uid
      },
      process.env.JWTKEY,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          uid: admin.uid
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      msg: "Server error",
      error: err.message
    });
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

// Get all users
router.get("/get_users", adminValidator, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Delete user
router.post("/delete_user", adminValidator, async (req, res) => {
  try {
    const { uid } = req.body;
    
    await prisma.user.deleteMany({
      where: {
        uid: uid
      }
    });

    res.json({
      success: true,
      msg: "User deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update user plan
router.post("/update_user_plan", adminValidator, async (req, res) => {
  try {
    const { uid, plan_data } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        uid: uid
      }
    });

    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }

    await prisma.user.update({
      where: {
        uid: uid
      },
      data: {
        plan: JSON.stringify(plan_data),
        plan_expire: plan_data.plan_expire || null,
        trial: plan_data.trial || 0,
        gemini_token: plan_data.gemini_token || "0",
        openai_token: plan_data.openai_token || "0"
      }
    });

    res.json({
      success: true,
      msg: "Plan updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Get API keys
router.get("/get_api_keys", adminValidator, async (req, res) => {
  try {
    const keys = await prisma.apiKeys.findFirst();
    
    res.json({
      success: true,
      data: keys
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update API keys
router.post("/update_api_keys", adminValidator, async (req, res) => {
  try {
    const { open_ai, gemini_ai, stable_diffusion } = req.body;

    await prisma.apiKeys.updateMany({
      data: {
        open_ai: open_ai,
        gemini_ai: gemini_ai,
        stable_diffusion: stable_diffusion
      }
    });

    res.json({
      success: true,
      msg: "API keys updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Get web settings
router.get("/get_web_settings", adminValidator, async (req, res) => {
  try {
    const [webPublic, webPrivate] = await Promise.all([
      prisma.webPublic.findFirst(),
      prisma.webPrivate.findFirst()
    ]);

    res.json({
      success: true,
      data: {
        public: webPublic,
        private: webPrivate
      }
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update web settings
router.post("/update_web_settings", adminValidator, async (req, res) => {
  try {
    const { public_data, private_data } = req.body;

    await Promise.all([
      prisma.webPublic.updateMany({
        data: public_data
      }),
      prisma.webPrivate.updateMany({
        data: private_data
      })
    ]);

    res.json({
      success: true,
      msg: "Web settings updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

module.exports = router;
