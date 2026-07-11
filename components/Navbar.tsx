import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/50 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          LocalLens
        </Link>
        <span className="text-sm text-slate-500">Travel like a local.</span>
      </nav>
    </header>
  );
}
