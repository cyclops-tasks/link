import cyclops from "cyclops"
import dotEvent from "dot-event"
import dotStore from "dot-store"
import link from "../dist/link"

let events, store

function cancelEvent({ event }) {
  event.signal.cancel = true
}

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  cyclops({ events, store })

  events.onAny({
    "before.fs.ensureSymlink": cancelEvent,
    "before.fs.pathExists": async ({ event }) => {
      cancelEvent({ event })

      await store.set(
        ["fs", ...event.props, "exists"],
        true
      )
    },
    "before.fs.remove": cancelEvent,
  })
})

async function run() {
  await events.cyclops({
    argv: [],
    composer: link,
    path: `${__dirname}/fixture`,
    task: "link-tasks",
  })
}

test("link", async () => {
  const args = []
  events.onAny({
    "before.fs.ensureSymlink": ({ event }) =>
      args.push(event.args[0]),
  })
  await run()
  expect(args).toEqual([
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-a/bin`,
      src: `${__dirname}/fixture/project-a/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-a/bin`,
      src: `${__dirname}/fixture/project-a/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-a/dist`,
      src: `${__dirname}/fixture/project-a/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-a/dist`,
      src: `${__dirname}/fixture/project-a/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-b/bin`,
      src: `${__dirname}/fixture/project-b/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-b/bin`,
      src: `${__dirname}/fixture/project-b/bin`,
    },
    {
      dest: `${__dirname}/fixture/project-a/node_modules/project-b/dist`,
      src: `${__dirname}/fixture/project-b/dist`,
    },
    {
      dest: `${__dirname}/fixture/project-b/node_modules/project-b/dist`,
      src: `${__dirname}/fixture/project-b/dist`,
    },
  ])
})
