import { useEffect, useState } from "react";
import type { GithubRepoService } from "../services/contracts";

export function useGithubStars(repoService: GithubRepoService) {
    const [stars, setStars] = useState<number | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        const loadStars = async () => {
            try {
                const count = await repoService.fetchRepoStars();
                if (active) setStars(count);
            } catch (err) {
                console.error("Failed to fetch GitHub stars", err);
                if (active) setError(true);
            }
        };

        loadStars();
        return () => {
            active = false;
        };
    }, [repoService]);

    return { stars, error };
}
