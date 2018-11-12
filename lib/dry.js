export function dryMode({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || !store.get("argv.dry")) {
    return
  }

  events.onAny("before.fs", async ({ event }) => {
    if (event.props[0] !== "pathExists") {
      event.signal.cancel = true
    }
  })
}
