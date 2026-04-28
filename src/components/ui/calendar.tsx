import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [displayMonth, setDisplayMonth] = React.useState(
    props.selected instanceof Date ? props.selected : new Date()
  );

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

  const handleMonthChange = (month: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(parseInt(month));
    setDisplayMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year));
    setDisplayMonth(newDate);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={displayMonth}
      onMonthChange={setDisplayMonth}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-gray-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-50 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-gray-800 hover:bg-gray-100 hover:text-gray-900",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "border border-blue-400 text-blue-700 font-semibold",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:bg-blue-50 aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth: captionMonth }) => (
          <div className="flex justify-center items-center gap-1 relative w-full">
            <button
              onClick={() => {
                const prev = new Date(displayMonth);
                prev.setMonth(prev.getMonth() - 1);
                setDisplayMonth(prev);
              }}
              className="absolute left-1 inline-flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <Select value={String(captionMonth.getMonth())} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-7 w-[110px] text-xs font-medium bg-white border-gray-200 text-gray-800 hover:bg-gray-50 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-800 max-h-60 z-[9999]">
                  {months.map((m, i) => (
                    <SelectItem key={m} value={String(i)} className="text-gray-800 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(captionMonth.getFullYear())} onValueChange={handleYearChange}>
                <SelectTrigger className="h-7 w-[80px] text-xs font-medium bg-white border-gray-200 text-gray-800 hover:bg-gray-50 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-800 max-h-60 z-[9999]">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-gray-800 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={() => {
                const next = new Date(displayMonth);
                next.setMonth(next.getMonth() + 1);
                setDisplayMonth(next);
              }}
              className="absolute right-1 inline-flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
