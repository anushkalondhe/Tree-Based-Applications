// ----------- NAVIGATION -----------
function show(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

  document.getElementById(sectionId).classList.add("active");
  event.target.classList.add("active");
}

// ----------- EXPRESSION TREE -----------
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function isOperator(x) {
  return ["+", "-", "*", "/"].includes(x);
}

function buildExpressionTree(postfix) {
  let stack = [];
  postfix.forEach(token => {
    let node = new Node(token);
    if (isOperator(token)) {
      node.right = stack.pop();
      node.left = stack.pop();
    }
    stack.push(node);
  });
  return stack.pop();
}

function evaluate(root) {
  if (!root) return 0;
  if (!isOperator(root.value)) return parseFloat(root.value);

  let left = evaluate(root.left);
  let right = evaluate(root.right);

  switch (root.value) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
  }
}

function drawTree(root) {
  const svg = d3.select("#exprSvg");
  svg.selectAll("*").remove();

  const width = 800;
  const height = 500;

  const treeLayout = d3.tree().size([width - 100, height - 100]);

  const rootNode = d3.hierarchy(root, d => {
    let children = [];
    if (d.left) children.push(d.left);
    if (d.right) children.push(d.right);
    return children.length ? children : null;
  });

  treeLayout(rootNode);

  svg.selectAll("line")
    .data(rootNode.links())
    .enter()
    .append("line")
    .attr("x1", d => d.source.x + 50)
    .attr("y1", d => d.source.y + 50)
    .attr("x2", d => d.target.x + 50)
    .attr("y2", d => d.target.y + 50)
    .attr("stroke", "black");

  svg.selectAll("circle")
    .data(rootNode.descendants())
    .enter()
    .append("circle")
    .attr("cx", d => d.x + 50)
    .attr("cy", d => d.y + 50)
    .attr("r", 20)
    .attr("fill", "#6c63ff");

  svg.selectAll("text")
    .data(rootNode.descendants())
    .enter()
    .append("text")
    .attr("x", d => d.x + 50)
    .attr("y", d => d.y + 55)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(d => d.data.value);
}

function buildAndDrawTree() {
  let input = document.getElementById("exprInput").value.trim().split(" ");
  let root = buildExpressionTree(input);
  let result = evaluate(root);

  document.getElementById("exprResult").innerText = result;
  drawTree(root);
}

// ----------- FILE SYSTEM -----------
let fileSystem = {};

function addFolder() {
  let name = document.getElementById("folderName").value;
  if (!name) return;
  fileSystem[name] = {};
  renderTree();
}

function addPath() {
  let path = document.getElementById("pathInput").value.split("/");
  let current = fileSystem;

  path.forEach(folder => {
    if (!current[folder]) current[folder] = {};
    current = current[folder];
  });

  renderTree();
}

function renderTree() {
  const tree = document.getElementById("tree");
  tree.innerHTML = "";

  function createList(obj) {
    let ul = document.createElement("ul");
    for (let key in obj) {
      let li = document.createElement("li");
      li.textContent = key;
      li.appendChild(createList(obj[key]));
      ul.appendChild(li);
    }
    return ul;
  }

  tree.appendChild(createList(fileSystem));
}

function resetFileSystem() {
  fileSystem = {};
  renderTree();
}

// ----------- TIC TAC TOE -----------
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";

function renderBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  board.forEach((cell, i) => {
    let div = document.createElement("div");
    div.classList.add("cell");
    div.innerText = cell;
    div.onclick = () => makeMove(i);
    boardDiv.appendChild(div);
  });
}

function makeMove(i) {
  if (board[i] !== "") return;

  board[i] = "X";
  if (checkWinner("X")) {
    setStatus("You Win!");
    renderBoard();
    return;
  }

  aiMove();
  renderBoard();
}

function aiMove() {
  let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  let move = empty[Math.floor(Math.random() * empty.length)];
  if (move !== undefined) board[move] = "O";

  if (checkWinner("O")) setStatus("AI Wins!");
}

function checkWinner(p) {
  const win = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return win.some(c => c.every(i => board[i] === p));
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  setStatus("");
  renderBoard();
}

renderBoard();