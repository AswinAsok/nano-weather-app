import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Connect, ViteDevServer, PreviewServer } from "vite";
import { GoogleGenAI } from "@google/genai";

type MiddlewareContainer =
    | Connect.Server
    | ViteDevServer["middlewares"]
    | PreviewServer["middlewares"];

function createImageProxy(env: Record<string, string>) {
    const apiKey = env.VITE_GEMINI_API_KEY || "";
    const model = env.VITE_GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

    const ai = new GoogleGenAI({ apiKey });

    const handler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.url !== "/api/generate-image") return next();
        if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method not allowed");
            return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", async () => {
            try {
                const body = JSON.parse(Buffer.concat(chunks).toString() || "{}") as {
                    prompt?: string;
                };
                if (!body.prompt) {
                    res.statusCode = 400;
                    res.end("Missing prompt");
                    return;
                }

                const response = await ai.models.generateContent({
                    model,
                    contents: body.prompt,
                    config: {
                        responseModalities: ["image", "text"],
                    },
                });

                console.log("API Response:", JSON.stringify(response, null, 2));

                // Find the image part in the response
                const parts = response.candidates?.[0]?.content?.parts;
                const imagePart = parts?.find(
                    (part: { inlineData?: { data?: string; mimeType?: string } }) =>
                        part.inlineData?.data
                );

                if (!imagePart?.inlineData?.data) {
                    console.error("No image in response. Parts:", JSON.stringify(parts, null, 2));
                    res.statusCode = 502;
                    res.end(`No image returned from model "${model}". Check server logs.`);
                    return;
                }

                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify({
                        dataUrl: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${
                            imagePart.inlineData.data
                        }`,
                    })
                );
            } catch (err) {
                console.error("Image proxy error:", err);
                res.statusCode = 500;
                res.end(
                    err instanceof Error
                        ? err.message
                        : "Image generation failed. Check API key and model availability."
                );
            }
        });
    };

    return (middlewares: MiddlewareContainer) => {
        middlewares.use(handler);
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const attachProxy = createImageProxy(env);

    return {
        plugins: [
            react(),
            {
                name: "genai-image-proxy",
                configureServer(server) {
                    attachProxy(server.middlewares);
                },
                configurePreviewServer(server) {
                    attachProxy(server.middlewares);
                },
            },
        ],
    };
});
