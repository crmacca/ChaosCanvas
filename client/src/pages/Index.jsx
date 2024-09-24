import { useRef, useEffect, useState, useCallback } from 'react';
import TermsModal from '../components/TermsModal';
import { io } from "socket.io-client";
import Toolbar from '../components/Toolbar';

const IndexPage = () => {
  const canvasRef = useRef(null);
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null, color: '#FFFFFF' });
  const [activeTool, setActiveTool] = useState('move');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [termsAndConditionsAgreed, setTermsAndConditionsAgreed] = useState('loading');
  const [currentColor, setCurrentColor] = useState('#FF5733'); // Default color
  const [pixels, setPixels] = useState([]); // Store drawn pixels here
  const [isDrawing, setIsDrawing] = useState(false); // Track if the user is drawing
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // For panning
  const [scale, setScale] = useState(1); // For zooming
  const [lastMousePos, setLastMousePos] = useState({ x: null, y: null }); // For move tracking
  const [loading, setLoading] = useState(true); // Loading state
  const [loadedChunks, setLoadedChunks] = useState(0); // Number of chunks loaded
  const [totalChunks, setTotalChunks] = useState(1);
  const size = { x: 300, y: 300 }; // Grid size (300x300)
  const pixelSize = 10; // Each pixel is 10x10 in size
  // Add these at the top of the file
  const [unsavedPixels, setUnsavedPixels] = useState([]);
  const loadingPercentage = Math.floor((loadedChunks / totalChunks) * 100);
  // Add this near the top of your component
  const socketRef = useRef(null); 



  // Function to apply real-time updates to the canvas
  const applyChangesToCanvas = useCallback((changes) => {
    setPixels((prevPixels) => {
      const updatedPixels = [...prevPixels];
      changes.forEach((change) => {
        const pixelIndex = updatedPixels.findIndex((p) => p.x === change.x && p.y === change.y);
        if (pixelIndex !== -1) {
          updatedPixels[pixelIndex] = { ...updatedPixels[pixelIndex], color: change.color };
        }
      });
  
      // Clear unsaved changes after applying them
      setUnsavedPixels((prevUnsavedPixels) =>
        prevUnsavedPixels.filter(
          (unsavedPixel) => !changes.some((change) => change.x === unsavedPixel.x && change.y === unsavedPixel.y)
        )
      );
  
      return updatedPixels;
    });
  }, [setPixels, setUnsavedPixels]);
  
  
  

  const handleCanvasChunk = (chunk) => {
    setPixels((prevPixels) => [...prevPixels, ...chunk.pixels]);
  };  

  useEffect(() => {
    const socket = io('192.168.1.97:3550');
    socketRef.current = socket; // Store socket reference
  
    socket.on('canvasMetadata', (data) => {
      setTotalChunks(data.totalChunks); // Set the total number of chunks expected
    });
  
    socket.on('canvasData', (chunkData) => {
      handleCanvasChunk(chunkData); // Load each canvas chunk
      setLoadedChunks((prev) => prev + 1); // Update loaded chunks count
  
      if (chunkData.chunkIndex === totalChunks - 1) {
        setLoading(false); // Hide loading indicator when all chunks are loaded
      }
    });
  
    socket.on('pixelUpdate', (updatedPixels) => {
      applyChangesToCanvas(updatedPixels); // Use memoized function
    });
  
    return () => socket.disconnect(); // Cleanup on component unmount
  }, [applyChangesToCanvas, totalChunks]); // Add applyChangesToCanvas to dependency array
  
  

  // Memoized function to draw the grid and pixels
  const drawGrid = useCallback((context) => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Apply translation (panning) and scaling (zoom)
    context.save();
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const pixel = pixels.find(p => p.x === x && p.y === y);
        const color = pixel ? pixel.color : '#FFFFFF';
        context.fillStyle = color;
        context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    if (gridEnabled) {
      context.strokeStyle = '#333';
      context.lineWidth = 0.2;

      for (let x = 0; x <= size.x; x++) {
        context.beginPath();
        context.moveTo(x * pixelSize, 0);
        context.lineTo(x * pixelSize, size.y * pixelSize);
        context.stroke();
      }

      for (let y = 0; y <= size.y; y++) {
        context.beginPath();
        context.moveTo(0, y * pixelSize);
        context.lineTo(size.x * pixelSize, y * pixelSize);
        context.stroke();
      }
    }

    // Restore the context state after transformations
    context.restore();
  }, [pixels, gridEnabled, size.x, size.y, offset.x, offset.y, scale]);

  // Track the hovered pixel
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left - offset.x) / (pixelSize * scale));
    const y = Math.floor((event.clientY - rect.top - offset.y) / (pixelSize * scale));

    setHoveredPixel({ x: x + 1, y: y + 1 });

    // Handle click and drag for move tool
    if (activeTool === 'move' && isDrawing) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      setOffset({ x: offset.x + deltaX, y: offset.y + deltaY });
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }

    // Handle click and drag for brush tool
    if (isDrawing && activeTool === 'paint') {
      drawPixel(x, y, currentColor); // Draw the pixel directly
    }
  };

  // Handle mouse click to start drawing or start moving
  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left - offset.x) / (pixelSize * scale));
    const y = Math.floor((event.clientY - rect.top - offset.y) / (pixelSize * scale));

    if (activeTool === 'eyedropper') {
      const pixel = pixels.find(p => p.x === x && p.y === y);
      const color = pixel ? pixel.color : '#FFFFFF';
      setCurrentColor(color); // Set the current color to the clicked pixel's color
    } else if (activeTool === 'paint') {
      setIsDrawing(true);
      drawPixel(x, y, currentColor); // Draw the pixel immediately on mouse down
    } else if (activeTool === 'move') {
      setIsDrawing(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };


  useEffect(() => {
    const intervalId = setInterval(() => {
      if (unsavedPixels.length > 0) {
        socketRef.current.emit('pixelUpdate', unsavedPixels); // Use socketRef.current to send data
        setUnsavedPixels([]); // Clear unsaved changes after sending
      }
    }, 2000); // Send changes every 2 seconds
  
    return () => clearInterval(intervalId); // Clean up on component unmount
  }, [unsavedPixels]);
  
  // Handle mouse release to stop drawing or stop moving
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Handle zooming in and out using scroll and pan horizontally or vertically
  const handleWheel = (event) => {
    if (event.ctrlKey) {
      // Zoom in or out at the mouse position
      const zoomIntensity = 0.1;
      const zoomDirection = event.deltaY > 0 ? -1 : 1; // Detect zoom direction
      const newScale = scale + zoomDirection * zoomIntensity;
      const boundedScale = Math.min(Math.max(newScale, 0.5), 3); // Bound the scale between 0.5 and 3

      // Calculate the point under the mouse before scaling
      const mouseX = (event.clientX - offset.x) / scale;
      const mouseY = (event.clientY - offset.y) / scale;

      // Update the scale
      setScale(boundedScale);

      // Adjust the offset to keep the point under the mouse at the same position
      setOffset({
        x: event.clientX - mouseX * boundedScale,
        y: event.clientY - mouseY * boundedScale,
      });
    } else {
      // Pan horizontally (left/right) and vertically (up/down) without Ctrl
      setOffset({
        x: offset.x - event.deltaX,
        y: offset.y - event.deltaY,
      });
    }
  };

  // Function to update the pixel in the pixels array
  const drawPixel = (x, y, color) => {
    // Collect unsaved changes
    setUnsavedPixels((prev) => {
      const existingPixelIndex = prev.findIndex(p => p.x === x && p.y === y);
  
      if (existingPixelIndex !== -1) {
        // Replace the existing unsaved pixel with the new color
        const updatedPixels = [...prev];
        updatedPixels[existingPixelIndex] = { x, y, color };
        return updatedPixels;
      } else {
        // Otherwise, add the new pixel change to the unsaved pixels
        return [...prev, { x, y, color }];
      }
    });
  
    // Update the pixel array used for rendering
    const updatedPixels = [...pixels];
    const existingPixelIndex = updatedPixels.findIndex(p => p.x === x && p.y === y);
  
    if (existingPixelIndex !== -1) {
      updatedPixels[existingPixelIndex] = {
        ...updatedPixels[existingPixelIndex],
        color,
        unsaved: true,
      };
    } else {
      updatedPixels.push({ x, y, color, unsaved: true });
    }
  
    setPixels(updatedPixels); // Update state with new pixels
  };  

  const handleAgree = () => {
    setTermsAndConditionsAgreed(true);
    localStorage.setItem('termsAndConditionsAgreed', true);
  }

  // Draw the canvas when mounted and whenever pixels, gridEnabled, offset, or scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    canvas.width = size.x * pixelSize;
    canvas.height = size.y * pixelSize;
  
    drawGrid(context);
  }, [pixels, gridEnabled, drawGrid, size.x, size.y, offset, scale]);  

  return (
    <div className="relative h-screen overflow-hidden"> {/* Disable overflow */}
      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        gridEnabled={gridEnabled}
        setGridEnabled={setGridEnabled}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
      />

      {/* Terms Modal */}
      {termsAndConditionsAgreed === false && <TermsModal onAgree={handleAgree} />}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center text-white">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <img alt='ChaosCanvas AI generated logo' src={'logo512.png'} className="w-40 h-40" />
            <div className="flex flex-col font-inter">
              <h1 className="text-4xl font-regular">
                ChaosCanvas
              </h1>
              <h1 className="text-3xl font-light">
                Canvas Loading... {loadingPercentage}%
              </h1> {/* Show loading percentage */}
            </div>
          </div>
        </div>
      )}


      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown} // Start drawing or moving on mouse down
        onMouseUp={handleMouseUp} // Stop drawing or moving on mouse up
        onMouseLeave={handleMouseUp} // Stop drawing if the mouse leaves the canvas
        onWheel={handleWheel} // Handle zooming with the mouse wheel
        className={`border ${activeTool === 'move' ? 'cursor-move' : 'cursor-crosshair'}`} // Change cursor
        style={{ width: size.x * pixelSize, height: size.y * pixelSize, margin: '5px' }}
      />

      {/* Overlay showing the hovered pixel coordinates and color */}
      {hoveredPixel.x !== null && hoveredPixel.y !== null && (
        <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-2 rounded-lg text-sm">
          Hovered Pixel: X: {hoveredPixel.x}, Y: {hoveredPixel.y}
        </div>
      )}
    </div>
  );
};

export default IndexPage;
