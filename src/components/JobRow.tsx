'use client';

import { useEffect, useState } from 'react';
import { Job, fetchArtifacts } from '@/lib/api';

interface JobRowProps {
  job: Job;
}

export default function JobRow({ job }: JobRowProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const copyJobId = () => {
    navigator.clipboard.writeText(job.job_id);
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="p-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden">
          {loading && <span className="text-xs text-gray-400">Loading...</span>}
          {!loading && previewUrl && (
            <img
              src={previewUrl}
              alt={`Preview for ${job.job_name}`}
              className="w-full h-full object-contain"
            />
          )}
          {!loading && error && (
            <span className="text-xs text-gray-400">No preview</span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="font-medium">{job.job_name}</div>
      </td>
      <td className="p-4">
        <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700">
          {job.current_status}
        </span>
      </td>
      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(job.last_updated)}
      </td>
      <td className="p-4">
        <button
          onClick={copyJobId}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
          title="Click to copy"
        >
          {job.job_id.slice(0, 8)}...
        </button>
      </td>
    </tr>
  );
}
