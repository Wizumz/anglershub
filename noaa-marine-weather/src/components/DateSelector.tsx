import { format, addDays } from 'date-fns';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();
  const dateOptions = [];
  
  // Generate next 7 days as options
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    dateOptions.push({
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE, MMM d'),
      fullDate: format(date, 'yyyy-MM-dd')
    });
  }

  return (
    <div className="space-y-2">
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full bg-terminal-bg border border-terminal-border text-terminal-fg font-mono p-2 rounded focus:outline-none focus:border-terminal-accent"
      >
        {dateOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="text-terminal-muted text-sm">
        <div>Selected: <span className="text-terminal-accent">{selectedDate}</span></div>
        <div className="text-terminal-muted">Forecast period: 4 days starting from selected date</div>
      </div>
    </div>
  );
}