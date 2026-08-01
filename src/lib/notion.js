import { Client } from "@notionhq/client";
import fs from "node:fs";
import path from "node:path";

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });
const databaseId = import.meta.env.NOTION_DATABASE_ID;

const CACHE_DIR = path.join(process.cwd(), "public", "notion-images");

// Notion 이미지 URL은 1시간 정도만 유효한 임시 링크라, 빌드할 때
// 파일을 실제로 다운로드해서 우리 사이트 자체 폴더에 영구 저장해둠.
// (URL의 서명 부분만 매번 바뀌고 경로 자체는 대체로 유지되므로,
//  경로 기준으로 캐시 키를 만들어서 이미 받아둔 파일은 다시 안 받음)
export async function cacheImage(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const stableKey = parsed.origin + parsed.pathname;
    const hash = await hashString(stableKey);
    const extMatch = parsed.pathname.match(/\.[a-zA-Z0-9]+$/);
    const ext = extMatch ? extMatch[0] : ".jpg";
    const filename = `${hash}${ext}`;
    const filePath = path.join(CACHE_DIR, filename);
    const publicPath = `/notion-images/${filename}`;

    if (fs.existsSync(filePath)) {
      return publicPath;
    }

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const res = await fetch(url);
    if (!res.ok) return url; // 다운로드 실패하면 그냥 원래 URL이라도 사용

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    return publicPath;
  } catch (err) {
    return url; // 무슨 문제가 생기든 최소한 원래 URL로 폴백
  }
}

async function hashString(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

// 카테고리별 발행된 글 목록 가져오기
export async function getPosts(category) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: "발행", checkbox: { equals: true } },
        { property: "카테고리", select: { equals: category } },
      ],
    },
    sorts: [{ property: "날짜", direction: "descending" }],
  });

  return Promise.all(
    response.results.map(async (page) => {
      const rawThumb =
        page.properties["썸네일"]?.files?.[0]?.file?.url ??
        page.properties["썸네일"]?.files?.[0]?.external?.url ??
        null;

      return {
        id: page.id,
        title: page.properties["제목"]?.title?.[0]?.plain_text ?? "제목 없음",
        date: page.properties["날짜"]?.date?.start ?? "",
        thumbnail: rawThumb ? await cacheImage(rawThumb) : null,
      };
    })
  );
}

// 특정 블록(페이지 포함)의 자식 블록 목록 가져오기
export async function getPageBlocks(blockId) {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });
  return response.results;
}