import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const generateExcel = (data: Transaction[], filename: string) => {
    const worksheetData = data.map(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      return {
        Date: transaction.date,
        Description: transaction.description,
        Category: category?.name || 'Unknown',
        Amount: transaction.amount,
        'Payment Method': transaction.paymentMethod,
        Type: transaction.type
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 12 }, // Amount
      { wch: 15 }, // Payment Method
      { wch: 10 }  // Type
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
  };

  const generatePDF = (data: Transaction[], filename: string) => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Financia - Transaction Report', 20, 20);
    
    // Add summary
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    pdf.text(`Total Transactions: ${data.length}`, 20, 45);
    pdf.text(`Total Income: ₹${totalIncome.toLocaleString()}`, 20, 55);
    pdf.text(`Total Expenses: ₹${totalExpenses.toLocaleString()}`, 20, 65);
    pdf.text(`Net Balance: ₹${netBalance.toLocaleString()}`, 20, 75);
    
    // Prepare table data
    const tableData = data.map(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      return [
        transaction.date,
        transaction.description,
        category?.name || 'Unknown',
        `₹${transaction.amount.toLocaleString()}`,
        transaction.paymentMethod,
        transaction.type
      ];
    });

    // Add table
    (pdf as any).autoTable({
      head: [['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Type']],
      body: tableData,
      startY: 85,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 }
      }
    });

    pdf.save(filename);
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
      case 'excel':
        generateExcel(monthTransactions, `financia-${monthName.replace(' ', '-')}.xlsx`);
        toast({
          title: "Export Successful",
          description: `Excel file for ${monthName} has been downloaded.`,
        });
        break;
      case 'pdf':
        generatePDF(monthTransactions, `financia-${monthName.replace(' ', '-')}.pdf`);
        toast({
          title: "Export Successful",
          description: `PDF file for ${monthName} has been downloaded.`,
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
      case 'excel':
        generateExcel(rangeTransactions, `financia-${dateRange}.xlsx`);
        toast({
          title: "Export Successful",
          description: `Excel file for ${dateRange} has been downloaded.`,
        });
        break;
      case 'pdf':
        generatePDF(rangeTransactions, `financia-${dateRange}.pdf`);
        toast({
          title: "Export Successful",
          description: `PDF file for ${dateRange} has been downloaded.`,
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
              <Button onClick={() => exportSingleMonth('excel')} variant="outline" className="cyber-glow">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportSingleMonth('pdf')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                PDF
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
              <Button onClick={() => exportDateRange('excel')} variant="outline" className="cyber-glow">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => exportDateRange('pdf')} variant="outline" className="cyber-glow">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};