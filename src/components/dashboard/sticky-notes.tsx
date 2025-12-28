'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDataService } from "@/hooks/useDataService";
import { useUser } from "@/firebase";
import { StickyNote as StickyNoteType } from "@/lib/types";

export default function StickyNotes() {
    const [note, setNote] = useState<StickyNoteType | null>(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const dataService = useDataService();
    const { user } = useUser();

    useEffect(() => {
        if (!user) return;
        
        setIsLoading(true);
        const unsubscribe = dataService.onStickyNote(user.uid, (noteData) => {
            setNote(noteData);
            setContent(noteData?.content || '');
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, dataService]);

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            await dataService.saveStickyNote(user.uid, content);
            toast({
                title: "Note Saved",
                description: "Your sticky note has been saved.",
            });
        } catch (error) {
            console.error("Failed to save note:", error);
            toast({
                title: "Error",
                description: "Could not save your sticky note.",
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StickyNote className="w-6 h-6" />
                        <CardTitle>Sticky Notes</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="sr-only">Save Note</span>
                    </Button>
                </div>
                <CardDescription>Your private scratchpad. Saved to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-36">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <Textarea
                        placeholder="Jot down your thoughts..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="h-36 resize-none"
                    />
                )}
            </CardContent>
        </Card>
    );
}
