--------------------------------- GENEREAL QUERIES ---------------------------------
SET timezone = 'Asia/Tashkent';
SHOW TIMEZONE;

------------------------------- DATABASE CREATING QUERIES -------------------------------
CREATE DATABASE repair_airtech;

------------------------------- AIRPLANES TABLE QUERIES -------------------------------

CREATE TABLE types_of_aircraft (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO types_of_aircraft (
  type_name
  )
VALUES
  ('Boeing787-8'),
  ('Boeing787-8P'),
  ('Boeing757-200'),
  ('Boeing757-23P'),
  ('Boeing767-300'),
  ('Boeing767-33P'),
  ('A320-214'),
  ('A320-000'),
  ('A320-NEO')
;

CREATE TABLE registration_numbers_of_aircraft (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  types_of_aircraft_id BIGINT REFERENCES types_of_aircraft(id),
  registration_number VARCHAR(50) NOT NULL
);

INSERT INTO registration_numbers_of_aircraft (
  types_of_aircraft_id,
  registration_number
  )
VALUES
  (1, 'UK78701')
;

CREATE TABLE customer_type (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

INSERT INTO customer_type (
  type_name
  )
VALUES
  ( 'Uzbekistan Airways' ),
  ('Silk Avia'),
  ('Qanoqshart'),
  ('Somon Air')
;

CREATE TABLE servicing (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  types_of_aircraft_id BIGINT REFERENCES types_of_aircraft(id),
  registration_numbers_of_aircraft_id BIGINT REFERENCES registration_numbers_of_aircraft(id),
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
  airplane_id BIGINT REFERENCES airplanes(id),
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