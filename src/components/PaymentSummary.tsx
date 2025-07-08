import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Globe } from "lucide-react";

interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "cash" | "online" | "card";
  type: "income" | "expense";
}

interface PaymentSummaryProps {
  transactions: Transaction[];
  selectedMonth: string;
}

export const PaymentSummary = ({ transactions, selectedMonth }: PaymentSummaryProps) => {
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  
  const paymentMethods = [
    { 
      key: "cash" as const, 
      label: "Cash", 
      icon: Wallet, 
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    { 
      key: "online" as const, 
      label: "Online", 
      icon: Globe, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    { 
      key: "card" as const, 
      label: "Card", 
      icon: CreditCard, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    }
  ];

  const getPaymentSummary = (method: "cash" | "online" | "card") => {
    const methodTransactions = monthlyTransactions.filter(t => t.paymentMethod === method);
    const expenses = methodTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const income = methodTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const total = income - expenses;
    
    return { expenses, income, total, count: methodTransactions.length };
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Payment Method Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => {
          const summary = getPaymentSummary(method.key);
          const Icon = method.icon;
          
          return (
            <div key={method.key} className={`p-4 rounded-lg ${method.bgColor} border border-white/10`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${method.color}`} />
                  <span className="font-medium">{method.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {summary.count} transactions
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Income</p>
                  <p className="font-bold text-cyber-success">
                    ₹{summary.income.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Expenses</p>
                  <p className="font-bold text-cyber-danger">
                    ₹{summary.expenses.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Net</p>
                  <p className={`font-bold ${summary.total >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                    ₹{summary.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-lg font-bold text-cyber-success">
                ₹{monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-bold text-cyber-danger">
                ₹{monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-lg font-bold ${
                monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) - 
                monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) >= 0 
                ? 'text-cyber-success' : 'text-cyber-danger'
              }`}>
                ₹{(
                  monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) - 
                  monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};