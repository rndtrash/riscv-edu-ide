import projectIcon from "src/assets/project.svg";
import style from "./ProjectSelect.module.css";

export function ProjectSelect() {
    return (
        <div class={style.projectSel}>
            <img src={projectIcon}/>
            <select>
                <option>First Project</option>
            </select>
        </div>
    );
}