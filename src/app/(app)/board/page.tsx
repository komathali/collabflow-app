'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { Task, User } from '@/lib/types';
import { MOCK_TASKS, MOCK_USERS } from '@/lib/data/mock-data';
import { KanbanBoard } from '@/components/board/kanban-board';

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const dataService = useDataService();

  useEffect(() => {
    if (!dataService) return;
    const getTasks = async () => {
      // This is where you might call `dataService.getTasks()`
      setTasks(MOCK_TASKS);
      setUsers(MOCK_USERS);
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
    return <div>Loading board...</div>;
  }
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Project Board
        </h1>
        <p className="text-muted-foreground">Visualize and manage your team's workflow.</p>
      </div>
      <KanbanBoard tasks={tasks} users={users} onUpdateTask={onUpdateTask} />
    </div>
  );
}

    