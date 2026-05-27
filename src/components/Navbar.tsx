'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Brain, Presentation, Image as ImageIcon, Settings, LogOut, TrendingUp } from 'lucide-react';
import { logout } from '@/lib/actions';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();


  if (pathname.includes('/auth')) return null;

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Panel', icon: LayoutDashboard },
    { href: '/words', label: 'Kitaplık', icon: BookOpen },
    { href: '/quiz', label: 'Sınav', icon: Brain },
    { href: '/analysis', label: 'Analiz', icon: TrendingUp },
    { href: '/puzzle', label: 'Oyun', icon: Presentation },
    { href: '/story', label: 'Hikaye', icon: ImageIcon },
  ];

  return (
    <div className="navbar-floating-container">
      <nav className="navbar-desktop">
        <Link href="/" className="logo-section">
          <div className="logo-box">
            <BookOpen size={18} />
          </div>
        </Link>

        <div className="nav-divider"></div>

        <div className="nav-links">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill-desktop"
                    className="active-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="nav-link-content">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="nav-divider"></div>

        <div className="nav-actions">
          <Link href="/settings" className={`action-icon ${isActive('/settings') ? 'active' : ''}`} title="Ayarlar">
            <Settings size={20} />
          </Link>

          <form action={async () => { await logout(); }}>
            <button title="Çıkış Yap" className="logout-btn" type="submit">
              <LogOut size={16} />
              <span>Çıkış</span>
            </button>
          </form>
        </div>
      </nav>


      <header className="mobile-top-header">
        <Link href="/" className="logo-section">
          <div className="logo-box">
            <BookOpen size={16} />
          </div>
        </Link>

        <div className="mobile-actions">
          <Link href="/settings" className={`action-icon ${isActive('/settings') ? 'active' : ''}`} title="Ayarlar">
            <Settings size={20} />
          </Link>
          <form action={async () => { await logout(); }}>
            <button title="Çıkış Yap" className="mobile-logout-btn" type="submit">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>

      <nav className="mobile-bottom-nav">
        <div className="mobile-tabs">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-tab-link ${active ? 'active' : ''}`}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill-mobile"
                    className="active-bg-mobile"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="mobile-tab-content">
                  <item.icon size={20} className="tab-icon" />
                  <span className="tab-label">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
