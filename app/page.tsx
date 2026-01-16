import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 p-20">
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h1 className="text-4xl font-bold text-gray-800">ESTAMOS A</h1>
        <h1 className="text-6xl font-bold text-red-600">0 Dias 0h 0min 0s</h1>
        <h1 className="text-4xl font-bold text-gray-800">sem falar de IA</h1>

        <a
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row flex-wrap p-2 pt-6 gap-2 border border-gray-500 rounded-xl w-2xl mt-24 shadow:sm hover:scale-105 hover:shadow-lg transition-all duration-200 bg-white relative"
        >
          <p className=" text-gray-600 absolute -top-3 px-3 bg-gray-50 border border-red-600 rounded-full">
            Último vídeo:
          </p>

          <Image
            src="https://i3.ytimg.com/vi/vMgwDI-W1U0/hqdefault.jpg"
            alt="Último Vídeo"
            width={320}
            height={120}
            className="object-cover rounded-2xl w-4/12"
          ></Image>
          <div className="w-7/12">
            <h2 className="text-lg font-semibold text-gray-700">
              Rick Astley - Never Gonna Give You Up (Video)
            </h2>
            <p className="text-gray-500">Publicado em 24 de out. de 2009</p>
            <p className="mt-2 text-gray-700 text-justify">
              The official video for “Never Gonna Give You Up” by Rick Astley
              Listen to Rick Astley: https://RickAstley.lnk.to/_listenYD
              Subscribe to the official Rick Astley YouTube channel:...
            </p>
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
  );
}
