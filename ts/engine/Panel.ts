interface Size {
    width : number;
    height : number;
}

function LoadPanel(filename : string) : Promise<Panel> {
    return fetch("levels/" + filename + ".json").then(function(rawdata) {
        return rawdata.json();
    }).then(function(jdata) {
        let p = new Panel(0, 0);
        p.LoadSerializedData(jdata);
        return p;
    });
}

class Panel implements Serializable {

    private width : number;
    private height : number;

    public Grid : GridCell[][] = [];

    constructor(w : number, h : number) {
        this.width = w;
        this.height = h;

        this.ResetGrid();
        this.UpdateConnections();

        this.Grid[w][h].UpLeftCorner.type = IntersectType.StartPoint;
    }

    private ResetGrid() : void {
        for (let x = 0; x <= this.width; ++x) {
            this.Grid[x] = [];
            for (let y = 0; y <= this.height; ++y) {
                this.Grid[x][y] = new GridCell();

                if (x == this.width) {
                    this.Grid[x][y].UpperLine.type = LineType.NoLine;
                }
                if (y == this.height) {
                    this.Grid[x][y].LeftLine.type = LineType.NoLine;
                }
            }
        }
    }

    private UpdateConnections() : void {
        for (let x = 0; x <= this.width; ++x) {
            for (let y = 0; y <= this.height; ++y) {
                let HasConnections = false;

                const l1 = this.Grid[x][y].UpperLine.type;
                this.Grid[x][y].PossibleDirections.Right = l1 == LineType.Filled || l1 == LineType.Broken;
                HasConnections = HasConnections || this.Grid[x][y].PossibleDirections.Right;

                const l2 = this.Grid[x][y].LeftLine.type;
                this.Grid[x][y].PossibleDirections.Down = l2 == LineType.Filled || l2 == LineType.Broken;
                HasConnections = HasConnections || this.Grid[x][y].PossibleDirections.Down;

                if (x > 0) {
                    const l3 = this.Grid[x - 1][y].UpperLine.type;
                    this.Grid[x][y].PossibleDirections.Left = l3 == LineType.Filled || l3 == LineType.Broken;
                    HasConnections = HasConnections || this.Grid[x][y].PossibleDirections.Left;
                } else {
                    this.Grid[x][y].PossibleDirections.Left = false;
                }

                if (y > 0) {
                    const l4 = this.Grid[x][y - 1].LeftLine.type;
                    this.Grid[x][y].PossibleDirections.Up = l4 == LineType.Filled || l4 == LineType.Broken;
                    HasConnections = HasConnections || this.Grid[x][y].PossibleDirections.Up;
                } else {
                    this.Grid[x][y].PossibleDirections.Up = false;
                }

                this.Grid[x][y].HasConnections = HasConnections;
            }
        }
    }

    public GetSize() : Size {
        return {
            width: this.width,
            height: this.height
        };
    }

    public Serialize() : any {
        let grid : any[][] = [];

        for (let x = 0; x <= this.width; ++x) {
            grid[x] = [];
            for (let y = 0; y <= this.height; ++y) {
                grid[x][y] = this.Grid[x][y].Serialize();
            }
        }

        return {
            width: this.width,
            height: this.height,
            grid: grid
        };
    }

    LoadSerializedData(obj: any): void {
        this.width = obj.width;
        this.height = obj.height;

        this.ResetGrid();

        for (let x = 0; x <= this.width; ++x) {
            for (let y = 0; y <= this.height; ++y) {
                this.Grid[x][y].LoadSerializedData(obj.grid[x][y]);
            }
        }

        this.UpdateConnections();
    }

}