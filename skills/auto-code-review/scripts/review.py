#!/usr/bin/env python3
"""
Auto Code Review - Main Review Script
Static analysis for multiple languages
"""

import argparse
import ast
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Add skill root to path for imports
SKILL_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SKILL_DIR))

# Issue severity levels
SEVERITY = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
    "INFO": 0
}


class Issue:
    """Represents a code review issue"""
    def __init__(self, line: int, severity: str, category: str, 
                 message: str, suggestion: str = ""):
        self.line = line
        self.severity = severity
        self.category = category
        self.message = message
        self.suggestion = suggestion
    
    def to_dict(self):
        return {
            "line": self.line,
            "severity": self.severity,
            "category": self.category,
            "message": self.message,
            "suggestion": self.suggestion
        }


class CodeReviewer:
    """Main code review engine"""
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.issues: List[Issue] = []
    
    def review_file(self, file_path: Path) -> dict:
        """Review a single file"""
        self.issues = []
        
        if not file_path.exists():
            return {
                "success": False,
                "message": f"File not found: {file_path}",
                "data": None
            }
        
        content = file_path.read_text(encoding="utf-8")
        language = self._detect_language(file_path)
        
        # Run language-specific checks
        if language == "python":
            self._review_python(content, file_path)
        elif language == "javascript":
            self._review_javascript(content, file_path)
        elif language == "solidity":
            self._review_solidity(content, file_path)
        elif language == "typescript":
            self._review_typescript(content, file_path)
        else:
            return {
                "success": False,
                "message": f"Unsupported language: {language}",
                "data": None
            }
        
        # Generic checks
        self._check_line_length(content)
        self._check_trailing_whitespace(content)
        
        return {
            "success": True,
            "message": f"Found {len(self.issues)} issues",
            "data": {
                "path": str(file_path),
                "language": language,
                "line_count": len(content.splitlines()),
                "issues": [i.to_dict() for i in self.issues],
                "summary": self._summarize_issues()
            }
        }
    
    def _detect_language(self, file_path: Path) -> str:
        """Detect programming language from file extension"""
        ext = file_path.suffix.lower()
        mapping = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".jsx": "javascript",
            ".sol": "solidity"
        }
        return mapping.get(ext, "unknown")
    
    def _review_python(self, content: str, file_path: Path):
        """Python-specific checks"""
        lines = content.splitlines()
        
        # Try to parse AST
        try:
            tree = ast.parse(content)
            self._check_python_ast(tree, content)
        except SyntaxError as e:
            self.issues.append(Issue(
                e.lineno or 1, "CRITICAL", "syntax",
                f"Syntax error: {e.msg}", "Fix the syntax error"
            ))
            return
        
        # Check for common patterns
        for i, line in enumerate(lines, 1):
            # Check for eval/exec
            if re.search(r'\beval\s*\(', line) or re.search(r'\bexec\s*\(', line):
                self.issues.append(Issue(
                    i, "CRITICAL", "security",
                    "Dangerous use of eval/exec",
                    "Avoid using eval/exec - security risk"
                ))
            
            # Check for bare except
            if re.search(r'except\s*:', line):
                self.issues.append(Issue(
                    i, "HIGH", "error-handling",
                    "Bare except clause",
                    "Use 'except Exception:' or specific exception types"
                ))
            
            # Check for print statements (suggest logging)
            if re.search(r'\bprint\s*\(', line) and "test" not in str(file_path):
                self.issues.append(Issue(
                    i, "LOW", "best-practice",
                    "Use of print statement",
                    "Consider using logging module instead"
                ))
            
            # Check for hardcoded secrets (basic)
            secret_patterns = [
                (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded password"),
                (r'api_key\s*=\s*["\'][^"\']+["\']', "Hardcoded API key"),
                (r'secret\s*=\s*["\'][^"\']+["\']', "Hardcoded secret"),
            ]
            for pattern, msg in secret_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    self.issues.append(Issue(
                        i, "CRITICAL", "security",
                        msg, "Use environment variables for secrets"
                    ))
            
            # Check SQL injection risks
            if re.search(r'\.execute\s*\(\s*["\'].*%s', line):
                self.issues.append(Issue(
                    i, "HIGH", "security",
                    "Potential SQL injection",
                    "Use parameterized queries"
                ))
    
    def _check_python_ast(self, tree: ast.AST, content: str):
        """Check Python AST for issues"""
        for node in ast.walk(tree):
            # Check function complexity
            if isinstance(node, ast.FunctionDef):
                func_lines = node.end_lineno - node.lineno if node.end_lineno else 10
                if func_lines > 50:
                    self.issues.append(Issue(
                        node.lineno, "MEDIUM", "complexity",
                        f"Function '{node.name}' is too long ({func_lines} lines)",
                        "Consider breaking into smaller functions"
                    ))
                
                # Check for missing docstrings
                if not ast.get_docstring(node):
                    self.issues.append(Issue(
                        node.lineno, "LOW", "documentation",
                        f"Function '{node.name}' missing docstring",
                        "Add a docstring to describe the function"
                    ))
            
            # Check for unused imports
            if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                # This is a simplified check
                for alias in node.names:
                    name = alias.asname or alias.name
                    # Check if used in content (simplified)
                    if name != "*" and content.count(name) <= 1:
                        self.issues.append(Issue(
                            node.lineno, "LOW", "style",
                            f"Potentially unused import: '{name}'",
                            "Remove if not used"
                        ))
    
    def _review_javascript(self, content: str, file_path: Path):
        """JavaScript-specific checks"""
        lines = content.splitlines()
        
        for i, line in enumerate(lines, 1):
            # Check for eval
            if "eval(" in line:
                self.issues.append(Issue(
                    i, "CRITICAL", "security",
                    "Use of eval()",
                    "Never use eval() - major security risk"
                ))
            
            # Check for console.log in production
            if "console.log(" in line:
                self.issues.append(Issue(
                    i, "LOW", "best-practice",
                    "console.log statement",
                    "Remove debug logging before production"
                ))
            
            # Check for == instead of ===
            if re.search(r'[^=!]==[^=]', line):
                self.issues.append(Issue(
                    i, "MEDIUM", "style",
                    "Use of == instead of ===",
                    "Use === for strict equality"
                ))
            
            # Check for var (use let/const)
            if re.search(r'\bvar\s+', line):
                self.issues.append(Issue(
                    i, "LOW", "style",
                    "Use of var",
                    "Use let or const instead"
                ))
    
    def _review_typescript(self, content: str, file_path: Path):
        """TypeScript-specific checks"""
        # Run JS checks first
        self._review_javascript(content, file_path)
        
        lines = content.splitlines()
        for i, line in enumerate(lines, 1):
            # Check for any usage
            if ": any" in line or "as any" in line:
                self.issues.append(Issue(
                    i, "MEDIUM", "type-safety",
                    "Use of 'any' type",
                    "Use specific types instead of 'any'"
                ))
    
    def _review_solidity(self, content: str, file_path: Path):
        """Solidity-specific checks"""
        lines = content.splitlines()
        
        for i, line in enumerate(lines, 1):
            # Check for tx.origin
            if "tx.origin" in line:
                self.issues.append(Issue(
                    i, "CRITICAL", "security",
                    "Use of tx.origin",
                    "Use msg.sender instead of tx.origin"
                ))
            
            # Check for block.timestamp usage
            if "block.timestamp" in line or "now" in line:
                self.issues.append(Issue(
                    i, "MEDIUM", "security",
                    "Use of block.timestamp",
                    "Timestamps can be manipulated by miners"
                ))
            
            # Check for selfdestruct
            if "selfdestruct" in line:
                self.issues.append(Issue(
                    i, "HIGH", "security",
                    "Use of selfdestruct",
                    "Ensure proper access control"
                ))
            
            # Check for external call without checks
            if ".call.value(" in line or ".call{value:" in line:
                self.issues.append(Issue(
                    i, "HIGH", "security",
                    "External call with value",
                    "Check for reentrancy vulnerabilities"
                ))
            
            # Check for visibility
            if re.search(r'^\s*function\s+\w+\s*\([^)]*\)\s*\{', line):
                self.issues.append(Issue(
                    i, "MEDIUM", "best-practice",
                    "Function without explicit visibility",
                    "Add public/external/internal/private visibility"
                ))
    
    def _check_line_length(self, content: str):
        """Check for lines that are too long"""
        max_length = self.config.get("max-line-length", 100)
        lines = content.splitlines()
        
        for i, line in enumerate(lines, 1):
            if len(line) > max_length:
                self.issues.append(Issue(
                    i, "LOW", "style",
                    f"Line too long ({len(line)} > {max_length})",
                    "Break line into multiple lines"
                ))
    
    def _check_trailing_whitespace(self, content: str):
        """Check for trailing whitespace"""
        lines = content.splitlines()
        
        for i, line in enumerate(lines, 1):
            if line != line.rstrip():
                self.issues.append(Issue(
                    i, "INFO", "style",
                    "Trailing whitespace",
                    "Remove trailing spaces"
                ))
    
    def _summarize_issues(self) -> dict:
        """Summarize found issues"""
        by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
        by_category = {}
        
        for issue in self.issues:
            by_severity[issue.severity] = by_severity.get(issue.severity, 0) + 1
            by_category[issue.category] = by_category.get(issue.category, 0) + 1
        
        return {
            "total": len(self.issues),
            "by_severity": by_severity,
            "by_category": by_category
        }


def review_directory(directory: Path, recursive: bool = False) -> dict:
    """Review all files in a directory"""
    reviewer = CodeReviewer()
    
    if recursive:
        pattern = "**/*"
    else:
        pattern = "*"
    
    files_to_review = []
    for ext in [".py", ".js", ".ts", ".tsx", ".jsx", ".sol"]:
        files_to_review.extend(directory.glob(f"{pattern}{ext}"))
    
    # Exclude common directories
    exclude = {"venv", "node_modules", ".git", "__pycache__", "dist", "build"}
    files_to_review = [
        f for f in files_to_review 
        if not any(part in exclude for part in f.parts)
    ]
    
    results = []
    for file_path in files_to_review:
        result = reviewer.review_file(file_path)
        if result["success"]:
            results.append(result["data"])
    
    # Calculate totals
    total_issues = sum(r["summary"]["total"] for r in results)
    
    return {
        "success": True,
        "message": f"Reviewed {len(results)} files, found {total_issues} issues",
        "data": {
            "files_reviewed": len(results),
            "total_issues": total_issues,
            "files": results
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Code review tool")
    parser.add_argument("--file", "-f", help="File to review")
    parser.add_argument("--dir", "-d", help="Directory to review")
    parser.add_argument("--recursive", "-r", action="store_true", help="Review recursively")
    parser.add_argument("--format", choices=["text", "json"], default="json", help="Output format")
    parser.add_argument("--output", "-o", help="Output file")
    
    args = parser.parse_args()
    
    if args.file:
        reviewer = CodeReviewer()
        result = reviewer.review_file(Path(args.file))
    elif args.dir:
        result = review_directory(Path(args.dir), args.recursive)
    else:
        parser.print_help()
        sys.exit(1)
    
    # Output
    if args.format == "json":
        output = json.dumps(result, indent=2)
    else:
        # Simple text format
        output = format_text_output(result)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
    
    print(output)
    sys.exit(0 if result["success"] else 1)


def format_text_output(result: dict) -> str:
    """Format result as human-readable text"""
    if not result["success"]:
        return f"Error: {result['message']}"
    
    lines = ["🔍 Code Review Report", "═" * 50, ""]
    
    if "files" in result["data"]:
        # Multiple files
        for file_data in result["data"]["files"]:
            lines.extend(format_file_report(file_data))
            lines.append("")
        
        lines.append("─" * 50)
        lines.append(f"Total: {result['data']['total_issues']} issues in {result['data']['files_reviewed']} files")
    else:
        # Single file
        lines.extend(format_file_report(result["data"]))
    
    return "\n".join(lines)


def format_file_report(data: dict) -> list:
    """Format single file report"""
    lines = [
        f"File: {data['path']}",
        f"Language: {data['language']} ({data['line_count']} lines)",
        "─" * 40
    ]
    
    severity_icons = {
        "CRITICAL": "🚨",
        "HIGH": "❌",
        "MEDIUM": "⚠️ ",
        "LOW": "💡",
        "INFO": "ℹ️ "
    }
    
    for issue in data["issues"]:
        icon = severity_icons.get(issue["severity"], "•")
        lines.append(f"{icon} Line {issue['line']}: {issue['message']}")
        if issue["suggestion"]:
            lines.append(f"   → {issue['suggestion']}")
    
    if not data["issues"]:
        lines.append("✅ No issues found")
    
    summary = data["summary"]
    lines.append("─" * 40)
    lines.append(f"Issues: {summary['total']} total")
    
    return lines


if __name__ == "__main__":
    main()
