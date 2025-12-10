import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AdvisorUserOverviewSkeleton from '../components/AdvisorUserOverviewSkeleton';
import { useAdvisorUserOverview } from '../features/advisorUserOverview/useAdvisorUserOverview';
import UserOverviewHeader from '../features/advisorUserOverview/components/UserOverviewHeader';
import SearchFilterBar from '../features/advisorUserOverview/components/SearchFilterBar';
import CitizensTable from '../features/advisorUserOverview/components/CitizensTable';
import CitizenDetails from '../features/advisorUserOverview/components/CitizenDetails';
import './AdvisorUserOverview.css';

const AdvisorUserOverview = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const {
    citizens,
    advisors,
    loading,
    error,
    searchName,
    setSearchName,
    filterAdvisor,
    setFilterAdvisor,
    assigningAdvisor,
    selectedAdvisor,
    setSelectedAdvisor,
    citizenSleepData,
    selectedCitizen,
    responses,
    sleepData,
    sleepDataMap,
    questions,
    expandedResponses,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loadingDetails,
    handleAssignAdvisor,
    handleSelectCitizen,
    toggleResponse,
  } = useAdvisorUserOverview();

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const renderCitizenDetails = (citizen: any) => {
    return (
      <CitizenDetails
        t={t}
        citizen={citizen}
        selectedCitizen={selectedCitizen}
        loadingDetails={loadingDetails}
        sleepData={sleepData}
        responses={responses}
        questions={questions}
        sleepDataMap={sleepDataMap}
        expandedResponses={expandedResponses}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilter={handleClearFilter}
        onToggleResponse={toggleResponse}
      />
    );
  };

  if (loading) {
    return <AdvisorUserOverviewSkeleton />;
  }

  return (
    <div className="advisor-overview">
      <UserOverviewHeader
        t={t}
        theme={theme}
        toggleTheme={toggleTheme}
        onBack={() => navigate('/advisor')}
        onLogout={logout}
      />

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <SearchFilterBar
          t={t}
          searchName={searchName}
          filterAdvisor={filterAdvisor}
          advisors={advisors}
          onSearchChange={setSearchName}
          onFilterChange={setFilterAdvisor}
        />

        <CitizensTable
          t={t}
          citizens={citizens}
          advisors={advisors}
          citizenSleepData={citizenSleepData}
          selectedCitizen={selectedCitizen}
          assigningAdvisor={assigningAdvisor}
          selectedAdvisor={selectedAdvisor}
          onSelectCitizen={handleSelectCitizen}
          onAdvisorChange={handleAssignAdvisor}
          onSelectedAdvisorChange={(citizenId, advisorId) =>
            setSelectedAdvisor((prev) => {
              const newMap = new Map(prev);
              if (advisorId) {
                newMap.set(citizenId, advisorId);
              } else {
                newMap.delete(citizenId);
              }
              return newMap;
            })
          }
          renderDetails={renderCitizenDetails}
        />
      </div>
    </div>
  );
};

export default AdvisorUserOverview;
