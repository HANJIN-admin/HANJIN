// 시공사례 상세 페이지 (Signature: 공사개요 구조화 표 + 상세 설명 분리)
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  // 발주처/위치/공사기간/규모/주요공종 — 값이 채워진 항목만 표로 노출.
  // 지금은 portfolio.json에 이 필드가 없어 전부 비어있으므로, 관리자 페이지에서
  // 채우면 자동으로 표가 채워진다는 정직한 안내를 대신 보여준다.
  const OVERVIEW_FIELDS = [
    ["발주처", "client"],
    ["위치", "location"],
    ["공사기간", "period"],
    ["규모", "scale"],
    ["주요공종", "work_type"],
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function buildOverview(item) {
    const rows = OVERVIEW_FIELDS.filter(([, key]) => item[key]).map(([label, key]) => [label, item[key]]);
    if (!rows.length) {
      return (
        '<div class="pd-overview-empty">발주처·위치·공사기간·규모·주요공종 항목은 아직 입력된 값이 없습니다.' +
        "<br>관리자 페이지에서 프로젝트별로 값을 채우면, 채워진 항목만 이 자리에 자동으로 표로 정리되어 나타납니다.</div>"
      );
    }
    return (
      '<div class="pd-overview">' +
      rows.map(([label, val]) => `<div class="ov-row"><span class="k">${esc(label)}</span><span class="v">${esc(val)}</span></div>`).join("") +
      "</div>"
    );
  }

  // ===== 사진 라이트박스 (확대 보기 + 좌우 넘기기) =====
  // 대표 사진 + 추가 사진을 하나의 배열로 합쳐서, 어느 썸네일을 클릭해도
  // 그 사진부터 확대해서 보고 화살표/키보드로 다른 사진들도 넘겨볼 수 있게 함.
  let lbImages = [];
  let lbIndex = 0;
  let lbEl = null;

  function buildLightbox() {
    if (lbEl) return lbEl;
    const el = document.createElement("div");
    el.className = "pd-lightbox";
    el.innerHTML =
      '<button type="button" class="lb-close" aria-label="닫기">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="이전 사진">&#10094;</button>' +
      '<img class="lb-img" alt="" />' +
      '<button type="button" class="lb-next" aria-label="다음 사진">&#10095;</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(el);

    el.querySelector(".lb-close").addEventListener("click", closeLightbox);
    el.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); showLightbox(lbIndex - 1); });
    el.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); showLightbox(lbIndex + 1); });
    // 이미지 바깥(어두운 배경) 클릭하면 닫기
    el.addEventListener("click", (e) => {
      if (e.target === el) closeLightbox();
    });
    lbEl = el;
    return el;
  }

  function showLightbox(idx) {
    if (!lbImages.length) return;
    lbIndex = (idx + lbImages.length) % lbImages.length;
    const el = buildLightbox();
    el.querySelector(".lb-img").src = lbImages[lbIndex];
    el.querySelector(".lb-count").textContent = lbImages.length > 1 ? `${lbIndex + 1} / ${lbImages.length}` : "";
    const multi = lbImages.length > 1;
    el.querySelector(".lb-prev").style.display = multi ? "" : "none";
    el.querySelector(".lb-next").style.display = multi ? "" : "none";
  }

  function openLightbox(images, startIndex) {
    lbImages = images;
    const el = buildLightbox();
    showLightbox(startIndex || 0);
    el.classList.add("open");
    document.body.classList.add("pd-lb-open");
  }

  function closeLightbox() {
    if (!lbEl) return;
    lbEl.classList.remove("open");
    document.body.classList.remove("pd-lb-open");
  }

  document.addEventListener("keydown", (e) => {
    if (!lbEl || !lbEl.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  fetch("content/portfolio.json")
    .then((r) => r.json())
    .then((data) => {
      const items = data.items || [];
      const item = items.find((i) => i.id === id);
      if (!item) {
        document.getElementById("pd-root").innerHTML =
          '<div style="padding:4rem 0;"><p>요청하신 시공사례를 찾을 수 없습니다. <a href="portfolio.html" style="color:var(--green-deep);font-weight:700;">시공사례 목록으로 돌아가기</a></p></div>';
        return;
      }

      document.title = `${item.title} | (주)한진종합건설`;
      document.getElementById("pd-crumb-title").textContent = item.title;
      document.getElementById("pd-title").textContent = item.title;
      document.getElementById("pd-cat").textContent = item.category;
      document.getElementById("pd-date").textContent = item.date;

      const heroSrc = item.image || item.thumb;
      const galleryList = item.gallery && item.gallery.length ? item.gallery : [];
      // 대표 사진 + 추가 사진을 합친 전체 목록 (라이트박스에서 순서대로 넘겨볼 목록)
      const allImages = [heroSrc, ...galleryList].filter(Boolean);

      const heroEl = document.getElementById("pd-figure");
      heroEl.style.backgroundImage = `url(${heroSrc})`;
      heroEl.setAttribute("role", "button");
      heroEl.setAttribute("tabindex", "0");
      heroEl.setAttribute("aria-label", "사진 확대 보기");
      heroEl.addEventListener("click", () => openLightbox(allImages, 0));
      heroEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(allImages, 0); }
      });

      const galleryEl = document.getElementById("pd-thumbs");
      if (galleryList.length) {
        galleryEl.style.display = "flex";
        galleryEl.innerHTML = galleryList
          .map((g, i) => `<div style="background-image:url(${g})" role="button" tabindex="0" aria-label="사진 ${i + 2}번 확대 보기" data-idx="${i + 1}"></div>`)
          .join("");
        galleryEl.querySelectorAll("[data-idx]").forEach((thumbEl) => {
          const openThis = () => openLightbox(allImages, Number(thumbEl.getAttribute("data-idx")));
          thumbEl.addEventListener("click", openThis);
          thumbEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openThis(); }
          });
        });
      } else {
        galleryEl.style.display = "none";
      }

      document.getElementById("pd-overview").innerHTML = buildOverview(item);

      const bodyEl = document.getElementById("pd-body");
      if (item.body) {
        bodyEl.innerHTML = `<p>${esc(item.body).replace(/\n/g, "<br>")}</p>`;
      } else {
        bodyEl.innerHTML = '<p class="fallback">등록된 상세 설명이 아직 없습니다. 자유 서술형 설명은 관리자 페이지에서 추가로 입력할 수 있습니다.</p>';
      }

      // prev/next within same category, sorted by date desc
      const sameCat = items.filter((i) => i.category === item.category).sort((a, b) => (a.date < b.date ? 1 : -1));
      const idx = sameCat.findIndex((i) => i.id === item.id);
      const prev = sameCat[idx - 1];
      const next = sameCat[idx + 1];
      const nav = document.getElementById("pd-nav");
      nav.innerHTML = `
        ${prev ? `<a href="portfolio-detail.html?id=${prev.id}"><span class="dir">← PREV</span><span class="ttl">${esc(prev.title)}</span></a>` : '<span class="empty">← PREV<br>같은 분야의 이전 글이 없습니다</span>'}
        ${next ? `<a href="portfolio-detail.html?id=${next.id}" style="text-align:right;"><span class="dir">NEXT →</span><span class="ttl">${esc(next.title)}</span></a>` : '<span class="empty" style="text-align:right;">NEXT →<br>같은 분야의 다음 글이 없습니다</span>'}
      `;
    });
})();
