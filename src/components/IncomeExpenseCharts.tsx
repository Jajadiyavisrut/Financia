import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Transaction, Category } from "./BudgetTracker";

interface IncomeExpenseChartsProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
}

export const IncomeExpenseCharts = ({ transactions, categories, selectedMonth }: IncomeExpenseChartsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWidth, setHasWidth] = useState(false);
  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setHasWidth(width > 0);
      }
    });
    ro.observe(el);
    setHasWidth(el.getBoundingClientRect().width > 0);
    return () => ro.disconnect();
  }, []);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  // Separate income and expense categories for better visualization
  const incomeCategories = categories.filter(c => c.name && monthlyTransactions.some(t => t.type === "income" && t.categoryId === c.id));
  const expenseCategories = categories.filter(c => c.name && monthlyTransactions.some(t => t.type === "expense" && t.categoryId === c.id));

  // Income data
  const incomeData = incomeCategories.map(category => {
    const amount = monthlyTransactions
      .filter(t => t.type === "income" && t.categoryId === category.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return {
      category: category.name,
      amount: amount,
      color: category.color || "#22c55e"
    };
  }).filter(item => item.amount > 0);

  // Expense data
  const expenseData = expenseCategories.map(category => {
    const amount = monthlyTransactions
      .filter(t => t.type === "expense" && t.categoryId === category.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return {
      category: category.name,
      amount: amount,
      color: category.color || "#ef4444"
    };
  }).filter(item => item.amount > 0);

  // Category Distribution Data for bar chart (combining income and expense)
  const categoryDistribution = categories.map(category => {
    const incomeAmount = monthlyTransactions
      .filter(t => t.type === "income" && t.categoryId === category.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const expenseAmount = monthlyTransactions
      .filter(t => t.type === "expense" && t.categoryId === category.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const totalAmount = incomeAmount + expenseAmount;
    
    return {
      name: category.name,
      income: incomeAmount,
      expense: expenseAmount,
      total: totalAmount,
      color: category.color || "#6366f1"
    };
  }).filter(item => item.total > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" ref={containerRef}>
      {/* Income Categories Chart */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-cyber-success">Income by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeData.length > 0 && hasWidth ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="category" 
                  stroke="hsl(var(--foreground))"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
              <YAxis 
                  stroke="hsl(var(--foreground))"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
                  width={50}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Income"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="amount" fill="#22c55e" name="Income" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No income data for this month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories Chart */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-cyber-danger">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseData.length > 0 && hasWidth ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="category" 
                  stroke="hsl(var(--foreground))"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
              <YAxis 
                  stroke="hsl(var(--foreground))"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
                  width={50}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Expense"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="amount" fill="#ef4444" name="Expense" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No expense data for this month
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Category Distribution Bar Chart */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryDistribution.length > 0 && hasWidth ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  fontSize={11}
                  tickFormatter={(value) => `₹${Number(value).toLocaleString()}`}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`, 
                    name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Total'
                  ]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar 
                  dataKey="income" 
                  fill="#22c55e" 
                  name="income" 
                  radius={[2, 2, 0, 0]}
                  stackId="amount"
                />
                <Bar 
                  dataKey="expense" 
                  fill="#ef4444" 
                  name="expense" 
                  radius={[2, 2, 0, 0]}
                  stackId="amount"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
              No transaction data for this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};