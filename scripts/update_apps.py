import glob
import json
import os
import re
import urllib.request

def get_latest_release(repo):
    url = f"https://api.github.com/repos/{repo}/releases/latest"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "VisionPlay-AutoUpdater",
            "Accept": "application/vnd.github+json"
        }
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))

def format_size(size_bytes):
    mb = round(size_bytes / (1024 * 1024))
    return f"{max(1, mb)} MB"

def update_yaml_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    updated = False
    i = 0
    while i < len(lines):
        if lines[i].startswith("- name:"):
            # एक ऐप के पूरे ब्लॉक की शुरुआत और अंत पहचानें
            block_start = i
            block_end = i + 1
            while block_end < len(lines) and not lines[block_end].startswith("- name:"):
                block_end += 1

            block = lines[block_start:block_end]
            repo = None
            asset_match = None

            for line in block:
                m_repo = re.match(r'^\s*github_repo:\s*"([^"]+)"', line)
                if m_repo:
                    repo = m_repo.group(1)
                m_asset = re.match(r'^\s*github_asset_match:\s*"([^"]+)"', line)
                if m_asset:
                    asset_match = m_asset.group(1).lower()

            if repo:
                try:
                    release = get_latest_release(repo)
                    tag = release.get("tag_name", "").lstrip("vV")
                    assets = release.get("assets", [])

                    # सही .apk फ़ाइल ढूंढें
                    apk_asset = None
                    for asset in assets:
                        name = asset.get("name", "")
                        if name.lower().endswith(".apk"):
                            if asset_match and asset_match not in name.lower():
                                continue
                            apk_asset = asset
                            break

                    if tag and apk_asset:
                        new_size = format_size(apk_asset["size"])
                        new_url = apk_asset["browser_download_url"]

                        for idx in range(block_start, block_end):
                            if re.match(r'^\s*size:', lines[idx]):
                                new_line = f'  size: "{new_size}"\n'
                                if lines[idx] != new_line:
                                    lines[idx] = new_line
                                    updated = True
                            elif re.match(r'^\s*version:', lines[idx]):
                                new_line = f'  version: "{tag}"\n'
                                if lines[idx] != new_line:
                                    lines[idx] = new_line
                                    updated = True
                            elif re.match(r'^\s*apk_url:', lines[idx]):
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
    for yml_file in glob.glob("_data/*.yml"):
        update_yaml_file(yml_file)
