import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import hark from "hark";
import { Mic, Video, Upload, X, Check, MicOff } from "lucide-react";

const BACKEND_URL = "http://localhost:3000";

const REQUIRED_FIELDS = [
  "fullName",
  "phone",
  "primarySkillset",
  "motivation",
  "githubUrl",
];
const FIELD_LABELS = {
  fullName: "Full Name",
  phone: "Phone",
  primarySkillset: "Skills",
  motivation: "Motivation",
  githubUrl: "GitHub",
  linkedinUrl: "LinkedIn",
  roleSelection: "Role",
  dietaryPref: "Diet",
  sleepHabits: "Sleep",
};

export default function VoiceChat() {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [isAIResponding, setIsAIResponding] = useState(false);

  // Gemini Live specific UI states
  const [toastMessage, setToastMessage] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  // Refs for resolving React stale-closure issues in async events
  const sessionIdRef = useRef(null);
  const socketRef = useRef(null);
  const micMutedRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const harkRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Real-time audio volume tracking for the visualizer wave
  const [audioVolume, setAudioVolume] = useState(-100);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect Socket on Mount (Wait for Session Start)
  useEffect(() => {
    const newSocket = io(`${BACKEND_URL}/voice-chat`);

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("sessionStarted", (data) => {
      setSessionId(data.sessionId);
      addMessage(data.greeting, "ai");
      speak(data.greeting);
    });

    newSocket.on("processing", (data) => {
      setIsAIResponding(true);
      addMessage(`⏳ ${data.status || "Processing..."}`, "system");
    });

    newSocket.on("aiResponse", (data) => {
      removeLastSystemMessage();
      if (data.text) {
        addMessage(data.text, "ai");
        speak(data.text);
      }
      if (data.extractedData) {
        // Compare new data against old to show a specific toast
        const newKeys = Object.keys(data.extractedData).filter(
          (k) =>
            data.extractedData[k] !== extractedData[k] &&
            data.extractedData[k] !== null,
        );
        if (newKeys.length > 0) {
          const keyName = newKeys[newKeys.length - 1];
          showToast(`Added ${FIELD_LABELS[keyName] || keyName} \u2713`);
        }
        setExtractedData(data.extractedData);
      }
    });

    newSocket.on("registrationComplete", (data) => {
      removeLastSystemMessage();
      showToast("🎉 Registration complete!");
      if (data.extractedData) setExtractedData(data.extractedData);
      setTimeout(() => setShowSummary(true), 1500); // Show full summary at end
    });

    newSocket.on("error", (data) => {
      removeLastSystemMessage();
      showToast(`⚠️ ${data.message}`);
    });

    setSocket(newSocket);

    // Initialize Web Speech API for keyword detection
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")
          .toLowerCase();

        console.log("Live transcript:", transcript);

        // Stop listening to current answer and submit it
        if (
          transcript.includes("stop listening") ||
          transcript.includes("send my answer")
        ) {
          console.log(
            "🛑 Submission word detected! Submitting current answer.",
          );
          recognition.stop();
          setToastMessage("Sending your answer...");
          setIsAIResponding(true); // 🔥 Lock the recording states immediately
          // stopRecording will trigger sendAudio() via mediaRecorder.onstop
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        }

        // Fully end the entire session
        if (transcript.includes("end session")) {
          console.log("🛑 End session word detected.");
          recognition.stop();
          endSession();
        }
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      newSocket.disconnect();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
    };
  }, []);

  // ─── STT / Recording ───
  const startSession = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }
    if (socket) {
      socket.emit("startSession", { email: email.trim() });
    }
    // Request microphone access up front for seamless turn-taking
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupVAD(stream);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use Voice Registration.");
    }
  };

  const setupVAD = (stream) => {
    if (harkRef.current) harkRef.current.stop();

    // Tuning Hark:
    // threshold: -60db (Highly sensitive setting so it instantly picks up normal speech without requiring clicks)
    // interval: 1000ms (1 second of silence stops recording)
    const speechEvents = hark(stream, {
      threshold: -60,
      play: false,
      interval: 1000,
    });

    // Real-time volume visualizer
    speechEvents.on("volume_change", (volume) => {
      setAudioVolume(volume);
    });

    speechEvents.on("speaking", () => {
      // Don't record our own AI's playback
      if (isAIResponding) return;

      console.log("🗣️ User started speaking...");
      startRecording(stream);
    });

    speechEvents.on("stopped_speaking", () => {
      if (isAIResponding) return;

      console.log("😶 User stopped speaking...");
      setAudioVolume(-100); // Reset visualizer
      stopRecording();
    });

    harkRef.current = speechEvents;
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (!streamRef.current) {
        alert("Please start the session first to grant microphone access.");
        return;
      }
      startRecording(streamRef.current);
    }
  };

  const startRecording = (stream) => {
    if (mediaRecorderRef.current?.state === "recording") return;

    try {
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        sendAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Start listening for exit word
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (e) {} // ignore already started errors
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      setIsAIResponding(true); // 🔥 Central lock to prevent race conditions with Hark parsing background noise
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    // Stop listening for exit word
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const sendAudio = (blob) => {
    const currentSessionId = sessionIdRef.current;
    const currentSocket = socketRef.current;

    // Safety check - handles 0-byte blobs and stale sessionId closures
    if (!currentSessionId || !currentSocket || blob.size === 0) {
      setIsAIResponding(false);
      return;
    }

    addMessage("🎤 [Voice message]", "user");
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      currentSocket.emit("audioMessage", {
        sessionId: currentSessionId,
        audio: base64,
      });
    };
    reader.readAsDataURL(blob);
  };

  // ─── Text Fallback ───
  const sendText = (e) => {
    e?.preventDefault();
    const text = textInput.trim();
    if (!text || !sessionId || !socket) return;

    addMessage(text, "user");
    socket.emit("userMessage", { sessionId, text });
    setTextInput("");
  };

  // ─── TTS ───
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) {
      setIsAIResponding(false); // Make sure to release lock if TTS disabled
      return;
    }
    window.speechSynthesis.cancel();
    setIsAIResponding(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      console.log("🔊 AI finished speaking.");
      setIsAIResponding(false);

      // Auto-start recording immediately for the user's turn
      if (streamRef.current && !micMutedRef.current) {
        startRecording(streamRef.current);
      }
    };

    utterance.onerror = () => {
      console.error("🔊 TTS Error");
      setIsAIResponding(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ─── UI Helpers ───
  const addMessage = (text, type) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, type },
    ]);
  };

  const removeLastSystemMessage = () => {
    setMessages((prev) => {
      const newArr = [...prev];
      if (newArr.length > 0 && newArr[newArr.length - 1].type === "system") {
        newArr.pop();
      }
      return newArr;
    });
  };

  // Progress calculations
  const filledFieldsCount = REQUIRED_FIELDS.filter(
    (f) => extractedData[f] != null,
  ).length;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const endSession = () => {
    stopRecording();
    setShowSummary(true);
  };

  const toggleMic = () => {
    if (micMuted) {
      setMicMuted(false);
      if (streamRef.current && !isAIResponding)
        startRecording(streamRef.current);
    } else {
      setMicMuted(true);
      stopRecording();
    }
  };
  const progressPercent = Math.round(
    (filledFieldsCount / REQUIRED_FIELDS.length) * 100,
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1115] text-white flex flex-col font-sans overflow-hidden">
      {/* ─── Immersive Gemini Live Canvas ─── */}
      {!showSummary ? (
        <>
          {/* Top Bar */}
          <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
            <div className="text-xl font-medium tracking-wide flex items-center gap-2">
              <span className="text-indigo-400 font-bold">✨</span> Live
            </div>
            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span
                className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isConnected ? "bg-emerald-400 text-emerald-400" : "bg-rose-400 text-rose-400"}`}
              ></span>
              <span className="text-xs font-medium text-white/70">
                {isConnected
                  ? `${filledFieldsCount}/${REQUIRED_FIELDS.length}`
                  : "Local"}
              </span>
            </div>
          </header>

          {/* Minimalist Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ethereal Center Void */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 z-10 relative">
            {!sessionId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 max-w-sm w-full"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-4 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                  <Mic className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-semibold text-center mt-2">
                  Ready to assist
                </h2>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startSession()}
                  placeholder="Enter your email to start..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-white/30"
                />
                <button
                  onClick={startSession}
                  className="w-full bg-white text-black hover:bg-white/90 px-6 py-4 rounded-2xl font-semibold transition-colors"
                >
                  Connect
                </button>
              </motion.div>
            ) : (
              <div className="absolute w-full h-full flex flex-col items-center justify-end pb-32 pointer-events-none overflow-hidden">
                {/* Fluid Wavy Visualizer */}
                <div
                  className="relative w-full flex justify-center items-end"
                  style={{
                    height: isAIResponding
                      ? "45vh"
                      : isRecording
                        ? `${Math.max(25, Math.min(60, 25 + (audioVolume + 60) * 1.5))}vh`
                        : "20vh",
                    transition: "height 0.3s ease-out",
                    opacity: isAIResponding ? 0.8 : isRecording ? 0.6 : 0.3,
                  }}
                >
                  {/* Blob 1 */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                      borderRadius: [
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                        "60% 40% 30% 70% / 50% 60% 40% 50%",
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                      ],
                    }}
                    transition={{
                      duration: 8,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                    className="absolute w-[80vw] max-w-[800px] h-[150%] bottom-[-50%] bg-indigo-500/30 mix-blend-screen blur-3xl origin-center"
                  />
                  {/* Blob 2 */}
                  <motion.div
                    animate={{
                      rotate: [360, 0],
                      scale: [1.1, 1, 1.1],
                      borderRadius: [
                        "60% 40% 30% 70% / 50% 60% 40% 50%",
                        "40% 60% 70% 30% / 40% 50% 60% 50%",
                        "60% 40% 30% 70% / 50% 60% 40% 50%",
                      ],
                    }}
                    transition={{
                      duration: 10,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                    className="absolute w-[70vw] max-w-[700px] h-[130%] bottom-[-40%] bg-purple-500/20 mix-blend-screen blur-3xl origin-center"
                  />
                  {/* Blob 3 (Core) */}
                  <motion.div
                    animate={{
                      scale: isRecording ? [1, 1.2, 1] : 1,
                      opacity: isRecording ? [0.5, 0.8, 0.5] : 0.5,
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                    className="absolute w-[50vw] max-w-[500px] h-full bottom-[-20%] bg-white/20 mix-blend-screen blur-[60px] rounded-[100%]"
                  />
                </div>

                {/* Visualizer hints */}
                <div className="w-full text-center pb-12 z-10 flex flex-col justify-center items-center gap-2">
                  <p className="text-white/40 font-medium text-lg tracking-wide">
                    {isAIResponding
                      ? "Listening to AI..."
                      : isRecording && !micMuted
                        ? "Listening..."
                        : ""}
                  </p>
                  {isRecording && !micMuted && (
                    <p className="text-white/20 text-xs tracking-widest font-semibold uppercase">
                      Say "Stop listening" to end
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Floating Bottom Control Dock */}
          {sessionId && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-8 w-full flex justify-center px-4 z-20"
            >
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors pointer-events-none opacity-50">
                  <Video className="w-5 h-5 text-white" />
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors pointer-events-none opacity-50">
                  <Upload className="w-5 h-5 text-white" />
                </button>

                {/* Main Mic Button */}
                <button
                  onClick={toggleMic}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    micMuted
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                  }`}
                >
                  {micMuted ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>

                {/* End Call Button */}
                <button
                  onClick={endSession}
                  className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-[#ea4335] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  <X className="w-7 h-7 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* ─── Summary / Extracted Data Screen (Shown After Ending) ─── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center bg-slate-950"
        >
          <div className="max-w-xl w-full">
            <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Registration Summary
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              {Object.keys(extractedData).length === 0 ? (
                <p className="text-slate-500 text-center italic">
                  No data was collected.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(FIELD_LABELS).map(([key, label]) => {
                    if (extractedData[key] != null) {
                      const val = Array.isArray(extractedData[key])
                        ? extractedData[key].join(", ")
                        : String(extractedData[key]);
                      return (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-800/50 last:border-0"
                        >
                          <span className="text-sm font-medium text-slate-500 mb-1 sm:mb-0">
                            {label}
                          </span>
                          <span className="text-base font-semibold text-slate-200 sm:text-right max-w-[70%]">
                            {val}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
