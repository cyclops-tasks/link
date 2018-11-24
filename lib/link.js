// Packages
import dotFs from "@dot-event/fs"
import dotLog from "@dot-event/log"

// Helpers
import { dryMode } from "./link/dry"
import { output } from "./link/output"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("link")) {
    return options
  }

  dotFs({ events, store })
  dotLog({ events, output, store })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      "before.fsEnsureSymlink": output,

      link: [dryMode, link],

      linkSetup: () =>
        events.argv({
          alias: { d: ["dry"] },
        }),
    })

  return options
}

async function link(options) {
  const { cwd, events, props, store } = options
  const tasks = store.get("tasks")

  const pathsByName = Object.values(tasks).reduce(
    (memo, { projectPath, taskId }) => {
      const { name } = store.get(
        `tasks.${taskId}.packageJson`
      )
      memo[name] = projectPath
      return memo
    },
    {}
  )

  for (const name in pathsByName) {
    const destRoot = `${cwd}/node_modules/${name}`
    const srcRoot = `${pathsByName[name]}`
    const dirs = ["bin", "dist"]

    for (const dir of dirs) {
      const dest = `${destRoot}/${dir}`
      const src = `${srcRoot}/${dir}`

      const srcExists = await events.fsPathExists(
        [...props, "link"],
        { path: src }
      )

      const destExists = await events.fsPathExists(
        [...props, "link"],
        { path: src }
      )

      if (srcExists && destExists) {
        await events.fsRemove([...props, "link"], {
          path: dest,
        })

        await events.fsEnsureSymlink([...props, "link"], {
          dest,
          src,
        })
      }
    }
  }
}
