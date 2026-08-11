// Generates cfg.dtsPropsFor — a real props contract for every RFDS component.
//
// Why: the converter extracts props from a package's shipped .d.ts tree. RFDS is
// a barrel inside a Next.js app with no types build, so extraction found nothing
// and every emitted <Name>.d.ts degraded to `[key: string]: unknown`. The design
// agent codes against those files, so an empty contract means it has to guess
// every prop name on all 67 components.
//
// So: resolve each component's props type from source with ts-morph and render a
// deliberately conservative body — accurate prop names, optionality, literal
// unions (the part a design agent needs most, e.g. variant: "primary" |
// "secondary"), and doc comments. Anything we cannot render faithfully becomes
// `unknown` rather than a plausible-looking lie.
import { Project, Node, SyntaxKind } from 'ts-morph';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const project = new Project({ tsConfigFilePath: resolve(ROOT, 'tsconfig.json') });
const rosterMap = JSON.parse(readFileSync(resolve(ROOT, '.design-sync/roster.json'), 'utf8'));
const locals = JSON.parse(readFileSync(resolve(ROOT, '.design-sync/locals.json'), 'utf8'));

const MAX_UNION = 12; // beyond this a literal union is noise, not a contract

// Most RFDS components spread `ComponentPropsWithoutRef<'button'>`, so the
// resolved props type carries ~200 inherited DOM/ARIA attributes. Emitting those
// buries the handful of props that actually express the design system. Keep:
//   1. props DECLARED IN THIS REPO (the component's real API), and
//   2. this curated set of passthroughs, when the type really has them —
//      the ones a design agent legitimately needs to reach for.
const PASSTHROUGH = new Set([
  'children', 'className', 'style', 'id', 'disabled', 'type', 'href', 'target', 'rel',
  'onClick', 'onChange', 'onSubmit', 'onBlur', 'onFocus', 'onKeyDown',
  'value', 'defaultValue', 'checked', 'defaultChecked', 'placeholder', 'name',
  'required', 'readOnly', 'autoFocus', 'htmlFor', 'rows', 'cols',
  'min', 'max', 'step', 'maxLength', 'src', 'alt', 'width', 'height',
  'role', 'title', 'aria-label', 'aria-labelledby', 'aria-describedby',
]);

// Declared inside the repo (and not in a dependency) == the component's own API.
function isOwnProp(prop) {
  for (const d of prop.getDeclarations?.() ?? []) {
    const fp = d.getSourceFile().getFilePath();
    if (fp.startsWith(ROOT) && !fp.includes('/node_modules/')) return true;
  }
  return false;
}

// ── type rendering ────────────────────────────────────────────────────────
function renderType(type, node, depth = 0) {
  if (!type) return 'unknown';

  // ReactNode resolves to a wide union (string | number | Iterable | ...) that
  // the union branch below would flatten to `unknown`. Catch it by name first —
  // "accepts children" is one of the most useful things the contract can say.
  const raw = type.getText(node);
  if (/\bReactNode\b/.test(raw)) return 'React.ReactNode';

  // Unwrap optionality — handled by the `?` on the property itself.
  if (type.isUnion()) {
    const parts = type.getUnionTypes().filter((t) => !t.isUndefined() && !t.isNull());
    if (parts.length === 1) return renderType(parts[0], node, depth);
    // Literal unions are the high-value case: they tell the agent the variants.
    if (parts.length <= MAX_UNION && parts.every((t) => t.isLiteral() || t.isBoolean() || t.isBooleanLiteral())) {
      if (parts.every((t) => t.isBooleanLiteral())) return 'boolean';
      const lits = [...new Set(parts.map((t) => (t.isBooleanLiteral() ? 'boolean' : t.getText())))];
      return lits.join(' | ');
    }
    // Too many literals to enumerate usefully (AriaRole and friends) — widen to
    // the base type rather than throwing the information away entirely.
    if (parts.every((t) => t.isStringLiteral())) return 'string';
    // Mixed union — keep it honest but useful.
    const rendered = [...new Set(parts.map((t) => renderType(t, node, depth + 1)))];
    return rendered.includes('unknown') || rendered.length > MAX_UNION ? 'unknown' : rendered.join(' | ');
  }

  if (type.isBoolean() || type.isBooleanLiteral()) return 'boolean';
  if (type.isStringLiteral() || type.isNumberLiteral()) return type.getText();
  if (type.isString()) return 'string';
  if (type.isNumber()) return 'number';

  const text = type.getText(node);

  // React types render as import("...").ReactNode — normalize the useful ones.
  if (/\bReactNode\b/.test(text)) return 'React.ReactNode';
  if (/\bReactElement\b/.test(text)) return 'React.ReactElement';
  if (/\bCSSProperties\b/.test(text)) return 'React.CSSProperties';
  if (/\bRef(Object|Callback)?<|\bLegacyRef\b/.test(text)) return 'React.Ref<unknown>';

  // Event handlers and callbacks: shape matters less than "this is a function".
  if (type.getCallSignatures().length) {
    const sig = type.getCallSignatures()[0];
    const arity = sig.getParameters().length;
    return arity === 0 ? '() => void' : `(...args: unknown[]) => void`;
  }

  if (type.isArray()) {
    const inner = renderType(type.getArrayElementType(), node, depth + 1);
    return inner === 'unknown' ? 'unknown[]' : `${inner}[]`;
  }

  // A named type we cannot inline faithfully (cross-module interfaces,
  // generics). `unknown` beats emitting an identifier that resolves to nothing
  // in the generated .d.ts.
  return 'unknown';
}

// ── locate the props type of a component ──────────────────────────────────
function propsTypeOf(decl) {
  const type = decl.getType();
  // React.FC<P> / ForwardRefExoticComponent<P> / plain function component.
  for (const sig of type.getCallSignatures()) {
    const p = sig.getParameters()[0];
    if (p) return p.getTypeAtLocation(decl);
  }
  // Class components (ErrorBoundary): there is no call signature. ts-morph
  // gives a ClassDeclaration's *instance* type, which carries `props` directly;
  // the construct-signature route covers a class referenced via its static side.
  const instanceProps = type.getProperty('props');
  if (instanceProps) return instanceProps.getTypeAtLocation(decl);
  for (const sig of type.getConstructSignatures()) {
    const props = sig.getReturnType().getProperty('props');
    if (props) return props.getTypeAtLocation(decl);
  }
  // forwardRef/memo results expose props via their type arguments.
  for (const arg of type.getTypeArguments()) {
    if (arg.getProperties().length) return arg;
  }
  return null;
}

function firstDocLine(prop, decl) {
  for (const d of prop.getDeclarations?.() ?? []) {
    const jsdoc = Node.isJSDocable(d) ? d.getJsDocs?.() : null;
    const text = jsdoc?.[0]?.getCommentText?.();
    if (text) return text.split('\n')[0].trim().slice(0, 100);
  }
  return null;
}

// ── main ──────────────────────────────────────────────────────────────────
const out = {};
const stats = { withProps: 0, empty: 0, unresolved: [] };

for (const [name, rel] of Object.entries(rosterMap)) {
  const sf = project.getSourceFile(resolve(ROOT, rel));
  if (!sf) { stats.unresolved.push(name); continue; }

  // The declaring file knows the local name, which may differ from the RFDS
  // export name (ThemeToggle -> ThemeSegmentedControl).
  let decl = null;
  for (const [exp, decls] of sf.getExportedDeclarations()) {
    const hit = decls.find((d) => Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d));
    if (!hit) continue;
    if (exp === name || hit.getName?.() === name || exp === locals[name] || hit.getName?.() === locals[name]) { decl = hit; break; }
  }
  // Fall back to the file's single component export when the name was aliased.
  if (!decl) {
    for (const [, decls] of sf.getExportedDeclarations()) {
      const hit = decls.find((d) => Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d));
      if (hit && propsTypeOf(hit)?.getProperties().length) { decl = hit; break; }
    }
  }
  if (!decl) { stats.unresolved.push(name); continue; }

  const pt = propsTypeOf(decl);
  const all = pt ? pt.getProperties() : [];
  const own = all.filter(isOwnProp);
  const passthrough = all.filter((p) => !own.includes(p) && PASSTHROUGH.has(p.getName()));
  const inheritedCount = all.length - own.length - passthrough.length;

  const render = (prop) => {
    const pname = prop.getName();
    const optional = prop.isOptional?.() ?? true;
    const t = renderType(prop.getTypeAtLocation(decl), decl);
    const doc = firstDocLine(prop, decl);
    const key = /^[A-Za-z_$][\w$]*$/.test(pname) ? pname : JSON.stringify(pname);
    return `${doc ? `  /** ${doc} */\n` : ''}  ${key}${optional ? '?' : ''}: ${t};`;
  };

  const lines = [];
  const sortByName = (a, b) => a.getName().localeCompare(b.getName());
  const ownLines = own.filter((p) => !/^__/.test(p.getName())).sort(sortByName).map(render);
  if (ownLines.length) lines.push(...ownLines);
  const ptLines = passthrough.sort(sortByName).map(render);
  if (ptLines.length) {
    if (lines.length) lines.push('');
    lines.push('  // Standard element props, passed through to the underlying element.');
    lines.push(...ptLines);
  }
  if (inheritedCount > 0) {
    lines.push('');
    lines.push(`  // Plus ${inheritedCount} further standard HTML/ARIA attributes for the`);
    lines.push('  // underlying element, omitted here for readability.');
  }

  if (!lines.length) { stats.empty++; continue; }
  out[name] = '\n' + lines.join('\n') + '\n';
  stats.withProps++;
}

const cfgPath = resolve(ROOT, '.design-sync/config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
cfg.dtsPropsFor = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

console.error(`props: ${stats.withProps} components with contracts, ${stats.empty} with no props`);
if (stats.unresolved.length) console.error(`! unresolved: ${stats.unresolved.join(', ')}`);
