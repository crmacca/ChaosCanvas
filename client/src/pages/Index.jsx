import { useRef, useEffect, useState, useCallback } from "react";
import TermsModal from "../components/TermsModal";
import { io } from "socket.io-client";
import Toolbar from "../components/Toolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";
import {
  faArrowRight,
  faArrowsLeftRight,
  faMagnifyingGlass,
  faPaperPlane,
  faUpDownLeftRight,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";

const IndexPage = () => {
  const canvasRef = useRef(null);
  const [hoveredPixel, setHoveredPixel] = useState({ x: null, y: null });
  const [activeTool, setActiveTool] = useState("move");
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [termsAndConditionsAgreed, setTermsAndConditionsAgreed] =
    useState("loading");
  const [currentColor, setCurrentColor] = useState("#2578be"); // Default color
  const [pixels, setPixels] = useState([]); // Store drawn pixels here
  const [isDrawing, setIsDrawing] = useState(false); // Track if the user is drawing
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // For panning
  const [scale, setScale] = useState(1); // For zooming
  const [lastMousePos, setLastMousePos] = useState({ x: null, y: null }); // For move tracking
  const [loading, setLoading] = useState(true); // Loading state
  const [loadedChunks, setLoadedChunks] = useState(0); // Number of chunks loaded
  const [totalChunks, setTotalChunks] = useState(1);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDisclaimerAccepted, setChatDisclaimerAccepted] = useState(false);
  const size = { x: 500, y: 500 }; // Grid size (300x300)
  const pixelSize = 10; // Each pixel is 10x10 in size
  const [liveUsers, setLiveUsers] = useState(0); // Track live users count
  const [username, setUsername] = useState(
    localStorage.getItem("chatUsername") || ""
  );
  const [hasUsername, setHasUsername] = useState(localStorage.getItem("chatUsername") || false);
  const [message, setMessage] = useState('');
  const [unsavedPixels, setUnsavedPixels] = useState([]);
  const loadingPercentage = Math.floor((loadedChunks / totalChunks) * 100);
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const preventDefaultZoom = (event) => {
      if (event.ctrlKey && event.type === "wheel") {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventDefaultZoom, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventDefaultZoom);
    };
  }, []);

  const toggleChat = () => {
    setChatEnabled((prev) => !prev);
  };

  const toggleControls = () => {
    setControlsEnabled((prev) => !prev);
  };

  const applyChangesToCanvas = useCallback((changes) => {
    setPixels((prevPixels) => {
      const updatedPixels = [...prevPixels];

      changes.forEach((change) => {
        const pixelIndex = updatedPixels.findIndex(
          (p) => p.x === change.x && p.y === change.y
        );
        if (pixelIndex !== -1) {
          // Update existing pixel with new color
          updatedPixels[pixelIndex] = {
            ...updatedPixels[pixelIndex],
            color: change.color,
          };
        } else {
          // Add new pixel if not already in the canvas
          updatedPixels.push({ x: change.x, y: change.y, color: change.color });
        }
      });

      return updatedPixels;
    });

    // Clear unsaved pixels after applying changes
    setUnsavedPixels((prevUnsavedPixels) =>
      prevUnsavedPixels.filter(
        (unsavedPixel) =>
          !changes.some(
            (change) =>
              change.x === unsavedPixel.x && change.y === unsavedPixel.y
          )
      )
    );
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]); // Runs whenever chatMessages is updated

  const handleCanvasChunk = (chunk) => {
    setPixels((prevPixels) => [...prevPixels, ...chunk.pixels]);
  };

  useEffect(() => {

    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Generate a new unique ID for the user
      storedUserId = uuidv4();
      localStorage.setItem('userId', storedUserId);
    }

    const socket = io("localhost", {
      path: "/socket.io", // Match the server path
      query: { userId: storedUserId },
    });
    socketRef.current = socket; // Store socket reference

    // Handle incoming chat messages
    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Handle user count updates
    socket.on("userCount", (count) => {
      setLiveUsers(count);
    });

    // Handle chat error messages
    socket.on("chatError", (error) => {
      alert(error);
    });

    socket.on("canvasMetadata", (data) => {
      setTotalChunks(data.totalChunks); // Set the total number of chunks expected
    });

    socket.on("canvasData", (chunkData) => {
      handleCanvasChunk(chunkData); // Load each canvas chunk
      setLoadedChunks((prev) => prev + 1); // Update loaded chunks count

      if (chunkData.chunkIndex === totalChunks - 1) {
        setLoading(false); // Hide loading indicator when all chunks are loaded
      }
    });

    socket.on("pixelUpdate", (updatedPixels) => {
      applyChangesToCanvas(updatedPixels); // Use memoized function
    });

    // Listen for connection and disconnection events
    socket.on('connect', () => {
      setIsDisconnected(false);  // Reset state on successful connection
    });

    socket.on('disconnect', () => {
      setIsDisconnected(true);  // Show overlay when disconnected
    });

    socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    return () => socket.disconnect(); // Cleanup on component unmount
  }, [applyChangesToCanvas, totalChunks]); // Add applyChangesToCanvas to dependency array

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socketRef.current.emit("chatMessage", {
        username,
        message,
      });
      setMessage(""); // Clear the input
    }
  };

  const handleUsernameChange = (e) => {
    e.preventDefault();
    localStorage.setItem("chatUsername", username);
    setHasUsername(true)
  };

  const getVisiblePixels = useCallback(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate the visible area on the grid
    const startX = Math.max(Math.floor(-offset.x / (pixelSize * scale)), 0);
    const startY = Math.max(Math.floor(-offset.y / (pixelSize * scale)), 0);
    const endX = Math.min(
      Math.ceil((rect.width - offset.x) / (pixelSize * scale)),
      size.x
    );
    const endY = Math.min(
      Math.ceil((rect.height - offset.y) / (pixelSize * scale)),
      size.y
    );

    // Filter only the pixels that are within the visible area
    const visiblePixels = pixels.filter(
      (pixel) =>
        pixel.x >= startX &&
        pixel.x < endX &&
        pixel.y >= startY &&
        pixel.y < endY
    );

    return visiblePixels;
  }, [offset, scale, size.x, size.y, pixels]);

  // Memoized function to draw the grid and pixels
  const drawGrid = useCallback(
    (context) => {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Apply translation (panning) and scaling (zoom)
      context.save();
      context.translate(offset.x, offset.y);
      context.scale(scale, scale);

      // Get the visible pixels based on the current viewport
      const visiblePixels = getVisiblePixels();

      // Draw the visible pixels
      visiblePixels.forEach((pixel) => {
        context.fillStyle = pixel.color;
        context.fillRect(
          pixel.x * pixelSize,
          pixel.y * pixelSize,
          pixelSize,
          pixelSize
        );
      });

      // Optionally, draw the grid lines if gridEnabled
      if (gridEnabled) {
        context.strokeStyle = "#333";
        context.lineWidth = 0.2;

        // Draw vertical grid lines
        for (let x = 0; x <= size.x; x++) {
          context.beginPath();
          context.moveTo(x * pixelSize, 0);
          context.lineTo(x * pixelSize, size.y * pixelSize);
          context.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= size.y; y++) {
          context.beginPath();
          context.moveTo(0, y * pixelSize);
          context.lineTo(size.x * pixelSize, y * pixelSize);
          context.stroke();
        }
      }

      context.restore();
    },
    [getVisiblePixels, gridEnabled, size.x, size.y, offset, scale]
  );

  // Track the hovered pixel
  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      (event.clientX - rect.left - offset.x) / (pixelSize * scale)
    );
    const y = Math.floor(
      (event.clientY - rect.top - offset.y) / (pixelSize * scale)
    );

    setHoveredPixel({ x: x + 1, y: y + 1 });

    // Handle click and drag for move tool
    if (activeTool === "move" && isDrawing) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      setOffset({ x: offset.x + deltaX, y: offset.y + deltaY });
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }

    // Handle click and drag for brush tool
    if (isDrawing && activeTool === "paint") {
      drawPixel(x, y, currentColor);
      // Emit the pixel change immediately during drawing
      socketRef.current.emit("pixelUpdate", [{ x, y, color: currentColor }]);
    }
  };

  // Handle mouse click to start drawing or start moving
  const handleMouseDown = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      (event.clientX - rect.left - offset.x) / (pixelSize * scale)
    );
    const y = Math.floor(
      (event.clientY - rect.top - offset.y) / (pixelSize * scale)
    );

    if (activeTool === "eyedropper") {
      const pixel = pixels.find((p) => p.x === x && p.y === y);
      const color = pixel ? pixel.color : "#FFFFFF";
      setCurrentColor(color); // Set the current color to the clicked pixel's color
    } else if (activeTool === "paint") {
      setIsDrawing(true);
      drawPixel(x, y, currentColor); // Draw the pixel immediately on mouse down
    } else if (activeTool === "move") {
      setIsDrawing(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  // Debounce pixel updates for bulk sending every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (unsavedPixels.length > 0) {
        socketRef.current.emit("pixelUpdate", unsavedPixels); // Send all unsaved pixels in one go
        setUnsavedPixels([]); // Clear the queue after sending
      }
    }, 2000); // Send updates every 2 seconds to reduce server load

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
  // Function to update the pixel in the pixels array
  const drawPixel = (x, y, color) => {
    if (x < 0 || x >= size.x || y < 0 || y >= size.y) return; // Skip if out of bounds
    // Collect unsaved changes
    setUnsavedPixels((prev) => {
      const existingPixelIndex = prev.findIndex((p) => p.x === x && p.y === y);

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
    const existingPixelIndex = updatedPixels.findIndex(
      (p) => p.x === x && p.y === y
    );

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
    localStorage.setItem("termsAndConditionsAgreed", true);
  };

  const handleChatAcknowledge = () => {
    setChatDisclaimerAccepted(true);
    localStorage.setItem("chatDisclaimerAccepted", true);
  };

  useEffect(() => {
    const agreed = localStorage.getItem("termsAndConditionsAgreed");
    setTermsAndConditionsAgreed(agreed === "true");

    const chatAccepted = localStorage.getItem("chatDisclaimerAccepted");
    setChatDisclaimerAccepted(chatAccepted === "true");
  }, []);

  // Draw the canvas when mounted and whenever pixels, gridEnabled, offset, or scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Make canvas fill the screen
    canvas.width = window.innerWidth; // Full width of the window
    canvas.height = window.innerHeight; // Full height of the window

    drawGrid(context);
  }, [pixels, gridEnabled, drawGrid, offset, scale]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {" "}
      {/* Disable overflow */}
      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        gridEnabled={gridEnabled}
        setGridEnabled={setGridEnabled}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        toggleChat={toggleChat}
        toggleControls={toggleControls}
        chatEnabled={chatEnabled}
        controlsEnabled={controlsEnabled}
        loading={loading}
      />
      {/* Terms Modal */}
      {termsAndConditionsAgreed === false && (
        <TermsModal onAgree={handleAgree} />
      )}
      {/* Chat Box */}
      {chatEnabled && hasUsername && chatDisclaimerAccepted && (
        <div className="fixed top-0 right-0 bg-white w-80 max-h-[50vh] border border-gray-200 p-3 rounded-xl z-[1001] drop-shadow-xl m-5 h-auto">
          <div className="flex items-center gap-2 mb-2">
            <img className="w-14 h-14" alt='ChaosCanvas AI Generated Logo' src={'logo512.png'} />
            <h1 className="font-inter font-semibold text-xl">
              ChaosCanvas<br />
              <span className="text-1xl font-light">
                Live Chat
              </span>
            </h1>
          </div>

          {/* Chat messages */}
          <div ref={chatContainerRef} className="flex flex-col justify-start h-auto overflow-y-auto mb-3 max-h-[30vh]"> 
            {chatMessages.map((msg, index) => (
              <div key={index} className="mt-2">
                <h1 className="font-inter text-sm font-semibold">{msg.username}</h1>
                <p className="font-inter text-sm">{msg.newMsg}</p>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form className="flex items-center" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-4 py-2 w-full transition bg-gray-50 text-zinc-900 rounded-xl hover:bg-gray-200"
            />
            <button type='submit' className="ml-2 p-2 transition text-blue-600 hover:text-blue-500">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      )}
      {/* Username Modal */}
      {chatDisclaimerAccepted && chatEnabled && !hasUsername && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[900]">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl font-inter">
              <h2 className="text-xl font-bold mb-4">Important Notice</h2>
              <p className="text-sm">
                Please enter a username to use for the chat feature:
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-2 w-full transition bg-gray-50 text-zinc-900 rounded-xl hover:bg-gray-200"
              />
              <div className="mt-6">
                <button
                  onClick={handleUsernameChange}
                  className="px-4 py-2 w-full transition bg-green-600 text-white rounded-xl hover:bg-green-500"
                >
                  Join Chat
                </button>
              </div>
            </div>
          </div>
      )}
      {controlsEnabled && (
        <div className="bg-white rounded-xl border border-gray-200 drop-shadow-xl fixed bottom-0 left-0 p-3 m-5 flex flex-col gap-2 items-start z-[10000]">
          <div className="flex items-center gap-2 font-inter text-sm text-gray-500">
            <FontAwesomeIcon
              icon={faUpDownLeftRight}
              className="text-gray-500 text-xs"
            />
            <h1>Move Tool</h1>
          </div>
          <div className="flex items-center gap-1 font-inter text-gray-500 text-xs">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-500 text-xs"
            />
            Zoom
            <FontAwesomeIcon icon={faArrowRight} className="mx-2" />
            <span className="bg-gray-300 rounded-lg border border-gray-400 py-1 px-2">
              Ctrl
            </span>
            <span className="mx-1">+</span>
            Scroll
          </div>
          <div className="flex items-center gap-1 font-inter text-gray-500 text-xs">
            <FontAwesomeIcon
              icon={faArrowsLeftRight}
              className="text-gray-500 text-xs"
            />
            Pan
            <FontAwesomeIcon icon={faArrowRight} className="mx-2" />
            {"("}
            <span className="bg-gray-300 rounded-lg border border-gray-400 py-1 px-2">
              Mouse Click
            </span>
            OR
            <span className="bg-gray-300 rounded-lg border border-gray-400 py-1 px-2">
              Middle Mouse Button
            </span>
            {")"}
            <span className="mx-1">AND</span>
            Move Mouse
          </div>
        </div>
      )}
      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center text-white z-50">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <img
              alt="ChaosCanvas AI generated logo"
              src={"logo512.png"}
              className="w-40 h-40"
            />
            <div className="flex flex-col font-inter">
              <h1 className="text-4xl font-regular">ChaosCanvas</h1>
              <h1 className="text-3xl font-light">
                Canvas Loading... {loadingPercentage}%
              </h1>{" "}
              {/* Show loading percentage */}
            </div>
          </div>
        </div>
      )}
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`absolute inset-0 ${
          activeTool === "move" ? "cursor-move" : "cursor-crosshair"
        }`}
        style={{ margin: "auto" }} // Center it if needed, otherwise it takes full screen
      />
      {/* Terms Modal */}
      {chatEnabled && !chatDisclaimerAccepted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl font-inter">
            <h2 className="text-xl font-bold mb-4">Chat Agreement</h2>
            <p className="text-sm">
              By utilising the chat feature, you agree to the following terms:
            </p>
            <p className="mt-2 text-sm">
                By using the chat feature on ChaosCanvas, you agree to abide by the following rules to maintain a safe and positive environment for all users:
                <ul className="list-disc ml-4">
                    <li><strong>No Illegal Activities:</strong> The chat must not be used for any illegal purposes, including but not limited to promoting, facilitating, or engaging in illegal activities.</li>
                    <li><strong>No Promotions or Sales:</strong> The chat is intended for communication between artists and must not be used for promotions, advertising, selling products or services, or any commercial activities.</li>
                    <li><strong>No Harassment or NSFW Content:</strong> Messages must not contain harassment, hate speech, or any inappropriate content, including unwanted or unsolicited NSFW (Not Safe For Work) material.</li>
                    <li><strong>No DDoS, Doxing, or Hacking:</strong> The chat cannot be used to engage in, promote, or discuss activities related to Distributed Denial of Service (DDoS) attacks, doxing, or any form of hacking.</li>
                    <li><strong>No Links to External Sites:</strong> Do not post links to external websites in the chat.</li>
                    <li><strong>Respectful Communication:</strong> All messages must be respectful and constructive. Harmful language, spamming, and trolling are strictly prohibited.</li>
                </ul>
                Violation of any of these rules may result in a permanent ban from the chat or the website entirely. Due to the lack of real-time moderation, bans are likely permanent.
            </p>
            <p className="text-sm mt-2">
              For more details, please refer to our <a href={'/terms'} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="text-blue-500">Terms, Conditions, and Privacy Policy</a>.
            </p>
            <div className="mt-6 grid md:grid-cols-2 gap-2">
              <button
                onClick={handleChatAcknowledge}
                className="px-4 py-2 w-full transition bg-green-600 text-white rounded-xl hover:bg-green-500"
              >
                I Agree
              </button>
              <button
                onClick={() => setChatEnabled(false)}
                className="px-4 py-2 w-full transition bg-red-600 text-white rounded-xl hover:bg-red-500"
              >
                Close Chat
              </button>
            </div>
          </div>
        </div>
      )}
      {isDisconnected && (
        <div className="w-full fixed top-0 left-0 flex items-center justify-center p-5">
          <div className="gap-2 max-w-xl bg-white rounded-xl drop-shadow-xl border-[.5px] border-red-300 flex items-center text-red-500 text-center p-2 z-50 font-inter text-lg">
            <FontAwesomeIcon icon={faWifi} />
            Connection Lost, attempting to reconnect...
          </div>
        </div>
      )}
      {/* Live Users Counter */}
      <div className="fixed bottom-16 right-8 bg-gray-800 text-white p-2 rounded-lg text-sm">
        Live Users: {liveUsers}
      </div>
      {/* Overlay showing the hovered pixel coordinates and color */}
      {hoveredPixel.x !== null &&
        hoveredPixel.x >= 0 &&
        hoveredPixel.x <= size.x &&
        hoveredPixel.y !== null &&
        hoveredPixel.y >= 0 &&
        hoveredPixel.y <= size.y && (
          <div className="fixed bottom-2 right-2 bg-gray-800 text-white p-2 rounded-lg text-sm">
            Hovered Pixel: X: {hoveredPixel.x}, Y: {hoveredPixel.y}
          </div>
        )}
    </div>
  );
};

export default IndexPage;
