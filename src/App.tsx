import React, { useState, useEffect } from 'react';
import { ResumeData, AccessibilityLevel } from './types';
import { SAMPLE_RESUME_DATA } from './data/presets';
import { Header } from './components/Header';
import { QuestionWizard } from './components/QuestionWizard';
import { ResumePreview } from './components/ResumePreview';
import { AdminWorkspace } from './components/AdminWorkspace';
import { AdminLoginModal } from './components/AdminLoginModal';
import { QRCodeModal } from './components/QRCodeModal';
import { exportResumeToPdf, stopSpeech } from './utils/pdfExport';
import {
  auth,
  testConnection,
  isPhotoExpired,
  isUserAdmin,
  submitApplicantResume,
  saveResumeToFirestore,
  CloudResumeRecord,
  ADMIN_EMAILS,
} from './firebase';
import {
  Heart,
  Sparkles,
  FileCheck,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Save,
  ArrowLeft,
} from 'lucide-react';

const INITIAL_BLANK_RESUME: ResumeData = {
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
    desiredJob: '',
    workSchedule: '',
    startDate: '',
  },
  education: {
    schoolName: '',
    graduationStatus: '졸업',
    period: '',
  },
  educations: [],
  experiences: [],
  strength: {
    tags: [],
    myStory: '',
  },
  accommodations: {
    supportNeeded: '',
    hobbies: '',
  },
  templateStyle: 'standard',
};

const LOCAL_STORAGE_KEY = 'easy_resume_builder_data_v3';
const ADMIN_SESSION_KEY = 'suwon_admin_auth_session';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: ResumeData = JSON.parse(saved);
        if (parsed.personal) {
          if (
            parsed.personal.photoUrl &&
            isPhotoExpired(parsed.personal.photoUploadedAt)
          ) {
            parsed.personal.photoUrl = null;
            parsed.personal.photoUploadedAt = null;
          }
          if (
            parsed.personal.photoUrl &&
            parsed.personal.photoUrl.includes('unsplash.com')
          ) {
            parsed.personal.photoUrl = null;
            parsed.personal.photoUploadedAt = null;
          }
        }
        return parsed;
      }
      return INITIAL_BLANK_RESUME;
    } catch {
      return INITIAL_BLANK_RESUME;
    }
  });

  const [activeTab, setActiveTab] = useState<'wizard' | 'preview'>('wizard');
  const [fontSize, setFontSize] = useState<AccessibilityLevel>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Admin Mode States
  const [isAdminModeActive, setIsAdminModeActive] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] =
    useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
  });
  const [editingAdminRecord, setEditingAdminRecord] =
    useState<CloudResumeRecord | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // General Notification Banner
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'alert';
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.removeItem('easy_resume_builder_data_v1');
      localStorage.removeItem('easy_resume_builder_data_v2');
    } catch {
      // ignore
    }
  }, []);

  // Firebase Auth listener & 1-week photo expiration check
  useEffect(() => {
    testConnection();

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser && isUserAdmin(currentUser)) {
        const email = currentUser.email || ADMIN_EMAILS[0];
        setAdminEmail(email);
        sessionStorage.setItem(ADMIN_SESSION_KEY, email);
      }
    });

    if (
      resumeData.personal.photoUrl &&
      isPhotoExpired(resumeData.personal.photoUploadedAt)
    ) {
      setResumeData((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          photoUrl: null,
          photoUploadedAt: null,
        },
      }));
      setNotification({
        message:
          '등록된 증명사진이 보관 기한(1주일)을 경과하여 안전하게 자동 제거되었습니다.',
        type: 'info',
      });
    }

    return () => unsubscribe();
  }, []);

  // Auto save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [resumeData]);

  const isAdminAuthenticated = Boolean(adminEmail);

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminModeActive(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    sessionStorage.setItem(ADMIN_SESSION_KEY, email);
    setIsAdminModeActive(true);
    setNotification({
      message: `관리자 모드로 접속했습니다. (${email})`,
      type: 'success',
    });
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminEmail('');
    setIsAdminModeActive(false);
    setEditingAdminRecord(null);
    setNotification({
      message: '관리자 모드에서 로그아웃 되었습니다.',
      type: 'info',
    });
  };

  const handleFillSample = () => {
    if (
      confirm('예시 이력서 내용으로 채우시겠습니까? 작성 중인 내용이 대체됩니다.')
    ) {
      setResumeData(SAMPLE_RESUME_DATA);
      setEditingAdminRecord(null);
    }
  };

  const handleReset = () => {
    if (confirm('이력서를 처음부터 다시 새로 작성하시겠습니까?')) {
      setResumeData(INITIAL_BLANK_RESUME);
      setEditingAdminRecord(null);
      setActiveTab('wizard');
    }
  };

  // General Access: Submit to Welfare Center (No Login Required)
  const handleSubmitResume = async () => {
    if (!resumeData.personal.name) {
      alert('신청자 성명을 입력한 후 복지관에 제출해 주세요.');
      setActiveTab('wizard');
      return;
    }

    if (
      !confirm(
        `'${resumeData.personal.name}' 님의 이력서를 수원시장애인종합복지관에 온라인으로 제출하시겠습니까?\n\n(※ 구글 로그인 없이 즉시 안전하게 복지관 전산으로 전송됩니다.)`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplicantResume(resumeData, resumeData.personal.photoUploadedAt);
      setNotification({
        message: `🎉 '${resumeData.personal.name}' 님의 이력서가 수원시장애인종합복지관에 안전하게 제출되었습니다! (구글 로그인 없이 접수 완료)`,
        type: 'success',
      });
      alert(
        `🎉 '${resumeData.personal.name}' 님의 이력서가 성공적으로 복지관에 제출되었습니다.\n\n구글 로그인 없이도 안전하게 접수되었으며, 담당 선생님이 내용을 검토한 후 연락을 드립니다.`
      );
    } catch (err) {
      console.error(err);
      alert('제출 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // General Access: Export PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      await new Promise((res) => setTimeout(res, 300));
    }

    const fileName = `${resumeData.personal.name || '알기쉬운'}_이력서.pdf`;
    await exportResumeToPdf('resume-pdf-content', fileName);
    setIsExportingPdf(false);
  };

  // Admin Handler: Edit Resume in Editor
  const handleEditResumeInEditor = (record: CloudResumeRecord) => {
    setResumeData(record.resumeData);
    setEditingAdminRecord(record);
    setIsAdminModeActive(false);
    setActiveTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handler: Create New Resume
  const handleCreateNewResume = () => {
    setResumeData(INITIAL_BLANK_RESUME);
    setEditingAdminRecord(null);
    setIsAdminModeActive(false);
    setActiveTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handler: Save Edited Record back to Firestore
  const handleSaveAdminEdit = async () => {
    if (!editingAdminRecord) return;
    try {
      const updated = await saveResumeToFirestore(
        editingAdminRecord.userId,
        editingAdminRecord.id,
        `${resumeData.personal.name || '신청자'} 님의 이력서`,
        resumeData,
        resumeData.personal.photoUploadedAt || editingAdminRecord.photoUploadedAt,
        editingAdminRecord.status || '대기',
        editingAdminRecord.adminNotes || ''
      );
      setEditingAdminRecord(updated);
      setNotification({
        message: `'${resumeData.personal.name}' 님의 수정된 이력서가 저장되었습니다.`,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      alert('수정 사항 저장에 실패했습니다.');
    }
  };

  if (isAdminModeActive && isAdminAuthenticated) {
    return (
      <AdminWorkspace
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
        onBackToUserMode={() => setIsAdminModeActive(false)}
        onEditResume={handleEditResumeInEditor}
        onCreateNewResume={handleCreateNewResume}
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors ${
        highContrast
          ? 'bg-black text-yellow-300'
          : 'bg-[#fdfcf9] text-[#3d3d3d]'
      }`}
    >
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        isSpeaking={isSpeaking}
        onStopSpeech={() => {
          stopSpeech();
          setIsSpeaking(false);
        }}
        onFillSample={handleFillSample}
        onReset={handleReset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdminAuthenticated}
        adminEmail={adminEmail}
        onSubmitResume={handleSubmitResume}
        isSubmitting={isSubmitting}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Admin Edit Session Banner */}
      {editingAdminRecord && (
        <div className="bg-emerald-900 text-white px-4 py-3 shadow-md sticky top-[60px] z-20 print:hidden">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>
                <strong>현재 관리자 편집 모드:</strong> &apos;
                {editingAdminRecord.resumeData.personal.name || '미입력'}&apos; 님의
                이력서를 수정하고 있습니다.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveAdminEdit}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>수정 내용 저장</span>
              </button>
              <button
                onClick={() => setIsAdminModeActive(true)}
                className="px-3.5 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>관리자 목록으로</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {notification && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold print:hidden ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : notification.type === 'alert'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'wizard' ? (
          <QuestionWizard
            data={resumeData}
            onChange={setResumeData}
            fontSize={fontSize}
            highContrast={highContrast}
            onFinish={() => {
              setActiveTab('preview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <ResumePreview
            data={resumeData}
            onEdit={() => {
              setActiveTab('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            highContrast={highContrast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 border-t border-[#e8e6df] text-center space-y-2 text-xs text-[#8e8d88] print:hidden">
        <div className="flex items-center justify-center gap-4 flex-wrap font-semibold text-[#6e6d67]">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#7a8d7c]" />
            수원시장애인종합복지관 직업지원팀
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI 쉬운 문장 다듬기 &amp; 스튜디오 증명사진 지원
          </span>
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            사진 1주일(7일) 후 자동 삭제 보호
          </span>
        </div>
        <p>
          본 프로그램은 구직자 및 발달장애인 당사자가 로그인 없이 쉽게 이력서를 작성하고 출력·제출할 수 있도록 지원합니다.
        </p>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        highContrast={highContrast}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
