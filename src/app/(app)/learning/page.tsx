
import LearningCenter from "@/components/learning/learning-center";
import { GraduationCap } from "lucide-react";

export default function LearningPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold font-headline">Learning Center</h1>
          <p className="text-muted-foreground">From Forex fundamentals to D-Score mastery.</p>
        </div>
      </div>
      <LearningCenter />
    </main>
  );
}
