"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, Loader2 } from "lucide-react";

export default function ResumeUpload({ onUploadComplete }: { onUploadComplete?: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setResult(data.profile);
      if (onUploadComplete) onUploadComplete(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl mx-auto my-8 text-white">
      <h3 className="text-xl font-semibold mb-4 text-zinc-100 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-blue-500" />
        Upload Resume
      </h3>
      
      {!result ? (
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-zinc-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-zinc-800 file:text-blue-400
              hover:file:bg-zinc-700 transition"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600 text-white rounded-lg font-medium transition"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Parse Resume"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-400 font-medium">
            <CheckCircle className="w-5 h-5" />
            Resume parsed successfully!
          </div>
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm overflow-auto max-h-60">
            <pre className="text-zinc-300">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
