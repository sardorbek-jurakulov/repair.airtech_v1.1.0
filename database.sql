--------------------------------- GENEREAL QUERIES ---------------------------------
SET timezone = 'Asia/Tashkent';
SHOW TIMEZONE;

------------------------------- DATABASE CREATING QUERIES -------------------------------
CREATE DATABASE repair_airtech;

--------------------------------- SERVICING TABLE QUERIES -------------------------------

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

CREATE TABLE customers (
  customer_id BIGSERIAL NOT NULL PRIMARY KEY,
  customer_type_id BIGINT NOT NULL REFERENCES customer_types(customer_type_id),
  customer_name VARCHAR(255) NOT NULL
);

INSERT INTO customers (
  customer_type_id,
  customer_name
  )
VALUES
  (1, 'Uzbekistan Airways' ),
  (2, 'Silk Avia'),
  (2, 'Qanotshart'),
  (2, 'Somon Air')
;

CREATE TABLE aircraft_checking_types (
  aircraft_checking_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  aircraft_checking_type_name VARCHAR(255) NOT NULL
);

INSERT INTO aircraft_checking_types (
  aircraft_checking_type_name
  )
VALUES
  ('A check'),
  ('B check'),
  ('C check')
;

CREATE TABLE servicing_status_types (
  servicing_status_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  servicing_status_type_name VARCHAR(255) NOT NULL
);

INSERT INTO servicing_status_types (
  servicing_status_type_name
  )
VALUES
  ('in process'),
  ('completed')
;

CREATE TABLE servicing (
  servicing_id BIGSERIAL NOT NULL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(customer_id),
  aircraft_type_id BIGINT REFERENCES aircraft_types(aircraft_type_id),
  aircraft_registration_number_id BIGINT REFERENCES aircraft_registration_numbers(aircraft_registration_number_id),
  aircraft_checking_type_id BIGINT REFERENCES aircraft_checking_types(aircraft_checking_type_id),
  service_starting_date DATE NOT NULL,
  servicing_status_type_id BIGINT NOT NULL REFERENCES servicing_status_types(servicing_status_type_id),
  service_completing_date DATE
);
-- TODO service'ni boshlanish vaqtini hozirgi vaqtdan oldingi vaqtni qabul qilib bo'lmaydigan qilish kerak
-- TODO service'ni tugash vaqtini service'ni boshlanish vaqtidan oldingi qiymatlarni qabul qilmaydigan qilib qo'yish kerak.


------------------ ORDERS FOR AVIATION TECHNICAL EQUIPMENT REQUIRED BY REGULATORY DOCUMENTS TABLE QUERIES ----------------
CREATE TABLE part_numbers (
  part_number_id BIGSERIAL NOT NULL PRIMARY KEY,
  part_number VARCHAR(255) NOT NULL
);

INSERT INTO part_numbers (
  part_number
  )
VALUES
  ('D1121001420200'),
  ('D1121001320800'),
  ('D1121005920200')
;

CREATE TABLE units (
  unit_id BIGSERIAL NOT NULL PRIMARY KEY,
  unit_name VARCHAR(255) NOT NULL
);

INSERT INTO units (
  unit_name
  )
VALUES
  ('MU'),
  ('CAL'),
  ('EA'),
  ('KG'),
  ('LI'),
  ('ME'),
  ('KIT')
;

CREATE TABLE material_availability_status (
  material_availability_status_id BIGSERIAL NOT NULL PRIMARY KEY,
  material_availability_status_name VARCHAR(255) NOT NULL
);

INSERT INTO material_availability_status (
  material_availability_status_name
  )
VALUES
  ('absent'),
  ('available'),
  ('ordered'),
  ('delivered')
;

CREATE TABLE orders_for_aviation_technical_equipment (
  order_id BIGSERIAL NOT NULL PRIMARY KEY,
  regulatory_documents_number_for_maintenance VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  part_number_id BIGINT REFERENCES part_numbers(part_number_id),
  unit_id BIGINT REFERENCES units(unit_id),
  material_availability_status_id BIGINT REFERENCES material_availability_status(material_availability_status_id),
  location VARCHAR(255)
);
-- database alternative name = orders_for_aviation_technical_equipment_required_by_regulatory_documents


------------------------------ REQUEST STATUS TABLE QUERIES ---------------------------

CREATE TABLE material_types (
  material_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  material_type_name VARCHAR(255)
);

INSERT INTO material_types (
  material_type_name
  )
VALUES
  ('POOL')
;

CREATE TABLE departments (
  department_id BIGSERIAL NOT NULL PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL
);

CREATE TABLE positions (
  position_id BIGSERIAL NOT NULL PRIMARY KEY,
  position_name VARCHAR(255) NOT NULL
);

CREATE TABLE staff (
  staff_id BIGSERIAL NOT NULL PRIMARY KEY,
  staf_fullname VARCHAR(255) NOT NULL,
  staff_table_number NUMERIC NOT NULL
);


CREATE TABLE request_status (
  request_status_id BIGSERIAL NOT NULL PRIMARY KEY,
  request_number VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  ordered_part_number VARCHAR(255) NOT NULL,
  shipping_part_number VARCHAR(255) NOT NULL,
  material_type_id BIGINT REFERENCES material_types(material_type_id),
  ordered_qty NUMERIC NOT NULL,
  unit_id BIGINT REFERENCES units(unit_id),
  ips_ref VARCHAR(255) NOT NULL,
  date_of_req DATE NOT NULL,
  status VARCHAR(255) NOT NULL,
  reference_to VARCHAR(255) NOT NULL,
  requested_by VARCHAR(100) NOT NULL,
  awb_number VARCHAR(100) NOT NULL,
  date_of_delivery_from_supplier VARCHAR(100) NOT NULL,
  date_in_tas VARCHAR(100),
  fact_status VARCHAR(100) NOT NULL
);


------------------------------ TECHNICAL ENGINEERING STAFF ORDER JOUTNAL TABLE QUERIES ---------------------------

CREATE TABLE technical_engineering_staff_order_journal (
  technical_engineering_staff_order_journal_id BIGSERIAL NOT NULL PRIMARY KEY,
  date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  part_number_id BIGINT REFERENCES part_numbers(part_number_id),
  quantity NUMERIC NOT NULL,
  unit_id BIGINT REFERENCES units(unit_id),
  customer_name VARCHAR(255) NOT NULL,
  customer_table_number VARCHAR(10) NOT NULL,
  delivery_table_number VARCHAR(10) NOT NULL,
  aircraft_registration_number_id BIGINT REFERENCES aircraft_registration_numbers(aircraft_registration_number_id)
);

--------------------------------- PICKING TABLE QUERIES ---------------------------------
CREATE TABLE picking (
  picking_id BIGSERIAL NOT NULL PRIMARY KEY,
  demand_number VARCHAR(100) NOT NULL,
  date_dd DATE NOT NULL,
  engineer_passed VARCHAR(30) NOT NULL,
  accepted_by_store_keeper VARCHAR(30) NOT NULL,
  date_of_receipt DATE NOT NULL,
  quantity_of_goods_and_materials_receipt NUMERIC NOT NULL,
  expiration_date VARCHAR(20) NOT NULL DEFAULT 'N/A',
  picked_up_by VARCHAR(30) NOT NULL,
  issued_on_board_number VARCHAR(30) NOT NULL,
  passed NUMERIC NOT NULL,
  quantity_of_balance NUMERIC NOT NULL,
  rack_number VARCHAR(20) NOT NULL
);


--------------------------------- USERS TABLE QUERIES ---------------------------------
CREATE TABLE user_role_types (
  user_role_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_role_type_name VARCHAR(255) NOT NULL
);

INSERT INTO user_role_types (
  user_role_type_name
  )
VALUES
  ('super-administrator'),
  ('administrator'),
  ('engineering-staff'),
  ('technical-staff'),
  ('picking-staff')
;

CREATE TABLE user_profile_activness_types (
  user_profile_activness_type_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_profile_activness_type_name VARCHAR(255) NOT NULL
);

INSERT INTO user_profile_activness_types (
  user_profile_activness_type_name
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