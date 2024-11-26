"use client";

import Recorder from "./components/Recorder";
import { useState } from "react";
import NotePad from "./components/NotePad";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notes, setNotes] = useState("");

  const submitRecording = async (data: Blob) => {
    setIsGenerating(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64data = reader.result?.toString().split(",")[1];
      if (!base64data) return;

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64data }),
        });

        if (response.ok) {
          const { notes } = await response.json();
          setNotes(notes);
        } else {
          console.error("Failed to upload file.");
        }

        setIsGenerating(false);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    reader.readAsDataURL(data);
  };

  const clearSession = () => {
    setNotes("");
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="h-screen w-screen">
        <div className="flex flex-col w-full h-full">
          <div className="flex gap-y-4 flex-col md:flex-row shrink-0 items-center border-slate-200 border-b-2 justify-between p-4">
            <h1 className="font-extrabold text-2xl">
              The Best Note-Taking App
            </h1>
            <Recorder
              isLoading={isGenerating}
              submitRecording={submitRecording}
              newSessionCallback={clearSession}
            />
          </div>

          <div className="w-full h-full flex justify-center p-4">
            <NotePad isLoading={isGenerating} audioNotes={notes} />
          </div>
        </div>
      </main>
    </div>
  );
}
