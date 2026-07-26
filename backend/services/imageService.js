function generateImageUrl(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  // Pollinations.ai free image generation endpoint, no API key needed
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true`;
  return url;
}

module.exports = { generateImageUrl };