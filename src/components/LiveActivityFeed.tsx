import { useEffect, useState } from "react";
import { Globe, Zap } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ActivityItem {
    id: string;
    city: string;
    country: string;
    temperature: number;
    condition: string;
    searched_at: string;
}

function getTimeAgo(timestamp: string): string {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function LiveActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRealData() {
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from("weather_searches")
                    .select("id, city, country, temperature, condition, searched_at")
                    .order("searched_at", { ascending: false })
                    .limit(10);

                if (data && data.length > 0) {
                    setActivities(data);
                }
            } catch {
                // Failed to fetch
            } finally {
                setLoading(false);
            }
        }

        fetchRealData();

        // Set up real-time subscription if Supabase is available
        if (supabase) {
            const channel = supabase
                .channel("weather_searches_realtime")
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "weather_searches" },
                    (payload) => {
                        const newItem = payload.new as ActivityItem;
                        setActivities((prev) => [newItem, ...prev.slice(0, 9)]);
                    }
                )
                .subscribe();

            return () => {
                supabase?.removeChannel(channel);
            };
        }
    }, []);

    // Don't render if no supabase or no activities
    if (!supabase || (!loading && activities.length === 0)) {
        return null;
    }

    return (
        <div className="glass-panel border-slate-200/80 p-5 md:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <Globe className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Recent Searches</h3>
                    <p className="text-xs text-slate-500">See what others are searching</p>
                </div>
            </div>

            {/* Activity feed */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                            </div>
                            <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-500 ${
                                index === 0
                                    ? "bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
                                    : "bg-slate-50 hover:bg-slate-100"
                            }`}
                            style={{
                                animation: index === 0 ? "slideIn 0.5s ease-out" : undefined,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {index === 0 && (
                                    <Zap className="w-4 h-4 text-violet-500 animate-pulse" />
                                )}
                                <div>
                                    <span className="font-medium text-slate-900">
                                        {activity.city}
                                    </span>
                                    <span className="text-slate-400 ml-1 text-sm">
                                        {activity.country}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="font-semibold text-slate-700">
                                    {activity.temperature}°C
                                </span>
                                <span className="text-slate-400 text-xs">
                                    {getTimeAgo(activity.searched_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
