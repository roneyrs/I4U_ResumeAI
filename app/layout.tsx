import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'I4U Resume | Infraestrutura de Triagem por IA',
  description: 'Desempenho de triagem inteligente e status da infraestrutura.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-surface">
        {children}
      </body>
    </html>
  );
}
