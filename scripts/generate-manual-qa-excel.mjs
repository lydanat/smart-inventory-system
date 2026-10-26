import ExcelJS from 'exceljs';
import * as path from 'path';

async function generateManualQATestWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart Inventory QA Team';
  workbook.lastModifiedBy = 'Store Owner Tester';
  workbook.created = new Date();
  workbook.modified = new Date();

  const NAVY_HEADER_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate-800
  };
  const WHITE_FONT_BOLD = {
    name: 'Segoe UI',
    color: { argb: 'FFFFFFFF' },
    bold: true,
    size: 11,
  };
  const BODY_FONT = {
    name: 'Segoe UI',
    size: 10,
    color: { argb: 'FF0F172A' },
  };
  const THIN_BORDER = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // Test cases data
  const testCases = [
    // Module 1: Auth & Password Setup
    {
      id: 'QA-AUTH-01',
      module: 'Auth & Google Login',
      scenario: 'Re-Login After Google OAuth (No Password Needed)',
      priority: 'Critical',
      steps: '1. Visit /login\n2. Click "Continue with Google"\n3. Authenticate with Google account\n4. Verify landing on /dashboard\n5. Sign out and click "Continue with Google" again',
      expected: 'System logs in immediately without password prompt. Store data and context preserved.',
      failure: 'Redirect loop, error "Unsupported provider", or asking for password on Google login.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-AUTH-02',
      module: 'Auth & Google Login',
      scenario: 'Request Password Reset for Google or Email Account',
      priority: 'High',
      steps: '1. On /login, click "Forgot Password?"\n2. Enter your Google or registered email\n3. Click "Send Reset Link"',
      expected: 'Modal shows green checkmark "Reset Email Sent!". Recovery link arrives in email inbox.',
      failure: 'Broken alert, button does nothing, or submission error.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-AUTH-03',
      module: 'Auth & Google Login',
      scenario: 'Set New Password via /reset-password',
      priority: 'Critical',
      steps: '1. Open link from email or visit /reset-password\n2. Enter 8+ char password\n3. Confirm matching password\n4. Submit',
      expected: 'Password updated. Success toast shown. Redirected straight to /dashboard.',
      failure: 'Passwords under 8 chars accepted, or form fails to submit.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-AUTH-04',
      module: 'Auth & Google Login',
      scenario: 'Set or Change Password Inside Store Settings',
      priority: 'High',
      steps: '1. Go to /settings\n2. Find "Set or Update Password" in Account & Security card\n3. Enter and confirm new password\n4. Click "Save Password"',
      expected: 'Password saved. Toast confirms update. Can now log in with either Google or email/password.',
      failure: 'Button stays disabled or crashes on submission.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 2: AI Business Advisor
    {
      id: 'QA-AI-01',
      module: 'AI Advisor',
      scenario: 'View AI Business Advisor Card & Recommendations',
      priority: 'Critical',
      steps: '1. Open /dashboard\n2. Review AI Business Advisor card\n3. Check model badge, executive summary, restocks, marketing, and suppliers',
      expected: 'Card renders with real catalog names, restock urgencies, and supplier tips without crash.',
      failure: 'White blank card or runtime error.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-AI-02',
      module: 'AI Advisor',
      scenario: 'Refresh Cooldown Protection (< 1 Hour)',
      priority: 'High',
      steps: '1. On AI card, click "Refresh" within 1 hour of last generation\n2. Observe toast notification',
      expected: 'Toast states: "AI insights can be refreshed once per hour. You can refresh again in X minutes."',
      failure: 'Opaque 500 server error or infinite spinner without minute countdown.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-AI-03',
      module: 'AI Advisor',
      scenario: 'Refresh Execution After 1 Hour',
      priority: 'High',
      steps: '1. Wait until 1 hour has elapsed since last generation\n2. Click "Refresh"',
      expected: 'Fresh recommendations generated. Toast confirms update. Timestamp updates to current time.',
      failure: 'Blocked or rate limited even after 1 full hour has passed.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 3: Marketing Strategies
    {
      id: 'QA-MKT-01',
      module: 'Marketing Strategies',
      scenario: 'Verify Exactly 2 to 3 Marketing Strategies',
      priority: 'Critical',
      steps: '1. Check Turnover & Clearance section on AI Advisor\n2. Count number of marketing cards',
      expected: 'Header indicates (2) or (3). Exactly 2 or 3 distinct marketing strategy cards are displayed.',
      failure: '0 or only 1 strategy card rendered.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-MKT-02',
      module: 'Marketing Strategies',
      scenario: 'Marketing Text Scrolling & Full Visibility',
      priority: 'High',
      steps: '1. Inspect marketing idea description\n2. Inspect sample message box and scroll vertically',
      expected: 'Full text readable without line-clamp truncation. Scrollbar allows reading complete promo message.',
      failure: 'Text cut off mid-sentence with no way to scroll.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-MKT-03',
      module: 'Marketing Strategies',
      scenario: 'One-Click Copy Marketing Message',
      priority: 'Medium',
      steps: '1. Click "Copy Message" on any marketing card\n2. Paste (Ctrl+V) into any text field',
      expected: 'Button shows green check "Copied". Clipboard receives the exact promotional text.',
      failure: 'Toast "Unable to copy to clipboard".',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 4: AI Workflow
    {
      id: 'QA-WKF-01',
      module: 'AI Workflow',
      scenario: 'Open AI Workflow Modal',
      priority: 'Medium',
      steps: '1. In AI Advisor header, click "AI Workflow" button',
      expected: 'Modal opens titled "How the AI Workflow Operates" detailing the 4-layer architecture.',
      failure: 'Button unresponsive or modal fails to render.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-WKF-02',
      module: 'AI Workflow',
      scenario: 'Verify 4-Layer Workflow Explanations',
      priority: 'Low',
      steps: '1. Inspect the 4 numbered steps in the workflow dialog\n2. Click "Got it"',
      expected: 'Steps clearly explain: 1. Rules Engine, 2. Gemini 3.8 Flash, 3. Anti-Hallucination, 4. Fallback. Closes smoothly.',
      failure: 'Missing steps or broken icons.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 5: Product Import
    {
      id: 'QA-IMP-01',
      module: 'Product Import',
      scenario: 'Download Sample Templates (CSV & XLSX)',
      priority: 'High',
      steps: '1. Go to /inventory\n2. Click "Import" button\n3. Click "CSV Template" and "Excel Template"',
      expected: 'Downloads smart_inventory_products_template.csv and .xlsx with all pre-formatted columns.',
      failure: 'File download fails or files cannot be opened in Excel.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-IMP-02',
      module: 'Product Import',
      scenario: 'Upload and Parse Valid Excel (.xlsx) File',
      priority: 'Critical',
      steps: '1. Upload sample .xlsx file in Import dialog\n2. Verify spreadsheet preview',
      expected: 'File name shown with green check. Rows listed with name, qty, price, and green "Valid" badge.',
      failure: 'ExcelJS parsing error or file rejected.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-IMP-03',
      module: 'Product Import',
      scenario: 'Execute Batch Import & Confirm Inventory Insertion',
      priority: 'Critical',
      steps: '1. Click "Confirm Import (X Items)"\n2. Verify inventory table',
      expected: 'Modal closes. Success toast shown. Table refreshes showing all imported products with initial stock logs.',
      failure: 'Products do not appear in table after import.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-IMP-04',
      module: 'Product Import',
      scenario: 'Reject Invalid Rows (Negative Qty or Blank Name)',
      priority: 'High',
      steps: '1. Upload CSV with empty name and negative quantity (-10)\n2. Inspect preview',
      expected: 'Invalid rows highlighted in red with exact error reasons. Badge shows X invalid.',
      failure: 'Negative quantities accepted into database.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 6: Categories
    {
      id: 'QA-CAT-01',
      module: 'Category Management',
      scenario: 'Open Category Management Dialog',
      priority: 'High',
      steps: '1. On /inventory, click "Categories" button (tag icon)',
      expected: 'Modal opens titled "Manage Product Categories" with list of existing categories and quick-add pills.',
      failure: 'Button missing or dialog fails to open.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-CAT-02',
      module: 'Category Management',
      scenario: 'Quick-Add Suggested Category',
      priority: 'Medium',
      steps: '1. In Categories dialog, click a suggested pill (e.g. "+ Beverages")',
      expected: 'Category added immediately with toast. Added to existing categories list.',
      failure: 'Error toast or pill does not add.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-CAT-03',
      module: 'Category Management',
      scenario: 'Create Custom Category & Filter Inventory',
      priority: 'High',
      steps: '1. Type custom category name into input\n2. Click "Add"\n3. Close dialog\n4. Check Category filter dropdown',
      expected: 'Category created. Category appears in inventory filter dropdown for instant filtering.',
      failure: 'New category does not appear in filter dropdown.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-CAT-04',
      module: 'Category Management',
      scenario: 'Create Category On-the-Fly Inside Add Item Dialog',
      priority: 'High',
      steps: '1. Click "Add Item"\n2. Under Category, choose "+ Create new category..."\n3. Type new category name and save item',
      expected: 'Item created under new category. Category automatically added to store categories.',
      failure: 'Cannot type custom category name.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 7: Tour & Loading
    {
      id: 'QA-TUR-01',
      module: 'System Tour',
      scenario: 'Launch System Tour from Top Navigation',
      priority: 'High',
      steps: '1. In top navigation bar, click "Take a Tour" button (compass icon)',
      expected: 'Interactive walkthrough modal opens with Step 1 of 7: Welcome to Smart Inventory AI.',
      failure: 'Button missing from topbar or modal does not open.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-TUR-02',
      module: 'System Tour',
      scenario: 'Step Through All 7 Tour Stages',
      priority: 'Medium',
      steps: '1. Click "Next" through all 7 tour steps\n2. Test "Previous" on step 7\n3. Click "Get Started"',
      expected: 'Progress bar animates 14% to 100%. Previous button works. Get Started closes modal smoothly.',
      failure: 'Navigation buttons unresponsive or progress bar stuck.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-TUR-03',
      module: 'System Tour',
      scenario: 'Verify Loading Skeletons on Navigation',
      priority: 'Medium',
      steps: '1. Navigate between Dashboard, Inventory, Suppliers, and Settings',
      expected: 'Modern pulsing skeletons render smoothly without jarring white flashes or layout shifts.',
      failure: 'Blank un-styled screen during data fetch.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 8: Stock Adjustments
    {
      id: 'QA-STK-01',
      module: 'Stock Adjustments',
      scenario: 'Inline Quick Sale (-1) and Restock (+1)',
      priority: 'Critical',
      steps: '1. Click "-" on any item row\n2. Observe quantity decrements by 1\n3. Click "+"\n4. Observe quantity increments by 1',
      expected: 'Stock level updates instantly. Minus button disables if quantity reaches 0.',
      failure: 'Stock allows dropping below 0 (negative balance).',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
    {
      id: 'QA-STK-02',
      module: 'Stock Adjustments',
      scenario: 'Atomic Stock Adjustment Dialog with Audit Reason',
      priority: 'High',
      steps: '1. In row action menu, click "Adjust Stock"\n2. Choose reason (Damaged/Restock)\n3. Enter delta and note\n4. Save',
      expected: 'Stock updates. Audit timeline logs the change, user, and reason note.',
      failure: 'Adjustment fails or audit note not recorded.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },

    // Module 9: Telegram Alerts
    {
      id: 'QA-TEL-01',
      module: 'Telegram Alerts',
      scenario: 'Connect Store to Telegram Bot (@AIinventorysystemBOT)',
      priority: 'High',
      steps: '1. Go to /alerts\n2. Click "Generate Link Code"\n3. Send /start [CODE] to @AIinventorysystemBOT in Telegram',
      expected: 'Bot replies with green check. Web page updates to show status badge "Connected".',
      failure: 'Bot does not respond or status does not update.',
      status: '[ ] PASS  [ ] FAIL',
      notes: '',
    },
  ];

  // -------------------------------------------------------------
  // Sheet 1: Manual Test Plan Matrix
  // -------------------------------------------------------------
  const sheet = workbook.addWorksheet('Manual QA Checklist', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 4 }],
  });

  // Title Block
  sheet.mergeCells('A1:H1');
  sheet.getCell('A1').value = 'SMART INVENTORY AI — MANUAL QA VERIFICATION CHECKLIST';
  sheet.getCell('A1').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = NAVY_HEADER_FILL;
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 32;

  sheet.mergeCells('A2:H2');
  sheet.getCell('A2').value = 'Instructions: Execute each test step manually in your browser. Record your result in column G ([X] PASS or [X] FAIL).';
  sheet.getCell('A2').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
  sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(2).height = 20;

  // Header Row
  const headers = [
    'Test ID',
    'Module',
    'Test Scenario / Title',
    'Priority',
    'Step-by-Step Test Instructions',
    'Expected Success Outcome',
    'Failure Criteria & Troubleshooting',
    'Tester Result (PASS/FAIL)',
  ];

  const headerRow = sheet.getRow(4);
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.fill = NAVY_HEADER_FILL;
    cell.font = WHITE_FONT_BOLD;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = THIN_BORDER;
  });
  headerRow.height = 28;

  // Insert Rows
  testCases.forEach((tc, i) => {
    const row = sheet.getRow(5 + i);
    row.getCell(1).value = tc.id;
    row.getCell(2).value = tc.module;
    row.getCell(3).value = tc.scenario;
    row.getCell(4).value = tc.priority;
    row.getCell(5).value = tc.steps;
    row.getCell(6).value = tc.expected;
    row.getCell(7).value = tc.failure;
    row.getCell(8).value = tc.status;

    // Formatting
    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = BODY_FONT;
      cell.border = THIN_BORDER;
      cell.alignment = { vertical: 'top', wrapText: true };
    }

    // Alignments
    row.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };
    row.getCell(4).alignment = { vertical: 'top', horizontal: 'center' };
    row.getCell(8).alignment = { vertical: 'top', horizontal: 'center' };

    // Zebra striping
    if (i % 2 === 1) {
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    }
  });

  // Column Widths
  sheet.columns = [
    { width: 14 }, // Test ID
    { width: 22 }, // Module
    { width: 34 }, // Title
    { width: 12 }, // Priority
    { width: 44 }, // Steps
    { width: 42 }, // Expected
    { width: 38 }, // Failure
    { width: 22 }, // Status
  ];

  const outPath = path.resolve(process.cwd(), 'SMART_INVENTORY_QA_TEST_CASES.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`Successfully generated updated manual QA test workbook at: ${outPath}`);
}

generateManualQATestWorkbook().catch(console.error);
