import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Transaction, Category } from "./BudgetTracker";

interface IncomeExpenseChartsProps {
  transactions: Transaction[];
  categories: Category[];
  selectedMonth: string;
}

export const IncomeExpenseCharts = ({ transactions, categories, selectedMonth }: IncomeExpenseChartsProps) => {
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  // Income vs Expenses Overview Data
  const incomeTotal = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenseTotal = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const overviewData = [
    { name: "Income", amount: incomeTotal, fill: "hsl(var(--cyber-success))" },
    { name: "Expenses", amount: expenseTotal, fill: "hsl(var(--cyber-danger))" }
  ];

  // Expense Category Breakdown Data
  const expenseCategories = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        acc[category.name] = (acc[category.name] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expenseCategories).map(([name, amount], index) => {
    const category = categories.find(c => c.name === name);
    return {
      name,
      amount,
      fill: category?.color || `hsl(${index * 45}, 70%, 50%)`
    };
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expenses Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Income vs Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Category Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Expense Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No expense data for this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};