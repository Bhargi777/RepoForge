import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { RepoInput } from "@/components/RepoInput";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-32">
        <Hero />
        <div className="mt-12 w-full max-w-3xl px-6">
          <RepoInput />
        </div>
      </div>
    </main>
  );
}
