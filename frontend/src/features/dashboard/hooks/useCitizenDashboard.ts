import { useState, useEffect } from 'react';
import { responseAPI } from '../../../services/api';

export const useCitizenDashboard = () => {
  const [morningAnswered, setMorningAnswered] = useState<boolean | null>(null);
  const [eveningAnswered, setEveningAnswered] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [morning, evening] = await Promise.all([
          responseAPI.checkResponseForToday('morning'),
          responseAPI.checkResponseForToday('evening')
        ]);
        setMorningAnswered(morning.hasResponse);
        setEveningAnswered(evening.hasResponse);
      } catch (err) {
        // Hvis tjekket fejler, vis spørgeskemaer som normalt (fail-open)
        setMorningAnswered(false);
        setEveningAnswered(false);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    checkStatus();
  }, []);

  return {
    morningAnswered,
    eveningAnswered,
    loadingStatus,
  };
};






