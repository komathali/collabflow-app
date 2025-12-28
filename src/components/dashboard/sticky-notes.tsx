'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'collabflow-sticky-notes';

export default function StickyNotes() {
    const [note, setNote] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        const savedNote = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedNote) {
            setNote(savedNote);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, note);
        toast({
            title: "Note Saved",
            description: "Your sticky note has been saved.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StickyNote className="w-6 h-6" />
                        <CardTitle>Sticky Notes</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Save className="w-5 h-5" />
                        <span className="sr-only">Save Note</span>
                    </Button>
                </div>
                <CardDescription>Your private scratchpad. Saved in your browser.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Jot down your thoughts..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-36 resize-none"
                />
            </CardContent>
        </Card>
    );
}
