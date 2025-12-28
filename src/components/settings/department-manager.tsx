
'use client';

import { useDataService } from '@/hooks/useDataService';
import { Department, Employee, User } from '@/lib/types';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Building, PlusCircle, Trash2, UserPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    userId: '',
    departmentId: '',
    title: '',
  });

  const dataService = useDataService();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [depts, emps, usrs] = await Promise.all([
        dataService.getDepartments(),
        dataService.getEmployees(),
        dataService.getUsers(),
      ]);
      setDepartments(depts);
      setEmployees(emps);
      setUsers(usrs);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast({ title: 'Error fetching data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [dataService]);

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      await dataService.createDepartment(newDeptName);
      toast({ title: 'Department created' });
      setNewDeptName('');
      setIsDeptModalOpen(false);
      fetchData(); // Refetch all data
    } catch (error) {
      toast({ title: 'Error creating department', variant: 'destructive' });
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.userId || !newEmployee.departmentId || !newEmployee.title) return;
    try {
      await dataService.createEmployee(newEmployee);
      toast({ title: 'Employee added' });
      setIsEmployeeModalOpen(false);
      setNewEmployee({ userId: '', departmentId: '', title: '' });
      fetchData(); // Refetch all data
    } catch (error) {
      toast({ title: 'Error adding employee', variant: 'destructive' });
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    try {
        await dataService.deleteDepartment(deptId);
        toast({ title: 'Department deleted'});
        fetchData(); // Refetch all data
    } catch(e) {
        toast({ title: 'Error deleting department', description: 'Make sure no employees are assigned to it first.', variant: 'destructive' });
    }
  };
  
  const handleDeleteEmployee = async (employeeId: string) => {
      try {
        await dataService.deleteEmployee(employeeId);
        toast({ title: 'Employee removed' });
        fetchData(); // Refetch
      } catch (error) {
        toast({ title: 'Error removing employee', variant: 'destructive' });
      }
  };
  
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Organization Structure</h2>
          <p className="text-muted-foreground">
            Manage departments and employee assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDeptModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Department
          </Button>
          <Button onClick={() => setIsEmployeeModalOpen(true)} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map(dept => (
          <Card key={dept.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <CardTitle className="text-lg">{dept.name}</CardTitle>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will delete the department. Make sure no employees are assigned to it first.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {employees
                  .filter(emp => emp.departmentId === dept.id)
                  .map(emp => (
                    <li key={emp.id} className="flex justify-between items-center group">
                      <div>
                        <p className="font-medium">{getUserName(emp.userId)}</p>
                        <p className="text-xs text-muted-foreground">{emp.title}</p>
                      </div>
                       <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => handleDeleteEmployee(emp.id)}><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                    </li>
                  ))}
                  {employees.filter(emp => emp.departmentId === dept.id).length === 0 && (
                      <li className="text-xs text-muted-foreground italic text-center py-4">No employees assigned.</li>
                  )}
              </ul>
            </CardContent>
          </Card>
        ))}
        {departments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 col-span-3">No departments created yet.</p>
        )}
      </div>

      {/* Create Department Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="dept-name">Department Name</Label>
            <Input
              id="dept-name"
              value={newDeptName}
              onChange={e => setNewDeptName(e.target.value)}
              placeholder="e.g., Engineering"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee to Department</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="user-select">User</Label>
              <Select
                onValueChange={value =>
                  setNewEmployee(e => ({ ...e, userId: value }))
                }
                value={newEmployee.userId}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dept-select">Department</Label>
              <Select
                onValueChange={value =>
                  setNewEmployee(e => ({ ...e, departmentId: value }))
                }
                value={newEmployee.departmentId}
              >
                <SelectTrigger id="dept-select">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="employee-title">Job Title</Label>
                <Input id="employee-title" placeholder="e.g., Director, Manager, Engineer" value={newEmployee.title} onChange={e => setNewEmployee(emp => ({...emp, title: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEmployeeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
