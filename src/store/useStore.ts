import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from './types';
import { supabase } from '@/lib/supabase';

// Generate valid UUIDs for default categories
const defaultCategories = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Grocery', budgetLimit: 5000, icon: 'ShoppingCart', color: 'bg-emerald-500' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Travel', budgetLimit: 2000, icon: 'Car', color: 'bg-blue-500' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Food', budgetLimit: 3000, icon: 'Utensils', color: 'bg-orange-500' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Shopping', budgetLimit: 4000, icon: 'ShoppingBag', color: 'bg-pink-500' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Entertainment', budgetLimit: 2000, icon: 'Gamepad2', color: 'bg-purple-500' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Health', budgetLimit: 1500, icon: 'HeartPulse', color: 'bg-rose-500' },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Miscellaneous', budgetLimit: 1000, icon: 'Sparkles', color: 'bg-gray-500' }
];

export const getOrCreateUser = async (name: string | null) => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  
  // Always attempt to insert the user to ensure they exist in Supabase
  const { error } = await supabase.from('users').insert({ id: deviceId, name: name || 'Anonymous' });
  
  // If no error, it means this is the first time the user was inserted into the database
  if (!error) {
    const supaCats = defaultCategories.map(c => ({
      id: c.id,
      user_id: deviceId,
      name: c.name,
      budget_limit: c.budgetLimit,
      icon: c.icon,
      color: c.color
    }));
    await supabase.from('categories').insert(supaCats);
    await supabase.from('electricity_wallet').insert({ user_id: deviceId });
  }
  
  return deviceId;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      expenses: [],
      categories: defaultCategories,
      electricityBalance: 0,
      dailyElectricityConsumption: 100,
      electricityRecharges: [],
      lastElectricityDeduction: null,
      subscriptions: [],
      goals: [],
      userName: null,
      hasCompletedOnboarding: false,
      hasCompletedTour: false,

      initStore: async () => {
        const deviceId = localStorage.getItem('device_id');
        if (!deviceId) return;
        
        const [usersReq, catsReq, expReq, walletReq, rechReq, subsReq, goalsReq] = await Promise.all([
          supabase.from('users').select('*').eq('id', deviceId).maybeSingle(),
          supabase.from('categories').select('*').eq('user_id', deviceId),
          supabase.from('expenses').select('*').eq('user_id', deviceId),
          supabase.from('electricity_wallet').select('*').eq('user_id', deviceId).maybeSingle(),
          supabase.from('electricity_recharges').select('*').eq('user_id', deviceId),
          supabase.from('subscriptions').select('*').eq('user_id', deviceId),
          supabase.from('goals').select('*').eq('user_id', deviceId)
        ]);

        if (usersReq.data?.name) {
           set({ userName: usersReq.data.name });
        }
        if (catsReq.data && catsReq.data.length > 0) {
           set({ categories: catsReq.data.map(c => ({
             id: c.id, name: c.name, budgetLimit: Number(c.budget_limit), icon: c.icon, color: c.color
           }))});
        }
        if (expReq.data) {
           set({ expenses: expReq.data.map(e => ({
             id: e.id, categoryId: e.category_id, amount: Number(e.amount), note: e.note, date: e.date
           }))});
        }
        if (walletReq.data) {
           set({ 
             electricityBalance: Number(walletReq.data.balance || 0),
             dailyElectricityConsumption: Number(walletReq.data.daily_consumption || 100),
             lastElectricityDeduction: walletReq.data.last_deduction
           });
        } else {
           // Wallet missing in backend, create it and sync
           await supabase.from('electricity_wallet').insert({ user_id: deviceId });
           set({ electricityBalance: 0, dailyElectricityConsumption: 100, lastElectricityDeduction: null });
        }
        if (rechReq.data) {
           set({ electricityRecharges: rechReq.data.map(r => ({
             id: r.id, amount: Number(r.amount), date: r.date
           }))});
        }
        if (subsReq.data) {
           set({ subscriptions: subsReq.data.map(s => ({
             id: s.id, name: s.name, amount: Number(s.amount), billingCycle: s.billing_cycle, nextBillingDate: s.next_billing_date
           }))});
        }
        if (goalsReq.data) {
           set({ goals: goalsReq.data.map(g => ({
             id: g.id, name: g.name, targetAmount: Number(g.target_amount), currentAmount: Number(g.current_amount), deadline: g.deadline
           }))});
        }
      },

      setUserName: async (name) => {
        set({ userName: name });
        const deviceId = await getOrCreateUser(name);
        await supabase.from('users').update({ name }).eq('id', deviceId);
      },
      
      completeOnboarding: async () => {
        set({ hasCompletedOnboarding: true });
        await getOrCreateUser(get().userName);
      },

      completeTour: () => set({ hasCompletedTour: true }),

      addExpense: async (expense) => {
        const id = crypto.randomUUID();
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id }]
        }));
        
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('expenses').insert({
          id,
          user_id: deviceId,
          category_id: expense.categoryId,
          amount: expense.amount,
          note: expense.note,
          date: expense.date
        });
      },

      deleteExpense: async (id) => {
        set((state) => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }));
        await supabase.from('expenses').delete().eq('id', id);
      },

      addCategory: async (category) => {
        const id = crypto.randomUUID();
        set((state) => ({
          categories: [...state.categories, { ...category, id }]
        }));
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('categories').insert({
          id,
          user_id: deviceId,
          name: category.name,
          budget_limit: category.budgetLimit,
          icon: category.icon,
          color: category.color
        });
      },

      updateCategory: async (id, category) => {
        set((state) => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c)
        }));
        if (category.budgetLimit !== undefined) {
          await supabase.from('categories').update({ budget_limit: category.budgetLimit }).eq('id', id);
        }
      },

      deleteCategory: async (id) => {
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id)
        }));
        await supabase.from('categories').delete().eq('id', id);
      },

      addElectricityRecharge: async (amount) => {
        const id = crypto.randomUUID();
        const date = new Date().toISOString();
        
        set((state) => {
          const newBalance = state.electricityBalance + amount;
          return {
            electricityBalance: newBalance,
            electricityRecharges: [
              ...state.electricityRecharges,
              { id, amount, date }
            ]
          };
        });
        
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('electricity_recharges').insert({
          id,
          user_id: deviceId,
          amount,
          date
        });
        await supabase.from('electricity_wallet').update({ balance: get().electricityBalance }).eq('user_id', deviceId);
      },

      deleteElectricityRecharge: async (id) => {
        set((state) => {
          const recharge = state.electricityRecharges.find(r => r.id === id);
          if (!recharge) return state;
          return {
            electricityBalance: state.electricityBalance - recharge.amount,
            electricityRecharges: state.electricityRecharges.filter(r => r.id !== id)
          };
        });
        await supabase.from('electricity_recharges').delete().eq('id', id);
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('electricity_wallet').update({ balance: get().electricityBalance }).eq('user_id', deviceId);
      },

      updateDailyConsumption: async (amount) => {
        set({ dailyElectricityConsumption: amount });
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('electricity_wallet').update({ daily_consumption: amount }).eq('user_id', deviceId);
      },

      deductDailyElectricity: async () => {
        let needsUpdate = false;
        let newBalance = 0;
        let newDate = '';
        
        set((state) => {
          const now = new Date();
          const lastDeductionStr = state.lastElectricityDeduction;
          
          if (!lastDeductionStr) {
            newDate = now.toISOString();
            needsUpdate = true;
            return { lastElectricityDeduction: newDate };
          }

          const lastDate = new Date(lastDeductionStr);
          lastDate.setHours(0, 0, 0, 0);
          
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 0) {
            const deductionAmount = diffDays * state.dailyElectricityConsumption;
            newBalance = state.electricityBalance - deductionAmount;
            newDate = now.toISOString();
            needsUpdate = true;
            return {
              electricityBalance: newBalance,
              lastElectricityDeduction: newDate
            };
          }
          return state;
        });

        if (needsUpdate) {
           const deviceId = await getOrCreateUser(get().userName);
           await supabase.from('electricity_wallet').update({ 
             balance: get().electricityBalance,
             last_deduction: get().lastElectricityDeduction
           }).eq('user_id', deviceId);
        }
      },

      addSubscription: async (sub) => {
        const id = crypto.randomUUID();
        set((state) => ({ subscriptions: [...state.subscriptions, { ...sub, id }] }));
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('subscriptions').insert({
          id, user_id: deviceId, name: sub.name, amount: sub.amount, billing_cycle: sub.billingCycle, next_billing_date: sub.nextBillingDate
        });
      },

      deleteSubscription: async (id) => {
        set((state) => ({ subscriptions: state.subscriptions.filter(s => s.id !== id) }));
        await supabase.from('subscriptions').delete().eq('id', id);
      },

      addGoal: async (goal) => {
        const id = crypto.randomUUID();
        set((state) => ({ goals: [...state.goals, { ...goal, id, currentAmount: 0 }] }));
        const deviceId = await getOrCreateUser(get().userName);
        await supabase.from('goals').insert({
          id, user_id: deviceId, name: goal.name, target_amount: goal.targetAmount, current_amount: 0, deadline: goal.deadline
        });
      },

      addFundsToGoal: async (id, amount) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)
        }));
        const goal = get().goals.find(g => g.id === id);
        if (goal) {
           await supabase.from('goals').update({ current_amount: goal.currentAmount }).eq('id', id);
        }
      },

      deleteGoal: async (id) => {
        set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
        await supabase.from('goals').delete().eq('id', id);
      }
    }),
    {
      name: 'expense-tracker-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version === 0 || version === 1) {
          return {
            ...persistedState,
            expenses: [],
            electricityRecharges: [],
            categories: defaultCategories,
            subscriptions: [],
            goals: []
          };
        }
        return persistedState;
      }
    }
  )
);
