import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function mockLLM(audioData: Buffer): Promise<string> {
  const textLength = Math.ceil(audioData.length / 100);
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcde  fghijklmnopqrstuvwxyz,.?\n\n\n";
  let result = "";
  for (let i = 0; i < textLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(result);
    }, 3000);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio } = body;
    if (!audio) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Decode the Base64 audio string
    const buffer = Buffer.from(audio, "base64");
    const transcription = await mockLLM(buffer);

    console.log("Saving the transcription to the DB");

    return NextResponse.json({
      notes: transcription,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Failed to generate transcription" },
      { status: 500 }
    );
  }
}
