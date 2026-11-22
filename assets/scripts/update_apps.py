import glob
import json
import os
import re
import urllib.request

RELEASE_CACHE = {}

def get_latest_release(repo):
    if repo in RELEASE_CACHE:
        return RELEASE_CACHE[repo]

    url = f"https://api.github.com/repos/{repo}/releases/latest"
    headers = {
        "User-Agent": "VisionPlay-AutoUpdater",
        "Accept": "application/vnd.github+json"
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))
        RELEASE_CACHE[repo] = data
        return data

def format_size(size_bytes):
    mb = round(size_bytes / (1024 * 1024))
    return f"{max(1, mb)} MB"

def find_matching_apk(assets, asset_match=None, exclude_words=None):
    for asset in assets:
        name = asset.get("name", "")
        lower_name = name.lower()
        if lower_name.endswith(".apk"):
            if asset_match and asset_match not in lower_name:
                continue
            if exclude_words and any(w in lower_name for w in exclude_words):
                continue
            return asset
    return None

def update_yaml_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    updated = False
    i = 0
    while i < len(lines):
        if lines[i].startswith("- name:"):
            block_start = i
            block_end = i + 1
            while block_end < len(lines) and not lines[block_end].startswith("- name:"):
                block_end += 1

            block = lines[block_start:block_end]
            repo = None
            asset_match = None
            exclude_words = []
            has_downloads = False

            for line in block:
                m_repo = re.match(r'^  github_repo:\s*"([^"]+)"', line)
                if m_repo:
                    repo = m_repo.group(1)
                m_asset = re.match(r'^  github_asset_match:\s*"([^"]+)"', line)
                if m_asset:
                    asset_match = m_asset.group(1).lower()
                m_exclude = re.match(r'^  github_exclude_match:\s*"([^"]+)"', line)
                if m_exclude:
                    exclude_words = [w.strip().lower() for w in m_exclude.group(1).split(",") if w.strip()]
                if line.startswith("  downloads:"):
                    has_downloads = True

            if repo:
                try:
                    release = get_latest_release(repo)
                    tag = release.get("tag_name", "").lstrip("vV")
                    assets = release.get("assets", [])

                    # 1. Version अपडेट करें
                    if tag:
                        for idx in range(block_start, block_end):
                            if re.match(r'^  version:', lines[idx]):
                                new_line = f'  version: "{tag}"\n'
                                if lines[idx] != new_line:
                                    lines[idx] = new_line
                                    updated = True

                    # 2. मल्टी-डाउनलोड (downloads:) लिस्ट वाले ऐप्स (Jieshuo, OpenEVV, SpeechFlow TTS)
                    if has_downloads:
                        idx = block_start
                        while idx < block_end:
                            if re.match(r'^\s*-\s*label:', lines[idx]):
                                item_end = idx + 1
                                while item_end < block_end and not re.match(r'^\s*-\s*label:', lines[item_end]) and lines[item_end].startswith("    "):
                                    item_end += 1

                                sub_match = None
                                sub_exclude = []
                                for s_idx in range(idx, item_end):
                                    m_sub = re.match(r'^\s*github_asset_match:\s*"([^"]+)"', lines[s_idx])
                                    if m_sub:
                                        sub_match = m_sub.group(1).lower()
                                    m_sub_ex = re.match(r'^\s*github_exclude_match:\s*"([^"]+)"', lines[s_idx])
                                    if m_sub_ex:
                                        sub_exclude = [w.strip().lower() for w in m_sub_ex.group(1).split(",") if w.strip()]

                                if sub_match or sub_exclude:
                                    sub_apk = find_matching_apk(assets, sub_match, sub_exclude)
                                    if sub_apk:
                                        sub_size = format_size(sub_apk["size"])
                                        sub_url = sub_apk["browser_download_url"]
                                        for s_idx in range(idx, item_end):
                                            if re.match(r'^\s*-\s*label:', lines[s_idx]):
                                                new_label = re.sub(r'\(\d+\s*MB\)', f'({sub_size})', lines[s_idx])
                                                if lines[s_idx] != new_label:
                                                    lines[s_idx] = new_label
                                                    updated = True
                                            elif re.match(r'^\s*url:', lines[s_idx]):
                                                new_url_line = f'      url: "{sub_url}"\n'
                                                if lines[s_idx] != new_url_line:
                                                    lines[s_idx] = new_url_line
                                                    updated = True
                                idx = item_end
                            else:
                                idx += 1

                    # 3. सिंगल apk_url वाले ऐप्स (Aru, SandFly, eSpeak, Parroglott, Smartvoice)
                    else:
                        apk_asset = find_matching_apk(assets, asset_match, exclude_words)
                        if tag and apk_asset:
                            new_size = format_size(apk_asset["size"])
                            new_url = apk_asset["browser_download_url"]
                            for idx in range(block_start, block_end):
                                if re.match(r'^  size:', lines[idx]):
                                    new_line = f'  size: "{new_size}"\n'
                                    if lines[idx] != new_line:
                                        lines[idx] = new_line
                                        updated = True
                                elif re.match(r'^  apk_url:', lines[idx]):
                                    new_line = f'  apk_url: "{new_url}"\n'
                                    if lines[idx] != new_line:
                                        lines[idx] = new_line
                                        updated = True

                except Exception as e:
                    print(f"Skipping {repo} due to error: {e}")

            i = block_end
        else:
            i += 1

    if updated:
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print(f"Updated: {filepath}")

if __name__ == "__main__":
    for yml_file in sorted(glob.glob("_data/*.yml")):
        update_yaml_file(yml_file)
