import * as THREE from '../extra/three.js-master/build/three.module.js';
import { GLTFLoader } from '../extra/three.js-master/examples/jsm/loaders/GLTFLoader.js'


let loader = new GLTFLoader();

let myModelPath = '../assets/myAssets/';
let otherModels = '../assets/otherAssets/';
let grassPath = "../extra/three.js-master/examples/textures/terrain/"
const textureLoader = new THREE.TextureLoader();
let rock, arrow, flag, wall, water;
let isBlock, babaBlock, flagBlock, pushBlock, stopBlock, rockBlock, wallBlock, waterBlock, winBlock, youBlock;
let baba, baba2, baba3;
let floor;
const flagOffSet = -0.04;
const rockOffSet = -0.04;
const babaOffSet = -0.26;
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
let  moveSound = new THREE.Audio(listener);
let reverseSound = new THREE.Audio(listener);

/**
 * Makes The floor Plane
 * @param {int} x - The x coordinate of the plane 
 * @param {int} z - The z coordinate of the plane 
 */
async function makePlane(x, z) {
    try {
        const plane = new THREE.PlaneGeometry(20,20);
        let texture = await loadTexture(grassPath+"grasslight-big.jpg");
        let normal = await loadTexture(grassPath+"grasslight-big-nm.jpg");
        const material = new THREE.MeshPhongMaterial({map:texture, normalMap:normal, side:THREE.DoubleSide});
    
        floor = new THREE.Mesh(plane, material);
        floor.receiveShadow = true;    
        floor.position.x = x;
        floor.position.z = z;
        floor.rotation.x = Math.PI /2;
        floor.rotation.y = Math.PI;
        floor.position.y = -0.501; //Done to prevent clipping of the objects and the plane
    } catch (error) {
        throw error
    }
}

/**
 * Sets the position of the block in the world coordinates
 * @param {Mesh} obj - The object the coordinates are being set for
 * @param {int} x - The x coordinate in the level coordinate system 
 * @param {int} z - The z coordinate in the level coordinate system 
 * @param {Level} level - The level
 * @param {float} offsetx - The offset of the object in the x coordinate
 * @param {float} offsetz - The offset of the object in the z coordinate
 * @param {float} offsety - The offset of the object in the y coordinate
 */
function setPos(obj, x, z, level, offsetx, offsetz, offsety) {
    obj.position.x = gridToObject(x)+0.5+offsetx;
    obj.position.z = gridToObject(z) +0.5+offsetz;
    let y = level.gety(x,z)+offsety;
    obj.position.y = (1.01)*y;
}

/**
 * Creates a copy of a block
 * @param {Block} block - The block being copied
 * @param {Level} level - The level the new block is added to
 */
function createCopy(block, level) {
    switch (block.type) {
        case 'Baba':
            makeBaba(level, block.x, block.z, block.getRotation());
            break;
        case 'Wall':
            makeWall(level, block.x, block.z);
            break;
        case 'Water':
            makeWater(level, block.x, block.z);
            break;
        case 'Text':
            makeText(level, block.x, block.z, block.text);
            break;
        case 'Rock':
            makeRock(level, block.x, block.z);
            break;
        case 'Flag':
            makeFlag(level, block.x, block.z);
            break;
        default:
            break;
    };
}

/**
 * Converts level coordinate to world coordinate
 * @param {int} coord - The level coordinate
 * @returns The world coordinate
 */
function gridToObject(coord) {
    return (coord - 10);
}

/**
 * Makes a cube with a texture and normal map
 * @param {string} texture - URL to the texture
 * @param {string} normal - URL to the normal
 * @param {hex} colour - hex code for the colour
 * @returns The cube
 */
async function makeTextureCube(texture, normal, colour) {
    try {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        texture = await loadTexture(texture);
        normal = await loadTexture(normal);
        let mat = new THREE.MeshPhongMaterial({color: colour, map: texture, normalMap: normal});
        let cube = new THREE.Mesh(geometry, mat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        return cube;
    } catch (error) {
        throw error;
    }
}

/**
 * Loads the rock object
 */
async function loadRock() {
    try {
        let response = await loadBlock(otherModels,"rock/rock.glb");
        rock = response.scene;
        rock.scale.set(0.27,0.18,0.27);
    } catch (error) {
        throw error;
    };
    return;
}

/**
 * Loads the wall object
 */
async function loadWall() {
    try {
        let texture = otherModels+"terracotta/Bricks_Terracotta.jpg";
        let normal = otherModels+"terracotta/Bricks_Terracotta_002_normal.jpg";
        wall = await makeTextureCube(texture, normal, 0xffffff);
    } catch (error) {
        throw error;
    }
}

/**
 * Loads the water object
 */
async function loadWater() {
    try {
        let texture = "../extra/three.js-master/examples/textures/water.jpg";
        let normal = "../extra/three.js-master/examples/textures/waternormals.jpg";
        water = await makeTextureCube(texture, normal, 0x2244CC);
    } catch (error) {
        throw error;
    }
}

/**
 * Loads the arrow object
 */
async function loadArrow() {
    try {
        let response = await loadBlock(myModelPath,"arrow.glb");
        arrow = response.scene;
        arrow.scale.set(0.3,0.3,0.3);
    } catch (error) {
        throw error;
    }
    return;
}

/**
 * Loads the flag object
 */
async function loadFlag() {
    try {
        let response = await loadBlock(myModelPath,"flag.glb");
        flag = response.scene;
        flag.scale.set(0.5,0.3,0.5);
    } catch (error) {
        throw error;
    }
    return;
}

/**
 * Loads the baba objects
 */
async function loadBaba() {
    try {
        let response = await loadBlock(myModelPath,"baba.glb");
        baba = response.scene;
        baba.scale.set(0.3,0.3,0.3);
        response = await loadBlock(myModelPath,"babaAnim1.glb");
        baba2 = response.scene;
        baba2.scale.set(0.3,0.3,0.3);
        response = await loadBlock(myModelPath,"babaAnim2.glb");
        baba3 = response.scene;
        baba3.scale.set(0.3,0.3,0.3);
    } catch (error) {
        throw error;
    }
    return;
}

/**
 * Loads the given movement sound
 * @param {string} path - The URL to the sound
 * @param {Audio} variable - The variable the sound is stored in
 */
async function loadMoveSound(path, variable) {
    try {
        let response = await loadSound(path);
        variable.setBuffer(response);
        variable.setVolume(0.1);
    } catch (error) {
        throw error;
    }
    return;
}

/**
 * Loads the given text block
 * @param {string} text - The text of the block 
 * @returns The text block
 */
async function loadTextBlock(text) {
    try {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let texture = await loadTexture(myModelPath+"text"+text+".png");
        let textMat = new THREE.MeshPhongMaterial({map: texture, color: 0xE6E600});
        let textBlock = new THREE.Mesh(geometry, textMat);
        textBlock.castShadow = true;
        textBlock.receiveShadow = true;
        return textBlock;        
    } catch (error) {
        throw error;
    }
}

/**
 * Loads all of the different text blocks
 */
async function loadTexts() {
    try {
        isBlock = await loadTextBlock("is");
        babaBlock = await loadTextBlock("Baba");    
        flagBlock = await loadTextBlock("Flag");
        pushBlock = await loadTextBlock("Push");
        rockBlock = await loadTextBlock("Rock");
        stopBlock = await loadTextBlock("Stop");
        wallBlock = await loadTextBlock("Wall");
        waterBlock = await loadTextBlock("Water");
        winBlock = await loadTextBlock("Win");
        youBlock = await loadTextBlock("You"); 
        return;
    } catch (error) {
        throw error;
    }  
}

/**
 * Loads all of the different objects and sounds into memory
 */
async function loadObjects() {
    try {
        await makePlane(0, 0);
        await loadArrow();
        await loadFlag();
        await loadBaba();
        await loadWall();
        await loadWater();
        await loadRock();
        await loadTexts();
        await loadMoveSound(otherModels+"sound/pig_Toy_Edited.wav", moveSound);
        await loadMoveSound(otherModels+"sound/pig_Toy_Reverse.wav", reverseSound);
    } catch (error) {
        throw error;
    }
    
}

/**
 * Plays the movement sound
 */
function playSound() {
    if (!moveSound.isPlaying){
        moveSound.play();    
    }
}

/**
 * Plays the reverse movemnt sound
 */
function playReverse() {
    if (!reverseSound.isPlaying){
        reverseSound.play();    
    }
}

/**
 * Makes a new Wall mesh block
 * @param {Level} level - Level the block is in
 * @param {int} x - x coordinate of the block in the level
 * @param {int} z - z coordinate of the block in the level
 * @returns The new Wall Mesh block
 */
 function makeWallBlock(level, x, z) {
    let newWall = wall.clone();
    setPos(newWall, x, z, level, 0, 0, 0);
    return newWall;
}

/**
 * Makes a new Water mesh block
 * @param {Level} level - Level the block is in
 * @param {int} x - x coordinate of the block in the level
 * @param {int} z - z coordinate of the block in the level 
 * @returns The new Water Mesh block
 */
function makeWaterBlock(level, x, z) {
    let newWater = water.clone();
    setPos(newWater, x, z, level, 0, 0, 0);
    return newWater;
}

/**
 * Makes a new Rock mesh block
 * @param {Level} level - Level the block is in
 * @param {int} x - x coordinate of the block in the level 
 * @param {int} z - z coordinate of the block in the level 
 * @returns The new Rock Mesh block
 */
function makeRockBlock(level, x, z) {
    let newRock = rock.clone();
    setPos(newRock, x, z, level, 0, -0.13, rockOffSet);
    return newRock;
}

/**
 * Makes a new Flag mesh block
 * @param {Level} level - Level the block is in
 * @param {int} x - x coordinate of the block in the level 
 * @param {int} z - z coordinate of the block in the level 
 * @returns The new Flag Mesh block
 */
function makeFlagBlock(level, x, z) {
    let newFlag = flag.clone();
    setPos(newFlag, x, z, level, 0, 0, flagOffSet);
    return newFlag;
}

/**
 * Makes new Baba mesh blocks
 * @param {Level} level - Level the block is in
 * @param {int} x - x coordinate of the block in the level
 * @param {int} z - z coordinate of the block in the level
 * @param {float} rotation - The y rotation of the block
 * @returns The new Baba Mesh blocks
 */
function makeBabaBlock(level, x, z, rotation) {
    let newBaba = baba.clone();
    let newBaba2 = baba2.clone();
    let newBaba3 = baba3.clone();
    setPos(newBaba, x, z, level, 0, 0, babaOffSet);
    setPos(newBaba2, x, z, level, 0, 0, babaOffSet);
    setPos(newBaba3, x, z, level, 0, 0, babaOffSet);
    newBaba.rotation.y = rotation;
    newBaba2.rotation.y = rotation;
    newBaba3.rotation.y = rotation;
    return [newBaba2, newBaba, newBaba3];
}

/**
 * Makes a new arrow and adds it to the scene
 * @param {Scene} scene - The scene the arrow is in
 * @param {Array} list - The list to add the arrow to 
 * @param {int} x - The x coordinate of the arrow 
 * @param {int} y - The y coordinate of the arrow 
 * @param {int} z - The z coordinate of the arrow 
 * @param {float} rotation - The y rotation of the arrow
 */
function createArrow(scene, list, x, y, z, rotation) {
    let newArrow = arrow.clone();
    newArrow.position.set(x, y, z);
    newArrow.rotation.y = rotation;
    list.push(newArrow);
    scene.add(newArrow);
}

/**
 * Gets the Text block for the corresponding text
 * @param {string} text - The text of the block needed
 * @returns The mesh block
 */
function getBlock(text) {
    let block;
    switch (text) {
        case "is":
            block = isBlock.clone();
            break;
        case "Baba":
            block = babaBlock.clone();
            break;
        case "Flag":
            block = flagBlock.clone();
            break;
        case "Push":
            block = pushBlock.clone();
            break;
        case "Rock":
            block = rockBlock.clone();
            break;
        case "Stop":
            block = stopBlock.clone();
            break;
        case "Wall":
            block = wallBlock.clone();
            break;
        case "Water":
            block = waterBlock.clone();
            break;
        case "Win":
            block = winBlock.clone();
            break;
        case "You":
            block = youBlock.clone();
            break;
    };
    return block;
}

/**
 * Makes a new text block Mesh
 * @param {Level} level - The level the block is added to
 * @param {int} x - The x coordinate of the new block in the level
 * @param {int} z - The z coordinate of the new block in the level
 * @param {string} text - The text of the text block
 * @returns the text block
 */
function makeTextBlock(level, x, z, text) {
    let textBlock = getBlock(text);
    setPos(textBlock, x, z, level, 0, 0, 0);
    return textBlock;
}

/**
 * Makes a new Baba block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 * @param {*} rotation - The rotation of the block
 */
function makeBaba(level, x, z, rotation) {
    level.createBlock(x, z, 'Baba', '', makeBabaBlock(level,  x, z, rotation), babaOffSet);
}

/**
 * Makes a new Wall block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 */
function makeWall(level, x, z) {
    level.createBlock(x, z, 'Wall', '', makeWallBlock(level,  x, z), 0);
}

/**
 * Makes a new Water block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 */
function makeWater(level, x, z) {
    level.createBlock(x, z, 'Water', '', makeWaterBlock(level,  x, z), 0);
}

/**
 * Makes a new Text block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 * @param {string} text - The text of the block
 */
function makeText(level, x, z, text) {
    level.createBlock(x, z, 'Text', text, makeTextBlock(level,  x, z, text), 0);
}

/**
 * Makes a new Rock block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 */
function makeRock(level, x, z) {
    level.createBlock(x, z, 'Rock', '', makeRockBlock(level,  x, z), rockOffSet);
}

/**
 * Makes a new Flag block
 * @param {Level} level - Level the block is added to
 * @param {int} x - The x coordinate of the block in the level 
 * @param {int} z - The z coordinate of the block in the level 
 */
function makeFlag(level, x, z) {
    level.createBlock(x, z, 'Flag', '', makeFlagBlock(level,  x, z), flagOffSet);
}

/**
 * Makes the base of the level
 * @param {Scene} scene - The scene used for the level 
 * @param {Level} level - The level
 */
function makeLevelBase(scene, level) {
    //Makes the floor
    level.setFloor(floor);
    scene.add(floor);
    
    //Makes the lights
    let distance = 11;
    let intense = 0.8;

    const dirLight = new THREE.PointLight( 0xffffff, intense );
    dirLight.position.set( distance, 7, distance);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.0005;
    scene.add( dirLight );
    level.addLight(dirLight);

    const dirLight2 = new THREE.PointLight( 0xffffff, intense);
    dirLight2.position.set( -distance, 7, -distance );
    scene.add( dirLight2 );
    level.addLight(dirLight2);

    const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.6 );
    scene.add( ambientLight );
    level.addLight(ambientLight);
    
    //Makes the arrows
    createArrow(scene, level.arrows, 0, 0, 12, 3*Math.PI/2);
    createArrow(scene, level.arrows, 12, 0, 0, 0);
    createArrow(scene, level.arrows, 0, 0, -12, Math.PI/2);
    createArrow(scene, level.arrows, -12, 0, 0, Math.PI);

    //Makes the cameras
    createCamera(0,20,0, level.cameras);
    createCamera(0,5,15, level.cameras);
    createCamera(15,5,0, level.cameras);
    createCamera(0,5,-15,level.cameras);
    createCamera(-15,5,0,level.cameras);
    
}

/**
 * Makes level one
 * @param {Scene} scene - The scene used for the level 
 * @param {Level} level - The level
 */
function createLevel1(scene, level) {
    makeLevelBase(scene, level);

    makeBaba(level, 6, 10, Math.PI/2);
    makeFlag(level, 13, 10);
    makeRock(level, 10, 9);
    makeRock(level, 10, 10);
    makeRock(level, 10, 11);
    makeText(level, 5, 6, "Baba");
    makeText(level, 6, 6, "is");
    makeText(level, 7, 6, "You");
    makeText(level, 12, 14, "Rock");
    makeText(level, 13, 14, "is");
    makeText(level, 14, 14, "Push");
    makeText(level, 12, 6, "Flag");
    makeText(level, 13, 6, "is");
    makeText(level, 14, 6, "Win");
    makeText(level, 5, 14, "Wall");
    makeText(level, 6, 14, "is");
    makeText(level, 7, 14, "Stop");
    for (let i = 0; i < 10; i++) {
        makeWall(level, i+5, 8);
        makeWall(level, i+5, 12);        
    }
    level.addScene(scene);
    level.updateRules();    
}

/**
 * Makes level 2
 * @param {Scene} scene - The scene used for the level 
 * @param {Level} level - The level
 */
function createLevel2(scene, level) {
    makeLevelBase(scene, level);

    //Coordinates for all of the walls
    let wallX = [4,4,4,4,4,5,5,6,6,7,7,8,8,8,8,8,8,8,8,8,9,10,11,12,14,15,16,17,18,19,
                9,10,10,10,10,10,11,12,13,14,15,16,17,18,18,18,18,18,18,18,18,18];
    let wallZ = [8,9,10,11,12,8,12,8,12,8,12,8,12,8,7,6,5,4,3,2,2,2,2,2,2,2,2,2,2,2,
                12,12,13,14,15,16,16,16,16,16,16,16,16,16,15,14,13,12,11,10,9,8];

    makeBaba(level, 6, 10, Math.PI/2);
    makeFlag(level, 17, 4);
    makeText(level, 6, 15, "Baba");
    makeText(level, 6, 16, "is");
    makeText(level, 6, 17, "You");
    makeText(level, 0, 1, "Water");
    makeText(level, 0, 2, "is");
    makeText(level, 0, 3, "Stop");
    makeText(level, 0, 5, "Flag");
    makeText(level, 0, 6, "is");
    makeText(level, 0, 7, "Win");
    makeText(level, 13, 14, "Wall");
    makeText(level, 14, 14, "is");
    makeText(level, 15, 14, "Stop");
    for (let i = 0; i < 7; i++) {
        makeWater(level, 13, i);
        makeWater(level, i+13, 7);        
    }
    for (let i = 0; i < wallX.length; i++) {
        makeWall(level, wallX[i], wallZ[i]);     
    }
    level.addScene(scene);
    level.updateRules();    
}

/**
 * Makes level 3
 * @param {Scene} scene - The scene used for the level 
 * @param {Level} level - The level
 */
function createLevel3(scene, level) {
    makeLevelBase(scene, level);

    let rockX = [3,7,11,11,8,8,8,9,13,12,10,9,12,5,6,7];
    let rockZ = [5,3,12,14,12,13,14,15,12,11,11,10,4,15,13,7];

    makeBaba(level, 6, 10, 0);
    makeFlag(level, 13, 4);
    makeText(level, 4, 4, "Baba");
    makeText(level, 5, 4, "is");
    makeText(level, 6, 4, "You");
    makeText(level, 19, 14, "Rock");
    makeText(level, 19, 15, "is");
    makeText(level, 19, 16, "Stop");
    makeText(level, 10, 13, "Flag");
    makeText(level, 12, 13, "Win");
    for (let i = 0; i < 13; i++) {
        makeWall(level, i+2, 2);
        makeWall(level, i+2, 16);        
    }
    for (let i = 0; i < 13; i++) {
        makeWall(level, 2, 3+i);
        makeWall(level, 14, 3+i);        
    }
    for (let i = 0; i < rockX.length; i++) {
        makeRock(level, rockX[i], rockZ[i]);     
    }
    level.addScene(scene);
    level.updateRules();    
}

// Promise part gotten from -> https://discourse.threejs.org/t/most-simple-way-to-wait-loading-in-gltf-loader/13896/4
/**
 * Loads a block's mesh
 * @param {string} mainPath - Main path string
 * @param {string} objPath - String for the object from the main path
 * @returns Promise of the object
 */
function loadBlock(mainPath, objPath) {

    return new Promise((resolve, reject) => {
        loader.load(mainPath+objPath, function(data){
            data.scene.traverse( function(child) {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    child.castShadow = true;
                };
            });
            resolve(data);
        } ,  function(xhr) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        }, reject);
    });
}

/**
 * Loads a texture
 * @param {string} path - URL of the texture location 
 * @returns The promis of the texture
 */
async function loadTexture(path) {

    return new Promise((resolve, reject) => {
        textureLoader.load(path, resolve,
          undefined
        , reject);
    });
}

/**
 * Loads a sound
 * @param {string} path - URL of the sound location
 * @returns The promise of the sound
 */
async function loadSound(path) {

    return new Promise((resolve, reject) => {
        audioLoader.load(path, resolve,
          undefined
        , reject);
    });
}

/**
 * Creates a camera for the level
 * @param {int} x - the x coordinate of the camera 
 * @param {int} y - the y coordinate of the camera 
 * @param {int} z - the z coordinate of the camera 
 * @param {Array} list - the list the camera is added to 
 */
function createCamera(x, y, z, list) {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(x, y, z);
    camera.add(listener);
    camera.lookAt(0,0,0);
    list.push(camera);
}

export { makePlane, makeBaba, makeWall, makeWater, makeText, createLevel1, createLevel2, createLevel3, makeBabaBlock,
        makeWallBlock, makeWaterBlock, makeTextBlock, createCopy, createCamera, makeRockBlock, makeRock, loadObjects,
        makeFlag, makeFlagBlock, loadTexture, loadSound, playSound, playReverse};