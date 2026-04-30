// === Amplify spec doc body ===
const SpecDoc = () => (
  <div className="text-fg">
    <DocSection n="01" id="layout" title="최종 레이아웃 구조">
      <DocP>
        데스크톱 1440px 기준, 좌측 220px 사이드바 + 메인 1220px. 메인은 세로로 6섹션이며,
        우선순위는 <b className="text-fg">파형 ≫ Gain 슬라이더 / 레벨 미터 ≫ 컨트롤 바 ≫ 결과 / 안내</b>이다.
        Trim 페이지의 카드/그리드/타이포 토큰을 그대로 이어받는다.
      </DocP>
      <DocH3>섹션 순서</DocH3>
      <SpecTable
        head={['#', '섹션', '높이(권장)', '역할']}
        rows={[
          ['1', '페이지 헤더',                    '64px',  '제목 + 설명 + [이용 가이드]'],
          ['2', '업로드 + 파일 정보 카드',         '180px', '드롭존(380px) + 메타 5칸'],
          ['3', '파형 카드 + dB 스케일',           '320px', '파형 / 재생 헤드 / 우측 dB grid / 하단 transport'],
          ['4', 'Gain 슬라이더 + 레벨 미터(2분할)', '208px', '좌 720px Gain · 우 470px RMS meter'],
          ['5', '컨트롤 바 (3버튼)',              '72px',  '원본 재생 / 결과 미리듣기 / 적용·렌더링(primary)'],
          ['6', '결과 파일 카드 + 안내 카드',       '180px', '미리듣기 + 다운로드 / 가이드'],
        ]}
      />
    </DocSection>

    <DocSection n="02" id="components" title="주요 컴포넌트 목록">
      <SpecTable
        head={['컴포넌트', 'props', '역할']}
        rows={[
          ['<Sidebar/>',          'active',                          '5개 페이지 메뉴, active="amp"'],
          ['<UploadFileCard/>',   'state, file',                     '드롭존 + 파일 메타'],
          ['<AmpWaveformCard/>',  'duration, playSec, gainDb, state','파형 + dB 스케일 + 재생 헤드 + 클립 경고'],
          ['<GainSliderPanel/>',  'gainDb, onChange, antiClip',      '-20~+20 dB 슬라이더 + 빅 넘버 + Clipping 방지 토글'],
          ['<LevelMeterPanel/>',  'origDb, gainDb, antiClip',        '원본/결과(예상) RMS LED 메터 + 경고 문구'],
          ['<AmpControlBar/>',    'state',                           '원본 재생 / 결과 미리듣기 / 적용·렌더링'],
          ['<AmpResultCard/>',    'state, file, gainDb, antiClip',   'song(+6dB).mp3 미리듣기 + 다운로드'],
          ['<AmpGuidanceCard/>',  'gainDb, antiClip, willClip',      '실시간 경고 체크리스트'],
        ]}
      />
    </DocSection>

    <DocSection n="03" id="states" title="상태별 화면 차이">
      <SpecTable
        head={['요소', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['업로드 카드', '드롭존 강조',  '메타 5칸 표시',          '메타 유지',                 '메타 유지',                  '메타 유지'],
          ['파형',       'placeholder', '원본+증폭 이중 파형',      '오버레이 + 진행률',           '결과 파형(증폭 적용)',         '파형 흐려짐'],
          ['Gain 슬라이더', '비활성',     '값 조절 가능',           '값 잠금',                   '값 유지',                    '값 유지'],
          ['레벨 미터',   '회색 -∞',     '실시간 원본/예상',         '실시간 잠금',                '결과 기준',                  '회색'],
          ['컨트롤 바',   '전부 비활성',  '원본·렌더링 활성',        '렌더링→스피너',              '3버튼 모두 활성',             '렌더링만 활성(재시도)'],
          ['결과 카드',   '"파일을 업로드…" 안내', '"렌더링 누르세요" 안내', '진행률 바 + 예상시간', '미리듣기 + 다운로드', '실패 메시지 + 재시도'],
          ['상단 배지',   '없음',        'ok 업로드 완료',          'cyan 처리 중',              'ok 생성 완료',                'err 실패'],
        ]}
      />

      <DocH3>버튼 활성/비활성</DocH3>
      <SpecTable
        head={['버튼', 'empty', 'uploaded', 'processing', 'success', 'error']}
        rows={[
          ['원본 재생',     '✗', '✓', '✗', '✓', '✓'],
          ['결과 미리듣기',  '✗', '✗', '✗', '✓', '✗'],
          ['적용 / 렌더링', '✗', '✓', '✗ (스피너)', '✓ (재실행)', '✓ (재시도)'],
          ['다운로드',      '✗', '✗', '✗', '✓', '✗'],
        ]}
      />
    </DocSection>

    <DocSection n="04" id="flows" title="사용자 액션 흐름">
      <DocH3>Happy path</DocH3>
      <Code>{`(empty)
  └─ mp3 드롭 / [파일 선택]
      └─ 검증: mp3 / ≤10분 / ≤20MB
          ├─ 실패 → (error)
          └─ 성공 → (uploaded)
                ├─ Gain 슬라이더 -20 ~ +20 dB 조절 (기본 0)
                ├─ 원본 dBFS 측정 → 결과(예상) dBFS = 원본 + gain
                ├─ 결과(예상) > 0 dBFS → 클리핑 경고 표시
                ├─ Clipping 방지 토글 ON → -0.5 dBFS limiter 적용
                └─ [적용 / 렌더링] → (processing)
                       └─ 결과 생성 → (success)
                             ├─ [결과 미리듣기]
                             └─ [다운로드] song(+6.0dB).mp3`}</Code>

      <DocH3>실시간 반영 규칙 (PRD 7.4.4 매핑)</DocH3>
      <DocList items={[
        "Gain 변경 시 파형 진폭이 즉시 시각적으로 스케일 업/다운된다 (frontend Web Audio).",
        "원본 RMS dBFS는 업로드 직후 1회 계산. 결과(예상) RMS = 원본 + gain.",
        "결과(예상)가 0 dBFS를 초과할 때만 clipping 경고가 표시된다.",
        "Clipping 방지 ON → 백엔드 ffmpeg에 alimiter=limit=0.95 추가.",
        "최종 렌더링은 백엔드에서 수행, 결과 다운로드는 song(+/-N.NdB).mp3 형식.",
      ]}/>

      <DocH3>키보드</DocH3>
      <DocList items={[
        <span><Kbd>Space</Kbd> 재생 / 정지</span>,
        <span><Kbd>↑ / ↓</Kbd> gain 0.5 dB 단위 조절, <Kbd>Shift+↑/↓</Kbd> 0.1 dB 미세 조절</span>,
        <span><Kbd>0</Kbd> gain 0 dB 리셋</span>,
        <span><Kbd>Enter</Kbd> 적용 / 렌더링</span>,
      ]}/>
    </DocSection>
  </div>
);
window.SpecDoc = SpecDoc;
