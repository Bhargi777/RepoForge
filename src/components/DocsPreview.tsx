import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Github } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { toast } from "sonner";

export function DocsPreview({ docs, owner, repo }: { docs: Record<string, string>, owner: string, repo: string }) {
  const filteredDocs = Object.entries(docs).filter(([_, content]) => Boolean(content));
  const [activeTab, setActiveTab] = useState(filteredDocs[0]?.[0] || "README.md");

  const handleCopy = () => {
    navigator.clipboard.writeText(docs[activeTab] || "");
    toast.success(`${activeTab} copied to clipboard!`);
  };

  const handlePush = async () => {
    const toastId = toast.loading("Pushing to GitHub...");
    try {
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs, owner, repo })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Successfully pushed to GitHub PR!", { id: toastId });
      } else {
        toast.error("Push failed: " + data.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Network error during push", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Preview */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 pt-4 pb-2 bg-white/5 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-2">
              {filteredDocs.map(([filename]) => (
                <TabsTrigger
                  key={filename}
                  value={filename}
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 rounded-md px-4 py-2"
                >
                  {filename}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="p-8 overflow-y-auto max-h-[70vh]">
            {filteredDocs.map(([filename, content]) => (
              <TabsContent key={filename} value={filename} className="m-0 focus-visible:outline-none">
                <MarkdownRenderer content={content} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Right: Actions */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <Button onClick={handleCopy} variant="secondary" className="w-full justify-start border border-white/10 text-white hover:text-white/80">
            <Copy className="mr-2 h-4 w-4" /> Copy {activeTab}
          </Button>
          <Button onClick={handlePush} className="w-full justify-start bg-white text-black hover:bg-gray-200">
            <Github className="mr-2 h-4 w-4" /> Push to GitHub (PR)
          </Button>
        </div>
      </div>
    </div>
  );
}
