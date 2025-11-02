import { Link } from 'react-router-dom';
import {
  Sparkles,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Globe,
  MapPin,
  LayoutDashboard,
  GraduationCap,
  Users,
} from 'lucide-react';

const QUICK_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/modules', label: 'Modul', icon: GraduationCap },
  { to: '/students', label: 'Mahasiswa', icon: Users },
  { to: '/insights', label: 'Insight', icon: Sparkles },
];

const SOCIAL_LINKS = [
  {
    href: 'https://www.linkedin.com/in/amanda-listiana-puspanagara/',
    label: 'LinkedIn',
    icon: Linkedin,
  },
  { href: 'https://www.instagram.com/amndalpnn_', label: 'Instagram', icon: Instagram },
  { href: 'https://github.com/amandalpn', label: 'GitHub', icon: Github },
];

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/80 pb-8 pt-12 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 text-sm text-slate-600 dark:text-slate-300">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-600 shadow-inner dark:bg-sky-500/10 dark:text-sky-200">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">
                  Visualisasi Analitik Pembelajaran
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dashboard analitik pembelajaran berbasis dataset OULAD dengan fokus mahasiswa
                  Indonesia.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/50 bg-white/60 p-4 text-xs text-slate-500 shadow-inner backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-100">Tentang Proyek</p>
              <p className="mt-2 leading-relaxed">
                Menyatukan data aktivitas VLE, demografi, dan outcome akademik agar dosen dan
                pengelola program dapat mengenali pola risiko secara dini. Dibangun responsif
                sehingga nyaman dipakai di desktop maupun perangkat seluler.
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Navigasi
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-slate-700 transition hover:border-sky-200 hover:bg-sky-100/40 hover:text-sky-600 dark:text-slate-200 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10 dark:hover:text-sky-200"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/60 bg-white/60 shadow-inner dark:border-white/10 dark:bg-white/10">
                      <link.icon className="h-4 w-4" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Terhubung
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-500 dark:text-sky-300" />
                Sumedang, Jawa Barat
              </li>

              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-500 dark:text-sky-300" />
                <a
                  href="mailto:amandalpn394@gmail.com"
                  className="hover:text-sky-600 dark:hover:text-sky-200 whitespace-nowrap"
                >
                  amandalpn394@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Globe className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-500 dark:text-sky-300" />
                <a
                  href="https://visualisasi-data-pert6-amanda-listi.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-600 dark:hover:text-sky-200 whitespace-nowrap"
                >
                  visualisasi-data.live
                </a>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white/80 hover:text-sky-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10 dark:hover:text-sky-200"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/40 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-200 md:flex-row md:items-center md:justify-between">
          <span>
            &copy; 2025 Created by{' '}
            <span className="font-semibold">Amanda Listiana Puspanagara • 220660121083</span>
          </span>
          <span>
            Support by <span className="font-semibold">Resilient Academia</span>
          </span>
          <span>
            Dirancang dengan{' '}
            <span className="font-semibold">React, Vite, Tailwind CSS, dan DuckDB</span> di sisi
            browser.
          </span>
        </div>
      </div>
    </footer>
  );
};
