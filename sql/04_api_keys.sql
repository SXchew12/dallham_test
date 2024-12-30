CREATE TABLE api_keys (
  id int(11) NOT NULL AUTO_INCREMENT,
  open_ai varchar(999) DEFAULT NULL,
  gemini_ai varchar(999) DEFAULT NULL,
  stable_diffusion varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO api_keys (open_ai, gemini_ai, stable_diffusion, createdAt) 
VALUES ('sk-proj-KA3vYIRjJ1gJ81DB4L2uT3BlbkFJtDiMXXXXXXXXXXX', 'AIzaSyA27vzeSnobuj1a67XJd_MXXXXXXXXXXX', 'sk-f9WeKwC7YuZAgS0wzTLDk4kO84fpRNDa8OMXXXXXXXXXXX', '2024-07-30 14:32:04'); 