"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Attempt {
  answer: string;
  score: number;
  timestamp: Date;
}

interface Question {
  _id: string;
  field: string;
  attempts: Attempt[];
}

interface ScoreChartProps {
  questions: Question[];
  selectedField?: string;
}

export function ScoreChart({ questions, selectedField }: ScoreChartProps) {
  // Process data for the chart
  const chartData = questions
    .filter(q => !selectedField || q.field === selectedField)
    .flatMap(q => q.attempts.map(a => ({
      date: new Date(a.timestamp).toLocaleDateString(),
      score: a.score,
      field: q.field
    })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate moving average
  const movingAverageWindow = 5;
  const movingAverages = chartData.map((_, index) => {
    const windowStart = Math.max(0, index - movingAverageWindow + 1);
    const window = chartData.slice(windowStart, index + 1);
    const average = window.reduce((sum, item) => sum + item.score, 0) / window.length;
    return {
      ...chartData[index],
      movingAverage: Number(average.toFixed(1))
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={movingAverages}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF" 
            domain={[0, 10]}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "0.5rem"
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', r: 4 }}
            activeDot={{ r: 6, fill: '#A78BFA' }}
          />
          <Line
            type="monotone"
            dataKey="movingAverage"
            name="Moving Average"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}