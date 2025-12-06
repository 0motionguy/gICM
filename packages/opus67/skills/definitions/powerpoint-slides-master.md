# PowerPoint/Slides Master
> **ID:** `powerpoint-slides-master` | **Tier:** 2 | **Token Cost:** 8000

## What This Skill Does

Master programmatic PowerPoint and presentation generation using PptxGenJS and similar libraries. Create professional slide decks, charts, tables, images, animations, and master templates. Build automated report generation systems and data visualization presentations.

## When to Use

- Generating PowerPoint presentations programmatically
- Creating automated report decks from data
- Building slide templates and master slides
- Adding charts, tables, and data visualizations to presentations
- Implementing presentation automation workflows
- Converting data to professional slide formats

## Core Capabilities

### 1. PptxGenJS Setup

#### Installation

```bash
# Install PptxGenJS
pnpm add pptxgenjs

# For Node.js server-side generation
pnpm add pptxgenjs

# TypeScript types included
```

#### Basic Initialization

```typescript
// lib/pptx.ts
import PptxGenJS from 'pptxgenjs';

export function createPresentation(options?: {
  title?: string;
  subject?: string;
  author?: string;
  company?: string;
}) {
  const pptx = new PptxGenJS();

  // Set presentation properties
  if (options?.title) pptx.title = options.title;
  if (options?.subject) pptx.subject = options.subject;
  if (options?.author) pptx.author = options.author;
  if (options?.company) pptx.company = options.company;

  // Set default layout (16:9 widescreen)
  pptx.layout = 'LAYOUT_WIDE';

  return pptx;
}

// Save presentation
export async function savePresentation(
  pptx: PptxGenJS,
  filename: string,
  format: 'file' | 'blob' | 'base64' = 'file'
) {
  switch (format) {
    case 'file':
      await pptx.writeFile({ fileName: filename });
      break;
    case 'blob':
      return await pptx.write({ outputType: 'blob' });
    case 'base64':
      return await pptx.write({ outputType: 'base64' });
  }
}
```

### 2. Professional Slide Layouts

#### Title Slide

```typescript
// lib/slides/title.ts
import PptxGenJS from 'pptxgenjs';

interface TitleSlideOptions {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  logo?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

export function addTitleSlide(pptx: PptxGenJS, options: TitleSlideOptions) {
  const slide = pptx.addSlide();

  // Background
  if (options.backgroundImage) {
    slide.background = { path: options.backgroundImage };
  } else if (options.backgroundColor) {
    slide.background = { color: options.backgroundColor };
  }

  // Title
  slide.addText(options.title, {
    x: 0.5,
    y: 2.5,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
    align: 'center',
  });

  // Subtitle
  if (options.subtitle) {
    slide.addText(options.subtitle, {
      x: 0.5,
      y: 4,
      w: '90%',
      h: 0.75,
      fontSize: 24,
      fontFace: 'Arial',
      color: '666666',
      align: 'center',
    });
  }

  // Author and date
  if (options.author || options.date) {
    const footerText = [options.author, options.date].filter(Boolean).join(' • ');
    slide.addText(footerText, {
      x: 0.5,
      y: 5,
      w: '90%',
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: '999999',
      align: 'center',
    });
  }

  // Logo
  if (options.logo) {
    slide.addImage({
      path: options.logo,
      x: 0.5,
      y: 0.5,
      w: 1.5,
      h: 0.75,
    });
  }

  return slide;
}
```

#### Content Slide with Bullets

```typescript
// lib/slides/content.ts
import PptxGenJS from 'pptxgenjs';

interface ContentSlideOptions {
  title: string;
  bullets: Array<string | { text: string; level?: number }>;
  image?: {
    path: string;
    position: 'left' | 'right';
    width?: number;
  };
}

export function addContentSlide(pptx: PptxGenJS, options: ContentSlideOptions) {
  const slide = pptx.addSlide();

  // Title
  slide.addText(options.title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  // Calculate content area based on image
  const hasImage = !!options.image;
  const contentX = hasImage && options.image?.position === 'right' ? 0.5 : (hasImage ? 5.5 : 0.5);
  const contentW = hasImage ? 4.5 : 9;
  const imageX = options.image?.position === 'right' ? 5.5 : 0.5;

  // Bullet points
  const bulletData = options.bullets.map((bullet) => {
    if (typeof bullet === 'string') {
      return { text: bullet, options: { bullet: true, indentLevel: 0 } };
    }
    return {
      text: bullet.text,
      options: { bullet: true, indentLevel: bullet.level || 0 },
    };
  });

  slide.addText(bulletData, {
    x: contentX,
    y: 1.3,
    w: contentW,
    h: 4,
    fontSize: 18,
    fontFace: 'Arial',
    color: '363636',
    valign: 'top',
    lineSpacingMultiple: 1.5,
  });

  // Image
  if (options.image) {
    slide.addImage({
      path: options.image.path,
      x: imageX,
      y: 1.3,
      w: options.image.width || 4,
      h: 4,
      sizing: { type: 'contain', w: options.image.width || 4, h: 4 },
    });
  }

  return slide;
}
```

#### Two-Column Layout

```typescript
// lib/slides/two-column.ts
import PptxGenJS from 'pptxgenjs';

interface TwoColumnSlideOptions {
  title: string;
  leftColumn: {
    heading?: string;
    content: string[];
  };
  rightColumn: {
    heading?: string;
    content: string[];
  };
}

export function addTwoColumnSlide(pptx: PptxGenJS, options: TwoColumnSlideOptions) {
  const slide = pptx.addSlide();

  // Title
  slide.addText(options.title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  // Left column
  if (options.leftColumn.heading) {
    slide.addText(options.leftColumn.heading, {
      x: 0.5,
      y: 1.2,
      w: 4.5,
      h: 0.5,
      fontSize: 20,
      fontFace: 'Arial',
      bold: true,
      color: '0066CC',
    });
  }

  slide.addText(
    options.leftColumn.content.map((text) => ({
      text,
      options: { bullet: true },
    })),
    {
      x: 0.5,
      y: options.leftColumn.heading ? 1.8 : 1.3,
      w: 4.5,
      h: 3.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: '363636',
      valign: 'top',
    }
  );

  // Right column
  if (options.rightColumn.heading) {
    slide.addText(options.rightColumn.heading, {
      x: 5.2,
      y: 1.2,
      w: 4.5,
      h: 0.5,
      fontSize: 20,
      fontFace: 'Arial',
      bold: true,
      color: '0066CC',
    });
  }

  slide.addText(
    options.rightColumn.content.map((text) => ({
      text,
      options: { bullet: true },
    })),
    {
      x: 5.2,
      y: options.rightColumn.heading ? 1.8 : 1.3,
      w: 4.5,
      h: 3.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: '363636',
      valign: 'top',
    }
  );

  return slide;
}
```

### 3. Charts and Data Visualization

#### Bar Charts

```typescript
// lib/slides/charts.ts
import PptxGenJS from 'pptxgenjs';

interface BarChartData {
  name: string;
  labels: string[];
  values: number[];
}

interface ChartSlideOptions {
  title: string;
  chartData: BarChartData[];
  chartType?: 'bar' | 'bar3D' | 'barStacked';
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export function addBarChartSlide(pptx: PptxGenJS, options: ChartSlideOptions) {
  const slide = pptx.addSlide();

  // Title
  slide.addText(options.title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  // Chart
  slide.addChart(pptx.ChartType[options.chartType || 'bar'], options.chartData, {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4,
    showLegend: options.showLegend ?? true,
    legendPos: 'b',
    showValue: options.showDataLabels ?? false,
    catAxisLabelColor: '363636',
    valAxisLabelColor: '363636',
    chartColors: ['0066CC', '00AA44', 'FF6600', 'CC0066', '9933FF'],
  });

  return slide;
}
```

#### Line Charts

```typescript
// lib/slides/line-chart.ts
import PptxGenJS from 'pptxgenjs';

interface LineChartData {
  name: string;
  labels: string[];
  values: number[];
}

export function addLineChartSlide(
  pptx: PptxGenJS,
  title: string,
  data: LineChartData[],
  options?: {
    showMarkers?: boolean;
    showDataLabels?: boolean;
    smooth?: boolean;
  }
) {
  const slide = pptx.addSlide();

  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  slide.addChart(pptx.ChartType.line, data, {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 4,
    showLegend: true,
    legendPos: 'r',
    lineSize: 2,
    lineSmooth: options?.smooth ?? false,
    showValue: options?.showDataLabels ?? false,
    chartColors: ['0066CC', '00AA44', 'FF6600'],
  });

  return slide;
}
```

#### Pie Charts

```typescript
// lib/slides/pie-chart.ts
import PptxGenJS from 'pptxgenjs';

interface PieChartData {
  name: string;
  labels: string[];
  values: number[];
}

export function addPieChartSlide(
  pptx: PptxGenJS,
  title: string,
  data: PieChartData[],
  options?: {
    showPercent?: boolean;
    showLabel?: boolean;
    is3D?: boolean;
  }
) {
  const slide = pptx.addSlide();

  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  const chartType = options?.is3D ? pptx.ChartType.pie3D : pptx.ChartType.pie;

  slide.addChart(chartType, data, {
    x: 1.5,
    y: 1.3,
    w: 7,
    h: 4,
    showLegend: true,
    legendPos: 'r',
    showPercent: options?.showPercent ?? true,
    showLabel: options?.showLabel ?? false,
    chartColors: ['0066CC', '00AA44', 'FF6600', 'CC0066', '9933FF', 'FFCC00'],
  });

  return slide;
}
```

### 4. Tables

#### Data Tables

```typescript
// lib/slides/tables.ts
import PptxGenJS from 'pptxgenjs';

interface TableSlideOptions {
  title: string;
  headers: string[];
  rows: string[][];
  headerColor?: string;
  headerTextColor?: string;
  alternateRowColor?: string;
}

export function addTableSlide(pptx: PptxGenJS, options: TableSlideOptions) {
  const slide = pptx.addSlide();

  // Title
  slide.addText(options.title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  // Build table data
  const tableData: PptxGenJS.TableRow[] = [];

  // Header row
  tableData.push(
    options.headers.map((header) => ({
      text: header,
      options: {
        bold: true,
        fill: { color: options.headerColor || '0066CC' },
        color: options.headerTextColor || 'FFFFFF',
        align: 'center' as const,
        valign: 'middle' as const,
      },
    }))
  );

  // Data rows
  options.rows.forEach((row, index) => {
    tableData.push(
      row.map((cell) => ({
        text: cell,
        options: {
          fill: {
            color:
              index % 2 === 0
                ? 'FFFFFF'
                : options.alternateRowColor || 'F5F5F5',
          },
          align: 'left' as const,
          valign: 'middle' as const,
        },
      }))
    );
  });

  // Add table
  slide.addTable(tableData, {
    x: 0.5,
    y: 1.3,
    w: 9,
    colW: 9 / options.headers.length,
    rowH: 0.5,
    fontSize: 12,
    fontFace: 'Arial',
    border: { pt: 1, color: 'CCCCCC' },
  });

  return slide;
}
```

#### Comparison Table

```typescript
// lib/slides/comparison.ts
import PptxGenJS from 'pptxgenjs';

interface ComparisonData {
  feature: string;
  options: Array<{
    name: string;
    value: string | boolean;
  }>;
}

export function addComparisonSlide(
  pptx: PptxGenJS,
  title: string,
  data: ComparisonData[]
) {
  const slide = pptx.addSlide();

  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: '363636',
  });

  // Get column headers
  const headers = ['Feature', ...data[0].options.map((o) => o.name)];

  // Build table
  const tableData: PptxGenJS.TableRow[] = [];

  // Header
  tableData.push(
    headers.map((header) => ({
      text: header,
      options: {
        bold: true,
        fill: { color: '0066CC' },
        color: 'FFFFFF',
        align: 'center' as const,
      },
    }))
  );

  // Data rows
  data.forEach((row) => {
    tableData.push([
      { text: row.feature, options: { bold: true } },
      ...row.options.map((opt) => ({
        text: typeof opt.value === 'boolean' ? (opt.value ? '✓' : '✗') : opt.value,
        options: {
          align: 'center' as const,
          color: typeof opt.value === 'boolean' ? (opt.value ? '00AA44' : 'CC0000') : '363636',
        },
      })),
    ]);
  });

  slide.addTable(tableData, {
    x: 0.5,
    y: 1.3,
    w: 9,
    fontSize: 14,
    fontFace: 'Arial',
    border: { pt: 1, color: 'CCCCCC' },
  });

  return slide;
}
```

### 5. Images and Media

#### Image Slides

```typescript
// lib/slides/images.ts
import PptxGenJS from 'pptxgenjs';

interface ImageSlideOptions {
  title?: string;
  images: Array<{
    path: string;
    caption?: string;
  }>;
  layout: 'single' | 'two-up' | 'grid-4';
}

export function addImageSlide(pptx: PptxGenJS, options: ImageSlideOptions) {
  const slide = pptx.addSlide();

  // Title
  if (options.title) {
    slide.addText(options.title, {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.8,
      fontSize: 32,
      fontFace: 'Arial',
      bold: true,
      color: '363636',
    });
  }

  const startY = options.title ? 1.3 : 0.5;

  switch (options.layout) {
    case 'single':
      slide.addImage({
        path: options.images[0].path,
        x: 1,
        y: startY,
        w: 8,
        h: 4.5,
        sizing: { type: 'contain', w: 8, h: 4.5 },
      });
      if (options.images[0].caption) {
        slide.addText(options.images[0].caption, {
          x: 1,
          y: startY + 4.6,
          w: 8,
          h: 0.4,
          fontSize: 12,
          align: 'center',
          color: '666666',
        });
      }
      break;

    case 'two-up':
      options.images.slice(0, 2).forEach((img, i) => {
        slide.addImage({
          path: img.path,
          x: 0.5 + i * 4.75,
          y: startY,
          w: 4.25,
          h: 3.5,
          sizing: { type: 'contain', w: 4.25, h: 3.5 },
        });
        if (img.caption) {
          slide.addText(img.caption, {
            x: 0.5 + i * 4.75,
            y: startY + 3.6,
            w: 4.25,
            h: 0.4,
            fontSize: 11,
            align: 'center',
            color: '666666',
          });
        }
      });
      break;

    case 'grid-4':
      options.images.slice(0, 4).forEach((img, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        slide.addImage({
          path: img.path,
          x: 0.5 + col * 4.75,
          y: startY + row * 2.3,
          w: 4.25,
          h: 2,
          sizing: { type: 'contain', w: 4.25, h: 2 },
        });
      });
      break;
  }

  return slide;
}
```

### 6. Master Slides and Templates

#### Define Master Slide

```typescript
// lib/slides/master.ts
import PptxGenJS from 'pptxgenjs';

interface MasterSlideConfig {
  title: string;
  backgroundColor?: string;
  backgroundImage?: string;
  logo?: {
    path: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  footer?: {
    text: string;
    showSlideNumber?: boolean;
  };
}

export function defineMasterSlide(pptx: PptxGenJS, config: MasterSlideConfig) {
  pptx.defineSlideMaster({
    title: config.title,
    background: config.backgroundImage
      ? { path: config.backgroundImage }
      : { color: config.backgroundColor || 'FFFFFF' },
    objects: [
      // Logo
      ...(config.logo
        ? [
            {
              image: {
                path: config.logo.path,
                x: config.logo.x,
                y: config.logo.y,
                w: config.logo.w,
                h: config.logo.h,
              },
            },
          ]
        : []),
      // Footer
      ...(config.footer
        ? [
            {
              text: {
                text: config.footer.text,
                options: {
                  x: 0.5,
                  y: 5.2,
                  w: 4,
                  h: 0.3,
                  fontSize: 10,
                  color: '999999',
                },
              },
            },
          ]
        : []),
      // Slide number
      ...(config.footer?.showSlideNumber
        ? [
            {
              text: {
                text: { field: 'slidenum' },
                options: {
                  x: 9,
                  y: 5.2,
                  w: 0.5,
                  h: 0.3,
                  fontSize: 10,
                  color: '999999',
                  align: 'right' as const,
                },
              },
            },
          ]
        : []),
    ],
  });
}

// Use master slide
export function addSlideWithMaster(pptx: PptxGenJS, masterName: string) {
  return pptx.addSlide({ masterName });
}
```

### 7. Complete Presentation Generator

```typescript
// lib/presentation-generator.ts
import PptxGenJS from 'pptxgenjs';
import { addTitleSlide } from './slides/title';
import { addContentSlide } from './slides/content';
import { addBarChartSlide } from './slides/charts';
import { addTableSlide } from './slides/tables';
import { defineMasterSlide } from './slides/master';

interface PresentationConfig {
  title: string;
  subtitle?: string;
  author: string;
  company: string;
  date: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

interface SlideContent {
  type: 'title' | 'content' | 'chart' | 'table' | 'image' | 'section';
  data: any;
}

export async function generatePresentation(
  config: PresentationConfig,
  slides: SlideContent[]
): Promise<Blob> {
  const pptx = new PptxGenJS();

  // Set properties
  pptx.title = config.title;
  pptx.author = config.author;
  pptx.company = config.company;
  pptx.layout = 'LAYOUT_WIDE';

  // Define master slide
  defineMasterSlide(pptx, {
    title: 'MASTER_SLIDE',
    backgroundColor: 'FFFFFF',
    logo: config.logo
      ? { path: config.logo, x: 0.3, y: 0.2, w: 1, h: 0.5 }
      : undefined,
    footer: {
      text: `${config.company} | ${config.date}`,
      showSlideNumber: true,
    },
  });

  // Add slides
  slides.forEach((slideContent) => {
    switch (slideContent.type) {
      case 'title':
        addTitleSlide(pptx, {
          title: slideContent.data.title || config.title,
          subtitle: slideContent.data.subtitle || config.subtitle,
          author: config.author,
          date: config.date,
          logo: config.logo,
        });
        break;

      case 'content':
        addContentSlide(pptx, slideContent.data);
        break;

      case 'chart':
        addBarChartSlide(pptx, slideContent.data);
        break;

      case 'table':
        addTableSlide(pptx, slideContent.data);
        break;

      case 'section':
        const sectionSlide = pptx.addSlide();
        sectionSlide.background = {
          color: config.theme?.primaryColor || '0066CC',
        };
        sectionSlide.addText(slideContent.data.title, {
          x: 0.5,
          y: 2.5,
          w: '90%',
          h: 1,
          fontSize: 40,
          fontFace: config.theme?.fontFamily || 'Arial',
          bold: true,
          color: 'FFFFFF',
          align: 'center',
        });
        break;
    }
  });

  // Generate and return blob
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}
```

## Real-World Examples

### Example 1: Sales Report Generator

```typescript
// app/api/reports/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePresentation } from '@/lib/presentation-generator';

export async function POST(request: NextRequest) {
  const { period, data } = await request.json();

  const slides = [
    { type: 'title' as const, data: { subtitle: `Sales Report - ${period}` } },
    {
      type: 'section' as const,
      data: { title: 'Executive Summary' },
    },
    {
      type: 'content' as const,
      data: {
        title: 'Key Highlights',
        bullets: [
          `Total Revenue: $${data.revenue.toLocaleString()}`,
          `Growth: ${data.growth}% vs previous period`,
          `New Customers: ${data.newCustomers}`,
          `Top Product: ${data.topProduct}`,
        ],
      },
    },
    {
      type: 'chart' as const,
      data: {
        title: 'Monthly Revenue Trend',
        chartData: [
          {
            name: 'Revenue',
            labels: data.months,
            values: data.monthlyRevenue,
          },
        ],
        chartType: 'bar',
      },
    },
    {
      type: 'table' as const,
      data: {
        title: 'Regional Performance',
        headers: ['Region', 'Revenue', 'Growth', 'Target'],
        rows: data.regions.map((r: any) => [
          r.name,
          `$${r.revenue.toLocaleString()}`,
          `${r.growth}%`,
          r.targetMet ? 'Met' : 'Missed',
        ]),
      },
    },
  ];

  const blob = await generatePresentation(
    {
      title: 'Sales Report',
      author: 'Sales Team',
      company: 'Acme Corp',
      date: new Date().toLocaleDateString(),
    },
    slides
  );

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="sales-report-${period}.pptx"`,
    },
  });
}
```

### Example 2: Project Status Deck

```typescript
// lib/project-status-deck.ts
import PptxGenJS from 'pptxgenjs';

interface ProjectStatus {
  name: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  completion: number;
  milestones: Array<{ name: string; date: string; complete: boolean }>;
  risks: string[];
  nextSteps: string[];
}

export async function generateProjectStatusDeck(project: ProjectStatus) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(project.name, {
    x: 0.5, y: 2.5, w: '90%', h: 1,
    fontSize: 44, bold: true, align: 'center',
  });
  titleSlide.addText('Project Status Update', {
    x: 0.5, y: 3.5, w: '90%', h: 0.5,
    fontSize: 24, color: '666666', align: 'center',
  });

  // Status overview
  const statusSlide = pptx.addSlide();
  statusSlide.addText('Project Overview', {
    x: 0.5, y: 0.3, w: '90%', h: 0.8,
    fontSize: 32, bold: true,
  });

  const statusColor = {
    'on-track': '00AA44',
    'at-risk': 'FF6600',
    'delayed': 'CC0000',
  };

  // Status indicator
  statusSlide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.5, w: 3, h: 1.5,
    fill: { color: statusColor[project.status] },
  });
  statusSlide.addText(project.status.toUpperCase().replace('-', ' '), {
    x: 0.5, y: 1.8, w: 3, h: 1,
    fontSize: 24, bold: true, color: 'FFFFFF', align: 'center',
  });

  // Completion
  statusSlide.addText(`${project.completion}% Complete`, {
    x: 4, y: 1.5, w: 5, h: 1,
    fontSize: 36, bold: true, align: 'center',
  });

  // Progress bar
  statusSlide.addShape(pptx.ShapeType.rect, {
    x: 4, y: 2.5, w: 5, h: 0.3,
    fill: { color: 'E0E0E0' },
  });
  statusSlide.addShape(pptx.ShapeType.rect, {
    x: 4, y: 2.5, w: 5 * (project.completion / 100), h: 0.3,
    fill: { color: '0066CC' },
  });

  return await pptx.write({ outputType: 'blob' });
}
```

## Related Skills

- **excel-sheets-master** - Data source for presentations
- **pdf-report-generator** - Alternative report format
- **chart-visualization** - Advanced charting
- **data-analysis** - Data preparation

## Further Reading

- [PptxGenJS Documentation](https://gitbrent.github.io/PptxGenJS/)
- [PptxGenJS GitHub](https://github.com/gitbrent/PptxGenJS)
- [PowerPoint Design Best Practices](https://support.microsoft.com/en-us/office/design-effective-slides-90426bdf-6f20-4f2c-a72b-5b06a0a81a4f)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
