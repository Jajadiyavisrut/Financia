import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
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

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  selectedMonth: string;
}

export const Analytics = ({ transactions, categories, budgets, selectedMonth }: AnalyticsProps) => {
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
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === "expense");
  const monthlyBudgets = budgets.filter(b => b.month === selectedMonth);

  // Budget vs Actual spending data
  const budgetVsActualData = monthlyBudgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const actualSpending = monthlyExpenses
      .filter(t => t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return {
      category: category?.name || "Unknown",
      budget: budget.amount,
      actual: actualSpending,
      color: category?.color || "#6366f1"
    };
  });

  // Expense distribution data
  const expenseCategories = categories.filter(cat => 
    monthlyExpenses.some(t => t.categoryId === cat.id)
  );
  
  const expenseDistributionData = expenseCategories.map(category => {
    const total = monthlyExpenses
      .filter(t => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color
    };
  });

  // Income distribution data
  const incomeCategories = categories.filter(cat => 
    monthlyTransactions.filter(t => t.type === "income").some(t => t.categoryId === cat.id)
  );
  
  const incomeDistributionData = incomeCategories.map(category => {
    const total = monthlyTransactions
      .filter(t => t.categoryId === category.id && t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }}>
            ₹{data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Budget vs Actual Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetVsActualData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              No budgets found for this month
            </div>
          ) : hasWidth ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={budgetVsActualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--foreground))"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="hsl(var(--foreground))" fontSize={10} tickFormatter={(v)=>`₹${Number(v).toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" fill="hsl(var(--cyber-primary))" name="Budget" />
              <Bar dataKey="actual" fill="hsl(var(--cyber-danger))" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-[200px]" />
          )}
        </CardContent>
      </Card>

      {/* Income and Expense Distribution side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Distribution */}
        {expenseDistributionData.length > 0 && hasWidth && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Expense Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {expenseDistributionData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">₹{entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income Distribution (Bar) */}
        {incomeDistributionData.length > 0 && hasWidth && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Income Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--foreground))"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#22c55e" name="Income" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};