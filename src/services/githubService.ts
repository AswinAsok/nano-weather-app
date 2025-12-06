import type { GithubRepoService } from "./contracts";

class GithubApiService implements GithubRepoService {
    constructor(private readonly repo: string, private readonly token?: string) {}

    async fetchRepoStars(): Promise<number> {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        };

        if (this.token) headers.Authorization = `Bearer ${this.token}`;

        const res = await fetch(
            `https://api.github.com/repos/${this.repo}/stargazers?per_page=1`,
            { headers }
        );

        if (!res.ok) {
            throw new Error(`GitHub API error: ${res.status}`);
        }

        const linkHeader = res.headers.get("link");
        if (linkHeader) {
            const match = linkHeader.match(/[?&]page=(\d+)>; rel="last"/);
            if (match && match[1]) {
                return Number(match[1]);
            }
        }

        const data = (await res.json()) as unknown[];
        return Array.isArray(data) ? data.length : 0;
    }
}

const token = import.meta.env.VITE_GITHUB_TOKEN?.trim();
export const githubRepoService: GithubRepoService = new GithubApiService(
    "AswinAsok/nano-weather-app",
    token
);
