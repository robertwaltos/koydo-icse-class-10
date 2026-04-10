import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ICSE Class 10 Prep — Koydo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "linear-gradient(135deg, #D97706, #B45309)", color: "white", fontFamily: "system-ui" }}>
        <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 16 }}>Koydo</div>
        <div style={{ fontSize: 36, fontWeight: 600, opacity: 0.9 }}>ICSE Class 10 Exam Prep</div>
        <div style={{ fontSize: 20, marginTop: 24, opacity: 0.7 }}>Practice · AI Tutor · Score Prediction</div>
      </div>
    ),
    { ...size },
  );
}
