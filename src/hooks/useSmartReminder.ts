import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function useSmartReminder() {
  const { expenses } = useStore();

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    const checkTimeAndNotify = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if ((hours === 20 || hours === 21) && minutes === 0) {
        const hasExpenseToday = expenses.some(e => {
          const d = new Date(e.date);
          return d.getDate() === now.getDate() && 
                 d.getMonth() === now.getMonth() && 
                 d.getFullYear() === now.getFullYear();
        });

        if (!hasExpenseToday) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("✨ Don't forget to update today's expenses.", {
              body: "Stay on top of your budget!",
            });
          }
        }
      }

      if (hours === 0 && minutes === 0) {
        useStore.getState().deductDailyElectricity();
        const { electricityBalance } = useStore.getState();
        if (electricityBalance < 200) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("⚡ Low Electricity Balance", {
              body: `Your balance is ₹${electricityBalance}. Please recharge soon!`,
            });
          }
        }
      }
    };

    const interval = setInterval(checkTimeAndNotify, 60000);
    checkTimeAndNotify();

    return () => clearInterval(interval);
  }, [expenses]);
}
