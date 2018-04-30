class DrawnLine {

    private Panel : Panel;

    private width : number;
    private height : number;
    private fixedPath : CursorCoordinate[] = [];
    private currentPoint : CursorCoordinate;
    private epsilon : number;

    public constructor(p : Panel, startx : number, starty : number, pw : number, ph : number) {
        this.Panel = p;
        
        const size = this.Panel.GetSize();

        this.width = size.width;
        this.height = size.height;

        this.epsilon = 5 / pw;
        console.log("Eps", this.epsilon);

        this.fixedPath = [
            {
                x: startx,
                y: starty,
                direction: Direction.None
            }
        ]

        this.currentPoint = {
            x : startx,
            y : starty,
            direction: Direction.None
        }
    } 

    public GetPoints() : CursorCoordinate[] {
        return this.fixedPath.concat([this.currentPoint]);
    }

    public MoveMouse(moveX : number, moveY : number) : void {
        /*const iterations = Math.ceil(Math.max(moveX / this.epsilon, moveY / this.epsilon));
        const relaX = moveX / iterations;
        const realY = moveY / iterations;

        for (let i = 0; i < iterations; ++i) {
            this.CalculateMovements(relaX, realY);
        }*/
        this.CalculateMovements(moveX, moveY);
    }

    private CalculateMovements(moveX : number, moveY : number) : void {
        const cx = this.currentPoint.x;
        const cy = this.currentPoint.y;
        const c2x = this.currentPoint.x + moveX;
        const c2y = this.currentPoint.y + moveY;
        const lastFix = this.fixedPath[this.fixedPath.length - 1];

        const df = Distance(lastFix.x, lastFix.y, cx, cy);
        const df2 = Distance(lastFix.x, lastFix.y, c2x, c2y);

        const nx = Math.round(cx);
        const ny = Math.round(cy);
        const dn = Distance(nx, ny, cx, cy);
        const dx = Math.abs(cx - lastFix.x);
        const dy = Math.abs(cy - lastFix.y);

        if (df > this.epsilon) {
            if (dx > dy) {
                this.currentPoint.x += moveX;
                this.currentPoint.y = ny;
            } else {
                this.currentPoint.x = nx;
                this.currentPoint.y += moveY;
            }
            this.currentPoint.direction = DirectionUtils.FromCoordinates(lastFix.x, lastFix.y, this.currentPoint.x, this.currentPoint.y);

            if (dn < this.epsilon && (nx != lastFix.x || ny != lastFix.y)) {
                this.fixedPath.push({
                    x: nx,
                    y: ny,
                    direction: DirectionUtils.FromCoordinates(lastFix.x, lastFix.y, nx, ny)
                });
            }
            if (this.fixedPath.length > 1 && nx == lastFix.x && ny == lastFix.y && lastFix.direction == DirectionUtils.Reverse(this.currentPoint.direction)) {
                this.fixedPath.pop();
            }
        } else {
            const vecX = c2x - nx;
            const vecY = c2y - ny;

            const possibleDirections = this.Panel.Grid[nx][ny].PossibleDirections;

            if (vecX > 0 && !possibleDirections.Right) {
                moveX = 0;
            }
            if (vecX < 0 && !possibleDirections.Left) {
                moveX = 0;
            }
            if (vecY > 0 && !possibleDirections.Down) {
                moveY = 0;
            }
            if (vecY < 0 && !possibleDirections.Up) {
                moveY = 0;
            }

            this.currentPoint.x += moveX;
            this.currentPoint.y += moveY;
            this.currentPoint.direction = DirectionUtils.FromCoordinates(lastFix.x, lastFix.y, this.currentPoint.x, this.currentPoint.y);
        }
    }

    public GetCursor() : CursorCoordinate {
        return this.currentPoint;
    }
    
}