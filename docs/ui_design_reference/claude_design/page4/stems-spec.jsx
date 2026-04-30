// Stems spec doc: layout / components / states / flows

const StemSpecDoc = () => (
  <div className="text-fg">
    <DocSection n="01" id="layout" title="최종 레이아웃 구조">
      <DocP>
        데스크톱 1440px, 좌측 220px 사이드바 + 1220px 메인 2단. 메인은 위에서 아래로
        <b className="text-fg"> 헤더 → 업로드+분리 카드 → 4채널 믹서 그리드 → 마스터 패널 → 안내</b> 5개 섹션이다.
      </DocP>
      <DocH3>그리드</DocH3>
      <DocList items={[
        "외곽 패딩 32 / 카드 간 세로 20 / 카드 라운드 16 / 보더 1px solid #1F2742",
        "업로드 카드: 380(드롭존) / 1fr(메타) / 280(액션) 3분할",
        "믹서 그리드: 4 channels × (~270px), gap 16, 동일 높이",
        "마스터 패널: 1fr(파형+재생) / 360(마스터 음량) / 220(다운로드) 3분할",
      ]}/>
      <SpecTable
        head={['#','섹션','높이(권장)','역할']}
        rows={[
          ['1','페이지 헤더','64px','제목·설명·이용 가이드'],
          ['2','업로드 + 분리 실행 카드','220px','드롭존 / 메타 5칸 / [스템 분리] primary'],
          ['3','분리 진행 표시','40px','동일 카드 하단 progress + 완료 배지'],
          ['4','4채널 믹서','520px','보컬·드럼·베이스·그 외 (각각 미니 파형 + 페이더 + 다운로드)'],
          ['5','마스터 믹스 패널','152px','전체 mix 재생 + 마스터 슬라이더 + Mixed 다운로드'],
          ['6','안내 카드','96px','품질 면책 + 처리 시간 안내'],
        ]}
      />
    </DocSection>

    <DocSection n="02" id="components" title="주요 컴포넌트 목록">
      <SpecTable
        head={['컴포넌트','props','역할','비고']}
        rows={[
          ['<StemSidebar/>',     'active="stems"',                                    '5개 페이지 메뉴',                       '공통, active만 변경'],
          ['<StemPageHeader/>',  '-',                                                 '제목·설명·이용 가이드',                  '공통'],
          ['<StemUploadCard/>',  'state, file',                                       '업로드 + 메타 5칸 + [분리 실행] + 진행률',  '핵심 헤더'],
          ['<StemChannel/>',     'stem, value, muted, solo, playing, onChange…',      '단일 stem 채널 (헤더+미니파형+페이더+DL)', '4번 반복'],
          ['<VerticalFader/>',   'value(dB), onChange, color, muted',                 '세로 페이더 + 노브 + 0 dB 틱',         '드래그 가능'],
          ['<StemMiniWave/>',    'peaks, color, playing, muted, progress',            '채널별 미니 파형',                      '클립 그라디언트'],
          ['<StemMasterPanel/>', 'state, fileBase, masterDb, playing',                'mix 재생 / master 슬라이더 / Mixed DL',   '풀폭'],
          ['<StemNoticeCard/>',  'state',                                             '품질 안내 / 오류 시 사유',                 'AI 면책'],
        ]}
      />
    </DocSection>

    <DocSection n="03" id="states" title="상태별 화면 차이 (empty / uploaded / processing / success / error)">
      <SpecTable
        head={['요소','empty','uploaded','processing','success','error']}
        rows={[
          ['업로드 카드',      '드롭존 강조',                       '메타 5칸 + [분리 실행] 활성',          '메타 유지 + [분리 중…] disabled',     '메타 + [다시 분리]',                     '메타 + 에러 배지'],
          ['진행률 바',       '없음',                              '없음',                                '0~100% 애니메이션 + "1~2분 소요"',     '100% + 분리 완료 배지',                  '32% + err 컬러 + "분리 실패"'],
          ['믹서 그리드',     '플레이스홀더 4칸 (회색 사선)',          '플레이스홀더 4칸 + "분리 실행을 누르세요"',   '4칸 skeleton + 진행 표시',           '4채널 활성 (페이더/뮤트/다운로드)',         '4칸 비활성 + 재시도 안내'],
          ['마스터 패널',     '대기 배지',                          '대기 배지',                            '대기 배지 (slider 비활성)',           'mix 준비됨 + 재생/다운로드 활성',          '대기 배지'],
          ['안내 카드',       '품질 안내 3줄',                     '동일',                                  '동일',                            '동일',                                 '+ 실패 사유 1줄(err)'],
        ]}
      />
      <DocH3>버튼 활성/비활성 매트릭스</DocH3>
      <SpecTable
        head={['버튼','empty','uploaded','processing','success','error']}
        rows={[
          ['스템 분리 실행',   '✗','✓','✗ (분리 중…)','✓ (다시 분리)','✓ (재시도)'],
          ['채널 재생 ▶',     '✗','✗','✗','✓','✗'],
          ['채널 페이더',      '✗','✗','✗','✓','✗'],
          ['채널 M / S',      '✗','✗','✗','✓','✗'],
          ['채널 다운로드',    '✗','✗','✗','✓','✗'],
          ['전체 Mix 재생',   '✗','✗','✗','✓','✗'],
          ['Mixed 다운로드',  '✗','✗','✗','✓','✗'],
        ]}
      />
    </DocSection>

    <DocSection n="04" id="flows" title="사용자 액션 흐름">
      <DocH3>Happy path</DocH3>
      <Code>{`(empty)
  └─ mp3 업로드 → 검증 (≤10분 / ≤20MB / mp3)
      └─ (uploaded) — 메타 표시, [스템 분리 실행] 활성
          └─ 클릭 → POST /api/stems/separate
              └─ (processing) — Demucs 4-stem (1~2분)
                  └─ 진행률 0→100%, 다른 페이지로 이동해도 백그라운드 유지
                  └─ 완료 → (success)
                      ├─ 채널별: 페이더 [-24, +12] dB / Mute / Solo / 미니파형 재생
                      ├─ 마스터: 전체 Mix 재생 (실시간 반영) + master dB
                      ├─ 다운로드: song(vocals|drums|bass|other).mp3
                      └─ Mixed: song(mixed).mp3 (현재 페이더 값으로 렌더)`}</Code>

      <DocH3>핵심 인터랙션</DocH3>
      <DocList items={[
        "페이더 드래그 → 즉시 채널 게인 반영, mix 재생 중이면 실시간 청감 변경 (web audio gain node).",
        "M(뮤트): 해당 채널 무음, 미니 파형/메터 dim 처리. mix 결과에서 제외.",
        "S(솔로): 활성 채널만 재생. 다른 채널 자동 implicit-mute (UI는 정상색 유지하되 메터만 0).",
        "Mute / Solo는 mix 재생에 즉시 반영되지만 다운로드 파일에는 채널 페이더 값만 적용 (Mute는 0배).",
        "마스터 음량은 전체 Mix 재생/믹스 다운로드에만 적용. 개별 stem 다운로드는 영향 없음.",
        "분리 실패 시 해당 카드 우상단 err 배지 + 안내 카드에 사유 1줄 추가. [다시 분리] 버튼은 재시도 의미.",
      ]}/>

      <DocH3>키보드</DocH3>
      <DocList items={[
        <span><Kbd>Space</Kbd> 전체 Mix 재생/정지</span>,
        <span><Kbd>1</Kbd>/<Kbd>2</Kbd>/<Kbd>3</Kbd>/<Kbd>4</Kbd> 채널 솔로 토글 (보컬/드럼/베이스/그 외)</span>,
        <span><Kbd>M</Kbd>+숫자 해당 채널 뮤트 토글</span>,
        <span><Kbd>R</Kbd> 모든 페이더 0 dB로 초기화</span>,
        <span><Kbd>Enter</Kbd> Mixed 다운로드</span>,
      ]}/>

      <DocH3>파일명 정책</DocH3>
      <Code>{`개별: \${base}(vocals).mp3, \${base}(drums).mp3,
       \${base}(bass).mp3,   \${base}(other).mp3
믹스: \${base}(mixed).mp3   // 현재 페이더 + 마스터 값으로 렌더`}</Code>
    </DocSection>
  </div>
);

window.StemSpecDoc = StemSpecDoc;
