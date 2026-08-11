#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


VAULT = Path(__file__).resolve().parents[1]
SKIP_PARTS = {".git", "node_modules", "__pycache__", ".trash"}
RAW_SOURCE_PREFIXES = {("60_原始资料", "文献原文")}
SENSITIVE_NAMES = {
    ".env",
    "id_rsa",
    "id_ed25519",
    "credentials.json",
    "secrets.json",
    "secrets.yaml",
    "secrets.yml",
}
SENSITIVE_SUFFIXES = {".pem", ".p12", ".pfx", ".key"}
TOKEN_PATTERNS = [
    re.compile(rb"ghp_[A-Za-z0-9]{20,}"),
    re.compile(rb"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(rb"sk-[A-Za-z0-9_-]{24,}"),
]
TEXT_SUFFIXES = {".md", ".txt", ".json", ".yaml", ".yml", ".base", ".py", ".js", ".css"}
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
TOP_LEVEL_KEY_RE = re.compile(r"^([A-Za-z0-9_\u4e00-\u9fff-]+):(?:\s|$)")


def included(path: Path) -> bool:
    return not any(part in SKIP_PARTS for part in path.relative_to(VAULT).parts)


def relative(path: Path) -> str:
    return path.relative_to(VAULT).as_posix()


def managed_markdown(path: Path) -> bool:
    """Return False for mirrored source documents that must remain unmodified."""
    parts = path.relative_to(VAULT).parts
    return not any(parts[: len(prefix)] == prefix for prefix in RAW_SOURCE_PREFIXES)


def check_frontmatter(path: Path, text: str, errors: list[str]) -> None:
    if path.name == "AGENTS.md":
        return
    if not text.startswith("---\n"):
        errors.append(f"Markdown 缺少 YAML frontmatter：{relative(path)}")
        return
    match = re.match(r"^---\n(.*?)\n---(?:\n|$)", text, re.S)
    if not match:
        errors.append(f"Markdown frontmatter 未正确闭合：{relative(path)}")
        return
    keys: list[str] = []
    for line in match.group(1).splitlines():
        key_match = TOP_LEVEL_KEY_RE.match(line)
        if key_match:
            keys.append(key_match.group(1))
    duplicates = sorted({key for key in keys if keys.count(key) > 1})
    if duplicates:
        errors.append(f"YAML 存在重复字段：{relative(path)}（{', '.join(duplicates)}）")
    if "title" not in keys:
        errors.append(f"Markdown 缺少 title：{relative(path)}")


def check_wikilinks(markdown_files: list[Path], base_files: list[Path], errors: list[str]) -> int:
    known = markdown_files + base_files
    by_stem: dict[str, list[Path]] = {}
    for path in known:
        by_stem.setdefault(path.stem, []).append(path)

    checked = 0
    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        for raw in WIKILINK_RE.findall(text):
            checked += 1
            target = raw.split("|", 1)[0].split("#", 1)[0].strip()
            if not target:
                continue
            candidate = path.parent / target
            candidates = [candidate, candidate.with_suffix(".md"), candidate.with_suffix(".base")]
            if "/" in target:
                exists = any(item.exists() for item in candidates)
            else:
                exists = target in by_stem or Path(target).name in by_stem or any(
                    item.exists() for item in candidates
                )
            if not exists:
                errors.append(f"Obsidian 断链：{relative(path)} -> {target}")
    return checked


def main() -> int:
    errors: list[str] = []
    json_files = 0
    markdown_files: list[Path] = []
    base_files: list[Path] = []

    for path in VAULT.rglob("*"):
        if not path.is_file() or not included(path):
            continue

        rel = relative(path)
        lower_name = path.name.lower()
        if lower_name in SENSITIVE_NAMES or path.suffix.lower() in SENSITIVE_SUFFIXES:
            errors.append(f"疑似凭据文件：{rel}")
        if path.stat().st_size > 95 * 1024 * 1024:
            errors.append(f"单文件超过 95 MB：{rel}")

        suffix = path.suffix.lower()
        if suffix == ".json":
            json_files += 1
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                errors.append(f"JSON 无法解析：{rel}（{exc}）")
        elif suffix == ".md":
            if managed_markdown(path):
                markdown_files.append(path)
                try:
                    check_frontmatter(path, path.read_text(encoding="utf-8"), errors)
                except UnicodeDecodeError as exc:
                    errors.append(f"Markdown 不是 UTF-8：{rel}（{exc}）")
        elif suffix == ".base":
            base_files.append(path)
            try:
                content = path.read_text(encoding="utf-8")
                if "\t" in content:
                    errors.append(f"Base 文件包含 Tab 缩进：{rel}")
                if "views:" not in content:
                    errors.append(f"Base 文件缺少 views：{rel}")
            except UnicodeDecodeError as exc:
                errors.append(f"Base 不是 UTF-8：{rel}（{exc}）")

        if suffix in TEXT_SUFFIXES and path.stat().st_size <= 10 * 1024 * 1024:
            data = path.read_bytes()
            if any(pattern.search(data) for pattern in TOKEN_PATTERNS):
                errors.append(f"疑似明文访问令牌：{rel}")

    links_checked = check_wikilinks(markdown_files, base_files, errors)
    result = {
        "status": "PASS" if not errors else "FAIL",
        "markdown_files": len(markdown_files),
        "base_files": len(base_files),
        "json_files": json_files,
        "links_checked": links_checked,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
