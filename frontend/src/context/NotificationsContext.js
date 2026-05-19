import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { vacationApi, summaryApi } from '../lib/api';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mul-notifications') || '[]');
    } catch { return []; }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notif) => {
    const n = { id: Date.now() + Math.random(), timestamp: new Date().toISOString(), read: false, ...notif };
    setNotifications(prev => {
      // Avoid duplicate same-type notifications
      const filtered = prev.filter(p => p.key !== n.key);
      const updated = [n, ...filtered].slice(0, 20);
      localStorage.setItem('mul-notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('mul-notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('mul-notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('mul-notifications');
  }, []);

  // Fetch and generate notifications on mount
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const today = new Date();
        const [balRes, sumRes] = await Promise.all([
          vacationApi.getBalances(),
          summaryApi.get(today.getFullYear(), today.getMonth() + 1),
        ]);

        balRes.data?.forEach(b => {
          if (b.remaining <= 0) {
            addNotification({ key: `vac-empty-${b.balance_year}`, type: 'error', category: 'vacation', title: 'Vacation Balance Empty', message: `Your ${b.balance_year} vacation days are fully used (${b.used}/${b.total_entitlement} days).` });
          } else if (b.remaining <= 3) {
            addNotification({ key: `vac-low-${b.balance_year}`, type: 'warning', category: 'vacation', title: 'Low Vacation Balance', message: `Only ${b.remaining} vacation days left for ${b.balance_year}.` });
          }
        });

        const azk = sumRes.data?.azk_bank_total;
        if (typeof azk === 'number') {
          if (azk < 0) {
            addNotification({ key: 'azk-negative', type: 'error', category: 'hours', title: 'Negative AZK Bank', message: `Your AZK bank is ${azk.toFixed(2)} hrs. Salary may be reduced next month.` });
          } else if (azk < 5) {
            addNotification({ key: 'azk-low', type: 'warning', category: 'hours', title: 'Low AZK Bank', message: `AZK bank is low at ${azk.toFixed(2)} hrs. Consider working extra hours.` });
          }
        }
      } catch { 
        // Backend not running — add demo notifications
        addNotification({ key: 'demo-welcome', type: 'info', category: 'system', title: 'Welcome to MUL Salary', message: 'Your salary tracker is set up and ready to use.' });
        addNotification({ key: 'demo-vac', type: 'warning', category: 'vacation', title: 'Low Vacation Balance', message: 'Only 2 vacation days remaining for 2026.' });
        addNotification({ key: 'demo-azk', type: 'error', category: 'hours', title: 'Negative AZK Bank', message: 'AZK bank is at -2.5 hrs. Salary may be reduced next month.' });
      }
    };
    checkAlerts();
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, clearAll, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
