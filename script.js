const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const finalScore = document.getElementById("finalScore");

const play = document.getElementById("playBtn");
const winMenu = document.getElementById("victoryMenu");
const deathMenu = document.getElementById("gameOverMenu");
const startMenu = document.getElementById("startMenu");
const loadingScreen = document.getElementById("loadingScreen");

const topScore = document.getElementById("menuMaxScore");

canvas.width = 800;
canvas.height = 400;

const centerX = canvas.width / 2;
let totalDx = 0;

const gravity = 0.8;
const scrollSpeed = 5;

const acceleration = .3;
const maxSpeed = 5.5;
let gameStarted = false;
let isGameOver = false;
let animationId;

let distanceTraveled = 0;
let hasWon = false;

let goldCoinCollection = 0;
let silverCoinCollection = 0;
let copperCoinCollection = 0;
let score = 0;
let totalScore = 0;
let maxScore = localStorage.getItem('pikusMaxScore') || 0;
topScore.textContent = maxScore;

let coinFrameTimer = 0;
let floatingScores = [];

let lives = 3;
let lastCheckpointX = 0;
let isPaused = false;
let isFrozen = false;
let isCutscene = false; //For victory walk

const sprites = {
    idle: { images: [], frames: 2, path: "idle_frame-" },
    running: { images: [], frames: 6, path: "running_frame-" },
    jump: { images: [], frames: 2, path: "Jump-" }
};

function loadSprites() {
    for (let state in sprites) {
        for (let i = 0; i < sprites[state].frames; i++) {
            let img = new Image();
            img.src = sprites[state].path + i + ".png";
            sprites[state].images.push(img);
        }
    }
}

loadSprites();

const player = {
    x: 100,
    y: 200,
    width: 32,
    height: 48,
    dx: 0,
    dy: 0,
    jumpStrength: -15,
    grounded: false,
    currentPlatform: null,

    state: 'idle',
    frameX: 0,
    maxFrames: 2,
    frameTimer: 0,
    frameInterval: 8,
    facingRight: true,
    isInvisible: false,

    isMovingLeft: false, //For mobile touch
    isMovingRight: false, //For mobile touch
    
    alpha: 1 // To handle fading into the castle
};

//const platformImg = new Image();
//platformImg.src = 'Images/platform_test.png';

const images = {
    ground: new Image(),
    brick: new Image(),
    plat01: new Image(),
    plat02: new Image(),
    pipe: new Image(),
    plat04: new Image(),
    //plat05: new Image(),
    whiteChoco: new Image(),
    chocoPillar: new Image(),

    stair01: new Image(),
    stair02: new Image(),
    stair03: new Image(),
    stair04: new Image(),
    stair05: new Image(),

    movingPlat: new Image(),

    fence01: new Image(),
    tree01: new Image(),
    tree02: new Image(),

    house01: new Image(),
    house02: new Image(),
    coneIce: new Image(),
    ice01: new Image(),
    chocoIce: new Image(),
    cloud01: new Image(),
    cloud02: new Image(),
    cloud03: new Image(),

    finalHouse: new Image(),
    startFlag: new Image(),
    endFlag: new Image(),
    flagPole: new Image(),
    flag: new Image()
};

const heartImg = new Image();
heartImg.src = "heart.png";

images.ground.src = 'ground.png';
images.brick.src = 'brick.png';
images.plat01.src = 'plat_01.png';
images.plat02.src = 'plat_02.png';
images.pipe.src = 'pipe_50.png';
images.plat04.src = 'plat_04.png';
//images.plat05.src = 'Images/platplat_05.png';
images.whiteChoco.src = 'white_choco.png';


images.stair01.src = 'choco_01_40x40.png';
images.stair02.src = 'choco_stair02_40x40.png';
images.stair03.src = 'choco_stair03_40x40.png';
images.stair04.src = 'choco_stair04_40x40.png';
images.stair05.src = 'choco_stair05_40x40.png';
images.chocoPillar.src = 'choco_pillar.png';

images.movingPlat.src = 'plat_03.png';

images.fence01.src = 'fence_1.png';

images.tree01.src = 'tree34.png';
images.tree02.src = 'tree10.png';

images.house01.src = 'house_beige_front.png';
images.house02.src = 'house_grey_front.png';
images.coneIce.src = 'cone_icecream.png';
images.ice01.src = 'iceCream01.png';
images.chocoIce.src = 'iceCream02.png';
images.cloud01.src = 'cloud_01_100x100.png';
images.cloud02.src = 'cloud_02_100x100.png';
images.cloud03.src = 'cloud_03_100x100.png';
images.finalHouse.src = 'pikus_castle.png';
images.startFlag.src = 'Start_flag_1024x1024.png';
images.endFlag.src = 'finish_flag_1024x1024.png';
images.flagPole.src = 'flag_pole.png';
images.flag.src = 'flag_finale_NEW.png';


let platforms = [
    { x: 0, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 372.5, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both'  },
    { x: 744.5, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 1260, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 1735, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 2107.5, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 2479, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 2851, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 3223, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 3595, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 3967, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 4500, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 4872, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 5244, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 5616, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 5988, y: 350, w: 372, h: 50, img: images.ground, isSolid: true, type: 'both' },
    { x: 6550, y: 350, w: 372, h: 50, img: images.ground, isSolid: true , type: 'both'},
    { x: 10146, y: 350, w: 372, h: 50, img: images.ground, isSolid: true , type: 'both'},
    { x: 10518, y: 350, w: 372, h: 50, img: images.ground, isSolid: true , type: 'both'},
    { x: 10890, y: 350, w: 372, h: 50, img: images.ground, isSolid: true , type: 'both'},
    { x: 11262, y: 350, w: 372, h: 50, img: images.ground, isSolid: true , type: 'both'},


    { x: 500, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    //{ x: 500, y: 220, w: 134, h: 50, img: images.brick },
    { x: 2500, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 2634, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3170, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3304, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3338, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3472, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 2700, y: 90, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3300, y: 90, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 3434, y: 90, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 5600, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 5734, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 5948, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 6082, y: 220, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 5734, y: 90, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 5868, y: 90, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },
    { x: 6300, y: 80, w: 134, h: 50, img: images.brick, isSolid: true, type: 'yOnly' },


    { x: 1900, y: 270, w: 452, h: 80, img: images.plat01, isSolid: true, type: 'yOnly' },
    { x: 5000, y: 270, w: 452, h: 80, img: images.plat01, isSolid: true, type: 'yOnly' },
 
    { x: 2020, y: 190, w: 206, h: 80, img: images.plat02, isSolid: true, type: 'yOnly' },
    { x: 5120, y: 190, w: 206, h: 80, img: images.plat02, isSolid: true, type: 'yOnly' },

    { x: 1570, y: 300, w: 53, h: 50, img: images.pipe, isSolid: true, isSolid: true, type: 'both' },
    { x: 2900, y: 300, w: 53, h: 50, img: images.pipe, isSolid: true, type: 'both' },
    { x: 4800, y: 300, w: 53, h: 50, img: images.pipe, isSolid: true, type: 'both' },
    { x: 10296, y: 300, w: 53, h: 50, img: images.pipe, isSolid: true, type: 'both' },

    { x: 4099, y: 310, w: 40, h: 40, img: images.stair01, isSolid: true, type: 'both' },
    { x: 4139, y: 270, w: 40, h: 80, img: images.stair02, isSolid: true, type: 'both' },
    { x: 4179, y: 230, w: 40, h: 120, img: images.stair03, isSolid: true, type: 'both' },
    { x: 4219, y: 190, w: 40, h: 160, img: images.stair04, isSolid: true, type: 'both' },
    { x: 4259, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both'  },
    { x: 4299, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both' },
    { x: 4500, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both' },
    { x: 4540, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both' },
    { x: 4580, y: 190, w: 40, h: 160, img: images.stair04, isSolid: true, type: 'both' },
    { x: 4620, y: 230, w: 40, h: 120, img: images.stair03, isSolid: true, type: 'both' },
    { x: 4660, y: 270, w: 40, h: 80, img: images.stair02, isSolid: true, type: 'both' },
    { x: 4700, y: 310, w: 40, h: 40, img: images.stair01, isSolid: true, type: 'both' },

    { x: 6880, y: 230, w: 40, h: 120, img: images.stair03, isSolid: true, type: 'both' },
    { x: 6840, y: 270, w: 40, h: 80, img: images.stair02, isSolid: true, type: 'both' },
    { x: 6800, y: 310, w: 40, h: 40, img: images.stair01, isSolid: true, type: 'both' },

    { x: 10496, y: 310, w: 40, h: 40, img: images.stair01, isSolid: true, type: 'both' },
    { x: 10536, y: 270, w: 40, h: 80, img: images.stair02, isSolid: true, type: 'both' },
    { x: 10576, y: 230, w: 40, h: 120, img: images.stair03, isSolid: true, type: 'both' },
    { x: 10616, y: 190, w: 40, h: 160, img: images.stair04, isSolid: true, type: 'both' },
    { x: 10656, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both' },
    { x: 10696, y: 150, w: 40, h: 200, img: images.stair05, isSolid: true, type: 'both' },

    { x: 6920, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 6986, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7052, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7118, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7184, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7250, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7316, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },
    { x: 7382, y: 230, w: 66, h: 50, img: images.plat04, isSolid: true, type: 'both' },

    { x: 7510, y: 150, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 7608, y: 150, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 7900, y: 250, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 7998, y: 250, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 9450, y: 150, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 9548, y: 150, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 9800, y: 200, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },
    { x: 9898, y: 200, w: 98, h: 50, img: images.whiteChoco, isSolid: true, type: 'both' },

    { x: 7540, y: 200, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7608, y: 200, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7540, y: 264, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7608, y: 264, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7540, y: 328, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7608, y: 328, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7540, y: 392, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7608, y: 392, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7930, y: 300, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7930, y: 364, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7998, y: 300, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 7998, y: 364, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9480, y: 200, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9548, y: 200, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9480, y: 264, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9548, y: 264, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9480, y: 328, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9548, y: 328, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9480, y: 392, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9548, y: 392, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9830, y: 250, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9898, y: 250, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9830, y: 314, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9898, y: 314, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9830, y: 378, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },
    { x: 9898, y: 378, w: 68, h: 64, img: images.chocoPillar, isSolid: true, type: 'both' },


    { x: 8200, y: 230, w: 192, h: 33, img: images.movingPlat, isSolid: false,  isMoving: true, startX: 8200, range: 400, speed: 2, direction: 1, deltaX: 0 },
    { x: 9200, y: 200, w: 192, h: 33, img: images.movingPlat, isSolid: false,  isMoving: true, startX: 8800, range: 400, speed: 2, direction: -1, deltaX: 0 },
];

let backgroundProps = [
    { x: 260, y: 90, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },
    { x: 800, y: 100, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },
    { x: 1200, y: 100, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },
    { x: 2000, y: 100, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },
    { x: 3000, y: 80, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },
    { x: 4000, y: 70, w: 100, h: 100, img: images.cloud01, type: 'cloud', speed: 0.3 },

    { x: 400, y: 50, w: 100, h: 100, img: images.cloud02, type: 'cloud', speed: 0.3 },
    { x: 1000, y: 80, w: 100, h: 100, img: images.cloud02, type: 'cloud', speed: 0.3 },
    { x: 2100, y: 50, w: 100, h: 100, img: images.cloud02, type: 'cloud', speed: 0.3 },
    { x: 3200, y: 40, w: 100, h: 100, img: images.cloud02, type: 'cloud', speed: 0.3 },
    { x: 4500, y: 70, w: 100, h: 100, img: images.cloud02, type: 'cloud', speed: 0.3 },

    { x: 750, y: 20, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },
    { x: 1550, y: 30, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },
    { x: 2550, y: 20, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },
    { x: 2850, y: 120, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },
    { x: 3550, y: 10, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },
    { x: 1750, y: 80, w: 100, h: 100, img: images.cloud03, type: 'cloud', speed: 0.3 },

    { x: 190, y: 122, w: 129, h: 230, img: images.tree01, speed: 0.7 },

    { x: 1220, y: 122, w: 106, h: 241, img: images.tree02, speed: 0.85 },
    { x: 2600, y: 122, w: 106, h: 241, img: images.tree02, speed: 0.85 },
    { x: 3300, y: 122, w: 106, h: 241, img: images.tree02, speed: 0.85 },
    { x: 3408, y: 135, w: 106, h: 241, img: images.tree02, speed: 0.85 },
    { x: 5650, y: 135, w: 106, h: 241, img: images.tree02, speed: 0.85 },

    { x: 3200, y: 235, w: 102, h: 115, img: images.house01, speed: 0.85 },
    { x: 320, y: 190, w: 102, h: 174, img: images.house02, speed: 0.7 },

    { x: 150, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.8 },
    { x: 280, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.8 },
    { x: 373, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.8 },
    { x: 1300, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 1373, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 3500, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 3623, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 3696, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 3819, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 2800, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 2873, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 2966, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 6260, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },
    { x: 6353, y: 331, w: 73, h: 19, img: images.fence01, speed: 0.95 },

    { x: 800, y: 120, w: 160, h: 320, img: images.coneIce, speed: 0.85 },

    { x: 2000, y: 120, w: 160, h: 320, img: images.ice01, speed: 0.85 },

    { x: 4650, y: 80, w: 160, h: 320, img: images.chocoIce, speed: 0.85 },

    { x: 10580, y: 100, w: 100, h: 100, img: images.flag, type: 'flagImg', speed: 0.95 },
    { x: 10550, y: 10, w: 200, h: 200, img: images.flagPole, speed: 0.95 },
    

    //{ x: 100, y: 252, w: 118, h: 98, img: images.finalHouse, speed: 0.9 }
    { x: 10500, y: 95, w: 257, h: 256, img: images.finalHouse, speed: 0.95 },

    { x: 40, y: 120, w: 256, h: 256, img: images.startFlag, speed: 0.95 },
    { x: 10330, y: 120, w: 256, h: 256, img: images.endFlag, speed: 0.95 }
    
];

const enHeight = 35;
const enWidth = 35;

let enemies = [
    { x: 2000, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: 1, startX: 2000, range: 200, hp: 1, frame: 0 },
    { x: 1830, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: -1, startX: 2100, range: 270, hp: 1, frame: 0 },
    { x: 3200, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: 1, startX: 3200, range: 200, hp: 1, frame: 0 },
    { x: 3000, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: -1, startX: 3400, range: 400, hp: 1, frame: 0 },
    { x: 5100, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: 1, startX: 5100, range: 200, hp: 1, frame: 0 },
    { x: 5400, y: 316, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: -1, startX: 5600, range: 200, hp: 1, frame: 0 },
    { x: 7600, y: 116, w: enWidth, h: enHeight, type: 'patrolEn', speed: 2, dir: 1, startX: 7600, range: 100, hp: 1, frame: 0 },
    { x: 9530, y: 116, w: enWidth, h: enHeight, type: 'patrolEn', speed: 1, dir: 1, startX: 9530, range: 100, hp: 1, frame: 0 },
    { x: 9430, y: 116, w: enWidth, h: enHeight, type: 'patrolEn', speed: -1, dir: 1, startX: 9530, range: 100, hp: 1, frame: 0 },

    { x: 700, y: 316, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 700, range: 200, hp: 2, frame: 0 },
    { x: 2600, y: 316, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 2600, range: 250, hp: 2, frame: 0 },
    { x: 3800, y: 316, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 3800, range: 250, hp: 2, frame: 0 },
    { x: 3410, y: 56, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 3410, range: 110, hp: 2, frame: 0 },
    { x: 5850, y: 56, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 5850, range: 120, hp: 2, frame: 0 },
    { x: 5600, y: 316, w: enWidth, h: enHeight, type: 'strongEn', speed: 1, dir: 1, startX: 5600, range: 250, hp: 2, frame: 0 },
    

    
    { x: 6230, y: 150, w:35, h: 35, type: 'flyerEn', speed: 6, dir: 1, timer: 0, startY: 150, hp: 1, frame: 0 },

    { x: 2903.5, y: 315, w: 46, h: 48, type: 'pipeEn', state: 'hiding', timer: 0, originY: 315, frame: 0 },
    { x: 10296.5, y: 315, w: 46, h: 48, type: 'pipeEn', state: 'hiding', timer: 0, originY: 315, frame: 0 },
];

const enemySprites = {
    patrolEn: [],
    strongEn: [],
    flyerEn: [],
    pipeEn: [] 
};

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

for (let i = 1; i <= 2; i++) {
    enemySprites.patrolEn.push(loadImage(`enemy01_0${i}.png`));
    enemySprites.strongEn.push(loadImage(`enemy02_0${i}.png`));
    enemySprites.flyerEn.push(loadImage(`enemy04_0${i}.png`));
    enemySprites.pipeEn.push(loadImage(`pipe_enemy_46X48_0${i}.png`));
}

const enemyKillPoints = { patrolEn: 15, strongEn: 30, flyerEn: 60 };

//enemySprites.pipeEn.push(loadImage(`Images/enemy03_01.png`));

//GAME SOUNDS HERE
const coinSound = new Audio('chieuk-coin-257878.mp3');
const jumpSound = new Audio('dragon-studio-cartoon-jump-463196.mp3');
const gameOverSound = new Audio('ribhavagrawal-game-over-2-sound-effect-230463.mp3');
const gameOverMaleSound = new Audio('game-over-deep-male-voice-clip-352695.mp3');
const victorySound = new Audio('scratchonix-victory-chime-366449.mp3');
const landingOnEnemySound = new Audio('stepir44-hurt-sound-435314.mp3');
const enemyDieSound = new Audio('666herohero-monster-death-grunt-131480.mp3');

let hasPlayedStartSound = false;
const letsGoSound = new Audio('universfield-letx27s-go-352481.mp3');
let showStartText = false;
let startTextOpacity = 1.0;

const mainBGSound = new Audio('happy-day-113985.mp3');
mainBGSound.loop = true;
mainBGSound.volume = 0.4;

const watchOutSound = new Audio('universfield-watch-out-352456.mp3');
let canPlayWarning = true; //cooldown for the warning sound

let highscoreReached = false;
const cheerSound = new Audio('floraphonic-woman-excited-cheers-and-phrases-says-woohoo-186739.mp3');

const enemyCollideSound = new Audio('shock-gasp-female-383751.mp3');

const respawnSound = new Audio('alex_jauk-8bit-flicker-noise-293080.mp3');

const checkpoint1Sound = new Audio('faespencer-youx27re-doing-a-good-job-femalespoken-212818.mp3');
const checkpoint2Sound = new Audio('faespencer-awesome-femalespoken-212884.mp3');

mainBGSound.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

const coinSprites = {
    gold: [],
    copper: [],
    silver: [],
};

for (let i = 1; i <= 4; i++) {
    coinSprites.gold.push(loadImage(`goldCoin_24x28_0${i}.png`));
    coinSprites.silver.push(loadImage(`silverCoin_24x28_0${i}.png`));
    coinSprites.copper.push(loadImage(`copperCoin_24x28_0${i}.png`));
}

let coins = [
    { x: 700, y: 100, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 740, y: 100, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 780, y: 100, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 820, y: 100, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 860, y: 100, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 2690, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 2730, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 2770, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 2810, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 3300, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 3340, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 3380, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 3420, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5760, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5800, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5840, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5880, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5920, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 5960, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 6310, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 6350, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 6390, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8300, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8340, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8380, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8420, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8460, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8500, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8540, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8580, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8620, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8660, y: 50, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8760, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8800, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8840, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8880, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8920, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 8960, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9000, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9040, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9080, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9120, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9160, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9200, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },
    { x: 9240, y: 40, w: 24, h: 28, type: 'gold', frame: 0 },

    { x: 510, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 550, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 590, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2030, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2070, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2110, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2150, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2190, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2520, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2560, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2600, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2640, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2680, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 2720, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3180, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3220, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3260, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3330, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3370, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3410, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3450, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3530, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 3570, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5130, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5170, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5210, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5250, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5290, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5600, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5640, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5720, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5760, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5800, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5840, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5950, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 5990, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 6030, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 6070, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 6150, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 6190, y: 180, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7750, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7790, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7830, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7870, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7910, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 7950, y: 100, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9760, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9800, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9840, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9880, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9920, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 9960, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 10000, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 10040, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 10080, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },
    { x: 10120, y: 150, w: 24, h: 28, type: 'silver', frame: 0 },

    { x: 460, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 500, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 540, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 580, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 620, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 1920, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 1960, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2000, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2040, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2080, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2120, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2160, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2200, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2240, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2280, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 2320, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3200, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3240, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3280, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3320, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3360, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3400, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3440, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3480, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3520, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 3560, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },

    { x: 5000, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5040, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5080, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5160, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5200, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5240, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5280, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5350, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5390, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5430, y: 230, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5750, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5790, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5830, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5870, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5910, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5950, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 5990, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 6030, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 6070, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 6110, y: 310, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7000, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7040, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7080, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7120, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7160, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7200, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7240, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7280, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7320, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
    { x: 7360, y: 180, w: 24, h: 28, type: 'copper', frame: 0 },
];

const coinValues = { gold: 100, silver: 50, copper: 10 };


const keys = {};

play.addEventListener('click', startLoading);

function startGame() {
    gameStarted = true;
    mainBGSound.currentTime = 0;
    mainBGSound.play();
}

function startLoading() {
    startMenu.style.display = "none";
    loadingScreen.style.display = "flex";

    let progress = 0;
    const bar = document.getElementById("progressBar");

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        bar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.display = "none";
                startGame();
            }, 500);
        }
    }, 150);
}

function openHowTo() {
    startMenu.style.display = "none";
    document.getElementById("howToMenu").style.display = "flex";
}

function closeHowTo() {
    document.getElementById("howToMenu").style.display = "none";
    startMenu.style.display = "flex";
}

function animatePlayer() {
    let oldState = player.state;

    if (!player.grounded) {
        player.state = 'jump';
    } else if (Math.abs(player.dx) > 0.1) {
        player.state = 'running';
    } else {
        player.state = 'idle';
    }

    if (oldState !== player.state) {
        player.frameX = 0;
        player.frameTimer = 0;
    }

    if (player.state === 'jump') {
        player.frameX = (player.dy < 0) ? 0 : 1;
    } else {
        player.frameTimer++;
        if (player.frameTimer % player.frameInterval === 0) {
            player.frameX = (player.frameX + 1) % sprites[player.state].frames;
        }
    }

    if (player.dx > 0) player.facingRight = true;
    else if (player.dx < 0) player.facingRight = false;
}

function isColliding(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        //a.y + a.height <= b.y + a.dy &&
        //a.y + a.height + a.dy >= b.y
        a.y < b.y + b.h &&
        a.y + a.height > b.y
    );   
}

function updateEnemies(deltaTime) {
    enemies.forEach((en, index) => {
        if (en.type === 'patrolEn' || en.type === 'strongEn') {
            en.x += 2 * en.dir * deltaTime * 60;
            if (Math.abs(en.x - en.startX) > en.range) en.dir *= -1;
        } else if (en.type === 'flyerEn') {
            if (en.timer > 0) {
                //en.timer--;
                en.timer -= deltaTime * 60;
            } else {
                en.y += en.speed * en.dir * deltaTime * 60;
                if (en.y > 315) {
                    en.y = 315;
                    en.dir = -1;
                    en.timer = 60;
                } else if (en.y < en.startY - 150) {
                    en.dir = 1;
                    en.timer = 60;
                }
            }
        } else if (en.type === 'pipeEn') {
            //let parentPipe = platforms.find(p => Math.abs(p.x - en.x) < 80);
            //if (parentPipe) {
            //    en.x = parentPipe.x + 3.5;
            //}
            en.timer++;
            if (en.timer > 120) {
                en.state = (en.state === 'hiding') ? 'popping' : 'hiding';
                en.timer = 0;
            }
            if (en.state === 'popping') {
                if (en.y > en.originY - 60) {
                    en.y -= 2;
                }
            }
            if (en.state === 'hiding') {
                if (en.y < en.originY) {
                    en.y += 2;
                }
            }
            //if (en.state === 'hiding' && en.y < en.originY) en.y += 2;
        }

        if (player.x === centerX && totalDx > 0) {
            en.x -= totalDx;
            if (en.startX !== undefined) en.startX -= totalDx;
        }


        if (isColliding(player, en)) {
            let stampZone = en.y + 15;
            if (player.dy > 0 && (player.y + player.height) <= stampZone + player.dy && en.type !== 'pipeEn') {
                player.dy = -12;
                player.y -= 10;
                en.hp--;
                landingOnEnemySound.currentTime = 0;
                landingOnEnemySound.volume = 0.6;
                if (en.type === 'patrolEn') landingOnEnemySound.playbackRate = 0.3;
                else if (en.type === 'flyerEn') landingOnEnemySound.playbackRate = 0.7;
                else landingOnEnemySound.playbackRate = 1.0;

                landingOnEnemySound.play();
                if (en.hp <= 0) {
                    let enKillScore = enemyKillPoints[en.type];
                    score += enKillScore;
                    updateHighScore();

                    floatingScores.push({
                        x: en.x + en.w / 2,
                        y: en.y,
                        value: enKillScore,
                        opacity: 1.0,
                        life: 60
                    });
                    setTimeout(() => {
                        enemyDieSound.currentTime = 0;
                        enemyDieSound.volume = 1.0;
                        enemyDieSound.play();
                    }, 80);
                    
                    enemies.splice(index, 1);
                }
                return;
            } else if (!player.isInvisible) {
                gameOver();
                
            }
        }

        let warningZone = {
            //Reduce the horizontal buffer
            x: en.x - 10,

            //Set Y and H exactly to the enemy's y and h
            //This removes the Y-axis warning zone
            y: en.y,
            w: en.w + 20,
            h: en.h
        };

        if (isColliding(player, warningZone) && canPlayWarning && !isGameOver && !player.isInvisible) {
            //console.log("DETECTED");
            watchOutSound.play();

            //COOLDOWN: Don't play again for 2 seconds
            //so it's not annoying if there are many enemies
            canPlayWarning = false;
            setTimeout(() => {
                canPlayWarning = true;
            }, 2000);
        }
    });
}

function updateFloatingScore(deltaTime) {
    for (let i = floatingScores.length - 1; i>=0; i--) {
        let fs = floatingScores[i];

        fs.y -= 1 * deltaTime * 60;
        fs.opacity -= 0.02 * deltaTime * 60;
        fs.life -= deltaTime * 60;

        if (player.x === centerX && totalDx > 0) {
            fs.x -= totalDx;
        }

        if (fs.life <= 0 || fs.opacity <= 0) {
            floatingScores.splice(i, 1);
        }
    }
}

function update(deltaTime) {
    if (!gameStarted || isGameOver || isPaused) return;

    let platformDelta = 0;

    if (!hasPlayedStartSound && (keys["ArrowRight"] || keys["ArrowLeft"])) {
        letsGoSound.play();
        hasPlayedStartSound = true;
        
        let textElem = document.getElementById("startText");
        textElem.classList.add("animate-go");
    }


    platforms.forEach(p => {
        if (p.isMoving) {
            let oldX = p.x;
            p.x += p.speed * p.direction * deltaTime * 60;

            if (p.x > p.startX + p.range || p.x < p.startX) {
                p.direction *= -1;
            }
            p.deltaX = p.x - oldX;
        } else {
            p.deltaX = 0;
        }
    });



    if (isCutscene) {
        return;
    }
    else if (keys["ArrowRight"]) {
        //player.dx = scrollSpeed;
        player.dx += acceleration * deltaTime * 60;
        //player.dx += accelPerSec * deltaTime ;
        if (player.dx > maxSpeed) player.dx = maxSpeed;
    } else if (keys["ArrowLeft"]) {
        //player.dx = -scrollSpeed;
        player.dx -= acceleration * deltaTime * 60;
        //player.dx -= accelPerSec * deltaTime;
        if (player.dx < -maxSpeed) player.dx = -maxSpeed;
    } else {
        player.dx *= Math.pow(0.85, deltaTime * 60);
        if (Math.abs(player.dx) < 1) player.dx = 0;
    }

    player.x += player.dx * deltaTime * 60;
    
    platforms.forEach(platform => {
        if (platform.isSolid && platform.type === 'both') {
            if (isColliding(player, platform)) {
                if (player.dx > 0) player.x = platform.x - player.width;
                else if (player.dx < 0) player.x = platform.x + platform.w;
                player.dx = 0;
            }
        }
    });

    player.dy += gravity * deltaTime * 60;
    player.y += player.dy * deltaTime * 60;
    player.grounded = false;
    //player.currentPlatform = null;

    platforms.forEach(platform => {
        
        if (isColliding(player, platform)) {
            if (player.dy >= 0 && (player.y + player.height - player.dy) <= platform.y + 10) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
                if (platform.isMoving) {
                    platformDelta = platform.deltaX;
                } 
            }
            else if (platform.type === 'both' && player.dy < 0) {
                player.y = platform.y + platform.h;
                player.dy = 1;
            }
        }
    });

    totalDx = player.dx * deltaTime * 60 + platformDelta;
    

    if (player.x < centerX) {
        player.x += totalDx;

        if (player.x < 0) {
            player.x = 0;
            player.dx = 0;
        }
    }
    else if (totalDx > 0) {
        player.x = centerX;

        platforms.forEach(p => {
            p.x -= totalDx;
            if (p.isMoving) {
                p.startX -= totalDx;
            } 
        });

        backgroundProps.forEach(bg => {
            bg.x -= totalDx * bg.speed;
        });
        distanceTraveled += totalDx;
    }
    else {
        player.x += totalDx;
    }

    if (keys['Space'] && player.grounded && !isCutscene) {
        player.dy = player.jumpStrength;
        player.grounded = false;
        jumpSound.currentTime = 0;
        jumpSound.volume = 0.8;
        jumpSound.play();
    }

    animatePlayer();

    if (player.y > canvas.height) {
        if (!isGameOver) {
            gameOver();
        }    
    }
    platforms = platforms.filter(p => p.x + p.w > -500);
    backgroundProps = backgroundProps.filter(bg => bg.x + bg.w > -500);
    enemies = enemies.filter(en => en.x + en.w > -500);

    updateEnemies(deltaTime);

    
    coinFrameTimer++;
    if (coinFrameTimer % 12 === 0) {
        enemies.forEach(en => {
            let totalFrames = enemySprites[en.type].length;
            en.frame = (en.frame + 1) % totalFrames;
        });
    }
    //coins logic
    if (coinFrameTimer % 8 === 0) {
        coins.forEach(c => {
            c.frame = (c.frame + 1) % coinSprites[c.type].length;
        });
    }

    for (let i = coins.length - 1; i>= 0; i--) {
        let c = coins[i];

        if (player.x === centerX && totalDx > 0) {
            c.x -= totalDx;
        }

        if (isColliding(player, c)) {
            let coinEffect = coinSound.cloneNode();
            coinEffect.volume = 0.5;
            if (c.type === 'gold') {
                coinEffect.playbackRate = 0.8;
                goldCoinCollection++;
                document.getElementById('goldCount').textContent = "x" + goldCoinCollection;
            } else if (c.type === 'silver') {
                coinEffect.playbackRate = 1.0;
                silverCoinCollection++;
                document.getElementById('silverCount').textContent = "x" + silverCoinCollection;
            } else {
                coinEffect.playbackRate = 1.2;
                copperCoinCollection++;
                document.getElementById('copperCount').textContent = "x" + copperCoinCollection;
            }
            coinEffect.play();

            let coinVal = coinValues[c.type];
            score += coinVal;
            updateHighScore();

            floatingScores.push({
                x: c.x + c.w / 2,
                y: c.y,
                value: coinVal,
                opacity: 1.0,
                life: 60
            });
            coins.splice(i, 1);
        }
    }

    updateFloatingScore(deltaTime);

    if (distanceTraveled > 2000 && lastCheckpointX < 2000) {
        lastCheckpointX = 2000;

        score += 50;
        updateHighScore();

        checkpoint1Sound.currentTime = 0;
        checkpoint1Sound.play();
        //console.log("Checkpoint 1 Reached!");
    }
    if (distanceTraveled > 6000 && lastCheckpointX < 6000) {
        lastCheckpointX = 6000;

        score += 100;
        updateHighScore();

        checkpoint2Sound.currentTime = 0;
        checkpoint2Sound.play();
        //console.log("Checkpoint 2 Reached!");
    }

    if (distanceTraveled >= 10600 && !hasWon) {
        hasWon = true;
        score += 500;
        updateHighScore();
        victory();
    }

    
}

let flagY = 100;
let targetFlagY = 25;
let isHoisting = false;

function victory() {
    hasWon = true;
    isCutscene = true;
    isHoisting = true;
    player.dx = 2;
    player.state = 'running';

    mainBGSound.pause();
    mainBGSound.currentTime = 0;

    victorySound.currentTime = 0;
    victorySound.play();

    player.isMovingRight = false;
    player.isMovingLeft = false;
    player.facingRight = true;

    setTimeout(() => {
        const walkToDoor = setInterval(() => {

            player.x += player.dx;

            animatePlayer();
            backgroundProps.forEach(flag => {
                if (flag.type === 'flagImg') {
                    if (flagY > targetFlagY) {
                        flag.y -= 1.5;
                    }
                }
            })
            if (flagY > targetFlagY) {
                flagY -= 1.5;
            }

            if (player.x >= 750) {
                clearInterval(walkToDoor);
                player.dx = 0;
                player.state = 'idle';
                isGameOver = true;
                totalScore = score;
                finalScore.textContent = `Score: ${totalScore}`;
                winMenu.style.display = "block";
            }
        }, 20);
    }, 1000);   
}

function gameOver() {
    if (isGameOver) return;

    lives--;
    updateLivesUI();

    if (lives > 0) {
        respawnPlayer();
    } else {
        isGameOver = true;

        mainBGSound.pause();
        mainBGSound.currentTime = 0;

        gameOverSound.currentTime = 0;
        gameOverSound.play();

        setTimeout(() => {
            gameOverMaleSound.currentTime = 0;
            gameOverMaleSound.play();
        }, 2000);
        
        deathMenu.style.display = "block";

        player.dy = 0;

    }
    
}

function respawnPlayer() {
    isPaused = true;
    isFrozen = true;

    enemyCollideSound.currentTime = 0;
    enemyCollideSound.play();

    player.isInvisible = true;
    setTimeout(() => {
        respawnSound.currentTime = 0;
        respawnSound.play();

        player.x = 100;
        player.y = 100;
        player.dy = 0;

        isPaused = false;
        isFrozen = false;
    }, 2000);

    setTimeout(() => {player.isInvisible = false;}, 5000);

    enemies.forEach(en => {
        if (en.type === 'strongEn') en.hp = 2;
    });

}

function updateHighScore() {
    if (score > maxScore) {
        if (!highscoreReached) {
            cheerSound.play();

            const recordText = document.getElementById("newRecordText");
            recordText.classList.add("animate-record");

            highscoreReached = true;
        }
        maxScore = score;
        localStorage.setItem('pikusMaxScore', maxScore);
        topScore.innerText = maxScore;
        
    }

}

function clearHighScore() {
    if (confirm("Are you sure you want to delete your high score?")) {
        localStorage.removeItem('pikusMaxScore');
        maxScore = 0;
        topScore.innerText = "0";
        alert("High score cleared!");
        location.reload();
    }
}

function resetFreshGame() {
    
    hasWon = false;
    lives = 3;
    distanceTraveled = 0;
    lastCheckpointX = 0;
    score = 0;
    isGameOver = false;

    highscoreReached = false;

    //player.x = 100;
    //player.y = 100;
    //player.dy = 0;

    //winMenu.style.display = "none";
    //deathMenu.style.display = "none";
    //startMenu.style.display = "none";

    //gameStarted = true;
    location.reload();
}

function updateLivesUI() {
    const heartSize = 30;
    const heartPadding = 10;
    const heartStartX = 20;
    const heartStartY = 25;

    for (let i = 0; i < lives; i++) {
        if (heartImg.complete) {
            ctx.drawImage(
                heartImg,
                heartStartX + (i * (heartSize + heartPadding)),
                heartStartY,
                heartSize, heartSize
            );
        }
    }
    //console.log(lives);
}

function drawEnemiesByType(...typesToDraw) {
    enemies.forEach(en => {
        if (typesToDraw.includes(en.type)) {
            let enSprites = enemySprites[en.type];
            let img = enSprites[en.frame];

            if (!img || !img.complete) return;

            ctx.save();
            ctx.translate(en.x + en.w / 2, en.y + en.h / 2);

            if (en.dir === -1) ctx.scale(-1, 1);

            ctx.drawImage(img, -en.w / 2, -en.h / 2, en.w, en.h);
            ctx.restore();
        }
    });
}

function scoreUI() {
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Consolas";
    ctx.fillText("SCORE: " + score, canvas.width - 170, 30);
    ctx.fillText("MAX SCORE: " + maxScore, canvas.width - 170, 50);
}

function drawSky() {
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    skyGradient.addColorStop(0, "#1e90ff");
    skyGradient.addColorStop(0.5, "#87ceeb");
    skyGradient.addColorStop(1, "#f0f8ff");

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    let sunX = 700;
    let sunY = 80;
    let radius = 40;
    let sunGradient = ctx.createRadialGradient(sunX, sunY, radius * 0.2, sunX, sunY, radius);

    sunGradient.addColorStop(0, "#fff5b1");
    sunGradient.addColorStop(0.5, "#ffcc00");
    sunGradient.addColorStop(1, "rgba(255, 204, 0, 0)");

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function initMobileControls() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const mobileUI = document.getElementById('mobileControls');

    if (!isMobile) {
        if (mobileUI) mobileUI.style.display = 'none';
        return;
    }

    if (mobileUI) mobileUI.style.display = 'flex';

    const controlConfig = [
        { id: 'leftBtn', key: 'ArrowLeft' },
        { id: 'rightBtn', key: 'ArrowRight' },
        { id: 'jumpBtn', key: 'Space' }
    ];

    controlConfig.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keys[button.key] = true;

                if (button.id === 'jumpBtn' && player.grounded && !isCutscene) {
                    player.dy = player.jumpStrength;
                    player.grounded = false;
                    if (typeof jumpSound !== 'undefined') jumpSound.play();
                }
            });

            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                keys[button.key] = false;
            });
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSky();
    //drawSun();

    //ctx.fillStyle = "White";
    //ctx.beginPath();
    //ctx.arc(150, 100, 30, 0, Math.PI * 2);
    //ctx.fill();

    backgroundProps.forEach(bg => {
        if (bg.type === 'cloud') {
            ctx.globalAlpha = 0.8;
        } else {
            ctx.globalAlpha = 1.0;
        }
        ctx.drawImage(bg.img, bg.x, bg.y, bg.w, bg.h);

        ctx.globalAlpha = 1.0;
    });

    drawEnemiesByType('pipeEn');
 
    platforms.forEach(p => {
        if (p.x + p.w > 0 && p.x < canvas.width) {
            if (p.img.complete) {
                //ctx.fillRect(p.x, p.y, p.w, 50);
                ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
            } else {
                ctx.fillStyle = "#634d35";
                ctx.fillRect(p.x, p.y, p.w, p.h);
            } 
        }
    });

    drawEnemiesByType('patrolEn', 'strongEn', 'flyerEn');

    floatingScores.forEach(fs => {
        ctx.save();
        ctx.globalAlpha = fs.opacity;
        ctx.fillStyle = "black";
        ctx.font = "bold 20px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText("+" + fs.value, fs.x, fs.y);
        ctx.restore();
    });

    coins.forEach(c => {
        let currentImg = coinSprites[c.type][c.frame];
        ctx.drawImage(currentImg, c.x, c.y, c.w, c.h);
    });
    
    scoreUI();
    updateLivesUI();

    /*ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);*/


    const stateObj = sprites[player.state];
    const currentImg = stateObj.images[player.frameX];

    if (currentImg && currentImg.complete) {
        ctx.save();

        if (player.isInvisible && !isFrozen) {
            if (Math.floor(coinFrameTimer / 5) % 2 === 0) {
                ctx.globalAlpha = 0.2;
            } else {
                ctx.globalAlpha = 1;
            }
        }

        if (!player.facingRight) {
            ctx.translate(Math.floor(player.x) + player.width, Math.floor(player.y));
            ctx.scale(-1, 1);
            ctx.drawImage(currentImg, 0, 0, player.width, player.height);
        } else {
            ctx.drawImage(currentImg, Math.floor(player.x), Math.floor(player.y), player.width, player.height);
        }
        ctx.restore();
    }

    ctx.fillStyle = "yellow";
    ctx.font = "20px Consolas";
    ctx.fillText("DIST: " + Math.floor(distanceTraveled) + "/10600", 20, 20);

    ctx.fillStyle = "black";
    ctx.font = "18px Consolas";
    ctx.fillText("Level 1", 220, 20);

    /*if (hasWon) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "gold";
        ctx.font = "bold 50px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("COURSE CLEAR!", canvas.width / 2, canvas.height / 2);
    }*/
    if (isGameOver) {
        ctx.fillStyle = hasWon ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

}

initMobileControls();

let lastTime = 0;
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    if (!isGameOver) {
        
        update(deltaTime);

        let fps = 1 / deltaTime;
        //console.log("FPS:", fps.toFixed(1), "delta:", deltaTime.toFixed(4));
    }
    
    //update();
    draw();

   requestAnimationFrame(loop);
    
}

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

loop();