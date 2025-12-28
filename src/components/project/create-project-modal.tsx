
'use client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDataService } from "@/hooks/useDataService";
import { Project, User } from "@/lib/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  memberIds: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, setIsOpen, onProjectCreated }: CreateProjectModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const dataService = useDataService();
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      memberIds: [],
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await dataService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    }
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const newProjectData = {
          ...values,
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString()
      };
      const newProject = await dataService.createProject(newProjectData);
      toast({
          title: "Project Created!",
          description: `"${newProject.name}" has been successfully created.`,
      });
      onProjectCreated(newProject);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create project", error);
       toast({
          title: "Error",
          description: "Failed to create the project.",
          variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill out the details below to start a new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q4 Marketing Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of what this project is about." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="memberIds"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Team Members</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                                    {field.value?.length ? `${field.value.length} selected` : "Select members"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                                <CommandInput placeholder="Search users..."/>
                                <CommandList>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                    {users.map(user => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.name}
                                            onSelect={() => {
                                                const selected = field.value || [];
                                                const isSelected = selected.includes(user.id);
                                                form.setValue('memberIds', isSelected ? selected.filter(id => id !== user.id) : [...selected, user.id]);
                                            }}
                                        >
                                             <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(user.id) ? "opacity-100" : "opacity-0")}/>
                                             {user.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                           </Command>
                        </PopoverContent>
                     </Popover>
                    <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
