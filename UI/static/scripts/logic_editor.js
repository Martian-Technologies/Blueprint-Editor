var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BG_COLOR = "#282c34";
const GATE_OUTLINE_COLOR = "#ffffff"; //"#333842";
const GATE_COLOR = "#4a4e57";
const SIDE_PANEL_COLOR = "#333842";
const SIDE_PANEL_TEXT_COLOR = "#ffffff";
const SIDE_PANEL_HOVER_COLOR = "#4a4e57";
const PIN_COLOR = "#ffffff";
const SELECT_BOX_COLOR = "#ffffff1a";
const SELECT_BOX_OUTLINE_COLOR = "#ffffff44";
const GATE_SELECTED_COLOR = "#4a4e57";
const GATE_SELECTED_OUTLINE_COLOR = "#ffffff";
const uuid = location.pathname.split("/")[2];
const blockOptions = [];
let sidebarWidth = 300;
let data = null;
let blocks = [];
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
let sidebar_scroll = 0;
let block_option_selected = null;
let highest_id = 0;
let selecting_box = false;
let selection_start = { x: 0, y: 0 };
let gates_selected = [];
let gates_selecting = [];
let holding_block = false;
let hovering_over_block = null;
let hovering_over_pin = null;
let hovering_over_pin_type = null;
let dragging_connection_direction = null;
let dragging_connection_pin = null;
let dragging_connection_block = null;
let dragging_connection = false;
addEventListener("load", ready);
function checkConnectionPins(b1, b2, p1Direction, p1Index, p2Index) {
    if (p1Direction == "input") {
        if (b1.inputs[p1Index].includes(b2.id)) {
            return true;
        }
    }
    if (p1Direction == "output") {
        if (b2.inputs[p2Index].includes(b1.id)) {
            return true;
        }
    }
    return false;
}
function connectPins(b1, b2, p1Direction, p1Index, p2Index) {
    const b1_type = blockOptions.find(b => b.type == b1.type);
    const b2_type = blockOptions.find(b => b.type == b2.type);
    let no_match = true;
    if (p1Direction == "input") {
        for (const type of (b1_type === null || b1_type === void 0 ? void 0 : b1_type.inputPinTypes[p1Index]) || []) {
            if (b2_type === null || b2_type === void 0 ? void 0 : b2_type.outputPinTypes[p2Index].includes(type)) {
                no_match = false;
            }
        }
        if (no_match) {
            return;
        }
        b1.inputs[p1Index].push(b2.id);
        b2.outputs[p2Index].push(b1.id);
    }
    if (p1Direction == "output") {
        for (const type of (b2_type === null || b2_type === void 0 ? void 0 : b2_type.inputPinTypes[p2Index]) || []) {
            if (b1_type === null || b1_type === void 0 ? void 0 : b1_type.outputPinTypes[p1Index].includes(type)) {
                no_match = false;
            }
        }
        if (no_match) {
            return;
        }
        b2.inputs[p2Index].push(b1.id);
        b1.outputs[p1Index].push(b2.id);
    }
}
function disconnectPins(b1, b2, p1Direction, p1Index, p2Index) {
    if (p1Direction == "input") {
        b1.inputs[p1Index] = b1.inputs[p1Index].filter(id => id != b2.id);
        b2.outputs[p2Index] = b2.outputs[p2Index].filter(id => id != b1.id);
    }
    if (p1Direction == "output") {
        b2.inputs[p2Index] = b2.inputs[p2Index].filter(id => id != b1.id);
        b1.outputs[p1Index] = b1.outputs[p1Index].filter(id => id != b2.id);
    }
}
function toggleConnectionPins(b1, b2, p1Direction, p1Index, p2Index) {
    if (checkConnectionPins(b1, b2, p1Direction, p1Index, p2Index)) {
        disconnectPins(b1, b2, p1Direction, p1Index, p2Index);
    }
    else {
        connectPins(b1, b2, p1Direction, p1Index, p2Index);
    }
}
function clearPin(block, pinDirection, pinIndex) {
    if (pinDirection == "input") {
        for (const id of block.inputs[pinIndex]) {
            const otherBlock = getBlockById(id);
            if (otherBlock) {
                otherBlock.outputs = otherBlock.outputs.map(o => o.filter(id => id != block.id));
            }
        }
        block.inputs[pinIndex] = [];
    }
    else {
        for (const id of block.outputs[pinIndex]) {
            const otherBlock = getBlockById(id);
            if (otherBlock) {
                otherBlock.inputs = otherBlock.inputs.map(o => o.filter(id => id != block.id));
            }
        }
        block.outputs[pinIndex] = [];
    }
}
function deleteBlock(block) {
    for (let i = 0; i < block.inputs.length; i++) {
        clearPin(block, "input", i);
    }
    for (let i = 0; i < block.outputs.length; i++) {
        clearPin(block, "output", i);
    }
    // remove from blocks without creating a new array
    blocks.splice(blocks.indexOf(block), 1);
}
function getBlockById(id) {
    return blocks.find(b => b.id == id) || null;
}
function ready() {
    return __awaiter(this, void 0, void 0, function* () {
        matchSize();
        fetchBlockOptions();
        data = yield fetchData();
        blocks = data.data;
        // center camera on blocks
        let min_x = null;
        let max_x = null;
        let min_y = null;
        let max_y = null;
        for (const block of blocks) {
            if (min_x === null || block.x < min_x) {
                min_x = block.x;
            }
            if (max_x === null || block.x > max_x) {
                max_x = block.x;
            }
            if (min_y === null || block.y < min_y) {
                min_y = block.y;
            }
            if (max_y === null || block.y > max_y) {
                max_y = block.y;
            }
            if (block.id > highest_id) {
                highest_id = block.id;
            }
        }
        if (min_x !== null && max_x !== null && min_y !== null && max_y !== null) {
            camera_x = (min_x + max_x) / 2;
            camera_y = (min_y + max_y) / 2;
        }
        const v_dist = Math.abs(max_y - min_y);
        const h_dist = Math.abs(max_x - min_x);
        min_x -= h_dist * 0.1;
        max_x += h_dist * 0.1;
        min_y -= v_dist * 0.1;
        max_y += v_dist * 0.1;
        // scale camera to fit blocks
        if (min_x !== null && max_x !== null && min_y !== null && max_y !== null) {
            let sc_to_world_topleft = { x: 0, y: 0 };
            let sc_to_world_bottomright = { x: 0, y: 0 };
            while (!(sc_to_world_topleft.x < min_x &&
                sc_to_world_topleft.y < min_y &&
                sc_to_world_bottomright.x > max_x &&
                sc_to_world_bottomright.y > max_y)) {
                sc_to_world_topleft = screenToWorld(0, 0);
                sc_to_world_bottomright = screenToWorld(document.getElementsByTagName("canvas")[0].width, document.getElementsByTagName("canvas")[0].height);
                zoom *= 1.1;
            }
        }
        // gates_selected.push(blocks[0]);
        setInterval(renderCanvas, 1000 / 60);
        // detect click and drag
        const canvas = document.getElementsByTagName("canvas")[0];
        canvas.addEventListener("mousedown", (e) => {
            mouse_down = true;
            // last_mouse_x = e.clientX;
            // last_mouse_y = e.clientY;
            if (e.which == 3 || e.which == 2) {
                moving_screen = true;
            }
            else if (last_mouse_x < sidebarWidth) {
                if (block_option_selected) {
                    const inpts = [];
                    for (let i = 0; i < block_option_selected.inputPinNames.length; i++) {
                        inpts.push([]);
                    }
                    const outpts = [];
                    for (let i = 0; i < block_option_selected.outputPinNames.length; i++) {
                        outpts.push([]);
                    }
                    const block = {
                        id: highest_id + 1,
                        type: block_option_selected.type,
                        x: screenToWorld(last_mouse_x, last_mouse_y).x,
                        y: screenToWorld(last_mouse_x, last_mouse_y).y,
                        inputs: inpts,
                        outputs: outpts,
                    };
                    holding_block = true;
                    highest_id++;
                    blocks.push(block);
                    gates_selected = [block];
                }
            }
            else {
                if (hovering_over_pin !== null && !dragging_connection) {
                    dragging_connection_pin = hovering_over_pin;
                    dragging_connection_direction = hovering_over_pin_type;
                    dragging_connection_block = hovering_over_block;
                    dragging_connection = true;
                }
                else {
                    if (hovering_over_block && gates_selected.includes(hovering_over_block)) {
                        holding_block = true;
                    }
                    else {
                        if (!e.shiftKey) {
                            gates_selected = [];
                        }
                        if (hovering_over_block) {
                            gates_selected.push(hovering_over_block);
                            holding_block = true;
                        }
                        else {
                            selecting_box = true;
                            selection_start = screenToWorld(last_mouse_x, last_mouse_y);
                        }
                        canvas_dirty = true;
                    }
                }
            }
        });
        canvas.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        canvas.addEventListener("mouseup", () => {
            mouse_down = false;
            moving_screen = false;
            if (holding_block) {
                if (current_mouse_x < sidebarWidth) {
                    for (const block of gates_selected) {
                        deleteBlock(block);
                    }
                    gates_selected = [];
                }
                holding_block = false;
            }
            if (selecting_box) {
                selecting_box = false;
                // move contents from gates_selecting to gates_selected
                for (const block of gates_selecting) {
                    if (!gates_selected.includes(block)) {
                        gates_selected.push(block);
                    }
                }
                gates_selecting = [];
            }
            if (dragging_connection) {
                if (hovering_over_pin_type !== null && hovering_over_pin_type !== dragging_connection_direction && hovering_over_pin !== null) {
                    toggleConnectionPins(dragging_connection_block, hovering_over_block, dragging_connection_direction, dragging_connection_pin, hovering_over_pin);
                }
            }
            dragging_connection_direction = null;
            dragging_connection_pin = null;
            dragging_connection_block = null;
            dragging_connection = false;
        });
        canvas.addEventListener("mouseleave", () => {
            mouse_down = false;
            moving_screen = false;
            holding_block = false;
            if (selecting_box) {
                selecting_box = false;
                // move contents from gates_selecting to gates_selected
                for (const block of gates_selecting) {
                    if (!gates_selected.includes(block)) {
                        gates_selected.push(block);
                    }
                }
                gates_selecting = [];
            }
            dragging_connection_direction = null;
            dragging_connection_pin = null;
            dragging_connection_block = null;
            dragging_connection = false;
        });
        canvas.addEventListener("mousemove", (e) => {
            current_mouse_x = e.clientX;
            current_mouse_y = e.clientY;
            canvas_dirty = true;
        });
        setInterval(() => {
            if (moving_screen) {
                camera_x -=
                    ((current_mouse_x - last_mouse_x) / canvas.height) * zoom;
                camera_y -=
                    ((current_mouse_y - last_mouse_y) / canvas.height) * zoom;
                canvas_dirty = true;
            }
            if (holding_block) {
                for (const block of gates_selected) {
                    block.x += (current_mouse_x - last_mouse_x) / canvas.height * zoom;
                    block.y += (current_mouse_y - last_mouse_y) / canvas.height * zoom;
                }
                canvas_dirty = true;
            }
            last_mouse_x = current_mouse_x;
            last_mouse_y = current_mouse_y;
        }, 1000 / 60);
        // detect scroll
        canvas.addEventListener("wheel", (e) => {
            if (current_mouse_x > sidebarWidth) {
                if (e.ctrlKey) {
                    e.preventDefault();
                    zoom *= 1 + Math.cbrt(e.deltaY) / 20;
                    if (zoom < 4) {
                        zoom = 4;
                    }
                }
                else {
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
            }
            else {
                // scroll sidebar
                sidebar_scroll += e.deltaY;
                canvas_dirty = true;
            }
        });
        document.addEventListener("keydown", (e) => {
            console.log(e.key);
            if (e.key === "Delete" || e.key === "Backspace") {
                for (const block of gates_selected) {
                    deleteBlock(block);
                }
                gates_selected = [];
                canvas_dirty = true;
            }
        });
    });
}
// event listener for when the page is resized
window.addEventListener("resize", matchSize);
function matchSize() {
    const canvas = document.getElementsByTagName("canvas")[0];
    // get size of canvas on screen
    const c_width = canvas.offsetWidth;
    const c_height = canvas.offsetHeight;
    // set size of canvas to match screen
    canvas.width = c_width;
    canvas.height = c_height;
    sidebarWidth = c_width * 0.2;
    canvas_dirty = true;
}
function fetchBlockOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch("/logic/block_options");
        const data = yield resp.json();
        for (const block of data) {
            blockOptions.push(block);
        }
    });
}
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        // fetch data from the server
        const resp = yield fetch("/editor/" + uuid + "/get"); // fetch the data
        const data = yield resp.json(); // assume json and parse it
        return data;
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveData() {
    return __awaiter(this, void 0, void 0, function* () {
        // save data to the server
        yield fetch("/editor/" + uuid + "/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        // let data = await resp.json();
        // return data;
    });
}
function worldToScreen(x, y) {
    const canvas = document.getElementsByTagName("canvas")[0];
    const scale = canvas.height / zoom;
    return {
        x: (x - camera_x) * scale + (canvas.width + sidebarWidth) / 2,
        y: (y - camera_y) * scale + canvas.height / 2,
    };
}
function screenToWorld(x, y) {
    const canvas = document.getElementsByTagName("canvas")[0];
    const scale = canvas.height / zoom;
    return {
        x: (x - (canvas.width + sidebarWidth) / 2) / scale + camera_x,
        y: (y - canvas.height / 2) / scale + camera_y,
    };
}
function drawArrow(ctx, tip, angle, length, width) {
    const arrow_left = {
        x: tip.x + Math.cos(angle + Math.PI / 4) * width + Math.cos(angle) * length,
        y: tip.y + Math.sin(angle + Math.PI / 4) * width + Math.sin(angle) * length,
    };
    const arrow_right = {
        x: tip.x + Math.cos(angle - Math.PI / 4) * width + Math.cos(angle) * length,
        y: tip.y + Math.sin(angle - Math.PI / 4) * width + Math.sin(angle) * length,
    };
    ctx.beginPath();
    ctx.moveTo(arrow_left.x, arrow_left.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(arrow_right.x, arrow_right.y);
    ctx.stroke();
    // ctx.fill();
}
function drawConnection(ctx, start, end, cnt_ref, scale) {
    const horiz_distance = Math.abs(start.x - end.x);
    const start_guide = {
        x: start.x + horiz_distance / 2,
        y: start.y,
    };
    const end_guide = {
        x: end.x - horiz_distance / 2,
        y: end.y,
    };
    // calc arrow
    const arrow_size = .05 * scale;
    let arrow_angle = Math.atan2(end_guide.y - end.y, end_guide.x - end.x);
    const arrow_tip = {
        x: end.x,
        y: end.y,
    };
    // draw bezier curve
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    if (cnt_ref !== "start" && cnt_ref !== "end") {
        ctx.bezierCurveTo(start_guide.x, start_guide.y, end_guide.x, end_guide.y, end.x, end.y);
    }
    else {
        if (cnt_ref === "start") {
            ctx.quadraticCurveTo(start_guide.x, start_guide.y, end.x, end.y);
            arrow_angle = Math.atan2(start_guide.y - end.y, start_guide.x - end.x);
        }
        else {
            ctx.quadraticCurveTo(end_guide.x, end_guide.y, end.x, end.y);
        }
    }
    ctx.stroke();
    // draw arrow
    if (zoom < 30) {
        drawArrow(ctx, arrow_tip, arrow_angle, arrow_size, arrow_size * 1);
    }
}
function renderCanvas() {
    if (!canvas_dirty) {
        return;
    }
    canvas_dirty = false;
    let selection_screen_end = { x: 0, y: 0 };
    let selection_screen_start = { x: 0, y: 0 };
    let selection_screen_topleft = { x: 0, y: 0 };
    let selection_screen_width = 0;
    let selection_screen_height = 0;
    if (selecting_box) {
        selection_screen_start = worldToScreen(selection_start.x, selection_start.y);
        selection_screen_end = { x: current_mouse_x, y: current_mouse_y };
        selection_screen_topleft = { x: Math.min(selection_screen_start.x, selection_screen_end.x), y: Math.min(selection_screen_start.y, selection_screen_end.y) };
        selection_screen_width = Math.abs(selection_screen_start.x - selection_screen_end.x);
        selection_screen_height = Math.abs(selection_screen_start.y - selection_screen_end.y);
    }
    const canvas = document.getElementsByTagName("canvas")[0];
    const scale = canvas.height / zoom;
    const ctx = canvas.getContext("2d");
    // render background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hovering_over_block = null;
    hovering_over_pin = null;
    hovering_over_pin_type = null;
    //render gates
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        let this_block_sel = false;
        if (gates_selected.includes(block) || gates_selecting.includes(block)) {
            ctx.lineWidth = 3;
            this_block_sel = true;
        }
        else {
            ctx.lineWidth = 1;
        }
        // draw pins
        ctx.fillStyle = GATE_COLOR;
        ctx.strokeStyle = PIN_COLOR;
        // find block type
        const blockType = blockOptions.find((b) => b.type === block.type);
        if (!blockType) {
            console.error("Block type not found: " + block.type);
            return;
        }
        // draw input pins
        for (let j = 0; j < blockType.inputPinNames.length; j++) {
            // const pin = blockType.inputPinNames[j];
            const pinPos = worldToScreen(block.x - .5, block.y + j - (blockType.inputPinNames.length - 1) / 2);
            ctx.beginPath();
            ctx.arc(pinPos.x, pinPos.y, scale / 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // check if mouse is hovering over pin
            if (Math.abs(pinPos.x - current_mouse_x) < scale / 8 && Math.abs(pinPos.y - current_mouse_y) < scale / 8) {
                hovering_over_block = block;
                hovering_over_pin = j;
                hovering_over_pin_type = "input";
            }
        }
        // draw output pins
        for (let j = 0; j < blockType.outputPinNames.length; j++) {
            // const pin = blockType.outputPinNames[j];
            const pinPos = worldToScreen(block.x + .5, block.y + j - (blockType.outputPinNames.length - 1) / 2);
            ctx.beginPath();
            ctx.arc(pinPos.x, pinPos.y, scale / 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            if (Math.abs(pinPos.x - current_mouse_x) < scale / 8 && Math.abs(pinPos.y - current_mouse_y) < scale / 8) {
                hovering_over_block = block;
                hovering_over_pin = j;
                hovering_over_pin_type = "output";
            }
        }
        if (gates_selected.includes(block)) {
            ctx.fillStyle = GATE_SELECTED_COLOR;
            ctx.strokeStyle = GATE_SELECTED_OUTLINE_COLOR;
        }
        else {
            ctx.fillStyle = GATE_COLOR;
            ctx.strokeStyle = GATE_OUTLINE_COLOR;
        }
        const pos = worldToScreen(block.x, block.y);
        const gate_height = Math.max(blockType.inputPinNames.length, blockType.outputPinNames.length);
        const gate_width = 1;
        const block_topleft = {
            x: pos.x - (scale / 2) * gate_width,
            y: pos.y - (scale / 2) * gate_height
        };
        // ctx.fillRect(pos.x, pos.y, scale, scale);
        // draw rounded gate centered around pos
        ctx.beginPath();
        ctx.roundRect(block_topleft.x, block_topleft.y, scale * gate_width, scale * gate_height, 0.15 * scale);
        ctx.fill();
        ctx.stroke();
        // check if mouse is hovering over gate
        if (Math.abs(pos.x - current_mouse_x) < scale / 2 * gate_width && Math.abs(pos.y - current_mouse_y) < scale / 2 * gate_height) {
            hovering_over_block = block;
            hovering_over_pin = null;
            hovering_over_pin_type = null;
        }
        // check block collision with selection box
        if (selecting_box) {
            const block_bottomright = {
                x: block_topleft.x + scale * gate_width,
                y: block_topleft.y + scale * gate_height
            };
            const collides = (selection_screen_topleft.x < block_bottomright.x &&
                selection_screen_topleft.y < block_bottomright.y &&
                selection_screen_topleft.x + selection_screen_width > block_topleft.x &&
                selection_screen_topleft.y + selection_screen_height > block_topleft.y);
            if (collides && !gates_selecting.includes(block)) {
                gates_selecting.push(block);
                canvas_dirty = true;
            }
            if (!collides && gates_selecting.includes(block)) {
                gates_selecting.splice(gates_selecting.indexOf(block), 1);
                canvas_dirty = true;
            }
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = PIN_COLOR;
        ctx.fillStyle = PIN_COLOR;
        // render connections
        for (let pinIndex = 0; pinIndex < block.outputs.length; pinIndex++) {
            for (let connectionIndex = 0; connectionIndex < block.outputs[pinIndex].length; connectionIndex++) {
                // find the block that this pin is connected to
                const connectedBlock = getBlockById(block.outputs[pinIndex][connectionIndex]);
                if (gates_selected.includes(connectedBlock) || gates_selecting.includes(connectedBlock) || this_block_sel) {
                    ctx.lineWidth = 3;
                }
                else {
                    ctx.lineWidth = 1;
                }
                if (!connectedBlock) {
                    console.error("Could not find connected block: " + block.outputs[pinIndex][connectionIndex]);
                    return;
                }
                // find the pin index of the connected block
                for (let ingoingPinIndex = 0; ingoingPinIndex < connectedBlock.inputs.length; ingoingPinIndex++) {
                    if (connectedBlock.inputs[ingoingPinIndex].includes(block.id)) {
                        // draw connection
                        const start = worldToScreen(block.x + .625, block.y + pinIndex - (blockType.outputPinNames.length - 1) / 2);
                        const end = worldToScreen(connectedBlock.x - .625, connectedBlock.y + ingoingPinIndex - (blockType.inputPinNames.length - 1) / 2);
                        drawConnection(ctx, start, end, null, scale);
                    }
                }
            }
        }
    }
    // render dragging connection
    if (dragging_connection) {
        let direction = null;
        let start = null;
        let end = null;
        if (dragging_connection_direction === "output") {
            start = worldToScreen(dragging_connection_block.x + .625, dragging_connection_block.y + dragging_connection_pin - (dragging_connection_block.outputs.length - 1) / 2);
            end = {
                x: current_mouse_x,
                y: current_mouse_y
            };
            direction = "output";
        }
        else {
            start = {
                x: current_mouse_x,
                y: current_mouse_y
            };
            end = worldToScreen(dragging_connection_block.x - .625, dragging_connection_block.y + dragging_connection_pin - (dragging_connection_block.inputs.length - 1) / 2);
            direction = "input";
        }
        if (hovering_over_pin_type !== null && hovering_over_pin_type !== dragging_connection_direction) {
            direction = null;
            if (hovering_over_pin_type == "input") {
                end = worldToScreen(hovering_over_block.x - .625, hovering_over_block.y + hovering_over_pin - (hovering_over_block.inputs.length - 1) / 2);
            }
            if (hovering_over_pin_type == "output") {
                start = worldToScreen(hovering_over_block.x + .625, hovering_over_block.y + hovering_over_pin - (hovering_over_block.outputs.length - 1) / 2);
            }
        }
        drawConnection(ctx, start, end, direction === null ? null : (direction === "output" ? "start" : "end"), scale);
    }
    // render selection box
    if (selecting_box) {
        ctx.fillStyle = SELECT_BOX_COLOR;
        ctx.strokeStyle = SELECT_BOX_OUTLINE_COLOR;
        // draw rect
        ctx.beginPath();
        ctx.rect(selection_screen_topleft.x, selection_screen_topleft.y, selection_screen_width, selection_screen_height);
        ctx.fill();
        ctx.stroke();
        // ctx.fillRect(selection_screen_topleft.x, selection_screen_topleft.y, selection_screen_width, selection_screen_height);
    }
    // render side panel
    ctx.fillStyle = SIDE_PANEL_COLOR;
    ctx.fillRect(0, 0, sidebarWidth, canvas.height);
    ctx.fillStyle = SIDE_PANEL_TEXT_COLOR;
    // render block palette on the sidebar
    ctx.font = "20px Arial";
    let y = 0;
    block_option_selected = null;
    for (const block of blockOptions) {
        // calculate bounding box
        const width = sidebarWidth;
        const height = 30;
        const top = y * 30 - sidebar_scroll + 8;
        const left = 0;
        if (current_mouse_x > left && current_mouse_x < left + width && current_mouse_y > top && current_mouse_y < top + height) {
            ctx.fillStyle = SIDE_PANEL_HOVER_COLOR;
            ctx.fillRect(left, top, width, height);
            ctx.fillStyle = SIDE_PANEL_TEXT_COLOR;
            block_option_selected = block;
        }
        ctx.fillText(block.name, 10, y * 30 + 30 - sidebar_scroll);
        y += 1;
    }
}
//# sourceMappingURL=logic_editor.js.map