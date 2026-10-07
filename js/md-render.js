// 뉴스룸(공지사항·보도자료) 본문을 마크다운 → 안전한 HTML로 바꿔주는 공용 모듈.
// news-detail.js에서만 사용 (목록 페이지는 일반 텍스트 요약만 보여주므로 필요 없음).
//
// 동작 순서:
//   1) marked.js로 마크다운 문자열을 HTML로 변환 (굵게·목록·링크·이미지 등 지원,
//      breaks:true 옵션으로 Enter 한 번도 줄바꿈으로 인식 — 기존 공지사항 동작과 동일).
//   2) DOMParser로 "비활성 문서"에 파싱 — 이 상태에서는 <img> 로딩이나 <script> 실행이
//      전혀 일어나지 않으므로, 위험한 태그를 지우는 동안 안전하다.
//   3) 허용 목록(allow-list)에 없는 태그는 내용만 남기고 태그를 벗겨내고(unwrap),
//      script/style/iframe 등 위험한 태그는 내용째로 제거한다.
//      허용된 태그도 href/src가 javascript: 같은 위험한 스킴이면 속성을 지운다.
//   4) 전부 안전하게 정리된 뒤의 HTML 문자열만 실제 화면에 삽입한다.
// 즉 관리자가 입력값에 <script>나 onerror= 같은 걸 직접 넣어도 전부 걸러지고,
// 마크다운 문법(**굵게**, ![이미지](경로), [링크](경로) 등)만 정상적으로 반영된다.
(function () {
  var ALLOWED_TAGS = {
    P: [],
    BR: [],
    STRONG: [],
    B: [],
    EM: [],
    I: [],
    A: ["href", "title"],
    UL: [],
    OL: [],
    LI: [],
    BLOCKQUOTE: [],
    CODE: [],
    PRE: [],
    IMG: ["src", "alt", "title"],
    H3: [],
    H4: [],
    H5: [],
    H6: [],
    HR: [],
    DEL: [],
    S: [],
    TABLE: [],
    THEAD: [],
    TBODY: [],
    TR: [],
    TH: [],
    TD: [],
  };
  // script/style/iframe 등은 내용까지 통째로 제거. 그 외 허용 목록에 없는 태그는
  // 태그만 벗기고 안의 텍스트/자식은 남긴다(글자를 잃어버리지 않도록).
  var REMOVE_ENTIRELY = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, FORM: 1, SVG: 1, VIDEO: 1, AUDIO: 1, LINK: 1, META: 1 };

  function isSafeUrl(raw) {
    // 제어문자·공백을 전부 제거한 뒤 스킴을 검사 (java\tscript: 같은 우회 시도 방지)
    var s = String(raw || "").replace(/[\x00-\x20]+/g, "");
    return !/^(javascript|vbscript|data):/i.test(s);
  }

  function sanitize(root) {
    var walker = root.childNodes;
    for (var i = walker.length - 1; i >= 0; i--) {
      var node = walker[i];
      if (node.nodeType === 8) {
        // 주석 제거
        node.remove();
        continue;
      }
      if (node.nodeType !== 1) continue; // 텍스트 노드는 그대로 둠
      var tag = node.tagName;
      if (REMOVE_ENTIRELY[tag]) {
        node.remove();
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tag)) {
        // 허용 목록에 없는 태그: 태그만 벗기고 자식(텍스트 등)은 그대로 둔다
        while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
        node.remove();
        continue;
      }
      var allowedAttrs = ALLOWED_TAGS[tag];
      for (var j = node.attributes.length - 1; j >= 0; j--) {
        var attr = node.attributes[j];
        var name = attr.name.toLowerCase();
        if (allowedAttrs.indexOf(name) === -1) {
          node.removeAttribute(attr.name);
          continue;
        }
        if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
          node.removeAttribute(attr.name);
        }
      }
      if (tag === "A" && node.hasAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
      sanitize(node);
    }
  }

  function renderNewsBody(markdownText) {
    var raw = String(markdownText == null ? "" : markdownText);
    if (!raw.trim()) return "";
    var html = "";
    try {
      html = window.marked.parse(raw, { breaks: true, gfm: true });
    } catch (e) {
      // 마크다운 파싱에 실패해도 사이트가 죽지 않도록 원문을 안전하게 이스케이프해서 보여준다.
      var div = document.createElement("div");
      div.textContent = raw;
      return "<p>" + div.innerHTML.replace(/\n/g, "<br>") + "</p>";
    }
    // 2~3단계: 비활성 문서에서 파싱 + 허용 목록 기준 정리
    var doc = new DOMParser().parseFromString(html, "text/html");
    sanitize(doc.body);
    return doc.body.innerHTML;
  }

  window.renderNewsBody = renderNewsBody;
})();
