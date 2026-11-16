---
layout: default
title: VisionPlay - Home
description: Accessibility related software to meet special needs of visually impaired and blind people.
keywords: accessibility, visually impaired, games, screen readers, tts, ocr, tools, vision, Android
language: en
---

# VisionPlay - Home

Accessibility related software to meet special needs of visually impaired and blind people.

The applications and tools available on this platform are carefully collected from various trusted websites and official application stores. You can safely explore and download them to enhance your digital accessibility experience.

{% include search-box.html %}

---

## Explore Categories

{% assign total_apps = site.data.games.size | plus: site.data.ocr.size | plus: site.data.screen_readers.size | plus: site.data.tts.size | plus: site.data.tools.size | plus: site.data.vision.size %}

* **Quick Overview:** 6 Categories | {{ total_apps }} Accessible Apps

* [Games ({{ site.data.games.size }})](games/)
* [OCR ({{ site.data.ocr.size }})](optical-character-recognition/)
* [Screen Readers ({{ site.data.screen_readers.size }})](screen-readers/)
* [Text-to-Speech ({{ site.data.tts.size }})](text-to-speech/)
* [Tools ({{ site.data.tools.size }})](tools/)
* [Vision ({{ site.data.vision.size }})](vision/)

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

---

## Contact & Suggestions

Have a suggestion for a new accessible app or game? We would love to hear from you! Feel free to contact us to suggest new applications.

* **Email Us:** [Abhishekdey297@yahoo.com](mailto:Abhishekdey297@yahoo.com?subject=VisionPlay%20App%20Suggestion)
