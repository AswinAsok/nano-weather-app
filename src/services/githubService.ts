export async function fetchRepoStars(): Promise<number> {
  const token = import.meta.env.VITE_GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('https://api.github.com/repos/AswinAsok/nano-weather-app/stargazers?per_page=1', {
    headers,
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const linkHeader = res.headers.get('link');
  if (linkHeader) {
    const match = linkHeader.match(/[?&]page=(\d+)>; rel="last"/);
    if (match && match[1]) {
      return Number(match[1]);
    }
  }

  const data = (await res.json()) as unknown[];
  return Array.isArray(data) ? data.length : 0;
}
