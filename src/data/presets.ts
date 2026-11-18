import { ResumeData } from '../types';

export const JOB_PRESETS = [
  '☕ 카페 보조 / 식기 세척 보조',
  '📦 물품 정리 / 단순 포장 작업',
  '🧹 사무실 / 시설 환경 미화',
  '📚 도서관 책 정리 및 라벨 부착',
  '🛒 마트 진열 및 카트 정리',
  '🍳 주방 보조 및 재료 손질',
  '📄 우편물 분류 및 문서 세단',
  '🌱 화단 가꾸기 / 농장 보조',
];

export const STRENGTH_PRESET_TAGS = [
  '⏰ 출퇴근 시간을 잘 지켜요',
  '😊 인사성이 밝고 친절해요',
  '🧹 청소와 정리를 깔끔하게 잘해요',
  '⚡ 손이 빠르고 성실해요',
  '🤝 동료들과 사이좋게 지내요',
  '📋 시키는 일을 끝까지 해내요',
  '💪 무거운 물건도 잘 들어요',
  '👀 꼼꼼하게 실수 없이 확인해요',
];

export const STRENGTH_CATEGORIZED_TAGS = [
  {
    category: '성실함과 시간 약속',
    tags: [
      '⏰ 지각이나 결근 없이 출퇴근 시간을 꼭 지켜요',
      '📋 맡은 일은 중간에 포기하지 않고 끝까지 해내요',
      '📅 정해진 작업 규칙과 순서를 성실하게 따라요',
    ],
  },
  {
    category: '태도와 대인관계',
    tags: [
      '😊 밝은 미소로 먼저 인사하고 예의 바르게 행동해요',
      '🤝 동료들과 다투지 않고 배려하며 사이좋게 지내요',
      '👂 선생님과 관리자분의 말씀을 집중해서 잘 들어요',
    ],
  },
  {
    category: '작업 능력과 꼼꼼함',
    tags: [
      '🧹 작업 공간과 도구를 항상 깨끗하게 정리 정돈해요',
      '👀 물건의 수량과 상태를 꼼꼼하게 확인해요',
      '⚡ 반복되는 작업도 지치지 않고 꾸준히 잘해요',
    ],
  },
];

export const STRENGTH_STORY_TEMPLATES = [
  '저는 매일 정해진 출근 시간을 철저히 지키며, 성실한 태도로 맡은 업무에 임합니다.',
  '밝은 미소로 동료와 손님에게 먼저 인사하며, 따뜻한 직장 분위기를 만드는 데 기여하겠습니다.',
  '정리 정돈과 청소를 꼼꼼하게 잘하며, 작업 수순을 차근차근 익혀 실수 없이 처리합니다.',
  '새로운 일을 배울 때 메모하거나 반복 연습하여 빠르게 업무에 적응하겠습니다.',
];

export const ACCOMMODATION_PRESETS = [
  '작업 지시를 쉬운 말로 천천히 설명해 주시면 잘 이해할 수 있습니다.',
  '작업 순서를 그림표나 사진 체크리스트로 붙여 주시면 실수 없이 일할 수 있습니다.',
  '처음 일할 때 1~2주 정도 옆에서 시범을 보여 주시면 금방 따라 할 수 있습니다.',
  '정기적인 휴식 시간을 안내해 주시면 집중력을 오래 유지할 수 있습니다.',
  '무거운 물건을 옮길 때는 손수레(카트)를 사용할 수 있으면 좋겠습니다.',
];

export const EDUCATION_PRESETS = [
  '특수학교 전공과 수료',
  '고등학교 특수학급 졸업',
  '장애인 복지관 직업훈련 수료',
  '직업능력개발원 훈련 수료',
  '고등학교 졸업',
];

export const LEAVE_REASON_PRESETS = [
  '계약기간 만료',
  '사업장 이전',
  '교육 과정 수료',
  '건강상의 이유',
  '개인 사정',
  '기관 재정 사정',
];

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    name: '',
    birthDate: '',
    gender: '남성',
    phone: '',
    emergencyPhone: '',
    address: '',
    disabilityType: '',
    photoUrl: null,
    photoUploadedAt: null,
  },
  jobGoal: {
    desiredJob: '☕ 카페 보조 / 식기 세척 보조',
    workSchedule: '',
    startDate: '',
  },
  education: {
    schoolName: '수원희망특수학교 고등부',
    graduationStatus: '졸업',
    period: '2015년 03월 ~ 2018년 02월',
  },
  educations: [
    {
      id: 'edu-1',
      schoolName: '수원희망특수학교 고등부',
      graduationStatus: '졸업',
      period: '2015년 03월 ~ 2018년 02월',
    },
    {
      id: 'edu-2',
      schoolName: '수원시장애인종합복지관 직업훈련반',
      graduationStatus: '수료',
      period: '2018년 03월 ~ 2018년 12월',
    },
  ],
  experiences: [
    {
      id: 'sample-1',
      title: '행복복지관 바리스타 직업훈련',
      role: '커피 추출 보조 및 컵 세척',
      period: '2023년 03월 ~ 2023년 12월 (10개월)',
      description: '손님에게 친절하게 인사하고 사용한 컵을 깨끗하게 씻고 정돈했습니다.',
      leaveReason: '교육 과정 수료',
    },
    {
      id: 'sample-2',
      title: '꿈드림 장애인 작업장',
      role: '임가공 포장 작업',
      period: '2022년 01월 ~ 2022년 11월 (11개월)',
      description: '상자를 접고 물품을 정해진 수량대로 정확하게 넣는 작업을 했습니다.',
      leaveReason: '계약기간 만료',
    },
  ],
  strength: {
    tags: [
      '⏰ 출퇴근 시간을 잘 지켜요',
      '😊 인사성이 밝고 친절해요',
      '🧹 청소와 정리를 깔끔하게 잘해요',
      '⚡ 손이 빠르고 성실해요',
    ],
    myStory:
      '저는 매일 아침 출근 시간을 철저히 지키고 정해진 작업 수순을 성실히 따릅니다. 손재주가 좋아 정돈과 포장 작업을 오차 없이 깨끗하게 처리하며, 동료들과 밝은 미소로 인사를 주고받는 모범적인 직원이 되겠습니다.',
  },
  accommodations: {
    supportNeeded:
      '작업 지시를 쉬운 말로 명확하게 설명해 주시면 감사하겠습니다. 그림이나 체크리스트가 있으면 훨씬 일을 빠르게 익힙니다.',
    hobbies: '음악 듣기, 산책하기, 블록 맞추기',
  },
  templateStyle: 'standard',
};
