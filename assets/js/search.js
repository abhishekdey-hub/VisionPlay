document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("app-search-input");
  const voiceBtn = document.getElementById("voice-search-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const statusEl = document.getElementById("search-status");
  const clearBtn = document.getElementById("clear-search-btn");
  const resultsEl = document.getElementById("search-results");

  let appsData = [];
  let activeFilter = "all";
  let showAllExplicitly = false;
  const jsonUrl = window.SEARCH_JSON_URL || "/search.json";

  // Helper: Category folder map for accurate share URLs from search results
  const categorySlugMap = {
    "Games": "games/",
    "OCR": "optical-character-recognition/",
    "Screen Readers": "screen-readers/",
    "Text-to-Speech": "text-to-speech/",
    "Tools": "tools/",
    "Vision": "vision/"
  };

  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Global Share Handler (works on both category pages and search results)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".share-app-btn");
    if (!btn) return;

    const appName = btn.getAttribute("data-app-name") || "VisionPlay App";
    const appDesc = btn.getAttribute("data-app-desc") || "";
    const appUrl = btn.getAttribute("data-app-url") || window.location.href;
    const shareText = appName + " - " + appDesc + " (Available on VisionPlay)";

    if (navigator.share) {
      navigator.share({
        title: appName + " | VisionPlay",
        text: shareText,
        url: appUrl
      }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(appName + ": " + appUrl).then(function () {
        const originalText = btn.textContent;
        btn.textContent = "Link Copied!";
        if (statusEl) statusEl.textContent = "Share link copied to clipboard for " + appName;
        setTimeout(function () {
          btn.textContent = originalText;
        }, 2000);
      });
    }
  });

  if (!searchInput || !resultsEl) return;

  // Load search.json and sort A-Z
  fetch(jsonUrl)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      appsData = data.sort(function (a, b) {
        return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      });
    })
    .catch(function (err) {
      console.error("Search data load error:", err);
    });

  function hasDirectApk(app) {
    return Boolean(app.apk_url || (app.downloads && app.downloads.length > 0));
  }

  function hasPlayStore(app) {
    return Boolean(app.playstore_url);
  }

  function clearAllResults() {
    searchInput.value = "";
    activeFilter = "all";
    showAllExplicitly = false;
    resultsEl.innerHTML = "";
    statusEl.textContent = "";
    if (clearBtn) clearBtn.hidden = true;

    filterBtns.forEach(function (b) {
      const isAll = b.getAttribute("data-filter") === "all";
      b.classList.toggle("active", isAll);
      b.setAttribute("aria-pressed", isAll ? "true" : "false");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      clearAllResults();
      searchInput.focus();
    });
  }

  function runSearchAndFilter() {
    const query = searchInput.value.trim();
    const qLower = query.toLowerCase();

    // Keep clean only if query is empty, filter is 'all', and user hasn't clicked 'All Apps'
    if (!query && activeFilter === "all" && !showAllExplicitly) {
      resultsEl.innerHTML = "";
      statusEl.textContent = "";
      if (clearBtn) clearBtn.hidden = true;
      return;
    }

    const matches = appsData.filter(function (app) {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "apk" && hasDirectApk(app)) ||
        (activeFilter === "playstore" && hasPlayStore(app));

      if (!matchesFilter) return false;

      if (!query) return true;

      return (
        (app.name && app.name.toLowerCase().includes(qLower)) ||
        (app.description && app.description.toLowerCase().includes(qLower)) ||
        (app.category && app.category.toLowerCase().includes(qLower))
      );
    });

    renderResults(matches, query);
  }

  function renderResults(matches, query) {
    resultsEl.innerHTML = "";
    if (clearBtn) clearBtn.hidden = false;

    const filterLabel =
      activeFilter === "apk" ? " (Direct APK)" :
      activeFilter === "playstore" ? " (Play Store)" :
      (showAllExplicitly && !query ? " (All Apps A–Z)" : "");

    if (matches.length === 0) {
      statusEl.textContent = query
        ? 'No apps found matching "' + query + '"' + filterLabel + "."
        : "No apps found for this filter.";
      return;
    }

    statusEl.textContent =
      matches.length +
      (matches.length === 1 ? " app found" : " apps found") +
      filterLabel + ":";

    const baseSiteUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "/");

    matches.forEach(function (app) {
      const article = document.createElement("article");
      article.className = "app-card";

      const title = document.createElement("h3");
      title.textContent = app.name;
      article.appendChild(title);

      const meta = document.createElement("p");
      meta.className = "app-meta";
      let metaHTML = "<strong>Category:</strong> " + app.category;
      if (app.size) metaHTML += " | <strong>File Size:</strong> " + app.size;
      if (app.version) metaHTML += " | <strong>APK Version:</strong> " + app.version;
      meta.innerHTML = metaHTML;
      article.appendChild(meta);

      const desc = document.createElement("p");
      desc.textContent = app.description;
      article.appendChild(desc);

      const ul = document.createElement("ul");

      if (app.playstore_url) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = app.playstore_url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "View " + app.name + " on Play Store";
        li.appendChild(a);
        ul.appendChild(li);
      }

      if (app.apk_url) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = app.apk_url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Download " + app.name + " Direct APK";
        li.appendChild(a);
        ul.appendChild(li);
      }

      if (app.downloads && Array.isArray(app.downloads)) {
        app.downloads.forEach(function (dl) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = dl.url;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = dl.label;
          li.appendChild(a);
          ul.appendChild(li);
        });
      }

      // Share & Report Broken Link actions
      const actionLi = document.createElement("li");
      actionLi.className = "card-actions";

      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.className = "share-app-btn";
      shareBtn.textContent = "Share " + app.name;
      shareBtn.setAttribute("aria-label", "Share " + app.name);
      shareBtn.setAttribute("data-app-name", app.name);
      shareBtn.setAttribute("data-app-desc", app.description || "");
      const catFolder = categorySlugMap[app.category] || "";
      shareBtn.setAttribute("data-app-url", baseSiteUrl + catFolder + "#" + slugify(app.name));

      const sep = document.createTextNode(" | ");

      const reportLink = document.createElement("a");
      const subject = encodeURIComponent("Broken Link Report: " + app.name);
      const body = encodeURIComponent("Hi Abhishek, the download link for " + app.name + " on VisionPlay is not working.");
      reportLink.href = "mailto:Abhishekdey297@yahoo.com?subject=" + subject + "&body=" + body;
      reportLink.setAttribute("aria-label", "Report broken link for " + app.name);
      reportLink.textContent = "Report Broken Link";

      actionLi.appendChild(shareBtn);
      actionLi.appendChild(sep);
      actionLi.appendChild(reportLink);
      ul.appendChild(actionLi);

      article.appendChild(ul);
      resultsEl.appendChild(article);

      const hr = document.createElement("hr");
      resultsEl.appendChild(hr);
    });
  }

  // Text Input Event
  searchInput.addEventListener("input", function () {
    if (!searchInput.value.trim() && activeFilter === "all") {
      showAllExplicitly = false;
    }
    runSearchAndFilter();
  });

  // Filter Buttons Event
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = this.getAttribute("data-filter") || "all";
      if (activeFilter === "all") {
        showAllExplicitly = true;
      }
      filterBtns.forEach(function (b) {
        const isSelected = b === btn;
        b.classList.toggle("active", isSelected);
        b.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });
      runSearchAndFilter();
    });
  });

  // Voice Search Setup (Web Speech API)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && voiceBtn) {
    voiceBtn.hidden = false;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener("click", function () {
      try {
        recognition.start();
        voiceBtn.textContent = "Listening...";
        voiceBtn.classList.add("listening");
        statusEl.textContent = "Listening... Please speak the app name.";
      } catch (e) {
        recognition.stop();
      }
    });

    recognition.onresult = function (event) {
      const spokenText = event.results[0][0].transcript;
      searchInput.value = spokenText;
      runSearchAndFilter();
      searchInput.focus();
    };

    recognition.onerror = function (event) {
      statusEl.textContent = "Voice search error (" + event.error + "). Please try typing.";
    };

    recognition.onend = function () {
      voiceBtn.textContent = "Voice Search";
      voiceBtn.classList.remove("listening");
    };
  }
});
