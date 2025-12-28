'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getMeetingSummaryAction } from '@/app/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const initialState = {
  message: null,
  errors: null,
  summary: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export function SummaryGeneratorForm() {
  const [state, formAction] = useFormState(getMeetingSummaryAction, initialState);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <Textarea
              name="discussionText"
              placeholder="Paste your full meeting transcript or discussion text here..."
              className="min-h-[200px] text-base"
              required
            />
            {state?.errors?.discussionText && (
              <p className="text-sm font-medium text-destructive">
                {state.errors.discussionText}
              </p>
            )}
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {state.summary && (
        <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                <CardTitle>Generated Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-secondary p-4">
              {state.summary}
            </div>
          </CardContent>
        </Card>
      )}

      {state.message && !state.summary && state.errors && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {Object.values(state.errors).flat().join('\n') || 'An error occurred.'}
            </AlertDescription>
         </Alert>
      )}
    </div>
  );
}
