import { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import NotificationsPanel from './NotificationsPanel';

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'EM';

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border" data-testid="app-header">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9 rounded-xl" onClick={onMenuClick} data-testid="menu-toggle-btn">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2 bg-muted/60 hover:bg-muted transition-colors rounded-xl px-3.5 py-2 w-64 cursor-text">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Search anything...</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 rounded-xl" data-testid="theme-toggle-btn">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl relative" onClick={() => setNotifOpen(o => !o)} data-testid="notifications-btn">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-[hsl(var(--primary))] text-white rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 px-2 py-1.5 h-auto rounded-xl" data-testid="profile-dropdown-trigger">
                <Avatar className="h-8 w-8 ring-2 ring-[hsl(var(--primary)/0.2)]">
                  <AvatarFallback className="bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-foreground leading-none">{user?.name || 'Employee'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">User</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">{user?.name || 'Employee'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={logout} data-testid="logout-item">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
