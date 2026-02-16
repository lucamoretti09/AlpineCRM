// =============================================================================
// Mock Data for AlpineCRM Demo (Public Vercel Deployment)
// =============================================================================
// Provides realistic demo data for all CRM API endpoints so the frontend
// can operate without a backend server.
// =============================================================================

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function todayAt(hour: number, minute: number = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysFromNowAt(n: number, hour: number, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function uuid(index: number): string {
  const hex = index.toString(16).padStart(4, '0');
  return `mock-${hex}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. Dashboard Stats
// ---------------------------------------------------------------------------

function getDashboardStats() {
  return {
    data: {
      contacts: { total: 847, active: 623 },
      deals: {
        total: 156,
        open: 42,
        won: 89,
        pipelineValue: 2450000,
        wonValue: 1875000,
        winRate: 72,
      },
      tasks: { total: 234, pending: 18, overdue: 3 },
      tickets: { total: 89, open: 12 },
      invoices: { total: 312, paid: 278, totalRevenue: 1456000 },
      recentActivities: [
        {
          id: 'act-001',
          type: 'contact_created',
          title: 'New contact added',
          description: 'Sarah Chen from TechVault was added to contacts',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(1),
        },
        {
          id: 'act-002',
          type: 'deal_won',
          title: 'Deal closed won',
          description: 'Enterprise License for Quantum Labs - $125,000',
          userName: 'Jordan Lee',
          createdAt: hoursAgo(3),
        },
        {
          id: 'act-003',
          type: 'task_completed',
          title: 'Task completed',
          description: 'Follow up call with Nexus Digital completed',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(5),
        },
        {
          id: 'act-004',
          type: 'email_sent',
          title: 'Email sent',
          description: 'Proposal document sent to Marcus Rivera at Pinnacle Group',
          userName: 'Taylor Swift',
          createdAt: hoursAgo(7),
        },
        {
          id: 'act-005',
          type: 'invoice_created',
          title: 'Invoice created',
          description: 'INV-312 for $18,500 issued to Acme Corp',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(10),
        },
        {
          id: 'act-006',
          type: 'deal_created',
          title: 'New deal created',
          description: 'SaaS Migration project with CloudNine Inc - $85,000',
          userName: 'Jordan Lee',
          createdAt: hoursAgo(14),
        },
        {
          id: 'act-007',
          type: 'comment_added',
          title: 'Comment added',
          description: 'Internal note added to ticket #TK-089',
          userName: 'Casey Brooks',
          createdAt: hoursAgo(18),
        },
        {
          id: 'act-008',
          type: 'call_logged',
          title: 'Call logged',
          description: '15-minute discovery call with Elena Vasquez at Orbit Solutions',
          userName: 'Alex Morgan',
          createdAt: daysAgo(1),
        },
        {
          id: 'act-009',
          type: 'note_added',
          title: 'Note added',
          description: 'Updated requirements for the Zenith Corp implementation',
          userName: 'Taylor Swift',
          createdAt: daysAgo(1),
        },
        {
          id: 'act-010',
          type: 'deal_lost',
          title: 'Deal closed lost',
          description: 'Website Redesign for BlueShore Media - $32,000',
          userName: 'Jordan Lee',
          createdAt: daysAgo(2),
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Dashboard Pipeline
// ---------------------------------------------------------------------------

function getDashboardPipeline() {
  return {
    data: [
      { stage: 'prospecting', count: 12, totalValue: 320000 },
      { stage: 'qualification', count: 8, totalValue: 540000 },
      { stage: 'proposal', count: 10, totalValue: 780000 },
      { stage: 'negotiation', count: 7, totalValue: 520000 },
      { stage: 'closed_won', count: 5, totalValue: 290000 },
    ],
  };
}

// ---------------------------------------------------------------------------
// 3. Dashboard Upcoming Tasks
// ---------------------------------------------------------------------------

function getDashboardUpcomingTasks() {
  return {
    data: [
      {
        id: 'utask-001',
        title: 'Follow up with Sarah Chen on partnership proposal',
        dueDate: daysFromNow(0),
        priority: 'high' as const,
        status: 'pending',
        contactName: 'Sarah Chen',
        dealName: 'TechVault Partnership',
      },
      {
        id: 'utask-002',
        title: 'Prepare Q1 revenue report for leadership review',
        dueDate: daysFromNow(1),
        priority: 'urgent' as const,
        status: 'pending',
        contactName: undefined,
        dealName: undefined,
      },
      {
        id: 'utask-003',
        title: 'Send revised contract to Quantum Labs',
        dueDate: daysFromNow(1),
        priority: 'high' as const,
        status: 'in_progress',
        contactName: 'David Park',
        dealName: 'Enterprise License',
      },
      {
        id: 'utask-004',
        title: 'Schedule product demo with Nexus Digital team',
        dueDate: daysFromNow(2),
        priority: 'medium' as const,
        status: 'pending',
        contactName: 'Priya Sharma',
        dealName: 'Nexus Digital Expansion',
      },
      {
        id: 'utask-005',
        title: 'Review and approve marketing collateral for trade show',
        dueDate: daysFromNow(3),
        priority: 'low' as const,
        status: 'pending',
        contactName: undefined,
        dealName: undefined,
      },
      {
        id: 'utask-006',
        title: 'Call Marcus Rivera to discuss implementation timeline',
        dueDate: daysFromNow(4),
        priority: 'medium' as const,
        status: 'pending',
        contactName: 'Marcus Rivera',
        dealName: 'Pinnacle Group Onboarding',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 4. Contacts
// ---------------------------------------------------------------------------

function getContacts() {
  return {
    data: {
      total: 847,
      contacts: [
        { id: 'c-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@techvault.io', phone: '+1 (415) 555-0101', company: 'TechVault', status: 'active', createdAt: daysAgo(5), tags: ['enterprise', 'tech'], ownerId: 'demo-user-1', leadScore: 92, jobTitle: 'VP of Engineering', source: 'referral' },
        { id: 'c-002', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.r@pinnaclegroup.com', phone: '+1 (212) 555-0202', company: 'Pinnacle Group', status: 'active', createdAt: daysAgo(8), tags: ['finance', 'decision-maker'], ownerId: 'demo-user-1', leadScore: 88, jobTitle: 'CFO', source: 'website' },
        { id: 'c-003', firstName: 'Priya', lastName: 'Sharma', email: 'priya@nexusdigital.com', phone: '+1 (650) 555-0303', company: 'Nexus Digital', status: 'active', createdAt: daysAgo(12), tags: ['marketing', 'saas'], ownerId: 'demo-user-2', leadScore: 76, jobTitle: 'Head of Marketing', source: 'social' },
        { id: 'c-004', firstName: 'David', lastName: 'Park', email: 'dpark@quantumlabs.co', phone: '+1 (408) 555-0404', company: 'Quantum Labs', status: 'active', createdAt: daysAgo(3), tags: ['enterprise', 'r&d'], ownerId: 'demo-user-1', leadScore: 95, jobTitle: 'CTO', source: 'event' },
        { id: 'c-005', firstName: 'Elena', lastName: 'Vasquez', email: 'elena.v@orbitsolutions.io', phone: '+1 (310) 555-0505', company: 'Orbit Solutions', status: 'active', createdAt: daysAgo(15), tags: ['startup', 'tech'], ownerId: 'demo-user-2', leadScore: 67, jobTitle: 'Co-Founder', source: 'referral' },
        { id: 'c-006', firstName: 'James', lastName: 'Whitfield', email: 'jwhitfield@acmecorp.com', phone: '+1 (512) 555-0606', company: 'Acme Corp', status: 'active', createdAt: daysAgo(20), tags: ['enterprise', 'manufacturing'], ownerId: 'demo-user-1', leadScore: 83, jobTitle: 'Director of Operations', source: 'website' },
        { id: 'c-007', firstName: 'Aisha', lastName: 'Okafor', email: 'aisha@cloudnineinc.com', phone: '+1 (917) 555-0707', company: 'CloudNine Inc', status: 'active', createdAt: daysAgo(7), tags: ['cloud', 'mid-market'], ownerId: 'demo-user-1', leadScore: 71, jobTitle: 'IT Director', source: 'email' },
        { id: 'c-008', firstName: 'Tom', lastName: 'Hartley', email: 'thartley@zenithcorp.com', phone: '+1 (303) 555-0808', company: 'Zenith Corp', status: 'active', createdAt: daysAgo(25), tags: ['enterprise'], ownerId: 'demo-user-2', leadScore: 79, jobTitle: 'VP of Sales', source: 'event' },
        { id: 'c-009', firstName: 'Megan', lastName: 'Foster', email: 'mfoster@blueshoremedia.com', phone: '+1 (619) 555-0909', company: 'BlueShore Media', status: 'inactive', createdAt: daysAgo(30), tags: ['media', 'smb'], ownerId: 'demo-user-1', leadScore: 42, jobTitle: 'Marketing Manager', source: 'social' },
        { id: 'c-010', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@stellarworks.dev', phone: '+1 (206) 555-1010', company: 'Stellar Works', status: 'active', createdAt: daysAgo(2), tags: ['tech', 'consulting'], ownerId: 'demo-user-1', leadScore: 86, jobTitle: 'CEO', source: 'referral' },
        { id: 'c-011', firstName: 'Nina', lastName: 'Kowalski', email: 'nina.k@apexventures.com', phone: '+1 (773) 555-1111', company: 'Apex Ventures', status: 'active', createdAt: daysAgo(14), tags: ['vc', 'finance'], ownerId: 'demo-user-2', leadScore: 74, jobTitle: 'Managing Partner', source: 'website' },
        { id: 'c-012', firstName: 'Lucas', lastName: 'Fernandez', email: 'lfernandez@brightpath.io', phone: '+1 (954) 555-1212', company: 'BrightPath', status: 'active', createdAt: daysAgo(9), tags: ['edtech', 'startup'], ownerId: 'demo-user-1', leadScore: 63, jobTitle: 'Product Manager', source: 'email' },
        { id: 'c-013', firstName: 'Chloe', lastName: 'Nguyen', email: 'chloe@vortexai.com', phone: '+1 (425) 555-1313', company: 'Vortex AI', status: 'active', createdAt: daysAgo(6), tags: ['ai', 'enterprise'], ownerId: 'demo-user-1', leadScore: 91, jobTitle: 'Head of Partnerships', source: 'event' },
        { id: 'c-014', firstName: 'Ryan', lastName: 'O\'Brien', email: 'robrien@ironclad.co', phone: '+1 (617) 555-1414', company: 'Ironclad Solutions', status: 'inactive', createdAt: daysAgo(45), tags: ['legal', 'enterprise'], ownerId: 'demo-user-2', leadScore: 38, jobTitle: 'General Counsel', source: 'referral' },
        { id: 'c-015', firstName: 'Fatima', lastName: 'Al-Rashid', email: 'fatima@crescenttech.com', phone: '+1 (469) 555-1515', company: 'Crescent Technologies', status: 'active', createdAt: daysAgo(11), tags: ['tech', 'mid-market'], ownerId: 'demo-user-1', leadScore: 69, jobTitle: 'Engineering Lead', source: 'social' },
        { id: 'c-016', firstName: 'Derek', lastName: 'Morrison', email: 'dmorrison@summitgrp.com', phone: '+1 (404) 555-1616', company: 'Summit Group', status: 'active', createdAt: daysAgo(18), tags: ['consulting', 'enterprise'], ownerId: 'demo-user-2', leadScore: 81, jobTitle: 'Senior VP', source: 'website' },
        { id: 'c-017', firstName: 'Yuki', lastName: 'Tanaka', email: 'ytanaka@novastream.io', phone: '+1 (503) 555-1717', company: 'NovaStream', status: 'active', createdAt: daysAgo(4), tags: ['streaming', 'tech'], ownerId: 'demo-user-1', leadScore: 77, jobTitle: 'CTO', source: 'event' },
        { id: 'c-018', firstName: 'Amanda', lastName: 'Brooks', email: 'abrooks@terraforma.co', phone: '+1 (720) 555-1818', company: 'TerraForma', status: 'active', createdAt: daysAgo(22), tags: ['sustainability', 'enterprise'], ownerId: 'demo-user-1', leadScore: 85, jobTitle: 'Director of Innovation', source: 'referral' },
        { id: 'c-019', firstName: 'Hassan', lastName: 'Mahmoud', email: 'hmahmoud@corewavedata.com', phone: '+1 (214) 555-1919', company: 'CoreWave Data', status: 'active', createdAt: daysAgo(13), tags: ['data', 'analytics'], ownerId: 'demo-user-2', leadScore: 72, jobTitle: 'VP Data Engineering', source: 'email' },
        { id: 'c-020', firstName: 'Olivia', lastName: 'Grant', email: 'ogrant@luminarydesign.com', phone: '+1 (602) 555-2020', company: 'Luminary Design', status: 'active', createdAt: daysAgo(1), tags: ['design', 'agency'], ownerId: 'demo-user-1', leadScore: 58, jobTitle: 'Creative Director', source: 'social' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Deals
// ---------------------------------------------------------------------------

function getDeals() {
  return {
    data: {
      total: 156,
      deals: [
        { id: 'd-001', name: 'Enterprise License Agreement', company: 'Quantum Labs', value: 125000, stage: 'negotiation', probability: 80, expectedCloseDate: daysFromNow(14), contact: { firstName: 'David', lastName: 'Park' }, status: 'open', createdAt: daysAgo(21) },
        { id: 'd-002', name: 'SaaS Platform Migration', company: 'CloudNine Inc', value: 85000, stage: 'proposal', probability: 65, expectedCloseDate: daysFromNow(21), contact: { firstName: 'Aisha', lastName: 'Okafor' }, status: 'open', createdAt: daysAgo(14) },
        { id: 'd-003', name: 'Annual Support Contract', company: 'Acme Corp', value: 42000, stage: 'closed_won', probability: 100, expectedCloseDate: daysAgo(3), contact: { firstName: 'James', lastName: 'Whitfield' }, status: 'won', createdAt: daysAgo(35) },
        { id: 'd-004', name: 'Data Analytics Dashboard', company: 'CoreWave Data', value: 67000, stage: 'qualification', probability: 40, expectedCloseDate: daysFromNow(30), contact: { firstName: 'Hassan', lastName: 'Mahmoud' }, status: 'open', createdAt: daysAgo(10) },
        { id: 'd-005', name: 'TechVault Partnership', company: 'TechVault', value: 190000, stage: 'proposal', probability: 70, expectedCloseDate: daysFromNow(18), contact: { firstName: 'Sarah', lastName: 'Chen' }, status: 'open', createdAt: daysAgo(17) },
        { id: 'd-006', name: 'Nexus Digital Expansion', company: 'Nexus Digital', value: 56000, stage: 'prospecting', probability: 25, expectedCloseDate: daysFromNow(45), contact: { firstName: 'Priya', lastName: 'Sharma' }, status: 'open', createdAt: daysAgo(5) },
        { id: 'd-007', name: 'Pinnacle Group Onboarding', company: 'Pinnacle Group', value: 78000, stage: 'negotiation', probability: 85, expectedCloseDate: daysFromNow(7), contact: { firstName: 'Marcus', lastName: 'Rivera' }, status: 'open', createdAt: daysAgo(28) },
        { id: 'd-008', name: 'Website Redesign', company: 'BlueShore Media', value: 32000, stage: 'closed_lost', probability: 0, expectedCloseDate: daysAgo(5), contact: { firstName: 'Megan', lastName: 'Foster' }, status: 'lost', createdAt: daysAgo(40) },
        { id: 'd-009', name: 'AI Integration Project', company: 'Vortex AI', value: 210000, stage: 'proposal', probability: 60, expectedCloseDate: daysFromNow(25), contact: { firstName: 'Chloe', lastName: 'Nguyen' }, status: 'open', createdAt: daysAgo(12) },
        { id: 'd-010', name: 'Consulting Engagement', company: 'Stellar Works', value: 48000, stage: 'qualification', probability: 50, expectedCloseDate: daysFromNow(35), contact: { firstName: 'Raj', lastName: 'Patel' }, status: 'open', createdAt: daysAgo(8) },
        { id: 'd-011', name: 'Sustainability Platform', company: 'TerraForma', value: 135000, stage: 'prospecting', probability: 20, expectedCloseDate: daysFromNow(60), contact: { firstName: 'Amanda', lastName: 'Brooks' }, status: 'open', createdAt: daysAgo(3) },
        { id: 'd-012', name: 'Streaming Infrastructure', company: 'NovaStream', value: 94000, stage: 'qualification', probability: 45, expectedCloseDate: daysFromNow(28), contact: { firstName: 'Yuki', lastName: 'Tanaka' }, status: 'open', createdAt: daysAgo(6) },
        { id: 'd-013', name: 'Creative Suite License', company: 'Luminary Design', value: 23000, stage: 'prospecting', probability: 15, expectedCloseDate: daysFromNow(50), contact: { firstName: 'Olivia', lastName: 'Grant' }, status: 'open', createdAt: daysAgo(1) },
        { id: 'd-014', name: 'Summit Analytics Rollout', company: 'Summit Group', value: 156000, stage: 'negotiation', probability: 75, expectedCloseDate: daysFromNow(10), contact: { firstName: 'Derek', lastName: 'Morrison' }, status: 'open', createdAt: daysAgo(30) },
        { id: 'd-015', name: 'EdTech Platform License', company: 'BrightPath', value: 38000, stage: 'closed_won', probability: 100, expectedCloseDate: daysAgo(7), contact: { firstName: 'Lucas', lastName: 'Fernandez' }, status: 'won', createdAt: daysAgo(42) },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 5b. Deals Kanban View
// ---------------------------------------------------------------------------

function getDealsKanban() {
  const deals = getDeals().data.deals;
  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  const kanban = stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
      deals: stageDeals,
    };
  });

  return { data: kanban };
}

// ---------------------------------------------------------------------------
// 6. Tasks
// ---------------------------------------------------------------------------

function getTasks() {
  return {
    data: {
      total: 234,
      tasks: [
        { id: 't-001', title: 'Follow up with Sarah Chen on partnership proposal', description: 'Discuss pricing tiers and integration timeline', status: 'pending', priority: 'high', type: 'follow_up', dueDate: daysFromNow(0), createdAt: daysAgo(3), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Sarah Chen', dealName: 'TechVault Partnership' },
        { id: 't-002', title: 'Prepare Q1 revenue report', description: 'Compile all deal closings and revenue metrics for board presentation', status: 'in_progress', priority: 'urgent', type: 'task', dueDate: daysFromNow(1), createdAt: daysAgo(5), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: undefined, dealName: undefined },
        { id: 't-003', title: 'Send revised contract to Quantum Labs', description: 'Updated terms per legal review on clause 4.2 and SLA section', status: 'pending', priority: 'high', type: 'email', dueDate: daysFromNow(1), createdAt: daysAgo(2), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'David Park', dealName: 'Enterprise License' },
        { id: 't-004', title: 'Schedule product demo with Nexus Digital', description: 'Coordinate with engineering team for live demo environment', status: 'pending', priority: 'medium', type: 'meeting', dueDate: daysFromNow(2), createdAt: daysAgo(4), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Priya Sharma', dealName: 'Nexus Digital Expansion' },
        { id: 't-005', title: 'Review marketing collateral for trade show', description: 'Approve brochures, banners, and demo booth materials', status: 'pending', priority: 'low', type: 'task', dueDate: daysFromNow(3), createdAt: daysAgo(7), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: undefined, dealName: undefined },
        { id: 't-006', title: 'Call Marcus Rivera about implementation', description: 'Discuss project phases, resource allocation, and go-live date', status: 'pending', priority: 'medium', type: 'call', dueDate: daysFromNow(4), createdAt: daysAgo(1), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Marcus Rivera', dealName: 'Pinnacle Group Onboarding' },
        { id: 't-007', title: 'Update CRM data for Orbit Solutions', description: 'Add latest meeting notes and update deal probability', status: 'completed', priority: 'low', type: 'task', dueDate: daysAgo(1), createdAt: daysAgo(6), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: 'Elena Vasquez', dealName: undefined },
        { id: 't-008', title: 'Onboarding session with BrightPath team', description: 'Walk through platform features and admin settings', status: 'completed', priority: 'high', type: 'meeting', dueDate: daysAgo(2), createdAt: daysAgo(10), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'Lucas Fernandez', dealName: 'EdTech Platform License' },
        { id: 't-009', title: 'Draft proposal for Vortex AI integration', description: 'Include technical architecture, timeline, and pricing for AI modules', status: 'in_progress', priority: 'high', type: 'task', dueDate: daysFromNow(5), createdAt: daysAgo(3), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Chloe Nguyen', dealName: 'AI Integration Project' },
        { id: 't-010', title: 'Renewal reminder for Acme Corp', description: 'Support contract up for renewal in 30 days', status: 'pending', priority: 'medium', type: 'follow_up', dueDate: daysFromNow(7), createdAt: daysAgo(1), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: 'James Whitfield', dealName: 'Annual Support Contract' },
        { id: 't-011', title: 'Coordinate legal review for Summit deal', description: 'Send contract to legal for NDA and MSA review', status: 'pending', priority: 'high', type: 'task', dueDate: daysFromNow(2), createdAt: daysAgo(4), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'Derek Morrison', dealName: 'Summit Analytics Rollout' },
        { id: 't-012', title: 'Update competitor analysis document', description: 'Refresh pricing and feature comparison charts', status: 'pending', priority: 'low', type: 'task', dueDate: daysFromNow(10), createdAt: daysAgo(8), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: undefined, dealName: undefined },
        { id: 't-013', title: 'Follow up on NovaStream discovery call', description: 'Send summary email and next steps after initial call', status: 'completed', priority: 'medium', type: 'follow_up', dueDate: daysAgo(1), createdAt: daysAgo(5), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Yuki Tanaka', dealName: 'Streaming Infrastructure' },
        { id: 't-014', title: 'Customer feedback survey analysis', description: 'Compile NPS scores and identify top 5 improvement areas', status: 'in_progress', priority: 'medium', type: 'task', dueDate: daysFromNow(6), createdAt: daysAgo(9), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: undefined, dealName: undefined },
        { id: 't-015', title: 'Send welcome package to Olivia Grant', description: 'New prospect intro kit with case studies and product overview', status: 'pending', priority: 'low', type: 'email', dueDate: daysFromNow(1), createdAt: daysAgo(1), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: 'Olivia Grant', dealName: 'Creative Suite License' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 7. Tickets
// ---------------------------------------------------------------------------

function getTickets() {
  return {
    data: {
      total: 89,
      tickets: [
        { id: 'tk-001', ticketNumber: 'TK-089', subject: 'Unable to export dashboard reports to PDF', description: 'When clicking the export button on the analytics dashboard, the PDF generation fails with a timeout error. This affects all chart-based reports.', status: 'open', priority: 'high', category: 'bug', createdAt: hoursAgo(4), updatedAt: hoursAgo(2), contact: { id: 'c-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@techvault.io' } },
        { id: 'tk-002', ticketNumber: 'TK-088', subject: 'Request for bulk contact import feature', description: 'Would like the ability to import contacts from a CSV file with custom field mapping. Currently, contacts can only be added one at a time.', status: 'open', priority: 'medium', category: 'feature', createdAt: daysAgo(1), updatedAt: daysAgo(1), contact: { id: 'c-003', firstName: 'Priya', lastName: 'Sharma', email: 'priya@nexusdigital.com' } },
        { id: 'tk-003', ticketNumber: 'TK-087', subject: 'Invoice payment status not syncing', description: 'Payments marked as received in our accounting system are not reflecting in the CRM invoice status. Last sync was 48 hours ago.', status: 'in_progress', priority: 'urgent', category: 'bug', createdAt: daysAgo(2), updatedAt: hoursAgo(6), contact: { id: 'c-002', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.r@pinnaclegroup.com' } },
        { id: 'tk-004', ticketNumber: 'TK-086', subject: 'How to set up automated email sequences?', description: 'We want to create a 5-step onboarding email sequence for new leads. Need guidance on the workflow builder and trigger configuration.', status: 'resolved', priority: 'low', category: 'question', createdAt: daysAgo(4), updatedAt: daysAgo(1), contact: { id: 'c-005', firstName: 'Elena', lastName: 'Vasquez', email: 'elena.v@orbitsolutions.io' } },
        { id: 'tk-005', ticketNumber: 'TK-085', subject: 'API rate limiting too restrictive for our integration', description: 'Our middleware is hitting 429 errors when syncing large datasets. Current limit of 100 req/min is insufficient for our 5,000+ contact sync.', status: 'open', priority: 'high', category: 'support', createdAt: daysAgo(3), updatedAt: daysAgo(2), contact: { id: 'c-004', firstName: 'David', lastName: 'Park', email: 'dpark@quantumlabs.co' } },
        { id: 'tk-006', ticketNumber: 'TK-084', subject: 'Custom dashboard widgets not saving', description: 'Drag-and-drop widget arrangement on the dashboard resets to default after page refresh. Tested on Chrome and Firefox.', status: 'in_progress', priority: 'medium', category: 'bug', createdAt: daysAgo(5), updatedAt: daysAgo(1), contact: { id: 'c-008', firstName: 'Tom', lastName: 'Hartley', email: 'thartley@zenithcorp.com' } },
        { id: 'tk-007', ticketNumber: 'TK-083', subject: 'Need SSO integration with Okta', description: 'Our company uses Okta for identity management. We need SAML-based SSO to be configured for our 150-user deployment.', status: 'open', priority: 'high', category: 'feature', createdAt: daysAgo(6), updatedAt: daysAgo(4), contact: { id: 'c-006', firstName: 'James', lastName: 'Whitfield', email: 'jwhitfield@acmecorp.com' } },
        { id: 'tk-008', ticketNumber: 'TK-082', subject: 'Billing discrepancy on last invoice', description: 'Invoice INV-298 shows $4,200 but our agreement states $3,800/month. Please review and issue a corrected invoice.', status: 'resolved', priority: 'medium', category: 'support', createdAt: daysAgo(8), updatedAt: daysAgo(3), contact: { id: 'c-007', firstName: 'Aisha', lastName: 'Okafor', email: 'aisha@cloudnineinc.com' } },
        { id: 'tk-009', ticketNumber: 'TK-081', subject: 'Mobile app crashes on deal pipeline view', description: 'iOS app version 3.2.1 crashes consistently when navigating to the pipeline kanban view with more than 20 deals.', status: 'open', priority: 'urgent', category: 'bug', createdAt: daysAgo(1), updatedAt: hoursAgo(8), contact: { id: 'c-010', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@stellarworks.dev' } },
        { id: 'tk-010', ticketNumber: 'TK-080', subject: 'Request for role-based access control enhancements', description: 'Need more granular permissions: view-only for interns, edit for staff, full control for managers, and audit logging for admins.', status: 'open', priority: 'medium', category: 'feature', createdAt: daysAgo(10), updatedAt: daysAgo(7), contact: { id: 'c-011', firstName: 'Nina', lastName: 'Kowalski', email: 'nina.k@apexventures.com' } },
        { id: 'tk-011', ticketNumber: 'TK-079', subject: 'Email delivery delays for notifications', description: 'Team is reporting 2-3 hour delays in receiving task assignment and deal update email notifications since last Tuesday.', status: 'closed', priority: 'high', category: 'bug', createdAt: daysAgo(12), updatedAt: daysAgo(5), contact: { id: 'c-013', firstName: 'Chloe', lastName: 'Nguyen', email: 'chloe@vortexai.com' } },
        { id: 'tk-012', ticketNumber: 'TK-078', subject: 'Training session request for new team members', description: 'We have 8 new hires starting next month who will need comprehensive CRM training. Can we schedule 2 sessions?', status: 'open', priority: 'low', category: 'support', createdAt: daysAgo(7), updatedAt: daysAgo(6), contact: { id: 'c-016', firstName: 'Derek', lastName: 'Morrison', email: 'dmorrison@summitgrp.com' } },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 8. Appointments
// ---------------------------------------------------------------------------

function getAppointments() {
  return {
    data: {
      total: 45,
      appointments: [
        { id: 'apt-001', title: 'Quarterly Business Review', description: 'Review Q1 performance metrics and discuss Q2 strategy with the TechVault team', startDate: daysFromNowAt(0, 10, 0), endDate: daysFromNowAt(0, 11, 30), allDay: false, type: 'meeting' as const, location: 'Conference Room A', attendees: ['Sarah Chen', 'Alex Morgan', 'Jordan Lee'], createdAt: daysAgo(7), updatedAt: daysAgo(2) },
        { id: 'apt-002', title: 'Discovery Call with Orbit Solutions', description: 'Initial call to understand their CRM requirements and pain points', startDate: daysFromNowAt(1, 14, 0), endDate: daysFromNowAt(1, 14, 45), allDay: false, type: 'call' as const, location: undefined, attendees: ['Elena Vasquez', 'Alex Morgan'], createdAt: daysAgo(3), updatedAt: daysAgo(3) },
        { id: 'apt-003', title: 'Product Demo - Vortex AI', description: 'Showcase AI integration features and custom model training capabilities', startDate: daysFromNowAt(1, 15, 30), endDate: daysFromNowAt(1, 16, 30), allDay: false, type: 'video_call' as const, location: 'https://zoom.us/j/demo123', attendees: ['Chloe Nguyen', 'Alex Morgan', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(5), updatedAt: daysAgo(1) },
        { id: 'apt-004', title: 'Team Standup', description: 'Weekly sales team sync - pipeline review and blockers discussion', startDate: daysFromNowAt(2, 9, 0), endDate: daysFromNowAt(2, 9, 30), allDay: false, type: 'meeting' as const, location: 'Huddle Room B', attendees: ['Alex Morgan', 'Jordan Lee', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(14), updatedAt: daysAgo(14) },
        { id: 'apt-005', title: 'Contract Negotiation - Summit Group', description: 'Final round of contract discussions covering pricing, SLA terms, and implementation timeline', startDate: daysFromNowAt(2, 13, 0), endDate: daysFromNowAt(2, 14, 30), allDay: false, type: 'video_call' as const, location: 'https://teams.microsoft.com/l/meet', attendees: ['Derek Morrison', 'Alex Morgan', 'Jordan Lee'], createdAt: daysAgo(10), updatedAt: daysAgo(3) },
        { id: 'apt-006', title: 'Industry Conference - CRM Summit', description: 'Annual CRM industry event - attending keynotes and networking sessions', startDate: daysFromNowAt(5, 0, 0), endDate: daysFromNowAt(5, 23, 59), allDay: true, type: 'other' as const, location: 'San Francisco Convention Center', attendees: ['Alex Morgan', 'Taylor Swift'], createdAt: daysAgo(30), updatedAt: daysAgo(15) },
        { id: 'apt-007', title: 'Lunch with Raj Patel', description: 'Informal lunch meeting to discuss consulting engagement scope', startDate: daysFromNowAt(3, 12, 0), endDate: daysFromNowAt(3, 13, 0), allDay: false, type: 'meeting' as const, location: 'The Capital Grille', attendees: ['Raj Patel', 'Alex Morgan'], createdAt: daysAgo(2), updatedAt: daysAgo(2) },
        { id: 'apt-008', title: 'Technical Architecture Review', description: 'Deep-dive into Quantum Labs integration requirements and data flow', startDate: daysFromNowAt(4, 10, 0), endDate: daysFromNowAt(4, 12, 0), allDay: false, type: 'video_call' as const, location: 'https://zoom.us/j/arch456', attendees: ['David Park', 'Alex Morgan', 'Casey Brooks'], createdAt: daysAgo(6), updatedAt: daysAgo(1) },
        { id: 'apt-009', title: 'New Hire Onboarding Check-in', description: 'Follow up on CloudNine onboarding progress and address any questions', startDate: daysFromNowAt(3, 15, 0), endDate: daysFromNowAt(3, 15, 30), allDay: false, type: 'call' as const, location: undefined, attendees: ['Aisha Okafor', 'Jordan Lee'], createdAt: daysAgo(4), updatedAt: daysAgo(4) },
        { id: 'apt-010', title: 'Marketing Strategy Planning', description: 'Plan upcoming content calendar and campaign strategy for Q2', startDate: daysFromNowAt(6, 10, 0), endDate: daysFromNowAt(6, 11, 30), allDay: false, type: 'meeting' as const, location: 'Conference Room C', attendees: ['Alex Morgan', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(1), updatedAt: daysAgo(1) },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 9. Invoices
// ---------------------------------------------------------------------------

function getInvoices() {
  return {
    data: {
      total: 312,
      invoices: [
        { id: 'inv-001', invoiceNumber: 'INV-312', contactId: 'c-006', contactName: 'James Whitfield - Acme Corp', amount: 18500, subtotal: 17130, tax: 1370, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(2), dueDate: daysFromNow(28), notes: 'Net 30 payment terms. Annual support contract renewal.', lineItems: [{ id: 'li-001', description: 'Annual Support Contract - Enterprise', quantity: 1, unitPrice: 15000 }, { id: 'li-002', description: 'Premium SLA Add-on', quantity: 1, unitPrice: 2130 }], createdAt: daysAgo(2) },
        { id: 'inv-002', invoiceNumber: 'INV-311', contactId: 'c-004', contactName: 'David Park - Quantum Labs', amount: 62500, subtotal: 57870, tax: 4630, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(15), dueDate: daysAgo(0), notes: 'Phase 1 payment for Enterprise License Agreement.', lineItems: [{ id: 'li-003', description: 'Enterprise License - 250 seats', quantity: 1, unitPrice: 50000 }, { id: 'li-004', description: 'Implementation Services', quantity: 40, unitPrice: 197 }], createdAt: daysAgo(15) },
        { id: 'inv-003', invoiceNumber: 'INV-310', contactId: 'c-002', contactName: 'Marcus Rivera - Pinnacle Group', amount: 39000, subtotal: 36111, tax: 2889, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(22), dueDate: daysAgo(7), notes: 'Initial onboarding and setup fees.', lineItems: [{ id: 'li-005', description: 'Platform Onboarding Package', quantity: 1, unitPrice: 28000 }, { id: 'li-006', description: 'Data Migration Service', quantity: 1, unitPrice: 5611 }, { id: 'li-007', description: 'Training Sessions (x4)', quantity: 4, unitPrice: 625 }], createdAt: daysAgo(22) },
        { id: 'inv-004', invoiceNumber: 'INV-309', contactId: 'c-007', contactName: 'Aisha Okafor - CloudNine Inc', amount: 4200, subtotal: 3889, tax: 311, taxRate: 8, status: 'overdue' as const, issuedDate: daysAgo(45), dueDate: daysAgo(15), notes: 'Monthly subscription fee - December 2025.', lineItems: [{ id: 'li-008', description: 'SaaS Platform - Monthly', quantity: 1, unitPrice: 3500 }, { id: 'li-009', description: 'Additional Storage (100GB)', quantity: 1, unitPrice: 389 }], createdAt: daysAgo(45) },
        { id: 'inv-005', invoiceNumber: 'INV-308', contactId: 'c-010', contactName: 'Raj Patel - Stellar Works', amount: 24000, subtotal: 22222, tax: 1778, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(30), dueDate: daysAgo(0), notes: 'Consulting engagement - Phase 1 milestone payment.', lineItems: [{ id: 'li-010', description: 'Strategy Consulting - 40hrs', quantity: 40, unitPrice: 450 }, { id: 'li-011', description: 'Market Analysis Report', quantity: 1, unitPrice: 4222 }], createdAt: daysAgo(30) },
        { id: 'inv-006', invoiceNumber: 'INV-307', contactId: 'c-012', contactName: 'Lucas Fernandez - BrightPath', amount: 19000, subtotal: 17593, tax: 1407, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(25), dueDate: daysAgo(5), notes: 'EdTech platform license - annual fee.', lineItems: [{ id: 'li-012', description: 'Platform License - Education Tier', quantity: 1, unitPrice: 15000 }, { id: 'li-013', description: 'Student Portal Module', quantity: 1, unitPrice: 2593 }], createdAt: daysAgo(25) },
        { id: 'inv-007', invoiceNumber: 'INV-306', contactId: 'c-001', contactName: 'Sarah Chen - TechVault', amount: 95000, subtotal: 87963, tax: 7037, taxRate: 8, status: 'draft' as const, issuedDate: daysAgo(1), dueDate: daysFromNow(29), notes: 'Partnership package - pending approval.', lineItems: [{ id: 'li-014', description: 'Partner Platform License', quantity: 1, unitPrice: 70000 }, { id: 'li-015', description: 'Custom API Integration', quantity: 1, unitPrice: 12963 }, { id: 'li-016', description: 'Dedicated Support Engineer (Quarterly)', quantity: 1, unitPrice: 5000 }], createdAt: daysAgo(1) },
        { id: 'inv-008', invoiceNumber: 'INV-305', contactId: 'c-013', contactName: 'Chloe Nguyen - Vortex AI', amount: 105000, subtotal: 97222, tax: 7778, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(5), dueDate: daysFromNow(25), notes: 'AI integration project - Phase 1 deposit (50%).', lineItems: [{ id: 'li-017', description: 'AI Module - Base License', quantity: 1, unitPrice: 65000 }, { id: 'li-018', description: 'Custom Model Training', quantity: 1, unitPrice: 25000 }, { id: 'li-019', description: 'Integration Development', quantity: 30, unitPrice: 241 }], createdAt: daysAgo(5) },
        { id: 'inv-009', invoiceNumber: 'INV-304', contactId: 'c-016', contactName: 'Derek Morrison - Summit Group', amount: 78000, subtotal: 72222, tax: 5778, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(8), dueDate: daysFromNow(22), notes: 'Analytics platform rollout - Enterprise tier.', lineItems: [{ id: 'li-020', description: 'Analytics Platform - Enterprise', quantity: 1, unitPrice: 60000 }, { id: 'li-021', description: 'Custom Dashboard Development', quantity: 1, unitPrice: 12222 }], createdAt: daysAgo(8) },
        { id: 'inv-010', invoiceNumber: 'INV-303', contactId: 'c-017', contactName: 'Yuki Tanaka - NovaStream', amount: 47000, subtotal: 43519, tax: 3481, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(35), dueDate: daysAgo(5), notes: 'Streaming infrastructure setup and initial license.', lineItems: [{ id: 'li-022', description: 'Streaming Infrastructure Setup', quantity: 1, unitPrice: 30000 }, { id: 'li-023', description: 'CDN Integration', quantity: 1, unitPrice: 10519 }, { id: 'li-024', description: 'Load Testing Service', quantity: 1, unitPrice: 3000 }], createdAt: daysAgo(35) },
        { id: 'inv-011', invoiceNumber: 'INV-302', contactId: 'c-018', contactName: 'Amanda Brooks - TerraForma', amount: 67500, subtotal: 62500, tax: 5000, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(28), dueDate: daysAgo(2), notes: 'Sustainability platform - annual license.', lineItems: [{ id: 'li-025', description: 'Sustainability Platform License', quantity: 1, unitPrice: 55000 }, { id: 'li-026', description: 'Carbon Reporting Module', quantity: 1, unitPrice: 7500 }], createdAt: daysAgo(28) },
        { id: 'inv-012', invoiceNumber: 'INV-301', contactId: 'c-011', contactName: 'Nina Kowalski - Apex Ventures', amount: 12000, subtotal: 11111, tax: 889, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(40), dueDate: daysAgo(10), notes: 'Quarterly platform subscription.', lineItems: [{ id: 'li-027', description: 'Platform Subscription - Q4', quantity: 1, unitPrice: 9500 }, { id: 'li-028', description: 'Advanced Analytics Add-on', quantity: 1, unitPrice: 1611 }], createdAt: daysAgo(40) },
        { id: 'inv-013', invoiceNumber: 'INV-300', contactId: 'c-015', contactName: 'Fatima Al-Rashid - Crescent Technologies', amount: 33500, subtotal: 31019, tax: 2481, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(42), dueDate: daysAgo(12), notes: 'Platform customization and deployment.', lineItems: [{ id: 'li-029', description: 'Custom Module Development', quantity: 60, unitPrice: 375 }, { id: 'li-030', description: 'Deployment & Configuration', quantity: 1, unitPrice: 8519 }], createdAt: daysAgo(42) },
        { id: 'inv-014', invoiceNumber: 'INV-299', contactId: 'c-019', contactName: 'Hassan Mahmoud - CoreWave Data', amount: 28750, subtotal: 26620, tax: 2130, taxRate: 8, status: 'cancelled' as const, issuedDate: daysAgo(50), dueDate: daysAgo(20), notes: 'Cancelled - project scope changed. New invoice to be issued.', lineItems: [{ id: 'li-031', description: 'Data Pipeline Setup', quantity: 1, unitPrice: 20000 }, { id: 'li-032', description: 'ETL Development', quantity: 20, unitPrice: 331 }], createdAt: daysAgo(50) },
        { id: 'inv-015', invoiceNumber: 'INV-298', contactId: 'c-007', contactName: 'Aisha Okafor - CloudNine Inc', amount: 4200, subtotal: 3889, tax: 311, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(75), dueDate: daysAgo(45), notes: 'Monthly subscription fee - November 2025.', lineItems: [{ id: 'li-033', description: 'SaaS Platform - Monthly', quantity: 1, unitPrice: 3500 }, { id: 'li-034', description: 'Additional Storage (100GB)', quantity: 1, unitPrice: 389 }], createdAt: daysAgo(75) },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 10. Emails
// ---------------------------------------------------------------------------

function getEmails() {
  return {
    data: {
      total: 156,
      emails: [
        { id: 'em-001', to: 'sarah.chen@techvault.io', subject: 'Partnership Proposal - AlpineCRM x TechVault', body: 'Hi Sarah,\n\nThank you for the productive meeting last week. As discussed, I\'ve attached our partnership proposal outlining the integration roadmap, pricing tiers, and mutual go-to-market strategy.\n\nKey highlights:\n- Bi-directional API integration\n- Co-branded marketing materials\n- Revenue share on referred deals\n\nI\'d love to schedule a follow-up call to walk through the details. Would Thursday at 2 PM work for you?\n\nBest regards,\nAlex Morgan', status: 'opened' as const, sentAt: daysAgo(2), openedAt: daysAgo(1), clickedAt: undefined, contactId: 'c-001', contactName: 'Sarah Chen' },
        { id: 'em-002', to: 'marcus.r@pinnaclegroup.com', subject: 'Implementation Timeline - Pinnacle Group Onboarding', body: 'Hi Marcus,\n\nFollowing our contract signing, I wanted to share the detailed implementation timeline for your team\'s onboarding:\n\nWeek 1-2: Data migration and platform setup\nWeek 3: User training sessions (4 sessions planned)\nWeek 4: Go-live and hypercare support\n\nYour dedicated implementation manager, Jordan Lee, will be reaching out tomorrow to schedule the kickoff meeting.\n\nLooking forward to a great partnership!\n\nBest,\nAlex', status: 'delivered' as const, sentAt: daysAgo(3), openedAt: undefined, clickedAt: undefined, contactId: 'c-002', contactName: 'Marcus Rivera' },
        { id: 'em-003', to: 'dpark@quantumlabs.co', subject: 'Re: Enterprise License - Revised Terms', body: 'Hi David,\n\nThank you for your patience while our legal team reviewed the updated terms. I\'m pleased to share that we\'ve accommodated your requests:\n\n1. Extended SLA guarantee to 99.95% uptime\n2. Added the data residency clause for EU compliance\n3. Flexible seat scaling (quarterly adjustments)\n\nThe revised contract is attached. Please review and let me know if you have any questions.\n\nBest regards,\nAlex Morgan', status: 'opened' as const, sentAt: daysAgo(1), openedAt: hoursAgo(6), clickedAt: undefined, contactId: 'c-004', contactName: 'David Park' },
        { id: 'em-004', to: 'priya@nexusdigital.com', subject: 'Product Demo Invitation - AlpineCRM Platform', body: 'Hi Priya,\n\nI hope this email finds you well. Based on our initial conversation about your marketing team\'s needs, I\'d like to invite you to a personalized product demo.\n\nDuring the demo, we\'ll cover:\n- Campaign tracking and attribution\n- Lead scoring and segmentation\n- Marketing automation workflows\n- ROI reporting dashboards\n\nWould next Tuesday at 3:30 PM PST work for you and your team?\n\nBest,\nAlex', status: 'sent' as const, sentAt: daysAgo(1), openedAt: undefined, clickedAt: undefined, contactId: 'c-003', contactName: 'Priya Sharma' },
        { id: 'em-005', to: 'chloe@vortexai.com', subject: 'AI Integration Technical Specifications', body: 'Hi Chloe,\n\nAs promised during our demo, here are the technical specifications for our AI integration module:\n\n- REST API with OpenAPI 3.0 spec\n- Custom model training pipeline\n- Real-time inference endpoint\n- Batch processing capabilities\n- SOC 2 Type II certified infrastructure\n\nThe attached PDF includes detailed architecture diagrams and the data flow overview.\n\nLet me know if your engineering team has any questions.\n\nBest regards,\nAlex Morgan', status: 'clicked' as const, sentAt: daysAgo(4), openedAt: daysAgo(3), clickedAt: daysAgo(3), contactId: 'c-013', contactName: 'Chloe Nguyen' },
        { id: 'em-006', to: 'elena.v@orbitsolutions.io', subject: 'Welcome to AlpineCRM - Getting Started Guide', body: 'Hi Elena,\n\nWelcome aboard! I\'m thrilled to have Orbit Solutions as our newest customer.\n\nHere are some resources to help you get started:\n1. Quick Start Guide: [link]\n2. Video Tutorials: [link]\n3. Knowledge Base: [link]\n4. Community Forum: [link]\n\nYour account is now active and you can log in at app.alpinecrm.com with the credentials sent in a separate email.\n\nDon\'t hesitate to reach out if you need anything!\n\nWarm regards,\nAlex', status: 'opened' as const, sentAt: daysAgo(6), openedAt: daysAgo(5), clickedAt: undefined, contactId: 'c-005', contactName: 'Elena Vasquez' },
        { id: 'em-007', to: 'jwhitfield@acmecorp.com', subject: 'Annual Support Contract Renewal', body: 'Hi James,\n\nI hope you\'re doing well. Your annual support contract is coming up for renewal on March 15th.\n\nBased on your usage over the past year, I\'d recommend upgrading to our Premium Support tier, which includes:\n- 24/7 priority support\n- Dedicated account manager\n- Quarterly business reviews\n- Early access to new features\n\nI\'ve attached a proposal with renewal pricing options. Shall we schedule a call to discuss?\n\nBest,\nAlex Morgan', status: 'delivered' as const, sentAt: daysAgo(5), openedAt: undefined, clickedAt: undefined, contactId: 'c-006', contactName: 'James Whitfield' },
        { id: 'em-008', to: 'dmorrison@summitgrp.com', subject: 'Summit Group - Analytics Platform Proposal', body: 'Hi Derek,\n\nThank you for sharing your requirements document. Based on our analysis, I\'ve put together a comprehensive proposal for the Summit Analytics Rollout.\n\nThe proposal covers:\n- Enterprise analytics platform deployment\n- Custom dashboard development (12 dashboards)\n- Real-time data streaming integration\n- User training program (3 cohorts)\n- 12-month premium support\n\nTotal investment: $156,000 (details in attachment)\n\nI\'m available for a call this week to walk through the proposal.\n\nBest regards,\nAlex', status: 'opened' as const, sentAt: daysAgo(7), openedAt: daysAgo(5), clickedAt: undefined, contactId: 'c-016', contactName: 'Derek Morrison' },
        { id: 'em-009', to: 'ytanaka@novastream.io', subject: 'Follow-up: Streaming Infrastructure Discussion', body: 'Hi Yuki,\n\nGreat speaking with you today! As discussed, here\'s a summary of what we covered:\n\n1. Your current CDN challenges with 50M+ monthly streams\n2. Our edge computing architecture for low-latency delivery\n3. Scalability requirements for the upcoming product launch\n\nNext steps:\n- I\'ll send over the technical architecture proposal by Friday\n- Your team will provide the current infrastructure specs\n- We\'ll schedule a joint engineering call for next week\n\nLooking forward to it!\n\nBest,\nAlex', status: 'delivered' as const, sentAt: daysAgo(3), openedAt: undefined, clickedAt: undefined, contactId: 'c-017', contactName: 'Yuki Tanaka' },
        { id: 'em-010', to: 'raj.patel@stellarworks.dev', subject: 'Consulting Engagement - Scope & Timeline', body: 'Hi Raj,\n\nFollowing our lunch discussion, I wanted to formalize the consulting engagement scope:\n\nPhase 1 (Weeks 1-4): Market Analysis & Strategy\n- Competitive landscape assessment\n- Customer persona development\n- Go-to-market strategy framework\n\nPhase 2 (Weeks 5-8): Implementation Planning\n- Technology stack recommendations\n- Integration architecture\n- Resource planning\n\nTotal engagement: 80 hours at $450/hr\n\nShall I draft the SOW for your review?\n\nBest regards,\nAlex Morgan', status: 'clicked' as const, sentAt: daysAgo(8), openedAt: daysAgo(7), clickedAt: daysAgo(6), contactId: 'c-010', contactName: 'Raj Patel' },
        { id: 'em-011', to: 'aisha@cloudnineinc.com', subject: 'CloudNine Inc - December Invoice Clarification', body: 'Hi Aisha,\n\nI received your inquiry about the December invoice (INV-298). You\'re correct that there was a discrepancy.\n\nThe additional $400 charge was for the extra 100GB storage that was provisioned on December 5th. I realize this wasn\'t communicated clearly when the storage was added.\n\nTo make this right, I\'ve issued a credit memo for $400 which will be applied to your next billing cycle. A corrected invoice will be sent within 24 hours.\n\nSincerely apologize for any inconvenience.\n\nBest,\nAlex', status: 'opened' as const, sentAt: daysAgo(10), openedAt: daysAgo(9), clickedAt: undefined, contactId: 'c-007', contactName: 'Aisha Okafor' },
        { id: 'em-012', to: 'nina.k@apexventures.com', subject: 'Quarterly Subscription Renewal Confirmation', body: 'Hi Nina,\n\nThis email confirms that your quarterly subscription has been successfully renewed. Here are the details:\n\nPlan: Professional\nPeriod: Q1 2026 (Jan 1 - Mar 31)\nAmount: $12,000\nPayment: Processed via ACH on file\n\nInvoice INV-301 is attached for your records.\n\nIf you have any questions about your subscription or would like to explore our Enterprise tier, I\'m happy to discuss.\n\nThank you for being a valued customer!\n\nBest,\nAlex Morgan', status: 'bounced' as const, sentAt: daysAgo(12), openedAt: undefined, clickedAt: undefined, contactId: 'c-011', contactName: 'Nina Kowalski' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 10b. Email Templates
// ---------------------------------------------------------------------------

function getEmailTemplates() {
  return {
    data: [
      { id: 'tpl-001', name: 'Welcome Email', subject: 'Welcome to AlpineCRM!', body: 'Hi {{firstName}},\n\nWelcome to AlpineCRM! We\'re excited to have you on board.\n\nHere are some resources to get started:\n- Quick Start Guide\n- Video Tutorials\n- Knowledge Base\n\nBest regards,\nThe AlpineCRM Team' },
      { id: 'tpl-002', name: 'Follow-Up After Demo', subject: 'Great meeting you! Next steps for {{company}}', body: 'Hi {{firstName}},\n\nThank you for taking the time to see our demo today. I hope it gave you a clear picture of how AlpineCRM can help {{company}}.\n\nAs discussed, here are the next steps:\n1. [Next step 1]\n2. [Next step 2]\n3. [Next step 3]\n\nI\'ll follow up by {{followUpDate}}. In the meantime, don\'t hesitate to reach out with any questions.\n\nBest regards,\nAlex Morgan' },
      { id: 'tpl-003', name: 'Invoice Reminder', subject: 'Friendly Reminder: Invoice {{invoiceNumber}} Due', body: 'Hi {{firstName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.\n\nYou can view and pay the invoice through your customer portal or by bank transfer using the details on the invoice.\n\nIf you\'ve already sent payment, please disregard this message.\n\nThank you,\nAlex Morgan' },
    ],
  };
}

// ---------------------------------------------------------------------------
// 11. Notifications
// ---------------------------------------------------------------------------

function getNotifications() {
  return {
    data: {
      notifications: [
        { id: 'notif-001', type: 'deal_update', title: 'Deal moved to Negotiation', message: 'Enterprise License Agreement with Quantum Labs has been moved to the negotiation stage.', read: false, createdAt: hoursAgo(1), link: '/deals' },
        { id: 'notif-002', type: 'task_due', title: 'Task due today', message: 'Follow up with Sarah Chen on partnership proposal is due today.', read: false, createdAt: hoursAgo(3), link: '/tasks' },
        { id: 'notif-003', type: 'ticket_assigned', title: 'New ticket assigned to you', message: 'Ticket TK-089: Unable to export dashboard reports to PDF has been assigned to you.', read: false, createdAt: hoursAgo(5), link: '/tickets' },
        { id: 'notif-004', type: 'invoice_paid', title: 'Invoice paid', message: 'Invoice INV-311 for $62,500 from Quantum Labs has been marked as paid.', read: true, createdAt: hoursAgo(10), link: '/invoices' },
        { id: 'notif-005', type: 'contact_created', title: 'New contact added', message: 'Olivia Grant from Luminary Design has been added to your contacts.', read: true, createdAt: daysAgo(1), link: '/contacts' },
        { id: 'notif-006', type: 'deal_won', title: 'Deal closed won!', message: 'Congratulations! EdTech Platform License with BrightPath has been closed for $38,000.', read: true, createdAt: daysAgo(2), link: '/deals' },
        { id: 'notif-007', type: 'task_overdue', title: 'Overdue task alert', message: 'Update CRM data for Orbit Solutions is overdue by 1 day.', read: false, createdAt: daysAgo(1), link: '/tasks' },
        { id: 'notif-008', type: 'email_opened', title: 'Email opened', message: 'Sarah Chen opened your email: Partnership Proposal - AlpineCRM x TechVault.', read: true, createdAt: daysAgo(1), link: '/emails' },
      ],
    },
  };
}

function getUnreadCount() {
  const notifications = getNotifications().data.notifications;
  const count = notifications.filter((n) => !n.read).length;
  return { data: { count } };
}

// ---------------------------------------------------------------------------
// 12. Auth User
// ---------------------------------------------------------------------------

function getAuthUser() {
  return {
    data: {
      id: 'demo-user-1',
      email: 'alex@alpinecrm.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'admin',
      avatarUrl: null,
      timezone: 'UTC',
      preferences: {
        theme: 'system',
        emailNotifications: true,
        desktopNotifications: true,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// URL Matcher - Main Export
// ---------------------------------------------------------------------------

/**
 * Returns mock response data matching the given API URL.
 * Returns `null` if no mock matches so callers can fall through to a real API.
 *
 * URLs should be relative, e.g. '/dashboard/stats', '/contacts', '/deals'.
 * Query parameters are stripped before matching.
 */
export function getMockResponse(url: string, method?: string): any {
  // Strip query params and trailing slashes for matching
  const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
  const httpMethod = (method || 'GET').toUpperCase();

  // --- Dashboard ---
  if (cleanUrl === '/dashboard/stats') return getDashboardStats();
  if (cleanUrl === '/dashboard/pipeline') return getDashboardPipeline();
  if (cleanUrl === '/dashboard/upcoming-tasks') return getDashboardUpcomingTasks();

  // --- Contacts ---
  if (cleanUrl === '/contacts' && httpMethod === 'GET') return getContacts();
  if (cleanUrl.match(/^\/contacts\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const contact = getContacts().data.contacts.find((c) => c.id === id);
    return contact ? { data: contact } : { data: null };
  }
  // POST / PUT / DELETE return a success-like response for mutations
  if (cleanUrl === '/contacts' && httpMethod === 'POST') return { data: { id: uuid(1), message: 'Contact created (demo mode)' } };
  if (cleanUrl.match(/^\/contacts\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Contact updated (demo mode)' } };
  if (cleanUrl.match(/^\/contacts\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Contact deleted (demo mode)' } };

  // --- Deals ---
  if (cleanUrl === '/deals' && httpMethod === 'GET') return getDeals();
  if (cleanUrl === '/deals/kanban' && httpMethod === 'GET') return getDealsKanban();
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const deal = getDeals().data.deals.find((d) => d.id === id);
    return deal ? { data: deal } : { data: null };
  }
  if (cleanUrl === '/deals' && httpMethod === 'POST') return { data: { id: uuid(2), message: 'Deal created (demo mode)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && (httpMethod === 'PUT' || httpMethod === 'PATCH')) return { data: { message: 'Deal updated (demo mode)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+\/stage$/) && httpMethod === 'PATCH') return { data: { message: 'Deal stage updated (demo mode)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Deal deleted (demo mode)' } };

  // --- Tasks ---
  if (cleanUrl === '/tasks' && httpMethod === 'GET') return getTasks();
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const task = getTasks().data.tasks.find((t) => t.id === id);
    return task ? { data: task } : { data: null };
  }
  if (cleanUrl === '/tasks' && httpMethod === 'POST') return { data: { id: uuid(3), message: 'Task created (demo mode)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && (httpMethod === 'PUT' || httpMethod === 'PATCH')) return { data: { message: 'Task updated (demo mode)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+\/complete$/) && httpMethod === 'PATCH') return { data: { message: 'Task completed (demo mode)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Task deleted (demo mode)' } };

  // --- Tickets ---
  if (cleanUrl === '/tickets' && httpMethod === 'GET') return getTickets();
  if (cleanUrl.match(/^\/tickets\/[^/]+$/) && !cleanUrl.includes('/comments') && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const ticket = getTickets().data.tickets.find((t) => t.id === id);
    if (ticket) {
      return {
        data: {
          ...ticket,
          comments: [
            { id: 'cmt-001', content: 'Investigating the PDF export issue. Initial findings suggest a timeout in the chart rendering pipeline when dealing with large datasets.', isInternal: true, createdAt: hoursAgo(3), author: { id: 'demo-user-1', firstName: 'Alex', lastName: 'Morgan' } },
            { id: 'cmt-002', content: 'Thank you for looking into this. It happens consistently with our monthly revenue report which has 12 chart widgets. Reports with fewer charts seem to work fine.', isInternal: false, createdAt: hoursAgo(2), author: { id: 'c-001', firstName: 'Sarah', lastName: 'Chen' } },
            { id: 'cmt-003', content: 'Confirmed - the issue is related to concurrent SVG-to-canvas conversions. Working on a fix to serialize the rendering queue. ETA: end of day tomorrow.', isInternal: true, createdAt: hoursAgo(1), author: { id: 'demo-user-1', firstName: 'Alex', lastName: 'Morgan' } },
          ],
        },
      };
    }
    return { data: null };
  }
  if (cleanUrl === '/tickets' && httpMethod === 'POST') return { data: { id: uuid(4), ticketNumber: 'TK-090', message: 'Ticket created (demo mode)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Ticket updated (demo mode)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Ticket deleted (demo mode)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+\/comments$/) && httpMethod === 'POST') return { data: { id: uuid(5), message: 'Comment added (demo mode)' } };

  // --- Appointments ---
  if (cleanUrl === '/appointments' && httpMethod === 'GET') return getAppointments();
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const appointment = getAppointments().data.appointments.find((a) => a.id === id);
    return appointment ? { data: appointment } : { data: null };
  }
  if (cleanUrl === '/appointments' && httpMethod === 'POST') return { data: { id: uuid(6), message: 'Appointment created (demo mode)' } };
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Appointment updated (demo mode)' } };
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Appointment deleted (demo mode)' } };

  // --- Invoices ---
  if (cleanUrl === '/invoices' && httpMethod === 'GET') return getInvoices();
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const invoice = getInvoices().data.invoices.find((i) => i.id === id);
    return invoice ? { data: invoice } : { data: null };
  }
  if (cleanUrl === '/invoices' && httpMethod === 'POST') return { data: { id: uuid(7), invoiceNumber: 'INV-313', message: 'Invoice created (demo mode)' } };
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Invoice updated (demo mode)' } };
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Invoice deleted (demo mode)' } };

  // --- Emails ---
  if (cleanUrl === '/emails' && httpMethod === 'GET') return getEmails();
  if (cleanUrl === '/emails/templates' && httpMethod === 'GET') return getEmailTemplates();
  if (cleanUrl === '/emails/send' && httpMethod === 'POST') return { data: { id: uuid(8), message: 'Email sent (demo mode)' } };
  if (cleanUrl.match(/^\/emails\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const email = getEmails().data.emails.find((e) => e.id === id);
    return email ? { data: email } : { data: null };
  }
  if (cleanUrl.match(/^\/emails\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Email deleted (demo mode)' } };

  // --- Notifications ---
  if (cleanUrl === '/notifications') return getNotifications();
  if (cleanUrl === '/notifications/unread-count') return getUnreadCount();
  if (cleanUrl.match(/^\/notifications\/[^/]+\/read$/) && httpMethod === 'PATCH') return { data: { message: 'Marked as read (demo mode)' } };
  if (cleanUrl === '/notifications/read-all' && httpMethod === 'PATCH') return { data: { message: 'All marked as read (demo mode)' } };

  // --- Auth ---
  if (cleanUrl === '/auth/me') return getAuthUser();
  if (cleanUrl === '/auth/login' && httpMethod === 'POST') {
    return {
      data: {
        user: getAuthUser().data,
        token: 'demo-jwt-token-alpinecrm-2026',
      },
    };
  }
  if (cleanUrl === '/auth/register' && httpMethod === 'POST') {
    return {
      data: {
        user: getAuthUser().data,
        token: 'demo-jwt-token-alpinecrm-2026',
      },
    };
  }

  // --- Settings ---
  if (cleanUrl === '/settings' || cleanUrl === '/settings/profile') {
    if (httpMethod === 'GET') return getAuthUser();
    if (httpMethod === 'PUT' || httpMethod === 'PATCH') return { data: { message: 'Settings updated (demo mode)' } };
  }

  // No match - return null so callers can fall through to real API
  return null;
}
