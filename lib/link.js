// Packages
import dotStoreFs from "@dot-store/fs"
import dotStoreLog from "@dot-store/log"

// Helpers
import { resetArgv } from "./link/argv"
import { dryMode } from "./link/dry"
import { output } from "./link/output"

// Composer
export default function(options) {
  const { events, store } = options

  dotStoreFs({ events, store })
  dotStoreLog({ events, output, store })

  events.on({
    "cyclops.link-tasks.beforeTask": resetArgv,
    "cyclops.link-tasks.task": [dryMode, link],
  })

  return options
}

async function link({ events, store, taskId }) {
  const { tasks } = store.get("cyclops")
  const { projectPath } = tasks[taskId]

  const pathsByName = Object.values(tasks).reduce(
    (memo, { projectPath, taskId }) => {
      const { name } = store.get(
        `fs.readJson.cyclops.${taskId}`
      )
      memo[name] = projectPath
      return memo
    },
    {}
  )

  for (const name in pathsByName) {
    const destRoot = `${projectPath}/node_modules/${name}`
    const srcRoot = `${pathsByName[name]}`
    const dirs = ["bin", "dist"]

    for (const dir of dirs) {
      const dest = `${destRoot}/${dir}`
      const src = `${srcRoot}/${dir}`
      const id = `${name}/${dir}.->.${taskId}`

      await events.fs(`pathExists.${id}`, { path: dest })

      if (store.get(`fs.pathExists.${id}.exists`)) {
        await events.fs(`remove.${id}`, { path: dest })
        await events.fs(`ensureSymlink.${id}`, {
          dest,
          src,
        })
      }
    }
  }
}
