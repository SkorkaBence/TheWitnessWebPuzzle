class InGame extends Scene {

    private Loaded : boolean = false;

    private Panel : Panel;

    private canvas : HTMLCanvasElement|null = null;
    private ctx : CanvasRenderingContext2D|null = null;

    private realCanvas : HTMLCanvasElement|null = null;
    private realCanvasCtx : CanvasRenderingContext2D|null = null;

    private width : number = 0;
    private height : number = 0;

    private ration : number = 1;
    private blockWidth : number = 0;
    private blockHeight : number = 0;
    private top : number = 0;
    private left : number = 0;

    private CursorX : number = -100;
    private CursorY : number = -100
    private ShowCursor : boolean = true;

    private fps_counter : number = 0;
    private fps : number = 0;
    private fps_timer : number = 0;

    private bakcgroundColor : string = "#f4ae00";
    private lineColor : string = "#714d00";
    private cursorLineColor : string = "255, 255, 255";

    private startTime : number = 0;

    private showStartPointAnimation : boolean = true;

    private StartPoints : StartingPoint[] = [];
    private StartPointRadius : number = 0;
    private CursorPath : CursorCoordinate[] = [];
    private CursorLoced : boolean = false;
    private CursorLineAnimationStart : number = 0;
    private CursorSelectedDirection : Axis = Axis.None;

    constructor(panel : Panel) {
        super();
        this.Panel = panel;
        console.log(panel.Serialize());
    }

    public Load(): void {
        const __this = this;

        this.main.innerHTML = `
            <div class="boardcontainer">
                <canvas></canvas>
            </div>
        `;

        this.realCanvas = (this.$(".boardcontainer canvas") as HTMLCanvasElement);
        this.realCanvasCtx = (this.realCanvas.getContext("2d") as CanvasRenderingContext2D);

        this.canvas = document.createElement("canvas");
        this.ctx = (this.canvas.getContext("2d") as CanvasRenderingContext2D);

        this.realCanvas.addEventListener("mousemove", function(event) {
            __this.MouseMove(event);
        });
        this.realCanvas.addEventListener("mouseleave", function(event) {
            __this.MouseLeave(event);
        });
        this.realCanvas.addEventListener("mouseenter", function(event) {
            __this.MouseEnter(event);
        });
        this.realCanvas.addEventListener("click", function(event) {
            __this.MouseClick(event);
        });
        document.addEventListener('pointerlockchange', function(event) {
            __this.CursorLockUpdate(event);
        });

        this.Loaded = true;

        this.fps_timer = setInterval(function() {
            __this.fpsCalc();
        }, 1000);

        this.startTime = Date.now();

        this.Resize();
        this.Render();
    }

    public Unload(): void {
        this.Loaded = false;
        this.main.innerHTML = ``;
        clearInterval(this.fps_timer);
    }

    public Resize(): void {
        if (this.canvas == null || this.realCanvas == null) {
            return;
        }

        this.width = this.main.offsetWidth;
        this.height = this.main.offsetHeight;
        this.ration = this.width / this.height;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.realCanvas.width = this.width;
        this.realCanvas.height = this.height;
    }

    private Render() : void {
        const __this = this;
        if (!this.Loaded || this.ctx == null || this.realCanvasCtx == null) {
            return;
        }

        const DeltaTime = Date.now() - this.startTime;

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.DrawPanel(this.ctx, DeltaTime);
        this.DrawCursor(this.ctx);

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = "black";
        this.ctx.font = "30px Roboto";
        this.ctx.fillText(this.fps + " FPS", 10, 50);
        this.ctx.strokeText(this.fps + " FPS", 10, 50);

        // double buffer
        this.realCanvasCtx.clearRect(0, 0, this.width, this.height);
        this.realCanvasCtx.drawImage((this.canvas as HTMLCanvasElement), 0, 0);

        ++this.fps_counter;

        window.requestAnimationFrame(function() {
            __this.Render();
        });
    }

    private MouseMove(event : MouseEvent) : void {
        if (!this.CursorLoced) {
            this.CursorX = event.clientX;
            this.CursorY = event.clientY;
        } else {
            const posInCellsX = (this.CursorX - this.left) / this.blockWidth;
            const nearestCellX = Math.round(posInCellsX);
            const posInCellsY = (this.CursorY - this.top) / this.blockHeight;
            const nearestCellY = Math.round(posInCellsY);

            const nearestCell = this.Panel.Grid[nearestCellX][nearestCellY];

            const d = Distance(posInCellsX, posInCellsY, nearestCellX, nearestCellY);
            const turningPoint = d < 0.03;

            let lastFixedPoint = this.CursorPath.length - 1;
            while(!this.CursorPath[lastFixedPoint].fixed) {
                --lastFixedPoint;
            }
            const LastFixedCursorPathPoint = this.CursorPath[lastFixedPoint];
            const LastCursorPathPoint = this.CursorPath[this.CursorPath.length - 1];

            const lastFixedCell = this.Panel.Grid[LastFixedCursorPathPoint.x][LastFixedCursorPathPoint.y];

            console.log(turningPoint, lastFixedPoint);

            if (turningPoint) {
                if ((nearestCell.PossibleDirections.Right && event.movementX > 0) || (nearestCell.PossibleDirections.Left && event.movementX < 0) || d > 0.01) {
                    this.CursorX += event.movementX;
                }
                if ((nearestCell.PossibleDirections.Up && event.movementY < 0) || (nearestCell.PossibleDirections.Down && event.movementY > 0) || d > 0.01) {
                    this.CursorY += event.movementY;                    
                }
                if (!LastCursorPathPoint.fixed && Math.round(LastCursorPathPoint.x) == LastFixedCursorPathPoint.x && Math.round(LastCursorPathPoint.y) == LastFixedCursorPathPoint.y) {
                    console.log("NEW FIXED POINT POPPED!!!");
                    while(!this.CursorPath[this.CursorPath.length - 1].fixed) {
                        this.CursorPath.pop();
                    }
                    this.CursorPath[this.CursorPath.length - 1].fixed = false;
                }
                this.CursorSelectedDirection = Axis.None;
            } else {
                if (this.CursorSelectedDirection == Axis.None) {
                    const dV = Math.abs(posInCellsY - nearestCellY);
                    const dH = Math.abs(posInCellsX - nearestCellX);

                    if (dH > dV) {
                        this.CursorSelectedDirection = Axis.LeftRight;
                    } else {
                        this.CursorSelectedDirection = Axis.UpDown;
                    }
                }

                if (this.CursorSelectedDirection == Axis.LeftRight) {
                    this.CursorX += event.movementX;
                    this.CursorY = this.top + nearestCellY * this.blockHeight;
                    console.log("A");
                } else if (this.CursorSelectedDirection == Axis.UpDown) {
                    this.CursorY += event.movementY;
                    this.CursorX = this.left + nearestCellX * this.blockWidth;
                    console.log("B");
                }

                if (LastFixedCursorPathPoint.x != nearestCellX || LastFixedCursorPathPoint.y != nearestCellY) {
                    console.log("NEW FIXED POINT CREATED!!!");
                    while(!this.CursorPath[this.CursorPath.length - 1].fixed) {
                        this.CursorPath.pop();
                    }
                    this.CursorPath.push({
                        x: nearestCellX,
                        y: nearestCellY,
                        fixed: true
                    });
                }

                if (this.CursorPath[this.CursorPath.length - 1].fixed) {
                    this.CursorPath.push({
                        x: posInCellsX,
                        y: posInCellsY,
                        fixed: false
                    });
                } else {
                    this.CursorPath[this.CursorPath.length - 1].x = posInCellsX;
                    this.CursorPath[this.CursorPath.length - 1].y = posInCellsY;
                }
            }

            if (this.CursorX < 0) {
                this.CursorX = 0;
            }
            if (this.CursorX > this.width) {
                this.CursorX = this.width;
            }

            if (this.CursorY < 0) {
                this.CursorY = 0;
            }
            if (this.CursorY > this.height) {
                this.CursorY = this.height;
            }
        }
    }

    private MouseLeave(event : MouseEvent) : void {
        if (!this.CursorLoced) {
            this.ShowCursor = false;
        }
    }

    private MouseEnter(event : MouseEvent) : void {
        if (!this.CursorLoced) {
            this.ShowCursor = true;
        }
    }

    private MouseClick(event : MouseEvent) : void {
        if (this.realCanvas == null) {
            return;
        }

        if (this.CursorLoced) {
            document.exitPointerLock();
        } else {
            let startPointIndex = -1;

            for (let i = 0; i < this.StartPoints.length; ++i) {
                const sp = this.StartPoints[i];
                if (Distance(sp.pixel.x, sp.pixel.y, event.clientX, event.clientY) <= this.StartPointRadius) {
                    startPointIndex = i;
                    break;
                }
            }

            if (startPointIndex >= 0) {
                const sp = this.StartPoints[startPointIndex];

                this.CursorLoced = true;

                this.CursorPath = [{
                    x: sp.point.x,
                    y: sp.point.y,
                    fixed: true
                }];

                this.CursorX = sp.pixel.x;
                this.CursorY = sp.pixel.y;

                this.realCanvas.requestPointerLock();
            }
        }
    }

    private CursorLockUpdate(event : Event) : void {
        if(document.pointerLockElement != null) {
            console.log('The pointer lock status is now locked');

            this.showStartPointAnimation = false;
            this.CursorLoced = true;
            //this.ShowCursor = false;
            this.CursorLineAnimationStart = Date.now() - this.startTime;
        } else {
            this.CursorLoced = false;
            this.showStartPointAnimation = true;
            this.ShowCursor = true;
            this.CursorPath = [];
        }
    }

    private fpsCalc() {
        this.fps = this.fps_counter;
        this.fps_counter = 0;
    }

    private DrawCursor(ctx : CanvasRenderingContext2D) : void {
        if (this.ShowCursor) {
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.lineWidth = 10;
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

            ctx.beginPath();
            ctx.arc(this.CursorX, this.CursorY, 15, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.CursorX, this.CursorY, 20, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }

    private DrawPanel(ctx : CanvasRenderingContext2D, DeltaTime : number) : void {
        if (this.ctx != null) {
            const PanelSize = this.Panel.GetSize();

            let width : number;
            let height : number;

            if (PanelSize.width == 0 && PanelSize.height == 0) {
                width = 0;
                height = 0;
            } else if (PanelSize.width == 0) {
                width = 0;
                height = this.height * 0.7;
            } else if (PanelSize.height == 0) {
                width = this.width * 0.7;
                height = 0;
            } else {
                const PanelRation = PanelSize.width / PanelSize.height;
                if (PanelRation > this.ration) {
                    width = this.width * 0.7;
                    height = width * PanelRation;
                } else {
                    height = this.height * 0.7;
                    width = height / PanelRation;
                }
            }

            ctx.fillStyle = this.bakcgroundColor;
            ctx.fillRect(0, 0, this.width, this.height);

            /*ctx.globalCompositeOperation='source-atop';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0,0,0,1)';
            for (let i = 0; i < 10; ++i) {
                ctx.strokeRect(0, 0, this.width, this.height);
            }
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation='source-over';*/

            const blockWidth = PanelSize.width != 0 ? Math.round(width / PanelSize.width) : 0;
            this.blockWidth = blockWidth;
            const blockHeight = PanelSize.height != 0 ? Math.round(height / PanelSize.height) : 0;
            this.blockHeight = blockHeight;

            const left = Math.round((this.width - width) / 2);
            this.left = left;
            const top = Math.round((this.height - height) / 2);
            this.top = top;

            /* LINES */

            const lineWidth = Math.max(30, Math.max(blockWidth, blockHeight) * 0.1);

            ctx.strokeStyle = this.lineColor;
            ctx.fillStyle = this.lineColor;
            ctx.lineWidth = lineWidth;

            let BeginPoints : Coordinate[] = [];
            this.StartPoints = [];

            this.StartPointRadius = lineWidth * 1.2;

            for (let x = 0; x <= PanelSize.width; ++x) {
                for (let y = 0; y <= PanelSize.height; ++y) {
                    const cell : GridCell = this.Panel.Grid[x][y];

                    if (!cell.HasConnections) {
                        continue;
                    }

                    if (cell.UpperLine.type == LineType.Filled) {
                        ctx.beginPath();
                        ctx.moveTo(left + x * blockWidth, top + y * blockHeight);
                        ctx.lineTo(left + (x+1) * blockWidth, top + y * blockHeight);
                        ctx.closePath();
                        ctx.stroke();
                    } else if (cell.UpperLine.type == LineType.Broken) {
                        ctx.beginPath();
                        ctx.moveTo(left + x * blockWidth, top + y * blockHeight);
                        ctx.lineTo(left + (x+0.3) * blockWidth, top + y * blockHeight);
                        ctx.moveTo(left + (x+0.7) * blockWidth, top + y * blockHeight);
                        ctx.lineTo(left + (x+1) * blockWidth, top + y * blockHeight);
                        ctx.closePath();
                        ctx.stroke();
                    }

                    if (cell.LeftLine.type == LineType.Filled) {
                        ctx.beginPath();
                        ctx.moveTo(left + x * blockWidth, top + y * blockHeight);
                        ctx.lineTo(left + x * blockWidth, top + (y+1) * blockHeight);
                        ctx.closePath();
                        ctx.stroke();
                    } else if (cell.LeftLine.type == LineType.Broken) {
                        ctx.beginPath();
                        ctx.moveTo(left + x * blockWidth, top + y * blockHeight);
                        ctx.lineTo(left + x * blockWidth, top + (y+0.3) * blockHeight);
                        ctx.moveTo(left + x * blockWidth, top + (y+0.7) * blockHeight);
                        ctx.lineTo(left + x * blockWidth, top + (y+1) * blockHeight);
                        ctx.closePath();
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    if (cell.UpLeftCorner.type == IntersectType.None) {
                        ctx.arc(left + x * blockWidth, top + y * blockHeight, Math.floor(lineWidth / 2), 0, 2 * Math.PI);
                    } else if (cell.UpLeftCorner.type == IntersectType.StartPoint) {
                        ctx.arc(left + x * blockWidth, top + y * blockHeight, this.StartPointRadius, 0, 2 * Math.PI);
                        BeginPoints.push({
                            x: x,
                            y: y
                        });
                        this.StartPoints.push({
                            point: {
                                x: x,
                                y: y
                            },
                            pixel: {
                                x: left + x * blockWidth,
                                y: top + y * blockHeight
                            }
                        });
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }

            /* LINES */

            /* START PONT ANIMATION */

            if (this.showStartPointAnimation) {
                let animstatus = DeltaTime / 1000 / 1.5;
                animstatus -= Math.floor(animstatus);
    
                ctx.strokeStyle = "rgba(255, 255, 255, " + (1 - animstatus) + ")";
                ctx.lineWidth = 4;
    
                for (let i = 0; i < BeginPoints.length; ++i) {
                    ctx.beginPath();
                    ctx.arc(left + BeginPoints[i].x * blockWidth, top + BeginPoints[i].y * blockHeight, animstatus * lineWidth * 1.6, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                }
            }

            /* START PONT ANIMATION */

            /* WHITE LINE */

            if (this.CursorPath.length > 0) {
                let alpha = 1;
                let radius = this.StartPointRadius;
                if (DeltaTime - this.CursorLineAnimationStart <= 300) {
                    alpha = (DeltaTime - this.CursorLineAnimationStart) / 300;
                    radius = radius * alpha;
                }
                ctx.strokeStyle = "rgba(" + this.cursorLineColor + ", " + alpha + ")";
                ctx.fillStyle = ctx.strokeStyle;
                ctx.lineWidth = lineWidth;

                ctx.beginPath();
                ctx.arc(left + this.CursorPath[0].x * blockWidth, top + this.CursorPath[0].y * blockHeight, radius, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
    
                for (let i = 1; i < this.CursorPath.length; ++i) {
                    ctx.beginPath();
                    ctx.moveTo(left + this.CursorPath[i - 1].x * blockWidth, top + this.CursorPath[i - 1].y * blockHeight);
                    ctx.lineTo(left + this.CursorPath[i].x * blockWidth, top + this.CursorPath[i].y * blockHeight);
                    ctx.closePath();
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(left + this.CursorPath[i].x * blockWidth, top + this.CursorPath[i].y * blockHeight, Math.floor(lineWidth / 2), 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            /* WHITE LINE */
        }
    }

}