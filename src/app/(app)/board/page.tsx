'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { Project, Task, User } from '@/lib/types';
import { KanbanBoard } from '@/components/board/kanban-board';
import { useUser } from '@/firebase';

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const dataService = useDataService();
  const { user } = useUser();

  useEffect(() => {
    const getTasks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userProjects = await dataService.getProjects();
        const taskPromises = userProjects.map(p => dataService.getTasksByProjectId(p.id));
        const allTasks = await Promise.all(taskPromises);
        setTasks(allTasks.flat());

        const allUsers = await dataService.getUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch board data:", error);
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [dataService, user]);

  const onUpdateTask = (taskId: string, values: Partial<Task>) => {
    dataService.updateTask(taskId, values);
    // Real-time listener will update the state automatically
  };

  if (loading) {
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
