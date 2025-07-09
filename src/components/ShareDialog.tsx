import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Copy, Clock } from "lucide-react";
import type { Transaction, Category, Budget } from "./BudgetTracker";

interface ShareDialogProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  selectedMonth: string;
}

export const ShareDialog = ({ transactions, categories, budgets, selectedMonth }: ShareDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("5");
  const { toast } = useToast();

  const generateShareCode = async () => {
    setIsLoading(true);
    try {
      // Generate unique code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_share_code');
      
      if (codeError) throw codeError;

      const code = codeData;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiryMinutes));

      // Prepare data to share
      const shareData = {
        transactions: transactions.filter(t => t.date.startsWith(selectedMonth)),
        categories,
        budgets: budgets.filter(b => b.month === selectedMonth),
        month: selectedMonth,
        generatedAt: new Date().toISOString()
      };

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to database
      const { error } = await supabase
        .from('shared_finance_data')
        .insert({
          user_id: user.id,
          share_code: code,
          expires_at: expiresAt.toISOString(),
          data: shareData as any
        });

      if (error) throw error;

      setShareCode(code);
      toast({
        title: "Share code generated!",
        description: `Code: ${code} (expires in ${expiryMinutes} minutes)`,
      });
    } catch (error) {
      console.error('Error generating share code:', error);
      toast({
        title: "Error",
        description: "Failed to generate share code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    toast({
      title: "Copied!",
      description: "Share code copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Financial Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Share Duration</Label>
            <Select value={expiryMinutes} onValueChange={setExpiryMinutes}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!shareCode ? (
            <Button onClick={generateShareCode} disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Generate Share Code"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input value={shareCode} readOnly className="font-mono text-center text-lg" />
                <Button size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Expires in {expiryMinutes} minutes
              </div>
              <Button 
                onClick={() => { setShareCode(""); setIsOpen(false); }} 
                variant="outline" 
                className="w-full"
              >
                Generate New Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};