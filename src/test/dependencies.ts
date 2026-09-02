import test from 'ava'
import {
  extractVersionRange,
  isPinnedRange,
  isSingleCaretRange,
  ourDeps,
  ourDevDeps,
  ourPeerDeps,
} from './_util.js'

test('range types', (t) => {
  const nonCompliantDepRanges = Object.entries({
    dep: ourDeps,
    peer: ourPeerDeps,
    dev: ourDevDeps,
  })
    .flatMap(([depType, deps]) =>
      Object.entries(deps).map(([depName, spec]) => {
        if (spec === undefined) throw new Error()
        return [depName, depType, spec] as const
      }),
    )
    .filter(([depName, depType, spec]) => {
      if (depName === 'typescript' && depType === 'peer') {
        return spec !== '*'
      }

      /*
       * Pinned by git tag rather than by semver range, because it is not
       * published to npm. See _core-rules.ts. That the tag matches the `eslint`
       * dev dependency is asserted separately.
       */
      if (depName === 'eslint_docs' && depType === 'dev') {
        return !/^https:\/\/github\.com\/eslint\/eslint\/archive\/refs\/tags\/v\d+\.\d+\.\d+\.tar\.gz$/v.test(
          spec,
        )
      }

      const range = extractVersionRange(spec)

      switch (depType) {
        case 'dep':
          return !isSingleCaretRange(range)
        case 'peer':
          return !isSingleCaretRange(range)
        case 'dev':
          return !isPinnedRange(range)
        default:
          throw new Error()
      }
    })

  t.deepEqual(nonCompliantDepRanges, [])
})
