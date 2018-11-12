import dotStoreFs from "@dot-store/fs"
import dotStoreLog from "@dot-store/log"

import { dryMode } from "./dry"

function output(event) {
  if (
    event.op === "fs" &&
    event.props[0] === "ensureSymlink"
  ) {
    return event.props.slice(0, 4).join(" ")
  }
}

export default function(options) {
  const { events, store } = options

  dotStoreFs({ events, store })
  dotStoreLog({ events, output, store })

  events.on({
    "cyclops.beforeRunTasks": async () =>
      await store.set("argvOptions.alias", {
        d: ["dry"],
      }),

    "cyclops.startTask": [dryMode, link],
  })

  return options
}

async function link({ events, store, taskId }) {
  const { projectPath } = store.get(`tasks.${taskId}`)
  const paths = store.get("taskPaths")

  const pathsByName = paths.reduce(
    (memo, { projectPath, taskId }) => {
      const name = store.get(`fs.readJson.${taskId}.name`)
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
