// 홈페이지: 시공사례 미리보기(카테고리별 최신 1건) + 채용공고/뉴스룸 미리보기
(function () {
  const CAT_ORDER = ["건축", "토목", "플랜트", "기타"];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  fetch("content/portfolio.json")
    .then((r) => r.json())
    .then((data) => {
      const items = data.items || [];
      // find latest item overall (for NEW badge) and latest per category
      let latestOverall = null;
      const byCat = {};
      items.forEach((it) => {
        if (!byCat[it.category] || it.date > byCat[it.category].date) byCat[it.category] = it;
        if (!latestOverall || it.date > latestOverall.date) latestOverall = it;
      });
      const grid = document.getElementById("home-gallery");
      if (!grid) return;
      grid.innerHTML = CAT_ORDER.filter((c) => byCat[c])
        .map((c) => {
          const it = byCat[c];
          const isNew = latestOverall && it.id === latestOverall.id;
          return `<a class="gcard" href="portfolio-detail.html?id=${it.id}">
            <div class="thumb" style="background-image:url(${it.thumb || it.image})">${isNew ? '<span class="badge">NEW</span>' : ""}</div>
            <div class="cc"><div class="cat">${esc(it.category)}</div><div class="ct">${esc(it.title)}</div><div class="date">${esc(it.date.slice(0,7).replace('-','.'))}</div></div>
          </a>`;
        })
        .join("");
    });

  fetch("content/jobs.json")
    .then((r) => r.json())
    .then((data) => {
      const el = document.getElementById("home-jobs");
      if (!el) return;
      const items = (data.items || []).filter((j) => j.status !== "마감").slice(0, 3);
      if (!items.length) {
        el.innerHTML = '<div class="empty-row">현재 등록된 채용공고가 없습니다.<br>채용 문의는 <a href="talent.html" style="color:var(--green-deep);font-weight:700;">인재상 페이지</a>에서 남겨주세요.</div>';
        return;
      }
      el.innerHTML = items
        .map((j) => `<li><span class="t">${esc(j.title)}</span><span class="tag ${j.status === "모집중" ? "tag-open" : "tag-closed"}">${esc(j.status)}</span></li>`)
        .join("");
    });

  fetch("content/news.json")
    .then((r) => r.json())
    .then((data) => {
      const el = document.getElementById("home-news");
      if (!el) return;
      const items = (data.items || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
      if (!items.length) {
        el.innerHTML = '<div class="empty-row">등록된 소식이 없습니다.</div>';
        return;
      }
      el.innerHTML = items
        .map((n) => `<li><a class="t" href="news.html">${esc(n.title)}</a><span class="d">${esc(n.date)}</span></li>`)
        .join("");
    });
})();
