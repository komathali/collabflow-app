'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { Task } from '@/lib/types';
import { columns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { MOCK_TASKS, MOCK_USERS } from '@/lib/data/mock-data';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const dataService = useDataService();

  useEffect(() => {
    if (!dataService) return;
    // In a real app, you would fetch tasks from your data service
    // For now, we use mock data.
    const getTasks = async () => {
      // This is where you might call `dataService.getTasks()`
      setTasks(MOCK_TASKS);
      setLoading(false);
    };

    getTasks();
  }, [dataService]);

  const onUpdateTask = (taskId: string, values: Partial<Task>) => {
    // This is a mock implementation. In a real app, you would call `dataService.updateTask(taskId, values)`
    console.log(`Updating task ${taskId} with`, values);
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...values } : task
      )
    );
  };

  if (loading || !dataService) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Tasks
            </h1>
            <p className="text-muted-foreground">Manage all tasks across your projects.</p>
        </div>
      <DataTable columns={columns} data={tasks} users={MOCK_USERS} onUpdateTask={onUpdateTask} />
    </div>
  );
}

    