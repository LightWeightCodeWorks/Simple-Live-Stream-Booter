# Simple-Live-Stream-Booter
Live stream a local file, or two, with RTMP, and nodejs!
A Node.js application for streaming multiple videos to RTMP servers in 1080p with configurable frame rates.

## Features

- **Multiple Video Support**: Stream a playlist of videos sequentially
- **1080p Resolution**: Default streaming at 1920x1080 resolution
- **Configurable Frame Rates**: Support for both 30fps and 60fps
- **RTMP Streaming**: Stream to any RTMP server (Twitch, YouTube, custom RTMP servers, etc.)
- **Looping Playlist**: Automatically loop through videos or stop when playlist ends
- **Environment Configuration**: Easy setup via `.env` file

## Prerequisites

- **Node.js** 14.0.0 or higher
- **FFmpeg** installed and available in system PATH

## Installation

1. Clone or download the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
INPUT_FILE=./video1.mp4,./video2.mp4
RTMP_URL=rtmp://localhost:1935/live
STREAM_KEY=stream
FPS=30
```

## Configuration

Configure your stream using environment variables in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `INPUT_FILE` | Comma-separated list of video files to stream | `./input.mp4` |
| `RTMP_URL` | RTMP server URL | `rtmp://localhost:1935/live` |
| `STREAM_KEY` | Stream authentication key | `stream` |
| `FPS` | Frame rate (30 or 60) | `30` |

### Other Configuration Options

The following settings can be modified in `index.js`:

- **Resolution**: Currently set to `1920x1080` (1080p)
- **Video Bitrate**: Default `5000k` (kbps)
- **Audio Bitrate**: Default `128k` (kbps)
- **Loop Playlist**: Default `true` (loops automatically)

## Usage

Start the live stream:
```bash
npm start
```

Or run directly:
```bash
node index.js
```

The application will output status information:
```
Starting live stream with playlist...
Videos: ./video1.mp4, ./video2.mp4
Output: rtmp://localhost:1935/live/stream
Stream Key: stream
Resolution: 1920x1080 (1080p)
Video Bitrate: 5000k
Frame Rate: 30fps
Loop Playlist: true
---

[12:34:56 PM] Playing video 1/2: ./video1.mp4
```

## Examples

### Stream to Local RTMP Server
```bash
# .env file
INPUT_FILE=./videos/movie.mp4
RTMP_URL=rtmp://127.0.0.1:1935/live
STREAM_KEY=mystream
FPS=30
```

### Stream Multiple Videos
```bash
# .env file
INPUT_FILE=./intro.mp4,./main.mp4,./outro.mp4
RTMP_URL=rtmp://your-server.com:1935/live
STREAM_KEY=your-key
FPS=60
```

## Troubleshooting

**Connection refused:**
- Verify your RTMP server is running and the URL is correct
- Check firewall settings

**Low stream quality:**
- Increase the bitrate in `index.js` (video bitrate and audio bitrate settings)
- Ensure your internet connection has sufficient upload speed
