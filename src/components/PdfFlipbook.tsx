import { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfFlipbookProps {
  file: File;
}

type FlipBookHandle = {
  pageFlip: () => {
    flipPrev: () => void;
    flipNext: () => void;
  } | null;
};

const PdfFlipbook = ({ file }: PdfFlipbookProps) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"loading" | "rendering">("loading");
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageAspect, setPageAspect] = useState(1 / 1.414);
  const bookRef = useRef<FlipBookHandle | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderPdf = async () => {
      setLoading(true);
      setPhase("loading");
      setProgress(0);
      setPages([]);
      setCurrentPage(0);
      setTotalPages(0);
      setError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument({
          data: new Uint8Array(arrayBuffer),
          useWorkerFetch: false,
          isEvalSupported: false,
        });

        loadingTask.onProgress = ({ loaded, total }) => {
          if (cancelled || !total) return;
          setProgress(Math.max(1, Math.round((loaded / total) * 30)));
        };

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        setTotalPages(numPages);
        setPhase("rendering");

        const renderedPages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          if (i === 1 && !cancelled) {
            setPageAspect(viewport.width / viewport.height);
          }
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas rendering is unavailable.");
          }

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          renderedPages.push(canvas.toDataURL("image/jpeg", 0.9));

          if (!cancelled) {
            setProgress(30 + Math.round((i / numPages) * 70));
          }
        }

        if (cancelled) return;

        setPages(renderedPages);
        setLoading(false);
      } catch (renderError) {
        console.error("Failed to load PDF", renderError);

        if (cancelled) return;

        setError("This PDF could not be loaded. Please try another file.");
        setLoading(false);
      }
    };

    void renderPdf();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const onFlip = useCallback((event: { data: number }) => {
    setCurrentPage(event.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => bookRef.current?.pageFlip()?.flipNext();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-2 w-64 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {phase === "loading" ? "Loading PDF…" : "Rendering pages…"} {progress}%
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const maxW = window.innerWidth * 0.32;
  const maxH = window.innerHeight * 0.7;
  const widthFromMax = Math.min(420, Math.max(280, maxW));
  const heightFromWidth = widthFromMax / pageAspect;
  const pageHeight = Math.min(heightFromWidth, maxH);
  const pageWidth = pageHeight * pageAspect;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flip-book-container">
        <HTMLFlipBook
          ref={bookRef}
          width={pageWidth}
          height={pageHeight}
          showCover={pages.length > 1}
          onFlip={onFlip}
          flippingTime={600}
          usePortrait={false}
          maxShadowOpacity={0.4}
          mobileScrollSupport={true}
          className=""
          style={{}}
          startPage={0}
          size="fixed"
          minWidth={280}
          maxWidth={600}
          minHeight={396}
          maxHeight={900}
          drawShadow={true}
          startZIndex={0}
          autoSize={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {pages.map((image, index) => (
            <div key={`${index}-${image.slice(0, 24)}`} className="page-content">
              <img
                src={image}
                alt={`Page ${index + 1}`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={flipPrev}
          disabled={currentPage <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[100px] text-center text-sm text-muted-foreground">
          Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PdfFlipbook;
