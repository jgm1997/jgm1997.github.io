const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
export const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME;

function getAuthHeaders(): Record<string, string> {
  if (!GITHUB_TOKEN) return {};
  return { Authorization: `Bearer ${GITHUB_TOKEN}` };
}

export async function getRepos() {
  if (!GITHUB_USERNAME) {
    console.warn("GITHUB_USERNAME is not set; returning empty repository list.");
    return [];
  }

  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10&type=owner`;
  let res = await fetch(url, { headers: getAuthHeaders() });

  // Public repositories can be fetched without auth; retry once if token is invalid.
  if (res.status === 401 && GITHUB_TOKEN) {
    console.warn("Invalid GITHUB_TOKEN for repos endpoint; retrying without auth.");
    res = await fetch(url);
  }

  if (!res.ok) {
    console.error(`GitHub API error while fetching repos: ${res.status}`);
    return [];
  }

  return res.json();
}

export async function getContributions() {
  if (!GITHUB_USERNAME) {
    console.warn("GITHUB_USERNAME is not set; skipping contributions query.");
    return null;
  }

  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN is not set; skipping contributions query.");
    return null;
  }

  const query = `{
    user(login: "${GITHUB_USERNAME}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error(`GitHub GraphQL error while fetching contributions: ${res.status}`);
    return null;
  }

  const data = await res.json();
  if (data?.errors?.length) {
    console.error("GitHub GraphQL response contained errors.");
    return null;
  }

  return data;
}