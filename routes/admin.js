const router = require("express").Router();
const { query } = require("../database/dbpromise");
const { adminValidator } = require("../middleware/auth");

// Get plans
router.get("/get_plans", adminValidator, async (req, res) => {
    try {
        const plans = await query(`SELECT * FROM plan`);
        res.json({
            success: true,
            plans: plans.map(plan => ({
                id: plan.id,
                name: plan.name,
                price: plan.price,
                in_app_chat: plan.in_app_chat,
                image_maker: plan.image_maker,
                code_writer: plan.code_writer,
                speech_to_text: plan.speech_to_text,
                voice_maker: plan.voice_maker,
                ai_video: plan.ai_video,
                validity_days: plan.validity_days,
                gemini_token: plan.gemini_token,
                openai_token: plan.openai_token
            }))
        });
    } catch (err) {
        console.error('Error getting plans:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get plans" 
        });
    }
});

// Get users
router.get("/get_users", adminValidator, async (req, res) => {
    try {
        const users = await query(`SELECT * FROM user`);
        res.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                plan: user.plan ? JSON.parse(user.plan) : null,
                gemini_token: user.gemini_token,
                openai_token: user.openai_token
            }))
        });
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to get users" 
        });
    }
});

module.exports = router;
