import { faBorderAll, faPaintBrush, faUpDownLeftRight, faEyeDropper } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const tools = [
  {
    name: 'move',
    icon: <FontAwesomeIcon icon={faUpDownLeftRight} />
  },
  {
    name: 'paint',
    icon: <FontAwesomeIcon icon={faPaintBrush} />
  },
  {
    name: 'eyedropper',
    icon: <FontAwesomeIcon icon={faEyeDropper} />
  },
];

const Toolbar = ({ activeTool, setActiveTool, gridEnabled, setGridEnabled, currentColor, setCurrentColor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className='z-50 fixed top-0 left-0 p-2 m-5 bg-white border border-gray-200 rounded-xl flex flex-col gap-3 drop-shadow-2xl'>
      <img alt='ChaosCanvas AI generated logo' src={'logo512.png'} className='rounded-lg w-10 h-10' />
      
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => setActiveTool(tool.name)}
          className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${activeTool === tool.name ? 'bg-gray-200' : 'bg-transparent'} hover:bg-gray-200`}
        >
          {tool.icon}
        </button>
      ))}
      
      {/* Grid toggle button */}
      <button
        onClick={() => setGridEnabled((c) => !c)}
        className={`cursor-pointer p-3 aspect-square w-10 h-10 flex items-center justify-center rounded-lg transition ${gridEnabled ? 'bg-gray-200' : 'bg-transparent'}`}
      >
        <FontAwesomeIcon icon={faBorderAll} />
      </button>

      {/* Color Picker Button (solid color) */}
      <button
        className={`cursor-pointer p-3 aspect-square w-10 h-10 rounded-lg transition border border-gray-200`}
        style={{ backgroundColor: currentColor }}
        onClick={() => setShowColorPicker(!showColorPicker)}
      />

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
