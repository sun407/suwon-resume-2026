import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Edit3,
  X,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Save,
  Check,
  FileText,
  History,
} from 'lucide-react';
import {
  CloudResumeRecord,
  updateResumeAdminMeta,
  isPhotoExpired,
} from '../firebase';
import { exportResumeToPdf } from '../utils/pdfExport';

interface AdminPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CloudResumeRecord | null;
  onEditResume: (record: CloudResumeRecord) => void;
  onRefreshData?: () => void;
}

export const AdminPrintModal: React.FC<AdminPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  onEditResume,
  onRefreshData,
}) => {
  const [status, setStatus] = useState<'대기' | '검토중' | '취업연계' | '완료'>(
    record?.status || '대기'
  );
  const [adminNotes, setAdminNotes] = useState<string>(record?.adminNotes || '');
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (record) {
      setStatus(record.status || '대기');
      setAdminNotes(record.adminNotes || '');
      setSaveSuccess(false);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const { resumeData } = record;
  const {
    personal,
    jobGoal,
    education,
    educations,
    experiences,
    strength,
    accommodations,
  } = resumeData;

  const eduList =
    educations && educations.length > 0
      ? educations
      : education?.schoolName
      ? [
          {
            id: '1',
            schoolName: education.schoolName,
            graduationStatus: education.graduationStatus,
            period: education.period,
          },
        ]
      : [];

  const handleSaveMeta = async () => {
    setIsSavingMeta(true);
    setSaveSuccess(false);
    try {
      await updateResumeAdminMeta(record.id, { status, adminNotes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefreshData?.();
    } catch (err) {
      console.error(err);
      alert(
        '상태 및 상담 메모 저장에 실패했습니다. (클라우드 DB 저장을 위해 구글 관리자 계정 연결이 필요할 수 있습니다.)'
      );
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const fileName = `[수원시장애인복지관]_${personal.name || '알기쉬운'}_이력서.pdf`;
      await exportResumeToPdf('admin-print-doc-content', fileName);
    } catch (err) {
      console.error(err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const photoActive = Boolean(
    personal.photoUrl && !isPhotoExpired(record.photoUploadedAt)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-[#fdfcf9] rounded-3xl shadow-2xl flex flex-col my-auto border border-slate-200 overflow-hidden max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 print:hidden shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                관리자 출력 및 저장 창 — {personal.name || '미입력'}
              </h3>
              <p className="text-xs text-slate-500">
                접수일: {new Date(record.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditResume(record);
              }}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>이력서 수정</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>바로 인쇄</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'PDF 생성 중...' : 'PDF 파일 저장'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 print:overflow-visible print:p-0">
          {/* Admin Consultation Meta Panel (Hidden when printing) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-900">
                  진행 상태 및 상담 메모 (기관 내부용)
                </span>
                {saveSuccess && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    <Check className="w-3 h-3" /> 저장됨
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="대기">접수 대기</option>
                  <option value="검토중">상담 검토중</option>
                  <option value="취업연계">취업 연계중</option>
                  <option value="완료">연계 완료</option>
                </select>
                <button
                  onClick={handleSaveMeta}
                  disabled={isSavingMeta}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingMeta ? '저장 중...' : '상태/메모 저장'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="담당 직업재활사 상담 메모나 알선 특이사항을 기록하세요 (출력물에는 포함되지 않습니다)."
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs text-slate-800"
            />
          </div>

          {/* Printable Resume Document */}
          <div
            id="admin-print-doc-content"
            className="bg-white p-8 sm:p-10 border border-slate-200 rounded-xl shadow-xs print:border-none print:shadow-none print:p-0"
          >
            <div className="border-b-4 border-[#7a8d7c] pb-4 mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-[#7a8d7c]">
                  수원시장애인종합복지관 알기 쉬운 이력서
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  이 력 서
                </h1>
              </div>
              <span className="text-xs text-slate-500">
                접수일: {new Date(record.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6 items-start">
              <div className="sm:col-span-1 flex justify-center">
                <div className="w-30 h-40 border border-slate-300 bg-slate-50 rounded-md overflow-hidden flex items-center justify-center">
                  {photoActive && personal.photoUrl ? (
                    <img
                      src={personal.photoUrl}
                      alt="증명사진"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <User className="w-10 h-10 mx-auto mb-1" />
                      <span className="text-[11px]">
                        {personal.photoUrl ? '보관 만료(7일)' : '사진 미등록'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3 space-y-2.5 text-sm">
                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">성명</span>
                    <span className="text-base font-bold text-slate-900">
                      {personal.name || '미입력'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">
                      생년월일 (성별)
                    </span>
                    <span className="font-semibold text-slate-800">
                      {personal.birthDate || '미입력'} ({personal.gender || '선택안함'})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">연락처</span>
                    <span className="font-semibold text-slate-800">
                      {personal.phone || '미입력'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">
                      비상 연락처
                    </span>
                    <span className="font-semibold text-slate-800">
                      {personal.emergencyPhone || '미입력'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">주소</span>
                    <span className="font-semibold text-slate-800">
                      {personal.address || '미입력'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">장애 유형</span>
                    <span className="font-semibold text-slate-800">
                      {personal.disabilityType || '미입력'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <h4 className="font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#7a8d7c]" />
                  희망 직종 및 근무 형태
                </h4>
                <p className="px-3 font-bold text-slate-900">
                  {jobGoal.desiredJob || '미입력'}
                </p>
                {(jobGoal.workSchedule || jobGoal.startDate) && (
                  <p className="px-3 text-xs text-slate-600 mt-1">
                    {jobGoal.workSchedule} {jobGoal.startDate && `/ ${jobGoal.startDate}`}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#7a8d7c]" />
                  학력 및 직업교육
                </h4>
                <div className="px-3 space-y-1.5">
                  {eduList.length > 0 ? (
                    eduList.map((edu) => (
                      <div key={edu.id} className="flex justify-between text-xs sm:text-sm">
                        <span>
                          <strong>{edu.schoolName}</strong> ({edu.graduationStatus})
                        </span>
                        <span className="text-slate-500">{edu.period}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">기재된 학력이 없습니다.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#7a8d7c]" />
                  일해본 경험 및 경력
                </h4>
                <div className="px-3 space-y-2">
                  {experiences.length > 0 ? (
                    experiences.map((exp) => (
                      <div key={exp.id} className="border-b border-slate-100 pb-2">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>
                            {exp.title} {exp.role && `(${exp.role})`}
                          </span>
                          <span className="text-xs font-normal text-slate-500">
                            {exp.period}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-700 mt-0.5">• {exp.description}</p>
                        )}
                        {exp.leaveReason && (
                          <p className="text-[11px] text-slate-500">
                            퇴사 사유: {exp.leaveReason}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">기재된 경력이 없습니다.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-black text-[#4a544b] bg-[#f8f7f2] px-3 py-1.5 border-l-4 border-[#7a8d7c] mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#7a8d7c]" />
                  장점 · 자기소개 및 필요한 배려
                </h4>
                <div className="px-3 space-y-2">
                  {strength.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {strength.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-slate-100 rounded border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {strength.myStory || '작성된 자기소개 없음'}
                  </p>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>필요한 배려:</strong> {accommodations.supportNeeded || '없음'}
                    {accommodations.hobbies && (
                      <>
                        <br />
                        <strong>취미/특기:</strong> {accommodations.hobbies}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
