import * as LC from './levelCreate.js';
import {Block} from './block.js';

class Level {

    /**
     * Constructs the level object
     * @param {int} length - Length of the level 
     * @param {int} width - Width of the level
     */
    constructor(length, width) {
        this.objectTypes = ["Baba","Wall","Water","Rock","Flag"];
        this.ruleTypes = ["Push","You","Win","Stop"];
        this.arrows = [];
        this.blockList = [];
        this.cameras = [];
        this.lights = [];
        this.isList = [];
        this.youList = [];
        this.stopList = [];
        this.pushList = [];
        this.winList = [];
        this.length = length;
        this.width = width;
        this.floor;
        this.grid = [];
        for (let i = 0; i < this.length; i++){
            let row = [];
            for (let j = 0; j < this.width; j++){
                row.push([]);
            };
            this.grid.push(row);    
        };
    }

    /**
     * Creates a new block in the level
     * @param {*} x - The x coordinate of the block
     * @param {*} z - The z coordinate of the block
     * @param {*} type - The type of the block
     * @param {*} text - The text of the block
     * @param {*} obj - The object(s) representing the block
     * @param {*} offsetY - The y offset for the object
     */
    createBlock(x, z, type, text, obj, offsetY) {
        let y = this.grid[x][z].length;
        let block = new Block(type, text, x, y, z, obj, offsetY);
        this.grid[x][z].push(block);
        this.blockList.push(block);
        if (type == "Text" && text == "is") {
            this.isList.push(block);
        };
    }

    /**
     * Sets the floor of the level
     * @param {Mesh} floor - The floor of the level
     */
    setFloor(floor) {
        this.floor = floor;
    }

    /**
     * Adds a light to the level
     * @param {Light} light - The light
     */
    addLight(light) {
        this.lights.push(light);
    }

    /**
     * Gets the next y coordinate of the grid position
     * @param {int} x - The x coordinate of the grid position 
     * @param {int} z - The z coordinate of the grid position
     * @returns The next y coordinate
     */
    gety(x, z){
        return this.grid[x][z].length; // Next y is the top of the list
    }

    /**
     * Checks if the block can be pushed
     * @param {Block} block - THe block being checked
     * @returns If the block can be pushed
     */
    checkPush(block) {
        return this.pushList.includes(block.type) || block.type == "Text";
    }

    /**
     * Checks if the block stops other blocks
     * @param {Block} block - THe block being checked
     * @returns If the block stops other blocks
     */
    checkStop(block) {
        return this.stopList.includes(block.type);
    }

    /**
     * Checks if the block is You
     * @param {Block} block - THe block being checked
     * @returns If the block is You
     */
    checkYou(block) {
        return this.youList.includes(block.type);
    }

    /**
     * Checks if the block is a winning block
     * @param {Block} block - THe block being checked
     * @returns If the block is a winning block
     */
    checkWin(block) {
        return this.winList.includes(block.type);
    }

    /**
     * Checks if the grid position contains a wall of some kind
     * @param {*} x - The x coordinate of grid position being checked
     * @param {*} z - The z coordinate of grid position being checked
     * @param {*} movex - The change in x from moving
     * @param {*} movez - The change in z from moving
     * @returns Whether the new position can be moved into
     */
    containsWall(x,z, movex, movez) {
        let wall = false;
        /* An block stops movement if it is a wall that will not
        move at the same time (from also being you or push)*/
        this.grid[x][z].forEach(element => {
            if (this.checkStop(element)) {
                if (!((this.checkYou(element) || this.checkPush(element))
                && (this.canMove(element,movex,movez)))){
                    wall = true;
                };
            } else if (this.checkYou(element) //An object that is you and push 
            && this.checkPush(element)        //cannot be stacked onto and therefore is a wall
            && !(this.canMove(element, movex, movez))) {
                wall = true;
            };
        });
        return wall;
    }

    /**
     * Checks if a block can move
     * @param {Block} block - The block being checked
     * @param {int} x - The x coordinate change if moving
     * @param {int} z - The z coordinate change if moving
     * @returns Whether the block can move
     */
    canMove(block, x, z){
        return block.x+x < this.length 
        && block.x+x >= 0 && block.z+z >= 0
        && block.z+z < this.width && 
        !(this.containsWall(block.x+x,block.z+z,x,z));
    }

    /**
     * Updates the y's of all objects in a grid
     * @param {int} x - The x coordinate of the grid position
     * @param {int} z - The z coordinate of the grid position
     */
    updateY(x, z){
        let list = this.grid[x][z]
        for (let i = 0; i < list.length; i++){
            list[i].setY(i);
        };
    }

    /**
     * Tries to move the given block in the given direction
     * @param {Block} block - The block
     * @param {int} x - The x coordinate of the grid position
     * @param {int} z - The z coordinate of the grid position
     * @param {Scene} scene - The scene of the objects
     * @returns whether the blocked was moved
     */
    tryMove(block, x, z, scene){
        let moved = false;
        if (this.canMove(block,x,z)) {
            if (this.tryPush(block, x, z)) {
                this.grid[block.x][block.z].splice(block.y,1); //Removes the block from current grid position
                this.updateY(block.x, block.z);
                let y = this.grid[block.x+x][block.z+z].length;
                block.move(x, y, z, scene);
                this.grid[block.x][block.z].push(block);
                moved = true;
            };
        };
        return moved;
    }

    /**
     * Tries to push the given block in the given direction
     * @param {Block} block - The block being pushed
     * @param {int} x - The change in x coordinate 
     * @param {int} z - The change in z coordinate 
     * @returns Whther the block was pushed
     */
    tryPush(block, x, z){
        let pushed = true;
        this.grid[block.x+x][block.z+z].forEach(element => {
            if (this.checkPush(element) &&
            !(this.checkYou(element))) {//If the object is You, it does not get pushed 
                pushed = this.tryMove(element, x, z);
            };
        });
        return pushed;
    }

    /**
     * Moves each You block and updates the rules
     * @param {int} x - The change in x coordinate 
     * @param {int} z - The change in z coordinate 
     * @param {Scene} scene - The scene the objects are in
     * @returns Whether the level has been completed
     */
    pMove(x, z, scene){
        this.blockList.forEach(block => {
            if (this.checkYou(block)) {
                this.tryMove(block, x, z, scene);
            }
        });
        this.updateRules(scene);
        LC.playSound();
        return this.checkWinLevel();
    }

    /**
     * Checks if the level has been Won
     * @returns Whether the level has been won
     */
    checkWinLevel(){
        let win = false;
        this.blockList.forEach(block => {
            if (!win && this.checkYou(block)) {
                this.grid[block.x][block.z].forEach(element => {
                    if (!win && this.checkWin(element)){
                        win = true;
                    }
                });
            }
        });
        return win;
    }

    /**
     * Creates a rule for the given rule, object pair
     * @param {string} rule - The rule for the object
     * @param {string} obj - The object kind having the rule set for
     */
    createRule(rule, obj){
        switch (rule) {
            case "You":
                this.youList.push(obj);
                break;
            case "Stop":
                this.stopList.push(obj);
                break;
            case "Push":
                this.pushList.push(obj);
                break;
            case "Win":
                this.winList.push(obj);
                break;
            default:
                break;
        }
    }

    /**
     * Updates the set of rules after moving
     * @param {Scene} scene - The scene the objects are in 
     */
    updateRules(scene){
        this.youList = [];
        this.stopList = [];
        this.pushList = [];
        this.winList = [];
        // Rules are made from object is text so search by is
        // if rule is object is rule, makes the rule
        // if rule is object is objects, changes all of left object with right object type
        this.isList.forEach(is => {
            // Don't check if no rule can be made with the is in this direction
            if (is.x>0 && is.x<this.length-1){
                this.grid[is.x-1][is.z].forEach(obj => { //Checks each block to the left
                    if (obj.type == "Text" && this.objectTypes.includes(obj.text)){
                        this.grid[is.x+1][is.z].forEach(rule => { // Checks each block to the right
                            if (rule.type == "Text" && this.ruleTypes.includes(rule.text)){
                                this.createRule(rule.text,obj.text);
                            } else if (rule.type == "Text" && this.objectTypes.includes(rule.text)){
                                this.replaceObjs(obj.text,rule.text,scene);
                            };
                        });
                    };
                });
            };
            if (is.z>0 && is.z<this.width-1){
                this.grid[is.x][is.z-1].forEach(obj => { //Checks each block above
                    if (obj.type == "Text" && this.objectTypes.includes(obj.text)){
                        this.grid[is.x][is.z+1].forEach(rule => { //Checks each block below
                            if (rule.type == "Text" && this.ruleTypes.includes(rule.text)){
                                this.createRule(rule.text,obj.text);
                            } else if (rule.type == "Text" && this.objectTypes.includes(rule.text)){
                                this.replaceObjs(obj.text,rule.text,scene);
                            };
                        });
                    };
                });
            };
        });
        this.makeRuleText();
    }
    
    /**
     * Replaces an object with a new type of object
     * @param {Block} obj - The block being changed
     * @param {string} to - The new type of object
     * @param {Scene} scene - The scene the objects are in
     */
    replaceObj(block, to, scene){
        block.removeFromScene(scene);
        let newObj;
        let offset = 0;
        //Makes the new block Mesh
        switch (to) {
            case "Baba":
                newObj = LC.makeBabaBlock(this, block.x, block.z, block.getRotation());
                offset = -0.26;
                break;
            case "Wall":
                newObj = LC.makeWallBlock(this, block.x, block.z);
                break;
            case "Water": 
                newObj = LC.makeWaterBlock(this, block.x, block.z);
                break;
            case "Rock": 
                newObj = LC.makeRockBlock(this, block.x, block.z);
                offset = -0.04;
                break;  
            case "Flag": 
                newObj = LC.makeFlagBlock(this, block.x, block.z);
                offset = -0.04;
                break;
        };
        block.change(to, newObj, offset);
        block.addToScene(scene);
    }

    /**
     * Replaces all objects of one kind to another kind
     * @param {string} from - The kind of block being changed 
     * @param {string} to - The kind of block being changed to
     * @param {Scene} scene - The scene the objects are in
     */
    replaceObjs(from, to, scene){
        this.blockList.forEach(element => {
            if (element.type == from){
                this.replaceObj(element, to, scene);
            }
        });
    }

    /**
     * Adds each block's object to the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    addScene(scene){
        this.blockList.forEach(element => {
            element.addToScene(scene);
        });
    }

    /**
     * removes each block's object from the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    removeScene(scene){
        this.blockList.forEach(element => {
            element.removeFromScene(scene);
        });
    }

    /**
     * removes each light from the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    removeLights(scene){
        this.lights.forEach(element => {
            scene.remove(element);
        });
    }

    /**
     * removes each arrow from the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    removeArrows(scene){
        this.arrows.forEach(element => {
            scene.remove(element);
        });
    }

    /**
     * removes each camera from the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    removeCameras(scene){
        this.cameras.forEach(element => {
            scene.remove(element);
        });
    }

    /**
     * adds each light to the scene
     * @param {Scene} scene - The scene the objects are in 
     */
    addLights(scene){
        this.lights.forEach(element => {
            scene.add(element);
        });
    }

    /**
     * Copies the level into a new Level object
     * @returns The new level
     */
    copyLevel(){
        let newLev = new Level(this.length, this.width);
        newLev.lights = this.lights;
        newLev.arrows = this.arrows;
        newLev.cameras = this.cameras;
        newLev.setFloor(this.floor);
        this.blockList.forEach(element => {
            LC.createCopy(element, newLev);
            if (element.type == "Baba"){ //Sets the animation frame for Babas
                newLev.blockList.at(-1).setFrame(element.getFrame(), 
                                                element.getFrameDirection());
            }
        });
        return newLev;
    }

    /**
     * Disposed of all of the objects in the level
     */
    dispose(){
        this.blockList.forEach(element => {
            element.dispose();
        });
        this.lights.forEach(element => {
            element.dispose();
        });
        this.arrows.forEach(element => {
            element.children[0].geometry.dispose();
        });
        this.floor.geometry.dispose();
    }

    /**
     * Undoes the level - removes from scene and disposes of the objects
     * @param {Scene} scene - The scene the objects are in
     */
    undoLevel(scene){
        this.removeLights(scene);
        this.removeScene(scene);
        scene.remove(this.floor);
        this.removeCameras(scene);
        this.removeArrows(scene);
        this.dispose();
    }

    /**
     * Makes the text for the list of rules
     */
    makeRuleText(){
        let text = "Rules:";
        this.youList.forEach(element => {
            text += "<p>"+element+" is You</p>"
        });
        this.stopList.forEach(element => {
            text += "<p>"+element+" is Stop</p>"
        });
        this.pushList.forEach(element => {
            text += "<p>"+element+" is Push</p>"
        });
        this.winList.forEach(element => {
            text += "<p>"+element+" is Win</p>"
        });
        document.getElementById("rules").innerHTML = text;
    }

}

export {Level}