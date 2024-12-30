const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const {
  isValidEmail,
  generateAiImage,
  deleteFileIfExists,
  genSpeech,
  genVoice,
  getAllAPIKeys,
  returnOpenText,
  updateUserPlan,
  sendEmail,
} = require("../functions/function.js");
const randomstring = require("randomstring");
const validateUser = require("../middlewares/user.js");
const {
  checkPlan,
  checkImageMaker,
  checkAiSpeech,
  checkAiVoice,
} = require("../middlewares/plan.js");
const Stripe = require("stripe");
const { recoverEmail } = require("../emails/returnEmails.js");
const moment = require("moment");

// signup user
router.post("/signup", async (req, res) => {
  try {
    const { email, name, password, mobile } = req.body;
    let acceptPolicy = true;

    if (!email || !name || !password || !mobile) {
      return res.json({ msg: "Please fill the details", success: false });
    }

    if (!acceptPolicy) {
      return res.json({
        msg: "You did not click on checkbox of Privacy & Terms",
        success: false,
      });
    }

    if (!isValidEmail(email)) {
      return res.json({ msg: "Please enter a valid email", success: false });
    }

    // check if user already has same email
    const findEx = await query(
      `SELECT * FROM user WHERE email = ?`,
      email?.toLowerCase()
    );
    if (findEx.length > 0) {
      return res.json({ msg: "A user already exist with this email" });
    }

    const haspass = await bcrypt.hash(password, 10);
    const uid = randomstring.generate();

    let tunedMobile = mobile?.includes("+") ? mobile : `+${mobile}`;

    await query(
      `INSERT INTO user (name, uid, email, password, mobile) VALUES (?,?,?,?,?)`,
      [name, uid, email?.toLowerCase(), haspass, tunedMobile]
    );

    // const [smtp] = await query(`SELECT * FROM smtp`, []);
    // const getWebPublic = await query(`SELECT * FROM web_public`, []);

    // if (smtp?.email && smtp?.host && smtp?.port && smtp?.password) {
    //   console.log("EMAIL SENDING");
    //   await sendEmail(
    //     smtp?.host,
    //     smtp?.port,
    //     smtp?.email,
    //     smtp?.password,
    //     getWebPublic[0]?.welcome_email_html
    //       ?.replace("{{name}}", name || "")
    //       ?.replace("{{mobile}}", mobile || "")
    //       ?.replace("{{email}}", email?.toLowerCase() || "") || "WELCOME",
    //     smtp?.email,
    //     getWebPublic[0]?.app_name || "App Name",
    //     email?.toLowerCase()
    //   );
    // }

    // if (parseInt(getWebPublic[0]?.auto_trial_active) > 0) {
    //   // getting free plan
    //   const getPlan = await query(
    //     `SELECT * FROM plan WHERE price = ? AND price_crosed = ?`,
    //     [0, 0]
    //   );
    //   if (getPlan.length > 0) {
    //     // setting free plan to user
    //     await updateUserPlan(getPlan[0], uid);
    //   }
    // }

    res.json({ msg: "Signup Success", success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        msg: "Please provide email and password",
      });
    }

    // check for user
    const userFind = await query(`SELECT * FROM user WHERE email = ?`, [
      email?.toLowerCase(),
    ]);
    if (userFind.length < 1) {
      return res.json({ msg: "Invalid credentials" });
    }

    const compare = await bcrypt.compare(password, userFind[0].password);

    if (!compare) {
      return res.json({ msg: "Invalid credentials" });
    } else {
      const token = sign(
        {
          uid: userFind[0].uid,
          role: "user",
          password: userFind[0].password,
          email: userFind[0].email,
        },
        process.env.JWTKEY,
        {}
      );
      res.json({
        success: true,
        token,
      });
    }
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// adding new model
router.post("/add_model", validateUser, async (req, res) => {
  try {
    const { model_id, name, icon, train_data, openai_model, ai_type, memory } =
      req.body;

    if (!model_id || !name || !train_data || !ai_type || !memory) {
      return res.json({
        msg: "Please fill the details",
      });
    }

    if (ai_type === "OPENAI" && !openai_model) {
      return res.json({ msg: "Please select a model for openai" });
    }

    if (!icon) {
      return res.json({
        msg: "Please upload a banner",
      });
    }

    // checking existing id
    const getExisting = await query(
      `SELECT * FROM ai_model WHERE uid = ? AND model_id = ?`,
      [req.decode.uid, model_id]
    );

    if (getExisting?.length > 0) {
      return res.json({
        msg: "Duplicate model id found",
      });
    }

    await query(
      `INSERT INTO ai_model (model_id, uid, name, icon, train_data, openai_model, ai_type, memory) VALUES (?,?,?,?,?,?,?,?)`,
      [
        model_id,
        req.decode.uid,
        name,
        icon,
        train_data,
        openai_model,
        ai_type,
        memory,
      ]
    );

    res.json({
      success: true,
      msg: "Model was added",
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// get all models
router.get("/get_ai_models", validateUser, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM ai_model WHERE uid = ?`, [
      req.decode.uid,
    ]);

    res.json({
      data,
      success: true,
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// del the ai model
router.post("/del_model", validateUser, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM ai_model WHERE id = ?`, [id]);

    res.json({
      success: true,
      msg: "Model was deleted",
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// generate image
router.post(
  "/generate_ai_image",
  validateUser,
  checkPlan,
  checkImageMaker,
  async (req, res) => {
    try {
      const { aiType, imgSize, imgStyle, prompt } = req.body;

      if (!aiType || !imgSize || !imgStyle || !prompt) {
        return res.json({
          msg: "Please fill the details",
        });
      }

      const resp = await generateAiImage({
        aiType,
        imgSize,
        imgStyle,
        prompt,
        user: req.user,
      });

      console.log({
        resp,
      });

      res.json(resp);
    } catch (err) {
      res.json({ success: false, msg: "something went wrong", err });
      console.log(err);
    }
  }
);

// get all ai images
router.get("/get_ai_images", validateUser, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM ai_image WHERE uid = ?`, [
      req.decode.uid,
    ]);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// del image
router.post("/del_ai_image", validateUser, async (req, res) => {
  try {
    const { id, filename } = req.body;
    await query(`DELETE FROM ai_image WHERE id = ?`, [id]);
    const filePath = `${__dirname}/../client/public/media/${filename}`;
    deleteFileIfExists(filePath);

    res.json({
      success: true,
      msg: "Image was deleted",
    });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// generate ai audio
router.post(
  "/generate_speech",
  validateUser,
  checkPlan,
  checkAiSpeech,
  async (req, res) => {
    try {
      const { filename, genType } = req.body;

      if (!filename || !genType) {
        return res.json({
          msg: "Please upload an audio file",
        });
      }

      const resp = await genSpeech({
        user: req.user,
        type: genType,
        filename,
      });

      res.json(resp);
    } catch (err) {
      res.json({ success: false, msg: "something went wrong", err });
      console.log(err);
    }
  }
);

// get all speech
router.get("/get_speech", validateUser, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM ai_speech WHERE uid = ?`, [
      req.decode.uid,
    ]);

    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// del speech to text
router.post("/del_speech", validateUser, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM ai_speech WHERE id = ?`, [id]);

    res.json({ success: true, msg: "speech was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// gen voice
router.post(
  "/gen_ai_voice",
  validateUser,
  checkPlan,
  checkAiVoice,
  async (req, res) => {
    try {
      const { prompt, voice } = req.body;

      if (!prompt || !voice) {
        return res.json({ msg: "Please provite prompt" });
      }

      const resp = await genVoice({
        user: req.user,
        prompt,
        voice,
      });

      res.json(resp);
    } catch (err) {
      res.json({ success: false, msg: "something went wrong", err });
      console.log(err);
    }
  }
);

// get all voices
router.get(
  "/get_voice",
  validateUser,
  checkPlan,
  checkAiVoice,
  async (req, res) => {
    try {
      const data = await query(`SELECT * FROM ai_voice WHERE uid = ?`, [
        req.decode.uid,
      ]);

      res.json({ data, success: true });
    } catch (err) {
      res.json({ success: false, msg: "something went wrong", err });
      console.log(err);
    }
  }
);

// del gen voice
router.post("/del_voice", validateUser, checkPlan, async (req, res) => {
  try {
    const { id, filename } = req.body;
    await query(`DELETE FROM ai_voice WHERE id = ?`, [id]);
    const filePath = `${__dirname}/../client/public/speech/${filename}`;
    deleteFileIfExists(filePath);

    res.json({ success: true, msg: "Voice was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// get me
router.get("/get_me", validateUser, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM user WHERE uid = ?`, [
      req.decode.uid,
    ]);
    res.json({ data: data[0], success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// generate text
router.post("/gen_text", validateUser, checkPlan, async (req, res) => {
  try {
    const { que } = req.body;
    const token = parseInt(req.user?.openai_token);
    if (token < 1000) {
      return res.json({ msg: "You need atleast 1000 tokens to use this" });
    }

    const resp = await returnOpenText(que, req.user);
    console.log(resp);
    res.json(resp);
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// update profile
router.post("/update_profile", validateUser, async (req, res) => {
  try {
    const { newPassword, name, mobile, email } = req.body;

    if (!name || !mobile || !email) {
      return res.json({ msg: "Name, Mobile, Email are required fields" });
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      await query(
        `UPDATE user SET name = ?, email = ?, password = ?, mobile = ?WHERE uid = ?`,
        [name, email, hash, mobile, req.decode.uid]
      );
    } else {
      await query(
        `UPDATE user SET name = ?, email = ?, mobile = ?WHERE uid = ?`,
        [name, email, mobile, req.decode.uid]
      );
    }

    res.json({ success: true, msg: "Profile was updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// get plan detail
router.post("/get_plan_details", validateUser, async (req, res) => {
  try {
    const { id } = req.body;

    const data = await query(`SELECT * FROM plan WHERE id = ?`, [id]);
    if (data.length < 1) {
      return res.json({ success: false, data: null });
    } else {
      res.json({ success: true, data: data[0] });
    }
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// get payment gateway
router.get("/get_payment_details", validateUser, async (req, res) => {
  try {
    const resp = await query(`SELECT * FROM web_private`, []);
    let data = resp[0];

    data.pay_stripe_key = "";
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong", err });
    console.log(err);
  }
});

// creating stripe pay session
router.post("/create_stripe_session", validateUser, async (req, res) => {
  try {
    const getWeb = await query(`SELECT * FROM web_private`, []);

    if (
      getWeb.length < 1 ||
      !getWeb[0]?.pay_stripe_key ||
      !getWeb[0]?.pay_stripe_id
    ) {
      return res.json({
        success: false,
        msg: "Opss.. payment keys found not found",
      });
    }

    const stripeKeys = getWeb[0]?.pay_stripe_key;

    const stripeClient = new Stripe(stripeKeys);

    const { planId } = req.body;

    const plan = await query(`SELECT * FROM plan WHERE id = ?`, [planId]);

    if (plan.length < 1) {
      return res.json({ msg: "No plan found with the id" });
    }

    const randomSt = randomstring.generate();
    const orderID = `STRIPE_${randomSt}`;

    await query(
      `INSERT INTO orders (uid, payment_mode, amount, data) VALUES (?,?,?,?)`,
      [req.decode.uid, "STRIPE", plan[0]?.price, orderID]
    );

    const web = await query(`SELECT * FROM web_public`, []);

    const productStripe = [
      {
        price_data: {
          currency: web[0]?.currency_code,
          product_data: {
            name: plan[0]?.title,
            // images:[product.imgdata]
          },
          unit_amount: plan[0]?.price * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: productStripe,
      mode: "payment",
      success_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${plan[0]?.id}`,
      cancel_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${plan[0]?.id}`,
      locale: process.env.STRIPE_LANG || "en",
    });

    await query(`UPDATE orders SET s_token = ? WHERE data = ?`, [
      session?.id,
      orderID,
    ]);

    res.json({ success: true, session: session });
  } catch (err) {
    res.json({ msg: err.toString(), err });
    console.log({ err, msg: JSON.stringify(err), string: err.toString() });
  }
});

function checlStripePayment(orderId) {
  return new Promise(async (resolve) => {
    try {
      const getStripe = await query(`SELECT * FROM web_private`, []);

      const stripeClient = new Stripe(getStripe[0]?.pay_stripe_key);
      const getPay = await stripeClient.checkout.sessions.retrieve(orderId);

      console.log({ status: getPay?.payment_status });

      if (getPay?.payment_status === "paid") {
        resolve({ success: true, data: getPay });
      } else {
        resolve({ success: false });
      }
    } catch (err) {
      resolve({ success: false, data: {} });
    }
  });
}

function returnHtmlRes(msg) {
  const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta http-equiv="refresh" content="5;url=${process.env.FRONTENDURI}/user">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          margin: 0;
          padding: 0;
        }

        .container {
          background-color: #ffffff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin: 100px auto;
          padding: 20px;
          width: 300px;
        }

        p {
          font-size: 18px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>${msg}</p>
      </div>
    </body>
    </html>
    `;
  return html;
}

router.get("/stripe_payment", async (req, res) => {
  try {
    console.log("HEY");
    const { order, plan } = req.query;

    if (!order || !plan) {
      return res.send("INVALID REQUEST");
    }

    const getOrder = await query(`SELECT * FROM orders WHERE data = ?`, [
      order || "",
    ]);
    const getPlan = await query(`SELECT * FROM plan WHERE id = ?`, [plan]);

    if (getOrder.length < 1) {
      return res.send("Invalid payment found");
    }

    if (getPlan.length < 1) {
      return res.send("Invalid plan found");
    }

    const checkPayment = await checlStripePayment(getOrder[0]?.s_token);
    console.log({ checkPayment: checkPayment });

    if (checkPayment.success) {
      res.send(returnHtmlRes("Payment Success! Redirecting..."));

      await query(`UPDATE orders SET data = ? WHERE data = ?`, [
        JSON.stringify(checkPayment?.data),
        order,
      ]);

      await updateUserPlan(getOrder[0]?.uid, getPlan[0]);
    } else {
      res.send(
        "Payment Failed! If the balance was deducted please contact to the HamWiz support. Redirecting..."
      );
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// pay with paystack
router.post("/pay_with_paystack", validateUser, async (req, res) => {
  try {
    const { planData, trans_id, reference } = req.body;

    if (!planData || !trans_id) {
      return res.json({
        msg: "Order id and plan required",
      });
    }

    // getting plan
    const plan = await query(`SELECT * FROM plan WHERE id = ?`, [planData.id]);

    if (plan.length < 1) {
      return res.json({ msg: "Sorry this plan was not found" });
    }

    // gettings paystack keys
    const getWebPrivate = await query(`SELECT * FROM web_private`, []);
    const paystackSecretKey = getWebPrivate[0]?.pay_paystack_key;
    const paystackId = getWebPrivate[0]?.pay_paystack_id;

    if (!paystackSecretKey || !paystackId) {
      return res.json({ msg: "Paystack credentials not found" });
    }

    var response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const resp = await response.json();

    if (resp.data?.status !== "success") {
      res.json({ success: false, msg: `${resp.message} - Ref:-${reference}` });
      return;
    }

    await query(
      `INSERT INTO orders (uid, payment_mode, amount, data) VALUES (?,?,?,?)`,
      [req.decode.uid, "PAYSTACK", plan[0]?.price, reference]
    );

    await updateUserPlan(req.decode.uid, plan[0]);

    res.json({
      success: true,
      msg: "Payment success! Redirecting...",
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// send recover
router.post("/send_resovery", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.json({ msg: "Please enter a valid email" });
    }

    const checkEmailValid = await query(`SELECT * FROM user WHERE email = ?`, [
      email,
    ]);
    if (checkEmailValid.length < 1) {
      return res.json({
        success: true,
        msg: "We have sent a recovery link if this email is associated with user account.",
      });
    }

    const getWeb = await query(`SELECT * FROM web_public`, []);
    const appName = getWeb[0]?.app_name;

    const jsontoken = sign(
      {
        old_email: email,
        email: email,
        time: moment(new Date()),
        password: checkEmailValid[0]?.password,
        role: "user",
      },
      process.env.JWTKEY,
      {}
    );

    console.log({
      jsontoken,
    });

    const recpveryUrl = `${process.env.FRONTENDURI}/recovery-user?token=${jsontoken}`;

    const getHtml = recoverEmail(appName, recpveryUrl);

    // getting smtp
    const smtp = await query(`SELECT * FROM smtp`, []);
    if (
      !smtp[0]?.email ||
      !smtp[0]?.host ||
      !smtp[0]?.port ||
      !smtp[0]?.password
    ) {
      return res.json({
        success: false,
        msg: "SMTP connections not found! Unable to send recovery link",
      });
    }

    const respp = await sendEmail(
      smtp[0]?.host,
      smtp[0]?.port,
      smtp[0]?.email,
      smtp[0]?.password,
      getHtml,
      `${appName} - Password Recovery`,
      smtp[0]?.email,
      email
    );

    res.json({
      success: respp.success,
      msg: respp.success
        ? "We have sent your a password recovery link. Please check your email"
        : respp?.err,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// get dashboard
router.get("/get_dash", validateUser, async (req, res) => {
  try {
    const getMoel = await query(`SELECT * FROM ai_model WHERE uid = ?`, [
      req.decode.uid,
    ]);
    const getAiChat = await query(`SELECT * FROM chat WHERE uid = ?`, [
      req.decode.uid,
    ]);
    const getAiImages = await query(`SELECT * FROM ai_image WHERE uid = ?`, [
      req.decode.uid,
    ]);
    const getAiSpeech = await query(`SELECT * FROM ai_speech WHERE uid = ?`, [
      req.decode.uid,
    ]);
    const getAiVoice = await query(`SELECT * FROM ai_voice WHERE uid = ?`, [
      req.decode.uid,
    ]);
    const getAiVideo = await query(`SELECT * FROM ai_video WHERE uid = ?`, [
      req.decode.uid,
    ]);

    res.json({
      success: true,
      model: getMoel?.length,
      chat: getAiChat?.length,
      image: getAiImages?.length,
      speech: getAiSpeech?.length,
      voice: getAiVoice?.length,
      video: getAiVideo?.length,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

module.exports = router;
