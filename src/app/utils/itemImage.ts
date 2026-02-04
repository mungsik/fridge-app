// 한국어 카테고리 → 이미지 파일명 매핑
const CATEGORY_TO_FILENAME: Record<string, string> = {
  '과일': 'apple',
  '야채': 'carrot',
  '채소': 'brocolli',
  '음료': 'soda',
  '우유': 'milk',
  '개인반찬': 'bento',
  '셀러드': 'salad',
  '빵': 'bread',
  '아이스크림': 'icecream',
};

const imageCache = new Map<string, string | null>();

function tryLoadImage(url: string): Promise<boolean> {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url) !== null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache.set(url, url); resolve(true); };
    img.onerror = () => { imageCache.set(url, null); resolve(false); };
    img.src = url;
  });
}

const EXTENSIONS = ['png', 'jpg', 'svg', 'webp'];

async function findImage(dir: string, name: string): Promise<string | null> {
  const encoded = encodeURIComponent(name);
  for (const ext of EXTENSIONS) {
    const url = `/images/items/${dir}/${encoded}.${ext}`;
    if (await tryLoadImage(url)) return url;
  }
  return null;
}

export async function getItemImageUrl(itemName: string, category: string): Promise<string> {
  // 1. Try category match (direct Korean name)
  if (category) {
    const categoryImage = await findImage('category', category);
    if (categoryImage) return categoryImage;

    // Try mapped English filename
    const mapped = CATEGORY_TO_FILENAME[category];
    if (mapped) {
      const mappedImage = await findImage('category', mapped);
      if (mappedImage) return mappedImage;
    }
  }

  // 2. Try exact name match
  if (itemName) {
    const nameImage = await findImage('name', itemName);
    if (nameImage) return nameImage;
  }

  // 3. Try partial name match (check if any cached name is contained in itemName)
  for (const [url, value] of imageCache.entries()) {
    if (value && url.includes('/images/items/name/')) {
      const fileName = decodeURIComponent(url.split('/').pop()?.split('.')[0] || '');
      if (fileName && itemName.includes(fileName)) return value;
    }
  }

  // 4. Default
  return '/images/items/default.svg';
}
