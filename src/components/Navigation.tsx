import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, FileText, Settings, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NavigationProps {
  activeSection: string;
}

export const Navigation = ({ activeSection }: NavigationProps) => {
  const navItems = [
    {
      id: "settings",
      label: "Categories",
      icon: Settings,
      description: "Categories & budgets"
    },
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
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 120; // Account for sticky nav height
      const elementPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <Card className="glass-card p-4 mx-2 sm:mx-4 mb-0 border-x-0 border-t-0">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 ${
                    activeSection === item.id ? "cyber-glow" : "hover:cyber-glow"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};