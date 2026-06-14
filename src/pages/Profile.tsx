import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Trash2, Wallet, Target, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function Profile() {
  const { userName, expenses, goals, subscriptions, signOut, deleteAccount } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const monthlySubscriptions = subscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount);
  }, 0);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    // After deleteAccount, signOut is called, which clears state and sends them to onboarding
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your lifetime statistics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Card */}
        <Card className="md:col-span-3 border-none shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userName || 'User'}</h2>
              <p className="text-muted-foreground">Joined recently</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lifetime Expenses</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalExpenses)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalSavings)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Subs</p>
              <h3 className="text-2xl font-bold">{formatCurrency(monthlySubscriptions)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Management */}
      <Card className="border-none shadow-sm mt-8 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>Actions here can result in data loss or sign you out of your current session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-xl">
            <div>
              <h4 className="font-semibold">Sign Out</h4>
              <p className="text-sm text-muted-foreground">Log out of your account on this device. You will need to start fresh or use the same device to restore data.</p>
            </div>
            <Button variant="outline" onClick={signOut} className="flex-shrink-0">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-200 dark:border-red-900/50 bg-red-500/5 rounded-xl">
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400">Delete Account</h4>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data from the database. This action cannot be undone.</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-shrink-0">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and completely wipe all your expenses, subscriptions, and goals from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
