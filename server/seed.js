import { Service } from './models/Service.js';
import { EmergencyGuide } from './models/EmergencyGuide.js';
import { services as servicesData } from './data/services.js';
import { emergencyGuides as guidesData } from './data/emergencyGuides.js';
import { testConnection, initializeDatabase } from './config/db.js';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize tables
    await initializeDatabase();

    // Seed services
    console.log('📦 Seeding services...');
    for (const serviceData of servicesData) {
      await Service.create({
        ...serviceData,
        services_offered: serviceData.servicesOffered,
        is_demo: serviceData.isDemo,
        organization_id: null
      });
    }
    console.log(`✅ Seeded ${servicesData.length} services\n`);

    // Seed emergency guides
    console.log('🚨 Seeding emergency guides...');
    for (const guideData of guidesData) {
      await EmergencyGuide.create({
        ...guideData,
        locally_verified: guideData.locallyVerified || false,
        organization_id: null
      });
    }
    console.log(`✅ Seeded ${guidesData.length} emergency guides\n`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
