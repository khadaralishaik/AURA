import ast
import operator as op
from datetime import datetime
from zoneinfo import ZoneInfo

_BIN_OPS = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv, ast.Mod: op.mod, ast.Pow: op.pow}
_UNARY_OPS = {ast.UAdd: op.pos, ast.USub: op.neg}


def _eval(node: ast.AST):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        left, right = _eval(node.left), _eval(node.right)
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            raise ValueError("Exponent too large")
        return _BIN_OPS[type(node.op)](left, right)
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_eval(node.operand))
    raise ValueError("Only basic arithmetic is allowed")


def calculate(expression: str) -> str:
    tree = ast.parse(expression.strip(), mode="eval")
    return str(_eval(tree.body))


def current_time(timezone: str = "UTC") -> str:
    try:
        now = datetime.now(ZoneInfo(timezone))
    except Exception:
        now = datetime.now(ZoneInfo("UTC"))
    return now.strftime("%Y-%m-%d %H:%M:%S %Z")
