import { Flame, Trophy, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak: number;
    totalSearches: number;
    achievements: string[];
    newAchievement: string | null;
    onClearAchievement: () => void;
}

export function StreakBadge({
    currentStreak,
    longestStreak,
    totalSearches,
    achievements,
    newAchievement,
    onClearAchievement,
}: StreakBadgeProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (newAchievement) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [newAchievement]);

    return (
        <>
            {/* Streak badge button */}
            <button
                onClick={() => setShowDetails(true)}
                className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    currentStreak > 0
                        ? "border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-200/50"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                } ${animate ? "scale-110" : ""}`}
            >
                <Flame
                    className={`w-4 h-4 transition-all ${
                        currentStreak > 0
                            ? "text-orange-500 group-hover:animate-bounce"
                            : "text-slate-400"
                    }`}
                />
                <span>{currentStreak}</span>
                <span className="text-xs opacity-70">day streak</span>
                {achievements.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                        {achievements.length}
                    </span>
                )}
            </button>

            {/* New achievement toast - rendered at document body */}
            {newAchievement &&
                createPortal(
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-bounce">
                        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white shadow-2xl shadow-orange-500/30">
                            <Trophy className="w-6 h-6 animate-pulse" />
                            <div>
                                <p className="text-xs uppercase tracking-wider opacity-80">
                                    Achievement Unlocked!
                                </p>
                                <p className="font-bold">{newAchievement}</p>
                            </div>
                            <button
                                onClick={onClearAchievement}
                                className="ml-2 rounded-full p-1 hover:bg-white/20"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            {/* Details modal - rendered at document body */}
            {showDetails &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowDetails(false)}
                    >
                    <div
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Your Stats</h3>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="rounded-full p-2 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{currentStreak}</p>
                                <p className="text-xs text-slate-500">Current</p>
                            </div>
                            <div className="text-center rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-4">
                                <Trophy className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{longestStreak}</p>
                                <p className="text-xs text-slate-500">Best</p>
                            </div>
                            <div className="text-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-4">
                                <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-slate-900">{totalSearches}</p>
                                <p className="text-xs text-slate-500">Searches</p>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                Achievements ({achievements.length}/8)
                            </h4>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: "first_search", icon: "🌟", name: "First Steps" },
                                    { id: "streak_3", icon: "🔥", name: "Hooked" },
                                    { id: "streak_7", icon: "👀", name: "Watcher" },
                                    { id: "streak_14", icon: "📡", name: "Meteorologist" },
                                    { id: "streak_30", icon: "🧙", name: "Wizard" },
                                    { id: "searches_10", icon: "🧭", name: "Explorer" },
                                    { id: "searches_50", icon: "✈️", name: "Trotter" },
                                    { id: "searches_100", icon: "🌍", name: "Traveler" },
                                ].map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                                            achievements.includes(achievement.id)
                                                ? "bg-gradient-to-br from-amber-50 to-orange-50"
                                                : "bg-slate-50 opacity-40 grayscale"
                                        }`}
                                    >
                                        <span className="text-2xl mb-1">{achievement.icon}</span>
                                        <span className="text-[10px] font-medium text-slate-600 leading-tight">
                                            {achievement.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Motivation */}
                        <div className="mt-6 text-center">
                            {currentStreak === 0 ? (
                                <p className="text-sm text-slate-500">
                                    Search a city to start your streak!
                                </p>
                            ) : currentStreak < 7 ? (
                                <p className="text-sm text-slate-500">
                                    {7 - currentStreak} more days to unlock Weather Watcher!
                                </p>
                            ) : (
                                <p className="text-sm text-orange-600 font-medium">
                                    You're on fire! Keep the streak going!
                                </p>
                            )}
                        </div>
                    </div>
                </div>,
                    document.body
                )}
        </>
    );
}
