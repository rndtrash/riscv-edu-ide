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
    contentsUri: string;
}

export class FsNodeUpdated extends Event {
    public node: FSNode;

    constructor(node: FSNode) {
        super('fsnode-updated');
        this.node = node;
    }
}

export class FsNodeDeleted extends Event {
    public node: FSNode;

    constructor(node: FSNode) {
        super('fsnode-deleted');
        this.node = node;
    }
}

export abstract class FSNode extends EventTarget {
    public name: string;
    protected changed: number;
    public parent: FSFolder | undefined; // TODO: hide it. I tried setting it to protected but the TS has a problem with that
    private valid: boolean = true;

    protected constructor(name: string, changed?: number, parent?: FSFolder) {
        super();

        this.name = name;
        this.changed = changed ?? Date.now();
        this.parent = parent;
    }

    private AssertValid(): void {
        if (!this.valid)
            throw 'Invalid file';
    }

    public Touch(notify: boolean = true): void {
        this.AssertValid();

        this.changed = Date.now();

        // TODO: should the touch events bubble up?
        // if (this.parent !== undefined)
        //     this.parent.Touch(notify);

        if (notify)
            this.dispatchEvent(new FsNodeUpdated(this));
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

    public FullPath(): string {
        return PATH_PREFIX + [...this.getParentChain(), this].map<string>((f) => f.name).join(PATH_SEPARATOR);
    }

    public async Save(): Promise<void> {
        this.AssertValid();

        let context: string[] = this.getParentChain().map<string>((f) => f.name);

        return this.SaveWithContext(context);
    }

    public Delete(): void {
        if (this.parent !== undefined) {
            const i = this.parent.children.indexOf(this);
            if (i != -1)
                delete this.parent.children[i];
        }

        this.valid = false;
        this.dispatchEvent(new FsNodeDeleted(this));
        this.parent?.dispatchEvent(new FsNodeUpdated(this.parent));
    }

    public abstract SaveWithContext(context: string[]): Promise<void>;
}

export class FSFolder extends FSNode {
    protected _children: FSNode[];

    constructor(name: string, changed?: number, parent?: FSFolder, children?: FSNode[]) {
        super(name, changed, parent);

        this._children = children ?? new Array<FSNode>();
        for (let child of this._children) {
            child.parent = this;
        }
    }

    public get children() {
        return this._children;
    }

    public NewFile(name: string): FSFile {
        const file = new FSFile(name);
        file.parent = this;
        this._children.push(file);
        this.Touch();
        return file;
    }

    public NewFolder(name: string): FSFolder {
        const folder = new FSFolder(name);
        folder.parent = this;
        this._children.push(folder);
        this.Touch();
        return folder;
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
            children: this._children.map<string>((c) => c.name)
        };
        let thisJsonString = JSON.stringify(thisJson);
        if (existingEntryJsonString !== null) {
            let existingEntryJson: IFSFolderJson = JSON.parse(existingEntryJsonString);
            if (existingEntryJson.changed !== thisJson.changed)
                localStorage.setItem(absolutePath, thisJsonString);
        } else {
            localStorage.setItem(absolutePath, thisJsonString);
        }

        for (let child of this._children) {
            await child.SaveWithContext(newContext);
        }
    }
}

export class FSFile extends FSNode {
    private _contents: Uint8Array;

    constructor(name: string, changed?: number | undefined, parent?: FSFolder | undefined, contents?: Uint8Array | undefined) {
        super(name, changed, parent);

        this._contents = contents ?? new Uint8Array(0);
    }

    public get contents(): Uint8Array {
        return this._contents;
    }

    public set contents(contents: Uint8Array) {
        this._contents = contents;
        this.Touch();
    }

    /*
     * Throws an exception if the file is not a valid UTF-8 text
     */
    public get text(): string {
        return new TextDecoder(undefined, {fatal: true}).decode(this._contents);
    }

    public set text(text: string) {
        this.contents = new TextEncoder().encode(text);
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
            contentsUri: await FSFile.bytesToBase64DataUrl(this._contents)
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
                    await (await fetch(fileJson.contentsUri)).arrayBuffer()
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

export async function initializeFS(): Promise<void> {
    if (browser) {
        let rf: FSNode = new FSFolder("");
        try {
            rf = await parseNodesRecursive();
        } catch (e) {
            console.error(e);
        }

        if (!(rf instanceof FSFolder))
            throw `Wrong type of the root node (expected ${typeof FSFolder}, got ${typeof rf})`;

        rootFolder = rf as FSFolder;
    }
}

export async function SaveAll(): Promise<void> {
    return rootFolder.Save();
}

function OpenFile(currentFolder: FSFolder, path: string[], createFile: boolean, createFolders: boolean): FSFile | undefined {
    let nextPathElement = path.shift();
    if (nextPathElement === undefined)
        return undefined;

    // The last element of the path is the file that we need
    if (path.length == 0) {
        for (let child of currentFolder.children) {
            if (child instanceof FSFile && child.name == nextPathElement)
                return child;
        }

        if (!createFile)
            return undefined;

        return currentFolder.NewFile(nextPathElement);
    }

    let nextFolder: FSFolder | undefined = undefined;
    for (let child of currentFolder.children) {
        if (child instanceof FSFolder && child.name == nextPathElement)
            nextFolder = child;
    }
    if (nextFolder === undefined) {
        if (!createFolders || !createFile)
            return undefined;

        nextFolder = currentFolder.NewFolder(nextPathElement);
    }

    return OpenFile(nextFolder, path, createFile, createFolders);
}

export function Open(path: string, createFile: boolean = false, createFolders: boolean = true): FSFile | undefined {
    let pathSplit = path.split(PATH_SEPARATOR);
    if (pathSplit.length == 0 || pathSplit[0] != "" || pathSplit[pathSplit.length - 1] == "")
        return undefined;

    pathSplit.shift();
    return OpenFile(rootFolder, pathSplit, createFile, createFolders);
}

function ExistsNode(currentFolder: FSFolder, path: string[]): boolean {
    let nextPathElement = path.shift();
    if (nextPathElement === undefined)
        return false;

    // The last element of the path is either a file or a folder
    if (path.length == 0) {
        for (let child of currentFolder.children) {
            if (child.name == nextPathElement)
                return true;
        }

        return false;
    }

    let nextFolder: FSFolder | undefined = undefined;
    for (let child of currentFolder.children) {
        if (child instanceof FSFolder && child.name == nextPathElement)
            nextFolder = child;
    }
    if (nextFolder === undefined) {
        return false;
    }

    return ExistsNode(nextFolder, path);
}

export function Exists(path: string): boolean {
    let pathSplit = path.split(PATH_SEPARATOR);
    if (pathSplit.length == 0 || pathSplit[0] != "")
        return false;

    pathSplit.shift();
    return ExistsNode(rootFolder, pathSplit);
}