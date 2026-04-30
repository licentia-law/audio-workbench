// Section 6: designer-perspective notes
const Sec6_Designer = () => (
  <DocSection n="06" id="designer" title="디자이너 관점의 세부 정리 포인트">
    <DocH3>6-1. 시각 위계</DocH3>
    <DocList items={[
      "Key/BPM 빅 넘버(64px num) ≫ 음량 게이지 ≫ 진행 카드/안내. 결과 카드가 페이지 시각 앵커.",
      "Key는 cyan, BPM도 cyan으로 같은 톤에 묶어 '같은 분석 결과'임을 인지시킨다. Unknown 시에만 warn(amber)으로 톤 분리.",
      "안내 카드(우측 1열)는 항상 노출 — 결과가 참고용임을 페이지 어디에서도 놓치지 않게 함.",
    ]}/>

    <DocH3>6-2. 빅 넘버 결과 카드 디테일</DocH3>
    <DocList items={[
      "성공 시 'A minor' 같은 텍스트도 64px num으로 표기. BPM은 숫자 + 작은 'BPM' 단위.",
      "처리 중에는 빅 넘버 자리에 '— —'(40px faint) + 진행률 바를 그려, 곧 채워질 자리임을 시각적으로 예약.",
      "Unknown(warn 톤) 시 64→40px로 축소하여 정상 결과와 즉각 구분. 'Unknown' 텍스트는 따옴표 없이 모노 폰트.",
      "카드 우상단 배지는 상태 동기화: 분석 완료 / 분석 중 / Unknown / 실패 / 대기 5종.",
      "카드 하단은 caption(조성/템포) + captionSub(A 마이너 / Beats Per Minute)로 보조 설명. 처리 전엔 caption만.",
    ]}/>

    <DocH3>6-3. 음량 카드 (dBFS)</DocH3>
    <DocList items={[
      "Peak / RMS Avg 두 메트릭을 동일 폭으로 병렬 배치 — 어떤 게 더 중요한지 위계를 두지 않는다.",
      "게이지는 -60 ~ 0 dBFS 가로축. 배경에 green→amber→red 그라데이션을 깔아 클리핑 영역을 직관적으로 표현.",
      "사용자가 측정값을 읽기보다 '대략 어디쯤인가'를 먼저 보도록 막대 + 숫자를 동시 노출.",
      "처리 중에는 cyan 펄스 막대로 진행 표현. 빈 상태에선 회색 게이지 + '— —' 텍스트.",
    ]}/>

    <DocH3>6-4. 분석 진행 카드</DocH3>
    <DocList items={[
      "디코딩→피크→Key→BPM→음량 5단계를 한 화면에 노출 — '왜 이렇게 오래 걸리는지'에 대한 컨텍스트 제공.",
      "각 행은 아이콘 + 라벨 + 진행률 막대 + % 숫자. 상태별 색: idle(회색) / active(cyan, 펄스) / done(ok 그린) / error(rose).",
      "성공 후에도 카드를 사라지게 하지 않고 '4/4 단계 완료'로 유지 — 신뢰감 구축.",
    ]}/>

    <DocH3>6-5. 마이크로카피 (한국어)</DocH3>
    <SpecTable
      head={['상황', '문구']}
      rows={[
        ['empty 결과 카드',     '— — (placeholder, 회색 faint)'],
        ['uploaded 안내',       '[분석 실행]을 눌러 Key·BPM을 추정합니다.'],
        ['처리 중 분석 진행',    '디코딩 / 피크 추출 / Key 추정 / BPM 추정 / 음량 측정'],
        ['Key Unknown',         '조성 추정 신뢰도가 낮습니다. (Unknown)'],
        ['BPM Unknown',         '템포 추정에 실패했습니다. (Unknown)'],
        ['전체 실패',           '음원 분석에 실패했습니다. 다른 파일로 다시 시도해 주세요.'],
        ['공통 안내(우측 카드)', '분석 결과는 참고용 추정값이며 실제 조성과 다를 수 있습니다.'],
      ]}
    />

    <DocH3>6-6. 1페이지와의 일관성</DocH3>
    <DocList items={[
      "사이드바·헤더·업로드 카드·Badge·ActionBtn은 page1과 100% 동일 컴포넌트 재사용.",
      "카드 라운드 / 보더 / 그림자 / 폰트 / 컬러 토큰 변경 없음.",
      "차이점: 파형/핸들/재생 헤드 없음, 다운로드 버튼 없음. 그 자리를 결과 빅 넘버 + 음량 게이지가 차지.",
      "'분석 실행' primary 버튼은 1페이지의 '자르기 실행'과 같은 위치(메인 액션 우측)에 배치하여 페이지 간 학습 비용 최소화.",
    ]}/>

    <DocH3>6-7. 접근성</DocH3>
    <DocList items={[
      "모든 버튼 hit area ≥ 44px (h-12).",
      "결과 빅 넘버에 aria-live='polite' — 분석 완료 시 스크린 리더가 결과를 읽도록.",
      "Unknown은 색상 + 'Unknown' 텍스트 + warn 아이콘 3중 신호.",
      "진행률은 role='progressbar' + aria-valuenow.",
    ]}/>
  </DocSection>
);
window.Sec6_Designer = Sec6_Designer;
