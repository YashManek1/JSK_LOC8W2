import React, { useState, useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import hark from "hark";
import { Mic, Video, Upload, X, Check, MicOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api";

const REQUIRED_FIELDS = [
  "primarySkillset",
  "tagline",
  "githubUrl",
  "motivation",
  "hackathonPreferences",
];
const FIELD_LABELS = {
  primarySkillset: "Skills",
  tagline: "Tagline",
  githubUrl: "GitHub",
  motivation: "Motivation",
  hackathonPreferences: "Preferences",
};

export default function GeminiLivePage() {
  const { currentUser, navigateTo } = useApp();

  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [messages, setMessages] = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Gemini Live UI states
  const [toastMessage, setToastMessage] = useState(null);
  const [micMuted, setMicMuted] = useState(false);

  // Refs
  const sessionIdRef = useRef(null);
  const socketRef = useRef(null);
  const micMutedRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const harkRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const isAIRespondingRef = useRef(false);
  const extractedDataRef = useRef({});

  const [audioVolume, setAudioVolume] = useState(-100);

  // Sync refs
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);
  useEffect(() => {
    isAIRespondingRef.current = isAIResponding;
  }, [isAIResponding]);
  useEffect(() => {
    extractedDataRef.current = extractedData;
  }, [extractedData]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Helpers (declared before useEffect) ───
  const addMessage = useCallback((text, type) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, type },
    ]);
  }, []);

  const removeLastSystemMessage = useCallback(() => {
    setMessages((prev) => {
      const arr = [...prev];
      if (arr.length > 0 && arr[arr.length - 1].type === "system") arr.pop();
      return arr;
    });
  }, []);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ─── TTS ───
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
      setIsAIResponding(false);
      return;
    }
    window.speechSynthesis.cancel();
    setIsAIResponding(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      setIsAIResponding(false);
      if (streamRef.current && !micMutedRef.current) {
        startRecordingRef.current?.(streamRef.current);
      }
    };
    utterance.onerror = () => setIsAIResponding(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── Recording ───
  const sendAudio = useCallback(
    (blob) => {
      const sid = sessionIdRef.current;
      const sock = socketRef.current;
      if (!sid || !sock || blob.size === 0) {
        setIsAIResponding(false);
        return;
      }
      addMessage("\uD83C\uDFA4 [Voice message]", "user");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        sock.emit("audioMessage", { sessionId: sid, audio: base64 });
      };
      reader.readAsDataURL(blob);
    },
    [addMessage],
  );

  const startRecording = useCallback(
    (stream) => {
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
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.start();
          } catch {
            /* already started */
          }
        }
      } catch {
        /* recorder init failed */
      }
    },
    [sendAudio],
  );

  // Keep a stable ref for startRecording so speak() callback can use it
  const startRecordingRef = useRef(startRecording);
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      setIsAIResponding(true);
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        /* not started */
      }
    }
  }, []);

  const endSession = useCallback(() => {
    stopRecording();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    localStorage.setItem(
      "voiceExtractedData",
      JSON.stringify(extractedDataRef.current),
    );
    navigateTo("completeProfile");
  }, [stopRecording, navigateTo]);

  // ─── VAD ───
  const setupVAD = useCallback(
    (stream) => {
      if (harkRef.current) harkRef.current.stop();

      const speechEvents = hark(stream, {
        threshold: -55,
        play: false,
        interval: 2000,
      });

      speechEvents.on("volume_change", (volume) => setAudioVolume(volume));

      speechEvents.on("speaking", () => {
        if (isAIRespondingRef.current || micMutedRef.current) return;
        startRecordingRef.current?.(stream);
      });

      speechEvents.on("stopped_speaking", () => {
        if (isAIRespondingRef.current) return;
        setAudioVolume(-100);
        stopRecording();
      });

      harkRef.current = speechEvents;
    },
    [stopRecording],
  );

  // Connect socket on mount, auto-start session with user email
  useEffect(() => {
    const email = currentUser?.email;
    if (!email) return;

    const newSocket = io(`${API_BASE_URL}/voice-chat`);

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("sessionStarted", (data) => {
      setSessionId(data.sessionId);
      addMessage(data.greeting, "ai");
      speak(data.greeting);
    });

    newSocket.on("processing", () => {
      setIsAIResponding(true);
      showToast("Processing your response...");
    });

    newSocket.on("aiResponse", (data) => {
      removeLastSystemMessage();
      if (data.text) {
        addMessage(data.text, "ai");
        speak(data.text);
      }
      if (data.extractedData) {
        const oldData = extractedDataRef.current;
        const newKeys = Object.keys(data.extractedData).filter(
          (k) =>
            data.extractedData[k] !== oldData[k] &&
            data.extractedData[k] != null,
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
      showToast("Profile data collected!");
      if (data.extractedData) setExtractedData(data.extractedData);
      setTimeout(() => {
        localStorage.setItem(
          "voiceExtractedData",
          JSON.stringify(data.extractedData || {}),
        );
        navigateTo("completeProfile");
      }, 2500);
    });

    newSocket.on("error", (data) => {
      removeLastSystemMessage();
      showToast(`\u26A0\uFE0F ${data.message}`);
    });

    setSocket(newSocket);

    // Start session immediately once connected
    newSocket.emit("startSession", { email });

    // Request mic
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        setupVAD(stream);
      })
      .catch(() => {
        showToast("Please allow microphone access");
      });

    // Speech Recognition for exit keywords
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("")
          .toLowerCase();

        if (
          transcript.includes("stop listening") ||
          transcript.includes("send my answer") ||
          transcript.includes("submit")
        ) {
          recognition.stop();
          setIsAIResponding(true);
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        }

        if (
          transcript.includes("end session") ||
          transcript.includes("goodbye") ||
          transcript.includes("close chat")
        ) {
          recognition.stop();
          endSession();
        }
      };

      recognition.onend = () => {
        if (
          !isAIRespondingRef.current &&
          streamRef.current &&
          !micMutedRef.current
        ) {
          try {
            recognition.start();
          } catch {
            /* already running */
          }
        }
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      newSocket.disconnect();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (harkRef.current) harkRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Text fallback ───
  const sendText = (e) => {
    e?.preventDefault();
    const text = textInput.trim();
    if (!text || !sessionId || !socket) return;
    addMessage(text, "user");
    socket.emit("userMessage", { sessionId, text });
    setTextInput("");
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

  const filledFieldsCount = REQUIRED_FIELDS.filter(
    (f) => extractedData[f] != null,
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1115] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="text-xl font-medium tracking-wide flex items-center gap-2">
          <span className="text-indigo-400 font-bold">✨</span> Live
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span
            className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isConnected ? "bg-emerald-400 text-emerald-400" : "bg-rose-400 text-rose-400"}`}
          />
          <span className="text-xs font-medium text-white/70">
            {isConnected
              ? `${filledFieldsCount}/${REQUIRED_FIELDS.length}`
              : "Connecting..."}
          </span>
        </div>
      </header>

      {/* Toast */}
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

      {/* Center: Fluid Wave Visualizer */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 z-10 relative">
        {!sessionId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <Mic className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center">
              Connecting...
            </h2>
            <p className="text-white/40 text-sm text-center">
              Setting up your voice session
            </p>
          </motion.div>
        ) : (
          <div className="absolute w-full h-full flex flex-col items-center justify-end pb-32 pointer-events-none overflow-hidden">
            {/* Fluid Wavy Visualizer — 3 morphing blobs */}
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
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
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
                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
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

            {/* Status text */}
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
                  Say "stop listening" to submit
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text input for fallback (shown subtly at bottom above controls) */}
      {sessionId && (
        <div className="absolute bottom-28 w-full px-8 z-20">
          <form onSubmit={sendText} className="flex gap-2 max-w-md mx-auto">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type here..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors disabled:opacity-30"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Bottom Control Dock */}
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

            {/* Main Mic */}
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

            {/* End Call */}
            <button
              onClick={endSession}
              className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center bg-[#ea4335] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              <X className="w-7 h-7 text-white" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Minimal scrollable message log (keyboard icon toggles) */}
      {sessionId && messages.length > 0 && (
        <div className="absolute top-20 left-0 right-0 z-10 px-4 max-h-[40vh] overflow-y-auto pointer-events-auto">
          <div className="max-w-lg mx-auto space-y-2 pb-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-2 rounded-2xl text-sm backdrop-blur-sm ${
                  m.type === "ai"
                    ? "bg-white/5 text-white/80 mr-12"
                    : "bg-indigo-500/20 text-white/90 ml-12 text-right"
                }`}
              >
                {m.text}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
