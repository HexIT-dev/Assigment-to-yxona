import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const OWNERS = [
  { firstName: 'Jasur',    lastName: 'Toshmatov',   username: 'jasur_t',    phone: '998901110001', email: 'jasur@elegance.uz' },
  { firstName: 'Dilnoza',  lastName: 'Yusupova',    username: 'dilnoza_y',  phone: '998901110002', email: 'dilnoza@elegance.uz' },
  { firstName: 'Bobur',    lastName: 'Karimov',     username: 'bobur_k',    phone: '998901110003', email: 'bobur@elegance.uz' },
  { firstName: 'Malika',   lastName: 'Rahimova',    username: 'malika_r',   phone: '998901110004', email: 'malika@elegance.uz' },
  { firstName: 'Sherzod',  lastName: 'Nazarov',     username: 'sherzod_n',  phone: '998901110005', email: 'sherzod@elegance.uz' },
  { firstName: 'Zulfiya',  lastName: 'Ergasheva',   username: 'zulfiya_e',  phone: '998901110006', email: 'zulfiya@elegance.uz' },
  { firstName: 'Otabek',   lastName: 'Mirzayev',    username: 'otabek_m',   phone: '998901110007', email: 'otabek@elegance.uz' },
  { firstName: 'Feruza',   lastName: 'Sobirov',     username: 'feruza_s',   phone: '998901110008', email: 'feruza@elegance.uz' },
  { firstName: 'Ulugbek',  lastName: 'Xolmatov',    username: 'ulugbek_x',  phone: '998901110009', email: 'ulugbek@elegance.uz' },
  { firstName: 'Nasiba',   lastName: 'Qodirov',     username: 'nasiba_q',   phone: '998901110010', email: 'nasiba@elegance.uz' },
];

const DISTRICTS = [
  "Yunusobod", "Mirobod", "Chilonzor", "Mirzo Ulug'bek",
  "Shayxontohur", "Uchtepa", "Yashnobod", "Olmazor",
  "Sergeli", "Yakkasaroy",
];

const HALL_NAMES = [
  "Versailles Palace", "Royal Garden", "Sahro Saroyi", "Bahor To'yxonasi",
  "Navbahor Hall", "Sharq Saroyi", "Gulshan Banquet", "Oltin Zal",
  "Hayot Saroyi", "Farovon Hall", "Nur Saroyi", "Baraka Hall",
  "Yangi Hayot", "Saodat Saroyi", "Bahrom Hall", "Zafar Saroyi",
  "Najot Hall", "Diyor Saroyi", "Mehr Hall", "Tahsin Saroyi",
];

const IMAGES = [
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80",
];

async function main() {
  console.log('Seeding database...');
  const hashedPassword = await bcrypt.hash('1234', 10);

  let hallNameIndex = 0;

  for (let i = 0; i < OWNERS.length; i++) {
    const ownerData = OWNERS[i];
    const district = DISTRICTS[i % DISTRICTS.length];

    // Upsert owner
    const owner = await prisma.user.upsert({
      where: { username: ownerData.username },
      update: {},
      create: {
        ...ownerData,
        password: hashedPassword,
        role: 'OWNER',
        isVerified: true,
        balance: Math.floor(Math.random() * 50000000) + 5000000,
      },
    });
    console.log(`✓ Owner: ${owner.firstName} ${owner.lastName}`);

    // 2-3 halls per owner
    const hallCount = i < 5 ? 2 : 3;
    for (let j = 0; j < hallCount; j++) {
      const hallName = HALL_NAMES[hallNameIndex % HALL_NAMES.length];
      hallNameIndex++;
      const capacity = [150, 200, 250, 300, 400, 500][Math.floor(Math.random() * 6)];
      const pricePerSeat = [80000, 100000, 120000, 150000, 180000, 200000][Math.floor(Math.random() * 6)];

      const existingHall = await prisma.toyxona.findFirst({
        where: { name: hallName, ownerId: owner.id },
      });

      if (!existingHall) {
        const hall = await prisma.toyxona.create({
          data: {
            name: hallName,
            district: DISTRICTS[(i + j) % DISTRICTS.length],
            address: `${DISTRICTS[(i + j) % DISTRICTS.length]}, ko'cha ${i * 2 + j + 1}, ${i + j + 1}-uy`,
            capacity,
            pricePerSeat,
            phone: `+99890111${String(i * 10 + j).padStart(4, '0')}`,
            status: 'APPROVED',
            ownerId: owner.id,
            images: {
              create: [
                { url: IMAGES[(i + j) % IMAGES.length], is360: false },
                { url: IMAGES[(i + j + 1) % IMAGES.length], is360: j === 0 },
              ],
            },
            services: {
              create: [
                { type: 'MENU', name: 'Premium Menu', price: 50000 },
                { type: 'MUSIC', name: 'DJ Service', price: 3000000 },
                { type: 'DECOR', name: 'Gul bezaklari', price: 2000000 },
              ],
            },
          },
        });
        console.log(`  ✓ Hall: ${hall.name} (${hall.district})`);
      } else {
        console.log(`  - Hall already exists: ${hallName}`);
      }
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('Owners: 10 (password: 1234)');
  console.log('Halls: 25 (2-3 per owner, all APPROVED)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
