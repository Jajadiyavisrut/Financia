import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Save, LogOut, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareDialog } from "./ShareDialog";

interface ProfilePopoverProps {
  userProfile: { display_name: string | null } | null;
  onProfileUpdate: () => void;
  transactions: any[];
  categories: any[];
  budgets: any[];
  selectedMonth: string;
}

export const ProfilePopover = ({ 
  userProfile, 
  onProfileUpdate, 
  transactions, 
  categories, 
  budgets, 
  selectedMonth 
}: ProfilePopoverProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        onProfileUpdate();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-cyber-primary flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Settings
            </h4>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="text-xs"
                />
                <Button 
                  size="sm" 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <ShareDialog 
              transactions={transactions}
              categories={categories}
              budgets={budgets}
              selectedMonth={selectedMonth}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center gap-2 flex-1"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};