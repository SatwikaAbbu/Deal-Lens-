import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

/**
 * Radar Chart component for visualizing deal dimensions.
 * Styled to match the DealLens "Glass" aesthetic.
 */
export default function ScoreRadar({ dimensions }) {
  const data = [
    { subject: 'Founder', A: dimensions.founder_credibility, fullMark: 10 },
    { subject: 'Market', A: dimensions.market_validity, fullMark: 10 },
    { subject: 'Moat', A: dimensions.competitive_moat, fullMark: 10 },
    { subject: 'Traction', A: dimensions.traction_quality, fullMark: 10 },
    { subject: 'Finance', A: dimensions.financial_soundness, fullMark: 10 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke="#ffffff10" vertical={false} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#8a8f98', fontSize: 10, fontFamily: 'Geist Mono' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#7170ff"
            strokeWidth={2}
            fill="#7170ff"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
