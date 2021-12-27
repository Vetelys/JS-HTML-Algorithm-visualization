var canvas;
var ctx;
var generatebutton;
var DIM = 600;
var nr_elems = 30;
var offset_x = 100;
var offset_y = 100;
var dim_elem = DIM/nr_elems;


var elems;
var backtrack;
var nr_visited;
var generating;

window.addEventListener("load", () =>{
    console.log("Document is ready");
    canvas = document.querySelector("#canvas");
    generatebutton = document.querySelector("#generatebutton");
    ctx = canvas.getContext("2d");
    resize();
})


function generateMaze(){

    if(!generating){
        generatebutton.innerText = "Stop";
        elems = [];
        nr_visited = 0;
        backtrack = [];
        generating = true;

        for(let y = 0; y < nr_elems; y++){
            var cols = [];
            for(let x = 0; x < nr_elems; x++){
                cols[x] = {x: x, y: y, visited: false, N: false, E: false, S: false, W: false};
            }
            elems[y] = cols;
        }
        resize();
        drawMaze();
        var curr = elems[0][0];
        curr.visited = true;
        nr_visited = nr_visited + 1;
        backtrack.push(curr);
        drawLoop(curr);
    }
    else{
        generating = false;
        generatebutton.innerText = "Generate";
    }
};


window.addEventListener("resize", () =>{
    resize();
    drawMaze();
})

async function drawLoop(curr){
    var dir = getNeighbor(curr.x, curr.y);
    if(dir){
        if(dir == "N"){
            curr.N = true;
            curr = elems[curr.y-1][curr.x];
            curr.S = true;
        }
        else if(dir == "E"){
            curr.E = true;
            curr = elems[curr.y][curr.x+1];
            curr.W = true;
        }
        else if(dir == "S"){
            curr.S = true;
            curr = elems[curr.y+1][curr.x];
            curr.N = true;
        }
        else if(dir == "W"){
            curr.W = true;
            curr = elems[curr.y][curr.x-1];
            curr.E = true;
        }
        curr.visited = true;
        nr_visited = nr_visited + 1;
        backtrack.push(curr);
    }
    else{
        backtrack.pop();
        curr = backtrack[backtrack.length - 1];
    }
    await new Promise(r => setTimeout(r, 10));
    drawMaze(curr.x, curr.y, true);
    if(nr_visited < elems.length*elems.length && generating){
        drawLoop(curr);
    }else{
        generating = false;
        generatebutton.innerText = "Generate";
    }
}

function getNeighbor(x, y){
    var dirs = [];

    if(x > 0){
        if(!elems[y][x-1].visited){
            dirs.push("W");
        }
    }
          
    if(y > 0){
        if(!elems[y-1][x].visited){
            dirs.push("N");
        }
    }

    if(x < nr_elems-1){
        if(!elems[y][x+1].visited){
            dirs.push("E");
        }
    }

    if (y < nr_elems-1){
        if(!elems[y+1][x].visited){
            dirs.push("S");
        }
    }

    if(dirs.length == 0){
        return false;
    }else{
        return dirs[Math.floor(Math.random() * dirs.length)];
    }


}


function resize(){
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    offset_x = canvas.width/2 - 300;
    ctx.rect(offset_x, offset_y, DIM, DIM);
    ctx.stroke();;
}

async function drawMaze(curr_x = 0, curr_y = 0, drawrect = false){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(offset_x, offset_y, DIM, DIM);
    ctx.stroke();
    console.log("draw");
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

        if(nr_visited < nr_elems**2 && drawrect){
            ctx.fillStyle = "#FF00FF"
            ctx.fillRect(offset_x+curr_x*dim_elem+2, offset_y+curr_y*dim_elem+2, 16, 16);
            ctx.stroke()
        }
    }
}
