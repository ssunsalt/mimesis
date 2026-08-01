import { getPageBlocks, cacheImage } from "./notion.js";

export async function renderBlocks(blocks) {
  const parts = await Promise.all(blocks.map(renderBlock));
  return parts.join("\n");
}

async function renderBlock(block) {
  switch (block.type) {
    case "paragraph":
      return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;

    case "heading_1":
      return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
    case "heading_2":
      return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
    case "heading_3":
      return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;

    case "image": {
      const rawUrl = block.image.file?.url ?? block.image.external?.url;
      const url = await cacheImage(rawUrl);

      const captionRaw = (block.image.caption ?? [])
        .map((t) => t.plain_text)
        .join("");

      // 캡션 맨 앞에 [숫자]가 있으면 그 픽셀 값으로 폭을 제한함
      const match = captionRaw.match(/^\[(\d{1,4})\]\s*/);
      const width = match ? match[1] : null;
      const caption = match ? captionRaw.slice(match[0].length) : captionRaw;

      const figureStyle = width ? ` style="max-width:${width}px;"` : "";
      const imgStyle = width ? ` style="width:100%;"` : "";
      const captionHtml = caption
        ? `<figcaption>${escapeHtml(caption)}</figcaption>`
        : "";

      return `<figure class="notion-image"${figureStyle}><img src="${url}" alt=""${imgStyle} />${captionHtml}</figure>`;
    }

    case "code": {
      const codeText = block.code.rich_text.map((t) => t.plain_text).join("");
      if (block.code.language === "html") {
        return codeText;
      }
      return `<pre><code>${escapeHtml(codeText)}</code></pre>`;
    }

    case "bulleted_list_item":
      return `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`;

    case "divider":
      return `<hr />`;

    case "column_list": {
      const columns = await getPageBlocks(block.id);
      const columnsHtml = await Promise.all(
        columns.map(async (col) => {
          const children = await getPageBlocks(col.id);
          const inner = await renderBlocks(children);
          return `<div class="notion-column">${inner}</div>`;
        })
      );
      return `<div class="notion-column-list">${columnsHtml.join("")}</div>`;
    }

    case "column": {
      const children = await getPageBlocks(block.id);
      const inner = await renderBlocks(children);
      return `<div class="notion-column">${inner}</div>`;
    }

    default:
      return "";
  }
}

function renderRichText(richTextArray) {
  return richTextArray
    .map((t) => {
      let text = escapeHtml(t.plain_text);
      if (t.annotations.bold) text = `<strong>${text}</strong>`;
      if (t.annotations.italic) text = `<em>${text}</em>`;
      if (t.href) text = `<a href="${t.href}">${text}</a>`;
      return text;
    })
    .join("");
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}