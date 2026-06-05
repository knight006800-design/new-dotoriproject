import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Camera,
  X,
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  CreditCard,
  Package,
  Phone,
  ChevronDown,
  Shield,
  Search,
  LocateFixed,
  ChevronRight,
} from "lucide-react";
import { createPost, type PaymentType, type ReceiveMethod } from "@/lib/posts";
import { getMember, generateSafeNumber } from "@/lib/dotori-state";

export const Route = createFileRoute("/create-post")({
  component: CreatePostPage,
});

// ─── Korean address suggestions (simulated Juso-style) ──────────────────────
const SAMPLE_ADDRESSES = [
  "서울 강남구 역삼동 테헤란로 152",
  "서울 강남구 삼성동 봉은사로 524",
  "서울 마포구 상암동 월드컵북로 396",
  "서울 종로구 사직동 사직로 161",
  "부산 해운대구 우동 센텀3로 20",
  "부산 사상구 괘법동 가야대로 445",
  "대구 달서구 도원동 달구벌대로 1601",
  "인천 남동구 논현동 경인로 690",
  "인천 연수구 송도동 컨벤시아대로 16",
  "광주 서구 치평동 상무대로 987",
  "대전 유성구 봉명동 계룡로 105",
  "울산 북구 송정동 진장유통로 100",
  "수원 영통구 매탄동 매탄로 167",
  "성남 분당구 정자동 분당내곡로 151",
  "고양 일산동구 장항동 일산로 323",
  "용인 수지구 풍덕천동 풍덕천로 30",
  "창원 의창구 용호동 중앙대로 151",
  "청주 상당구 율량동 율량로 93",
  "전주 완산구 효자동 홍산로 111",
  "제주시 연동 제주대학로 102",
];

function searchAddresses(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SAMPLE_ADDRESSES.filter((a) => a.includes(query) || a.toLowerCase().includes(q)).slice(0, 5);
}

// ─── Image compression ────────────────────────────────────────────────────────
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Address search field ─────────────────────────────────────────────────────
function AddressField({
  label,
  required,
  value,
  onChange,
  placeholder,
  onGpsClick,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onGpsClick?: () => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleInput = (v: string) => {
    onChange(v);
    const results = searchAddresses(v);
    setSuggestions(results);
    setOpen(results.length > 0);
  };

  const pick = (addr: string) => {
    onChange(addr);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-acorn">*</span>}
      </label>
      <div className="relative flex items-center gap-1">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => value && setOpen(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder ?? "주소 검색 또는 직접 입력"}
            className="inp pl-8"
          />
        </div>
        {onGpsClick && (
          <button
            type="button"
            onClick={onGpsClick}
            title="현재 위치 사용"
            className="shrink-0 grid size-[42px] place-items-center rounded-xl bg-sky/60 text-sky-foreground hover:bg-sky transition"
          >
            <LocateFixed className="size-4" />
          </button>
        )}
      </div>
      {open && (
        <ul className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => pick(s)}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] hover:bg-secondary transition"
              >
                <MapPin className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{s}</span>
                <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Safe number toggle card ──────────────────────────────────────────────────
function SafeNumberCard({
  phone,
  safePhone,
  useSafe,
  onToggle,
  label,
}: {
  phone: string;
  safePhone: string;
  useSafe: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className={`rounded-xl border p-3 transition ${useSafe ? "border-primary/40 bg-primary/[0.04]" : "border-border bg-secondary/30"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className={`mt-0.5 size-4 shrink-0 ${useSafe ? "text-primary" : "text-muted-foreground"}`} />
          <div>
            <p className="text-[12.5px] font-semibold">{label}</p>
            {useSafe ? (
              <p className="text-[11.5px] text-primary font-mono mt-0.5">{safePhone} <span className="font-sans text-muted-foreground">(안심번호)</span></p>
            ) : (
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{phone || "번호 미입력"}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 h-5 w-9 rounded-full transition-all ${useSafe ? "bg-primary" : "bg-border"}`}
        >
          <span className={`block size-4 rounded-full bg-white shadow transition-transform ${useSafe ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
      {useSafe && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          실제 번호 대신 050 안심번호가 드라이버에게 공개됩니다. 통화·문자는 정상 연결됩니다.
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function CreatePostPage() {
  const navigate = useNavigate();
  const member = getMember();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [product, setProduct] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [fee, setFee] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("escrow");
  const [fromArea, setFromArea] = useState("");
  const [fromDetail, setFromDetail] = useState("");
  const [toArea, setToArea] = useState("");
  const [toDetail, setToDetail] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiveMethod, setReceiveMethod] = useState<ReceiveMethod>("direct");
  const [receiveMethodDetail, setReceiveMethodDetail] = useState("");
  const [pickupWindow, setPickupWindow] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [cautionInput, setCautionInput] = useState("");
  const [cautions, setCautions] = useState<string[]>([]);
  const [requesterPhone, setRequesterPhone] = useState(member?.phone ?? "");

  const [useRequesterSafe, setUseRequesterSafe] = useState(false);
  const [useReceiverSafe, setUseReceiverSafe] = useState(false);

  const [gpsLoading, setGpsLoading] = useState<"from" | "to" | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requesterSafePhone = requesterPhone ? generateSafeNumber(requesterPhone) : "";
  const receiverSafePhone = receiverPhone ? generateSafeNumber(receiverPhone) : "";

  const canSubmit =
    title.trim() && product.trim() && fee && fromArea.trim() && toArea.trim() &&
    receiverPhone.trim() && pickupWindow.trim() && deadline.trim();

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (productImages.length + files.length > 3) {
      setError("사진은 최대 3장까지 첨부할 수 있어요.");
      return;
    }
    const compressed = await Promise.all(files.map(compressImage));
    setProductImages((prev) => [...prev, ...compressed].slice(0, 3));
    e.target.value = "";
  };

  const addCaution = () => {
    const v = cautionInput.trim();
    if (!v || cautions.includes(v)) return;
    setCautions((prev) => [...prev, v]);
    setCautionInput("");
  };

  const handleGps = useCallback((target: "from" | "to") => {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 GPS를 지원하지 않아요.");
      return;
    }
    setGpsLoading(target);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = `현재 위치 (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        if (target === "from") setFromArea(label);
        else setToArea(label);
        setGpsLoading(null);
      },
      () => {
        setError("위치 권한이 거부되어 현재 위치를 가져올 수 없어요.");
        setGpsLoading(null);
      },
      { timeout: 8000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    const post = await createPost({
      title: title.trim(),
      product: product.trim(),
      productImages,
      fee: Number(fee),
      paymentType,
      fromArea: fromArea.trim(),
      fromDetail: fromDetail.trim(),
      toArea: toArea.trim(),
      toDetail: toDetail.trim(),
      receiverPhone: receiverPhone.trim(),
      receiverSafePhone: useReceiverSafe ? receiverSafePhone : undefined,
      receiveMethod,
      receiveMethodDetail: receiveMethodDetail.trim(),
      pickupWindow: pickupWindow.trim(),
      deadline: deadline.trim(),
      aiEstimate: "",
      notes: notes.trim(),
      cautions,
      requesterName: member?.name ?? "",
      requesterPhone: requesterPhone.trim(),
      requesterSafePhone: useRequesterSafe ? requesterSafePhone : undefined,
      useSafeNumber: useRequesterSafe || useReceiverSafe,
    });
    setSubmitting(false);
    if (!post) {
      setError("등록 중 오류가 발생했어요. 다시 시도해주세요.");
      return;
    }
    navigate({ to: "/post/$id", params: { id: post.id } });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <Link to="/" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">배송 요청 글쓰기</p>
        <div className="size-10" />
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg px-5 pt-5 space-y-5">
        {/* Product images */}
        <section>
          <SectionLabel icon={<Camera className="size-4" />}>상품 사진</SectionLabel>
          <p className="mb-2 text-[11.5px] text-muted-foreground">최대 3장 · 픽업 전 상태 증빙용</p>
          <div className="flex gap-2 flex-wrap">
            {productImages.map((src, i) => (
              <div key={i} className="relative size-24 rounded-xl overflow-hidden border border-border bg-secondary/40">
                <img src={src} alt={`상품 사진 ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProductImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/50 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {productImages.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-24 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-secondary transition"
              >
                <Camera className="size-5" />
                <span className="text-[11px]">사진 추가</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImages}
          />
        </section>

        {/* Title + product */}
        <section className="space-y-3">
          <SectionLabel icon={<Package className="size-4" />}>물품 정보</SectionLabel>
          <Field label="제목" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) [서울]→[인천] 노트북 안전 배송 요청"
              className="inp"
              maxLength={80}
            />
          </Field>
          <Field label="상품명" required>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="예) MacBook Pro 16인치"
              className="inp"
              maxLength={60}
            />
          </Field>
        </section>

        {/* Route — address search + GPS */}
        <section className="space-y-3">
          <SectionLabel icon={<MapPin className="size-4" />}>이동 경로</SectionLabel>
          <AddressField
            label="출발 지역"
            required
            value={fromArea}
            onChange={setFromArea}
            placeholder="예) 서울 강남구 역삼동"
            onGpsClick={() => handleGps("from")}
          />
          {gpsLoading === "from" && (
            <p className="text-[11.5px] text-primary animate-pulse">GPS 위치 확인 중…</p>
          )}
          <Field label="출발 상세주소">
            <input value={fromDetail} onChange={(e) => setFromDetail(e.target.value)} placeholder="아파트 동·호수 또는 건물명" className="inp" />
          </Field>
          <AddressField
            label="도착 지역"
            required
            value={toArea}
            onChange={setToArea}
            placeholder="예) 인천 남동구 논현동"
            onGpsClick={() => handleGps("to")}
          />
          {gpsLoading === "to" && (
            <p className="text-[11.5px] text-primary animate-pulse">GPS 위치 확인 중…</p>
          )}
          <Field label="도착 상세주소">
            <input value={toDetail} onChange={(e) => setToDetail(e.target.value)} placeholder="아파트 동·호수 또는 건물명" className="inp" />
          </Field>
        </section>

        {/* Receiver + receive method */}
        <section className="space-y-3">
          <SectionLabel icon={<Phone className="size-4" />}>수령 정보</SectionLabel>
          <Field label="수령자 연락처" required>
            <input
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
              className="inp"
            />
          </Field>
          {receiverPhone.trim().length >= 9 && (
            <SafeNumberCard
              phone={receiverPhone}
              safePhone={receiverSafePhone}
              useSafe={useReceiverSafe}
              onToggle={() => setUseReceiverSafe((v) => !v)}
              label="수령자 안심번호 사용"
            />
          )}
          <Field label="수령 방법" required>
            <div className="relative">
              <select
                value={receiveMethod}
                onChange={(e) => setReceiveMethod(e.target.value as ReceiveMethod)}
                className="inp appearance-none pr-8"
              >
                <option value="direct">직접 수령</option>
                <option value="guard">경비실 맡기기</option>
                <option value="door">문 앞 두기</option>
                <option value="custom">직접 기재</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>
          {receiveMethod === "custom" && (
            <Field label="수령 방법 상세 입력" required>
              <input
                value={receiveMethodDetail}
                onChange={(e) => setReceiveMethodDetail(e.target.value)}
                placeholder="예) 1층 무인 택배함 A-12번"
                className="inp"
                maxLength={80}
              />
            </Field>
          )}
        </section>

        {/* Schedule */}
        <section className="space-y-3">
          <SectionLabel icon={<Clock className="size-4" />}>일정</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Field label="픽업 가능 시간" required>
              <input value={pickupWindow} onChange={(e) => setPickupWindow(e.target.value)} placeholder="오늘 14:00 ~ 18:00" className="inp" />
            </Field>
            <Field label="마감 시간" required>
              <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="내일 12:00까지" className="inp" />
            </Field>
          </div>
        </section>

        {/* Fee + payment */}
        <section className="space-y-3">
          <SectionLabel icon={<CreditCard className="size-4" />}>배송비 및 결제</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Field label="배송비 (원)" required>
              <input
                value={fee}
                onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))}
                placeholder="20000"
                inputMode="numeric"
                className="inp"
              />
            </Field>
            <Field label="결제 방식" required>
              <div className="relative">
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="inp appearance-none pr-8"
                >
                  <option value="escrow">안심결제</option>
                  <option value="prepaid">선불</option>
                  <option value="postpaid">후불</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
          </div>
          <PaymentDesc type={paymentType} />
        </section>

        {/* Notes + cautions */}
        <section className="space-y-3">
          <SectionLabel icon={<AlertTriangle className="size-4" />}>물품 설명 & 주의사항</SectionLabel>
          <Field label="물품 설명">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder="물품 특성, 취급 요령 등을 알려주세요."
              className="inp resize-none"
            />
          </Field>
          <Field label="주의사항 태그">
            <div className="flex gap-2">
              <input
                value={cautionInput}
                onChange={(e) => setCautionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCaution())}
                placeholder="예) 충격 주의"
                className="inp flex-1"
                maxLength={20}
              />
              <button
                type="button"
                onClick={addCaution}
                className="shrink-0 rounded-xl bg-secondary px-3 text-[13px] font-semibold text-secondary-foreground hover:bg-secondary/70"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {cautions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cautions.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-acorn/10 px-2.5 py-1 text-[12px] font-medium text-acorn"
                  >
                    {c}
                    <button type="button" onClick={() => setCautions((prev) => prev.filter((x) => x !== c))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </section>

        {/* Requester phone + safe number */}
        <section className="space-y-3">
          <SectionLabel icon={<Shield className="size-4" />}>요청자 연락처 및 안심번호</SectionLabel>
          <Field label="내 연락처">
            <input
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              placeholder="010-0000-0000"
              inputMode="tel"
              className="inp"
            />
          </Field>
          {requesterPhone.trim().length >= 9 && (
            <SafeNumberCard
              phone={requesterPhone}
              safePhone={requesterSafePhone}
              useSafe={useRequesterSafe}
              onToggle={() => setUseRequesterSafe((v) => !v)}
              label="내 연락처 안심번호로 공개"
            />
          )}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            안심번호 사용 시 승인된 드라이버에게는 050 번호가 공개되며, 실제 번호는 도토리마켓이 보호합니다.
          </p>
        </section>

        {error && (
          <p className="rounded-xl bg-acorn/10 px-4 py-2.5 text-[13px] font-medium text-acorn">
            {error}
          </p>
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            onClick={handleSubmit as any}
            disabled={!canSubmit || submitting}
            className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-[0_8px_20px_rgba(20,30,60,0.18)] disabled:opacity-40 disabled:shadow-none transition"
          >
            {submitting ? "등록 중…" : "배송 요청 등록하기"}
          </button>
        </div>
      </div>

      <style>{`
        .inp {
          width: 100%;
          border-radius: 0.75rem;
          background: var(--secondary);
          padding: 0.6875rem 1rem;
          font-size: 13.5px;
          color: var(--foreground);
          outline: none;
          border: 1px solid transparent;
          transition: all .15s;
        }
        .inp::placeholder { color: var(--muted-foreground); opacity: .7; }
        .inp:focus {
          background: var(--card);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 12%, transparent);
        }
      `}</style>
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-foreground">
      <span className="text-primary">{icon}</span>
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-acorn">*</span>}
      </label>
      {children}
    </div>
  );
}

function PaymentDesc({ type }: { type: PaymentType }) {
  const descs: Record<PaymentType, string> = {
    escrow: "도토리마켓이 배송비를 보관 후 수령 확인 시 드라이버에게 자동 정산합니다.",
    prepaid: "배송 신청 승인 전 요청자가 드라이버에게 직접 선불 결제합니다.",
    postpaid: "배송 완료 후 요청자가 드라이버에게 직접 후불 결제합니다.",
  };
  const colors: Record<PaymentType, string> = {
    escrow: "bg-sky/50 text-sky-foreground",
    prepaid: "bg-mint/40 text-mint-foreground",
    postpaid: "bg-accent text-accent-foreground",
  };
  return (
    <p className={`rounded-xl px-3 py-2.5 text-[12px] leading-relaxed ${colors[type]}`}>
      {descs[type]}
    </p>
  );
}
