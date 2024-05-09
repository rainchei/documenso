import { Suspense } from 'react';

import { Caveat, Inter } from 'next/font/google';

import { AxiomWebVitals } from 'next-axiom';
import { PublicEnvScript } from 'next-runtime-env';

import { FeatureFlagProvider } from '@documenso/lib/client-only/providers/feature-flag';
import { LocaleProvider } from '@documenso/lib/client-only/providers/locale';
import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';
import { getServerComponentAllFlags } from '@documenso/lib/server-only/feature-flags/get-server-component-feature-flag';
import { getLocale } from '@documenso/lib/server-only/headers/get-locale';
import { TrpcProvider } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { Toaster } from '@documenso/ui/primitives/toaster';
import { TooltipProvider } from '@documenso/ui/primitives/tooltip';

import { ThemeProvider } from '~/providers/next-theme';
import { PostHogPageview } from '~/providers/posthog';

import './globals.css';

const fontInter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fontCaveat = Caveat({ subsets: ['latin'], variable: '--font-signature' });

export function generateMetadata() {
  return {
    title: {
      template: '%s - Emplying',
      default: 'We Are Emplying',
    },
    description:
      'We Are Emplying. Global employment and HR solutions for individuals and corporates.',
    authors: { name: 'Emplying, Co.' },
    icons: [
      {
        url: '/favicon.png',
        href: '/favicon.png',
      },
    ],
    metadataBase: new URL(NEXT_PUBLIC_WEBAPP_URL() ?? 'http://localhost:3000'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getServerComponentAllFlags();

  const locale = getLocale();

  return (
    <html
      lang="en"
      className={cn(fontInter.variable, fontCaveat.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <PublicEnvScript />
      </head>

      <AxiomWebVitals />

      <Suspense>
        <PostHogPageview />
      </Suspense>

      <body>
        <LocaleProvider locale={locale}>
          <FeatureFlagProvider initialFlags={flags}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <TrpcProvider>{children}</TrpcProvider>
              </TooltipProvider>
            </ThemeProvider>

            <Toaster />
          </FeatureFlagProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
