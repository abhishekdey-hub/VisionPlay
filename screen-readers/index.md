---
layout: default
title: VisionPlay - Screen Readers
description: Download and explore the best screen reading software and accessibility suites for blind and visually impaired users.
keywords: screen readers, talkback, jieshuo, accessimind, accessibility tools, android screen reader, blind software, VisionPlay
language: en
---

{% include category-menu.html %}

# VisionPlay - Screen Readers

Welcome to the Screen Readers section. Here you can find and download popular screen reading software and accessibility suites for your devices.

{% assign sorted_apps = site.data.screen_readers | sort_natural: "name" %}

<p class="store-stats" role="status">
  <strong>Total Available:</strong> {{ sorted_apps.size }} Screen Readers (Sorted A&ndash;Z)
</p>

{% include search-box.html %}

---

{% for app in sorted_apps %}
  {% include app-card.html app=app index=forloop.index %}
{% endfor %}
