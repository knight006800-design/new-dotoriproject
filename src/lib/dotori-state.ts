// localStorage-backed state: member, applications, notifications
const MEMBER_KEY = "dotori.member";
const APP_KEY = "dotori.applications";
const NOTIF_KEY = "dotori.notifications";
const LOCATION_CONSENT_KEY = "dotori.locationConsent";
const SAFE_NUMBERS_KEY = "dotori.safeNumbers";

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  verified: boolean;
};

export type Rating = {
  id: string;
  postId: string;
  stars: number;
  comment: string;
  fromName: string;
  createdAt: number;
};

export type DriverStats = {
  completedCount: number;
  carbonKg: number;
  ratings: Rating[];
};

export type Member = {
  name: string;
  phone: string;
  password: string;
  vehicles: Vehicle[];
  stats: DriverStats;
  locationConsent: boolean;
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
      stats:
        m.stats && typeof m.stats === "object"
          ? { completedCount: m.stats.completedCount ?? 0, carbonKg: (m.stats as any).carbonKg ?? 0, ratings: m.stats.ratings ?? [] }
          : { completedCount: 0, carbonKg: 0, ratings: [] },
      locationConsent: m.locationConsent ?? false,
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

// ─── Location Consent ────────────────────────────────────────────────────────
export const hasLocationConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCATION_CONSENT_KEY) === "true";
};

export const grantLocationConsent = () => {
  localStorage.setItem(LOCATION_CONSENT_KEY, "true");
};

// ─── Applications ────────────────────────────────────────────────────────────
// driver_completed = driver marked delivery done, waiting for requester confirmation
export type AppStatus = "applied" | "approved" | "driver_completed" | "completed";

export type DriverSnapshot = {
  name: string;
  phone: string;
  vehiclePlate: string;
  vehicleModel?: string;
  vehicleType?: string;
  completedCount: number;
  carbonKg: number;
  recentRatings: Rating[];
};

export type AppState = {
  status: AppStatus;
  vehiclePlate?: string;
  driver?: DriverSnapshot;
  approvedAt?: number;
  driverCompletedAt?: number;
  requesterRating?: Rating;
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
      vehicleType: "sedan",
      completedCount: member.stats.completedCount,
      carbonKg: member.stats.carbonKg,
      recentRatings: member.stats.ratings.slice(-3).reverse(),
    };
  }
  m[postId] = { status: "applied", vehiclePlate, driver };
  writeApps(m);
  pushNotification({
    type: "application",
    postId,
    title: "새 배송 신청이 도착했어요",
    body: `${driver?.name ?? "드라이버"}님이 배송을 신청했습니다. 차량·이력 확인 후 승인해주세요.`,
  });
};

export const approveApplication = (postId: string) => {
  const m = readApps();
  if (m[postId]) {
    m[postId].status = "approved";
    m[postId].approvedAt = Date.now();
  } else {
    m[postId] = { status: "approved", approvedAt: Date.now() };
  }
  writeApps(m);
  pushNotification({
    type: "approved",
    postId,
    title: "매칭이 승인되었어요",
    body: "요청자가 신청을 승인했어요. 상세주소와 수령 정보가 공개됩니다.",
  });
};

// Driver marks delivery as done — requester must confirm
export const driverCompleteDelivery = (postId: string) => {
  const m = readApps();
  if (m[postId]) {
    m[postId].status = "driver_completed";
    m[postId].driverCompletedAt = Date.now();
  }
  writeApps(m);
  pushNotification({
    type: "driver_completed",
    postId,
    title: "드라이버가 배송 완료를 신고했어요",
    body: "수령 확인 후 [수령 완료] 버튼을 눌러 운송을 마무리해주세요.",
  });
};

// Requester confirms receipt and rates driver
export const requesterConfirmDelivery = (
  postId: string,
  rating: Omit<Rating, "id" | "postId" | "createdAt">,
  carbonSavedKg?: number
) => {
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
  const member = getMember();
  if (member) {
    setMember({
      ...member,
      stats: {
        completedCount: member.stats.completedCount + 1,
        carbonKg: (member.stats.carbonKg ?? 0) + (carbonSavedKg ?? 0),
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

// Legacy alias
export const completeApplication = requesterConfirmDelivery;

export const resetApplication = (postId: string) => {
  const m = readApps();
  delete m[postId];
  writeApps(m);
};

// ─── Carbon savings ──────────────────────────────────────────────────────────
// CO₂ saved = distance × (avg car emission 0.21 kg/km − vehicle type emission)
export const VEHICLE_EMISSION: Record<string, number> = {
  sedan: 0.13,
  suv: 0.16,
  van: 0.17,
  truck: 0.10,
  ev: 0.04,
};

export function calcCarbonSaved(distanceKm: number, vehicleType: string): number {
  const baseline = 0.21;
  const actual = VEHICLE_EMISSION[vehicleType] ?? 0.13;
  return Math.max(0, (baseline - actual) * distanceKm);
}

export const recordCarbonSaving = (postId: string, distanceKm: number, vehicleType: string) => {
  const saved = calcCarbonSaved(distanceKm, vehicleType);
  const member = getMember();
  if (member) {
    setMember({ ...member, stats: { ...member.stats, carbonKg: (member.stats.carbonKg ?? 0) + saved } });
  }
  return saved;
};


// ─── Safe Numbers ─────────────────────────────────────────────────────────────
export type SafeNumberEntry = {
  original: string;
  safe: string;
};

const readSafeNumbers = (): SafeNumberEntry[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SAFE_NUMBERS_KEY) || "[]"); }
  catch { return []; }
};

export const generateSafeNumber = (originalPhone: string): string => {
  const existing = readSafeNumbers().find((e) => e.original === originalPhone);
  if (existing) return existing.safe;
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  const safe = `050-7100-${suffix}`;
  const list = readSafeNumbers();
  list.push({ original: originalPhone, safe });
  localStorage.setItem(SAFE_NUMBERS_KEY, JSON.stringify(list));
  return safe;
};

export const resolveSafeNumber = (safe: string): string | null => {
  return readSafeNumbers().find((e) => e.safe === safe)?.original ?? null;
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export type Notification = {
  id: string;
  type: "application" | "approved" | "driver_completed" | "completed" | "support";
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
