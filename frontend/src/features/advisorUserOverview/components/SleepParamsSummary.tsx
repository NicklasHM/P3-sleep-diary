import React from 'react';
import { formatMinutesToTime, getColorClass, getSOLColor, getTIBColor, getTSTColor, getWASOColor, parseTimeToMinutes } from '../utils';

type SleepParamsSummaryProps = {
  sleepParameters: any;
  compact?: boolean;
};

const SleepParamsSummary: React.FC<SleepParamsSummaryProps> = ({ sleepParameters, compact }) => {
  if (!sleepParameters) return null;

  const tibMinutes =
    sleepParameters.TIBMinutes !== undefined
      ? sleepParameters.TIBMinutes
      : typeof sleepParameters.TIB === 'string'
      ? parseTimeToMinutes(sleepParameters.TIB)
      : sleepParameters.TIB || 0;
  const tstMinutes =
    sleepParameters.TSTMinutes !== undefined
      ? sleepParameters.TSTMinutes
      : typeof sleepParameters.TST === 'string'
      ? parseTimeToMinutes(sleepParameters.TST)
      : sleepParameters.TST || 0;
  const solMinutes = sleepParameters.SOL || 0;
  const wasoMinutes = sleepParameters.WASO || 0;

  const solColor = getSOLColor(solMinutes);
  const wasoColor = getWASOColor(wasoMinutes);
  const tibColor = getTIBColor(tibMinutes);
  const tstColor = getTSTColor(tstMinutes, tibMinutes);

  const containerClass = compact ? 'sleep-params sleep-params-compact' : 'sleep-params';

  return (
    <div className={containerClass}>
      <div className={`sleep-param-item ${getColorClass(solColor)}`}>
        <span className="param-label">SOL:</span>
        <span className="param-value">{solMinutes} min</span>
      </div>
      <div className={`sleep-param-item ${getColorClass(wasoColor)}`}>
        <span className="param-label">WASO:</span>
        <span className="param-value">{wasoMinutes} min</span>
      </div>
      <div className={`sleep-param-item ${getColorClass(tibColor)}`}>
        <span className="param-label">TIB:</span>
        <span className="param-value">{sleepParameters.TIB || formatMinutesToTime(tibMinutes)}</span>
      </div>
      <div className={`sleep-param-item ${getColorClass(tstColor)}`}>
        <span className="param-label">TST:</span>
        <span className="param-value">{sleepParameters.TST || formatMinutesToTime(tstMinutes)}</span>
      </div>
    </div>
  );
};

export default SleepParamsSummary;

