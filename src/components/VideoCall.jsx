import { useEffect, useRef, useState, useCallback } from "react";
import Peer from "peerjs";
import { getSocket } from "../utils/socket";
import { motion, AnimatePresence } from "framer-motion";

/**
 * VideoCall — WebRTC video/audio call with screen sharing using PeerJS.
 *
 * Features:
 * - Video + Audio call
 * - Screen sharing toggle
 * - Mute audio / disable video toggles
 * - Call duration timer
 * - Signaling via existing Socket.IO connection
 * - Fullscreen toggle
 *
 * Props:
 * - userId: current user's ID
 * - targetId: remote user's ID
 * - targetName: display name of remote user
 * - onClose: callback to end/dismiss the call UI
 */
const VideoCall = ({ userId, targetId, targetName, onClose }) => {
  const [callState, setCallState] = useState("idle"); // idle | calling | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize PeerJS and socket signaling
  useEffect(() => {
    const peer = new Peer(userId, {
      host: "/",
      port: 9000,
      path: "/peerjs",
      secure: false,
      // If no PeerJS server, use default cloud server
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    // Fallback: use default PeerJS cloud if custom server unavailable
    peer.on("error", (err) => {
      if (err.type === "network" || err.type === "server-error") {
        // Retry with default cloud
        peerRef.current = new Peer(userId, {
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });
        setupPeerEvents(peerRef.current);
      } else if (err.type === "unavailable-id") {
        // ID taken — use random suffix
        peerRef.current = new Peer(`${userId}-${Date.now()}`, {
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          },
        });
        setupPeerEvents(peerRef.current);
      } else {
        setError(`Connection error: ${err.message}`);
      }
    });

    peerRef.current = peer;
    setupPeerEvents(peer);

    // Socket signaling for call requests
    const socket = getSocket();
    socket.on("incomingCall", ({ fromUserId, peerId }) => {
      if (fromUserId === targetId) {
        answerCall(peerId);
      }
    });

    socket.on("callEnded", ({ fromUserId }) => {
      if (fromUserId === targetId) {
        endCall();
      }
    });

    return () => {
      endCall();
      peer.destroy();
      socket.off("incomingCall");
      socket.off("callEnded");
    };
  }, [userId, targetId]);

  // Start call duration timer
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const setupPeerEvents = (peer) => {
    // Handle incoming calls
    peer.on("call", (incomingCall) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          incomingCall.answer(stream);
          callRef.current = incomingCall;

          incomingCall.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setCallState("connected");
          });

          incomingCall.on("close", () => endCall());
        })
        .catch((err) => {
          setError("Camera/microphone access denied");
        });
    });
  };

  const startCall = async () => {
    setError("");
    setCallState("calling");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Signal the target user via socket
      const socket = getSocket();
      socket.emit("startCall", {
        fromUserId: userId,
        targetId,
        peerId: peerRef.current?.id || userId,
      });

      // Call the remote peer
      const call = peerRef.current.call(targetId, stream);
      callRef.current = call;

      call.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState("connected");
      });

      call.on("close", () => endCall());
      call.on("error", (err) => {
        setError("Call failed. The other user may not be available.");
        setCallState("idle");
      });

      // Timeout if no answer in 30 seconds
      setTimeout(() => {
        if (callState === "calling") {
          setError("No answer. Try again later.");
          endCall();
        }
      }, 30000);
    } catch (err) {
      setError("Camera/microphone access denied. Please allow permissions.");
      setCallState("idle");
    }
  };

  const answerCall = async (peerId) => {
    // Handled by peer.on("call") in setupPeerEvents
    setCallState("connected");
  };

  const endCall = useCallback(() => {
    // Stop all streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }

    // Notify remote user
    const socket = getSocket();
    socket.emit("endCall", { fromUserId: userId, targetId });

    setCallState("ended");
    setCallDuration(0);
    setIsScreenSharing(false);
  }, [userId, targetId]);

  // Toggle mute
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share, revert to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // Replace track in peer connection
      if (callRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = callRef.current.peerConnection
          ?.getSenders()
          ?.find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
      }
      setIsScreenSharing(false);
    } else {
      // Start screen share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        // Replace track in peer connection
        const videoTrack = screenStream.getVideoTracks()[0];
        if (callRef.current) {
          const sender = callRef.current.peerConnection
            ?.getSenders()
            ?.find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        }
        // When user stops screen share from browser UI
        videoTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {
        // User cancelled screen share picker
      }
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Video call with ${targetName}`}
      >
        {/* Call Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="text-white">
            <p className="font-semibold">{targetName}</p>
            {callState === "connected" && (
              <p className="text-sm text-green-400">{formatDuration(callDuration)}</p>
            )}
            {callState === "calling" && (
              <p className="text-sm text-yellow-400 animate-pulse">Calling...</p>
            )}
          </div>
          <button
            onClick={() => { endCall(); onClose(); }}
            className="btn btn-circle btn-sm btn-ghost text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Remote Video (large) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* If idle/calling, show placeholder */}
          {callState !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300 text-white gap-4">
              <div className="w-24 h-24 rounded-full bg-base-content/10 flex items-center justify-center text-4xl">
                📹
              </div>
              <p className="text-lg font-semibold">{targetName}</p>
              {callState === "calling" && (
                <p className="text-sm opacity-60 animate-pulse">Ringing...</p>
              )}
              {callState === "idle" && (
                <button onClick={startCall} className="btn btn-primary btn-lg gap-2 mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Start Video Call
                </button>
              )}
              {error && (
                <div className="alert alert-error max-w-sm mt-2 py-2 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Local Video (small, bottom-right) */}
          <div className="absolute bottom-24 right-4 w-36 h-28 sm:w-48 sm:h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-base-300 flex items-center justify-center">
                <span className="text-2xl">🙈</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        {callState !== "idle" && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-base-300/80 backdrop-blur-md rounded-full px-6 py-3 shadow-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`btn btn-circle btn-sm ${isMuted ? "btn-error" : "btn-ghost text-white"}`}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`btn btn-circle btn-sm ${isVideoOff ? "btn-error" : "btn-ghost text-white"}`}
              aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              )}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`btn btn-circle btn-sm ${isScreenSharing ? "btn-info" : "btn-ghost text-white"}`}
              aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
              title="Share your screen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>

            {/* End Call */}
            <button
              onClick={() => { endCall(); onClose(); }}
              className="btn btn-circle btn-md btn-error shadow-lg"
              aria-label="End call"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCall;
