import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  data: {
    timestamp: Date;
    score: number;
  }[];
}

export const ScoreChart = ({ data }: ScoreChartProps) => {
  const formattedData = data.map(d => ({
    timestamp: new Date(d.timestamp).toLocaleDateString(),
    score: d.score
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            domain={[0, 10]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#8B5CF6" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
