export function dryMode({ events, store }) {
  if (!store.get("argv.opts.dry")) {
    return
  }

  events.onAny("before.fs", async ({ action, event }) => {
    if (action !== "pathExists") {
      event.signal.cancel = true
    }
  })
}
