import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit2, Trash2, History, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  setTransactions: (transactions: Transaction[]) => void;
  selectedMonth: string;
  type: "income" | "expense";
}

export const TransactionHistory = ({ 
  transactions, 
  categories, 
  setTransactions, 
  selectedMonth,
  type 
}: TransactionHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingDate, setEditingDate] = useState<Date>(new Date());
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<"cash" | "online" | "card">("cash");
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(t => 
    t.date.startsWith(selectedMonth) && t.type === type
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: `${type === "income" ? "Income" : "Expense"} Deleted`,
      description: "Transaction has been removed successfully.",
    });
  };

  const startEditing = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditingAmount(transaction.amount.toString());
    setEditingDescription(transaction.description);
    setEditingCategory(transaction.categoryId);
    setEditingDate(new Date(transaction.date));
    setEditingPaymentMethod(transaction.paymentMethod);
  };

  const saveEdit = () => {
    if (!editingAmount || !editingDescription || !editingCategory) return;
    
    setTransactions(transactions.map(t => 
      t.id === editingId ? { 
        ...t, 
        amount: parseFloat(editingAmount),
        description: editingDescription.trim(),
        categoryId: editingCategory,
        date: format(editingDate, "yyyy-MM-dd"),
        paymentMethod: editingPaymentMethod
      } : t
    ));
    setEditingId(null);
    setEditingAmount("");
    setEditingDescription("");
    setEditingCategory("");
    setEditingDate(new Date());
    setEditingPaymentMethod("cash");
    
    toast({
      title: `${type === "income" ? "Income" : "Expense"} Updated`,
      description: "Transaction has been updated successfully.",
    });
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash": return "bg-green-500/20 text-green-400";
      case "online": return "bg-blue-500/20 text-blue-400";
      case "card": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTransactionClass = (method: string) => {
    switch (method) {
      case "cash": return "transaction-cash";
      case "online": return "transaction-online";
      case "card": return "transaction-card";
      default: return "";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          {type === "income" ? "Income" : "Expense"} History
          <Badge variant="secondary" className="ml-auto">
            {filteredTransactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {type}s recorded for this month</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              if (!category) return null;
              
              return (
                <div key={transaction.id} className={`p-4 rounded-lg bg-secondary/50 ${getTransactionClass(transaction.paymentMethod)}`}>
                  {editingId === transaction.id ? (
                    <div className="space-y-3">
                      <Select value={editingCategory} onValueChange={setEditingCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        placeholder="Amount"
                      />
                      
                      <Input
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="Description"
                      />
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingDate ? format(editingDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editingDate}
                            onSelect={(date) => setEditingDate(date || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Select value={editingPaymentMethod} onValueChange={(value: "cash" | "online" | "card") => setEditingPaymentMethod(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                          <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                            {transaction.paymentMethod}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${type === "income" ? "text-cyber-success" : "text-cyber-danger"}`}>
                            {type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => startEditing(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteTransaction(transaction.id)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "EEEE, MMMM d, yyyy")}
                      </p>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};