'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDataService } from "@/hooks/useDataService";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data/mock-data";
import { Project, Task, User, ChatMessage as ChatMessageType, Comment } from "@/lib/types";
import { Calendar, CheckCircle, Clock, Flag, ListChecks, Users, MessageSquare, Image as ImageIcon, BookText, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { DataTable } from '@/components/tasks/data-table';
import { columns } from '@/components/tasks/columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectChat from "@/components/project/project-chat";
import { useUser } from "@/firebase";

const ProofingTool = React.lazy(() => import('@/components/proofing/proofing-tool'));
const ProjectNotes = React.lazy(() => import('@/components/project/project-notes'));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
);


export default function ProjectOverviewPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const dataService = useDataService();

    useEffect(() => {
        if (typeof projectId === 'string' && dataService) {
            const fetchProjectData = async () => {
                try {
                    const fetchedProject = await dataService.getProjectById(projectId);
                    setProject(fetchedProject || null);
                    
                    const projectTasks = await dataService.getTasksByProjectId(projectId);
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

    if (loading || !dataService) {
        return <div>Loading project...</div>;
    }

    if (!project) {
        return <div>Project not found.</div>;
    }
    
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    const onUpdateTask = (taskId: string, values: Partial<Task>) => {
        console.log(`Updating task ${taskId} with`, values);
        dataService.updateTask(taskId, { ...values, projectId: project.id });
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

            <Tabs defaultValue="tasks">
                <TabsList>
                    <TabsTrigger value="tasks">
                        <ListChecks className="mr-2 h-4 w-4"/>
                        Tasks
                    </TabsTrigger>
                     <TabsTrigger value="notes">
                        <BookText className="mr-2 h-4 w-4"/>
                        Notes
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="proofing">
                        <ImageIcon className="mr-2 h-4 w-4"/>
                        Proofing
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="mt-4">
                    <DataTable columns={columns} data={tasks} users={MOCK_USERS} onUpdateTask={onUpdateTask} />
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProjectNotes projectId={project.id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="chat" className="mt-4">
                    <ProjectChat projectId={project.id} />
                </TabsContent>
                <TabsContent value="proofing" className="mt-4">
                     <Suspense fallback={<LoadingSpinner />}>
                        <ProofingTool projectId={project.id} documentId="mock-doc-1" />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    