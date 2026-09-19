"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { createSession, getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

function ok(message: string) {
  return { success: true, message: message };
}

function fail(message: string) {
  return { success: false, message: message };
}

export async function signup(email: string, password: string) {
  try {
    if (!email || !password) {
      return fail("Email or password not provided");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { email, passwordHash } });

    await createSession(user.id);

    return ok("Account created");
  } catch (error) {
    console.log(error);
    return fail("Could not create account");
  }
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    return fail("Email or password not provided");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("user doesn't exist => null");
      return fail("Email or password incorrect");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      console.log("password incorrect");
      return fail("Email or password incorrect");
    }

    await createSession(user.id);

    return ok("Logged in");
  } catch (error) {
    console.log(error);
    return fail("An error occurred");
  }
}

export async function saveNote(title: string, content: string) {
  const userId = await getCurrentUser();

  if (!userId) {
    return fail("You must be logged in to save this note");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !can(user.role, "note:create")) {
    return fail("unauthorized action");
  }

  try {
    await prisma.note.upsert({
      where: { userId_title: { userId, title } },
      update: { content },
      create: { title, content, userId },
    });
    revalidatePath("/");
    return ok("Note saved");
  } catch (error) {
    console.log(error);
    return fail("Something went wrong");
  }
}

export async function deleteNote(noteId: string) {
  const userId = await getCurrentUser();
  if (!userId) return fail("You must be logged in to delete this note");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return fail("You must be logged in to delete this note");

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return fail("Selected note not found");

  if (
    (can(user.role, "note:delete:own") && note.userId === user.id) ||
    can(user.role, "note:delete:any")
  ) {
    try {
      await prisma.note.delete({ where: { id: noteId } });
      revalidatePath("/");
      return ok("Note deleted");
    } catch (error) {
      console.log(error);
      return fail("Could not delete note");
    }
  } else return fail("unauthorized action");
}
