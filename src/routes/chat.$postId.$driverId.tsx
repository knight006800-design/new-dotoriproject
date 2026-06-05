import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Package, User, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMember } from "@/lib/dotori-state";
import { getPostById, type Post } from "@/lib/posts";

export const Route = createFileRoute("/chat/$postId/$driverId")({
  component: ChatPage,
});

type ChatMessage = {
  id: string;
  post_id: string;
  driver_id: string;
  sender_role: "requester" | "driver";
  message: string;
  created_at: string;
};

function ChatPage() {
  const { postId, driverId } = Route.useParams();
  const router = useRouter();
  const member = getMember();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Determine if current user is the requester or driver
  const role: "requester" | "driver" = member?.name === driverId ? "driver" : "requester";

  useEffect(() => {
    getPostById(postId).then((p) => setPost(p));
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${postId}:${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.driver_id === driverId) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId, driverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("post_id", postId)
      .eq("driver_id", driverId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const optimistic: ChatMessage = {
      id: `local_${Date.now()}`,
      post_id: postId,
      driver_id: driverId,
      sender_role: role,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    await supabase.from("chat_messages").insert({
      post_id: postId,
      driver_id: driverId,
      sender_role: role,
      message: text,
    });
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/70 bg-background/90 px-3 py-3 backdrop-blur-md">
        <button
          onClick={() => router.history.back()}
          className="grid size-10 place-items-center rounded-full hover:bg-secondary"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold truncate">
            {driverId} 드라이버와의 채팅
          </p>
          {post && (
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <Package className="size-3 inline" />
              {post.title}
            </p>
          )}
        </div>
      </div>

      {/* Post context banner */}
      {post && (
        <Link
          to="/post/$id"
          params={{ id: postId }}
          className="mx-4 mt-3 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.04] px-3.5 py-2.5 hover:bg-primary/[0.08] transition"
        >
          <Package className="size-4 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-primary truncate">{post.title}</p>
            <p className="text-[11px] text-muted-foreground">{post.fromArea} → {post.toArea} · {post.fee.toLocaleString()}원</p>
          </div>
          <span className="text-[11px] text-primary">글 보기 →</span>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-2.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground mb-3">
              <Truck className="size-6" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">아직 메시지가 없어요</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">배송 요청 관련 내용을 자유롭게 나눠보세요.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_role === role;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                  {msg.sender_role === "driver" ? <Truck className="size-3.5" /> : <User className="size-3.5" />}
                </div>
              )}
              <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 ${isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card border border-border text-foreground"}`}>
                <p className="text-[13.5px] leading-relaxed">{msg.message}</p>
                <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="메시지를 입력하세요…"
            className="flex-1 rounded-2xl border border-border bg-secondary px-4 py-2.5 text-[13.5px] outline-none focus:border-primary focus:bg-card transition"
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition hover:opacity-90"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
