const gameBoard = document.querySelector('#gameboard');
const playerDisplay = document.querySelector('#player');
const infoDisplay = document.querySelector('#info');
const width = 8;
let playerGo = 'black';
playerDisplay.textContent = 'black';

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

const createBoard = () => {
    startPieces.forEach((ele, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.setAttribute('square-id', i);
        // square.firstChild && square.setAttribute('draggable', true);
        square.innerHTML = ele;
        square.firstChild?.setAttribute('draggable', true);
        const row = Math.floor((63 - i) / 8) + 1;
        if (row & 1)
            square.classList.add(i & 1 ? 'beige' : 'brown');
        else
            square.classList.add(i & 1 ? 'brown' : 'beige');
        if (i <= 15)
            square.firstChild.firstChild.classList.add('black');
        else if (i >= 48)
            square.firstChild.firstChild.classList.add('white');
        gameBoard.append(square);
    })
};
createBoard();


const allSquares = document.querySelectorAll('.square');
// console.log(allSquares);
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
});
console.log(document.querySelector(`square-id=${62}`));
let startPositionId, draggedElement;
function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    e.stopPropagation();
    const correctGo = draggedElement.firstChild.classList.contains(playerGo);
    const taken = e.target.classList.contains('piece');
    const opponentGo = playerGo === 'white' ? 'black' : 'white';
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo);
    const isValid = checkValid(e.target);
    // const isValid=true;
    if (correctGo) {

        if (takenByOpponent && isValid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            changePlayer();
            return;
        }
        // cannot go on its same color apne parivaar ko nhi maar sakta
        if (taken && !takenByOpponent) {
            infoDisplay.textContent = "INVALID MOVE";
            setTimeout(() => {
                infoDisplay.textContent = "";
            }, 2000);
            return;
        }
        // Khaali h to add kar do sirf or change kardo player ko
        if (isValid) {
            e.target.append(draggedElement);
            changePlayer();
            return;
        }
        else {
            infoDisplay.textContent = "NOT MOVED";
            setTimeout(() => {
                infoDisplay.textContent = "";
            }, 2000);
        }
    }
    else {
        infoDisplay.textContent = "INVALID MOVE";
        setTimeout(() => {
            infoDisplay.textContent = "";
        }, 2000);
    }
}

const checkValid = (target) => {
    const targetId = Number(target.getAttribute('square-id') || target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement.id;
    // console.log("piece", piece);
    // console.log("color ", draggedElement.firstChild.classList.contains('black') ? 'black' : 'white');
    // console.log("startId", startId);
    // console.log("targetId", targetId);
    switch (piece) {
        case 'pawn':
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
            if (promotion(targetId) || starterRow.includes(startId) && targetId === startId + (width * 2) || (startId + width === targetId && !document.querySelector(`[square-id='${startId + width}']`).firstChild) || (startId + width - 1 === targetId && document.querySelector(`[square-id='${startId + width - 1}']`).firstChild) || (startId + width + 1 === targetId && document.querySelector(`[square-id='${startId + width + 1}']`).firstChild)) return true;
            else return false;
            break;
        case 'king':
            if (startId + 1 === targetId || startId - 1 === targetId || startId + width === targetId || startId - width === targetId || startId + width - 1 === targetId || startId + width + 1 === targetId || startId - width - 1 === targetId ||startId - width + 1 === targetId ) return true;
            break;
        case 'queen':
            if ((Math.abs(targetId - startId) % (width - 1) === 0 && checkVer(startId, targetId, width - 1)) || (Math.abs(targetId - startId) % (width + 1) === 0 && checkVer(startId, targetId, width + 1))) return true;
            else if (((startId + width > targetId || startId - width > targetId) && checkHor(startId, targetId, 1)) || (((targetId - startId) % 8 == 0 || (targetId + startId) % 8 == 0) && checkHor(startId, targetId, width))) return true;
            break;
        case 'rook':
            if (((startId + width > targetId || startId - width > targetId) && checkHor(startId, targetId, 1)) || (((targetId - startId) % 8 == 0 || (targetId + startId) % 8 == 0) && checkHor(startId, targetId, width))) return true;
            break;
        case 'knight':
            if (startId + (width * 2) + 1 || startId - (width * 2) - 1 || startId - (width * 2) + 1 || startId + (width * 2) - 1 || startId + width + 1 || startId - width - 1 || startId - width + 1 || startId + width - 1) return true;
            break;
        case 'bishop':
            if ((Math.abs(targetId - startId) % (width - 1) === 0 && checkVer(startId, targetId, width - 1)) || (Math.abs(targetId - startId) % (width + 1) === 0 && checkVer(startId, targetId, width + 1))) return true;
            break;
        default:
            console.log("This is default case");
            break;
    }
}

// Condition of en passant => if opponent's pawn moves two steps and its position is now beside your pawn
//  then you can move one step diagnally and opponent's pawn get removed from the board in the
//  very next step only.

// const enPassant= (startid,targetId)=>{
//     if(startId > 4*width && document.querySelector(`square-id="${startId+1}"`).firstChild.firstChild.classList.contains())
// }

const promotion=(targetId)=>{
    if(targetId>7*width){
        // console.log("Choose any one of these :");
        // console.log("1. Queen, 2. Rook, 3. Bishop, 4. Knight");
        const value=prompt('Enter your choice :\n1. Queen\n2. Rook\n3. Knight\n4. Bishop');
        const position = document.querySelector(`[square-id='${targetId}']`);
        console.log(position);
        switch (value) {
            case '1':
                position.innerHTML=queen;
                position.remove();
                break;
            case '2':
                position.innerHTML = rook;
                break;
            case '3':
                position.innerHTML = knight;
                break;
            case '4':
                position.innerHTML = bishop;
                position.remove();
                break;
            default:
                console.log('Default ', value);
                break;
        }
        return true;
    }
    return false;
}

const checkHor = (s, t, up) => {
    if (s > t) {
        let temp = s;
        s = t;
        t = temp;
    }
    for (let i = s + up; i < t; i += up) {
        if (document.querySelector(`[square-id='${i}']`).firstChild)
            return false;
    }
    return true;
}

const checkVer = (s, t, up) => {
    if (s > t) {
        let temp = s;
        s = t;
        t = temp;
    }
    for (let i = s + up; i < t; i += up) {
        if (document.querySelector(`[square-id='${i}']`).firstChild)
            return false;
    }
    return true;
}

const changePlayer = () => {
    if (playerGo === 'black') {
        reverseIds();
        playerGo = 'white';
        playerDisplay.textContent = playerGo;
    }
    else {
        revertIds();
        playerGo = 'black';
        playerDisplay.textContent = playerGo;
    }
}

const reverseIds = () => {
    allSquares.forEach((square, i) =>
        square.setAttribute('square-id', 63 - i));
}

const revertIds = () => {
    allSquares.forEach((square, i) =>
        square.setAttribute('square-id', i));
}