BG_COLOR = "#282c34";

var uuid = location.pathname.split("/")[2];
var data = null;
var blocks = [];

async function ready() {
    matchSize();
    data = await fetchData();
    blocks = data.data;
    console.log(blocks);
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
