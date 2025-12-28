const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'src')
const destDir = path.join(root, 'frontend', 'src')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name))
    }
  } else if (stat.isFile()) {
    let content = fs.readFileSync(src, 'utf8')
    // Update imports in copied files if they reference ../src/
    content = content.replace(/\.\.\/src\//g, '../frontend/src/')
    // Also update any absolute import strings that reference '/src/'
    content = content.replace(/\/src\//g, '/frontend/src/')
    fs.writeFileSync(dest, content, 'utf8')
  }
}

function removeRecursive(p) {
  if (!fs.existsSync(p)) return
  const stat = fs.statSync(p)
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      removeRecursive(path.join(p, name))
    }
    fs.rmdirSync(p)
  } else {
    fs.unlinkSync(p)
  }
}

try {
  console.log('Copying src -> frontend/src')
  copyRecursive(srcDir, destDir)
  console.log('Updating imports in api and tests')
  // Update api files
  const apiDir = path.join(root, 'api')
  if (fs.existsSync(apiDir)) {
    for (const f of fs.readdirSync(apiDir)) {
      const p = path.join(apiDir, f)
      if (fs.statSync(p).isFile()) {
        let txt = fs.readFileSync(p, 'utf8')
        txt = txt.replace(/\.\.\/src\//g, '../frontend/src/')
        fs.writeFileSync(p, txt, 'utf8')
      }
    }
  }
  // Update top-level tests
  const testDir = path.join(root, 'test')
  if (fs.existsSync(testDir)) {
    for (const f of fs.readdirSync(testDir)) {
      const p = path.join(testDir, f)
      if (fs.statSync(p).isFile()) {
        let txt = fs.readFileSync(p, 'utf8')
        txt = txt.replace(/\.\.\/src\//g, '../frontend/src/')
        fs.writeFileSync(p, txt, 'utf8')
      }
    }
  }

  console.log('Removing original src directory')
  removeRecursive(srcDir)
  console.log('Done')
} catch (err) {
  console.error('Error during move:', err)
  process.exit(1)
}
