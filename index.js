const { execFile } = require('child_process');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// Configuration (uses environment variables from .env file)
const CONFIG = {
  inputFiles: (process.env.INPUT_FILE || './input.mp4').split(',').map(f => f.trim()), // Multiple video files (comma-separated), or single file
  rtmpUrl: process.env.RTMP_URL || 'rtmp://localhost:1935/live', // RTMP server URL
  streamKey: process.env.STREAM_KEY || 'stream', // Stream key for authentication
  resolution: '1920x1080', // 1080p resolution
  bitrate: '5000k', // Video bitrate
  audiobitrate: '128k', // Audio bitrate
  fps: parseInt(process.env.FPS) || 30, // Frames per second (30 or 60)
  loopPlaylist: true, // Loop the entire playlist (true/false)
};

// Construct full RTMP URL with stream key
const FULL_RTMP_URL = `${CONFIG.rtmpUrl}/${CONFIG.streamKey}`;

// Playlist state
let currentVideoIndex = 0;
let ffmpegProcess = null;

/**
 * Start a live stream from a video file
 * @param {Object} config - Configuration object
 * @param {string} inputFile - The video file to stream
 * @param {number} fileIndex - Index in the playlist
 */
function streamVideo(config, inputFile, fileIndex) {
  // FFmpeg command arguments for streaming at 1080p
  const ffmpegArgs = [
    '-re', // Read input at native frame rate (important for live streaming)
    '-i', inputFile, // Input file
    '-c:v', 'libx264', // Video codec (H.264)
    '-preset', 'medium', // Encoding preset (faster = lower quality but less CPU)
    '-s', config.resolution, // Resolution (1920x1080 for 1080p)
    '-b:v', config.bitrate, // Video bitrate
    '-maxrate', config.bitrate, // Maximum bitrate
    '-bufsize', '5000k', // Buffer size
    '-r', config.fps, // Frame rate
    '-c:a', 'aac', // Audio codec
    '-b:a', config.audiobitrate, // Audio bitrate
    '-ac', '2', // Audio channels (stereo)
    '-f', 'flv', // Output format (FLV for RTMP)
    FULL_RTMP_URL // Output URL with stream key
  ];

  console.log(`\n[${new Date().toLocaleTimeString()}] Playing video ${fileIndex + 1}/${config.inputFiles.length}: ${inputFile}`);
  console.log('---');

  // Execute FFmpeg
  ffmpegProcess = execFile('ffmpeg', ffmpegArgs, (error, stdout, stderr) => {
    if (error && error.message !== 'Killed') {
      console.error('FFmpeg error:', error.message);
    }
    // Video ended, play next one
    playNextVideo(config);
  });

  // Log FFmpeg stderr (contains progress information)
  ffmpegProcess.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  // Handle process exit
  ffmpegProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`FFmpeg process exited with code ${code}`);
    }
  });
}

/**
 * Play the next video in the playlist
 * @param {Object} config - Configuration object
 */
function playNextVideo(config) {
  currentVideoIndex++;
  
  // Check if we should loop
  if (currentVideoIndex >= config.inputFiles.length) {
    if (config.loopPlaylist) {
      console.log('\nPlaylist ended. Looping from the beginning...');
      currentVideoIndex = 0;
    } else {
      console.log('\nPlaylist ended. Stopping stream.');
      process.exit(0);
    }
  }
  
  const nextFile = config.inputFiles[currentVideoIndex];
  streamVideo(config, nextFile, currentVideoIndex);
}

/**
 * Start the live stream with multiple videos
 * @param {Object} config - Configuration object
 */
function startLiveStream(config) {
  console.log('Starting live stream with playlist...');
  console.log(`Videos: ${config.inputFiles.join(', ')}`);
  console.log(`Output: ${FULL_RTMP_URL}`);
  console.log(`Stream Key: ${config.streamKey}`);
  console.log(`Resolution: ${config.resolution} (1080p)`);
  console.log(`Video Bitrate: ${config.bitrate}`);
  console.log(`Frame Rate: ${config.fps}fps`);
  console.log(`Loop Playlist: ${config.loopPlaylist}`);
  console.log('---');

  // Start with the first video
  streamVideo(config, config.inputFiles[0], 0);
}

// Alternative: Using fluent-ffmpeg (uncomment if you have the package installed)
// const ffmpeg = require('fluent-ffmpeg');
//
// function startLiveStreamFluent(config) {
//   ffmpeg(config.inputFile)
//     .inputOptions('-re')
//     .outputOptions([
//       '-c:v libx264',
//       '-preset medium',
//       `-s ${config.resolution}`,
//       `-b:v ${config.bitrate}`,
//       `-maxrate ${config.bitrate}`,
//       '-bufsize 5000k',
//       `-r ${config.fps}`,
//       '-c:a aac',
//       `-b:a ${config.audiobitrate}`,
//       '-ac 2',
//       '-f flv',
//     ])
//     .output(config.rtmpUrl)
//     .on('error', (err) => console.error('Error:', err))
//     .on('end', () => console.log('Stream ended'))
//     .run();
// }

// Start the stream
startLiveStream(CONFIG);
