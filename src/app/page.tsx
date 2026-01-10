"use client";

import { useEffect, useState } from "react";
import { Job, fetchJobsPage } from "@/lib/api";
import JobRow from "@/components/JobRow";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs(cursor?: string | null) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchJobsPage({ limit: 20, cursor });
      if (cursor) {
        setJobs((prev) => [...prev, ...response.items]);
      } else {
        setJobs(response.items);
      }
      setNextCursor(response.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    if (nextCursor && !loading) {
      loadJobs(nextCursor);
    }
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Jobs</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading jobs...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                    <th className="p-4 text-left">Preview</th>
                    <th className="p-4 text-left">Job Name</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Last Updated</th>
                    <th className="p-4 text-left">Job ID</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <JobRow key={job.job_id} job={job} />
                  ))}
                </tbody>
              </table>
            </div>

            {nextCursor && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {!nextCursor && jobs.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                No more jobs to load
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
