"""Fix indentation in generated entity files."""
from pathlib import Path

SERVICES_DIR = Path(__file__).resolve().parent.parent / "services"

for entity_file in SERVICES_DIR.glob("*/src/domain/entities/*.py"):
    lines = entity_file.read_text(encoding="utf-8").splitlines()
    fixed: list[str] = []
    in_class = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            fixed.append("")
            continue
        if stripped.startswith("from ") or stripped.startswith("import "):
            fixed.append(stripped)
            continue
        if stripped.startswith("@dataclass"):
            in_class = True
            fixed.append(stripped)
            continue
        if stripped.startswith("class "):
            in_class = True
            fixed.append(stripped)
            continue
        if in_class:
            if stripped.startswith("id:") or stripped.startswith("created_at:"):
                fixed.append(f"    {stripped}")
            elif ":" in stripped and not stripped.startswith("def "):
                fixed.append(f"    {stripped}")
            else:
                fixed.append(stripped)
        else:
            fixed.append(stripped)
    entity_file.write_text("\n".join(fixed) + "\n", encoding="utf-8")
    print(f"Fixed: {entity_file}")
