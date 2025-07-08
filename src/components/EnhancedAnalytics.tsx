import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "cash" | "online" | "card";
  type: "income" | "expense";
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
}

interface EnhancedAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  selectedMonth: string;
}

export const EnhancedAnalytics = ({ transactions, categories, budgets, selectedMonth }: EnhancedAnalyticsProps) => {
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === "expense");
  const monthlyIncome = monthlyTransactions.filter(t => t.type === "income");

  const getBudgetVsActualData = () => {
    const currentBudgets = budgets.filter(b => b.month === selectedMonth);
    
    return currentBudgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const actualSpent = monthlyExpenses
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: category?.name || 'Unknown',
        budget: budget.amount,
        actual: actualSpent,
        remaining: Math.max(0, budget.amount - actualSpent),
        overBudget: Math.max(0, actualSpent - budget.amount)
      };
    });
  };

  const getIncomeExpenseData = () => {
    const totalIncome = monthlyIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'Income', amount: totalIncome, color: '#22c55e' },
      { name: 'Expenses', amount: totalExpense, color: '#ef4444' },
      { name: 'Savings', amount: Math.max(0, totalIncome - totalExpense), color: '#3b82f6' }
    ];
  };

  const getExpenseCategoryData = () => {
    return categories.map(category => {
      const total = monthlyExpenses
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        amount: total,
        color: category.color
      };
    }).filter(item => item.amount > 0);
  };

  return (
    <div className="space-y-6">
      {/* Budget vs Actual Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget vs Actual Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getBudgetVsActualData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual Spent" />
              <Bar dataKey="overBudget" fill="#ff7300" name="Over Budget" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income vs Expenses Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Income vs Expenses Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={getIncomeExpenseData()}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={5}
                dataKey="amount"
              >
                {getIncomeExpenseData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Category Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Expense Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getExpenseCategoryData()}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="amount"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getExpenseCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                labelStyle={{ color: '#000' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};