
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, User } from '@/lib/types';
import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { ChartTooltipContent } from '@/components/ui/chart';

interface WorkloadChartProps {
  tasks: Task[];
  users: User[];
}

export function WorkloadChart({ tasks, users }: WorkloadChartProps) {
  const workloadData = useMemo(() => {
    return users.map(user => {
      const assignedTasks = tasks.filter(task => task.assigneeId === user.id);
      return {
        name: user.name.split(' ')[0], // Show first name
        'Total Tasks': assignedTasks.length,
        'Open Tasks': assignedTasks.filter(t => t.status !== 'Done').length,
      };
    });
  }, [tasks, users]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <CardTitle>Team Workload</CardTitle>
        </div>
        <CardDescription>Total and open tasks assigned per team member.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workloadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false}/>
            <Tooltip
              content={<ChartTooltipContent />}
            />
            <Legend />
            <Bar dataKey="Total Tasks" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Open Tasks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
