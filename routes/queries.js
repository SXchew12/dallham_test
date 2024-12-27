const queriesMysql = [
  {
    run: `CREATE TABLE user (id INT AUTO_INCREMENT PRIMARY KEY, 
    role VARCHAR(999) DEFAULT 'user',
    uid VARCHAR(999) DEFAULT NULL, 
    name VARCHAR(999) DEFAULT NULL,
    email VARCHAR(999) DEFAULT NULL,
    password VARCHAR(999) DEFAULT NULL,
    mobile VARCHAR(999) DEFAULT NULL,
    timezone VARCHAR(999) DEFAULT 'Asia/Kolkata',
    plan LONGTEXT DEFAULT NULL,
    plan_expire VARCHAR(999) DEFAULT NULL,
    trial INT(1) DEFAULT 0,
    api_key VARCHAR(999) DEFAULT NULL,
    gemini_token VARCHAR(999) DEFAULT 0,
    openai_token VARCHAR(999) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'user'",
  },
  {
    run: `CREATE TABLE admin (id INT AUTO_INCREMENT PRIMARY KEY, 
    role VARCHAR(999) DEFAULT 'admin',
    uid VARCHAR(999) DEFAULT NULL, 
    email VARCHAR(999) DEFAULT NULL, 
    password VARCHAR(999) DEFAULT NULL, 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'admin'",
  },
  {
    run: `CREATE TABLE plan (id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(999) DEFAULT NULL,
    price VARCHAR(999) DEFAULT NULL,
    in_app_chat INT(1) DEFAULT 0,
    image_maker INT(1) DEFAULT 0,
    code_writer INT(1) DEFAULT 0,
    speech_to_text INT(1) DEFAULT 0,
    voice_maker INT(1) DEFAULT 0,
    ai_video INT(1) DEFAULT 0,
    validity_days VARCHAR(999) DEFAULT 0,
    gemini_token VARCHAR(999) DEFAULT 0,
    openai_token VARCHAR(999) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'plan'",
  },
  {
    run: `
    CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    payment_mode VARCHAR(999) DEFAULT NULL,
    amount VARCHAR(999) DEFAULT NULL,
    data LONGTEXT DEFAULT NULL,
    s_token VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'orders'",
  },
  {
    run: `
    CREATE TABLE ai_model (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    model_id ARCHAR(999) DEFAULT NULL,
    name VARCHAR(999) DEFAULT NULL,
    icon VARCHAR(999) DEFAULT NULL,
    train_data LONGTEXT DEFAULT NULL,
    openai_model VARCHAR(999) DEFAULT NULL,
    ai_type VARCHAR(999) DEFAULT NULL COMMENT 'Possible values: gemin ai, openai',
    memory BIGINT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'ai_model'",
  },
  {
    run: `
    CREATE TABLE chat (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    title VARCHAR(999) DEFAULT NULL,
    model_id VARCHAR(999) DEFAULT NULL,
    chat_id VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'chat'",
  },
  {
    run: `
    CREATE TABLE api_keys (id INT AUTO_INCREMENT PRIMARY KEY,
    open_ai VARCHAR(999) DEFAULT NULL,
    gemini_ai VARCHAR(999) DEFAULT NULL,
    stable_diffusion VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'api_keys'",
  },
  {
    run: `
    CREATE TABLE ai_image (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    ai_type VARCHAR(999) DEFAULT NULL,
    image_size VARCHAR(999) DEFAULT NULL,
    image_style VARCHAR(999) DEFAULT NULL,
    prompt VARCHAR(999) DEFAULT NULL,
    filename VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'ai_image'",
  },
  {
    run: `
    CREATE TABLE ai_speech (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    type VARCHAR(999) DEFAULT NULL,
    filename VARCHAR(999) DEFAULT NULL,
    output LONGTEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'ai_speech'",
  },
  {
    run: `
    CREATE TABLE ai_voice (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    prompt LONGTEXT DEFAULT NULL,
    voice VARCHAR(999) DEFAULT NULL,
    filename VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'ai_voice'",
  },
  {
    run: `
    CREATE TABLE ai_video (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    audio VARCHAR(999) DEFAULT NULL,
    video VARCHAR(999) DEFAULT NULL,
    caption VARCHAR(999) DEFAULT NULL,
    final_video VARCHAR(999) DEFAULT NULL,
    status VARCHAR(999) DEFAULT NULL,
    state LONGTEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'ai_video'",
  },
  {
    run: `
    CREATE TABLE web_private (id INT AUTO_INCREMENT PRIMARY KEY,
    pay_offline_id VARCHAR(999) DEFAULT NULL,
    pay_offline_key VARCHAR(999) DEFAULT NULL,
    offline_active VARCHAR(999) DEFAULT NULL,
    pay_stripe_id VARCHAR(999) DEFAULT NULL,
    pay_stripe_key VARCHAR(999) DEFAULT NULL,
    stripe_active VARCHAR(999) DEFAULT NULL,
    pay_paystack_id VARCHAR(999) DEFAULT NULL,
    pay_paystack_key VARCHAR(999) DEFAULT NULL,
    paystack_active VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'web_private'",
  },
  {
    run: `
    CREATE TABLE partners (id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'partners'",
  },
  {
    run: `
    CREATE TABLE faq (id INT AUTO_INCREMENT PRIMARY KEY,
    question LONGTEXT DEFAULT NULL,
    answer LONGTEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'faq'",
  },
  {
    run: `
    CREATE TABLE page (id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(999) DEFAULT NULL,
    title VARCHAR(999) DEFAULT NULL,
    image VARCHAR(999) DEFAULT NULL,
    content LONGTEXT DEFAULT NULL,
    permanent INT(1) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'page'",
  },
  {
    run: `
    CREATE TABLE testimonial (id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(999) DEFAULT NULL,
    description LONGTEXT DEFAULT NULL,
    reviewer_name VARCHAR(999) DEFAULT NULL,
    reviewer_position VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'testimonial'",
  },
  {
    run: `
    CREATE TABLE web_public (id INT AUTO_INCREMENT PRIMARY KEY,
    currency_code VARCHAR(999) DEFAULT NULL,
    logo VARCHAR(999) DEFAULT NULL,
    app_name VARCHAR(999) DEFAULT NULL,
    custom_home VARCHAR(999) DEFAULT NULL,
    is_custom_home INT(1) DEFAULT 0,
    meta_description LONGTEXT DEFAULT NULL,
    currency_symbol VARCHAR(999) DEFAULT NULL,
    home_page_tutorial VARCHAR(999) DEFAULT NULL,
    login_header_footer INT(1) DEFAULT 0,
    exchange_rate VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'web_public'",
  },
  {
    run: `
    CREATE TABLE smtp (id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(999) DEFAULT NULL,
    host VARCHAR(999) DEFAULT NULL,
    port VARCHAR(999) DEFAULT NULL,
    password VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'smtp'",
  },
  {
    run: `
    CREATE TABLE embed_chatbot (id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(999) DEFAULT NULL,
    model_id VARCHAR(999) DEFAULT NULL,
    bot_id VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'embed_chatbot'",
  },
  {
    run: `
    CREATE TABLE embed_chats (id INT AUTO_INCREMENT PRIMARY KEY,
    bot_id VARCHAR(999) DEFAULT NULL,
    user_email VARCHAR(999) DEFAULT NULL,
    user_mobile VARCHAR(999) DEFAULT NULL,
    user_name VARCHAR(999) DEFAULT NULL,
    chat_id VARCHAR(999) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'embed_chats'",
  },
  {
    run: `
    CREATE TABLE contact_form (id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(999) DEFAULT NULL,
    name VARCHAR(999) DEFAULT NULL,
    mobile VARCHAR(999) DEFAULT NULL,
    content LONGTEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `,
    check: "SHOW TABLES LIKE 'contact_form'",
  },
];

module.exports = {
  queriesMysql,
};
