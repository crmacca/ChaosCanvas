const { Server } = require('socket.io');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = 3550;

// Store recent pixel changes in memory
let cache = [];
let cacheFlushInterval = 10 * 60 * 1000; // 10 minutes
const maxCacheSize = 100;
const chunkSize = 500; // Chunk size for sending pixels
let pendingChanges = []; // Pending changes to broadcast every second

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

// Flush cache to the database and broadcast the changes
async function flushCacheToDB(io) {
  const flushCache = [...cache]; // Copy the cache to "flush"
  cache = []; // Empty the cache so new entries can be added

  if (flushCache.length === 0) return;

  console.log('Flushing cache to DB...');
  const bulkCreate = flushCache.map(async (pixel) => {
    const { x, y, color, ipAddress } = pixel;
    return prisma.pixel.upsert({
      where: {
        x_y: { x, y }  // Make sure @@unique([x, y]) is in your Prisma schema
      },
      update: { color, ipAddress },
      create: { x, y, color, ipAddress }
    });
  });

  await Promise.all(bulkCreate);
  console.log('Cache flushed to DB.');

  // Broadcast the flushed changes to all clients
  if (flushCache.length > 0) {
    io.emit('pixelUpdate', flushCache);  // Emit flushed cache data to all clients
  }
}

// Broadcast pending changes to all clients every second
function broadcastPendingChanges(io) {
  if (pendingChanges.length > 0) {
    const changesToSend = [...pendingChanges];
    pendingChanges = []; // Clear pending changes after sending

    io.emit('pixelUpdate', changesToSend); // Broadcast changes to all clients
  }
}

// Handle pixel change from clients
function handlePixelChange(data, ipAddress) {
  data.forEach((pixel) => {
    const { x, y, color } = pixel;
    const pixelData = { x, y, color, ipAddress };

    // Add to cache
    cache.push(pixelData);

    // Add to pending changes for broadcast
    pendingChanges.push(pixelData);
  });

  // If cache exceeds max size, flush to DB and broadcast
  if (cache.length >= maxCacheSize) {
    flushCacheToDB(io);
  }
}

// Fetch full canvas data and send it in chunks
async function getCanvasData(socket) {
  const dbPixels = await prisma.pixel.findMany(); // Fetch all pixels from DB
  const allPixels = overlayCache(dbPixels, cache); // Overlay cache onto DB data

  // If there's no pixel data from the DB or cache, send an empty chunk
  if (allPixels.length === 0) {
    socket.emit('canvasData', { chunkIndex: 0, pixels: [] }); // Send an empty chunk
    return;
  }

  // Otherwise, split and send the pixel data in chunks
  const pixelChunks = chunkArray(allPixels, chunkSize);

  pixelChunks.forEach((chunk, index) => {
    socket.emit('canvasData', { chunkIndex: index, pixels: chunk });
  });
}

// Set up HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up Socket.IO server
const io = new Server(server);

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  getCanvasData(socket);  // Fetch and send canvas data when a client connects

  // Listen for pixel updates from client
  socket.on('pixelUpdate', (updatedPixels) => {
    console.log('Received pixel updates:', updatedPixels);
    // Broadcast updated pixels to all clients
    handlePixelChange(updatedPixels, socket.handshake.address);
    io.emit('pixelUpdate', updatedPixels);  // Broadcast to all clients
  });
});

// Periodically flush cache to the DB and broadcast to all clients
setInterval(() => flushCacheToDB(io), cacheFlushInterval);

// Broadcast pending changes to all clients every second
setInterval(() => broadcastPendingChanges(io), 1000);

// Handle shutdown (flush cache to DB on Ctrl + C)
process.on('SIGINT', async () => {
  console.log('Server shutting down, flushing cache...');
  await flushCacheToDB(io);
  process.exit();
});
