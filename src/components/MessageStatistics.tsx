
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Message } from './types';

interface MessageStatisticsProps {
  messages: Message[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'
];

export const MessageStatistics: React.FC<MessageStatisticsProps> = ({ messages }) => {
  const statistics = useMemo(() => {
    const stats: Record<string, { user: number; assistant: number; total: number }> = {};
    
    messages.forEach(message => {
      const mode = message.chatMode || '범용 검색';
      
      if (!stats[mode]) {
        stats[mode] = { user: 0, assistant: 0, total: 0 };
      }
      
      if (message.isUser) {
        stats[mode].user += 1;
      } else {
        stats[mode].assistant += 1;
      }
      stats[mode].total += 1;
    });
    
    return stats;
  }, [messages]);

  const chartData = useMemo(() => {
    return Object.entries(statistics).map(([mode, data]) => ({
      mode,
      사용자: data.user,
      AI응답: data.assistant,
      총메시지: data.total
    }));
  }, [statistics]);

  const pieData = useMemo(() => {
    return Object.entries(statistics).map(([mode, data]) => ({
      name: mode,
      value: data.total
    }));
  }, [statistics]);

  const totalMessages = messages.length;
  const userMessages = messages.filter(m => m.isUser).length;
  const aiMessages = messages.filter(m => !m.isUser).length;

  if (totalMessages === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">사용자 메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userMessages}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">AI 응답</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{aiMessages}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>채팅 모드별 메시지 분포</CardTitle>
            <CardDescription>각 모드별 사용자 메시지와 AI 응답 수</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mode" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="사용자" fill="#3B82F6" />
                <Bar dataKey="AI응답" fill="#0D9488" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>모드별 총 메시지 비율</CardTitle>
            <CardDescription>전체 대화에서 각 모드가 차지하는 비중</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(statistics).map(([mode, data]) => (
              <div key={mode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{mode}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600">사용자: {data.user}</span>
                  <span className="text-teal-600">AI: {data.assistant}</span>
                  <span className="font-medium">총: {data.total}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
