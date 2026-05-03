import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Modal } from './Modal'
import { Icon } from '../icons/Icon'

interface GuideModalProps {
  open: boolean
  onClose: () => void
  forceTab?: TabKey
}

type TabKey = 'cut' | 'analyze' | 'keyshift' | 'amplify' | 'stemmix'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'cut',     label: '음원 자르기',    icon: <Icon name="scissors" className="w-3.5 h-3.5" /> },
  { key: 'analyze', label: '음원 분석',      icon: <Icon name="analyze"  className="w-3.5 h-3.5" /> },
  { key: 'keyshift',label: 'Key 변환',       icon: <Icon name="key"      className="w-3.5 h-3.5" /> },
  { key: 'amplify', label: '음량 증폭',      icon: <Icon name="volume"   className="w-3.5 h-3.5" /> },
  { key: 'stemmix', label: '스템 분리 / 믹스', icon: <Icon name="stems"  className="w-3.5 h-3.5" /> },
]

function routeToTab(pathname: string): TabKey {
  if (pathname.includes('analyze')) return 'analyze'
  if (pathname.includes('keyshift')) return 'keyshift'
  if (pathname.includes('amplify')) return 'amplify'
  if (pathname.includes('stemmix')) return 'stemmix'
  return 'cut'
}

const COMMON_LIMITS = (
  <div className="flex gap-4 mt-2 mb-4 p-3 bg-ink-700/40 rounded-lg border border-line text-[12.5px] text-fg-dim">
    <span>📁 MP3 전용</span>
    <span>⏱ 최대 15분</span>
    <span>💾 최대 20MB</span>
  </div>
)

const GUIDE_CONTENT: Record<TabKey, React.ReactNode> = {
  cut: (
    <div className="space-y-4 text-[13.5px] text-fg-dim leading-relaxed">
      {COMMON_LIMITS}
      <Section title="사용 방법">
        <Step n={1}>MP3 파일을 업로드하거나 드래그&드롭합니다.</Step>
        <Step n={2}>파형에서 시작점과 끝점을 드래그해 구간을 선택합니다.</Step>
        <Step n={3}><b className="text-fg">선택 구간 자르기</b> 버튼을 눌러 처리합니다.</Step>
        <Step n={4}>완료 후 결과 파일을 다운로드합니다.</Step>
      </Section>
      <Section title="참고">
        <li>최소 선택 구간은 <b className="text-fg">1초</b>입니다.</li>
        <li>구간 외 영역은 제거되며 복원되지 않습니다.</li>
      </Section>
    </div>
  ),
  analyze: (
    <div className="space-y-4 text-[13.5px] text-fg-dim leading-relaxed">
      {COMMON_LIMITS}
      <Section title="사용 방법">
        <Step n={1}>MP3 파일을 업로드합니다.</Step>
        <Step n={2}><b className="text-fg">분석 실행</b> 버튼을 누릅니다 (수십 초 소요).</Step>
        <Step n={3}>BPM, Key, 음량(RMS/Peak), 파일 정보를 확인합니다.</Step>
      </Section>
      <Section title="결과 해석">
        <li><b className="text-fg">BPM</b> — 분당 박자 수. 드럼·리듬 트랙이 없으면 신뢰도가 낮을 수 있습니다.</li>
        <li><b className="text-fg">Key</b> — 음악적 조성(예: C Major, A minor). 화성이 단순하거나 잡음이 많으면 부정확할 수 있습니다.</li>
        <li><b className="text-fg">RMS dBFS</b> — 평균 음량. -14 dBFS 전후가 스트리밍 기준치입니다.</li>
        <li><b className="text-fg">Peak dBFS</b> — 최대 순간 음량. 0 dBFS에 가까우면 클리핑 위험이 있습니다.</li>
      </Section>
    </div>
  ),
  keyshift: (
    <div className="space-y-4 text-[13.5px] text-fg-dim leading-relaxed">
      {COMMON_LIMITS}
      <Section title="사용 방법">
        <Step n={1}>MP3 파일을 업로드합니다.</Step>
        <Step n={2}>반음(Semitone) 수를 조정합니다 (−12 ~ +12).</Step>
        <Step n={3}><b className="text-fg">Key 변환 실행</b> 버튼을 누릅니다.</Step>
        <Step n={4}>결과 파일을 다운로드합니다.</Step>
      </Section>
      <Section title="참고">
        <li>+1 반음 = 장2도 아래 → 단2도 위 이동 (예: C → C♯).</li>
        <li>템포는 변경되지 않습니다 (피치 시프트만 적용).</li>
        <li>변환 폭이 클수록 음질이 다소 저하될 수 있습니다.</li>
      </Section>
    </div>
  ),
  amplify: (
    <div className="space-y-4 text-[13.5px] text-fg-dim leading-relaxed">
      {COMMON_LIMITS}
      <Section title="사용 방법">
        <Step n={1}>MP3 파일을 업로드합니다.</Step>
        <Step n={2}>게인 슬라이더로 증폭량(dB)을 조정합니다.</Step>
        <Step n={3}><b className="text-fg">Anti-Clip</b> 옵션으로 클리핑 방지 여부를 선택합니다.</Step>
        <Step n={4}><b className="text-fg">음량 증폭 실행</b> 버튼을 누릅니다.</Step>
        <Step n={5}>결과 파일을 다운로드합니다.</Step>
      </Section>
      <Section title="참고">
        <li><b className="text-fg">Anti-Clip ON</b> — Peak가 0 dBFS를 초과하지 않도록 자동 조정합니다.</li>
        <li><b className="text-fg">Anti-Clip OFF</b> — 지정 게인을 그대로 적용하며 클리핑이 발생할 수 있습니다.</li>
        <li>스트리밍 기준치(-14 dBFS RMS)에 맞추려면 먼저 음원 분석 탭에서 현재 레벨을 확인하세요.</li>
      </Section>
    </div>
  ),
  stemmix: (
    <div className="space-y-4 text-[13.5px] text-fg-dim leading-relaxed">
      {COMMON_LIMITS}
      <Section title="사용 방법">
        <Step n={1}>MP3 파일을 업로드합니다.</Step>
        <Step n={2}><b className="text-fg">스템 분리 실행</b>을 누릅니다 (AI 처리로 1~3분 소요).</Step>
        <Step n={3}>4개 채널(보컬 / 드럼 / 베이스 / 기타)의 페이더와 Mute를 조정합니다.</Step>
        <Step n={4}><b className="text-fg">믹스 렌더링</b>을 눌러 결과 파일을 생성하고 다운로드합니다.</Step>
      </Section>
      <Section title="채널 설명">
        <li><b className="text-fg">Vocals</b> — 사람 목소리 (랩, 합창 포함)</li>
        <li><b className="text-fg">Drums</b> — 드럼, 퍼커션</li>
        <li><b className="text-fg">Bass</b> — 베이스 기타, 저음 신스</li>
        <li><b className="text-fg">Other</b> — 나머지 악기 (피아노, 기타, 현악 등)</li>
      </Section>
      <Section title="참고">
        <li>분리 품질은 원본 음원의 복잡도와 녹음 환경에 따라 다릅니다.</li>
        <li>모든 채널을 Mute하면 무음 파일이 생성됩니다.</li>
      </Section>
    </div>
  ),
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-wider text-brand-cyan/70 mb-2">{title}</div>
      <ul className="space-y-1.5 pl-1 list-none">{children}</ul>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="shrink-0 w-5 h-5 rounded-full bg-brand-cyan/15 border border-brand-cyan/25 text-brand-cyan text-[11px] font-semibold grid place-items-center mt-0.5">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

export function GuideModal({ open, onClose, forceTab }: GuideModalProps) {
  const { pathname } = useLocation()
  const defaultTab = forceTab ?? routeToTab(pathname)
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  // 모달 열릴 때마다 현재 라우트 탭으로 리셋
  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setActiveTab(forceTab ?? routeToTab(pathname))
  }

  return (
    <Modal open={open} onClose={onClose} title="이용 가이드" size="lg">
      {/* 탭 바 */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-[12.5px] transition-colors border ${
              activeTab === tab.key
                ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25'
                : 'text-fg-dim hover:text-fg hover:bg-ink-700/60 border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {/* 콘텐츠 */}
      {GUIDE_CONTENT[activeTab]}
    </Modal>
  )
}
