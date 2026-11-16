---
layout: default
title: VisionPlay - Text-to-Speech (TTS)
description: Download high-quality, natural-sounding text-to-speech voice engines for your screen readers.
keywords: tts, text to speech, autotts, easy voice tts, multitts, parroglott, smartvoice, vachan tts, vajra tts, vocalizer, google tts, voice engine, VisionPlay
language: en
---

## VisionPlay - Text-to-Speech Engines
[Home](../)

Welcome to the TTS section. Here you can find and download natural-sounding text-to-speech voice engines to use with your screen readers.

{% assign sorted_apps = site.data.tts | sort_natural: "name" %}

> **Total Available:** {{ sorted_apps.size }} TTS Engines

---

{% for app in sorted_apps %}
  {% include app-card.html app=app index=forloop.index %}
{% endfor %}
