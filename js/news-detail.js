// 뉴스룸(공지사항·보도자료) 상세 페이지
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  fetch("content/news.json")
    .then((r) => r.json())
    .then((data) => {
      const items = data.items || [];
      const item = items.find((i) => i.id === id);
      if (!item) {
        document.getElementById("nd-root").innerHTML =
          '<div class="nd-col"><div style="padding:4rem 0;"><p>요청하신 게시물을 찾을 수 없습니다. <a href="news.html" style="color:var(--green-deep);font-weight:700;">뉴스룸 목록으로 돌아가기</a></p></div></div>';
        return;
      }

      document.title = `${item.title} | (주)한진종합건설`;
      document.getElementById("nd-crumb-title").textContent = item.title;
      document.getElementById("nd-title").textContent = item.title;
      document.getElementById("nd-type").textContent = item.type || "공지사항";
      document.getElementById("nd-date").textContent = item.date || "";
      document.getElementById("nd-author").textContent = `작성자 · ${item.author || "관리자"}`;

      const bodyEl = document.getElementById("nd-body");
      if (item.body && String(item.body).trim()) {
        // md-render.js가 마크다운 → 안전하게 정리된 HTML로 변환해준다 (이미지·굵게·목록 등 지원).
        bodyEl.innerHTML = window.renderNewsBody(item.body);
      } else {
        bodyEl.innerHTML = '<p class="fallback">등록된 본문이 아직 없습니다.</p>';
      }

      if (item.attachment) {
        const fileName = decodeURIComponent(String(item.attachment).split("/").pop());
        bodyEl.insertAdjacentHTML(
          "afterend",
          `<a class="board-detail-file nd-attachment" href="${esc(item.attachment)}" target="_blank" rel="noopener" download>📎 ${esc(fileName)}</a>`
        );
      }

      // 같은 구분(공지사항/보도자료) 안에서 이전글/다음글
      const sameType = items.filter((i) => i.type === item.type).sort((a, b) => (a.date < b.date ? 1 : -1));
      const idx = sameType.findIndex((i) => i.id === item.id);
      const prev = sameType[idx - 1];
      const next = sameType[idx + 1];
      const nav = document.getElementById("nd-nav");
      nav.innerHTML = `
        ${prev ? `<a href="news-detail.html?id=${prev.id}"><span class="dir">← 이전 글</span><span class="ttl">${esc(prev.title)}</span></a>` : '<span class="empty">← 이전 글<br>이전 게시물이 없습니다</span>'}
        ${next ? `<a href="news-detail.html?id=${next.id}" style="text-align:right;"><span class="dir">다음 글 →</span><span class="ttl">${esc(next.title)}</span></a>` : '<span class="empty" style="text-align:right;">다음 글 →<br>다음 게시물이 없습니다</span>'}
      `;

      // "뉴스룸 목록으로" 링크는 원래 보던 탭(공지사항/보도자료)으로 돌아가도록 type을 같이 넘긴다.
      const backLink = document.querySelector(".nd-back a");
      if (backLink && item.type && item.type !== "공지사항") {
        backLink.href = `news.html?type=${encodeURIComponent(item.type)}`;
      }
    });
})();
