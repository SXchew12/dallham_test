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

// Get all brands/partners
router.get("/get_brands", adminValidator, async (req, res) => {
  try {
    const partners = await prisma.partners.findMany();
    res.json({ data: partners, success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Add partner logo
router.post("/add_brand_image", adminValidator, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({ success: false, msg: "No files were uploaded" });
    }

    const randomStr = randomstring.generate();
    const file = req.files.file;
    const filename = `${randomStr}.${getFileExtension(file.name)}`;

    file.mv(`${__dirname}/../client/public/media/${filename}`, async (err) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, error: err });
      }

      await prisma.partners.create({
        data: { filename }
      });

      res.json({ success: true, msg: "Logo was uploaded" });
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Delete brand logo
router.post("/del_brand_logo", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.partners.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, msg: "Brand was deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// FAQ Routes
router.get("/get_faq", async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany();
    res.json({ data: faqs, success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

router.post("/add_faq", adminValidator, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.json({
        success: false,
        msg: "Please provide question and answer both"
      });
    }

    await prisma.faq.create({
      data: { question, answer }
    });

    res.json({ success: true, msg: "FAQ was added" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

router.post("/del_faq", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.faq.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, msg: "FAQ was deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Dashboard Stats
router.get("/get_dash", adminValidator, async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const [
      allUsers,
      newUsers,
      monthlyOrders,
      totalChats,
      totalImages,
      totalVideos,
      totalLeads,
      totalVoice,
      totalModel
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      }),
      prisma.orders.findMany({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        select: { amount: true }
      }),
      prisma.chat.count(),
      prisma.aiImage.count(),
      prisma.aiVideo.count(),
      prisma.contactForm.count(),
      prisma.aiVoice.count(),
      prisma.aiModel.count()
    ]);

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => 
      sum + (parseFloat(order.amount) || 0), 0);

    res.json({
      success: true,
      users: allUsers,
      userThis: newUsers,
      orders: monthlyRevenue,
      chat: totalChats,
      image: totalImages,
      video: totalVideos,
      lead: totalLeads,
      voice: totalVoice,
      model: totalModel
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// SMTP Routes
router.get("/get_smtp", adminValidator, async (req, res) => {
  try {
    const smtp = await prisma.smtp.findFirst();
    res.json({ 
      success: true, 
      data: smtp || { id: "ID" }
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

router.post("/update_smtp", adminValidator, async (req, res) => {
  try {
    const { email, port, password, host } = req.body;

    if (!email || !port || !password || !host) {
      return res.json({ success: false, msg: "Please fill all fields" });
    }

    await prisma.smtp.upsert({
      where: { id: 1 },
      update: {
        host,
        port,
        user: email,
        pass: password
      },
      create: {
        host,
        port,
        user: email,
        pass: password
      }
    });

    res.json({ success: true, msg: "Email settings updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Contact Form Routes
router.get("/get_contact_leads", adminValidator, async (req, res) => {
  try {
    const leads = await prisma.contactForm.findMany();
    res.json({ success: true, data: leads });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

router.post("/del_contact_entry", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.contactForm.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, msg: "Entry was deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Get all pages
router.get("/get_pages", adminValidator, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: {
        permanent: 0
      }
    });
    res.json({ data: pages, success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Delete page
router.post("/del_page", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.page.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, msg: "Page was deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Get page by slug
router.post("/get_page_slug", async (req, res) => {
  try {
    const { slug } = req.body;
    const page = await prisma.page.findFirst({
      where: { slug }
    });

    res.json({
      success: true,
      data: page || {},
      page: !!page
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update terms and conditions
router.post("/update_terms", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    await prisma.page.upsert({
      where: {
        slug: "terms-and-conditions"
      },
      update: {
        title,
        content
      },
      create: {
        slug: "terms-and-conditions",
        title,
        content,
        permanent: 1
      }
    });

    res.json({ success: true, msg: "Terms and conditions updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update privacy policy
router.post("/update_privacy_policy", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    await prisma.page.upsert({
      where: {
        slug: "privacy-policy"
      },
      update: {
        title,
        content
      },
      create: {
        slug: "privacy-policy",
        title,
        content,
        permanent: 1
      }
    });

    res.json({ success: true, msg: "Privacy policy updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Add new page
router.post("/add_page", adminValidator, async (req, res) => {
  try {
    const { title, content, slug } = req.body;

    if (!title || !content || !slug) {
      return res.json({
        success: false,
        msg: "Please provide title, content and slug"
      });
    }

    // Check if slug exists
    const existingPage = await prisma.page.findFirst({
      where: { slug }
    });

    if (existingPage) {
      return res.json({
        success: false,
        msg: "A page with this slug already exists"
      });
    }

    await prisma.page.create({
      data: {
        title,
        content,
        slug,
        permanent: 0
      }
    });

    res.json({ success: true, msg: "Page was created" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update existing page
router.post("/update_page", adminValidator, async (req, res) => {
  try {
    const { id, title, content, slug } = req.body;

    if (!id || !title || !content || !slug) {
      return res.json({
        success: false,
        msg: "Please provide all required fields"
      });
    }

    // Check if slug exists on different page
    const existingPage = await prisma.page.findFirst({
      where: {
        slug,
        NOT: {
          id: parseInt(id)
        }
      }
    });

    if (existingPage) {
      return res.json({
        success: false,
        msg: "A different page with this slug already exists"
      });
    }

    await prisma.page.update({
      where: {
        id: parseInt(id)
      },
      data: {
        title,
        content,
        slug
      }
    });

    res.json({ success: true, msg: "Page was updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Auto login for user
router.post("/auto_login", adminValidator, async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.json({ success: false, msg: "Invalid input" });
    }

    const user = await prisma.user.findFirst({
      where: { uid }
    });

    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }

    const token = sign(
      {
        uid: user.uid,
        role: "user",
        password: user.password,
        email: user.email,
      },
      process.env.JWTKEY,
      {}
    );

    res.json({
      success: true,
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Delete plan
router.post("/del_plan", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.plan.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      msg: "Plan was deleted"
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

// Update user
router.post("/update_user", adminValidator, async (req, res) => {
  try {
    const { newPassword, name, email, mobile, uid } = req.body;

    if (!uid || !name || !email || !mobile) {
      return res.json({
        success: false,
        msg: "You forgot to enter some field(s)",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          uid
        }
      }
    });

    if (existingUser) {
      return res.json({ success: false, msg: "This email is already taken by another user" });
    }

    const updateData = {
      name,
      email,
      mobile
    };

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { uid },
      data: updateData
    });

    res.json({ success: true, msg: "User was updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: "Server error", error: err.message });
  }
});

module.exports = router;
