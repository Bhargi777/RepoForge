"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";

export function MarkdownRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
    
    if (containerRef.current) {
      mermaid.run({
        nodes: containerRef.current.querySelectorAll('.language-mermaid') as any
      }).catch((e) => console.log("Mermaid error logic:", e));
    }
  }, [content]);

  return (
    <div ref={containerRef} className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-white max-w-none">
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";
            
            if (isMermaid) {
              return (
                <pre className="language-mermaid bg-transparent mx-auto flex justify-center p-4">
                  {String(children).replace(/\n$/, "")}
                </pre>
              );
            }
            return !className ? (
              <code className="bg-white/10 px-1 py-0.5 rounded text-sm text-gray-200" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-[#111] p-4 rounded-xl border border-white/10 overflow-x-auto my-4 text-sm">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
