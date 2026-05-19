import { useState } from 'react';
import { useGoal } from '../context/GoalContext';
import { Target, Edit2, Check, X } from 'lucide-react';

export default function GoalTracker({ currentPay }) {
  const { goal, updateGoal } = useGoal();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goal.amount));

  if (!goal.enabled) return null;

  const pct = goal.amount > 0 ? Math.min((currentPay / goal.amount) * 100, 100) : 0;
  const remaining = Math.max(goal.amount - currentPay, 0);
  const exceeded = currentPay > goal.amount;

  const color = pct >= 100 ? 'hsl(231 75% 55%)' : pct >= 75 ? 'hsl(231 70% 62%)' : pct >= 50 ? 'hsl(43 96% 50%)' : 'hsl(25 95% 55%)';
  const bgColor = pct >= 100 ? 'hsl(231 80% 95%)' : pct >= 75 ? 'hsl(231 80% 95%)' : pct >= 50 ? 'hsl(43 96% 92%)' : 'hsl(25 90% 92%)';

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val > 0) updateGoal({ amount: val });
    setEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-heading">Income Goal</p>
            <p className="text-xs text-muted-foreground">Monthly target</p>
          </div>
        </div>
        <button onClick={() => { setEditing(!editing); setInputVal(String(goal.amount)); }}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full h-9 pl-7 pr-3 rounded-xl border border-input bg-background text-sm
                focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              autoFocus
            />
          </div>
          <button onClick={handleSave} className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditing(false)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-2xl font-heading font-bold text-foreground font-mono">€{currentPay.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground ml-1">/ €{goal.amount.toLocaleString()}</span>
          </div>
          <span className="text-sm font-bold" style={{ color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: bgColor }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        {exceeded ? (
          <span className="text-xs font-semibold text-[hsl(231_75%_55%)]">🎉 Goal exceeded by €{(currentPay - goal.amount).toFixed(0)}!</span>
        ) : (
          <span className="text-xs text-muted-foreground">€{remaining.toFixed(0)} to reach goal</span>
        )}
        <span className="text-xs text-muted-foreground">This month</span>
      </div>
    </div>
  );
}
