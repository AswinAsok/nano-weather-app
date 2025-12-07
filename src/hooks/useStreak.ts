import { useCallback, useEffect, useState } from "react";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCheckDate: string | null;
    totalSearches: number;
    achievements: string[];
}

const STORAGE_KEY = "nano-weather-streak";

const ACHIEVEMENTS = {
    first_search: { name: "First Steps", description: "Made your first weather search", threshold: 1 },
    streak_3: { name: "Getting Hooked", description: "3 day streak", threshold: 3 },
    streak_7: { name: "Weather Watcher", description: "7 day streak", threshold: 7 },
    streak_14: { name: "Meteorologist", description: "14 day streak", threshold: 14 },
    streak_30: { name: "Weather Wizard", description: "30 day streak", threshold: 30 },
    searches_10: { name: "Explorer", description: "10 cities searched", threshold: 10 },
    searches_50: { name: "Globetrotter", description: "50 cities searched", threshold: 50 },
    searches_100: { name: "World Traveler", description: "100 cities searched", threshold: 100 },
};

function getDateString(date: Date = new Date()): string {
    return date.toISOString().split("T")[0];
}

function loadStreakData(): StreakData {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as StreakData;
        }
    } catch {
        // Ignore parse errors
    }
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: null,
        totalSearches: 0,
        achievements: [],
    };
}

function saveStreakData(data: StreakData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Ignore storage errors
    }
}

export function useStreak() {
    const [streakData, setStreakData] = useState<StreakData>(loadStreakData);
    const [newAchievement, setNewAchievement] = useState<string | null>(null);

    // Check and update streak on mount
    useEffect(() => {
        const data = loadStreakData();

        if (data.lastCheckDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = getDateString(yesterday);

            // If last check was before yesterday, reset streak
            if (data.lastCheckDate < yesterdayString) {
                data.currentStreak = 0;
            }
        }

        setStreakData(data);
    }, []);

    const recordSearch = useCallback(() => {
        const today = getDateString();
        const data = loadStreakData();
        const newAchievements: string[] = [];

        // Update total searches
        data.totalSearches += 1;

        // Check if this is a new day
        if (data.lastCheckDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = getDateString(yesterday);

            if (data.lastCheckDate === yesterdayString) {
                // Consecutive day - increase streak
                data.currentStreak += 1;
            } else if (data.lastCheckDate === null || data.lastCheckDate < yesterdayString) {
                // First search or streak broken - start new streak
                data.currentStreak = 1;
            }
            // If same day, don't change streak

            data.lastCheckDate = today;

            // Update longest streak
            if (data.currentStreak > data.longestStreak) {
                data.longestStreak = data.currentStreak;
            }
        }

        // Check for new achievements
        if (data.totalSearches >= 1 && !data.achievements.includes("first_search")) {
            data.achievements.push("first_search");
            newAchievements.push("First Steps");
        }
        if (data.currentStreak >= 3 && !data.achievements.includes("streak_3")) {
            data.achievements.push("streak_3");
            newAchievements.push("Getting Hooked");
        }
        if (data.currentStreak >= 7 && !data.achievements.includes("streak_7")) {
            data.achievements.push("streak_7");
            newAchievements.push("Weather Watcher");
        }
        if (data.currentStreak >= 14 && !data.achievements.includes("streak_14")) {
            data.achievements.push("streak_14");
            newAchievements.push("Meteorologist");
        }
        if (data.currentStreak >= 30 && !data.achievements.includes("streak_30")) {
            data.achievements.push("streak_30");
            newAchievements.push("Weather Wizard");
        }
        if (data.totalSearches >= 10 && !data.achievements.includes("searches_10")) {
            data.achievements.push("searches_10");
            newAchievements.push("Explorer");
        }
        if (data.totalSearches >= 50 && !data.achievements.includes("searches_50")) {
            data.achievements.push("searches_50");
            newAchievements.push("Globetrotter");
        }
        if (data.totalSearches >= 100 && !data.achievements.includes("searches_100")) {
            data.achievements.push("searches_100");
            newAchievements.push("World Traveler");
        }

        saveStreakData(data);
        setStreakData(data);

        if (newAchievements.length > 0) {
            setNewAchievement(newAchievements[0]);
            setTimeout(() => setNewAchievement(null), 3000);
        }

        return data;
    }, []);

    const clearNewAchievement = useCallback(() => {
        setNewAchievement(null);
    }, []);

    return {
        ...streakData,
        recordSearch,
        newAchievement,
        clearNewAchievement,
        allAchievements: ACHIEVEMENTS,
    };
}
