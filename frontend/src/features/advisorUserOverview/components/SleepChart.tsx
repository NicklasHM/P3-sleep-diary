import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatMinutesToTime, parseTimeToMinutes } from '../utils';

type SleepChartProps = {
  sleepData: any[];
};

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload || !payload.length) return null;

  const dashArrayMap: { [key: string]: string } = {
    'SOL (min)': '0',
    'WASO (min)': '5 5',
    TIB: '10 5',
    TST: '5 5 1 5'
  };

  return (
    <ul className="custom-legend">
      {payload.map((entry: any, index: number) => {
        const dashArray = dashArrayMap[entry.value] || '0';
        return (
          <li key={`legend-item-${index}`} className="custom-legend-item">
            <svg width="24" height="12" style={{ display: 'block' }}>
              <line
                x1="0"
                y1="6"
                x2="24"
                y2="6"
                stroke={entry.color}
                strokeWidth={2}
                strokeDasharray={dashArray}
              />
            </svg>
            <span style={{ color: entry.color }}>{entry.value}</span>
          </li>
        );
      })}
    </ul>
  );
};

const SleepChart: React.FC<SleepChartProps> = ({ sleepData }) => {
  const chartData = Array.isArray(sleepData)
    ? sleepData
        .map((data: any) => {
          if (!data || !data.sleepParameters) return null;

          const tibValue =
            data.sleepParameters.TIBMinutes !== undefined
              ? data.sleepParameters.TIBMinutes
              : typeof data.sleepParameters.TIB === 'string'
              ? parseTimeToMinutes(data.sleepParameters.TIB)
              : data.sleepParameters.TIB || 0;

          const tstValue =
            data.sleepParameters.TSTMinutes !== undefined
              ? data.sleepParameters.TSTMinutes
              : typeof data.sleepParameters.TST === 'string'
              ? parseTimeToMinutes(data.sleepParameters.TST)
              : data.sleepParameters.TST || 0;

          return {
            date: new Date(data.createdAt).toLocaleDateString('da-DK', {
              day: 'numeric',
              month: 'numeric'
            }),
            createdAt: data.createdAt,
            SOL: data.sleepParameters.SOL || 0,
            WASO: data.sleepParameters.WASO || 0,
            TIB: tibValue,
            TST: tstValue
          };
        })
        .filter((item: any) => item !== null)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((item: any) => {
          const { createdAt, ...rest } = item;
          return rest;
        })
    : [];

  return (
    <div className="sleep-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Minutter', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'TIB' || name === 'TST') {
                return formatMinutesToTime(value);
              }
              return `${value} min`;
            }}
          />
          <Legend content={renderCustomLegend} />
          <Line type="monotone" dataKey="SOL" stroke="#003366" strokeWidth={2} strokeDasharray="0" name="SOL (min)" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="WASO" stroke="#FF6600" strokeWidth={2} strokeDasharray="5 5" name="WASO (min)" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="TIB" stroke="#8B008B" strokeWidth={2} strokeDasharray="10 5" name="TIB" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="TST" stroke="#006400" strokeWidth={2} strokeDasharray="5 5 1 5" name="TST" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepChart;






