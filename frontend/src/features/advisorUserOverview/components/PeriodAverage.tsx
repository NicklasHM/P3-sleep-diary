import React from 'react';
import {
  formatMinutesToTime,
  parseTimeToMinutes,
  getColorClass,
  getSOLColor,
  getWASOColor,
  getTIBColor,
  getTSTColor,
} from '../utils';

interface PeriodAverageProps {
  t: (key: string) => string;
  sleepData: any[];
}

const PeriodAverage: React.FC<PeriodAverageProps> = ({ t, sleepData }) => {
  const sleepDataArray = Array.isArray(sleepData) ? sleepData : [];

  let totalSOL = 0;
  let totalWASO = 0;
  let totalTIBMinutes = 0;
  let totalTSTMinutes = 0;
  let count = 0;

  sleepDataArray.forEach((data: any) => {
    if (data && data.sleepParameters) {
      const params = data.sleepParameters;
      const tibValue =
        params.TIBMinutes !== undefined
          ? params.TIBMinutes
          : typeof params.TIB === 'string'
          ? parseTimeToMinutes(params.TIB)
          : params.TIB || 0;
      const tstValue =
        params.TSTMinutes !== undefined
          ? params.TSTMinutes
          : typeof params.TST === 'string'
          ? parseTimeToMinutes(params.TST)
          : params.TST || 0;
      const solValue = params.SOL || 0;
      const wasoValue = params.WASO || 0;

      totalSOL += solValue;
      totalWASO += wasoValue;
      totalTIBMinutes += tibValue;
      totalTSTMinutes += tstValue;
      count++;
    }
  });

  if (count === 0) return null;

  const avgSOL = Math.round(totalSOL / count);
  const avgWASO = Math.round(totalWASO / count);
  const avgTIBMinutes = Math.round(totalTIBMinutes / count);
  const avgTSTMinutes = Math.round(totalTSTMinutes / count);

  const solColor = getSOLColor(avgSOL);
  const wasoColor = getWASOColor(avgWASO);
  const tibColor = getTIBColor(avgTIBMinutes);
  const tstColor = getTSTColor(avgTSTMinutes, avgTIBMinutes);

  return (
    <div className="period-average-container">
      <h4>{t('userOverview.averageForPeriod')}</h4>
      <div className="sleep-params">
        <div className={`sleep-param-item ${getColorClass(solColor)}`}>
          <span className="param-label">SOL:</span>
          <span className="param-value">{avgSOL} min</span>
        </div>
        <div className={`sleep-param-item ${getColorClass(wasoColor)}`}>
          <span className="param-label">WASO:</span>
          <span className="param-value">{avgWASO} min</span>
        </div>
        <div className={`sleep-param-item ${getColorClass(tibColor)}`}>
          <span className="param-label">TIB:</span>
          <span className="param-value">{formatMinutesToTime(avgTIBMinutes)}</span>
        </div>
        <div className={`sleep-param-item ${getColorClass(tstColor)}`}>
          <span className="param-label">TST:</span>
          <span className="param-value">{formatMinutesToTime(avgTSTMinutes)}</span>
        </div>
      </div>
    </div>
  );
};

export default PeriodAverage;

