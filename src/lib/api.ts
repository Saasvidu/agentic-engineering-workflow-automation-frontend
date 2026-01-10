// API types and helper functions for MCP Server

const MCP_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Job {
  job_id: string;
  job_name: string;
  current_status: string;
  last_updated: string;
}

export interface JobsPageResponse {
  items: Job[];
  limit: number;
  has_more: boolean;
  next_cursor: string | null;
}

export interface Artifacts {
  summary: string;
  preview_png: string;
  mesh_glb: string;
  mesh_vtu: string;
}

export interface ArtifactsResponse {
  job_id: string;
  expires_in_seconds: number;
  base_path: string;
  artifacts: Artifacts;
}

export interface FetchJobsPageParams {
  limit?: number;
  cursor?: string | null;
  status?: string;
}

export async function fetchJobsPage({
  limit = 20,
  cursor,
  status,
}: FetchJobsPageParams = {}): Promise<JobsPageResponse> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (cursor) {
    params.append("cursor", cursor);
  }
  if (status) {
    params.append("status", status);
  }

  const url = `${MCP_BASE_URL}/mcp/jobs?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(
      `Error fetching jobs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function fetchArtifacts(
  jobId: string
): Promise<ArtifactsResponse> {
  const url = `${MCP_BASE_URL}/mcp/${jobId}/artifacts`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch artifacts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(
      `Error fetching artifacts: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
