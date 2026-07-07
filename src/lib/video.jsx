import { Video, Webcam } from 'lucide-react'

// Metadata de las plataformas de videollamada soportadas para seminarios
export const platformMeta = {
  zoom: {
    name: 'Zoom',
    Icon: Video,
    bg: 'bg-sky-100 text-sky-700',
    newMeeting: 'https://zoom.us/meeting/schedule',
    urlPrefix: 'https://zoom.us/',
    pattern: /^https:\/\/([\w-]+\.)?zoom\.us\//,
    placeholder: 'https://zoom.us/j/…',
  },
  meet: {
    name: 'Google Meet',
    Icon: Webcam,
    bg: 'bg-emerald-100 text-emerald-700',
    newMeeting: 'https://meet.google.com/new',
    urlPrefix: 'https://meet.google.com/',
    pattern: /^https:\/\/meet\.google\.com\//,
    placeholder: 'https://meet.google.com/…',
  },
}

export const isValidLink = (platform, link) =>
  !link || platformMeta[platform].pattern.test(link)
