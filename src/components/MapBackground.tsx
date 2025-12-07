import { useEffect, useRef, useState } from "react";

const TILE_SIZE = 256;
const ZOOM = 3;
const TILES_X = 8;
const TILES_Y = 6;

// Different cloud shape variants
const cloudVariants = [
    // Fluffy cumulus
    [
        { cx: 25, cy: 35, rx: 20, ry: 12 },
        { cx: 45, cy: 30, rx: 22, ry: 15 },
        { cx: 70, cy: 32, rx: 18, ry: 13 },
        { cx: 55, cy: 22, rx: 15, ry: 12 },
        { cx: 35, cy: 25, rx: 12, ry: 10 },
    ],
    // Wide stratus
    [
        { cx: 20, cy: 32, rx: 18, ry: 10 },
        { cx: 50, cy: 30, rx: 28, ry: 12 },
        { cx: 80, cy: 32, rx: 16, ry: 10 },
        { cx: 35, cy: 26, rx: 14, ry: 8 },
        { cx: 65, cy: 26, rx: 14, ry: 8 },
    ],
    // Puffy small
    [
        { cx: 30, cy: 32, rx: 22, ry: 14 },
        { cx: 55, cy: 28, rx: 20, ry: 16 },
        { cx: 45, cy: 38, rx: 18, ry: 10 },
        { cx: 70, cy: 34, rx: 14, ry: 10 },
    ],
    // Elongated wispy
    [
        { cx: 15, cy: 30, rx: 14, ry: 8 },
        { cx: 35, cy: 28, rx: 18, ry: 10 },
        { cx: 58, cy: 30, rx: 20, ry: 11 },
        { cx: 82, cy: 32, rx: 16, ry: 9 },
        { cx: 48, cy: 36, rx: 12, ry: 7 },
    ],
    // Chunky storm-like
    [
        { cx: 30, cy: 38, rx: 24, ry: 12 },
        { cx: 55, cy: 32, rx: 26, ry: 18 },
        { cx: 75, cy: 36, rx: 20, ry: 14 },
        { cx: 45, cy: 24, rx: 18, ry: 14 },
        { cx: 65, cy: 22, rx: 14, ry: 12 },
        { cx: 35, cy: 28, rx: 12, ry: 10 },
    ],
    // Scattered puffs
    [
        { cx: 22, cy: 30, rx: 16, ry: 12 },
        { cx: 45, cy: 34, rx: 14, ry: 10 },
        { cx: 68, cy: 28, rx: 18, ry: 14 },
        { cx: 85, cy: 34, rx: 12, ry: 9 },
    ],
];

// Cloud component that floats across the screen
function Cloud({
    style,
    size,
    variant,
    opacity,
    hasLightning,
}: {
    style: React.CSSProperties;
    size: "sm" | "md" | "lg" | "xl";
    variant: number;
    opacity: number;
    hasLightning?: boolean;
}) {
    const sizeClasses = {
        sm: "w-32 h-16",
        md: "w-48 h-24",
        lg: "w-72 h-36",
        xl: "w-96 h-48",
    };

    const ellipses = cloudVariants[variant % cloudVariants.length];
    const filterId = `cloud-blur-${variant}-${Math.random()}`;

    return (
        <div
            className={`absolute ${sizeClasses[size]}`}
            style={{
                ...style,
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
            }}
        >
            <svg viewBox="0 0 100 50" className="w-full h-full" style={{ opacity }}>
                <defs>
                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    </filter>
                </defs>
                <g filter={`url(#${filterId})`} fill="white">
                    {ellipses.map((e, i) => (
                        <ellipse key={i} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />
                    ))}
                </g>
            </svg>
            {/* Lightning inside cloud */}
            {hasLightning && (
                <>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 150, 1) 0%, rgba(255, 255, 200, 0.9) 20%, rgba(255, 255, 255, 0.7) 40%, transparent 70%)",
                            animation: "lightning-flash 0.2s ease-out",
                            filter: "blur(4px)",
                        }}
                    />
                    {/* Lightning bolt */}
                    <svg
                        className="absolute"
                        style={{
                            top: "40%",
                            left: "35%",
                            width: "30%",
                            height: "80%",
                            animation: "lightning-flash 0.2s ease-out",
                        }}
                        viewBox="0 0 24 40"
                        fill="none"
                    >
                        <path
                            d="M13 2L4 17h7l-2 14 11-19h-8l4-10h-3z"
                            fill="rgba(255, 255, 200, 0.95)"
                            stroke="rgba(255, 255, 100, 1)"
                            strokeWidth="0.5"
                        />
                    </svg>
                </>
            )}
        </div>
    );
}

export function MapBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [lightningCloudId, setLightningCloudId] = useState<number | null>(null);

    // Map tiles loading
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = TILES_X * TILE_SIZE;
        canvas.height = TILES_Y * TILE_SIZE;

        const loadTile = (x: number, y: number): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = `https://a.basemaps.cartocdn.com/light_nolabels/${ZOOM}/${x}/${y}.png`;
                img.onload = () => {
                    const offsetX = (x % TILES_X) * TILE_SIZE;
                    const offsetY = (y % TILES_Y) * TILE_SIZE;
                    ctx.drawImage(img, offsetX, offsetY);
                    resolve();
                };
                img.onerror = () => resolve();
            });
        };

        const promises: Promise<void>[] = [];
        for (let y = 1; y < TILES_Y + 1; y++) {
            for (let x = 0; x < TILES_X; x++) {
                promises.push(loadTile(x, y));
            }
        }

        Promise.all(promises);
    }, []);

    // Random lightning effect in clouds
    useEffect(() => {
        // Cloud IDs that can have lightning (larger clouds look better)
        const lightningEligibleClouds = [1, 4, 5, 8, 11, 12];

        const triggerLightning = () => {
            // Pick a random cloud for lightning
            const randomCloud = lightningEligibleClouds[Math.floor(Math.random() * lightningEligibleClouds.length)];
            setLightningCloudId(randomCloud);
            setTimeout(() => setLightningCloudId(null), 150);
        };

        const scheduleNextLightning = () => {
            // Random interval between 3-8 seconds
            const delay = 3000 + Math.random() * 5000;
            return setTimeout(() => {
                triggerLightning();
                // Often double or triple flash for more visibility
                if (Math.random() > 0.3) {
                    setTimeout(triggerLightning, 100);
                    if (Math.random() > 0.5) {
                        setTimeout(triggerLightning, 250);
                    }
                }
                timerId = scheduleNextLightning();
            }, delay);
        };

        let timerId = scheduleNextLightning();
        return () => clearTimeout(timerId);
    }, []);

    // Cloud configurations with randomized properties
    const clouds = [
        { id: 1, size: "xl" as const, top: "5%", duration: 95, delay: 0, variant: 0, opacity: 0.85 },
        { id: 2, size: "md" as const, top: "12%", duration: 62, delay: -18, variant: 1, opacity: 0.9 },
        { id: 3, size: "sm" as const, top: "22%", duration: 48, delay: -42, variant: 2, opacity: 0.75 },
        { id: 4, size: "lg" as const, top: "38%", duration: 88, delay: -52, variant: 3, opacity: 0.85 },
        { id: 5, size: "xl" as const, top: "48%", duration: 105, delay: -8, variant: 4, opacity: 0.8 },
        { id: 6, size: "sm" as const, top: "58%", duration: 52, delay: -65, variant: 5, opacity: 0.9 },
        { id: 7, size: "md" as const, top: "68%", duration: 72, delay: -28, variant: 0, opacity: 0.8 },
        { id: 8, size: "lg" as const, top: "78%", duration: 82, delay: -38, variant: 2, opacity: 0.85 },
        { id: 9, size: "sm" as const, top: "88%", duration: 45, delay: -75, variant: 4, opacity: 0.8 },
        { id: 10, size: "md" as const, top: "32%", duration: 68, delay: -85, variant: 1, opacity: 0.75 },
        { id: 11, size: "xl" as const, top: "92%", duration: 110, delay: -15, variant: 3, opacity: 0.7 },
        { id: 12, size: "lg" as const, top: "18%", duration: 78, delay: -58, variant: 5, opacity: 0.85 },
    ];

    return (
        <>
            {/* CSS for animations */}
            <style>{`
                @keyframes float-cloud {
                    from {
                        transform: translateX(-150px);
                    }
                    to {
                        transform: translateX(calc(100vw + 150px));
                    }
                }
                @keyframes lightning-flash {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    20% { opacity: 0.3; }
                    30% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
            `}</style>

            {/* Everything in one background layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Map canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.4]"
                    style={{
                        filter: "grayscale(50%) contrast(1) brightness(1.05)",
                        transform: "scale(1.5)",
                        transformOrigin: "center center",
                    }}
                />

                {/* Animated clouds - underneath content */}
                {clouds.map((cloud) => (
                    <Cloud
                        key={cloud.id}
                        size={cloud.size}
                        variant={cloud.variant}
                        opacity={cloud.opacity}
                        hasLightning={lightningCloudId === cloud.id}
                        style={{
                            top: cloud.top,
                            animation: `float-cloud ${cloud.duration}s linear infinite`,
                            animationDelay: `${cloud.delay}s`,
                        }}
                    />
                ))}

                {/* Gradient overlay to fade edges */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, transparent 30%, rgba(248, 250, 252, 0.2) 70%, rgba(248, 250, 252, 0.7) 100%)",
                    }}
                />
            </div>
        </>
    );
}
