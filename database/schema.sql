-- =========================================================
-- Smart Citizen Kiosk & Multi-Ward Queue Management System
-- नागरिक सहायता कक्ष तथा टोकन व्यवस्थापन प्रणाली
-- Multi-Language Support (नेपाली, English, मैथिली, भोजपुरी, नेपाल भाषा)
-- Compliant with Nepal Local Government Operation Act 2074
-- =========================================================

CREATE DATABASE IF NOT EXISTS ward_kiosk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ward_kiosk;

DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS desks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS ward_info;

-- ---------------------------------------------------------
-- Ward Information & Profile
-- ---------------------------------------------------------
CREATE TABLE ward_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ward_name_np VARCHAR(255) NOT NULL,
  ward_name_en VARCHAR(255) NOT NULL,
  ward_name_mai VARCHAR(255) DEFAULT NULL,
  ward_name_new VARCHAR(255) DEFAULT NULL,
  municipality_np VARCHAR(255),
  municipality_en VARCHAR(255),
  municipality_mai VARCHAR(255),
  municipality_new VARCHAR(255),
  district_np VARCHAR(100),
  district_en VARCHAR(100),
  province_np VARCHAR(100),
  province_en VARCHAR(100),
  address_np VARCHAR(255),
  address_en VARCHAR(255),
  phone VARCHAR(20),
  phone2 VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  chairperson_name_np VARCHAR(100),
  chairperson_name_en VARCHAR(100),
  chairperson_phone VARCHAR(20),
  secretary_name_np VARCHAR(100),
  secretary_name_en VARCHAR(100),
  secretary_phone VARCHAR(20),
  office_hours_np VARCHAR(100) DEFAULT 'आइतबार - शुक्रबार: बिहान १०:०० - सन्ध्या ५:००',
  office_hours_en VARCHAR(100) DEFAULT 'Sunday - Friday: 10:00 AM - 5:00 PM',
  logo_url VARCHAR(255) DEFAULT NULL,
  supported_languages VARCHAR(100) DEFAULT 'np,en,mai,bho,new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Admin Users
-- ---------------------------------------------------------
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('super_admin', 'admin', 'operator') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Service Categories (बहुभाषिक श्रेणीहरू)
-- ---------------------------------------------------------
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name_np VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_mai VARCHAR(100) DEFAULT NULL,
  name_bho VARCHAR(100) DEFAULT NULL,
  name_new VARCHAR(100) DEFAULT NULL,
  description_np TEXT,
  description_en TEXT,
  icon VARCHAR(50) DEFAULT 'file-text',
  color_code VARCHAR(20) DEFAULT '#003893',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Counters / Desks (काउन्टरहरू)
-- ---------------------------------------------------------
CREATE TABLE desks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  name_np VARCHAR(100),
  name_en VARCHAR(100),
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Services (बहुभाषिक सेवाहरू)
-- ---------------------------------------------------------
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name_np VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_mai VARCHAR(200) DEFAULT NULL,
  name_bho VARCHAR(200) DEFAULT NULL,
  name_new VARCHAR(200) DEFAULT NULL,
  description_np TEXT,
  description_en TEXT,
  description_mai TEXT,
  description_new TEXT,
  fee_np VARCHAR(100),
  fee_en VARCHAR(100),
  processing_time_np VARCHAR(100),
  processing_time_en VARCHAR(100),
  desk_id INT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  allow_token BOOLEAN DEFAULT TRUE,
  allow_form_print BOOLEAN DEFAULT FALSE,
  custom_audio_url VARCHAR(500) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (desk_id) REFERENCES desks(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- Required Documents per Service (आवश्यक कागजातहरू)
-- ---------------------------------------------------------
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  name_np VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_mai VARCHAR(255) DEFAULT NULL,
  name_bho VARCHAR(255) DEFAULT NULL,
  name_new VARCHAR(255) DEFAULT NULL,
  note_np TEXT,
  note_en TEXT,
  note_mai TEXT,
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Uploadable Application Forms (PDF)
-- ---------------------------------------------------------
CREATE TABLE forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  name_np VARCHAR(200),
  name_en VARCHAR(200),
  file_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Daily Queue Tokens (टोकन लगत)
-- ---------------------------------------------------------
CREATE TABLE tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  desk_id INT DEFAULT NULL,
  token_number INT NOT NULL,
  token_date DATE NOT NULL,
  language_used VARCHAR(10) DEFAULT 'np',
  status ENUM('waiting', 'serving', 'completed', 'cancelled') DEFAULT 'waiting',
  is_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_daily_token (token_date, token_number),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (desk_id) REFERENCES desks(id) ON DELETE SET NULL
);

-- =========================================================
-- SEED DATA
-- =========================================================

-- Ward Info
INSERT INTO ward_info (
  ward_name_np, ward_name_en, ward_name_mai, ward_name_new,
  municipality_np, municipality_en, municipality_mai, municipality_new,
  district_np, district_en, province_np, province_en,
  address_np, address_en, phone, phone2, email, website,
  chairperson_name_np, chairperson_name_en, chairperson_phone,
  secretary_name_np, secretary_name_en, secretary_phone,
  office_hours_np, office_hours_en
) VALUES (
  'वडा नं. ३२', 'Ward No. 32', 'वार्ड नं. ३२', 'वडा ल्या ३२',
  'काठमाडौं महानगरपालिका', 'Kathmandu Metropolitan City', 'काठमाडौं महानगरपालिका', 'येँ महानगरपालिका',
  'काठमाडौं', 'Kathmandu', 'बागमती प्रदेश', 'Bagmati Province',
  'बागबजार, काठमाडौं', 'Bagbazar, Kathmandu',
  '01-4234567', '01-4234568', 'ward32@kathmandumetro.gov.np', 'https://www.kathmandumetro.gov.np',
  'राम बहादुर श्रेष्ठ', 'Ram Bahadur Shrestha', '९८४१-१२३४५६',
  'सीता देवी अधिकारी', 'Sita Devi Adhikari', '९८५१-६५४३२१',
  'आइतबार - शुक्रबार: बिहान १०:०० - सन्ध्या ५:००',
  'Sunday - Friday: 10:00 AM - 5:00 PM'
);

-- Tech Head Admin (Nirmala Tech Innovations) -> tech_admin / tech123
INSERT INTO admin_users (username, password_hash, full_name, role) VALUES
('tech_admin', '$2b$10$wE9K/v4RfZwN7FwWlTfAOOxO6b5Gk6nL2Z0kOQ9YhZ6O8P2YV7k4i', 'ई. सन्तोष शर्मा (Tech Head)', 'super_tech');

-- Desks
INSERT INTO desks (name, name_np, name_en, location) VALUES
('काउन्टर १', 'काउन्टर १ - व्यक्तिगत घटना दर्ता', 'Counter 1 - Vital Registration', 'भुईंतला - कोठा १०१'),
('काउन्टर २', 'काउन्टर २ - सिफारिस तथा नागरिकता', 'Counter 2 - Recommendation & Citizenship', 'भुईंतला - कोठा १०२'),
('काउन्टर ३', 'काउन्टर ३ - राजस्व तथा सम्पत्ति कर', 'Counter 3 - Revenue & Property Tax', 'पहिलो तला - कोठा २०१'),
('काउन्टर ४', 'काउन्टर ४ - सामाजिक सुरक्षा भत्ता', 'Counter 4 - Social Security Allowance', 'पहिलो तला - कोठा २०२'),
('काउन्टर ५', 'काउन्टर ५ - नक्सा पास तथा प्राविधिक', 'Counter 5 - Blueprint & Technical', 'दोस्रो तला - कोठा ३०१');

-- Categories with Multilingual names
INSERT INTO categories (name_np, name_en, name_mai, name_bho, name_new, icon, sort_order) VALUES
('व्यक्तिगत घटना दर्ता', 'Vital Registration', 'व्यक्तिगत घटना दर्ता', 'व्यक्तिगत घटना दर्ता', 'व्यक्तिगत घटना दर्ता', 'heart', 1),
('नागरिकता तथा परिचय', 'Citizenship & Identity', 'नागरिकता आ परिचय', 'नागरिकता अउर पहिचान', 'नागरिकता व म्हसीका', 'id-card', 2),
('जग्गा, भवन तथा सम्पत्ति', 'Land & Property', 'जमीन आ मकान', 'जमीन अउर मकान', 'जग्गा, छेँ व सम्पत्ति', 'landmark', 3),
('कर तथा राजस्व', 'Tax & Revenue', 'कर आ राजस्व', 'टैक्स अउर राजस्व', 'कर व राजस्व', 'calculator', 4),
('सामाजिक सुरक्षा भत्ता', 'Social Security Allowance', 'सामाजिक सुरक्षा भत्ता', 'सामाजिक सुरक्षा भत्ता', 'सामाजिक सुरक्षा भत्ता', 'shield', 5),
('सिफारिस तथा प्रमाणित', 'Recommendations', 'सिफारिश आ प्रमाण', 'सिफारिश अउर प्रमाण', 'सिफारिस व प्रमाणित', 'file-signature', 6),
('व्यापार, उद्योग तथा पेशा', 'Business & Trade', 'व्यापार आ रोजगार', 'बिजनेस अउर व्यापार', 'व्यापार व उद्योग', 'briefcase', 7),
('निर्माण अनुमति तथा प्राविधिक', 'Construction & Technical', 'निर्माण अनुमति', 'घर बनावे के अनुमति', 'छेँ दनेगु अनुमति', 'hard-hat', 8),
('विपद् व्यवस्थापन', 'Disaster Management', 'विपदा व्यवस्थापन', 'आपदा राहत', 'विपद् व्यवस्थापन', 'alert-triangle', 9),
('शिक्षा, स्वास्थ्य तथा सामाजिक', 'Education & Health', 'शिक्षा आ स्वास्थ्य', 'शिक्षा अउर दवाई', 'शिक्षा व उसाँय्', 'graduation-cap', 10);

-- Services
INSERT INTO services (category_id, name_np, name_en, name_mai, name_bho, name_new, fee_np, fee_en, processing_time_np, processing_time_en, desk_id, sort_order) VALUES
-- Category 1: Vital Registration
(1, 'जन्मदर्ता प्रमाणपत्र', 'Birth Certificate', 'जन्मदर्ता प्रमाणपत्र', 'जनम प्रमाण पत्र', 'जन्मदर्ता पौ', 'निःशुल्क (३५ दिनभित्र) / रु. ५०', 'Free (within 35 days) / Rs. 50', 'सोही दिन', 'Same day', 1, 1),
(1, 'मृत्युदर्ता प्रमाणपत्र', 'Death Certificate', 'मृत्युदर्ता प्रमाणपत्र', 'मौत प्रमाण पत्र', 'सीगु दर्ता पौ', 'निःशुल्क (३५ दिनभित्र) / रु. ५०', 'Free (within 35 days) / Rs. 50', 'सोही दिन', 'Same day', 1, 2),
(1, 'विवाह दर्ता प्रमाणपत्र', 'Marriage Certificate', 'विवाह दर्ता प्रमाणपत्र', 'बियाह प्रमाण पत्र', 'इहिपा दर्ता पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 3),
(1, 'सम्बन्ध विच्छेद दर्ता', 'Divorce Registration', 'सम्बन्ध विच्छेद दर्ता', 'तलाक दर्ता', 'पारपाचुके दर्ता', 'रु. ५०', 'Rs. 50', '१-३ दिन', '1-3 days', 1, 4),
(1, 'बसाइसराइ दर्ता (आगमन/प्रस्थान)', 'Migration Registration', 'बसाइसराइ दर्ता', 'बसाइसराइ दर्ता', 'थाय् हिलेगु दर्ता', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 5),

-- Category 2: Citizenship & Identity
(2, 'नागरिकता सिफारिस (वंशज)', 'Citizenship Recommendation', 'नागरिकता सिफारिस', 'नागरिकता सिफारिश', 'नागरिकता सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 1),
(2, 'नाता प्रमाणित', 'Relationship Verification', 'नाता प्रमाणित', 'रिश्ता प्रमाण पत्र', 'थःथिति प्रमाणित', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 2),
(2, 'नागरिकता प्रतिलिपि सिफारिस', 'Citizenship Duplicate Recommendation', 'नागरिकता प्रतिलिपि', 'नागरिकता के डुप्लीकेट', 'नागरिकता कपी सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 3),
(2, 'नाबालक परिचयपत्र', 'Minor Identity Card', 'नाबालक परिचयपत्र', 'नाबालिग पहचान पत्र', 'नाबालक म्हसीका पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 2, 4),

-- Category 3: Land & Property
(3, 'घर नक्सा (भवन निर्माण) पास', 'House Blueprint Approval', 'घरक नक्शा पास', 'घर के नक्शा पास', 'छेँया नक्सा पास', 'क्षेत्रफल अनुसार', 'Based on Area', '७-१५ दिन', '7-15 days', 5, 1),
(3, 'जग्गा दर्ता सिफारिस (लालपुर्जा)', 'Land Registration Recommendation', 'जमीन रजिस्ट्री सिफारिश', 'जमीन रजिस्ट्री सिफारिश', 'जग्गा दर्ता सिफारिस', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 3, 2),
(3, 'चार किल्ला प्रमाणित', 'Four Boundary (Char Killa) Verification', 'चार किल्ला प्रमाणित', 'चारों तरफ के सीमा प्रमाण', 'प्यंगू सिमाना प्रमाणित', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 5, 3),
(3, 'जग्गा नामसारी सिफारिस', 'Land Ownership Transfer (Namsari)', 'जमीन नामसारी', 'जमीन के नाम चढ़ाना', 'जग्गा नामसारी', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 3, 4),

-- Category 4: Tax & Revenue
(4, 'एकीकृत सम्पत्ति कर (मालपोत)', 'Integrated Property Tax', 'सम्पत्ति कर (मालपोत)', 'सम्पत्ति टैक्स', 'सम्पत्ति कर', 'मूल्याङ्कन अनुसार', 'Per Valuation', 'सोही दिन', 'Same day', 3, 1),
(4, 'व्यापार कर भुक्तानी', 'Business Tax Payment', 'व्यापार कर', 'दुकान के टैक्स', 'व्यापार कर', 'प्रकार अनुसार', 'Per Category', 'सोही दिन', 'Same day', 3, 2),
(4, 'घर बहाल कर', 'House Rent Tax', 'घर भाड़ा कर', 'मकान किराया टैक्स', 'छेँ बाहाः कर', 'भाडाको १०%', '10% of rent', 'सोही दिन', 'Same day', 3, 3),
(4, 'कर चुक्ता प्रमाणपत्र', 'Tax Clearance Certificate', 'कर चुक्ता प्रमाण', 'टैक्स चुक्ता रसीद', 'कर चुक्ता पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 3, 4),

-- Category 5: Social Security Allowance
(5, 'जेष्ठ नागरिक भत्ता (७० वर्ष)', 'Senior Citizen Allowance (70+)', 'बुजुर्ग भत्ता', 'बुजुर्ग भत्ता', 'थकाली भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 1),
(5, 'एकल महिला भत्ता (६० वर्ष)', 'Single Women Allowance', 'एकल महिला भत्ता', 'विधवा / एकल महिला भत्ता', 'एकल मिसा भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 2),
(5, 'पूर्ण अपाङ्गता भत्ता (रातो कार्ड)', 'Full Disability Allowance (Red Card)', 'अपाङ्गता भत्ता (लाल कार्ड)', 'दिव्यांग भत्ता', 'अपाङ्गता भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 3),
(5, 'बाल पोषण भत्ता', 'Child Nutrition Allowance', 'बाल पोषण भत्ता', 'लईका पोषण भत्ता', 'मचा पोषण भत्ता', 'निःशुल्क (भत्ता रु. ८००/महिना)', 'Free (Allowance Rs. 800/mo)', '७-१५ दिन', '7-15 days', 4, 4),

-- Category 6: Recommendations
(6, 'चारित्रिक प्रमाणपत्र सिफारिस', 'Character Certificate', 'चारित्रिक प्रमाण', 'चरित्र प्रमाण पत्र', 'चरित्र सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 1),
(6, 'आयस्रोत प्रमाणपत्र सिफारिस', 'Income Certificate', 'आय प्रमाण पत्र', 'कमाई के प्रमाण पत्र', 'आम्दानी सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 2),
(6, 'आर्थिक विपन्नता प्रमाणपत्र', 'Poverty Verification Certificate', 'गरीबी प्रमाण पत्र', 'गरीबी रेखा प्रमाण', 'विपन्नता पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 2, 3),
(6, 'अविवाहित प्रमाणपत्र', 'Unmarried Certificate', 'अविवाहित प्रमाण', 'कुँवारा प्रमाण पत्र', 'मब्याहा पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 4),
(6, 'राहदानी (पासपोर्ट) सिफारिस', 'Passport Recommendation', 'पासपोर्ट सिफारिश', 'पासपोर्ट के सिफारिश', 'राहदानी सिफारिस', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 5),

-- Category 7: Business
(7, 'नयाँ व्यापार/पसल दर्ता', 'New Business Registration', 'नया दोकान दर्ता', 'नया दुकान रजिस्ट्रेशन', 'न्हूगु पसः दर्ता', 'रु. ५०० - २,०००', 'Rs. 500 - 2,000', '३-७ दिन', '3-7 days', 3, 1),
(7, 'व्यापार दर्ता नवीकरण', 'Business Registration Renewal', 'व्यापार रिन्यू', 'दुकान रिन्यूअल', 'पसः दर्ता नवीकरण', 'रु. ५००', 'Rs. 500', '१-३ दिन', '1-3 days', 3, 2),
(7, 'स्थायी लेखा नम्बर (PAN) सिफारिस', 'PAN Number Recommendation', 'प्यान कार्ड सिफारिश', 'पैन कार्ड के सिफारिश', 'प्यान सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 3, 3);

-- Documents for Services
INSERT INTO documents (service_id, name_np, name_en, name_mai, name_bho, name_new, note_np, sort_order) VALUES
-- Birth Certificate
(1, 'बाबु/आमाको नागरिकता प्रमाणपत्र (सक्कल + प्रतिलिपि)', 'Father/Mother Citizenship (Original + Copy)', 'बाप/माय के नागरिकता', 'माई-बाबूजी के नागरिकता', 'मां-अबुया नागरिकता पौ', 'दुवैको अनिवार्य', 1),
(1, 'अस्पतालको जन्म प्रमाणपत्र', 'Hospital Birth Certificate', 'अस्पतालक जन्म प्रमाण', 'अस्पताल के जनम कागज', 'अस्पतालया जन्म पौ', 'अस्पतालमा जन्म भएमा', 2),
(1, 'बाबुआमाको विवाह दर्ता प्रमाणपत्र', 'Parents Marriage Certificate', 'विवाह दर्ता', 'बियाह के कागज', 'इहिपा दर्ता पौ', NULL, 3),
(1, 'बच्चाको हालसालको पासपोर्ट फोटो', 'Passport Size Photos of Child', 'पासपोर्ट फोटो', 'फोटो', 'मचाया फोटो', '२ प्रति', 4),

-- Death Certificate
(2, 'मृतकको नागरिकता प्रमाणपत्र (सक्कल)', 'Deceased Citizenship (Original)', 'मृतकक नागरिकता', 'मृतक के नागरिकता', 'सीम्ह मनुया नागरिकता', 'सक्कल र प्रतिलिपि', 1),
(2, 'सूचक (दर्ता गराउने) को नागरिकता', 'Informant Citizenship Certificate', 'दर्ता कराबएबलाक नागरिकता', 'दर्ता करावे वाला के पहचान', 'दर्ता याइम्हया नागरिकता', NULL, 2),
(2, 'अस्पतालको मृत्यु प्रमाणपत्र / शवपरीक्षण प्रतिवेदन', 'Hospital Death Certificate', 'अस्पतालक मृत्यु प्रमाण', 'अस्पताल के कागज', 'अस्पतालया सीगु पौ', 'अस्पतालमा मृत्यु भएमा', 3),

-- Marriage Certificate
(3, 'दुलहा र दुलहीको नागरिकता (सक्कल + प्रतिलिपि)', 'Bride and Groom Citizenship', 'वर-वधुक नागरिकता', 'दूल्हा-दुलहिन के नागरिकता', 'भाःत-कलाःया नागरिकता', 'दुवै उपस्थित हुनुपर्ने', 1),
(3, 'दुवैको पासपोर्ट साइज फोटो', 'Passport Photos of Both', 'दुनो के फोटो', 'दुनो के फोटो', 'निम्हसिया फोटो', 'प्रत्येकको ३-३ प्रति', 2),
(3, 'कम्तीमा ३ जना साक्षीको नागरिकता', 'Citizenship of 3 Witnesses', '३ टा गवाह के नागरिकता', '३ गो गवाह के नागरिकता', '३ म्ह साक्षीपिनिगु नागरिकता', 'साक्षी उपस्थित हुनुपर्छ', 3),

-- Citizenship Recommendation
(6, 'बाबु/आमाको नागरिकता प्रमाणपत्र (सक्कल)', 'Father/Mother Citizenship (Original)', 'बाप/माय के नागरिकता', 'माई-बाबू के नागरिकता', 'मां-अबुया नागरिकता', 'अनिवार्य सक्कल', 1),
(6, 'जन्मदर्ता प्रमाणपत्र (सक्कल)', 'Birth Certificate (Original)', 'जन्मदर्ता', 'जनम प्रमाण पत्र', 'जन्मदर्ता पौ', NULL, 2),
(6, 'शैक्षिक योग्यताको प्रमाणपत्र (SLC/SEE)', 'Academic Certificate (SLC/SEE)', 'स्कूलक सर्टिफिकेट', 'स्कूल के कागज', 'स्कूलया पौ', 'उमेर प्रमाणित गर्न', 3),
(6, 'हालसालको पासपोर्ट फोटो', 'Recent Passport Photos', 'पासपोर्ट फोटो', 'पासपोर्ट फोटो', 'फोटो', '५ प्रति', 4),

-- Senior Citizen Allowance
(14, 'नागरिकको नागरिकता प्रमाणपत्र (सक्कल)', 'Citizenship Certificate (Original)', 'नागरिकता', 'नागरिकता', 'नागरिकता पौ', 'उमेर ७० वर्ष पुगेको', 1),
(14, 'हालसालको पासपोर्ट साइज फोटो', 'Passport Size Photos', 'फोटो', 'फोटो', 'फोटो', '३ प्रति', 2),
(14, 'बैंक खाता विवरण (चेकबुक प्रतिलिपि)', 'Bank Account Details', 'बैंक खाता के पासबुक', 'बैंक पासबुक के फोटोकपी', 'बैंक पासबुक कपी', 'भत्ता जम्मा हुने खाता', 3);
