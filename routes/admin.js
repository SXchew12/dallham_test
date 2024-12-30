const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const randomstring = require("randomstring");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminValidator = require("../middlewares/admin.js");
const {
  updateUserPlan,
  addOrder,
  getFileExtension,
  sendEmail,
} = require("../functions/function.js");

// Mock password comparison for testing
const mockComparePassword = (password) => {
    return password === 'admin123';
};

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        msg: "Please fill email and password",
      });
    }

    const isMockMode = process.env.MOCK_MODE === 'true';
    
    if (isMockMode) {
      // Mock login logic
      if (email === 'admin@example.com' && mockComparePassword(password)) {
        const token = sign(
          {
            uid: 'admin-123',
            role: 'admin',
            email: email,
            password: '$2a$10$mockhashedpassword'
          },
          process.env.JWTKEY,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          token
        });
      }
      return res.json({ 
        success: false, 
        msg: "Invalid credentials" 
      });
    }

    // Real login logic continues...
    const userFind = await query(`SELECT * FROM admin WHERE email = ?`, [email]);
    if (userFind.length < 1) {
      return res.json({ msg: "Invalid credentials found" });
    }

    const compare = await bcrypt.compare(password, userFind[0].password);
    if (!compare) {
      return res.json({ msg: "Invalid credentials" });
    } else {
      const token = sign(
        {
          uid: userFind[0].uid,
          role: "admin",
          password: userFind[0].password,
          email: userFind[0].email,
        },
        process.env.JWTKEY,
        {
          expiresIn: '24h'
        }
      );
      res.json({
        success: true,
        token,
      });
    }
  } catch (err) {
    console.error('Admin login error:', err);
    res.json({ success: false, msg: "something went wrong" });
  }
});

// get all users
router.get("/get_users", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM user`, []);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del a plan
router.post("/del_plan", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM plan WHERE id = ?`, [id]);

    res.json({
      success: true,
      msg: "Plan was deleted",
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// auto user login
router.post("/auto_login", adminValidator, async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.json({ success: false, msg: "Invalid input" });
    }

    const user = await query(`SELECT * FROM user WHERE uid = ?`, [uid]);
    const token = sign(
      {
        uid: user[0].uid,
        role: "user",
        password: user[0].password,
        email: user[0].email,
      },
      process.env.JWTKEY,
      {}
    );
    console.log(token);
    res.json({
      success: true,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// del user
router.post("/del_user", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM user WHERE id = ?`, [id]);
    res.json({ success: true, msg: "User was deletd" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// update user
router.post("/update_user", adminValidator, async (req, res) => {
  try {
    const { newPassword, name, email, mobile, uid } = req.body;

    if (!uid || !name || !email || !mobile) {
      return res.json({
        success: false,
        msg: "You forgot to enter some field(s)",
      });
    }

    const findUserByEmail = await query(`SELECT * FROM user WHERE email = ?`, [
      email,
    ]);
    if (findUserByEmail.length > 0 && findUserByEmail[0].uid !== uid) {
      return res.json({ msg: "This email is already taken by another user" });
    }

    const findUserByUid = await query(`SELECT * FROM user WHERE uid = ?`, [
      uid,
    ]);
    if (findUserByUid.length === 0) {
      return res.json({ msg: "User not found" });
    }

    if (newPassword) {
      const hashpass = await bcrypt.hash(newPassword, 10);

      await query(
        `UPDATE user SET name = ?, email = ?, password = ?, mobile = ? WHERE uid = ?`,
        [name, email, hashpass, mobile, uid]
      );
    } else {
      await query(
        `UPDATE user SET name = ?, email = ?, mobile = ? WHERE uid = ?`,
        [name, email, mobile, uid]
      );
    }

    res.json({ msg: "User was updated", success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// give plan to user
router.post("/update_user_plan", adminValidator, async (req, res) => {
  try {
    const { uid, planId } = req.body;

    const returnThing = await updateUserPlan({
      uid,
      planId,
    });

    if (returnThing?.id) {
      await addOrder({
        uid,
        paymentMode: "OFFLINE",
        amount: returnThing?.price,
        data: JSON.stringify({
          success: true,
          mode: "OFFLINE",
        }),
      });
    }

    res.json({
      success: true,
      msg: "Plan was updated",
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// update payment gateway
router.post("/update_pay_gateway", adminValidator, async (req, res) => {
  try {
    const {
      pay_offline_id,
      pay_offline_key,
      offline_active,
      pay_stripe_id,
      pay_stripe_key,
      stripe_active,
      pay_paystack_id,
      pay_paystack_key,
      paystack_active,
    } = req.body;

    await query(
      `UPDATE web_private SET  
            pay_offline_id = ?, 
            pay_offline_key = ?, 
            offline_active = ?, 
            pay_stripe_id = ?, 
            pay_stripe_key = ?, 
            stripe_active = ?,
            pay_paystack_id = ?,
            pay_paystack_key = ?,
            paystack_active = ?`,
      [
        pay_offline_id,
        pay_offline_key,
        offline_active,
        pay_stripe_id,
        pay_stripe_key,
        stripe_active,
        pay_paystack_id,
        pay_paystack_key,
        parseInt(paystack_active) > 0 ? 1 : 0,
      ]
    );

    res.json({ success: true, msg: "Payment gateway updated" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get payment gateway admin
router.get("/get_payment_gateway_admin", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM web_private`, []);
    if (data.length < 1) {
      return res.json({ data: {}, success: true });
    }
    res.json({ data: data[0], success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all brands
router.get("/get_brands", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM partners`, []);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add partners logo
router.post("/add_brand_image", adminValidator, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({ success: false, msg: "No files were uploaded" });
    }

    const randomString = randomstring.generate();
    const file = req.files.file;

    const filename = `${randomString}.${getFileExtension(file.name)}`;

    file.mv(`${__dirname}/../client/public/media/${filename}`, (err) => {
      if (err) {
        console.log(err);
        return res.json({ err });
      }
    });

    await query(`INSERT INTO partners (filename) VALUES (?)`, [filename]);

    res.json({ success: true, msg: "Logo was uploaded" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del image
router.post("/del_brand_logo", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE from partners WHERE id = ?`, [id]);

    res.json({ success: true, msg: "Bran was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all faq
router.get("/get_faq", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM faq`, []);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add faq
router.post("/add_faq", adminValidator, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!answer || !question) {
      return res.json({
        success: false,
        msg: "Please provide question and answer both",
      });
    }

    await query(`INSERT INTO faq (question, answer) VALUES (?,?)`, [
      question,
      answer,
    ]);

    res.json({ success: true, msg: "Faq was added" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del faq
router.post("/del_faq", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM faq WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Faq was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all pages
router.get("/get_pages", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM page WHERE permanent = ?`, [0]);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del page
router.post("/del_page", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM page WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Page was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get page by slug
router.post("/get_page_slug", async (req, res) => {
  try {
    const { slug } = req.body;

    const data = await query(`SELECT * FROM page WHERE slug = ?`, [slug]);
    if (data.length < 1) {
      return res.json({ data: {}, success: true, page: false });
    } else {
      return res.json({ data: data[0], success: true, page: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});
// update termns
router.post("/update_terms", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    // check
    const getPP = await query(`SELECT * FROM page WHERE slug = ?`, [
      "terms-and-conditions",
    ]);

    if (getPP.length > 0) {
      await query(`UPDATE page SET title = ?, content = ? WHERE slug = ?`, [
        title,
        content,
        "terms-and-conditions",
      ]);
    } else {
      await query(
        `INSERT INTO page (slug, title, content, permanent) VALUES (?,?,?,?)`,
        ["terms-and-conditions", title, content, 1]
      );
    }

    res.json({ success: true, msg: "Page updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// update privacy policy
router.post("/update_privacy_policy", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    // check
    const getPP = await query(`SELECT * FROM page WHERE slug = ?`, [
      "privacy-policy",
    ]);

    if (getPP.length > 0) {
      await query(`UPDATE page SET title = ?, content = ? WHERE slug = ?`, [
        title,
        content,
        "privacy-policy",
      ]);
    } else {
      await query(
        `INSERT INTO page (slug, title, content, permanent) VALUES (?,?,?,?)`,
        ["privacy-policy", title, content, 1]
      );
    }

    res.json({ success: true, msg: "Page updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get all testi
router.get("/get_testi", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM testimonial`, []);
    res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// del testi
router.post("/del_testi", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM testimonial WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Testimonial was deleted" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// ading testtimonial
router.post("/add_testimonial", adminValidator, async (req, res) => {
  try {
    const { title, description, reviewer_name, reviewer_position } = req.body;

    if (!title || !description || !reviewer_name || !reviewer_position) {
      return res.json({ success: false, msg: "Please fill all fields" });
    }

    await query(
      `INSERT INTO testimonial (title, description, reviewer_name, reviewer_position) VALUES (?,?,?,?)`,
      [title, description, reviewer_name, reviewer_position]
    );

    res.json({ success: true, msg: "Testimonial was added" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get smtp
router.get("/get_smtp", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM smtp`, []);
    if (data.length < 1) {
      return res.json({ data: { id: "ID" }, success: true });
    } else {
      return res.json({ data: data[0], success: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// update smtp
router.post("/update_smtp", adminValidator, async (req, res) => {
  try {
    const { email, port, password, host } = req.body;

    if (!email || !port || !password || !host) {
      return res.json({ msg: "Please fill all the fields" });
    }

    const getOne = await query(`SELECT * FROM smtp`, []);
    if (getOne.length < 1) {
      await query(
        `INSERT INTO smtp (email, host, port, password) VALUES (?,?,?,?)`,
        [email, host, port, password]
      );
    } else {
      await query(
        `UPDATE smtp SET email = ?, host = ?, port = ?, password = ?`,
        [email, host, port, password]
      );
    }

    res.json({ success: true, msg: "Email settings was updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// send test email
router.post("/send_test_email", adminValidator, async (req, res) => {
  try {
    const { email, port, password, host, to } = req.body;

    if (!email || !port || !password || !host) {
      return res.json({ msg: "Please fill all the fields" });
    }

    const checkEmail = await sendEmail(
      host,
      port,
      email,
      password,
      `<h1>This is a test SMTP email!</h1>`,
      "SMTP Testing",
      "Testing Sender",
      to
    );

    if (checkEmail.success) {
      res.json({ msg: "Email sent", success: true });
    } else {
      res.json({ msg: checkEmail?.err });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get all contact forms
router.get("/get_contact_leads", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM contact_form`, []);
    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// del contact entry
router.post("/del_cotact_entry", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM contact_form WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Entry was deleted" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

function sumArray(arr) {
  // Check if the array is empty, return 0 if true
  if (arr.length === 0) {
    return 0;
  }

  // Sum the elements of the array
  const sum = arr.reduce((acc, num) => parseInt(acc) + parseInt(num), 0);
  return sum;
}

// get dashboard
router.get("/get_dash", adminValidator, async (req, res) => {
  try {
    const getUsers = await query(`SELECT * FROM user`, []);
    const getUsersThis = await query(
      `
      SELECT * FROM user
      WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `,
      []
    );
    const getOrdersThis = await query(
      `
      SELECT * FROM orders
      WHERE MONTH(createdAt) = MONTH(CURRENT_DATE())
      AND YEAR(createdAt) = YEAR(CURRENT_DATE())
    `,
      []
    );
    const totalEarning = getOrdersThis?.map((i) => i.amount);

    const totalChats = await query(`SELECT * FROM chat`, []);
    const totalImages = await query(`SELECT * FROM ai_image`, []);
    const totalVideos = await query(`SELECT * FROM ai_video`, []);
    const totalLeads = await query(`SELECT * FROM contact_form`, []);
    const totalVoice = await query(`SELECT * FROM ai_voice`, []);
    const totalModel = await query(`SELECT * FROM ai_model`, []);

    res.json({
      success: true,
      users: getUsers?.length,
      userThis: getUsersThis?.length,
      orders: sumArray(totalEarning),
      chat: totalChats?.length,
      image: totalImages?.length,
      video: totalVideos?.length,
      lead: totalLeads?.length,
      voice: totalVoice?.length,
      model: totalModel?.length,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

module.exports = router;
