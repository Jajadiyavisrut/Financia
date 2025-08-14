import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User, Save, KeyRound } from "lucide-react";

interface ProfileSettingsProps {
  userProfile: { display_name: string | null } | null;
  onProfileUpdate: () => void;
}

export const ProfileSettings = ({ userProfile, onProfileUpdate }: ProfileSettingsProps) => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Invalid password', description: 'New password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please re-enter the new password.', variant: 'destructive' });
      return;
    }
    setPwLoading(true);
    try {
      // Re-authenticate by signing in with current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email as string, password: currentPassword });
      if (signInErr) {
        toast({ title: 'Authentication failed', description: 'Current password is incorrect.', variant: 'destructive' });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: 'Failed to change password', description: error.message, variant: 'destructive' });
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not update password. Try again.', variant: 'destructive' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-primary">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Email address cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="cyber-glow flex items-center gap-2" 
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <KeyRound className="h-4 w-4" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              <Button type="submit" className="cyber-glow" disabled={pwLoading}>
                {pwLoading ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};