import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../utils/useLocalState";
import Link from "next/link";
import {
  TodoistApi,
  type Project,
  type Section,
} from "@doist/todoist-api-typescript";

const Options: NextPage = () => {
  const [apiKey, setApiKey] = useLocalStorage<string>("options.apiKey", "");
  const [projectId, setProjectId] = useLocalStorage<string>(
    "options.projectId",
    ""
  );
  const [sectionId, setSectionId] = useLocalStorage<string>(
    "options.sectionId",
    ""
  );

  const api = useMemo(() => {
    if (!apiKey) return null;
    return new TodoistApi(apiKey);
  }, [apiKey]);

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  useEffect(() => {
    if (!api) return;
    api.getProjects().then(async (projects) => {
      setProjectList(projects);

      const projectSections = await Promise.all(
        projects.map(async (project) => ({
          id: project.id,
          sections: await api.getSections(project.id),
        }))
      );

      const sectionsMap: Record<string, Section[]> = {};
      for (const { id, sections } of projectSections) {
        sectionsMap[id] = sections;
      }

      setSections(sectionsMap);
    });
  }, [apiKey, api]);

  return (
    <>
      <Head>
        <title>Motes - Options</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16">
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">Options</span>
          </h1>
          <section className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 text-white focus-within:border">
            <h1 className="text-lg">Todoist Key</h1>
            <input
              aria-label="Todoist API Key"
              id="options.apiKey"
              className="rounded-lg bg-transparent font-mono text-xl outline-none"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            ></input>
            <label
              htmlFor="options.apiKey"
              className="right-4 text-sm text-white/50"
            >
              Used to sync notes with Todoist. You can find your API Key in
              Settings → Integrations → Developer. Your key is stored locally on
              this device.
            </label>
          </section>
          <section className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 text-white focus-within:border">
            <h1 className="text-lg">Todoist Project</h1>
            <select
              aria-label="Todoist Project"
              id="options.project"
              className="w-min rounded-lg bg-transparent pr-4 font-mono text-xl outline-none"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projectList.map((project) => (
                <option
                  value={project.id}
                  label={project.name}
                  key={project.id}
                />
              ))}
            </select>
            <label
              htmlFor="options.project"
              className="right-4 text-sm text-white/50"
            >
              When tasks are sent to Todoist, they will be added to this
              project.
            </label>
          </section>
          <section className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 text-white focus-within:border">
            <h1 className="text-lg">Todoist Section</h1>
            <select
              aria-label="Todoist Project"
              id="options.project"
              className="w-min rounded-lg bg-transparent pr-4 font-mono text-xl outline-none"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={!projectId || !sections[projectId]}
            >
              {sections[projectId]?.map((project) => (
                <option
                  value={project.id}
                  label={project.name}
                  key={project.id}
                />
              ))}
            </select>
            <label
              htmlFor="options.project"
              className="right-4 text-sm text-white/50"
            >
              When tasks are sent to Todoist, they will be added to this
              project.
            </label>
          </section>
          <section className="w-full">
            <Link
              href="/"
              className="flex w-max flex-col rounded-md bg-white/10 p-4 px-8
                text-white focus-within:border"
            >
              Back
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};
export default Options;
