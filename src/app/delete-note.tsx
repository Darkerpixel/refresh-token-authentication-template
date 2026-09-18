"use client";

import { useActionState } from "react";
import { deleteNote } from "./actions";

export default function DeleteNote({ noteId }: { noteId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const id = formData.get("noteId");

      if (typeof id !== "string" || !id) {
        return { success: false, message: "No note selected" };
      }

      return deleteNote(id);
    },
    null,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="noteId" value={noteId} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete Note"}
      </button>
      {state && !state.success && <p>{state.message}</p>}
    </form>
  );
}
