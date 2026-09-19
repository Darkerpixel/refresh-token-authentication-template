"use client";

import { useState } from "react";
import { saveNote } from "../actions";

const CreateNote = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState<boolean | null>(null);

  const handleAction = async () => {
    setMessage(null);
    setLoading(true);
    const result = await saveNote(title, content);
    setLoading(false);
    setMessage(result.message);
    setSuccess(result.success);
  };

  return (
    <>
      <div style={{ marginTop: "1rem" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content..."
        />
        <button onClick={handleAction}>Save Note</button>
        {loading && <p>Loading...</p>}
        {message && <p>{message}</p>}
        {success !== null && (
          <p style={{ color: success ? "green" : "red" }}>
            {success ? "Success" : "Failed"}
          </p>
        )}
      </div>
    </>
  );
};

export default CreateNote;
