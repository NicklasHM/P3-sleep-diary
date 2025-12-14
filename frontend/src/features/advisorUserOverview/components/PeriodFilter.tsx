import React from 'react';

interface PeriodFilterProps {
  t: (key: string) => string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilter: () => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  t,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilter,
}) => {
  return (
    <div className="period-filter">
      <h3>{t('userOverview.selectPeriod')}</h3>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">{t('userOverview.fromDate')}</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="date-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">{t('userOverview.toDate')}</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="date-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter();
            }}
            className="btn-clear-filter"
          >
            {t('userOverview.clearFilter')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PeriodFilter;






