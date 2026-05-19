import { useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { Bell, X, CheckCheck, Trash2, AlertTriangle, Info, AlertCircle, Palmtree, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryIcon = {
  vacation: Palmtree,
  hours: Clock,
  system: Info,
};

const typeStyles = {
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
};

const typeIconStyles = {
  error: 'bg-red-100 dark:bg-red-900/40 text-red-600',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600',
  info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',
  success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600',
};

const TypeIcon = ({ type }) => {
  const icons = { error: AlertCircle, warning: AlertTriangle, info: Info, success: CheckCheck };
  const Icon = icons[type] || Info;
  return <Icon className="w-4 h-4" />;
};

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={panelRef}
      className="absolute top-full right-0 mt-2 w-96 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-heading font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[hsl(var(--primary))] text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Mark all read">
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Clear all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {notifications.map((n) => {
              const CatIcon = categoryIcon[n.category] || Info;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${n.read ? 'opacity-60 bg-muted/30 border-border/40' : typeStyles[n.type] || typeStyles.info}
                  `}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                    ${n.read ? 'bg-muted text-muted-foreground' : typeIconStyles[n.type] || typeIconStyles.info}`}>
                    <TypeIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight">{n.title}</p>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed opacity-90">{n.message}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
