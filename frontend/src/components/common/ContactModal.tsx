import { useState } from 'react'
import { Modal } from './Modal'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

const EMAIL = 'mychosh@gmail.com'
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('[Audio Adjuster] 문의 - ')}`

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal open={open} onClose={onClose} title="문의하기" size="sm">
      <div className="space-y-5 text-[13.5px] text-fg-dim">

        <p className="leading-relaxed">
          사용 중 문제가 발생하거나 개선 의견이 있으시면 아래 이메일로 연락해 주세요.
        </p>

        {/* 이메일 */}
        <div className="p-4 rounded-lg bg-ink-700/40 border border-line">
          <div className="text-[11.5px] text-fg-mute uppercase tracking-wider mb-2">이메일</div>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={MAILTO}
              className="text-brand-cyan hover:underline font-mono text-[13.5px] break-all"
            >
              {EMAIL}
            </a>
            <button
              onClick={handleCopy}
              className="shrink-0 px-2.5 h-7 rounded border border-line text-[12px] text-fg-dim hover:text-fg hover:bg-ink-700 transition-colors"
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          </div>
        </div>

        {/* mailto 바로가기 */}
        <a
          href={MAILTO}
          className="flex items-center justify-center gap-2 h-9 w-full rounded-md bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-[13px] hover:bg-brand-cyan/15 transition-colors"
        >
          이메일 앱으로 열기
        </a>

        <p className="text-[12px] text-fg-mute leading-relaxed">
          버그 제보 시 어떤 페이지에서 어떤 동작을 했을 때 발생했는지 함께 알려주시면 빠른 확인이 가능합니다.
        </p>

      </div>
    </Modal>
  )
}
