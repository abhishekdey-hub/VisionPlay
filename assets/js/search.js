document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("app-search-input");
  const statusEl = document.getElementById("search-status");
  const resultsEl = document.getElementById("search-results");

  if (!searchInput || !resultsEl) return;

  let appsData = [];
  const jsonUrl = window.SEARCH_JSON_URL || "/search.json";

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((data) => {
      appsData = data;
    })
    .catch((err) => {
      console.error("Search data load error:", err);
    });

  function renderResults(matches, query) {
    resultsEl.innerHTML = "";

    if (!query) {
      statusEl.textContent = "";
      return;
    }

    if (matches.length === 0) {
      statusEl.textContent = 'No apps found matching "' + query + '".';
      return;
    }

    statusEl.textContent = matches.length + (matches.length === 1 ? " app found:" : " apps found:");

    matches.forEach((app) => {
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
        app.downloads.forEach((dl) => {
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

      article.appendChild(ul);
      resultsEl.appendChild(article);

      const hr = document.createElement("hr");
      resultsEl.appendChild(hr);
    });
  }

  searchInput.addEventListener("input", function () {
    const query = this.value.trim();
    if (!query) {
      renderResults([], "");
      return;
    }

    const qLower = query.toLowerCase();
    const matches = appsData.filter((app) => {
      return (
        (app.name && app.name.toLowerCase().includes(qLower)) ||
        (app.description && app.description.toLowerCase().includes(qLower)) ||
        (app.category && app.category.toLowerCase().includes(qLower))
      );
    });

    renderResults(matches, query);
  });
});
