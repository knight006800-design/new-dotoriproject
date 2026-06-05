// Simple localStorage-backed client state for member + per-post application status + notifications.
const MEMBER_KEY = "dotori.member";
const APP_KEY = "dotori.applications"; // { [postId]: AppState }
const NOTIF_KEY = "dotori.notifications";
const DRIVER_STATS_KEY = "dotori.driverStats"; // overall completed/ratings

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  verified: boolean;
};

export type Rating = {
  id: string;
  postId: string;
  stars: number; // 1..5
  comment: string;
  fromName: string; // requester display name
  createdAt: number;
};

export type DriverStats = {
  completedCount: number;
  ratings: Rating[];
};

export type Member = {
  name: string;
  phone: string;
  password: string;
  vehicles: Vehicle[];
  stats: DriverStats;
};

export const getMember = (): Member | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MEMBER_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as Partial<Member>;
    return {
      name: m.name ?? "",
      phone: m.phone ?? "",
      password: m.password ?? "",
      vehicles: Array.isArray(m.vehicles) ? m.vehicles : [],
      stats: m.stats && typeof m.stats === "object"
        ? { completedCount: m.stats.completedCount ?? 0, ratings: m.stats.ratings ?? [] }
        : { completedCount: 0, ratings: [] },
    };
  } catch {
    return null;
  }
};

export const setMember = (m: Member) => {
  localStorage.setItem(MEMBER_KEY, JSON.stringify(m));
};

export const addVehicle = (v: Omit<Vehicle, "id">) => {
  const cur = getMember();
  if (!cur) return;
  const vehicle: Vehicle = { ...v, id: `veh_${Date.now()}` };
  setMember({ ...cur, vehicles: [...cur.vehicles, vehicle] });
  return vehicle;
};

export const removeVehicle = (id: string) => {
  const cur = getMember();
  if (!cur) return;
  setMember({ ...cur, vehicles: cur.vehicles.filter((v) => v.id !== id) });
};

// ----- Applications -----
export type AppStatus = "applied" | "approved" | "completed";
export type DriverSnapshot = {
  name: string;
  phone: string;
  vehiclePlate: string;
  vehicleModel?: string;
  completedCount: number;
  recentRatings: Rating[];
};
export type AppState = {
  status: AppStatus;
  vehiclePlate?: string;
  driver?: DriverSnapshot;
  requesterRating?: Rating; // rating left by requester for driver
};

type AppMap = Record<string, AppState>;

const readApps = (): AppMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(APP_KEY) || "{}");
    const out: AppMap = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") out[k] = { status: v as AppStatus };
      else out[k] = v as AppState;
    }
    return out;
  } catch {
    return {};
  }
};

const writeApps = (m: AppMap) => localStorage.setItem(APP_KEY, JSON.stringify(m));

export const getApplication = (postId: string): AppState | undefined =>
  readApps()[postId];

export const getApplicationStatus = (postId: string) => readApps()[postId]?.status;

export const applyForPost = (postId: string, vehiclePlate?: string) => {
  const m = readApps();
  const member = getMember();
  let driver: DriverSnapshot | undefined;
  if (member) {
    const veh = member.vehicles.find((v) => v.plate === vehiclePlate);
    driver = {
      name: member.name,
      phone: member.phone,
      vehiclePlate: vehiclePlate ?? "미등록",
      vehicleModel: veh?.model,
      completedCount: member.stats.completedCount,
      recentRatings: member.stats.ratings.slice(-3).reverse(),
    };
  }
  m[postId] = { status: "applied", vehiclePlate, driver };
  writeApps(m);
  // create notification for requester
  pushNotification({
    type: "application",
    postId,
    title: "새 배송 신청이 도착했어요",
    body: `${driver?.name ?? "드라이버"}님이 배송을 신청했습니다. 차량·이력 확인 후 승인해주세요.`,
  });
};

export const approveApplication = (postId: string) => {
  const m = readApps();
  if (m[postId]) m[postId].status = "approved";
  else m[postId] = { status: "approved" };
  writeApps(m);
  pushNotification({
    type: "approved",
    postId,
    title: "매칭이 승인되었어요",
    body: "요청자가 신청을 승인했어요. 상세주소와 수령 정보가 공개됩니다.",
  });
};

export const completeApplication = (postId: string, rating: Omit<Rating, "id" | "postId" | "createdAt">) => {
  const m = readApps();
  const r: Rating = {
    ...rating,
    id: `rt_${Date.now()}`,
    postId,
    createdAt: Date.now(),
  };
  if (m[postId]) {
    m[postId].status = "completed";
    m[postId].requesterRating = r;
  }
  writeApps(m);
  // Add to driver stats
  const member = getMember();
  if (member) {
    setMember({
      ...member,
      stats: {
        completedCount: member.stats.completedCount + 1,
        ratings: [...member.stats.ratings, r],
      },
    });
  }
  pushNotification({
    type: "completed",
    postId,
    title: "운송이 완료되었어요",
    body: `평가 ${"★".repeat(r.stars)} 기록 · 실적이 업데이트되었습니다.`,
  });
};

export const resetApplication = (postId: string) => {
  const m = readApps();
  delete m[postId];
  writeApps(m);
};

// ----- Notifications -----
export type Notification = {
  id: string;
  type: "application" | "approved" | "completed" | "support";
  postId?: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export const getNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeNotifications = (list: Notification[]) =>
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list));

export const pushNotification = (n: Omit<Notification, "id" | "createdAt" | "read">) => {
  if (typeof window === "undefined") return;
  const list = getNotifications();
  list.unshift({
    ...n,
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
    read: false,
  });
  writeNotifications(list.slice(0, 50));
};

export const markNotificationRead = (id: string) => {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  writeNotifications(list);
};

export const markAllNotificationsRead = () => {
  writeNotifications(getNotifications().map((n) => ({ ...n, read: true })));
};

export const getUnreadCount = () => getNotifications().filter((n) => !n.read).length;
