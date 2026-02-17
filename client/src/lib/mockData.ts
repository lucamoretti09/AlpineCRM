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
          title: 'Contact nou adăugat',
          description: 'Sarah Chen de la TechVault a fost adăugată la contacte',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(1),
        },
        {
          id: 'act-002',
          type: 'deal_won',
          title: 'Tranzacție câștigată',
          description: 'Licență Enterprise pentru Quantum Labs - $125.000',
          userName: 'Jordan Lee',
          createdAt: hoursAgo(3),
        },
        {
          id: 'act-003',
          type: 'task_completed',
          title: 'Sarcină finalizată',
          description: 'Apel de urmărire cu Nexus Digital finalizat',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(5),
        },
        {
          id: 'act-004',
          type: 'email_sent',
          title: 'Email trimis',
          description: 'Document de propunere trimis lui Marcus Rivera la Pinnacle Group',
          userName: 'Taylor Swift',
          createdAt: hoursAgo(7),
        },
        {
          id: 'act-005',
          type: 'invoice_created',
          title: 'Factură creată',
          description: 'INV-312 în valoare de $18.500 emisă pentru Acme Corp',
          userName: 'Alex Morgan',
          createdAt: hoursAgo(10),
        },
        {
          id: 'act-006',
          type: 'deal_created',
          title: 'Tranzacție nouă creată',
          description: 'Proiect Migrare SaaS cu CloudNine Inc - $85.000',
          userName: 'Jordan Lee',
          createdAt: hoursAgo(14),
        },
        {
          id: 'act-007',
          type: 'comment_added',
          title: 'Comentariu adăugat',
          description: 'Notă internă adăugată la tichetul #TK-089',
          userName: 'Casey Brooks',
          createdAt: hoursAgo(18),
        },
        {
          id: 'act-008',
          type: 'call_logged',
          title: 'Apel înregistrat',
          description: 'Apel de descoperire de 15 minute cu Elena Vasquez la Orbit Solutions',
          userName: 'Alex Morgan',
          createdAt: daysAgo(1),
        },
        {
          id: 'act-009',
          type: 'note_added',
          title: 'Notă adăugată',
          description: 'Cerințe actualizate pentru implementarea Zenith Corp',
          userName: 'Taylor Swift',
          createdAt: daysAgo(1),
        },
        {
          id: 'act-010',
          type: 'deal_lost',
          title: 'Tranzacție pierdută',
          description: 'Redesign Website pentru BlueShore Media - $32.000',
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
        title: 'Urmărire cu Sarah Chen privind propunerea de parteneriat',
        dueDate: daysFromNow(0),
        priority: 'high' as const,
        status: 'pending',
        contactName: 'Sarah Chen',
        dealName: 'Parteneriat TechVault',
      },
      {
        id: 'utask-002',
        title: 'Pregătire raport venituri T1 pentru revizuirea conducerii',
        dueDate: daysFromNow(1),
        priority: 'urgent' as const,
        status: 'pending',
        contactName: undefined,
        dealName: undefined,
      },
      {
        id: 'utask-003',
        title: 'Trimite contractul revizuit către Quantum Labs',
        dueDate: daysFromNow(1),
        priority: 'high' as const,
        status: 'in_progress',
        contactName: 'David Park',
        dealName: 'Licență Enterprise',
      },
      {
        id: 'utask-004',
        title: 'Programează demo produs cu echipa Nexus Digital',
        dueDate: daysFromNow(2),
        priority: 'medium' as const,
        status: 'pending',
        contactName: 'Priya Sharma',
        dealName: 'Extindere Nexus Digital',
      },
      {
        id: 'utask-005',
        title: 'Revizuire și aprobare materiale marketing pentru târg',
        dueDate: daysFromNow(3),
        priority: 'low' as const,
        status: 'pending',
        contactName: undefined,
        dealName: undefined,
      },
      {
        id: 'utask-006',
        title: 'Sună-l pe Marcus Rivera pentru a discuta calendarul implementării',
        dueDate: daysFromNow(4),
        priority: 'medium' as const,
        status: 'pending',
        contactName: 'Marcus Rivera',
        dealName: 'Onboarding Pinnacle Group',
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
        { id: 'c-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@techvault.io', phone: '+1 (415) 555-0101', company: 'TechVault', status: 'active', createdAt: daysAgo(5), tags: ['enterprise', 'tehnologie'], ownerId: 'demo-user-1', leadScore: 92, jobTitle: 'VP Inginerie', source: 'recomandare' },
        { id: 'c-002', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.r@pinnaclegroup.com', phone: '+1 (212) 555-0202', company: 'Pinnacle Group', status: 'active', createdAt: daysAgo(8), tags: ['finanțe', 'factor de decizie'], ownerId: 'demo-user-1', leadScore: 88, jobTitle: 'Director Financiar', source: 'site web' },
        { id: 'c-003', firstName: 'Priya', lastName: 'Sharma', email: 'priya@nexusdigital.com', phone: '+1 (650) 555-0303', company: 'Nexus Digital', status: 'active', createdAt: daysAgo(12), tags: ['marketing', 'SaaS'], ownerId: 'demo-user-2', leadScore: 76, jobTitle: 'Director Marketing', source: 'social media' },
        { id: 'c-004', firstName: 'David', lastName: 'Park', email: 'dpark@quantumlabs.co', phone: '+1 (408) 555-0404', company: 'Quantum Labs', status: 'active', createdAt: daysAgo(3), tags: ['enterprise', 'cercetare'], ownerId: 'demo-user-1', leadScore: 95, jobTitle: 'Director Tehnic', source: 'eveniment' },
        { id: 'c-005', firstName: 'Elena', lastName: 'Vasquez', email: 'elena.v@orbitsolutions.io', phone: '+1 (310) 555-0505', company: 'Orbit Solutions', status: 'active', createdAt: daysAgo(15), tags: ['startup', 'tehnologie'], ownerId: 'demo-user-2', leadScore: 67, jobTitle: 'Co-Fondator', source: 'recomandare' },
        { id: 'c-006', firstName: 'James', lastName: 'Whitfield', email: 'jwhitfield@acmecorp.com', phone: '+1 (512) 555-0606', company: 'Acme Corp', status: 'active', createdAt: daysAgo(20), tags: ['enterprise', 'producție'], ownerId: 'demo-user-1', leadScore: 83, jobTitle: 'Director Operațiuni', source: 'site web' },
        { id: 'c-007', firstName: 'Aisha', lastName: 'Okafor', email: 'aisha@cloudnineinc.com', phone: '+1 (917) 555-0707', company: 'CloudNine Inc', status: 'active', createdAt: daysAgo(7), tags: ['cloud', 'segment mediu'], ownerId: 'demo-user-1', leadScore: 71, jobTitle: 'Director IT', source: 'email' },
        { id: 'c-008', firstName: 'Tom', lastName: 'Hartley', email: 'thartley@zenithcorp.com', phone: '+1 (303) 555-0808', company: 'Zenith Corp', status: 'active', createdAt: daysAgo(25), tags: ['enterprise'], ownerId: 'demo-user-2', leadScore: 79, jobTitle: 'VP Vânzări', source: 'eveniment' },
        { id: 'c-009', firstName: 'Megan', lastName: 'Foster', email: 'mfoster@blueshoremedia.com', phone: '+1 (619) 555-0909', company: 'BlueShore Media', status: 'inactive', createdAt: daysAgo(30), tags: ['media', 'IMM'], ownerId: 'demo-user-1', leadScore: 42, jobTitle: 'Manager Marketing', source: 'social media' },
        { id: 'c-010', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@stellarworks.dev', phone: '+1 (206) 555-1010', company: 'Stellar Works', status: 'active', createdAt: daysAgo(2), tags: ['tehnologie', 'consultanță'], ownerId: 'demo-user-1', leadScore: 86, jobTitle: 'Director General', source: 'recomandare' },
        { id: 'c-011', firstName: 'Nina', lastName: 'Kowalski', email: 'nina.k@apexventures.com', phone: '+1 (773) 555-1111', company: 'Apex Ventures', status: 'active', createdAt: daysAgo(14), tags: ['capital de risc', 'finanțe'], ownerId: 'demo-user-2', leadScore: 74, jobTitle: 'Partener Administrator', source: 'site web' },
        { id: 'c-012', firstName: 'Lucas', lastName: 'Fernandez', email: 'lfernandez@brightpath.io', phone: '+1 (954) 555-1212', company: 'BrightPath', status: 'active', createdAt: daysAgo(9), tags: ['edtech', 'startup'], ownerId: 'demo-user-1', leadScore: 63, jobTitle: 'Manager Produs', source: 'email' },
        { id: 'c-013', firstName: 'Chloe', lastName: 'Nguyen', email: 'chloe@vortexai.com', phone: '+1 (425) 555-1313', company: 'Vortex AI', status: 'active', createdAt: daysAgo(6), tags: ['inteligență artificială', 'enterprise'], ownerId: 'demo-user-1', leadScore: 91, jobTitle: 'Director Parteneriate', source: 'eveniment' },
        { id: 'c-014', firstName: 'Ryan', lastName: 'O\'Brien', email: 'robrien@ironclad.co', phone: '+1 (617) 555-1414', company: 'Ironclad Solutions', status: 'inactive', createdAt: daysAgo(45), tags: ['juridic', 'enterprise'], ownerId: 'demo-user-2', leadScore: 38, jobTitle: 'Consilier Juridic General', source: 'recomandare' },
        { id: 'c-015', firstName: 'Fatima', lastName: 'Al-Rashid', email: 'fatima@crescenttech.com', phone: '+1 (469) 555-1515', company: 'Crescent Technologies', status: 'active', createdAt: daysAgo(11), tags: ['tehnologie', 'segment mediu'], ownerId: 'demo-user-1', leadScore: 69, jobTitle: 'Lider Inginerie', source: 'social media' },
        { id: 'c-016', firstName: 'Derek', lastName: 'Morrison', email: 'dmorrison@summitgrp.com', phone: '+1 (404) 555-1616', company: 'Summit Group', status: 'active', createdAt: daysAgo(18), tags: ['consultanță', 'enterprise'], ownerId: 'demo-user-2', leadScore: 81, jobTitle: 'VP Senior', source: 'site web' },
        { id: 'c-017', firstName: 'Yuki', lastName: 'Tanaka', email: 'ytanaka@novastream.io', phone: '+1 (503) 555-1717', company: 'NovaStream', status: 'active', createdAt: daysAgo(4), tags: ['streaming', 'tehnologie'], ownerId: 'demo-user-1', leadScore: 77, jobTitle: 'Director Tehnic', source: 'eveniment' },
        { id: 'c-018', firstName: 'Amanda', lastName: 'Brooks', email: 'abrooks@terraforma.co', phone: '+1 (720) 555-1818', company: 'TerraForma', status: 'active', createdAt: daysAgo(22), tags: ['sustenabilitate', 'enterprise'], ownerId: 'demo-user-1', leadScore: 85, jobTitle: 'Director Inovație', source: 'recomandare' },
        { id: 'c-019', firstName: 'Hassan', lastName: 'Mahmoud', email: 'hmahmoud@corewavedata.com', phone: '+1 (214) 555-1919', company: 'CoreWave Data', status: 'active', createdAt: daysAgo(13), tags: ['date', 'analiză'], ownerId: 'demo-user-2', leadScore: 72, jobTitle: 'VP Inginerie Date', source: 'email' },
        { id: 'c-020', firstName: 'Olivia', lastName: 'Grant', email: 'ogrant@luminarydesign.com', phone: '+1 (602) 555-2020', company: 'Luminary Design', status: 'active', createdAt: daysAgo(1), tags: ['design', 'agenție'], ownerId: 'demo-user-1', leadScore: 58, jobTitle: 'Director Creativ', source: 'social media' },
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
        { id: 'd-001', name: 'Acord Licență Enterprise', company: 'Quantum Labs', value: 125000, stage: 'negotiation', probability: 80, expectedCloseDate: daysFromNow(14), contact: { firstName: 'David', lastName: 'Park' }, status: 'open', createdAt: daysAgo(21) },
        { id: 'd-002', name: 'Migrare Platformă SaaS', company: 'CloudNine Inc', value: 85000, stage: 'proposal', probability: 65, expectedCloseDate: daysFromNow(21), contact: { firstName: 'Aisha', lastName: 'Okafor' }, status: 'open', createdAt: daysAgo(14) },
        { id: 'd-003', name: 'Contract Suport Anual', company: 'Acme Corp', value: 42000, stage: 'closed_won', probability: 100, expectedCloseDate: daysAgo(3), contact: { firstName: 'James', lastName: 'Whitfield' }, status: 'won', createdAt: daysAgo(35) },
        { id: 'd-004', name: 'Panou Analiză Date', company: 'CoreWave Data', value: 67000, stage: 'qualification', probability: 40, expectedCloseDate: daysFromNow(30), contact: { firstName: 'Hassan', lastName: 'Mahmoud' }, status: 'open', createdAt: daysAgo(10) },
        { id: 'd-005', name: 'Parteneriat TechVault', company: 'TechVault', value: 190000, stage: 'proposal', probability: 70, expectedCloseDate: daysFromNow(18), contact: { firstName: 'Sarah', lastName: 'Chen' }, status: 'open', createdAt: daysAgo(17) },
        { id: 'd-006', name: 'Extindere Nexus Digital', company: 'Nexus Digital', value: 56000, stage: 'prospecting', probability: 25, expectedCloseDate: daysFromNow(45), contact: { firstName: 'Priya', lastName: 'Sharma' }, status: 'open', createdAt: daysAgo(5) },
        { id: 'd-007', name: 'Onboarding Pinnacle Group', company: 'Pinnacle Group', value: 78000, stage: 'negotiation', probability: 85, expectedCloseDate: daysFromNow(7), contact: { firstName: 'Marcus', lastName: 'Rivera' }, status: 'open', createdAt: daysAgo(28) },
        { id: 'd-008', name: 'Redesign Website', company: 'BlueShore Media', value: 32000, stage: 'closed_lost', probability: 0, expectedCloseDate: daysAgo(5), contact: { firstName: 'Megan', lastName: 'Foster' }, status: 'lost', createdAt: daysAgo(40) },
        { id: 'd-009', name: 'Proiect Integrare IA', company: 'Vortex AI', value: 210000, stage: 'proposal', probability: 60, expectedCloseDate: daysFromNow(25), contact: { firstName: 'Chloe', lastName: 'Nguyen' }, status: 'open', createdAt: daysAgo(12) },
        { id: 'd-010', name: 'Angajament Consultanță', company: 'Stellar Works', value: 48000, stage: 'qualification', probability: 50, expectedCloseDate: daysFromNow(35), contact: { firstName: 'Raj', lastName: 'Patel' }, status: 'open', createdAt: daysAgo(8) },
        { id: 'd-011', name: 'Platformă Sustenabilitate', company: 'TerraForma', value: 135000, stage: 'prospecting', probability: 20, expectedCloseDate: daysFromNow(60), contact: { firstName: 'Amanda', lastName: 'Brooks' }, status: 'open', createdAt: daysAgo(3) },
        { id: 'd-012', name: 'Infrastructură Streaming', company: 'NovaStream', value: 94000, stage: 'qualification', probability: 45, expectedCloseDate: daysFromNow(28), contact: { firstName: 'Yuki', lastName: 'Tanaka' }, status: 'open', createdAt: daysAgo(6) },
        { id: 'd-013', name: 'Licență Creative Suite', company: 'Luminary Design', value: 23000, stage: 'prospecting', probability: 15, expectedCloseDate: daysFromNow(50), contact: { firstName: 'Olivia', lastName: 'Grant' }, status: 'open', createdAt: daysAgo(1) },
        { id: 'd-014', name: 'Implementare Analiză Summit', company: 'Summit Group', value: 156000, stage: 'negotiation', probability: 75, expectedCloseDate: daysFromNow(10), contact: { firstName: 'Derek', lastName: 'Morrison' }, status: 'open', createdAt: daysAgo(30) },
        { id: 'd-015', name: 'Licență Platformă EdTech', company: 'BrightPath', value: 38000, stage: 'closed_won', probability: 100, expectedCloseDate: daysAgo(7), contact: { firstName: 'Lucas', lastName: 'Fernandez' }, status: 'won', createdAt: daysAgo(42) },
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
        { id: 't-001', title: 'Urmărire cu Sarah Chen privind propunerea de parteneriat', description: 'Discutare niveluri de preț și calendar de integrare', status: 'pending', priority: 'high', type: 'follow_up', dueDate: daysFromNow(0), createdAt: daysAgo(3), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Sarah Chen', dealName: 'Parteneriat TechVault' },
        { id: 't-002', title: 'Pregătire raport venituri T1', description: 'Compilare toate închiderile de tranzacții și indicatorii de venituri pentru prezentarea consiliului', status: 'in_progress', priority: 'urgent', type: 'task', dueDate: daysFromNow(1), createdAt: daysAgo(5), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: undefined, dealName: undefined },
        { id: 't-003', title: 'Trimite contractul revizuit către Quantum Labs', description: 'Termeni actualizați conform revizuirii juridice la clauza 4.2 și secțiunea SLA', status: 'pending', priority: 'high', type: 'email', dueDate: daysFromNow(1), createdAt: daysAgo(2), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'David Park', dealName: 'Licență Enterprise' },
        { id: 't-004', title: 'Programează demo produs cu Nexus Digital', description: 'Coordonare cu echipa de inginerie pentru mediul demo live', status: 'pending', priority: 'medium', type: 'meeting', dueDate: daysFromNow(2), createdAt: daysAgo(4), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Priya Sharma', dealName: 'Extindere Nexus Digital' },
        { id: 't-005', title: 'Revizuire materiale marketing pentru târg', description: 'Aprobare broșuri, bannere și materiale stand demo', status: 'pending', priority: 'low', type: 'task', dueDate: daysFromNow(3), createdAt: daysAgo(7), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: undefined, dealName: undefined },
        { id: 't-006', title: 'Sună-l pe Marcus Rivera despre implementare', description: 'Discutare faze proiect, alocare resurse și data lansării', status: 'pending', priority: 'medium', type: 'call', dueDate: daysFromNow(4), createdAt: daysAgo(1), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Marcus Rivera', dealName: 'Onboarding Pinnacle Group' },
        { id: 't-007', title: 'Actualizare date CRM pentru Orbit Solutions', description: 'Adăugare ultimele note de ședință și actualizare probabilitate tranzacție', status: 'completed', priority: 'low', type: 'task', dueDate: daysAgo(1), createdAt: daysAgo(6), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: 'Elena Vasquez', dealName: undefined },
        { id: 't-008', title: 'Sesiune onboarding cu echipa BrightPath', description: 'Prezentare funcționalități platformă și setări admin', status: 'completed', priority: 'high', type: 'meeting', dueDate: daysAgo(2), createdAt: daysAgo(10), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'Lucas Fernandez', dealName: 'Licență Platformă EdTech' },
        { id: 't-009', title: 'Redactare propunere pentru integrarea Vortex AI', description: 'Include arhitectură tehnică, calendar și prețuri pentru modulele IA', status: 'in_progress', priority: 'high', type: 'task', dueDate: daysFromNow(5), createdAt: daysAgo(3), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Chloe Nguyen', dealName: 'Proiect Integrare IA' },
        { id: 't-010', title: 'Reminder reînnoire pentru Acme Corp', description: 'Contract suport cu reînnoire în 30 de zile', status: 'pending', priority: 'medium', type: 'follow_up', dueDate: daysFromNow(7), createdAt: daysAgo(1), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: 'James Whitfield', dealName: 'Contract Suport Anual' },
        { id: 't-011', title: 'Coordonare revizuire juridică pentru tranzacția Summit', description: 'Trimite contractul la departamentul juridic pentru revizuire NDA și MSA', status: 'pending', priority: 'high', type: 'task', dueDate: daysFromNow(2), createdAt: daysAgo(4), assignee: { firstName: 'Jordan', lastName: 'Lee' }, contactName: 'Derek Morrison', dealName: 'Implementare Analiză Summit' },
        { id: 't-012', title: 'Actualizare document analiză competitori', description: 'Reîmprospătare grafice comparație prețuri și funcționalități', status: 'pending', priority: 'low', type: 'task', dueDate: daysFromNow(10), createdAt: daysAgo(8), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: undefined, dealName: undefined },
        { id: 't-013', title: 'Urmărire apel descoperire NovaStream', description: 'Trimite email rezumat și pașii următori după apelul inițial', status: 'completed', priority: 'medium', type: 'follow_up', dueDate: daysAgo(1), createdAt: daysAgo(5), assignee: { firstName: 'Alex', lastName: 'Morgan' }, contactName: 'Yuki Tanaka', dealName: 'Infrastructură Streaming' },
        { id: 't-014', title: 'Analiză sondaj feedback clienți', description: 'Compilare scoruri NPS și identificare top 5 zone de îmbunătățire', status: 'in_progress', priority: 'medium', type: 'task', dueDate: daysFromNow(6), createdAt: daysAgo(9), assignee: { firstName: 'Taylor', lastName: 'Swift' }, contactName: undefined, dealName: undefined },
        { id: 't-015', title: 'Trimite pachet de bun venit lui Olivia Grant', description: 'Kit introductiv nou prospect cu studii de caz și prezentare generală produs', status: 'pending', priority: 'low', type: 'email', dueDate: daysFromNow(1), createdAt: daysAgo(1), assignee: { firstName: 'Casey', lastName: 'Brooks' }, contactName: 'Olivia Grant', dealName: 'Licență Creative Suite' },
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
        { id: 'tk-001', ticketNumber: 'TK-089', subject: 'Nu se pot exporta rapoartele din panou în PDF', description: 'La apăsarea butonului de export din panoul de analiză, generarea PDF eșuează cu o eroare de timeout. Aceasta afectează toate rapoartele bazate pe grafice.', status: 'open', priority: 'high', category: 'bug', createdAt: hoursAgo(4), updatedAt: hoursAgo(2), contact: { id: 'c-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@techvault.io' } },
        { id: 'tk-002', ticketNumber: 'TK-088', subject: 'Solicitare funcționalitate import contacte în masă', description: 'Dorim posibilitatea de a importa contacte dintr-un fișier CSV cu mapare câmpuri personalizată. În prezent, contactele pot fi adăugate doar unul câte unul.', status: 'open', priority: 'medium', category: 'feature', createdAt: daysAgo(1), updatedAt: daysAgo(1), contact: { id: 'c-003', firstName: 'Priya', lastName: 'Sharma', email: 'priya@nexusdigital.com' } },
        { id: 'tk-003', ticketNumber: 'TK-087', subject: 'Statusul plății facturii nu se sincronizează', description: 'Plățile marcate ca primite în sistemul nostru contabil nu se reflectă în statusul facturii din CRM. Ultima sincronizare a fost acum 48 de ore.', status: 'in_progress', priority: 'urgent', category: 'bug', createdAt: daysAgo(2), updatedAt: hoursAgo(6), contact: { id: 'c-002', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus.r@pinnaclegroup.com' } },
        { id: 'tk-004', ticketNumber: 'TK-086', subject: 'Cum se configurează secvențele automate de email?', description: 'Dorim să creăm o secvență de 5 pași de email onboarding pentru lead-uri noi. Avem nevoie de îndrumare privind constructorul de flux de lucru și configurarea triggerelor.', status: 'resolved', priority: 'low', category: 'question', createdAt: daysAgo(4), updatedAt: daysAgo(1), contact: { id: 'c-005', firstName: 'Elena', lastName: 'Vasquez', email: 'elena.v@orbitsolutions.io' } },
        { id: 'tk-005', ticketNumber: 'TK-085', subject: 'Limitarea ratei API prea restrictivă pentru integrarea noastră', description: 'Middleware-ul nostru primește erori 429 la sincronizarea seturilor mari de date. Limita actuală de 100 req/min este insuficientă pentru sincronizarea a peste 5.000 de contacte.', status: 'open', priority: 'high', category: 'support', createdAt: daysAgo(3), updatedAt: daysAgo(2), contact: { id: 'c-004', firstName: 'David', lastName: 'Park', email: 'dpark@quantumlabs.co' } },
        { id: 'tk-006', ticketNumber: 'TK-084', subject: 'Widget-urile personalizate din panou nu se salvează', description: 'Aranjarea widget-urilor prin drag-and-drop din panou revine la setările implicite după reîmprospătarea paginii. Testat pe Chrome și Firefox.', status: 'in_progress', priority: 'medium', category: 'bug', createdAt: daysAgo(5), updatedAt: daysAgo(1), contact: { id: 'c-008', firstName: 'Tom', lastName: 'Hartley', email: 'thartley@zenithcorp.com' } },
        { id: 'tk-007', ticketNumber: 'TK-083', subject: 'Necesară integrare SSO cu Okta', description: 'Compania noastră folosește Okta pentru gestionarea identității. Avem nevoie de configurarea SSO bazat pe SAML pentru implementarea noastră cu 150 de utilizatori.', status: 'open', priority: 'high', category: 'feature', createdAt: daysAgo(6), updatedAt: daysAgo(4), contact: { id: 'c-006', firstName: 'James', lastName: 'Whitfield', email: 'jwhitfield@acmecorp.com' } },
        { id: 'tk-008', ticketNumber: 'TK-082', subject: 'Discrepanță facturare pe ultima factură', description: 'Factura INV-298 arată $4.200 dar acordul nostru prevede $3.800/lună. Vă rugăm să revizuiți și să emiteți o factură corectată.', status: 'resolved', priority: 'medium', category: 'support', createdAt: daysAgo(8), updatedAt: daysAgo(3), contact: { id: 'c-007', firstName: 'Aisha', lastName: 'Okafor', email: 'aisha@cloudnineinc.com' } },
        { id: 'tk-009', ticketNumber: 'TK-081', subject: 'Aplicația mobilă se blochează pe vizualizarea pipeline tranzacții', description: 'Aplicația iOS versiunea 3.2.1 se blochează constant la navigarea către vizualizarea kanban pipeline cu mai mult de 20 de tranzacții.', status: 'open', priority: 'urgent', category: 'bug', createdAt: daysAgo(1), updatedAt: hoursAgo(8), contact: { id: 'c-010', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@stellarworks.dev' } },
        { id: 'tk-010', ticketNumber: 'TK-080', subject: 'Solicitare îmbunătățiri control acces bazat pe roluri', description: 'Avem nevoie de permisiuni mai granulare: doar vizualizare pentru stagiari, editare pentru personal, control complet pentru manageri și jurnalizare audit pentru administratori.', status: 'open', priority: 'medium', category: 'feature', createdAt: daysAgo(10), updatedAt: daysAgo(7), contact: { id: 'c-011', firstName: 'Nina', lastName: 'Kowalski', email: 'nina.k@apexventures.com' } },
        { id: 'tk-011', ticketNumber: 'TK-079', subject: 'Întârzieri livrare email pentru notificări', description: 'Echipa raportează întârzieri de 2-3 ore la primirea notificărilor email pentru atribuirea sarcinilor și actualizarea tranzacțiilor de marțea trecută.', status: 'closed', priority: 'high', category: 'bug', createdAt: daysAgo(12), updatedAt: daysAgo(5), contact: { id: 'c-013', firstName: 'Chloe', lastName: 'Nguyen', email: 'chloe@vortexai.com' } },
        { id: 'tk-012', ticketNumber: 'TK-078', subject: 'Solicitare sesiune de instruire pentru membri noi ai echipei', description: 'Avem 8 angajări noi care încep luna viitoare și vor avea nevoie de instruire CRM cuprinzătoare. Putem programa 2 sesiuni?', status: 'open', priority: 'low', category: 'support', createdAt: daysAgo(7), updatedAt: daysAgo(6), contact: { id: 'c-016', firstName: 'Derek', lastName: 'Morrison', email: 'dmorrison@summitgrp.com' } },
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
        { id: 'apt-001', title: 'Revizuire Trimestrială de Afaceri', description: 'Revizuire indicatori performanță T1 și discutare strategie T2 cu echipa TechVault', startDate: daysFromNowAt(0, 10, 0), endDate: daysFromNowAt(0, 11, 30), allDay: false, type: 'meeting' as const, location: 'Sala de Conferințe A', attendees: ['Sarah Chen', 'Alex Morgan', 'Jordan Lee'], createdAt: daysAgo(7), updatedAt: daysAgo(2) },
        { id: 'apt-002', title: 'Apel de Descoperire cu Orbit Solutions', description: 'Apel inițial pentru a înțelege cerințele lor CRM și punctele dureroase', startDate: daysFromNowAt(1, 14, 0), endDate: daysFromNowAt(1, 14, 45), allDay: false, type: 'call' as const, location: undefined, attendees: ['Elena Vasquez', 'Alex Morgan'], createdAt: daysAgo(3), updatedAt: daysAgo(3) },
        { id: 'apt-003', title: 'Demo Produs - Vortex AI', description: 'Prezentare funcționalități integrare IA și capabilități antrenare model personalizat', startDate: daysFromNowAt(1, 15, 30), endDate: daysFromNowAt(1, 16, 30), allDay: false, type: 'video_call' as const, location: 'https://zoom.us/j/demo123', attendees: ['Chloe Nguyen', 'Alex Morgan', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(5), updatedAt: daysAgo(1) },
        { id: 'apt-004', title: 'Standup Echipă', description: 'Sincronizare săptămânală echipa de vânzări - revizuire pipeline și discuție blocaje', startDate: daysFromNowAt(2, 9, 0), endDate: daysFromNowAt(2, 9, 30), allDay: false, type: 'meeting' as const, location: 'Sala Huddle B', attendees: ['Alex Morgan', 'Jordan Lee', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(14), updatedAt: daysAgo(14) },
        { id: 'apt-005', title: 'Negociere Contract - Summit Group', description: 'Runda finală de discuții contract acoperind prețuri, termeni SLA și calendar implementare', startDate: daysFromNowAt(2, 13, 0), endDate: daysFromNowAt(2, 14, 30), allDay: false, type: 'video_call' as const, location: 'https://teams.microsoft.com/l/meet', attendees: ['Derek Morrison', 'Alex Morgan', 'Jordan Lee'], createdAt: daysAgo(10), updatedAt: daysAgo(3) },
        { id: 'apt-006', title: 'Conferință Industrie - Summit CRM', description: 'Eveniment anual industria CRM - participare prezentări principale și sesiuni networking', startDate: daysFromNowAt(5, 0, 0), endDate: daysFromNowAt(5, 23, 59), allDay: true, type: 'other' as const, location: 'San Francisco Convention Center', attendees: ['Alex Morgan', 'Taylor Swift'], createdAt: daysAgo(30), updatedAt: daysAgo(15) },
        { id: 'apt-007', title: 'Prânz cu Raj Patel', description: 'Întâlnire informală la prânz pentru a discuta scopul angajamentului de consultanță', startDate: daysFromNowAt(3, 12, 0), endDate: daysFromNowAt(3, 13, 0), allDay: false, type: 'meeting' as const, location: 'The Capital Grille', attendees: ['Raj Patel', 'Alex Morgan'], createdAt: daysAgo(2), updatedAt: daysAgo(2) },
        { id: 'apt-008', title: 'Revizuire Arhitectură Tehnică', description: 'Aprofundare cerințe integrare Quantum Labs și flux de date', startDate: daysFromNowAt(4, 10, 0), endDate: daysFromNowAt(4, 12, 0), allDay: false, type: 'video_call' as const, location: 'https://zoom.us/j/arch456', attendees: ['David Park', 'Alex Morgan', 'Casey Brooks'], createdAt: daysAgo(6), updatedAt: daysAgo(1) },
        { id: 'apt-009', title: 'Verificare Onboarding Angajat Nou', description: 'Urmărire progres onboarding CloudNine și adresare oricăror întrebări', startDate: daysFromNowAt(3, 15, 0), endDate: daysFromNowAt(3, 15, 30), allDay: false, type: 'call' as const, location: undefined, attendees: ['Aisha Okafor', 'Jordan Lee'], createdAt: daysAgo(4), updatedAt: daysAgo(4) },
        { id: 'apt-010', title: 'Planificare Strategie Marketing', description: 'Planificare calendar conținut viitor și strategie campanie pentru T2', startDate: daysFromNowAt(6, 10, 0), endDate: daysFromNowAt(6, 11, 30), allDay: false, type: 'meeting' as const, location: 'Sala de Conferințe C', attendees: ['Alex Morgan', 'Taylor Swift', 'Casey Brooks'], createdAt: daysAgo(1), updatedAt: daysAgo(1) },
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
        { id: 'inv-001', invoiceNumber: 'INV-312', contactId: 'c-006', contactName: 'James Whitfield - Acme Corp', amount: 18500, subtotal: 17130, tax: 1370, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(2), dueDate: daysFromNow(28), notes: 'Termeni de plată Net 30. Reînnoire contract suport anual.', lineItems: [{ id: 'li-001', description: 'Contract Suport Anual - Enterprise', quantity: 1, unitPrice: 15000 }, { id: 'li-002', description: 'Supliment SLA Premium', quantity: 1, unitPrice: 2130 }], createdAt: daysAgo(2) },
        { id: 'inv-002', invoiceNumber: 'INV-311', contactId: 'c-004', contactName: 'David Park - Quantum Labs', amount: 62500, subtotal: 57870, tax: 4630, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(15), dueDate: daysAgo(0), notes: 'Plată Faza 1 pentru Acord Licență Enterprise.', lineItems: [{ id: 'li-003', description: 'Licență Enterprise - 250 locuri', quantity: 1, unitPrice: 50000 }, { id: 'li-004', description: 'Servicii Implementare', quantity: 40, unitPrice: 197 }], createdAt: daysAgo(15) },
        { id: 'inv-003', invoiceNumber: 'INV-310', contactId: 'c-002', contactName: 'Marcus Rivera - Pinnacle Group', amount: 39000, subtotal: 36111, tax: 2889, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(22), dueDate: daysAgo(7), notes: 'Taxe inițiale onboarding și configurare.', lineItems: [{ id: 'li-005', description: 'Pachet Onboarding Platformă', quantity: 1, unitPrice: 28000 }, { id: 'li-006', description: 'Serviciu Migrare Date', quantity: 1, unitPrice: 5611 }, { id: 'li-007', description: 'Sesiuni Instruire (x4)', quantity: 4, unitPrice: 625 }], createdAt: daysAgo(22) },
        { id: 'inv-004', invoiceNumber: 'INV-309', contactId: 'c-007', contactName: 'Aisha Okafor - CloudNine Inc', amount: 4200, subtotal: 3889, tax: 311, taxRate: 8, status: 'overdue' as const, issuedDate: daysAgo(45), dueDate: daysAgo(15), notes: 'Taxă abonament lunar - Decembrie 2025.', lineItems: [{ id: 'li-008', description: 'Platformă SaaS - Lunar', quantity: 1, unitPrice: 3500 }, { id: 'li-009', description: 'Stocare Suplimentară (100GB)', quantity: 1, unitPrice: 389 }], createdAt: daysAgo(45) },
        { id: 'inv-005', invoiceNumber: 'INV-308', contactId: 'c-010', contactName: 'Raj Patel - Stellar Works', amount: 24000, subtotal: 22222, tax: 1778, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(30), dueDate: daysAgo(0), notes: 'Angajament consultanță - Plată etapă Faza 1.', lineItems: [{ id: 'li-010', description: 'Consultanță Strategie - 40 ore', quantity: 40, unitPrice: 450 }, { id: 'li-011', description: 'Raport Analiză Piață', quantity: 1, unitPrice: 4222 }], createdAt: daysAgo(30) },
        { id: 'inv-006', invoiceNumber: 'INV-307', contactId: 'c-012', contactName: 'Lucas Fernandez - BrightPath', amount: 19000, subtotal: 17593, tax: 1407, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(25), dueDate: daysAgo(5), notes: 'Licență platformă EdTech - taxă anuală.', lineItems: [{ id: 'li-012', description: 'Licență Platformă - Nivel Educație', quantity: 1, unitPrice: 15000 }, { id: 'li-013', description: 'Modul Portal Studenți', quantity: 1, unitPrice: 2593 }], createdAt: daysAgo(25) },
        { id: 'inv-007', invoiceNumber: 'INV-306', contactId: 'c-001', contactName: 'Sarah Chen - TechVault', amount: 95000, subtotal: 87963, tax: 7037, taxRate: 8, status: 'draft' as const, issuedDate: daysAgo(1), dueDate: daysFromNow(29), notes: 'Pachet parteneriat - în așteptarea aprobării.', lineItems: [{ id: 'li-014', description: 'Licență Platformă Partener', quantity: 1, unitPrice: 70000 }, { id: 'li-015', description: 'Integrare API Personalizată', quantity: 1, unitPrice: 12963 }, { id: 'li-016', description: 'Inginer Suport Dedicat (Trimestrial)', quantity: 1, unitPrice: 5000 }], createdAt: daysAgo(1) },
        { id: 'inv-008', invoiceNumber: 'INV-305', contactId: 'c-013', contactName: 'Chloe Nguyen - Vortex AI', amount: 105000, subtotal: 97222, tax: 7778, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(5), dueDate: daysFromNow(25), notes: 'Proiect integrare IA - Avans Faza 1 (50%).', lineItems: [{ id: 'li-017', description: 'Modul IA - Licență Bază', quantity: 1, unitPrice: 65000 }, { id: 'li-018', description: 'Antrenare Model Personalizat', quantity: 1, unitPrice: 25000 }, { id: 'li-019', description: 'Dezvoltare Integrare', quantity: 30, unitPrice: 241 }], createdAt: daysAgo(5) },
        { id: 'inv-009', invoiceNumber: 'INV-304', contactId: 'c-016', contactName: 'Derek Morrison - Summit Group', amount: 78000, subtotal: 72222, tax: 5778, taxRate: 8, status: 'sent' as const, issuedDate: daysAgo(8), dueDate: daysFromNow(22), notes: 'Implementare platformă analiză - Nivel Enterprise.', lineItems: [{ id: 'li-020', description: 'Platformă Analiză - Enterprise', quantity: 1, unitPrice: 60000 }, { id: 'li-021', description: 'Dezvoltare Panou Personalizat', quantity: 1, unitPrice: 12222 }], createdAt: daysAgo(8) },
        { id: 'inv-010', invoiceNumber: 'INV-303', contactId: 'c-017', contactName: 'Yuki Tanaka - NovaStream', amount: 47000, subtotal: 43519, tax: 3481, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(35), dueDate: daysAgo(5), notes: 'Configurare infrastructură streaming și licență inițială.', lineItems: [{ id: 'li-022', description: 'Configurare Infrastructură Streaming', quantity: 1, unitPrice: 30000 }, { id: 'li-023', description: 'Integrare CDN', quantity: 1, unitPrice: 10519 }, { id: 'li-024', description: 'Serviciu Testare Încărcare', quantity: 1, unitPrice: 3000 }], createdAt: daysAgo(35) },
        { id: 'inv-011', invoiceNumber: 'INV-302', contactId: 'c-018', contactName: 'Amanda Brooks - TerraForma', amount: 67500, subtotal: 62500, tax: 5000, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(28), dueDate: daysAgo(2), notes: 'Platformă sustenabilitate - licență anuală.', lineItems: [{ id: 'li-025', description: 'Licență Platformă Sustenabilitate', quantity: 1, unitPrice: 55000 }, { id: 'li-026', description: 'Modul Raportare Carbon', quantity: 1, unitPrice: 7500 }], createdAt: daysAgo(28) },
        { id: 'inv-012', invoiceNumber: 'INV-301', contactId: 'c-011', contactName: 'Nina Kowalski - Apex Ventures', amount: 12000, subtotal: 11111, tax: 889, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(40), dueDate: daysAgo(10), notes: 'Abonament platformă trimestrial.', lineItems: [{ id: 'li-027', description: 'Abonament Platformă - T4', quantity: 1, unitPrice: 9500 }, { id: 'li-028', description: 'Supliment Analiză Avansată', quantity: 1, unitPrice: 1611 }], createdAt: daysAgo(40) },
        { id: 'inv-013', invoiceNumber: 'INV-300', contactId: 'c-015', contactName: 'Fatima Al-Rashid - Crescent Technologies', amount: 33500, subtotal: 31019, tax: 2481, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(42), dueDate: daysAgo(12), notes: 'Personalizare și implementare platformă.', lineItems: [{ id: 'li-029', description: 'Dezvoltare Modul Personalizat', quantity: 60, unitPrice: 375 }, { id: 'li-030', description: 'Implementare și Configurare', quantity: 1, unitPrice: 8519 }], createdAt: daysAgo(42) },
        { id: 'inv-014', invoiceNumber: 'INV-299', contactId: 'c-019', contactName: 'Hassan Mahmoud - CoreWave Data', amount: 28750, subtotal: 26620, tax: 2130, taxRate: 8, status: 'cancelled' as const, issuedDate: daysAgo(50), dueDate: daysAgo(20), notes: 'Anulată - scopul proiectului s-a schimbat. Factură nouă va fi emisă.', lineItems: [{ id: 'li-031', description: 'Configurare Pipeline Date', quantity: 1, unitPrice: 20000 }, { id: 'li-032', description: 'Dezvoltare ETL', quantity: 20, unitPrice: 331 }], createdAt: daysAgo(50) },
        { id: 'inv-015', invoiceNumber: 'INV-298', contactId: 'c-007', contactName: 'Aisha Okafor - CloudNine Inc', amount: 4200, subtotal: 3889, tax: 311, taxRate: 8, status: 'paid' as const, issuedDate: daysAgo(75), dueDate: daysAgo(45), notes: 'Taxă abonament lunar - Noiembrie 2025.', lineItems: [{ id: 'li-033', description: 'Platformă SaaS - Lunar', quantity: 1, unitPrice: 3500 }, { id: 'li-034', description: 'Stocare Suplimentară (100GB)', quantity: 1, unitPrice: 389 }], createdAt: daysAgo(75) },
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
        { id: 'em-001', to: 'sarah.chen@techvault.io', subject: 'Propunere Parteneriat - AlpineCRM x TechVault', body: 'Bună Sarah,\n\nMulțumesc pentru întâlnirea productivă de săptămâna trecută. Așa cum am discutat, am atașat propunerea noastră de parteneriat care prezintă foaia de parcurs pentru integrare, nivelurile de preț și strategia comună de lansare pe piață.\n\nPuncte cheie:\n- Integrare API bidirecțională\n- Materiale marketing co-branded\n- Partajare venituri din tranzacții recomandate\n\nAș dori să programăm un apel de urmărire pentru a parcurge detaliile. Ar merge joi la ora 14:00?\n\nCu stimă,\nAlex Morgan', status: 'opened' as const, sentAt: daysAgo(2), openedAt: daysAgo(1), clickedAt: undefined, contactId: 'c-001', contactName: 'Sarah Chen' },
        { id: 'em-002', to: 'marcus.r@pinnaclegroup.com', subject: 'Calendar Implementare - Onboarding Pinnacle Group', body: 'Bună Marcus,\n\nÎn urma semnării contractului, am dorit să împărtășesc calendarul detaliat de implementare pentru onboarding-ul echipei tale:\n\nSăptămâna 1-2: Migrare date și configurare platformă\nSăptămâna 3: Sesiuni de instruire utilizatori (4 sesiuni planificate)\nSăptămâna 4: Lansare și suport hypercare\n\nManagerul tău dedicat de implementare, Jordan Lee, te va contacta mâine pentru a programa întâlnirea de start.\n\nAștept cu nerăbdare un parteneriat excelent!\n\nCu stimă,\nAlex', status: 'delivered' as const, sentAt: daysAgo(3), openedAt: undefined, clickedAt: undefined, contactId: 'c-002', contactName: 'Marcus Rivera' },
        { id: 'em-003', to: 'dpark@quantumlabs.co', subject: 'Re: Licență Enterprise - Termeni Revizuiți', body: 'Bună David,\n\nMulțumesc pentru răbdare în timp ce echipa noastră juridică a revizuit termenii actualizați. Mă bucur să vă comunic că am acceptat solicitările dumneavoastră:\n\n1. Garanție SLA extinsă la 99,95% disponibilitate\n2. Adăugată clauza de rezidență a datelor pentru conformitate UE\n3. Scalare flexibilă a locurilor (ajustări trimestriale)\n\nContractul revizuit este atașat. Vă rog să îl revizuiți și să îmi comunicați dacă aveți întrebări.\n\nCu stimă,\nAlex Morgan', status: 'opened' as const, sentAt: daysAgo(1), openedAt: hoursAgo(6), clickedAt: undefined, contactId: 'c-004', contactName: 'David Park' },
        { id: 'em-004', to: 'priya@nexusdigital.com', subject: 'Invitație Demo Produs - Platforma AlpineCRM', body: 'Bună Priya,\n\nSper că acest email te găsește bine. Pe baza conversației noastre inițiale despre nevoile echipei tale de marketing, aș dori să te invit la un demo personalizat de produs.\n\nÎn cadrul demo-ului, vom acoperi:\n- Urmărire campanii și atribuire\n- Scorizare lead-uri și segmentare\n- Fluxuri de lucru automatizare marketing\n- Panouri raportare ROI\n\nAr merge marți viitoare la 15:30 PST pentru tine și echipa ta?\n\nCu stimă,\nAlex', status: 'sent' as const, sentAt: daysAgo(1), openedAt: undefined, clickedAt: undefined, contactId: 'c-003', contactName: 'Priya Sharma' },
        { id: 'em-005', to: 'chloe@vortexai.com', subject: 'Specificații Tehnice Integrare IA', body: 'Bună Chloe,\n\nAșa cum am promis în timpul demo-ului, iată specificațiile tehnice pentru modulul nostru de integrare IA:\n\n- API REST cu specificație OpenAPI 3.0\n- Pipeline antrenare model personalizat\n- Endpoint inferență în timp real\n- Capabilități procesare în loturi\n- Infrastructură certificată SOC 2 Type II\n\nPDF-ul atașat include diagrame detaliate de arhitectură și prezentarea fluxului de date.\n\nAnunță-mă dacă echipa ta de inginerie are întrebări.\n\nCu stimă,\nAlex Morgan', status: 'clicked' as const, sentAt: daysAgo(4), openedAt: daysAgo(3), clickedAt: daysAgo(3), contactId: 'c-013', contactName: 'Chloe Nguyen' },
        { id: 'em-006', to: 'elena.v@orbitsolutions.io', subject: 'Bun venit la AlpineCRM - Ghid de Început', body: 'Bună Elena,\n\nBun venit la bord! Sunt încântat să avem Orbit Solutions ca cel mai nou client al nostru.\n\nIată câteva resurse pentru a te ajuta să începi:\n1. Ghid de Start Rapid: [link]\n2. Tutoriale Video: [link]\n3. Bază de Cunoștințe: [link]\n4. Forum Comunitate: [link]\n\nContul tău este acum activ și te poți autentifica la app.alpinecrm.com cu credențialele trimise într-un email separat.\n\nNu ezita să ne contactezi dacă ai nevoie de ceva!\n\nCu drag,\nAlex', status: 'opened' as const, sentAt: daysAgo(6), openedAt: daysAgo(5), clickedAt: undefined, contactId: 'c-005', contactName: 'Elena Vasquez' },
        { id: 'em-007', to: 'jwhitfield@acmecorp.com', subject: 'Reînnoire Contract Suport Anual', body: 'Bună James,\n\nSper că ești bine. Contractul tău anual de suport urmează să fie reînnoit pe 15 martie.\n\nPe baza utilizării tale din ultimul an, aș recomanda trecerea la nivelul nostru de Suport Premium, care include:\n- Suport prioritar 24/7\n- Manager de cont dedicat\n- Revizuiri trimestriale de afaceri\n- Acces anticipat la funcționalități noi\n\nAm atașat o propunere cu opțiuni de preț pentru reînnoire. Programăm un apel pentru a discuta?\n\nCu stimă,\nAlex Morgan', status: 'delivered' as const, sentAt: daysAgo(5), openedAt: undefined, clickedAt: undefined, contactId: 'c-006', contactName: 'James Whitfield' },
        { id: 'em-008', to: 'dmorrison@summitgrp.com', subject: 'Summit Group - Propunere Platformă Analiză', body: 'Bună Derek,\n\nMulțumesc că ai împărtășit documentul de cerințe. Pe baza analizei noastre, am pregătit o propunere cuprinzătoare pentru Implementarea Analiză Summit.\n\nPropunerea acoperă:\n- Implementare platformă analiză enterprise\n- Dezvoltare panouri personalizate (12 panouri)\n- Integrare streaming date în timp real\n- Program instruire utilizatori (3 cohorte)\n- Suport premium 12 luni\n\nInvestiție totală: $156.000 (detalii în atașament)\n\nSunt disponibil pentru un apel săptămâna aceasta pentru a parcurge propunerea.\n\nCu stimă,\nAlex', status: 'opened' as const, sentAt: daysAgo(7), openedAt: daysAgo(5), clickedAt: undefined, contactId: 'c-016', contactName: 'Derek Morrison' },
        { id: 'em-009', to: 'ytanaka@novastream.io', subject: 'Urmărire: Discuție Infrastructură Streaming', body: 'Bună Yuki,\n\nA fost o plăcere să discutăm astăzi! Așa cum am discutat, iată un rezumat a ceea ce am acoperit:\n\n1. Provocările tale actuale CDN cu peste 50M de streamuri lunare\n2. Arhitectura noastră de edge computing pentru livrare cu latență redusă\n3. Cerințe de scalabilitate pentru lansarea viitoare de produs\n\nPașii următori:\n- Voi trimite propunerea de arhitectură tehnică până vineri\n- Echipa ta va furniza specificațiile infrastructurii actuale\n- Vom programa un apel comun de inginerie pentru săptămâna viitoare\n\nAștept cu nerăbdare!\n\nCu stimă,\nAlex', status: 'delivered' as const, sentAt: daysAgo(3), openedAt: undefined, clickedAt: undefined, contactId: 'c-017', contactName: 'Yuki Tanaka' },
        { id: 'em-010', to: 'raj.patel@stellarworks.dev', subject: 'Angajament Consultanță - Scop și Calendar', body: 'Bună Raj,\n\nÎn urma discuției noastre la prânz, am dorit să formalizez scopul angajamentului de consultanță:\n\nFaza 1 (Săptămânile 1-4): Analiză Piață și Strategie\n- Evaluare peisaj competitiv\n- Dezvoltare personaje clienți\n- Cadru strategie lansare pe piață\n\nFaza 2 (Săptămânile 5-8): Planificare Implementare\n- Recomandări stivă tehnologică\n- Arhitectură integrare\n- Planificare resurse\n\nAngajament total: 80 ore la $450/oră\n\nSă redactez SOW-ul pentru revizuirea ta?\n\nCu stimă,\nAlex Morgan', status: 'clicked' as const, sentAt: daysAgo(8), openedAt: daysAgo(7), clickedAt: daysAgo(6), contactId: 'c-010', contactName: 'Raj Patel' },
        { id: 'em-011', to: 'aisha@cloudnineinc.com', subject: 'CloudNine Inc - Clarificare Factură Decembrie', body: 'Bună Aisha,\n\nAm primit solicitarea ta privind factura din decembrie (INV-298). Ai dreptate că a existat o discrepanță.\n\nTaxa suplimentară de $400 a fost pentru stocarea suplimentară de 100GB care a fost provizionată pe 5 decembrie. Îmi dau seama că acest lucru nu a fost comunicat clar când stocarea a fost adăugată.\n\nPentru a remedia situația, am emis o notă de credit de $400 care va fi aplicată în următorul ciclu de facturare. O factură corectată va fi trimisă în 24 de ore.\n\nÎmi cer sincer scuze pentru orice inconvenient.\n\nCu stimă,\nAlex', status: 'opened' as const, sentAt: daysAgo(10), openedAt: daysAgo(9), clickedAt: undefined, contactId: 'c-007', contactName: 'Aisha Okafor' },
        { id: 'em-012', to: 'nina.k@apexventures.com', subject: 'Confirmare Reînnoire Abonament Trimestrial', body: 'Bună Nina,\n\nAcest email confirmă că abonamentul tău trimestrial a fost reînnoit cu succes. Iată detaliile:\n\nPlan: Professional\nPerioadă: T1 2026 (1 Ian - 31 Mar)\nSumă: $12.000\nPlată: Procesată prin ACH înregistrat\n\nFactura INV-301 este atașată pentru evidențele tale.\n\nDacă ai întrebări despre abonament sau dorești să explorezi nivelul nostru Enterprise, sunt bucuros să discutăm.\n\nMulțumesc că ești un client valoros!\n\nCu stimă,\nAlex Morgan', status: 'bounced' as const, sentAt: daysAgo(12), openedAt: undefined, clickedAt: undefined, contactId: 'c-011', contactName: 'Nina Kowalski' },
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
      { id: 'tpl-001', name: 'Email de Bun Venit', subject: 'Bun venit la AlpineCRM!', body: 'Bună {{firstName}},\n\nBun venit la AlpineCRM! Suntem încântați să te avem alături de noi.\n\nIată câteva resurse pentru a începe:\n- Ghid de Start Rapid\n- Tutoriale Video\n- Bază de Cunoștințe\n\nCu stimă,\nEchipa AlpineCRM' },
      { id: 'tpl-002', name: 'Urmărire După Demo', subject: 'Ne-a făcut plăcere să te cunoaștem! Pașii următori pentru {{company}}', body: 'Bună {{firstName}},\n\nMulțumesc că ți-ai făcut timp să vezi demo-ul nostru astăzi. Sper că ți-a oferit o imagine clară despre cum AlpineCRM poate ajuta {{company}}.\n\nAșa cum am discutat, iată pașii următori:\n1. [Pasul următor 1]\n2. [Pasul următor 2]\n3. [Pasul următor 3]\n\nVoi reveni cu detalii până la {{followUpDate}}. Între timp, nu ezita să ne contactezi cu orice întrebări.\n\nCu stimă,\nAlex Morgan' },
      { id: 'tpl-003', name: 'Reminder Factură', subject: 'Reminder Prietenos: Factura {{invoiceNumber}} Scadentă', body: 'Bună {{firstName}},\n\nAcesta este un reminder prietenos că factura {{invoiceNumber}} în valoare de {{amount}} este scadentă pe {{dueDate}}.\n\nPoți vizualiza și plăti factura prin portalul de client sau prin transfer bancar folosind detaliile de pe factură.\n\nDacă ai trimis deja plata, te rugăm să ignori acest mesaj.\n\nMulțumesc,\nAlex Morgan' },
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
        { id: 'notif-001', type: 'deal_update', title: 'Tranzacție mutată la Negociere', message: 'Acord Licență Enterprise cu Quantum Labs a fost mutat în etapa de negociere.', read: false, createdAt: hoursAgo(1), link: '/deals' },
        { id: 'notif-002', type: 'task_due', title: 'Sarcină scadentă astăzi', message: 'Urmărire cu Sarah Chen privind propunerea de parteneriat este scadentă astăzi.', read: false, createdAt: hoursAgo(3), link: '/tasks' },
        { id: 'notif-003', type: 'ticket_assigned', title: 'Tichet nou atribuit ție', message: 'Tichetul TK-089: Nu se pot exporta rapoartele din panou în PDF ți-a fost atribuit.', read: false, createdAt: hoursAgo(5), link: '/tickets' },
        { id: 'notif-004', type: 'invoice_paid', title: 'Factură plătită', message: 'Factura INV-311 în valoare de $62.500 de la Quantum Labs a fost marcată ca plătită.', read: true, createdAt: hoursAgo(10), link: '/invoices' },
        { id: 'notif-005', type: 'contact_created', title: 'Contact nou adăugat', message: 'Olivia Grant de la Luminary Design a fost adăugată la contactele tale.', read: true, createdAt: daysAgo(1), link: '/contacts' },
        { id: 'notif-006', type: 'deal_won', title: 'Tranzacție câștigată!', message: 'Felicitări! Licență Platformă EdTech cu BrightPath a fost închisă pentru $38.000.', read: true, createdAt: daysAgo(2), link: '/deals' },
        { id: 'notif-007', type: 'task_overdue', title: 'Alertă sarcină întârziată', message: 'Actualizare date CRM pentru Orbit Solutions este întârziată cu 1 zi.', read: false, createdAt: daysAgo(1), link: '/tasks' },
        { id: 'notif-008', type: 'email_opened', title: 'Email deschis', message: 'Sarah Chen a deschis emailul tău: Propunere Parteneriat - AlpineCRM x TechVault.', read: true, createdAt: daysAgo(1), link: '/emails' },
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
// ---------------------------------------------------------------------------
// 13. AI Chat
// ---------------------------------------------------------------------------

function getMockAIChatResponse(body?: string): any {
  let userMessage = '';
  try {
    const parsed = JSON.parse(body || '{}');
    userMessage = (parsed.message || '').toLowerCase();
  } catch { /* ignore */ }

  if (/tranzac|deal|pipeline|vânz|vanz/.test(userMessage)) {
    const deals = getDeals().data.deals.filter(d => d.status === 'open');
    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    return {
      data: {
        content: `### Tranzacții Active\n\nAveți **${deals.length}** tranzacții deschise în pipeline.\n\n| Tranzacție | Companie | Valoare | Etapă |\n|---|---|---|---|\n${deals.slice(0, 7).map(d => `| ${d.name} | ${d.company} | $${d.value.toLocaleString()} | ${d.stage.replace('_', ' ')} |`).join('\n')}\n\n**Valoare totală pipeline:** $${totalValue.toLocaleString()}\n\nDoriți detalii despre o tranzacție anume?`,
        sources: deals.slice(0, 5).map(d => ({ type: 'deal', id: d.id, label: d.name })),
      },
    };
  }

  if (/contact|client|persoana|persoană|compan/.test(userMessage)) {
    const contacts = getContacts().data.contacts.filter(c => c.status === 'active');
    return {
      data: {
        content: `### Contacte Principale\n\nAveți **${contacts.length}** contacte active.\n\n| Nume | Companie | Email | Scor Lead |\n|---|---|---|---|\n${contacts.slice(0, 8).map(c => `| ${c.firstName} ${c.lastName} | ${c.company} | ${c.email} | ${c.leadScore} |`).join('\n')}\n\n**Top contacte după scor:** ${contacts.sort((a, b) => b.leadScore - a.leadScore).slice(0, 3).map(c => `${c.firstName} ${c.lastName} (${c.leadScore})`).join(', ')}`,
        sources: contacts.slice(0, 5).map(c => ({ type: 'contact', id: c.id, label: `${c.firstName} ${c.lastName}` })),
      },
    };
  }

  if (/sarcin|task|restant|overdue|todo/.test(userMessage)) {
    const tasks = getTasks().data.tasks;
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    return {
      data: {
        content: `### Sarcini\n\n- **${pending.length}** sarcini în așteptare\n- **${inProgress.length}** sarcini în progres\n\n**Sarcini prioritare:**\n${tasks.filter(t => t.status !== 'completed' && (t.priority === 'high' || t.priority === 'urgent')).slice(0, 5).map(t => `- **[${t.priority.toUpperCase()}]** ${t.title}`).join('\n')}\n\nDoriți să vedeți detalii despre o sarcină specifică?`,
        sources: pending.slice(0, 3).map(t => ({ type: 'task', id: t.id, label: t.title })),
      },
    };
  }

  if (/tichet|ticket|suport|problem/.test(userMessage)) {
    const tickets = getTickets().data.tickets;
    const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
    return {
      data: {
        content: `### Tichete de Suport\n\nAveți **${open.length}** tichete deschise.\n\n${open.slice(0, 5).map(t => `- **${t.ticketNumber}** - ${t.subject} *(${t.priority})*`).join('\n')}\n\nDoriți detalii despre un tichet anume?`,
        sources: open.slice(0, 3).map(t => ({ type: 'ticket', id: t.id, label: t.ticketNumber })),
      },
    };
  }

  if (/factur|invoice|plat|plată/.test(userMessage)) {
    const invoices = getInvoices().data.invoices;
    const overdue = invoices.filter(i => i.status === 'overdue');
    const sent = invoices.filter(i => i.status === 'sent');
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    return {
      data: {
        content: `### Facturi\n\n- **${overdue.length}** facturi restante\n- **${sent.length}** facturi trimise (în așteptare)\n- **$${totalPaid.toLocaleString()}** încasați total\n\n${overdue.length > 0 ? `**Facturi restante:**\n${overdue.map(i => `- **${i.invoiceNumber}** - ${i.contactName} - $${i.amount.toLocaleString()}`).join('\n')}` : 'Nu aveți facturi restante!'}\n\nDoriți detalii despre o factură anume?`,
        sources: [...overdue, ...sent].slice(0, 3).map(i => ({ type: 'invoice', id: i.id, label: i.invoiceNumber })),
      },
    };
  }

  if (/statistic|rezumat|raport|dashboard|venituri|revenue/.test(userMessage)) {
    const stats = getDashboardStats().data;
    return {
      data: {
        content: `### Rezumat General CRM\n\n| Metric | Valoare |\n|---|---|\n| Contacte active | **${stats.contacts.active}** din ${stats.contacts.total} |\n| Tranzacții deschise | **${stats.deals.open}** |\n| Valoare pipeline | **$${stats.deals.pipelineValue.toLocaleString()}** |\n| Tranzacții câștigate | **${stats.deals.won}** (rata: ${stats.deals.winRate}%) |\n| Venituri totale | **$${stats.invoices.totalRevenue.toLocaleString()}** |\n| Sarcini restante | **${stats.tasks.overdue}** din ${stats.tasks.pending} în așteptare |\n| Tichete deschise | **${stats.tickets.open}** |\n\nDoriți detalii despre o categorie specifică?`,
        sources: [],
      },
    };
  }

  if (/bună|salut|hello|ajut|ajută|help|ce poți/.test(userMessage)) {
    return {
      data: {
        content: `Bună! Sunt asistentul tău AI AlpineCRM. Pot să te ajut cu:\n\n- **Tranzacții** — "Care sunt tranzacțiile active?"\n- **Contacte** — "Arată-mi contactele principale"\n- **Sarcini** — "Ce sarcini am restante?"\n- **Tichete** — "Tichete de suport deschise"\n- **Facturi** — "Facturi neplătite"\n- **Statistici** — "Rezumat general CRM"\n\nÎntreabă-mă orice despre datele tale CRM!`,
        sources: [],
      },
    };
  }

  // Default
  return {
    data: {
      content: `Am înțeles întrebarea ta. Pot să te ajut cu informații despre:\n\n- **Contacte** — căutare și detalii clienți\n- **Tranzacții** — status pipeline și valori\n- **Sarcini** — sarcini restante și prioritare\n- **Tichete** — tichete de suport deschise\n- **Facturi** — status plăți\n- **Statistici** — rezumat general CRM\n\nÎncearcă să mă întrebi ceva mai specific!`,
      sources: [],
    },
  };
}

export function getMockResponse(url: string, method?: string, body?: string): any {
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
  if (cleanUrl === '/contacts' && httpMethod === 'POST') return { data: { id: uuid(1), message: 'Contact creat (mod demo)' } };
  if (cleanUrl.match(/^\/contacts\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Contact actualizat (mod demo)' } };
  if (cleanUrl.match(/^\/contacts\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Contact șters (mod demo)' } };

  // --- Deals ---
  if (cleanUrl === '/deals' && httpMethod === 'GET') return getDeals();
  if (cleanUrl === '/deals/kanban' && httpMethod === 'GET') return getDealsKanban();
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const deal = getDeals().data.deals.find((d) => d.id === id);
    return deal ? { data: deal } : { data: null };
  }
  if (cleanUrl === '/deals' && httpMethod === 'POST') return { data: { id: uuid(2), message: 'Tranzacție creată (mod demo)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && (httpMethod === 'PUT' || httpMethod === 'PATCH')) return { data: { message: 'Tranzacție actualizată (mod demo)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+\/stage$/) && httpMethod === 'PATCH') return { data: { message: 'Etapă tranzacție actualizată (mod demo)' } };
  if (cleanUrl.match(/^\/deals\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Tranzacție ștearsă (mod demo)' } };

  // --- Tasks ---
  if (cleanUrl === '/tasks' && httpMethod === 'GET') return getTasks();
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const task = getTasks().data.tasks.find((t) => t.id === id);
    return task ? { data: task } : { data: null };
  }
  if (cleanUrl === '/tasks' && httpMethod === 'POST') return { data: { id: uuid(3), message: 'Sarcină creată (mod demo)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && (httpMethod === 'PUT' || httpMethod === 'PATCH')) return { data: { message: 'Sarcină actualizată (mod demo)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+\/complete$/) && httpMethod === 'PATCH') return { data: { message: 'Sarcină finalizată (mod demo)' } };
  if (cleanUrl.match(/^\/tasks\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Sarcină ștearsă (mod demo)' } };

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
            { id: 'cmt-001', content: 'Investigăm problema exportului PDF. Constatările inițiale sugerează un timeout în pipeline-ul de randare grafice la lucrul cu seturi mari de date.', isInternal: true, createdAt: hoursAgo(3), author: { id: 'demo-user-1', firstName: 'Alex', lastName: 'Morgan' } },
            { id: 'cmt-002', content: 'Mulțumesc că vă ocupați de aceasta. Se întâmplă constant cu raportul nostru lunar de venituri care are 12 widget-uri de grafice. Rapoartele cu mai puține grafice par să funcționeze bine.', isInternal: false, createdAt: hoursAgo(2), author: { id: 'c-001', firstName: 'Sarah', lastName: 'Chen' } },
            { id: 'cmt-003', content: 'Confirmat - problema este legată de conversiile concurente SVG-la-canvas. Lucrez la o remediere pentru a serializa coada de randare. Termen estimat: sfârșitul zilei de mâine.', isInternal: true, createdAt: hoursAgo(1), author: { id: 'demo-user-1', firstName: 'Alex', lastName: 'Morgan' } },
          ],
        },
      };
    }
    return { data: null };
  }
  if (cleanUrl === '/tickets' && httpMethod === 'POST') return { data: { id: uuid(4), ticketNumber: 'TK-090', message: 'Tichet creat (mod demo)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Tichet actualizat (mod demo)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Tichet șters (mod demo)' } };
  if (cleanUrl.match(/^\/tickets\/[^/]+\/comments$/) && httpMethod === 'POST') return { data: { id: uuid(5), message: 'Comentariu adăugat (mod demo)' } };

  // --- Appointments ---
  if (cleanUrl === '/appointments' && httpMethod === 'GET') return getAppointments();
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const appointment = getAppointments().data.appointments.find((a) => a.id === id);
    return appointment ? { data: appointment } : { data: null };
  }
  if (cleanUrl === '/appointments' && httpMethod === 'POST') return { data: { id: uuid(6), message: 'Programare creată (mod demo)' } };
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Programare actualizată (mod demo)' } };
  if (cleanUrl.match(/^\/appointments\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Programare ștearsă (mod demo)' } };

  // --- Invoices ---
  if (cleanUrl === '/invoices' && httpMethod === 'GET') return getInvoices();
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const invoice = getInvoices().data.invoices.find((i) => i.id === id);
    return invoice ? { data: invoice } : { data: null };
  }
  if (cleanUrl === '/invoices' && httpMethod === 'POST') return { data: { id: uuid(7), invoiceNumber: 'INV-313', message: 'Factură creată (mod demo)' } };
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'PUT') return { data: { message: 'Factură actualizată (mod demo)' } };
  if (cleanUrl.match(/^\/invoices\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Factură ștearsă (mod demo)' } };

  // --- Emails ---
  if (cleanUrl === '/emails' && httpMethod === 'GET') return getEmails();
  if (cleanUrl === '/emails/templates' && httpMethod === 'GET') return getEmailTemplates();
  if (cleanUrl === '/emails/send' && httpMethod === 'POST') return { data: { id: uuid(8), message: 'Email trimis (mod demo)' } };
  if (cleanUrl.match(/^\/emails\/[^/]+$/) && httpMethod === 'GET') {
    const id = cleanUrl.split('/').pop();
    const email = getEmails().data.emails.find((e) => e.id === id);
    return email ? { data: email } : { data: null };
  }
  if (cleanUrl.match(/^\/emails\/[^/]+$/) && httpMethod === 'DELETE') return { data: { message: 'Email șters (mod demo)' } };

  // --- Notifications ---
  if (cleanUrl === '/notifications') return getNotifications();
  if (cleanUrl === '/notifications/unread-count') return getUnreadCount();
  if (cleanUrl.match(/^\/notifications\/[^/]+\/read$/) && httpMethod === 'PATCH') return { data: { message: 'Marcat ca citit (mod demo)' } };
  if (cleanUrl === '/notifications/read-all' && httpMethod === 'PATCH') return { data: { message: 'Toate marcate ca citite (mod demo)' } };

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
    if (httpMethod === 'PUT' || httpMethod === 'PATCH') return { data: { message: 'Setări actualizate (mod demo)' } };
  }

  // --- AI Chat ---
  if (cleanUrl === '/ai/chat' && httpMethod === 'POST') return getMockAIChatResponse(body);

  // No match - return null so callers can fall through to real API
  return null;
}
