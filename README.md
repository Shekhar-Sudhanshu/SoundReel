# Voice to Reel

**Version 3.0**

Turn an audio clip into a vertical, Instagram-ready reel with an animated visual. Upload or record your singing, pick a look, add lyrics, and download a video. No recording yourself on camera, no sign-up, no server.

Everything runs in the browser. Your audio, video and recordings never leave your device.

## Features

- **Record your voice** directly in the page, or upload an audio file (MP3, WAV, M4A, AAC and more), or a video file such as MP4 to use its audio
- The clip length defaults to the full audio, up to the 90-second reel limit, and you can trim the start and length
- **Lyrics on screen** in Karaoke or Captions mode, with 5 lyric styles, 6 lyric animations and 3 positions
- Three ways to time lyrics: spread evenly, type times, or tap to sync
- **Subtitle** line under the song title
- 8 animation styles: Bars, Circle, Wave, Dots, Rings, Mountain, Vinyl and an Instagram-style music sticker card
- 5 background animations: Particles, Music notes, Bokeh, Aurora and Pulse (or None)
- **Background video** with looping, start and end points, and adjustable dimming
- Optional background photo
- 12 preset color themes, plus a custom color creator with four color pickers and a Surprise me button
- 13 font styles for the title, subtitle, handle and lyrics
- Audio settings: volume boost, bass boost, fade in, fade out and loudness boost
- Preview with a stop button before creating the reel
- Result pop-up with the video, format, length, size and a download button
- Reset button to clear everything and start over
- Responsive layout with light and dark page backgrounds

## Changelog

### 3.0

**New**
- Built-in voice recorder:
  - Record, stop and use the recording as your audio, with a live timer and level bar
  - Works on iOS, Android, Windows and Mac. It captures raw microphone audio directly instead of relying on `MediaRecorder`, so there is no recording format to decode
  - Optional background noise reduction. Echo cancellation and automatic gain are off so singing sounds natural
  - Stops automatically at 5 minutes
- Lyric styles: Classic, Boxed, Highlight, Neon and Outline
- Lyric animations: None, Fade, Slide up, Pop, Typewriter and Word by word
- Lyric positions: Top, Middle and Bottom
- Background video:
  - Loops until the audio finishes if it is shorter than the clip
  - Only the part that fits is used if it is longer
  - Start and end points to choose a section of the video
  - Dimming slider so lyrics and animations stay readable
  - The video's own sound is not used

### 2.0

**New**
- Lyrics on screen with Karaoke and Captions modes, and three timing options (spread evenly, type times like `[0:12.5] Your line`, or tap to sync)
- Subtitle field under the song title
- Background animations: Particles, Music notes, Bokeh, Aurora and Pulse
- Custom color creator with live preview and a Surprise me button

**Fixes**
- Choosing None for the background animation now clears the preview instead of leaving the last frame on screen

### 1.1

**New**
- Audio settings: volume boost, bass boost, fade in, fade out and loudness boost, with an always-on limiter
- The clip length now defaults to the full length of the uploaded audio (up to 90 seconds)
- The length adjusts automatically if the start time is moved past the point where the clip would run out

**Fixes**
- iOS: the audio picker now accepts MP3, MP4 and other common audio and video files
- iOS: audio decoding now works on older iOS versions
- Color swatches no longer show a faint squarish inner edge when unselected

### 1.0

- First release
- 8 animation styles, color themes, font styles and an optional background photo
- Preview and Create reel, with a stop option while previewing
- Result pop-up with the video on the left and details and download on the right
- Reset button
- Modern responsive interface with a gradient background

## How it works

1. The audio is either decoded from your file with the Web Audio API, or captured from the microphone as raw samples by the built-in recorder.
2. An analyser reads the frequency data of the original audio while it plays, so the animation does not change size when you change the volume.
3. The audio also passes through the audio settings chain: gain with fades, optional bass boost, optional loudness compressor and a limiter.
4. Each frame is drawn on a 540 x 960 (9:16) `<canvas>` in layers: background gradient, photo or video, background animation, main animation, title and subtitle, then lyrics.
5. A hidden, muted `<video>` element supplies the background video frames. It is kept in sync with the audio and looped as needed.
6. `canvas.captureStream()` and `MediaRecorder` record the canvas together with the processed audio into a video file.

The audio goes straight into the video. Nothing else playing on the device ends up in the reel. The microphone is used only while you press Record voice.

Lyrics are not detected automatically. You type them, and set the timing yourself or with Tap to sync.

## Project structure

```
.
├── index.html   # Page structure and result pop-up
├── style.css    # All styling
├── script.js    # Animations, fonts, themes, lyrics, recorder, video, audio settings, preview and export
└── README.md
```

There are no dependencies, no build step and no package manager. The only external resource is Google Fonts, loaded from `index.html`.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The voice recorder needs a secure context, which includes `localhost`.

## Deploy

It is a static site, so any static host works.

**GitHub Pages**
1. Push these files to the root of a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/` after a minute or two.

**Netlify, Cloudflare Pages or Vercel**: connect the repository or drag in the folder. No build command is needed, and the publish directory is the project root.

Serve it over HTTPS (all of the hosts above do this automatically). Browsers only allow microphone access and can restrict recording features on plain HTTP.

## Usage

1. Upload your audio file, or press **Record voice**, allow microphone access, sing, and press **Stop recording**. The full clip is selected by default.
2. Enter a song title, an optional subtitle and your handle. Change the start time and length if you want to trim the clip.
3. Paste or type your lyrics, one line per row. Choose Karaoke, Captions or Off, then pick a lyric style, animation and position. To time the lyrics, press **Tap to sync lyrics** and tap whenever a new line starts, or type times like `[0:12.5]` at the start of lines. Times are counted from the start of the selected clip.
4. Adjust the audio settings if needed.
5. Choose an animation, a background animation, a color theme and a font. Use the **+** swatch to create your own colors.
6. Add a background photo or a background video. For a video, set the start and end points and the dimming. Choosing a photo replaces a video, and the other way round.
7. Press **Preview** to check the look and sound. Press **Stop preview** to end it early. Audio settings apply the next time you press Preview or Create reel.
8. Press **Create reel**. The video is recorded in real time, so a 30-second reel takes 30 seconds. Keep the tab open and the screen awake. You will not hear the audio while it records.
9. When the pop-up appears, press **Download video**.

## Browser support and limitations

- Works best in **Chrome on desktop**, which can usually export MP4.
- Some browsers export **WebM** instead. If your video is WebM, convert it to MP4 with any free converter before posting to Instagram.
- Recording on phones is less reliable. Recent Chrome for Android should work, and iOS support depends on the version. Make a short test reel first.
- Recording happens in real time and stops or goes silent if the tab is closed, the screen locks or the browser throttles the page. The same applies to the voice recorder, especially on iPhone.
- The voice recorder captures your voice only. If you play music out loud while recording, the microphone will pick it up too.
- Background videos work best as short MP4 (H.264) files. Large or high-resolution videos can make recording choppy on slower devices, and some video formats may not load in every browser.
- When a short video loops, the browser may pause briefly while it jumps back to the start.
- Reels are limited to 90 seconds in this tool.
- Custom colors and lyrics are not saved when you close or refresh the page.
- The color picker is provided by the browser, so it looks different on each device.
- Some drawing features (rounded rectangles, for example) need a reasonably recent browser.

## Customizing

Open `script.js` and look for these arrays and functions:

- `THEMES`: add a color theme with a name and four colors (`a` and `b` for the background gradient, `c` for the main accent, `d` for the secondary accent).
- `FONTS`: add a font with a name, the Google Fonts family name `f`, a weight `w` and a size multiplier `s`. Also add the family to the Google Fonts link in `index.html`.
- `frame()`: add a new animation style as another `else if (style === '...')` branch, and add a matching button with a `data-v` value in `index.html`.
- `bgAnim()`: add a background animation as another `else if (bgMode === '...')` branch, and add a matching button with a `data-b` value in `index.html`.
- `drawLine()` and `drawLyrics()`: change the lyric styles and animations. Add a style or animation here and a matching button in `index.html`.
- `parseLyrics()`: change how lyric timing is read.
- `startRec()` and `stopRec()`: the voice recorder.
- `syncVideo()`: how the background video is kept in sync and looped.
- `buildChain()`: the audio settings chain. Add or change audio effects here.

## Contributing

Issues and pull requests are welcome. If you report a bug, please include your browser, version and device.