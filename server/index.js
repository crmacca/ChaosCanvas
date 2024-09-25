const { Server } = require('socket.io');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');  // For generating unique cache IDs
const linkify = require('linkifyjs');    // Import linkifyjs
const path = require('path')
const {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} = require('obscenity');

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const prisma = new PrismaClient();
const app = express();
const PORT = 80;

const size = {
  width: 300,
  height: 300
}

app.use(cors({
  origin: 'https://chaoscanvas.cmcdev.net', // Allow all origins (you can restrict this to specific origins if needed)
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type'] // Allow specific headers
}));

// Store recent pixel changes in memory
let caches = [];  // Store all caches
let currentCacheId = uuidv4();  // Track the current cache ID
let cacheFlushInterval = 5 * 60 * 1000; // 5 minutes flush interval instead of 10
const maxCacheSize = 500; // Reduce cache size to flush more frequently
const chunkSize = 500; // Chunk size for sending pixels
let pendingChanges = []; // Pending changes to broadcast every second

// Initialize the first cache
caches.push({ id: currentCacheId, data: [] });

// Helper function to split data into chunks
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper to overlay cache onto DB data
function overlayCache(dbPixels, cachePixels) {
  const mergedData = {};

  // Add DB pixels to mergedData
  dbPixels.forEach((pixel) => {
    const { x, y, color } = pixel;
    mergedData[`${x},${y}`] = { x, y, color };
  });

  // Overlay cache pixels on top of DB data
  cachePixels.forEach((pixel) => {
    const { x, y, color } = pixel;
    mergedData[`${x},${y}`] = { x, y, color }; // Cache takes precedence
  });

  return Object.values(mergedData);
}

// Flushing the cache to the DB, ensuring pending changes are handled
async function flushCacheToDB(io, cacheId) {
  const cacheIndex = caches.findIndex(c => c.id === cacheId);
  if (cacheIndex === -1) return; // No cache found

  const flushCache = [...caches[cacheIndex].data];
  caches.splice(cacheIndex, 1);  // Remove cache from array

  if (flushCache.length === 0) return;

  // Upsert each pixel data to DB and ensure atomicity
  const bulkCreate = flushCache.map(async (pixel) => {
    const { x, y, color, ipAddress, timestamp } = pixel;
    return prisma.pixel.upsert({
      where: { x_y: { x, y } },
      update: { color, ipAddress, timestamp }, // Store the timestamp in the DB for future comparison
      create: { x, y, color, ipAddress, timestamp },
    });
  });

  await Promise.all(bulkCreate);

  // Only broadcast if there are actual changes
  if (flushCache.length > 0) {
    console.log(`Flushing cache with ${flushCache.length} pixels to DB.`);
    io.emit('pixelUpdate', flushCache);
  }
}

// Broadcast pending changes to all clients every second
function broadcastPendingChanges(io) {
  if (pendingChanges.length > 0) {
    const changesToSend = [...pendingChanges];
    pendingChanges = [];  // Clear pending changes after sending
    console.log(`Broadcasting ${changesToSend.length} pending changes to all clients.`);
    io.emit('pixelUpdate', changesToSend);  // Broadcast changes to all clients
  }
}

// Flushing the cache only if there are actual changes and preventing cache overlap
async function flushCacheToDB(io, cacheId) {
  const cacheIndex = caches.findIndex(c => c.id === cacheId);
  if (cacheIndex === -1) return; // No cache found

  const flushCache = [...caches[cacheIndex].data];
  caches.splice(cacheIndex, 1);  // Remove cache from array

  if (flushCache.length === 0) return;

  // Upsert each pixel data to DB and ensure atomicity
  const bulkCreate = flushCache.map(async (pixel) => {
    const { x, y, color, ipAddress } = pixel;
    return prisma.pixel.upsert({
      where: { x_y: { x, y } },
      update: { color, ipAddress },
      create: { x, y, color, ipAddress },
    });
  });

  await Promise.all(bulkCreate);

  // Only broadcast if there are actual changes
  if (flushCache.length > 0) {
    console.log(`Flushing cache with ${flushCache.length} pixels to DB.`);
    io.emit('pixelUpdate', flushCache);
  }
}

function getTimestamp() {
  return new Date().getTime();
}

function handlePixelChange(data, ipAddress) {
  const currentCache = caches.find(c => c.id === currentCacheId);

  data.forEach((pixel) => {
    const { x, y, color } = pixel;
    const pixelData = { x, y, color, ipAddress, timestamp: getTimestamp() }; // Add a timestamp to each pixel

    // Skip if pixel data is invalid or out of bounds
    if (!pixelData.x || !pixelData.y || !pixelData.color) return;
    if (pixelData.x < 0 || pixelData.x >= size.width || pixelData.y < 0 || pixelData.y >= size.height) return;

    // Check if the pixel is already in the current cache to avoid duplicates
    const existingPixelIndex = currentCache.data.findIndex(p => p.x === pixelData.x && p.y === pixelData.y);
    
    if (existingPixelIndex !== -1) {
      // Only update if the new timestamp is more recent than the existing one
      if (currentCache.data[existingPixelIndex].timestamp <= pixelData.timestamp) {
        currentCache.data[existingPixelIndex] = pixelData; // Update existing pixel
      }
    } else {
      currentCache.data.push(pixelData);  // Add new pixel
    }

    // Add to pending changes for broadcast
    pendingChanges.push(pixelData);
  });

  // If cache is full, flush and start a new cache
  if (currentCache.data.length >= maxCacheSize) {
    const oldCacheId = currentCacheId;
    currentCacheId = uuidv4();  // Create a new cache ID
    caches.push({ id: currentCacheId, data: [] });
    flushCacheToDB(io, oldCacheId);
  }
}

// Fetch full canvas data and send it in chunks
async function getCanvasData(socket) {
  const dbPixels = await prisma.pixel.findMany();  // Fetch all pixels from DB
  const allPixels = overlayCache(dbPixels, caches.flatMap(cache => cache.data));  // Overlay all caches onto DB data

  // If there's no pixel data from the DB or cache, send an empty chunk
  if (allPixels.length === 0) {
    socket.emit('canvasData', { chunkIndex: 0, pixels: [] });  // Send an empty chunk
    return;
  }

  // Otherwise, split and send the pixel data in chunks
  const pixelChunks = chunkArray(allPixels, chunkSize);
  pixelChunks.forEach((chunk, index) => {
    socket.emit('canvasData', { chunkIndex: index, pixels: chunk });
  });
}

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Set up HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up Socket.IO server
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: 'https://chaoscanvas.cmcdev.net',
    methods: ['GET', 'POST']
  }
});

// Bad words and URL filtering
function filterMessage(message) {
  const containsUrl = linkify.test(message);  // Basic URL regex

  if (containsUrl) {
    return false;  // If the message has bad words or URLs, it's invalid
  }
  return true;  // Message is valid
}

let uniqueUsers = new Set();

// Handle Socket.IO connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (!uniqueUsers.has(userId)) {
    uniqueUsers.add(userId);
  }

  // Emit the current unique user count
  io.emit('userCount', uniqueUsers.size);

  getCanvasData(socket);  // Fetch and send canvas data when a client connects
  io.emit('userCount', io.engine.clientsCount); // Broadcast user count

  // Listen for chat messages
  socket.on('chatMessage', (data) => {
    let { username, message } = data;

    if (!filterMessage(message)) {
      socket.emit('chatError', { error: 'Message contains inappropriate content or URLs.' });
      return;  // Stop processing if the message is not valid
    }

    const censor = new TextCensor();
    const input = message;
    const matches = matcher.getAllMatches(input);
    let newMsg = censor.applyTo(input, matches)
    username = matcher.hasMatch(username) ? "Anonymous" : username
    // Broadcast the message if it's valid
    io.emit('chatMessage', { username, newMsg });
  });

  // Listen for pixel updates from client
  socket.on('pixelUpdate', (updatedPixels) => {
    handlePixelChange(updatedPixels, socket.handshake.address);
  });

  // Emit the current unique user count
  io.emit('userCount', uniqueUsers.size);

  socket.on('disconnect', () => {
    // Remove user if no other sockets exist for this userId
    const connectedSockets = Array.from(io.sockets.sockets).filter(([_, s]) => s.handshake.query.userId === userId);
    if (connectedSockets.length === 0) {
      uniqueUsers.delete(userId);
    }

    io.emit('userCount', uniqueUsers.size);
  });
});

// Periodically flush cache to the DB and broadcast to all clients
setInterval(() => flushCacheToDB(io, currentCacheId), cacheFlushInterval);

// Broadcast pending changes to all clients every second
setInterval(() => broadcastPendingChanges(io), 1000);

// Handle shutdown (flush cache to DB on Ctrl + C)
process.on('SIGINT', async () => {
  await flushCacheToDB(io, currentCacheId);
  process.exit();
})