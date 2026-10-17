import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Khairul POS SaaS',
  description: 'Multi-Tenant Commercial POS SaaS Platform with Company Isolation, Fast Touch Cashier Workflow, and Receipt Generation',
  openGraph: {
    title: 'Khairul POS SaaS',
    description: 'Multi-Tenant Commercial POS SaaS Platform with Company Isolation, Fast Touch Cashier Workflow, and Receipt Generation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khairul POS SaaS',
    description: 'Multi-Tenant Commercial POS SaaS Platform with Company Isolation, Fast Touch Cashier Workflow, and Receipt Generation',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
