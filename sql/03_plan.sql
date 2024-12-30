CREATE TABLE plan (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(999) DEFAULT NULL,
  price varchar(999) DEFAULT NULL,
  in_app_chat int(1) DEFAULT 0,
  image_maker int(1) DEFAULT 0,
  code_writer int(1) DEFAULT 0,
  speech_to_text int(1) DEFAULT 0,
  voice_maker int(1) DEFAULT 0,
  ai_video int(1) DEFAULT 0,
  validity_days varchar(999) DEFAULT '0',
  gemini_token varchar(999) DEFAULT '0',
  openai_token varchar(999) DEFAULT '0',
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 