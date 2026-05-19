import { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, Wallet, Receipt, Download,
  ArrowUpRight, ArrowDownRight, Calendar, AlertTriangle,
  Palmtree, BarChart2, CircleDot, Zap, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { summaryApi, exportApi, entriesApi, vacationApi } from '../lib/api';
import { toast } from 'sonner';
import GoalTracker from '../components/GoalTracker';
import YearlyTrendChart from '../components/YearlyTrendChart';
import VacationCalendar from '../components/VacationCalendar';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

function CircularProgress({ value, max, size = 80, strokeWidth = 7, color = 'hsl(231 75% 55%)', bgColor = 'hsl(231 80% 95%)', children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((value / max) * 100, 100);
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekEntries, setWeekEntries] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => { fetchSummary(); }, [year, month]);
  useEffect(() => { fetchWeekAndBalances(); }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await summaryApi.get(year, month);
      setSummary(response.data);
    } catch (error) {
      toast.error('Failed to load monthly summary');
    } finally { setLoading(false); }
  };

  const fetchWeekAndBalances = async () => {
    try {
      const today = new Date();
      const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const weekStart = new Date(today); weekStart.setDate(today.getDate() - dow);
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
      const fmt = d => d.toISOString().slice(0, 10);
      const [entRes, balRes] = await Promise.all([
        entriesApi.getAll(today.getFullYear(), today.getMonth() + 1),
        vacationApi.getBalances(),
      ]);
      setWeekEntries(entRes.data.filter(e => e.date >= fmt(weekStart) && e.date <= fmt(weekEnd)).sort((a,b) => a.date.localeCompare(b.date)));
      setBalances(balRes.data);
    } catch {}
  };

  const handleExportExcel = async () => {
    try {
      const response = await exportApi.excel(year, month);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_report_${year}_${String(month).padStart(2, '0')}.xlsx`);
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('Excel exported successfully');
    } catch { toast.error('Failed to export Excel'); }
  };

  const totalHours = summary?.total_worked_hours || 0;
  const payableHours = summary?.payable_hours || 0;
  const contractHours = 151.67;
  const netPay = summary?.final_payout ?? summary?.net_pay ?? 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="section-header">
            <h1 className="text-2xl font-heading font-bold text-foreground">Monthly Summary</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your hours and earnings for {months[month - 1]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-36 rounded-xl border-border h-9" data-testid="month-selector">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-24 rounded-xl border-border h-9" data-testid="year-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportExcel} className="h-9 rounded-xl border-border gap-2 text-sm" data-testid="export-excel-btn">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(() => {
        const alerts = [];
        if (summary?.azk_bank_total < 0)
          alerts.push({ type: 'error', icon: AlertTriangle, msg: `AZK bank is negative (${summary.azk_bank_total.toFixed(2)} hrs). Salary may be reduced.` });
        else if (summary?.azk_bank_total < 5 && summary?.azk_bank_total >= 0)
          alerts.push({ type: 'warn', icon: AlertTriangle, msg: `AZK bank is low (${summary?.azk_bank_total?.toFixed(2)} hrs). Consider working extra hours.` });
        balances.forEach(b => {
          if (b.remaining <= 0) alerts.push({ type: 'error', icon: Palmtree, msg: `${b.balance_year} vacation balance fully used (${b.used}/${b.total_entitlement} days).` });
          else if (b.remaining <= 3) alerts.push({ type: 'warn', icon: Palmtree, msg: `Only ${b.remaining} vacation days left for ${b.balance_year}.` });
        });
        if (!alerts.length) return null;
        return (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                ${a.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/60'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  ${a.type === 'error' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
                  <a.icon className="w-3.5 h-3.5" />
                </div>
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1), unit: 'hrs', max: contractHours, current: totalHours,
            color: 'hsl(231 75% 55%)', bgColor: 'hsl(231 80% 95%)', icon: Clock, iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', sub: `of ${contractHours} hrs contract` },
          { label: 'Payable Hours', value: payableHours.toFixed(1), unit: 'hrs', max: contractHours, current: payableHours,
            color: 'hsl(198 70% 48%)', bgColor: 'hsl(198 60% 92%)', icon: TrendingUp, iconBg: 'bg-sky-50 dark:bg-sky-900/20', iconColor: 'text-sky-600', sub: `worked: ${totalHours.toFixed(1)} hrs` },
          { label: 'AZK Change', value: `${(summary?.azk_change ?? 0) >= 0 ? '+' : ''}${(summary?.azk_change ?? 0).toFixed(1)}`, unit: 'hrs',
            max: 20, current: Math.abs(summary?.azk_change ?? 0),
            color: (summary?.azk_change ?? 0) >= 0 ? 'hsl(231 75% 55%)' : 'hsl(25 95% 55%)',
            bgColor: (summary?.azk_change ?? 0) >= 0 ? 'hsl(231 80% 95%)' : 'hsl(25 90% 92%)',
            icon: (summary?.azk_change ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight,
            iconBg: (summary?.azk_change ?? 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
            iconColor: (summary?.azk_change ?? 0) >= 0 ? 'text-emerald-600' : 'text-orange-600',
            sub: `bank: ${(summary?.azk_bank_total ?? 0).toFixed(1)} hrs` },
          { label: 'Net Pay', value: `€${netPay.toFixed(0)}`, unit: '', max: 5000, current: netPay,
            color: 'hsl(231 75% 55%)', bgColor: 'hsl(231 80% 95%)', icon: Wallet,
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', sub: `gross: €${(summary?.gross_pay ?? 0).toFixed(0)}` },
        ].map((kpi, i) => (
          <Card key={kpi.label} className="card-hover overflow-hidden" data-testid={`kpi-card-${i}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
                <CircularProgress value={kpi.current} max={kpi.max} size={48} strokeWidth={5} color={kpi.color} bgColor={kpi.bgColor}>
                  <span className="text-[8px] font-bold" style={{ color: kpi.color }}>
                    {Math.round(Math.min((kpi.current / kpi.max) * 100, 100))}%
                  </span>
                </CircularProgress>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-heading font-bold text-foreground mt-0.5">
                <span className="font-mono">{kpi.value}</span>
                {kpi.unit && <span className="text-xs font-normal text-muted-foreground ml-1">{kpi.unit}</span>}
              </p>
              {kpi.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal Tracker + Vacation Calendar row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GoalTracker currentPay={netPay} />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-[hsl(var(--primary))]" />
              Vacation Calendar
            </CardTitle>
            <CardDescription className="mt-0.5">Your approved vacation days</CardDescription>
          </CardHeader>
          <CardContent>
            <VacationCalendar />
          </CardContent>
        </Card>
      </div>

      {/* This Week */}
      {weekEntries.length > 0 && (() => {
        const totalHrsWeek = weekEntries.reduce((s, e) => s + (e.working_hours || 0), 0);
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const today = new Date().toISOString().slice(0,10);
        return (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
                  This Week
                </CardTitle>
                <CardDescription className="mt-0.5">Work activity this week</CardDescription>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-lg text-foreground">{totalHrsWeek.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-1">hrs total</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => {
                  const todayDow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const dow = new Date(); dow.setDate(dow.getDate() - todayDow + i);
                  const ds = dow.toISOString().slice(0,10);
                  const entry = weekEntries.find(e => e.date === ds);
                  const isToday = ds === today;
                  const hrs = entry?.working_hours || 0;
                  const pct = Math.min((hrs / 8) * 100, 100);
                  return (
                    <div key={d} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all
                      ${isToday ? 'bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary)/0.3)]' : 'bg-muted/40 hover:bg-muted/70'}`}>
                      <span className={`text-[11px] font-semibold ${isToday ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground'}`}>{d}</span>
                      <div className="w-full h-14 rounded-lg relative overflow-hidden flex items-end bg-muted/60">
                        <div className="w-full rounded-lg transition-all duration-700" style={{
                          height: `${pct}%`,
                          background: hrs >= 6 ? 'linear-gradient(to top, hsl(231 75% 40%), hsl(231 75% 62%))' : hrs > 0 ? 'linear-gradient(to top, hsl(231 50% 72%), hsl(231 50% 80%))' : 'transparent'
                        }} />
                      </div>
                      <span className={`text-[11px] font-mono font-bold ${hrs > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {hrs > 0 ? `${hrs.toFixed(1)}h` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Chart & Financial + Yearly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2" data-testid="hours-chart-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[hsl(var(--primary))]" />
                Daily Hours
              </CardTitle>
              <CardDescription className="mt-0.5">{months[month - 1]} {year} — work hours distribution</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {summary?.daily_hours?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.daily_hours} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: '13px' }}
                      formatter={(v) => [`${v} hrs`, 'Hours']} labelFormatter={(l) => `Day ${l}`}
                      cursor={{ fill: 'hsl(var(--primary)/0.06)', radius: 6 }} />
                    <Bar dataKey="hours" radius={[6,6,0,0]}>
                      {summary.daily_hours.map((e, idx) => (
                        <Cell key={`cell-${idx}`} fill={e.hours >= 6 ? 'hsl(231 75% 55%)' : 'hsl(231 50% 78%)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <CircleDot className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No data available for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card data-testid="financial-summary-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[hsl(var(--primary))]" />
              Payroll Summary
            </CardTitle>
            <CardDescription className="mt-0.5">{months[month - 1]} breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { label: 'Base Pay (taxable)', value: `€${(summary?.gross_pay ?? 0).toFixed(2)}`, type: 'normal' },
              { label: 'Tax (27.64%)', value: `-€${(summary?.tax ?? 0).toFixed(2)}`, type: 'deduct' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-border/60">
                <span className={`text-sm ${r.type === 'deduct' ? 'text-red-500' : 'text-muted-foreground'}`}>{r.label}</span>
                <span className={`font-mono text-sm font-medium ${r.type === 'deduct' ? 'text-red-500' : ''}`}>{r.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 border-b border-border/60 bg-muted/30 -mx-1 px-1 rounded-lg">
              <span className="text-sm font-semibold">Net Earned</span>
              <span className="font-mono font-semibold text-sm">€{(summary?.net_pay ?? 0).toFixed(2)}</span>
            </div>
            {(summary?.bonus_total > 0) && (
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-sm text-emerald-600">+ Bonus (tax-free)</span>
                <span className="font-mono text-sm text-emerald-600 font-medium">+€{summary.bonus_total.toFixed(2)}</span>
              </div>
            )}
            {(summary?.travel_total > 0) && (
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-sm text-emerald-600">+ Travel Allowance</span>
                <span className="font-mono text-sm text-emerald-600 font-medium">+€{summary.travel_total.toFixed(2)}</span>
              </div>
            )}
            {((summary?.meal_total ?? 0) > 0) && (
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-sm text-emerald-600">+ Meal Allowance</span>
                <span className="font-mono text-sm text-emerald-600 font-medium">+€{summary.meal_total.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-3 pt-3 rounded-xl bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] p-3 -mx-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total Monthly Value</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">Final Payout</p>
                </div>
                <span className="font-mono font-bold text-2xl text-[hsl(var(--primary))]">€{netPay.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Earnings Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
            Yearly Earnings Trend
          </CardTitle>
          <CardDescription className="mt-0.5">Net pay across all months of {year}</CardDescription>
        </CardHeader>
        <CardContent>
          <YearlyTrendChart year={year} />
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card data-testid="recent-entries-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
            Recent Entries
          </CardTitle>
          <CardDescription>Last {Math.min(5, summary?.entries?.length || 0)} work log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Start</th><th>End</th><th>Break</th><th>Hours</th><th>Holiday</th><th>Travel</th><th>Bonus</th></tr>
              </thead>
              <tbody>
                {summary?.entries?.slice(0, 5).map((entry) => (
                  <tr key={entry.id}>
                    <td className="font-mono text-xs">{entry.date}</td>
                    <td className="font-mono text-xs">{entry.start_time}</td>
                    <td className="font-mono text-xs">{entry.end_time}</td>
                    <td className="font-mono text-xs">{entry.break_hours}h</td>
                    <td><span className={`font-mono text-xs font-semibold ${entry.working_hours >= 6 ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground'}`}>{entry.working_hours.toFixed(2)}h</span></td>
                    <td>{entry.is_public_holiday ? <span className="text-[11px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">Yes</span> : <span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="font-mono text-xs">€{entry.travel_allowance?.toFixed(2) || '0.00'}</td>
                    <td className="font-mono text-xs">€{entry.bonus?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
                {(!summary?.entries || summary.entries.length === 0) && (
                  <tr><td colSpan={8} className="text-center text-muted-foreground py-10">
                    <div className="flex flex-col items-center gap-2">
                      <CircleDot className="w-6 h-6 opacity-30" />
                      <span className="text-sm">No entries for this period</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
