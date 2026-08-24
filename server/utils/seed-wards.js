import db from '../config/db.js';

async function seedMultipleWards() {
  console.log('🌱 Ensuring ward_number column and seeding sample wards in Nepal...');

  try {
    await db.query('ALTER TABLE ward_info ADD COLUMN ward_number INTEGER DEFAULT 32');
  } catch (e) {
    // Column already exists
  }

  // Update existing single row if exists to ward_number 32
  await db.query('UPDATE ward_info SET ward_number = 32 WHERE ward_number IS NULL');

  const sampleWards = [
    {
      ward_number: 1,
      ward_name_np: 'वडा नं. १ कार्यालय',
      ward_name_en: 'Ward No. 1 Office',
      municipality_np: 'काठमाडौं महानगरपालिका',
      municipality_en: 'Kathmandu Metropolitan City',
      district_np: 'काठमाडौं',
      province_np: 'बागमती प्रदेश',
      address_np: 'नक्साल, काठमाडौं',
      phone: '०१-४४१२३४५',
      chairperson_name_np: 'भरतलाल श्रेष्ठ',
      secretary_name_np: 'रमेश कुमार पोखरेल',
      chairperson_phone: '९८५१०१११११',
      secretary_phone: '९८५१०२२२२२',
      office_hours_np: '१०:०० - ५:००',
    },
    {
      ward_number: 2,
      ward_name_np: 'वडा नं. २ कार्यालय',
      ward_name_en: 'Ward No. 2 Office',
      municipality_np: 'काठमाडौं महानगरपालिका',
      municipality_en: 'Kathmandu Metropolitan City',
      district_np: 'काठमाडौं',
      province_np: 'बागमती प्रदेश',
      address_np: 'लाजिम्पाट, काठमाडौं',
      phone: '०१-४४२३४५६',
      chairperson_name_np: 'राजेन्द्र कुमार श्रेष्ठ',
      secretary_name_np: 'सुनिता शर्मा',
      chairperson_phone: '९८५१०३३३३३',
      secretary_phone: '९८५१०४४४४४',
      office_hours_np: '१०:०० - ५:००',
    },
    {
      ward_number: 3,
      ward_name_np: 'वडा नं. ३ कार्यालय',
      ward_name_en: 'Ward No. 3 Office',
      municipality_np: 'काठमाडौं महानगरपालिका',
      municipality_en: 'Kathmandu Metropolitan City',
      district_np: 'काठमाडौं',
      province_np: 'बागमती प्रदेश',
      address_np: 'महाराजगञ्ज, काठमाडौं',
      phone: '०१-४४३४५६७',
      chairperson_name_np: 'प्रेम थापा',
      secretary_name_np: 'कृष्ण प्रसाद अधिकारी',
      chairperson_phone: '९८५१०५५५५५',
      secretary_phone: '९८५१०६६६६६',
      office_hours_np: '१०:०० - ५:००',
    },
    {
      ward_number: 16,
      ward_name_np: 'वडा नं. १६ कार्यालय',
      ward_name_en: 'Ward No. 16 Office',
      municipality_np: 'काठमाडौं महानगरपालिका',
      municipality_en: 'Kathmandu Metropolitan City',
      district_np: 'काठमाडौं',
      province_np: 'बागमती प्रदेश',
      address_np: 'बालाजु, काठमाडौं',
      phone: '०१-४३५६७८९',
      chairperson_name_np: 'मुकुन्द रिजाल',
      secretary_name_np: 'प्रकाश भट्टराई',
      chairperson_phone: '९८५१०७७७७७',
      secretary_phone: '९८५१०८८८८८',
      office_hours_np: '१०:०० - ५:००',
    },
    {
      ward_number: 32,
      ward_name_np: 'वडा नं. ३२ कार्यालय',
      ward_name_en: 'Ward No. 32 Office',
      municipality_np: 'काठमाडौं महानगरपालिका',
      municipality_en: 'Kathmandu Metropolitan City',
      district_np: 'काठमाडौं',
      province_np: 'बागमती प्रदेश',
      address_np: 'कोटेश्वर, काठमाडौं',
      phone: '०१-४६००१२३',
      chairperson_name_np: 'नवराज पराजुली',
      secretary_name_np: 'सीता देवी अधिकारी',
      chairperson_phone: '९८५१०९९९९९',
      secretary_phone: '९८५१६५४३२१',
      office_hours_np: '१०:०० - ५:००',
    },
  ];

  for (const w of sampleWards) {
    const [existing] = await db.query('SELECT id FROM ward_info WHERE ward_number = ?', [w.ward_number]);
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO ward_info (ward_number, ward_name_np, ward_name_en, municipality_np, municipality_en, district_np, province_np, address_np, phone, chairperson_name_np, secretary_name_np, chairperson_phone, secretary_phone, office_hours_np)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [w.ward_number, w.ward_name_np, w.ward_name_en, w.municipality_np, w.municipality_en, w.district_np, w.province_np, w.address_np, w.phone, w.chairperson_name_np, w.secretary_name_np, w.chairperson_phone, w.secretary_phone, w.office_hours_np]
      );
    }
  }

  console.log('✅ Multi-Ward records populated in database!');
  process.exit(0);
}

seedMultipleWards();
