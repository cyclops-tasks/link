// Packages
import dotStoreFs from "@dot-store/fs"
import dotStoreLog from "@dot-store/log"

// Helpers
import { dryMode } from "./link/dry"
import { output } from "./link/output"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("link")) {
    return options
  }

  dotStoreFs({ events, store })
  dotStoreLog({ events, output, store })

  events.onAny({
    "before.fs": output,

    link: [dryMode, link],

    linkSetup: () =>
      events.argv("argv", {
        options: {
          alias: { d: ["dry"] },
        },
      }),
  })

  return options
}

function propsFn({ event, taskId }) {
  return (...keys) => [
    ...(taskId ? ["tasks", taskId] : []),
    ...(event.props || []),
    ...keys,
  ]
}

async function link(options) {
  const { events, store, task } = options
  const tasks = store.get("tasks")
  const { projectPath } = task
  const props = propsFn(options)

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
    const destRoot = `${projectPath}/node_modules/${name}`
    const srcRoot = `${pathsByName[name]}`
    const dirs = ["bin", "dist"]

    for (const dir of dirs) {
      const dest = `${destRoot}/${dir}`
      const src = `${srcRoot}/${dir}`

      const exists = await events.fs(
        props("link", "fsPathExists"),
        {
          action: "pathExists",
          path: dest,
        }
      )

      if (exists) {
        await events.fs(props("link", "fsRemove"), {
          action: "remove",
          path: dest,
        })

        await events.fs(props("link", "fsEnsureSymlink"), {
          action: "ensureSymlink",
          dest,
          src,
        })
      }
    }
  }
}
