export function buildQueryString(values = {}, overrides = {}) {
  const params = new URLSearchParams();
  const merged = { ...values, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null) continue;
    const stringValue = String(value).trim();
    if (!stringValue) continue;
    params.set(key, stringValue);
  }

  return params.toString();
}
