import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCheck, Package, ThumbsUp, CheckCircle2, LifeBuoy } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/dotori-state";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "알림 — 도토리마켓" }] }),
});

function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);

  const refresh = () => setItems(getNotifications());
  useEffect(() => {
    refresh();
  }, []);

  const open = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.postId) {
      navigate({ to: "/post/$id", params: { id: n.postId }, search: { action: n.type === "application" ? "approve" : undefined } as any });
    } else {
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/85 px-3 py-3 backdrop-blur-md">
        <Link to="/" className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="text-sm font-semibold">알림</p>
        <button
          onClick={() => {
            markAllNotificationsRead();
            refresh();
          }}
          className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          aria-label="모두 읽음"
        >
          <CheckCheck className="size-5" />
        </button>
      </div>

      <main className="mx-auto max-w-md px-4 pt-3">
        {items.length === 0 && (
          <div className="mt-24 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Bell className="size-6" />
            </div>
            <p className="mt-3 text-[14px] font-semibold">아직 알림이 없어요</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              새 신청, 매칭 승인, 운송 완료 알림이 여기에 표시돼요.
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,30,60,0.08)] ${
                  n.read
                    ? "border-border bg-card"
                    : "border-primary/30 bg-primary/[0.04]"
                }`}
              >
                <NotifIcon type={n.type} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold leading-tight">{n.title}</p>
                    {!n.read && <span className="size-1.5 rounded-full bg-acorn" />}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                    {relTime(n.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

function NotifIcon({ type }: { type: Notification["type"] }) {
  const map = {
    application: { Icon: Package, cls: "bg-acorn/15 text-acorn" },
    approved: { Icon: ThumbsUp, cls: "bg-primary/10 text-primary" },
    completed: { Icon: CheckCircle2, cls: "bg-mint text-mint-foreground" },
    support: { Icon: LifeBuoy, cls: "bg-sky text-sky-foreground" },
  } as const;
  const { Icon, cls } = map[type];
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-full ${cls}`}>
      <Icon className="size-4.5" />
    </span>
  );
}

function relTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
