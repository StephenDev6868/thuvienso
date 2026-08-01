import { describe, expect, it } from 'vitest'

import {
  allDigitalVideos,
  digitalAudiobooks,
  digitalYouTubeVideos,
  digitalVideos,
  searchAudiobooks,
  searchVideos,
} from '@/data/mediaLibrary'

describe('digitized media library', () => {
  it('hydrates every audiobook and video asset', () => {
    expect(digitalAudiobooks).toHaveLength(63)
    expect(digitalVideos).toHaveLength(9)
    expect(digitalYouTubeVideos).toHaveLength(49)
    expect(allDigitalVideos).toHaveLength(58)
    expect(digitalAudiobooks.every((item) => item.mediaUrl && item.coverUrl)).toBe(true)
    expect(digitalVideos.every((item) => item.mediaUrl && item.coverUrl)).toBe(true)
  })

  it('creates privacy-enhanced embed links for videos and playlists', () => {
    const timedVideo = digitalYouTubeVideos.find((item) => item.id === 'youtube-hai-ba-trung')!
    const playlist = digitalYouTubeVideos.find(
      (item) => item.id === 'youtube-stem-thi-nghiem-vui-playlist',
    )!

    expect(timedVideo.embedUrl).toContain('youtube-nocookie.com/embed/vqvXYvF4Yes')
    expect(timedVideo.embedUrl).toContain('start=23')
    expect(playlist.embedUrl).toContain('embed/videoseries?list=')
  })

  it('searches normalized Vietnamese media titles', () => {
    expect(searchAudiobooks('rua va tho')[0]?.title).toContain('Rùa và Thỏ')
    expect(searchVideos('cau be ham hoc lop 2')[0]?.title).toContain('Cậu bé ham học')
  })
})
