import json
import re
import sys
from typing import Any, Dict, List, Tuple


URL_RE = re.compile(r"^https?://", re.IGNORECASE)

TAM_VERDICTS = {"VERIFIED", "INFLATED", "UNSUBSTANTIATED"}
MOAT_VERDICTS = {"STRONG", "WEAK", "UNSUBSTANTIATED"}
QUESTION_SEVERITIES = {"HIGH", "MEDIUM"}
QUESTION_CATEGORIES = {"Market", "Moat", "Traction", "Founder", "Finance"}
THREAT_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}


def _get(d: Dict[str, Any], path: List[str], default=None):
    cur: Any = d
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return default
        cur = cur[key]
    return cur


def _as_list(x: Any) -> List[Any]:
    if x is None:
        return []
    return x if isinstance(x, list) else [x]


def _print_section(title: str):
    print()
    print(f"== {title} ==")


def _ok(msg: str):
    print(f"[OK] {msg}")


def _warn(msg: str):
    print(f"[WARN] {msg}")


def _fail(msg: str):
    print(f"[FAIL] {msg}")


def _load_json(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def check_verdicts(report: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    tam_verdict = _get(report, ["claims", "tam", "verdict"])
    moat_verdict = _get(report, ["claims", "moat", "verdict"])
    if tam_verdict and tam_verdict not in TAM_VERDICTS:
        issues.append(f"claims.tam.verdict is '{tam_verdict}' (expected one of {sorted(TAM_VERDICTS)})")
    if moat_verdict and moat_verdict not in MOAT_VERDICTS:
        issues.append(f"claims.moat.verdict is '{moat_verdict}' (expected one of {sorted(MOAT_VERDICTS)})")
    return issues


def check_sources(report: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    tam_source = _get(report, ["claims", "tam", "source"])
    if tam_source:
        if not isinstance(tam_source, str) or not URL_RE.match(tam_source.strip()):
            issues.append("claims.tam.source is present but not an http(s) URL")
    else:
        issues.append("claims.tam.source is missing (TAM checks should cite a source when possible)")
    return issues


def check_questions(report: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    questions = _as_list(_get(report, ["questions"]))
    if len(questions) != 5:
        issues.append(f"questions length is {len(questions)} (expected exactly 5)")
        return issues

    for q in questions:
        if not isinstance(q, dict):
            issues.append("questions contains a non-object item")
            continue
        severity = q.get("severity")
        category = q.get("category")
        targets_claim = q.get("targets_claim")
        gap_found = q.get("gap_found")
        text = q.get("question")

        if severity and severity not in QUESTION_SEVERITIES:
            issues.append(f"question severity '{severity}' not in {sorted(QUESTION_SEVERITIES)}")
        if category and category not in QUESTION_CATEGORIES:
            issues.append(f"question category '{category}' not in {sorted(QUESTION_CATEGORIES)}")
        if not isinstance(targets_claim, str) or not targets_claim.strip():
            issues.append("a question is missing targets_claim (deck-specific anchor)")
        if not isinstance(gap_found, str) or not gap_found.strip():
            issues.append("a question is missing gap_found (why we ask it)")
        if not isinstance(text, str) or len(text.strip()) < 20:
            issues.append("a question is suspiciously short or missing")
    return issues


def check_competitors_shape(report: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    moat_comps = _get(report, ["claims", "moat", "competitors"])
    top_comps = _get(report, ["competitors"])

    # Accept both shapes:
    # - list[str] (older / demo)
    # - list[dict] with threat_level (spec)
    if isinstance(moat_comps, list) and moat_comps:
        if all(isinstance(x, str) for x in moat_comps):
            _warn("claims.moat.competitors is list[str] (spec prefers structured competitor objects)")
        elif all(isinstance(x, dict) for x in moat_comps):
            for c in moat_comps:
                tl = c.get("threat_level")
                if tl and tl not in THREAT_LEVELS:
                    issues.append(f"competitor threat_level '{tl}' not in {sorted(THREAT_LEVELS)}")
        else:
            issues.append("claims.moat.competitors has mixed item types")

    if isinstance(top_comps, list) and top_comps:
        if all(isinstance(x, str) for x in top_comps):
            _warn("competitors is list[str] (spec prefers structured competitor objects)")
        elif all(isinstance(x, dict) for x in top_comps):
            pass
        else:
            issues.append("competitors has mixed item types")

    # Consistency check when both are the same type
    if isinstance(moat_comps, list) and isinstance(top_comps, list):
        if moat_comps and top_comps and type(moat_comps[0]) is type(top_comps[0]):
            if moat_comps != top_comps:
                issues.append("top-level competitors does not match claims.moat.competitors")

    return issues


def check_scorecard(report: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    scorecard = _get(report, ["scorecard"], {})
    if not isinstance(scorecard, dict):
        return ["scorecard is missing or not an object"]

    overall = scorecard.get("overall")
    if overall is None:
        # Some variants use overall_score.value (frontend has this bug/path today)
        overall_alt = _get(scorecard, ["overall_score", "value"])
        if overall_alt is None:
            issues.append("scorecard overall score missing (expected scorecard.overall as number)")
        else:
            _warn("scorecard uses overall_score.value; spec prefers scorecard.overall")
    return issues


def run(path: str) -> int:
    report = _load_json(path)

    _print_section("Basic")
    rid = report.get("report_id")
    fname = report.get("file_name")
    if rid:
        _ok(f"report_id present: {rid}")
    else:
        _fail("report_id missing")
    if fname:
        _ok(f"file_name present: {fname}")
    else:
        _warn("file_name missing")

    _print_section("Verdicts")
    v_issues = check_verdicts(report)
    if v_issues:
        for i in v_issues:
            _fail(i)
    else:
        _ok("verdict enums look valid")

    _print_section("Sources")
    s_issues = check_sources(report)
    if s_issues:
        for i in s_issues:
            _warn(i)
    else:
        _ok("sources look present/URL-like")

    _print_section("Questions")
    q_issues = check_questions(report)
    if q_issues:
        for i in q_issues:
            _warn(i)
    else:
        _ok("questions look well-formed and deck-anchored")

    _print_section("Competitors")
    c_issues = check_competitors_shape(report)
    if c_issues:
        for i in c_issues:
            _warn(i)
    else:
        _ok("competitor lists look consistent")

    _print_section("Scorecard")
    sc_issues = check_scorecard(report)
    if sc_issues:
        for i in sc_issues:
            _warn(i)
    else:
        _ok("scorecard shape looks OK")

    any_fail = bool(v_issues)
    return 1 if any_fail else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python sample/accuracy_check.py <report.json>")
        sys.exit(2)
    sys.exit(run(sys.argv[1]))

