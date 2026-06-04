import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Zap, Plus, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Electricity() {
  const { 
    electricityBalance, 
    dailyElectricityConsumption, 
    electricityRecharges,
    addElectricityRecharge,
    deleteElectricityRecharge,
    updateDailyConsumption
  } = useStore();
  
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [dailyAmount, setDailyAmount] = useState(dailyElectricityConsumption.toString());

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    addElectricityRecharge(Number(amount));
    toast.success('Electricity recharge successful! ⚡');
    setAmount('');
    setRechargeOpen(false);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyAmount) return;
    updateDailyConsumption(Number(dailyAmount));
    toast.success('Consumption settings updated!');
    setSettingsOpen(false);
  };

  const estimatedDays = Math.max(0, Math.floor(electricityBalance / dailyElectricityConsumption));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Electricity Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your prepaid electricity balance.</p>
      </header>

      <Card className="border-none shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-orange-500">
          <Zap size={120} />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-600/80 dark:text-orange-400/80">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
            ₹{electricityBalance.toLocaleString('en-IN')}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              estimatedDays < 3 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              ~{estimatedDays} days remaining
            </div>
            <span className="text-sm text-muted-foreground">@ ₹{dailyElectricityConsumption}/day</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6">
        <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus size={18} /> Recharge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Recharge Electricity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecharge} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input 
                  type="number" 
                  placeholder="500" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full mt-2">Proceed to Recharge</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2">
              <Settings size={18} /> Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Consumption Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSettings} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Daily Usage (₹/day)</label>
                <Input 
                  type="number" 
                  value={dailyAmount} 
                  onChange={(e) => setDailyAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">This amount will be automatically deducted daily.</p>
              </div>
              <Button type="submit" className="w-full mt-2">Save Settings</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Recharge History</h2>
      <div className="space-y-3">
        {electricityRecharges.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(recharge => (
          <Card key={recharge.id} className="border-none shadow-sm group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-500/10 text-orange-500 shadow-inner">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-medium">Recharge</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(recharge.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold text-lg text-emerald-500">
                  +₹{recharge.amount.toLocaleString('en-IN')}
                </div>
                <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteElectricityRecharge(recharge.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {electricityRecharges.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-card/50 rounded-2xl border border-dashed border-border">
            No recharges yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
