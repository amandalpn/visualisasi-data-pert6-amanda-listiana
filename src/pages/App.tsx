import { useEffect } from 'react';
import { BrowserRouter, NavLink } from 'react-router-dom';
import { ThemeProvider, useTheme, type ThemeMode } from '@/lib/theme';
import { OuladDataProvider } from '@/lib/dataContext';
import AppRoutes from './routes';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Sun, Moon, Monitor, LayoutDashboard, GraduationCap, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

const AppShell = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    document.body.style.setProperty(
      '--glass-bg',
      'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.16), transparent 60%), radial-gradient(circle at 50% 100%, rgba(147,51,234,0.15), transparent 65%)',
    );
  }, []);

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  const items = [
    {
      id: 'system',
      label: 'Ikuti Sistem',
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      id: 'light',
      label: 'Mode Terang',
      icon: <Sun className="h-4 w-4" />,
    },
    {
      id: 'dark',
      label: 'Mode Gelap',
      icon: <Moon className="h-4 w-4" />,
    },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-[url('/noise.svg')] bg-cover bg-fixed bg-top text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="min-h-screen bg-gradient-to-br from-white/95 via-white/80 to-slate-200/60 pb-16 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-950/80">
        <header className="sticky top-0 z-40 backdrop-blur-xl">
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-b-3xl border border-slate-200/70 bg-white/90 px-6 py-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40 dark:ring-white/5"
          >
            <NavLink to="/" className="flex items-center gap-3 text-lg font-semibold">
              <Sparkles className="h-6 w-6 text-sky-500" />
              Visualisasi Data - Amanda Listiana
            </NavLink>
            <div className="flex items-center gap-4 text-sm font-medium">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-sky-500/80 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink
                to="/modules"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-sky-500/80 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                  }`
                }
              >
                <GraduationCap className="h-4 w-4" />
                Modul
              </NavLink>
              <NavLink
                to="/students"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-sky-500/80 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                  }`
                }
              >
                <Users className="h-4 w-4" />
                Mahasiswa
              </NavLink>
              <NavLink
                to="/insights"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    isActive
                      ? 'bg-sky-500/80 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                  }`
                }
              >
                <Sparkles className="h-4 w-4" />
                Insight
              </NavLink>
            </div>
            <Dropdown
              align="end"
              trigger={
                <Button variant="ghost" size="icon">
                  <ThemeIcon className="h-5 w-5" />
                </Button>
              }
              items={items.map((item) => ({
                id: item.id,
                label: (
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                    {theme === item.id && <span className="ml-auto text-xs text-sky-500">Aktif</span>}
                  </span>
                ),
                onSelect: () => handleThemeChange(item.id as ThemeMode),
              }))}
            />
          </motion.nav>
        </header>
        <AppRoutes />
      </div>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <OuladDataProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </OuladDataProvider>
  </ThemeProvider>
);

export default App;
