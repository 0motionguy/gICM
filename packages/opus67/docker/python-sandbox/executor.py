#!/usr/bin/env python3
"""
OPUS 67 HumanEval Executor
Safe code execution with timeout and output capture
"""

import sys
import json
import traceback
import signal
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr

TIMEOUT_SECONDS = 30

def timeout_handler(signum, frame):
    raise TimeoutError("Execution timed out")

def execute_code(code: str, test_code: str) -> dict:
    """Execute code and run tests, returning structured result."""
    result = {
        "passed": False,
        "error": None,
        "error_type": None,
        "output": "",
        "test_output": ""
    }

    # Capture stdout/stderr
    stdout_capture = StringIO()
    stderr_capture = StringIO()

    try:
        # Set timeout (Unix only - Windows uses different mechanism)
        if hasattr(signal, 'SIGALRM'):
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(TIMEOUT_SECONDS)

        # Create execution namespace
        namespace = {"__builtins__": __builtins__}

        # Execute the solution code
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            exec(code, namespace)

            # Execute test code
            exec(test_code, namespace)

        result["passed"] = True
        result["output"] = stdout_capture.getvalue()

    except SyntaxError as e:
        result["error"] = str(e)
        result["error_type"] = "syntax"
    except TimeoutError as e:
        result["error"] = str(e)
        result["error_type"] = "timeout"
    except AssertionError as e:
        result["error"] = str(e) or "Assertion failed"
        result["error_type"] = "assertion"
    except Exception as e:
        result["error"] = traceback.format_exc()
        result["error_type"] = "runtime"
    finally:
        if hasattr(signal, 'SIGALRM'):
            signal.alarm(0)
        result["test_output"] = stderr_capture.getvalue()

    return result

def main():
    """Read input from stdin and execute."""
    try:
        input_data = json.loads(sys.stdin.read())
        code = input_data.get("code", "")
        test_code = input_data.get("test", "")

        result = execute_code(code, test_code)
        print(json.dumps(result))

    except json.JSONDecodeError as e:
        print(json.dumps({
            "passed": False,
            "error": f"Invalid JSON input: {e}",
            "error_type": "input"
        }))
    except Exception as e:
        print(json.dumps({
            "passed": False,
            "error": str(e),
            "error_type": "executor"
        }))

if __name__ == "__main__":
    main()
