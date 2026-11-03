# Voice to Reel

**Version 1.1**

Turn an audio clip into a vertical, Instagram-ready reel with an animated visual. Upload your singing, pick a look, and download a video. No recording yourself, no sign-up, no server.

Everything runs in the browser. Your audio and videos never leave your device.

## Features

- Upload an audio file (MP3, WAV, M4A, AAC and more), or a video file such as MP4 to use its audio
- The clip length defaults to the full audio, up to the 90-second reel limit, and you can trim the start and length
- 8 animation styles: Bars, Circle, Wave, Dots, Rings, Mountain, Vinyl and an Instagram-style music sticker card
- 12 color themes, including a pure Black option
- 13 font styles for the title and handle
- Optional background photo
- Audio settings: volume boost, bass boost, fade in, fade out and loudness boost
- Preview with a stop button before creating the reel
- Result pop-up with the video, format, length, size and a download button
- Reset button to clear everything and start over
- Responsive layout with light and dark page backgrounds

## Changelog

### 1.1

**New**
- Audio settings section:
  - Volume boost from 25% to 300%
  - Bass boost up to 12 dB
  - Fade in and fade out up to 5 seconds each
  - Loudness boost, which evens out quiet and loud parts
  - A limiter is always on to reduce distortion at high volume
- The clip length now defaults to the full length of the uploaded audio (up to 90 seconds) instead of 30 seconds
- The length adjusts automatically if the start time is moved past the point where the clip would run out

**Fixes**
- iOS: the audio picker now accepts MP3, MP4 and other common audio and video files. Previously they could appear greyed out in the iOS Files picker
- iOS: audio decoding now works on older iOS versions that use the callback form of `decodeAudioData`
- Color swatches no longer show a faint squarish inner edge when unselected. The selected swatch now uses a clean ring

**Docs**
- Corrected the feature counts in this README (animations, colors and fonts)

### 1.0

- First release
- 8 animation styles, color themes, font styles and an optional background photo
- Preview and Create reel, with a stop option while previewing
- Result pop-up with the video on the left and details and download on the right
- Reset button
- Modern responsive interface with a gradient background

## How it works

1. The audio file is decoded with the Web Audio API.
2. An analyser reads the frequency data of the original audio while it plays, so the animation does not change size when you change the volume.
3. The audio also passes through the audio settings chain: gain with fades, optional bass boost, optional loudness compressor and a limiter.
4. The animation is drawn frame by frame on a 540 x 960 (9:16) `<canvas>`.
5. `canvas.captureStream()` and `MediaRecorder` record the canvas together with the processed audio into a video file.

The audio goes straight into the video. It does not use the microphone or system audio, so nothing else playing on the device ends up in the reel.

## Project structure

```
.
├── index.html   # Page structure and result pop-up
├── style.css    # All styling
├── script.js    # Animations, fonts, themes, audio settings, preview and recording
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

1. Upload your audio file. The full clip is selected by default.
2. Enter a song title and your handle. Change the start time and length if you want to trim the clip.
3. Adjust the audio settings if needed.
4. Choose an animation, a color theme and a font. Add a background photo if you like.
5. Press **Preview** to check the look and sound. Press **Stop preview** to end it early. Audio settings apply the next time you press Preview or Create reel.
6. Press **Create reel**. The video is recorded in real time, so a 30-second reel takes 30 seconds. Keep the tab open and the screen awake. You will not hear the audio while it records.
7. When the pop-up appears, press **Download video**.

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
- `buildChain()`: the audio settings chain. Add or change audio effects here.

## Contributing

Issues and pull requests are welcome. If you report a bug, please include your browser, version and device.

## License

Add a license of your choice here, for example MIT.