import { useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Link, Text, useToast } from "@chakra-ui/react";
import Hls from "hls.js";

interface Props {
  url: string | null | undefined;
  enabled: boolean;
}

export function VideoFeed({ url, enabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const webrtcRef = useRef<RTCPeerConnection | null>(null);
  const [msg, setMsg] = useState<string>("CAM OFF");
  const toast = useToast();

  useEffect(() => {
    return () => cleanup();
    function cleanup() {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (webrtcRef.current) {
        webrtcRef.current.close();
        webrtcRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
      if (imgRef.current) imgRef.current.src = "";
    }
  }, []);

  useEffect(() => {
    if (!enabled || !url) {
      setMsg(enabled ? "Esperando stream…" : "CAM OFF");
      return;
    }
    const video = videoRef.current;
    const img = imgRef.current;
    if (!video || !img) return;

    // teardown previous
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (webrtcRef.current) {
      webrtcRef.current.close();
      webrtcRef.current = null;
    }
    video.pause();
    video.removeAttribute("src");
    video.load();
    img.src = "";

    video.style.display = "none";
    img.style.display = "none";
    setMsg("Conectando…");

    const lower = url.toLowerCase();
    const isImg =
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".mjpg") ||
      lower.endsWith(".mjpeg");
    const isHls = lower.endsWith(".m3u8");
    const isWhep = lower.endsWith("/whep") || lower.endsWith("/");

    if (isImg) {
      img.style.display = "block";
      img.src = url;
      setMsg("");
      return;
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setMsg("Error HLS: " + data.details);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hlsRef.current = hls;
      video.style.display = "block";
      setMsg("");
      return;
    }

    if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
      video.style.display = "block";
      setMsg("");
      return;
    }

    if (isWhep) {
      connectWhep(url, video).catch((e) => setMsg("WHEP error: " + e.message));
      video.style.display = "block";
      return;
    }

    // direct mp4/webm
    video.src = url;
    video.play().catch(() => {});
    video.style.display = "block";
    setMsg("");

    async function connectWhep(whepUrl: string, v: HTMLVideoElement) {
      const pc = new RTCPeerConnection();
      webrtcRef.current = pc;
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });
      pc.ontrack = (ev) => {
        v.srcObject = ev.streams[0];
        v.play().catch(() => {});
        setMsg("");
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const resp = await fetch(whepUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!resp.ok) throw new Error("whep " + resp.status);
      const answer = await resp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });
    }
  }, [url, enabled]);

  async function copyUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast({ status: "success", title: "URL copiada", duration: 1500 });
    } catch {
      toast({ status: "error", title: "No se pudo copiar" });
    }
  }

  return (
    <Box>
      <Box
        position="relative"
        bg="black"
        border="1px solid"
        borderColor="gray.200"
        rounded="md"
        overflow="hidden"
        minH="160px"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", display: "none" }}
        />
        <img ref={imgRef} style={{ width: "100%", display: "none" }} alt="feed" />
        {msg && (
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" color="gray.500" fontFamily="mono">
              {msg}
            </Text>
          </Box>
        )}
      </Box>
      {enabled && url && (
        <Box
          mt={2}
          p={2}
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          rounded="md"
        >
          <Text
            fontSize="9px"
            fontWeight="black"
            color="gray.500"
            letterSpacing="widest"
            mb={1}
          >
            STREAM URL
          </Text>
          <Link
            href={url}
            isExternal
            fontSize="10px"
            fontFamily="mono"
            color="teal.600"
            wordBreak="break-all"
            display="block"
          >
            {url}
          </Link>
          <HStack mt={1} spacing={2}>
            <Button size="xs" variant="outline" onClick={copyUrl}>
              Copiar
            </Button>
            <Button
              size="xs"
              variant="outline"
              as="a"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Abrir
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
