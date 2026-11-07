/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KIMS Livestock - Express Full-Stack Server
 * Mounts Vite dev middleware in dev, serves static build in prod.
 * REST API for tbl_livestock, audit trail, and member placeholder reference.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database for backend
let dbLivestock = [
  {
    livestock_id: 'LS-2026-001',
    animal_type: 'Carabao (Draft)',
    quantity: 1,
    tag_id: 'TAG-CRB-081',
    member_id: 'KMB-2026-0001',
    distribution_date: '2026-01-15',
    health_status: 'Healthy & Fully Vaccinated',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-002',
    animal_type: 'Native Cattle Cow',
    quantity: 2,
    tag_id: 'TAG-COW-104',
    member_id: 'KMB-2026-0002',
    distribution_date: '2026-02-10',
    health_status: 'Healthy - Recent Deworming',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-003',
    animal_type: 'Boer Cross Goat',
    quantity: 5,
    tag_id: 'TAG-GT-201',
    member_id: 'KMB-2026-0003',
    distribution_date: '2026-02-28',
    health_status: 'Good Condition - Grazing Well',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-004',
    animal_type: 'Native Breeder Sow',
    quantity: 2,
    tag_id: 'TAG-SW-032',
    member_id: null,
    distribution_date: null,
    health_status: 'Quarantined - Observation Period',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-005',
    animal_type: 'Brahman Bull',
    quantity: 1,
    tag_id: 'TAG-BLL-009',
    member_id: null,
    distribution_date: null,
    health_status: 'Healthy - Available for Dispersal',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-006',
    animal_type: 'Anglo-Nubian Dairy Goat',
    quantity: 3,
    tag_id: 'TAG-GT-214',
    member_id: 'KMB-2026-0001',
    distribution_date: '2026-03-05',
    health_status: 'Lactating - Regular Veterinary Checkup',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-007',
    animal_type: 'Carabao (Heifer)',
    quantity: 1,
    tag_id: 'TAG-CRB-092',
    member_id: 'KMB-2026-0004',
    distribution_date: '2026-03-12',
    health_status: 'Healthy - Hoof Trimmed',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-008',
    animal_type: 'Native Pig Breeder Trio',
    quantity: 4,
    tag_id: 'TAG-SW-055',
    member_id: null,
    distribution_date: null,
    health_status: 'Pending Veterinary Clearance',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-009',
    animal_type: 'Friesian Dairy Cow',
    quantity: 1,
    tag_id: 'TAG-COW-112',
    member_id: 'KMB-2026-0005',
    distribution_date: '2026-03-20',
    health_status: 'Under Treatment for Mild Mastitis',
    is_sample: true,
  },
  {
    livestock_id: 'LS-2026-010',
    animal_type: 'Upgraded Boer Buck',
    quantity: 1,
    tag_id: 'TAG-GT-305',
    member_id: null,
    distribution_date: null,
    health_status: 'Active & Sound Breeder',
    is_sample: true,
  },
];

const dbMembersPlaceholder = [
  { member_id: 'KMB-2026-0001', full_name: 'Juan Dela Cruz', barangay: 'Carmundo, Bongabong' },
  { member_id: 'KMB-2026-0002', full_name: 'Elena Ramos Malabanan', barangay: 'Carmundo, Bongabong' },
  { member_id: 'KMB-2026-0003', full_name: 'Rolando "Ka Roly" Garcia', barangay: 'Carmundo, Bongabong' },
  { member_id: 'KMB-2026-0004', full_name: 'Corazon "Nanay Cora" Bautista', barangay: 'Carmundo, Bongabong' },
  { member_id: 'KMB-2026-0005', full_name: 'Nestor Mendoza Jr.', barangay: 'Carmundo, Bongabong' },
];

let dbAuditLogs = [
  {
    id: 'aud-001',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Assigned livestock LS-2026-009 (Friesian Dairy Cow) to member KMB-2026-0005',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-20 10:15:22',
  },
  {
    id: 'aud-002',
    user: 'Mario V. Macalalad (President)',
    role: 'President',
    action_taken: 'Created livestock record LS-2026-010 (Upgraded Boer Buck, Tag: TAG-GT-305, Qty: 1)',
    ip_address: '192.168.1.105',
    timestamp: '2026-03-22 08:00:14',
  },
];

// Helper to extract user & role from headers
function getCallerContext(req: Request) {
  const role = (req.headers['x-user-role'] as string) || 'President';
  const name = (req.headers['x-user-name'] as string) || 'Mario V. Macalalad';
  const member_id = (req.headers['x-member-id'] as string) || null;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  return { role, name, member_id, ip };
}

function recordServerAudit(userStr: string, role: string, action: string, ip: string) {
  dbAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    user: userStr,
    role,
    action_taken: action,
    ip_address: ip,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  });
}

// REST ENDPOINTS

// 1. List Livestock
app.get('/api/livestock', (req: Request, res: Response) => {
  const { role } = getCallerContext(req);
  if (role === 'Member') {
    return res.status(403).json({ error: 'Access denied: Members cannot view the central livestock registry.' });
  }
  res.json(dbLivestock);
});

// 2. Get Livestock By ID
app.get('/api/livestock/:id', (req: Request, res: Response) => {
  const { role, member_id } = getCallerContext(req);
  const found = dbLivestock.find((l) => l.livestock_id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Livestock record not found' });
  }
  if (role === 'Member' && found.member_id !== member_id) {
    return res.status(403).json({ error: 'Access denied: You can only view your own assigned livestock.' });
  }
  res.json(found);
});

// 3. Create Livestock (President only)
app.post('/api/livestock', (req: Request, res: Response) => {
  const { role, name, ip } = getCallerContext(req);
  if (role !== 'President') {
    return res.status(403).json({ error: 'Access denied: Only the President can register new livestock.' });
  }

  const { animal_type, quantity, tag_id, member_id, distribution_date, health_status } = req.body;
  if (!animal_type || !quantity || !tag_id || !health_status) {
    return res.status(400).json({ error: 'Missing required livestock fields.' });
  }

  const livestock_id = `LS-${new Date().getFullYear()}-${String(dbLivestock.length + 1).padStart(3, '0')}`;
  const newRecord = {
    livestock_id,
    animal_type: animal_type.trim(),
    quantity: Number(quantity),
    tag_id: tag_id.trim(),
    member_id: member_id ? member_id.trim() : null,
    distribution_date: distribution_date ? distribution_date.trim() : null,
    health_status: health_status.trim(),
    is_sample: false,
  };

  dbLivestock.unshift(newRecord);
  recordServerAudit(
    `${name} (${role})`,
    role,
    `Created livestock record ${livestock_id} (${newRecord.animal_type}, Tag: ${newRecord.tag_id})`,
    ip
  );

  res.status(201).json(newRecord);
});

// 4. Update Livestock (President only)
app.put('/api/livestock/:id', (req: Request, res: Response) => {
  const { role, name, ip } = getCallerContext(req);
  if (role !== 'President') {
    return res.status(403).json({ error: 'Access denied: Only the President can modify livestock records.' });
  }

  const index = dbLivestock.findIndex((l) => l.livestock_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Livestock record not found.' });
  }

  const updated = {
    ...dbLivestock[index],
    ...req.body,
    livestock_id: req.params.id, // prevent id tampering
  };

  dbLivestock[index] = updated;
  recordServerAudit(
    `${name} (${role})`,
    role,
    `Updated livestock ${req.params.id}`,
    ip
  );

  res.json(updated);
});

// 5. Assign Livestock (President only)
app.post('/api/livestock/:id/assign', (req: Request, res: Response) => {
  const { role, name, ip } = getCallerContext(req);
  if (role !== 'President') {
    return res.status(403).json({ error: 'Access denied: Only the President can assign livestock.' });
  }

  const { member_id, distribution_date } = req.body;
  if (!member_id || !distribution_date) {
    return res.status(400).json({ error: 'member_id and distribution_date are required.' });
  }

  const index = dbLivestock.findIndex((l) => l.livestock_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Livestock record not found.' });
  }

  dbLivestock[index] = {
    ...dbLivestock[index],
    member_id: member_id.trim(),
    distribution_date: distribution_date.trim(),
  };

  recordServerAudit(
    `${name} (${role})`,
    role,
    `Assigned livestock ${req.params.id} to member ${member_id} on ${distribution_date}`,
    ip
  );

  res.json(dbLivestock[index]);
});

// 6. List by Member ID
app.get('/api/livestock/member/:member_id', (req: Request, res: Response) => {
  const { role, member_id: authMemberId } = getCallerContext(req);
  if (role === 'Member' && authMemberId !== req.params.member_id) {
    return res.status(403).json({ error: 'Access denied: Members can only access their own livestock.' });
  }

  const memberLivestock = dbLivestock.filter((l) => l.member_id === req.params.member_id);
  res.json(memberLivestock);
});

// 7. Summary counts
app.get('/api/livestock/summary', (req: Request, res: Response) => {
  const { role } = getCallerContext(req);
  if (role === 'Member') {
    return res.status(403).json({ error: 'Access denied: Members cannot access management summaries.' });
  }

  const total_records = dbLivestock.length;
  let total_headcount = 0;
  let assigned_count = 0;
  let unassigned_count = 0;
  let assigned_headcount = 0;
  let unassigned_headcount = 0;

  const by_animal_type: Record<string, { count: number; total_quantity: number }> = {};
  const by_health_status: Record<string, number> = {};

  dbLivestock.forEach((l) => {
    const qty = l.quantity || 1;
    total_headcount += qty;
    if (l.member_id) {
      assigned_count += 1;
      assigned_headcount += qty;
    } else {
      unassigned_count += 1;
      unassigned_headcount += qty;
    }

    const t = l.animal_type.trim();
    if (!by_animal_type[t]) {
      by_animal_type[t] = { count: 0, total_quantity: 0 };
    }
    by_animal_type[t].count += 1;
    by_animal_type[t].total_quantity += qty;

    const h = l.health_status.trim();
    by_health_status[h] = (by_health_status[h] || 0) + 1;
  });

  res.json({
    total_headcount,
    total_records,
    assigned_count,
    unassigned_count,
    assigned_headcount,
    unassigned_headcount,
    by_animal_type,
    by_health_status,
  });
});

// 8. Audit logs (President only)
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const { role } = getCallerContext(req);
  if (role !== 'President') {
    return res.status(403).json({ error: 'Access denied: Only the President can view the audit trail.' });
  }
  res.json(dbAuditLogs);
});

// 9. Members Placeholder
app.get('/api/members', (_req: Request, res: Response) => {
  res.json({
    disclaimer: 'Placeholder: will be replaced by the Members module',
    members: dbMembersPlaceholder,
  });
});

// Vite & Static Server initialization
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KIMS Livestock Module server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
