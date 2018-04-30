class Line implements Serializable {
    public type : LineType = LineType.Filled;

    Serialize() : any {
        return {
            type: this.type
        };
    }
    LoadSerializedData(obj: any): void {
        this.type = obj.type;
    }
}

class IntersetionElement implements Serializable {
    public type : IntersectType = IntersectType.None;

    Serialize(): any {
        return {
            type: this.type
        };
    }
    LoadSerializedData(obj: any): void {
        this.type = obj.type;
    }
}

class GridElement implements Serializable {

    public type : GridContentType = GridContentType.None;

    Serialize(): any {
        return {
            type: this.type
        };
    }
    LoadSerializedData(obj: any): void {
        this.type = obj.type;
    }
}

class GridCell implements Serializable {
    public UpperLine : Line = new Line();
    public LeftLine : Line = new Line();
    public UpLeftCorner : IntersetionElement = new IntersetionElement();
    public Cell : GridElement = new GridElement();
    public HasConnections : boolean = false;

    public PossibleDirections : DirectionBools = {
        Up: false,
        Right: false,
        Down: false,
        Left: false
    };

    Serialize(): any {
        return {
            UpperLine: this.UpperLine.Serialize(),
            LeftLine: this.LeftLine.Serialize(),
            UpLeftCorner: this.UpLeftCorner.Serialize(),
            Cell: this.Cell.Serialize()
        };
    }

    LoadSerializedData(obj: any): void {
        this.UpperLine.LoadSerializedData(obj.UpperLine);
        this.LeftLine.LoadSerializedData(obj.LeftLine);
        this.UpLeftCorner.LoadSerializedData(obj.UpLeftCorner);
        this.Cell.LoadSerializedData(obj.Cell);
    }
}