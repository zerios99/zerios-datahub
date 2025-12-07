import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Damascus Districts with Neighborhoods
const damascusDistricts = [
  {
    nameAr: 'دمشق القديمة',
    nameEn: 'Old Damascus',
    neighborhoods: [
      'الجورة',
      'العمارة الجوانية',
      'باب توما',
      'القيمرية',
      'الحميدية',
      'الحريقة',
      'الأمين',
      'مئذنة الشحم',
      'شاغور جواني',
    ],
  },
  {
    nameAr: 'ساروجة',
    nameEn: 'Sarouja',
    neighborhoods: [
      'سوق ساروجة',
      'العقيبة',
      'العمارة البرانية',
      'مسجد الأقصاب',
      'القصاع',
      'العدوي',
      'القصور',
      'فارس الخوري',
    ],
  },
  {
    nameAr: 'القنوات',
    nameEn: 'Al-Qanawat',
    neighborhoods: [
      'القنوات',
      'الحجاز',
      'البرامكة',
      'باب الجابية',
      'باب سريجة',
      'السويقة',
      'قبر عاتكة',
      'المجتهد',
      'الأنصاري',
    ],
  },
  {
    nameAr: 'جوبر',
    nameEn: 'Jobar',
    neighborhoods: ['جوبر الشرقي', 'جوبر الغربي', 'المأمونية', 'الاستقلال'],
  },
  {
    nameAr: 'الميدان',
    nameEn: 'Al-Midan',
    neighborhoods: ['ميدان وسطاني', 'الزاهرة', 'الحقلة', 'الدقاق', 'القاعة', 'باب مصلى'],
  },
  {
    nameAr: 'الشاغور',
    nameEn: 'Al-Shaghour',
    neighborhoods: [
      'شاغور براني',
      'باب شرقي',
      'ابن عساكر',
      'النضال',
      'الوحدة',
      'بلال',
      'روضة الميدان',
      'الزهور',
      'التضامن',
    ],
  },
  {
    nameAr: 'القدم',
    nameEn: 'Al-Qadam',
    neighborhoods: [
      'السيدة عائشة',
      'القدم',
      'المصطفى',
      'الشريباتي',
      'العسالي',
      'القدم الشرقي',
    ],
  },
  {
    nameAr: 'كفر سوسة',
    nameEn: 'Kafr Sousa',
    neighborhoods: ['كفرسوسة البلد', 'الإخلاص', 'الواحة', 'الفردوس', 'اللوان'],
  },
  {
    nameAr: 'المزة',
    nameEn: 'Al-Mazzeh',
    neighborhoods: [
      'الربوة',
      'المزة القديمة (الشيخ سعد)',
      'الجلاء',
      'مزة جبل',
      'فيلات شرقية',
      'فيلات غربية',
      'مزة 86',
      'مزة بساتين (خلف الرازي)',
    ],
  },
  {
    nameAr: 'دمر',
    nameEn: 'Dummar',
    neighborhoods: [
      'مشروع دمر (ضاحية دمر)',
      'دمر الشرقية',
      'دمر الغربية',
      'العرين',
      'الورود',
    ],
  },
  {
    nameAr: 'برزة',
    nameEn: 'Barzeh',
    neighborhoods: [
      'برزة البلد',
      'مساكن برزة',
      'المنارة',
      'العباس',
      'النزهة',
      'عش الورور',
    ],
  },
  {
    nameAr: 'القابون',
    nameEn: 'Qaboun',
    neighborhoods: ['تشرين', 'القابون', 'المصانع'],
  },
  {
    nameAr: 'ركن الدين',
    nameEn: 'Rukn al-Din',
    neighborhoods: ['أسد الدين', 'النقشبندي (الشيخ خالد)', 'الأيوبية', 'الفيحاء'],
  },
  {
    nameAr: 'الصالحية',
    nameEn: 'Al-Salihiyah',
    neighborhoods: [
      'قاسيون',
      'أبو جرش',
      'الشيخ محي الدين',
      'المدارس',
      'المزرعة',
      'الشهداء',
    ],
  },
  {
    nameAr: 'المهاجرين',
    nameEn: 'Al-Muhajireen',
    neighborhoods: [
      'شورى',
      'المصطبة',
      'المرابط',
      'الروضة',
      'أبو رمانة',
      'المالكي',
      'الحبوبي',
    ],
  },
  {
    nameAr: 'اليرموك',
    nameEn: 'Yarmouk',
    neighborhoods: ['الكرمل'],
  },
];

// Aleppo Districts
const aleppoDistricts = [
  { nameAr: 'منطقة جبل سمعان', nameEn: 'Jabal Saman (Mount Simeon)', neighborhoods: [] },
  { nameAr: 'منطقة عفرين', nameEn: 'Afrin', neighborhoods: [] },
  { nameAr: 'منطقة أعزاز', nameEn: 'Azaz', neighborhoods: [] },
  { nameAr: 'منطقة الباب', nameEn: 'Al-Bab', neighborhoods: [] },
  { nameAr: 'منطقة منبج', nameEn: 'Manbij', neighborhoods: [] },
  { nameAr: 'منطقة جرابلس', nameEn: 'Jarabulus', neighborhoods: [] },
  { nameAr: 'منطقة عين العرب', nameEn: 'Ayn al-Arab (Kobani)', neighborhoods: [] },
  { nameAr: 'منطقة السفيرة', nameEn: 'As-Safira', neighborhoods: [] },
  { nameAr: 'منطقة الأتارب', nameEn: 'Atarib', neighborhoods: [] },
  { nameAr: 'منطقة دير حافر', nameEn: 'Dayr Hafir', neighborhoods: [] },
];

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create a test user
  const userPassword = await bcrypt.hash('user123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Created test user:', user.email);

  // Seed Damascus districts and neighborhoods
  console.log('\nSeeding Damascus districts...');
  for (const district of damascusDistricts) {
    const city = await prisma.city.create({
      data: {
        nameAr: district.nameAr,
        nameEn: district.nameEn,
        governorate: 'Damascus',
        neighborhoods: {
          create: district.neighborhoods.map((name) => ({
            nameAr: name,
          })),
        },
      },
    });
    console.log(
      `  Created: ${district.nameEn} with ${district.neighborhoods.length} neighborhoods`
    );
  }

  // Seed Aleppo districts
  console.log('\nSeeding Aleppo districts...');
  for (const district of aleppoDistricts) {
    const city = await prisma.city.create({
      data: {
        nameAr: district.nameAr,
        nameEn: district.nameEn,
        governorate: 'Aleppo',
      },
    });
    console.log(`  Created: ${district.nameEn}`);
  }

  console.log('\n--- Login Credentials ---');
  console.log('Admin: admin@example.com / admin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
