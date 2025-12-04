/* eslint-env node */

import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

type Req = IncomingMessage & { body?: unknown; method?: string };
type Res = ServerResponse & {
    status?: (statusCode: number) => Res;
    json?: (payload: unknown) => void;
    send?: (payload: unknown) => void;
};

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const model =
    process.env.VITE_GEMINI_IMAGE_MODEL || process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function readJsonBody(req: Req): Promise<unknown> {
    if (req.body) return req.body;

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    if (!chunks.length) return undefined;

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return undefined;
    }
}

export default async function handler(req: Req, res: Res) {
    if (req.method !== "POST") {
        if (res.status) res.status(405);
        else res.statusCode = 405;
        res.end("Method not allowed");
        return;
    }

    if (!ai) {
        if (res.status) res.status(500);
        else res.statusCode = 500;
        res.end("Server misconfigured: missing Gemini API key");
        return;
    }

    const body = (await readJsonBody(req)) as { prompt?: string } | undefined;
    const prompt = typeof body?.prompt === "string" && body.prompt.trim() ? body.prompt.trim() : undefined;

    if (!prompt) {
        if (res.status) res.status(400);
        else res.statusCode = 400;
        res.end("Missing prompt");
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseModalities: ["image", "text"] },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        const imagePart = parts?.find(
            (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData?.data
        );

        if (!imagePart?.inlineData?.data) {
            if (res.status) res.status(502);
            else res.statusCode = 502;
            res.end(`No image returned from model "${model}". Check server logs.`);
            return;
        }

        const payload = {
            dataUrl: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${
                imagePart.inlineData.data
            }`,
        };

        res.setHeader("Content-Type", "application/json");
        if (res.status) res.status(200);
        else res.statusCode = 200;
        res.end(JSON.stringify(payload));
    } catch (err) {
        console.error("Image generation error:", err);
        const message =
            err instanceof Error
                ? err.message
                : "Image generation failed. Check API key and model availability.";
        if (res.status) res.status(500);
        else res.statusCode = 500;
        res.end(message);
    }
}
