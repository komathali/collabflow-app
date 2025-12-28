
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDataService } from "@/hooks/useDataService";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data/mock-data";
import { Project, Task } from "@/lib/types";
import { Calendar, CheckCircle, Clock, Flag, ListChecks, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectOverviewPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const dataService = useDataService();

    useEffect(() => {
        if (typeof projectId === 'string') {
            const fetchProject = async () => {
                try {
                    const fetchedProject = await dataService.getProjectById(projectId);
                    setProject(fetchedProject || null);
                    // Mock fetching tasks for this project
                    const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
                    setTasks(projectTasks);
                } catch (error) {
                    console.error("Failed to fetch project", error);
                    setProject(null);
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [projectId]);

    if (loading) {
        return <div>Loading project...</div>;
    }

    if (!project) {
        return <div>Project not found.</div>;
    }
    
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const milestones = tasks.filter(t => t.isMilestone);


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

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Flag className="w-6 h-6" />
                                <CardTitle>Milestones</CardTitle>
                            </div>
                            <CardDescription>Key project milestones and their status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {milestones.length > 0 ? (
                                <ul className="space-y-4">
                                    {milestones.map(milestone => (
                                        <li key={milestone.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {milestone.status === 'Done' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-muted-foreground" />}
                                                <div>
                                                    <p className={`font-medium ${milestone.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{milestone.title}</p>
                                                    <p className="text-sm text-muted-foreground">Due: {new Date(milestone.dueDate!).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                             <Badge variant={milestone.status === 'Done' ? 'secondary' : 'default'}>{milestone.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No milestones defined for this project.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Side Panel */}
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ListChecks className="w-6 h-6" />
                                <CardTitle>Recent Activity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-4">Activity feed coming soon.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
