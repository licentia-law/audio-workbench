// === Spec doc — Section 1: 레이아웃 ===
const Sec1_Layout = () => (
  <DocSection n="01" id="layout" title="최종 레이아웃 구조">
    <DocP>
      데스크톱 1440px 기준, 좌측 220px 사이드바 + 우측 메인 콘텐츠(1220px) 2단 구조.
      메인은 세로 5섹션으로 구성된다. 우선순위는 <b className="text-fg">결과 빅 넘버 카드 (Key·BPM) ≫ 음량 카드 ≫ 분석 진행/안내</b> 순이다.
      1페이지(자르기)와 동일한 카드/사이드바/타입 시스템을 그대로 계승한다.
    </DocP>

    <DocH3>그리드 (1220px 메인)</DocH3>
    <DocList items={[
      "외곽 패딩 32px / 카드 간 세로 간격 20px",
      "카드 라운드 16px, 보더 1px solid #1F2742, shadow-card",
      "결과 영역만 3분할: Key 카드 1fr / BPM 카드 1fr / 안내 카드 1fr (gap 20px)",
      "결과 빅 넘버는 64px num — 페이지에서 가장 큰 시각 앵커",
    ]}/>

    <DocH3>섹션 순서 (위 → 아래)</DocH3>
    <SpecTable
      head={['#', '섹션', '높이(권장)', '역할']}
      rows={[
        ['1', '페이지 헤더', '64px',  '제목 + 설명 + [이용 가이드]'],
        ['2', '업로드 + 파일 정보 카드', '180px', '드롭존(좌, 380px) / 메타 그리드(우)'],
        ['3', '실행 바 (재생 + 분석 실행)', '72px', '좌: 원본 재생 / 우: 분석 실행 (primary)'],
        ['4', '결과 카드 3분할 (Key · BPM · 안내)', '220px', '빅 넘버 결과 + 안내 카드'],
        ['5', '음량 카드 (dBFS) + 분석 진행 카드', '180px', '서브 메트릭 + 단계별 progress'],
        ['6', '하단 디스클레이머 스트립', '72px', '실패 시 Unknown 안내 / 참고용 안내'],
      ]}
    />
    <DocP>
      자르기 페이지와 달리 파형/핸들이 없으므로 페이지 시각 비중이 <b className="text-fg">결과 카드</b>에 집중된다.
      Key는 cyan, BPM은 cyan(같은 톤)으로 묶어 '같은 분석 결과'라는 인지를 강화하고, Unknown 시 warn(amber)으로 톤 전환한다.
    </DocP>
  </DocSection>
);

// === Spec doc — Section 2: 컴포넌트 ===
const Sec2_Components = () => (
  <DocSection n="02" id="components" title="주요 컴포넌트 목록">
    <SpecTable
      head={['컴포넌트', 'props', '역할', '비고']}
      rows={[
        ['<Sidebar/>',          'active="analyze"',              '5개 페이지 메뉴',                                    '공통 (page1과 동일)'],
        ['<PageHeader/>',       '-',                             '제목·설명·이용 가이드',                              '공통'],
        ['<UploadFileCard/>',   'state, file',                   '드롭존 + 파일 메타 그리드 (5칸)',                    '공통 (page1과 동일)'],
        ['<RunBar/>',           'state',                         '원본 재생 + 분석 실행 (primary)',                    '신규'],
        ['<ResultBigCard/>',    'icon,title,state,value,unit,caption,captionSub,progress,unknown', 'Key/BPM 빅 넘버 카드', '핵심'],
        ['<NoticeCard/>',       '-',                             '참고용 안내 카드 (소형 파형 모티프)',                '신규'],
        ['<LoudnessCard/>',     'state, peak, rms, progress',    'Peak/RMS 게이지 (dBFS)',                             '신규'],
        ['<StepListCard/>',     'state, steps[]',                '디코딩/피크/Key/BPM 단계별 진행 표시',                 '신규'],
        ['<FootNotice/>',       'tone,icon,title,body',          '하단 가이드/오류 스트립',                            '공통 패턴'],
        ['<Badge/>',            'tone',                          '상태 배지 (ok / warn / err / cyan / mute / indigo)', '공통'],
        ['<ActionBtn/>',        'icon,label,primary,disabled',   '동일 컨트롤 버튼 단일 컴포넌트',                     '공통'],
      ]}
    />
  </DocSection>
);

window.Sec1_Layout = Sec1_Layout;
window.Sec2_Components = Sec2_Components;
