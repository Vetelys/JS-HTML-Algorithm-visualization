
function download(content, fileName, contentType){
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function saveMaze(){
    var mazedata = JSON.stringify(elems);
    download(mazedata, "maze.json", "application/json")
}