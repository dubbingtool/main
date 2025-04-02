import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const savedCredits = localStorage.getItem("credits");
    if (savedCredits) setCredits(Number(savedCredits));
  }, []);

  useEffect(() => {
    localStorage.setItem("credits", credits.toString());
  }, [credits]);

  const handleUpload = async () => {
    if (!video) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", video);
    const res = await axios.post(`${API_BASE}/upload/`, formData);
    setFileId(res.data.file_id);
    setTranscript(res.data.transcript);
    setLoading(false);
  };

  const handleTranslate = async () => {
    if (!fileId || credits < 1) return alert("You need at least 1 credit to translate.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file_id", fileId);
    formData.append("target_lang", lang);
    const res = await axios.post(`${API_BASE}/translate/`, formData);
    setTranslated(res.data.translated);
    setCredits((prev) => prev - 1);
    setLoading(false);
  };

  const handlePay = async () => {
    const res = await axios.post(`${API_BASE}/create-checkout-session/`);
    window.location.href = res.data.url;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center text-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">AI Dubbing Tool 🎙️</h1>

        <p className="mb-2 text-sm text-gray-500">
          Credits: <span className="font-semibold">{credits}</span>
        </p>

        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          className="block w-full mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="mb-4 border border-gray-300 rounded-lg px-4 py-2 w-full"
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={handleUpload}
            disabled={loading || !video}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:bg-blue-300"
          >
            Upload
          </button>
          <button
            onClick={handleTranslate}
            disabled={!fileId || loading || credits < 1}
            className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:bg-green-300"
          >
            Translate
          </button>
          <button
            onClick={handlePay}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl"
          >
            Buy Credit
          </button>
        </div>

        {loading && <p className="text-sm text-gray-400">Processing...</p>}

        {transcript && (
          <div className="text-left mt-6">
            <h3 className="text-xl font-semibold mb-1">📄 Transcript:</h3>
            <p className="bg-gray-50 p-3 rounded-lg border text-sm whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        {translated && (
          <div className="text-left mt-6">
            <h3 className="text-xl font-semibold mb-1">🌍 Translated:</h3>
            <p className="bg-green-50 p-3 rounded-lg border text-sm whitespace-pre-wrap">{translated}</p>
          </div>
        )}
      </div>
    </main>
  );
}
