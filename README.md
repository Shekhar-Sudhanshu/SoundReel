# Voice to Reel

Turn an audio clip into a vertical, Instagram-ready reel with an animated visual. Upload your singing, pick a look, and download a video. No recording yourself, no sign-up, no server.

Everything runs in the browser. Your audio and videos never leave your device.

## Features

- Upload an audio file (MP3, WAV, M4A and other formats your browser can decode)
- Pick the start point and length of the clip (up to 90 seconds)
- 9 animation styles: Bars, Circle, Wave, Dots, Rings, Mountain, Vinyl and an Instagram-style music sticker card
- 11 color themes, including a pure Black option
- 14 font styles for the title and handle
- Optional background photo
- Preview with a stop button before creating the reel
- Result pop-up with the video, format, length, size and a download button
- Reset button to clear everything and start over
- Responsive layout with light and dark page backgrounds

## How it works

1. The audio file is decoded with the Web Audio API.
2. An analyser reads the frequency data of the audio while it plays.
3. The animation is drawn frame by frame on a 540 x 960 (9:16) `<canvas>`.
4. `canvas.captureStream()` and `MediaRecorder` record the canvas together with the decoded audio into a video file.

The audio goes straight into the video. It does not use the microphone or system audio, so nothing else playing on the device ends up in the reel.

## Project structure

```
.
├── index.html   # Page structure and result pop-up
├── style.css    # All styling
├── script.js    # Animations, fonts, themes, preview and recording
└── README.md
```

There are no dependencies, no build step and no package manager. The only external resource is Google Fonts, loaded from `index.html`.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

It is a static site, so any static host works.

**GitHub Pages**
1. Push these files to the root of a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

**Netlify, Cloudflare Pages or Vercel**: connect the repository or drag in the folder. No build command is needed, and the publish directory is the project root.

Serve it over HTTPS (all of the hosts above do this automatically). Browsers can restrict recording features on plain HTTP.

## Usage

1. Upload your audio file.
2. Enter a song title and your handle, and choose the start time and length.
3. Choose an animation, a color theme and a font. Add a background photo if you like.
4. Press **Preview** to check the look. Press **Stop preview** to end it early.
5. Press **Create reel**. The video is recorded in real time, so a 30-second reel takes 30 seconds. Keep the tab open and the screen awake. You will not hear the audio while it records.
6. When the pop-up appears, press **Download video**.

## Browser support and limitations

- Works best in **Chrome on desktop**, which can usually export MP4.
- Some browsers export **WebM** instead. If your video is WebM, convert it to MP4 with any free converter before posting to Instagram.
- Recording on phones is less reliable. Recent Chrome for Android should work, and iOS support depends on the version. Make a short test reel first.
- Recording happens in real time and stops or goes silent if the tab is closed, the screen locks or the browser throttles the page.
- Reels are limited to 90 seconds in this tool.
- Some drawing features (rounded rectangles, for example) need a reasonably recent browser.

## Customizing

Open `script.js` and look for these arrays and functions:

- `THEMES`: add a color theme with a name and four colors (`a` and `b` for the background gradient, `c` for the main accent, `d` for the secondary accent).
- `FONTS`: add a font with a name, the Google Fonts family name `f`, a weight `w` and a size multiplier `s`. Also add the family to the Google Fonts link in `index.html`.
- `frame()`: add a new animation style as another `else if (style === '...')` branch, and add a matching button with a `data-v` value in `index.html`.

## Contributing

Issues and pull requests are welcome. If you report a bug, please include your browser, version and device.

## License

Add a license of your choice here, for example MIT.