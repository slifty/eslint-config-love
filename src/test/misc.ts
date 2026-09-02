import test from 'ava'
import exported from '../index.js'
import { ourDeps, ourDevDeps } from './_util.js'

test('rule configs are arrays', (t) => {
  if (exported.rules === undefined) throw new Error()
  const nonArrayConfigs = Object.entries(exported.rules).filter(
    ([_rule, config]) => !Array.isArray(config),
  )
  t.deepEqual(nonArrayConfigs, [])
})

test('tseslint dep group same version', (t) => {
  const { 'typescript-eslint': tseslint } = ourDeps
  const { '@typescript-eslint/utils': tseslintUtils } = ourDeps
  t.is(tseslint, tseslintUtils)
})

test('eslint docs dep same version as eslint', (t) => {
  const { eslint, eslint_docs: eslintDocs } = ourDevDeps
  const [, version] = /\/v(?<version>[\d.]+)\.tar\.gz$/v.exec(eslintDocs) ?? []
  t.is(version, eslint)
})
