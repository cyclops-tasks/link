export function dryMode({ events, store }) {
  if (!store.get("argv.opts.dry")) {
    return
  }

  const cancel = ({ event }) => (event.signal.cancel = true)

  events.onAny("before.fsEnsureSymlink", cancel)
  events.onAny("before.fsRemove", cancel)
}
