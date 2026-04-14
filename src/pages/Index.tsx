import { useState, useRef } from "react";
import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import PdfFlipbook from "@/components/PdfFlipbook";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type === "application/pdf") setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  if (file) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground truncate max-w-xs">
                {file.name}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFile(null)}
            >
              Open another
            </Button>
          </div>
          <PdfFlipbook file={file} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          PDF Flipbook
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a PDF and read it like a real book
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="group flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-12 transition-colors hover:border-primary/50 hover:bg-card/80"
      >
        <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
        <p className="font-medium text-foreground">
          Drop your PDF here
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
