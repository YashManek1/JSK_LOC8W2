import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";

export default function IdentityVerification() {
  const [email, setEmail] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieImageSrc, setSelfieImageSrc] = useState(null);
  const webcamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setSelfieImageSrc(imageSrc);
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelfieFile(file);
        });
    }
  }, [webcamRef]);

  const retake = () => {
    setSelfieImageSrc(null);
    setSelfieFile(null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !aadhaarFile || !idCardFile || !selfieFile) {
      setError(
        "Please provide an email and all 3 images (Aadhaar, ID Card, Selfie).",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("aadhaar", aadhaarFile);
    formData.append("idCard", idCardFile);
    formData.append("selfie", selfieFile);

    try {
      const res = await fetch(
        "http://localhost:3000/api/chat/verify-identity",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAadhaar = (numberStr) => {
    if (!numberStr || numberStr.length !== 12) return numberStr;
    return numberStr.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto p-8 mt-10 space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Identity Verification
        </h1>
        <p className="text-lg text-slate-400">
          Upload Aadhaar and selfie to automatically extract details and verify
          via ArcFace biometrics.
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Participant Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="hacker@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                1. Aadhaar Card Image
              </label>
              <div className="relative group cursor-pointer border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors bg-slate-900/50">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  {aadhaarFile ? (
                    <div className="text-indigo-400 font-medium truncate px-4 w-full">
                      {aadhaarFile.name}
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        ></path>
                      </svg>
                      <p className="text-sm text-slate-400">
                        Drag & drop or click to upload
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                2. Student / Employee ID Card
              </label>
              <div className="relative group cursor-pointer border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors bg-slate-900/50">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setIdCardFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  {idCardFile ? (
                    <div className="text-indigo-400 font-medium truncate px-4 w-full">
                      {idCardFile.name}
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4m-4 4l4 4"
                        ></path>
                      </svg>
                      <p className="text-sm text-slate-400">Upload ID Card</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                3. Live Selfie (Laptop/Webcam)
              </label>
              <div className="relative border-2 border-slate-600 rounded-xl overflow-hidden bg-slate-900/50 flex flex-col h-full min-h-[200px]">
                {selfieImageSrc ? (
                  <div className="relative w-full h-full flex flex-col justify-center bg-black">
                    <img
                      src={selfieImageSrc}
                      alt="Selfie"
                      className="w-full h-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={retake}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full text-sm hover:bg-slate-800 transition-colors backdrop-blur-md border border-white/10"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-center bg-black">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-auto object-cover"
                    />
                    <button
                      type="button"
                      onClick={capture}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6 border border-indigo-500 rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying Identity...
              </span>
            ) : (
              "Run Verification"
            )}
          </button>
        </form>

        {/* Results Pane */}
        {(result || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`mt-8 p-6 rounded-xl border ${error ? "bg-red-900/20 border-red-500/50" : "bg-emerald-900/20 border-emerald-500/50"}`}
          >
            {error ? (
              <div className="flex items-center gap-3 text-red-400 font-medium">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-400 font-medium text-lg border-b border-emerald-500/20 pb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {result.message}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                      Extracted Aadhaar
                    </div>
                    <div className="font-mono text-xl text-white">
                      {formatAadhaar(result.aadhaarNumber)}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                      Face Match
                    </div>
                    <div className="font-mono text-xl text-emerald-400">
                      {(result.faceMatchConfidence * 100).toFixed(2)}%
                      Confidence
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
