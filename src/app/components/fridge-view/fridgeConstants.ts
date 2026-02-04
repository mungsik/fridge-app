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
  fruit: ['과일', '사과', '배', '바나나', '딸기', '포도', '오렌지', '귤', 'apple'],
  vegetable: ['야채', '당근', '양파', '배추', '상추', '시금치', 'carrot'],
  greens: ['채소', '브로콜리', 'brocolli'],
  beverage: ['음료', '물', '주스', '콜라', '맥주', '사이다', '커피', '차', 'soda'],
  dairy: ['우유', '유제품', '치즈', '요구르트', '버터', '크림', 'milk'],
  sideDish: ['개인반찬', '반찬', '김치', '젓갈', '장아찌', '나물', 'bento'],
  salad: ['셀러드', '샐러드', 'salad'],
  bread: ['빵', '식빵', '베이글', '크로와상', 'bread'],
  iceCream: ['아이스크림', '아이스바', '젤라또', 'ice cream', 'icecream'],
  other: ['기타'],
};

export function detectCategory(name: string, category: string): string {
  const text = `${name} ${category}`.toLowerCase();
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return key;
  }
  return 'default';
}
