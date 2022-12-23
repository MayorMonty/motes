import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "../utils/useLocalState";
import { useRouter } from "next/router";
import Link from "next/link";
import { TodoistApi } from "@doist/todoist-api-typescript";

type Note = {
  id: string;
  contents: string;
  createdAt: number;
};

const Home: NextPage = () => {
  const input = useRef<HTMLInputElement>(null);
  const noteContainers = useRef<Record<string, HTMLDivElement | null>>({});
  const router = useRouter();

  const [notes, setNodes] = useLocalStorage<Note[]>("notes", []);
  const [apiKey] = useLocalStorage<string>("options.apiKey", "");
  const [projectId] = useLocalStorage<string | undefined>(
    "options.projectId",
    undefined
  );
  const [sectionId] = useLocalStorage<string | undefined>(
    "options.sectionId",
    undefined
  );

  const api = useMemo(() => {
    if (!apiKey) return null;
    return new TodoistApi(apiKey);
  }, [apiKey]);

  useEffect(() => {
    function onKeyPress(event: KeyboardEvent) {
      // Press n to focus input
      if (event.key === "n") {
        event.preventDefault();
        input.current?.focus();
      }

      if (event.key === "," && event.ctrlKey) {
        event.preventDefault();
        router.push("/options");
      }
    }

    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation();
    if (event.key === "Enter" && event.currentTarget.value) {
      const contents = event.currentTarget.value;
      setNodes((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2, 9),
          contents,
          createdAt: Date.now(),
        },
      ]);
      event.currentTarget.value = "";
    }
  }

  function onNoteKeyDown(index: number) {
    return (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "d") {
        event.stopPropagation();

        const next = notes[index + 1];
        const previous = notes[index - 1];
        setNodes((prev) => prev.filter((_, i) => i !== index));

        // Using set timeout here to wait for the note to be removed from the dom and for react to
        // be rerendered.
        setTimeout(() => {
          if (next) {
            noteContainers.current[next.id]?.focus();
          } else if (previous) {
            noteContainers.current[previous.id]?.focus();
          } else {
            input.current?.focus();
          }
        }, 0);
      } else if (event.key === "t") {
        event.stopPropagation();
        const content = notes[index]?.contents;
        if (content) api?.addTask({ content, projectId, sectionId });
      } else if (event.key === "ArrowDown") {
        event.stopPropagation();
        const next = notes[index + 1];
        if (next) {
          noteContainers.current[next.id]?.focus();
        }
      } else if (event.key === "ArrowUp") {
        event.stopPropagation();
        const previous = notes[index - 1];
        if (previous) {
          noteContainers.current[previous.id]?.focus();
        }
      }
    };
  }

  return (
    <>
      <Head>
        <title>Motes</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <nav className="fixed right-4 top-4 text-white/50">
          <Link href="/options" className="group outline-none hover:border">
            <p className="flex gap-2 rounded-md p-4 group-focus-within:border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Options</span>
            </p>
          </Link>
        </nav>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">MOTES</span>
          </h1>
          <main className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 text-white focus-within:border">
            <h1 className="text-lg">Create Note</h1>
            <input
              ref={input}
              onKeyDown={onInputKeyDown}
              aria-label="Create Note. Press enter to create, and press n to focus this input."
              className="rounded-lg bg-transparent font-mono text-2xl outline-none"
              autoFocus
            ></input>
            <p className="right-4 text-sm text-white/50">
              Press <code className="rounded-md px-2">n</code> to focus.
            </p>
          </main>
          <section className="container flex flex-col gap-4" role="list">
            {notes.map((note, i) => (
              <div
                key={note.id}
                ref={(el) => (noteContainers.current[note.id] = el)}
                className="group flex items-center gap-4 rounded-lg bg-white/10 p-4 outline-none hover:shadow-lg focus:border"
                tabIndex={0}
                aria-label={`Note: ${note.contents} ${new Date(
                  note.createdAt
                ).toLocaleTimeString()} Press d to delete, and press t to send to todoist. Use arrow keys or tab to navigate.`}
                role="listitem"
                onKeyDown={onNoteKeyDown(i)}
              >
                <p className="font-mono text-sm text-white text-opacity-75">
                  {new Date(note.createdAt).toLocaleTimeString()}
                </p>
                <p className="font-mono text-xl text-white outline-none ">
                  {note.contents}
                </p>
                <nav className="ml-auto flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <p className="mx-2 rounded-md border border-white/50 px-4 text-white">
                    <code className="rounded-md pr-2">d</code>
                    Delete
                  </p>
                  <p className="mx-2 rounded-md border border-white/50 px-4 text-white">
                    <code className="rounded-md pr-2">t</code>
                    Todoist
                  </p>
                </nav>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
