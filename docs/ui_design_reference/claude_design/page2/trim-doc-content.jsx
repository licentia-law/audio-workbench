// === Spec doc body ===
const SpecDoc = () => (
  <div className="text-fg">
    <DocSection n="01" id="layout" title="최종 레이아웃 구조">
      <DocP>
        데스크톱 1440px 기준, 좌측 220px 사이드바 + 우측 메인 콘텐츠 (1220px) 2단 구조를 유지한다.
        메인은 세로 5섹션으로 구성되며, 우선순위는 <b className="text-fg">파형 카드 ≫ 선택 정보 ≫ 컨트롤 바 ≫ 결과 / 안내</b> 순이다.
      </DocP>

      <DocH3>그리드 (1220px 메인 영역)</DocH3>
      <DocList items={[
        "외곽 패딩 32px / 카드 간 세로 간격 20px",
        "카드 라운드 16px, 보더 1px solid #1F2742",
        "카드 내부 패딩 20px, 섹션 간 16~20px",
        "결과/안내 영역만 2분할: 결과 카드 740px + 안내 카드 410px (gap 20px)",
      ]}/>

      <DocH3>섹션 순서 (위 → 아래)</DocH3>
      <SpecTable
        head={['#', '섹션', '높이(권장)', '역할']}
        rows={[
          ['1', '페이지 헤더', '64px',  '제목 + 설명 + [이용 가이드]'],
          ['2', '업로드 + 파일 정보 카드 (한 카드)', '180px', '드롭존(좌, 380px) / 메타 카드(우, 1fr)'],
          ['3', '파형 카드 (핵심)', '320px', '눈금자·파형·시작/종료 핸들·재생 헤드·하단 툴바'],
          ['4', '선택 정보 카드 (3분할)', '128px', '시작 시점 · 종료 시점 · 선택 길이'],
          ['5', '컨트롤 바 (5버튼)', '72px', '원본 재생 / 정지 / 시작점 / 종료점 / 자르기 실행'],
          ['6', '결과 카드 + 안내 카드', '180px', '처리 전/후 차이 + 가이드/오류'],
        ]}
      />
      <DocP>
        파형 카드는 메인 콘텐츠 폭 전체(1156px 내부 폭)를 채우며 어떤 상태에서도 가장 큰 시각 비중을 차지한다.
        나머지 카드는 파형 폭에 정렬해 시선 이동을 최소화한다.
      </DocP>
    </DocSection>

    <DocSection n="02" id="components" title="주요 컴포넌트 목록">
      <SpecTable
        head={['컴포넌트', 'props', '역할', '비고']}
        rows={[
          ['<Sidebar/>',          'active',                        '5개 페이지 메뉴 + 하단 유틸',                       '공통'],
          ['<PageHeader/>',       '-',                             '제목·설명·이용 가이드',                              '공통'],
          ['<UploadFileCard/>',   'state, file',                   '드롭존 + 파일 메타 그리드 (5칸)',                    '상태별 좌/우 변형'],
          ['<WaveformCard/>',     'duration,startSec,endSec,playSec,onChange,state', '파형/눈금/핸들/재생 헤드/툴바', '핵심'],
          ['<SelectionInfo/>',    'start,end,total',               '시작/종료/길이 빅 넘버 3분할',                       '길이 < 1s 시 경고색'],
          ['<ControlBar/>',       'state',                         '원본·정지·시작점·종료점·자르기 실행 5버튼',          '자르기는 primary'],
          ['<ResultCard/>',       'state,file,len',                '결과 미리듣기 + 다운로드 / 처리중 / 비어있음 / 실패',  '상태별 컨텐츠'],
          ['<GuidanceCard/>',     'state,valid',                   '시작<종료, 최소 길이, 권장 길이 체크리스트',         '실시간 검증'],
          ['<Badge/>',            'tone',                          '상태 배지 (ok / warn / err / cyan / mute)',          '공통'],
          ['<ActionBtn/>',        'icon,label,primary,disabled',   '컨트롤 바 버튼 단일 컴포넌트',                       '공통'],
          ['<Handle/>',           'side,xPct,onMouseDown,label',   '파형 위 시작/종료 그립 + 라벨',                      'WaveformCard 내부'],
        ]}
      />
    </DocSection>

    <DocSection n="03" id="states" title="상태별 화면 차이 (empty / uploaded / processing / success / error)">
      <DocP>5가지 상태는 <b className="text-fg">동일 레이아웃</b>을 유지하고 카드 내부 콘텐츠와 버튼 활성도만 변한다. 우측 상단 Tweaks 패널로 직접 토글해 비교할 수 있다.</DocP>
      <SpecTable
        head={['요소', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['업로드 카드',    '드롭존 강조',                    '파일 메타 5칸 표시',                  '메타 유지',                   '메타 유지',                          '메타 유지 + 상단 에러 메시지'],
          ['파형',          '파일 안내 placeholder + 사선 패턴', '풀 파형 + 핸들/재생 헤드',          '파형 + 진행률 오버레이',     '파형 그대로',                        '파형 흐려짐'],
          ['선택 정보',     '--:-- 회색',                     '실시간 값',                          '값 잠금 (회색)',              '값 유지',                            '값 유지'],
          ['컨트롤 바',     '전부 비활성',                    '5버튼 모두 활성',                    '4버튼 비활성, 자르기 → 스피너', '재생/정지 활성, 자르기 활성',     '자르기만 활성 (재시도 의미)'],
          ['결과 카드',     '"파일을 업로드하면…" 안내',       '"자르기 실행을 누르세요" 안내',         '진행률 바 + 예상 시간',        '결과 플레이어 + 다운로드 버튼',     '실패 메시지 + 재시도 버튼'],
          ['안내 카드',     '회색 체크리스트',                '실시간 검증 (시작<종료 등)',           '동일',                        '"권장 길이 충족" 그린 체크',         '실패 사유 강조'],
          ['상단 배지',     '없음',                          '<Badge tone="ok">업로드 완료</Badge>', '<Badge tone="cyan">처리 중</Badge>', '<Badge tone="ok">처리 완료</Badge>', '<Badge tone="err">실패</Badge>'],
        ]}
      />

      <DocH3>버튼 활성/비활성 매트릭스</DocH3>
      <SpecTable
        head={['버튼', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['원본 재생',         '✗', '✓', '✗', '✓', '✓'],
          ['정지',              '✗', '✓', '✗', '✓', '✓'],
          ['시작점 미리듣기',    '✗', '✓', '✗', '✓', '✓'],
          ['종료점 미리듣기',    '✗', '✓', '✗', '✓', '✓'],
          ['자르기 실행',        '✗', '시작<종료 + 길이≥1s 일 때만', '✗ (스피너)', '✓ (재실행)', '✓ (재시도)'],
          ['다운로드',           '✗', '✗', '✗', '✓', '✗'],
        ]}
      />
    </DocSection>

    <DocSection n="04" id="flows" title="사용자 액션 흐름">
      <DocH3>Happy path</DocH3>
      <Code>{`(empty)
  └─ 파일 드롭 / [파일 선택]
      └─ 검증: mp3 / ≤10분 / ≤20MB
          ├─ 실패 → (error) "mp3 파일만 업로드할 수 있습니다."
          └─ 성공 → (uploaded)
                ├─ 시작 핸들 드래그 → startSec 변경, 자동 [원본 재생] 시 startSec→끝까지
                ├─ 종료 핸들 드래그 → endSec 변경, [종료점 미리듣기] → max(0, endSec-5)부터 endSec까지
                ├─ 검증: startSec < endSec, (endSec-startSec) ≥ 1s
                └─ [자르기 실행] → (processing) → 결과 생성 → (success)
                                                            ├─ [재생] 결과 미리듣기
                                                            └─ [다운로드] song(cut).mp3`}</Code>

      <DocH3>핸들 / 재생 동작 규칙 (PRD 7.1.4 매핑)</DocH3>
      <DocList items={[
        "시작 핸들을 옮긴 뒤 [원본 재생] → 해당 위치부터 끝까지 계속 재생.",
        "[정지] → 재생 위치를 멈춘다 (헤드 위치 유지).",
        "다시 [원본 재생] → 시작 핸들 위치부터 끝까지 재생.",
        "[종료점 미리듣기] → endSec - 5 부터 endSec 까지 재생. endSec - 5 < startSec 이면 가능한 범위(startSec~endSec)부터 재생.",
        "startSec ≥ endSec 또는 endSec - startSec < 1s → [자르기 실행] 비활성 + 안내 카드에서 사유 표시.",
      ]}/>

      <DocH3>키보드 (권장)</DocH3>
      <DocList items={[
        <span><Kbd>Space</Kbd> 재생 / 정지 토글</span>,
        <span><Kbd>I</Kbd> 현재 재생 위치를 시작점으로 설정</span>,
        <span><Kbd>O</Kbd> 현재 재생 위치를 종료점으로 설정</span>,
        <span><Kbd>← / →</Kbd> 재생 헤드 1초 이동, <Kbd>Shift+← / →</Kbd> 0.1초 미세 이동</span>,
        <span><Kbd>Enter</Kbd> 자르기 실행</span>,
      ]}/>
    </DocSection>
  </div>
);

window.SpecDoc = SpecDoc;
