"use client";

import { useEffect, useState } from "react";
import { Job, fetchArtifacts } from "@/lib/api";

interface JobRowProps {
  job: Job;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "completed" || statusLower === "success") {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }
  if (statusLower === "failed" || statusLower === "error") {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
  if (statusLower === "running" || statusLower === "processing") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
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
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          {loading && (
            <div className="flex flex-col items-center gap-1">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="text-xs text-gray-400">Loading</span>
            </div>
          )}
          {!loading && previewUrl && (
            <img
              src={previewUrl}
              alt={`Preview for ${job.job_name}`}
              className="w-full h-full object-contain"
            />
          )}
          {!loading && error && (
            <span className="text-xs text-gray-400 px-2 text-center">No preview</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="font-semibold text-gray-900 dark:text-white">
          {job.job_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
            job.current_status
          )}`}
        >
          {job.current_status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {formatDate(job.last_updated)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={copyJobId}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono transition-colors duration-150 flex items-center gap-1 group"
          title="Click to copy full ID"
        >
          <span>{job.job_id.slice(0, 8)}...</span>
          {copied ? (
            <span className="text-green-600 dark:text-green-400 text-[10px]">
              ✓ Copied
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 text-[10px] transition-opacity">
              Copy
            </span>
          )}
        </button>
      </td>
    </tr>
  );
}
