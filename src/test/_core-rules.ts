import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/*
 * ESLint v10 removed `Linter#getRules()`, which was our source of the core rule
 * list. `@eslint/js`'s `configs.all` is not a substitute because it omits
 * deprecated rules, which we need in order to assert that we use none of them.
 *
 * The docs site's generated rule index is the published list. It is not
 * reachable as a package export, so we locate it relative to the one path the
 * `eslint` package does export.
 */
const require = createRequire(import.meta.url)
const dataPath = join(
  dirname(require.resolve('eslint_docs/package.json')),
  'docs',
  'src',
  '_data',
  'rules.json',
)

const parsed: unknown = JSON.parse(readFileSync(dataPath, 'utf8'))

const ruleNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) throw new Error(`expected an array in ${dataPath}`)
  return value.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null || !('name' in entry)) {
      throw new Error(`expected a named rule in ${dataPath}`)
    }
    const { name } = entry
    if (typeof name !== 'string') {
      throw new Error(`expected a rule name in ${dataPath}`)
    }
    return name
  })
}

if (typeof parsed !== 'object' || parsed === null) {
  throw new Error(`expected an object in ${dataPath}`)
}
if (!('types' in parsed) || !('deprecated' in parsed)) {
  throw new Error(`expected types and deprecated in ${dataPath}`)
}
const { types, deprecated } = parsed
if (typeof types !== 'object' || types === null) {
  throw new Error(`expected types to be an object in ${dataPath}`)
}

export const deprecatedCoreRuleNames = ruleNames(deprecated)

/*
 * Rules that exist in this version of ESLint. The docs data also carries a
 * `removed` list, which is deliberately excluded: those rules are gone, and
 * `Linter#getRules()` never reported them either.
 */
export const coreRuleNames = [
  ...Object.values(types).flatMap(ruleNames),
  ...deprecatedCoreRuleNames,
]
