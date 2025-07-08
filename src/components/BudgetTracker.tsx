import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryManager } from "./CategoryManager";
import { BudgetManager } from "./BudgetManager";
import { TransactionForm } from "./TransactionForm";
import { TransactionHistory } from "./TransactionHistory";
import { Analytics } from "./Analytics";
import { PaymentSummary } from "./PaymentSummary";

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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Others", color: "#6366f1" },
    { id: "2", name: "Clothes", color: "#f59e0b" },
    { id: "3", name: "Educational Fees", color: "#10b981" },
    { id: "4", name: "Entertainment", color: "#ef4444" },
    { id: "5", name: "Groceries", color: "#8b5cf6" },
    { id: "6", name: "Transportation", color: "#06b6d4" },
    { id: "7", name: "Utility Bills", color: "#f97316" }
  ]);

  const [incomeCategories, setIncomeCategories] = useState<Category[]>([
    { id: "income-1", name: "Salary", color: "#22c55e" },
    { id: "income-2", name: "Freelance", color: "#3b82f6" },
    { id: "income-3", name: "Investment", color: "#8b5cf6" },
    { id: "income-4", name: "Others", color: "#6366f1" }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { id: "1", categoryId: "2", amount: 5000, month: selectedMonth },
    { id: "2", categoryId: "3", amount: 8000, month: selectedMonth },
    { id: "3", categoryId: "4", amount: 3000, month: selectedMonth },
    { id: "4", categoryId: "5", amount: 10000, month: selectedMonth },
    { id: "5", categoryId: "6", amount: 3750, month: selectedMonth },
    { id: "6", categoryId: "7", amount: 6200, month: selectedMonth }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", categoryId: "5", amount: 140, description: "Sony ebook", date: "2025-01-08", paymentMethod: "cash", type: "expense" },
    { id: "2", categoryId: "6", amount: 175, description: "Bundle Transportation", date: "2025-01-07", paymentMethod: "cash", type: "expense" },
    { id: "3", categoryId: "3", amount: 350, description: "Blue Petrol Transportation", date: "2025-01-06", paymentMethod: "online", type: "expense" },
    { id: "4", categoryId: "4", amount: 2000, description: "expense of Dairy Groceries", date: "2025-01-05", paymentMethod: "cash", type: "expense" },
    { id: "5", categoryId: "6", amount: 200, description: "RTO card's Recharge Transportation", date: "2025-01-04", paymentMethod: "cash", type: "expense" },
    { id: "6", categoryId: "5", amount: 110, description: "vegetables from apple Groceries", date: "2025-01-03", paymentMethod: "cash", type: "expense" },
    { id: "7", categoryId: "income-1", amount: 45000, description: "Monthly Salary", date: "2025-01-01", paymentMethod: "online", type: "income" },
    { id: "8", categoryId: "income-2", amount: 15000, description: "Website Development Project", date: "2025-01-02", paymentMethod: "online", type: "income" }
  ]);

  const monthlyExpenses = transactions.filter(t => 
    t.type === "expense" && t.date.startsWith(selectedMonth)
  ).reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = transactions.filter(t => 
    t.type === "income" && t.date.startsWith(selectedMonth)
  ).reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budgets.filter(b => b.month === selectedMonth).reduce((sum, b) => sum + b.amount, 0);
  const remaining = totalBudget - monthlyExpenses;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
                Budget & Expense Analyzer
              </h1>
              <p className="text-muted-foreground mt-2">Track your income, expenses, and budgets</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => {
                    const date = new Date();
                    date.setMonth(i);
                    const value = `${date.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-cyber-primary">₹{totalBudget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-cyber-success">₹{monthlyIncome.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-cyber-danger">₹{monthlyExpenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                ₹{remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Categories and Budgets */}
          <div className="lg:col-span-1 space-y-6">
            <CategoryManager 
              categories={categories} 
              setCategories={setCategories}
              incomeCategories={incomeCategories}
              setIncomeCategories={setIncomeCategories}
            />
            <BudgetManager 
              categories={categories}
              budgets={budgets}
              setBudgets={setBudgets}
              selectedMonth={selectedMonth}
            />
          </div>

          {/* Middle Column - Transaction Management */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="expense" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Expenses</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expense" className="space-y-6">
                <TransactionForm
                  categories={categories}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  type="expense"
                />
                <TransactionHistory
                  transactions={transactions.filter(t => t.type === "expense")}
                  categories={categories}
                  setTransactions={setTransactions}
                  selectedMonth={selectedMonth}
                  type="expense"
                />
              </TabsContent>
              
              <TabsContent value="income" className="space-y-6">
                <TransactionForm
                  categories={incomeCategories}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  type="income"
                />
                <TransactionHistory
                  transactions={transactions.filter(t => t.type === "income")}
                  categories={incomeCategories}
                  setTransactions={setTransactions}
                  selectedMonth={selectedMonth}
                  type="income"
                />
              </TabsContent>
            </Tabs>

            <PaymentSummary transactions={transactions} selectedMonth={selectedMonth} />
          </div>

          {/* Right Column - Analytics */}
          <div className="lg:col-span-1">
            <Analytics 
              transactions={transactions}
              categories={[...categories, ...incomeCategories]}
              budgets={budgets}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};