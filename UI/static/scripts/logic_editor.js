BG_COLOR = "#282c34";
GATE_COLOR = "#4a4e57";

var uuid = location.pathname.split("/")[2];
var data = null;
var blocks = [];
var camera_x = 0;
var camera_y = 0;
var zoom = 10;
var current_mouse_x = 0;
var current_mouse_y = 0;
var last_mouse_x = 0;
var last_mouse_y = 0;
var mouse_down = false;
var moving_screen = false;
var canvas_dirty = true;

async function ready() {
    matchSize();
    data = await fetchData();
    blocks = data.data;
    console.log(blocks);
    setInterval(renderCanvas, 1000 / 60);
    // detect click and drag
    let canvas = document.getElementById("editorCanvas");
    canvas.addEventListener("mousedown", (e) => {
        mouse_down = true;
        last_mouse_x = e.clientX;
        last_mouse_y = e.clientY;
        if (e.shiftKey) {
            moving_screen = true;
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        mouse_down = false;
        moving_screen = false;
    });
    canvas.addEventListener("mouseleave", (e) => {
        mouse_down = false;
        moving_screen = false;
    });
    canvas.addEventListener("mousemove", (e) => {
        current_mouse_x = e.clientX;
        current_mouse_y = e.clientY;
    });
    canvas.addEventListener("keyup", (e) => {
        // if shift key is released; disabled moving_screen
        if (e.key == "Shift") {
            moving_screen = false;
        }
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
            zoom *= 1 + Math.cbrt(e.deltaY) / 10;
        } else {
            let dx = (e.deltaX / canvas.height) * zoom;
            let dy = (e.deltaY / canvas.width) * zoom;
            if (e.shiftKey) {
                dx, (dy = dy), dx;
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
    let canvas = document.getElementById("editorCanvas");
    console.log(canvas);
    // get size of canvas on screen
    let c_width = canvas.offsetWidth;
    let c_height = canvas.offsetHeight;
    // set size of canvas to match screen
    canvas.width = c_width;
    canvas.height = c_height;
    canvas_dirty = true;
}

async function fetchData() {
    // fetch data from the server
    let resp = await fetch("/editor/" + uuid + "/get"); // fetch the data
    let data = await resp.json(); // convert to json
    return data;
}

async function saveData() {
    // save data to the server
    let resp = await fetch("/editor/" + uuid + "/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    // let data = await resp.json();
    // return data;
}

function worldToScreen(x, y) {
    let canvas = document.getElementById("editorCanvas");
    let scale = canvas.height / zoom;
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
    let canvas = document.getElementById("editorCanvas");
    let scale = canvas.height / zoom;
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearStroke
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        ctx.fillStyle = GATE_COLOR;
        let pos = worldToScreen(block.x, block.y);
        let gate_height = 2;
        let gate_width = 2;
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
    }
}
