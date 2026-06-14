import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Zap, BarChart, CalendarDays, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Wallet },
  { name: 'Subscriptions', path: '/subscriptions', icon: CalendarDays },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Electricity', path: '/electricity', icon: Zap },
  { name: 'Analytics', path: '/analytics', icon: BarChart },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur tour-sidebar">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tracker.
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                  isActive ? "text-primary-foreground font-medium shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary rounded-2xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50 px-4 py-3 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-x-auto gap-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 p-2 relative"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground"
              )}>
                <Icon size={22} />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
