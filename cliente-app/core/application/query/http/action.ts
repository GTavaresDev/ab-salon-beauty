import type { Either } from "@core/application/query/common/either";

export type ActionError<T = string> = {
  success: false;
  error: T;
  data?: never;
};

export type ActionSuccess<T, Meta extends object = object> = {
  success: true;
  data?: T;
  error?: never;
} & Meta;

export type ActionResult<T, E = string, Meta extends object = object> =
  | ActionSuccess<T, Meta>
  | ActionError<E>;

/** Converte um Either interno em uma resposta JSON serializável de Server Action. */
export function toActionResult<E extends { message: string }, A>(
  result: Either<E, A>,
): ActionResult<A, string> {
  return result.tag === "right"
    ? { success: true, data: result.value }
    : { success: false, error: result.value.message };
}
