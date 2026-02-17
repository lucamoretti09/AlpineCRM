import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  message: string;
  provider: string;
  model: string;
  context: string[];
}

interface CrmContext {
  contacts?: any[];
  deals?: any[];
  tasks?: any[];
  tickets?: any[];
  invoices?: any[];
  stats?: {
    totalContacts: number;
    totalDeals: number;
    totalTasks: number;
    totalTickets: number;
    totalInvoices: number;
    openDeals: number;
    pendingTasks: number;
    openTickets: number;
    overdueInvoices: number;
  };
}

export class AiService {
  private provider: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.provider = process.env.AI_PROVIDER || (this.apiKey ? 'openai' : 'mock');
    this.model = process.env.AI_MODEL || this.getDefaultModel();
  }

  /**
   * Get default model based on provider
   */
  private getDefaultModel(): string {
    switch (this.provider) {
      case 'openai':
        return 'gpt-4o';
      case 'anthropic':
        return 'claude-sonnet-4-20250514';
      default:
        return 'mock';
    }
  }

  /**
   * Chat with the AI assistant
   */
  async chat(
    message: string,
    conversationHistory: ConversationMessage[],
    userId?: string
  ): Promise<AiChatResponse> {
    // Analyze the message for CRM-relevant keywords
    const crmContext = await this.gatherCrmContext(message);

    // Build the system prompt with CRM context
    const systemPrompt = this.buildSystemPrompt(crmContext);

    // Route to the appropriate provider
    let responseMessage: string;

    switch (this.provider) {
      case 'openai':
        responseMessage = await this.callOpenAI(systemPrompt, message, conversationHistory);
        break;
      case 'anthropic':
        responseMessage = await this.callAnthropic(systemPrompt, message, conversationHistory);
        break;
      default:
        responseMessage = await this.mockResponse(message, crmContext);
        break;
    }

    return {
      message: responseMessage,
      provider: this.provider,
      model: this.model,
      context: Object.keys(crmContext).filter(
        (key) => crmContext[key as keyof CrmContext] !== undefined
      ),
    };
  }

  /**
   * Analyze user message and gather relevant CRM data in parallel
   */
  private async gatherCrmContext(message: string): Promise<CrmContext> {
    const lowerMessage = message.toLowerCase();
    const context: CrmContext = {};

    // Determine which data to fetch based on keywords
    const needsContacts = /contact|client|persoana|compan/i.test(lowerMessage);
    const needsDeals = /deal|tranzac|pipeline|vânza|vanza/i.test(lowerMessage);
    const needsTasks = /task|sarcin|restant/i.test(lowerMessage);
    const needsTickets = /ticket|tichet|suport/i.test(lowerMessage);
    const needsInvoices = /factur|invoice|plat/i.test(lowerMessage);
    const needsStats = /statistic|rezumat|dashboard|sumar|overview/i.test(lowerMessage);

    // Build parallel queries
    const queries: Promise<void>[] = [];

    if (needsContacts) {
      queries.push(
        prisma.contact
          .findMany({
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
              status: true,
              leadScore: true,
              tags: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
          .then((contacts) => {
            context.contacts = contacts;
          })
      );
    }

    if (needsDeals) {
      queries.push(
        prisma.deal
          .findMany({
            select: {
              id: true,
              name: true,
              company: true,
              value: true,
              stage: true,
              probability: true,
              status: true,
              expectedCloseDate: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
          .then((deals) => {
            context.deals = deals;
          })
      );
    }

    if (needsTasks) {
      queries.push(
        prisma.task
          .findMany({
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              createdAt: true,
            },
            orderBy: { dueDate: 'asc' },
            take: 10,
          })
          .then((tasks) => {
            context.tasks = tasks;
          })
      );
    }

    if (needsTickets) {
      queries.push(
        prisma.ticket
          .findMany({
            select: {
              id: true,
              ticketNumber: true,
              subject: true,
              status: true,
              priority: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
          .then((tickets) => {
            context.tickets = tickets;
          })
      );
    }

    if (needsInvoices) {
      queries.push(
        prisma.invoice
          .findMany({
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              status: true,
              dueDate: true,
              issueDate: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
          .then((invoices) => {
            context.invoices = invoices;
          })
      );
    }

    if (needsStats) {
      queries.push(
        Promise.all([
          prisma.contact.count(),
          prisma.deal.count(),
          prisma.task.count(),
          prisma.ticket.count(),
          prisma.invoice.count(),
          prisma.deal.count({ where: { status: 'open' } }),
          prisma.task.count({ where: { status: { in: ['pending', 'in_progress'] } } }),
          prisma.ticket.count({ where: { status: { in: ['open', 'pending', 'in_progress'] } } }),
          prisma.invoice.count({ where: { status: 'overdue' } }),
        ]).then(
          ([
            totalContacts,
            totalDeals,
            totalTasks,
            totalTickets,
            totalInvoices,
            openDeals,
            pendingTasks,
            openTickets,
            overdueInvoices,
          ]) => {
            context.stats = {
              totalContacts,
              totalDeals,
              totalTasks,
              totalTickets,
              totalInvoices,
              openDeals,
              pendingTasks,
              openTickets,
              overdueInvoices,
            };
          }
        )
      );
    }

    // Execute all queries in parallel
    await Promise.all(queries);

    return context;
  }

  /**
   * Build a Romanian system prompt with CRM context
   */
  private buildSystemPrompt(context: CrmContext): string {
    let prompt = `Ești un asistent AI pentru AlpineCRM, un sistem de management al relațiilor cu clienții.
Răspunzi în limba română, într-un mod profesional și concis.
Folosești formatarea Markdown pentru a structura răspunsurile (tabele, liste, bold etc.).
Ajuți utilizatorii să înțeleagă datele din CRM și să ia decizii informate.

`;

    if (context.contacts && context.contacts.length > 0) {
      prompt += `\n### Contacte recente din CRM:\n`;
      prompt += `| Nume | Email | Companie | Status | Scor Lead |\n`;
      prompt += `|------|-------|----------|--------|----------|\n`;
      for (const c of context.contacts) {
        prompt += `| ${c.firstName} ${c.lastName} | ${c.email || '-'} | ${c.company || '-'} | ${c.status} | ${c.leadScore} |\n`;
      }
    }

    if (context.deals && context.deals.length > 0) {
      prompt += `\n### Tranzacții recente din CRM:\n`;
      prompt += `| Nume | Companie | Valoare | Etapă | Probabilitate | Status |\n`;
      prompt += `|------|----------|---------|-------|---------------|--------|\n`;
      for (const d of context.deals) {
        prompt += `| ${d.name} | ${d.company || '-'} | ${d.value} | ${d.stage} | ${d.probability}% | ${d.status} |\n`;
      }
    }

    if (context.tasks && context.tasks.length > 0) {
      prompt += `\n### Sarcini din CRM:\n`;
      prompt += `| Titlu | Status | Prioritate | Termen limită |\n`;
      prompt += `|-------|--------|------------|---------------|\n`;
      for (const t of context.tasks) {
        const dueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('ro-RO') : '-';
        prompt += `| ${t.title} | ${t.status} | ${t.priority} | ${dueDate} |\n`;
      }
    }

    if (context.tickets && context.tickets.length > 0) {
      prompt += `\n### Tichete suport din CRM:\n`;
      prompt += `| Nr. Tichet | Subiect | Status | Prioritate |\n`;
      prompt += `|------------|---------|--------|------------|\n`;
      for (const tk of context.tickets) {
        prompt += `| ${tk.ticketNumber} | ${tk.subject} | ${tk.status} | ${tk.priority} |\n`;
      }
    }

    if (context.invoices && context.invoices.length > 0) {
      prompt += `\n### Facturi din CRM:\n`;
      prompt += `| Nr. Factură | Suma | Status | Termen |\n`;
      prompt += `|-------------|------|--------|--------|\n`;
      for (const inv of context.invoices) {
        const dueDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ro-RO') : '-';
        prompt += `| ${inv.invoiceNumber} | ${inv.total} | ${inv.status} | ${dueDate} |\n`;
      }
    }

    if (context.stats) {
      prompt += `\n### Statistici generale CRM:\n`;
      prompt += `- **Total contacte:** ${context.stats.totalContacts}\n`;
      prompt += `- **Total tranzacții:** ${context.stats.totalDeals} (deschise: ${context.stats.openDeals})\n`;
      prompt += `- **Total sarcini:** ${context.stats.totalTasks} (în așteptare: ${context.stats.pendingTasks})\n`;
      prompt += `- **Total tichete:** ${context.stats.totalTickets} (deschise: ${context.stats.openTickets})\n`;
      prompt += `- **Total facturi:** ${context.stats.totalInvoices} (restante: ${context.stats.overdueInvoices})\n`;
    }

    return prompt;
  }

  /**
   * Generate a mock response using keyword matching and actual Prisma data
   */
  private async mockResponse(message: string, context: CrmContext): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Contacts
    if (/contact|client|persoana|compan/i.test(lowerMessage)) {
      if (context.contacts && context.contacts.length > 0) {
        let response = `## Contacte din CRM\n\nAm găsit **${context.contacts.length}** contacte recente:\n\n`;
        response += `| Nume | Email | Companie | Status | Scor Lead |\n`;
        response += `|------|-------|----------|--------|----------|\n`;
        for (const c of context.contacts) {
          response += `| ${c.firstName} ${c.lastName} | ${c.email || '-'} | ${c.company || '-'} | ${c.status} | ${c.leadScore} |\n`;
        }
        return response;
      }
      return `Nu am găsit contacte în baza de date. Puteți adăuga contacte noi din secțiunea **Contacte**.`;
    }

    // Deals
    if (/deal|tranzac|pipeline|vânza|vanza/i.test(lowerMessage)) {
      if (context.deals && context.deals.length > 0) {
        let response = `## Tranzacții din Pipeline\n\nAm găsit **${context.deals.length}** tranzacții recente:\n\n`;
        response += `| Nume | Companie | Valoare | Etapă | Probabilitate | Status |\n`;
        response += `|------|----------|---------|-------|---------------|--------|\n`;
        for (const d of context.deals) {
          response += `| ${d.name} | ${d.company || '-'} | ${d.value} | ${d.stage} | ${d.probability}% | ${d.status} |\n`;
        }
        return response;
      }
      return `Nu am găsit tranzacții în pipeline. Puteți adăuga tranzacții noi din secțiunea **Pipeline**.`;
    }

    // Tasks
    if (/task|sarcin|restant/i.test(lowerMessage)) {
      if (context.tasks && context.tasks.length > 0) {
        let response = `## Sarcini\n\nAm găsit **${context.tasks.length}** sarcini:\n\n`;
        response += `| Titlu | Status | Prioritate | Termen limită |\n`;
        response += `|-------|--------|------------|---------------|\n`;
        for (const t of context.tasks) {
          const dueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('ro-RO') : '-';
          response += `| ${t.title} | ${t.status} | ${t.priority} | ${dueDate} |\n`;
        }
        return response;
      }
      return `Nu am găsit sarcini. Puteți crea sarcini noi din secțiunea **Sarcini**.`;
    }

    // Tickets
    if (/ticket|tichet|suport/i.test(lowerMessage)) {
      if (context.tickets && context.tickets.length > 0) {
        let response = `## Tichete Suport\n\nAm găsit **${context.tickets.length}** tichete:\n\n`;
        response += `| Nr. Tichet | Subiect | Status | Prioritate |\n`;
        response += `|------------|---------|--------|------------|\n`;
        for (const tk of context.tickets) {
          response += `| ${tk.ticketNumber} | ${tk.subject} | ${tk.status} | ${tk.priority} |\n`;
        }
        return response;
      }
      return `Nu am găsit tichete de suport. Puteți crea tichete noi din secțiunea **Suport**.`;
    }

    // Invoices
    if (/factur|invoice|plat/i.test(lowerMessage)) {
      if (context.invoices && context.invoices.length > 0) {
        let response = `## Facturi\n\nAm găsit **${context.invoices.length}** facturi:\n\n`;
        response += `| Nr. Factură | Suma | Status | Termen |\n`;
        response += `|-------------|------|--------|--------|\n`;
        for (const inv of context.invoices) {
          const dueDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ro-RO') : '-';
          response += `| ${inv.invoiceNumber} | ${inv.total} | ${inv.status} | ${dueDate} |\n`;
        }
        return response;
      }
      return `Nu am găsit facturi. Puteți crea facturi noi din secțiunea **Facturi**.`;
    }

    // Stats / Dashboard
    if (/statistic|rezumat|dashboard|sumar|overview/i.test(lowerMessage)) {
      if (context.stats) {
        let response = `## Rezumat CRM\n\nIată o imagine de ansamblu a datelor din sistem:\n\n`;
        response += `- **Contacte:** ${context.stats.totalContacts}\n`;
        response += `- **Tranzacții:** ${context.stats.totalDeals} (deschise: ${context.stats.openDeals})\n`;
        response += `- **Sarcini:** ${context.stats.totalTasks} (în așteptare: ${context.stats.pendingTasks})\n`;
        response += `- **Tichete:** ${context.stats.totalTickets} (deschise: ${context.stats.openTickets})\n`;
        response += `- **Facturi:** ${context.stats.totalInvoices} (restante: ${context.stats.overdueInvoices})\n`;
        return response;
      }
      return `Nu am putut genera statistici. Vă rugăm să încercați din nou.`;
    }

    // Default response
    return `Bună! Sunt asistentul AI al AlpineCRM. Te pot ajuta cu informații despre:\n\n` +
      `- **Contacte** - informații despre clienți și persoane de contact\n` +
      `- **Tranzacții** - pipeline de vânzări și dealuri\n` +
      `- **Sarcini** - taskuri și activități restante\n` +
      `- **Tichete** - suport clienți și tichete deschise\n` +
      `- **Facturi** - facturi și plăți\n` +
      `- **Statistici** - rezumat general al datelor din CRM\n\n` +
      `Ce informații dorești?`;
  }

  /**
   * Call OpenAI API using native fetch
   */
  private async callOpenAI(
    systemPrompt: string,
    message: string,
    conversationHistory: ConversationMessage[]
  ): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Nu am putut genera un răspuns.';
  }

  /**
   * Call Anthropic API using native fetch
   */
  private async callAnthropic(
    systemPrompt: string,
    message: string,
    conversationHistory: ConversationMessage[]
  ): Promise<string> {
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Nu am putut genera un răspuns.';
  }
}

export default new AiService();
