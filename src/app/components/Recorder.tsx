"use client";

import clsx from "clsx";
import React, { useState, useRef } from "react";

type RecorderProps = {
  submitRecording: (data: Blob) => any;
  isLoading: boolean;
};

const Recorder = ({ submitRecording, isLoading }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioClips, setAudioClips] = useState<{ name: string; url: string }[]>(
    []
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        // chunksRef.current = [];
        // const audioURL = URL.createObjectURL(blob);

        submitRecording(blob);

        // setAudioClips((prev) => [...prev, { name: clipName, url: audioURL }]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setIsPaused(!isPaused);
    }
  };

  const displayBtnText = () => {
    if (!isRecording) {
      return "Start";
    } else {
      return isPaused ? "Resume" : "Pause";
    }
  };

  return (
    <div className="flex gap-x-4">
      <button
        className={clsx({
          "px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none":
            true,
          "bg-red-500": isRecording && !isPaused,
          "bg-green-500": !isRecording || isPaused,
        })}
        onClick={isRecording ? toggleRecording : startRecording}
        disabled={isLoading}
      >
        {displayBtnText()}
      </button>
      <button
        className={clsx({
          "px-6 py-3  hover:bg-blue-600 bg-blue-500 disabled:bg-gray-600 enabled:hover:-translate-y-1 enabled:hover:scale-105 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2":
            true,
        })}
        onClick={stopRecording}
        disabled={!isRecording || isLoading}
      >
        Finish
      </button>
    </div>
  );
};

export default Recorder;
