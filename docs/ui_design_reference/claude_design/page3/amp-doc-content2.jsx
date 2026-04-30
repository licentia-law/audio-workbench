// Designer notes section + section 6 (states/flows recap)
const SpecDoc2 = () => (
  <div className="text-fg">
    <DocSection n="06" id="design-notes" title="디자이너 노트 (Trim 페이지와의 차이)">
      <DocList items={[
        "파형 카드 우측에 dB scale grid (0 / -6 / -12 / -24 / -∞) 가 추가된다. Trim 페이지에는 시간축만 있었음.",
        "메인 인터랙션 위젯이 '슬라이더(범위 핸들 2개)'에서 '단일 핸들 + 큰 숫자 표시'로 바뀐다.",
        "레벨 미터는 Amplify에서만 등장하는 컴포넌트. 색상 토큰: 안전(brand-green) → 경계(brand-amber) → 위험(brand-red).",
        "Clipping 방지 토글은 Trim의 'Anti-pop fade' 토글과 같은 위치/스타일을 사용해 일관성 유지.",
        "결과 파일명: song(+6dB).mp3 처럼 부호 + 정수/소수 + 'dB' 형태. 음수는 song(-3.5dB).mp3.",
        "버튼 라벨은 Trim과 동일하게 '원본 재생 / 결과 미리듣기 / 적용·렌더링' 3개로 통일.",
        "에러 카피는 PRD 7.4.5의 표현을 그대로 사용 (예: '음량 증폭 처리에 실패했습니다. 다시 시도해주세요.').",
      ]}/>

      <DocH3>토큰 재사용 매핑</DocH3>
      <SpecTable
        head={['역할', '토큰', '값/노트']}
        rows={[
          ['카드 배경',         'bg-ink-800',          '#161A22'],
          ['카드 보더',         'border-line2',        'oklch(0.32 0.012 250)'],
          ['파형 — 원본',       'wave-base',           'oklch(0.55 0.04 220)'],
          ['파형 — 증폭 영역',  'wave-amp',            'brand-cyan + 35% alpha'],
          ['클리핑 표시',       'brand-red',           'oklch(0.62 0.18 25)'],
          ['Primary 버튼',     'brand-cyan',          '#5BD9FF (Trim과 동일)'],
          ['미터 안전/경계/위험', 'green/amber/red',    '동일 brand 토큰'],
        ]}
      />
    </DocSection>

    <DocSection n="07" id="api" title="백엔드 API 계약">
      <Code>{`POST /api/amplify
Content-Type: multipart/form-data

field name      type         note
file            File         audio/mpeg, ≤ 20MB, ≤ 10분
gain_db         string       "-20" ~ "+20", 소수 1자리
anti_clip       "0" | "1"    1이면 ffmpeg에 alimiter=limit=0.95 추가

Response:
  200 OK   audio/mpeg              (결과 mp3 binary)
           X-Amp-Rms-Dbfs: -8.2    (결과 RMS dBFS)
           X-Amp-Peak-Dbfs: -0.5   (결과 Peak dBFS)
  400      { error: "INVALID_FILE" | "TOO_LARGE" | "TOO_LONG" }
  500      { error: "PROCESSING_FAILED" }`}</Code>
      <DocList items={[
        "ffmpeg 명령 예: ffmpeg -i in.mp3 -af \"volume=6dB,alimiter=limit=0.95\" -codec:a libmp3lame -b:a 192k out.mp3",
        "anti_clip=0 인 경우 alimiter 없이 volume 필터만 적용.",
        "결과 헤더의 dBFS 값으로 success 화면 메터를 갱신한다.",
      ]}/>
    </DocSection>
  </div>
);
window.SpecDoc2 = SpecDoc2;
