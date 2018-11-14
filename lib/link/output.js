export function output(event) {
  if (
    event.op === "fs" &&
    event.props[0] === "ensureSymlink"
  ) {
    return event.props.slice(0, 4).join(" ")
  }
}
