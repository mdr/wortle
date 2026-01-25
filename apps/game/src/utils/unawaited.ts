export const unawaited = (value: PromiseLike<unknown>): void => {
  void value
}
