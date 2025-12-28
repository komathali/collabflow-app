'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function MyAgenda() {
    const [date, setDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        setDate(new Date());
    }, []);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-6 h-6" />
                    <CardTitle>My Agenda</CardTitle>
                </div>
                <CardDescription>Your personal calendar for tasks and events.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                />
            </CardContent>
        </Card>
    )
}
