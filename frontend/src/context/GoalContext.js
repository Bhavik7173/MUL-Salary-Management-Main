import { createContext, useContext, useState } from 'react';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const [goal, setGoal] = useState(() => {
    try {
      const stored = localStorage.getItem('mul-income-goal');
      return stored ? JSON.parse(stored) : { amount: 4000, enabled: true };
    } catch { return { amount: 4000, enabled: true }; }
  });

  const updateGoal = (newGoal) => {
    const updated = { ...goal, ...newGoal };
    setGoal(updated);
    localStorage.setItem('mul-income-goal', JSON.stringify(updated));
  };

  return (
    <GoalContext.Provider value={{ goal, updateGoal }}>
      {children}
    </GoalContext.Provider>
  );
}

export const useGoal = () => {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoal must be used within GoalProvider');
  return ctx;
};
