-- Database: dallham

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

-- Create tables

-- Admin table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    role VARCHAR(255) DEFAULT 'admin',
    uid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    open_ai VARCHAR(255),
    gemini_ai VARCHAR(255),
    stable_diffusion VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User table
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    role VARCHAR(255) DEFAULT 'user',
    uid VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    mobile VARCHAR(255),
    timezone VARCHAR(255) DEFAULT 'UTC',
    plan TEXT,
    plan_expire VARCHAR(255),
    trial INTEGER DEFAULT 0,
    api_key VARCHAR(255),
    gemini_token VARCHAR(255) DEFAULT '0',
    openai_token VARCHAR(255) DEFAULT '0',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plan table
CREATE TABLE plan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price VARCHAR(255) DEFAULT '0',
    in_app_chat INTEGER DEFAULT 0,
    image_maker INTEGER DEFAULT 0,
    code_writer INTEGER DEFAULT 0,
    speech_to_text INTEGER DEFAULT 0,
    voice_maker INTEGER DEFAULT 0,
    ai_video INTEGER DEFAULT 0,
    validity_days VARCHAR(255) DEFAULT '0',
    gemini_token VARCHAR(255) DEFAULT '0',
    openai_token VARCHAR(255) DEFAULT '0',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Image table
CREATE TABLE ai_image (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    ai_type VARCHAR(255),
    image_size VARCHAR(255),
    image_style VARCHAR(255),
    prompt VARCHAR(255),
    filename VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Speech table
CREATE TABLE ai_speech (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    type VARCHAR(255),
    filename VARCHAR(255),
    output VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Voice table
CREATE TABLE ai_voice (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    prompt VARCHAR(255),
    voice VARCHAR(255),
    filename VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Video table
CREATE TABLE ai_video (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    audio VARCHAR(255),
    video VARCHAR(255),
    caption VARCHAR(255),
    final_video VARCHAR(255),
    status VARCHAR(255),
    state TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Web Private table
CREATE TABLE web_private (
    id SERIAL PRIMARY KEY,
    pay_offline_id VARCHAR(255),
    pay_offline_key VARCHAR(255),
    offline_active VARCHAR(255) DEFAULT '0',
    pay_stripe_id VARCHAR(255),
    pay_stripe_key VARCHAR(255),
    stripe_active VARCHAR(255) DEFAULT '0',
    pay_paystack_id VARCHAR(255),
    pay_paystack_key VARCHAR(255),
    paystack_active VARCHAR(255) DEFAULT '0',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Web Public table
CREATE TABLE web_public (
    id SERIAL PRIMARY KEY,
    currency_code VARCHAR(255),
    logo VARCHAR(255),
    app_name VARCHAR(255),
    custom_home VARCHAR(255),
    is_custom_home INTEGER DEFAULT 0,
    meta_description TEXT,
    currency_symbol VARCHAR(255),
    home_page_tutorial VARCHAR(255),
    login_header_footer INTEGER DEFAULT 0,
    exchange_rate VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ table
CREATE TABLE faq (
    id SERIAL PRIMARY KEY,
    question TEXT,
    answer TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Page table
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255),
    title VARCHAR(255),
    image VARCHAR(255),
    content TEXT,
    permanent INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Testimonial table
CREATE TABLE testimonial (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    reviewer_name VARCHAR(255),
    reviewer_position VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Model table
CREATE TABLE ai_model (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    model_name VARCHAR(255),
    prompt TEXT,
    response TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat table
CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    model_name VARCHAR(255),
    prompt TEXT,
    response TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Form table
CREATE TABLE contact_form (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Embed Chatbot table
CREATE TABLE embed_chatbot (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    name VARCHAR(255),
    prompt TEXT,
    response TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Embed Chats table
CREATE TABLE embed_chats (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    chatbot_id VARCHAR(255),
    prompt TEXT,
    response TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255),
    order_id VARCHAR(255),
    plan_id VARCHAR(255),
    payment_id VARCHAR(255),
    price VARCHAR(255),
    currency VARCHAR(255),
    payment_by VARCHAR(255),
    status VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SMTP table
CREATE TABLE smtp (
    id SERIAL PRIMARY KEY,
    host VARCHAR(255),
    port VARCHAR(255),
    user VARCHAR(255),
    pass VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT INTO admin (role, uid, email, password, "createdAt") VALUES
('admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz', 'admin@admin.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', CURRENT_TIMESTAMP);

-- Insert test user with full access plan
INSERT INTO "user" (role, uid, name, email, password, mobile, timezone, plan, plan_expire, trial, gemini_token, openai_token, "createdAt") VALUES
('user', 'testuser123', 'Test User', 'test@test.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', '1234567890', 'UTC', 
'{"id":1,"name":"Full Access","price":"0","in_app_chat":1,"image_maker":1,"code_writer":1,"speech_to_text":1,"voice_maker":1,"ai_video":1,"validity_days":"365","gemini_token":"999999","openai_token":"999999"}',
'1735689600000', 0, '999999', '999999', CURRENT_TIMESTAMP);

-- Insert default plan
INSERT INTO plan (name, price, in_app_chat, image_maker, code_writer, speech_to_text, voice_maker, ai_video, validity_days, gemini_token, openai_token, "createdAt") VALUES
('Test Plan', '0', 1, 1, 1, 1, 1, 1, '365', '999999', '999999', CURRENT_TIMESTAMP);

-- Insert default web settings
INSERT INTO web_public (currency_code, app_name, is_custom_home, meta_description, currency_symbol, login_header_footer, exchange_rate, "createdAt") VALUES
('USD', 'AI Platform', 0, 'AI Platform with multiple features', '$', 1, '1', CURRENT_TIMESTAMP);

INSERT INTO web_private (offline_active, stripe_active, paystack_active, "createdAt") VALUES
('0', '1', '0', CURRENT_TIMESTAMP);

-- Insert default API keys
INSERT INTO api_keys (open_ai, gemini_ai, stable_diffusion, "createdAt") VALUES
('sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX', 'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX', 'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX', CURRENT_TIMESTAMP);

-- Set initial sequence values to match MySQL AUTO_INCREMENT values
SELECT setval(pg_get_serial_sequence('admin', 'id'), 2, false);
SELECT setval(pg_get_serial_sequence('ai_image', 'id'), 10, false);
SELECT setval(pg_get_serial_sequence('ai_model', 'id'), 16, false);
SELECT setval(pg_get_serial_sequence('ai_speech', 'id'), 7, false);
SELECT setval(pg_get_serial_sequence('ai_video', 'id'), 17, false);
SELECT setval(pg_get_serial_sequence('ai_voice', 'id'), 4, false);
SELECT setval(pg_get_serial_sequence('api_keys', 'id'), 2, false);
SELECT setval(pg_get_serial_sequence('chat', 'id'), 20, false);
SELECT setval(pg_get_serial_sequence('contact_form', 'id'), 2, false);
SELECT setval(pg_get_serial_sequence('embed_chatbot', 'id'), 3, false);
SELECT setval(pg_get_serial_sequence('embed_chats', 'id'), 7, false);
SELECT setval(pg_get_serial_sequence('faq', 'id'), 6, false);
SELECT setval(pg_get_serial_sequence('orders', 'id'), 8, false);
SELECT setval(pg_get_serial_sequence('page', 'id'), 15, false);
SELECT setval(pg_get_serial_sequence('partners', 'id'), 16, false);
SELECT setval(pg_get_serial_sequence('plan', 'id'), 5, false);
SELECT setval(pg_get_serial_sequence('smtp', 'id'), 2, false);
SELECT setval(pg_get_serial_sequence('testimonial', 'id'), 7, false);
SELECT setval(pg_get_serial_sequence('user', 'id'), 4, false);
SELECT setval(pg_get_serial_sequence('web_private', 'id'), 2, false);
SELECT setval(pg_get_serial_sequence('web_public', 'id'), 2, false); 