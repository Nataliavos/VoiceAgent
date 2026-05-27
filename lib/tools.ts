import type { FunctionTool } from "openai/resources/responses/responses";
import type { ToolName, ToolUsage } from "./types";

export const OPENAI_TOOLS: FunctionTool[] = [
  {
    type: "function",
    name: "calculator",
    description:
      "Use this tool to calculate travel budgets, totals, percentages, nights, people, and basic math.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "Arithmetic expression using numbers and operators + - * / ( ). Example: (100*3)+(40*2*3)",
        },
      },
      required: ["expression"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "web_search",
    description:
      "Use this tool to search current travel information about destinations, recommendations, weather, safety, attractions, or requirements.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for current travel information.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
];

const ALLOWED_EXPR = /^[\d\s+\-*/().]+$/;
const TRAVEL_QUERY_HINTS =
  /\b(travel|trip|itinerary|destination|flight|hotel|hostel|tour|visa|passport|airport|bus|train|weather|safety|attraction|budget|vacation|holiday|journey|turismo|viaje|itinerario|destino|vuelo|hotel|hospedaje|tour|visa|pasaporte|aeropuerto|clima|seguridad|atraccion|presupuesto|vacaciones)\b/i;
const NON_TRAVEL_SERVICE_HINTS =
  /\b(therapist|therapy|psychologist|counselor|lawyer|doctor|clinic|hospital|psychiatrist|plumber|electrician|dentist|psicolog|terapeut|abogad|medic|doctor|hospital|clinica|psiquiatra|fontaner|electricista|odontolog)\b/i;

export function isTravelRelatedQuery(query: string): boolean {
  const text = query.trim().toLowerCase();
  if (!text) return false;
  if (NON_TRAVEL_SERVICE_HINTS.test(text)) return false;
  return TRAVEL_QUERY_HINTS.test(text);
}

/** Safe arithmetic evaluator — no eval. Supports + - * / and parentheses. */
export function safeCalculate(expression: string): string {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error("Expression is empty");
  }
  if (!ALLOWED_EXPR.test(trimmed)) {
    throw new Error(
      "Invalid expression: only numbers and operators + - * / ( ) are allowed",
    );
  }
  const value = evaluateExpression(trimmed);
  if (!Number.isFinite(value)) {
    throw new Error("Could not evaluate expression");
  }
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

type Token =
  | { type: "number"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "paren"; value: "(" | ")" };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch as "+" | "-" | "*" | "/" });
      i++;
      continue;
    }
    if (/[\d.]/.test(ch)) {
      let num = ch;
      i++;
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      const value = Number(num);
      if (Number.isNaN(value)) {
        throw new Error(`Invalid number: ${num}`);
      }
      tokens.push({ type: "number", value });
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

function evaluateExpression(expr: string): number {
  const tokens = tokenize(expr);
  let pos = 0;

  function parseExpression(): number {
    return parseAddSub();
  }

  function parseAddSub(): number {
    let left = parseMulDiv();
    while (pos < tokens.length && tokens[pos].type === "op") {
      const op = tokens[pos] as { type: "op"; value: "+" | "-" };
      if (op.value !== "+" && op.value !== "-") break;
      pos++;
      const right = parseMulDiv();
      left = op.value === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseMulDiv(): number {
    let left = parseUnary();
    while (pos < tokens.length && tokens[pos].type === "op") {
      const op = tokens[pos] as { type: "op"; value: "*" | "/" };
      if (op.value !== "*" && op.value !== "/") break;
      pos++;
      const right = parseUnary();
      if (op.value === "/" && right === 0) {
        throw new Error("Division by zero");
      }
      left = op.value === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseUnary(): number {
    if (pos < tokens.length && tokens[pos].type === "op") {
      const op = tokens[pos] as { type: "op"; value: "+" | "-" };
      if (op.value === "-" || op.value === "+") {
        pos++;
        const val = parsePrimary();
        return op.value === "-" ? -val : val;
      }
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = tokens[pos];
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "number") {
      pos++;
      return token.value;
    }
    if (token.type === "paren" && token.value === "(") {
      pos++;
      const val = parseExpression();
      const close = tokens[pos];
      if (!close || close.type !== "paren" || close.value !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      pos++;
      return val;
    }
    throw new Error("Invalid expression");
  }

  const result = parseExpression();
  if (pos !== tokens.length) {
    throw new Error("Unexpected tokens after expression");
  }
  return result;
}

export async function executeWebSearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return "Web search is unavailable: TAVILY_API_KEY is not configured on the server.";
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 3,
        search_depth: "basic",
        include_answer: true,
      }),
    });

    if (!res.ok) {
      return `Web search failed (HTTP ${res.status}). Please try again later.`;
    }

    const data = (await res.json()) as {
      answer?: string;
      results?: Array<{ title?: string; content?: string; url?: string }>;
    };

    const lines: string[] = [];
    if (data.answer) {
      lines.push(data.answer);
    }
    for (const [i, r] of (data.results ?? []).entries()) {
      const title = r.title ?? `Result ${i + 1}`;
      const snippet = (r.content ?? "").slice(0, 280);
      lines.push(`- **${title}** — ${snippet}`);
    }

    return lines.length > 0
      ? lines.join("\n\n")
      : "No search results found for this query.";
  } catch {
    return "Web search failed due to a network error. Please try again later.";
  }
}

export function toDisplayToolName(internalName: string): ToolName | null {
  if (internalName === "calculator") return "Calculator";
  if (internalName === "web_search") return "Web Search";
  return null;
}

export async function executeTool(
  name: string,
  argsJson: string,
): Promise<{ output: string; usage: ToolUsage | null }> {
  let args: Record<string, string>;
  try {
    args = JSON.parse(argsJson) as Record<string, string>;
  } catch {
    return {
      output: "Error: could not parse tool arguments.",
      usage: null,
    };
  }

  if (name === "calculator") {
    const expression = args.expression ?? "";
    try {
      const result = safeCalculate(expression);
      return {
        output: result,
        usage: {
          name: "Calculator",
          input: expression,
          output: result,
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Calculator error";
      return {
        output: `Error: ${message}`,
        usage: {
          name: "Calculator",
          input: expression,
          output: message,
        },
      };
    }
  }

  if (name === "web_search") {
    const query = args.query ?? "";
    if (!isTravelRelatedQuery(query)) {
      return {
        output:
          "Tool blocked: web_search can only be used for travel-related requests.",
        usage: null,
      };
    }
    const output = await executeWebSearch(query);
    return {
      output,
      usage: {
        name: "Web Search",
        input: query,
        output: output.slice(0, 200),
      },
    };
  }

  return { output: `Unknown tool: ${name}`, usage: null };
}
