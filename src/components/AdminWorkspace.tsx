import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Trash2,
  Printer,
  Edit3,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Clock,
  CheckCircle2,
  User,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import {
  CloudResumeRecord,
  fetchAllResumesForAdmin,
  deleteResumeFromFirestore,
  purgeAllExpiredPhotos,
  updateResumeAdminMeta,
  auth,
  loginWithGoogle,
  isUserAdmin,
  ADMIN_EMAILS,
} from '../firebase';
import { AdminPrintModal } from './AdminPrintModal';

interface AdminWorkspaceProps {
  adminEmail: string;
  onLogout: () => void;
  onBackToUserMode: () => void;
  onEditResume: (record: CloudResumeRecord) => void;
  onCreateNewResume: () => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  adminEmail,
  onLogout,
  onBackToUserMode,
  onEditResume,
  onCreateNewResume,
}) => {
  const [resumes, setResumes] = useState<CloudResumeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRecordForPrint, setSelectedRecordForPrint] =
    useState<CloudResumeRecord | null>(null);
  const [cleanedMessage, setCleanedMessage] = useState<string | null>(null);
  const [authNeededWarning, setAuthNeededWarning] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setAuthNeededWarning(false);
    try {
      const result = await fetchAllResumesForAdmin();
      setResumes(result.resumes);
      if (result.cleanedPhotosCount > 0) {
        setCleanedMessage(
          `보관 기한(1주일)이 경과한 증명사진 ${result.cleanedPhotosCount}건이 자동 삭제되었습니다.`
        );
      }
    } catch (err: any) {
      console.error('Failed to fetch resumes:', err);
      const msg = err?.message || '';
      if (msg.includes('permissions') || msg.includes('Missing or insufficient')) {
        setAuthNeededWarning(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLinkGoogleAdmin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user && isUserAdmin(user)) {
        await loadData();
      } else if (user) {
        alert(
          `선택하신 계정(${user.email})은 관리자(${ADMIN_EMAILS[0]}) 권한이 없습니다.`
        );
      }
    } catch (err) {
      console.error(err);
      alert('구글 계정 연결에 실패했습니다.');
    }
  };

  const handlePurgeExpired = async () => {
    try {
      const count = await purgeAllExpiredPhotos();
      setCleanedMessage(
        count > 0
          ? `1주일 경과 사진 ${count}건을 정리 완료했습니다.`
          : '만료된(7일 경과) 증명사진이 없습니다.'
      );
      await loadData();
    } catch (err) {
      console.error(err);
      alert('만료 사진 정리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (record: CloudResumeRecord) => {
    if (
      !confirm(
        `'${record.resumeData.personal.name || '미입력'}' 님의 이력서를 정말 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`
      )
    ) {
      return;
    }
    try {
      await deleteResumeFromFirestore(record.id);
      setResumes((prev) => prev.filter((r) => r.id !== record.id));
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleQuickStatusChange = async (
    recordId: string,
    newStatus: '대기' | '검토중' | '취업연계' | '완료'
  ) => {
    try {
      await updateResumeAdminMeta(recordId, { status: newStatus });
      setResumes((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const p = r.resumeData?.personal;
    const matchesSearch =
      !searchTerm ||
      (p?.name || '').includes(searchTerm) ||
      (p?.phone || '').includes(searchTerm) ||
      (r.resumeData?.jobGoal?.desiredJob || '').includes(searchTerm);
    const matchesStatus =
      statusFilter === 'ALL' || (r.status || '대기') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: resumes.length,
    waiting: resumes.filter((r) => (r.status || '대기') === '대기').length,
    reviewing: resumes.filter((r) => r.status === '검토중').length,
    placed: resumes.filter(
      (r) => r.status === '취업연계' || r.status === '완료'
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-slate-900">
      {/* Top Admin Navbar */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">
                수원시장애인종합복지관 이력서 통합 관리 시스템
              </h1>
              <p className="text-xs text-emerald-200">
                접속 관리자: {adminEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBackToUserMode}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>일반 작성 화면</span>
            </button>
            <button
              onClick={onCreateNewResume}
              className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>대신 새 이력서 작성</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {authNeededWarning && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-bold">
                  클라우드 접수 이력서 목록 조회를 위해 관리자 구글 계정 인증이 필요합니다.
                </p>
                <p className="text-xs text-amber-800">
                  개인정보 보호 보안 규칙에 따라, 실무자 비밀번호로 입장하신 경우 아래 버튼으로 복지관 관리자 계정({ADMIN_EMAILS[0]})을 1회 연결해 주세요.
                </p>
              </div>
            </div>
            <button
              onClick={handleLinkGoogleAdmin}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>구글 관리자 계정 연결</span>
            </button>
          </div>
        )}

        {cleanedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {cleanedMessage}
            </span>
            <button
              onClick={() => setCleanedMessage(null)}
              className="text-emerald-700 hover:underline"
            >
              닫기
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-500">전체 접수 이력서</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}건</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-amber-600">접수 대기</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{stats.waiting}건</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-blue-600">상담 검토중</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{stats.reviewing}건</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-emerald-600">취업 연계 / 완료</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.placed}건</p>
          </div>
        </div>

        {/* Filter & Tools Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="신청자 이름, 연락처, 희망직종 검색..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-xl font-semibold bg-white"
            >
              <option value="ALL">전체 상태</option>
              <option value="대기">대기</option>
              <option value="검토중">검토중</option>
              <option value="취업연계">취업연계</option>
              <option value="완료">완료</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePurgeExpired}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="등록 후 7일이 지난 증명사진을 일괄 삭제합니다"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>1주일 경과 사진 정리</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* Resume List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              접수된 이력서 목록을 불러오는 중입니다...
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm space-y-2">
              <p className="font-bold">조회된 이력서가 없습니다.</p>
              <p className="text-xs text-slate-400">
                일반 사용자가 온라인 제출을 완료하면 이곳에 실시간으로 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <tr>
                    <th className="p-3.5">신청자 / 생년월일</th>
                    <th className="p-3.5">연락처</th>
                    <th className="p-3.5">희망 직종</th>
                    <th className="p-3.5">진행 상태</th>
                    <th className="p-3.5">최종 수정일</th>
                    <th className="p-3.5 text-right">관리 / 출력</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResumes.map((rec) => {
                    const p = rec.resumeData.personal;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {p.name || '미입력'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {p.birthDate || '생년월일 미입력'} ({p.gender || '선택안함'})
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs text-slate-700">
                          <p>{p.phone || '미입력'}</p>
                          {p.emergencyPhone && (
                            <p className="text-[11px] text-slate-400">
                              비상: {p.emergencyPhone}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 text-xs font-semibold text-slate-800">
                          {rec.resumeData.jobGoal?.desiredJob || '미입력'}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={rec.status || '대기'}
                            onChange={(e) =>
                              handleQuickStatusChange(rec.id, e.target.value as any)
                            }
                            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                          >
                            <option value="대기">대기</option>
                            <option value="검토중">검토중</option>
                            <option value="취업연계">취업연계</option>
                            <option value="완료">완료</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-xs text-slate-500">
                          {new Date(rec.updatedAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedRecordForPrint(rec)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>출력/저장</span>
                            </button>
                            <button
                              onClick={() => onEditResume(rec)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={() => handleDelete(rec)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Admin Print & Save Modal */}
      <AdminPrintModal
        isOpen={Boolean(selectedRecordForPrint)}
        onClose={() => setSelectedRecordForPrint(null)}
        record={selectedRecordForPrint}
        onEditResume={onEditResume}
        onRefreshData={loadData}
      />
    </div>
  );
};
