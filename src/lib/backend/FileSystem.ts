import {browser} from '$app/environment';

const PATH_SEPARATOR: string = "/";
const PATH_PREFIX: string = "file:";

interface IFSNodeJson {
    type: string;
    name: string;
    changed: number;
}

interface IFSFolderJson extends IFSNodeJson {
    children: string[];
}

interface IFSFileJson extends IFSNodeJson {
    contentsBase64: string;
}

export abstract class FSNode {
    public name: string;
    protected changed: number;
    public parent: FSFolder | undefined; // TODO: hide it. I tried setting it to protected but the TS has a problem with that

    protected constructor(name: string, changed?: number, parent?: FSFolder) {
        this.name = name;
        this.changed = changed ?? Date.now();
        this.parent = parent;
    }

    private getParentChain(): FSFolder[] {
        let chain: FSFolder[] = new Array<FSFolder>();

        let currentParent: FSFolder | undefined = this.parent;
        while (currentParent !== undefined) {
            chain = [currentParent, ...chain];
            currentParent = currentParent.parent;
        }

        return chain;
    }

    private buildFullPath(): string {
        return PATH_PREFIX + this.getParentChain().map<string>((f) => f.name).join(PATH_SEPARATOR);
    }

    public Save(): void {
        let context: string[] = this.getParentChain().map<string>((f) => f.name);

        this.SaveWithContext(context);
    }

    public abstract SaveWithContext(context: string[]): Promise<void>;
}

export class FSFolder extends FSNode {
    protected children: FSNode[];

    constructor(name: string, changed?: number, parent?: FSFolder, children?: FSNode[]) {
        super(name, changed, parent);

        this.children = children ?? new Array<FSNode>();
        for (let child of this.children) {
            child.parent = this;
        }
    }

    public async SaveWithContext(context: string[]): Promise<void> {
        let newContext = [...context, this.name];
        let absolutePath = PATH_PREFIX + newContext.join(PATH_SEPARATOR);

        // Updating the JSON for this node
        let existingEntryJsonString = localStorage.getItem(absolutePath);
        let thisJson: IFSFolderJson = {
            type: "folder",
            name: this.name,
            changed: this.changed,
            children: this.children.map<string>((c) => c.name)
        };
        let thisJsonString = JSON.stringify(thisJson);
        if (existingEntryJsonString !== null) {
            let existingEntryJson: IFSNodeJson = JSON.parse(existingEntryJsonString);
            if (existingEntryJson.changed !== thisJson.changed)
                localStorage.setItem(absolutePath, thisJsonString);
        } else {
            localStorage.setItem(absolutePath, thisJsonString);
        }

        for (let child of this.children) {
            await child.SaveWithContext(newContext);
        }
    }
}

export class FSFile extends FSNode {
    private contents: Uint8Array;

    constructor(name: string, changed?: number | undefined, parent?: FSFolder | undefined, contents?: Uint8Array | undefined) {
        super(name, changed, parent);

        this.contents = contents ?? new Uint8Array(0);
    }

    protected static async bytesToBase64DataUrl(bytes: Uint8Array, type = "application/octet-stream"): Promise<string> {
        return await new Promise((resolve, reject) => {
            const reader = Object.assign(new FileReader(), {
                onload: () => resolve(reader.result?.toString() ?? ""),
                onerror: () => reject(reader.error),
            });
            reader.readAsDataURL(new File([bytes], "", {type}));
        });
    }

    public async SaveWithContext(context: string[]): Promise<void> {
        let newContext = [...context, this.name];
        let absolutePath = PATH_PREFIX + newContext.join(PATH_SEPARATOR);

        // Updating the JSON for this node
        let existingEntryJsonString = localStorage.getItem(absolutePath);
        if (existingEntryJsonString !== null) {
            let existingEntryJson: IFSNodeJson = JSON.parse(existingEntryJsonString);
            if (existingEntryJson.changed === this.changed)
                return;
        }

        let thisJson: IFSFileJson = {
            type: "file",
            name: this.name,
            changed: this.changed,
            contentsBase64: await FSFile.bytesToBase64DataUrl(this.contents)
        };
        let thisJsonString = JSON.stringify(thisJson);
        localStorage.setItem(absolutePath, thisJsonString);
    }
}

async function parseNodesRecursive(path: string = PATH_PREFIX): Promise<FSNode> {
    let nodeJson: IFSFolderJson = JSON.parse(localStorage.getItem(path) ?? "{}");
    switch (nodeJson.type) {
        case "folder": {
            let folderJson: IFSFolderJson = nodeJson as unknown as IFSFolderJson;

            let children: FSNode[] = new Array<FSNode>();
            for (let childName of folderJson.children) {
                let newPath = path + PATH_SEPARATOR + childName;
                children.push(await parseNodesRecursive(newPath));
            }

            // The folder construct will set the parent of the children
            return new FSFolder(folderJson.name, folderJson.changed, undefined, children);
        }

        case "file": {
            let fileJson: IFSFileJson = nodeJson as unknown as IFSFileJson;
            // https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer#comment124033543_49273187
            return new FSFile(
                fileJson.name,
                fileJson.changed,
                undefined,
                new Uint8Array(
                    await (await fetch("data:application/octet;base64," + fileJson.contentsBase64)).arrayBuffer()
                )
            );
        }

        default: {
            throw `Unknown FS node type ${nodeJson.type} at "${path}"`;
        }
    }
}

// Get the root folder
export let rootFolder: FSFolder;
(async () => {
    if (browser) {
        let rf: FSNode | undefined = undefined;
        try {
            rf = await parseNodesRecursive();
        } catch (e) {
            console.error(e);
        }

        if (rf === undefined) {
            rootFolder = new FSFolder("");
            rootFolder.Save();
        } else {
            if (rf instanceof FSFolder)
                rootFolder = rf;
            else
                throw `Wrong type of the root node (expected ${typeof FSFolder}, got ${typeof rf})`;
        }
    }
})();

export function SaveAll() {
    rootFolder.Save();
}