import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface PartyRoom {
  roomId: string; // 4-digit string
  roomName: string;
  hostId: string;
  hostName: string;
  currentTrackId: string | null;
  isPlaying: boolean;
  progress: number; // in seconds
  lastUpdated: number;
  members: string[]; // names
  localTrack?: {
    title: string;
    artist: string;
    duration: number;
  } | null;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory rooms cache
const rooms: Map<string, PartyRoom> = new Map();

// --- Party Sync APIs ---

// 1. Create a room
app.post("/api/party/create", (req, res) => {
  const { hostName, roomName } = req.body;
  if (!hostName) {
    return res.status(400).json({ error: "Nom de l'hôte requis" });
  }

  // Generate a random 4-digit code
  let roomId = "";
  do {
    roomId = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(roomId));

  const newRoom: PartyRoom = {
    roomId,
    roomName: roomName || `Festivité de ${hostName}`,
    hostId: Math.random().toString(36).substring(2, 9),
    hostName,
    currentTrackId: null,
    isPlaying: false,
    progress: 0,
    lastUpdated: Date.now(),
    members: [hostName],
    localTrack: null
  };

  rooms.set(roomId, newRoom);
  console.log(`[Party] Room created: ${roomId} by ${hostName}`);
  res.json(newRoom);
});

// 2. Join a room
app.post("/api/party/join", (req, res) => {
  const { roomId, memberName } = req.body;
  if (!roomId || !memberName) {
    return res.status(400).json({ error: "Code de chambre et nom requis" });
  }

  const room = rooms.get(roomId.toString().trim());
  if (!room) {
    return res.status(404).json({ error: "Chambre introuvable ou expirée" });
  }

  // Add member if not already in list
  if (!room.members.includes(memberName)) {
    room.members.push(memberName);
  }
  room.lastUpdated = Date.now();

  console.log(`[Party] ${memberName} joined Room: ${roomId}`);
  res.json(room);
});

// 3. Update room playback state
app.post("/api/party/update/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { currentTrackId, isPlaying, progress, localTrack } = req.body;

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Chambre introuvable" });
  }

  room.currentTrackId = currentTrackId;
  room.isPlaying = isPlaying;
  room.progress = progress !== undefined ? progress : room.progress;
  if (localTrack !== undefined) {
    room.localTrack = localTrack;
  }
  room.lastUpdated = Date.now();

  res.json(room);
});

// 4. Retrieve room sync state (called by members)
app.get("/api/party/sync/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Chambre introuvable" });
  }

  res.json(room);
});

// 5. Leave a room
app.post("/api/party/leave/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { memberName } = req.body;
  
  const room = rooms.get(roomId);
  if (room) {
    room.members = room.members.filter(m => m !== memberName);
    // If no one is left, delete room
    if (room.members.length === 0) {
      rooms.delete(roomId);
    }
  }
  res.json({ success: true });
});

// 6. Get general party health
app.get("/api/party/status", (req, res) => {
  res.json({ activeRooms: rooms.size });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
