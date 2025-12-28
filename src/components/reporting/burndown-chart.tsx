
'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/lib/types';
import { TrendingDown } from 'lucide-react';
import { ChartTooltipContent } from '../ui/chart';

interface BurndownChartProps {
  tasks: Task[];
}

export function BurndownChart({ tasks }: BurndownChartProps) {
  const burndownData = useMemo(() => {
    const data: { date: string; remaining: number }[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantTasks = tasks.filter(t => new Date(t.createdAt!) > thirtyDaysAgo);
    
    // Sort tasks by creation date
    const sortedTasks = [...relevantTasks].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    let remainingTasks = sortedTasks.length;

    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const completedOnThisDay = sortedTasks.filter(t => 
            t.status === 'Done' && 
            new Date(t.dueDate!).toDateString() === date.toDateString()
        ).length;

        remainingTasks -= completedOnThisDay;

        data.push({
            date: dateString,
            remaining: remainingTasks,
        });
    }

    // A more accurate calculation by iterating through days
    let totalTasks = tasks.length;
    const dailyData = new Map<string, number>();

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const completedByThen = tasks.filter(t => 
            t.status === 'Done' && 
            new Date(t.dueDate!).getTime() <= date.getTime()
        ).length;

        dailyData.set(dateString, totalTasks - completedByThen);
    }
    
    return Array.from(dailyData.entries()).map(([date, remaining]) => ({ date, "Remaining Tasks": remaining }));

  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            <CardTitle>Project Burn-down</CardTitle>
        </div>
        <CardDescription>Remaining tasks over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={burndownData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line type="monotone" dataKey="Remaining Tasks" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
