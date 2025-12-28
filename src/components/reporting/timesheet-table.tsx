
'use client';

import { useMemo } from 'react';
import { TimeEntry, User } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Clock } from 'lucide-react';

interface TimeSheetTableProps {
  timeEntries: TimeEntry[];
  users: User[];
}

export function TimeSheetTable({ timeEntries, users }: TimeSheetTableProps) {
  const timeSheetData = useMemo(() => {
    const userHours = users.map(user => {
      const userEntries = timeEntries.filter(entry => entry.userId === user.id);
      const billable = userEntries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0);
      const nonBillable = userEntries.filter(e => !e.billable).reduce((sum, e) => sum + e.duration, 0);
      const total = billable + nonBillable;
      return {
        ...user,
        billable,
        nonBillable,
        total,
      };
    });
    return userHours.filter(u => u.total > 0);
  }, [timeEntries, users]);

  const totals = useMemo(() => {
    return timeSheetData.reduce((acc, user) => ({
        billable: acc.billable + user.billable,
        nonBillable: acc.nonBillable + user.nonBillable,
        total: acc.total + user.total,
    }), { billable: 0, nonBillable: 0, total: 0 });
  }, [timeSheetData])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            <CardTitle>Time Sheet</CardTitle>
        </div>
        <CardDescription>Total hours logged per user, split by billable and non-billable.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead className="text-right">Billable</TableHead>
              <TableHead className="text-right">Non-Billable</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSheetData.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.name}
                </TableCell>
                <TableCell className="text-right">{user.billable.toFixed(2)}</TableCell>
                <TableCell className="text-right">{user.nonBillable.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold">{user.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
           <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totals.billable.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">{totals.nonBillable.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">{totals.total.toFixed(2)}</TableCell>
                </TableRow>
           </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
