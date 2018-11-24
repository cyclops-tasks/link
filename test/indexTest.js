import dotEvent from "dot-event"
import dotStore from "@dot-event/store"
import dotTask from "@dot-event/task"

import dotLink from "../dist/link"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore({ events })

  dotLink({ events, store })
  dotTask({ events, store })

  const cancel = ({ event }) => (event.signal.cancel = true)

  events.onAny({
    "before.fsEnsureSymlink": cancel,
    "before.fsPathExists": ({ event }) => {
      event.signal.cancel = true
      event.signal.returnValue = true
    },
    "before.fsRemove": cancel,
  })
})

async function run() {
  await events.task({
    argv: [],
    op: "link",
    path: `${__dirname}/fixture`,
  })
}

test("link", async () => {
  const args = []

  events.onAny({
    "before.fsEnsureSymlink": ({ event }) => {
      args.push(event.args[0])
    },
  })

  await run()

  expect(args.length).toBe(8)

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-a/node_modules/project-a/bin`,
    src: `${__dirname}/fixture/project-a/bin`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-b/node_modules/project-a/bin`,
    src: `${__dirname}/fixture/project-a/bin`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-a/node_modules/project-a/dist`,
    src: `${__dirname}/fixture/project-a/dist`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-b/node_modules/project-a/dist`,
    src: `${__dirname}/fixture/project-a/dist`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-a/node_modules/project-b/bin`,
    src: `${__dirname}/fixture/project-b/bin`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-b/node_modules/project-b/bin`,
    src: `${__dirname}/fixture/project-b/bin`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-a/node_modules/project-b/dist`,
    src: `${__dirname}/fixture/project-b/dist`,
  })

  expect(args).toContainEqual({
    dest: `${__dirname}/fixture/project-b/node_modules/project-b/dist`,
    src: `${__dirname}/fixture/project-b/dist`,
  })
})
