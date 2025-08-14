import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart as BarChartIcon, Calendar } from "lucide-react";

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

interface MonthlySummaryProps {
  transactions: Transaction[];
  categories: Category[];
}

export const MonthlySummary = ({ transactions, categories }: MonthlySummaryProps) => {
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
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [endMonth, setEndMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = -12; i <= 0; i++) { // Changed upper bound to 0 to exclude future months
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const transactionMonth = t.date.substring(0, 7);
      return transactionMonth >= startMonth && transactionMonth <= endMonth;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const getCategoryData = () => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === "expense");
    const categoryTotals = categories.map(category => {
      const total = expenseTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return {
        name: category.name,
        amount: Number(total) || 0,
        color: category.color
      };
    }).filter(item => Number.isFinite(item.amount) && item.amount > 0);

    return categoryTotals;
  };

  const getPaymentMethodData = () => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === "expense");
    const methods = [
      { key: "cash", name: "Cash", color: "#22c55e" },
      { key: "online", name: "Online", color: "#3b82f6" },
      { key: "card", name: "Credit Card", color: "#a855f7" }
    ];

    return methods.map(method => {
      const total = expenseTransactions
        .filter(t => t.paymentMethod === method.key)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: method.name,
        amount: total,
        color: method.color
      };
    }).filter(item => item.amount > 0);
  };

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const analyze = () => {
    // This would trigger the analysis and potentially export functionality
    console.log("Analyzing data for range:", startMonth, "to", endMonth);
  };

  return (
    <Card className="glass-card" ref={containerRef}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          Monthly Range Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Start Month</label>
            <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select start month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">End Month</label>
            <Select value={endMonth} onValueChange={setEndMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select end month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={analyze} className="cyber-glow">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 rounded-lg bg-secondary/30 border border-white/10">
          <h3 className="text-xl font-bold text-center mb-4">
            Expense Report: {monthOptions.find(m => m.value === startMonth)?.label} to {monthOptions.find(m => m.value === endMonth)?.label}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-cyber-success">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-cyber-danger">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                ₹{(totalIncome - totalExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-white/10">
            <h4 className="text-lg font-semibold mb-4 text-center">Category Distribution</h4>
            {getCategoryData().length > 0 && hasWidth ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No expense data in this range
              </div>
            )}
          </div>

          {/* Payment Method Distribution */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-white/10">
            <h4 className="text-lg font-semibold mb-4 text-center">Payment Method Distribution</h4>
            {getPaymentMethodData().length > 0 && hasWidth ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPaymentMethodData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {getPaymentMethodData().map((entry, index) => (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No payment method data in this range
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

