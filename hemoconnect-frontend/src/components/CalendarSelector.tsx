import React, { useState } from 'react';

interface CalendarSelectorProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  minDateStr?: string;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ selectedDate, onSelect, minDateStr }) => {
  // Start with the month of the selected date, or the minDate, or today
  const getInitialMonth = () => {
    if (selectedDate) return new Date(selectedDate.substring(0, 7) + '-01');
    if (minDateStr) return new Date(minDateStr.substring(0, 7) + '-01');
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(getInitialMonth());

  const minDate = minDateStr ? new Date(minDateStr) : new Date(new Date().setHours(0,0,0,0));

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    // Transform so Monday is 0 and Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const days = [];
  
  // Empty slots before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }} />);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    // Adjust for timezone differences when creating the ISO string to avoid off-by-one errors
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Normalize dateObj for comparison by setting it to midnight local time
    dateObj.setHours(0,0,0,0);
    // minDate is already midnight or a strict date string. 
    // Wait, minDate could have a time component if it comes from ISO string, let's normalize it
    const normalizedMinDate = new Date(minDate);
    normalizedMinDate.setHours(0,0,0,0);
    
    const isPast = dateObj < normalizedMinDate;
    const isDisabled = isWeekend || isPast;
    const isSelected = selectedDate === dateString;

    days.push(
      <button
        key={d}
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect(dateString)}
        style={{
          padding: '0.5rem',
          aspectRatio: '1/1',
          border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
          background: isDisabled ? 'rgba(0,0,0,0.05)' : (isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface-color)'),
          color: isDisabled ? 'var(--text-secondary)' : 'var(--text-primary)',
          borderRadius: '8px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.4 : 1,
          fontWeight: isSelected ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        {d}
      </button>
    );
  }

  return (
    <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button type="button" onClick={prevMonth} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
          &lt;
        </button>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {monthNames[month]} {year}
        </span>
        <button type="button" onClick={nextMonth} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>
          &gt;
        </button>
      </div>

      {/* Weekdays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Lu</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Ma</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Mi</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Jo</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Vi</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Sâ</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Du</div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem' }}>
        {days}
      </div>
    </div>
  );
};

export default CalendarSelector;
