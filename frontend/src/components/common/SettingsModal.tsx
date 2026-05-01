import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { apiService } from '../../services/api'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

interface SessionInfo {
  session_id: string
  session_dir: string
}

type HealthStatus = 'checking' | 'ok' | 'error'

const APP_VERSION = '0.1.0'

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [health, setHealth] = useState<HealthStatus>('checking')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setHealth('checking')
    setSession(null)
    setCleared(false)

    apiService.getSessionInfo()
      .then((data) => {
        setSession(data)
        setHealth('ok')
      })
      .catch(() => setHealth('error'))
  }, [open])

  async function handleClearSession() {
    if (!session) return
    setClearing(true)
    try {
      await apiService.deleteSession(session.session_id)
      setCleared(true)
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      // session already gone — reload anyway
      window.location.reload()
    } finally {
      setClearing(false)
    }
  }

  async function handleCopyId() {
    if (!session) return
    await navigator.clipboard.writeText(session.session_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal open={open} onClose={onClose} title="설정" size="md">
      <div className="space-y-5">

        {/* 연결 상태 */}
        <Row label="백엔드 연결">
          {health === 'checking' && <Chip color="muted">확인 중…</Chip>}
          {health === 'ok'       && <Chip color="green">정상</Chip>}
          {health === 'error'    && <Chip color="red">연결 실패</Chip>}
        </Row>

        {/* 세션 ID */}
        <Row label="세션 ID">
          {session ? (
            <div className="flex items-center gap-2 min-w-0">
              <code className="text-[12px] text-fg-dim font-mono truncate max-w-[220px]">
                {session.session_id}
              </code>
              <button
                onClick={handleCopyId}
                className="shrink-0 px-2 h-6 rounded text-[11.5px] border border-line text-fg-dim hover:text-fg hover:bg-ink-700 transition-colors"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          ) : (
            <span className="text-[13px] text-fg-mute">—</span>
          )}
        </Row>

        {/* 임시 파일 경로 */}
        <Row label="임시 파일 경로">
          {session ? (
            <code className="text-[12px] text-fg-dim font-mono break-all">
              {session.session_dir}
            </code>
          ) : (
            <span className="text-[13px] text-fg-mute">—</span>
          )}
        </Row>

        <Divider />

        {/* 파일 제한 */}
        <Row label="입력 제한">
          <div className="flex gap-3 text-[12.5px] text-fg-dim">
            <span>MP3 전용</span>
            <span>·</span>
            <span>최대 10분</span>
            <span>·</span>
            <span>최대 20MB</span>
          </div>
        </Row>

        {/* 버전 */}
        <Row label="버전">
          <span className="text-[12.5px] text-fg-dim">v{APP_VERSION}</span>
        </Row>

        <Divider />

        {/* 수동 세션 정리 */}
        <div>
          <div className="text-[13px] text-fg mb-1">수동 세션 정리</div>
          <p className="text-[12.5px] text-fg-mute mb-3">
            현재 세션의 모든 임시 파일을 즉시 삭제합니다. 업로드·처리 결과가 모두 사라지며 페이지가 새로고침됩니다.
          </p>
          {cleared ? (
            <div className="text-[12.5px] text-brand-cyan">정리 완료. 새로고침 중…</div>
          ) : (
            <button
              onClick={handleClearSession}
              disabled={clearing || !session}
              className="h-8 px-4 rounded-md text-[13px] border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {clearing ? '정리 중…' : '임시 파일 정리'}
            </button>
          )}
        </div>

      </div>
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="shrink-0 w-32 text-[12.5px] text-fg-mute pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Chip({ color, children }: { color: 'green' | 'red' | 'muted'; children: React.ReactNode }) {
  const cls = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    red:   'bg-red-500/15 text-red-400 border-red-500/25',
    muted: 'bg-ink-700/60 text-fg-mute border-line',
  }[color]
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded text-[11.5px] border ${cls}`}>
      {children}
    </span>
  )
}

function Divider() {
  return <div className="border-t border-line" />
}
