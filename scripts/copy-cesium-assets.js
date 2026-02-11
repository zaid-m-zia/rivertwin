import fs from 'fs'
import path from 'path'

const pkgRoot = path.resolve(process.cwd(), 'node_modules', 'cesium', 'Build', 'Cesium')
const destRoot = path.resolve(process.cwd(), 'public', 'cesium')

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true })
  const entries = await fs.promises.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.promises.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  const folders = ['Assets', 'Widgets', 'Workers', 'ThirdParty']
  for (const f of folders) {
    const src = path.join(pkgRoot, f)
    const dest = path.join(destRoot, f)
    if (fs.existsSync(src)) {
      console.log(`Copying ${src} -> ${dest}`)
      await copyDir(src, dest)
    } else {
      console.warn(`Source folder missing: ${src}`)
    }
  }
  // Also copy the Cesium.js build file
  const cesiumJs = path.join(pkgRoot, 'Cesium.js')
  if (fs.existsSync(cesiumJs)) {
    await fs.promises.mkdir(destRoot, { recursive: true })
    await fs.promises.copyFile(cesiumJs, path.join(destRoot, 'Cesium.js'))
    console.log('Copied Cesium.js')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
