"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

interface UploadFileProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  currentFileName?: string | null;
}

/** Area upload file (.xlsx/.xls/.csv) dengan drag & drop. */
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
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
        dragOver
          ? "border-brand bg-blue-50"
          : "border-slate-300 bg-white hover:border-brand hover:bg-slate-50"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {currentFileName ? (
        <>
          <FileSpreadsheet className="mb-2 h-10 w-10 text-brand" />
          <p className="font-medium text-slate-700">{currentFileName}</p>
          <p className="mt-1 text-sm text-slate-500">Klik untuk ganti file</p>
        </>
      ) : (
        <>
          <UploadCloud className="mb-2 h-10 w-10 text-brand" />
          <p className="font-medium text-slate-700">
            Klik atau seret file ke sini untuk upload
          </p>
          <p className="mt-1 text-sm text-slate-500">Format: .xlsx, .xls, atau .csv</p>
        </>
      )}
    </div>
  );
}
