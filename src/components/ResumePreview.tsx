import React from 'react';
import {
  Download,
  Printer,
  Edit3,
  User,
  Briefcase,
  GraduationCap,
  History,
  Award,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  onEdit: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  highContrast: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  onEdit,
  onExportPdf,
  isExportingPdf,
  highContrast,
}) => {
  const { personal, jobGoal, education, educations, experiences, strength, accommodations } =
    data;

  const eduList =
    educations && educations.length > 0
      ? educations
      : education && education.schoolName
      ? [{ id: 'legacy-edu', ...education }]
      : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div
        className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-xs print:hidden ${
          highContrast
            ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
            : 'bg-[#f8f7f2] text-[#3d3d3d] border-[#e8e6df]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#7a8d7c] text-white rounded-xl shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#4a544b]">
              이력서가 정갈하게 완성되었습니다!
            </h2>
            <p className="text-xs text-[#8e8d88]">
              오탈자를 확인하고 &apos;프린트&apos; 또는 &apos;PDF 다운로드&apos;를 누르면 로그인 없이 바로 출력 및 저장할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white hover:bg-[#f0f2f0] text-[#4a544b] border border-[#e8e6df] font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-[#7a8d7c]" />
            <span>질문 수정하기</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#4a544b] hover:bg-[#3d3d3d] text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>프린트</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="px-5 py-2 bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? '생성 중...' : 'PDF 다운로드'}</span>
          </button>
        </div>
      </div>

      {/* Printable / Capturable Resume Document Container */}
      <div className="flex justify-center">
        <div
          id="resume-pdf-content"
          className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 border border-[#e8e6df] shadow-lg rounded-sm print:shadow-none print:border-none print:p-0"
          style={{ fontFamily: 'Pretendard, "Noto Sans KR", sans-serif' }}
        >
          {/* Resume Title Header */}
          <div className="border-b-4 border-[#7a8d7c] pb-4 mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-[#7a8d7c] tracking-wider mb-1">
                수원시장애인종합복지관 알기 쉬운 이력서
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                이 력 서
              </h1>
            </div>
            <div className="text-right text-xs text-slate-500">
              작성일: {new Date().toLocaleDateString('ko-KR')}
            </div>
          </div>

          {/* Personal Info & Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 items-start">
            {/* Photo Box */}
            <div className="sm:col-span-1 flex justify-center">
              <div className="w-32 h-42 border border-slate-300 bg-slate-50 rounded-md overflow-hidden flex items-center justify-center">
                {personal.photoUrl ? (
                  <img
                    src={personal.photoUrl}
                    alt="사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-[#8e8d88]">
                    <User className="w-12 h-12 mx-auto mb-1 stroke-1" />
                    <span className="text-xs">사진 미등록</span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info Table */}
            <div className="sm:col-span-3 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">성명 (Name)</span>
                  <span className="text-lg font-bold text-slate-900">
                    {personal.name || '미입력'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">생년월일 (Birth)</span>
                  <span className="font-semibold text-slate-800">
                    {personal.birthDate || '미입력'}{' '}
                    {personal.gender ? `(${personal.gender})` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">연락처 (Phone)</span>
                  <span className="font-semibold text-slate-800">
                    {personal.phone || '미입력'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">
                    비상 연락처 (Emergency)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {personal.emergencyPhone || '미입력'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">주소 (Address)</span>
                  <span className="font-semibold text-slate-800">
                    {personal.address || '미입력'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">장애 유형</span>
                  <span className="font-semibold text-slate-800">
                    {personal.disabilityType || '미입력'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Desired Job */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7a8d7c]" />
              희망 직종 및 근무 형태
            </h3>
            <div className="px-3 text-sm text-slate-800 space-y-1">
              <p className="font-bold text-base">
                {jobGoal.desiredJob || '작성된 희망 직종이 없습니다.'}
              </p>
              {(jobGoal.workSchedule || jobGoal.startDate) && (
                <p className="text-xs text-slate-600">
                  {jobGoal.workSchedule && `희망 근무시간: ${jobGoal.workSchedule}`}
                  {jobGoal.workSchedule && jobGoal.startDate && ' / '}
                  {jobGoal.startDate && `출근 가능일: ${jobGoal.startDate}`}
                </p>
              )}
            </div>
          </div>

          {/* 2. Education */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7a8d7c]" />
              학력 및 직업교육 사항
            </h3>
            <div className="px-3 space-y-2 text-sm">
              {eduList.length > 0 ? (
                eduList.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900">
                        {edu.schoolName || '학교명 미입력'}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                        {edu.graduationStatus}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{edu.period || ''}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs">기재된 학력/교육 사항이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 3. Experiences */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-[#7a8d7c]" />
              일해본 경험 및 훈련 경력
            </h3>
            <div className="px-3 space-y-3 text-sm">
              {experiences && experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div key={exp.id} className="border-b border-slate-100 pb-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">
                        {exp.title || '근무지 미입력'}{' '}
                        {exp.role && (
                          <span className="font-medium text-slate-600">({exp.role})</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">{exp.period}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        • {exp.description}
                      </p>
                    )}
                    {exp.leaveReason && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        퇴사/종료 사유: {exp.leaveReason}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs">기재된 경력 사항이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 4. Strengths */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7a8d7c]" />
              나의 강점 및 자기소개
            </h3>
            <div className="px-3 space-y-2.5 text-sm">
              {strength.tags && strength.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {strength.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-[#f0f2f0] text-[#4a544b] rounded-lg font-semibold border border-[#d6ddd6]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {strength.myStory || '작성된 자기소개 내용이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 5. Accommodations & Hobbies */}
          <div className="mb-6">
            <h3 className="text-sm font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#7a8d7c]" />
              작업 시 필요한 배려 및 취미·특기
            </h3>
            <div className="px-3 space-y-2 text-sm text-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-500 block">필요한 배려/지원:</span>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {accommodations.supportNeeded || '특이사항 없음'}
                </p>
              </div>
              {accommodations.hobbies && (
                <div>
                  <span className="text-xs font-bold text-slate-500 block">취미 및 특기:</span>
                  <p>{accommodations.hobbies}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Declaration */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              위의 기재 내용은 사실과 틀림없습니다.
            </p>
            <p className="text-base font-bold text-slate-900">
              작성자: {personal.name || '____________'} (서명)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
