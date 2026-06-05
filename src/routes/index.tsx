import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Bell, MapPin, Clock, Sparkles, ChevronRight, User, LifeBuoy, PenSquare, Search, X } from "lucide-react";
import { getAllPosts, PAYMENT_LABELS, type Post } from "@/lib/posts";
import { getUnreadCount } from "@/lib/dotori-state";

export const Route = createFileRoute("/")({
  loader: async () => getAllPosts(),
  component: Index,
});

const REGIONS = ["전체", "수도권", "영남권", "호남권", "충청권", "강원권", "제주"];

const REGION_KEYWORDS: Record<string, string[]> = {
  수도권: ["서울", "인천", "경기", "수원", "성남", "용인", "부천", "안양", "의정부", "고양", "분당", "일산", "평택", "화성", "시흥"],
  영남권: ["부산", "대구", "울산", "경남", "경북", "김해", "창원", "포항", "안동", "거제", "통영", "진주"],
  호남권: ["광주", "전남", "전북", "전주", "여수", "순천", "목포", "군산", "익산"],
  충청권: ["대전", "세종", "충남", "충북", "청주", "천안", "아산", "당진"],
  강원권: ["강원", "춘천", "원주", "강릉", "속초", "동해"],
  제주: ["제주", "서귀포"],
};

function postMatchesRegion(post: Post, region: string): boolean {
  if (region === "전체") return true;
  const keywords = REGION_KEYWORDS[region] ?? [];
  const text = `${post.fromArea} ${post.toArea}`;
  return keywords.some((k) => text.includes(k));
}

function Index() {
  const seedPosts = Route.useLoaderData() as Post[];
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [region, setRegion] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(getUnreadCount());
    const i = setInterval(() => setUnread(getUnreadCount()), 1500);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchRegion = postMatchesRegion(p, region);
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.fromArea.toLowerCase().includes(q) ||
        p.toArea.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [posts, region, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header unread={unread} />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        <HeroBanner />

        {/* Region chip + search row */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition " +
                  (r === region
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
                }
              >
                {r}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="지역·상품명 검색 (예: 부산, 노트북)"
              className="w-full rounded-full bg-secondary py-2.5 pl-9 pr-9 text-[13px] text-foreground outline-none ring-1 ring-transparent focus:bg-card focus:ring-primary/30 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Post list */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[14px] font-semibold text-foreground">해당 조건의 요청이 없어요</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">다른 지역이나 검색어를 시도해보세요.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  to="/post/$id"
                  params={{ id: p.id }}
                  className="group block rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(20,30,60,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,30,60,0.08)]"
                >
                  {/* Thumbnail images */}
                  {p.productImages.length > 0 && (
                    <div className="mb-3 flex gap-1.5">
                      {p.productImages.slice(0, 3).map((src, i) => (
                        <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PaymentBadge type={p.paymentType} />
                        <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-mint-foreground">당일배송</span>
                      </div>
                      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground">{p.title}</h3>
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
                    {p.aiEstimate ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[12px] font-medium text-accent-foreground">
                        <Sparkles className="size-3.5" />
                        AI 예상: {p.aiEstimate}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">배송비</p>
                      <p className="text-base font-bold text-primary">{p.fee.toLocaleString()}원</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FAB: create post */}
      <Link
        to="/create-post"
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[14px] font-bold text-primary-foreground shadow-[0_8px_24px_rgba(20,30,60,0.28)] transition hover:scale-105 active:scale-95"
        aria-label="배송 요청 글쓰기"
      >
        <PenSquare className="size-5" />
        배송 요청 글쓰기
      </Link>
    </div>
  );
}

function Header({ unread }: { unread: number }) {
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
          <Link to="/profile" className="grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary" aria-label="내 정보">
            <User className="size-5" />
          </Link>
          <Link to="/notifications" className="relative grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary" aria-label="알림">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid min-w-[16px] place-items-center rounded-full bg-acorn px-1 text-[9.5px] font-bold leading-4 text-acorn-foreground ring-2 ring-background">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link to="/support" className="grid size-10 place-items-center rounded-full text-foreground transition hover:bg-secondary" aria-label="고객센터">
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

function PaymentBadge({ type }: { type: Post["paymentType"] }) {
  const colors = {
    escrow: "bg-secondary text-secondary-foreground",
    prepaid: "bg-mint text-mint-foreground",
    postpaid: "bg-accent text-accent-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[type]}`}>
      {PAYMENT_LABELS[type]}
    </span>
  );
}

function AcornIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M5 9c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v.5c0 .8-.7 1.5-1.5 1.5h-11C5.7 11 5 10.3 5 9.5V9Z" fill="currentColor" opacity=".4" />
      <path d="M7 11h10c-.4 4.4-3 8-5 8s-4.6-3.6-5-8Z" fill="currentColor" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
