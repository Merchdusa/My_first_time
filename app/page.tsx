import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🧖</div>
          <h1 className="text-3xl font-bold text-cyan-800">Sauna App</h1>
          <p className="text-cyan-600 mt-2">Vyberte svou skupinu</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Link
            href="/zeny"
            className="w-full py-6 px-8 bg-cyan-600 hover:bg-cyan-700 text-white text-xl font-semibold rounded-2xl text-center shadow-md"
          >
            Ženy — čtvrtek
          </Link>
          <Link
            href="/muzi"
            className="w-full py-6 px-8 bg-sky-700 hover:bg-sky-800 text-white text-xl font-semibold rounded-2xl text-center shadow-md"
          >
            Muži — pátek
          </Link>
        </div>
      </div>
    </main>
  )
}
