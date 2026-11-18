---
layout: default
title: VisionPlay - Home
description: Accessibility related software to meet special needs of visually impaired and blind people.
keywords: accessibility, visually impaired, games, screen readers, tts, ocr, tools, vision, Android
language: en
---

{% assign total_apps = site.data.games.size | plus: site.data.ocr.size | plus: site.data.screen_readers.size | plus: site.data.tts.size | plus: site.data.tools.size | plus: site.data.vision.size %}

{% include category-menu.html %}

# VisionPlay

Curated accessibility apps, screen readers, TTS engines, and audio games for visually impaired and blind users—collected from trusted sources and official app stores.

<p class="store-stats" role="status">
  <strong>Store Overview:</strong> 6 Categories, {{ total_apps }} Accessible Apps
</p>

{% include search-box.html %}

---

## What's New

{% if site.posts.size > 0 %}
<ul>
  {% for post in site.posts limit:5 %}
    <li>
      <strong>{{ post.date | date: "%B %d, %Y" }}:</strong>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
{% else %}
<p>No recent updates yet.</p>
{% endif %}
