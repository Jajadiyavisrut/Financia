import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "./Navigation";
import { MonthYearPicker } from "./MonthYearPicker";
import { CategoryManager } from "./CategoryManager";
import { BudgetManager } from "./BudgetManager";
import { TransactionForm } from "./TransactionForm";
import { TransactionHistory } from "./TransactionHistory";
import { Analytics } from "./Analytics";
import { PaymentSummary } from "./PaymentSummary";
import { EnhancedAnalytics } from "./EnhancedAnalytics";
import { IncomeExpenseCharts } from "./IncomeExpenseCharts";
import { ShareDialog } from "./ShareDialog";
import { MonthlySummary } from "./MonthlySummary";
import { ExportManager } from "./ExportManager";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "cash" | "online" | "card";
  type: "income" | "expense";
}

export const BudgetTracker = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ display_name: string | null } | null>(null);

  // Load data from database
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user?.id)
        .single();

      if (!profileError && profileData) {
        setUserProfile(profileData);
      }
      
      // Load categories and remove duplicates
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id);

      if (categoriesError) throw categoriesError;

      // Remove duplicates by name and type, keep the first occurrence
      const uniqueCategories = categoriesData?.filter((category, index, self) => 
        index === self.findIndex(c => c.name === category.name && c.type === category.type)
      ) || [];

      const expenseCategories = uniqueCategories.filter(c => c.type === 'expense');
      const incomeCategories = uniqueCategories.filter(c => c.type === 'income');

      // Set default categories if none exist
      if (expenseCategories.length === 0) {
        await initializeDefaultCategories();
        return loadData(); // Reload data after initialization
      }

      setCategories(expenseCategories);
      setIncomeCategories(incomeCategories);

      // Load budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id);

      if (budgetsError) throw budgetsError;
      
      // Map budget data to match interface
      const mappedBudgets = budgetsData?.map(budget => ({
        id: budget.id,
        categoryId: budget.category_id,
        amount: Number(budget.amount),
        month: budget.month
      })) || [];
      setBudgets(mappedBudgets);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;
      
      // Map transaction data to match interface
      const mappedTransactions = transactionsData?.map(transaction => ({
        id: transaction.id,
        categoryId: transaction.category_id,
        amount: Number(transaction.amount),
        description: transaction.description,
        date: transaction.date,
        paymentMethod: transaction.payment_method as "cash" | "online" | "card",
        type: transaction.type as "income" | "expense"
      })) || [];
      setTransactions(mappedTransactions);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultCategories = async () => {
    const defaultExpenseCategories = [
      { name: "Others", color: "#6366f1", type: "expense" },
      { name: "Clothes", color: "#f59e0b", type: "expense" },
      { name: "Educational Fees", color: "#10b981", type: "expense" },
      { name: "Entertainment", color: "#ef4444", type: "expense" },
      { name: "Groceries", color: "#8b5cf6", type: "expense" },
      { name: "Transportation", color: "#06b6d4", type: "expense" },
      { name: "Utility Bills", color: "#f97316", type: "expense" }
    ];

    const defaultIncomeCategories = [
      { name: "Salary", color: "#22c55e", type: "income" },
      { name: "Freelance", color: "#3b82f6", type: "income" },
      { name: "Investment", color: "#8b5cf6", type: "income" },
      { name: "Others", color: "#6366f1", type: "income" }
    ];

    const allCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];

    for (const category of allCategories) {
      await supabase
        .from('categories')
        .insert({ ...category, user_id: user?.id });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const monthlyExpenses = transactions.filter(t => 
    t.type === "expense" && t.date.startsWith(selectedMonth)
  ).reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = transactions.filter(t => 
    t.type === "income" && t.date.startsWith(selectedMonth)
  ).reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budgets.filter(b => b.month === selectedMonth).reduce((sum, b) => sum + b.amount, 0);
  const remaining = totalBudget - monthlyExpenses;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="glass-card p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Budget</p>
                <p className="text-lg sm:text-2xl font-bold text-cyber-primary">₹{totalBudget.toLocaleString()}</p>
              </Card>
              <Card className="glass-card p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg sm:text-2xl font-bold text-cyber-success">₹{monthlyIncome.toLocaleString()}</p>
              </Card>
              <Card className="glass-card p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-cyber-danger">₹{monthlyExpenses.toLocaleString()}</p>
              </Card>
              <Card className="glass-card p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg sm:text-2xl font-bold ${remaining >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                  ₹{remaining.toLocaleString()}
                </p>
              </Card>
            </div>
            
            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PaymentSummary transactions={transactions} selectedMonth={selectedMonth} />
              <Analytics 
                transactions={transactions}
                categories={[...categories, ...incomeCategories]}
                budgets={budgets}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>
        );

      case "transactions":
        return (
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expense" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TransactionForm
                  categories={categories}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  type="expense"
                  onDataChange={loadData}
                  selectedMonth={selectedMonth}
                />
                <TransactionHistory
                  transactions={transactions.filter(t => t.type === "expense")}
                  categories={categories}
                  setTransactions={setTransactions}
                  selectedMonth={selectedMonth}
                  type="expense"
                  onDataChange={loadData}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="income" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TransactionForm
                  categories={incomeCategories}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  type="income"
                  onDataChange={loadData}
                  selectedMonth={selectedMonth}
                />
                <TransactionHistory
                  transactions={transactions.filter(t => t.type === "income")}
                  categories={incomeCategories}
                  setTransactions={setTransactions}
                  selectedMonth={selectedMonth}
                  type="income"
                  onDataChange={loadData}
                />
              </div>
            </TabsContent>
          </Tabs>
        );

      case "analytics":
        return (
          <IncomeExpenseCharts 
            transactions={transactions}
            categories={[...categories, ...incomeCategories]}
            selectedMonth={selectedMonth}
          />
        );

      case "reports":
        return (
          <MonthlySummary 
            transactions={transactions}
            categories={[...categories, ...incomeCategories]}
          />
        );

      case "export":
        return (
          <ExportManager 
            transactions={transactions}
            categories={[...categories, ...incomeCategories]}
            budgets={budgets}
          />
        );

      case "settings":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-4">
              <CategoryManager 
                categories={categories} 
                setCategories={setCategories}
                incomeCategories={incomeCategories}
                setIncomeCategories={setIncomeCategories}
              />
            </div>
            <div className="space-y-4">
              <BudgetManager 
                categories={categories}
                budgets={budgets}
                setBudgets={setBudgets}
                selectedMonth={selectedMonth}
              />
              <MonthYearPicker 
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <Card className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
                Financia
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {userProfile?.display_name ? `Welcome back, ${userProfile.display_name}!` : 'Track your income, expenses, and budgets'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Selected Month</p>
                <p className="font-semibold text-cyber-primary">
                  {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <ShareDialog 
                  transactions={transactions}
                  categories={[...categories, ...incomeCategories]}
                  budgets={budgets}
                  selectedMonth={selectedMonth}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 Financia. All rights reserved. Created by Visrut.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};