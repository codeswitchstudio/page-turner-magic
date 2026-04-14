import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface PageProps {
  image: string;
  number: number;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ image, number }, ref) => (
  <div ref={ref} className="page-content">
    <img
      src={image}
      alt={`Page ${number}`}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </div>
));
Page.displayName = "Page";

interface PdfFlipbookProps {
  file: File;
}

const PdfFlipbook: React.FC<PdfFlipbookProps> = ({ file }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const renderPdf = async () => {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const rendered: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push(canvas.toDataURL("image/jpeg", 0.9));
        setProgress(Math.round((i / numPages) * 100));
      }
      setPages(rendered);
      setLoading(false);
    };
    renderPdf();
  }, [file]);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
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
          Rendering pages… {progress}%
        </p>
      </div>
    );
  }

  const pageWidth = Math.min(400, window.innerWidth * 0.4);
  const pageHeight = pageWidth * 1.414;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flip-book-container">
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={pageWidth}
          height={pageHeight}
          showCover={true}
          onFlip={onFlip}
          flippingTime={600}
          usePortrait={false}
          maxShadowOpacity={0.4}
          mobileScrollSupport={true}
          className=""
          style={{}}
          startPage={0}
          size="fixed"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
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
          {pages.map((img, i) => (
            <Page key={i} image={img} number={i + 1} />
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={flipPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[100px] text-center">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button variant="outline" size="icon" onClick={flipNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PdfFlipbook;
