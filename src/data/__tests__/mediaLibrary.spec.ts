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
    expect(digitalVideos).toHaveLength(25)
    expect(digitalYouTubeVideos).toHaveLength(49)
    expect(allDigitalVideos).toHaveLength(74)
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
    expect(searchVideos('phat am bai 1 chu a lop 1')[0]?.id).toBe('video-bai-1-a-a')
    expect(searchVideos('danh van chu a lop 1')[0]?.title).toBe('Đánh vần chữ A')
    expect(searchVideos('danh van ph qu')[0]?.id).toBe('video-bai-26-ph-ph-qu-qu')
  })
})
