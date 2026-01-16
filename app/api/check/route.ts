import clientPromise from "@/lib/mongodb";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { XMLParser } from "fast-xml-parser";

export async function POST(request: Request) {
  const secret = request.headers.get("X-CRON-SECRET");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const state = await db.collection("state").findOne({});

  if (!state) {
    return Response.json(
      { ok: false, error: "State not found" },
      { status: 404 }
    );
  }

  const ytRSSFeed = await fetch(
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCyHOBY6IDZF9zOKJPou2Rgg"
  );

  if (!ytRSSFeed.ok) {
    return Response.json(
      { ok: false, error: "Failed to fetch YouTube RSS feed" },
      { status: ytRSSFeed.status }
    );
  }

  const XMLdata = await ytRSSFeed.text();
  const parser = new XMLParser();
  const ytData = parser.parse(XMLdata);
  const ytFeed = ytData.feed;

  const latestVideo = {
    id: ytFeed.entry[0]["yt:videoId"],
    title: ytFeed.entry[0]["title"],
    publishedAt: ytFeed.entry[0]["published"],
    link: ytFeed.entry[0]["link"]["@_href"],
    thumbnailUrl: `https://img.youtube.com/vi/${ytFeed.entry[0]["yt:videoId"]}/hqdefault.jpg`,
    isVideoAboutAI: null,
  };

  if (latestVideo.id === state.lastProcessedVideoId) {
    await db.collection("state").updateOne(
      {},
      {
        $set: {
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return Response.json({ ok: true, message: "No new video" });
  }

  const thumbnailResponse = await fetch(latestVideo.thumbnailUrl);
  const arrayBuffer = await thumbnailResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.HIGH,
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["IsVideoAboutAI"],
      properties: {
        IsVideoAboutAI: {
          type: Type.BOOLEAN,
        },
      },
    },
  };
  const model = "gemini-3-flash-preview";
  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: `Você está analisando um vídeo do YouTube.

            Entradas disponíveis:

            Título do vídeo: ${latestVideo.title}

            Thumbnail (imagem)

            Determine se o tema principal do vídeo envolve Inteligência Artificial (IA).
            Considere IA como: inteligência artificial, machine learning, deep learning, LLMs, ChatGPT, GPT, OpenAI, modelos generativos ou automação baseada em IA.

            Use apenas o título e o conteúdo visual da thumbnail (textos, ícones e contexto).`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const result = response.text;
  const parsedResult = JSON.parse(result || "");

  if (!parsedResult || typeof parsedResult.IsVideoAboutAI !== "boolean") {
    return Response.json(
      { ok: false, error: "Invalid AI response format" },
      { status: 500 }
    );
  }

  latestVideo.isVideoAboutAI = parsedResult.IsVideoAboutAI;

  if (latestVideo.isVideoAboutAI) {
    const streak =
      new Date(latestVideo.publishedAt).getTime() -
      new Date(state.currentStreakStart).getTime();

    if (streak > state.record.durationMs) {
      await db.collection("state").updateOne(
        {},
        {
          $set: {
            record: {
              durationMs: streak,
              from: state.currentStreakStart,
              to: latestVideo.publishedAt,
            },
          },
        }
      );
    }

    await db.collection("state").updateOne(
      {},
      {
        $set: {
          currentStreakStart: latestVideo.publishedAt,
        },
      }
    );
  }

  await db.collection("state").updateOne(
    {},
    {
      $set: {
        lastProcessedVideoId: latestVideo.id,
        history: [...state.history, latestVideo],
        updatedAt: new Date().toISOString(),
      },
    }
  );

  return Response.json({ ok: true, latestVideo });
}
