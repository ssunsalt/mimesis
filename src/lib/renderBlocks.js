export function renderBlocks(blocks) {
  return blocks.map(renderBlock).join("\n");
}

function renderBlock(block) {
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
      const url = block.image.file?.url ?? block.image.external?.url;
      return `<img src="${url}" alt="" />`;
    }

    case "code": {
      const codeText = block.code.rich_text.map((t) => t.plain_text).join("");
      // 언어가 html이면 마크업 그대로 삽입 (게임 로그 백업용), 아니면 코드로 표시
      if (block.code.language === "html") {
        return codeText;
      }
      return `<pre><code>${escapeHtml(codeText)}</code></pre>`;
    }

    case "bulleted_list_item":
      return `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`;

    case "divider":
      return `<hr />`;

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
