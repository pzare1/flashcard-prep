"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Question {
  _id: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  difficulty: string;
  timesAnswered: number;
  averageScore: number;
  createdAt: string;
}

interface ScoreData {
  date: string;
  score: number;
  field: string;
}

export default function Dashboard() {
  const { userId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string>("all");

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

  const totalAnswered = questions.reduce((acc, q) => acc + q.timesAnswered, 0);

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
              <CardTitle className="text-gray-200">Total Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{totalAnswered}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-200">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
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
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-900/20">
          <CardHeader>
            <CardTitle className="text-gray-200">Your Question History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                {fields.map(field => (
                  <TabsTrigger
                    key={field}
                    value={field}
                    onClick={() => setSelectedField(field)}
                    className="capitalize"
                  >
                    {field}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <Card key={question._id} className="bg-gray-700/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-gray-200 font-medium">{question.question}</h3>
                          <span className="text-sm text-gray-400 capitalize">
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300">{question.answer}</p>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Field: {question.field} - {question.subField}</span>
                          <span>Average Score: {question.averageScore.toFixed(1)}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}