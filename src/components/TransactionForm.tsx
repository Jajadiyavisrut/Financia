import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  onDataChange?: () => void;
  selectedMonth: string;
}

export const TransactionForm = ({ categories, transactions, setTransactions, type, onDataChange, selectedMonth }: TransactionFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(selectedMonth));
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online" | "card">("cash");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update selectedDate when selectedMonth changes
  useEffect(() => {
    setSelectedDate(new Date(selectedMonth));
  }, [selectedMonth]);

  const addTransaction = async () => {
    if (!selectedCategory || !amount || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (selectedDate > today) {
      toast({
        title: "Invalid Date",
        description: "Cannot add future transactions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          category_id: selectedCategory,
          amount: parseFloat(amount),
          description: description.trim(),
          date: format(selectedDate, "yyyy-MM-dd"),
          payment_method: paymentMethod,
          type
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state with correct interface mapping
      const newTransaction: Transaction = {
        id: data.id,
        categoryId: data.category_id,
        amount: Number(data.amount),
        description: data.description,
        date: data.date,
        paymentMethod: data.payment_method as "cash" | "online" | "card",
        type: data.type as "income" | "expense"
      };

      setTransactions([newTransaction, ...transactions]);
      
      // Trigger data reload for real-time updates
      if (onDataChange) {
        onDataChange();
      }
      
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
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              disabled={(date) => {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                // Disable future dates
                if (date > today) return true;
                
                // Only allow dates in the selected month
                const selectedMonthDate = new Date(selectedMonth + '-01');
                const monthStart = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1);
                const monthEnd = new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 0);
                
                return date < monthStart || date > monthEnd;
              }}
              initialFocus
              className="pointer-events-auto"
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

        <Button onClick={addTransaction} className="w-full cyber-glow" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? 'Adding...' : `Add ${type === "income" ? "Income" : "Expense"}`}
        </Button>
      </CardContent>
    </Card>
  );
};