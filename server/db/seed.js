import { dbStore } from './store.js';
import { connectDB } from './connection.js';
import { UserModel, ClientModel, MandateModel, AuditLogModel, RequestModel } from './models.js';
import mongoose from 'mongoose';

// Realistic Indian WealthTech and SEBI Advisory Seeder
export async function runSeed() {
  console.log('[Seed] Initiating realistic platform database seeder...');
  const startTime = Date.now();

  // Ensure DB connection is initialized if MONGODB_URI is configured
  if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Deterministic bcrypt hash for 'Password@123'
  const defaultPasswordHash = '$2a$10$20gor5UMRbxD0N2.5fuZ1OAk5eTmWZCa6Aj2b5AKHVOfVU8SoIwwa';

  // Set seeding flag to prevent individual concurrent inserts
  dbStore.isSeeding = true;

  // Clear existing state before fresh seed
  dbStore.users.clear();
  dbStore.clients.clear();
  dbStore.mandates.clear();
  dbStore.requests.clear();
  dbStore.auditLogs.length = 0;

  // 1. Primary Benchmark Accounts for all roles
  const ria1 = dbStore.createUser({
    id: 'usr_ria_suresh',
    name: 'Suresh Narayanan',
    email: 'ria@example.in',
    passwordHash: defaultPasswordHash,
    role: 'ria',
    firmName: 'Prudent Wealth Advisory',
    sebiRegNumber: 'INA000088921',
    complianceEmail: 'compliance@prudentwealth.in',
    plan: 'free',
  });

  const ria2 = dbStore.createUser({
    id: 'usr_ria_meera',
    name: 'Meera Iyer',
    email: 'pro.ria@example.in',
    passwordHash: defaultPasswordHash,
    role: 'ria',
    firmName: 'Apex Multi-Family Office',
    sebiRegNumber: 'INA000099412',
    complianceEmail: 'audit@apexfo.com',
    plan: 'pro',
  });

  const complianceOfficer = dbStore.createUser({
    id: 'usr_compliance_officer',
    name: 'Vikramaditya Roy',
    email: 'compliance@example.in',
    passwordHash: defaultPasswordHash,
    role: 'compliance_officer',
    firmName: 'Sentinel Compliance Partners',
    sebiRegNumber: 'INA000010999',
    complianceEmail: 'compliance@example.in',
    plan: 'pro',
  });

  const adminUser = dbStore.createUser({
    id: 'usr_admin_neha',
    name: 'Neha Singhania',
    email: 'admin@example.in',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    firmName: 'FinConsent Platform Governance',
    complianceEmail: 'admin@finconsent.in',
    plan: 'pro',
  });

  const clientUser = dbStore.createUser({
    id: 'usr_client_rohan',
    name: 'Rohan Mehta',
    email: 'client@example.in',
    passwordHash: defaultPasswordHash,
    role: 'client',
    firmName: 'Individual Investor',
    plan: 'free',
  });

  // Common Indian names for realistic generation
  const firstNames = [
    'Aarav', 'Aditi', 'Alok', 'Amit', 'Ananya', 'Anil', 'Anirudh', 'Arjun', 'Bhavna', 'Chetan',
    'Deepak', 'Devika', 'Gaurav', 'Harish', 'Ishaan', 'Jitendra', 'Kavita', 'Kiran', 'Madhuri', 'Manoj',
    'Naveen', 'Nidhi', 'Nikhil', 'Pooja', 'Pradeep', 'Prakash', 'Priya', 'Rahul', 'Rajesh', 'Rakesh',
    'Ramesh', 'Rashmi', 'Ritu', 'Rohan', 'Rohit', 'Sandeep', 'Sangeeta', 'Sanjay', 'Santosh', 'Shalini',
    'Shashi', 'Shreya', 'Siddharth', 'Smita', 'Sneha', 'Sunil', 'Sunita', 'Tanvi', 'Tarun', 'Varun',
    'Vidya', 'Vikram', 'Vimal', 'Vinay', 'Vishal', 'Yash', 'Zoya', 'Aditya', 'Abhishek', 'Akshay'
  ];

  const lastNames = [
    'Agarwal', 'Banerjee', 'Bhat', 'Bhattacharya', 'Chauhan', 'Chopra', 'Das', 'Deshmukh', 'Deshpande', 'Dutta',
    'Gupta', 'Iyer', 'Jain', 'Jha', 'Joshi', 'Kapoor', 'Khanna', 'Kulkarni', 'Kumar', 'Mahajan',
    'Malhotra', 'Menon', 'Mishra', 'Mukherjee', 'Nair', 'Nambiar', 'Pandey', 'Patel', 'Patil', 'Pillai',
    'Prasad', 'Rao', 'Reddy', 'Saxena', 'Sen', 'Shah', 'Sharma', 'Shukla', 'Singh', 'Sinha',
    'Srivastava', 'Subramanian', 'Tandon', 'Tiwari', 'Tripathi', 'Varma', 'Verma', 'Yadav'
  ];

  const firmPrefixes = [
    'Samriddhi', 'Artha', 'Dhanvantari', 'Nivesh', 'Shikhar', 'Lakshmi', 'Parampara', 'Vridhi',
    'Kuber', 'Drishti', 'Aequitas', 'Zenith', 'Pratham', 'Sutra', 'Sanctum', 'Vanguard India',
    'Trustline', 'Equirus', 'Pinnacle', 'Fortuna', 'Ananta', 'Sage', 'Veda', 'Kautilya', 'Aura'
  ];

  const firmSuffixes = [
    'Wealth Advisory', 'Family Office', 'Capital Advisers', 'Fiduciary Partners', 'Private Wealth',
    'Investment Counsel', 'Wealth Management', 'Advisory Services', 'Portfolio Managers'
  ];

  // Helper for dates in past N days
  const pastDate = (daysAgo, hourOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hourOffset);
    return d.toISOString();
  };

  // 2. Generate ~1,000 Users
  const totalUsersToGenerate = 995; // + 5 fixed = 1,000 total
  const generatedRias = [ria1, ria2];

  for (let i = 1; i <= totalUsersToGenerate; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@wealthadvisor.in`;

    let role = 'ria';
    if (i > 780 && i <= 890) {
      role = 'compliance_officer';
    } else if (i > 890 && i <= 975) {
      role = 'client';
    } else if (i > 975) {
      role = 'admin';
    }

    const firm = `${firmPrefixes[i % firmPrefixes.length]} ${firmSuffixes[(i * 2) % firmSuffixes.length]}`;
    const regNum = `INA0000${String(10000 + i).padStart(5, '0')}`;
    const plan = i % 3 === 0 ? 'pro' : 'free';
    const createdAt = pastDate(Math.floor((i % 300) + 1));

    const user = dbStore.createUser({
      id: `usr_gen_${i}`,
      name: fullName,
      email,
      passwordHash: defaultPasswordHash,
      role,
      firmName: firm,
      sebiRegNumber: role === 'ria' || role === 'compliance_officer' ? regNum : undefined,
      complianceEmail: `compliance@${firmPrefixes[i % firmPrefixes.length].toLowerCase()}wealth.in`,
      plan,
      createdAt,
    });

    if (role === 'ria') {
      generatedRias.push(user);
    }
  }

  // 3. Generate 200 Clients
  const generatedClients = [];
  const panLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  for (let c = 1; c <= 200; c++) {
    const fn = firstNames[(c * 7) % firstNames.length];
    const ln = lastNames[(c * 5) % lastNames.length];
    const clientName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${c}@gmail.com`;

    // Valid Indian PAN format: 5 letters, 4 digits, 1 letter
    const p1 = panLetters[c % panLetters.length];
    const p2 = panLetters[(c + 3) % panLetters.length];
    const p3 = panLetters[(c + 7) % panLetters.length];
    const p4 = 'P'; // P = Individual
    const p5 = ln[0].toUpperCase();
    const panDigits = String(1000 + (c * 37) % 8999);
    const pChecksum = panLetters[(c * 2) % panLetters.length];
    const pan = `${p1}${p2}${p3}${p4}${p5}${panDigits}${pChecksum}`;

    const mobile = `98${String(10000000 + c * 31415).slice(0, 8)}`;
    const portfolioValue = Math.round((15 + (c % 85) * 1.2) * 100000); // 15L to 1.17 Cr
    const assignedRia = generatedRias[c % Math.min(generatedRias.length, 30)];
    const createdAt = pastDate(Math.floor((c % 180) + 20));

    const client = dbStore.createClient({
      id: `cli_${c}`,
      riaId: assignedRia.id,
      name: clientName,
      pan,
      mobile,
      email,
      portfolioValue,
      createdAt,
    });

    generatedClients.push(client);
  }

  // 4. Generate ~350 Mandates with realistic lifecycle distributions & chronological timestamps
  const statuses = ['draft', 'sent', 'viewed', 'consented', 'expired'];
  const securitiesPool = [
    { name: 'HDFC Bank Ltd', price: 1650, type: 'STCG' },
    { name: 'Reliance Industries Ltd', price: 2950, type: 'LTCG' },
    { name: 'Tata Consultancy Services', price: 4120, type: 'LTCG' },
    { name: 'ICICI Bank Ltd', price: 1220, type: 'STCG' },
    { name: 'Infosys Ltd', price: 1840, type: 'LTCG' },
    { name: 'Bharti Airtel Ltd', price: 1580, type: 'STCG' },
    { name: 'State Bank of India', price: 810, type: 'STCG' },
    { name: 'Larsen & Toubro Ltd', price: 3620, type: 'LTCG' },
    { name: 'Kotak Mahindra Bank', price: 1780, type: 'STCG' },
    { name: 'Axis Bank Ltd', price: 1190, type: 'STCG' },
    { name: 'ITC Ltd', price: 475, type: 'LTCG' },
    { name: 'Hindustan Unilever Ltd', price: 2680, type: 'LTCG' }
  ];

  for (let m = 1; m <= 350; m++) {
    const client = generatedClients[m % generatedClients.length];
    const riaId = client.riaId;
    let status = statuses[m % statuses.length];
    
    // Weight consented heavier for realistic historical archive
    if (m > 150) status = 'consented';

    let daysAgo = 1;
    if (status === 'consented') daysAgo = Math.floor(5 + (m % 320));
    else if (status === 'expired') daysAgo = Math.floor(3 + (m % 60));
    else if (status === 'draft') daysAgo = Math.floor(m % 5);
    else if (status === 'sent') daysAgo = 1;
    else if (status === 'viewed') daysAgo = 0.5;

    const createdAt = pastDate(daysAgo, 4);
    const cutoffTimestamp = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString();

    const sec1 = securitiesPool[m % securitiesPool.length];
    const sec2 = securitiesPool[(m + 3) % securitiesPool.length];

    const stcgGain = (m * 12500) % 300000;
    const ltcgGain = (m * 25000) % 600000;
    const stcgTax = Math.round(stcgGain * 0.20);
    const taxableLtcg = Math.max(0, ltcgGain - 125000);
    const ltcgTax = Math.round(taxableLtcg * 0.125);
    const subtotal = stcgTax + ltcgTax;
    const cess = Math.round(subtotal * 0.04);
    const taxPayable = subtotal + cess;

    const mandate = dbStore.createMandate({
      id: `man_${m}`,
      riaId,
      clientId: client.id,
      title: `Portfolio Rebalance #${m} — ${sec1.name} Realization`,
      currentAllocation: { equity: 75, debt: 15, gold: 5, cash: 5 },
      proposedAllocation: { equity: 60, debt: 25, gold: 10, cash: 5 },
      sellBasket: [
        { securityName: sec1.name, units: 100 + (m * 10) % 500, saleValue: sec1.price * 100, gainType: sec1.type },
        { securityName: sec2.name, units: 50 + (m * 5) % 300, saleValue: sec2.price * 50, gainType: sec2.type },
      ],
      buyBasket: [
        { securityName: 'ICICI Prudential All Seasons Bond', approxValue: 250000 },
        { securityName: 'Sovereign Gold Bond Tranche 2026', approxValue: 150000 },
      ],
      stcgAmount: stcgGain,
      ltcgAmount: ltcgGain,
      stcgTax,
      ltcgTax,
      cessAmount: cess,
      taxPayable,
      advanceTaxQuarter: '4th Installment - Due 15th March',
      advanceTaxAlert: taxPayable > 0 ? `Estimated capital gains tax of ₹${taxPayable.toLocaleString('en-IN')} requires Advance Tax provisioning.` : '',
      cutoffTimestamp,
      status,
      createdAt,
      updatedAt: pastDate(Math.max(0, daysAgo - 1)),
      approvedAt: status === 'consented' ? pastDate(Math.max(0, daysAgo - 1), 2) : undefined,
      consentedAt: status === 'consented' ? pastDate(Math.max(0, daysAgo - 1), 2) : undefined,
      isApproved: status === 'consented',
      isRevoked: status === 'consented',
      magicToken: status === 'consented' ? null : `tok_${m}_${String(Math.random()).slice(2, 10)}`,
    });

    // Append realistic audit events
    dbStore.createAuditLog({
      riaId,
      clientId: client.id,
      mandateId: mandate.id,
      eventType: 'MANDATE_CREATED',
      ipAddress: `103.21.${(m % 100) + 1}.8`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
      channel: 'SYSTEM_API',
      timestamp: createdAt,
      metadata: { action: 'Mandate created by RIA', taxPayable },
    });

    if (status !== 'draft') {
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'MANDATE_DISPATCHED',
        ipAddress: `103.21.${(m % 100) + 1}.8`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
        channel: 'WHATSAPP_EMAIL (SMS Disabled)',
        timestamp: pastDate(daysAgo, 3),
        metadata: { cutoffTimestamp, status },
      });
    }

    if (status === 'viewed' || status === 'consented') {
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'MANDATE_OPENED',
        ipAddress: `49.37.${(m % 200) + 1}.44`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        channel: 'MOBILE_BROWSER',
        timestamp: pastDate(daysAgo, 2),
        metadata: { clientView: '360px Mobile Review Portal' },
      });
    }

    if (status === 'consented') {
      const otpVerId = `otp_ver_${100000 + m}`;
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'OTP_GENERATED',
        ipAddress: `49.37.${(m % 200) + 1}.44`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        channel: 'IN_APP_EMAIL (SMS Disabled by Policy)',
        timestamp: pastDate(daysAgo, 1),
        metadata: { destination: `******${client.mobile.slice(-4)}`, channel: 'In-App Secure Display' },
      });

      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'CONSENT_GRANTED',
        ipAddress: `49.37.${(m % 200) + 1}.44`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        verificationMethod: 'OTP_IN_APP_EMAIL',
        otpVerificationId: otpVerId,
        timestamp: pastDate(daysAgo, 0.5),
        metadata: {
          status: 'Consented & Locked',
          declarationsAcknowledged: [
            'SEBI Regulation 19 Informed Consent',
            `Acknowledged Capital Gains Tax of ₹${taxPayable.toLocaleString('en-IN')}`,
          ],
        },
      });
    }
  }

  // 5. Generate ~50 Advisory Requests in Requests Collection
  const requestCategories = [
    'Portfolio Rebalance Advisory',
    'Statutory Tax Impact Assessment',
    'SEBI Regulation 19 Compliance Review',
    'Asset Reallocation Proposal',
    'Demat Liquidation Mandate'
  ];

  for (let r = 1; r <= 50; r++) {
    const client = generatedClients[(r * 3) % generatedClients.length];
    const category = requestCategories[r % requestCategories.length];
    const status = r % 4 === 0 ? 'completed' : r % 3 === 0 ? 'in_progress' : 'pending';
    const createdAt = pastDate(Math.floor((r % 45) + 1));

    dbStore.createRequest({
      id: `req_${r}`,
      userId: client.riaId,
      clientId: client.id,
      clientName: client.name,
      category,
      title: `${category} for ${client.name}`,
      priority: r % 5 === 0 ? 'urgent' : r % 2 === 0 ? 'high' : 'standard',
      description: `Client requested formal advisory evaluation for FY26-27 statutory portfolio realignment. Realized consideration estimate: ₹${(client.portfolioValue * 0.25).toLocaleString('en-IN')}.`,
      proposedEquityRatio: 60,
      proposedDebtRatio: 30,
      proposedGoldRatio: 10,
      status,
      createdAt,
      responseNotes: status === 'completed' ? 'Advisory rebalance mandate formulated and approved under Regulation 19.' : undefined,
    });
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Seed] In-memory store prepared in ${durationMs}ms:`);
  console.log(`  - Users: ${dbStore.users.size} (RIAs, Compliance Officers, Admins, Clients)`);
  console.log(`  - Clients: ${dbStore.clients.size}`);
  console.log(`  - Mandates: ${dbStore.mandates.size} across Draft, Sent, Viewed, Consented, Expired`);
  console.log(`  - Audit Trail Records: ${dbStore.auditLogs.length} with SHA-256 hash chaining`);
  console.log(`  - Advisory Requests: ${dbStore.requests.size}`);

  // Synchronize documents into live MongoDB Atlas cluster
  if (mongoose.connection.readyState === 1) {
    console.log('[Seed] Synchronizing and inserting documents into live MongoDB Atlas collections...');
    try {
      await Promise.all([
        UserModel.deleteMany({}),
        ClientModel.deleteMany({}),
        MandateModel.deleteMany({}),
        AuditLogModel.deleteMany({}),
        RequestModel.deleteMany({}),
      ]);

      const usersList = Array.from(dbStore.users.values());
      const clientsList = Array.from(dbStore.clients.values());
      const mandatesList = Array.from(dbStore.mandates.values());
      const auditLogsList = dbStore.auditLogs;
      const requestsList = Array.from(dbStore.requests.values());

      await UserModel.insertMany(usersList, { ordered: false });
      await ClientModel.insertMany(clientsList, { ordered: false });
      await MandateModel.insertMany(mandatesList, { ordered: false });
      await AuditLogModel.insertMany(auditLogsList, { ordered: false });
      await RequestModel.insertMany(requestsList, { ordered: false });

      const [mUsers, mClients, mMandates, mAudit, mRequests] = await Promise.all([
        UserModel.countDocuments(),
        ClientModel.countDocuments(),
        MandateModel.countDocuments(),
        AuditLogModel.countDocuments(),
        RequestModel.countDocuments(),
      ]);

      console.log(`[Seed] Live MongoDB Atlas cluster synchronized & verified:`);
      console.log(`  - MongoDB 'users' collection: ${mUsers} documents`);
      console.log(`  - MongoDB 'clients' collection: ${mClients} documents`);
      console.log(`  - MongoDB 'mandates' collection: ${mMandates} documents`);
      console.log(`  - MongoDB 'auditlogs' collection: ${mAudit} documents`);
      console.log(`  - MongoDB 'requests' collection: ${mRequests} documents`);
    } catch (mongoErr) {
      console.error('[Seed] MongoDB Atlas insertion error:', mongoErr.message);
    }
  }

  dbStore.isSeeding = false;

  return {
    ria1,
    ria2,
    complianceOfficer,
    adminUser,
    clientUser,
    totalUsers: dbStore.users.size,
    totalClients: dbStore.clients.size,
    totalMandates: dbStore.mandates.size,
  };
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

