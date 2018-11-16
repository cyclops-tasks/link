import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"
import link from "../dist/link"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  cyclops({ events, store })

  events.onAny({
    "before.fs": async ({
      ensureSymlink,
      event,
      pathExists,
      remove,
    }) => {
      if (ensureSymlink || pathExists || remove) {
        event.signal.cancel = true
      }

      if (pathExists) {
        await store.set(event.props, { exists: true })
      }
    },
  })
})

async function run() {
  await events.cyclops({
    argv: [],
    composer: link,
    op: "link",
    path: `${__dirname}/fixture`,
  })
}

test("link", async () => {
  const args = []

  events.onAny({
    "before.fs": ({ ensureSymlink, event }) => {
      if (ensureSymlink) {
        args.push(event.args[0])
      }
    },
  })

  await run()

  expect(args).toEqual([
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-a/bin`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-a/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-a/bin`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-a/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-a/dist`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-a/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-a/dist`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-a/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-b/bin`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-b/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-b/bin`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-b/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-b/dist`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-b/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-b/dist`,
      ensureSymlink: true,
      src: `${__dirname}/fixture/project-b/dist`,
    },
  ])
})
