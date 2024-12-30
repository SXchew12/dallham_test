CREATE TABLE user (
  id int(11) NOT NULL AUTO_INCREMENT,
  role varchar(999) DEFAULT 'user',
  uid varchar(999) DEFAULT NULL,
  name varchar(999) DEFAULT NULL,
  email varchar(999) DEFAULT NULL,
  password varchar(999) DEFAULT NULL,
  mobile varchar(999) DEFAULT NULL,
  timezone varchar(999) DEFAULT 'Asia/Kolkata',
  plan longtext DEFAULT NULL,
  plan_expire varchar(999) DEFAULT NULL,
  trial int(1) DEFAULT 0,
  api_key varchar(999) DEFAULT NULL,
  gemini_token varchar(999) DEFAULT '0',
  openai_token varchar(999) DEFAULT '0',
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 