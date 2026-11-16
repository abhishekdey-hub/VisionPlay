---
layout: default
title: VisionPlay - OCR
description: Download high-quality optical character recognition and document reading tools optimized for blind and visually impaired users.
keywords: ocr, document scanner, text recognition, blind reading, accessibility tools, VisionPlay
language: en
---

## VisionPlay - OCR Tools
[Home](../)

Welcome to the OCR section. Here you can find and download optical character recognition and text-scanning applications designed to read printed documents, books, and images aloud.

{% assign sorted_apps = site.data.ocr | sort_natural: "name" %}

> **Total Available:** {{ sorted_apps.size }} OCR Apps

---

{% for app in sorted_apps %}
  {% include app-card.html app=app index=forloop.index %}
{% endfor %}
