import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme, type ThemeMode } from '@/lib/theme';
import { OuladDataProvider } from '@/lib/dataContext';
import AppRoutes from './routes';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Sun, Moon, Monitor, LayoutDashboard, GraduationCap, Users, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Footer } from '@/components/layout/Footer';

const AppShell = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.setProperty(
      '--glass-bg',
      'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.16), transparent 60%), radial-gradient(circle at 50% 100%, rgba(147,51,234,0.15), transparent 65%)',
    );
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/modules', label: 'Modul', icon: GraduationCap },
    { to: '/students', label: 'Mahasiswa', icon: Users },
    { to: '/insights', label: 'Insight', icon: Sparkles },
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
            <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-3 py-2 transition ${
                      isActive
                        ? 'bg-sky-500/80 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                align="end"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ubah tema"
                    className="rounded-2xl border border-transparent bg-white/60 shadow-inner hover:border-sky-300 hover:bg-white/80 dark:bg-white/10"
                  >
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
              <button
                type="button"
                className="group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white/80 to-slate-200/50 text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_22px_40px_rgba(14,165,233,0.25)] dark:border-white/10 dark:from-slate-900/80 dark:to-slate-900/40 dark:text-slate-200 dark:hover:text-sky-200 lg:hidden"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Buka navigasi"
                aria-expanded={menuOpen}
              >
                <span className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/80 via-transparent to-white/30 opacity-0 transition group-hover:opacity-100 dark:from-sky-500/20 dark:via-transparent dark:to-fuchsia-500/20" />
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </motion.nav>
        </header>
        <AppRoutes />
        <Footer />
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-lg lg:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="relative ml-auto flex h-full w-full max-w-sm flex-col gap-8 overflow-hidden rounded-l-[38px] border border-white/40 bg-gradient-to-br from-white/75 via-white/50 to-sky-100/30 p-6 shadow-[0_30px_65px_rgba(14,165,233,0.25)] backdrop-blur-2xl dark:border-white/10 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-slate-900/40"
            >
              <span className="pointer-events-none absolute -left-24 top-32 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
              <span className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-500/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Navigasi</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    Visualisasi Data
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-slate-600 shadow-lg transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup navigasi"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-3 text-sm font-medium">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        isActive
                          ? 'border-transparent bg-sky-500 text-white shadow-[0_20px_35px_rgba(14,165,233,0.35)]'
                          : 'border-white/50 bg-white/55 text-slate-700 shadow-inner hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white/80 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20'
                      }`
                    }
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base ${
                        location.pathname === to
                          ? 'border-white/30 bg-white/20 text-white'
                          : 'border-white/40 bg-white/40 text-sky-600 dark:border-white/10 dark:bg-white/10 dark:text-sky-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto rounded-3xl border border-white/50 bg-white/55 p-4 text-sm text-slate-600 shadow-inner dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Preferensi Tema</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Pilih mode tampilan langsung dari menu ini sesuai kenyamanan Anda.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleThemeChange(item.id as ThemeMode)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                        theme === item.id
                          ? 'border-transparent bg-sky-500/90 text-white shadow-[0_12px_25px_rgba(14,165,233,0.35)] dark:bg-sky-500/40'
                          : 'border-white/50 bg-white/40 text-slate-600 hover:border-sky-200 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
