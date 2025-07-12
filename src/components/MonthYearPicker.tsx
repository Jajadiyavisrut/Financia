import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthYearPickerProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthYearPicker = ({ selectedMonth, onMonthChange }: MonthYearPickerProps) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();
  const currentYear_actual = currentDate.getFullYear();
  const currentMonth_actual = currentDate.getMonth();

  const isMonthDisabled = (year: number, monthIndex: number) => {
    // Disable future months
    if (year > currentYear_actual) return true;
    if (year === currentYear_actual && monthIndex > currentMonth_actual) return true;
    return false;
  };

  const isPreviousYearDisabled = () => {
    return currentYear <= 2020; // Minimum year limit
  };

  const isNextYearDisabled = () => {
    return currentYear >= currentYear_actual;
  };

  const handleMonthSelect = (monthIndex: number) => {
    const monthValue = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onMonthChange(monthValue);
  };

  const getSelectedMonthInfo = () => {
    const [year, month] = selectedMonth.split('-');
    return {
      year: parseInt(year),
      month: parseInt(month) - 1
    };
  };

  const selectedInfo = getSelectedMonthInfo();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(prev => prev - 1)}
            disabled={isPreviousYearDisabled()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold">{currentYear}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentYear(prev => prev + 1)}
            disabled={isNextYearDisabled()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isDisabled = isMonthDisabled(currentYear, index);
            const isSelected = selectedInfo.year === currentYear && selectedInfo.month === index;
            
            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleMonthSelect(index)}
                disabled={isDisabled}
                className={`h-12 text-xs ${
                  isSelected ? "cyber-glow" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {month.slice(0, 3)}
              </Button>
            );
          })}
        </div>

        {/* Current Selection Display */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">Selected Month</p>
          <p className="font-semibold text-cyber-primary">
            {months[selectedInfo.month]} {selectedInfo.year}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};