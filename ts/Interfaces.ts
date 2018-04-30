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
    direction: Direction;
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

enum Direction {
    None,
    Up,
    Right,
    Down,
    Left
}

class DirectionUtils {
    public static FromCoordinates(fromX : number, fromY : number, toX : number, toY : number) : Direction {
        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        const distX = Math.abs(deltaX);
        const distY = Math.abs(deltaY);

        if (distX > distY) {
            if (deltaX > 0) {
                return Direction.Right;
            } else {
                return Direction.Left;
            }
        } else if (distY > distX) {
            if (deltaY > 0) {
                return Direction.Down;
            } else {
                return Direction.Up;
            }
        } else {
            return Direction.None;
        }
    }

    public static Reverse(dir : Direction) : Direction {
        switch (dir) {
            case Direction.None:
                return Direction.None;
            case Direction.Up:
                return Direction.Down;
            case Direction.Right:
                return Direction.Left;
            case Direction.Down:
                return Direction.Up;
            case Direction.Left:
                return Direction.Right;
        }
    }

    public static ToColor(dir : Direction) : string {
        switch (dir) {
            case Direction.None:
                return "white";
            case Direction.Up:
                return "red";
            case Direction.Right:
                return "blue";
            case Direction.Down:
                return "green";
            case Direction.Left:
                return "yellow";
        }
    }
}

enum Axis {
    None,
    UpDown,
    LeftRight
}

enum LineType {
    NoLine,
    Filled,
    Broken
}

enum IntersectType {
    None,
    StartPoint
}

enum GridContentType {
    None
}