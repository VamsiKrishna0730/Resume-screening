from typing import List, Dict, Any

def generate_latex_table(headers: List[str], rows: List[List[Any]], caption: str, label: str) -> str:
    col_fmt = "l" + "c" * (len(headers) - 1)
    latex = []
    latex.append(r"\begin{table}[htbp]")
    latex.append(r"\centering")
    latex.append(rf"\caption{{{caption}}}")
    latex.append(rf"\label{{{label}}}")
    latex.append(rf"\begin{{tabular}}{{{col_fmt}}}")
    latex.append(r"\hline")
    latex.append(" & ".join(headers) + r" \\")
    latex.append(r"\hline")
    for r in rows:
        str_r = [str(x) for x in r]
        latex.append(" & ".join(str_r) + r" \\")
    latex.append(r"\hline")
    latex.append(r"\end{tabular}")
    latex.append(r"\end{table}")
    return "\n".join(latex)

def generate_markdown_table(headers: List[str], rows: List[List[Any]]) -> str:
    lines = []
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
    for r in rows:
        lines.append("| " + " | ".join(str(x) for x in r) + " |")
    return "\n".join(lines)
