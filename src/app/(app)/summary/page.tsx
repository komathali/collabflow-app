import { SummaryGeneratorForm } from "@/components/summary-generator-form";
import { BrainCircuit } from "lucide-react";

export default function MeetingSummaryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <BrainCircuit className="w-10 h-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Meeting Summary Generator</h1>
            <p className="text-muted-foreground">
              Paste your meeting discussion or transcript to get an AI-generated summary with key decisions and next steps.
            </p>
        </div>
      </div>
      <SummaryGeneratorForm />
    </div>
  );
}
