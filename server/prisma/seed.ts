import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alpinecrm.com' },
    update: {},
    create: {
      email: 'admin@alpinecrm.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      timezone: 'UTC',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@alpinecrm.com' },
    update: {},
    create: {
      email: 'manager@alpinecrm.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'manager',
      isActive: true,
      timezone: 'America/New_York',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'john@alpinecrm.com' },
    update: {},
    create: {
      email: 'john@alpinecrm.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: 'user',
      isActive: true,
      timezone: 'America/Chicago',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'emily@alpinecrm.com' },
    update: {},
    create: {
      email: 'emily@alpinecrm.com',
      passwordHash,
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'user',
      isActive: true,
      timezone: 'America/Los_Angeles',
    },
  });

  console.log('✅ Users created');

  // Create contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@techcorp.com',
        phone: '+1-555-0101', company: 'TechCorp Inc', jobTitle: 'CTO',
        status: 'active', source: 'website', leadScore: 85, tags: ['enterprise', 'tech'],
        ownerId: user1.id, address: { city: 'San Francisco', state: 'CA', country: 'US' },
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Jessica', lastName: 'Williams', email: 'jessica@designstudio.io',
        phone: '+1-555-0102', company: 'Design Studio', jobTitle: 'Creative Director',
        status: 'active', source: 'referral', leadScore: 72, tags: ['creative', 'agency'],
        ownerId: user1.id, address: { city: 'New York', state: 'NY', country: 'US' },
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'David', lastName: 'Brown', email: 'david.b@globalfinance.com',
        phone: '+1-555-0103', company: 'Global Finance LLC', jobTitle: 'VP of Operations',
        status: 'active', source: 'event', leadScore: 90, tags: ['finance', 'enterprise'],
        ownerId: manager.id, address: { city: 'Chicago', state: 'IL', country: 'US' },
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Anna', lastName: 'Martinez', email: 'anna@startupfuel.co',
        phone: '+1-555-0104', company: 'StartupFuel', jobTitle: 'CEO',
        status: 'active', source: 'social', leadScore: 65, tags: ['startup', 'saas'],
        ownerId: user2.id, address: { city: 'Austin', state: 'TX', country: 'US' },
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Robert', lastName: 'Taylor', email: 'r.taylor@megahealth.org',
        phone: '+1-555-0105', company: 'MegaHealth Systems', jobTitle: 'IT Director',
        status: 'active', source: 'email', leadScore: 78, tags: ['healthcare', 'enterprise'],
        ownerId: user2.id, address: { city: 'Boston', state: 'MA', country: 'US' },
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Lisa', lastName: 'Anderson', email: 'lisa@ecomwave.com',
        phone: '+1-555-0106', company: 'EcomWave', jobTitle: 'Head of Growth',
        status: 'active', source: 'website', leadScore: 55, tags: ['ecommerce', 'growth'],
        ownerId: user1.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'James', lastName: 'Wilson', email: 'j.wilson@buildright.com',
        phone: '+1-555-0107', company: 'BuildRight Construction', jobTitle: 'Owner',
        status: 'inactive', source: 'referral', leadScore: 40, tags: ['construction', 'smb'],
        ownerId: manager.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Sophie', lastName: 'Garcia', email: 'sophie@learnhub.edu',
        phone: '+1-555-0108', company: 'LearnHub Education', jobTitle: 'Director of Technology',
        status: 'active', source: 'event', leadScore: 68, tags: ['education', 'tech'],
        ownerId: user1.id,
      },
    }),
  ]);

  console.log('✅ Contacts created');

  // Create deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        name: 'TechCorp Enterprise License', contactId: contacts[0].id, company: 'TechCorp Inc',
        value: 125000, currency: 'USD', stage: 'negotiation', probability: 75,
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        ownerId: user1.id, status: 'open', description: 'Full enterprise license with support package',
        products: [{ name: 'Enterprise License', quantity: 1, price: 100000 }, { name: 'Support Package', quantity: 1, price: 25000 }],
      },
    }),
    prisma.deal.create({
      data: {
        name: 'Design Studio Annual Plan', contactId: contacts[1].id, company: 'Design Studio',
        value: 24000, currency: 'USD', stage: 'proposal', probability: 50,
        expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        ownerId: user1.id, status: 'open', description: 'Annual subscription for creative team',
        products: [{ name: 'Pro Plan', quantity: 12, price: 2000 }],
      },
    }),
    prisma.deal.create({
      data: {
        name: 'Global Finance Implementation', contactId: contacts[2].id, company: 'Global Finance LLC',
        value: 250000, currency: 'USD', stage: 'qualification', probability: 25,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        ownerId: manager.id, status: 'open', description: 'Full CRM implementation and data migration',
        products: [{ name: 'Implementation', quantity: 1, price: 150000 }, { name: 'Training', quantity: 1, price: 50000 }, { name: 'Migration', quantity: 1, price: 50000 }],
      },
    }),
    prisma.deal.create({
      data: {
        name: 'StartupFuel Starter Pack', contactId: contacts[3].id, company: 'StartupFuel',
        value: 5000, currency: 'USD', stage: 'prospecting', probability: 10,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ownerId: user2.id, status: 'open', description: 'Starter package for growing startup',
      },
    }),
    prisma.deal.create({
      data: {
        name: 'MegaHealth Custom Solution', contactId: contacts[4].id, company: 'MegaHealth Systems',
        value: 180000, currency: 'USD', stage: 'proposal', probability: 50,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        ownerId: user2.id, status: 'open', description: 'HIPAA-compliant CRM solution',
      },
    }),
    prisma.deal.create({
      data: {
        name: 'EcomWave Growth Plan', contactId: contacts[5].id, company: 'EcomWave',
        value: 36000, currency: 'USD', stage: 'closed_won', probability: 100,
        expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        actualCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        ownerId: user1.id, status: 'won',
      },
    }),
  ]);

  console.log('✅ Deals created');

  // Create tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with TechCorp on pricing', type: 'call', priority: 'high',
        status: 'pending', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedToId: user1.id, createdById: manager.id, contactId: contacts[0].id, dealId: deals[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Send proposal to Design Studio', type: 'email', priority: 'medium',
        status: 'in_progress', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        assignedToId: user1.id, createdById: user1.id, contactId: contacts[1].id, dealId: deals[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Schedule demo with Global Finance', type: 'meeting', priority: 'high',
        status: 'pending', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedToId: manager.id, createdById: admin.id, contactId: contacts[2].id, dealId: deals[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review MegaHealth compliance requirements', type: 'task', priority: 'urgent',
        status: 'pending', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        assignedToId: user2.id, createdById: manager.id, contactId: contacts[4].id, dealId: deals[4].id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Prepare quarterly sales report', type: 'task', priority: 'medium',
        status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedToId: manager.id, createdById: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Onboarding call with EcomWave', type: 'call', priority: 'high',
        status: 'completed', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedToId: user1.id, createdById: user1.id, contactId: contacts[5].id, dealId: deals[5].id,
      },
    }),
  ]);

  console.log('✅ Tasks created');

  // Create tickets
  await Promise.all([
    prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-001', subject: 'Integration issue with API', description: 'We are experiencing timeout errors when connecting to the REST API endpoint.',
        status: 'open', priority: 'high', category: 'Technical Support',
        contactId: contacts[0].id, assignedToId: user1.id, tags: ['api', 'integration'],
      },
    }),
    prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-002', subject: 'Billing inquiry for Q4', description: 'Need clarification on invoice items for Q4 billing cycle.',
        status: 'pending', priority: 'normal', category: 'Billing',
        contactId: contacts[5].id, assignedToId: user2.id, tags: ['billing', 'invoice'],
      },
    }),
    prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-003', subject: 'Feature request: Custom dashboards', description: 'Would like ability to create custom dashboard widgets with our own metrics.',
        status: 'open', priority: 'low', category: 'Feature Request',
        contactId: contacts[2].id, assignedToId: manager.id, tags: ['feature-request', 'dashboard'],
      },
    }),
  ]);

  console.log('✅ Tickets created');

  // Create appointments
  await Promise.all([
    prisma.appointment.create({
      data: {
        title: 'TechCorp Contract Review', description: 'Review final contract terms',
        location: 'Zoom Meeting', startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        timezone: 'America/New_York', status: 'confirmed',
        contactId: contacts[0].id, dealId: deals[0].id, createdById: user1.id,
        attendees: [{ name: 'Michael Chen', email: 'michael.chen@techcorp.com' }],
      },
    }),
    prisma.appointment.create({
      data: {
        title: 'Global Finance Discovery Call', description: 'Initial requirements gathering',
        location: 'Google Meet', startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        timezone: 'America/Chicago', status: 'scheduled',
        contactId: contacts[2].id, dealId: deals[2].id, createdById: manager.id,
        attendees: [{ name: 'David Brown', email: 'david.b@globalfinance.com' }],
      },
    }),
    prisma.appointment.create({
      data: {
        title: 'Weekly Team Standup', description: 'Weekly sales team meeting',
        location: 'Office Conference Room A', startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        timezone: 'UTC', status: 'confirmed', createdById: manager.id, recurrence: 'weekly',
      },
    }),
  ]);

  console.log('✅ Appointments created');

  // Create invoices
  await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-001', contactId: contacts[5].id, dealId: deals[5].id,
        status: 'paid', issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        subtotal: 36000, taxRate: 10, taxAmount: 3600, total: 39600,
        currency: 'USD', paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: [{ name: 'Growth Plan - Annual', quantity: 1, unitPrice: 36000, total: 36000 }],
        terms: 'Net 30',
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-002', contactId: contacts[1].id, dealId: deals[1].id,
        status: 'sent', issueDate: new Date(), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 24000, taxRate: 10, taxAmount: 2400, total: 26400,
        currency: 'USD',
        items: [{ name: 'Pro Plan - Annual', quantity: 12, unitPrice: 2000, total: 24000 }],
        terms: 'Net 30',
      },
    }),
  ]);

  console.log('✅ Invoices created');

  // Create email templates
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email', subject: 'Welcome to Alpine CRM, {{firstName}}!',
        body: 'Hi {{firstName}},\n\nWelcome to Alpine CRM! We are thrilled to have you onboard.\n\nYour account has been set up and is ready to use. Here are some quick tips to get started:\n\n1. Set up your profile\n2. Import your contacts\n3. Create your first deal\n\nIf you need any help, don\'t hesitate to reach out!\n\nBest regards,\nThe Alpine CRM Team',
        variables: ['firstName', 'lastName', 'email'],
        category: 'onboarding',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Follow Up', subject: 'Following up on our conversation',
        body: 'Hi {{firstName}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nI\'d love to schedule a call to discuss how Alpine CRM can help {{company}} achieve its goals.\n\nWould {{proposedDate}} work for you?\n\nBest,\n{{senderName}}',
        variables: ['firstName', 'topic', 'company', 'proposedDate', 'senderName'],
        category: 'sales',
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Deal Won Notification', subject: 'Congratulations! Deal {{dealName}} is closed!',
        body: 'Hi {{firstName}},\n\nGreat news! The deal "{{dealName}}" worth {{dealValue}} has been successfully closed!\n\nNext steps:\n1. Send welcome package to client\n2. Schedule onboarding call\n3. Set up implementation timeline\n\nCongratulations on this achievement!\n\nBest,\nAlpine CRM',
        variables: ['firstName', 'dealName', 'dealValue'],
        category: 'notification',
      },
    }),
  ]);

  console.log('✅ Email templates created');

  // Create some activities
  await Promise.all([
    prisma.activity.create({
      data: { type: 'created', title: 'Contact created: Michael Chen', contactId: contacts[0].id, userId: user1.id },
    }),
    prisma.activity.create({
      data: { type: 'created', title: 'Deal created: TechCorp Enterprise License', dealId: deals[0].id, userId: user1.id },
    }),
    prisma.activity.create({
      data: { type: 'status_changed', title: 'Deal won: EcomWave Growth Plan', dealId: deals[5].id, userId: user1.id, metadata: { oldStage: 'negotiation', newStage: 'closed_won' } },
    }),
    prisma.activity.create({
      data: { type: 'emailed', title: 'Email sent to Jessica Williams', contactId: contacts[1].id, userId: user1.id },
    }),
    prisma.activity.create({
      data: { type: 'called', title: 'Call with David Brown', contactId: contacts[2].id, userId: manager.id },
    }),
  ]);

  console.log('✅ Activities created');

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'company_name' },
    update: {},
    create: { key: 'company_name', value: '"Alpine CRM"' },
  });

  await prisma.setting.upsert({
    where: { key: 'currency' },
    update: {},
    create: { key: 'currency', value: '"USD"' },
  });

  await prisma.setting.upsert({
    where: { key: 'timezone' },
    update: {},
    create: { key: 'timezone', value: '"UTC"' },
  });

  console.log('✅ Settings created');
  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin: admin@alpinecrm.com / Password123!');
  console.log('  Manager: manager@alpinecrm.com / Password123!');
  console.log('  User 1: john@alpinecrm.com / Password123!');
  console.log('  User 2: emily@alpinecrm.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
