const prettyPath = /[^/]+\/[^/]+$/

export function output({ ensureSymlink, dest, src }) {
  if (ensureSymlink) {
    // eslint-disable-next-line no-console
    console.log(
      src.match(prettyPath)[0],
      "->",
      dest.match(prettyPath)[0]
    )
  }
}
