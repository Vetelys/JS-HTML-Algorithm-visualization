var canvas;
var ctx;
var DIM = 600;
var nr_elems = 30;
var offset_x = 100;
var offset_y = 100;
var dim_elem = DIM/nr_elems;

var elems;
var target;
var start;
var algo;
var searching;

window.addEventListener("load", () =>{
    console.log("Document is ready");
    canvas = document.querySelector("#canvas");
    dropdown = document.querySelector("#algorithms")  
    ctx = canvas.getContext("2d");
    searching = false;
    setAlgorithm();

    canvas.addEventListener("mousedown", event =>{
        const rect = canvas.getBoundingClientRect();
        //get grid coordinates x, y
        var pos = {x: Math.floor((event.clientX-rect.left-offset_x)/dim_elem), y: Math.floor((event.clientY-rect.top-offset_y)/dim_elem)};
        if(event.button == 0 && 0 <= pos.x && 0 <= pos.y && pos.x < nr_elems && pos.y < nr_elems){
            if(event.ctrlKey){
                target = pos;
            }
            else{
                start = pos;
            }
            console.log(pos);
            drawMaze();
        }
        if(target && start){
            if(algo == "BFS"){
                BFS(elems, ctx);
            }
        }
    })

    resize();
    loadMaze();
})

function setAlgorithm(){
    algo = dropdown.options[dropdown.selectedIndex].value;
}

function loadMaze(){
    fetch("maze.json", {headers: {'Access-Control-Allow-Origin':'*'}
    })
    .then(response => {
        if(!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(json => {
        elems = json;
        drawMaze();
    })

}


window.addEventListener("resize", () =>{
    //sizing
    resize();
    drawMaze();
})

function resize(){
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    offset_x = canvas.width/2 - 300;
    ctx.rect(offset_x, offset_y, DIM, DIM);
    ctx.stroke();
}

async function drawMaze(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(offset_x, offset_y, DIM, DIM);
    ctx.stroke();

    if(start){
        ctx.fillStyle = "#00FF00"
        ctx.fillRect(offset_x+start.x*dim_elem+2, offset_y+start.y*dim_elem+2, 16, 16);
        ctx.stroke()
    }

    if(target){
        ctx.fillStyle = "#0000FF"
        ctx.fillRect(offset_x+target.x*dim_elem+2, offset_y+target.y*dim_elem+2, 16, 16);
        ctx.stroke()
    }
    
    if(elems){
        for(let y = 0; y < nr_elems; y++){
            for(let x = 0; x < nr_elems; x++){
                ctx.beginPath();
                //draws the top and right corner lines for each square, unless they have been removed by backtracking
                if(!elems[y][x].N){
                    ctx.moveTo(offset_x+x*dim_elem, offset_y+y*dim_elem);
                    ctx.lineTo(offset_x+x*dim_elem+dim_elem, offset_y+y*dim_elem);
                }
                if(!elems[y][x].E){
                    ctx.moveTo(offset_x+x*dim_elem+dim_elem, offset_y+y*dim_elem)
                    ctx.lineTo(offset_x+x*dim_elem+dim_elem, offset_y+y*dim_elem+dim_elem)
                }
                ctx.stroke();          
            }
        }

    }
}
function getNeighbors(x, y){
    var neighbors = []
    elem = elems[y][x];
    if(elem.N){
        neighbors.push({x: x, y: y-1});
    }
    if(elem.E){
        neighbors.push({x: x+1, y: y});
    }
    if(elem.S){
        neighbors.push({x: x, y: y+1});
    }
    if(elem.W){
        neighbors.push({x: x-1, y: y});
    }
    return neighbors;
}


async function BFS(){

    searching = true;
    prev = [];
    for(let y = 0; y < nr_elems; y++){
        var cols = []
        for(let x = 0; x < nr_elems; x++){
            elems[y][x].visited = false;
            cols[x] = null;
        }
        prev[y] = cols;
    }

    var found = false;
    queue = [];
    queue.push(start);
    elems[start.y][start.x].visited = true;

    while(queue.length > 0 && !found && searching){
        await new Promise(r => setTimeout(r, 10));   
        var node = queue.shift();
        var neighbours = getNeighbors(node.x, node.y);
        neighbours.forEach(neighbour =>{
            elem = elems[neighbour.y][neighbour.x];
            if(!elem.visited){
                queue.push(neighbour);
                elem.visited = true;

                if(elem.x == target.x && elem.y == target.y){
                    found = true;
                }else{
                    ctx.fillStyle = "#FFFF00"
                    ctx.fillRect(offset_x+neighbour.x*dim_elem+1, offset_y+neighbour.y*dim_elem+1, 18, 18);
                    ctx.stroke()
                }
                prev[elem.y][elem.x] = node;       
            }
        })
    }

    if(found){
        searching = false; 
        var prev_node = target;
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(offset_x+prev_node.x*dim_elem+8, offset_y+prev_node.y*dim_elem+8, 4, 4);
        ctx.stroke()

        while(prev_node.x != start.x || prev_node.y != start.y){
            var prev_node = prev[prev_node.y][prev_node.x];
            ctx.fillStyle = "#FF0000"
            ctx.fillRect(offset_x+prev_node.x*dim_elem+8, offset_y+prev_node.y*dim_elem+8, 4, 4);
            ctx.stroke()
            await new Promise(r => setTimeout(r, 10));
        }
    }
}
