import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Wallet, Zap, TrendingDown } from 'lucide-react';
import { useEffect } from 'react';

export default function Dashboard() {
  const { expenses, categories, electricityBalance, deductDailyElectricity, userName } = useStore();

  useEffect(() => {
    deductDailyElectricity();
  }, [deductDailyElectricity]);

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = Math.min((totalSpent / totalBudget) * 100, 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userName ? `Welcome back, ${userName} 👋` : 'Overview'}
          </h1>
          <p className="text-muted-foreground mt-1">Track your spending patterns.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tour-dashboard-stats">
        <Card className="border-none shadow-sm bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-foreground">₹{totalSpent.toLocaleString('en-IN')}</div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-emerald-500 font-medium">₹{remaining.toLocaleString('en-IN')}</span> remaining out of ₹{totalBudget.toLocaleString('en-IN')}
            </p>
            
            <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${spentPercentage}%` }}
                className={`h-full rounded-full ${
                  spentPercentage > 90 ? 'bg-destructive' : 
                  spentPercentage > 75 ? 'bg-orange-500' : 'bg-primary'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-500/20 tour-electricity">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-orange-500">
            <Zap size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600/80 dark:text-orange-400/80">Electricity Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
              ₹{electricityBalance.toLocaleString('en-IN')}
            </div>
            {electricityBalance <= 100 && (
              <p className="text-sm text-destructive font-medium mt-2 flex items-center gap-1">
                <Zap size={14} /> Balance is running low. Recharge soon!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-10 mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {monthlyExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(expense => {
          const cat = categories.find(c => c.id === expense.categoryId);
          return (
            <Card key={expense.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat?.color || 'bg-gray-500'} text-white shadow-inner`}>
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{cat?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-lg">
                  -₹{expense.amount.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {monthlyExpenses.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
            No expenses yet this month.
          </div>
        )}
      </div>
    </motion.div>
  );
}
