import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, ShieldCheck, Phone, Lock, MapPin, X } from "lucide-react";
import { setMember, applyForPost, grantLocationConsent } from "@/lib/dotori-state";

type Search = { from?: string };

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: SignupPage,
});

function SignupPage() {
  const { from } = Route.useSearch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [locationAgreed, setLocationAgreed] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const canSubmit =
    name && phone && otpVerified && password.length >= 4 && agreed && locationAgreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setMember({
      name,
      phone,
      password,
      vehicles: [],
      stats: { completedCount: 0, carbonKg: 0, ratings: [] },
      locationConsent: true,
    });
    grantLocationConsent();
    if (from) {
      applyForPost(from);
      navigate({ to: "/post/$id", params: { id: from } });
    } else {
      navigate({ to: "/profile" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <Link to="/" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">회원가입</p>
        <div className="size-10" />
      </div>

      <main className="mx-auto max-w-md px-5 pt-6">
        <h1 className="text-[22px] font-bold leading-snug">
          가는 길에 도토리 줍기,<br />
          <span className="text-primary">3분 만에 시작</span>해요
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          실명·연락처 인증 후 모든 요청에 신청할 수 있어요.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Field label="이름">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="input"
            />
          </Field>

          <Field label="연락처 (휴대폰 인증)">
            <div className="flex gap-2">
              <input
                required
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
                placeholder="010-0000-0000"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                disabled={!phone || otpVerified}
                className="shrink-0 rounded-xl bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Phone className="mr-1 inline size-3.5" />
                인증요청
              </button>
            </div>
            {otpSent && !otpVerified && (
              <div className="mt-2 flex gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="인증번호 6자리"
                  inputMode="numeric"
                  maxLength={6}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setOtpVerified(otp.length >= 4)}
                  className="shrink-0 rounded-xl bg-mint px-3.5 text-[13px] font-semibold text-mint-foreground"
                >
                  확인
                </button>
              </div>
            )}
            {otpVerified && (
              <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-mint-foreground">
                <Check className="size-3.5" /> 인증 완료
              </p>
            )}
          </Field>

          <Field label="비밀번호" hint="개인정보 수정 시 사용됩니다 (4자 이상)">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10"
                minLength={4}
              />
            </div>
          </Field>

          {/* Location consent */}
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-[13.5px] font-bold text-foreground">위치정보 이용 동의 (필수)</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  배송 중 드라이버의 실시간 위치를 확인하고, 안전한 이동 경로 매칭을 위해 위치 정보를 사용합니다.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="mt-1.5 text-[11.5px] font-semibold text-primary underline"
                >
                  위치정보 수집·이용 내용 보기
                </button>
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={locationAgreed}
                onChange={(e) => setLocationAgreed(e.target.checked)}
                className="size-4 accent-[color:var(--primary)]"
              />
              <span className="text-[12.5px] font-medium text-foreground">
                위치정보 수집 및 이용에 동의합니다
              </span>
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-sky/50 p-3.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-[color:var(--primary)]"
            />
            <span className="text-[12.5px] leading-relaxed text-foreground/85">
              <ShieldCheck className="mr-1 inline size-3.5 text-primary" />
              <b className="text-primary">이용약관 및 물피보상 범위</b>에 동의합니다.
              (최대 보상한도 200만원, 면책 조항 확인)
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[0_8px_20px_rgba(20,30,60,0.18)] disabled:opacity-40 disabled:shadow-none"
          >
            가입 완료
          </button>
          <p className="text-center text-[12px] text-muted-foreground">
            가입 후 <b className="text-primary">[내 정보 → 차량 인증하기]</b>에서
            차량을 등록할 수 있어요.
          </p>
        </form>
      </main>

      {/* Location consent detail modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4.5" />
              </span>
              <h3 className="text-[15.5px] font-bold">위치정보 수집·이용 안내</h3>
            </div>
            <ul className="mt-4 space-y-2.5 text-[12.5px] leading-relaxed text-foreground/85">
              <li><b className="text-foreground">수집 항목:</b> 배송 중 드라이버의 GPS 위치 정보</li>
              <li><b className="text-foreground">이용 목적:</b> 실시간 배송 위치 확인, 경로 매칭 최적화, 분쟁 발생 시 증빙</li>
              <li><b className="text-foreground">보유 기간:</b> 배송 완료 후 30일 이내 파기</li>
              <li><b className="text-foreground">제3자 제공:</b> 해당 배송 건의 요청자에게만 공개 (익명화된 위치)</li>
              <li><b className="text-foreground">거부 권리:</b> 동의를 거부할 수 있으나, 배송 신청 및 위치 확인 서비스 이용이 제한됩니다.</li>
            </ul>
            <button
              onClick={() => { setLocationAgreed(true); setShowLocationModal(false); }}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-[13.5px] font-bold text-primary-foreground"
            >
              확인 후 동의하기
            </button>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          background: var(--secondary);
          padding: 0.75rem 1rem;
          font-size: 14px;
          color: var(--foreground);
          outline: none;
          border: 1px solid transparent;
          transition: all .15s;
        }
        .input::placeholder { color: var(--muted-foreground); opacity: .7 }
        .input:focus {
          background: var(--card);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 12%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[13px] font-semibold text-foreground">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
