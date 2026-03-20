import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"


def get_file_content(filename: str) -> str:
    """Read a single .md file by name (without extension)."""
    path = DATA_DIR / f"{filename}.md"
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def search_markdown(query: str) -> list[dict]:
    """Return all .md files whose content contains the query string (case-insensitive)."""
    results = []
    for md_file in DATA_DIR.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        if query.lower() in content.lower():
            results.append({"filename": str(md_file.relative_to(DATA_DIR)), "content": content})
    return results


def load_all_markdown() -> str:
    """Load all .md files and concatenate into a single context string."""
    parts = []
    for md_file in sorted(DATA_DIR.rglob("*.md")):
        if md_file.name.startswith("_"):
            continue  # skip templates
        relative = md_file.relative_to(DATA_DIR)
        content = md_file.read_text(encoding="utf-8")
        parts.append(f"## FILE: {relative}\n\n{content}")
    return "\n\n---\n\n".join(parts)
