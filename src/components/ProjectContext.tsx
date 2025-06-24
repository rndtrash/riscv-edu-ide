import { ComponentChildren, createContext } from "preact";
import { Dispatch, StateUpdater, useContext, useEffect, useState } from "preact/hooks";
import { useFileSystem } from "src/components/FileSystemContext";
import { MakeADD, MakeADDI, MakeNOP, MakeSW, MakeJ } from "src/backend/Assembler/Instructions";
import { IProjectJson, Project, PROJECT_EXTENSION } from "src/backend/ProjectManager";
import { BuildStage, ProjectBuilder } from "src/backend/BuildSystem/ProjectBuilder";

export interface ProjectContextType {
    projectName: string;
    setProjectName: Dispatch<StateUpdater<string>>;
    project: Project;
    projectFolder: FileSystemDirectoryHandle;
};

const ProjectContext = createContext<ProjectContextType>({
    projectName: 'new-project',
    project: null,
    setProjectName: null,
    projectFolder: null
});

const EXAMPLE_ASSEMBLY = `
.offset 0x0

# Выводит число 8 в регистр 1
test:
    addi x1, x0, 10
    # beq x1, x0, 4
    addi x1, x1, -2
    loop: jal x0, 0
`;

export function ProjectProvider({ children }: { children: ComponentChildren }) {
    const [projectName, setProjectName] = useState<string>('new-project');
    const [projectFolder, setProjectFolder] = useState<FileSystemDirectoryHandle>(null);
    const [project, setProject] = useState<Project>(null);

    const fs = useFileSystem();
    useEffect(() => {
        (async () => {
            let tempProjectFolder: FileSystemDirectoryHandle;
            try {
                tempProjectFolder = await fs.rootDir.getDirectoryHandle(projectName);
            } catch (ex: any) {
                if (ex instanceof DOMException && ex.name == "NotFoundError") {
                    tempProjectFolder = await fs.rootDir.getDirectoryHandle(projectName, { create: true });

                    async function writeFile(fileName: string, fileContent: string) {
                        const fileHandle = await tempProjectFolder.getFileHandle(fileName, { create: true });
                        const fileWritable = await fileHandle.createWritable();
                        const fileWriter = fileWritable.getWriter();
                        await fileWriter.ready;
                        const textEncoder = new TextEncoder();
                        const chunks = textEncoder.encode(fileContent);
                        await fileWriter.write(chunks);
                        await fileWriter.ready;
                        fileWriter.releaseLock();
                        await fileWritable.close();
                    }

                    const json = JSON.stringify({
                        systemConfiguration: {
                            master: {
                                name: "rv32",
                                context: null
                            },
                            devices: [
                                {
                                    name: "consolelog",
                                    context: null
                                }, {
                                    name: "ram32",
                                    context: { address: 128, size: 128 }
                                }, {
                                    name: "rom32",
                                    context: {
                                        address: 0,
                                        contents: [
                                            MakeNOP(),
                                            MakeADDI(0, 1, 40),
                                            MakeADDI(0, 2, 2),
                                            MakeADD(1, 2, 3),
                                            MakeSW(0, 3, 128),
                                            MakeJ(0),
                                            ...Array(4 * 16) // Reserve some space
                                        ],
                                        readOnly: true
                                    }
                                }
                            ]
                        },
                        projectBuilder: (new ProjectBuilder([
                            // TODO:
                            new BuildStage("run", ["main.s"], ["main.s.o"], [])
                        ])).toJSON()
                    } as IProjectJson);
                    await writeFile(PROJECT_EXTENSION, json);
                    await writeFile("main.s", EXAMPLE_ASSEMBLY);
                }
            }

            const projectJsonHandle = await tempProjectFolder.getFileHandle(PROJECT_EXTENSION);
            const projectJsonFile = await projectJsonHandle.getFile();
            const projectJson = JSON.parse(await projectJsonFile.text()) as IProjectJson;
            const proj = Project.FromJSON(projectJson);

            setProjectFolder(tempProjectFolder);
            setProject(proj);
        })();
    }, [projectName]);

    return (
        <ProjectContext.Provider value={{ projectName, setProjectName, projectFolder, project }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    return useContext(ProjectContext);
}