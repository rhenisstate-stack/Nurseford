// This is the root layout
import './globals.css';
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LeftSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext';
import { RightSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext';
import { ThemeProvider } from '@/lib/contexts/panel/layout/theme/PanelThemeContext';
import { CoursesFilterProvider } from '@/lib/contexts/courses/CoursesFilterContext';
import { APP_NAME } from '@/lib/config/config';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} Systems`,
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`light ${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var pathname = window.location.pathname || '';
                  var isExam = pathname.indexOf('/vista/exam') !== -1;
                  if (isExam) {
                    var storedExam = localStorage.getItem('examTheme');
                    var examTheme = storedExam ? JSON.parse(storedExam) : null;
                    var examMode = examTheme && examTheme.global && examTheme.global !== 'default' ? examTheme.global : 'light';
                    if (examMode === 'system') {
                      examMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    if (examMode === 'dark') {
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.setProperty('--content-bg', '#171C27');
                      document.documentElement.style.setProperty('--text-color', '#e2e8f0');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                      document.documentElement.style.setProperty('--content-bg', '#ffffff');
                      document.documentElement.style.setProperty('--text-color', '#0f172a');
                    }
                  } else {
                    var stored = localStorage.getItem('theme');
                    var theme = stored ? JSON.parse(stored) : null;
                    var mode = theme && theme.global && theme.global !== 'default' ? theme.global : 'light';
                    if (mode === 'system') {
                      mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    if (mode === 'dark') {
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.setProperty('--card-bg', '#1E293B');
                      document.documentElement.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.1)');
                      document.documentElement.style.setProperty('--content-bg', '#0b1329');
                      document.documentElement.style.setProperty('--navbar-bg', '#0f172a');
                      document.documentElement.style.setProperty('--leftSidebar-bg', '#0f172a');
                      document.documentElement.style.setProperty('--rightSidebar-bg', '#0f172a');
                      document.documentElement.style.setProperty('--text-color', '#f8fafc');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                      document.documentElement.style.setProperty('--card-bg', '#EEF3FE');
                      document.documentElement.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.5)');
                      document.documentElement.style.setProperty('--content-bg', '#f8fafc');
                      document.documentElement.style.setProperty('--navbar-bg', '#ffffff');
                      document.documentElement.style.setProperty('--leftSidebar-bg', '#f8fafc');
                      document.documentElement.style.setProperty('--rightSidebar-bg', '#f1f5f9');
                      document.documentElement.style.setProperty('--text-color', '#0f172a');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} transition-colors duration-300`}
        style={{
          backgroundColor: "var(--content-bg, #f8fafc)",
          color: "var(--text-color, #0f172a)",
        }}
      >
        <ThemeProvider>
          <LeftSidebarProvider>
            <RightSidebarProvider>
              <Suspense fallback={null}>
                <CoursesFilterProvider>
                  {children}
                </CoursesFilterProvider>
              </Suspense>
            </RightSidebarProvider>
          </LeftSidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
