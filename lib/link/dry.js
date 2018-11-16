export function dryMode({ events, store }) {
  if (!store.get("argv.dry")) {
    return
  }

  events.onAny(
    "before.fs",
    async ({ event, pathExists }) => {
      if (!pathExists) {
        event.signal.cancel = true
      }
    }
  )
}
