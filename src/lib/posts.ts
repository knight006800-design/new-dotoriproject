import { supabase } from "./supabase";

export type PaymentType = "prepaid" | "postpaid" | "escrow";
export type ReceiveMethod = "direct" | "guard" | "door" | "custom";

export const PAYMENT_LABELS: Record<PaymentType, string> = {
  prepaid: "선불",
  postpaid: "후불",
  escrow: "안심결제",
};

export const RECEIVE_LABELS: Record<ReceiveMethod, string> = {
  direct: "직접 수령",
  guard: "경비실 맡기기",
  door: "문 앞 두기",
  custom: "직접 기재",
};

export type Post = {
  id: string;
  title: string;
  product: string;
  productImages: string[];
  fee: number;
  paymentType: PaymentType;
  fromArea: string;
  toArea: string;
  fromDetail: string;
  toDetail: string;
  receiverPhone: string;
  receiverSafePhone?: string;
  receiveMethod: ReceiveMethod;
  receiveMethodDetail?: string;
  pickupWindow: string;
  deadline: string;
  aiEstimate: string;
  notes: string;
  cautions: string[];
  requesterName?: string;
  requesterPhone?: string;
  requesterSafePhone?: string;
  useSafeNumber?: boolean;
  createdAt?: number;
};

export type CreatePostInput = Omit<Post, "id" | "createdAt">;

// ─── Seed posts (always shown) ──────────────────────────────────────────────
export const SEED_POSTS: Post[] = [
  {
    id: "1",
    title: "[울산 북구]→[울주군] 조립 PC 안전 배송요청 건",
    product: "RTX 5070 Ti 데스크톱 본체",
    productImages: [],
    fee: 25000,
    paymentType: "escrow",
    fromArea: "울산 북구 송정동",
    toArea: "울주군 온산공단",
    fromDetail: "한신휴플러스 아파트 102동 1503호",
    toDetail: "온산테크노빌딩 3층 302호",
    receiverPhone: "010-2845-7721",
    receiveMethod: "direct",
    pickupWindow: "오늘 14:00 ~ 18:00",
    deadline: "내일 12:00까지",
    aiEstimate: "약 45분 (출근 정체 반영)",
    notes: "고가의 PC 본체이며, 운반 시 충격에 매우 약합니다. 가능하시면 트렁크보다는 뒷좌석에 안전벨트로 고정해 주세요.",
    cautions: ["수직 운반 금지", "충격 주의", "비 노출 금지"],
    requesterName: "김영수",
    requesterPhone: "010-1234-5678",
  },
  {
    id: "2",
    title: "[부산 해운대]→[김해 장유] 한정판 운동화 당일 배송",
    product: "Nike Air Jordan 1 Retro High",
    productImages: [],
    fee: 18000,
    paymentType: "prepaid",
    fromArea: "부산 해운대구 우동",
    toArea: "김해시 장유면 율하동",
    fromDetail: "센텀시티 트라움하우스 1동 802호",
    toDetail: "율하 e편한세상 305동 1102호",
    receiverPhone: "010-9912-3344",
    receiveMethod: "door",
    pickupWindow: "오늘 11:00 ~ 13:00",
    deadline: "오늘 19:00까지",
    aiEstimate: "약 52분 (남해고속도로 원활)",
    notes: "박스 채로 포장된 미개봉 상품입니다. 박스 손상 시 가치가 크게 하락하므로 평평하게 보관해 주세요.",
    cautions: ["박스 손상 금지", "직사광선 회피"],
    requesterName: "이지은",
    requesterPhone: "010-9876-5432",
  },
  {
    id: "3",
    title: "[대전 유성]→[세종시] 도자기 작품 운반 요청",
    product: "수공예 백자 화병 (높이 35cm)",
    productImages: [],
    fee: 35000,
    paymentType: "escrow",
    fromArea: "대전 유성구 봉명동",
    toArea: "세종시 한솔동",
    fromDetail: "유성 도예공방 1층",
    toDetail: "첫마을 7단지 712동 503호",
    receiverPhone: "010-3322-8899",
    receiveMethod: "direct",
    pickupWindow: "내일 09:00 ~ 11:00",
    deadline: "내일 15:00까지",
    aiEstimate: "약 38분 (1번 국도 원활)",
    notes: "파손 시 복원이 불가한 수공예 작품입니다. 반드시 양손으로 운반 부탁드립니다.",
    cautions: ["파손 주의", "수직 보관 필수"],
    requesterName: "박민준",
    requesterPhone: "010-5555-7777",
  },
  {
    id: "4",
    title: "[수원 영통]→[성남 분당] 중요 서류 봉투 퀵 배송",
    product: "법무 계약 서류 1봉투 (A4)",
    productImages: [],
    fee: 12000,
    paymentType: "postpaid",
    fromArea: "수원 영통구 매탄동",
    toArea: "성남 분당구 정자동",
    fromDetail: "삼성디지털시티 R5타워 12층",
    toDetail: "정자동 두산위브파빌리온 23층",
    receiverPhone: "010-7766-1122",
    receiveMethod: "guard",
    pickupWindow: "오늘 16:00 ~ 17:30",
    deadline: "오늘 20:00까지",
    aiEstimate: "약 41분 (경부 정체 반영)",
    notes: "기밀 서류이며 개봉 금지입니다. 봉투 봉인 스티커 훼손 시 배송 무효 처리됩니다.",
    cautions: ["개봉 금지", "분실 시 전액 보상 책임"],
    requesterName: "최서현",
    requesterPhone: "010-3344-9900",
  },
];

// ─── Map Supabase row to Post ────────────────────────────────────────────────
function rowToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    product: row.product as string,
    productImages: (row.product_images as string[]) ?? [],
    fee: row.fee as number,
    paymentType: (row.payment_type as PaymentType) ?? "escrow",
    fromArea: (row.from_area as string) ?? "",
    toArea: (row.to_area as string) ?? "",
    fromDetail: (row.from_detail as string) ?? "",
    toDetail: (row.to_detail as string) ?? "",
    receiverPhone: (row.receiver_phone as string) ?? "",
    receiverSafePhone: (row.receiver_safe_phone as string) ?? undefined,
    receiveMethod: (row.receive_method as ReceiveMethod) ?? "direct",
    receiveMethodDetail: (row.receive_method_detail as string) ?? "",
    pickupWindow: (row.pickup_window as string) ?? "",
    deadline: (row.deadline as string) ?? "",
    aiEstimate: (row.ai_estimate as string) ?? "",
    notes: (row.notes as string) ?? "",
    cautions: (row.cautions as string[]) ?? [],
    requesterName: (row.requester_name as string) ?? "",
    requesterPhone: (row.requester_phone as string) ?? "",
    requesterSafePhone: (row.requester_safe_phone as string) ?? undefined,
    useSafeNumber: (row.use_safe_number as boolean) ?? false,
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : undefined,
  };
}

// ─── Fetch all posts (seed + Supabase) ──────────────────────────────────────
export async function getAllPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const supabasePosts = (data ?? []).map(rowToPost);
    return [...supabasePosts, ...SEED_POSTS];
  } catch {
    return SEED_POSTS;
  }
}

// ─── Get single post by ID ───────────────────────────────────────────────────
export async function getPostById(id: string): Promise<Post | null> {
  const seed = SEED_POSTS.find((p) => p.id === id);
  if (seed) return seed;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return rowToPost(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ─── Create a new post ───────────────────────────────────────────────────────
export async function createPost(input: CreatePostInput): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: input.title,
        product: input.product,
        product_images: input.productImages,
        fee: input.fee,
        payment_type: input.paymentType,
        from_area: input.fromArea,
        to_area: input.toArea,
        from_detail: input.fromDetail,
        to_detail: input.toDetail,
        receiver_phone: input.receiverPhone,
        receiver_safe_phone: input.receiverSafePhone ?? null,
        receive_method: input.receiveMethod,
        receive_method_detail: input.receiveMethodDetail ?? "",
        pickup_window: input.pickupWindow,
        deadline: input.deadline,
        ai_estimate: input.aiEstimate,
        notes: input.notes,
        cautions: input.cautions,
        requester_name: input.requesterName ?? "",
        requester_phone: input.requesterPhone ?? "",
        requester_safe_phone: input.requesterSafePhone ?? null,
        use_safe_number: input.useSafeNumber ?? false,
      })
      .select()
      .single();
    if (error || !data) return null;
    return rowToPost(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

// Legacy sync helper for seed posts only
export const getPost = (id: string) => SEED_POSTS.find((p) => p.id === id) ?? null;
