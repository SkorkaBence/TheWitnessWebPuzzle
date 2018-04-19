class SceneManager {

    private static currentScene : Scene|null = null;

    public static Init() : void {
        const __this = this;

        window.addEventListener("resize", function() {
            __this.Resize();
        });
    }

    public static ChangeScene(newScene : Scene) : void {
        if (this.currentScene != null) {
            this.currentScene.Unload();
        }

        this.currentScene = newScene;

        this.currentScene.Load();
    }

    private static Resize() : void {
        if (this.currentScene != null) {
            this.currentScene.Resize();
        }
    }

}