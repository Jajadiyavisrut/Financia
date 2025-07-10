import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, File, Sheet } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface ExportManagerProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export const ExportManager = ({ transactions, categories, budgets }: ExportManagerProps) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [endMonth, setEndMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { toast } = useToast();

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  const generateCSV = (data: Transaction[], filename: string) => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Type'];
    const csvContent = [
      headers.join(','),
      ...data.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return [
          transaction.date,
          `"${transaction.description}"`,
          `"${category?.name || 'Unknown'}"`,
          transaction.amount,
          transaction.paymentMethod,
          transaction.type
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateJSON = (data: Transaction[], filename: string) => {
    const exportData = {
      exported_at: new Date().toISOString(),
      data: data.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        return {
          ...transaction,
          categoryName: category?.name || 'Unknown'
        };
      }),
      summary: {
        total_transactions: data.length,
        total_income: data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        total_expenses: data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSingleMonth = (format: string) => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    const monthDate = new Date(selectedMonth + '-01');
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (monthTransactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions found for the selected month.",
        variant: "destructive",
      });
      return;
    }
    
    switch (format) {
      case 'csv':
        generateCSV(monthTransactions, `financia-${monthName.replace(' ', '-')}.csv`);
        toast({
          title: "Export Successful",
          description: `CSV file for ${monthName} has been downloaded.`,
        });
        break;
      case 'json':
        generateJSON(monthTransactions, `financia-${monthName.replace(' ', '-')}.json`);
        toast({
          title: "Export Successful",
          description: `JSON file for ${monthName} has been downloaded.`,
        });
        break;
    }
  };

  const exportDateRange = (format: string) => {
    const rangeTransactions = transactions.filter(t => {
      const transactionMonth = t.date.substring(0, 7);
      return transactionMonth >= startMonth && transactionMonth <= endMonth;
    });
    
    if (rangeTransactions.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions found for the selected date range.",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = new Date(startMonth + '-01');
    const endDate = new Date(endMonth + '-01');
    const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}-to-${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    
    switch (format) {
      case 'csv':
        generateCSV(rangeTransactions, `financia-${dateRange}.csv`);
        toast({
          title: "Export Successful",
          description: `CSV file for ${dateRange} has been downloaded.`,
        });
        break;
      case 'json':
        generateJSON(rangeTransactions, `financia-${dateRange}.json`);
        toast({
          title: "Export Successful",
          description: `JSON file for ${dateRange} has been downloaded.`,
        });
        break;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Single Month Export */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Export Single Month</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
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
            
            <div className="md:col-span-3 grid grid-cols-2 gap-2">
              <Button onClick={() => exportSingleMonth('csv')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportSingleMonth('json')} variant="outline" className="cyber-glow">
                <File className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range Export */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-md font-semibold">Export Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Start Month</label>
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Start month" />
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
                  <SelectValue placeholder="End month" />
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
            
            <div className="md:col-span-2 grid grid-cols-2 gap-2">
              <Button onClick={() => exportDateRange('csv')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportDateRange('json')} variant="outline" className="cyber-glow">
                <File className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};