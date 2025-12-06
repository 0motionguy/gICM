# PDF Report Generator

> **ID:** `pdf-report-generator`
> **Tier:** 2
> **Token Cost:** 8000
> **MCP Connections:** None

## What This Skill Does

- PDF generation with PDFKit and jsPDF
- HTML-to-PDF with Puppeteer
- Document structure and pagination
- Tables and charts
- Images and watermarks
- Headers, footers, and page numbers
- Form fields and interactive elements

## When to Use

This skill is automatically loaded when:

- **Keywords:** pdf, report, document, invoice, certificate, generate pdf
- **File Types:** .pdf
- **Directories:** reports/, exports/

---

## Core Capabilities

### 1. PDFKit (Node.js)

**Installation:**
```bash
pnpm add pdfkit
```

**Basic Document:**
```typescript
import PDFDocument from 'pdfkit';
import fs from 'fs';

async function createPDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: 'Sales Report',
        Author: 'My Company',
        Subject: 'Monthly Sales Report',
      },
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Monthly Sales Report', { align: 'center' });

    doc.moveDown(2);

    // Subtitle
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(2);

    // Content
    doc
      .fontSize(11)
      .fillColor('#000000')
      .text('This report contains the sales data for the current month.');

    doc.end();
  });
}

// Save to file
const pdf = await createPDF();
fs.writeFileSync('report.pdf', pdf);

// API Route
export async function GET() {
  const pdf = await createPDF();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  });
}
```

**Tables:**
```typescript
interface TableColumn {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

interface TableOptions {
  x: number;
  y: number;
  columns: TableColumn[];
  data: Record<string, any>[];
  headerBackground?: string;
  headerColor?: string;
  rowHeight?: number;
  fontSize?: number;
}

function drawTable(doc: PDFKit.PDFDocument, options: TableOptions) {
  const {
    x,
    y,
    columns,
    data,
    headerBackground = '#4472C4',
    headerColor = '#FFFFFF',
    rowHeight = 25,
    fontSize = 10,
  } = options;

  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  let currentY = y;

  // Draw header
  doc.rect(x, currentY, tableWidth, rowHeight).fill(headerBackground);

  let currentX = x;
  columns.forEach((col) => {
    doc
      .fontSize(fontSize)
      .fillColor(headerColor)
      .text(col.header, currentX + 5, currentY + 7, {
        width: col.width - 10,
        align: col.align || 'left',
      });
    currentX += col.width;
  });

  currentY += rowHeight;

  // Draw data rows
  data.forEach((row, rowIndex) => {
    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.rect(x, currentY, tableWidth, rowHeight).fill('#F5F5F5');
    }

    // Draw row border
    doc
      .strokeColor('#D3D3D3')
      .lineWidth(0.5)
      .rect(x, currentY, tableWidth, rowHeight)
      .stroke();

    currentX = x;
    columns.forEach((col) => {
      const value = row[col.key]?.toString() || '';
      doc
        .fontSize(fontSize)
        .fillColor('#000000')
        .text(value, currentX + 5, currentY + 7, {
          width: col.width - 10,
          align: col.align || 'left',
        });
      currentX += col.width;
    });

    currentY += rowHeight;
  });

  // Draw outer border
  doc
    .strokeColor('#000000')
    .lineWidth(1)
    .rect(x, y, tableWidth, currentY - y)
    .stroke();

  return currentY;
}

// Usage
const endY = drawTable(doc, {
  x: 50,
  y: 150,
  columns: [
    { header: 'Product', key: 'product', width: 150 },
    { header: 'Quantity', key: 'quantity', width: 80, align: 'right' },
    { header: 'Price', key: 'price', width: 100, align: 'right' },
    { header: 'Total', key: 'total', width: 100, align: 'right' },
  ],
  data: [
    { product: 'Widget A', quantity: 10, price: '$29.99', total: '$299.90' },
    { product: 'Widget B', quantity: 5, price: '$49.99', total: '$249.95' },
    { product: 'Gadget X', quantity: 20, price: '$9.99', total: '$199.80' },
  ],
});
```

**Headers and Footers:**
```typescript
function addHeaderFooter(doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Header
  doc
    .fontSize(10)
    .fillColor('#666666')
    .text('CONFIDENTIAL', 50, 20, { align: 'left' })
    .text('My Company Inc.', 50, 20, { align: 'right', width: pageWidth - 100 });

  // Header line
  doc
    .strokeColor('#CCCCCC')
    .lineWidth(1)
    .moveTo(50, 40)
    .lineTo(pageWidth - 50, 40)
    .stroke();

  // Footer line
  doc
    .strokeColor('#CCCCCC')
    .lineWidth(1)
    .moveTo(50, pageHeight - 50)
    .lineTo(pageWidth - 50, pageHeight - 50)
    .stroke();

  // Footer
  doc
    .fontSize(10)
    .fillColor('#666666')
    .text(
      `Page ${pageNumber} of ${totalPages}`,
      50,
      pageHeight - 40,
      { align: 'center', width: pageWidth - 100 }
    );
}

// Multi-page document with headers/footers
function createMultiPageDocument(data: any[]) {
  const doc = new PDFDocument({ bufferPages: true });

  // Add content...
  data.forEach((item) => {
    doc.text(item.content);
    doc.addPage();
  });

  // Add headers/footers to all pages
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    addHeaderFooter(doc, i + 1, pages.count);
  }

  doc.end();
  return doc;
}
```

---

### 2. Puppeteer HTML-to-PDF

**Installation:**
```bash
pnpm add puppeteer
```

**HTML to PDF:**
```typescript
import puppeteer from 'puppeteer';

async function htmlToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>My Company</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Generate from template
async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Helvetica', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4472C4;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-title {
          font-size: 32px;
          color: #4472C4;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #4472C4;
          color: white;
          padding: 12px;
          text-align: left;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        .amount {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">My Company</div>
        <div class="invoice-info">
          <div class="invoice-title">INVOICE</div>
          <div>Invoice #: ${invoice.number}</div>
          <div>Date: ${invoice.date}</div>
          <div>Due: ${invoice.dueDate}</div>
        </div>
      </div>

      <div class="addresses">
        <div>
          <strong>Bill To:</strong><br>
          ${invoice.customer.name}<br>
          ${invoice.customer.address}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Qty</th>
            <th class="amount">Price</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item) => `
            <tr>
              <td>${item.description}</td>
              <td class="amount">${item.quantity}</td>
              <td class="amount">$${item.price.toFixed(2)}</td>
              <td class="amount">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
          <tr class="total-row">
            <td colspan="3">Subtotal</td>
            <td class="amount">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3">Tax (${invoice.taxRate}%)</td>
            <td class="amount">$${invoice.tax.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td class="amount">$${invoice.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Payment Terms: Net 30</p>
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;

  return htmlToPDF(html);
}
```

---

### 3. jsPDF (Browser/Client-Side)

**Installation:**
```bash
pnpm add jspdf jspdf-autotable
```

**Browser PDF Generation:**
```typescript
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function generateClientPDF(data: any[]) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Sales Report', 105, 20, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

  // Table
  autoTable(doc, {
    head: [['Product', 'Category', 'Quantity', 'Price', 'Total']],
    body: data.map((item) => [
      item.product,
      item.category,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`,
    ]),
    startY: 40,
    theme: 'striped',
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    foot: [
      ['', '', '', 'Total:', `$${data.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)}`],
    ],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold',
    },
  });

  // Save
  doc.save('sales-report.pdf');

  // Or return as blob
  return doc.output('blob');
}

// React component
function DownloadButton({ data }: { data: any[] }) {
  const handleDownload = () => {
    generateClientPDF(data);
  };

  return (
    <button onClick={handleDownload} className="btn btn-primary">
      Download PDF
    </button>
  );
}
```

**Add Images:**
```typescript
import { jsPDF } from 'jspdf';

async function addImageToPDF(doc: jsPDF, imageUrl: string, x: number, y: number, width: number, height: number) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      doc.addImage(dataUrl, 'PNG', x, y, width, height);
      resolve();
    };
    img.src = imageUrl;
  });
}

// Usage
const doc = new jsPDF();
await addImageToPDF(doc, '/logo.png', 10, 10, 40, 20);
doc.text('Company Report', 60, 20);
```

---

### 4. Watermarks

**PDFKit Watermark:**
```typescript
function addWatermark(doc: PDFKit.PDFDocument, text: string) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.save();

  // Rotate and position
  doc.translate(pageWidth / 2, pageHeight / 2);
  doc.rotate(-45);

  // Semi-transparent text
  doc
    .fontSize(60)
    .fillColor('#000000')
    .fillOpacity(0.1)
    .text(text, -150, -30, { align: 'center' });

  doc.restore();
}

// Apply to all pages
function createWatermarkedDocument(content: string, watermark: string) {
  const doc = new PDFDocument({ bufferPages: true });

  // Add content
  doc.text(content);

  // Add watermark to all pages
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    addWatermark(doc, watermark);
  }

  doc.end();
  return doc;
}
```

**Image Watermark:**
```typescript
async function addImageWatermark(doc: PDFKit.PDFDocument, imagePath: string) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Center the watermark image
  const imageWidth = 200;
  const imageHeight = 100;

  doc.save();
  doc.opacity(0.1);
  doc.image(imagePath, (pageWidth - imageWidth) / 2, (pageHeight - imageHeight) / 2, {
    width: imageWidth,
    height: imageHeight,
  });
  doc.restore();
}
```

---

### 5. Charts in PDF

**Using Chart.js with Puppeteer:**
```typescript
async function generateChartPDF(chartData: any): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .chart-container { width: 600px; height: 400px; margin: 20px auto; }
      </style>
    </head>
    <body>
      <h1>Sales Analysis</h1>
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>
      <script>
        const ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(chartData.labels)},
            datasets: [{
              label: 'Sales',
              data: ${JSON.stringify(chartData.values)},
              backgroundColor: '#4472C4',
            }]
          },
          options: {
            responsive: true,
            animation: false,
            plugins: {
              legend: { position: 'top' }
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html);

  // Wait for chart to render
  await page.waitForTimeout(1000);

  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdf);
}
```

---

### 6. Form Fields

**Interactive PDF Forms:**
```typescript
import { PDFDocument, StandardFonts } from 'pdf-lib';

async function createInteractiveForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const form = pdfDoc.getForm();

  // Title
  page.drawText('Registration Form', {
    x: 50,
    y: 350,
    size: 20,
    font,
  });

  // Text field
  page.drawText('Name:', { x: 50, y: 310, size: 12, font });
  const nameField = form.createTextField('name');
  nameField.addToPage(page, { x: 100, y: 295, width: 200, height: 25 });

  // Email field
  page.drawText('Email:', { x: 50, y: 260, size: 12, font });
  const emailField = form.createTextField('email');
  emailField.addToPage(page, { x: 100, y: 245, width: 200, height: 25 });

  // Checkbox
  page.drawText('Subscribe to newsletter:', { x: 50, y: 210, size: 12, font });
  const subscribeBox = form.createCheckBox('subscribe');
  subscribeBox.addToPage(page, { x: 200, y: 200, width: 20, height: 20 });

  // Dropdown
  page.drawText('Country:', { x: 50, y: 160, size: 12, font });
  const countryDropdown = form.createDropdown('country');
  countryDropdown.addOptions(['United States', 'Canada', 'United Kingdom', 'Germany']);
  countryDropdown.addToPage(page, { x: 100, y: 145, width: 200, height: 25 });

  // Radio buttons
  page.drawText('Gender:', { x: 50, y: 110, size: 12, font });
  const genderGroup = form.createRadioGroup('gender');
  genderGroup.addOptionToPage('male', page, { x: 100, y: 95, width: 15, height: 15 });
  page.drawText('Male', { x: 120, y: 95, size: 10, font });
  genderGroup.addOptionToPage('female', page, { x: 170, y: 95, width: 15, height: 15 });
  page.drawText('Female', { x: 190, y: 95, size: 10, font });

  return pdfDoc.save();
}
```

---

## Real-World Examples

### Example 1: Complete Invoice Generator
```typescript
import PDFDocument from 'pdfkit';

interface InvoiceData {
  number: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  customer: {
    name: string;
    address: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number;
  notes?: string;
}

async function generateInvoice(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).fillColor('#4472C4').text(data.company.name, 50, 50);
    doc.fontSize(10).fillColor('#666666').text(data.company.address, 50, 75);
    doc.text(`${data.company.email} | ${data.company.phone}`, 50, 90);

    // Invoice title
    doc.fontSize(24).fillColor('#000000').text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${data.number}`, 400, 80, { align: 'right' });
    doc.text(`Date: ${data.date}`, 400, 95, { align: 'right' });
    doc.text(`Due: ${data.dueDate}`, 400, 110, { align: 'right' });

    // Separator
    doc.strokeColor('#CCCCCC').lineWidth(1).moveTo(50, 130).lineTo(545, 130).stroke();

    // Bill To
    doc.fontSize(12).fillColor('#4472C4').text('Bill To:', 50, 150);
    doc.fontSize(10).fillColor('#000000').text(data.customer.name, 50, 170);
    doc.text(data.customer.address, 50, 185);
    doc.text(data.customer.email, 50, 200);

    // Table header
    const tableTop = 250;
    doc.fillColor('#4472C4').rect(50, tableTop, 495, 25).fill();
    doc.fillColor('#FFFFFF').fontSize(10);
    doc.text('Description', 55, tableTop + 7);
    doc.text('Qty', 300, tableTop + 7, { width: 50, align: 'right' });
    doc.text('Unit Price', 360, tableTop + 7, { width: 80, align: 'right' });
    doc.text('Amount', 450, tableTop + 7, { width: 90, align: 'right' });

    // Table rows
    let y = tableTop + 25;
    let subtotal = 0;

    data.items.forEach((item, index) => {
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;

      if (index % 2 === 0) {
        doc.fillColor('#F5F5F5').rect(50, y, 495, 25).fill();
      }

      doc.fillColor('#000000');
      doc.text(item.description, 55, y + 7, { width: 240 });
      doc.text(item.quantity.toString(), 300, y + 7, { width: 50, align: 'right' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 360, y + 7, { width: 80, align: 'right' });
      doc.text(`$${amount.toFixed(2)}`, 450, y + 7, { width: 90, align: 'right' });

      y += 25;
    });

    // Totals
    y += 10;
    const tax = subtotal * (data.taxRate / 100);
    const total = subtotal + tax;

    doc.fillColor('#F5F5F5').rect(350, y, 195, 75).fill();
    doc.fillColor('#000000');
    doc.text('Subtotal:', 360, y + 10);
    doc.text(`$${subtotal.toFixed(2)}`, 450, y + 10, { width: 90, align: 'right' });
    doc.text(`Tax (${data.taxRate}%):`, 360, y + 30);
    doc.text(`$${tax.toFixed(2)}`, 450, y + 30, { width: 90, align: 'right' });
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total:', 360, y + 55);
    doc.text(`$${total.toFixed(2)}`, 450, y + 55, { width: 90, align: 'right' });

    // Notes
    if (data.notes) {
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text('Notes:', 50, y + 100);
      doc.text(data.notes, 50, y + 115, { width: 400 });
    }

    // Footer
    doc.fontSize(10).fillColor('#666666').text('Thank you for your business!', 50, 750, { align: 'center', width: 495 });

    doc.end();
  });
}
```

### Example 2: Report with Multiple Sections
```typescript
async function generateReport(reportData: ReportData): Promise<Buffer> {
  const doc = new PDFDocument({ bufferPages: true });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  // Cover page
  doc.fontSize(32).text(reportData.title, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(16).text(reportData.subtitle, { align: 'center' });
  doc.moveDown(4);
  doc.fontSize(12).text(`Prepared by: ${reportData.author}`);
  doc.text(`Date: ${reportData.date}`);

  // Table of contents
  doc.addPage();
  doc.fontSize(20).text('Table of Contents');
  doc.moveDown();
  reportData.sections.forEach((section, index) => {
    doc.fontSize(12).text(`${index + 1}. ${section.title}`);
  });

  // Sections
  reportData.sections.forEach((section) => {
    doc.addPage();
    doc.fontSize(18).text(section.title);
    doc.moveDown();
    doc.fontSize(11).text(section.content);

    if (section.table) {
      doc.moveDown();
      drawTable(doc, section.table);
    }
  });

  // Add page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(10).text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });
  }

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}
```

---

## Related Skills

- `excel-sheets-master` - Excel/CSV exports
- `node-backend` - API integration
- `puppeteer-playwright` - Browser automation

## Further Reading

- [PDFKit Documentation](http://pdfkit.org/)
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- [Puppeteer PDF API](https://pptr.dev/api/puppeteer.page.pdf)
- [pdf-lib Documentation](https://pdf-lib.js.org/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
