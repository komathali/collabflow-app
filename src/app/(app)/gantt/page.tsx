
'use client';
import { useEffect, useState, useMemo } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useDataService } from '@/hooks/useDataService';
import { Task, Project } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_PROJECTS, MOCK_TASKS } from '@/lib/data/mock-data';
import { BarChartHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GanttPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [loading, setLoading] = useState(true);
  const dataService = useDataService();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      // Mock data fetching
      setProjects(MOCK_PROJECTS);
      setTasks(MOCK_TASKS);
      if (MOCK_PROJECTS.length > 0) {
        setSelectedProjectId(MOCK_PROJECTS[0].id);
      }
      setLoading(false);
    };

    getData();
  }, [dataService]);

  const ganttTasks: GanttTask[] = useMemo(() => {
    if (!selectedProjectId) return [];
    
    return tasks
      .filter(t => t.projectId === selectedProjectId)
      .map(task => ({
        start: new Date(task.startDate || task.createdAt),
        end: new Date(task.dueDate || new Date(task.startDate || task.createdAt).setDate(new Date(task.startDate || task.createdAt).getDate() + 1)),
        name: task.title,
        id: task.id,
        type: 'task',
        progress: task.status === 'Done' ? 100 : (task.status === 'In Progress' ? 50 : 0),
        isDisabled: false,
        project: task.projectId,
        dependencies: task.dependencies
      }));
  }, [tasks, selectedProjectId]);

  const handleTaskChange = (task: GanttTask) => {
    console.log('On date change Id:' + task.id);
    const updatedTask = {
      startDate: task.start.toISOString(),
      dueDate: task.end.toISOString(),
    };
    onUpdateTask(task.id, updatedTask);
  };
  
  const onUpdateTask = (taskId: string, values: Partial<Task>) => {
    console.log(`Updating task ${taskId} with`, values);
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...values } : task
      )
    );
  };

  const criticalPathTasks = useMemo(() => {
    // Basic critical path calculation: a task is critical if it has no float (end date is start date of dependent task)
    // This is a simplified example. A full implementation would require a proper graph traversal (e.g., using Dijkstra's or A* algorithm).
    const taskMap = new Map(ganttTasks.map(t => [t.id, t]));
    const criticalIds = new Set<string>();

    ganttTasks.forEach(task => {
        if (task.dependencies) {
            task.dependencies.forEach(depId => {
                const depTask = taskMap.get(depId);
                if (depTask && depTask.end.getTime() === task.start.getTime()) {
                    criticalIds.add(depId);
                    criticalIds.add(task.id);
                }
            });
        }
    });
    return criticalIds;
  }, [ganttTasks]);

  const barStyles = {
    barProgressColor: 'hsl(var(--primary))',
    barProgressSelectedColor: 'hsl(var(--primary))',
    barBackgroundColor: 'hsl(var(--secondary))',
    barBackgroundSelectedColor: 'hsl(var(--secondary-foreground))',
  };

  const getBarStyles = (task: GanttTask) => {
    if (criticalPathTasks.has(task.id)) {
        return {
            ...barStyles,
            barProgressColor: 'hsl(var(--destructive))',
            barBackgroundColor: 'hsl(var(--destructive) / 0.3)',
        }
    }
    return barStyles;
  }

  if (loading) {
    return <div>Loading Gantt chart...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className='flex items-center justify-between'>
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                <BarChartHorizontal className="w-8 h-8" />
                Gantt Chart
            </h1>
            <p className="text-muted-foreground">Project timelines and dependencies.</p>
        </div>
        <div className='flex items-center gap-4'>
            <div className="flex items-center gap-2">
              {Object.values(ViewMode).map(mode => (
                  <Button key={mode} variant={viewMode === mode ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(mode)}>
                      {mode}
                  </Button>
              ))}
            </div>
            <Select onValueChange={setSelectedProjectId} value={selectedProjectId || ''}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                    {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {ganttTasks.length > 0 ? (
        <div className='rounded-lg border overflow-hidden'>
            <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                listCellWidth=""
                ganttHeight={600}
                columnWidth={100}
                barBackgroundColor="hsl(var(--primary))"
                barProgressColor="hsl(var(--primary-foreground))"
                arrowColor="hsl(var(--foreground))"
                todayColor="hsl(var(--accent))"
                barFill={60}
                {...barStyles}
                barCornerRadius={4}
            />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Select a project to view its Gantt chart.</p>
        </div>
      )}
    </div>
  );
}
