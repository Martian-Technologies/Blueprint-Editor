const BG_COLOR = "#282c34";
const GATE_OUTLINE_COLOR = "#ffffff"; //"#333842";
const GATE_COLOR = "#4a4e57";

const uuid = location.pathname.split("/")[2];
let data: Project | null = null;
let blocks: Array<Block> = [];
let camera_x = 0;
let camera_y = 0;
let zoom = 10;
let current_mouse_x = 0;
let current_mouse_y = 0;
let last_mouse_x = 0;
let last_mouse_y = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mouse_down = false;
let moving_screen = false;
let canvas_dirty = true;

addEventListener("load", ready);

async function ready() {
    matchSize();
    data = await fetchData();
    blocks = data.data;
    console.log(blocks);
    setInterval(renderCanvas, 1000 / 60);
    // detect click and drag
    const canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];

    canvas.addEventListener("mousedown", (e) => {
        mouse_down = true;
        last_mouse_x = e.clientX;
        last_mouse_y = e.clientY;

        if (e.shiftKey || e.ctrlKey || e.which == 3 || e.which == 2) {
            moving_screen = true;
        }
    });
    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
    canvas.addEventListener("mouseup", () => {
        mouse_down = false;
        moving_screen = false;
    });
    canvas.addEventListener("mouseleave", () => {
        mouse_down = false;
        moving_screen = false;
    });
    canvas.addEventListener("mousemove", (e) => {
        current_mouse_x = e.clientX;
        current_mouse_y = e.clientY;
    });
    setInterval(() => {
        if (moving_screen) {
            camera_x -=
                ((current_mouse_x - last_mouse_x) / canvas.height) * zoom;
            camera_y -=
                ((current_mouse_y - last_mouse_y) / canvas.height) * zoom;
            last_mouse_x = current_mouse_x;
            last_mouse_y = current_mouse_y;
            canvas_dirty = true;
        }
    }, 1000 / 60);
    // detect scroll
    canvas.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            zoom *= 1 + Math.cbrt(e.deltaY) / 20;
        } else {
            let dx = (e.deltaX / canvas.height) * zoom;
            let dy = (e.deltaY / canvas.width) * zoom;
            if (e.shiftKey) {
                dx = dy - dx;
                dy -= dx;
                dx += dy;
            }
            camera_x += dx;
            camera_y += dy;
        }
        canvas_dirty = true;
    });
}

// event listener for when the page is resized
window.addEventListener("resize", matchSize);

function matchSize() {
    const canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];
    console.log(canvas);
    // get size of canvas on screen
    const c_width = canvas.offsetWidth;
    const c_height = canvas.offsetHeight;
    // set size of canvas to match screen
    canvas.width = c_width;
    canvas.height = c_height;
    canvas_dirty = true;
}

type Project = {
    name: string;
    description: string;
    uuid: string | undefined;
    type: string;
    data: Array<Block>;
}

type Block = {
    x: number;
    y: number;
    id: number;
    type: number;
    inputs: Array<number>;
    outputs: Array<number>;
}

async function fetchData(): Promise<Project> {
    // fetch data from the server
    const resp = await fetch("/editor/" + uuid + "/get"); // fetch the data
    const data = await resp.json(); // assume json and parse it
    return data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function saveData() {
    // save data to the server
    await fetch("/editor/" + uuid + "/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    // let data = await resp.json();
    // return data;
}

function worldToScreen(x: number, y: number) {
    const canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];
    const scale = canvas.height / zoom;
    return {
        x: (x - camera_x) * scale + canvas.width / 2,
        y: (y - camera_y) * scale + canvas.height / 2,
    };
}

function renderCanvas() {
    if (!canvas_dirty) {
        return;
    }
    canvas_dirty = false;
    const canvas: HTMLCanvasElement = document.getElementsByTagName("canvas")[0];
    const scale = canvas.height / zoom;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearStroke
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        ctx.fillStyle = GATE_COLOR;
        ctx.strokeStyle = GATE_OUTLINE_COLOR;
        const pos = worldToScreen(block.x, block.y);
        const gate_height = 2;
        const gate_width = 2;
        // ctx.fillRect(pos.x, pos.y, scale, scale);
        // draw rounded gate centered around pos
        ctx.beginPath();
        ctx.roundRect(
            pos.x - (scale / 2) * gate_width,
            pos.y - (scale / 2) * gate_height,
            scale * gate_width,
            scale * gate_height,
            0.15 * scale
        );
        ctx.fill();
        ctx.stroke();
    }
}
