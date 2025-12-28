import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanSquare } from 'lucide-react';

export default function BoardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Kanban Board
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Project Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
            <KanbanSquare className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Interactive Kanban Board Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A drag-and-drop board using @dnd-kit will be implemented here to manage task statuses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
