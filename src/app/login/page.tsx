"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleLogin = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center container mx-auto px-6 py-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-black/40 border border-white/10 rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <Github className="w-12 h-12 mx-auto mb-6 text-white" />
          <h1 className="text-2xl font-semibold mb-2 text-white">Sign in to RepoForge AI</h1>
          <p className="text-gray-400 mb-8">Authenticate with GitHub OAuth to enable direct document pushing.</p>
          <Button onClick={handleLogin} className="w-full h-12 text-lg bg-white text-black hover:bg-gray-200">
            Sign in with GitHub
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
