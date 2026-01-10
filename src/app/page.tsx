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
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 pb-6">
          <h1 className="text-3xl font-light text-[#0066FF] tracking-tight mb-2">
            Jobs
          </h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            Workflow Automation
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-sm text-red-700 font-mono">{error}</p>
          </div>
        )}

        {loading && jobs.length === 0 ? (
          <div className="bg-white border-2 border-[#0066FF]/20 rounded-xl p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#0066FF]/20 border-t-[#0066FF] mb-4"></div>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              Loading
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border-2 border-[#0066FF]/20 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0066FF]/5 border-b-2 border-[#0066FF]/10">
                      <th className="px-6 py-4 text-left text-[10px] font-mono text-[#0066FF] uppercase tracking-wider">
                        Preview
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-mono text-[#0066FF] uppercase tracking-wider">
                        Job Name
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-mono text-[#0066FF] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-mono text-[#0066FF] uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-mono text-[#0066FF] uppercase tracking-wider">
                        Job ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <JobRow key={job.job_id} job={job} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-[#0066FF] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#0052CC] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-sm hover:shadow-md disabled:hover:shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                      Loading
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {!nextCursor && jobs.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                  End of List
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
