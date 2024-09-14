import * as THREE from '../extra/three.js-master/build/three.module.js';
import { TrackballControls } from '../extra/three.js-master/examples/jsm/controls/TrackballControls.js';
import * as LC from './levelCreate.js';
import {Level} from './level.js';

let camera, controls, scene, renderer, canvas, ray, mouseVector;
let escapeBack, menuLight, levelButton, levelSelect, menuBack;
let menuCamera;
let exitButton, escapeLight;
let winText;
let levels = [];
let myAssetURL = "../assets/myAssets/";
let galaxyURL = "../extra/three.js-master/examples/textures/cube/MilkyWay/dark-s_";
let level, levelStack;
let pview = true;
let state;
let loaded = true;
let menuLoaded;
const levelAmount = 3;

/**
 * Initialises the objects, renderer and menu data
 */
async function init() {


    canvas = document.getElementById( "gl-canvas" );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xD3D3D3 );

    state = "initialScreen";

    
    let mat = new THREE.MeshPhongMaterial({color: 0xD3D3D3, side:THREE.DoubleSide});
    let plane = new THREE.PlaneGeometry(30,30);
    menuBack = new THREE.Mesh(plane, mat);
    menuBack.rotation.y = Math.PI/2;
    scene.add(menuBack);

    //Tries to load the objects
    try {
        await LC.loadObjects();
    } catch (error) {
        loaded = false;
        console.log("Unable to load objects!");
        alert("Unable to load objects for levels!");
    }

    //Setup renderer

    renderer = new THREE.WebGLRenderer( {canvas} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    ray = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    //Setup the menu planes

    
    let mat2 = new THREE.MeshPhongMaterial({color: 0xD3D3D3, side:THREE.DoubleSide});
    escapeBack = new THREE.Mesh(plane, mat2);

    escapeBack.rotation.x = Math.PI /2;
    escapeBack.position.y = 9;
    
    //Setup menu lights

    menuLight = new THREE.DirectionalLight( 0xffffff, 1 );
    menuLight.position.set( 10,0,0 );

    
    escapeLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    escapeLight.position.set( 0,10,0 );
    
    menuLoaded = true;

    //Tries to setup the text boxes
    try {
        levelButton = await makeTextBox(myAssetURL+"continueText.png", 0.1, 1, 5, 0, -3);
        levelSelect = await makeTextBox(myAssetURL+"levelSelect.png", 0.001, 1, 5, 0, 6.5);
        exitButton = await makeTextBox(myAssetURL+"returnMenu.png", 0.1, 1, 5, 3, 10);
        winText = await makeTextBox(myAssetURL+"win.png", 0.1, 2, 5, 0, 10);    
        for (let i = 0; i < levelAmount; i++) {
            levels[i] = await makeTextBox(myAssetURL+"level"+(i+1).toString()+".png", 0.1, 1, 1, 5-(i*1.05),2);
        };
        exitButton.rotation.x = 3*Math.PI/2;
        exitButton.rotation.y = Math.PI/2;
        winText.rotation.x = 3*Math.PI/2;
        winText.rotation.y = Math.PI/2;
    } catch (error) {
        menuLoaded = false;
        console.log("Unable to load a menu text box");
        alert("Unable to load a menu text box!");
    };

    makeSplashScreen();

    //Sets up the skybox
    const cubeLoader = new THREE.CubeTextureLoader();
    const textureCube = cubeLoader.load( [
    	galaxyURL+"px.jpg", galaxyURL+"nx.jpg",
    	galaxyURL+"py.jpg", galaxyURL+"ny.jpg",
    	galaxyURL+"pz.jpg", galaxyURL+"nz.jpg",
    ] );

    scene.background = textureCube;

    //Setup event listners
    window.addEventListener( 'resize', handleReSize );
    window.addEventListener( 'keydown', handleKey );
    window.addEventListener( 'mouseup', onMouseUp);

    //Makes the menu camera and controls
    let list = [];
    LC.createCamera(10,0,0,list);
    menuCamera = list[0];
    camera = list[0];
    createControls(camera);
    controls.update();

}

/**
 * Makes a text box
 * @param {string} url The URL of the texture for the text 
 * @param {int} x - The size of the box in the x direction 
 * @param {int} y - The size of the box in the y direction 
 * @param {int} z - The size of the box in the z direction 
 * @param {int} posx - The position of the text in the x coordinate
 * @param {int} posy - The position of the text in the y coordinate
 * @returns The text box
 */
async function makeTextBox(url, x, y, z, posx, posy) {
    try {
        let response = await LC.loadTexture(url);
        let conText = response;
        let boxGeo = new THREE.BoxGeometry(x, y, z);
        let material = new THREE.MeshPhongMaterial({map:conText, color: 0xFFFFFF, side:THREE.DoubleSide});
        let boxVar = new THREE.Mesh(boxGeo, material);
        boxVar.position.z = posx;
        boxVar.position.y = posy;
        return boxVar;        
    } catch (error) {
        throw error;
    }
}

/**
 * Makes the initial splash screen explaining the game
 */
function makeSplashScreen() {
    scene.add( menuLight );
    if (menuLoaded) {    
        scene.add(levelButton);
    }
}

/**
 * Removes the initial splash screen
 */
function removeSplash() {
    document.getElementById("splash").innerHTML = "";
    scene.remove(levelButton);
}

/**
 * Makes the level select screen
 */
function makeLevelSelect() {
    camera = menuCamera;
    createControls(camera);
    scene.add(menuBack);
    scene.add(menuLight);
    scene.add(levelSelect);
    state = "levelSelect";
    levels.forEach(element => {
        scene.add(element);
    });
}

/**
 * Makes level one
 */
function startLevel1(){
    level = new Level(20,20);
    LC.createLevel1(scene, level);
    state = "inLevel";
}

/**
 * Makes level 2
 */
function startLevel2(){
    level = new Level(20,20);
    LC.createLevel2(scene, level);
    state = "inLevel";
}

/**
 * Makes level 3
 */
function startLevel3(){
    level = new Level(20,20);
    LC.createLevel3(scene, level);
    state = "inLevel";
}

/**
 * Starts the chosen level
 * @param {int} i - starts level i+1
 */
function startLevel(i) {
    switch (i) {
        case 0:
            startLevel1();
            break;
        case 1:
            startLevel2();
            break;
        case 2:
            startLevel3();
            break;
        default:
            break;
    };
    if (state == "inLevel"){
        scene.remove(menuBack);
        scene.remove(menuLight);
        scene.remove(levelSelect);
        levels.forEach(element => {
            scene.remove(element);
        });
        levelStack = [];
        camera = level.cameras[0];
        createControls(camera);
        level.makeRuleText();
    };
}

/**
 * Loads the escape menu
 */
function escapeMenu() {
    changeView(0);
    document.getElementById("rules").innerHTML = "";
    document.getElementById("splash").innerHTML = `
    <p>Escape menu</p>
    <p>Controls:</p>
    <p>WASD: control 'You'</p>
    <p>q: Return to top-down view</p>
    <p>z: undo last move</p>
    <p>Escape: Open or Close Escape menu</p>
    `;
    state = "escapeMenu";
    scene.add(escapeBack);
    scene.add(exitButton);
    scene.add(escapeLight);
    level.removeLights(scene);
}

/**
 * Undoes the escape menu
 */
function undoEscape() {
    document.getElementById("splash").innerHTML = "";
    state = "inLevel";
    scene.remove(escapeBack);
    scene.remove(exitButton);
    scene.remove(escapeLight);
    level.addLights(scene);
    level.makeRuleText();
}

/**
 * Shows the win text
 */
function showWin() {
    state = "winLevel";
    scene.add(winText);
}

/**
 * Handles pressing a key
 * @param {Event} e - The key event
 */
function handleKey(e){
    if (state == "inLevel"){
        if (e.key == 'q') {
            changeView(0);
        };
        if (pview) { //Only move in main view
            let win = false;
            if (e.key == 'd') {
                levelStack.push(level.copyLevel());
                win = level.pMove(1, 0, scene);
            } else if (e.key == 'a') {
                levelStack.push(level.copyLevel());
                win = level.pMove(-1, 0, scene);
            } else if (e.key == 'w') {
                levelStack.push(level.copyLevel());
                win = level.pMove(0, -1, scene);
            } else if (e.key == 's') {
                levelStack.push(level.copyLevel());
                win = level.pMove(0, 1, scene);
            } else if (e.key == 'z') {
                if (levelStack.length > 0){
                    level.removeScene(scene);
                    level = levelStack.pop();
                    level.addScene(scene);
                    LC.playReverse();
                    level.updateRules(scene);
                };
            } else if (e.key == 'Escape') {
                escapeMenu();
            };
            if (levelStack.length > 200) {
                levelStack.splice(0,1);
            };
            if (win){
                showWin();
            };
        };
    } else if (state == "escapeMenu"){
        if (e.key == "Escape") {
            undoEscape();
        };
    };
}

/**
 * Changes the camera
 * @param {int} i - Camera to change to
 */
function changeView(i) {
    camera = level.cameras[i];
    pview = i == 0;
}

/**
 * Handles the mouse click event
 * @param {Event} e - mouse event
 */
function onMouseUp(e) {
    if (menuLoaded){
        mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
        mouseVector.y = -2 * ( e.clientY / window.innerHeight ) + 1;
        ray.setFromCamera(mouseVector, camera); //Ray used to figure out what is clicked
        if (state == "inLevel"){
            for (let i = 0; i < level.arrows.length; i++) {
                if (ray.intersectObject(level.arrows[i]).length != 0){
                    changeView(i+1);
                };
            };
        } else if (state == "initialScreen"){
            if (ray.intersectObject(levelButton).length != 0){
                removeSplash();
                makeLevelSelect();
            };
        } else if (state == "levelSelect"){
            if (loaded) {
                for (let i = 0; i < levels.length; i++) {
                    const element = levels[i];
                    if (ray.intersectObject(element).length != 0){
                        startLevel(i);
                    };
                };
            } else {
                alert("Cannot load levels without objects loaded");
            };
        } else if (state == "escapeMenu"){
            if (ray.intersectObject(exitButton).length != 0){
                undoEscape();
                document.getElementById("rules").innerHTML = "";
                level.undoLevel(scene);
                makeLevelSelect()
            };
        } else if (state == "winLevel"){
            scene.remove(winText);
            document.getElementById("rules").innerHTML = "";
            level.undoLevel(scene);
            makeLevelSelect();
        };
    }
}

/**
 * Creates the controls for the camera
 * @param {Camera} camera - Camera the controls are set for
 */
function createControls( camera ) {

    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 0;
    controls.zoomSpeed = 0;
    controls.panSpeed = 0;

    //This array holds keycodes for controlling interactions.

    // When the first defined key is pressed, all mouse interactions (left, middle, right) performs orbiting.
    // When the second defined key is pressed, all mouse interactions (left, middle, right) performs zooming.
    // When the third defined key is pressed, all mouse interactions (left, middle, right) performs panning.
    // Default is KeyA, KeyS, KeyD which represents A, S, D.    
    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

/**
 * Handles changing the screen resize
 */
function handleReSize() {

    const aspect = window.innerWidth / window.innerHeight;

    menuCamera.aspect = aspect;
    menuCamera.updateProjectionMatrix();

    if (state == "inLevel"){
        level.cameras.forEach(element => {
            element.aspect = aspect;
            element.updateProjectionMatrix();
        });
    };

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();
    controls.update();

}

/**
 * Handles the animation
 */
function animate() {

    requestAnimationFrame( animate );

    controls.update();

    renderer.render( scene, camera );

}

await init();
animate();