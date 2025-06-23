import { useProject } from "src/components/ProjectContext";
import { FileBrowser } from "src/components/sidebars/FileBrowser";
import { useFileSystem } from "src/components/FileSystemContext";
import { SideBar } from "./SideBar";
import { useEffect, useState } from "preact/hooks";

export function FileBrowserSideBar() {
    const projectContext = useProject();

    return (
        <SideBar title="PROJECT FILES" isLeftSide={true}>
            {projectContext.projectFolder && <FileBrowser dirHandle={projectContext.projectFolder} />}
        </SideBar>
    );
}