import { readFileSync } from 'node:fs'

function analyze(data) {
  if (!data || typeof data !== 'object' || !Object.hasOwn(data, 'tree'))
    throw new Error('Provide a tree property');
  const entries = [];
  const escape = key => key.replaceAll('~', '~0').replaceAll('/', '~1');
  function walk(value, path, depth) {
    if (depth > 85) throw new Error('Tree is nested more than 85 levels deep');
    const isArray = Array.isArray(value);
    const children = (value !== null && typeof value === 'object') ? Object.entries(value) : [];
    if (children.length) {
      for (const [key, child] of children) walk(child, path + '/' + escape(key), depth + 1);
    } else {
      if (entries.length >= 20000) throw new Error('More than 20,000 leaves');
      entries.push({path, type: value === null ? 'null' : isArray ? 'array' : typeof value, value});
    }
  }
  walk(data.tree, '', 0);
  return {count: entries.length, entries};
}

try {
  if (process.argv.length !== 3) throw new Error('Usage: node app.mjs input.json')
  console.log(JSON.stringify(analyze(JSON.parse(readFileSync(process.argv[2], 'utf8')))))
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
