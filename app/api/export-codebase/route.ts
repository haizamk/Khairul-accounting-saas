import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filesToInclude = [
      { name: 'app/page.tsx', desc: 'Main React POS Application Component with Multi-Business, Multi-Tab, CDS, KDS & Bilingual State' },
      { name: 'components/SalesAnalyticsDashboard.tsx', desc: 'Sales Analytics & Stock Dashboard Component with Trend, Peak Hours, Staff & Push Notifications' },
      { name: 'lib/businessCatalog.ts', desc: 'Multi-Business Catalog (Retail, Restaurant, Food Truck, Grocery, Salon, Cafe, Kiosk, Car Wash, Poultry, Services)' },
      { name: 'lib/translations.ts', desc: 'Bilingual Translation Dictionaries (Bahasa Melayu & English)' },
      { name: 'docs/DATABASE_SCHEMA.sql', desc: 'MySQL 8.0+ Production Database Schema, Foreign Keys & Table Definitions' },
      { name: 'docs/ARCHITECTURE_AND_SPECIFICATION.md', desc: 'System Architecture Specification & Technical Blueprint' },
      { name: 'package.json', desc: 'Project Dependencies & Scripts' },
      { name: 'tsconfig.json', desc: 'TypeScript Compiler Configuration' },
      { name: '.env.example', desc: 'Environment Variables Template' },
      { name: 'metadata.json', desc: 'Application Metadata' },
      { name: 'app/layout.tsx', desc: 'Root Next.js App Router Layout' }
    ];

    let fullOutput = `================================================================================\n`;
    fullOutput += `KHAIRUL ePOS & MULTI-BUSINESS SAAS PLATFORM — FULL CODEBASE EXPORT\n`;
    fullOutput += `Generated: ${new Date().toISOString()}\n`;
    fullOutput += `Language: TypeScript / React 19 / Next.js 15 App Router / Tailwind CSS / MySQL 8.0+\n`;
    fullOutput += `Features: 10 Business Verticals, Offline POS, CDS, KDS, Sales Analytics, Stock Alerts, Loyalty & Debt Ledger, Bilingual (BM/EN)\n`;
    fullOutput += `================================================================================\n\n`;

    for (const item of filesToInclude) {
      const fullPath = path.join(process.cwd(), item.name);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        fullOutput += `\n/* =============================================================================\n`;
        fullOutput += ` * FILE: /${item.name}\n`;
        fullOutput += ` * DESCRIPTION: ${item.desc}\n`;
        fullOutput += ` * ============================================================================= */\n\n`;
        fullOutput += content;
        fullOutput += `\n\n`;
      }
    }

    return new NextResponse(fullOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="FULL_CODEBASE_KHAIRUL_EPOS.txt"'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
