import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  History,
  Award,
  HeartHandshake,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  ResumeData,
  AccessibilityLevel,
  ExperienceItem,
  EducationItem,
} from '../types';
import { PhotoUploader } from './PhotoUploader';
import {
  JOB_PRESETS,
  STRENGTH_CATEGORIZED_TAGS,
  STRENGTH_STORY_TEMPLATES,
  ACCOMMODATION_PRESETS,
  EDUCATION_PRESETS,
  LEAVE_REASON_PRESETS,
} from '../data/presets';
import { speakText } from '../utils/pdfExport';

interface BirthDateSelectProps {
  value: string;
  onChange: (val: string) => void;
  highContrast: boolean;
}

const BirthDateSelect: React.FC<BirthDateSelectProps> = ({
  value,
  onChange,
  highContrast,
}) => {
  const parseValue = (str: string) => {
    if (!str) return { y: '', m: '', d: '' };
    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length >= 3) {
      const y = numbers[0].length === 4 ? numbers[0] : '';
      const m = String(parseInt(numbers[1], 10));
      const d = String(parseInt(numbers[2], 10));
      return { y, m, d };
    } else if (numbers && numbers.length === 2 && numbers[0].length === 4) {
      return { y: numbers[0], m: String(parseInt(numbers[1], 10)), d: '' };
    } else if (numbers && numbers.length === 1 && numbers[0].length === 4) {
      return { y: numbers[0], m: '', d: '' };
    }
    return { y: '', m: '', d: '' };
  };

  const parsed = parseValue(value);
  const [year, setYear] = useState<string>(parsed.y);
  const [month, setMonth] = useState<string>(parsed.m);
  const [day, setDay] = useState<string>(parsed.d);

  useEffect(() => {
    const p = parseValue(value);
    setYear(p.y);
    setMonth(p.m);
    setDay(p.d);
  }, [value]);

  const handleUpdate = (newY: string, newM: string, newD: string) => {
    setYear(newY);
    setMonth(newM);
    setDay(newD);

    if (!newY && !newM && !newD) {
      onChange('');
      return;
    }

    if (newY && newM && newD) {
      const maxDaysInMonth = new Date(
        parseInt(newY, 10),
        parseInt(newM, 10),
        0
      ).getDate();
      const safeDay = Math.min(parseInt(newD, 10), maxDaysInMonth);
      onChange(
        `${newY}년 ${String(newM).padStart(2, '0')}월 ${String(safeDay).padStart(
          2,
          '0'
        )}일`
      );
    } else if (newY && newM) {
      onChange(`${newY}년 ${String(newM).padStart(2, '0')}월`);
    } else if (newY) {
      onChange(`${newY}년`);
    } else {
      onChange('');
    }
  };

  const maxDays =
    year && month
      ? new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate()
      : 31;

  const currentYear = new Date().getFullYear();
  const maxBirthYear = currentYear - 14;
  const minBirthYear = 1945;
  const years = Array.from(
    { length: maxBirthYear - minBirthYear + 1 },
    (_, i) => maxBirthYear - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  let ageDisplay = '';
  if (year && month && day) {
    const bYear = parseInt(year, 10);
    const age = currentYear - bYear;
    ageDisplay = `만 ${age >= 0 ? age : 0}세`;
  }

  const selectStyle = `w-full px-2 py-2.5 sm:px-3 sm:py-3 rounded-xl border text-sm sm:text-base font-semibold transition cursor-pointer appearance-none bg-no-repeat pr-6 ${
    highContrast
      ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-2 focus:ring-yellow-400'
      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white'
  }`;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="relative">
          <select
            value={year}
            onChange={(e) => handleUpdate(e.target.value, month, day)}
            className={selectStyle}
            aria-label="생년 선택"
          >
            <option value="">년도</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}년
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            ▼
          </span>
        </div>

        <div className="relative">
          <select
            value={month}
            onChange={(e) => handleUpdate(year, e.target.value, day)}
            className={selectStyle}
            aria-label="생월 선택"
          >
            <option value="">월</option>
            {months.map((m) => (
              <option key={m} value={String(m)}>
                {m}월
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            ▼
          </span>
        </div>

        <div className="relative">
          <select
            value={day}
            onChange={(e) => handleUpdate(year, month, e.target.value)}
            className={selectStyle}
            aria-label="생일 선택"
          >
            <option value="">일</option>
            {days.map((d) => (
              <option key={d} value={String(d)}>
                {d}일
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            ▼
          </span>
        </div>
      </div>

      {year && month && day ? (
        <div
          className={`flex items-center justify-between text-xs px-2.5 py-1 rounded-lg ${
            highContrast
              ? 'bg-zinc-900 text-yellow-300'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          <span className="font-medium truncate">
            {year}년 {month}월 {day}일
          </span>
          {ageDisplay && (
            <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-white shadow-2xs border border-emerald-200 text-emerald-700 ml-1 shrink-0">
              {ageDisplay}
            </span>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 pl-1">
          년, 월, 일을 순서대로 선택해주세요
        </p>
      )}
    </div>
  );
};

interface QuestionWizardProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  fontSize: AccessibilityLevel;
  highContrast: boolean;
  onFinish: () => void;
}

export const QuestionWizard: React.FC<QuestionWizardProps> = ({
  data,
  onChange,
  fontSize,
  highContrast,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [polishingField, setPolishingField] = useState<string | null>(null);

  const getTextSizeClass = (type: 'title' | 'question' | 'body' | 'preset') => {
    switch (fontSize) {
      case 'xlarge':
        if (type === 'title') return 'text-3xl font-black';
        if (type === 'question') return 'text-2xl font-black text-slate-900';
        if (type === 'body') return 'text-xl font-medium';
        return 'text-lg font-bold';
      case 'large':
        if (type === 'title') return 'text-2xl font-extrabold';
        if (type === 'question') return 'text-xl font-bold text-slate-900';
        if (type === 'body') return 'text-lg font-medium';
        return 'text-base font-semibold';
      default:
        if (type === 'title') return 'text-xl font-bold';
        if (type === 'question') return 'text-lg font-bold text-slate-800';
        if (type === 'body') return 'text-base font-normal';
        return 'text-sm font-medium';
    }
  };

  const steps = [
    { id: 1, title: '기본 정보', icon: User },
    { id: 2, title: '하고 싶은 일', icon: Briefcase },
    { id: 3, title: '공부와 배움', icon: GraduationCap },
    { id: 4, title: '일해본 경험', icon: History },
    { id: 5, title: '나의 장점', icon: Award },
    { id: 6, title: '필요한 배려', icon: HeartHandshake },
  ];

  const handleReadQuestion = (text: string) => {
    speakText(text);
  };

  const handleAiPolish = async (
    questionTitle: string,
    rawText: string,
    onSuccess: (polished: string) => void
  ) => {
    if (!rawText.trim()) {
      alert('문장을 먼저 입력해 주시면 더 멋진 글 표현으로 다듬어 드릴게요!');
      return;
    }
    setPolishingField(questionTitle);
    try {
      const res = await fetch('/api/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionTitle, rawText }),
      });
      const result = await res.json();
      if (result.polishedText) {
        onSuccess(result.polishedText);
      } else {
        alert('AI 문장 다듬기를 완료하지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('네트워크 연결 문제로 문장을 다듬지 못했습니다.');
    } finally {
      setPolishingField(null);
    }
  };

  const updatePersonal = (field: keyof ResumeData['personal'], value: any) => {
    onChange({
      ...data,
      personal: { ...data.personal, [field]: value },
    });
  };

  const updateJobGoal = (field: keyof ResumeData['jobGoal'], value: string) => {
    onChange({
      ...data,
      jobGoal: { ...data.jobGoal, [field]: value },
    });
  };

  const educationsList: EducationItem[] =
    data.educations && data.educations.length > 0
      ? data.educations
      : [
          {
            id: 'edu-default',
            schoolName: data.education?.schoolName || '',
            graduationStatus: data.education?.graduationStatus || '졸업',
            period: data.education?.period || '',
          },
        ];

  const addEducation = (initialSchoolName: string = '') => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      schoolName: initialSchoolName,
      graduationStatus: '졸업',
      period: '',
    };
    const updated = [...educationsList, newItem];
    onChange({
      ...data,
      education: updated[0],
      educations: updated,
    });
  };

  const updateEducationItem = (
    id: string,
    field: keyof EducationItem,
    value: string
  ) => {
    const updated = educationsList.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    onChange({
      ...data,
      education: updated[0],
      educations: updated,
    });
  };

  const removeEducation = (id: string) => {
    const updated = educationsList.filter((edu) => edu.id !== id);
    onChange({
      ...data,
      education: updated[0] || {
        schoolName: '',
        graduationStatus: '졸업',
        period: '',
      },
      educations: updated,
    });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      title: '',
      role: '',
      period: '',
      description: '',
      leaveReason: '',
    };
    onChange({
      ...data,
      experiences: [...data.experiences, newExp],
    });
  };

  const updateExperience = (
    id: string,
    field: keyof ExperienceItem,
    value: string
  ) => {
    onChange({
      ...data,
      experiences: data.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  const toggleStrengthTag = (tag: string) => {
    const currentTags = data.strength.tags || [];
    const exists = currentTags.includes(tag);
    const updated = exists
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onChange({
      ...data,
      strength: { ...data.strength, tags: updated },
    });
  };

  const appendStoryTemplate = (sentence: string) => {
    const current = data.strength.myStory || '';
    if (current.includes(sentence)) return;
    const updated = current ? `${current.trim()}\n${sentence}` : sentence;
    onChange({
      ...data,
      strength: { ...data.strength, myStory: updated },
    });
  };

  return (
    <div
      className={`rounded-3xl border p-4 sm:p-6 shadow-sm transition-all ${
        highContrast
          ? 'bg-zinc-950 text-yellow-300 border-yellow-400'
          : 'bg-[#f8f7f2] text-[#3d3d3d] border-[#e8e6df]'
      }`}
    >
      {/* Step Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 overflow-x-auto pb-2 gap-1.5">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl whitespace-nowrap transition-all ${
                  isActive
                    ? highContrast
                      ? 'bg-yellow-400 text-black font-extrabold ring-2 ring-yellow-300'
                      : 'bg-[#7a8d7c] text-white font-bold shadow-sm'
                    : isCompleted
                    ? highContrast
                      ? 'bg-zinc-800 text-yellow-300'
                      : 'bg-[#f0f2f0] text-[#7a8d7c] hover:bg-[#e8e6df]'
                    : highContrast
                    ? 'bg-zinc-900 text-zinc-500'
                    : 'bg-white text-[#8e8d88] hover:bg-[#f0f2f0] border border-[#e8e6df]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl ${
                    isActive
                      ? highContrast
                        ? 'bg-black text-yellow-400'
                        : 'bg-[#647566] text-white'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold">
                  {step.id}. {step.title}
                </span>
                {isCompleted && <Check className="w-3.5 h-3.5 text-[#7a8d7c]" />}
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#e8e6df] h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              highContrast ? 'bg-yellow-400' : 'bg-[#7a8d7c]'
            }`}
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Login-free guidance notice */}
      <div
        className={`mb-5 px-3.5 py-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold ${
          highContrast
            ? 'bg-zinc-900 text-yellow-300 border border-yellow-400'
            : 'bg-emerald-50/90 text-emerald-900 border border-emerald-200 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black shrink-0">
            ✓
          </span>
          <span>
            <strong>로그인 없이</strong> 모든 기능을 자유롭게 작성 · 인쇄 · PDF 저장 · 온라인 제출하실 수 있습니다.
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 pl-6 sm:pl-0">
          작성 중인 내용은 현재 브라우저에 실시간 자동 보관됩니다
        </span>
      </div>

      {/* Step Content Card */}
      <div className="min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: 기본 정보 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-white p-4 rounded-2xl border border-[#e8e6df] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#7a8d7c] text-white rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 1. 작성하시는 분의 기본 정보를 알려주세요
                  </h2>
                  <p className="text-xs text-[#8e8d88] mt-0.5">
                    이름, 생년월일, 연락처를 정확히 입력하면 연락을 쉽게 받을 수 있어요.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 1. 작성하시는 분의 기본 정보를 알려주세요. 이름, 생년월일, 연락처를 작성해주세요.'
                  )
                }
                className="p-2 rounded-xl bg-[#f8f7f2] border border-[#e8e6df] text-[#7a8d7c] hover:bg-[#f0f2f0] transition flex items-center gap-1 text-xs font-semibold shrink-0"
                title="음성으로 질문 듣기"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Upload */}
              <div className="md:col-span-1 flex flex-col items-center">
                <label className="text-sm font-bold text-slate-700 mb-2 self-start">
                  증명사진 (선택)
                </label>
                <PhotoUploader
                  photoUrl={data.personal.photoUrl}
                  photoUploadedAt={data.personal.photoUploadedAt}
                  onChangePhoto={(url) => {
                    onChange({
                      ...data,
                      personal: {
                        ...data.personal,
                        photoUrl: url,
                        photoUploadedAt: url ? new Date().toISOString() : null,
                      },
                    });
                  }}
                  highContrast={highContrast}
                />
              </div>

              {/* Personal Details Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 홍길동"
                      value={data.personal.name}
                      onChange={(e) => updatePersonal('name', e.target.value)}
                      className={`w-full p-3 rounded-xl border text-base font-bold transition focus:ring-2 ${
                        highContrast
                          ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600/70'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400'
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1 pl-1">
                      본인의 성명을 입력해 주세요 (예: 홍길동)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      성별 (선택)
                    </label>
                    <div className="relative">
                      <select
                        value={data.personal.gender || '남성'}
                        onChange={(e) => updatePersonal('gender', e.target.value)}
                        className={`w-full p-3 rounded-xl border text-base font-semibold transition cursor-pointer appearance-none pr-8 ${
                          highContrast
                            ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-2 focus:ring-yellow-400'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white'
                        }`}
                        aria-label="성별 드롭다운 선택"
                      >
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                        <option value="선택안함">선택안함</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    생년월일 (드롭다운) <span className="text-red-500">*</span>
                  </label>
                  <BirthDateSelect
                    value={data.personal.birthDate}
                    onChange={(val) => updatePersonal('birthDate', val)}
                    highContrast={highContrast}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      연락처 (본인 전화)
                    </label>
                    <input
                      type="text"
                      placeholder="예: 010-1234-5678"
                      value={data.personal.phone}
                      onChange={(e) => updatePersonal('phone', e.target.value)}
                      className={`w-full p-3 rounded-xl border text-base transition focus:ring-2 ${
                        highContrast
                          ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600/70'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      비상 연락처 (보호자/담당자)
                    </label>
                    <input
                      type="text"
                      placeholder="예: 010-9876-5432 (어머니)"
                      value={data.personal.emergencyPhone}
                      onChange={(e) => updatePersonal('emergencyPhone', e.target.value)}
                      className={`w-full p-3 rounded-xl border text-base transition focus:ring-2 ${
                        highContrast
                          ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600/70'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    사는 곳 (주소)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 경기도 수원시 팔달구 매산로 123 (또는 거주지 주소)"
                    value={data.personal.address}
                    onChange={(e) => updatePersonal('address', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-base transition focus:ring-2 ${
                      highContrast
                        ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600/70'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    장애 유형 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 지적장애, 자폐성장애, 발달장애 등"
                    value={data.personal.disabilityType}
                    onChange={(e) => updatePersonal('disabilityType', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-base transition focus:ring-2 ${
                      highContrast
                        ? 'bg-black text-yellow-300 border-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600/70'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 하고 싶은 일 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 2. 어떤 일을 하고 싶으신가요?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    원하는 직종을 아래 예시 버튼에서 누르거나 직접 적어주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 2. 어떤 일을 하고 싶으신가요? 희망 직종과 근무 시간을 선택하세요.'
                  )
                }
                className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                💡 자주 선택하는 인기 직종 (누르면 바로 입력돼요!)
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_PRESETS.map((jobPreset) => (
                  <button
                    key={jobPreset}
                    type="button"
                    onClick={() => updateJobGoal('desiredJob', jobPreset)}
                    className={`px-3.5 py-2 rounded-2xl text-sm font-bold transition border ${
                      data.jobGoal.desiredJob === jobPreset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {jobPreset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                희망 직종 직접 입력
              </label>
              <input
                type="text"
                placeholder="예: 카페 보조, 세탁 작업, 식기 세척 등"
                value={data.jobGoal.desiredJob}
                onChange={(e) => updateJobGoal('desiredJob', e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-base font-bold transition ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  희망 근무 시간 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 주 5일 오전 9시 ~ 오후 1시"
                  value={data.jobGoal.workSchedule}
                  onChange={(e) => updateJobGoal('workSchedule', e.target.value)}
                  className={`w-full p-3 rounded-xl border text-base transition ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  일 시작 가능 날짜 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 즉시 가능, 다음 달부터"
                  value={data.jobGoal.startDate}
                  onChange={(e) => updateJobGoal('startDate', e.target.value)}
                  className={`w-full p-3 rounded-xl border text-base transition ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 학력 및 교육 */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 3. 다니셨던 학교나 직업 교육 기관을 알려주세요
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    특수학교, 특수학급, 복지관 훈련 과정 등 다녔던 곳을 여러 개 추가하실 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 3. 다니셨던 학교나 교육받은 기관 이름을 적어주세요. 여러 개 추가할 수 있습니다.'
                  )
                }
                className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                💡 자주 기재하는 학교/기관 예시 (누르면 새 항목으로 추가돼요!)
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_PRESETS.map((eduPreset) => (
                  <button
                    key={eduPreset}
                    type="button"
                    onClick={() => addEducation(eduPreset)}
                    className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 transition"
                  >
                    + {eduPreset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {educationsList.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      학력 / 교육 #{idx + 1}
                    </span>
                    {educationsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        학교 / 기관 이름
                      </label>
                      <input
                        type="text"
                        placeholder="예: 수원희망특수학교 고등부, 복지관 직업훈련반"
                        value={edu.schoolName}
                        onChange={(e) =>
                          updateEducationItem(edu.id, 'schoolName', e.target.value)
                        }
                        className={`w-full p-3.5 rounded-xl border text-base font-bold transition ${
                          highContrast
                            ? 'bg-black text-yellow-300 border-yellow-400'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          졸업 / 수료 여부 (드롭다운)
                        </label>
                        <select
                          value={edu.graduationStatus}
                          onChange={(e) =>
                            updateEducationItem(
                              edu.id,
                              'graduationStatus',
                              e.target.value
                            )
                          }
                          className={`w-full p-3 rounded-xl border text-sm font-semibold transition ${
                            highContrast
                              ? 'bg-black text-yellow-300 border-yellow-400'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="졸업">졸업</option>
                          <option value="수료">수료</option>
                          <option value="재학 중">재학 중</option>
                          <option value="중퇴">중퇴</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          다녔던 기간
                        </label>
                        <input
                          type="text"
                          placeholder="예: 2020년 03월 ~ 2023년 02월"
                          value={edu.period}
                          onChange={(e) =>
                            updateEducationItem(edu.id, 'period', e.target.value)
                          }
                          className={`w-full p-3 rounded-xl border text-sm transition ${
                            highContrast
                              ? 'bg-black text-yellow-300 border-yellow-400'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addEducation('')}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>학교 / 교육 기관 추가하기</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 일해본 경험 */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 4. 일해본 경험이나 훈련 경력이 있나요?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    아르바이트, 직업훈련, 봉사활동 등 해본 적이 없으면 바로 다음 단계로 넘어가셔도 됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 4. 일해본 경험이나 봉사활동, 직업훈련 경력이 있으면 추가 버튼을 눌러 적어주세요.'
                  )
                }
                className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.experiences.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">
                    아직 등록된 일 경험이 없습니다.
                  </p>
                  <p className="text-xs text-slate-400">
                    직장, 아르바이트, 복지관 직업훈련 경험이 있다면 아래 버튼을 눌러 추가해 주세요.
                  </p>
                </div>
              ) : (
                data.experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        경험 #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 삭제
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          일했던 곳 / 기관 이름
                        </label>
                        <input
                          type="text"
                          placeholder="예: OO카페, OO작업장, OO복지관"
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience(exp.id, 'title', e.target.value)
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          했던 일 / 역할
                        </label>
                        <input
                          type="text"
                          placeholder="예: 컵 세척, 상품 포장, 청소"
                          value={exp.role}
                          onChange={(e) =>
                            updateExperience(exp.id, 'role', e.target.value)
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          일했던 기간
                        </label>
                        <input
                          type="text"
                          placeholder="예: 6개월, 2023년"
                          value={exp.period}
                          onChange={(e) =>
                            updateExperience(exp.id, 'period', e.target.value)
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            퇴사 사유 (그만둔 이유)
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400">
                            선택 입력
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="예: 계약기간 만료, 사업장 이전 등"
                          value={exp.leaveReason || ''}
                          onChange={(e) =>
                            updateExperience(exp.id, 'leaveReason', e.target.value)
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        💡 퇴사 사유 예시 선택 (누르면 바로 입력돼요)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {LEAVE_REASON_PRESETS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() =>
                              updateExperience(exp.id, 'leaveReason', reason)
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                              exp.leaveReason === reason
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            + {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        무엇을 잘했고 어떤 점을 배웠나요?
                      </label>
                      <input
                        type="text"
                        placeholder="예: 사용한 컵을 깨끗하게 정리하고 인사를 잘했습니다."
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(exp.id, 'description', e.target.value)
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={addExperience}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>일해본 경험 추가하기</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: 나의 장점 */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 5. 나의 장점과 자랑하고 싶은 점을 골라보세요
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    내 모습과 비슷한 버튼을 누르거나 아래에 짧은 자기소개를 적어주세요.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 5. 나의 장점과 잘하는 점을 선택하고 자기소개를 작성해주세요.'
                  )
                }
                className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div className="space-y-4">
              {STRENGTH_CATEGORIZED_TAGS.map((group) => (
                <div
                  key={group.category}
                  className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5"
                >
                  <p className="text-xs font-extrabold text-emerald-800">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => {
                      const active = (data.strength.tags || []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleStrengthTag(tag)}
                          className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">
                💡 추천 자기소개 문장 (누르면 글상자에 들어가요)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STRENGTH_STORY_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => appendStoryTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-left transition"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  나의 이야기 (자기소개)
                </label>
                <button
                  type="button"
                  disabled={polishingField === '자기소개 및 장점'}
                  onClick={() =>
                    handleAiPolish(
                      '자기소개 및 장점',
                      data.strength.myStory,
                      (polished) =>
                        onChange({
                          ...data,
                          strength: { ...data.strength, myStory: polished },
                        })
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {polishingField === '자기소개 및 장점'
                      ? 'AI 다듬는 중...'
                      : '✨ AI 문장 다듬기'}
                  </span>
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="위의 카테고리별 키워드와 추천 문장을 클릭하시거나, 직접 자랑하고 싶은 나의 이야기와 마음가짐을 적어주세요."
                value={data.strength.myStory}
                onChange={(e) =>
                  onChange({
                    ...data,
                    strength: { ...data.strength, myStory: e.target.value },
                  })
                }
                className={`w-full p-3.5 rounded-xl border text-sm font-medium leading-relaxed transition ${
                  highContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : 'bg-white border-[#e8e6df] text-[#2d332e] focus:border-[#7a8d7c]'
                }`}
              />
            </div>
          </div>
        )}

        {/* STEP 6: 필요한 배려 */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={getTextSizeClass('question')}>
                    질문 6. 일할 때 도움이 필요하거나 부탁하고 싶은 점이 있나요?
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    더 안전하고 즐겁게 일할 수 있도록 일터에 배려를 요청하는 솔직한 이야기입니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleReadQuestion(
                    '질문 6. 일할 때 도움이 필요하거나 부탁하고 싶은 점을 알려주세요.'
                  )
                }
                className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">읽어주기</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                💡 자주 요청하는 배려 사항 예시 (누르면 입력창에 들어가요)
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCOMMODATION_PRESETS.map((accPreset) => (
                  <button
                    key={accPreset}
                    type="button"
                    onClick={() => {
                      const current = data.accommodations.supportNeeded;
                      const updated = current
                        ? `${current}\n${accPreset}`
                        : accPreset;
                      onChange({
                        ...data,
                        accommodations: {
                          ...data.accommodations,
                          supportNeeded: updated,
                        },
                      });
                    }}
                    className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-white hover:bg-emerald-50 text-slate-800 transition border border-slate-200 text-left"
                  >
                    + {accPreset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-slate-700">
                    도움이 필요한 점 / 요청 사항
                  </label>
                  <button
                    type="button"
                    disabled={polishingField === '배려사항'}
                    onClick={() =>
                      handleAiPolish(
                        '일할 때 필요한 배려 사항',
                        data.accommodations.supportNeeded,
                        (polished) =>
                          onChange({
                            ...data,
                            accommodations: {
                              ...data.accommodations,
                              supportNeeded: polished,
                            },
                          })
                      )
                    }
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {polishingField === '배려사항'
                        ? 'AI 문장 다듬는 중...'
                        : '✨ AI 문장 정중하게 다듬기'}
                    </span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="예: 작업 순서를 그림표나 쉬운 글자로 적어주시면 훨씬 정확하게 일할 수 있습니다."
                  value={data.accommodations.supportNeeded}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      accommodations: {
                        ...data.accommodations,
                        supportNeeded: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-3 rounded-xl border text-base font-medium transition ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  취미 및 특기
                </label>
                <input
                  type="text"
                  placeholder="예: 음악 듣기, 산책, 운동, 블록 맞추기"
                  value={data.accommodations.hobbies}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      accommodations: {
                        ...data.accommodations,
                        hobbies: e.target.value,
                      },
                    })
                  }
                  className={`w-full p-3 rounded-xl border text-base transition ${
                    highContrast
                      ? 'bg-black text-yellow-300 border-yellow-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-4 border-t border-[#e8e6df] flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2.5 rounded-xl border border-[#e8e6df] bg-white hover:bg-[#f0f2f0] text-[#4a544b] font-bold text-sm transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 질문</span>
          </button>

          <span className="text-xs font-bold text-[#8e8d88]">
            {currentStep} / {steps.length} 단계
          </span>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={() =>
                setCurrentStep((prev) => Math.min(steps.length, prev + 1))
              }
              className="px-5 py-2.5 rounded-xl bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <span>다음 질문</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              <span>완성된 이력서 보기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
