"use client";

import { useActionState } from "react";
import { signup } from "./actions";

type SignupState = { success: boolean; message: string | null } | null;

async function signupAction(
  _previousState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return await signup(email, password);
}

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <>
      <form action={formAction}>
        <input type="email" name="email" placeholder="example@mail.com" />
        <input type="password" name="password" placeholder="******" />
        <button type="submit" disabled={isPending}>
          {isPending ? "Signing up..." : "Signup"}
        </button>
      </form>
      {state && (
        <p style={{ color: state.success ? "green" : "red" }}>
          {state.message}
        </p>
      )}
    </>
  );
}
