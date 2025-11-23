# Image Requirements for FocusFlow

This document lists all images that need to be generated for the competition submission.

## Screenshots to Generate

All screenshots should be:
- **Format:** PNG
- **Resolution:** 1920x1080 (minimum)
- **Aspect Ratio:** 16:9
- **File Size:** < 2MB each (optimized)
- **Naming:** Use the exact filenames listed below

### Required Screenshots

1. **`01-dashboard-overview.png`**
   - **Content:** Main dashboard showing:
     - Analytics panel with stats cards (Focus Time Today, Sessions Completed, etc.)
     - Productivity score
     - Quick actions panel
     - Recent activity
   - **Key Elements:** Clean, modern UI with data visible
   - **Focus:** Overall dashboard layout and information density

2. **`02-focus-timer-active.png`**
   - **Content:** Active focus session with:
     - Large countdown timer (e.g., "45:23")
     - Progress bar showing session completion
     - Mode selector (Focus/Break/Meeting)
     - Duration buttons (25m, 50m, 90m, 120m)
     - Start/Pause/Stop controls
   - **Key Elements:** Timer prominently displayed, session status clear
   - **Focus:** Focus timer interface and active state

3. **`03-cliq-widget.png`**
   - **Content:** FocusFlow widget embedded in Zoho Cliq:
     - Widget visible in Cliq channel
     - Shows current focus status
     - Quick action buttons
     - Integration with Cliq UI
   - **Key Elements:** Native Cliq integration, seamless UI
   - **Focus:** Zoho Cliq integration demonstration

4. **`04-ai-suggestions.png`**
   - **Content:** AI-powered features:
     - Focus Coach card with suggestions
     - "Best Focus Time" recommendation
     - Distraction detector insights
     - Time predictor showing optimal session duration
     - Smart suggestions list
   - **Key Elements:** AI recommendations visible, clear value proposition
   - **Focus:** AI features and intelligent suggestions

5. **`05-analytics-detail.png`**
   - **Content:** Detailed analytics view:
     - Weekly/monthly trend graphs
     - Focus time breakdown
     - Productivity score over time
     - Streak information
     - Comparison with previous periods
   - **Key Elements:** Charts and graphs, data visualization
   - **Focus:** Analytics depth and insights

6. **`06-meeting-summary.png`**
   - **Content:** Meeting summary interface:
     - AI-generated summary text
     - Meeting notes list
     - Summary metadata (date, duration, participants)
     - Action items extracted
   - **Key Elements:** Summary quality, meeting context
   - **Focus:** AI summarization feature

7. **`07-bot-commands.png`**
   - **Content:** Bot interactions in Zoho Cliq:
     - Bot command examples (e.g., `/focus start`, `/focus status`)
     - Bot responses in chat
     - Command help menu
     - Interactive bot features
   - **Key Elements:** Bot functionality, command interface
   - **Focus:** Bot integration and usability

8. **`08-settings.png`**
   - **Content:** Settings and preferences:
     - User profile settings
     - Notification preferences
     - Focus mode defaults
     - Integration settings
     - Theme/appearance options
   - **Key Elements:** Settings organization, customization options
   - **Focus:** User control and customization

## Demo Assets to Generate

### Animated GIF: `demo.gif`

- **Format:** GIF
- **Dimensions:** 800px width (height auto, maintain aspect ratio)
- **Frame Rate:** 10 FPS
- **Duration:** 15 seconds
- **File Size:** < 5MB (optimized)
- **Content:** Quick highlights of:
  - Starting a focus session
  - AI suggestions
  - Analytics dashboard
  - Widget in Cliq
- **Optimization:** Use palette optimization, reduce colors if needed

**FFmpeg Command:**
```bash
ffmpeg -i demo-video.mp4 -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 -t 15 demo.gif
```

### Demo Video: `demo-video.mp4`

- **Format:** MP4 (H.264 codec)
- **Dimensions:** 1920x1080
- **Frame Rate:** 30 FPS
- **Duration:** 60 seconds (±2 seconds acceptable)
- **Audio:** AAC, 192kbps (optional)
- **File Size:** < 50MB
- **Content:** Follow the script in `docs/DEMO_SCRIPT.md`

**FFmpeg Recording Command (macOS):**
```bash
ffmpeg -f avfoundation -i "1:0" -r 30 -t 60 \
  -vf "scale=1920:1080" -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 192k demo-video.mp4
```

## Image Generation Checklist

### Screenshots
- [ ] 01-dashboard-overview.png
- [ ] 02-focus-timer-active.png
- [ ] 03-cliq-widget.png
- [ ] 04-ai-suggestions.png
- [ ] 05-analytics-detail.png
- [ ] 06-meeting-summary.png
- [ ] 07-bot-commands.png
- [ ] 08-settings.png

### Demo Assets
- [ ] demo.gif (15 seconds, optimized)
- [ ] demo-video.mp4 (60 seconds, full quality)

## Design Guidelines

### Visual Consistency
- Use consistent color scheme (match app theme)
- Maintain consistent UI spacing and layout
- Use same font family throughout
- Keep branding elements consistent

### Content Guidelines
- Show realistic data (not all zeros or placeholder text)
- Include meaningful numbers and metrics
- Display active states (not empty/loading states)
- Show best-case scenarios (high productivity scores, active sessions)

### Technical Guidelines
- Remove any sensitive/personal information
- Ensure text is readable at display size
- Use high contrast for accessibility
- Include relevant UI chrome (browser, Cliq interface)

### Optimization
- Compress PNGs using tools like TinyPNG or ImageOptim
- Optimize GIF using gifsicle or similar
- Compress video using FFmpeg with appropriate settings
- Verify file sizes before committing

## Tools for Image Generation

### Screenshots
- **macOS:** Built-in screenshot tool (Cmd+Shift+4), CleanShot X
- **Windows:** Snipping Tool, ShareX, Greenshot
- **Linux:** scrot, gnome-screenshot, Flameshot

### Screen Recording
- **FFmpeg:** Cross-platform, command-line
- **OBS Studio:** Free, open-source, cross-platform
- **macOS:** QuickTime Player (built-in)
- **Windows:** Xbox Game Bar (Windows+G)

### Image Editing
- **GIMP:** Free, open-source
- **Photoshop:** Professional (paid)
- **Figma:** Web-based, free tier available
- **Canva:** Web-based, easy to use

### Optimization
- **TinyPNG:** Online PNG compression
- **ImageOptim:** macOS app for image optimization
- **gifsicle:** Command-line GIF optimization
- **FFmpeg:** Video compression and conversion

## Notes

- All images should be generated from the actual running application
- Use test data that looks realistic but isn't sensitive
- Ensure consistent branding across all images
- Test images at different display sizes to ensure readability
- Keep original high-resolution versions for future use



