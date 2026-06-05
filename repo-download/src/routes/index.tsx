import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, MapPin, Clock, Sparkles, ChevronRight, User, LifeBuoy } from "lucide-react";
import { posts } from "@/lib/posts";
import { getUnreadCount } from "@/lib/dotori-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "도토리마켓 — 이동 경로 기반 안전 배송 중개" },
      { name: "description", content: "출장과 이동이 잦은 운전자들이 차량 경로 위에서 안전하게 물품을 배송하고 부수입을 얻는 신뢰 기반 중개 플랫폼." },
      { property: "og:title", content: "도토리마켓" },
      { property: "og:description", content: "이동 경로 위에서 만나는 안전 배송 중개" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        <HeroBanner />
        <FilterBar />
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                to="/post/$id"
                params={{ id: p.id }}
                className="group block rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(20,30,60,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,30,60,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                        안심 에스크로
                      </span>
                      <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-mint-foreground">
                        당일배송
                      </span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground">
                      {p.title}
                    </h3>
                  </div>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                <div className="mt-3 rounded-xl bg-secondary/50 px-3 py-2.5">
                  <p className="text-[13px] text-muted-foreground">상품</p>
                  <p className="text-sm font-medium text-foreground">{p.product}</p>
                </div>

                <div className="mt-3 flex items-start gap-2 text-[13px] text-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="leading-relaxed">
                    <span className="font-medium">{p.fromArea}</span>
                    <span className="mx-1.5 text-muted-foreground">→</span>
                    <span className="font-medium">{p.toArea}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    픽업 {p.pickupWindow}
                  </span>
                  <span>마감 {p.deadline}</span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[12px] font-medium text-accent-foreground">
                    <Sparkles className="size-3.5" />
                    AI 예상: {p.aiEstimate}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">배송비</p>
                    <p className="text-base font-bold text-primary">
                      {p.fee.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function Header() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    setUnread(getUnreadCount());
    const i = setInterval(() => setUnread(getUnreadCount()), 1500);
    return () => clearInterval(i);
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(20,30,60,0.2)]">
            <AcornIcon />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-tight text-foreground">도토리마켓</p>
            <p className="text-[11px] text-muted-foreground">이동 경로 위 안전 배송</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/profile"
            className="grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="내 정보"
          >
            <User className="size-5" />
          </Link>
          <Link
            to="/notifications"
            className="relative grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="알림"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid min-w-[16px] place-items-center rounded-full bg-acorn px-1 text-[9.5px] font-bold leading-4 text-acorn-foreground ring-2 ring-background">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link
            to="/support"
            className="grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="고객센터"
          >
            <LifeBuoy className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="overflow-hidden rounded-2xl bg-primary px-5 py-5 text-primary-foreground">
      <p className="text-[12px] font-medium text-primary-foreground/70">오늘의 도토리</p>
      <h2 className="mt-1 text-[19px] font-bold leading-snug">
        가는 길에 잠깐, <br />
        커피값 + 주유비 벌어가세요 ☕
      </h2>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-[12px]">
        <span className="size-1.5 rounded-full bg-mint" />
        실시간 24건의 요청이 매칭 대기 중
      </div>
    </section>
  );
}

function FilterBar() {
  const chips = ["전체", "수도권", "영남권", "호남권", "당일배송", "고가품"];
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((c, i) => (
        <button
          key={c}
          className={
            "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition " +
            (i === 0
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
          }
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function AcornIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M5 9c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v.5c0 .8-.7 1.5-1.5 1.5h-11C5.7 11 5 10.3 5 9.5V9Z"
        fill="currentColor"
        opacity=".4"
      />
      <path
        d="M7 11h10c-.4 4.4-3 8-5 8s-4.6-3.6-5-8Z"
        fill="currentColor"
      />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
