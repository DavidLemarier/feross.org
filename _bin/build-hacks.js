#!/usr/bin/env node

const gitPullOrClone = require('git-pull-or-clone')
const path = require('path')
const series = require('run-series')

const MODULES = [
  ['git@github.com:DavidLemarier/hack-test', 'test']
]

series(MODULES.map(mod => {
  const url = mod[0]
  const outPath = path.join(__dirname, '..', 'hacks', mod[1])
  return (cb) => gitPullOrClone(url, outPath, cb)
}), (err) => {
  if (err) throw err
  console.log('hacks/ folder is up-to-date!')
})
