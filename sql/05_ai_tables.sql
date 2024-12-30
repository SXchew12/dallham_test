CREATE TABLE ai_image (
  id int(11) NOT NULL AUTO_INCREMENT,
  uid varchar(999) DEFAULT NULL,
  ai_type varchar(999) DEFAULT NULL,
  image_size varchar(999) DEFAULT NULL,
  image_style varchar(999) DEFAULT NULL,
  prompt varchar(999) DEFAULT NULL,
  filename varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_speech (
  id int(11) NOT NULL AUTO_INCREMENT,
  uid varchar(999) DEFAULT NULL,
  type varchar(999) DEFAULT NULL,
  filename varchar(999) DEFAULT NULL,
  output LONGTEXT DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_voice (
  id int(11) NOT NULL AUTO_INCREMENT,
  uid varchar(999) DEFAULT NULL,
  prompt LONGTEXT DEFAULT NULL,
  voice varchar(999) DEFAULT NULL,
  filename varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_video (
  id int(11) NOT NULL AUTO_INCREMENT,
  uid varchar(999) DEFAULT NULL,
  audio varchar(999) DEFAULT NULL,
  video varchar(999) DEFAULT NULL,
  caption LONGTEXT DEFAULT NULL,
  final_video varchar(999) DEFAULT NULL,
  status varchar(999) DEFAULT NULL,
  state LONGTEXT DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 