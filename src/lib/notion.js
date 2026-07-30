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

// 특정 글의 본문 블록 가져오기
export async function getPageBlocks(pageId) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });
  return response.results;
}
