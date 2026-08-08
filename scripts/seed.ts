import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FarmSea Direct AI database...\n');

  // Clean up existing data (reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await db.auditLog.deleteMany();
  await db.moderationAction.deleteMany();
  await db.cartItem.deleteMany();
  await db.message.deleteMany();
  await db.wishlist.deleteMany();
  await db.sustainabilityScore.deleteMany();
  await db.notification.deleteMany();
  await db.review.deleteMany();
  await db.aiMatchingLog.deleteMany();
  await db.aiFreshnessLog.deleteMany();
  await db.aiDemandPrediction.deleteMany();
  await db.aiPriceHistory.deleteMany();
  await db.fisherIgnoredOrder.deleteMany();
  await db.fisherSuspension.deleteMany();
  await db.fisherWarning.deleteMany();
  await db.fisherTrustScore.deleteMany();
  await db.farmerTrustScore.deleteMany();
  await db.circularExchange.deleteMany();
  await db.circularListing.deleteMany();
  await db.deliverySalary.deleteMany();
  await db.deliveryPerformance.deleteMany();
  await db.deliveryAssignment.deleteMany();
  await db.booking.deleteMany();
  await db.payment.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.adminProfile.deleteMany();
  await db.deliveryProfile.deleteMany();
  await db.fisherProfile.deleteMany();
  await db.farmerProfile.deleteMany();
  await db.customerProfile.deleteMany();
  await db.user.deleteMany();
  console.log('   ✅ Database cleaned\n');

  const counts: Record<string, number> = {};

  // =====================================================
  // 1. USERS — 3 per role = 15 total
  // =====================================================
  console.log('📦 Creating users...');

  const customers = await db.user.createMany({
    data: [
      { email: 'priya.murugan@email.com', phone: '9876543210', passwordHash: 'hashed_demo_password', name: 'Priya Murugan', role: 'CUSTOMER', isOnline: true, language: 'ta' },
      { email: 'karthik.raja@email.com', phone: '9876543211', passwordHash: 'hashed_demo_password', name: 'Karthik Raja', role: 'CUSTOMER', language: 'ta' },
      { email: 'meena.devi@email.com', phone: '9876543212', passwordHash: 'hashed_demo_password', name: 'Meena Devi', role: 'CUSTOMER', isOnline: true, language: 'en' },
    ],
  });
  counts.users = customers.count;

  const farmers = await db.user.createMany({
    data: [
      { email: 'selvam.kandasamy@email.com', phone: '9876543220', passwordHash: 'hashed_demo_password', name: 'Selvam Kandasamy', role: 'FARMER', isOnline: true, language: 'ta' },
      { email: 'lakshmi.aachi@email.com', phone: '9876543221', passwordHash: 'hashed_demo_password', name: 'Lakshmi Aachi', role: 'FARMER', language: 'ta' },
      { email: 'murugan.velayutham@email.com', phone: '9876543222', passwordHash: 'hashed_demo_password', name: 'Murugan Velayutham', role: 'FARMER', isOnline: true, language: 'en' },
    ],
  });
  counts.users += farmers.count;

  const fishers = await db.user.createMany({
    data: [
      { email: 'thangavel.pattinam@email.com', phone: '9876543230', passwordHash: 'hashed_demo_password', name: 'Thangavel Pattinam', role: 'FISHER', isOnline: true, language: 'ta' },
      { email: 'rajakumar.fisher@email.com', phone: '9876543231', passwordHash: 'hashed_demo_password', name: 'Rajakumar Fisher', role: 'FISHER', language: 'ta' },
      { email: 'arumugam.kuppam@email.com', phone: '9876543232', passwordHash: 'hashed_demo_password', name: 'Arumugam Kuppam', role: 'FISHER', isOnline: true, language: 'ta' },
    ],
  });
  counts.users += fishers.count;

  const deliveries = await db.user.createMany({
    data: [
      { email: 'suresh.delivery@email.com', phone: '9876543240', passwordHash: 'hashed_demo_password', name: 'Suresh Kumar', role: 'DELIVERY', isOnline: true, language: 'ta' },
      { email: 'vijay.delivery@email.com', phone: '9876543241', passwordHash: 'hashed_demo_password', name: 'Vijay Anand', role: 'DELIVERY', language: 'en' },
      { email: 'kumar.delivery@email.com', phone: '9876543242', passwordHash: 'hashed_demo_password', name: 'Kumar Durai', role: 'DELIVERY', isOnline: true, language: 'ta' },
    ],
  });
  counts.users += deliveries.count;

  const admins = await db.user.createMany({
    data: [
      { email: 'admin.farmsea@email.com', phone: '9876543250', passwordHash: 'hashed_demo_password', name: 'Admin Ramachandran', role: 'ADMIN', isOnline: true, language: 'en' },
      { email: 'moderator1.farmsea@email.com', phone: '9876543251', passwordHash: 'hashed_demo_password', name: 'Moderator Subha', role: 'ADMIN', language: 'en' },
      { email: 'support.farmsea@email.com', phone: '9876543252', passwordHash: 'hashed_demo_password', name: 'Support Priya', role: 'ADMIN', isOnline: true, language: 'en' },
    ],
  });
  counts.users += admins.count;

  console.log(`   ✅ ${counts.users} users created\n`);

  // Fetch created users by role
  const customerUsers = await db.user.findMany({ where: { role: 'CUSTOMER' }, orderBy: { createdAt: 'asc' } });
  const farmerUsers = await db.user.findMany({ where: { role: 'FARMER' }, orderBy: { createdAt: 'asc' } });
  const fisherUsers = await db.user.findMany({ where: { role: 'FISHER' }, orderBy: { createdAt: 'asc' } });
  const deliveryUsers = await db.user.findMany({ where: { role: 'DELIVERY' }, orderBy: { createdAt: 'asc' } });
  const adminUsers = await db.user.findMany({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });

  // =====================================================
  // 2. PROFILES
  // =====================================================
  console.log('👤 Creating profiles...');

  // Customer Profiles
  const customerProfiles = await db.customerProfile.createMany({
    data: [
      { userId: customerUsers[0].id, addressLine1: '45, Anna Nagar East', addressLine2: 'Near KFC', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', latitude: 13.0865, longitude: 80.2206, deliveryRadiusKm: 20, preferredLanguage: 'ta', totalOrders: 12, totalSpent: 4560 },
      { userId: customerUsers[1].id, addressLine1: '12, RS Puram', city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641002', latitude: 11.0168, longitude: 76.9558, deliveryRadiusKm: 30, preferredLanguage: 'ta', totalOrders: 8, totalSpent: 3240 },
      { userId: customerUsers[2].id, addressLine1: '78, North Masi Street', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001', latitude: 9.9252, longitude: 78.1198, deliveryRadiusKm: 15, preferredLanguage: 'en', totalOrders: 5, totalSpent: 2100 },
    ],
  });
  counts.customerProfiles = customerProfiles.count;

  // Farmer Profiles
  const farmerProfiles = await db.farmerProfile.createMany({
    data: [
      { userId: farmerUsers[0].id, verificationStatus: 'VERIFIED', farmName: 'Selvam Organic Farm', farmAddress: 'Village Road, Vadaku Pudur', farmCity: 'Coimbatore', farmState: 'Tamil Nadu', farmPincode: '641101', latitude: 11.08, longitude: 76.98, farmSizeAcres: 5.2, farmingType: 'Organic', certifications: '{"organic": true, "pgsIndia": true}', farmEquipment: '{"tractor": 1, "dripIrrigation": true}', productCategories: '["VEGETABLES","FRUITS","GRAINS"]', totalSales: 245, totalRevenue: 187500, bankAccount: '1234567890123456', ifscCode: 'CNRB0001234', upiId: 'selvam@upi' },
      { userId: farmerUsers[1].id, verificationStatus: 'VERIFIED', farmName: 'Lakshmi Dairy & Farms', farmAddress: 'Main Road, Pallapatti', farmCity: 'Madurai', farmState: 'Tamil Nadu', farmPincode: '625014', latitude: 9.93, longitude: 78.14, farmSizeAcres: 3.8, farmingType: 'Mixed Dairy & Crops', certifications: '{"fssai": "12345678901234"}', farmEquipment: '{"milkingMachine": 1, "coldStorage": true}', productCategories: '["MILK","GHEE","CURD","BUTTERMILK"]', totalSales: 312, totalRevenue: 245000, bankAccount: '2345678901234567', ifscCode: 'SBIN0005678', upiId: 'lakshmi.aachi@upi' },
      { userId: farmerUsers[2].id, verificationStatus: 'VERIFIED', farmName: 'Murugan Spice Gardens', farmAddress: 'Hill Road, Kodaikanal', farmCity: 'Madurai', farmState: 'Tamil Nadu', farmPincode: '625101', latitude: 10.23, longitude: 77.48, farmSizeAcres: 8.0, farmingType: 'Spice & Honey Farming', certifications: '{"organic": true, "spiceBoard": true}', farmEquipment: '{"honeyExtractor": 1, "dryingRack": true}', productCategories: '["SPICES","HONEY","PICKLES","GRAINS","DAL"]', totalSales: 189, totalRevenue: 320000, bankAccount: '3456789012345678', ifscCode: 'PUNB0009012', upiId: 'murugan.spice@upi' },
    ],
  });
  counts.farmerProfiles = farmerProfiles.count;

  // Fisher Profiles
  const fisherProfiles = await db.fisherProfile.createMany({
    data: [
      { userId: fisherUsers[0].id, verificationStatus: 'VERIFIED', boatName: 'Sea Queen', boatNumber: 'TN-FC-1234', boatType: 'Mechanised', fishingArea: 'Bay of Bengal', harborAddress: 'Fisheries Road, Kasimedu', harborCity: 'Chennai', harborState: 'Tamil Nadu', harborPincode: '600013', latitude: 13.11, longitude: 80.30, certifications: '{"fishingLicense": true, "iceFacility": true}', boatEquipment: '{"gps": true, "sonar": true, "iceBox": 3}', productCategories: '["FRESH_FISH","LIVE_FISH","DRY_FISH"]', totalSales: 420, totalRevenue: 560000, bankAccount: '4567890123456789', ifscCode: 'IOBA0003456', upiId: 'thangavel.fish@upi' },
      { userId: fisherUsers[1].id, verificationStatus: 'VERIFIED', boatName: 'Deep Sea Star', boatNumber: 'TN-FC-5678', boatType: 'Mechanised', fishingArea: 'Palk Strait', harborAddress: 'Harbor Road, Pamban', harborCity: 'Ramanathapuram', harborState: 'Tamil Nadu', harborPincode: '623526', latitude: 9.28, longitude: 79.20, certifications: '{"fishingLicense": true}', boatEquipment: '{"gps": true, "iceBox": 2}', productCategories: '["FRESH_FISH","FISH_PICKLES","FISH_MASALAS"]', totalSales: 285, totalRevenue: 390000, bankAccount: '5678901234567890', ifscCode: 'UBIN0007890', upiId: 'raja.fish@upi' },
      { userId: fisherUsers[2].id, verificationStatus: 'VERIFIED', boatName: 'Kadal Osai', boatNumber: 'TN-FC-9012', boatType: 'Country Boat', fishingArea: 'Gulf of Mannar', harborAddress: 'Jetty Road, Akkarapettai', harborCity: 'Nagapattinam', harborState: 'Tamil Nadu', harborPincode: '611001', latitude: 10.77, longitude: 79.84, certifications: '{"fishingLicense": true}', boatEquipment: '{"iceBox": 1}', productCategories: '["FRESH_FISH","DRY_FISH","FISH_WASTE"]', totalSales: 156, totalRevenue: 178000, bankAccount: '6789012345678901', ifscCode: 'TMBL0012345', upiId: 'arumugam.fish@upi' },
    ],
  });
  counts.fisherProfiles = fisherProfiles.count;

  // Delivery Profiles
  const deliveryProfiles = await db.deliveryProfile.createMany({
    data: [
      { userId: deliveryUsers[0].id, vehicleType: 'Motorcycle', vehicleNumber: 'TN-01-AB-1234', licenseNumber: 'TN0120200012345', baseCity: 'Chennai', latitude: 13.06, longitude: 80.23, isAvailable: true, monthlySalary: 18000, totalEarnings: 54000, totalDeliveries: 320, currentLatitude: 13.07, currentLongitude: 80.24 },
      { userId: deliveryUsers[1].id, vehicleType: 'Van', vehicleNumber: 'TN-22-CD-5678', licenseNumber: 'TN2220200056789', baseCity: 'Coimbatore', latitude: 11.02, longitude: 76.96, isAvailable: true, monthlySalary: 22000, totalEarnings: 66000, totalDeliveries: 210, currentLatitude: 11.01, currentLongitude: 76.97 },
      { userId: deliveryUsers[2].id, vehicleType: 'Motorcycle', vehicleNumber: 'TN-38-EF-9012', licenseNumber: 'TN3820200090123', baseCity: 'Madurai', latitude: 9.93, longitude: 78.12, isAvailable: false, monthlySalary: 17000, totalEarnings: 34000, totalDeliveries: 185 },
    ],
  });
  counts.deliveryProfiles = deliveryProfiles.count;

  // Admin Profiles
  const adminProfiles = await db.adminProfile.createMany({
    data: [
      { userId: adminUsers[0].id, adminLevel: 3, department: 'Operations' },
      { userId: adminUsers[1].id, adminLevel: 2, department: 'Moderation' },
      { userId: adminUsers[2].id, adminLevel: 1, department: 'Customer Support' },
    ],
  });
  counts.adminProfiles = adminProfiles.count;

  // Fetch profile IDs
  const fProfiles = await db.farmerProfile.findMany({ orderBy: { createdAt: 'asc' } });
  const fiProfiles = await db.fisherProfile.findMany({ orderBy: { createdAt: 'asc' } });
  const dProfiles = await db.deliveryProfile.findMany({ orderBy: { createdAt: 'asc' } });
  const aProfiles = await db.adminProfile.findMany({ orderBy: { createdAt: 'asc' } });

  console.log(`   ✅ ${counts.customerProfiles} customer, ${counts.farmerProfiles} farmer, ${counts.fisherProfiles} fisher, ${counts.deliveryProfiles} delivery, ${counts.adminProfiles} admin profiles\n`);

  // =====================================================
  // 3. PRODUCTS — Farmer & Fisher products
  // =====================================================
  console.log('🥬 Creating products...');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 172800000);

  const farmerProducts = await db.product.createMany({
    data: [
      // Farmer 1 (Selvam) - Vegetables, Fruits, Grains
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'VEGETABLES', name: 'Organic Tomato (Nattu Thakkali)', description: 'Fresh organic tomatoes from Coimbatore, naturally ripened on the vine', price: 40, unit: 'kg', quantityAvailable: 150, minOrderQty: 1, maxOrderQty: 50, isOrganic: true, harvestDate: yesterday, freshnessScore: 92, storageTemp: 20, originLocation: 'Coimbatore', tags: '[["organic"],["tamil nadu"],["farm fresh"]]', isActive: true, viewsCount: 234, soldCount: 89, carbonScore: 85 },
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'VEGETABLES', name: 'Green Chillies (Pachai Milagai)', description: 'Spicy green chillies, perfect for South Indian cooking', price: 60, unit: 'kg', quantityAvailable: 80, minOrderQty: 0.5, isOrganic: true, harvestDate: yesterday, freshnessScore: 95, storageTemp: 22, originLocation: 'Coimbatore', tags: '[["organic"],["spicy"],["fresh"]]', isActive: true, viewsCount: 156, soldCount: 45, carbonScore: 88 },
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'VEGETABLES', name: 'Drumstick (Murungakkai)', description: 'Fresh drumsticks directly from farm, organic', price: 35, unit: 'kg', quantityAvailable: 60, minOrderQty: 1, isOrganic: true, harvestDate: twoDaysAgo, freshnessScore: 88, originLocation: 'Coimbatore', tags: '[["organic"],["drumstick"]]', isActive: true, viewsCount: 98, soldCount: 32, carbonScore: 90 },
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'FRUITS', name: 'Organic Bananas (Nendran)', description: 'Kerala-style Nendran bananas, great for chips and payasam', price: 50, unit: 'dozen', quantityAvailable: 200, minOrderQty: 1, isOrganic: true, harvestDate: twoDaysAgo, freshnessScore: 90, originLocation: 'Coimbatore', tags: '[["organic"],["nendran"],["banana"]]', isActive: true, viewsCount: 312, soldCount: 145, carbonScore: 82 },
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'FRUITS', name: 'Guava (Koyya)', description: 'Fresh guavas from organic orchard, sweet and crunchy', price: 45, unit: 'kg', quantityAvailable: 75, minOrderQty: 1, isOrganic: true, harvestDate: yesterday, freshnessScore: 93, originLocation: 'Coimbatore', tags: '[["organic"],["guava"],["vitamin C"]]', isActive: true, viewsCount: 87, soldCount: 28, carbonScore: 87 },
      { sellerId: farmerUsers[0].id, sellerType: 'FARMER', category: 'GRAINS', name: 'Organic Rice (Mapillai Samba)', description: 'Traditional Mapillai Samba rice, rich in nutrients', price: 85, unit: 'kg', quantityAvailable: 500, minOrderQty: 5, maxOrderQty: 100, isOrganic: true, harvestDate: new Date(now.getTime() - 2592000000), freshnessScore: 96, originLocation: 'Coimbatore', tags: '[["organic"],["traditional"],["mapillai samba"]]', isActive: true, viewsCount: 445, soldCount: 210, carbonScore: 92 },

      // Farmer 2 (Lakshmi) - Dairy products
      { sellerId: farmerUsers[1].id, sellerType: 'FARMER', category: 'MILK', name: 'A2 Cow Milk (Jersey)', description: 'Fresh A2 milk from grass-fed Jersey cows, delivered morning and evening', price: 60, unit: 'litre', quantityAvailable: 100, minOrderQty: 1, maxOrderQty: 20, harvestDate: yesterday, freshnessScore: 98, storageTemp: 4, originLocation: 'Madurai', tags: '[["a2"],["fresh"],["morning milk"]]', isActive: true, viewsCount: 567, soldCount: 890, carbonScore: 78 },
      { sellerId: farmerUsers[1].id, sellerType: 'FARMER', category: 'GHEE', name: 'Desi Ghee (Nattu Nei)', description: 'Hand-churned desi ghee from A2 cow milk, traditional method', price: 750, unit: 'litre', quantityAvailable: 25, minOrderQty: 0.25, maxOrderQty: 5, isOrganic: true, harvestDate: new Date(now.getTime() - 604800000), freshnessScore: 97, storageTemp: 25, originLocation: 'Madurai', tags: '[["desi ghee"],["a2"],["hand churned"]]', isActive: true, viewsCount: 789, soldCount: 120, carbonScore: 80 },
      { sellerId: farmerUsers[1].id, sellerType: 'FARMER', category: 'CURD', name: 'Fresh Curd (Thayir)', description: 'Set curd from natural culture, thick and creamy', price: 45, unit: 'litre', quantityAvailable: 80, minOrderQty: 0.5, maxOrderQty: 10, harvestDate: yesterday, freshnessScore: 96, storageTemp: 8, originLocation: 'Madurai', tags: '[["fresh"],["set curd"],["natural culture"]]', isActive: true, viewsCount: 234, soldCount: 450, carbonScore: 76 },
      { sellerId: farmerUsers[1].id, sellerType: 'FARMER', category: 'BUTTERMILK', name: 'Spiced Buttermilk (Moru)', description: 'Traditional Tamil spiced buttermilk with ginger, curry leaves, and asafoetida', price: 25, unit: 'litre', quantityAvailable: 60, minOrderQty: 1, harvestDate: yesterday, freshnessScore: 94, storageTemp: 10, originLocation: 'Madurai', tags: '[["buttermilk"],["spiced"],["traditional"]]', isActive: true, viewsCount: 123, soldCount: 280, carbonScore: 75 },

      // Farmer 3 (Murugan) - Spices, Honey, Pickles, Grains, Dal
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'SPICES', name: 'Cardamom (Elakkai)', description: 'Premium green cardamom from Kodaikanal hills, aromatic and fresh', price: 1500, unit: 'kg', quantityAvailable: 30, minOrderQty: 0.1, maxOrderQty: 10, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 15), freshnessScore: 91, storageTemp: 25, originLocation: 'Kodaikanal', tags: '[["organic"],["cardamom"],["premium"]]', isActive: true, viewsCount: 678, soldCount: 85, carbonScore: 88 },
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'SPICES', name: 'Black Pepper (Kari Milagu)', description: 'Farm-fresh black pepper, sun-dried and graded', price: 550, unit: 'kg', quantityAvailable: 100, minOrderQty: 0.5, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 30), freshnessScore: 89, originLocation: 'Kodaikanal', tags: '[["organic"],["pepper"],["sun dried"]]', isActive: true, viewsCount: 345, soldCount: 120, carbonScore: 90 },
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'HONEY', name: 'Wild Forest Honey (Kaattu Then)', description: 'Pure wild honey collected from Western Ghats forests, no additives', price: 800, unit: 'kg', quantityAvailable: 50, minOrderQty: 0.25, maxOrderQty: 10, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 60), freshnessScore: 95, originLocation: 'Kodaikanal', tags: '[["wild honey"],["organic"],["forest"]]', isActive: true, viewsCount: 890, soldCount: 200, carbonScore: 95 },
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'PICKLES', name: 'Lime Pickle (Elumichai Oorugai)', description: 'Traditional Tamil Nadu style lime pickle, made with cold-pressed sesame oil', price: 250, unit: 'kg', quantityAvailable: 40, minOrderQty: 0.5, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 10), freshnessScore: 99, storageTemp: 30, originLocation: 'Madurai', tags: '[["pickle"],["traditional"],["lime"]]', isActive: true, viewsCount: 456, soldCount: 95, carbonScore: 82 },
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'GRAINS', name: 'Organic Ragi (Kezhvaragu)', description: 'Finger millet organically grown in Kodaikanal, rich in calcium', price: 65, unit: 'kg', quantityAvailable: 300, minOrderQty: 2, maxOrderQty: 50, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 45), freshnessScore: 94, originLocation: 'Kodaikanal', tags: '[["organic"],["ragi"],["millets"]]', isActive: true, viewsCount: 234, soldCount: 78, carbonScore: 91 },
      { sellerId: farmerUsers[2].id, sellerType: 'FARMER', category: 'DAL', name: 'Toor Dal (Tuvaram Paruppu)', description: 'Premium quality toor dal, unpolished and organic', price: 120, unit: 'kg', quantityAvailable: 400, minOrderQty: 1, maxOrderQty: 50, isOrganic: true, harvestDate: new Date(now.getTime() - 86400000 * 60), freshnessScore: 93, originLocation: 'Madurai', tags: '[["organic"],["toor dal"],["unpolished"]]', isActive: true, viewsCount: 567, soldCount: 320, carbonScore: 89 },
    ],
  });
  counts.products = farmerProducts.count;

  const fisherProducts = await db.product.createMany({
    data: [
      // Fisher 1 (Thangavel) - Fresh Fish, Live Fish, Dry Fish
      { sellerId: fisherUsers[0].id, sellerType: 'FISHER', category: 'FRESH_FISH', name: 'Seer Fish (Vanjaram)', description: 'Fresh caught seer fish from Bay of Bengal, ideal for fry and curry', price: 480, unit: 'kg', quantityAvailable: 50, minOrderQty: 0.5, maxOrderQty: 20, catchDate: yesterday, freshnessScore: 96, storageTemp: -2, originLocation: 'Chennai', tags: '[["fresh"],["seer fish"],["bay of bengal"]]', isActive: true, viewsCount: 456, soldCount: 180, carbonScore: 70 },
      { sellerId: fisherUsers[0].id, sellerType: 'FISHER', category: 'FRESH_FISH', name: 'Pomfret (Vavval)', description: 'White pomfret, fresh catch, perfect for tawa fry', price: 650, unit: 'kg', quantityAvailable: 30, minOrderQty: 0.5, maxOrderQty: 10, catchDate: yesterday, freshnessScore: 97, storageTemp: -2, originLocation: 'Chennai', tags: '[["pomfret"],["fresh"],["white pomfret"]]', isActive: true, viewsCount: 389, soldCount: 95, carbonScore: 72 },
      { sellerId: fisherUsers[0].id, sellerType: 'FISHER', category: 'LIVE_FISH', name: 'Live Catla (Katla)', description: 'Live Catla fish from local waters, great for biryani', price: 220, unit: 'kg', quantityAvailable: 40, minOrderQty: 1, maxOrderQty: 15, catchDate: yesterday, freshnessScore: 99, storageTemp: 25, originLocation: 'Chennai', tags: '[["live"],["catla"],["freshwater"]]', isActive: true, viewsCount: 234, soldCount: 67, carbonScore: 68 },
      { sellerId: fisherUsers[0].id, sellerType: 'FISHER', category: 'DRY_FISH', name: 'Dry Prawns (Eral Karuvadu)', description: 'Sun-dried prawns, ideal for chutney and rasam', price: 800, unit: 'kg', quantityAvailable: 25, minOrderQty: 0.25, maxOrderQty: 5, catchDate: new Date(now.getTime() - 86400000 * 7), freshnessScore: 90, originLocation: 'Chennai', tags: '[["dry prawns"],["sun dried"],["karuvadu"]]', isActive: true, viewsCount: 178, soldCount: 45, carbonScore: 85 },

      // Fisher 2 (Rajakumar) - Fresh Fish, Fish Pickles, Fish Masalas
      { sellerId: fisherUsers[1].id, sellerType: 'FISHER', category: 'FRESH_FISH', name: 'Indian Mackerel (Kanangeluthi)', description: 'Fresh Indian mackerel, perfect for fish curry', price: 180, unit: 'kg', quantityAvailable: 100, minOrderQty: 1, maxOrderQty: 30, catchDate: yesterday, freshnessScore: 95, storageTemp: 0, originLocation: 'Ramanathapuram', tags: '[["mackerel"],["fresh"],["curry fish"]]', isActive: true, viewsCount: 345, soldCount: 230, carbonScore: 74 },
      { sellerId: fisherUsers[1].id, sellerType: 'FISHER', category: 'FRESH_FISH', name: 'Tuna Fish (Soorai Meen)', description: 'Fresh yellowfin tuna, great for steaks and gravies', price: 350, unit: 'kg', quantityAvailable: 60, minOrderQty: 0.5, maxOrderQty: 15, catchDate: yesterday, freshnessScore: 94, storageTemp: -2, originLocation: 'Ramanathapuram', tags: '[["tuna"],["fresh"],["steak"]]', isActive: true, viewsCount: 267, soldCount: 78, carbonScore: 71 },
      { sellerId: fisherUsers[1].id, sellerType: 'FISHER', category: 'FISH_PICKLES', name: 'Fish Pickle (Meen Oorugai)', description: 'Homemade fish pickle made with fresh mackerel and traditional spices', price: 350, unit: 'kg', quantityAvailable: 15, minOrderQty: 0.25, maxOrderQty: 3, isOrganic: false, harvestDate: new Date(now.getTime() - 86400000 * 5), freshnessScore: 98, originLocation: 'Ramanathapuram', tags: '[["fish pickle"],["homemade"],["traditional"]]', isActive: true, viewsCount: 198, soldCount: 52, carbonScore: 80 },
      { sellerId: fisherUsers[1].id, sellerType: 'FISHER', category: 'FISH_MASALAS', name: 'Fish Curry Masala (Meen Kuzhambu Masala)', description: 'Special blend masala for authentic South Indian fish curry', price: 180, unit: 'kg', quantityAvailable: 20, minOrderQty: 0.1, maxOrderQty: 5, freshnessScore: 97, originLocation: 'Ramanathapuram', tags: '[["masala"],["fish curry"],["blend"]]', isActive: true, viewsCount: 156, soldCount: 89, carbonScore: 83 },

      // Fisher 3 (Arumugam) - Fresh Fish, Dry Fish, Fish Waste
      { sellerId: fisherUsers[2].id, sellerType: 'FISHER', category: 'FRESH_FISH', name: 'Sardines (Mathi Meen)', description: 'Fresh sardines from Nagapattinam coast, rich in Omega-3', price: 120, unit: 'kg', quantityAvailable: 200, minOrderQty: 1, maxOrderQty: 50, catchDate: yesterday, freshnessScore: 93, storageTemp: 0, originLocation: 'Nagapattinam', tags: '[["sardines"],["fresh"],["omega-3"]]', isActive: true, viewsCount: 289, soldCount: 340, carbonScore: 76 },
      { sellerId: fisherUsers[2].id, sellerType: 'FISHER', category: 'DRY_FISH', name: 'Dry Shark (Sura Karuvadu)', description: 'Traditional dried shark, perfect for deep fry', price: 600, unit: 'kg', quantityAvailable: 35, minOrderQty: 0.5, maxOrderQty: 10, catchDate: new Date(now.getTime() - 86400000 * 10), freshnessScore: 88, originLocation: 'Nagapattinam', tags: '[["dry shark"],["karuvadu"],["traditional"]]', isActive: true, viewsCount: 145, soldCount: 38, carbonScore: 87 },
      { sellerId: fisherUsers[2].id, sellerType: 'FISHER', category: 'FISH_WASTE', name: 'Fish Waste (Meen Thool)', description: 'Fresh fish waste including heads and trimmings, ideal for poultry feed and composting', price: 15, unit: 'kg', quantityAvailable: 500, minOrderQty: 10, maxOrderQty: 200, catchDate: yesterday, freshnessScore: 85, originLocation: 'Nagapattinam', tags: '[["fish waste"],["composting"],["feed"]]', isActive: true, viewsCount: 45, soldCount: 120, carbonScore: 95 },
    ],
  });
  counts.products += fisherProducts.count;

  // Fetch all products
  const allProducts = await db.product.findMany({ orderBy: { createdAt: 'asc' } });
  const fProducts = allProducts.filter(p => p.sellerType === 'FARMER');
  const fiProducts = allProducts.filter(p => p.sellerType === 'FISHER');

  console.log(`   ✅ ${counts.products} products created (${farmerProducts.count} farmer, ${fisherProducts.count} fisher)\n`);

  // =====================================================
  // 4. CIRCULAR ECONOMY LISTINGS
  // =====================================================
  console.log('♻️ Creating circular economy listings...');

  const circularListings = await db.circularListing.createMany({
    data: [
      { listerId: fisherUsers[2].id, listerType: 'FISHER', category: 'FISH_WASTE', title: 'Fish Waste for Organic Composting', description: 'Daily collection of fish waste from Nagapattinam harbor, ideal for organic composting and biogas plants', quantity: 200, unit: 'kg', exchangeType: 'SELL', price: 10, location: 'Nagapattinam Harbor', latitude: 10.77, longitude: 79.84, isActive: true, viewsCount: 34 },
      { listerId: fisherUsers[1].id, listerType: 'FISHER', category: 'FISH_BONE_POWDER', title: 'Fish Bone Powder (Organic Fertilizer)', description: 'Processed fish bone powder, rich in calcium and phosphorus, excellent organic fertilizer', quantity: 50, unit: 'kg', exchangeType: 'SELL', price: 45, location: 'Ramanathapuram', latitude: 9.28, longitude: 79.20, isActive: true, viewsCount: 56 },
      { listerId: fisherUsers[0].id, listerType: 'FISHER', category: 'FISH_MANURE', title: 'Fish Meal Fertilizer', description: 'High-quality fish meal manure for organic farming, packed in 5kg bags', quantity: 100, unit: 'kg', exchangeType: 'SELL', price: 30, location: 'Chennai Kasimedu Harbor', latitude: 13.11, longitude: 80.30, isActive: true, viewsCount: 78 },
      { listerId: farmerUsers[0].id, listerType: 'FARMER', category: 'ORGANIC_MANURE', title: 'Vermicompost from Farm Waste', description: 'Premium vermicompost produced from farm waste using earthworms, rich in micronutrients', quantity: 500, unit: 'kg', exchangeType: 'SELL', price: 12, location: 'Coimbatore', latitude: 11.08, longitude: 76.98, isActive: true, viewsCount: 89 },
      { listerId: fisherUsers[1].id, listerType: 'FISHER', category: 'NETS', title: 'Used Fishing Nets (Good Condition)', description: 'Used nylon fishing nets in good condition, 100m length, suitable for small-scale fishing', quantity: 5, unit: 'piece', exchangeType: 'EXCHANGE', wantedItem: 'Fresh paddy seeds or vegetable seeds', location: 'Ramanathapuram', isActive: true, viewsCount: 23 },
      { listerId: fisherUsers[0].id, listerType: 'FISHER', category: 'BOATS', title: 'Second-hand Country Boat for Sale', description: 'Well-maintained 25ft country boat, teak wood, with oars and outrigger. Engine not included.', quantity: 1, unit: 'piece', exchangeType: 'SELL', price: 45000, location: 'Chennai Kasimedu Harbor', latitude: 13.11, longitude: 80.30, isActive: true, viewsCount: 156 },
      { listerId: farmerUsers[2].id, listerType: 'FARMER', category: 'ORGANIC_MANURE', title: 'Cow Dung Manure (Organic)', description: 'Dried cow dung manure from A2 cows, excellent for all types of crops and home gardening', quantity: 1000, unit: 'kg', exchangeType: 'DONATE', location: 'Madurai', isActive: true, viewsCount: 67 },
    ],
  });
  counts.circularListings = circularListings.count;
  console.log(`   ✅ ${counts.circularListings} circular listings created\n`);

  // Fetch circular listings
  const circListings = await db.circularListing.findMany({ orderBy: { createdAt: 'asc' } });

  // =====================================================
  // 5. ORDERS WITH ORDER ITEMS
  // =====================================================
  console.log('🛒 Creating orders...');

  const ordersData = [
    { custIdx: 0, sellerIdx: 0, sellerType: 'FARMER', status: 'DELIVERED' as const, items: [{ pIdx: 0, qty: 2 }, { pIdx: 1, qty: 1 }] },
    { custIdx: 0, sellerIdx: 2, sellerType: 'FISHER', status: 'DELIVERED' as const, items: [{ pIdx: 0, qty: 1.5 }] },
    { custIdx: 1, sellerIdx: 1, sellerType: 'FARMER', status: 'DELIVERED' as const, items: [{ pIdx: 0, qty: 2 }, { pIdx: 1, qty: 0.5 }] },
    { custIdx: 1, sellerIdx: 0, sellerType: 'FISHER', status: 'IN_TRANSIT' as const, items: [{ pIdx: 1, qty: 3 }, { pIdx: 2, qty: 2 }] },
    { custIdx: 2, sellerIdx: 2, sellerType: 'FARMER', status: 'ACCEPTED' as const, items: [{ pIdx: 2, qty: 0.5 }] },
    { custIdx: 2, sellerIdx: 1, sellerType: 'FISHER', status: 'DELIVERED' as const, items: [{ pIdx: 0, qty: 2 }] },
    { custIdx: 0, sellerIdx: 1, sellerType: 'FARMER', status: 'PREPARING' as const, items: [{ pIdx: 2, qty: 1 }, { pIdx: 3, qty: 2 }] },
    { custIdx: 1, sellerIdx: 2, sellerType: 'FISHER', status: 'DELIVERED' as const, items: [{ pIdx: 1, qty: 1 }] },
    { custIdx: 2, sellerIdx: 0, sellerType: 'FARMER', status: 'PENDING' as const, items: [{ pIdx: 3, qty: 3 }] },
  ];

  const createdOrders: Array<{ order: any; items: any[] }> = [];
  const sellerMap: Record<number, { userId: string; sellerType: string }> = {
    0: { userId: farmerUsers[0].id, sellerType: 'FARMER' },
    1: { userId: farmerUsers[1].id, sellerType: 'FARMER' },
    2: { userId: farmerUsers[2].id, sellerType: 'FARMER' },
  3: { userId: fisherUsers[0].id, sellerType: 'FISHER' },
    4: { userId: fisherUsers[1].id, sellerType: 'FISHER' },
    5: { userId: fisherUsers[2].id, sellerType: 'FISHER' },
  };

  const customerAddresses = [
    '45, Anna Nagar East, Chennai',
    '12, RS Puram, Coimbatore',
    '78, North Masi Street, Madurai',
  ];

  for (let i = 0; i < ordersData.length; i++) {
    const od = ordersData[i];
    const customer = customerUsers[od.custIdx];
    const seller = sellerMap[od.sellerIdx];

    const orderItems: Array<{ productId: string; productName: string; price: number; quantity: number; unit: string; subtotal: number }> = [];
    let subtotal = 0;

    for (const item of od.items) {
      const product = allProducts[item.pIdx];
      const itemSubtotal = product.price * item.qty;
      subtotal += itemSubtotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.qty,
        unit: product.unit,
        subtotal: itemSubtotal,
      });
    }

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;
    const orderNum = `FSA${String(10000 + i).padStart(6, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber: orderNum,
        customerId: customer.id,
        sellerId: seller.userId,
        sellerType: seller.sellerType,
        status: od.status,
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryAddress: customerAddresses[od.custIdx],
        deliveryLat: od.custIdx === 0 ? 13.0865 : od.custIdx === 1 ? 11.0168 : 9.9252,
        deliveryLng: od.custIdx === 0 ? 80.2206 : od.custIdx === 1 ? 76.9558 : 78.1198,
        deliveryDistanceKm: od.custIdx === 0 ? 12.5 : od.custIdx === 1 ? 8.3 : 15.7,
        estimatedDelivery: new Date(now.getTime() + 86400000),
        actualDelivery: od.status === 'DELIVERED' ? new Date(now.getTime() - 3600000) : null,
        notes: i === 0 ? 'Please deliver before 6 PM' : null,
        items: {
          create: orderItems,
        },
        payments: {
          create: {
            amount: totalAmount,
            method: i % 3 === 0 ? 'UPI' : i % 3 === 1 ? 'COD' : 'BANK_TRANSFER',
            status: od.status === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
            transactionId: i % 3 === 0 ? `TXN${Date.now()}${i}` : null,
            sellerPayout: totalAmount * 0.95,
            platformFee: totalAmount * 0.05,
            deliveryFee,
            paidAt: od.status === 'DELIVERED' ? new Date(now.getTime() - 7200000) : null,
          },
        },
      },
    });
    createdOrders.push({ order, items: orderItems });
  }
  counts.orders = ordersData.length;
  console.log(`   ✅ ${counts.orders} orders with items and payments created\n`);

  // =====================================================
  // 6. BOOKINGS
  // =====================================================
  console.log('📅 Creating bookings...');

  const bookingsData = [
    { custIdx: 0, sellerIdx: 3, sellerType: 'FISHER', category: 'FRESH_FISH' as const, desc: 'Pre-catch booking for Seer Fish, need 5kg for a family function', qty: 5, unit: 'kg', expPrice: 480, status: 'CONFIRMED' as const, expectedDate: new Date(now.getTime() + 86400000 * 3) },
    { custIdx: 1, sellerIdx: 0, sellerType: 'FARMER', category: 'VEGETABLES' as const, desc: 'Pre-harvest booking for organic tomatoes, want 20kg for pickle making', qty: 20, unit: 'kg', expPrice: 35, status: 'CONFIRMED' as const, expectedDate: new Date(now.getTime() + 86400000 * 7) },
    { custIdx: 2, sellerIdx: 1, sellerType: 'FARMER', category: 'MILK' as const, desc: 'Daily A2 milk delivery booking - 2 litres per day for 30 days', qty: 60, unit: 'litre', expPrice: 55, status: 'HARVESTING' as const, animalType: 'Jersey Cow', expectedDate: new Date(now.getTime() + 86400000 * 30) },
    { custIdx: 0, sellerIdx: 4, sellerType: 'FISHER', category: 'FRESH_FISH' as const, desc: 'Pre-catch booking for Pomfret - need for a wedding feast', qty: 10, unit: 'kg', expPrice: 600, status: 'PENDING' as const, expectedDate: new Date(now.getTime() + 86400000 * 10) },
    { custIdx: 1, sellerIdx: 2, sellerType: 'FARMER', category: 'HONEY' as const, desc: 'Pre-harvest booking for wild honey, 5kg for Pongal festival', qty: 5, unit: 'kg', expPrice: 750, status: 'COMPLETED' as const, finalPrice: 780, expectedDate: new Date(now.getTime() - 86400000 * 2) },
  ];

  const bookings = [];
  for (let i = 0; i < bookingsData.length; i++) {
    const bd = bookingsData[i];
    const customer = customerUsers[bd.custIdx];
    const seller = bd.sellerType === 'FARMER' ? farmerUsers[bd.sellerIdx] : fisherUsers[bd.sellerIdx - 3];

    const booking = await db.booking.create({
      data: {
        bookingNumber: `FSB${String(5000 + i).padStart(6, '0')}`,
        customerId: customer.id,
        sellerId: seller.id,
        sellerType: bd.sellerType,
        category: bd.category,
        description: bd.desc,
        animalType: bd.animalType || null,
        quantity: bd.qty,
        unit: bd.unit,
        expectedPrice: bd.expPrice,
        finalPrice: bd.finalPrice || null,
        expectedDate: bd.expectedDate,
        scheduledPickup: bd.status === 'COMPLETED' ? new Date(now.getTime() - 86400000) : null,
        status: bd.status,
      },
    });
    bookings.push(booking);
  }
  counts.bookings = bookings.length;
  console.log(`   ✅ ${counts.bookings} bookings created\n`);

  // =====================================================
  // 7. DELIVERY ASSIGNMENTS, PERFORMANCE, SALARY
  // =====================================================
  console.log('🚚 Creating delivery data...');

  const deliveredOrders = createdOrders.filter(o => o.order.status === 'DELIVERED' || o.order.status === 'IN_TRANSIT');
  const deliveryCount = Math.min(deliveredOrders.length, dProfiles.length);

  const deliveryAssignments = [];
  for (let i = 0; i < deliveryCount; i++) {
    const d = deliveredOrders[i];
    const dp = dProfiles[i % dProfiles.length];
    const sellerProfile = d.order.sellerType === 'FARMER'
      ? fProfiles.find(fp => fp.userId === d.order.sellerId)
      : null;

    const pickupAddr = d.order.sellerType === 'FARMER'
      ? `Farm, ${sellerProfile?.farmCity || 'Coimbatore'}`
      : `Harbor, ${fiProfiles.find(fp => fp.userId === d.order.sellerId)?.harborCity || 'Chennai'}`;

    const assignment = await db.deliveryAssignment.create({
      data: {
        orderId: d.order.id,
        deliveryPersonId: dp.id,
        status: i < 4 ? 'DELIVERED' : 'IN_TRANSIT',
        pickupAddress: pickupAddr,
        dropAddress: d.order.deliveryAddress,
        pickupLat: 11.08,
        pickupLng: 76.98,
        dropLat: d.order.deliveryLat,
        dropLng: d.order.deliveryLng,
        routeDistanceKm: (d.order.deliveryDistanceKm || 10) + 5,
        estimatedTimeMin: 45,
        actualTimeMin: i < 4 ? (35 + Math.floor(Math.random() * 20)) : null,
        pickedUpAt: i < 4 ? new Date(now.getTime() - 7200000) : null,
        deliveredAt: i < 4 ? new Date(now.getTime() - 3600000) : null,
        customerRating: i < 4 ? (4 + Math.floor(Math.random() * 2)) : null,
      },
    });
    deliveryAssignments.push(assignment);
  }
  counts.deliveryAssignments = deliveryAssignments.length;

  // Delivery Performance
  const deliveryPerformance = await db.deliveryPerformance.createMany({
    data: [
      { deliveryPersonId: dProfiles[0].id, month: '2025-01', ordersCompleted: 85, ordersCancelled: 3, avgDeliveryTimeMin: 38, avgRating: 4.6, punctualityScore: 92, totalDistanceKm: 1250, incentiveEarned: 3500 },
      { deliveryPersonId: dProfiles[0].id, month: '2025-02', ordersCompleted: 92, ordersCancelled: 1, avgDeliveryTimeMin: 35, avgRating: 4.7, punctualityScore: 95, totalDistanceKm: 1380, incentiveEarned: 4200 },
      { deliveryPersonId: dProfiles[1].id, month: '2025-01', ordersCompleted: 65, ordersCancelled: 5, avgDeliveryTimeMin: 42, avgRating: 4.3, punctualityScore: 88, totalDistanceKm: 980, incentiveEarned: 2800 },
      { deliveryPersonId: dProfiles[1].id, month: '2025-02', ordersCompleted: 70, ordersCancelled: 2, avgDeliveryTimeMin: 40, avgRating: 4.5, punctualityScore: 90, totalDistanceKm: 1050, incentiveEarned: 3100 },
      { deliveryPersonId: dProfiles[2].id, month: '2025-01', ordersCompleted: 55, ordersCancelled: 4, avgDeliveryTimeMin: 45, avgRating: 4.1, punctualityScore: 85, totalDistanceKm: 820, incentiveEarned: 2000 },
      { deliveryPersonId: dProfiles[2].id, month: '2025-02', ordersCompleted: 60, ordersCancelled: 3, avgDeliveryTimeMin: 43, avgRating: 4.2, punctualityScore: 87, totalDistanceKm: 900, incentiveEarned: 2400 },
    ],
  });
  counts.deliveryPerformance = deliveryPerformance.count;

  // Delivery Salary
  const deliverySalary = await db.deliverySalary.createMany({
    data: [
      { deliveryPersonId: dProfiles[0].id, month: '2025-01', baseSalary: 18000, performanceBonus: 2500, incentives: 3500, deductions: 500, totalSalary: 23500, status: 'PAID', paidAt: new Date('2025-02-01') },
      { deliveryPersonId: dProfiles[0].id, month: '2025-02', baseSalary: 18000, performanceBonus: 3000, incentives: 4200, deductions: 300, totalSalary: 24900, status: 'PAID', paidAt: new Date('2025-03-01') },
      { deliveryPersonId: dProfiles[1].id, month: '2025-01', baseSalary: 22000, performanceBonus: 1800, incentives: 2800, deductions: 600, totalSalary: 26000, status: 'PAID', paidAt: new Date('2025-02-01') },
      { deliveryPersonId: dProfiles[1].id, month: '2025-02', baseSalary: 22000, performanceBonus: 2200, incentives: 3100, deductions: 400, totalSalary: 26900, status: 'PENDING' },
      { deliveryPersonId: dProfiles[2].id, month: '2025-01', baseSalary: 17000, performanceBonus: 1000, incentives: 2000, deductions: 800, totalSalary: 19200, status: 'PAID', paidAt: new Date('2025-02-01') },
      { deliveryPersonId: dProfiles[2].id, month: '2025-02', baseSalary: 17000, performanceBonus: 1200, incentives: 2400, deductions: 500, totalSalary: 20100, status: 'PENDING' },
    ],
  });
  counts.deliverySalary = deliverySalary.count;
  console.log(`   ✅ ${counts.deliveryAssignments} assignments, ${counts.deliveryPerformance} performance records, ${counts.deliverySalary} salary records\n`);

  // =====================================================
  // 8. TRUST SCORES
  // =====================================================
  console.log('⭐ Creating trust scores...');

  const farmerTrustScores = await db.farmerTrustScore.createMany({
    data: [
      { farmerId: fProfiles[0].id, overallScore: 88, orderAcceptanceRate: 95, avgDeliveryTimeHours: 4, productQualityScore: 90, avgCustomerRating: 4.5, complaintRate: 2, cancellationRate: 3, totalReviews: 45 },
      { farmerId: fProfiles[1].id, overallScore: 92, orderAcceptanceRate: 98, avgDeliveryTimeHours: 2, productQualityScore: 94, avgCustomerRating: 4.7, complaintRate: 1, cancellationRate: 1, totalReviews: 62 },
      { farmerId: fProfiles[2].id, overallScore: 85, orderAcceptanceRate: 90, avgDeliveryTimeHours: 6, productQualityScore: 88, avgCustomerRating: 4.3, complaintRate: 3, cancellationRate: 5, totalReviews: 38 },
    ],
  });
  counts.farmerTrustScores = farmerTrustScores.count;

  const fisherTrustScores = await db.fisherTrustScore.createMany({
    data: [
      { fisherId: fiProfiles[0].id, overallScore: 91, orderAcceptanceRate: 96, avgDeliveryTimeHours: 3, productQualityScore: 93, avgCustomerRating: 4.6, complaintRate: 1.5, cancellationRate: 2, totalReviews: 55 },
      { fisherId: fiProfiles[1].id, overallScore: 82, orderAcceptanceRate: 85, avgDeliveryTimeHours: 5, productQualityScore: 84, avgCustomerRating: 4.1, complaintRate: 4, cancellationRate: 8, totalReviews: 30 },
      { fisherId: fiProfiles[2].id, overallScore: 78, orderAcceptanceRate: 80, avgDeliveryTimeHours: 7, productQualityScore: 82, avgCustomerRating: 3.9, complaintRate: 6, cancellationRate: 10, totalReviews: 22 },
    ],
  });
  counts.fisherTrustScores = fisherTrustScores.count;
  console.log(`   ✅ ${counts.farmerTrustScores} farmer + ${counts.fisherTrustScores} fisher trust scores\n`);

  // =====================================================
  // 9. REVIEWS & RATINGS
  // =====================================================
  console.log('💬 Creating reviews...');

  const deliveredOrderReviews = createdOrders.filter(o => o.order.status === 'DELIVERED');
  const reviewsData = [
    { orderIdx: 0, reviewerIdx: 0, rating: 5, quality: 5, freshness: 5, delivery: 4, comment: 'Excellent organic tomatoes! Very fresh and tasty. Will order again.', verified: true },
    { orderIdx: 1, reviewerIdx: 0, rating: 5, quality: 5, freshness: 5, delivery: 5, comment: 'Best seer fish in Chennai! Very fresh catch, amazing taste.', verified: true },
    { orderIdx: 2, reviewerIdx: 1, rating: 4, quality: 4, freshness: 5, delivery: 4, comment: 'Good A2 milk quality. Ghee is excellent. Slightly delayed delivery.', verified: true },
    { orderIdx: 3, reviewerIdx: 2, rating: 5, quality: 5, freshness: 4, delivery: 5, comment: 'Fresh sardines, perfect for curry. Quick delivery to Madurai.', verified: true },
    { orderIdx: 4, reviewerIdx: 1, rating: 3, quality: 3, freshness: 4, delivery: 2, comment: 'Fish pickle taste was okay but delivery was very slow.', verified: false },
  ];

  const reviews = [];
  for (let i = 0; i < reviewsData.length; i++) {
    const rd = reviewsData[i];
    const order = deliveredOrderReviews[rd.orderIdx];
    if (!order) continue;
    const reviewer = customerUsers[rd.reviewerIdx];

    const review = await db.review.create({
      data: {
        orderId: order.order.id,
        productId: order.items[0].productId,
        reviewerId: reviewer.id,
        revieweeId: order.order.sellerId,
        rating: rd.rating,
        qualityRating: rd.quality,
        freshnessRating: rd.freshness,
        deliveryRating: rd.delivery,
        comment: rd.comment,
        isVerified: rd.verified,
        adminResponse: i === 4 ? 'Apologies for the delay. We are working on improving delivery times to Coimbatore.' : null,
      },
    });
    reviews.push(review);
  }
  counts.reviews = reviews.length;
  console.log(`   ✅ ${counts.reviews} reviews created\n`);

  // =====================================================
  // 10. FISHER WARNINGS — Fisher 3 (Arumugam) gets 2 warnings
  // =====================================================
  console.log('⚠️ Creating fisher warnings...');

  const fisherWarnings = await db.fisherWarning.createMany({
    data: [
      { fisherId: fiProfiles[2].id, warningNumber: 1, ignoredOrders: 5, severity: 'MEDIUM', reason: '5 orders ignored in the past 7 days. Please ensure timely acceptance of orders.', issuedByAdminId: aProfiles[0].userId, acknowledgedAt: new Date(now.getTime() - 86400000 * 5) },
      { fisherId: fiProfiles[2].id, warningNumber: 2, ignoredOrders: 5, severity: 'HIGH', reason: '5 more orders ignored. Second warning issued. Next warning will result in suspension.', issuedByAdminId: aProfiles[0].userId, acknowledgedAt: null },
      { fisherId: fiProfiles[1].id, warningNumber: 1, ignoredOrders: 5, severity: 'LOW', reason: '5 orders ignored in the past 14 days. Please maintain better responsiveness.', issuedByAdminId: aProfiles[1].userId, acknowledgedAt: new Date(now.getTime() - 86400000 * 2) },
    ],
  });
  counts.fisherWarnings = fisherWarnings.count;

  // Fisher Ignored Orders
  const ignoredOrders = await db.fisherIgnoredOrder.createMany({
    data: [
      { fisherId: fiProfiles[2].id, orderId: createdOrders[8].order.id, ignoredAt: new Date(now.getTime() - 3600000), processed: true },
      { fisherId: fiProfiles[2].id, bookingId: bookings[3].id, ignoredAt: new Date(now.getTime() - 7200000), processed: false },
    ],
  });
  counts.fisherIgnoredOrders = ignoredOrders.count;
  console.log(`   ✅ ${counts.fisherWarnings} fisher warnings, ${counts.fisherIgnoredOrders} ignored orders\n`);

  // =====================================================
  // 11. AI DATA
  // =====================================================
  console.log('🤖 Creating AI data...');

  // AI Price History - for select products
  const aiPriceHistoryData: any[] = [];
  const seasons = ['Summer', 'Monsoon', 'Winter', 'Post-Monsoon'];
  const demandLevels = ['HIGH', 'MEDIUM', 'LOW'];
  const weatherConditions = ['Sunny', 'Rainy', 'Cloudy', 'Storm'];
  const festivals = ['Pongal', 'Diwali', 'Normal', 'Ramzan'];

  for (let p = 0; p < Math.min(8, allProducts.length); p++) {
    const product = allProducts[p];
    for (let h = 0; h < 5; h++) {
      aiPriceHistoryData.push({
        productId: product.id,
        price: product.price * (0.85 + Math.random() * 0.3),
        suggestedPrice: product.price * (0.9 + Math.random() * 0.2),
        season: seasons[h % 4],
        demandLevel: demandLevels[h % 3],
        weatherCondition: weatherConditions[h % 4],
        festivalFactor: festivals[h % 4],
        calculatedAt: new Date(now.getTime() - 86400000 * (h * 7)),
      });
    }
  }
  const aiPriceHistory = await db.aiPriceHistory.createMany({ data: aiPriceHistoryData });
  counts.aiPriceHistory = aiPriceHistory.count;

  // AI Demand Predictions
  const aiDemandPredictions = await db.aiDemandPrediction.createMany({
    data: [
      { category: 'FRESH_FISH', region: 'Chennai', predictedDemand: 85, currentSupply: 70, confidence: 0.87, predictionDate: now, forDate: new Date(now.getTime() + 86400000 * 7), factors: '{"weather": "sunny", "festival": "none", "season": "summer"}' },
      { category: 'VEGETABLES', region: 'Coimbatore', predictedDemand: 92, currentSupply: 88, confidence: 0.91, predictionDate: now, forDate: new Date(now.getTime() + 86400000 * 7), factors: '{"weather": "rainy", "festival": "pongal", "season": "winter"}' },
      { category: 'MILK', region: 'Madurai', predictedDemand: 78, currentSupply: 82, confidence: 0.84, predictionDate: now, forDate: new Date(now.getTime() + 86400000 * 7), factors: '{"weather": "cloudy", "festival": "normal", "season": "monsoon"}' },
      { category: 'SPICES', region: 'Madurai', predictedDemand: 65, currentSupply: 60, confidence: 0.79, predictionDate: now, forDate: new Date(now.getTime() + 86400000 * 14), factors: '{"weather": "sunny", "festival": "diwali", "season": "post-monsoon"}' },
      { category: 'DRY_FISH', region: 'Nagapattinam', predictedDemand: 45, currentSupply: 55, confidence: 0.72, predictionDate: now, forDate: new Date(now.getTime() + 86400000 * 7), factors: '{"weather": "sunny", "festival": "none", "season": "summer"}' },
    ],
  });
  counts.aiDemandPredictions = aiDemandPredictions.count;

  // AI Freshness Logs
  const aiFreshnessLogsData: any[] = [];
  for (let p = 0; p < Math.min(10, allProducts.length); p++) {
    const product = allProducts[p];
    aiFreshnessLogsData.push({
      productId: product.id,
      harvestCatchTime: product.harvestDate || product.catchDate || new Date(now.getTime() - 86400000),
      storageTemp: product.storageTemp || 25,
      storageDurationHours: 4 + Math.random() * 20,
      distanceKm: 10 + Math.random() * 50,
      freshnessScore: 75 + Math.random() * 25,
      degradationRate: 0.5 + Math.random() * 2,
      recommendation: product.category === 'FRESH_FISH' ? 'Deliver within 6 hours for best quality' : 'Good for next 24 hours at current storage temperature',
    });
  }
  const aiFreshnessLogs = await db.aiFreshnessLog.createMany({ data: aiFreshnessLogsData });
  counts.aiFreshnessLogs = aiFreshnessLogs.count;

  // AI Matching Logs
  const aiMatchingLogs = await db.aiMatchingLog.createMany({
    data: [
      { customerId: customerUsers[0].id, productId: allProducts[0].id, sellerId: farmerUsers[0].id, matchType: 'LOCALITY', matchScore: 0.92, factors: '{"distance": 12, "priceMatch": 0.95, "qualityMatch": 0.9}' },
      { customerId: customerUsers[0].id, productId: allProducts[6].id, sellerId: fisherUsers[0].id, matchType: 'PREFERENCE', matchScore: 0.85, factors: '{"distance": 5, "priceMatch": 0.8, "qualityMatch": 0.9, "pastOrders": 3}' },
      { customerId: customerUsers[1].id, productId: allProducts[7].id, sellerId: fisherUsers[0].id, matchType: 'PRICE', matchScore: 0.78, factors: '{"distance": 15, "priceMatch": 0.85, "qualityMatch": 0.75}' },
      { customerId: customerUsers[2].id, productId: allProducts[11].id, sellerId: farmerUsers[2].id, matchType: 'QUALITY', matchScore: 0.95, factors: '{"distance": 8, "priceMatch": 0.7, "qualityMatch": 0.98, "organic": true}' },
      { customerId: customerUsers[1].id, productId: allProducts[12].id, sellerId: farmerUsers[2].id, matchType: 'FRESHNESS', matchScore: 0.88, factors: '{"distance": 20, "priceMatch": 0.82, "qualityMatch": 0.9}' },
    ],
  });
  counts.aiMatchingLogs = aiMatchingLogs.count;
  console.log(`   ✅ ${counts.aiPriceHistory} price history, ${counts.aiDemandPredictions} demand predictions, ${counts.aiFreshnessLogs} freshness logs, ${counts.aiMatchingLogs} matching logs\n`);

  // =====================================================
  // 12. NOTIFICATIONS
  // =====================================================
  console.log('🔔 Creating notifications...');

  const notifications = await db.notification.createMany({
    data: [
      { userId: customerUsers[0].id, type: 'ORDER_UPDATE', title: 'Order Delivered!', message: 'Your order FSA010000 has been delivered successfully. Rate your experience!', isRead: true, readAt: new Date(now.getTime() - 3600000) },
      { userId: customerUsers[0].id, type: 'DELIVERY_UPDATE', title: 'Delivery in Progress', message: 'Your order FSA010002 is on the way. Estimated delivery in 30 minutes.', isRead: false },
      { userId: customerUsers[1].id, type: 'BOOKING_UPDATE', title: 'Booking Confirmed', message: 'Your pre-harvest booking FSB005001 has been confirmed by the farmer.', isRead: true, readAt: new Date(now.getTime() - 86400000) },
      { userId: customerUsers[2].id, type: 'PAYMENT_UPDATE', title: 'Payment Completed', message: 'Payment of ₹560 via UPI for order FSA010003 is successful.', isRead: true, readAt: new Date(now.getTime() - 7200000) },
      { userId: farmerUsers[0].id, type: 'ORDER_UPDATE', title: 'New Order Received', message: 'You have a new order FSA010000 for Organic Tomato. Accept within 30 minutes.', isRead: true, readAt: new Date(now.getTime() - 86400000) },
      { userId: farmerUsers[1].id, type: 'VERIFICATION_UPDATE', title: 'Profile Verified', message: 'Congratulations! Your farmer profile has been verified successfully.', isRead: true, readAt: new Date(now.getTime() - 86400000 * 3) },
      { userId: fisherUsers[0].id, type: 'ORDER_UPDATE', title: 'New Order Received', message: 'You have a new order FSA010001 for Seer Fish. Please confirm availability.', isRead: true, readAt: new Date(now.getTime() - 86400000) },
      { userId: fisherUsers[2].id, type: 'WARNING', title: 'Warning Issued', message: 'You have received a warning for ignoring 5 orders. Please respond to orders promptly.', isRead: true, readAt: new Date(now.getTime() - 86400000 * 5) },
      { userId: fisherUsers[2].id, type: 'WARNING', title: 'Second Warning Issued', message: 'Second warning issued. Continued order ignoring may lead to account suspension.', isRead: false },
      { userId: deliveryUsers[0].id, type: 'DELIVERY_UPDATE', title: 'New Delivery Assigned', message: 'Pick up order FSA010000 from Coimbatore farm and deliver to Chennai.', isRead: true, readAt: new Date(now.getTime() - 7200000) },
      { userId: customerUsers[0].id, type: 'AI_INSIGHT', title: 'Price Alert: Tomatoes', message: 'Tomato prices are expected to drop 15% next week due to good harvest. Consider booking now!', isRead: false },
      { userId: farmerUsers[0].id, type: 'AI_INSIGHT', title: 'Demand Forecast', message: 'High demand predicted for organic tomatoes in Chennai next week. Consider increasing stock.', isRead: false },
      { userId: customerUsers[1].id, type: 'PROMOTIONAL', title: 'Weekend Special!', message: 'Get 10% off on all organic products this weekend. Use code: ORGANIC10', isRead: false },
      { userId: adminUsers[0].id, type: 'SYSTEM', title: 'New Fisher Warning Required', message: 'Fisher Arumugam Kuppam has reached 5 ignored orders. Review and issue warning.', isRead: true, readAt: new Date(now.getTime() - 86400000 * 5) },
      { userId: adminUsers[1].id, type: 'VERIFICATION_UPDATE', title: 'Verification Request', message: 'New farmer profile pending verification: Murugan Spice Gardens, Madurai.', isRead: true, readAt: new Date(now.getTime() - 86400000 * 2) },
    ],
  });
  counts.notifications = notifications.count;
  console.log(`   ✅ ${counts.notifications} notifications created\n`);

  // =====================================================
  // 13. SUSTAINABILITY SCORES
  // =====================================================
  console.log('🌿 Creating sustainability scores...');

  const sustainabilityScores = await db.sustainabilityScore.createMany({
    data: [
      { orderId: createdOrders[0].order.id, sellerId: farmerUsers[0].id, sellerType: 'FARMER', localPurchaseScore: 95, lowWasteScore: 88, circularScore: 72, totalScore: 85, carbonSavedKg: 2.3 },
      { orderId: createdOrders[1].order.id, sellerId: fisherUsers[0].id, sellerType: 'FISHER', localPurchaseScore: 98, lowWasteScore: 75, circularScore: 65, totalScore: 79, carbonSavedKg: 1.8 },
      { orderId: createdOrders[2].order.id, sellerId: farmerUsers[1].id, sellerType: 'FARMER', localPurchaseScore: 80, lowWasteScore: 90, circularScore: 70, totalScore: 80, carbonSavedKg: 1.5 },
      { orderId: createdOrders[5].order.id, sellerId: fisherUsers[2].id, sellerType: 'FISHER', localPurchaseScore: 92, lowWasteScore: 82, circularScore: 78, totalScore: 84, carbonSavedKg: 2.1 },
    ],
  });
  counts.sustainabilityScores = sustainabilityScores.count;
  console.log(`   ✅ ${counts.sustainabilityScores} sustainability scores created\n`);

  // =====================================================
  // 14. CIRCULAR EXCHANGES
  // =====================================================
  console.log('🔄 Creating circular exchanges...');

  const circularExchanges = await db.circularExchange.createMany({
    data: [
      { listingId: circListings[0].id, buyerId: farmerUsers[0].id, buyerType: 'FARMER', quantity: 50, unit: 'kg', price: 500, status: 'COMPLETED', completedAt: new Date(now.getTime() - 86400000 * 3) },
      { listingId: circListings[1].id, buyerId: farmerUsers[2].id, buyerType: 'FARMER', quantity: 10, unit: 'kg', price: 450, status: 'COMPLETED', completedAt: new Date(now.getTime() - 86400000 * 2) },
      { listingId: circListings[3].id, buyerId: customerUsers[2].id, buyerType: 'CUSTOMER', quantity: 25, unit: 'kg', price: 300, status: 'COMPLETED', completedAt: new Date(now.getTime() - 86400000) },
    ],
  });
  counts.circularExchanges = circularExchanges.count;
  console.log(`   ✅ ${counts.circularExchanges} circular exchanges created\n`);

  // =====================================================
  // 15. WISHLISTS
  // =====================================================
  console.log('💝 Creating wishlists...');

  const cProfiles = await db.customerProfile.findMany({ orderBy: { createdAt: 'asc' } });

  const wishlists = await db.wishlist.createMany({
    data: [
      { userId: cProfiles[0].id, productId: allProducts[11].id },
      { userId: cProfiles[0].id, productId: allProducts[7].id },
      { userId: cProfiles[1].id, productId: allProducts[12].id },
      { userId: cProfiles[2].id, productId: allProducts[0].id },
    ],
  });
  counts.wishlists = wishlists.count;
  console.log(`   ✅ ${counts.wishlists} wishlist items created\n`);

  // =====================================================
  // 16. MESSAGES
  // =====================================================
  console.log('💬 Creating messages...');

  const messages = await db.message.createMany({
    data: [
      { senderId: customerUsers[0].id, receiverId: farmerUsers[0].id, content: 'Vanakkam! Is the organic tomato available for tomorrow delivery?', messageType: 'TEXT', isRead: true, readAt: new Date(now.getTime() - 86400000) },
      { senderId: farmerUsers[0].id, receiverId: customerUsers[0].id, content: 'Vanakkam! Yes, we have plenty. I will pack 2kg fresh for you tomorrow morning.', messageType: 'TEXT', isRead: true, readAt: new Date(now.getTime() - 82800000) },
      { senderId: customerUsers[0].id, receiverId: fisherUsers[0].id, content: 'Is the seer fish available? Need 1.5kg urgently.', messageType: 'TEXT', isRead: true, readAt: new Date(now.getTime() - 43200000) },
      { senderId: fisherUsers[0].id, receiverId: customerUsers[0].id, content: 'Yes akka, fresh catch today! 1.5kg Vanjaram ready for you.', messageType: 'TEXT', isRead: true, readAt: new Date(now.getTime() - 39600000) },
      { senderId: customerUsers[1].id, receiverId: farmerUsers[1].id, content: 'Can I get 2 litres of A2 milk daily? What is the subscription rate?', messageType: 'TEXT', isRead: false },
    ],
  });
  counts.messages = messages.count;
  console.log(`   ✅ ${counts.messages} messages created\n`);

  // =====================================================
  // 17. CART ITEMS
  // =====================================================
  console.log('🛒 Creating cart items...');

  const cartItems = await db.cartItem.createMany({
    data: [
      { userId: customerUsers[0].id, productId: allProducts[11].id, productName: allProducts[11].name, price: allProducts[11].price, quantity: 1, unit: allProducts[11].unit, sellerId: farmerUsers[2].id, sellerType: 'FARMER' },
      { userId: customerUsers[1].id, productId: allProducts[6].id, productName: allProducts[6].name, price: allProducts[6].price, quantity: 2, unit: allProducts[6].unit, sellerId: farmerUsers[1].id, sellerType: 'FARMER' },
    ],
  });
  counts.cartItems = cartItems.count;
  console.log(`   ✅ ${counts.cartItems} cart items created\n`);

  // =====================================================
  // 18. MODERATION ACTIONS
  // =====================================================
  console.log('🔧 Creating moderation actions...');

  const moderationActions = await db.moderationAction.createMany({
    data: [
      { adminId: aProfiles[0].id, targetType: 'FISHER', targetId: fisherUsers[2].id, action: 'WARNING_ISSUED', reason: 'Excessive order ignoring - 10 ignored orders total', details: '{"warningsIssued": 2, "ignoredOrders": 10}' },
      { adminId: aProfiles[0].id, targetType: 'FISHER', targetId: fisherUsers[1].id, action: 'WARNING_ISSUED', reason: '5 orders ignored in 14 days', details: '{"warningsIssued": 1, "ignoredOrders": 5}' },
      { adminId: aProfiles[1].id, targetType: 'FARMER', targetId: farmerUsers[2].id, action: 'VERIFICATION_APPROVED', reason: 'All documents verified successfully', details: '{"certifications": ["organic", "spiceBoard"], "documents": "complete"}' },
      { adminId: aProfiles[2].id, targetType: 'REVIEW', targetId: reviews[4]?.id || 'review_001', action: 'RESPONDED', reason: 'Customer complaint about slow delivery addressed', details: '{"response": "Apologies for the delay"}' },
    ],
  });
  counts.moderationActions = moderationActions.count;
  console.log(`   ✅ ${counts.moderationActions} moderation actions created\n`);

  // =====================================================
  // 19. AUDIT LOGS
  // =====================================================
  console.log('📋 Creating audit logs...');

  const auditLogs = await db.auditLog.createMany({
    data: [
      { userId: customerUsers[0].id, action: 'LOGIN', targetType: 'USER', targetId: customerUsers[0].id, ipAddress: '103.45.67.89', userAgent: 'Mozilla/5.0 (Android)', details: '{"method": "phone_otp"}' },
      { userId: farmerUsers[0].id, action: 'PRODUCT_CREATED', targetType: 'PRODUCT', targetId: allProducts[0].id, ipAddress: '182.73.12.34', userAgent: 'Mozilla/5.0 (iOS)', details: '{"productName": "Organic Tomato"}' },
      { userId: fisherUsers[2].id, action: 'ORDER_IGNORED', targetType: 'ORDER', targetId: createdOrders[8].order.id, ipAddress: '49.207.45.67', userAgent: 'Mozilla/5.0 (Android)', details: '{"reason": "out_of_stock"}' },
      { userId: adminUsers[0].id, action: 'WARNING_ISSUED', targetType: 'FISHER', targetId: fisherUsers[2].id, ipAddress: '14.139.56.78', userAgent: 'Mozilla/5.0 (Chrome)', details: '{"warningNumber": 2}' },
      { userId: deliveryUsers[0].id, action: 'DELIVERY_COMPLETED', targetType: 'ORDER', targetId: createdOrders[0].order.id, ipAddress: '223.185.89.12', userAgent: 'FarmSea App/2.0', details: '{"deliveryTime": 38}' },
    ],
  });
  counts.auditLogs = auditLogs.count;
  console.log(`   ✅ ${counts.auditLogs} audit logs created\n`);

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('═'.repeat(50));
  console.log('📊 SEED COMPLETE — Summary of all records created:');
  console.log('═'.repeat(50));
  console.log(`  Users:                    ${counts.users}`);
  console.log(`  Customer Profiles:        ${counts.customerProfiles}`);
  console.log(`  Farmer Profiles:          ${counts.farmerProfiles}`);
  console.log(`  Fisher Profiles:          ${counts.fisherProfiles}`);
  console.log(`  Delivery Profiles:        ${counts.deliveryProfiles}`);
  console.log(`  Admin Profiles:           ${counts.adminProfiles}`);
  console.log(`  Products:                 ${counts.products}`);
  console.log(`  Orders:                   ${counts.orders}`);
  console.log(`  Bookings:                 ${counts.bookings}`);
  console.log(`  Delivery Assignments:     ${counts.deliveryAssignments}`);
  console.log(`  Delivery Performance:     ${counts.deliveryPerformance}`);
  console.log(`  Delivery Salary:          ${counts.deliverySalary}`);
  console.log(`  Farmer Trust Scores:      ${counts.farmerTrustScores}`);
  console.log(`  Fisher Trust Scores:      ${counts.fisherTrustScores}`);
  console.log(`  Reviews:                  ${counts.reviews}`);
  console.log(`  Fisher Warnings:          ${counts.fisherWarnings}`);
  console.log(`  Fisher Ignored Orders:    ${counts.fisherIgnoredOrders}`);
  console.log(`  Circular Listings:        ${counts.circularListings}`);
  console.log(`  Circular Exchanges:       ${counts.circularExchanges}`);
  console.log(`  AI Price History:         ${counts.aiPriceHistory}`);
  console.log(`  AI Demand Predictions:    ${counts.aiDemandPredictions}`);
  console.log(`  AI Freshness Logs:        ${counts.aiFreshnessLogs}`);
  console.log(`  AI Matching Logs:         ${counts.aiMatchingLogs}`);
  console.log(`  Notifications:            ${counts.notifications}`);
  console.log(`  Sustainability Scores:    ${counts.sustainabilityScores}`);
  console.log(`  Wishlists:                ${counts.wishlists}`);
  console.log(`  Messages:                 ${counts.messages}`);
  console.log(`  Cart Items:               ${counts.cartItems}`);
  console.log(`  Moderation Actions:       ${counts.moderationActions}`);
  console.log(`  Audit Logs:               ${counts.auditLogs}`);
  console.log('═'.repeat(50));

  const totalRecords = Object.values(counts).reduce((sum, v) => sum + v, 0);
  console.log(`\n  🎉 TOTAL RECORDS: ${totalRecords}\n`);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await db.$disconnect();
    process.exit(1);
  });
