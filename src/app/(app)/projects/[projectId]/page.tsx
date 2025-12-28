
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDataService } from "@/hooks/useDataService";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data/mock-data";
import { Project, Task, User } from "@/lib/types";
import { Calendar, CheckCircle, Clock, Flag, ListChecks, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from '@/components/tasks/data-table';
import { columns } from '@/components/tasks/columns';

export default function ProjectOverviewPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const dataService = useDataService();

    useEffect(() => {
        if (typeof projectId === 'string') {
            const fetchProjectData = async () => {
                try {
                    const fetchedProject = await dataService.getProjectById(projectId);
                    setProject(fetchedProject || null);
                    
                    // Mock fetching tasks for this project
                    const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
                    setTasks(projectTasks);
                } catch (error) {
                    console.error("Failed to fetch project data", error);
                    setProject(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchProjectData();
        }
    }, [projectId, dataService]);

    if (loading) {
        return <div>Loading project...</div>;
    }

    if (!project) {
        return <div>Project not found.</div>;
    }
    
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    const onUpdateTask = (taskId: string, values: Partial<Task>) => {
        // This is a mock implementation. In a real app, you would call `dataService.updateTask(taskId, values)`
        console.log(`Updating task ${taskId} with`, values);
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === taskId ? { ...task, ...values } : task
          )
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.startDate!).toLocaleDateString()} - {new Date(project.endDate!).toLocaleDateString()}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <div className="flex -space-x-2">
                            {project.memberIds.map(id => {
                                const user = MOCK_USERS.find(u => u.id === id);
                                return (
                                    <Avatar key={id} className="w-6 h-6 border-2 border-background">
                                        <AvatarImage src={user?.avatarUrl} />
                                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )
                            })}
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <Progress value={progress} className="w-full max-w-sm" />
                    <span className="text-muted-foreground">{progress}% complete</span>
                </div>
            </div>

            <Separator />

             <DataTable columns={columns} data={tasks} users={MOCK_USERS} onUpdateTask={onUpdateTask} />
        </div>
    );
}
