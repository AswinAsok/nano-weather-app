import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, Sparkles, X } from "lucide-react";
import type { WeatherSearchHistory } from "../services/supabaseService";
import { useServices } from "../services/serviceContext";

function formatTimestamp(timestamp?: string) {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function RecentGallery({
    limit = 15,
    currentEntry,
    loadRemote = true,
}: {
    limit?: number;
    currentEntry?: WeatherSearchHistory | null;
    loadRemote?: boolean;
}) {
    const { supabaseService } = useServices();
    const [items, setItems] = useState<WeatherSearchHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const viewerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadRemote) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        supabaseService
            .getRecentSearches(limit)
            .then((data) => {
                if (cancelled) return;
                setItems(data);
            })
            .catch((err) => {
                if (cancelled) return;
                const message =
                    err instanceof Error ? err.message : "Unable to load recent images right now.";
                setError(message);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [limit, loadRemote, supabaseService]);

    const mergedItems = useMemo(() => {
        return currentEntry
            ? [
                  {
                      ...currentEntry,
                      id: currentEntry.id ?? "local-latest",
                  },
                  ...items.filter((item) => item.id !== currentEntry.id),
              ]
            : items;
    }, [currentEntry, items]);

    const hasContent = mergedItems.length > 0;
    const activeItem = activeIndex !== null ? mergedItems[activeIndex] : null;

    useEffect(() => {
        if (activeIndex === null) return;
        if (!mergedItems.length) {
            setActiveIndex(null);
            return;
        }
        if (activeIndex > mergedItems.length - 1) {
            setActiveIndex(mergedItems.length - 1);
        }
    }, [activeIndex, mergedItems]);

    useEffect(() => {
        if (activeIndex === null) return;

        const handler = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeViewer();
            } else if (event.key === "ArrowRight") {
                goToNext();
            } else if (event.key === "ArrowLeft") {
                goToPrevious();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [activeIndex, mergedItems.length]);

    useEffect(() => {
        if (activeItem && viewerRef.current && !document.fullscreenElement) {
            viewerRef.current.requestFullscreen?.().catch(() => undefined);
        }
        if (!activeItem && document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        }
    }, [activeItem]);

    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => undefined);
            }
        };
    }, []);

    const closeViewer = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        }
        setActiveIndex(null);
    };

    const openViewer = (index: number) => {
        if (!mergedItems[index]) return;
        setActiveIndex(index);
    };

    const goToNext = () => {
        setActiveIndex((prev) => {
            if (prev === null) return prev;
            return (prev + 1) % mergedItems.length;
        });
    };

    const goToPrevious = () => {
        setActiveIndex((prev) => {
            if (prev === null) return prev;
            return (prev - 1 + mergedItems.length) % mergedItems.length;
        });
    };

    const viewerOverlay =
        activeItem && typeof document !== "undefined"
            ? createPortal(
                  <div
                      ref={viewerRef}
                      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 relative"
                      onClick={(e) => {
                          if (e.target === e.currentTarget) {
                              closeViewer();
                          }
                      }}
                  >
                      <button
                          type="button"
                          className="absolute top-6 right-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white border border-white/10 backdrop-blur hover:bg-white/25 transition z-[10000]"
                          onClick={(e) => {
                              e.stopPropagation();
                              closeViewer();
                          }}
                          aria-label="Close viewer"
                      >
                          <X className="w-5 h-5" />
                      </button>

                      {mergedItems.length > 1 && (
                          <>
                              <button
                                  type="button"
                                  className="absolute left-6 top-1/2 -translate-y-1/2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white border border-white/10 backdrop-blur hover:bg-white/25 transition z-[10000]"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      goToPrevious();
                                  }}
                                  aria-label="Previous image"
                              >
                                  <ChevronLeft className="w-7 h-7" />
                              </button>
                              <button
                                  type="button"
                                  className="absolute right-6 top-1/2 -translate-y-1/2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white border border-white/10 backdrop-blur hover:bg-white/25 transition z-[10000]"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      goToNext();
                                  }}
                                  aria-label="Next image"
                              >
                                  <ChevronRight className="w-7 h-7" />
                              </button>
                          </>
                      )}

                      <div
                          className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-black/95 backdrop-blur-xl"
                          aria-hidden="true"
                      />

                      <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl border border-white/60 bg-white shadow-2xl overflow-hidden flex flex-col">
                          <div className="relative bg-white flex-1">
                              {activeItem.image_data ? (
                                  <img
                                      src={activeItem.image_data}
                                      alt={`Recent render of ${activeItem.city}`}
                                      className="w-full h-full object-contain"
                                  />
                              ) : (
                                  <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                                      No image stored for this entry
                                  </div>
                              )}

                        </div>

                        <div className="p-5 md:p-6 bg-white text-slate-900">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div>
                                      <p className="text-sm text-slate-500">City</p>
                                      <p className="text-xl font-semibold">
                                          {activeItem.city}, {activeItem.country}
                                      </p>
                                  </div>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800">
                                      {activeItem.condition}
                                  </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-700 mt-3">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">
                                      {activeItem.search_location || `${activeItem.city}, ${activeItem.country}`}
                                  </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                  Generated {formatTimestamp(activeItem.searched_at)}
                              </p>
                        </div>
                      </div>
                  </div>,
                  document.body
              )
            : null;

    return (
        <>
            <div className="glass-panel border-slate-200/80 p-5 md:p-8 space-y-4 md:space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="pill text-xs">
                        <Sparkles className="w-4 h-4" />
                        Live gallery
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-slate-600">Recently generated skylines</p>
                        <h3 className="text-2xl font-semibold text-slate-900">
                            Last {limit} creations
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-4 h-4" />
                    Updates as soon as new renders land.
                </div>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden"
                        >
                            <div className="h-72 bg-slate-100 animate-pulse" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                                <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                </p>
            )}

            {!loading && !hasContent && !error && (
                <div className="text-sm text-slate-600 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
                    No generated images yet. Your next search will light up this gallery.
                </div>
            )}

            {!loading && hasContent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {mergedItems.map((item, index) => {
                        const fallbackLocation = item.search_location || `${item.city}, ${item.country}`;
                        return (
                            <div
                                key={item.id || `${item.city}-${item.searched_at}`}
                                className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm overflow-hidden flex flex-col cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
                                onClick={() => openViewer(index)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        openViewer(index);
                                    }
                                }}
                            >
                                <div className="relative h-72 bg-slate-100">
                                    {item.image_data ? (
                                        <img
                                            src={item.image_data}
                                            alt={`Recent render of ${item.city}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center text-slate-400 text-xs">
                                            No image stored
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-2 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm text-slate-500">City</p>
                                            <p className="text-base font-semibold text-slate-900">
                                                {item.city}, {item.country}
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700">
                                            {item.condition}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{fallbackLocation}</span>
                                    </div>
                                </div>
                                <div className="px-4 pb-3 text-[11px] text-slate-500">
                                    Generated {formatTimestamp(item.searched_at)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewerOverlay}
        </div>
        </>
    );
}
