import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, TrendingUp, FileText, Settings, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Overview and summary"
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Plus,
      description: "Add income & expenses"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: PieChart,
      description: "Charts and insights"
    },
    {
      id: "reports",
      label: "Reports",
      icon: TrendingUp,
      description: "Monthly analysis"
    },
    {
      id: "export",
      label: "Export",
      icon: FileText,
      description: "Download data"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Categories & budgets"
    }
  ];

  return (
    <Card className="glass-card p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 ${
                activeTab === item.id ? "cyber-glow" : "hover:cyber-glow"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};