// === Spec doc — Section 3: 상태별 차이 ===
const Sec3_States = () => (
  <DocSection n="03" id="states" title="상태별 화면 차이 (empty / uploaded / processing / success / error)">
    <DocP>5가지 상태는 <b className="text-fg">동일 레이아웃</b>을 유지하고, 카드 내부 콘텐츠와 버튼 활성도만 변한다. 우측 하단 Tweaks 패널에서 직접 토글하여 비교 가능.</DocP>
    <SpecTable
      head={['요소', 'empty', 'uploaded', 'processing', 'success', 'error']}
      rows={[
        ['업로드 카드',    '드롭존 강조',                '파일 메타 5칸 (길이/크기/형식/SR/BR)', '메타 유지', '메타 유지', '메타 유지'],
        ['실행 바',        '둘 다 비활성',               '둘 다 활성',                          '"분석 중…" 라벨 + 비활성', '"다시 분석" 라벨', '"다시 시도" 라벨'],
        ['Key 카드',       '— —',                       '— —',                                  '진행률 바 + 부분 표시', '"A minor" cyan 64px', 'Unknown warn'],
        ['BPM 카드',       '— —',                       '— —',                                  '진행률 바',           '"128" cyan 64px',   'Unknown warn'],
        ['안내 카드',      '항상 노출',                  '항상 노출',                            '항상 노출',          '항상 노출',          '항상 노출'],
        ['음량 카드',      '— — / 빈 게이지',           '— — / 빈 게이지',                       '게이지 펄스',        'Peak / RMS 채워진 게이지', 'Peak/RMS Unknown'],
        ['진행 카드',      '4단계 idle 회색',            '4단계 idle 회색',                       '단계별 active/done 전이', '4 / 4 단계 완료', '실패한 단계 err'],
        ['상단 배지',      '없음',                      '<Badge tone="ok">업로드 완료</Badge>',  '<Badge tone="cyan">분석 중</Badge>', '<Badge tone="ok">분석 완료</Badge>', '<Badge tone="err">실패</Badge>'],
        ['하단 디스클레이머', '— ',                     '참고용 안내',                          '동일',              '참고용 추정',         '실패 사유 + 재시도 안내'],
      ]}
    />

    <DocH3>버튼 활성/비활성 매트릭스</DocH3>
    <SpecTable
      head={['버튼', 'empty', 'uploaded', 'processing', 'success', 'error']}
      rows={[
        ['원본 재생',     '✗', '✓', '✗', '✓', '✓'],
        ['분석 실행',     '✗', '✓', '✗ (스피너)', '✓ (재실행)', '✓ (재시도)'],
        ['삭제(휴지통)',  '✗', '✓', '✗', '✓', '✓'],
      ]}
    />

    <DocH3>Unknown 처리 (PRD 7.2.4 / 7.2.7 매핑)</DocH3>
    <DocList items={[
      "Key 또는 BPM 분석에 실패하거나 신뢰도가 부족하면 해당 카드만 Unknown(warn 톤)으로 표시한다.",
      "한 카드만 Unknown이어도 페이지 전체를 error로 떨어뜨리지 않는다 — 부분 성공 허용.",
      "두 카드 모두 Unknown이면 하단 디스클레이머가 err 톤으로 강화되고 [다시 시도] 라벨이 노출된다.",
      "Unknown 시 빅 넘버는 64px → 40px로 축소하여 'A minor' 결과와 시각 구분.",
    ]}/>
  </DocSection>
);

// === Spec doc — Section 4: 액션 흐름 ===
const Sec4_Flows = () => (
  <DocSection n="04" id="flows" title="사용자 액션 흐름">
    <DocH3>Happy path</DocH3>
    <Code>{`(empty)
  └─ 파일 드롭 / [파일 선택]
      └─ 검증: mp3 / ≤10분 / ≤20MB
          ├─ 실패 → (error) 해당 사유 메시지 (mp3만 가능 / 용량 / 길이)
          └─ 성공 → (uploaded)
                ├─ [원본 재생] (선택 사항, 분석 전에도 청취 가능)
                └─ [분석 실행] → (processing)
                      ├─ step 1: 디코딩         (~10%)
                      ├─ step 2: 피크/세그먼트   (~30%)
                      ├─ step 3: Key (chroma)   (~70%)
                      ├─ step 4: BPM (onset)    (~95%)
                      └─ step 5: 음량 RMS/Peak  (100%)
                              ├─ 모두 성공 → (success)
                              ├─ 일부 실패 → (success, 부분 Unknown 카드)
                              └─ 전부 실패 → (error)`}</Code>

    <DocH3>분석 단계 (StepListCard)</DocH3>
    <DocList items={[
      "디코딩 — 업로드된 mp3를 PCM으로 디코딩 (lib/audio/decode.ts).",
      "피크 추출 — RMS 윈도우 + 정규화. 향후 1페이지 파형과 공유 가능.",
      "Key 추정 — 12-bin chroma profile 매칭 (Krumhansl-Schmuckler 등).",
      "BPM 추정 — onset detection + autocorrelation. 신뢰도 표기 가능.",
      "음량 — Peak / RMS Avg dBFS 계산.",
    ]}/>

    <DocH3>키보드 (권장)</DocH3>
    <DocList items={[
      <span><Kbd>Space</Kbd> 원본 재생 / 정지 토글</span>,
      <span><Kbd>Enter</Kbd> 분석 실행</span>,
      <span><Kbd>R</Kbd> 분석 다시 실행</span>,
    ]}/>
  </DocSection>
);

window.Sec3_States = Sec3_States;
window.Sec4_Flows = Sec4_Flows;
