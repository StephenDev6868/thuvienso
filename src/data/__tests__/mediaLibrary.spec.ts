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

  it('opens the requested spelling video by the renamed title', () => {
    const cases = [
      ['mở cho tôi video đánh vần chữ A', 'video-bai-1-a-a'],
      ['mở cho tôi video đánh vần chữ B', 'video-bai-2-b-b'],
      ['mở cho tôi video đánh vần chữ C', 'video-bai-3-c-c'],
      ['mở cho tôi video đánh vần chữ E Ê', 'video-bai-4-e-e-e-e'],
      ['mở cho tôi video đánh vần chữ O', 'video-bai-6-o-o'],
      ['mở cho tôi video đánh vần chữ Ô', 'video-bai-7-o-o'],
      ['mở cho tôi video đánh vần chữ Ơ', 'video-bai-9-o-o'],
      ['mở cho tôi video đánh vần chữ I', 'video-bai-11-i-i-k-k'],
      ['mở cho tôi video đánh vần chữ Y', 'video-bai-28-y-y'],
      ['mở cho tôi video đánh vần chữ D Đ', 'video-bai-8-d-d-d-d'],
      ['mở cho tôi video đánh vần chữ T Tr', 'video-bai-22-t-t-tr-tr'],
      ['mở cho tôi video đánh vần Ph Qu', 'video-bai-26-ph-ph-qu-qu'],
      ['mở cho tôi video đánh vần em êm im um', 'video-bai-37-em-em-im-um'],
      ['mở cho tôi video đánh vần et êt it', 'video-bai-51-et-et-it'],
      ['mở cho tôi video đánh vần om ôm ơm', 'video-bai-36-om-om-om'],
      ['mở cho tôi video đánh vần ui ưi', 'video-bai-41-ui-ui'],
    ] as const

    for (const [query, id] of cases) {
      expect(searchVideos(query)[0]?.id).toBe(id)
    }
  })
})
