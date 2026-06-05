import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, CalendarDays, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function Subscriptions() {
  const subscriptions = useStore(state => state.subscriptions);
  const addSubscription = useStore(state => state.addSubscription);
  const deleteSubscription = useStore(state => state.deleteSubscription);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');

  const handleAdd = () => {
    if (!name || !amount || !nextBillingDate) {
      toast.error('Please fill in all fields');
      return;
    }
    addSubscription({
      name,
      amount: Number(amount),
      billingCycle,
      nextBillingDate
    });
    toast.success('Subscription added!');
    setIsAdding(false);
    setName('');
    setAmount('');
  };

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((acc, sub) => {
      return acc + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage your recurring bills</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Monthly Run Rate</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            ₹{calculateMonthlyTotal().toFixed(2)}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <CreditCard size={24} />
        </div>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
          <h3 className="text-lg font-bold">New Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Name (e.g. Netflix)</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Billing Cycle</label>
              <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as any)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Next Billing Date</label>
              <input type="date" value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleAdd} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors">Save</button>
          </div>
        </motion.div>
      )}

      {subscriptions.length === 0 && !isAdding && (
         <div className="text-center py-12 text-muted-foreground">
           <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
           <p>No subscriptions tracked yet.</p>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptions.map(sub => (
          <div key={sub.id} className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">{sub.name}</h3>
                <p className="text-sm text-muted-foreground">Renews {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-foreground">₹{sub.amount}</p>
                <p className="text-xs text-muted-foreground capitalize">{sub.billingCycle}</p>
              </div>
              <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
