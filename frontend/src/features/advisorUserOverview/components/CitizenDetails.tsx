import React from 'react';
import Skeleton from '../../../components/Skeleton';
import PeriodFilter from './PeriodFilter';
import PeriodAverage from './PeriodAverage';
import SleepChart from './SleepChart';
import ResponsesList from './ResponsesList';
import type { User, Response, Question } from '../../../types';

interface CitizenDetailsProps {
  t: (key: string) => string;
  citizen: User;
  selectedCitizen: User | null;
  loadingDetails: boolean;
  sleepData: any[];
  responses: Response[];
  questions: Map<string, Question>;
  sleepDataMap: Map<string, any>;
  expandedResponses: Set<string>;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilter: () => void;
  onToggleResponse: (responseId: string) => void;
}

const CitizenDetails: React.FC<CitizenDetailsProps> = ({
  t,
  citizen,
  selectedCitizen,
  loadingDetails,
  sleepData,
  responses,
  questions,
  sleepDataMap,
  expandedResponses,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilter,
  onToggleResponse,
}) => {
  if (selectedCitizen?.id !== citizen.id) return null;

  if (loadingDetails) {
    return (
      <div className="loading-details-skeleton">
        <Skeleton width="100%" height="200px" borderRadius="8px" />
        <div style={{ marginTop: '24px' }}>
          <Skeleton width="100%" height="300px" borderRadius="8px" />
        </div>
        <div style={{ marginTop: '24px' }}>
          <Skeleton width="100%" height="150px" borderRadius="8px" />
        </div>
      </div>
    );
  }

  const sleepDataArray = Array.isArray(sleepData) ? sleepData : [];

  return (
    <>
      <PeriodFilter
        t={t}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onClearFilter={onClearFilter}
      />

      <div className="details-section">
        <h3>📊 {t('userOverview.sleepParameters')}</h3>
        {sleepDataArray.length > 0 ? (
          <>
            <PeriodAverage t={t} sleepData={sleepDataArray} />
            <SleepChart sleepData={sleepDataArray} />
          </>
        ) : (
          <div className="no-sleep-data-message">
            <p>{t('userOverview.noSleepDataMessage')}</p>
          </div>
        )}
      </div>

      <div className="details-section">
        <h3>{t('userOverview.responses')}</h3>
        {responses.length === 0 ? (
          <p>{t('userOverview.noResponses')}</p>
        ) : (
          <ResponsesList
            t={t}
            responses={responses}
            questions={questions}
            sleepDataMap={sleepDataMap}
            expandedResponses={expandedResponses}
            toggleResponse={onToggleResponse}
          />
        )}
      </div>
    </>
  );
};

export default CitizenDetails;






