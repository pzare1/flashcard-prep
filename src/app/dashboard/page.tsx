"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionHistory } from "@/components/QuestionHistory";

interface Question {
  _id: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  difficulty: string;
  timesAnswered: number;
  averageScore: number;
  scores: number[];
  createdAt: string;
}

interface ScoreData {
  timestamp: string;
  averageScore: number;
  field: string;
}

export default function Dashboard() {
  const { userId } = useAuth();
  const [selectedField, setSelectedField] = useState<string>("All");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        const [questionsRes, scoresRes] = await Promise.all([
          fetch(`/api/questions/user/${userId}`),
          fetch(`/api/scores/${userId}`)
        ]);

        const questionsData = await questionsRes.json();
        const scoresData = await scoresRes.json();

        setQuestions(questionsData);
        setScoreData(scoresData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const fields = ["all", ...new Set(questions.map(q => q.field))];
  const filteredQuestions = selectedField === "all" 
    ? questions 
    : questions.filter(q => q.field === selectedField);

  const averageScore = questions.length 
    ? questions.reduce((acc, q) => acc + q.averageScore, 0) / questions.length 
    : 0;

  const totalCorrectAnswers = questions.reduce((acc, q) => {
    return acc + (q.scores || []).filter(score => score >= 5).length;
  }, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-200">{`Time: ${new Date(label).toLocaleString()}`}</p>
          <p className="text-purple-400">{`Average Score: ${payload[0].value.toFixed(1)}`}</p>
          <p className="text-gray-300">{`Field: ${payload[0].payload.field}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-gray-200">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">
                {averageScore.toFixed(1)}/10
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-gray-200">Questions Practiced</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{questions.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-gray-200">Correct Answers (≥5/10)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{totalCorrectAnswers}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-200">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    name="Average Score"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6, fill: '#A78BFA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20">
  <CardHeader>
    <CardTitle className="text-gray-200">Your Question History</CardTitle>
  </CardHeader>
  <CardContent>
    <QuestionHistory 
      questions={questions}
      selectedField={selectedField}
      onFieldChange={setSelectedField}
    />
  </CardContent>
</Card>
      </div>
    </div>
  );
}