"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, RefreshCw } from "lucide-react";

interface UploadFileProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  currentFileName?: string | null;
}

/** Area upload file (.xlsx/.xls/.csv) dengan drag & drop + border marching-ants. */
export default function UploadFile({ onFile, disabled, currentFileName }: UploadFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) onFile(files[0]);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`dropzone ${
        dragOver ? "dropzone-active" : ""
      } flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {currentFileName ? (
        <>
          <span className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20">
            <FileSpreadsheet className="h-8 w-8" />
          </span>
          <p className="max-w-[260px] truncate font-bold text-fg">{currentFileName}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <RefreshCw className="h-3.5 w-3.5" /> Klik untuk ganti file
          </p>
        </>
      ) : (
        <>
          <span className="animate-float mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20">
            <UploadCloud className="h-8 w-8" />
          </span>
          <p className="text-lg font-bold text-fg">Drag &amp; drop file di sini</p>
          <p className="mt-1 text-sm text-muted">atau klik untuk memilih file</p>
          <span className="mt-4 rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-muted ring-1 ring-line">
            Format: PDF jadwal AMC · .xlsx · .xls · .csv
          </span>
        </>
      )}
    </div>
  );
}
