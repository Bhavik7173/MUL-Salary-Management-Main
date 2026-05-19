import { useState, useEffect } from 'react';
import { summaryApi } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useGoal } from '../context/GoalContext';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function YearlyTrendChart({ year }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { goal } = useGoal();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const promises = MONTHS_SHORT.map(async (label, i) => {
        const month = i + 1;
        if (year === currentYear && month > currentMonth) return { month: label, pay: null, net: null };
        try {
          const res = await summaryApi.get(year, month);
          return {
            month: label,
            pay: res.data?.final_payout ?? res.data?.net_pay ?? 0,
            net: res.data?.net_pay ?? 0,
            gross: res.data?.gross_pay ?? 0,
          };
        } catch {
          return { month: label, pay: null, net: null };
        }
      });
      const results = await Promise.all(promises);
      setData(results);
      setLoading(false);
    };
    fetchAll();
  }, [year]);

  const validData = data.filter(d => d.pay !== null);
  const avg = validData.length ? validData.reduce((s, d) => s + d.pay, 0) / validData.length : 0;
  const max = validData.length ? Math.max(...validData.map(d => d.pay)) : 0;
  const trend = validData.length >= 2 ? validData[validData.length - 1].pay - validData[0].pay : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length || payload[0].value === null) return null;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label} {year}</p>
        <p className="text-[hsl(var(--primary))] font-mono font-bold">€{payload[0].value?.toFixed(2)}</p>
        {goal.enabled && <p className="text-muted-foreground mt-0.5">Goal: €{goal.amount}</p>}
      </div>
    );
  };

  return (
    <div>
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Avg Monthly', value: `€${avg.toFixed(0)}` },
          { label: 'Best Month', value: `€${max.toFixed(0)}` },
          { label: 'Trend', value: `${trend >= 0 ? '+' : ''}€${trend.toFixed(0)}`, icon: trend >= 0 ? TrendingUp : TrendingDown, color: trend >= 0 ? 'text-emerald-600' : 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-sm font-mono font-bold mt-0.5 ${s.color || 'text-foreground'}`}>
              {s.icon && <s.icon className="w-3.5 h-3.5 inline mr-0.5" />}{s.value}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-52 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading {year} data...</span>
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="payGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(231 75% 55%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(231 75% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                tickFormatter={v => `€${v}`} width={55} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {goal.enabled && (
                <ReferenceLine y={goal.amount} stroke="hsl(var(--primary))" strokeDasharray="6 3" strokeOpacity={0.5}
                  label={{ value: `Goal €${goal.amount}`, position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--primary))' }} />
              )}
              <Area type="monotone" dataKey="pay" stroke="hsl(231 75% 55%)" strokeWidth={2.5}
                fill="url(#payGradient)" connectNulls={false}
                dot={{ fill: 'hsl(231 75% 55%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(231 75% 55%)', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
