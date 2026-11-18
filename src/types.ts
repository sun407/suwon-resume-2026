export type AccessibilityLevel = 'normal' | 'large' | 'xlarge';

export interface ExperienceItem {
  id: string;
  title: string;
  role: string;
  period: string;
  description: string;
  leaveReason?: string;
}

export interface EducationItem {
  id: string;
  schoolName: string;
  graduationStatus: string;
  period: string;
}

export interface ResumeData {
  personal: {
    name: string;
    birthDate: string; // 생년월일 (YYYY-MM-DD or YYYY년 MM월 DD일)
    gender: '남성' | '여성' | '선택안함';
    phone: string;
    emergencyPhone: string;
    address: string;
    disabilityType: string;
    photoUrl: string | null;
    photoUploadedAt?: string | null;
  };
  jobGoal: {
    desiredJob: string;
    workSchedule: string;
    startDate: string;
  };
  education: {
    schoolName: string;
    graduationStatus: string;
    period: string;
  };
  educations?: EducationItem[];
  experiences: ExperienceItem[];
  strength: {
    tags: string[];
    myStory: string;
  };
  accommodations: {
    supportNeeded: string;
    hobbies: string;
  };
  templateStyle: 'standard' | 'warm' | 'clean';
}
