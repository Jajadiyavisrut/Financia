import { useState } from "react";
import { BudgetTracker } from "@/components/BudgetTracker";
import { AuthPage } from "@/components/AuthPage";
import { SharedDataView } from "@/components/SharedDataView";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'auth' | 'app' | 'shared'>('auth');
  const [shareCode, setShareCode] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSharedDataAccess = (code: string) => {
    setShareCode(code);
    setViewMode('shared');
  };

  const handleBackToAuth = () => {
    setViewMode('auth');
    setShareCode('');
  };

  if (viewMode === 'shared' && shareCode) {
    return <SharedDataView shareCode={shareCode} onBack={handleBackToAuth} />;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => window.location.reload()} onSharedDataAccess={handleSharedDataAccess} />;
  }

  return <BudgetTracker />;
};

export default Index;
