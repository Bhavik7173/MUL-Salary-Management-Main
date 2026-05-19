import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Palmtree, Loader2 } from 'lucide-react';
import { vacationApi } from '../lib/api';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}

export default function VacationCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [vacationDates, setVacationDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await vacationApi.getEntries(viewYear, viewMonth + 1);
        const dates = new Set();
        res.data?.forEach(entry => {
          const start = new Date(entry.start_date || entry.date);
          const end = new Date(entry.end_date || entry.date);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.add(d.toISOString().slice(0, 10));
          }
        });
        setVacationDates(dates);
      } catch {
        // Demo: show a few sample vacation days
        const demo = new Set();
        demo.add(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-10`);
        demo.add(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-11`);
        demo.add(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-12`);
        setVacationDates(demo);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = today.toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground font-heading">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isVacation = vacationDates.has(dateStr);
            const isWeekend = ((firstDay + day - 1) % 7) >= 5;

            return (
              <div key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium relative transition-all
                  ${isVacation
                    ? 'bg-[hsl(231_75%_55%)] text-white shadow-sm'
                    : isToday
                      ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.4)] font-bold'
                      : isWeekend
                        ? 'text-muted-foreground/60 bg-muted/30'
                        : 'text-foreground hover:bg-muted/60 cursor-default'
                  }`}>
                {day}
                {isVacation && (
                  <Palmtree className="w-2 h-2 absolute bottom-0.5 right-0.5 opacity-70" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(231_75%_55%)]" />
          <span className="text-[10px] text-muted-foreground">Vacation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(var(--primary)/0.12)] ring-1 ring-[hsl(var(--primary)/0.4)]" />
          <span className="text-[10px] text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted/30" />
          <span className="text-[10px] text-muted-foreground">Weekend</span>
        </div>
      </div>
    </div>
  );
}
