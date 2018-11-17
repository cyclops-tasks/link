const prettyPath = /[^/]+\/[^/]+$/

export function output({ action, dest, src }) {
  if (action === "ensureSymlink") {
    // eslint-disable-next-line no-console
    console.log(
      src.match(prettyPath)[0],
      "->",
      dest.match(prettyPath)[0]
    )
  }
}
