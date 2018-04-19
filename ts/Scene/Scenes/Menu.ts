class Menu extends Scene {
    
    public Load(): void {
        this.main.innerHTML = `
            <button>New game</button>
        `;

        this.$("button").addEventListener("click", function() {
            LoadPanel("start/1").then(function(game) {
                SceneManager.ChangeScene(new InGame(game));
            });
            //SceneManager.ChangeScene(new InGame(new Panel(1, 0)));
        });

        LoadPanel("start/2").then(function(game) {
            SceneManager.ChangeScene(new InGame(game));
        });
    }

    public Unload(): void {
        this.main.innerHTML = ``;
    }

    public Resize(): void {
    }

}