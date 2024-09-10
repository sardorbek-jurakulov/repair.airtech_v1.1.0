--------------------------------- GENEREAL QUERIES ---------------------------------
SET timezone = 'Asia/Tashkent';
SHOW TIMEZONE;

------------------------------- DATABASE CREATING QUERIES -------------------------------
CREATE DATABASE repair_airtech;

------------------------------- AIRPLANES TABLE QUERIES -------------------------------

CREATE TABLE aircraft_types (
  aircraft_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  aircraft_type_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO aircraft_types (
  aircraft_type_name
  )
VALUES
  ('Boeing757-200'),
  ('Boeing757-23P'),
  ('Boeing767-300'),
  ('Boeing767-33P'),
  ('Boeing787-8'),
  ('Boeing787-8P'),
  ('A320-214'),
  ('A320-000'),
  ('A320-NEO')
;

CREATE TABLE aircraft_registration_numbers (
  aircraft_registration_number_id BIGSERIAL NOT NULL PRIMARY KEY,
  aircraft_type_id BIGINT REFERENCES aircraft_types(aircraft_type_id) NOT NULL,
  aircraft_registration_number VARCHAR(50) NOT NULL
);

INSERT INTO aircraft_registration_numbers (
  aircraft_type_id,
  aircraft_registration_number
  )
VALUES
  (1, 'UK75701'),
  (1, 'UK75702'),
  (1, 'UK75703'),
  (1, 'UK75704'),
  (1, 'UK75705'),
  (2, 'UK75700'),
  (3, 'UK67001'),
  (3, 'UK67002'),
  (3, 'UK67003'),
  (3, 'UK67004'),
  (3, 'UK67005'),
  (3, 'UK67006'),
  (3, 'UK67007'),
  (3, 'UK67008'),
  (4, 'UK67000'),
  (5, 'UK78701'),
  (5, 'UK78702'),
  (5, 'UK78703'),
  (5, 'UK78704'),
  (5, 'UK78705'),
  (5, 'UK78706'),
  (6, 'UK001'),
  (6, 'UK001'),
  (7, 'UK32011'),
  (7, 'UK32012'),
  (7, 'UK32014'),
  (7, 'UK32016'),
  (7, 'UK32017'),
  (7, 'UK32018'),
  (7, 'UK32019'),
  (7, 'UK32020'),
  (8, 'UK32000'),
  (8, 'UK002'),
  (9, 'UK32021'),
  (9, 'UK32022'),
  (9, 'UK32023'),
  (9, 'UK32101'),
  (9, 'UK32103'),
  (9, 'UK32102'),
  (9, 'UK32105'),
  (9, 'UK32104'),
  (9, 'UK32024'),
  (9, 'UK32025'),
  (9, 'UK32028'),
  (9, 'UK32026'),
  (9, 'UK32027'),
  (9, 'UK32029'),
  (9, 'UK32040')
;

CREATE TABLE customer_types (
  customer_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  customer_type_name VARCHAR(50) NOT NULL
);

INSERT INTO customer_types (
  customer_type_name
  )
VALUES
  ('government airline' ),
  ('private airline')
;

CREATE TABLE customer_names (
  customer_name_id BIGSERIAL NOT NULL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL
);

INSERT INTO customer_names (
  customer_name
  )
VALUES
  ('Uzbekistan Airways' ),
  ('Silk Avia'),
  ('Qanoqshart'),
  ('Somon Air')
;

CREATE TABLE aircraft_checking_types (
  aircraft_checking_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  aircraft_checking_type_name VARCHAR(255) NOT NULL
);

INSERT INTO aircraft_checking_types (
  checking_type_name
  )
VALUES
  ('A check'),
  ('B check'),
  ('C check')
;

CREATE TABLE servicing (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  types_of_aircraft_id BIGINT REFERENCES types_of_aircraft(id),
  registration_numbers_of_aircraft_id BIGINT REFERENCES registration_numbers_of_aircraft(id),
  aircraft_checking_types_id BIGINT REFERENCES aircraft_checking_types(id),
  service_starting_date DATE NOT NULL,
  servicing_status VARCHAR(20) NOT NULL DEFAULT 'in process',
  service_completing_date DATE
);
-- service_status: 'in process' / 'completed'
-- TODO service'ni boshlanish vaqtini hozirgi vaqtdan oldingi vaqtni qabul qilib bo'lmaydigan qilish kerak
-- TODO service'ni tugash vaqtini service'ni boshlanish vaqtidan oldingi qiymatlarni qabul qilmaydigan qilib qo'yish kerak.




--------------------------------- SPARES TABLE QUERIES ---------------------------------
CREATE TABLE spares (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  airplane_id BIGINT NOT NULL REFERENCES airplanes(id),
  demand_number VARCHAR(100) NOT NULL,
  date_dd DATE NOT NULL,
  description VARCHAR(300) NOT NULL,
  part_number VARCHAR(100) NOT NULL,
  material_type VARCHAR(100) NOT NULL,
  ordered_qty NUMERIC NOT NULL,
  unit VARCHAR(10) NOT NULL,
  reference_to VARCHAR(100) NOT NULL,
  requested_by VARCHAR(30) NOT NULL,
  engineer_passed VARCHAR(30) NOT NULL,
  accepted_by_store_keeper VARCHAR(30) NOT NULL,
  date_of_receipt DATE NOT NULL,
  quantity_of_goods_and_materials_receipt NUMERIC NOT NULL,
  expiration_date VARCHAR(20) NOT NULL DEFAULT 'N/A',
  picked_up_by VARCHAR(30) NOT NULL,
  issued_on_board_number VARCHAR(30) NOT NULL,
  passed NUMERIC NOT NULL,
  quantity_of_balance NUMERIC NOT NULL,
  rack_number VARCHAR(20) NOT NULL,
  spare_usage_status VARCHAR(30) NOT NULL DEFAULT 'installed to airplane',
  info_created_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_created_username VARCHAR(50) NOT NULL,
  info_updated_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_updated_username VARCHAR(50) NOT NULL
);
-- spare_usage_status 'installed to airplane' / 'taken back from airplane'

INSERT INTO spares (
  airplane_id,
  demand_number,
  date_dd,
  description,
  part_number,
  material_type,
  ordered_qty,
  unit,
  reference_to,
  requested_by,
  engineer_passed,
  accepted_by_store_keeper,
  date_of_receipt,
  quantity_of_goods_and_materials_receipt,
  expiration_date,
  picked_up_by,
  issued_on_board_number,
  passed,
  quantity_of_balance,
  rack_number
  )
VALUES (
  1,
  'BNGc/00489',
  '01.03.2023',
  'BOLT',
  'EN6115-3-6',
  'CONSUMABLE',
  1.00,
  'EA',
  'NRC#U231284',
  'IVANOV S.',
  'SAMATOV D.',
  'ZIMAKINA O.',
  '01.03.2023',
  1.00,
  'N/A',
  'IVANOV S.',
  'UK32020',
  1.00,
  0.00,
  '1/1'
);


--------------------------------- USERS TABLE QUERIES ---------------------------------
CREATE TABLE user_role_types (
  user_role_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_role_type_name VARCHAR(255) NOT NULL,
);

INSERT INTO user_role_types (
  user_role_type_name,
  )
VALUES
  ('super-administrator')
  ('administrator'),
  ('engineering-staff'),
  ('technical-staff'),
  ('picking-staff'),
;

CREATE TABLE user_profile_activness_types (
  user_profile_activness_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_profile_activness_type_name VARCHAR(255) NOT NULL,
);

INSERT INTO user_profile_activness_types (
  user_profile_activness_type_name,
  )
VALUES
  ('active'),
  ('not active')
;

CREATE TABLE users (
  user_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_full_name VARCHAR(100) NOT NULL,
  user_login VARCHAR(50) NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_table_number NUMERIC NOT NULL,
  user_role_type_id BIGINT NOT NULL REFERENCES user_role_types(user_role_type_id),
  user_profile_activness_type_id BIGINT NOT NULL REFERENCES user_profile_activness_types(user_profile_activness_type_id),
  info_created_date  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_created_user_login VARCHAR(50) NOT NULL,
  info_updated_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_updated_user_login VARCHAR(50) NOT NULL
);
-- user_profile_activeness = active / not active
-- user_role

CREATE TABLE users (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  table_number NUMERIC NOT NULL,
  role VARCHAR(50) NOT NULL,
  login_status VARCHAR(15) NOT NULL DEFAULT 'allowed',
  info_created_date  TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_created_username VARCHAR(50) NOT NULL,
  info_updated_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  info_updated_username VARCHAR(50) NOT NULL
);
-- login_status = allowed / not allowed
-- role = 'admin' / 'moderator' / 'user'
-- admin - CRUD users, CRUD airplanes, CRUD spares
-- moderator - CRUD airplanes, CRUD spares,
-- user - read airplanes, read spares

INSERT INTO users (
  full_name,
  username,
  password,
  table_number,
  role,
  info_created_username,
  info_updated_username
  )
VALUES (
  'Jo`raqulov Sardorbek Bahodir o`g`li',
  'sjurakulov',
  '$2a$12$8kkaFb9jZtVxQCFERE6mCeDUULqYXA.J2JKn/.nL3JWzuo0uqp3eW',
  5848,
  'admin',
  'sjurakulov',
  'sjurakulov'
);


--------------------------------- ORDER TO ATI QUERIES ---------------------------------

CREATE TABLE order_ati (
  order_ati_id BIGSERIAL NOT NULL PRIMARY KEY,
  regulatory_document_number VARCHAR(100) NOT NULL,
  description VARCHAR(300) NOT NULL,
  part_number VARCHAR(100) NOT NULL,
  quantity VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  material_usage_status VARCHAR(30) NOT NULL DEFAULT 'used for airplane',
  created_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) NOT NULL,
  updated_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) NOT NULL
);

-- material_usage_status = used for airplane / use of the material calcelled


--------------------------------- ORDER TO ATI BU UNEXISTING WAREHOUSE QUERIES ---------------------------------
CREATE TABLE order_ati (
  order_ati_id BIGSERIAL NOT NULL PRIMARY KEY,
  regulatory_document_number VARCHAR(100) NOT NULL,
  description VARCHAR(300) NOT NULL,
  part_number VARCHAR(100) NOT NULL,
  quantity VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  material_usage_status VARCHAR(30) NOT NULL DEFAULT 'used for airplane',
  created_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50) NOT NULL,
  updated_date TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) NOT NULL
);