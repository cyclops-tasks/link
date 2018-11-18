import dotEvent from "dot-event"
import dotStore from "dot-store"
import dotTask from "dot-task"

import link from "../dist/link"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  dotTask({ events, store })

  events.onAny({
    "before.fs": async options => {
      const { action, event } = options

      const cancel = [
        "ensureSymlink",
        "pathExists",
        "remove",
      ]

      if (cancel.indexOf(action) > -1) {
        event.signal.cancel = true
      }

      if (action === "pathExists") {
        event.signal.returnValue = true
      }
    },
  })
})

async function run() {
  await events.task({
    arg: [],
    composer: link,
    op: "link",
    path: `${__dirname}/fixture`,
  })
}

test("link", async () => {
  const args = []

  events.onAny({
    "before.fs": ({ action, event }) => {
      if (action === "ensureSymlink") {
        args.push(event.args[0])
      }
    },
  })

  await run()

  expect(args.length).toBe(8)

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-a/node_modules/project-a/bin`,
    src: `${__dirname}/fixture/project-a/bin`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-b/node_modules/project-a/bin`,
    src: `${__dirname}/fixture/project-a/bin`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-a/node_modules/project-a/dist`,
    src: `${__dirname}/fixture/project-a/dist`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-b/node_modules/project-a/dist`,
    src: `${__dirname}/fixture/project-a/dist`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-a/node_modules/project-b/bin`,
    src: `${__dirname}/fixture/project-b/bin`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-b/node_modules/project-b/bin`,
    src: `${__dirname}/fixture/project-b/bin`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-a/node_modules/project-b/dist`,
    src: `${__dirname}/fixture/project-b/dist`,
  })

  expect(args).toContainEqual({
    action: "ensureSymlink",
    dest: `${__dirname}/fixture/project-b/node_modules/project-b/dist`,
    src: `${__dirname}/fixture/project-b/dist`,
  })
})
