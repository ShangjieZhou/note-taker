"use client";

import React, { useState, useRef, useEffect } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

type Props = {
  audioNotes: string;
  isLoading: boolean;
};

const NotePad = ({ audioNotes, isLoading }: Props) => {
  const [notes, setNotes] = useState(audioNotes);

  const updateNotes = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
  };

  useEffect(() => {
    if (audioNotes !== "") {
      setNotes(`${notes}\n${audioNotes}`);
    }
  }, [audioNotes]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl gap-y-4">
      {isLoading ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-y-2">
          <ClimbingBoxLoader color="pink" size={20} />
          <h2 className="text-pink-600 text-2xl font-bold">
            Adding smart-generated transcription to your notes...
          </h2>
        </div>
      ) : (
        <>
          <div className="flex h-full gap-x-4 border-blue-300 border-4 w-full rounded-lg p-4">
            <textarea
              onChange={updateNotes}
              value={notes}
              className="h-full focus:outline-none w-full"
              placeholder="Type your notes here..."
            ></textarea>
          </div>
          <div className="flex gap-x-4 justify-end">
            <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Save Notes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotePad;
