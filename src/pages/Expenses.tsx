import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, Trash2, Edit2, FolderPlus, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

export default function Expenses() {
  const { expenses, categories, addExpense, deleteExpense, addCategory, updateCategory } = useStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');

  const [addCatOpen, setAddCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catBudget, setCatBudget] = useState('');

  const [editCatOpen, setEditCatOpen] = useState(false);
  const [editCatId, setEditCatId] = useState('');
  const [editCatBudget, setEditCatBudget] = useState('');

  const [isScanning, setIsScanning] = useState(false);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.loading('Scanning receipt...', { id: 'scan' });
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      const amounts = text.match(/\d+\.\d{2}/g) || text.match(/\d+/g) || [];
      if (amounts.length > 0) {
        const numbers = amounts.map(Number).filter(n => !isNaN(n));
        if (numbers.length > 0) {
          const maxAmount = Math.max(...numbers);
          setAmount(maxAmount.toString());
          toast.success(`Extracted amount: ₹${maxAmount}`, { id: 'scan' });
        } else {
          toast.error('Could not find amount', { id: 'scan' });
        }
      } else {
        toast.error('Could not find amount in receipt', { id: 'scan' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to scan receipt', { id: 'scan' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    addExpense({
      amount: Number(amount),
      categoryId,
      note,
      date: new Date().toISOString()
    });

    toast.success('Expense added successfully! ✨');
    setAmount('');
    setNote('');
    setOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catBudget) return;
    addCategory({
      name: catName,
      budgetLimit: Number(catBudget),
      color: 'bg-indigo-500' // Default color
    });
    toast.success('Category added successfully!');
    setCatName('');
    setCatBudget('');
    setAddCatOpen(false);
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCatId || !editCatBudget) return;
    updateCategory(editCatId, { budgetLimit: Number(editCatBudget) });
    toast.success('Budget limit updated!');
    setEditCatOpen(false);
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative min-h-full"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage your daily spending.</p>
        </div>
        <Dialog open={addCatOpen} onOpenChange={setAddCatOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FolderPlus size={16} /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input value={catName} onChange={(e) => setCatName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget (₹)</label>
                <Input type="number" value={catBudget} onChange={(e) => setCatBudget(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full mt-2">Save Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Category Budgets */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => {
          const spent = monthlyExpenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
          const percent = Math.min((spent / cat.budgetLimit) * 100, 100) || 0;
          return (
            <Card key={cat.id} className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${cat.color || 'bg-gray-500'} flex items-center justify-center text-white text-xs`}>
                      <Wallet size={14} />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₹{spent} / ₹{cat.budgetLimit}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => {
                      setEditCatId(cat.id);
                      setEditCatBudget(cat.budgetLimit.toString());
                      setEditCatOpen(true);
                    }}>
                      <Edit2 size={12} />
                    </Button>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full rounded-full ${
                      percent > 90 ? 'bg-destructive' : 
                      percent > 75 ? 'bg-orange-500' : 'bg-primary'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={editCatOpen} onOpenChange={setEditCatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Limit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Budget (₹)</label>
              <Input type="number" value={editCatBudget} onChange={(e) => setEditCatBudget(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full mt-2">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expenses List */}
      <h2 className="text-xl font-semibold mt-10 mb-4">All Expenses</h2>
      <div className="space-y-3 pb-24">
        {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
          const cat = categories.find(c => c.id === expense.categoryId);
          return (
            <Card key={expense.id} className="border-none shadow-sm group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat?.color || 'bg-gray-500'} text-white shadow-inner`}>
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{cat?.name || 'Unknown'} {expense.note && <span className="text-muted-foreground text-sm font-normal ml-2">({expense.note})</span>}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-lg">
                    -₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteExpense(expense.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Floating Action Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl shadow-primary/40 flex items-center justify-center z-50"
          >
            <Plus size={24} />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Amount (₹)</label>
                <label className="text-xs font-medium text-primary flex items-center gap-1 cursor-pointer hover:underline bg-primary/10 px-2 py-1 rounded-md transition-colors">
                  <Camera size={14} />
                  {isScanning ? 'Scanning...' : 'Scan Receipt'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} disabled={isScanning} />
                </label>
              </div>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (Optional)</label>
              <Input 
                placeholder="What was this for?" 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-2">Save Expense</Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
