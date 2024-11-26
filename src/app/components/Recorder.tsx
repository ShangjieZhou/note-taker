"use client";

import clsx from "clsx";
import React, { useState, useRef, useEffect } from "react";
import SoundFreqDisplayer from "./SoundFreqDisplayer";

type RecorderProps = {
  submitRecording: (data: Blob) => void;
  newSessionCallback: () => void;
  isLoading: boolean;
};

const Recorder = ({
  submitRecording,
  isLoading,
  newSessionCallback,
}: RecorderProps) => {
  // for session state management
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // for audio collecting
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // for displaying sound freq
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const freqBufferRef = useRef<Uint8Array | null>(null);
  const [currFreq, setCurrFreq] = useState<number>(0);

  const render = () => {
    if (analyserRef.current && freqBufferRef.current) {
      analyserRef.current.getByteFrequencyData(freqBufferRef.current);
      const avgFreq =
        freqBufferRef.current.reduce((sum, value) => sum + value, 0) /
        freqBufferRef.current.length;
      animationRef.current = requestAnimationFrame(render);
      console.log(avgFreq);
      setCurrFreq(avgFreq);
    }
  };

  const visualiseSound = (stream: MediaStream) => {
    // create audio frequency analyser
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const source = audioCtxRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioCtxRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    const bufferLength = analyserRef.current.frequencyBinCount;
    freqBufferRef.current = new Uint8Array(bufferLength);

    source.connect(analyserRef.current);
    render();
  };

  const startRecording = async () => {
    try {
      // always start fresh with new audio buffer
      chunksRef.current = [];
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

        submitRecording(blob);
      };

      mediaRecorder.start();
      visualiseSound(stream);
      setIsRecording(true);
      setHasStarted(true);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const pauseOrResumeRecording = () => {
    // resume or pause animation frame callback
    if (animationRef.current) {
      if (isPaused) {
        render();
      } else {
        cancelAnimationFrame(animationRef.current!);
      }
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setIsPaused(!isPaused);
    }
  };

  const displayBtnText = () => {
    if (!isRecording) {
      return hasStarted ? "Continue Session" : "Start";
    } else {
      return isPaused ? "Resume" : "Pause";
    }
  };

  const startNewSession = () => {
    setHasStarted(false);
    setIsPaused(false);
    setIsRecording(false);
    newSessionCallback();
  };

  // clean up
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current!);
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-x-4">
      {!isLoading && (
        <>
          {isRecording && <SoundFreqDisplayer frequency={currFreq} />}
          <button
            className={clsx({
              "px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none":
                true,
              "bg-red-500": isRecording && !isPaused,
              "bg-green-500": !isRecording || isPaused,
            })}
            onClick={isRecording ? pauseOrResumeRecording : startRecording}
          >
            {displayBtnText()}
          </button>
          {hasStarted && (
            <button
              className={clsx({
                "px-6 py-3  hover:bg-blue-600 bg-blue-500 disabled:bg-gray-600 enabled:hover:-translate-y-1 enabled:hover:scale-105 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2":
                  true,
              })}
              onClick={isRecording ? stopRecording : startNewSession}
            >
              {isRecording ? "Finish" : "New Session"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Recorder;
