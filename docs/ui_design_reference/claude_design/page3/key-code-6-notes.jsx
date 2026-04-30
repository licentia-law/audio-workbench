// Section 6: Designer Notes
const Sec6_Notes = () => (
  <DocSection title="6. 디자이너 메모 / 검토 포인트">
    <DocList items={[
      'Key 분석 실패(Unknown) 케이스: 안내 카드를 항상 노출하여 semi만으로 변환하도록 유도합니다. 결과 파일명은 (key_shift_+3) 패턴.',
      '−12 ~ +12 범위 클램프. 슬라이더와 stepper, 키보드(←/→) 모두 동일 핸들러 사용.',
      'semi=0 이면 변환 버튼 비활성. "원본과 동일합니다" 마이크로카피로 이유 안내.',
      '템포는 항상 보존(pitch shift only). 결과 카드에 "템포 유지" 뱃지를 노출합니다.',
      '원본 카드의 ▶︎ 미리듣기는 실제 오디오, 결과 카드 미리듣기는 변환 후 blob을 사용합니다.',
      'semi 값에 따라 + 는 초록, − 는 빨강으로 미세하게 강조 (semiPos/semiNeg).',
    ]}/>
  </DocSection>
);
window.Sec6_Notes = Sec6_Notes;
