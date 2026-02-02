export const FRIDGE_ZONES = [
  { id: 'fridge', label: '냉장실' },
  { id: 'fridge-door', label: '냉장실 문쪽' },
  { id: 'freezer', label: '냉동실' },
  { id: 'freezer-door', label: '냉동실 문쪽' },
] as const;

export type FridgeZoneId = (typeof FRIDGE_ZONES)[number]['id'];

export const ZONE_IDS = FRIDGE_ZONES.map(z => z.id) as readonly string[];

export const DND_TYPES = {
  FRIDGE_ITEM: 'FRIDGE_ITEM',
} as const;

export interface DragItem {
  type: typeof DND_TYPES.FRIDGE_ITEM;
  id: string;
  sourceZone: string | null;
}

// 카테고리 키워드 → 아이콘 타입 매핑
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  dairy: ['유제품', '우유', '치즈', '요구르트', '버터', '크림'],
  meat: ['육류', '고기', '소고기', '돼지고기', '닭고기', '생선', '해산물', '새우'],
  vegetable: ['채소', '야채', '당근', '양파', '배추', '상추', '브로콜리', '시금치'],
  fruit: ['과일', '사과', '배', '바나나', '딸기', '포도', '오렌지', '귤'],
  beverage: ['음료', '물', '주스', '콜라', '맥주', '사이다', '커피', '차'],
  sideDish: ['반찬', '김치', '젓갈', '장아찌', '나물'],
};

export function detectCategory(name: string, category: string): string {
  const text = `${name} ${category}`.toLowerCase();
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return key;
  }
  return 'default';
}
