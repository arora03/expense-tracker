import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Goals() {
  const goals = useStore(state => state.goals);
  const addGoal = useStore(state => state.addGoal);
  const addFundsToGoal = useStore(state => state.addFundsToGoal);
  const deleteGoal = useStore(state => state.deleteGoal);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [addingFundsTo, setAddingFundsTo] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  const handleAddGoal = () => {
    if (!name || !targetAmount) {
      toast.error('Please enter name and target amount');
      return;
    }
    addGoal({
      name,
      targetAmount: Number(targetAmount),
      deadline: deadline || undefined
    });
    toast.success('Goal created!');
    setIsAdding(false);
    setName('');
    setTargetAmount('');
    setDeadline('');
  };

  const handleAddFunds = (id: string) => {
    if (!fundAmount || Number(fundAmount) <= 0) return;
    addFundsToGoal(id, Number(fundAmount));
    toast.success('Funds added successfully!');
    setAddingFundsTo(null);
    setFundAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Save up for the things you love</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} /> New Goal
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
          <h3 className="text-lg font-bold">Create New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">What are you saving for?</label>
              <input type="text" placeholder="e.g. New iPhone" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target Amount (₹)</label>
              <input type="number" placeholder="100000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Deadline (Optional)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleAddGoal} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors">Save Goal</button>
          </div>
        </motion.div>
      )}

      {goals.length === 0 && !isAdding && (
         <div className="text-center py-12 text-muted-foreground">
           <Target size={48} className="mx-auto mb-4 opacity-20" />
           <p>No savings goals set yet.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className="bg-card border border-border rounded-3xl p-6 group hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl text-foreground">{goal.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.deadline ? `Target: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline set'}
                  </p>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="p-2 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className={cn(isComplete ? "text-emerald-500" : "text-primary")}>₹{goal.currentAmount} saved</span>
                  <span className="text-muted-foreground">of ₹{goal.targetAmount}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", isComplete ? "bg-emerald-500" : "bg-primary")} 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-right text-xs font-bold text-muted-foreground">{progress.toFixed(1)}%</p>
              </div>

              {addingFundsTo === goal.id ? (
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Amount to add" 
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button onClick={() => handleAddFunds(goal.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90">Add</button>
                  <button onClick={() => setAddingFundsTo(null)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-xl text-sm">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingFundsTo(goal.id)}
                  disabled={isComplete}
                  className={cn(
                    "w-full flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    isComplete 
                      ? "bg-emerald-500/10 text-emerald-600 cursor-default" 
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {isComplete ? 'Goal Reached! 🎉' : <><TrendingUp size={16} /> Add Funds</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
