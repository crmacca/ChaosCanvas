const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration
const gridWidth = 300;  // Set this to match the grid width
const gridHeight = 300; // Set this to match the grid height
const totalPixels = gridWidth * gridHeight;
const chunkSize = 100;  // Number of pixels to update per chunk

// Generate a random hex color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to fill every pixel with a random color
async function fillGridWithRandomColors() {
  const allPixelData = [];
  
  // Generate all pixel data
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      allPixelData.push({
        x,
        y,
        color: getRandomColor(),
        ipAddress: 'benchmark'  // Optionally, set an IP for tracking
      });
    }
  }

  // Process each pixel chunk synchronously
  for (let i = 0; i < allPixelData.length; i += chunkSize) {
    const chunk = allPixelData.slice(i, i + chunkSize);

    for (let j = 0; j < chunk.length; j++) {
      const pixel = chunk[j];
      // Perform upsert operation for each pixel
      await prisma.pixel.upsert({
        where: {
          x_y: { x: pixel.x, y: pixel.y },  // Assuming `x_y` is a unique constraint
        },
        update: {
          color: pixel.color,
          ipAddress: pixel.ipAddress,
        },
        create: {
          x: pixel.x,
          y: pixel.y,
          color: pixel.color,
          ipAddress: pixel.ipAddress,
        },
      });
    }

    // Update progress in the console
    const progress = Math.min(((i + chunk.length) / totalPixels) * 100, 100).toFixed(2);
    console.log(`Progress: ${progress}% - Processed ${i + chunk.length}/${totalPixels} pixels.`);
  }

  console.log(`Successfully filled ${gridWidth}x${gridHeight} grid with random colors.`);
}

// Run the function
fillGridWithRandomColors()
  .catch((error) => {
    console.error('Error filling grid:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();  // Close the database connection when done
  });
