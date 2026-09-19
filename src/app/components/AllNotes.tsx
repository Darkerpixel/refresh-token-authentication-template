import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteNote from "./components/delete-note";

export default async function AllNotes() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;
  const user = await prisma.user.findUnique({
    where: { id: currentUser },
  });
  if (!user) return null;
  const notes = currentUser
    ? await prisma.note.findMany({ where: { userId: currentUser } })
    : [];
  return (
    <>
      <p>{currentUser ? `Logged in as ${user.email}` : "Not logged in"}</p>
      {notes.map((note) => (
        <div key={note.id} style={{ marginTop: "1rem" }}>
          <p>{note.title}</p>
          <p>{note.content}</p>
          <DeleteNote noteId={note.id} />
        </div>
      ))}
    </>
  );
}
