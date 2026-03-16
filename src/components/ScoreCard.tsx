import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function ScoreCard({ scores }: { scores: Record<string, number> | null }) {
  if (!scores) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl mb-8"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Repository Intelligence</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
              <span className={value > 80 ? "text-green-400" : value > 60 ? "text-yellow-400" : "text-red-400"}>
                {value}/100
              </span>
            </div>
            <Progress value={value} className="h-2 bg-white/10 [&>div]:bg-white" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
