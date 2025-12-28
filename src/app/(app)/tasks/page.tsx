'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { Task, User } from '@/lib/types';
import { columns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { useUser } from '@/firebase';

export default function TasksPage() {
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
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    getTasks();
  }, [dataService, user]);

  const onUpdateTask = (taskId: string, values: Partial<Task>) => {
    dataService.updateTask(taskId, values);
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...values } : task
      )
    );
  };

  if (loading) {
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
      <DataTable columns={columns} data={tasks} users={users} onUpdateTask={onUpdateTask} />
    </div>
  );
}
