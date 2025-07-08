import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  incomeCategories: Category[];
  setIncomeCategories: (categories: Category[]) => void;
}

const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#22c55e", "#3b82f6"];

export const CategoryManager = ({ categories, setCategories, incomeCategories, setIncomeCategories }: CategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newIncomeCategoryName, setNewIncomeCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();

  const addCategory = (type: "expense" | "income") => {
    const name = type === "expense" ? newCategoryName : newIncomeCategoryName;
    const targetCategories = type === "expense" ? categories : incomeCategories;
    const setTargetCategories = type === "expense" ? setCategories : setIncomeCategories;
    
    if (!name.trim()) return;

    if (targetCategories.length >= 10) {
      toast({
        title: "Category Limit Reached",
        description: "You can create up to 10 categories maximum.",
        variant: "destructive"
      });
      return;
    }

    if (targetCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast({
        title: "Category Exists",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.trim(),
      color: colors[targetCategories.length % colors.length]
    };

    setTargetCategories([...targetCategories, newCategory]);
    if (type === "expense") {
      setNewCategoryName("");
    } else {
      setNewIncomeCategoryName("");
    }
  };

  const deleteCategory = (id: string, type: "expense" | "income") => {
    const targetCategories = type === "expense" ? categories : incomeCategories;
    const setTargetCategories = type === "expense" ? setCategories : setIncomeCategories;
    
    if (targetCategories.find(cat => cat.id === id)?.name === "Others") {
      toast({
        title: "Cannot Delete",
        description: "The 'Others' category cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    setTargetCategories(targetCategories.filter(cat => cat.id !== id));
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const saveEdit = (type: "expense" | "income") => {
    if (!editingName.trim()) return;
    
    const targetCategories = type === "expense" ? categories : incomeCategories;
    const setTargetCategories = type === "expense" ? setCategories : setIncomeCategories;

    setTargetCategories(targetCategories.map(cat => 
      cat.id === editingId ? { ...cat, name: editingName.trim() } : cat
    ));
    setEditingId(null);
    setEditingName("");
  };

  const CategoryList = ({ categoryList, type }: { categoryList: Category[], type: "expense" | "income" }) => (
    <div className="space-y-2">
      {categoryList.map((category) => (
        <div key={category.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          {editingId === category.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="h-8"
                onKeyPress={(e) => e.key === 'Enter' && saveEdit(type)}
              />
              <Button size="sm" onClick={() => saveEdit(type)}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => startEditing(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                {category.name !== "Others" && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteCategory(category.id, type)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addCategory("expense")}
              />
              <Button 
                onClick={() => addCategory("expense")} 
                size="sm"
                className="cyber-glow"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <CategoryList categoryList={categories} type="expense" />
            
            <div className="text-xs text-muted-foreground text-center">
              {categories.length}/10 categories
            </div>
          </TabsContent>
          
          <TabsContent value="income" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Income category name"
                value={newIncomeCategoryName}
                onChange={(e) => setNewIncomeCategoryName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addCategory("income")}
              />
              <Button 
                onClick={() => addCategory("income")} 
                size="sm"
                className="cyber-glow"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <CategoryList categoryList={incomeCategories} type="income" />
            
            <div className="text-xs text-muted-foreground text-center">
              {incomeCategories.length}/10 categories
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};