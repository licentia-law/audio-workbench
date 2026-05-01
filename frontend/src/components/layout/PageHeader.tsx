import { useState } from 'react'
import { Icon } from '../icons/Icon'
import { GuideModal } from '../common/GuideModal'

interface PageHeaderProps {
  title: string
  description?: string
  showHelp?: boolean
}

export function PageHeader({ title, description, showHelp = true }: PageHeaderProps) {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-fg">{title}</h1>
          {description && (
            <p className="text-fg-dim text-[14px] mt-1.5">{description}</p>
          )}
        </div>
        {showHelp && (
          <button
            onClick={() => setGuideOpen(true)}
            className="h-9 px-3 inline-flex items-center gap-2 rounded-md border border-line2 text-fg-dim hover:text-fg hover:bg-ink-700 text-[13px] transition-colors"
          >
            <Icon name="help" className="w-4 h-4" />
            이용 가이드
          </button>
        )}
      </div>

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}
