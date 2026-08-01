import { Client } from "@notionhq/client";

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });
const databaseId = import.meta.env.NOTION_DATABASE_ID;

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

  return response.results.map((page) => ({
    id: page.id,
    title: page.properties["제목"]?.title?.[0]?.plain_text ?? "제목 없음",
    date: page.properties["날짜"]?.date?.start ?? "",
    thumbnail:
      page.properties["썸네일"]?.files?.[0]?.file?.url ??
      page.properties["썸네일"]?.files?.[0]?.external?.url ??
      null,
  }));
}

// 특정 블록(페이지 포함)의 자식 블록 목록 가져오기
// 페이지 본문뿐 아니라, 컬럼(column) 같은 중첩 구조의 자식을 가져올 때도 재사용됨
export async function getPageBlocks(blockId) {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });
  return response.results;
}
