import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Clock, Target,
  ArrowUpRight, ArrowDownRight, Minus, Calculator, Zap, Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, LineChart, Line, Legend
} from 'recharts';
import { summaryApi, settingsApi } from '../lib/api';
import { toast } from 'sonner';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const CONTRACT_HOURS = 151.67;
const TAX_RATE = 0.2764;

function DeltaBadge({ value, suffix = '' }) {
  if (value === null || value === undefined) return <span className="text-xs text-muted-foreground">—</span>;
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full
      ${pos ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
             : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {pos ? '+' : ''}{typeof value === 'number' ? value.toFixed(1) : value}{suffix}
    </span>
  );
}

export default function Analytics() {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [current, setCurrent] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [yearData, setYearData] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const [curRes, prevRes, settRes] = await Promise.all([
        summaryApi.get(year, month),
        summaryApi.get(prevYear, prevMonth),
        settingsApi.get(),
      ]);
      setCurrent(curRes.data);
      setPrevious(prevRes.data);
      setSettings(settRes.data);

      // Fetch all months for the year
      const promises = monthsShort.map(async (label, i) => {
        const m = i + 1;
        if (year === currentYear && m > currentMonth) return { month: label, pay: null, hours: null, tax: null };
        try {
          const r = await summaryApi.get(year, m);
          return {
            month: label,
            pay: r.data?.final_payout ?? r.data?.net_pay ?? 0,
            hours: r.data?.total_worked_hours ?? 0,
            gross: r.data?.gross_pay ?? 0,
            tax: r.data?.tax ?? 0,
          };
        } catch { return { month: label, pay: null, hours: null, tax: null }; }
      });
      setYearData(await Promise.all(promises));
    } catch {
      toast.error('Failed to load analytics data');
    } finally { setLoading(false); }
  };

  // Monthly comparison deltas
  const delta = (key) => {
    if (!current || !previous) return null;
    const c = current[key] ?? 0, p = previous[key] ?? 0;
    return p === 0 ? null : ((c - p) / p) * 100;
  };
  const diff = (key) => {
    if (!current || !previous) return null;
    return (current[key] ?? 0) - (previous[key] ?? 0);
  };

  // Tax savings breakdown
  const grossPay = current?.gross_pay ?? 0;
  const taxPaid = current?.tax ?? 0;
  const bonus = current?.bonus_total ?? 0;
  const travel = current?.travel_total ?? 0;
  const meal = current?.meal_total ?? 0;
  const totalAllowances = bonus + travel + meal;
  const taxSavedOnAllowances = totalAllowances * TAX_RATE;

  // Work patterns — day-of-week breakdown from daily_hours
  const dowPattern = (() => {
    if (!current?.daily_hours?.length) return [];
    const dow = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const totals = Array(7).fill(0);
    const counts = Array(7).fill(0);
    current.daily_hours.forEach(d => {
      const date = new Date(year, month - 1, d.day);
      const wd = date.getDay() === 0 ? 6 : date.getDay() - 1;
      totals[wd] += d.hours || 0;
      if (d.hours > 0) counts[wd]++;
    });
    return dow.map((label, i) => ({
      day: label,
      avg: counts[i] > 0 ? totals[i] / counts[i] : 0,
      total: totals[i],
    }));
  })();

  // Overtime heatmap — days vs 8h target
  const overtimeData = current?.daily_hours?.map(d => ({
    day: d.day,
    hours: d.hours || 0,
    delta: (d.hours || 0) - 8,
    label: d.hours >= 8 ? 'over' : d.hours >= 6 ? 'normal' : d.hours > 0 ? 'short' : 'off',
  })) ?? [];

  const overtimeColors = { over: 'hsl(231 75% 55%)', normal: 'hsl(142 60% 50%)', short: 'hsl(43 96% 55%)', off: 'hsl(220 15% 88%)' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="section-header">
            <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Insights, comparisons and work patterns</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-36 rounded-xl border-border h-9">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24 rounded-xl border-border h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Monthly Comparison ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Month vs Last Month
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Net Pay', cur: current?.final_payout ?? current?.net_pay ?? 0, prev: previous?.final_payout ?? previous?.net_pay ?? 0, format: v => `€${v.toFixed(0)}`, icon: TrendingUp },
            { label: 'Total Hours', cur: current?.total_worked_hours ?? 0, prev: previous?.total_worked_hours ?? 0, format: v => `${v.toFixed(1)}h`, icon: Clock },
            { label: 'Gross Pay', cur: current?.gross_pay ?? 0, prev: previous?.gross_pay ?? 0, format: v => `€${v.toFixed(0)}`, icon: Calculator },
            { label: 'AZK Bank', cur: current?.azk_bank_total ?? 0, prev: previous?.azk_bank_total ?? 0, format: v => `${v.toFixed(1)}h`, icon: Zap },
          ].map((item, i) => {
            const pctDelta = delta(i === 0 ? (current?.final_payout !== undefined ? 'final_payout' : 'net_pay') : i === 1 ? 'total_worked_hours' : i === 2 ? 'gross_pay' : 'azk_bank_total');
            const absDiff = diff(i === 0 ? (current?.final_payout !== undefined ? 'final_payout' : 'net_pay') : i === 1 ? 'total_worked_hours' : i === 2 ? 'gross_pay' : 'azk_bank_total');
            const prevLabel = month === 1 ? `${months[11].slice(0,3)} ${year-1}` : months[month - 2].slice(0, 3);
            return (
              <Card key={item.label} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                    </div>
                    {absDiff !== null && <DeltaBadge value={pctDelta} suffix="%" />}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-xl font-heading font-bold text-foreground font-mono mt-0.5">{item.format(item.cur)}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">{prevLabel}:</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{item.format(item.prev)}</span>
                    {absDiff !== null && (
                      <span className={`text-[11px] font-semibold ${absDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        ({absDiff >= 0 ? '+' : ''}{item.format(Math.abs(absDiff))})
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Side-by-side bar comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[hsl(var(--primary))]" />
            Daily Hours: This Month vs Last Month
          </CardTitle>
          <CardDescription>Overlay of daily work hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            {current?.daily_hours?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart barGap={2} barSize={8}
                  data={current.daily_hours.map((d, i) => ({
                    day: d.day,
                    current: d.hours || 0,
                    previous: previous?.daily_hours?.[i]?.hours || 0,
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v, name) => [`${v}h`, name === 'current' ? 'This Month' : 'Last Month']} />
                  <Legend formatter={v => v === 'current' ? months[month-1].slice(0,3) : (month === 1 ? months[11].slice(0,3) : months[month-2].slice(0,3))}
                    wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="previous" fill="hsl(220 15% 85%)" radius={[4,4,0,0]} />
                  <Bar dataKey="current" fill="hsl(231 75% 55%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Tax Savings Estimator ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Tax Savings Estimator
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">Allowance Breakdown</CardTitle>
              <CardDescription>How your allowances reduce tax liability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Bonus (tax-free)', amount: bonus, saved: bonus * TAX_RATE, color: 'bg-[hsl(231_75%_55%)]' },
                { label: 'Travel Allowance', amount: travel, saved: travel * TAX_RATE, color: 'bg-sky-500' },
                { label: 'Meal Allowance', amount: meal, saved: meal * TAX_RATE, color: 'bg-violet-500' },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-foreground">€{item.amount.toFixed(2)}</span>
                      <span className="text-xs text-emerald-600 font-semibold">saves €{item.saved.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${totalAllowances > 0 ? (item.amount / totalAllowances) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between bg-[hsl(var(--primary)/0.06)] rounded-xl p-3 -mx-1">
                <div>
                  <p className="text-xs text-muted-foreground">Total Tax Saved</p>
                  <p className="text-sm font-semibold text-foreground">via tax-free allowances</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-heading font-bold text-[hsl(var(--primary))] font-mono">€{taxSavedOnAllowances.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">Tax vs Net Pay</CardTitle>
              <CardDescription>Visual breakdown of where your gross goes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Gross Pay', value: grossPay, color: 'bg-[hsl(231_75%_55%)]', pct: 100 },
                  { label: 'Tax Paid', value: -taxPaid, color: 'bg-red-400', pct: grossPay > 0 ? (taxPaid / grossPay) * 100 : 0 },
                  { label: 'Net Earned', value: grossPay - taxPaid, color: 'bg-sky-500', pct: grossPay > 0 ? ((grossPay - taxPaid) / grossPay) * 100 : 0 },
                  { label: 'Tax-free Extras', value: totalAllowances, color: 'bg-emerald-500', pct: grossPay > 0 ? (totalAllowances / grossPay) * 100 : 0 },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                      <div className={`h-full rounded-lg ${item.color} transition-all duration-700 flex items-center px-2`}
                        style={{ width: `${Math.min(item.pct, 100)}%` }}>
                        {item.pct > 15 && <span className="text-white text-[10px] font-bold">{item.pct.toFixed(0)}%</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-semibold w-20 text-right ${item.value < 0 ? 'text-red-500' : 'text-foreground'}`}>
                      {item.value < 0 ? '-' : ''}€{Math.abs(item.value).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Work Pattern Insights ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Work Pattern Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Day of week avg */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">Avg Hours by Day of Week</CardTitle>
              <CardDescription>Your most and least productive days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {dowPattern.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dowPattern} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                        formatter={v => [`${v.toFixed(1)}h avg`, 'Hours']} />
                      <Bar dataKey="avg" radius={[6,6,0,0]}>
                        {dowPattern.map((d, i) => (
                          <Cell key={i} fill={d.avg >= 7.5 ? 'hsl(231 75% 55%)' : d.avg >= 6 ? 'hsl(231 65% 70%)' : 'hsl(220 15% 80%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>
                )}
              </div>
              {dowPattern.length > 0 && (() => {
                const sorted = [...dowPattern].sort((a,b) => b.avg - a.avg);
                return (
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🏆 Best: <strong className="text-foreground">{sorted[0]?.day}</strong> ({sorted[0]?.avg.toFixed(1)}h)</span>
                    <span>😴 Slowest: <strong className="text-foreground">{sorted[sorted.length-1]?.day}</strong> ({sorted[sorted.length-1]?.avg.toFixed(1)}h)</span>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Overtime heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">Overtime Heatmap</CardTitle>
              <CardDescription>Each day vs 8h target — blue = over, green = on track</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {overtimeData.slice(0, 35).map((d) => (
                  <div key={d.day}
                    className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-default"
                    style={{ backgroundColor: overtimeColors[d.label], color: d.label === 'off' ? 'hsl(var(--muted-foreground))' : 'white' }}
                    title={`Day ${d.day}: ${d.hours}h (${d.delta >= 0 ? '+' : ''}${d.delta.toFixed(1)}h vs target)`}>
                    {d.day}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[10px]">
                {[
                  { label: 'Over 8h', color: 'bg-[hsl(231_75%_55%)]' },
                  { label: '6–8h', color: 'bg-emerald-500' },
                  { label: 'Under 6h', color: 'bg-amber-400' },
                  { label: 'No log', color: 'bg-muted' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${l.color}`} />
                    <span className="text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Yearly Pay Trend ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
            Gross vs Net Pay — Full Year {year}
          </CardTitle>
          <CardDescription>Monthly gross pay vs net pay comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={55} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v, name) => [v !== null ? `€${v.toFixed(2)}` : '—', name === 'gross' ? 'Gross Pay' : 'Net Pay']} />
                <Legend formatter={v => v === 'gross' ? 'Gross Pay' : 'Net Pay'} wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="gross" stroke="hsl(220 15% 75%)" strokeWidth={2} dot={false} connectNulls={false} strokeDasharray="5 3" />
                <Line type="monotone" dataKey="pay" stroke="hsl(231 75% 55%)" strokeWidth={2.5} connectNulls={false}
                  dot={{ fill: 'hsl(231 75% 55%)', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'hsl(231 75% 55%)', stroke: 'white', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
