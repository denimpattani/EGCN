import bcrypt from 'bcrypt';
import Admin from '../models/Admin.model.js';
import Plan from '../models/Plan.model.js';

export const seedDatabase = async () => {
  try {
    console.log('🔄 Checking database seeding requirements...');

    // 1. Seed Fixed Administrator Account
    const adminEmail = 'egcnetworkofficial@gmail.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log('🌱 Admin account not found. Seeding default platform credentials...');
      const hashedPassword = await bcrypt.hash('Param@1402', 12);
      await Admin.create({
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
      });
      console.log('✅ Default platform admin account successfully seeded!');
    } else {
      console.log('🛡️ Platform administrator account verified.');
    }

    // 2. Seed Default User Plans
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      console.log('🌱 No subscription plans found. Seeding default platform plans...');
      
      const defaultPlans = [
        {
          name: 'business',
          displayName: 'Business Enhancement',
          price: 799,
          description: 'Perfect for growing businesses needing direct expert advice.',
          features: [
            'Access to target metrics and forecasts',
            'Direct real-time expert advisory chat',
            'PDF target sheets & media sharing',
            'Interactive consulting calendar',
            'Pulsing unread notification badges',
          ],
          durationDays: 30,
          isRecommended: false,
          accentHex: '#8C8C8C',
        },
        {
          name: 'pro',
          displayName: 'Pro Plan',
          price: 1499,
          description: 'Complete advisory suite with local physical consulting site visits.',
          features: [
            'All features in Business Enhancement',
            'Physical advisory site visits scheduling',
            'Advanced linear trend projections',
            'Priority expert response windows',
            'Custom taxation & invoicing details',
          ],
          durationDays: 30,
          isRecommended: true,
          accentHex: '#d74339',
        },
        {
          name: 'vip',
          displayName: 'VIP Advisory',
          price: 2999,
          description: 'Sovereign resource optimization and dedicated consulting agents.',
          features: [
            'All features in Pro Plan',
            'Dedicated elite consulting expert',
            'Monthly structural strategy reviews',
            'Resource utilization auditing',
            '24/7 custom phone advisory direct',
          ],
          durationDays: 30,
          isRecommended: false,
          accentHex: '#D4AF37',
        },
      ];

      await Plan.insertMany(defaultPlans);
      console.log('✅ Default platform plans successfully seeded!');
    } else {
      console.log('💳 Platform subscription plans verified.');
    }
  } catch (error) {
    console.error('❌ Failed to run database seed triggers:', error);
  }
};
