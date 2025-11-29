import React, { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Välj datum',
  className = '',
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange?.(date);
    setIsOpen(false);
  };

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${className}`}
        >
          <span className={value ? '' : 'text-slate-400 dark:text-slate-500'}>
            {value ? format(value, 'PPP', { locale: sv }) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-auto rounded-md border border-slate-200 bg-white p-3 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-slate-700 dark:bg-slate-900"
          align="start"
          sideOffset={4}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {format(viewDate, 'MMMM yyyy', { locale: sv })}
              </span>
              <button
                onClick={handleNextMonth}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="flex h-8 w-8 items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const isSelected = value && isSameDay(day, value);
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isDayToday = isToday(day);
                const isDisabled = isDateDisabled(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(day)}
                    disabled={isDisabled}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isDayToday
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                        : isCurrentMonth
                        ? 'text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                        : 'text-slate-400 dark:text-slate-600'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
              <button
                onClick={() => {
                  onChange?.(new Date());
                  setIsOpen(false);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Idag
              </button>
              <button
                onClick={() => {
                  onChange?.(undefined);
                  setIsOpen(false);
                }}
                className="text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-400"
              >
                Rensa
              </button>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

// Date range picker
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (range: { start?: Date; end?: Date }) => void;
  placeholder?: string;
  className?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  placeholder = 'Välj datumintervall',
  className = '',
}: DateRangePickerProps) => {
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.({ start: undefined, end: undefined });
      return;
    }

    if (selecting === 'start') {
      onChange?.({ start: date, end: endDate });
      setSelecting('end');
    } else {
      if (startDate && date < startDate) {
        onChange?.({ start: date, end: startDate });
      } else {
        onChange?.({ start: startDate, end: date });
      }
      setSelecting('start');
    }
  };

  const displayValue = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'PP', { locale: sv })} - ${format(endDate, 'PP', { locale: sv })}`;
    }
    if (startDate) {
      return `${format(startDate, 'PP', { locale: sv })} - ...`;
    }
    return placeholder;
  };

  return (
    <DatePicker
      value={selecting === 'start' ? startDate : endDate}
      onChange={handleDateSelect}
      placeholder={displayValue()}
      className={className}
    />
  );
};

export { DatePicker, DateRangePicker };
