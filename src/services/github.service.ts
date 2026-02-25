/**
 * GitHub Service — Fetches development metrics from the GitHub public REST API.
 *
 * Usage:
 *   import { fetchGitHubMetrics, parseGitHubUrl } from './github.service';
 *   const { owner, repo } = parseGitHubUrl('https://github.com/owner/repo');
 *   const metrics = await fetchGitHubMetrics(owner, repo);
 */

export interface GitHubMetrics {
    commits: number;
    prs: number;
    bugs: number;
    tests: number;
}

const GITHUB_API = 'https://api.github.com';

/**
 * Parse a GitHub URL into owner and repo.
 * Accepts formats: https://github.com/owner/repo, github.com/owner/repo, owner/repo
 */
export function parseGitHubUrl(
    url: string
): { owner: string; repo: string } | null {
    if (!url || !url.trim()) return null;

    const cleaned = url
        .trim()
        .replace(/\/+$/, '') // remove trailing slashes
        .replace(/\.git$/, ''); // remove .git suffix

    // Match "owner/repo" from various URL formats
    const match = cleaned.match(
        /(?:github\.com\/|^)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/
    );

    if (!match) return null;
    return { owner: match[1], repo: match[2] };
}

/**
 * Fetch development metrics from the GitHub REST API.
 * Works for public repos without authentication.
 * For private repos, pass a token.
 */
export async function fetchGitHubMetrics(
    owner: string,
    repo: string,
    token?: string
): Promise<GitHubMetrics> {
    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const get = async (path: string) => {
        const res = await fetch(`${GITHUB_API}${path}`, { headers });
        if (!res.ok) {
            throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
        }
        return res;
    };

    // Quick repo existence check to avoid spamming multiple 404s
    const repoCheck = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });
    if (!repoCheck.ok) {
        throw new Error(`GitHub API ${repoCheck.status}: Repository not found or inaccessible`);
    }

    // Run all requests in parallel for speed
    const [commitsRes, prsRes, bugsRes] = await Promise.all([
        // Commits: get total count from the last page link, or count the array
        get(`/repos/${owner}/${repo}/commits?per_page=1`),

        // Pull Requests: all states to get total count
        get(`/repos/${owner}/${repo}/pulls?state=all&per_page=1`),

        // Open bugs: issues labeled "bug" that are open
        get(`/repos/${owner}/${repo}/issues?labels=bug&state=open&per_page=1`),
    ]);

    // Parse counts from the Link header's "last" page number, or from the response
    const commits = extractCountFromLinkHeader(commitsRes) ??
        (await commitsRes.json()).length ?? 0;

    const prs = extractCountFromLinkHeader(prsRes) ??
        (await prsRes.json()).length ?? 0;

    const bugs = extractCountFromLinkHeader(bugsRes) ??
        (await bugsRes.json()).length ?? 0;

    // Tests: try to get from latest GitHub Actions run
    let tests = 0;
    try {
        const runsRes = await get(
            `/repos/${owner}/${repo}/actions/runs?status=completed&per_page=1`
        );
        const runsData = await runsRes.json();
        tests = runsData.total_count ?? 0;
    } catch {
        // No Actions configured — that's fine
        tests = 0;
    }

    return { commits, prs, bugs, tests };
}

/**
 * Extract the total count from GitHub's Link header pagination.
 * GitHub returns: Link: <...?page=42>; rel="last"
 * The page number of "last" is the total count (when per_page=1).
 */
function extractCountFromLinkHeader(res: Response): number | null {
    const link = res.headers.get('Link');
    if (!link) return null;

    const lastMatch = link.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    if (!lastMatch) return null;

    return parseInt(lastMatch[1], 10);
}
