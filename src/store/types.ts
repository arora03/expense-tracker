export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  date: string; // ISO string
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  budgetLimit: number;
  icon?: string;
  color?: string;
}

export interface ElectricityRecharge {
  id: string;
  amount: number;
  date: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface AppState {
  expenses: Expense[];
  categories: Category[];
  electricityBalance: number;
  dailyElectricityConsumption: number;
  electricityRecharges: ElectricityRecharge[];
  lastElectricityDeduction: string | null;

  subscriptions: Subscription[];
  goals: Goal[];

  userName: string | null;
  hasCompletedOnboarding: boolean;
  hasCompletedTour: boolean;
  
  // Actions
  initStore: () => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeTour: () => void;
  
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;
  
  addElectricityRecharge: (amount: number) => void;
  deleteElectricityRecharge: (id: string) => void;
  updateDailyConsumption: (amount: number) => void;
  deductDailyElectricity: () => void; 

  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  addFundsToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
}
