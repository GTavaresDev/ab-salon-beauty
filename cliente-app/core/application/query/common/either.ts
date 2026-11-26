export type Left<E> = {
  readonly tag: "left";
  readonly value: E;
  isSuccess(): false;
  isFailure(): true;
};

export type Right<A> = {
  readonly tag: "right";
  readonly value: A;
  isSuccess(): true;
  isFailure(): false;
};

export type Either<E, A> = Left<E> | Right<A>;

export function success<A>(value: A): Right<A> {
  return { tag: "right", value, isSuccess: () => true, isFailure: () => false };
}

export function failure<E>(value: E): Left<E> {
  return { tag: "left", value, isSuccess: () => false, isFailure: () => true };
}

export function isSuccess<E, A>(result: Either<E, A>): result is Right<A> {
  return result.tag === "right";
}

export function isFailure<E, A>(result: Either<E, A>): result is Left<E> {
  return result.tag === "left";
}
