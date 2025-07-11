import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
}

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  selectedMonth: string;
}

export const BudgetManager = ({ categories, budgets, setBudgets, selectedMonth }: BudgetManagerProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const monthlyBudgets = budgets.filter(b => b.month === selectedMonth);

  const addBudget = async () => {
    if (!selectedCategory || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a category and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    const existingBudget = monthlyBudgets.find(b => b.categoryId === selectedCategory);
    if (existingBudget) {
      toast({
        title: "Budget Exists",
        description: "Budget for this category already exists. Edit it instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user?.id,
          category_id: selectedCategory,
          amount: parseFloat(amount),
          month: selectedMonth
        })
        .select()
        .single();

      if (error) throw error;

      const newBudget: Budget = {
        id: data.id,
        categoryId: data.category_id,
        amount: Number(data.amount),
        month: data.month
      };

      setBudgets([...budgets, newBudget]);
      setSelectedCategory("");
      setAmount("");
      
      toast({
        title: "Budget Added",
        description: "Budget has been set successfully.",
      });
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setBudgets(budgets.filter(b => b.id !== id));
      
      toast({
        title: "Budget Deleted",
        description: "Budget has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (budget: Budget) => {
    setEditingId(budget.id);
    setEditingAmount(budget.amount.toString());
  };

  const saveEdit = async () => {
    if (!editingAmount) return;
    
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: parseFloat(editingAmount) })
        .eq('id', editingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setBudgets(budgets.map(b => 
        b.id === editingId ? { ...b, amount: parseFloat(editingAmount) } : b
      ));
      setEditingId(null);
      setEditingAmount("");
      
      toast({
        title: "Budget Updated",
        description: "Budget has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const availableCategories = categories.filter(
    cat => !monthlyBudgets.some(b => b.categoryId === cat.id)
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            placeholder="Amount (default: ₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addBudget()}
          />
          
          <Button onClick={addBudget} className="w-full cyber-glow">
            <Plus className="h-4 w-4 mr-2" />
            Set Budget
          </Button>
        </div>

        <div className="space-y-2">
          {monthlyBudgets.map((budget) => {
            const category = categories.find(c => c.id === budget.categoryId);
            if (!category) return null;
            
            return (
              <div key={budget.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {editingId === budget.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        className="h-8 w-20"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold">₹{budget.amount.toLocaleString()}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => startEditing(budget)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteBudget(budget.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Budget</span>
            <span className="text-lg font-bold text-cyber-primary">
              ₹{monthlyBudgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};