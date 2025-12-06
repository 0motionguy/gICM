# Excel/Sheets Master

> **ID:** `excel-sheets-master`
> **Tier:** 2
> **Token Cost:** 8000
> **MCP Connections:** None

## What This Skill Does

- Excel/Google Sheets generation (ExcelJS, SheetJS)
- Advanced formulas and calculations
- Cell styling and formatting
- Charts and visualizations
- Data validation and dropdowns
- Pivot tables and large dataset optimization
- CSV import/export

## When to Use

This skill is automatically loaded when:

- **Keywords:** excel, spreadsheet, xlsx, csv, sheets, table, financial report
- **File Types:** .xlsx, .csv
- **Directories:** exports/, reports/

---

## Core Capabilities

### 1. ExcelJS Setup & Basic Usage

**Installation:**
```bash
pnpm add exceljs
```

**Create Workbook:**
```typescript
import ExcelJS from 'exceljs';

async function createWorkbook() {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'My App';
  workbook.lastModifiedBy = 'System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Add a worksheet
  const sheet = workbook.addWorksheet('Sales Report', {
    properties: { tabColor: { argb: 'FF00FF00' } },
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
    },
  });

  return workbook;
}
```

**Add Data:**
```typescript
async function addSalesData(workbook: ExcelJS.Workbook) {
  const sheet = workbook.getWorksheet('Sales Report')!;

  // Define columns
  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Product', key: 'product', width: 25 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total', key: 'total', width: 15 },
  ];

  // Add data rows
  const salesData = [
    { date: new Date('2024-01-15'), product: 'Widget A', category: 'Electronics', quantity: 100, unitPrice: 29.99 },
    { date: new Date('2024-01-16'), product: 'Widget B', category: 'Electronics', quantity: 75, unitPrice: 49.99 },
    { date: new Date('2024-01-17'), product: 'Gadget X', category: 'Accessories', quantity: 200, unitPrice: 9.99 },
  ];

  salesData.forEach((sale) => {
    sheet.addRow({
      ...sale,
      total: { formula: `D${sheet.rowCount + 1}*E${sheet.rowCount + 1}` },
    });
  });

  // Add totals row
  const lastDataRow = sheet.rowCount;
  sheet.addRow({
    date: '',
    product: '',
    category: '',
    quantity: { formula: `SUM(D2:D${lastDataRow})` },
    unitPrice: '',
    total: { formula: `SUM(F2:F${lastDataRow})` },
  });

  return workbook;
}
```

**Save Workbook:**
```typescript
// Save to file (Node.js)
await workbook.xlsx.writeFile('sales-report.xlsx');

// Save to buffer (for API responses)
const buffer = await workbook.xlsx.writeBuffer();

// Next.js API route
export async function GET() {
  const workbook = await createSalesReport();
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="sales-report.xlsx"',
    },
  });
}
```

---

### 2. Cell Styling and Formatting

**Number Formats:**
```typescript
const sheet = workbook.getWorksheet('Report')!;

// Currency format
sheet.getColumn('total').numFmt = '"$"#,##0.00';

// Percentage
sheet.getColumn('growth').numFmt = '0.00%';

// Date format
sheet.getColumn('date').numFmt = 'yyyy-mm-dd';

// Custom number format
sheet.getColumn('quantity').numFmt = '#,##0';

// Accounting format (negative in red)
sheet.getColumn('profit').numFmt = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)';
```

**Cell Styles:**
```typescript
// Header row styling
const headerRow = sheet.getRow(1);
headerRow.font = {
  bold: true,
  size: 12,
  color: { argb: 'FFFFFFFF' },
};
headerRow.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4472C4' },
};
headerRow.alignment = {
  vertical: 'middle',
  horizontal: 'center',
};
headerRow.height = 25;

// Conditional styling
sheet.eachRow((row, rowNumber) => {
  if (rowNumber > 1) {
    // Zebra striping
    if (rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    }

    // Highlight negative values
    const totalCell = row.getCell('total');
    if (typeof totalCell.value === 'number' && totalCell.value < 0) {
      totalCell.font = { color: { argb: 'FFFF0000' } };
    }
  }
});
```

**Borders:**
```typescript
// Apply borders to a range
function applyBorders(sheet: ExcelJS.Worksheet, range: string) {
  const [start, end] = range.split(':');
  const startCell = sheet.getCell(start);
  const endCell = sheet.getCell(end);

  for (let row = startCell.row; row <= endCell.row; row++) {
    for (let col = startCell.col; col <= endCell.col; col++) {
      const cell = sheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
      };
    }
  }
}

applyBorders(sheet, 'A1:F20');

// Thick border around entire table
const tableRange = sheet.getCell('A1:F20');
// ... apply thick outer borders
```

**Merge Cells:**
```typescript
// Merge cells for title
sheet.mergeCells('A1:F1');
const titleCell = sheet.getCell('A1');
titleCell.value = 'Monthly Sales Report';
titleCell.font = { bold: true, size: 16 };
titleCell.alignment = { horizontal: 'center' };

// Merge cells in data
sheet.mergeCells('B5:B7'); // Merge vertically
sheet.mergeCells('A10:C10'); // Merge horizontally
```

---

### 3. Advanced Formulas

**Common Formulas:**
```typescript
// Basic formulas
sheet.getCell('F2').value = { formula: 'D2*E2' }; // Multiplication
sheet.getCell('G2').value = { formula: 'SUM(D2:D100)' }; // Sum
sheet.getCell('H2').value = { formula: 'AVERAGE(E2:E100)' }; // Average
sheet.getCell('I2').value = { formula: 'MAX(F2:F100)' }; // Maximum
sheet.getCell('J2').value = { formula: 'MIN(F2:F100)' }; // Minimum
sheet.getCell('K2').value = { formula: 'COUNT(A2:A100)' }; // Count

// Conditional formulas
sheet.getCell('L2').value = {
  formula: 'IF(F2>1000,"High","Low")',
};

sheet.getCell('M2').value = {
  formula: 'IFERROR(F2/D2,0)',
};

// Lookup formulas
sheet.getCell('N2').value = {
  formula: 'VLOOKUP(B2,Products!A:C,3,FALSE)',
};

sheet.getCell('O2').value = {
  formula: 'INDEX(Products!C:C,MATCH(B2,Products!A:A,0))',
};

// Text formulas
sheet.getCell('P2').value = {
  formula: 'CONCATENATE(B2," - ",C2)',
};

sheet.getCell('Q2').value = {
  formula: 'TEXT(A2,"mmmm yyyy")',
};

// Date formulas
sheet.getCell('R2').value = {
  formula: 'YEAR(A2)',
};

sheet.getCell('S2').value = {
  formula: 'EOMONTH(A2,0)', // End of month
};
```

**Array Formulas (Excel 365):**
```typescript
// SUMIFS - multiple criteria
sheet.getCell('T2').value = {
  formula: 'SUMIFS(F:F,C:C,"Electronics",A:A,">="&DATE(2024,1,1))',
};

// UNIQUE
sheet.getCell('U2').value = {
  formula: 'UNIQUE(C2:C100)',
};

// FILTER
sheet.getCell('V2').value = {
  formula: 'FILTER(A2:F100,F2:F100>1000)',
};

// SORT
sheet.getCell('W2').value = {
  formula: 'SORT(A2:F100,6,-1)', // Sort by column 6 descending
};
```

---

### 4. Data Validation

**Dropdown Lists:**
```typescript
// Simple dropdown
sheet.getCell('C2').dataValidation = {
  type: 'list',
  allowBlank: true,
  formulae: ['"Electronics,Accessories,Clothing,Food"'],
  showErrorMessage: true,
  errorTitle: 'Invalid Category',
  error: 'Please select a valid category from the list.',
};

// Dropdown from range
sheet.getCell('D2').dataValidation = {
  type: 'list',
  allowBlank: false,
  formulae: ['Categories!$A$2:$A$20'],
};

// Apply to entire column
for (let row = 2; row <= 1000; row++) {
  sheet.getCell(`C${row}`).dataValidation = {
    type: 'list',
    formulae: ['Categories!$A$2:$A$20'],
  };
}
```

**Number Validation:**
```typescript
// Whole number between 0 and 1000
sheet.getCell('D2').dataValidation = {
  type: 'whole',
  operator: 'between',
  formulae: [0, 1000],
  showErrorMessage: true,
  errorTitle: 'Invalid Quantity',
  error: 'Quantity must be between 0 and 1000.',
};

// Decimal with minimum
sheet.getCell('E2').dataValidation = {
  type: 'decimal',
  operator: 'greaterThan',
  formulae: [0],
  showErrorMessage: true,
  error: 'Price must be greater than 0.',
};
```

**Date Validation:**
```typescript
// Date within range
sheet.getCell('A2').dataValidation = {
  type: 'date',
  operator: 'between',
  formulae: [new Date('2024-01-01'), new Date('2024-12-31')],
  showErrorMessage: true,
  error: 'Date must be within 2024.',
};

// Date in the future
sheet.getCell('B2').dataValidation = {
  type: 'date',
  operator: 'greaterThan',
  formulae: ['TODAY()'],
};
```

---

### 5. Charts

**Column Chart:**
```typescript
// Add chart worksheet data first
const chartData = [
  ['Month', 'Sales', 'Expenses'],
  ['Jan', 45000, 32000],
  ['Feb', 52000, 35000],
  ['Mar', 48000, 31000],
  ['Apr', 61000, 38000],
  ['May', 55000, 34000],
  ['Jun', 67000, 42000],
];

chartData.forEach((row) => sheet.addRow(row));

// Note: ExcelJS has limited chart support
// For complex charts, consider using xlsx-chart or generating via templates
```

**Using xlsx-chart for charts:**
```typescript
import XLSX from 'xlsx';
import XLSXChart from 'xlsx-chart';

const xlsxChart = new XLSXChart();

const chartConfig = {
  chart: 'column',
  titles: ['Sales by Month'],
  fields: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: {
    Sales: [45000, 52000, 48000, 61000, 55000, 67000],
    Expenses: [32000, 35000, 31000, 38000, 34000, 42000],
  },
  chartTitle: 'Monthly Performance',
};

xlsxChart.generate(chartConfig, (err, data) => {
  if (!err) {
    fs.writeFileSync('chart.xlsx', data, 'binary');
  }
});
```

---

### 6. Large Dataset Optimization

**Streaming for Large Files:**
```typescript
import ExcelJS from 'exceljs';

async function exportLargeDataset(data: any[]) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename: 'large-export.xlsx',
    useStyles: true,
    useSharedStrings: true,
  });

  const sheet = workbook.addWorksheet('Data');

  // Add headers
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  // Stream rows
  for (const item of data) {
    sheet.addRow(item).commit(); // Commit immediately to save memory
  }

  // Commit the sheet
  sheet.commit();

  // Finalize the workbook
  await workbook.commit();
}
```

**Chunked Processing:**
```typescript
async function processInChunks<T>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[], startIndex: number) => Promise<void>
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await processor(chunk, i);
  }
}

async function exportWithChunks(data: any[]) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    filename: 'chunked-export.xlsx',
  });

  const sheet = workbook.addWorksheet('Data');

  await processInChunks(data, 1000, async (chunk, startIndex) => {
    chunk.forEach((item, index) => {
      const row = sheet.addRow(item);
      row.commit();
    });

    // Log progress
    console.log(`Processed ${startIndex + chunk.length} of ${data.length}`);
  });

  sheet.commit();
  await workbook.commit();
}
```

---

### 7. SheetJS (xlsx) for Reading

**Read Excel File:**
```typescript
import * as XLSX from 'xlsx';

function readExcelFile(filePath: string) {
  const workbook = XLSX.readFile(filePath);

  // Get sheet names
  const sheetNames = workbook.SheetNames;
  console.log('Sheets:', sheetNames);

  // Read first sheet
  const sheet = workbook.Sheets[sheetNames[0]];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(sheet);

  return data;
}

// Read from buffer (e.g., file upload)
function readExcelBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

// Read specific range
function readRange(filePath: string, range: string) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Set range
  sheet['!ref'] = range;

  return XLSX.utils.sheet_to_json(sheet);
}
```

**CSV Export:**
```typescript
import * as XLSX from 'xlsx';

function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Write to file
  fs.writeFileSync(filename, csv);

  return csv;
}

// API route for CSV download
export async function GET(request: Request) {
  const data = await fetchData();

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  });
}
```

---

## Real-World Examples

### Example 1: Financial Report
```typescript
async function generateFinancialReport(data: FinancialData) {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.mergeCells('A1:F1');
  summary.getCell('A1').value = 'Financial Summary Report';
  summary.getCell('A1').font = { bold: true, size: 18 };

  // Key metrics
  summary.addRow([]);
  summary.addRow(['Metric', 'Value', 'Change', 'YoY']);
  summary.addRow(['Revenue', data.revenue, data.revenueChange, data.revenueYoY]);
  summary.addRow(['Expenses', data.expenses, data.expensesChange, data.expensesYoY]);
  summary.addRow(['Net Income', { formula: 'B4-B5' }, '', '']);

  // Format as currency
  ['B', 'C'].forEach((col) => {
    summary.getColumn(col).numFmt = '"$"#,##0.00';
  });

  // Details sheet
  const details = workbook.addWorksheet('Details');
  details.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Debit', key: 'debit', width: 12 },
    { header: 'Credit', key: 'credit', width: 12 },
    { header: 'Balance', key: 'balance', width: 15 },
  ];

  data.transactions.forEach((tx, index) => {
    details.addRow({
      ...tx,
      balance: { formula: `IF(ROW()=2,D2-E2,F${index + 1}+D${index + 2}-E${index + 2})` },
    });
  });

  // Style headers
  [summary, details].forEach((sheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  return workbook;
}
```

### Example 2: Data Import with Validation
```typescript
interface ImportResult {
  valid: any[];
  errors: { row: number; errors: string[] }[];
}

async function importAndValidate(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headers = data[0] as string[];
  const rows = data.slice(1);

  const result: ImportResult = { valid: [], errors: [] };

  rows.forEach((row: any[], index) => {
    const rowNumber = index + 2; // Account for header and 0-indexing
    const errors: string[] = [];

    const record: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      record[header] = row[colIndex];
    });

    // Validate required fields
    if (!record.email) {
      errors.push('Email is required');
    } else if (!isValidEmail(record.email)) {
      errors.push('Invalid email format');
    }

    if (!record.name || record.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (record.amount && isNaN(parseFloat(record.amount))) {
      errors.push('Amount must be a number');
    }

    if (errors.length > 0) {
      result.errors.push({ row: rowNumber, errors });
    } else {
      result.valid.push(record);
    }
  });

  return result;
}
```

---

## Related Skills

- `pdf-report-generator` - PDF exports
- `node-backend` - API integration
- `tanstack-query-expert` - Data fetching
- `python-developer` - Data processing with pandas

## Further Reading

- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [SheetJS Documentation](https://docs.sheetjs.com/)
- [Excel Formula Reference](https://support.microsoft.com/en-us/office/excel-functions-by-category)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
