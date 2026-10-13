(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var frame = document.createElement("iframe");
  var rawHeight = Number.parseInt(script.getAttribute("data-height") || "560", 10);
  var height = Number.isFinite(rawHeight) ? Math.max(320, Math.min(900, rawHeight)) : 560;

  frame.src = "https://rydon-ai-2.onrender.com/embed";
  frame.title = "Chat with RYDON AI 2.0";
  frame.loading = "lazy";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allow = "microphone";
  frame.width = "100%";
  frame.height = String(height);
  frame.style.display = "block";
  frame.style.width = "100%";
  frame.style.maxWidth = "480px";
  frame.style.height = height + "px";
  frame.style.border = "0";
  frame.style.borderRadius = "14px";
  frame.style.overflow = "hidden";

  // Keep the widget near the script tag when it is included in the page body.
  if (script.parentNode && script.parentNode !== document.head) {
    script.parentNode.insertBefore(frame, script.nextSibling);
  } else {
    (document.body || document.documentElement).appendChild(frame);
  }
})();
