interface Serializable {
    Serialize() : any;
    LoadSerializedData(data : any) : void;
}

interface Coordinate {
    x : number;
    y : number;
}

interface CursorCoordinate {
    x : number;
    y : number;
    fixed: boolean;
}

interface StartingPoint {
    point: Coordinate;
    pixel: Coordinate;
}

interface DirectionBools {
    Up: boolean;
    Right: boolean;
    Down: boolean;
    Left: boolean;
}

enum Axis {
    None,
    UpDown,
    LeftRight
}