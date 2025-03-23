import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [fileId, setFileId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [lang, setLang] = useState("es");
  const [loading, setLoading] = useState(false);

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
    if (!fileId || !lang) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file_id", fileId);
    formData.append("target_lang", lang);
    const res = await axios.post(`${API_BASE}/translate/`, formData);
    setTranslated(res.data.translated);
    setLoading(false);
  };

  const handlePay = async () => {
    const res = await axios.post(`${API_BASE}/create-checkout-session/`);
    window.location.href = res.data.url;
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <h1>AI Dubbing Tool (v1)</h1>
      <input type="file" accept="video/mp4" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginTop: "1rem" }}>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ja">Japanese</option>
      </select>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleUpload} disabled={loading}>Upload</button>
        <button onClick={handleTranslate} disabled={!fileId || loading} style={{ marginLeft: "1rem" }}>Translate</button>
        <button onClick={handlePay} style={{ marginLeft: "1rem" }}>Buy Dub Credit</button>
      </div>
      {loading && <p>Processing...</p>}
      {transcript && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Original Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}
      {translated && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Translated:</h3>
          <p>{translated}</p>
        </div>
      )}
    </main>
  );
}
