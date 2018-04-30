abstract class Scene {

    protected main : HTMLElement;

    constructor() {
        const m = document.querySelector("main");
        if (m === null) {
            console.error("Missing main");
        }
        this.main = (m as HTMLElement);
    }

    protected $(e : string) : HTMLElement {
        return ((this.main as HTMLElement).querySelector(e) as HTMLElement);
    }

    protected $$(e : string) : NodeListOf<Element> {
        return (this.main as HTMLElement).querySelectorAll(e);
    }

    public abstract Load() : void;
    public abstract Unload() : void;
    public abstract Resize() : void;

}