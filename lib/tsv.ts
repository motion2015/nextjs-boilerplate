const ESCAPE_MAP: Record<string, string> = {
  "\\": "\\\\",
  "\t": "\\t",
  "\n": "\\n",
  "\r": "\\r",
};

const UNESCAPE_MAP: Record<string, string> = {
  "\\": "\\",
  t: "\t",
  n: "\n",
  r: "\r",
};

export function escapeTsvField(value: string): string {
  let result = "";
  for (const char of value) {
    result += ESCAPE_MAP[char] ?? char;
  }
  return result;
}

export function unescapeTsvField(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "\\" && i + 1 < value.length) {
      const next = value[i + 1];
      if (next in UNESCAPE_MAP) {
        result += UNESCAPE_MAP[next];
        i++;
        continue;
      }
    }
    result += char;
  }
  return result;
}

export function serializeTsvRow(fields: string[]): string {
  return fields.map(escapeTsvField).join("\t");
}

export function parseTsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    if (char === "\t") {
      fields.push(unescapeTsvField(current));
      current = "";
      i++;
      continue;
    }
    if (char === "\\" && i + 1 < line.length) {
      current += char + line[i + 1];
      i += 2;
      continue;
    }
    current += char;
    i++;
  }

  fields.push(unescapeTsvField(current));
  return fields;
}
