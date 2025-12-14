import React from 'react';
import type { User } from '../../../types';

type SearchFilterBarProps = {
  t: (key: string) => string;
  searchName: string;
  filterAdvisor: string;
  advisors: User[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
};

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  t,
  searchName,
  filterAdvisor,
  advisors,
  onSearchChange,
  onFilterChange
}) => {
  return (
    <div className="search-filter-section">
      <div className="search-box">
        <label htmlFor="search-name">{t('userOverview.searchName')}</label>
        <input
          type="text"
          id="search-name"
          value={searchName}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('userOverview.searchPlaceholder')}
          className="search-input"
        />
      </div>
      <div className="filter-box">
        <label htmlFor="filter-advisor">{t('userOverview.filterAdvisor')}</label>
        <select
          id="filter-advisor"
          value={filterAdvisor}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('userOverview.allCitizens')}</option>
          <option value="none">{t('userOverview.noAdvisor')}</option>
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.fullName || advisor.username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilterBar;






