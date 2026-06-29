"""Fix indentation issues from scaffold textwrap.dedent across all service Python files."""
from pathlib import Path

SERVICES_DIR = Path(__file__).resolve().parent.parent / "services"


def fix_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    lines = original.splitlines()
    fixed: list[str] = []
    changed = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            fixed.append("")
            continue

        # Top-level imports/classes should not be indented
        if line.startswith("    ") and (
            stripped.startswith("from ")
            or stripped.startswith("import ")
            or stripped.startswith("class ")
            or stripped.startswith("@dataclass")
        ):
            fixed.append(stripped)
            if line != stripped:
                changed = True
            continue

        # Fields missing indentation inside class body (heuristic: line N-1 is class field or class header)
        if (
            ":" in stripped
            and not stripped.startswith("def ")
            and not stripped.startswith("async def")
            and not stripped.startswith("@")
            and not stripped.startswith("class ")
            and not stripped.startswith("from ")
            and not stripped.startswith("import ")
            and not stripped.startswith("return ")
            and not stripped.startswith("if ")
            and not stripped.startswith("for ")
            and not stripped.startswith("raise ")
            and not stripped.startswith("self.")
            and not line.startswith("    ")
            and not line.startswith("\t")
            and fixed
            and (
                fixed[-1].strip().startswith("class ")
                or fixed[-1].strip().startswith("@dataclass")
                or (":" in fixed[-1] and fixed[-1].startswith("    "))
            )
        ):
            fixed.append(f"    {stripped}")
            changed = True
            continue

        fixed.append(line.rstrip())

    result = "\n".join(fixed) + "\n"
    if result != original:
        path.write_text(result, encoding="utf-8")
        return True
    return False


count = 0
for py_file in SERVICES_DIR.rglob("*.py"):
    if fix_file(py_file):
        count += 1
        print(f"Fixed: {py_file.relative_to(SERVICES_DIR.parent)}")

print(f"Total fixed: {count}")
