"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Label
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface AttemptData {
  timestamp: string | Date;
  score: number;
}

interface QuestionData {
  attempts?: AttemptData[];
}

interface PerformanceChartProps {
  questions: QuestionData[];
  className?: string;
}

const PerformanceChart = ({ questions, className = "" }: PerformanceChartProps) => {
  const [chartData, setChartData] = useState<Array<{ date: string; score: number }>>([]);
  const [performanceTrend, setPerformanceTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [averageScore, setAverageScore] = useState<number>(0);
  
  useEffect(() => {
    // Process chart data
    const processedData = questions
      .flatMap(q => (q.attempts || []).map(attempt => ({
        date: new Date(attempt.timestamp).toLocaleDateString(),
        score: attempt.score,
        timestamp: new Date(attempt.timestamp).getTime()
      })))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-20) // Get last 20 attempts
      .map(({ date, score }) => ({ date, score }));
    
    setChartData(processedData);
    
    // Calculate trend
    if (processedData.length >= 2) {
      const firstHalf = processedData.slice(0, Math.floor(processedData.length / 2));
      const secondHalf = processedData.slice(Math.floor(processedData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.score, 0) / secondHalf.length;
      
      if (secondHalfAvg > firstHalfAvg + 0.2) {
        setPerformanceTrend('up');
      } else if (secondHalfAvg < firstHalfAvg - 0.2) {
        setPerformanceTrend('down');
      } else {
        setPerformanceTrend('neutral');
      }
      
      // Calculate average
      const totalAvg = processedData.reduce((sum, item) => sum + item.score, 0) / processedData.length;
      setAverageScore(totalAvg);
    }
  }, [questions]);
  
  const renderTrendIndicator = () => {
    if (performanceTrend === 'up') {
      return (
        <div className="flex items-center gap-2 text-green-400 font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>Improving</span>
        </div>
      );
    } else if (performanceTrend === 'down') {
      return (
        <div className="flex items-center gap-2 text-red-400 font-medium">
          <TrendingDown className="w-4 h-4" />
          <span>Declining</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-blue-400 font-medium">
          <Activity className="w-4 h-4" />
          <span>Steady</span>
        </div>
      );
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-lg p-3 border border-gray-700/70 rounded-lg shadow-lg">
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#a78bfa' }} 
            />
            <p className="text-white font-semibold">
              Score: {payload[0].value.toFixed(1)}/10
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Generate sample data if we have no data yet
  // This will ensure the chart always shows even during development
  if (chartData.length === 0) {
    // Add some sample data for display purposes
    const sampleData = [];
    const today = new Date();
    
    for (let i = 10; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      sampleData.push({
        date: date.toLocaleDateString(),
        score: Math.random() * 10 // Random score between 0 and 10
      });
    }
    
    if (questions.length === 0) { // Only use sample data if we have no questions
      setChartData(sampleData);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl 
                rounded-xl p-6 border border-gray-700/50 shadow-lg ${className}`}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white">Performance Over Time</h3>
          <p className="text-gray-400 text-sm">
            {chartData.length > 0 
              ? `Your score progression from ${chartData[0].date} to ${chartData[chartData.length-1].date}`
              : 'No data available yet'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {renderTrendIndicator()}
          {chartData.length > 0 && (
            <div className="px-3 py-1.5 bg-gray-800/70 rounded-lg text-gray-200 text-sm">
              Avg: <span className="font-semibold text-purple-300">{averageScore.toFixed(1)}/10</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart section - fixed height container */}
      <div style={{ height: "300px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <defs>
              <linearGradient id="purpleScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 6" 
              stroke="#374151" 
              vertical={false} 
              opacity={0.6} 
            />
            
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickMargin={10}
              axisLine={{ stroke: '#4B5563' }}
            />
            
            <YAxis 
              stroke="#9CA3AF"
              domain={[0, 10]} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={10}
              axisLine={{ stroke: '#4B5563' }}
              ticks={[0, 2, 4, 6, 8, 10]}
              tickFormatter={(value) => `${value}`}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            <Legend 
              verticalAlign="bottom"
              align="center"
            />
            
            <ReferenceLine 
              y={averageScore} 
              stroke="#A78BFA" 
              strokeDasharray="3 3"
              strokeWidth={1.5}
              opacity={0.7}
            >
              <Label 
                value="Average" 
                position="right" 
                fill="#A78BFA" 
                fontSize={11} 
              />
            </ReferenceLine>
            
            <Line
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ 
                r: 3,
                strokeWidth: 2,
                stroke: '#8B5CF6',
                fill: '#1F2937' 
              }}
              activeDot={{ 
                r: 6, 
                stroke: '#A78BFA',
                strokeWidth: 2,
                fill: '#1F2937' 
              }}
              connectNulls={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;