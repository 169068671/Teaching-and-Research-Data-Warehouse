#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "sync_vault.py"


def run(args: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode != 0:
        raise AssertionError(result.stdout + result.stderr)
    return result


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp)
        vault = base / "vault"
        remote = base / "remote.git"
        vault.mkdir()
        (vault / ".gitignore").write_text(".DS_Store\n", encoding="utf-8")
        (vault / "note.md").write_text("# first\n", encoding="utf-8")
        run(["git", "init", "--bare", str(remote)])

        first = run(
            [
                sys.executable,
                str(SCRIPT),
                "--vault",
                str(vault),
                "--remote-url",
                str(remote),
                "--branch",
                "main",
                "--json",
            ]
        )
        first_data = json.loads(first.stdout)
        assert first_data["ok"] and first_data["pushed"] and first_data["committed"]

        (vault / "note.md").write_text("# second\n", encoding="utf-8")
        second = run(
            [
                sys.executable,
                str(SCRIPT),
                "--vault",
                str(vault),
                "--remote-url",
                str(remote),
                "--branch",
                "main",
                "--json",
            ]
        )
        second_data = json.loads(second.stdout)
        assert second_data["ok"] and second_data["remote_branch_existed"]
        count = run(["git", "--git-dir", str(remote), "rev-list", "--count", "refs/heads/main"])
        assert count.stdout.strip() == "2"

        (vault / ".env").write_text("SECRET=blocked\n", encoding="utf-8")
        blocked = run(
            [
                sys.executable,
                str(SCRIPT),
                "--vault",
                str(vault),
                "--remote-url",
                str(remote),
                "--branch",
                "main",
                "--json",
            ],
            check=False,
        )
        blocked_data = json.loads(blocked.stdout)
        assert blocked.returncode != 0 and not blocked_data["ok"]
        assert "凭据" in blocked_data["message"]

    print("sync_vault tests: PASS")


if __name__ == "__main__":
    main()

