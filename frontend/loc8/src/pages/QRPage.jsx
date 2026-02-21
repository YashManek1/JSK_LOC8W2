import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import QRCodeDisplay from "../components/ui/QRCodeDisplay";

export default function QRPage() {
  const { currentUser, generatedQR, scanQR, selectedHackathon } = useApp();
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      scanQR();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
            <span className="text-black font-black text-sm">H</span>
          </div>
          <span className="text-white font-black tracking-widest">HACKOS</span>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          {/* Status */}
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-lime-400 text-xs font-semibold">Registration Complete</span>
          </div>

          <h1 className="text-white text-2xl font-black mb-1">
            Hey, <span className="text-lime-400">{currentUser?.name?.split(" ")[0]}! 👋</span>
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Your entry QR has been generated for{" "}
            <span className="text-white">{selectedHackathon?.name || currentUser?.hackathonName}</span>
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-lime-400/20 border-4 border-lime-400">
              <QRCodeDisplay data={generatedQR || "HACKOS-DEMO"} size={180} />
            </div>
          </div>

          {/* QR Details */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Code Prefix</span>
              <span className="text-white font-mono">H</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">QR ID</span>
              <span className="text-white font-mono text-right truncate ml-4">
                {generatedQR?.slice(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Status</span>
              <span className="text-lime-400 font-semibold">Entry Granted</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Type</span>
              <span className="text-white/70">Dynamic · refreshes every 60s</span>
            </div>
          </div>

          <p className="text-white/40 text-xs mb-6">
            Present this QR at the hackathon entry gate. Scanning it will unlock your dashboard.
          </p>

          {/* Simulate Scan */}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-60 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              "📷 Simulate QR Scan → Enter Event"
            )}
          </button>
          <p className="text-white/30 text-xs mt-3">
            In production, the organiser scans your QR at the gate
          </p>
        </div>
      </div>
    </div>
  );
}