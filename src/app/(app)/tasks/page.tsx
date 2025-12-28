import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableIcon } from 'lucide-react';

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Task Table View
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Projects & Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <TableIcon className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Dynamic Table View Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A fully-featured table using @tanstack/react-table with inline editing and dynamic columns is under construction.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
