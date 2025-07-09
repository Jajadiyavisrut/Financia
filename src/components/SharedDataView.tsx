import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { TransactionHistory } from "./TransactionHistory";
import type { Transaction, Category, Budget } from "./BudgetTracker";

interface SharedData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  month: string;
  generatedAt: string;
}

interface SharedDataViewProps {
  shareCode: string;
  onBack: () => void;
}

export const SharedDataView = ({ shareCode, onBack }: SharedDataViewProps) => {
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSharedData();
  }, [shareCode]);

  const fetchSharedData = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_finance_data')
        .select('data, expires_at')
        .eq('share_code', shareCode)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Invalid or Expired Code",
            description: "The share code is invalid or has expired.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setSharedData(data.data as unknown as SharedData);
    } catch (error) {
      console.error('Error fetching shared data:', error);
      toast({
        title: "Error",
        description: "Failed to load shared data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading shared data...</div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="glass-card max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Code Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The share code is invalid or has expired.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyExpenses = sharedData.transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = sharedData.transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = sharedData.budgets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              <Calendar className="inline mr-1 h-4 w-4" />
              Shared: {new Date(sharedData.generatedAt).toLocaleString()}
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-primary to-cyber-secondary bg-clip-text text-transparent">
              Shared Financial Data
            </h1>
            <p className="text-muted-foreground mt-2">
              {new Date(sharedData.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Net</p>
              <p className={`text-2xl font-bold ${(monthlyIncome - monthlyExpenses) >= 0 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                ₹{(monthlyIncome - monthlyExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyber-success" />
                Income Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                transactions={sharedData.transactions.filter(t => t.type === "income")}
                categories={sharedData.categories}
                setTransactions={() => {}} // Read-only
                selectedMonth={sharedData.month}
                type="income"
                readOnly={true}
              />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-cyber-danger" />
                Expense Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                transactions={sharedData.transactions.filter(t => t.type === "expense")}
                categories={sharedData.categories}
                setTransactions={() => {}} // Read-only
                selectedMonth={sharedData.month}
                type="expense"
                readOnly={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};