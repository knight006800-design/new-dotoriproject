export type Post = {
  id: string;
  title: string;
  product: string;
  fee: number;
  fromArea: string;
  toArea: string;
  fromDetail: string;
  toDetail: string;
  receiverPhone: string;
  entryCode: string;
  pickupWindow: string;
  deadline: string;
  aiEstimate: string;
  notes: string;
  cautions: string[];
};

export const posts: Post[] = [
  {
    id: "1",
    title: "[울산 중구]→[서울 강서구] 조립 PC 안전 배송요청 건",
    product: "RTX 5070 Ti 데스크톱 본체",
    fee: 25000,
    fromArea: "울산 북구 송정동",
    toArea: "울주군 온산공단",
    fromDetail: "한신휴플러스 아파트 102동 1503호",
    toDetail: "온산테크노빌딩 3층 302호",
    receiverPhone: "010-2845-7721",
    entryCode: "공동현관 #1204*",
    pickupWindow: "오늘 14:00 ~ 18:00",
    deadline: "내일 12:00까지",
    aiEstimate: "약 45분 (출근 정체 반영)",
    notes: "고가의 PC 본체이며, 운반 시 충격에 매우 약합니다. 가능하시면 트렁크보다는 뒷좌석에 안전벨트로 고정해 주세요.",
    cautions: ["수직 운반 금지", "충격 주의", "비 노출 금지"],
  },
  {
    id: "2",
    title: "[부산 해운대]→[김해 장유] 한정판 운동화 당일 배송",
    product: "Nike Air Jordan 1 Retro High",
    fee: 18000,
    fromArea: "부산 해운대구 우동",
    toArea: "김해시 장유면 율하동",
    fromDetail: "센텀시티 트라움하우스 1동 802호",
    toDetail: "율하 e편한세상 305동 1102호",
    receiverPhone: "010-9912-3344",
    entryCode: "현관 비밀번호 0429#",
    pickupWindow: "오늘 11:00 ~ 13:00",
    deadline: "오늘 19:00까지",
    aiEstimate: "약 52분 (남해고속도로 원활)",
    notes: "박스 채로 포장된 미개봉 상품입니다. 박스 손상 시 가치가 크게 하락하므로 평평하게 보관해 주세요.",
    cautions: ["박스 손상 금지", "직사광선 회피"],
  },
  {
    id: "3",
    title: "[대전 유성]→[세종시] 도자기 작품 운반 요청",
    product: "수공예 백자 화병 (높이 35cm)",
    fee: 35000,
    fromArea: "대전 유성구 봉명동",
    toArea: "세종시 한솔동",
    fromDetail: "유성 도예공방 1층",
    toDetail: "첫마을 7단지 712동 503호",
    receiverPhone: "010-3322-8899",
    entryCode: "공동현관 *7788",
    pickupWindow: "내일 09:00 ~ 11:00",
    deadline: "내일 15:00까지",
    aiEstimate: "약 38분 (1번 국도 원활)",
    notes: "파손 시 복원이 불가한 수공예 작품입니다. 반드시 양손으로 운반 부탁드립니다.",
    cautions: ["파손 주의", "수직 보관 필수"],
  },
  {
    id: "4",
    title: "[수원 영통]→[성남 분당] 중요 서류 봉투 퀵 배송",
    product: "법무 계약 서류 1봉투 (A4)",
    fee: 12000,
    fromArea: "수원 영통구 매탄동",
    toArea: "성남 분당구 정자동",
    fromDetail: "삼성디지털시티 R5타워 12층",
    toDetail: "정자동 두산위브파빌리온 23층",
    receiverPhone: "010-7766-1122",
    entryCode: "안내데스크 수령",
    pickupWindow: "오늘 16:00 ~ 17:30",
    deadline: "오늘 20:00까지",
    aiEstimate: "약 41분 (경부 정체 반영)",
    notes: "기밀 서류이며 개봉 금지입니다. 봉투 봉인 스티커 훼손 시 배송 무효 처리됩니다.",
    cautions: ["개봉 금지", "분실 시 전액 보상 책임"],
  },
];

export const getPost = (id: string) => posts.find((p) => p.id === id);
