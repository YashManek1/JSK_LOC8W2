// import React, { useState } from "react";
// import { useApp } from "../context/AppContext";
// import QRCodeDisplay from "../components/ui/QRCodeDisplay";

// export default function QRPage() {
//   const { currentUser, generatedQR, scanQR, selectedHackathon } = useApp();
//   const [scanning, setScanning] = useState(false);

//   const handleScan = () => {
//     setScanning(true);
//     setTimeout(() => {
//       setScanning(false);
//       scanQR();
import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import QRCodeDisplay from "../components/ui/QRCodeDisplay";

export default function QRPage() {
  const { generatedQR, scanQR, selectedHackathon, currentUser, setCurrentUser } = useApp();

  const [selfiePreview, setSelfiePreview] = useState(currentUser?.selfie || null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Camera access denied. Please allow camera access.");
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setSelfiePreview(dataUrl);
    setCurrentUser && setCurrentUser({ ...currentUser, selfie: dataUrl });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const retake = () => {
    setSelfiePreview(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B4ED57]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#B4ED57] flex items-center justify-center">
            <span className="text-black font-black text-sm">H</span>
          </div>
          <span className="text-white font-black tracking-widest">HACKOS</span>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <div className="inline-flex items-center gap-2 bg-[#B4ED57]/10 border border-[#B4ED57]/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-[#B4ED57] rounded-full animate-pulse" />
            <span className="text-[#B4ED57] text-xs font-semibold">Registration Complete</span>
          </div>

          <h1 className="text-white text-2xl font-black mb-1">
            Hey, <span className="text-[#B4ED57]">{currentUser?.name?.split(" ")[0]}! 👋</span>
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Your entry QR has been generated for <span className="text-white">{selectedHackathon?.name || currentUser?.hackathonName}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-[#B4ED57]/20 border-4 border-[#B4ED57]">
                  <QRCodeDisplay data={generatedQR || "HACKOS-DEMO"} size={220} />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Code Prefix</span>
                  <span className="text-white font-mono">H</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">QR ID</span>
                  <span className="text-white font-mono text-right truncate ml-4">{(generatedQR || "HACKOS-DEMO").slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Status</span>
                  <span className="text-[#B4ED57] font-semibold">Entry Ready</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Type</span>
                  <span className="text-white/70">Dynamic · refreshes every 60s</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-2">Team Formation</h2>
              <p className="text-white/40 text-sm mb-4">Invite 3 more teammates to {selectedHackathon?.name} to generate your entry QR.</p>
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                  <span className="text-white text-sm">You (Leader)</span>
                  <span className="text-[#B4ED57] text-xs font-bold">READY</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center opacity-50">
                  <span className="text-white/60 text-sm">Waiting for mates...</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold text-sm mb-3">Identity — Selfie</h3>
                {!selfiePreview && !cameraActive && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full border-2 border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#B4ED57]/40 transition-colors"
                    >
                      <span className="text-3xl">📷</span>
                      <span className="text-white/60 text-sm">Capture selfie to verify identity</span>
                    </button>
                    <p className="text-xs text-white/30">Selfie is stored locally for demo purposes.</p>
                  </div>
                )}

                {cameraActive && (
                  <div className="relative rounded-xl overflow-hidden border border-[#B4ED57]/30">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-56 object-cover" />
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#B4ED57] text-black text-sm font-bold rounded-full hover:bg-[#c5f278] transition-colors"
                    >
                      📸 Capture
                    </button>
                  </div>
                )}

                {selfiePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-[#B4ED57]/40">
                    <img src={selfiePreview} alt="Selfie" className="w-full h-36 object-cover" />
                    <div className="absolute top-2 right-2 bg-[#B4ED57] text-black text-xs px-2 py-0.5 rounded-full font-semibold">✓ Captured</div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={retake} className="flex-1 px-4 py-2 bg-white/5 rounded-xl text-sm">Retake</button>
                      <button onClick={() => scanQR()} className="flex-1 px-4 py-2 bg-[#B4ED57] text-black font-bold rounded-xl">Proceed →</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}