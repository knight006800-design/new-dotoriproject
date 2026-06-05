import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  LifeBuoy,
  Send,
  Flag,
  Mail,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "고객센터 — 도토리마켓" }] }),
});

const FAQ: { q: string; a: string }[] = [
  {
    q: "배송비는 언제 정산되나요?",
    a: "수령자가 수령 확인을 누른 시점에 안심 에스크로에 보관된 배송비가 자동 정산됩니다. 분쟁이 발생한 경우 양측 증빙 자료를 기반으로 중재 후 정산이 이루어집니다.",
  },
  {
    q: "물품이 파손되면 어떻게 보상받나요?",
    a: "가입 시 동의한 물피보상 한도(최대 200만원) 범위 내에서 자동 보상됩니다. 픽업 직후·수령 직전 사진 인증이 의무이며, 미인증 시 보상이 제한될 수 있어요.",
  },
  {
    q: "상세 주소는 왜 매칭 승인 후에야 보이나요?",
    a: "요청자의 개인정보 보호를 위해 매칭이 승인되기 전까지 출발/도착 상세주소, 수령자 연락처, 공동현관 비밀번호는 마스킹 처리됩니다.",
  },
  {
    q: "드라이버 차량을 인증하려면 어떻게 하나요?",
    a: "[내 정보 → 차량 인증하기]에서 차량번호와 차종을 입력하면 명의 확인 절차를 거쳐 인증됩니다. 인증된 차량은 신청 시 자동으로 불러올 수 있어요.",
  },
  {
    q: "수령자가 부재중이면 어떻게 되나요?",
    a: "도착 후 15분 대기 + 현장 사진 인증을 거치면 노쇼 처리됩니다. 배송비 70%가 드라이버에게 지급되며, 반송비는 요청자에게 별도 청구됩니다.",
  },
  {
    q: "신고는 어떤 경우에 할 수 있나요?",
    a: "허위 게시글, 폭언/협박, 부당한 추가 요구, 금지 물품(주류·담배·의약품 등) 운반 요청 등 정책 위반 시 신고할 수 있어요. 신고 내용은 24시간 내 검토됩니다.",
  },
];

function SupportPage() {
  const [tab, setTab] = useState<"contact" | "report">("contact");

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <Link to="/" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">고객센터</p>
        <div className="size-10" />
      </div>

      <main className="mx-auto max-w-md px-5 pt-5">
        {/* Hero */}
        <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-2">
            <LifeBuoy className="size-5" />
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-primary-foreground/80">
              Help Center
            </p>
          </div>
          <h1 className="mt-2 text-[18px] font-bold leading-snug">
            도토리마켓 사용 중 궁금한 점이<br />있으신가요?
          </h1>
          <p className="mt-2 text-[12.5px] text-primary-foreground/80">
            평일 09:00 ~ 19:00 · 평균 응답 4시간 이내
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-5">
          <p className="mb-2.5 text-[13.5px] font-bold">자주 묻는 질문</p>
          <ul className="space-y-2">
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </ul>
        </section>

        {/* Tabs */}
        <section className="mt-7">
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            <TabBtn active={tab === "contact"} onClick={() => setTab("contact")}>
              <Mail className="mr-1 inline size-3.5" /> 1:1 문의
            </TabBtn>
            <TabBtn active={tab === "report"} onClick={() => setTab("report")}>
              <Flag className="mr-1 inline size-3.5" /> 신고하기
            </TabBtn>
          </div>

          <div className="mt-3">
            {tab === "contact" ? <ContactForm /> : <ReportForm />}
          </div>
        </section>
      </main>
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-[13.5px] font-semibold">{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border bg-secondary/40 px-4 py-3 text-[12.5px] leading-relaxed text-foreground/80">
          {a}
        </div>
      )}
    </li>
  );
}

function ContactForm() {
  const [category, setCategory] = useState("결제/정산");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !title || body.length < 5) return;
    // simulate send
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTitle("");
      setBody("");
    }, 2400);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[13px] font-semibold">메일 형태로 문의를 보내드립니다</p>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground">
        전화 연결은 운영하지 않아요. 작성하신 내용이 help@dotori.market 으로 전달됩니다.
      </p>

      <div className="mt-3 space-y-2.5">
        <FieldLabel>문의 유형</FieldLabel>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-transparent focus:ring-primary"
        >
          {["결제/정산", "배송 분쟁", "차량 인증", "계정/회원정보", "기타"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <FieldLabel>회신받을 이메일</FieldLabel>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-transparent focus:ring-primary"
          maxLength={120}
        />

        <FieldLabel>제목</FieldLabel>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 8/15 부산→김해 건 정산 확인 부탁드립니다"
          className="w-full rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-transparent focus:ring-primary"
          maxLength={80}
        />

        <FieldLabel hint={`${body.length}/1000`}>내용</FieldLabel>
        <textarea
          required
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 1000))}
          placeholder="문의 내용을 자세히 적어주세요. 게시글 번호, 발생 시각을 알려주시면 빠르게 도와드려요."
          className="w-full resize-none rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] leading-relaxed outline-none ring-1 ring-transparent focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={sent}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:bg-mint disabled:text-mint-foreground"
      >
        {sent ? (
          <>
            <CheckCircle2 className="mr-1.5 inline size-4" /> 전송 완료 · 4시간 내 회신드릴게요
          </>
        ) : (
          <>
            <Send className="mr-1.5 inline size-4" /> 문의 메일 보내기
          </>
        )}
      </button>
    </form>
  );
}

function ReportForm() {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("허위 게시글");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || detail.length < 5) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setTarget("");
      setDetail("");
    }, 2400);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-acorn/40 bg-acorn/[0.04] p-4">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-acorn" />
        <div>
          <p className="text-[13px] font-bold text-acorn">신고 접수</p>
          <p className="mt-0.5 text-[11.5px] text-foreground/75">
            악의적 신고는 이용 제한될 수 있어요. 접수된 신고는 24시간 내 검토됩니다.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <FieldLabel>신고 대상 (사용자 ID 또는 게시글 번호)</FieldLabel>
        <input
          required
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="예) 게시글 #3 또는 driver_2284"
          className="w-full rounded-xl bg-card px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-border focus:ring-acorn"
          maxLength={80}
        />

        <FieldLabel>신고 사유</FieldLabel>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl bg-card px-3.5 py-2.5 text-[13.5px] outline-none ring-1 ring-border focus:ring-acorn"
        >
          {[
            "허위 게시글",
            "폭언/협박",
            "부당한 추가 요구",
            "금지 물품 운반 요청",
            "사기/금전 사기",
            "기타",
          ].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <FieldLabel hint={`${detail.length}/1000`}>상세 내용 및 증빙</FieldLabel>
        <textarea
          required
          rows={5}
          value={detail}
          onChange={(e) => setDetail(e.target.value.slice(0, 1000))}
          placeholder="발생 시각, 대화 내용, 캡처 가능한 증빙을 함께 적어주세요."
          className="w-full resize-none rounded-xl bg-card px-3.5 py-2.5 text-[13.5px] leading-relaxed outline-none ring-1 ring-border focus:ring-acorn"
        />
      </div>

      <button
        type="submit"
        disabled={sent}
        className="mt-4 w-full rounded-xl bg-acorn py-3 text-[14px] font-bold text-acorn-foreground disabled:opacity-70"
      >
        {sent ? (
          <>
            <CheckCircle2 className="mr-1.5 inline size-4" /> 신고 접수 완료
          </>
        ) : (
          <>
            <Flag className="mr-1.5 inline size-4" /> 신고 접수하기
          </>
        )}
      </button>
    </form>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[12px] font-semibold text-muted-foreground">
        {children}
      </span>
      {hint && <span className="text-[10.5px] text-muted-foreground/70">{hint}</span>}
    </div>
  );
}
