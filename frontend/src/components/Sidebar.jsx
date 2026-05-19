import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Upload, 
  FileText, 
  Settings,
  X,
  Wallet,
  BarChart2,
  Palmtree,
  Thermometer,
  ChevronRight,
  LineChart
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/daily-entry', icon: CalendarPlus, label: 'Daily Entry' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/payslip', icon: FileText, label: 'Payslip' },
  { to: '/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/yearly', icon: BarChart2, label: 'Yearly Overview' },
  { to: '/vacation', icon: Palmtree, label: 'Vacation' },
  { to: '/sick-days', icon: Thermometer, label: 'Sick Days' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside 
      className={`
        fixed top-0 left-0 z-50 h-full w-64 
        bg-[hsl(var(--sidebar-bg))]
        border-r border-[hsl(var(--sidebar-border))]
        transition-transform duration-300
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-sm
      `}
      data-testid="sidebar"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-base text-foreground tracking-tight">
              MUL Salary
            </span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Salary Tracker</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors"
          data-testid="sidebar-close-btn"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-4rem)]">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pt-2 pb-1">
          Main Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200 group
              ${isActive 
                ? 'nav-active' 
                : 'text-[hsl(var(--sidebar-text))] hover:bg-muted hover:text-foreground'
              }
            `}
            data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-[hsl(var(--primary))] shadow-sm' 
                    : 'bg-muted group-hover:bg-[hsl(var(--primary)/0.12)]'
                  }`}>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-[hsl(var(--primary))]'}`} />
                </div>
                <span className="text-sm flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Info Card */}
        <div className="mt-6 mx-1 p-4 rounded-xl bg-[hsl(var(--primary)/0.07)] border border-[hsl(var(--primary)/0.15)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <BarChart2 className="w-3 h-3 text-white" />
            </div>
            <p className="text-xs font-semibold text-[hsl(var(--primary))]">
              Contract Info
            </p>
          </div>
          <p className="text-lg font-mono font-bold text-foreground">
            151.67 <span className="text-sm font-normal text-muted-foreground">hrs/mo</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tax Rate: <span className="font-semibold text-foreground">27.64%</span>
          </p>
        </div>
      </nav>
    </aside>
  );
}
