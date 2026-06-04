import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';

export function OnboardingModal() {
  const { hasCompletedOnboarding, setUserName, completeOnboarding } = useStore();
  const [name, setName] = useState('');

  if (hasCompletedOnboarding) return null;

  const handleComplete = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
    }
    completeOnboarding();
  };

  return (
    <AnimatePresence>
      {!hasCompletedOnboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="w-full max-w-md p-8 bg-card rounded-3xl shadow-2xl border flex flex-col items-center text-center mx-4"
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mb-6 rotate-12">
              <Wallet size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Welcome to your Tracker! ✨</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Let's make managing your finances a little more delightful. What should we call you?
            </p>
            <form onSubmit={handleComplete} className="w-full space-y-4">
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-lg h-14 rounded-2xl bg-secondary/50 border-transparent focus-visible:border-primary"
                autoFocus
              />
              <div className="flex gap-3 w-full pt-4">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl text-muted-foreground" onClick={() => handleComplete()}>
                  Skip
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl font-medium shadow-lg shadow-primary/25">
                  Let's Go!
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
