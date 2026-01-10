"use client";

import { useEffect, useState } from "react";
import { Job, fetchArtifacts } from "@/lib/api";

interface JobRowProps {
  job: Job;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "completed" || statusLower === "success") {
    return "text-gray-700 bg-gray-100 border-gray-300";
  }
  if (statusLower === "failed" || statusLower === "error") {
    return "text-red-600 bg-red-50 border-red-300";
  }
  if (statusLower === "running" || statusLower === "processing") {
    return "text-[#0066FF] bg-[#0066FF]/10 border-[#0066FF]";
  }
  return "text-gray-500 bg-gray-50 border-gray-300";
};

export default function JobRow({ job }: JobRowProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPreview() {
      try {
        setLoading(true);
        setError(false);
        const artifacts = await fetchArtifacts(job.job_id);
        if (mounted && artifacts.artifacts?.preview_png) {
          setPreviewUrl(artifacts.artifacts.preview_png);
        } else if (mounted) {
          setError(true);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [job.job_id]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date).replace(",", "");
    } catch {
      return isoString;
    }
  };

  const copyJobId = async () => {
    try {
      await navigator.clipboard.writeText(job.job_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      console.error("Failed to copy:", err);
    }
  };

  return (
    <tr className="border-b border-[#0066FF]/10 hover:bg-[#0066FF]/5 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-28 h-28 bg-[#0066FF]/5 flex items-center justify-center overflow-hidden border-2 border-[#0066FF]/20 rounded-lg">
          {loading && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#0066FF]/30 border-t-[#0066FF]"></div>
              <span className="text-[10px] text-[#0066FF] font-mono">LOAD</span>
            </div>
          )}
          {!loading && previewUrl && (
            <img
              src={previewUrl}
              alt={`Preview for ${job.job_name}`}
              className="w-full h-full object-contain rounded"
            />
          )}
          {!loading && error && (
            <span className="text-[10px] text-gray-400 font-mono px-2 text-center">
              N/A
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {job.job_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-full ${getStatusColor(
            job.current_status
          )}`}
        >
          {job.current_status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs text-gray-600 font-mono">
          {formatDate(job.last_updated)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={copyJobId}
          className="text-xs text-[#0066FF] hover:text-[#0052CC] font-mono transition-colors duration-150 flex items-center gap-1.5 group px-2 py-1 rounded hover:bg-[#0066FF]/10"
          title="Click to copy full ID"
        >
          <span>{job.job_id.slice(0, 8)}</span>
          <span className="text-gray-400">...</span>
          {copied ? (
            <span className="text-[10px] text-[#0066FF] font-mono">
              ✓
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 font-mono transition-opacity">
              COPY
            </span>
          )}
        </button>
      </td>
    </tr>
  );
}
