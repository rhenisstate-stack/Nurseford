// This is the root layout
import './globals.css';
import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import { LeftSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext';
import { RightSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext';
import { ThemeProvider } from '@/lib/contexts/panel/layout/theme/PanelThemeContext';
import { APP_NAME } from '@/lib/config/config';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
    <html lang="en" className="light" suppressHydrationWarning>
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
                      document.documentElement.style.setProperty('--content-bg', '#000f25');
                      document.documentElement.style.setProperty('--text-color', '#e2e8f0');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                      document.documentElement.style.setProperty('--content-bg', '#faf9f6');
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
                      document.documentElement.style.setProperty('--card-bg', '#15273e');
                      document.documentElement.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.1)');
                      document.documentElement.style.setProperty('--content-bg', '#000f25');
                      document.documentElement.style.setProperty('--navbar-bg', '#000f25');
                      document.documentElement.style.setProperty('--text-color', '#e2e8f0');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                      document.documentElement.style.setProperty('--card-bg', '#EEF3FE');
                      document.documentElement.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.5)');
                      document.documentElement.style.setProperty('--background', '#faf9f6');
                      document.documentElement.style.setProperty('--content-bg', '#faf9f6');
                      document.documentElement.style.setProperty('--navbar-bg', '#faf9f6');
                      document.documentElement.style.setProperty('--leftSidebar-bg', '#faf9f6');
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
        className={`${outfit.className} transition-colors duration-300`}
        style={{
          backgroundColor: "var(--content-bg, #faf9f6)",
          color: "var(--text-color, #0f172a)",
        }}
      >
        <ThemeProvider>
          <LeftSidebarProvider>
            <RightSidebarProvider>
              {children}
            </RightSidebarProvider>
          </LeftSidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
