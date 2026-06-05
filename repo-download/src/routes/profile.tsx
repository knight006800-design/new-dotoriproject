import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Lock,
  Check,
  Car,
  Plus,
  Trash2,
  ShieldCheck,
  Pencil,
  KeyRound,
  Award,
  Star,
  LifeBuoy,
} from "lucide-react";
import {
  getMember,
  setMember,
  addVehicle,
  removeVehicle,
  type Member,
  type Vehicle,
} from "@/lib/dotori-state";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "내 정보 — 도토리마켓" }] }),
});

function ProfilePage() {
  const navigate = useNavigate();
  const [member, setLocalMember] = useState<Member | null>(null);
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  // Edit form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Add vehicle modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const refresh = () => {
    const m = getMember();
    setLocalMember(m);
    if (m) {
      setName(m.name);
      setPhone(m.phone);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!member) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <p className="text-lg font-semibold">로그인이 필요해요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            가입 후 내 정보를 관리할 수 있어요.
          </p>
          <button
            onClick={() => navigate({ to: "/signup" })}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            회원가입 하러가기
          </button>
        </div>
      </div>
    );
  }

  const tryUnlock = () => {
    if (pwInput === member.password) {
      setEditUnlocked(true);
      setPwError("");
      setPwInput("");
    } else {
      setPwError("비밀번호가 일치하지 않습니다.");
    }
  };

  const saveProfile = () => {
    setMember({ ...member, name, phone });
    refresh();
    setEditUnlocked(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <Link to="/" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">내 정보</p>
        <div className="size-10" />
      </div>

      <main className="mx-auto max-w-md px-5 pt-5">
        {/* Identity card */}
        <section className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_8px_24px_rgba(20,30,60,0.18)]">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-primary-foreground/15 text-lg font-bold">
              {member.name.slice(0, 1) || "도"}
            </div>
            <div>
              <p className="text-[16px] font-bold">{member.name}</p>
              <p className="text-[12.5px] text-primary-foreground/75">{member.phone}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[11.5px]">
            <ShieldCheck className="size-3.5" />
            실명·휴대폰 인증 완료
          </div>
        </section>

        {/* Personal info */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-semibold">개인정보</p>
            {!editUnlocked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Lock className="size-3" /> 잠금
              </span>
            ) : (
              <button
                onClick={() => setEditUnlocked(false)}
                className="text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                잠그기
              </button>
            )}
          </div>

          {!editUnlocked ? (
            <div className="mt-3 space-y-2">
              <RowStatic label="이름" value={member.name} />
              <RowStatic label="연락처" value={member.phone} />
              <div className="mt-3 rounded-xl border border-dashed border-border bg-secondary/40 p-3">
                <p className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground">
                  <KeyRound className="size-3.5 text-primary" />
                  수정하려면 비밀번호를 입력하세요
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="password"
                    value={pwInput}
                    onChange={(e) => {
                      setPwInput(e.target.value);
                      setPwError("");
                    }}
                    placeholder="비밀번호"
                    className="flex-1 rounded-lg bg-card px-3 py-2 text-[13px] outline-none ring-1 ring-border focus:ring-primary"
                  />
                  <button
                    onClick={tryUnlock}
                    className="rounded-lg bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground"
                  >
                    잠금 해제
                  </button>
                </div>
                {pwError && (
                  <p className="mt-1.5 text-[11.5px] font-medium text-acorn">
                    {pwError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <RowEdit label="이름" value={name} onChange={setName} />
              <RowEdit label="연락처" value={phone} onChange={setPhone} />
              <button
                onClick={saveProfile}
                className="mt-1 w-full rounded-xl bg-primary py-2.5 text-[13.5px] font-semibold text-primary-foreground"
              >
                <Pencil className="mr-1 inline size-3.5" />
                변경사항 저장
              </button>
            </div>
          )}
        </section>

        {/* Vehicles */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold">내 차량</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                인증된 차량으로 더 빠르게 매칭돼요
              </p>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-mint px-2.5 py-1.5 text-[12px] font-semibold text-mint-foreground"
            >
              <Plus className="size-3.5" />
              차량 인증하기
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {member.vehicles.length === 0 && (
              <li className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-[12.5px] text-muted-foreground">
                아직 등록된 차량이 없어요. <br />
                <b className="text-foreground">[차량 인증하기]</b>로 등록해보세요.
              </li>
            )}
            {member.vehicles.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-card text-primary">
                    <Car className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold tracking-tight">{v.plate}</p>
                    <p className="text-[11.5px] text-muted-foreground">{v.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {v.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-mint-foreground">
                      <Check className="size-3" /> 인증
                    </span>
                  )}
                  <button
                    onClick={() => {
                      removeVehicle(v.id);
                      refresh();
                    }}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-card hover:text-acorn"
                    aria-label="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 실적 기록 */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold">실적 기록</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                완료한 운송과 받은 평가가 누적됩니다
              </p>
            </div>
            <Award className="size-5 text-acorn" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-primary/[0.06] px-3.5 py-3">
              <p className="text-[11px] font-medium text-muted-foreground">누적 운송</p>
              <p className="mt-0.5 text-2xl font-extrabold text-primary">
                {member.stats.completedCount}
                <span className="ml-0.5 text-sm font-semibold">건</span>
              </p>
            </div>
            <div className="rounded-xl bg-acorn/10 px-3.5 py-3">
              <p className="text-[11px] font-medium text-muted-foreground">평균 평점</p>
              <p className="mt-0.5 text-2xl font-extrabold text-acorn">
                {member.stats.ratings.length === 0
                  ? "-"
                  : (
                      member.stats.ratings.reduce((s, r) => s + r.stars, 0) /
                      member.stats.ratings.length
                    ).toFixed(1)}
                <span className="ml-0.5 text-sm font-semibold">★</span>
              </p>
            </div>
          </div>

          <p className="mt-4 mb-2 text-[12px] font-semibold text-muted-foreground">
            받은 평가
          </p>
          {member.stats.ratings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-[12.5px] text-muted-foreground">
              아직 평가가 없어요. 첫 운송을 완료해보세요!
            </div>
          ) : (
            <ul className="space-y-2">
              {[...member.stats.ratings].reverse().map((r) => (
                <li key={r.id} className="rounded-xl bg-secondary/50 px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`size-3.5 ${
                            n <= r.stars ? "fill-acorn text-acorn" : "text-secondary"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="ml-auto text-[10.5px] text-muted-foreground">
                      게시글 #{r.postId} · {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-foreground/85">
                      "{r.comment}"
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Support shortcut */}
        <Link
          to="/support"
          className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-sky text-sky-foreground">
              <LifeBuoy className="size-4.5" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">고객센터</p>
              <p className="text-[11.5px] text-muted-foreground">
                자주 묻는 질문 · 1:1 문의 · 신고
              </p>
            </div>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>
      </main>

      {showAddVehicle && (
        <AddVehicleModal
          onClose={() => setShowAddVehicle(false)}
          onAdded={(v) => {
            addVehicle(v);
            refresh();
            setShowAddVehicle(false);
          }}
        />
      )}
    </div>
  );
}

function RowStatic({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3.5 py-2.5">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

function RowEdit({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-transparent focus:bg-card focus:ring-primary"
      />
    </div>
  );
}

function AddVehicleModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (v: { plate: string; model: string; verified: boolean }) => void;
}) {
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [step, setStep] = useState<"input" | "verifying" | "done">("input");

  const startVerify = () => {
    if (!plate || !model) return;
    setStep("verifying");
    setTimeout(() => setStep("done"), 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Car className="size-4.5" />
          </span>
          <div>
            <h3 className="text-[15.5px] font-bold">차량 인증하기</h3>
            <p className="text-[11.5px] text-muted-foreground">
              차량번호 조회로 명의를 확인합니다
            </p>
          </div>
        </div>

        {step === "input" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold">차량번호</label>
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="예) 12가 3456"
                className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[14px] tracking-wide outline-none ring-1 ring-transparent focus:bg-card focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold">차종</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="예) 기아 카니발 9인승 (2023)"
                className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-transparent focus:bg-card focus:ring-primary"
              />
            </div>
            <button
              onClick={startVerify}
              disabled={!plate || !model}
              className="w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
            >
              명의 확인 및 인증
            </button>
          </div>
        )}

        {step === "verifying" && (
          <div className="mt-6 py-8 text-center">
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-secondary border-t-primary" />
            <p className="mt-3 text-[13px] text-muted-foreground">
              명의 정보를 확인하고 있어요…
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="mt-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-mint text-mint-foreground">
              <Check className="size-6" />
            </div>
            <p className="mt-3 text-[14px] font-bold">차량 인증 완료!</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {plate} · {model}
            </p>
            <button
              onClick={() => onAdded({ plate, model, verified: true })}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 text-[13.5px] font-bold text-primary-foreground"
            >
              내 차량에 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
