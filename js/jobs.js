// 채용공고 게시판
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  fetch("content/jobs.json")
    .then((r) => r.json())
    .then((data) => {
      const items = (data.items || []).slice().sort((a, b) => (a.status === b.status ? 0 : a.status === "모집중" ? -1 : 1));
      const root = document.getElementById("jobs-root");
      const ICON_INBOX =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12h4.5l1.5 3h6l1.5-3H21"/><path d="M5 12 6.5 5.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 12"/><path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg>';
      if (!items.length) {
        root.innerHTML = `<div class="empty-state-ic">
          ${ICON_INBOX}
          <h3>현재 진행중인 채용공고가 없습니다</h3>
          <p>새로운 채용 소식은 등록되는 즉시 이 페이지와 공지사항에 함께 안내드립니다.</p>
          <div class="links"><a href="news.html">공지사항 바로가기</a><a href="인재상.html">인재상 보기</a><a href="복리후생.html">복리후생 보기</a></div>
        </div>`;
        return;
      }
      root.innerHTML = `<div class="board-list">
        <div class="board-row head"><span class="num">번호</span><span class="ttl">제목</span><span class="per">접수기간</span><span>상태</span></div>
        ${items
          .map(
            (j, i) => `<div class="board-row">
          <span class="num">${items.length - i}</span>
          <span class="ttl">${esc(j.title)}</span>
          <span class="per">${esc(j.period || "-")}</span>
          <span class="tag ${j.status === "모집중" ? "tag-open" : "tag-closed"}">${esc(j.status)}</span></div>`
          )
          .join("")}
      </div>`;
    });
})();
