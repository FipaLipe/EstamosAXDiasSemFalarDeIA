"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [displayData, setDisplayData] = useState<{
    diffDays: number;
    diffHours: number;
    diffMinutes: number;
    diffSeconds: number;
    latestVideo: {
      id: string;
      title: string;
      publishedAt: string;
      link: string | null;
      thumbnailUrl: string;
      isVideoAboutAI: boolean;
    };
  } | null>(null);

  const [streakStart, setStreakStart] = useState<Date | null>(null);
  const [latestVideo, setLatestVideo] = useState<{
    id: string;
    title: string;
    publishedAt: string;
    link: string | null;
    thumbnailUrl: string;
    isVideoAboutAI: boolean;
  } | null>(null);

  // 1. Busca os dados iniciais da API (só uma vez)
  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch state");
        const response = await res.json();
        const state = response.state;

        const start = new Date(state.currentStreakStart);
        const video = state.history[state.history.length - 1];

        setStreakStart(start);
        setLatestVideo(video);
      } catch (error) {
        console.error("Error fetching state:", error);
      }
    }

    fetchState();
  }, []);

  // 2. Atualiza o contador a cada segundo com base em `streakStart`
  useEffect(() => {
    if (!streakStart || !latestVideo) return;

    const updateCounter = () => {
      const now = new Date();
      const diffMs = now.getTime() - streakStart.getTime();

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setDisplayData({
        diffDays,
        diffHours,
        diffMinutes,
        diffSeconds,
        latestVideo,
      });
    };

    // Atualiza imediatamente na primeira vez
    updateCounter();

    // E depois a cada segundo
    const intervalId = setInterval(updateCounter, 1000);

    return () => clearInterval(intervalId);
  }, [streakStart, latestVideo]);

  return displayData ? (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 p-20">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="text-4xl font-bold text-gray-800">ESTAMOS A</h1>
        <h1 className="text-6xl font-bold text-red-600">
          {displayData.diffDays} Dias {displayData.diffHours}h{" "}
          {displayData.diffMinutes}min {displayData.diffSeconds}s
        </h1>
        <h1 className="text-4xl font-bold text-gray-800">sem falar de IA</h1>

        <a
          href={`https://www.youtube.com/watch?v=${displayData.latestVideo.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row flex-wrap p-2 pt-6 gap-2 border border-gray-500 rounded-xl w-2xl mt-24 shadow:sm hover:scale-105 hover:shadow-lg transition-all duration-200 bg-white relative"
        >
          <p className="text-gray-600 absolute -top-3 px-3 bg-gray-50 border border-red-600 rounded-full">
            Último vídeo processado:
          </p>

          <Image
            src={displayData.latestVideo.thumbnailUrl.trim()}
            alt="Último Vídeo"
            width={320}
            height={120}
            className="object-cover rounded-2xl w-4/12"
          />
          <div className="w-7/12 h-full flex flex-col py-4">
            <h2 className="text-lg font-semibold text-gray-700">
              {displayData.latestVideo.title}
            </h2>
            <p className="text-gray-500">
              Publicado em{" "}
              {new Date(displayData.latestVideo.publishedAt).toLocaleDateString(
                "pt-BR",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
            {displayData.latestVideo.isVideoAboutAI ? (
              <p className="mt-auto text-green-600 font-semibold">
                Este vídeo foi classificado como relacionado à Inteligência
                Artificial.
              </p>
            ) : (
              <p className="mt-auto text-red-600 font-semibold">
                Este vídeo NÃO foi classificado como relacionado à Inteligência
                Artificial.
              </p>
            )}
          </div>
        </a>
      </div>

      <p className="text-gray-800 mt-auto">
        Criado com ❤️ por{" "}
        <a
          href="https://github.com/fipalipe"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-600 hover:underline"
        >
          Filipi Martins
        </a>
      </p>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 p-20">
      <h1 className="text-4xl font-bold text-gray-800">Carregando...</h1>
    </div>
  );
}
