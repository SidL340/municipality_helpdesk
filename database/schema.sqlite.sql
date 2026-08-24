-- =========================================================
-- Smart Citizen Kiosk - Complete Production SQLite Database
-- नागरिक सहायता कक्ष - ६० वटै सेवा र सम्पूर्ण कागजातहरूको सूची
-- =========================================================

DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS desks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS ward_info;

CREATE TABLE ward_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ward_name_np TEXT NOT NULL,
  ward_name_en TEXT NOT NULL,
  ward_name_mai TEXT DEFAULT NULL,
  ward_name_new TEXT DEFAULT NULL,
  municipality_np TEXT,
  municipality_en TEXT,
  municipality_mai TEXT,
  municipality_new TEXT,
  district_np TEXT,
  district_en TEXT,
  province_np TEXT,
  province_en TEXT,
  address_np TEXT,
  address_en TEXT,
  phone TEXT,
  phone2 TEXT,
  email TEXT,
  website TEXT,
  chairperson_name_np TEXT,
  chairperson_name_en TEXT,
  chairperson_phone TEXT,
  secretary_name_np TEXT,
  secretary_name_en TEXT,
  secretary_phone TEXT,
  office_hours_np TEXT DEFAULT 'आइतबार - शुक्रबार: बिहान १०:०० - सन्ध्या ५:००',
  office_hours_en TEXT DEFAULT 'Sunday - Friday: 10:00 AM - 5:00 PM',
  logo_url TEXT DEFAULT NULL,
  supported_languages TEXT DEFAULT 'np,en,mai,bho,new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_np TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_mai TEXT DEFAULT NULL,
  name_bho TEXT DEFAULT NULL,
  name_new TEXT DEFAULT NULL,
  description_np TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'file-text',
  color_code TEXT DEFAULT '#003893',
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE desks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_np TEXT,
  name_en TEXT,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name_np TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_mai TEXT DEFAULT NULL,
  name_bho TEXT DEFAULT NULL,
  name_new TEXT DEFAULT NULL,
  description_np TEXT,
  description_en TEXT,
  description_mai TEXT,
  description_new TEXT,
  fee_np TEXT,
  fee_en TEXT,
  processing_time_np TEXT,
  processing_time_en TEXT,
  desk_id INTEGER DEFAULT NULL,
  is_active INTEGER DEFAULT 1,
  allow_token INTEGER DEFAULT 1,
  allow_form_print INTEGER DEFAULT 0,
  custom_audio_url TEXT DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (desk_id) REFERENCES desks(id) ON DELETE SET NULL
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  name_np TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_mai TEXT DEFAULT NULL,
  name_bho TEXT DEFAULT NULL,
  name_new TEXT DEFAULT NULL,
  note_np TEXT,
  note_en TEXT,
  note_mai TEXT,
  sort_order INTEGER DEFAULT 0,
  is_required INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  name_np TEXT,
  name_en TEXT,
  file_path TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  desk_id INTEGER DEFAULT NULL,
  token_number INTEGER NOT NULL,
  token_date TEXT NOT NULL,
  language_used TEXT DEFAULT 'np',
  status TEXT DEFAULT 'waiting',
  is_synced INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (desk_id) REFERENCES desks(id) ON DELETE SET NULL
);

-- =========================================================
-- COMPLETE PRODUCTION SEED DATA
-- =========================================================

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

INSERT INTO desks (name, name_np, name_en, location) VALUES
('काउन्टर १', 'काउन्टर १ - व्यक्तिगत घटना दर्ता', 'Counter 1 - Vital Registration', 'भुईंतला - कोठा १०१'),
('काउन्टर २', 'काउन्टर २ - सिफारिस तथा नागरिकता', 'Counter 2 - Recommendation & Citizenship', 'भुईंतला - कोठा १०२'),
('काउन्टर ३', 'काउन्टर ३ - राजस्व तथा सम्पत्ति कर', 'Counter 3 - Revenue & Property Tax', 'पहिलो तला - कोठा २०१'),
('काउन्टर ४', 'काउन्टर ४ - सामाजिक सुरक्षा भत्ता', 'Counter 4 - Social Security Allowance', 'पहिलो तला - कोठा २०२'),
('काउन्टर ५', 'काउन्टर ५ - नक्सा पास तथा प्राविधिक', 'Counter 5 - Blueprint & Technical', 'दोस्रो तला - कोठा ३०१');

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

-- ================= SERVICES =================

INSERT INTO services (id, category_id, name_np, name_en, name_mai, name_bho, name_new, fee_np, fee_en, processing_time_np, processing_time_en, desk_id, sort_order) VALUES
-- Category 1: Vital Registration
(1, 1, 'जन्मदर्ता प्रमाणपत्र', 'Birth Certificate', 'जन्मदर्ता प्रमाणपत्र', 'जनम प्रमाण पत्र', 'जन्मदर्ता पौ', 'निःशुल्क (३५ दिनभित्र) / रु. ५०', 'Free (within 35 days) / Rs. 50', 'सोही दिन', 'Same day', 1, 1),
(2, 1, 'मृत्युदर्ता प्रमाणपत्र', 'Death Certificate', 'मृत्युदर्ता प्रमाणपत्र', 'मौत प्रमाण पत्र', 'सीगु दर्ता पौ', 'निःशुल्क (३५ दिनभित्र) / रु. ५०', 'Free (within 35 days) / Rs. 50', 'सोही दिन', 'Same day', 1, 2),
(3, 1, 'विवाह दर्ता प्रमाणपत्र', 'Marriage Certificate', 'विवाह दर्ता प्रमाणपत्र', 'बियाह प्रमाण पत्र', 'इहिपा दर्ता पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 3),
(4, 1, 'सम्बन्ध विच्छेद दर्ता', 'Divorce Registration', 'सम्बन्ध विच्छेद दर्ता', 'तलाक दर्ता', 'पारपाचुके दर्ता', 'रु. ५०', 'Rs. 50', '१-३ दिन', '1-3 days', 1, 4),
(5, 1, 'बसाइसराइ दर्ता (आगमन)', 'Migration Registration (Incoming)', 'बसाइसराइ दर्ता (आगमन)', 'बसाइसराइ दर्ता (आगमन)', 'थाय् हिलेगु दर्ता (आगमन)', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 5),
(6, 1, 'बसाइसराइ दर्ता (प्रस्थान)', 'Migration Registration (Outgoing)', 'बसाइसराइ दर्ता (प्रस्थान)', 'बसाइसराइ दर्ता (प्रस्थान)', 'थाय् हिलेगु दर्ता (प्रस्थान)', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 6),
(7, 1, 'जन्मदर्ता प्रमाणपत्र प्रतिलिपि', 'Birth Certificate Copy', 'जन्मदर्ता प्रतिलिपि', 'जनम प्रमाण पत्र के नकल', 'जन्मदर्ता कपी', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 1, 7),
(8, 1, 'व्यक्तिगत घटना संशोधन', 'Vital Record Correction', 'व्यक्तिगत घटना संशोधन', 'नाम-तारीख सुधार', 'घटना संशोधन', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 1, 8),

-- Category 2: Citizenship & Identity
(9, 2, 'नागरिकता सिफारिस (वंशज)', 'Citizenship Recommendation (Descent)', 'नागरिकता सिफारिस', 'नागरिकता सिफारिश', 'नागरिकता सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 1),
(10, 2, 'नागरिकता सिफारिस (वैवाहिक)', 'Citizenship Recommendation (Matrimonial)', 'वैवाहिक नागरिकता सिफारिस', 'शादीशुदा नागरिकता सिफारिश', 'इहिपा नागरिकता सिफारिस', 'निःशुल्क', 'Free', '३-७ दिन', '3-7 days', 2, 2),
(11, 2, 'नाता प्रमाणित सिफारिस', 'Relationship Verification', 'नाता प्रमाणित', 'रिश्ता प्रमाण पत्र', 'थःथिति प्रमाणित', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 3),
(12, 2, 'नागरिकता प्रतिलिपि सिफारिस', 'Citizenship Duplicate Copy', 'नागरिकता प्रतिलिपि', 'नागरिकता के डुप्लीकेट', 'नागरिकता कपी सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 4),
(13, 2, 'नाबालक परिचयपत्र सिफारिस', 'Minor Identity Card', 'नाबालक परिचयपत्र', 'नाबालिग पहचान पत्र', 'नाबालक म्हसीका पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 2, 5),
(14, 2, 'नेपाली नागरिकता पुष्टि सिफारिस', 'Citizenship Confirmation (Foreign)', 'नागरिकता पुष्टि', 'नागरिकता पुष्टि', 'नागरिकता पुष्टि', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 6),

-- Category 3: Land & Property
(15, 3, 'घर नक्सा (भवन निर्माण) पास', 'House Blueprint Approval', 'घरक नक्शा पास', 'घर के नक्शा पास', 'छेँया नक्सा पास', 'क्षेत्रफल अनुसार', 'Based on Area', '७-१५ दिन', '7-15 days', 5, 1),
(16, 3, 'जग्गा दर्ता सिफारिस (लालपुर्जा)', 'Land Registration Recommendation', 'जमीन रजिस्ट्री सिफारिश', 'जमीन रजिस्ट्री सिफारिश', 'जग्गा दर्ता सिफारिस', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 3, 2),
(17, 3, 'चार किल्ला प्रमाणित', 'Four Boundary (Char Killa) Verification', 'चार किल्ला प्रमाणित', 'चारों तरफ के सीमा प्रमाण', 'प्यंगू सिमाना प्रमाणित', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 5, 3),
(18, 3, 'जग्गा नामसारी सिफारिस', 'Land Ownership Transfer (Namsari)', 'जमीन नामसारी', 'जमीन के नाम चढ़ाना', 'जग्गा नामसारी', 'रु. १००', 'Rs. 100', '३-७ दिन', '3-7 days', 3, 4),
(19, 3, 'जग्गा मूल्याङ्कन सिफारिस', 'Land Valuation Certificate', 'जमीन मूल्याङ्कन', 'जमीन के कीमत प्रमाण', 'जग्गा मूल्याङ्कन', 'रु. २००', 'Rs. 200', '३-७ दिन', '3-7 days', 5, 5),
(20, 3, 'घर बाटो प्रमाणित', 'House & Road Access Verification', 'घर बाटो प्रमाणित', 'रास्ता प्रमाण पत्र', 'छेँ लँ प्रमाणित', 'रु. ५०', 'Rs. 50', '१-३ दिन', '1-3 days', 5, 6),
(21, 3, 'मोही लगत कट्टा सिफारिस', 'Tenant Record Clearance (Mohi)', 'मोही लगत कट्टा', 'मोही कटाई', 'मोही लगत कट्टा', 'रु. १००', 'Rs. 100', '७-१५ दिन', '7-15 days', 3, 7),

-- Category 4: Tax & Revenue
(22, 4, 'एकीकृत सम्पत्ति कर (मालपोत)', 'Integrated Property Tax', 'सम्पत्ति कर (मालपोत)', 'सम्पत्ति टैक्स', 'सम्पत्ति कर', 'मूल्याङ्कन अनुसार', 'Per Valuation', 'सोही दिन', 'Same day', 3, 1),
(23, 4, 'व्यापार कर भुक्तानी', 'Business Tax Payment', 'व्यापार कर', 'दुकान के टैक्स', 'व्यापार कर', 'प्रकार अनुसार', 'Per Category', 'सोही दिन', 'Same day', 3, 2),
(24, 4, 'घर बहाल कर भुक्तानी', 'House Rent Tax', 'घर भाड़ा कर', 'मकान किराया टैक्स', 'छेँ बाहाः कर', 'भाडाको १०%', '10% of rent', 'सोही दिन', 'Same day', 3, 3),
(25, 4, 'विज्ञापन तथा साइनबोर्ड कर', 'Advertisement & Signboard Tax', 'साइनबोर्ड कर', 'होर्डिङ बोर्ड टैक्स', 'विज्ञापन कर', 'साइज अनुसार', 'Per Size', 'सोही दिन', 'Same day', 3, 4),
(26, 4, 'स्थानीय सवारी साधन कर', 'Local Vehicle Tax', 'सवारी साधन कर', 'गाड़ी टैक्स', 'सवारी साधन कर', 'प्रकार अनुसार', 'Per Vehicle', 'सोही दिन', 'Same day', 3, 5),
(27, 4, 'कर चुक्ता प्रमाणपत्र', 'Tax Clearance Certificate', 'कर चुक्ता प्रमाण', 'टैक्स चुक्ता रसीद', 'कर चुक्ता पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 3, 6),

-- Category 5: Social Security Allowance
(28, 5, 'जेष्ठ नागरिक भत्ता (७० वर्ष)', 'Senior Citizen Allowance (70+)', 'बुजुर्ग भत्ता (७० वर्ष)', 'बुजुर्ग भत्ता (७० वर्ष)', 'थकाली भत्ता (७० दँ)', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 1),
(29, 5, 'एकल महिला भत्ता (६० वर्ष)', 'Single Women Allowance (60+)', 'एकल महिला भत्ता', 'विधवा / एकल महिला भत्ता', 'एकल मिसा भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 2),
(30, 5, 'पूर्ण अपाङ्गता भत्ता (रातो कार्ड)', 'Full Disability Allowance (Red Card)', 'अपाङ्गता भत्ता (लाल कार्ड)', 'दिव्यांग भत्ता (लाल कार्ड)', 'अपाङ्गता भत्ता (ह्यांगु कार्ड)', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 3),
(31, 5, 'अति अशक्त अपाङ्गता भत्ता (निलो कार्ड)', 'Severe Disability Allowance (Blue Card)', 'अपाङ्गता भत्ता (नील कार्ड)', 'दिव्यांग भत्ता (नील कार्ड)', 'अपाङ्गता भत्ता (वचु कार्ड)', 'निःशुल्क (भत्ता रु. १,६००/महिना)', 'Free (Allowance Rs. 1,600/mo)', '७-१५ दिन', '7-15 days', 4, 4),
(32, 5, 'बाल पोषण भत्ता (५ वर्ष मुनि)', 'Child Nutrition Allowance (Under 5)', 'बाल पोषण भत्ता', 'लईका पोषण भत्ता', 'मचा पोषण भत्ता', 'निःशुल्क (भत्ता रु. ८००/महिना)', 'Free (Allowance Rs. 800/mo)', '७-१५ दिन', '7-15 days', 4, 5),
(33, 5, 'दलित जेष्ठ नागरिक भत्ता (६० वर्ष)', 'Dalit Senior Citizen Allowance (60+)', 'दलित बुजुर्ग भत्ता', 'दलित बुजुर्ग भत्ता', 'दलित थकाली भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 6),
(34, 5, 'लोपोन्मुख आदिवासी जनजाति भत्ता', 'Endangered Indigenous Allowance', 'जनजाति भत्ता', 'जनजाति भत्ता', 'जनजाति भत्ता', 'निःशुल्क (भत्ता रु. ४,०००/महिना)', 'Free (Allowance Rs. 4,000/mo)', '७-१५ दिन', '7-15 days', 4, 7),

-- Category 6: Recommendations
(35, 6, 'चारित्रिक प्रमाणपत्र सिफारिस', 'Character Certificate', 'चारित्रिक प्रमाण', 'चरित्र प्रमाण पत्र', 'चरित्र सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 1),
(36, 6, 'आयस्रोत प्रमाणपत्र सिफारिस', 'Income Certificate', 'आय प्रमाण पत्र', 'कमाई के प्रमाण पत्र', 'आम्दानी सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 2),
(37, 6, 'आर्थिक विपन्नता प्रमाणपत्र', 'Poverty Verification Certificate', 'गरीबी प्रमाण पत्र', 'गरीबी रेखा प्रमाण', 'विपन्नता पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 2, 3),
(38, 6, 'जीवित रहेको प्रमाणपत्र', 'Life / Alive Certificate', 'जीवित प्रमाण', 'जिंदा होखे के प्रमाण', 'म्वानाच्वंगु पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 4),
(39, 6, 'अविवाहित प्रमाणपत्र', 'Unmarried Certificate', 'अविवाहित प्रमाण', 'कुँवारा प्रमाण पत्र', 'मब्याहा पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 5),
(40, 6, 'कोठा/फ्ल्याट बहाल प्रमाणित', 'Room/Flat Rental Verification', 'भाड़ा प्रमाण पत्र', 'किराया प्रमाण पत्र', 'बाहाः प्रमाणित पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 6),
(41, 6, 'संरक्षक प्रमाणपत्र सिफारिस', 'Guardianship Certificate', 'अभिभावक प्रमाण', 'गार्जियन प्रमाण पत्र', 'संरक्षक पौ', 'रु. ५०', 'Rs. 50', '१-३ दिन', '1-3 days', 2, 7),
(42, 6, 'पेन्सन तथा उपदान सिफारिस', 'Pension & Gratuity Recommendation', 'पेन्सन सिफारिस', 'पेंशन सिफारिश', 'पेन्सन सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 8),
(43, 6, 'राहदानी (पासपोर्ट) सिफारिस', 'Passport Recommendation', 'पासपोर्ट सिफारिश', 'पासपोर्ट के सिफारिश', 'राहदानी सिफारिस', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 2, 9),
(44, 6, 'नाम/थर/जन्ममिति संशोधन सिफारिस', 'Name/DOB Correction Recommendation', 'नाम सुधार', 'नाम-जाति सुधार', 'नां-थर संशोधन', 'रु. ५०', 'Rs. 50', '३-७ दिन', '3-7 days', 2, 10),
(45, 6, 'विद्यालय भर्ना तथा छात्रवृत्ति सिफारिस', 'School Admission & Scholarship', 'छात्रवृत्ति सिफारिश', 'स्कूल छात्रवृत्ति सिफारिश', 'छात्रवृत्ति सिफारिस', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 2, 11),

-- Category 7: Business & Trade
(46, 7, 'नयाँ व्यापार/पसल दर्ता', 'New Business Registration', 'नया दोकान दर्ता', 'नया दुकान रजिस्ट्रेशन', 'न्हूगु पसः दर्ता', 'रु. ५०० - २,०००', 'Rs. 500 - 2,000', '३-७ दिन', '3-7 days', 3, 1),
(47, 7, 'व्यापार दर्ता नवीकरण', 'Business Registration Renewal', 'व्यापार रिन्यू', 'दुकान रिन्यूअल', 'पसः दर्ता नवीकरण', 'रु. ५००', 'Rs. 500', '१-३ दिन', '1-3 days', 3, 2),
(48, 7, 'घरेलु तथा साना उद्योग दर्ता सिफारिस', 'Cottage Industry Registration', 'घरेलु उद्योग दर्ता', 'लघु उद्योग रजिस्ट्रेशन', 'घरेलु उद्योग दर्ता', 'रु. ५००', 'Rs. 500', '७-१५ दिन', '7-15 days', 3, 3),
(49, 7, 'स्थायी लेखा नम्बर (PAN) सिफारिस', 'PAN Number Recommendation', 'प्यान कार्ड सिफारिश', 'पैन कार्ड के सिफारिश', 'प्यान सिफारिस पौ', 'रु. ५०', 'Rs. 50', 'सोही दिन', 'Same day', 3, 4),
(50, 7, 'व्यावसायिक स्थल प्रमाणित', 'Business Premises Verification', 'व्यवसाय स्थल प्रमाण', 'दुकान के जगह प्रमाण', 'पसः थाय् प्रमाणित', 'रु. ५०', 'Rs. 50', '१-३ दिन', '1-3 days', 3, 5),

-- Category 8: Construction & Technical
(51, 8, 'भवन निर्माण अनुमति पत्र', 'Building Construction Permit', 'घर बनावे के अनुमति', 'मकान बनावे के परमिट', 'छेँ दनेगु अनुमति', 'क्षेत्रफल अनुसार', 'Based on Area', '७-३० दिन', '7-30 days', 5, 1),
(52, 8, 'भवन निर्माण सम्पन्न प्रमाणपत्र', 'Building Completion Certificate', 'घर निर्माण सम्पन्न प्रमाण', 'मकान कम्प्लीशन सर्टिफिकेट', 'छेँ निर्माण सम्पन्न पौ', 'रु. ५००', 'Rs. 500', '७-१५ दिन', '7-15 days', 5, 2),
(53, 8, 'पुरानो भवन मापदण्ड प्रमाणित', 'Old Building Standard Certificate', 'पुरान घर मापदण्ड', 'पुरान मकान मापदण्ड', 'पुलांगु छेँ मापदण्ड', 'रु. ५००', 'Rs. 500', '७-१५ दिन', '7-15 days', 5, 3),
(54, 8, 'खानेपानी तथा ढल निकास जडान', 'Water & Drainage Connection Permit', 'पानी-ढल लाइन अनुमति', 'पानी-नाला जोड़े के परमिट', 'लः व ध्वः स्वायेगु अनुमति', 'रु. ५००', 'Rs. 500', '३-७ दिन', '3-7 days', 5, 4),

-- Category 9: Disaster Management
(55, 9, 'विपद् पीडित प्रमाणपत्र', 'Disaster Victim Certificate', 'आपदा पीड़ित प्रमाण', 'विपदा राहत प्रमाण पत्र', 'विपद् पीडित पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 4, 1),
(56, 9, 'विपद् क्षति विवरण लगत', 'Disaster Damage Assessment', 'क्षति विवरण', 'नुकसानी के विवरण', 'क्षति विवरण', 'निःशुल्क', 'Free', '३-७ दिन', '3-7 days', 4, 2),
(57, 9, 'पुनर्स्थापना तथा राहत सिफारिस', 'Relief & Rehabilitation Recommendation', 'राहत सिफारिश', 'राहत आ मदद सिफारिश', 'राहत सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 4, 3),

-- Category 10: Education & Health
(58, 10, 'सामुदायिक छात्रवृत्ति सिफारिस', 'Community Scholarship Recommendation', 'छात्रवृत्ति सिफारिश', 'छात्रवृत्ति के सिफारिश', 'छात्रवृत्ति सिफारिस', 'निःशुल्क', 'Free', '१-३ दिन', '1-3 days', 2, 1),
(59, 10, 'अस्पताल उपचार सहुलियत सिफारिस', 'Hospital Medical Relief Recommendation', 'अस्पताल छूट सिफारिश', 'दवाई इलाज छूट सिफारिश', 'अस्पताल वासः सहुलियत', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 4, 2),
(60, 10, 'बालबालिका नियमित खोप कार्ड र जानकारी', 'Child Vaccination Card & Info', 'खोप कार्ड', 'टीका कार्ड', 'खोप पौ', 'निःशुल्क', 'Free', 'सोही दिन', 'Same day', 4, 3);

-- ================= DOCUMENTS FOR ALL 60 SERVICES =================

INSERT INTO documents (service_id, name_np, name_en, note_np, sort_order) VALUES
-- Service 1: Birth
(1, 'बाबु र आमाको नागरिकता प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Father and Mother Citizenship', 'दुवैको अनिवार्य', 1),
(1, 'अस्पताल वा स्वास्थ्य संस्थाको जन्म प्रमाणपत्र', 'Hospital Birth Certificate', 'अस्पतालमा जन्म भएमा', 2),
(1, 'बाबु-आमाको विवाह दर्ता प्रमाणपत्र', 'Parents Marriage Certificate', NULL, 3),
(1, 'बच्चाको हालसालको पासपोर्ट फोटो (२ प्रति)', 'Child Passport Photos', '२ प्रति', 4),
(1, 'सूचक (दर्ता गराउने) को नागरिकता प्रमाणपत्र', 'Informant Citizenship Certificate', 'यदि बाबुआमा बाहेक अरु भए', 5),

-- Service 2: Death
(2, 'मृतकको नागरिकता प्रमाणपत्र (सक्कल)', 'Deceased Citizenship Certificate', 'सक्कल र प्रतिलिपि', 1),
(2, 'सूचक (दर्ता गराउने) को नागरिकता प्रमाणपत्र', 'Informant Citizenship Certificate', NULL, 2),
(2, 'अस्पतालको मृत्यु प्रमाणपत्र वा शवपरीक्षण प्रतिवेदन', 'Hospital Death Certificate', 'अस्पतालमा मृत्यु भएमा', 3),
(2, 'मृतकको हालसालको फोटो (२ प्रति)', 'Photo of Deceased', '२ प्रति', 4),
(2, 'प्रहरी प्रतिवेदन (दुर्घटना वा अप्राकृतिक मृत्युमा)', 'Police Report', 'आवश्यक भएमा', 5),

-- Service 3: Marriage
(3, 'दुलहा र दुलही दुवैको नागरिकता प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Bride and Groom Citizenship', 'दुवै उपस्थित हुनुपर्ने', 1),
(3, 'दुवैको हालसालको पासपोर्ट साइज फोटो (३-३ प्रति)', 'Passport Photos of Both', '३-३ प्रति', 2),
(3, 'कम्तीमा ३ जना साक्षीहरूको नागरिकता प्रमाणपत्र', 'Citizenship of 3 Witnesses', 'साक्षीहरू उपस्थित हुनुपर्छ', 3),
(3, 'दुलहा-दुलहीको संयुक्त फोटो (२ प्रति)', 'Joint Photo of Couple', '२ प्रति', 4),
(3, '२० वर्ष उमेर पुगेको प्रमाण', 'Age Proof (20+ Years)', NULL, 5),

-- Service 4: Divorce
(4, 'अदालतको सम्बन्ध विच्छेद फैसलाको प्रमाणित प्रतिलिपि', 'Court Divorce Decree Certified Copy', 'अनिवार्य सक्कल', 1),
(4, 'दुवै पक्षको नागरिकता प्रमाणपत्र', 'Citizenship of Both Parties', NULL, 2),
(4, 'विवाह दर्ता प्रमाणपत्रको सक्कल प्रतिलिपि', 'Original Marriage Certificate', NULL, 3),
(4, 'हालसालको पासपोर्ट फोटो (२-२ प्रति)', 'Passport Photos', '२-२ प्रति', 4),

-- Service 5: Migration In
(5, 'अघिल्लो वडा/गाउँपालिकाबाट जारी बसाइसराइ प्रमाणपत्र (सक्कल)', 'Previous Migration Certificate', 'सक्कल अनिवार्य', 1),
(5, 'निवेदक तथा परिवारका सदस्यहरूको नागरिकता र जन्मदर्ता', 'Citizenship and Birth Certificates of Family', NULL, 2),
(5, 'यस वडामा बसोबासको प्रमाण (घरजग्गा लालपुर्जा वा बहाल सम्झौता)', 'Proof of Residence in this Ward', NULL, 3),
(5, 'परिवारका सबै सदस्यहरूको पासपोर्ट फोटो', 'Passport Photos of Family Members', '२-२ प्रति', 4),

-- Service 6: Migration Out
(6, 'निवेदकको नागरिकता प्रमाणपत्र', 'Applicant Citizenship Certificate', NULL, 1),
(6, 'जाने ठाउँको ठेगाना खुल्ने प्रमाण', 'Proof of Destination Address', NULL, 2),
(6, 'वडा कार्यालयमा कर तथा बक्यौता चुक्ता भएको रसिद', 'Ward Tax Clearance Receipt', 'चालू वर्षको', 3),
(6, 'परिवारका सदस्यहरूको विवरण तथा फोटो', 'Family Details and Photos', NULL, 4),

-- Service 7: Birth Copy
(7, 'पुरानो जन्मदर्ताको प्रतिलिपि वा दर्ता नम्बर', 'Old Birth Certificate Copy or Reg Number', NULL, 1),
(7, 'बाबु वा आमाको नागरिकता प्रमाणपत्र', 'Parent Citizenship Certificate', NULL, 2),
(7, 'निवेदकको निवेदन पत्र', 'Application Letter', NULL, 3),

-- Service 8: Vital Correction
(8, 'साविक दर्ता प्रमाणपत्र (सक्कल)', 'Original Registration Certificate', NULL, 1),
(8, 'सच्याउनुपर्ने प्रमाण खुल्ने कागजात (शैक्षिक प्रमाणपत्र वा नागरिकता)', 'Supporting Evidence (School Cert or Citizenship)', NULL, 2),
(8, 'वडा मुचुल्का तथा निवेदन पत्र', 'Ward Recommendation Letter & Application', NULL, 3),

-- Service 9: Citizenship Descent
(9, 'बाबु र आमाको नेपाली नागरिकता प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Father and Mother Citizenship (Original)', 'अनिवार्य सक्कल', 1),
(9, 'निवेदकको जन्मदर्ता प्रमाणपत्र (सक्कल)', 'Birth Registration Certificate', NULL, 2),
(9, 'शैक्षिक योग्यताको प्रमाणपत्र (SEE/SLC वा कक्षा ८)', 'Academic Certificate (SEE/SLC or Grade 8)', 'उमेर प्रमाणित गर्न', 3),
(9, 'हालसालै खिचेको पासपोर्ट साइज फोटो (५ प्रति)', 'Passport Size Photos', '५ प्रति', 4),
(9, 'विवाहित महिलाको हकमा विवाह दर्ता र पतिको नागरिकता', 'Marriage Certificate & Husband Citizenship for Women', NULL, 5),
(9, 'वडा अध्यक्ष वा सदस्यको रोहबरमा व्यक्तिगत सनाखत', 'Personal Verification before Ward Official', 'उपस्थिति अनिवार्य', 6),

-- Service 10: Matrimonial Citizenship
(10, 'नेपाली पतिको नागरिकता प्रमाणपत्र (सक्कल)', 'Nepali Husband Citizenship Certificate', 'सक्कल अनिवार्य', 1),
(10, 'विवाह दर्ता प्रमाणपत्र (सक्कल)', 'Marriage Registration Certificate', NULL, 2),
(10, 'विदेशी नागरिकता त्यागेको प्रमाण वा त्याग गर्ने कारबाही चलाएको निस्सा', 'Proof of Renouncing Foreign Citizenship', NULL, 3),
(10, 'हालसालै खिचेको पासपोर्ट फोटो (५ प्रति)', 'Passport Photos', '५ प्रति', 4),

-- Service 11: Relationship Verification
(11, 'निवेदकको नागरिकता प्रमाणपत्र', 'Applicant Citizenship Certificate', NULL, 1),
(11, 'नाता प्रमाणित गर्नुपर्ने सबै व्यक्तिको नागरिकता वा जन्मदर्ता', 'Citizenship/Birth Cert of Related Persons', NULL, 2),
(11, 'नाता खुल्ने पारिवारिक कागजात (विवाह दर्ता वा जन्मदर्ता)', 'Family Documents Proving Relationship', NULL, 3),
(11, 'कम्तीमा २ जना स्थानीय व्यक्तिको सनाखत', 'Local Witnesses Identification', '२ जना', 4),

-- Service 12: Citizenship Duplicate
(12, 'हराएको/बिग्रिएको नागरिकताको नम्बर खुल्ने विवरण', 'Lost Citizenship Details/Number', NULL, 1),
(12, 'प्रहरी चौकीको प्रतिवेदन (हराएको हकमा)', 'Police Report for Lost Document', NULL, 2),
(12, 'हालसालको पासपोर्ट फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 3),
(12, 'निवेदकको नागरिकताको प्रतिलिपि (उपलब्ध भए)', 'Citizenship Photocopy (if available)', NULL, 4),

-- Service 13: Minor ID
(13, 'नाबालकको जन्मदर्ता प्रमाणपत्र', 'Minor Birth Certificate', NULL, 1),
(13, 'बाबु वा आमाको नागरिकता प्रमाणपत्र', 'Parent Citizenship Certificate', NULL, 2),
(13, 'विद्यालयको परिचयपत्र वा सिफारिस पत्र', 'School ID Card or Letter', NULL, 3),
(13, 'हालसालको पासपोर्ट फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 4),

-- Service 14: Citizenship Confirmation
(14, 'निवेदकको नेपाली नागरिकता प्रमाणपत्र', 'Nepali Citizenship Certificate', NULL, 1),
(14, 'राहदानी (पासपोर्ट) को प्रतिलिपि', 'Passport Copy', NULL, 2),
(14, 'निवेदन पत्र र पासपोर्ट फोटो (२ प्रति)', 'Application Letter & Photos', '२ प्रति', 3),

-- Service 15: Blueprint Approval
(15, 'जग्गाधनी लालपुर्जा प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Land Ownership Certificate (Original + Copy)', NULL, 1),
(15, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(15, 'इजाजत प्राप्त इन्जिनियरले तयार गरेको नक्सा डिजाइन (३ प्रति)', 'Blueprint by Certified Licensed Engineer', '३ प्रति नक्सा', 3),
(15, 'चार किल्ला प्रमाणित सिफारिस पत्र', 'Four Boundary (Char Killa) Certificate', NULL, 4),
(15, 'चालू आर्थिक वर्षको सम्पत्ति कर तिरेको रसिद', 'Property Tax Clearance Receipt', 'चालू वर्षको', 5),
(15, 'छिमेकीहरूको सहमति पत्र र नागरिकता प्रतिलिपि', 'Neighbor Consent Letter & Citizenship', NULL, 6),

-- Service 16: Land Registration
(16, 'जग्गाको कित्ता नापी नक्सा (ट्रेस नक्सा)', 'Cadastral Survey Trace Map', NULL, 1),
(16, 'तिरो/कर तिरेको रसिद', 'Land Tax Receipt', NULL, 2),
(16, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 3),
(16, 'पुरानो स्रेस्ता वा मोहियानी कागजात', 'Historical Records or Tenancy Documents', NULL, 4),

-- Service 17: Four Boundary
(17, 'जग्गाधनी लालपुर्जा प्रमाणपत्र', 'Land Ownership Certificate', 'सक्कल र प्रतिलिपि', 1),
(17, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(17, 'नापी शाखाको कित्ता नक्सा', 'Cadastral Map of Land Parcel', NULL, 3),
(17, 'छिमेकी साँध-सिमानाको सहमति मुचुल्का', 'Neighbor Boundary Agreement Witness', NULL, 4),
(17, 'सम्पत्ति कर चुक्ता रसिद', 'Property Tax Receipt', NULL, 5),

-- Service 18: Land Transfer (Namsari)
(18, 'मृतक जग्गाधनीको मृत्युदर्ता प्रमाणपत्र', 'Deceased Landowner Death Certificate', NULL, 1),
(18, 'मृतकको नागरिकता प्रमाणपत्र', 'Deceased Citizenship Certificate', NULL, 2),
(18, 'हकदारहरूको नाता प्रमाणित प्रमाणपत्र', 'Relationship Verification of All Legal Heirs', NULL, 3),
(18, 'सबै हकदारहरूको नागरिकता प्रमाणपत्र', 'Citizenship of All Legal Heirs', NULL, 4),
(18, 'जग्गाधनी लालपुर्जा (सक्कल)', 'Original Land Ownership Certificate', 'सक्कल अनिवार्य', 5),
(18, 'हकदारहरू बीचको सहमति पत्र / मञ्जुरीनामा', 'Consent/Agreement among Heirs', NULL, 6),

-- Service 19: Land Valuation
(19, 'जग्गाधनी लालपुर्जा प्रमाणपत्र', 'Land Ownership Certificate', NULL, 1),
(19, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(19, 'सरकारी न्यूनतम मूल्याङ्कन दर अनुसारको विवरण', 'Government Rate Valuation Sheet', NULL, 3),
(19, 'सम्पत्ति कर चुक्ता रसिद', 'Property Tax Clearance Receipt', NULL, 4),

-- Service 20: House & Road
(20, 'जग्गाधनी लालपुर्जा', 'Land Ownership Certificate', NULL, 1),
(20, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(20, 'नक्सा ट्रेस र बाटोको चौडाइ खुल्ने प्राविधिक विवरण', 'Cadastral Trace & Road Width Technical Detail', NULL, 3),
(20, 'सम्पत्ति कर रसिद', 'Property Tax Receipt', NULL, 4),

-- Service 21: Mohi Clearance
(21, 'जग्गाधनी र मोहीको नागरिकता प्रमाणपत्र', 'Landowner and Tenant Citizenship', NULL, 1),
(21, 'जग्गाधनी लालपुर्जा र मोही प्रमाण पत्र', 'Land Ownership & Tenant Certificates', NULL, 2),
(21, 'दुवै पक्ष बीचको मिलापत्र वा सहमति पत्र', 'Settlement Agreement between Both Parties', NULL, 3),

-- Service 22: Property Tax
(22, 'जग्गाधनी लालपुर्जा', 'Land Ownership Certificate', NULL, 1),
(22, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(22, 'अघिल्लो वर्षको कर तिरेको रसिद', 'Previous Year Tax Receipt', 'पहिलो पटक भए आवश्यक छैन', 3),
(22, 'घर भए नक्सा पास प्रमाणपत्र वा नापजाँच फारम', 'House Blueprint or Measurement Form', NULL, 4),

-- Service 23: Business Tax
(23, 'व्यापार दर्ता प्रमाणपत्र', 'Business Registration Certificate', NULL, 1),
(23, 'अघिल्लो वर्षको व्यापार कर रसिद', 'Previous Business Tax Receipt', NULL, 2),
(23, 'स्थायी लेखा नम्बर (PAN) प्रमाणपत्र', 'PAN Certificate', NULL, 3),
(23, 'पसल/फर्मको स्थलगत विवरण', 'Business Premises Detail', NULL, 4),

-- Service 24: House Rent Tax
(24, 'घरधनीको नागरिकता प्रमाणपत्र', 'House Owner Citizenship', NULL, 1),
(24, 'घर बहाल सम्झौता पत्र', 'House Rental Agreement', NULL, 2),
(24, 'बहाल रकम खुल्ने विवरण', 'Monthly Rent Details', NULL, 3),
(24, 'सम्पत्ति कर रसिद', 'Property Tax Receipt', NULL, 4),

-- Service 25: Signboard Tax
(25, 'व्यवसाय दर्ता प्रमाणपत्र', 'Business Registration Certificate', NULL, 1),
(25, 'विज्ञापन बोर्डको साइज र स्थान विवरण', 'Signboard Size & Location Spec', NULL, 2),
(25, 'घरधनीको सहमति पत्र (यदि अरूको घरमा भए)', 'House Owner Consent Letter', NULL, 3),

-- Service 26: Vehicle Tax
(26, 'सवारी धनी दर्ता किताब (ब्लुबुक - Bluebook)', 'Vehicle Registration Book (Bluebook)', 'सक्कल र प्रतिलिपि', 1),
(26, 'सवारी चालक अनुमतिपत्र (लाइसेन्स)', 'Driver License', NULL, 2),
(26, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 3),

-- Service 27: Tax Clearance
(27, 'सबै प्रकारका स्थानीय कर बुझाएको रसिदहरू', 'All Local Tax Receipts Paid', 'सम्पत्ति र व्यापार कर', 1),
(27, 'नागरिकता वा व्यवसाय दर्ता प्रमाणपत्र', 'Citizenship or Business Reg Certificate', NULL, 2),
(27, 'निवेदन पत्र', 'Application Letter', NULL, 3),

-- Service 28: Senior Citizen
(28, 'नेपाली नागरिकता प्रमाणपत्र (उमेर ७० वर्ष पूरा भएको)', 'Citizenship Certificate (Age 70+)', 'उमेर ७० वर्ष पूरा', 1),
(28, 'हालसालै खिचेको पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Size Photos', '३ प्रति', 2),
(28, 'वडामा बसोबासको प्रमाण (मतदाता परिचयपत्र वा बसाइसराइ)', 'Proof of Ward Residence', NULL, 3),
(28, 'स्थानीय बैंक खाताको चेकबुक वा पासबुक प्रतिलिपि', 'Local Bank Account Details/Passbook', 'भत्ता जम्मा हुने खाता', 4),

-- Service 29: Single Women
(29, 'नेपाली नागरिकता प्रमाणपत्र (उमेर ६० वर्ष पूरा भएको)', 'Citizenship Certificate (Age 60+)', NULL, 1),
(29, 'पतिको मृत्युदर्ता प्रमाणपत्र (विधवाको हकमा)', 'Husband Death Certificate (for Widows)', NULL, 2),
(29, 'अविवाहितको हकमा अविवाहित प्रमाणित पत्र', 'Unmarried Certificate (for Unmarried Women)', NULL, 3),
(29, 'पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 4),
(29, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 5),

-- Service 30: Full Disability
(30, 'अपाङ्गता परिचयपत्र (रातो कार्ड - सक्कल र प्रतिलिपि)', 'Disability ID Card (Red Card Original + Copy)', 'रातो कार्ड अनिवार्य', 1),
(30, 'नागरिकता प्रमाणपत्र (नाबालक भए जन्मदर्ता र संरक्षकको नागरिकता)', 'Citizenship or Minor Birth Cert', NULL, 2),
(30, 'पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 3),
(30, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 4),

-- Service 31: Severe Disability
(31, 'अपाङ्गता परिचयपत्र (निलो कार्ड - सक्कल र प्रतिलिपि)', 'Disability ID Card (Blue Card Original + Copy)', 'निलो कार्ड अनिवार्य', 1),
(31, 'नागरिकता प्रमाणपत्र वा जन्मदर्ता', 'Citizenship or Birth Certificate', NULL, 2),
(31, 'पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 3),
(31, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 4),

-- Service 32: Child Nutrition
(32, 'बच्चाको जन्मदर्ता प्रमाणपत्र (५ वर्ष मुनि)', 'Child Birth Certificate (Under 5 Years)', NULL, 1),
(32, 'आमाको नागरिकता प्रमाणपत्र', 'Mother Citizenship Certificate', NULL, 2),
(32, 'स्वास्थ्य संस्थाबाट जारी खोप कार्डको प्रतिलिपि', 'Child Vaccination Card Copy', NULL, 3),
(32, 'पासपोर्ट साइज फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 4),
(32, 'आमाको बैंक खाता विवरण', 'Mother Bank Account Details', NULL, 5),

-- Service 33: Dalit Senior Citizen
(33, 'नेपाली नागरिकता प्रमाणपत्र (उमेर ६० वर्ष पूरा भएको)', 'Citizenship Certificate (Age 60+)', 'उमेर ६० वर्ष पूरा', 1),
(33, 'थर खुल्ने दलित प्रमाणित पत्र', 'Dalit Verification Certificate', NULL, 2),
(33, 'पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 3),
(33, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 4),

-- Service 34: Endangered Indigenous
(34, 'नागरिकता प्रमाणपत्र वा जन्मदर्ता', 'Citizenship or Birth Certificate', NULL, 1),
(34, 'जनजाति आयोग वा वडाबाट जारी लोपोन्मुख जाति प्रमाणित पत्र', 'Endangered Indigenous Tribe Certificate', NULL, 2),
(34, 'पासपोर्ट साइज फोटो (३ प्रति)', 'Passport Photos', '३ प्रति', 3),
(34, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 4),

-- Service 35: Character Certificate
(35, 'नेपाली नागरिकता प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Nepali Citizenship Certificate', 'सक्कल र प्रतिलिपि', 1),
(35, 'हालसालको पासपोर्ट साइज फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 2),
(35, 'वडाका स्थानीय २ जना बासिन्दाको सनाखत', 'Witness Identification by 2 Local Residents', NULL, 3),

-- Service 36: Income Verification
(36, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 1),
(36, 'आयस्रोत खुल्ने प्रमाण (तलब पत्र, बहाल सम्झौता, व्यापार कर रसिद)', 'Income Proof (Salary Slip, Rent Agreement, Tax Receipt)', NULL, 2),
(36, 'जग्गाधनी लालपुर्जा (जग्गा भए)', 'Land Ownership Certificate (if land owned)', NULL, 3),
(36, 'निवेदन पत्र', 'Application Letter', NULL, 4),

-- Service 37: Poverty Certificate
(37, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 1),
(37, 'वडा सर्जमिन मुचुल्का', 'Ward Inquest/Field Investigation Report', NULL, 2),
(37, 'परिवारको आर्थिक स्थिति खुल्ने निवेदन', 'Family Economic Hardship Application', NULL, 3),
(37, 'छात्रवृत्ति वा उपचार प्रयोजन खुल्ने पत्र', 'Scholarship or Hospital Purpose Letter', NULL, 4),

-- Service 38: Alive Certificate
(38, 'निवेदकको नागरिकता प्रमाणपत्र', 'Applicant Citizenship Certificate', NULL, 1),
(38, 'पेन्सन पट्टा (पेन्सनवालाको हकमा)', 'Pension Book (for Pensioners)', NULL, 2),
(38, 'सम्बन्धित व्यक्तिको वडा कार्यालयमा सशरीर व्यक्तिगत उपस्थिति', 'Physical Personal Presence of Applicant', 'उपस्थिति अनिवार्य', 3),

-- Service 39: Unmarried Certificate
(39, 'निवेदकको नागरिकता प्रमाणपत्र (सक्कल)', 'Applicant Citizenship (Original)', NULL, 1),
(39, 'हालसालको पासपोर्ट फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 2),
(39, 'स्थानीय २ जना साक्षी र तिनको नागरिकता', '2 Local Witnesses and their Citizenship', NULL, 3),
(39, 'वडा सर्जमिन मुचुल्का', 'Ward Field Investigation Report', NULL, 4),

-- Service 40: Flat Rental Verification
(40, 'बहालमा बस्नेको नागरिकता', 'Tenant Citizenship Certificate', NULL, 1),
(40, 'घरधनीको नागरिकता र लालपुर्जा', 'House Owner Citizenship and Land Certificate', NULL, 2),
(40, 'घर बहाल सम्झौता पत्र', 'House Rental Agreement', NULL, 3),
(40, 'बहाल कर तिरेको रसिद', 'Rental Tax Paid Receipt', NULL, 4),

-- Service 41: Guardianship
(41, 'संरक्षक र संरक्षित व्यक्तिको नागरिकता वा जन्मदर्ता', 'Guardian and Dependent Citizenship/Birth Cert', NULL, 1),
(41, 'नाता खुल्ने प्रमाण', 'Relationship Document', NULL, 2),
(41, 'स्थानीय साक्षी मुचुल्का', 'Local Witness Statement', NULL, 3),

-- Service 42: Pension Recommendation
(42, 'सेवा निवृत्त परिचयपत्र (पेन्सन पट्टा)', 'Pensioner Identity Card/Book', NULL, 1),
(42, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(42, 'कार्यालयबाट जारी अवकाश पत्र', 'Retirement Letter from Government/Office', NULL, 3),
(42, 'पासपोर्ट फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 4),

-- Service 43: Passport Recommendation
(43, 'नेपाली नागरिकता प्रमाणपत्र (सक्कल र प्रतिलिपि)', 'Nepali Citizenship Certificate', 'सक्कल अनिवार्य', 1),
(43, 'राष्ट्रिय परिचयपत्र (NID) नम्बर वा कार्ड', 'National ID (NID) Number or Card', 'NID अनिवार्य', 2),
(43, 'हालसालको पासपोर्ट साइज फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 3),
(43, 'पुरानो पासपोर्ट (नवीकरण भए)', 'Old Passport (if renewal)', NULL, 4),

-- Service 44: Name/DOB Correction
(44, 'साविक कागजातको सक्कल प्रतिलिपि', 'Original Copy of Previous Document', NULL, 1),
(44, 'सच्याउनुपर्ने आधार खुल्ने प्रमाण (शैक्षिक प्रमाणपत्र वा नागरिकता)', 'Supporting Academic Certificate or Citizenship', NULL, 2),
(44, 'स्थानीय सर्जमिन मुचुल्का', 'Local Field Investigation Statement', NULL, 3),

-- Service 45: School Admission
(45, 'विद्यार्थीको जन्मदर्ता प्रमाणपत्र', 'Student Birth Certificate', NULL, 1),
(45, 'अभिभावकको नागरिकता प्रमाणपत्र', 'Parent Citizenship Certificate', NULL, 2),
(45, 'विद्यालयको पत्र वा भर्ना फारम', 'School Admission Letter or Form', NULL, 3),
(45, 'विपन्न वा जेहेन्दार खुल्ने प्रमाण', 'Proof of Merit or Poverty', NULL, 4),

-- Service 46: Business Registration
(46, 'प्रोप्राइटरको नागरिकता प्रमाणपत्र', 'Proprietor Citizenship Certificate', NULL, 1),
(46, 'पसल/फर्म सञ्चालन हुने ठाउँको घर बहाल सम्झौता (आफ्नै घर भए लालपुर्जा)', 'Rental Agreement (or Land Ownership if Own Building)', NULL, 2),
(46, 'पासपोर्ट साइज फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 3),
(46, 'व्यवसायको नाम र उद्देश्य खुल्ने विवरण', 'Business Name and Objectives Document', NULL, 4),
(46, 'घरधनीको नागरिकता र कर रसिद', 'Landlord Citizenship and Property Tax Receipt', NULL, 5),

-- Service 47: Business Renewal
(47, 'साविक व्यापार दर्ता प्रमाणपत्र (सक्कल)', 'Original Business Registration Certificate', 'सक्कल अनिवार्य', 1),
(47, 'चालू आर्थिक वर्षको कर चुक्ता प्रमाणपत्र', 'Current Year Tax Clearance Certificate', NULL, 2),
(47, 'प्रोप्राइटरको नागरिकता प्रमाणपत्र', 'Proprietor Citizenship Certificate', NULL, 3),
(47, 'स्थायी लेखा नम्बर (PAN) प्रमाणपत्र', 'PAN Certificate', NULL, 4),

-- Service 48: Cottage Industry
(48, 'सञ्चालकको नागरिकता प्रमाणपत्र', 'Operator/Proprietor Citizenship', NULL, 1),
(48, 'उद्योगको विस्तृत कार्ययोजना (Proposal)', 'Detailed Industry Project Proposal', NULL, 2),
(48, 'वातावरणीय प्रभाव तथा छिमेकी सहमति मुचुल्का', 'Environmental Impact & Neighbor Consent Statement', NULL, 3),
(48, 'जग्गा वा भवन सम्झौता पत्र', 'Land/Building Lease Agreement', NULL, 4),

-- Service 49: PAN Recommendation
(49, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 1),
(49, 'व्यवसाय दर्ता प्रमाणपत्र (फर्म भए)', 'Business Registration Certificate', NULL, 2),
(49, 'पासपोर्ट साइज फोटो (२ प्रति)', 'Passport Photos', '२ प्रति', 3),
(49, 'बहाल सम्झौता पत्र', 'Rental Lease Agreement', NULL, 4),

-- Service 50: Business Premises
(50, 'व्यापार दर्ता प्रमाणपत्र', 'Business Registration Certificate', NULL, 1),
(50, 'घरधनी लालपुर्जा वा बहाल सम्झौता', 'Land Ownership or Rent Agreement', NULL, 2),
(50, 'व्यवसाय स्थलको कित्ता नक्सा', 'Cadastral Map of Business Site', NULL, 3),
(50, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 4),

-- Service 51: Construction Permit
(51, 'जग्गाधनी लालपुर्जा (सक्कल र प्रतिलिपि)', 'Land Ownership Certificate (Original + Copy)', 'सक्कल अनिवार्य', 1),
(51, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(51, 'इजाजत प्राप्त इन्जिनियरले तयार गरेको नक्सा डिजाइन (३ प्रति)', 'Blueprint by Certified Licensed Engineer', '३ प्रति', 3),
(51, 'चार किल्ला प्रमाणित सिफारिस पत्र', 'Four Boundary (Char Killa) Certificate', NULL, 4),
(51, 'चालू आर्थिक वर्षको सम्पत्ति कर तिरेको रसिद', 'Property Tax Clearance Receipt', 'चालू वर्षको', 5),
(51, 'छिमेकी सहमति पत्र र नागरिकता प्रतिलिपि', 'Neighbor Consent Letter & Citizenship', NULL, 6),
(51, 'माटो परीक्षण प्रतिवेदन (आवश्यक भए)', 'Soil Test Report (if applicable)', NULL, 7),

-- Service 52: Building Completion
(52, 'भवन निर्माण अनुमति पत्रको प्रतिलिपि', 'Building Permit Copy', NULL, 1),
(52, 'पास भएको नक्साको प्रतिलिपि', 'Approved Blueprint Copy', NULL, 2),
(52, 'निर्माण सम्पन्न भएको इन्जिनियरको प्राविधिक प्रतिवेदन', 'Engineer Completion Technical Report', NULL, 3),
(52, 'घरको हालसालै खिचिएको फोटो (४ दिशाबाट)', 'Recent Photos of House (from 4 sides)', '४ वटा फोटो', 4),
(52, 'सम्पत्ति कर चुक्ता रसिद', 'Property Tax Receipt', NULL, 5),

-- Service 53: Old Building Standard
(53, 'जग्गाधनी लालपुर्जा', 'Land Ownership Certificate', NULL, 1),
(53, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(53, 'पुराना भवनको स्थलगत नापजाँच प्रतिवेदन', 'Field Measurement Technical Report', NULL, 3),
(53, 'सम्पत्ति कर रसिद', 'Property Tax Receipt', NULL, 4),
(53, 'छिमेकी मुचुल्का', 'Neighbor Field Statement', NULL, 5),

-- Service 54: Water & Drainage
(54, 'जग्गाधनी लालपुर्जा', 'Land Ownership Certificate', NULL, 1),
(54, 'नक्सा पास प्रमाणपत्र वा घर प्रमाण', 'Approved Blueprint or House Certificate', NULL, 2),
(54, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 3),
(54, 'खानेपानी पाइपलाइनको दूरी विवरण', 'Water Supply Pipeline Distance Detail', NULL, 4),
(54, 'सम्पत्ति कर रसिद', 'Property Tax Receipt', NULL, 5),

-- Service 55: Disaster Victim
(55, 'निवेदकको नागरिकता प्रमाणपत्र', 'Applicant Citizenship Certificate', NULL, 1),
(55, 'विपद् (बाढी, पहिरो, आगलागी) बाट भएको क्षतिको फोटो', 'Photos of Disaster Damage', NULL, 2),
(55, 'प्रहरी चौकीको स्थलगत प्रतिवेदन', 'Police Inquest Report', NULL, 3),
(55, 'वडा मुचुल्का', 'Ward Field Investigation Statement', NULL, 4),

-- Service 56: Damage Assessment
(56, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 1),
(56, 'जग्गाधनी लालपुर्जा (घर/जग्गा क्षति भए)', 'Land Ownership Certificate (if property damaged)', NULL, 2),
(56, 'क्षतिको विवरण फाराम', 'Damage Assessment Detail Form', NULL, 3),
(56, 'स्थानीय प्रत्यक्षदर्शी साक्षीको मुचुल्का', 'Local Eyewitness Statements', NULL, 4),

-- Service 57: Disaster Relief
(57, 'विपद् पीडित प्रमाणपत्र', 'Disaster Victim Certificate', NULL, 1),
(57, 'नागरिकता प्रमाणपत्र', 'Citizenship Certificate', NULL, 2),
(57, 'परिवारका सदस्यहरूको विवरण', 'Family Member Details', NULL, 3),
(57, 'बैंक खाता विवरण', 'Bank Account Details', NULL, 4),

-- Service 58: Scholarship
(58, 'विद्यार्थीको जन्मदर्ता वा नागरिकता प्रमाणपत्र', 'Student Birth Certificate or Citizenship', NULL, 1),
(58, 'अघिल्लो कक्षाको लब्धाङ्क पत्र (Marksheet)', 'Previous Grade Marksheet/Report Card', NULL, 2),
(58, 'अभिभावकको नागरिकता र विपन्नता प्रमाणपत्र', 'Parent Citizenship & Poverty Certificate', NULL, 3),
(58, 'विद्यालयको सिफारिस पत्र', 'School Recommendation Letter', NULL, 4),

-- Service 59: Medical Relief
(59, 'बिरामीको नागरिकता वा जन्मदर्ता', 'Patient Citizenship or Birth Certificate', NULL, 1),
(59, 'अस्पतालको चिकित्सक प्रेस्क्रिप्सन र भर्ना पत्र', 'Doctor Prescription & Hospital Admission Letter', NULL, 2),
(59, 'वडा विपन्नता प्रमाणपत्र', 'Ward Poverty/Economic Hardship Certificate', NULL, 3),
(59, 'कुरुवा वा अभिभावकको नागरिकता', 'Guardian/Caretaker Citizenship', NULL, 4),

-- Service 60: Vaccination Info
(60, 'बच्चाको जन्मदर्ता प्रमाणपत्र', 'Child Birth Certificate', NULL, 1),
(60, 'आमाबाबुको नागरिकता प्रमाणपत्र', 'Parents Citizenship Certificate', NULL, 2),
(60, 'स्वास्थ्य संस्थाको खोप कार्ड', 'Official Health Center Vaccination Card', NULL, 3);
