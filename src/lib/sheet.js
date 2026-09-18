// src/lib/sheet.js

// 구글 시트 주소(전체 URL)에서 시트ID와 탭(gid)을 뽑아냄
export function parseSheetUrl(url) {
  if (!url) return null;
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/[#&]gid=([0-9]+)/);
  if (!idMatch) return null;
  return { sheetId: idMatch[1], gid: gidMatch ? gidMatch[1] : "0" };
}

// 원본 시트를 그대로(서식 포함) 보여주는 임베드용 주소 생성
export function getEmbedUrl(sheetUrl) {
  const parsed = parseSheetUrl(sheetUrl);
  if (!parsed) return null;
  return `https://docs.google.com/spreadsheets/d/${parsed.sheetId}/edit?embedded=true&gid=${parsed.gid}`;
}
