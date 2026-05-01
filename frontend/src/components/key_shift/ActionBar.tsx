/**
 * ActionBar
 * 3버튼: [변환 실행(primary)] [결과 재생] [초기화]
 * 버튼 활성/비활성 매트릭스:
 *   변환: uploaded(semi≠0) / processing(스피너) / success / error
 *   결과 재생: success 전용
 *   초기화: uploaded / success / error
 */
import { Icon } from '../icons/Icon'
import type { UploadStatus } from '../../types'

interface ActionBarProps {
  pageStatus: UploadStatus
  semi: number
  resultPlaying: boolean
  onConvert: () => void
  onPlayResult: () => void
  onReset: () => void
}

export function ActionBar({
  pageStatus,
  semi,
  resultPlaying,
  onConvert,
  onPlayResult,
  onReset,
}: ActionBarProps) {
  const noFile = pageStatus === 'empty'
  const processing = pageStatus === 'processing'
  const success = pageStatus === 'success'

  const convertDisabled = noFile || processing || semi === 0
  const playDisabled = !success
  const resetDisabled = noFile || processing

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* 변환 실행 */}
      <button
        disabled={convertDisabled}
        onClick={onConvert}
        className={`h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-semibold border transition-colors ${
          convertDisabled
            ? 'bg-ink-600 text-fg-faint border-line cursor-not-allowed'
            : 'bg-brand-cyan text-ink-850 border-brand-cyan hover:bg-cyan-300'
        }`}
      >
        <Icon
          name={processing ? 'sparkle' : 'key'}
          className={`w-4 h-4 ${processing ? 'animate-pulse' : ''}`}
        />
        {processing ? '변환 중…' : '변환 실행'}
      </button>

      {/* 결과 재생 */}
      <button
        disabled={playDisabled}
        onClick={onPlayResult}
        className={`h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors ${
          playDisabled
            ? 'bg-ink-700 text-fg-faint border-line cursor-not-allowed'
            : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600'
        }`}
      >
        <Icon name={resultPlaying ? 'pause' : 'play'} className="w-4 h-4" />
        {resultPlaying ? '재생 중지' : '결과 재생'}
      </button>

      {/* 초기화 */}
      <button
        disabled={resetDisabled}
        onClick={onReset}
        className={`h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-medium border transition-colors ${
          resetDisabled
            ? 'bg-ink-700 text-fg-faint border-line cursor-not-allowed'
            : 'bg-ink-700 text-fg border-line2 hover:bg-ink-600'
        }`}
      >
        <Icon name="reset" className="w-4 h-4" />
        초기화
      </button>
    </div>
  )
}
