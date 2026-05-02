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
  transients: 'smooth' | 'crisp'
  resultPlaying: boolean
  onConvert: () => void
  onPlayResult: () => void
  onReset: () => void
  onTransientsChange: (v: 'smooth' | 'crisp') => void
}

export function ActionBar({
  pageStatus,
  semi,
  transients,
  resultPlaying,
  onConvert,
  onPlayResult,
  onReset,
  onTransientsChange,
}: ActionBarProps) {
  const noFile = pageStatus === 'empty'
  const processing = pageStatus === 'processing'
  const success = pageStatus === 'success'

  const convertDisabled = noFile || processing || semi === 0
  const playDisabled = !success
  const resetDisabled = noFile || processing

  return (
    <div className="space-y-3">
      {/* Transients 토글 */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-fg-muted font-medium">트랜지언트</span>
        <div className="flex rounded-lg border border-line overflow-hidden text-[12px] font-medium">
          {(['smooth', 'crisp'] as const).map((opt) => (
            <button
              key={opt}
              disabled={processing}
              onClick={() => onTransientsChange(opt)}
              className={`px-3 py-1.5 transition-colors ${
                transients === opt
                  ? 'bg-ink-500 text-fg'
                  : 'bg-ink-700 text-fg-muted hover:bg-ink-600'
              } ${processing ? 'cursor-not-allowed' : ''}`}
            >
              {opt === 'smooth' ? 'Smooth (멜로디)' : 'Crisp (드럼/퍼커시브)'}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  )
}
