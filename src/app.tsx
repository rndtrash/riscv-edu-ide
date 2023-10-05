//import { useState } from 'preact/hooks'
//import preactLogo from './assets/preact.svg'
//import viteLogo from '/vite.svg'
import './app.css'
import SideBar from "./sidebar.tsx";

// import Editor from '@monaco-editor/react' // <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />

export function App() {
    //const [count, setCount] = useState(0)

    return (
        <>
            <SideBar buttonsTopGroup={[{
                name: "Code",
                icon: "",
                onClick: (active: boolean) => console.log(`clicked! ${active}`)
            }]} buttonsBottomGroup={[{
                name: "Logs",
                icon: "",
                onClick: (active: boolean) => console.log(`logs clicked! ${active}`)
            }]}/>
        </>
    )
}
