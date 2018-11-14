export function dryMode({ events, store, taskId }) {
  const { taskIndex } = store.get(`cyclops.tasks.${taskId}`)

  if (taskIndex > 0 || !store.get("argv.dry")) {
    return
  }

  events.onAny("before.fs", async ({ event }) => {
    if (event.props[0] !== "pathExists") {
      event.signal.cancel = true
    }
  })
}
