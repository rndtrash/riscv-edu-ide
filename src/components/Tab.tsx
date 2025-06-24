import { FunctionComponent } from 'preact';
import style from './Tab.module.css';

export interface ITab {
    uri: string;
    editor: FunctionComponent<any>;
    context: any;
}

export function Tab(props: { active?: boolean, onClick: () => void, onClose: () => void, title: string }) {
    const active = props.active ?? false;
    return (
        <div class={`${style.tab} ${active ? style.active : ''}`} onClick={props.onClick}>
            <span>{props.title}</span>
            <button onClick={(e) => {
                e.stopPropagation();
                props.onClose();
            }}>X</button>
        </div>
    );
}