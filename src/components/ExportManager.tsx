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

  const exportToPDF = () => {
    toast({
      title: "Export to PDF",
      description: "PDF export functionality would be implemented here with a proper PDF library.",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export to Excel",
      description: "Excel export functionality would be implemented here with a proper Excel library.",
    });
  };

  const exportToWord = () => {
    toast({
      title: "Export to Word",
      description: "Word export functionality would be implemented here with a proper Word library.",
    });
  };

  const exportSingleMonth = (format: string) => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    console.log(`Exporting ${format} for month:`, selectedMonth, monthTransactions);
    
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'word':
        exportToWord();
        break;
    }
  };

  const exportDateRange = (format: string) => {
    const rangeTransactions = transactions.filter(t => {
      const transactionMonth = t.date.substring(0, 7);
      return transactionMonth >= startMonth && transactionMonth <= endMonth;
    });
    console.log(`Exporting ${format} for range:`, startMonth, 'to', endMonth, rangeTransactions);
    
    switch (format) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'word':
        exportToWord();
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
            
            <div className="md:col-span-3 grid grid-cols-3 gap-2">
              <Button onClick={() => exportSingleMonth('pdf')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => exportSingleMonth('excel')} variant="outline" className="cyber-glow">
                <Sheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportSingleMonth('word')} variant="outline" className="cyber-glow">
                <File className="h-4 w-4 mr-2" />
                Word
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range Export */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-md font-semibold">Export Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
            
            <div className="md:col-span-3 grid grid-cols-3 gap-2">
              <Button onClick={() => exportDateRange('pdf')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => exportDateRange('excel')} variant="outline" className="cyber-glow">
                <Sheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportDateRange('word')} variant="outline" className="cyber-glow">
                <File className="h-4 w-4 mr-2" />
                Word
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};