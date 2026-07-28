import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pdfplumber


PDF_PATH = Path("/Users/wangzirui/Downloads/基于STEAM教育理念的小...印”校本课程设计与实践研究_周宗萍.pdf")
OUTPUT_DIR = Path("/Users/wangzirui/教科研数据仓库/tmp/pdfs")
REFERENCE_PDF_PAGES = (68, 69)
BODY_PDF_PAGES = range(10, 68)


def clean_text(text: str) -> str:
    text = text.replace("\u00a0", " ").replace("\ue5d2\ue5cf", "")
    return re.sub(r"\s+", " ", text).strip()


def parse_references(pdf) -> dict[int, str]:
    lines = []
    for page_number in REFERENCE_PDF_PAGES:
        text = pdf.pages[page_number - 1].extract_text() or ""
        for line in text.splitlines():
            stripped = clean_text(line)
            if not stripped:
                continue
            if stripped in {"参考文献", "59", "60"}:
                continue
            if "上海师范大学硕士学位论文" in stripped or stripped == "附录 A":
                continue
            lines.append(stripped)

    entries = []
    current_labels = []
    current_parts = []
    entry_re = re.compile(r"^((?:\[\d{1,3}\]\s*)+)(.*)$")
    for line in lines:
        match = entry_re.match(line)
        if match:
            if current_labels:
                entries.append((current_labels, clean_text(" ".join(current_parts))))
            current_labels = [int(value) for value in re.findall(r"\d+", match.group(1))]
            current_parts = [match.group(2)]
        elif current_labels:
            current_parts.append(line)
    if current_labels:
        entries.append((current_labels, clean_text(" ".join(current_parts))))

    by_label = {}
    for labels, reference_text in entries:
        for label in labels:
            by_label[label] = reference_text
    return by_label


def build_entities(references: dict[int, str]):
    parent = {label: label for label in references}

    def find(value):
        while parent[value] != value:
            parent[value] = parent[parent[value]]
            value = parent[value]
        return value

    def union(left, right):
        left_root, right_root = find(left), find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    for group in ({1, 11}, {8, 13}, {2, 18, 24}):
        ordered = sorted(group)
        for other in ordered[1:]:
            union(ordered[0], other)

    groups = defaultdict(list)
    for label in sorted(references):
        groups[find(label)].append(label)

    entity_by_label = {}
    entity_rows = []
    for index, labels in enumerate(sorted(groups.values(), key=lambda values: min(values)), 1):
        entity_id = f"E{index:03d}"
        for label in labels:
            entity_by_label[label] = entity_id
        entity_rows.append(
            {
                "entity_id": entity_id,
                "reference_labels": ",".join(str(label) for label in labels),
                "reference_text": references[labels[0]],
            }
        )
    return entity_by_label, entity_rows


def page_section(thesis_page: int) -> str:
    if thesis_page <= 2:
        return "1.1 研究背景"
    if thesis_page <= 4:
        return "1.2 国内外研究现状"
    if thesis_page <= 5:
        return "1.3 研究意义和目的"
    if thesis_page <= 8:
        return "1.4-1.5 研究内容、方法和思路"
    if thesis_page <= 11:
        return "2.1 相关概念界定"
    if thesis_page <= 14:
        return "2.2 理论基础"
    if thesis_page <= 21:
        return "3.1 课程开发可行性分析"
    if thesis_page <= 30:
        return "3.2 课程大纲"
    if thesis_page <= 43:
        return "第4章 教学设计与实施"
    if thesis_page <= 55:
        return "第5章 课程分析"
    return "第6章 总结与展望"


def sentence_context(text: str, start: int, end: int) -> str:
    boundaries = "。！？；"
    left = max(text.rfind(mark, 0, start) for mark in boundaries)
    right_candidates = [text.find(mark, end) for mark in boundaries]
    right_candidates = [value for value in right_candidates if value >= 0]
    right = min(right_candidates) + 1 if right_candidates else min(len(text), end + 180)
    if left < 0:
        left = max(0, start - 140)
    else:
        left += 1
    last_open_quote = text.rfind("“", max(0, start - 500), start)
    last_close_quote = text.rfind("”", max(0, start - 500), start)
    if last_open_quote > last_close_quote or (
        last_open_quote >= 0 and last_close_quote >= 0 and start - last_close_quote <= 8
    ):
        left = min(left, last_open_quote)
    context = clean_text(text[left:right])
    if len(context) < 15:
        context = clean_text(text[max(0, start - 140) : min(len(text), end + 180)])
    return context[:360]


def citation_mode(context: str) -> str:
    if "“" in context and "”" in context:
        return "可能直接引语或带引号转述"
    return "转述/概述"


def citation_purpose(context: str, section: str) -> str:
    if re.search(r"课程标准|规划纲要|教育部|规定|政策", context):
        return "政策或课程标准依据"
    if re.search(r"评价|量表|问卷|测量|评估", context):
        return "评价工具或方法依据"
    if re.search(r"建构主义|细化理论|多元智能|5E|理论", context):
        return "理论或教学模型依据"
    if re.search(r"是指|定义|含义|概念|称为", context):
        return "概念界定"
    if "研究现状" in section or re.search(r"研究表明|研究发现|指出|认为|提出", context):
        return "研究现状或文献观点"
    if re.search(r"3D\s*打印|技术|应用|发展", context):
        return "技术背景或应用依据"
    return "背景论据或论述支持"


def parse_bibliographic_parts(reference_text: str):
    doc_match = re.search(r"\[([JDMAC])\]", reference_text, re.I)
    document_type = doc_match.group(1).upper() if doc_match else ""
    before_marker = reference_text[: doc_match.start()] if doc_match else reference_text
    pieces = before_marker.split(".", 1)
    authors = pieces[0].strip() if pieces else ""
    title = pieces[1].strip() if len(pieces) > 1 else before_marker.strip()
    source = ""
    if doc_match:
        after_marker = reference_text[doc_match.end() :].lstrip(". ")
        source = re.split(r",\s*(?:19|20)\d{2}", after_marker, maxsplit=1)[0].strip()
    year_match = re.search(r"(19|20)\d{2}", reference_text)
    year = year_match.group(0) if year_match else ""
    return authors, title, document_type, source, year


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with pdfplumber.open(PDF_PATH) as pdf:
        references = parse_references(pdf)
        missing_reference_labels = [label for label in range(1, 48) if label not in references]
        if missing_reference_labels:
            raise RuntimeError(f"未解析的参考文献编号: {missing_reference_labels}")

        entity_by_label, entity_rows = build_entities(references)
        occurrences = []
        citation_pattern = re.compile(r"\[\s*(\d{1,3})\s*\]")
        for pdf_page in BODY_PDF_PAGES:
            page_text = clean_text(pdf.pages[pdf_page - 1].extract_text() or "")
            thesis_page = pdf_page - 9
            section = page_section(thesis_page)
            for match in citation_pattern.finditer(page_text):
                label = int(match.group(1))
                if label not in references:
                    continue
                context = sentence_context(page_text, match.start(), match.end())
                occurrences.append(
                    {
                        "reference_label": label,
                        "entity_id": entity_by_label[label],
                        "pdf_page": pdf_page,
                        "thesis_page": thesis_page,
                        "section": section,
                        "citation_context": context,
                        "citation_mode": citation_mode(context),
                        "citation_purpose": citation_purpose(context, section),
                        "mapping_confidence": "高",
                    }
                )

    counts = Counter(row["reference_label"] for row in occurrences)
    pages = defaultdict(list)
    for row in occurrences:
        pages[row["reference_label"]].append(row["thesis_page"])

    reference_rows = []
    for label in sorted(references):
        authors, title, document_type, source, year = parse_bibliographic_parts(references[label])
        reference_rows.append(
            {
                "reference_label": label,
                "entity_id": entity_by_label[label],
                "reference_text": references[label],
                "authors": authors,
                "title": title,
                "document_type": document_type,
                "source_container": source,
                "year": year,
                "citation_count": counts[label],
                "thesis_pages": ",".join(str(value) for value in sorted(set(pages[label]))),
                "mapping_status": "已匹配" if counts[label] else "文后有条目，正文未检出",
                "metadata_verification": "仅据论文参考文献表，未回原始来源核验",
            }
        )

    occurrence_fields = [
        "reference_label",
        "entity_id",
        "pdf_page",
        "thesis_page",
        "section",
        "citation_context",
        "citation_mode",
        "citation_purpose",
        "mapping_confidence",
    ]
    reference_fields = list(reference_rows[0].keys())
    entity_fields = list(entity_rows[0].keys())

    outputs = {
        "occurrences": OUTPUT_DIR / "周宗萍_正文引用位置.csv",
        "references": OUTPUT_DIR / "周宗萍_参考文献总表.csv",
        "entities": OUTPUT_DIR / "周宗萍_规范化文献实体.csv",
    }
    for key, path in outputs.items():
        rows = occurrences if key == "occurrences" else reference_rows if key == "references" else entity_rows
        fields = occurrence_fields if key == "occurrences" else reference_fields if key == "references" else entity_fields
        with path.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    payload = {
        "thesis": "基于STEAM教育理念的小学“3D打印”校本课程设计与实践研究",
        "author": "周宗萍",
        "pdf_pages": 84,
        "reference_labels": len(references),
        "normalized_entities": len(entity_rows),
        "citation_occurrences": len(occurrences),
        "cited_labels": sum(1 for label in references if counts[label]),
        "uncited_labels": [label for label in references if not counts[label]],
        "duplicate_or_shared_label_groups": [[1, 11], [8, 13], [2, 18, 24]],
        "reference_rows": reference_rows,
        "occurrences": occurrences,
        "entities": entity_rows,
    }
    json_path = OUTPUT_DIR / "周宗萍_参考文献引用映射.json"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: payload[key] for key in (
        "reference_labels",
        "normalized_entities",
        "citation_occurrences",
        "cited_labels",
        "uncited_labels",
        "duplicate_or_shared_label_groups",
    )}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
