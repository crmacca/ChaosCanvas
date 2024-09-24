import { faBorderAll, faPaintBrush, faUpDownLeftRight, faEyeDropper, faKeyboard, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const tools = [
  {
    name: 'move',
    tooltip: 'Move & Zoom',
    icon: <FontAwesomeIcon icon={faUpDownLeftRight} />
  },
  {
    name: 'paint',
    tooltip: 'Paint Brush',
    icon: <FontAwesomeIcon icon={faPaintBrush} />
  },
  {
    name: 'eyedropper',
    tooltip: 'Colour Picker',
    icon: <FontAwesomeIcon icon={faEyeDropper} />
  },
];

const Toolbar = ({ activeTool, setActiveTool, gridEnabled, setGridEnabled, currentColor, setCurrentColor, loading, toggleControls, controlsEnabled, toggleChat, chatEnabled }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hoveredTool, setHoveredTool] = useState(null); // State to track the hovered tool

  return (
    <div className='z-50 fixed top-0 left-0 p-2 m-5 bg-white border border-gray-200 rounded-xl flex flex-col gap-3 drop-shadow-2xl'>
      <img alt='ChaosCanvas AI generated logo' src={'logo512.png'} className='rounded-lg w-10 h-10' />
      
      {tools.map((tool) => (
        <div key={tool.name} className="relative">
          <button
            disabled={loading}
            onClick={() => setActiveTool(tool.name)}
            onMouseEnter={() => setHoveredTool(tool.name)} // Show tooltip on hover
            onMouseLeave={() => setHoveredTool(null)} // Hide tooltip when not hovering
            className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${activeTool === tool.name ? 'bg-gray-200' : 'bg-transparent'} hover:bg-gray-200`}
          >
            {tool.icon}
          </button>

          {/* Tooltip */}
          {hoveredTool === tool.name && (
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-white text-black text-xs rounded-lg p-2 font-inter shadow-lg">
              {tool.tooltip}
            </div>
          )}
        </div>
      ))}
      
      {/* Grid toggle button */}
      <div className="relative">
        <button
          disabled={loading}
          onClick={() => setGridEnabled((c) => !c)}
          onMouseEnter={() => setHoveredTool('grid')}
          onMouseLeave={() => setHoveredTool(null)}
          className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${gridEnabled ? 'bg-gray-200' : 'bg-transparent'} hover:bg-gray-200`}
        >
          <FontAwesomeIcon icon={faBorderAll} />
        </button>
        {hoveredTool === 'grid' && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-white text-black text-xs rounded-lg p-2 font-inter shadow-lg">
            Toggle Grid
          </div>
        )}
      </div>

      <div className="relative">
        <button
          disabled={loading}
          onClick={() => toggleControls()}
          onMouseEnter={() => setHoveredTool('controls')}
          onMouseLeave={() => setHoveredTool(null)}
          className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${controlsEnabled ? 'bg-gray-200' : 'bg-transparent'} hover:bg-gray-200`}
        >
          <FontAwesomeIcon icon={faKeyboard} />
        </button>
        {hoveredTool === 'controls' && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-white text-black text-xs rounded-lg p-2 font-inter shadow-lg">
            Toggle Controls
          </div>
        )}
      </div>

      <div className="relative">
        <button
          disabled={loading}
          onClick={() => toggleChat()}
          onMouseEnter={() => setHoveredTool('chat')}
          onMouseLeave={() => setHoveredTool(null)}
          className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${chatEnabled ? 'bg-gray-200' : 'bg-transparent'} hover:bg-gray-200`}
        >
          <FontAwesomeIcon icon={faComments} />
        </button>
        {hoveredTool === 'chat' && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-white text-black text-xs rounded-lg p-2 font-inter shadow-lg">
            Toggle Chat
          </div>
        )}
      </div>

      {/* Color Picker Button (solid color) */}
      <div className="relative">
        <button
          disabled={loading}
          className={`cursor-pointer p-3 aspect-square w-10 h-10 rounded-lg transition border border-gray-200`}
          style={{ backgroundColor: currentColor }}
          onClick={() => setShowColorPicker(!showColorPicker)}
          onMouseEnter={() => setHoveredTool('color')}
          onMouseLeave={() => setHoveredTool(null)}
        />
        {hoveredTool === 'color' && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-white text-black text-xs rounded-lg p-2 font-inter shadow-lg">
            Colour Selector
          </div>
        )}
      </div>

      {/* Show Color Picker when button is clicked */}
      {showColorPicker && (
        <div className="absolute top-20 left-2">
          <HexColorPicker
            color={currentColor}
            onChange={(newColor) => setCurrentColor(newColor)}
          />
        </div>
      )}
    </div>
  );
};

export default Toolbar;
