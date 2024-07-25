const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { usersPath } = require("../managers/fileManager");
const { generateRandomID } = require("../helpers/appHelper");

async function generateDefaultProfilePicture(name, userId, size = 200) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = getRandomColor();
  ctx.fillRect(0, 0, size, size);

  // Text
  const initial = name.charAt(0).toUpperCase();
  ctx.font = `bold ${size / 2}px Arial`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, size / 2, size / 2);

  // Convert to buffer
  const buffer = canvas.toBuffer('image/png');

  // Generate a unique filename
  const id = generateRandomID()
  const filename = `${id}_profile.png`;
  const filepath = path.join(usersPath, filename);

  // Ensure the directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  // Save the file
  await fs.writeFile(filepath, buffer);

  return filename;
}

function getRandomColor() {
  const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { generateDefaultProfilePicture };