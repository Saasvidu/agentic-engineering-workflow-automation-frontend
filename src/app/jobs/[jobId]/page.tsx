"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchArtifacts, ArtifactsResponse } from "@/lib/api";
import GLBViewer from "@/components/GLBViewer";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [artifacts, setArtifacts] = useState<ArtifactsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchArtifacts(jobId);
        setArtifacts(data);

        if (data.artifacts?.summary) {
          try {
            const summaryResponse = await fetch(data.artifacts.summary);
            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();
              setSummary(summaryData);
            }
          } catch (err) {
            console.warn("Failed to load summary:", err);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load artifacts");
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      loadArtifacts();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-6">
            <Link
              href="/"
              className="text-xs text-[#0066FF] hover:text-[#0052CC] font-mono uppercase tracking-wider"
            >
              ← Back to Jobs
            </Link>
          </div>
          <div className="bg-white border-2 border-[#0066FF]/20 rounded-xl p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#0066FF]/20 border-t-[#0066FF] mb-4"></div>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              Loading Artifacts
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !artifacts) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-6">
            <Link
              href="/"
              className="text-xs text-[#0066FF] hover:text-[#0052CC] font-mono uppercase tracking-wider"
            >
              ← Back to Jobs
            </Link>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-700 font-mono">{error || "Failed to load artifacts"}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs text-[#0066FF] hover:text-[#0052CC] font-mono uppercase tracking-wider"
          >
            ← Back to Jobs
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#0066FF] tracking-tight mb-2">
            Job Details
          </h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            {jobId}
          </p>
        </div>

        {artifacts.artifacts?.preview_png && (
          <div className="mb-8">
            <h2 className="text-sm font-mono text-[#0066FF] uppercase tracking-wider mb-3">
              Preview
            </h2>
            <div className="bg-white border-2 border-[#0066FF]/20 rounded-lg overflow-hidden">
              <img
                src={artifacts.artifacts.preview_png}
                alt="Job preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {artifacts.artifacts?.mesh_glb ? (
          <div className="mb-8">
            <h2 className="text-sm font-mono text-[#0066FF] uppercase tracking-wider mb-3">
              3D Model
            </h2>
            <GLBViewer url={artifacts.artifacts.mesh_glb} />
          </div>
        ) : (
          <div className="mb-8 bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              No 3D model available
            </p>
          </div>
        )}

        {summary && (
          <div className="mb-8">
            <h2 className="text-sm font-mono text-[#0066FF] uppercase tracking-wider mb-3">
              Summary
            </h2>
            <div className="bg-gray-50 border-2 border-[#0066FF]/20 rounded-lg p-4 overflow-auto">
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(summary, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-sm font-mono text-[#0066FF] uppercase tracking-wider mb-3">
            Downloads
          </h2>
          <div className="flex flex-wrap gap-3">
            {artifacts.artifacts?.mesh_glb && (
              <a
                href={artifacts.artifacts.mesh_glb}
                download
                className="px-4 py-2 bg-[#0066FF] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#0052CC] rounded-lg transition-colors duration-150"
              >
                Download GLB
              </a>
            )}
            {artifacts.artifacts?.mesh_vtu && (
              <a
                href={artifacts.artifacts.mesh_vtu}
                download
                className="px-4 py-2 bg-[#0066FF] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#0052CC] rounded-lg transition-colors duration-150"
              >
                Download VTU
              </a>
            )}
            {!artifacts.artifacts?.mesh_glb && !artifacts.artifacts?.mesh_vtu && (
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                No downloads available
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
