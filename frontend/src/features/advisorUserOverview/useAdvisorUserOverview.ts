import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI, responseAPI, questionAPI } from '../../services/api';
import type { User, Response, Question } from '../../types';
import {
  formatMinutesToTime,
  parseTimeToMinutes,
} from './utils';

export const useAdvisorUserOverview = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [citizens, setCitizens] = useState<User[]>([]);
  const [allCitizens, setAllCitizens] = useState<User[]>([]);
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterAdvisor, setFilterAdvisor] = useState<string>('');
  const [assigningAdvisor, setAssigningAdvisor] = useState<string | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Map<string, string>>(new Map());
  const [citizenSleepData, setCitizenSleepData] = useState<Map<string, any>>(new Map());
  const [selectedCitizen, setSelectedCitizen] = useState<User | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [allSleepData, setAllSleepData] = useState<any[]>([]);
  const [sleepDataMap, setSleepDataMap] = useState<Map<string, any>>(new Map());
  const [questions, setQuestions] = useState<Map<string, Question>>(new Map());
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCitizens();
  }, [searchName, filterAdvisor, allCitizens]);

  // Genindlæs spørgsmål når sproget skifter
  useEffect(() => {
    if (selectedCitizen && allResponses.length > 0) {
      const reloadQuestions = async () => {
        try {
          const questionsMap = new Map<string, Question>();
          for (const response of allResponses) {
            try {
              const questionsList = await questionAPI.getQuestions(response.questionnaireId, language, true);
              questionsList.forEach((q: Question) => {
                questionsMap.set(q.id, q);
              });
            } catch (err) {
              // Ignore errors loading questions
            }
          }
          setQuestions(questionsMap);
        } catch (err) {
          // Ignore errors
        }
      };
      reloadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, selectedCitizen, allResponses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citizensData, advisorsData] = await Promise.all([
        userAPI.getAllCitizens(),
        userAPI.getAllAdvisors()
      ]);
      
      setAllCitizens(citizensData);
      setCitizens(citizensData);
      setAdvisors(advisorsData);
      
      // Load sleep data for all citizens and calculate averages
      const sleepDataMap = new Map<string, any>();
      for (const citizen of citizensData) {
        try {
          const sleepResponse = await userAPI.getSleepData(citizen.id);
          if (sleepResponse.sleepData && sleepResponse.sleepData.length > 0) {
            const allSleepData = sleepResponse.sleepData;
            let totalSOL = 0;
            let totalWASO = 0;
            let totalTIBMinutes = 0;
            let totalTSTMinutes = 0;
            let count = 0;

            allSleepData.forEach((data: any) => {
              if (data && data.sleepParameters) {
                const params = data.sleepParameters;
                const tibMinutes = typeof params.TIB === 'string' 
                  ? parseTimeToMinutes(params.TIB) 
                  : (params.TIBMinutes || params.TIB || 0);
                const tstMinutes = typeof params.TST === 'string' 
                  ? parseTimeToMinutes(params.TST) 
                  : (params.TSTMinutes || params.TST || 0);
                const solMinutes = params.SOL || 0;
                const wasoMinutes = params.WASO || 0;

                totalSOL += solMinutes;
                totalWASO += wasoMinutes;
                totalTIBMinutes += tibMinutes;
                totalTSTMinutes += tstMinutes;
                count++;
              }
            });

            if (count > 0) {
              const average = {
                sleepParameters: {
                  SOL: Math.round(totalSOL / count),
                  WASO: Math.round(totalWASO / count),
                  TIBMinutes: Math.round(totalTIBMinutes / count),
                  TSTMinutes: Math.round(totalTSTMinutes / count),
                  TIB: formatMinutesToTime(Math.round(totalTIBMinutes / count)),
                  TST: formatMinutesToTime(Math.round(totalTSTMinutes / count))
                }
              };
              sleepDataMap.set(citizen.id, average);
            }
          }
        } catch (err) {
          // Ignore errors loading sleep data for overview
        }
      }
      setCitizenSleepData(sleepDataMap);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke indlæse data');
    } finally {
      setLoading(false);
    }
  };

  const filterCitizens = () => {
    let filtered = [...allCitizens];

    // Filter by name
    if (searchName.trim()) {
      filtered = filtered.filter(citizen =>
        citizen.fullName.toLowerCase().includes(searchName.toLowerCase()) ||
        citizen.username.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by advisor
    if (filterAdvisor) {
      if (filterAdvisor === 'none') {
        filtered = filtered.filter(citizen => !citizen.advisorId);
      } else {
        filtered = filtered.filter(citizen => citizen.advisorId === filterAdvisor);
      }
    }

    setCitizens(filtered);
  };

  const handleAssignAdvisor = async (citizenId: string, advisorId: string | null) => {
    try {
      setAssigningAdvisor(citizenId);
      const updatedCitizen = await userAPI.assignAdvisor(citizenId, advisorId);
      
      setAllCitizens(prev => prev.map(c => 
        c.id === citizenId ? updatedCitizen : c
      ));
      
      if (selectedCitizen?.id === citizenId) {
        setSelectedCitizen(updatedCitizen);
      }
      
      setSelectedAdvisor(prev => {
        const newMap = new Map(prev);
        if (advisorId) {
          newMap.set(citizenId, advisorId);
        } else {
          newMap.delete(citizenId);
        }
        return newMap;
      });
    } catch (err: any) {
      setError(err.message || t('userOverview.couldNotAssign'));
    } finally {
      setAssigningAdvisor(null);
    }
  };

  const handleSelectCitizen = async (citizen: User) => {
    // Toggle: if same citizen is clicked, close it
    if (selectedCitizen?.id === citizen.id) {
      setSelectedCitizen(null);
      return;
    }
    
    setSelectedCitizen(citizen);
    setExpandedResponses(new Set());
    setStartDate('');
    setEndDate('');
    setLoadingDetails(true);
    
    try {
      // Load responses
      const responsesData = await responseAPI.getResponses(citizen.id);
      
      // Sort responses so newest is first
      const sortedResponses = [...responsesData].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setAllResponses(sortedResponses);
      setResponses(sortedResponses);

      // Load sleep data
      const sleepResponse = await userAPI.getSleepData(citizen.id);
      const sleepDataArray = Array.isArray(sleepResponse.sleepData) ? sleepResponse.sleepData : [];
      setAllSleepData(sleepDataArray);
      setSleepData(sleepDataArray);
      
      // Create map for quick lookup of sleep parameters based on responseId
      const sleepMap = new Map<string, any>();
      sleepDataArray.forEach((data: any) => {
        sleepMap.set(data.responseId, data);
      });
      setSleepDataMap(sleepMap);

      // Fetch questions for all responses (inkl. slettede spørgsmål)
      const questionsMap = new Map<string, Question>();
      for (const response of responsesData) {
        try {
          const questionsList = await questionAPI.getQuestions(response.questionnaireId, language, true);
          questionsList.forEach((q: Question) => {
            questionsMap.set(q.id, q);
          });
        } catch (err) {
          // Ignore errors loading questions
        }
      }
      setQuestions(questionsMap);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke indlæse data');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter data based on selected period
  useEffect(() => {
    if (!selectedCitizen) {
      setSleepData([]);
      return;
    }
    
    const sleepDataArray = Array.isArray(allSleepData) ? allSleepData : [];
    if (allResponses.length === 0 && sleepDataArray.length === 0) {
      return;
    }

    const filterData = () => {
      const sleepDataArray = Array.isArray(allSleepData) ? allSleepData : [];
      
      if (!startDate && !endDate) {
        setResponses(allResponses);
        setSleepData(sleepDataArray);
        return;
      }

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) {
        start.setHours(0, 0, 0, 0);
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      const filteredResponses = allResponses.filter((response) => {
        const responseDate = new Date(response.createdAt);
        if (start && responseDate < start) return false;
        if (end && responseDate > end) return false;
        return true;
      });
      setResponses(filteredResponses);

      const filteredSleepData = sleepDataArray.filter((data: any) => {
        if (!data || !data.createdAt) return false;
        const dataDate = new Date(data.createdAt);
        if (start && dataDate < start) return false;
        if (end && dataDate > end) return false;
        return true;
      });
      setSleepData(filteredSleepData);

      const filteredSleepMap = new Map<string, any>();
      filteredSleepData.forEach((data: any) => {
        if (data && data.responseId) {
          filteredSleepMap.set(data.responseId, data);
        }
      });
      setSleepDataMap(filteredSleepMap);
    };

    filterData();
  }, [startDate, endDate, allResponses, allSleepData, selectedCitizen]);

  const toggleResponse = (responseId: string) => {
    setExpandedResponses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(responseId)) {
        newSet.delete(responseId);
      } else {
        newSet.add(responseId);
      }
      return newSet;
    });
  };

  return {
    citizens,
    allCitizens,
    advisors,
    loading,
    error,
    setError,
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
  };
};

