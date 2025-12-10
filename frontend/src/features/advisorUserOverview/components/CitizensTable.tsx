import React from 'react';
import type { User } from '../../../types';
import SleepParamsSummary from './SleepParamsSummary';

type CitizensTableProps = {
  t: (key: string) => string;
  citizens: User[];
  advisors: User[];
  citizenSleepData: Map<string, any>;
  selectedCitizen: User | null;
  assigningAdvisor: string | null;
  selectedAdvisor: Map<string, string>;
  onSelectCitizen: (citizen: User) => void;
  onAdvisorChange: (citizenId: string, advisorId: string | null) => void;
  onSelectedAdvisorChange: (citizenId: string, advisorId: string | null) => void;
  renderDetails: (citizen: User) => React.ReactNode;
};

const CitizensTable: React.FC<CitizensTableProps> = ({
  t,
  citizens,
  advisors,
  citizenSleepData,
  selectedCitizen,
  assigningAdvisor,
  selectedAdvisor,
  onSelectCitizen,
  onAdvisorChange,
  onSelectedAdvisorChange,
  renderDetails
}) => {
  return (
    <div className="citizens-table-container">
      <div className="citizens-table-header">
        <div className="table-header-cell name-cell">{t('userOverview.tableName')}</div>
        <div className="table-header-cell advisor-cell">{t('userOverview.tableAdvisor')}</div>
        <div className="table-header-cell sleep-cell">{t('userOverview.tableSleepParams')}</div>
        <div className="table-header-cell action-cell">{t('userOverview.tableActions')}</div>
      </div>
      <div className="citizens-table-body">
        {citizens.length === 0 ? (
          <div className="no-citizens">{t('userOverview.noCitizens')}</div>
        ) : (
          citizens.map((citizen) => {
            const latestSleepData = citizenSleepData.get(citizen.id);
            const isAssigning = assigningAdvisor === citizen.id;
            const currentAdvisorId = selectedAdvisor.get(citizen.id) || citizen.advisorId || '';
            const isSelected = selectedCitizen?.id === citizen.id;

            return (
              <React.Fragment key={citizen.id}>
                <div
                  className={`citizen-row ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.action-cell')) return;
                    onSelectCitizen(citizen);
                  }}
                >
                  <div className="table-cell name-cell clickable-cell">
                    <div className="citizen-name">
                      {citizen.fullName || citizen.username}
                      {isSelected && <span className="expand-indicator">▼</span>}
                    </div>
                  </div>
                  <div className="table-cell advisor-cell clickable-cell">
                    {citizen.advisorName ? (
                      <span className="advisor-name">{citizen.advisorName}</span>
                    ) : (
                      <span className="no-advisor">{t('userOverview.noAdvisor')}</span>
                    )}
                  </div>
                  <div className="table-cell sleep-cell clickable-cell">
                    {latestSleepData ? (
                      <SleepParamsSummary sleepParameters={latestSleepData.sleepParameters} compact />
                    ) : (
                      <span className="no-sleep-data">{t('userOverview.noSleepData')}</span>
                    )}
                  </div>
                  <div className="table-cell action-cell">
                    <div className="assign-advisor-control">
                      <select
                        value={currentAdvisorId}
                        onChange={(e) => {
                          const newAdvisorId = e.target.value || null;
                          onSelectedAdvisorChange(citizen.id, newAdvisorId);
                          onAdvisorChange(citizen.id, newAdvisorId);
                        }}
                        disabled={isAssigning}
                        className="advisor-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">{t('userOverview.noAdvisor')}</option>
                        {advisors.map((advisor) => (
                          <option key={advisor.id} value={advisor.id}>
                            {advisor.fullName || advisor.username}
                          </option>
                        ))}
                      </select>
                      {isAssigning && <span className="assigning-spinner">...</span>}
                    </div>
                  </div>
                </div>
                {isSelected && <div className="citizen-details-expanded">{renderDetails(citizen)}</div>}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CitizensTable;

