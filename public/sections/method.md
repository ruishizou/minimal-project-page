## Method

Videos are reusable entries in `public/config.yaml`. Define each video once in the top-level `videos` list, then attach it to a section or insert it inline from markdown.

The local video figure for this section is configured as `video-teaser`. Because it uses `provider: "local"` and `file: "video_teaser.mp4"`, the app resolves it to `/videos/video_teaser.mp4`.

### Section Video Figures

Attach one or more configured videos to a section with the section's `videos` list:

```yaml
sections:
  - name: "method"
    title: "Method"
    videos:
      - "video-teaser"

videos:
  - id: "video-teaser"
    title: "Local Video Teaser"
    provider: "local"
    file: "video_teaser.mp4"
    autoplay: true
    hideProgressBar: true
```

That configuration renders the video below this section as an autoplay figure. Local autoplay videos are muted and use `playsInline` so browsers can start them reliably. Local videos use their source aspect ratio by default; add `aspectRatio: "16/9"` or another ratio only when you want to force the figure size.

### Inline Video Placement

To place a video at a specific point inside a markdown section, put the directive on its own line:

```md
{{ video: video-teaser }}
```

Use the section-level `videos` list when a video should appear after the section body, and use the markdown directive when the surrounding text needs to introduce or explain the figure in place.
