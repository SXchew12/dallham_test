CREATE TABLE admin (
  id int(11) NOT NULL AUTO_INCREMENT,
  role varchar(999) DEFAULT 'admin',
  uid varchar(999) DEFAULT NULL,
  email varchar(999) DEFAULT NULL,
  password varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin (email, password, role, uid) 
VALUES ('admin@admin.com', '$2b$10$NpdbfaW2xj9dEJpiz9fyUuYbsY7JV9H7sTifhdPqTeUuVhWe2fex6', 'admin', 'lnAnUIUnBBtXhcj5VHdaA2KERBgCTkWz'); 