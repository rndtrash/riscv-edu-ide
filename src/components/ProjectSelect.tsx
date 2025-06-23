import projectIcon from "src/assets/project.svg";
import style from "./ProjectSelect.module.css";
import { useProject } from "./ProjectContext";
import { useFileSystem } from "./FileSystemContext";
import { useEffect, useState } from "preact/hooks";

export function ProjectSelect() {
    const projectContext = useProject();
    const fs = useFileSystem();

    const [projectsList, setProjectsList] = useState<string[]>([]);
    useEffect(() => {
        (async () => {
            const folders = [];
            console.log("iterating folders");
            for await (const [name, handle] of fs.rootDir.entries()) {
                console.log(name);
                if (handle.kind == "directory") {
                    folders.push(name);
                }
            }
            setProjectsList(folders);
        })();
    }, [projectContext.projectFolder]);

    console.log(projectsList);
    return (
        <div class={style.projectSel}>
            <img src={projectIcon} />
            <select defaultValue="new-project" value={projectContext.projectName} onChange={(e) => {
                const select = e.target as HTMLSelectElement;
                let value = select.value;
                if (value === "") {
                    value = prompt("Введите название нового проекта:", "new-project");
                }
                projectContext.setProjectName(value);
            }}>
                <option value="">Create New Project</option>
                <option disabled>----------</option>
                {projectsList.map((name) => <option>{name}</option>)}
            </select>
        </div>
    );
}