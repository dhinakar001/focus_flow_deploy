# 60-Second Demo Script

This document provides a detailed script for recording a 60-second demo video of FocusFlow.

## Pre-Recording Setup

1. **Prepare Test Data**
   - Create a test Zoho Cliq account
   - Set up OAuth credentials
   - Create sample focus sessions
   - Generate some analytics data
   - Have meeting notes ready

2. **Clean UI State**
   - Close unnecessary browser tabs
   - Set browser to full-screen (F11)
   - Clear browser console
   - Ensure no personal/sensitive data visible

3. **Recording Settings**
   - Resolution: 1920x1080
   - Frame rate: 30 FPS
   - Audio: System audio + microphone (optional)
   - Format: MP4 (H.264)

## Demo Script (60 Seconds)

### Segment 1: Problem & Solution (0:00 - 0:10)

**Visual:**
- Show Zoho Cliq with multiple notifications/messages
- Highlight the distraction problem

**Narration:**
> "Modern knowledge workers face constant interruptions. FocusFlow integrates directly into Zoho Cliq to help teams stay focused and productive."

**Actions:**
- [ ] Open Zoho Cliq
- [ ] Show multiple channels with unread messages
- [ ] Highlight notification badges
- [ ] Transition to FocusFlow widget

---

### Segment 2: Core Focus Feature (0:10 - 0:25)

**Visual:**
- FocusFlow widget/dashboard
- Starting a focus session
- Timer counting down

**Narration:**
> "Start a focus session with one click. FocusFlow automatically blocks distracting messages while you work. The timer shows your progress in real-time."

**Actions:**
- [ ] Open FocusFlow widget in Cliq
- [ ] Click "Start Focus Session"
- [ ] Select 50-minute duration
- [ ] Show timer counting down
- [ ] Show "Messages Blocked" indicator
- [ ] Demonstrate message blocking (optional: show blocked notification)

---

### Segment 3: AI Features (0:25 - 0:40)

**Visual:**
- Focus Coach interface
- AI suggestions
- Distraction detection

**Narration:**
> "Our AI-powered Focus Coach analyzes your work patterns and suggests optimal focus times. Distraction detection helps identify when you're most likely to be interrupted."

**Actions:**
- [ ] Navigate to AI Features section
- [ ] Show Focus Coach suggestions
- [ ] Display "Best Focus Time" recommendation
- [ ] Show distraction detection analysis
- [ ] Highlight smart suggestions panel

---

### Segment 4: Analytics & Insights (0:40 - 0:55)

**Visual:**
- Analytics dashboard
- Productivity metrics
- Trends and graphs

**Narration:**
> "Track your productivity with detailed analytics. See your focus streaks, daily stats, and trends over time. Meeting summaries help you stay on top of important discussions."

**Actions:**
- [ ] Open Analytics dashboard
- [ ] Show today's focus time (e.g., "3h 42m")
- [ ] Display productivity score
- [ ] Show weekly trend graph
- [ ] Highlight streak counter
- [ ] Show meeting summary example

---

### Segment 5: Call to Action (0:55 - 1:00)

**Visual:**
- FocusFlow logo/branding
- Final summary screen

**Narration:**
> "FocusFlow: AI-powered productivity for Zoho Cliq teams. Try it today."

**Actions:**
- [ ] Show FocusFlow logo
- [ ] Display tagline
- [ ] Fade to final screen with branding

---

## Detailed Action Checklist

### Opening Sequence (0:00-0:10)
- [ ] Start recording
- [ ] Show Zoho Cliq interface
- [ ] Navigate through channels showing notifications
- [ ] Highlight the problem (distractions)
- [ ] Smooth transition to solution

### Focus Session Demo (0:10-0:25)
- [ ] Open FocusFlow widget
- [ ] Click "Start Focus" button
- [ ] Select duration (50 minutes)
- [ ] Show timer animation
- [ ] Display session status
- [ ] Show message blocking indicator

### AI Features Demo (0:25-0:40)
- [ ] Navigate to AI section
- [ ] Show Focus Coach card
- [ ] Display suggestions
- [ ] Show distraction detector
- [ ] Highlight time predictor
- [ ] Show smart suggestions

### Analytics Demo (0:40-0:55)
- [ ] Open analytics dashboard
- [ ] Show key metrics cards
- [ ] Display trend graphs
- [ ] Show streak information
- [ ] Display meeting summary
- [ ] Highlight insights

### Closing (0:55-1:00)
- [ ] Show branding/logo
- [ ] Display tagline
- [ ] Fade out smoothly
- [ ] Stop recording

## Recording Tips

1. **Practice First**
   - Run through the script 2-3 times before recording
   - Time each segment to ensure it fits
   - Adjust pacing as needed

2. **Smooth Transitions**
   - Use fade transitions between sections
   - Avoid abrupt cuts
   - Keep mouse movements smooth

3. **Visual Clarity**
   - Zoom in on important UI elements
   - Use cursor highlights if needed
   - Ensure text is readable

4. **Audio Quality**
   - Use a good microphone
   - Record in a quiet environment
   - Normalize audio levels in post-production

5. **Post-Production**
   - Add subtle background music (optional)
   - Add text overlays for key features
   - Include logo watermark
   - Add fade in/out effects

## FFmpeg Commands

### Record Screen
```bash
# macOS
ffmpeg -f avfoundation -i "1:0" -r 30 -t 60 \
  -vf "scale=1920:1080" -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 192k docs/screenshots/demo-video.mp4

# Linux (using X11)
ffmpeg -f x11grab -s 1920x1080 -r 30 -i :0.0 -t 60 \
  -c:v libx264 -preset slow -crf 18 \
  docs/screenshots/demo-video.mp4

# Windows (using screen-capture-recorder or OBS)
# Use OBS Studio for easier recording on Windows
```

### Create GIF from Video
```bash
ffmpeg -i docs/screenshots/demo-video.mp4 \
  -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 -t 15 docs/screenshots/demo.gif
```

### Add Overlays (Optional)
```bash
# Add text overlay
ffmpeg -i input.mp4 -vf "drawtext=text='FocusFlow':fontcolor=white:fontsize=24:x=10:y=10" \
  output.mp4
```

## Alternative: OBS Studio Workflow

1. **Setup Scene**
   - Add "Display Capture" source
   - Add "Audio Input Capture" for microphone
   - Add "Image" source for logo watermark

2. **Configure Output**
   - Settings → Output → Recording
   - Format: mp4
   - Encoder: x264
   - Bitrate: 5000 Kbps
   - Resolution: 1920x1080
   - FPS: 30

3. **Record**
   - Click "Start Recording"
   - Follow the script
   - Click "Stop Recording" after 60 seconds

4. **Export**
   - File → Remux Recordings
   - Save as `docs/screenshots/demo-video.mp4`

## Final Checklist

Before submitting:
- [ ] Video is exactly 60 seconds (±2 seconds acceptable)
- [ ] Resolution is 1920x1080
- [ ] Audio is clear and synchronized
- [ ] All UI elements are visible and readable
- [ ] No sensitive data is shown
- [ ] Transitions are smooth
- [ ] Branding is consistent
- [ ] File size is reasonable (< 50MB)
- [ ] GIF version created and optimized
- [ ] Both files saved in `docs/screenshots/`



