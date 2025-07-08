import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
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

interface TransactionFormProps {
  categories: Category[];
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  type: "income" | "expense";
}

export const TransactionForm = ({ categories, transactions, setTransactions, type }: TransactionFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online" | "card">("cash");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { toast } = useToast();

  const addTransaction = () => {
    if (!selectedCategory || !amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      amount: parseFloat(amount),
      description: description.trim(),
      date: format(selectedDate, "yyyy-MM-dd"),
      paymentMethod,
      type
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Reset form
    setSelectedCategory("");
    setAmount("");
    setDescription("");
    setSelectedDate(new Date());
    setPaymentMethod("cash");

    toast({
      title: `${type === "income" ? "Income" : "Expense"} Added`,
      description: `Successfully added ₹${amount} ${type}.`,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add {type === "income" ? "Income" : "Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date || new Date());
                setDatePickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={paymentMethod} onValueChange={(value: "cash" | "online" | "card") => setPaymentMethod(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={addTransaction} className="w-full cyber-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add {type === "income" ? "Income" : "Expense"}
        </Button>
      </CardContent>
    </Card>
  );
};