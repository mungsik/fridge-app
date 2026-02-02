export interface FoodLookupResult {
  name: string;
  category: string;
  barcode: string;
  source: 'openfoodfacts' | 'foodsafetykorea' | 'unknown';
}

async function lookupOpenFoodFacts(barcode: string): Promise<FoodLookupResult | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const product = data.product;
    const name =
      product.product_name_ko ||
      product.product_name ||
      '';

    if (!name) return null;

    // Try to extract category in Korean, fallback to generic
    const category =
      product.categories_tags_ko?.[0] ||
      product.categories?.split(',')[0]?.trim() ||
      '';

    return {
      name,
      category,
      barcode,
      source: 'openfoodfacts',
    };
  } catch {
    return null;
  }
}

async function lookupFoodSafetyKorea(barcode: string): Promise<FoodLookupResult | null> {
  const apiKey = import.meta.env.VITE_FOOD_SAFETY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://openapi.foodsafetykorea.go.kr/api/${apiKey}/C005/json/1/1/BAR_CD=${barcode}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const row = data?.C005?.row?.[0];
    if (!row) return null;

    return {
      name: row.PRDLST_NM || '',
      category: row.PRDLST_DCNM || '',
      barcode,
      source: 'foodsafetykorea',
    };
  } catch {
    return null;
  }
}

export async function lookupFood(barcode: string): Promise<FoodLookupResult> {
  // 1차: Open Food Facts
  const offResult = await lookupOpenFoodFacts(barcode);
  if (offResult && offResult.name) return offResult;

  // 2차: 식품안전나라 (API 키가 있을 때만)
  const fskResult = await lookupFoodSafetyKorea(barcode);
  if (fskResult && fskResult.name) return fskResult;

  // 둘 다 실패
  return {
    name: '',
    category: '',
    barcode,
    source: 'unknown',
  };
}
