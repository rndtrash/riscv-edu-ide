import {Component, ComponentChild, RenderableProps} from "preact";
import "./sidebar.css";

type SideBarCallback = (active: boolean) => void;

type SideBarButton = {
    name: string,
    icon: string,
    onClick: SideBarCallback
};

type SideBarProps = {
    buttonsTopGroup: SideBarButton[] | undefined,
    buttonsBottomGroup: SideBarButton[] | undefined
};

type SideBarState = {
    buttons: Record<string, boolean>
};

export default class SideBar extends Component<SideBarProps, SideBarState> {
    constructor(props: SideBarProps) {
        super(props);

        var buttonStates: Record<string, boolean> = {};
        props.buttonsBottomGroup?.forEach((b) => buttonStates[b.name] = false);
        this.state = {buttons: buttonStates};
    }

    toggleButton(button: SideBarButton): void {
        var buttonStates = this.state?.buttons!;
        var newState = !buttonStates[button.name];
        this.setButton(button, newState);
    }

    setButton(button: SideBarButton, state: boolean) {
        var buttonStates = this.state?.buttons!;
        buttonStates[button.name] = state;
        this.setState({buttons: buttonStates});
        button.onClick(state);
    }

    render(props: RenderableProps<SideBarProps> | undefined, state: Readonly<SideBarState> | undefined, context: any): ComponentChild {
        return (
            <div id="sidebar">
                {
                    props?.buttonsTopGroup?.map((b: SideBarButton) =>
                        (<button class={state?.buttons[b.name] ? "active" : ""}
                                 onClick={() => this.toggleButton(b)}>{b.name} {b.icon}</button>)
                    )
                }
                <div class="separator"/>
                {
                    props?.buttonsBottomGroup?.map((b: SideBarButton) =>
                        (<button class={state?.buttons[b.name] ? "active" : ""}
                                 onClick={() => this.toggleButton(b)}>{b.name} {b.icon}</button>)
                    )
                }
            </div>
        );
    }
}