export function dryMode({ events, store }) {
  if (!store.get("arg.dry")) {
    return
  }

  events.onAny("before.fs", async ({ action, event }) => {
    if (action !== "pathExists") {
      event.signal.cancel = true
    }
  })
}
