import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecret) {
  console.error('Missing Supabase URL or Secret Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('Seeding Demo / Admin account with rich catalog and suppliers...');

  const demoEmail = 'admin@smartinventory.com';
  const demoPassword = 'AdminPassword123!';
  const businessName = 'Apex Supermarket Pro';

  // 1. Check or create auth user
  const { data: userList } = await supabase.auth.admin.listUsers();
  let user = userList?.users?.find((u) => u.email === demoEmail);

  if (!user) {
    console.log(`Creating user ${demoEmail}...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        business_name: businessName,
        name: 'Apex Admin',
      },
    });
    if (createErr) throw createErr;
    user = newUser.user;
  } else {
    console.log(`User ${demoEmail} already exists. Updating password...`);
    await supabase.auth.admin.updateUserById(user.id, {
      password: demoPassword,
      email_confirm: true,
    });
  }

  // 2. Ensure business exists
  const { data: existingMembers } = await supabase
    .from('business_members')
    .select('business_id, businesses(*)')
    .eq('user_id', user.id);

  let businessId = existingMembers?.[0]?.business_id;

  if (!businessId) {
    const { data: b, error: bErr } = await supabase
      .from('businesses')
      .insert({
        name: businessName,
        currency: 'USD',
        timezone: 'Asia/Phnom_Penh',
      })
      .select()
      .single();
    if (bErr) throw bErr;
    businessId = b.id;

    await supabase.from('business_members').insert({
      business_id: businessId,
      user_id: user.id,
      role: 'owner',
    });
  } else {
    await supabase.from('businesses').update({ name: businessName }).eq('id', businessId);
  }

  console.log(`Business ID for ${businessName}: ${businessId}`);

  // 3. Clear existing items and suppliers for a clean, rich seed
  await supabase.from('stock_movements').delete().eq('business_id', businessId);
  await supabase.from('items').delete().eq('business_id', businessId);
  await supabase.from('suppliers').delete().eq('business_id', businessId);

  // 4. Create 4 Realistic Suppliers
  console.log('Creating suppliers...');
  const suppliersData = [
    {
      name: 'Pacific Beverage Co.',
      contact_name: 'Mark Vance',
      email: 'orders@pacificbev.com',
      phone: '+1-555-0192',
      notes: 'Weekly deliveries every Tuesday. Minimum order $150 for free freight.',
    },
    {
      name: 'Valley Fresh Farm & Dairy',
      contact_name: 'Sarah Jenkins',
      email: 'accounts@valleyfresh.farm',
      phone: '+1-555-0143',
      notes: 'Cold chain verified. Organic dairy and fresh seasonal produce.',
    },
    {
      name: 'Golden Grain Wholesale Mill',
      contact_name: 'David Miller',
      email: 'supply@goldengrain.com',
      phone: '+1-555-0188',
      notes: 'Flour, sourdough loaves, and dried pantry staples.',
    },
    {
      name: 'Summit Coffee & Roastery',
      contact_name: 'Alex Wong',
      email: 'b2b@summitroasters.com',
      phone: '+1-555-0177',
      notes: 'Direct trade specialty single-origin and espresso beans.',
    },
  ];

  const { data: insertedSuppliers, error: suppErr } = await supabase
    .from('suppliers')
    .insert(suppliersData.map((s) => ({ ...s, business_id: businessId })))
    .select();
  if (suppErr) throw suppErr;

  const sBev = insertedSuppliers.find((s) => s.name.includes('Beverage'))?.id;
  const sDairy = insertedSuppliers.find((s) => s.name.includes('Dairy'))?.id;
  const sGrain = insertedSuppliers.find((s) => s.name.includes('Grain'))?.id;
  const sCoffee = insertedSuppliers.find((s) => s.name.includes('Coffee'))?.id;

  // 5. Create 16 Realistic Products across Categories
  console.log('Creating catalog items...');
  const today = new Date();
  const addDays = (d) => new Date(today.getTime() + d * 86400000).toISOString().split('T')[0];

  const itemsData = [
    // Coffee & Tea
    {
      name: 'Espresso Roast Beans 1kg',
      sku: 'COF-ESP-01',
      category: 'Coffee & Tea',
      unit: 'bags',
      quantity: 3, // LOW STOCK
      low_stock_threshold: 10,
      price: 24.5,
      cost_price: 13.0,
      supplier_id: sCoffee,
      notes: 'Top seller for local cafes and retail regulars.',
    },
    {
      name: 'Matcha Green Tea Powder 100g',
      sku: 'COF-MAT-02',
      category: 'Coffee & Tea',
      unit: 'tins',
      quantity: 48, // OVERSTOCK
      low_stock_threshold: 10,
      price: 18.0,
      cost_price: 8.5,
      supplier_id: sCoffee,
      notes: 'High margin ceremonial grade matcha.',
    },
    {
      name: 'Chai Spice Tea Bags (50ct)',
      sku: 'COF-CHA-03',
      category: 'Coffee & Tea',
      unit: 'boxes',
      quantity: 26,
      low_stock_threshold: 8,
      price: 9.5,
      cost_price: 4.2,
      supplier_id: sCoffee,
    },

    // Beverages
    {
      name: 'Cold Brew Nitro Can 250ml',
      sku: 'BEV-NIT-01',
      category: 'Beverages',
      unit: 'cans',
      quantity: 45,
      low_stock_threshold: 12,
      price: 3.75,
      cost_price: 1.8,
      supplier_id: sBev,
    },
    {
      name: 'Sparkling Mineral Water 750ml',
      sku: 'BEV-WAT-02',
      category: 'Beverages',
      unit: 'bottles',
      quantity: 60,
      low_stock_threshold: 15,
      price: 2.25,
      cost_price: 0.9,
      supplier_id: sBev,
    },
    {
      name: 'Artisan Ginger Ale 330ml',
      sku: 'BEV-GIN-03',
      category: 'Beverages',
      unit: 'bottles',
      quantity: 4, // LOW STOCK
      low_stock_threshold: 10,
      price: 2.85,
      cost_price: 1.2,
      supplier_id: sBev,
    },

    // Dairy
    {
      name: 'Organic Whole Milk 1L',
      sku: 'DAI-MLK-01',
      category: 'Dairy',
      unit: 'cartons',
      quantity: 16,
      low_stock_threshold: 6,
      price: 3.5,
      cost_price: 1.95,
      expiry_date: addDays(2), // EXPIRING IN 2 DAYS
      supplier_id: sDairy,
      notes: 'Clearance candidate before weekend fresh batch arrives.',
    },
    {
      name: 'Greek Yogurt Plain 500g',
      sku: 'DAI-YOG-02',
      category: 'Dairy',
      unit: 'tubs',
      quantity: 14,
      low_stock_threshold: 5,
      price: 4.8,
      cost_price: 2.3,
      expiry_date: addDays(4), // EXPIRING IN 4 DAYS
      supplier_id: sDairy,
    },
    {
      name: 'Oat Milk Barista Edition 1L',
      sku: 'DAI-OAT-03',
      category: 'Dairy',
      unit: 'cartons',
      quantity: 0, // OUT OF STOCK
      low_stock_threshold: 12,
      price: 4.2,
      cost_price: 2.1,
      supplier_id: sDairy,
      notes: 'High demand replacement for whole milk; reorder urgently.',
    },
    {
      name: 'Grass-Fed Salted Butter 250g',
      sku: 'DAI-BUT-04',
      category: 'Dairy',
      unit: 'blocks',
      quantity: 28,
      low_stock_threshold: 8,
      price: 5.25,
      cost_price: 2.9,
      supplier_id: sDairy,
    },

    // Bakery
    {
      name: 'Artisan Sourdough Loaf',
      sku: 'BAK-SOU-01',
      category: 'Bakery',
      unit: 'loaves',
      quantity: 22,
      low_stock_threshold: 6,
      price: 6.5,
      cost_price: 2.7,
      supplier_id: sGrain,
    },
    {
      name: 'Whole Wheat Brioche Buns (4pk)',
      sku: 'BAK-BRI-02',
      category: 'Bakery',
      unit: 'packs',
      quantity: 18,
      low_stock_threshold: 6,
      price: 4.95,
      cost_price: 2.1,
      supplier_id: sGrain,
    },

    // Produce
    {
      name: 'Organic Hass Avocados (Pack of 4)',
      sku: 'PRO-AVO-01',
      category: 'Produce',
      unit: 'packs',
      quantity: 4, // LOW STOCK
      low_stock_threshold: 10,
      price: 5.95,
      cost_price: 3.1,
      expiry_date: addDays(3),
      supplier_id: sDairy,
    },
    {
      name: 'Honeycrisp Apples (Bag 1.5kg)',
      sku: 'PRO-APP-02',
      category: 'Produce',
      unit: 'bags',
      quantity: 35,
      low_stock_threshold: 10,
      price: 7.25,
      cost_price: 3.9,
      supplier_id: sDairy,
    },

    // Pantry
    {
      name: 'Extra Virgin Olive Oil 500ml',
      sku: 'PAN-OIL-01',
      category: 'Pantry',
      unit: 'bottles',
      quantity: 30,
      low_stock_threshold: 8,
      price: 13.5,
      cost_price: 7.2,
      supplier_id: sGrain,
    },
    {
      name: 'Raw Almonds 500g',
      sku: 'PAN-ALM-02',
      category: 'Pantry',
      unit: 'pouches',
      quantity: 42,
      low_stock_threshold: 10,
      price: 9.8,
      cost_price: 5.1,
      supplier_id: sGrain,
    },
  ];

  const { data: insertedItems, error: itemsErr } = await supabase
    .from('items')
    .insert(itemsData.map((item) => ({ ...item, business_id: businessId })))
    .select();
  if (itemsErr) throw itemsErr;

  console.log(`Inserted ${insertedItems.length} products.`);

  // 6. Generate Realistic Stock Movements (Sales and Restocks)
  console.log('Generating sales velocity history...');
  const movements = [];
  const reasons = ['sale', 'sale', 'sale', 'restock', 'sale'];

  for (const item of insertedItems) {
    // Generate 6-10 sales/restocks across the last 30 days
    const count = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 28) + 1;
      const date = new Date(today.getTime() - daysAgo * 86400000).toISOString();
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const delta = reason === 'restock' ? 10 + Math.floor(Math.random() * 15) : -(1 + Math.floor(Math.random() * 3));

      movements.push({
        business_id: businessId,
        item_id: item.id,
        delta,
        reason,
        created_at: date,
        note: reason === 'sale' ? 'POS Register checkout sale' : 'Vendor replenishment delivery batch',
      });
    }
  }

  await supabase.from('stock_movements').insert(movements);
  console.log(`Inserted ${movements.length} stock movement events.`);

  console.log('\n======================================================');
  console.log(' DEMO / ADMIN ACCOUNT READY');
  console.log('======================================================');
  console.log(`Email:    ${demoEmail}`);
  console.log(`Password: ${demoPassword}`);
  console.log(`Store:    ${businessName}`);
  console.log(`Items:    ${insertedItems.length}`);
  console.log(`Vendors:  ${insertedSuppliers.length}`);
  console.log('======================================================\n');
}

main().catch(console.error);
