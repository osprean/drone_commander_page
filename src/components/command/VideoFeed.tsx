import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Hls from "hls.js";

interface Props {
  url: string | null | undefined;
  enabled: boolean;
}

type StreamKind = "img" | "hls" | "whep" | "iframe" | "video";

function detectKind(url: string): StreamKind {
  const lower = url.toLowerCase();
  if (/\.(jpe?g|png|mjpe?g|gif)(\?.*)?$/.test(lower)) return "img";
  if (lower.includes(".m3u8")) return "hls";
  if (/\/whep(\/|$|\?)/.test(lower)) return "whep";
  if (/\.(mp4|webm|mov)(\?.*)?$/.test(lower)) return "video";
  return "iframe";
}

function StreamView({
  url,
  enabled,
  onMsg,
}: {
  url: string | null | undefined;
  enabled: boolean;
  onMsg?: (m: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const webrtcRef = useRef<RTCPeerConnection | null>(null);
  const [kind, setKind] = useState<StreamKind | null>(null);
  const [msg, setMsg] = useState<string>(enabled ? "Conectando…" : "CAM OFF");

  useEffect(() => {
    onMsg?.(msg);
  }, [msg, onMsg]);

  useEffect(() => {
    return () => cleanup();
    function cleanup() {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      webrtcRef.current?.close();
      webrtcRef.current = null;
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !url) {
      setKind(null);
      setMsg(enabled ? "Esperando stream…" : "CAM OFF");
      return;
    }
    const k = detectKind(url);
    setKind(k);
    setMsg("Conectando…");

    hlsRef.current?.destroy();
    hlsRef.current = null;
    webrtcRef.current?.close();
    webrtcRef.current = null;

    const video = videoRef.current;

    if (k === "img" && imgRef.current) {
      imgRef.current.src = url;
      setMsg("");
      return;
    }

    if (k === "hls" && video) {
      if (Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setMsg("Error HLS: " + data.details);
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setMsg("");
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(() => {});
        setMsg("");
      } else {
        setMsg("HLS no soportado");
      }
      return;
    }

    if (k === "whep" && video) {
      (async () => {
        try {
          const pc = new RTCPeerConnection();
          webrtcRef.current = pc;
          pc.addTransceiver("video", { direction: "recvonly" });
          pc.addTransceiver("audio", { direction: "recvonly" });
          pc.ontrack = (ev) => {
            video.srcObject = ev.streams[0];
            video.play().catch(() => {});
            setMsg("");
          };
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/sdp" },
            body: offer.sdp,
          });
          if (!resp.ok) throw new Error("whep " + resp.status);
          const answer = await resp.text();
          await pc.setRemoteDescription({ type: "answer", sdp: answer });
        } catch (e: any) {
          setMsg("WHEP error: " + e.message);
        }
      })();
      return;
    }

    if (k === "video" && video) {
      video.src = url;
      video.play().catch(() => {});
      setMsg("");
      return;
    }

    // iframe fallback — HTML viewer page (MediaMTX / streaming.osprean.net)
    setMsg("");
  }, [url, enabled]);

  return (
    <Box position="relative" bg="black" rounded="md" overflow="hidden" h="100%" w="100%">
      {kind === "img" && (
        <img ref={imgRef} alt="feed" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      )}
      {(kind === "hls" || kind === "whep" || kind === "video") && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
      {kind === "iframe" && url && (
        <iframe
          ref={iframeRef}
          src={url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Drone stream"
          onLoad={() => setMsg("")}
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      )}
      {msg && (
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <Text fontSize="xs" color="gray.300" fontFamily="mono">
            {msg}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export function VideoFeed({ url, enabled }: Props) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        border="1px solid"
        borderColor="gray.200"
        rounded="md"
        overflow="hidden"
        h="180px"
        position="relative"
      >
        <StreamView url={url} enabled={enabled} />
        {enabled && url && (
          <Button
            size="xs"
            position="absolute"
            top={1}
            right={1}
            bg="blackAlpha.700"
            color="white"
            _hover={{ bg: "blackAlpha.800" }}
            onClick={onOpen}
          >
            Expandir
          </Button>
        )}
      </Box>
      {enabled && url && (
        <Box mt={2} p={2} bg="gray.50" border="1px solid" borderColor="gray.200" rounded="md">
          <Text fontSize="9px" fontWeight="black" color="gray.500" letterSpacing="widest" mb={1}>
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

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="black" color="white">
          <ModalHeader fontSize="sm" fontFamily="mono">
            STREAM
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={2}>
            <Box h="75vh">
              <StreamView url={url} enabled={enabled && isOpen} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
