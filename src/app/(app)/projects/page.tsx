'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDataService } from "@/hooks/useDataService";
import { Project, Task } from "@/lib/types";
import { FolderKanban, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "@/components/project/create-project-modal";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Record<string, Task[]>>({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dataService = useDataService();

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const userProjects = await dataService.getProjects();
            setProjects(userProjects);
            
            const taskPromises = userProjects.map(p => dataService.getTasksByProjectId(p.id));
            const allTasks = await Promise.all(taskPromises);

            const tasksByProject: Record<string, Task[]> = {};
            userProjects.forEach((project, index) => {
                tasksByProject[project.id] = allTasks[index];
            });
            setTasks(tasksByProject);

        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const onProjectCreated = (newProject: Project) => {
        setProjects(prev => [...prev, newProject]);
        fetchProjects();
    }

    const calculateProgress = (projectId: string) => {
        const projectTasks = tasks[projectId] || [];
        if (projectTasks.length === 0) return 0;
        const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
        return Math.round((completedTasks / projectTasks.length) * 100);
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Projects
                    </h1>
                    <p className="text-muted-foreground">An overview of all your team's projects.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </div>

            {projects.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map(project => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="w-6 h-6" />
                                    <CardTitle className="truncate hover:underline">
                                        <Link href={`/projects/${project.id}`}>{project.name}</Link>
                                    </CardTitle>
                                </div>
                                <CardDescription className="line-clamp-2 h-10">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{calculateProgress(project.id)}%</span>
                                    </div>
                                    <Progress value={calculateProgress(project.id)} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Created: {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <FolderKanban className="w-16 h-16 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Projects Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Get started by creating a new project.
                    </p>
                    <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            )}
             <CreateProjectModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} onProjectCreated={onProjectCreated} />
        </div>
    );
}
