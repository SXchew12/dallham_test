CREATE TABLE web_private (
  id int(11) NOT NULL AUTO_INCREMENT,
  pay_offline_id varchar(999) DEFAULT NULL,
  pay_offline_key varchar(999) DEFAULT NULL,
  offline_active varchar(999) DEFAULT NULL,
  pay_stripe_id varchar(999) DEFAULT NULL,
  pay_stripe_key varchar(999) DEFAULT NULL,
  stripe_active varchar(999) DEFAULT NULL,
  pay_paystack_id varchar(999) DEFAULT NULL,
  pay_paystack_key varchar(999) DEFAULT NULL,
  paystack_active varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE web_public (
  id int(11) NOT NULL AUTO_INCREMENT,
  currency_code varchar(999) DEFAULT NULL,
  logo varchar(999) DEFAULT NULL,
  app_name varchar(999) DEFAULT NULL,
  custom_home varchar(999) DEFAULT NULL,
  is_custom_home int(1) DEFAULT 0,
  meta_description LONGTEXT DEFAULT NULL,
  currency_symbol varchar(999) DEFAULT NULL,
  home_page_tutorial varchar(999) DEFAULT NULL,
  login_header_footer int(1) DEFAULT 0,
  exchange_rate varchar(999) DEFAULT NULL,
  createdAt timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 