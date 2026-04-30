// === Doc primitives (used by spec section) ===
const DocSection = ({ n, title, children, id }) => (
  <section id={id} className="mb-14">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="num text-[12px] text-brand-cyan">{n}</span>
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
    </div>
    <div className="border-l border-line2/60 pl-5 ml-1">{children}</div>
  </section>
);
const DocH3 = ({ children }) => <h3 className="text-[15px] font-semibold tracking-tight text-fg mt-6 mb-2.5">{children}</h3>;
const DocP = ({ children }) => <p className="text-[13.5px] text-fg-dim leading-relaxed mb-2.5">{children}</p>;
const DocList = ({ items }) => (
  <ul className="text-[13.5px] text-fg-dim leading-relaxed list-disc pl-5 mb-3 marker:text-fg-faint">
    {items.map((it, i) => <li key={i} className="mb-1">{it}</li>)}
  </ul>
);
const Code = ({ children }) => (
  <pre className="bg-ink-800 border border-line2/50 rounded-lg p-4 text-[12.5px] num text-fg-dim overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
);
const Kbd = ({ children }) => <code className="px-1.5 py-0.5 rounded bg-ink-800 border border-line2/60 text-fg num text-[12px]">{children}</code>;
const SpecTable = ({ head, rows }) => (
  <div className="overflow-hidden rounded-xl border border-line2/60 bg-ink-800 mb-4">
    <table className="w-full text-[13px]">
      <thead className="bg-ink-700">
        <tr>{head.map((h, i) => <th key={i} className="text-left font-medium text-fg-dim px-3.5 py-2.5 border-b border-line2/60">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-line2/30 last:border-0 align-top">
            {r.map((c, j) => <td key={j} className={`px-3.5 py-2.5 ${j === 0 ? 'font-medium text-fg' : 'text-fg-dim'}`}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// === Spec body for Key page ===
const SpecDoc = () => (
  <div className="text-fg">
    <DocSection n="01" id="layout" title="최종 레이아웃 구조">
      <DocP>
        데스크톱 1440px 기준, 좌측 220px 사이드바 + 우측 메인(1220px) 2단 구조를 유지한다.
        Key 변환은 <b className="text-fg">파형 중심</b>이 아닌 <b className="text-fg">컨트롤 + 결과 카드</b> 중심 페이지로,
        semitone 조절 카드가 페이지에서 가장 큰 시각 비중을 갖는다.
      </DocP>
      <DocH3>섹션 순서</DocH3>
      <SpecTable
        head={['#', '섹션', '높이(권장)', '역할']}
        rows={[
          ['1', '페이지 헤더', '64px', '제목 + 설명 + [이용 가이드]'],
          ['2', '업로드 + 파일 정보 카드', '180px', '드롭존(380px) + 메타 5칸'],
          ['3', '원본 정보 + 반음 조절 (3열 카드)', '260px', '좌 1/3 원본 정보, 우 2/3 semitone 컨트롤'],
          ['4', '예상 결과 + 안내 (2열)', '120px', '원본→예상 Key + 템포 / 안내·팁'],
          ['5', '액션 바 (3버튼)', '72px', '변환 실행(primary) / 결과 재생 / 초기화'],
          ['6', '변환 결과 카드', '156px', '결과 플레이어 + 다운로드 / 처리중 / 실패'],
        ]}
      />
      <DocP>4번 라인은 좌(예상 결과 1fr) + 우(안내 410px), 카드 간 gap 20px, 카드 라운드 16px로 1페이지와 동일하다.</DocP>
    </DocSection>

    <DocSection n="02" id="components" title="주요 컴포넌트 목록">
      <SpecTable
        head={['컴포넌트', 'props', '역할', '비고']}
        rows={[
          ['<Sidebar/>', 'active="key"', '5개 페이지 메뉴 + 하단 유틸', '공통'],
          ['<PageHeader/>', '-', 'Key 변환 헤더', '공통'],
          ['<UploadFileCard/>', 'state, file', '드롭존 + 메타 5칸', '공통'],
          ['<OriginalInfoCard/>', 'state, originalKey, originalBpm, unknown', '원본 Key/BPM + 원본 재생', 'Unknown 처리 분기'],
          ['<SemitoneControl/>', 'state, semi, onChange', '−12 ~ +12 슬라이더 + −/+ stepper + 빅 넘버', '핵심'],
          ['<PredictedResultCard/>', 'state, semi, originalKey, unknown', '원본 → 예상 Key + 템포 표시', '실시간'],
          ['<GuidanceCard/>', 'unknown', '안내·팁 텍스트', '항상 표시'],
          ['<ActionBar/>', 'state, semi, onConvert, onReset', '변환 실행 / 결과 재생 / 초기화', 'primary 1, secondary 2'],
          ['<ConversionResultCard/>', 'state, semi, file, unknown', '결과 플레이어 + 다운로드 / 진행률 / 실패', '상태별 콘텐츠'],
          ['<Badge/>', 'tone', '상태 배지', '공통'],
        ]}
      />
    </DocSection>

    <DocSection n="03" id="states" title="상태별 화면 차이">
      <DocP>5가지 상태는 동일 레이아웃을 유지하고 카드 내부 콘텐츠 / 버튼 활성도만 변한다.</DocP>
      <SpecTable
        head={['요소', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['업로드 카드', '드롭존 강조', '메타 5칸', '메타 유지', '메타 유지', '메타 유지'],
          ['원본 정보',   '-- / --',  '실값',   '실값 (회색)',  '실값',     '실값'],
          ['Semitone',   '잠금',    '활성',   '잠금 (회색)',  '활성',     '활성'],
          ['예상 결과',   '-- → --', '실시간', '잠금',         '결과 반영', '값 유지'],
          ['액션 바',     '전부 비활성', '변환 실행 활성(semi≠0)', '변환 중… 라벨', '결과 재생 활성 + 변환 재실행 가능', '재시도(=변환) 활성'],
          ['변환 결과',   '안내', '안내', '진행률 54%', '플레이어 + 다운로드', '실패 메시지 + 재시도'],
          ['상단 배지',   '-', '업로드 완료', '처리 중', '변환 완료', '실패'],
        ]}
      />
      <DocH3>버튼 활성/비활성 매트릭스</DocH3>
      <SpecTable
        head={['버튼', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['원본 재생',   '✗', '✓', '✗', '✓', '✓'],
          ['− / +',       '✗', '✓', '✗', '✓', '✓'],
          ['변환 실행',   '✗', 'semi ≠ 0 일 때만', '스피너', '✓ (재실행)', '✓ (재시도)'],
          ['결과 재생',   '✗', '✗', '✗', '✓', '✗'],
          ['초기화',      '✗', '✓', '✗', '✓', '✓'],
          ['다운로드',    '✗', '✗', '✗', '✓', '✗'],
        ]}
      />
    </DocSection>

    <DocSection n="04" id="flows" title="사용자 액션 흐름">
      <DocH3>Happy path</DocH3>
      <Code>{`(empty)
  └─ 파일 업로드 → 검증(mp3 / ≤10분 / ≤20MB)
      └─ 성공 → (uploaded) + 백그라운드에서 key/bpm 분석
            ├─ semitone 조절 (−/+ 또는 슬라이더)
            │     └─ PredictedResultCard 가 즉시 갱신 (원본 → 예상 Key)
            ├─ 검증: semi ∈ [-12, +12], semi ≠ 0
            └─ [변환 실행] → (processing, 진행률 표시)
                  └─ pitch shift (tempo preserve) → (success)
                        ├─ [결과 재생] 결과 미리듣기
                        └─ [다운로드] song(C_minor).mp3   (또는 song(key_shift_+3).mp3)`}</Code>

      <DocH3>파일명 규칙 (PRD 7.3.6)</DocH3>
      <DocList items={[
        '계산 가능: song(G_Major).mp3 / song(F_sharp_minor).mp3 / song(B_flat_Major).mp3',
        'Unknown 등 계산 불가: song(key_shift_+3).mp3 (sign 포함)',
        '공백 → _, # → _sharp, b(flat) → _flat 으로 정규화',
      ]}/>

      <DocH3>키보드 (권장)</DocH3>
      <DocList items={[
        <span><Kbd>Space</Kbd> 원본/결과 재생 토글</span>,
        <span><Kbd>← / →</Kbd> semitone 1단계 조절, <Kbd>Shift+← / →</Kbd> 5단계</span>,
        <span><Kbd>0</Kbd> semitone 0으로 초기화</span>,
        <span><Kbd>Enter</Kbd> 변환 실행</span>,
      ]}/>
    </DocSection>
  </div>
);

window.DocSection = DocSection;
window.DocH3 = DocH3;
window.DocP = DocP;
window.DocList = DocList;
window.Code = Code;
window.Kbd = Kbd;
window.SpecTable = SpecTable;
window.SpecDoc = SpecDoc;
