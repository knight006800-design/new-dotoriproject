import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Phone,
  KeyRound,
  MapPin,
  X,
  Car,
  Check,
  Plus,
  Pencil,
  Star,
  Truck,
  Award,
  Send,
} from "lucide-react";
import { getPost } from "@/lib/posts";
import {
  getApplication,
  applyForPost,
  approveApplication,
  resetApplication,
  completeApplication,
  getMember,
  type AppStatus,
  type AppState,
  type Vehicle,
} from "@/lib/dotori-state";

type Search = { action?: "approve" };

export const Route = createFileRoute("/post/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    action: s.action === "approve" ? "approve" : undefined,
  }),
  component: PostDetail,
  head: ({ params }) => ({
    meta: [{ title: `요청 #${params.id} — 도토리마켓` }],
  }),
});

function PostDetail() {
  const { id } = Route.useParams();
  const { action } = Route.useSearch();
  const post = getPost(id);
  const navigate = useNavigate();
  const router = useRouter();

  const [app, setApp] = useState<AppState | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const approveRef = useRef<HTMLDivElement | null>(null);

  const status: AppStatus | "none" = app?.status ?? "none";

  const refresh = () => setApp(getApplication(id));
  useEffect(() => {
    refresh();
  }, [id]);

  // Deep-link from notification: scroll to approve panel
  useEffect(() => {
    if (action === "approve" && approveRef.current) {
      approveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [action, app]);

  if (!post) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <p className="text-lg font-semibold">요청 글을 찾을 수 없어요</p>
          <Link to="/" className="mt-3 inline-block text-sm text-primary underline">
            피드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    const member = getMember();
    if (!member) {
      setShowAuthModal(true);
      return;
    }
    setShowVehicleModal(true);
  };

  const confirmApply = (plate: string) => {
    applyForPost(id, plate);
    refresh();
    setShowVehicleModal(false);
  };

  const handleApprove = () => {
    approveApplication(id);
    refresh();
  };

  const handleReset = () => {
    resetApplication(id);
    refresh();
  };

  const handleCompleteRating = (stars: number, comment: string) => {
    completeApplication(id, { stars, comment, fromName: "요청자" });
    refresh();
    setShowRatingModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <button
          onClick={() => router.history.back()}
          className="grid size-10 place-items-center rounded-full hover:bg-secondary"
          aria-label="뒤로"
        >
          <ArrowLeft className="size-5" />
        </button>
        <p className="text-sm font-semibold">배송 요청 상세</p>
        <div className="size-10" />
      </div>

      <main className="mx-auto max-w-2xl px-4 pt-4">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="secondary">안심 에스크로</Chip>
          <Chip tone="mint">당일배송</Chip>
          <Chip tone="acorn">긴급</Chip>
        </div>
        <h1 className="mt-3 text-[20px] font-bold leading-snug text-foreground">
          {post.title}
        </h1>

        {/* Fee + product */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground">제시 배송비</p>
              <p className="mt-0.5 text-2xl font-extrabold text-primary">
                {post.fee.toLocaleString()}
                <span className="ml-0.5 text-sm font-semibold">원</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">AI 예상 소요</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{post.aiEstimate}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">상품</p>
            <p className="text-sm font-semibold">{post.product}</p>
          </div>
        </section>

        {/* Driver applicant card - shown after applied */}
        {app?.driver && (status === "applied" || status === "approved" || status === "completed") && (
          <section
            ref={approveRef}
            className="mt-3 overflow-hidden rounded-2xl border border-primary/25 bg-card"
          >
            <div className="border-b border-border bg-primary/[0.04] px-4 py-2.5">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-primary">
                신청한 드라이버
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground text-base font-bold">
                  {app.driver.name.slice(0, 1) || "도"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14.5px] font-bold">{app.driver.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-1.5 py-0.5 text-[10px] font-semibold text-mint-foreground">
                      <ShieldCheck className="size-2.5" /> 본인인증
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    실명·휴대폰·차량 명의 확인 완료
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatBlock
                  icon={<Car className="size-3.5" />}
                  label="배송 차량"
                  value={app.driver.vehiclePlate}
                  sub={app.driver.vehicleModel}
                />
                <StatBlock
                  icon={<Truck className="size-3.5" />}
                  label="누적 운송"
                  value={`${app.driver.completedCount}건`}
                  sub={app.driver.completedCount >= 10 ? "우수 드라이버" : "신뢰 형성 중"}
                />
              </div>

              {/* Recent ratings */}
              <div className="mt-3">
                <p className="mb-1.5 text-[12px] font-semibold text-muted-foreground">
                  최근 평가
                </p>
                {app.driver.recentRatings.length === 0 ? (
                  <p className="rounded-xl bg-secondary/50 px-3 py-2.5 text-[12px] text-muted-foreground">
                    아직 평가가 없는 신규 드라이버예요.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {app.driver.recentRatings.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-xl bg-secondary/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-1">
                          <StarRow value={r.stars} size="sm" />
                          <span className="ml-auto text-[10.5px] text-muted-foreground">
                            #{r.postId}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/85">
                            "{r.comment}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Approve / status footer */}
              <div className="mt-4 border-t border-border pt-3">
                {status === "applied" && (
                  <button
                    onClick={handleApprove}
                    className="w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-[0_6px_18px_rgba(20,30,60,0.18)]"
                  >
                    이 드라이버로 매칭 승인하기
                  </button>
                )}
                {status === "approved" && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-[11.5px] font-semibold text-mint-foreground">
                      <Check className="size-3" /> 승인 완료
                    </span>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="ml-auto rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground"
                    >
                      운송 완료 처리
                    </button>
                  </div>
                )}
                {status === "completed" && app.requesterRating && (
                  <div className="rounded-xl bg-mint/40 px-3 py-2.5">
                    <p className="text-[12px] font-semibold text-foreground">
                      내가 남긴 평가
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRow value={app.requesterRating.stars} size="sm" />
                    </div>
                    {app.requesterRating.comment && (
                      <p className="mt-1 text-[12px] text-foreground/80">
                        "{app.requesterRating.comment}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Route */}
        <section className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-[13px] font-semibold text-foreground">이동 경로</p>
          <RouteRow
            label="출발지"
            area={post.fromArea}
            detail={post.fromDetail}
            unlocked={status === "approved" || status === "completed"}
          />
          <div className="ml-3 my-1 h-5 w-px border-l-2 border-dashed border-border" />
          <RouteRow
            label="도착지"
            area={post.toArea}
            detail={post.toDetail}
            unlocked={status === "approved" || status === "completed"}
            isEnd
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InfoBlock
              icon={<Phone className="size-3.5" />}
              label="수령자 연락처"
              value={post.receiverPhone}
              unlocked={status === "approved" || status === "completed"}
            />
            <InfoBlock
              icon={<KeyRound className="size-3.5" />}
              label="공동현관"
              value={post.entryCode}
              unlocked={status === "approved" || status === "completed"}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-[13px] font-semibold">물품 설명 & 배송 주의사항</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/85">{post.notes}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {post.cautions.map((c) => (
              <li
                key={c}
                className="inline-flex items-center gap-1 rounded-full bg-acorn/10 px-2.5 py-1 text-[12px] font-medium text-acorn"
              >
                <AlertTriangle className="size-3.5" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Escrow */}
        <section className="mt-3 rounded-2xl border border-border bg-sky/50 p-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-[13.5px] font-semibold text-primary">안심 에스크로 결제</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-sky-foreground/80">
                배송비는 도토리마켓이 안전하게 보관 후, 수령 확인 시점에 드라이버에게
                자동 정산됩니다. 분쟁 발생 시 양측 증빙을 받아 중재합니다.
              </p>
              <button
                onClick={() => setShowPolicy(true)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1.5 text-[12px] font-medium text-primary shadow-sm hover:bg-card/80"
              >
                반송 및 노쇼 정책 보기
              </button>
            </div>
          </div>
        </section>

        {/* Reset (dev) */}
        {status !== "none" && (
          <section className="mt-3 rounded-2xl border border-dashed border-border bg-secondary/30 p-3 text-center">
            <button
              onClick={handleReset}
              className="text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
            >
              ↺ 시뮬레이션 초기화
            </button>
          </section>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          {status === "completed" ? (
            <button
              disabled
              className="w-full rounded-xl bg-mint py-3.5 text-[15px] font-bold text-mint-foreground"
            >
              <Award className="mr-1.5 inline size-4" /> 운송 완료 · 실적에 기록됨
            </button>
          ) : status === "approved" ? (
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[0_8px_20px_rgba(20,30,60,0.18)]"
            >
              <CheckCircle2 className="mr-1.5 inline size-4" />
              운송 완료 · 평가 남기기
            </button>
          ) : status === "applied" ? (
            <button
              disabled
              className="w-full rounded-xl bg-secondary py-3.5 text-[15px] font-bold text-secondary-foreground"
            >
              요청자 승인 대기 중…
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[0_8px_20px_rgba(20,30,60,0.18)] transition hover:opacity-95"
            >
              배송 대행 신청하기
            </button>
          )}
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <Modal onClose={() => setShowAuthModal(false)}>
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10">
              <Lock className="size-6 text-primary" />
            </div>
            <h3 className="mt-3 text-[16px] font-bold">휴대폰 인증이 필요해요</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              안전한 거래를 위해 도토리마켓은 실명 기반 가입 후<br />
              배송 신청이 가능해요.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 rounded-xl bg-secondary py-3 text-[14px] font-semibold text-secondary-foreground"
              >
                나중에
              </button>
              <button
                onClick={() => navigate({ to: "/signup", search: { from: id } })}
                className="flex-1 rounded-xl bg-primary py-3 text-[14px] font-semibold text-primary-foreground"
              >
                가입하고 신청하기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showPolicy && (
        <Modal onClose={() => setShowPolicy(false)}>
          <h3 className="text-[16px] font-bold">반송 및 노쇼 정책</h3>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-foreground/85">
            <li>• <b>수령자 부재(노쇼)</b>: 도착 후 15분 대기 후 사진 인증, 배송비 70% 지급 및 반송비 별도 청구.</li>
            <li>• <b>요청자 귀책 취소</b>: 픽업 완료 후 취소 시 전액 정산 + 반송비 보전.</li>
            <li>• <b>드라이버 귀책 취소</b>: 픽업 후 1시간 내 사유 입증 시 50% 차감, 그 외 전액 환불.</li>
            <li>• <b>파손/분실</b>: 물피보상 한도 내 자동 보상, 한도 초과분은 분쟁 중재로 진행.</li>
          </ul>
          <button
            onClick={() => setShowPolicy(false)}
            className="mt-5 w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-primary-foreground"
          >
            확인했어요
          </button>
        </Modal>
      )}

      {showVehicleModal && (
        <VehicleApplyModal
          onClose={() => setShowVehicleModal(false)}
          onConfirm={confirmApply}
        />
      )}

      {showRatingModal && (
        <RatingModal
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleCompleteRating}
          driverName={app?.driver?.name ?? "드라이버"}
        />
      )}
    </div>
  );
}

function VehicleApplyModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (plate: string) => void;
}) {
  const navigate = useNavigate();
  const member = getMember();
  const vehicles: Vehicle[] = member?.vehicles ?? [];
  const [selectedId, setSelectedId] = useState<string | "manual">(
    vehicles.find((v) => v.verified)?.id ?? (vehicles[0]?.id ?? "manual"),
  );
  const [manualPlate, setManualPlate] = useState("");

  const submit = () => {
    if (selectedId === "manual") {
      if (!manualPlate.trim()) return;
      onConfirm(manualPlate.trim());
    } else {
      const v = vehicles.find((x) => x.id === selectedId);
      if (v) onConfirm(v.plate);
    }
  };

  const canSubmit =
    selectedId === "manual" ? manualPlate.trim().length > 0 : !!selectedId;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
          <Car className="size-4.5" />
        </span>
        <div>
          <h3 className="text-[15.5px] font-bold">배송 차량 선택</h3>
          <p className="text-[11.5px] text-muted-foreground">
            요청자에게 어떤 차량으로 배송할지 알려주세요
          </p>
        </div>
      </div>

      {vehicles.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-semibold text-muted-foreground">
            내 인증된 차량 가져오기
          </p>
          <ul className="space-y-2">
            {vehicles.map((v) => {
              const selected = selectedId === v.id;
              return (
                <li key={v.id}>
                  <button
                    onClick={() => setSelectedId(v.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition ${
                      selected
                        ? "bg-primary/8 ring-2 ring-primary"
                        : "bg-secondary/60 ring-1 ring-transparent hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Car className="size-4 text-primary" />
                      <div>
                        <p className="text-[13.5px] font-bold tracking-tight">
                          {v.plate}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {v.model}
                        </p>
                      </div>
                    </div>
                    {v.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10.5px] font-semibold text-mint-foreground">
                        <Check className="size-3" /> 인증
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={() => setSelectedId("manual")}
          className={`flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition ${
            selectedId === "manual"
              ? "bg-primary/8 text-primary ring-2 ring-primary"
              : "bg-secondary/60 text-foreground ring-1 ring-transparent hover:bg-secondary"
          }`}
        >
          <Pencil className="size-3.5" />
          {vehicles.length > 0 ? "다른 차량 직접 입력" : "차량번호 직접 입력"}
        </button>
        {selectedId === "manual" && (
          <input
            value={manualPlate}
            onChange={(e) => setManualPlate(e.target.value)}
            placeholder="예) 12가 3456"
            className="mt-2 w-full rounded-xl bg-card px-3.5 py-2.5 text-[14px] tracking-wide outline-none ring-1 ring-border focus:ring-primary"
            autoFocus
          />
        )}
      </div>

      {vehicles.length === 0 && (
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          <Plus className="size-3.5" />
          내 정보에서 차량 인증하기
        </button>
      )}

      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl bg-secondary py-3 text-[14px] font-semibold text-secondary-foreground"
        >
          취소
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex-1 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
        >
          이 차량으로 신청
        </button>
      </div>
    </Modal>
  );
}

function RatingModal({
  onClose,
  onSubmit,
  driverName,
}: {
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => void;
  driverName: string;
}) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-mint text-mint-foreground">
          <Award className="size-6" />
        </div>
        <h3 className="mt-3 text-[16px] font-bold">{driverName} 드라이버 평가</h3>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          평가는 드라이버의 실적 기록에 반영됩니다
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStars(n)}
            className="transition hover:scale-110"
            aria-label={`${n}점`}
          >
            <Star
              className={`size-8 ${
                n <= stars ? "fill-acorn text-acorn" : "text-secondary"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 200))}
        placeholder="배송 경험을 한 줄로 남겨주세요 (선택)"
        className="mt-4 w-full resize-none rounded-xl bg-secondary px-3.5 py-2.5 text-[13px] leading-relaxed outline-none ring-1 ring-transparent focus:bg-card focus:ring-primary"
      />

      <button
        onClick={() => onSubmit(stars, comment.trim())}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground"
      >
        <Send className="mr-1.5 inline size-4" /> 평가 제출 · 운송 완료
      </button>
    </Modal>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "secondary" | "mint" | "acorn";
}) {
  const cls =
    tone === "mint"
      ? "bg-mint text-mint-foreground"
      : tone === "acorn"
      ? "bg-acorn/15 text-acorn"
      : "bg-secondary text-secondary-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function StatBlock({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
      <p className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-[13.5px] font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[10.5px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function StarRow({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} ${n <= value ? "fill-acorn text-acorn" : "text-secondary"}`}
        />
      ))}
    </span>
  );
}

function RouteRow({
  label,
  area,
  detail,
  unlocked,
  isEnd,
}: {
  label: string;
  area: string;
  detail: string;
  unlocked: boolean;
  isEnd?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1.5 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
          isEnd ? "bg-acorn text-acorn-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <MapPin className="size-3" />
      </span>
      <div className="flex-1">
        <p className="text-[11.5px] font-medium text-muted-foreground">{label}</p>
        <p className="text-[14px] font-semibold text-foreground">{area}</p>
        <div
          className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] ${
            unlocked
              ? "bg-mint/40 text-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {unlocked ? (
            <span className="font-medium">{detail}</span>
          ) : (
            <>
              <Lock className="size-3.5" />
              <span>매칭 승인 후 공개됩니다</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  unlocked,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unlocked: boolean;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
      <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p
        className={`mt-0.5 text-[13px] ${
          unlocked ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {unlocked ? value : "🔒 매칭 승인 후 공개"}
      </p>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
