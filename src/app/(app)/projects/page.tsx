'use client';
import { Button } from "@/components/ui/button";
import { useDataService } from "@/hooks/useDataService";
import { Project, Task, User } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { DataTable } from "@/components/projects/data-table";
import { columns } from "@/components/projects/columns";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dataService = useDataService();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userProjects, allUsers] = await Promise.all([
                dataService.getProjects(),
                dataService.getUsers()
            ]);
            setProjects(userProjects);
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch projects data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dataService]);

    const onProjectCreated = () => {
        fetchData(); // Refetch all data
    };

    const onUpdateProject = (projectId: string, values: Partial<Project>) => {
        dataService.updateProject(projectId, values).then(() => {
            setProjects((currentProjects) =>
                currentProjects.map((p) =>
                    p.id === projectId ? { ...p, ...values } : p
                )
            );
        });
    };

    const onDeleteProject = (projectId: string) => {
        dataService.deleteProject(projectId).then(() => {
            fetchData();
        });
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
                    <p className="text-muted-foreground">An overview of all your team's projects in a spreadsheet-like view.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </div>

            {projects.length > 0 ? (
                 <DataTable columns={columns} data={projects} users={users} onUpdateProject={onUpdateProject} onDeleteProject={onDeleteProject} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
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
