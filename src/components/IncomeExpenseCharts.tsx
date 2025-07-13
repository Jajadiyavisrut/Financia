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
  
  // Separate income and expense categories for better visualization
  const incomeCategories = categories.filter(c => c.name && monthlyTransactions.some(t => t.type === "income" && t.categoryId === c.id));
  const expenseCategories = categories.filter(c => c.name && monthlyTransactions.some(t => t.type === "expense" && t.categoryId === c.id));

  // Income data
  const incomeData = incomeCategories.map(category => {
    const amount = monthlyTransactions
      .filter(t => t.type === "income" && t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    
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
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      category: category.name,
      amount: amount,
      color: category.color || "#ef4444"
    };
  }).filter(item => item.amount > 0);

  // Expense Category Breakdown Data for pie chart
  const expenseBreakdown = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId);
      if (category) {
        acc[category.name] = (acc[category.name] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expenseBreakdown).map(([name, amount]) => {
    const category = categories.find(c => c.name === name);
    return {
      name,
      amount,
      fill: category?.color || "#ef4444"
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Income Categories Chart */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-cyber-success">Income by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeData.length > 0 ? (
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
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
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
          {expenseData.length > 0 ? (
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
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
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
      
      {/* Expense Category Breakdown Pie Chart */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Expense Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => 
                    percent > 3 ? `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)` : ''
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                  fontSize={11}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount Spent"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
              No expense data for this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};