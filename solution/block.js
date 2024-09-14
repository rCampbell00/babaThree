class Block {

    /**
     * Constructs a block
     * @param {string} type - The type of block
     * @param {string} text - Text of the block if applicable
     * @param {int} x - x coordinate of the block
     * @param {int} y - y coordinate of the block
     * @param {int} z - z coordinate of the block
     * @param {Array[Mesh]} objects - singular object or List of objects in the block
     * @param {float} offsetY - Offset for the y coordinate of the objects
     */
    constructor(type, text, x, y, z, objects, offsetY) {
        this.type = type;
        this.text = text;
        this.x = x;
        this.y = y;
        this.z = z;
        this.objects = objects
        // Baba is the only object with multiple objects
        // used for animation
        if (this.type == "Baba"){
            this.object = objects[1];
            this.animationFrame = 1;
            this.frameDirection = 1;
        } else {
            this.object = objects;
        }
        this.offsetY = offsetY;
    }

    /**
     * Moves the object in the world and scene
     * @param {int} x - change in x
     * @param {int} y - new y
     * @param {int} z - change in z
     * @param {Scene} scene - The scene the object is in
     */
    move(x, y, z, scene){
        this.x = this.x + x;
        this.y = y;
        this.z = this.z + z;
        this.object.position.set(this.object.position.x + x, 
                                this.y + this.offsetY, 
                                this.object.position.z + z);
        if (this.type == "Baba"){
            this.handleBaba(x, z, scene);
        }
    }

    /**
     * Changes the object to a new kind of object
     * @param {*} type - New type of the object
     * @param {*} newObjs - Set of new objects
     * @param {*} newOffset - new y offset
     */
    change(type, newObjs, newOffset){
        this.type = type;
        if (type == "Baba"){
            this.object = newObjs[1];
            this.animationFrame = 1;
            this.frameDirection = 1;
        } else{
            this.object = newObjs;
        }
        this.objects = newObjs;
        this.offsetY = newOffset;
        this.updateY();
    }

    /**
     * Updates the objects y value
     */
    updateY(){
        this.object.position.y = this.y + this.offsetY;
    }

    /**
     * Sets a new y value for the object
     * @param {int} y - new y coordinate
     */
    setY(y){
        this.y = y;
        this.object.position.y = y + this.offsetY;
    }

    /**
     * Sets the frame and direction for animated block
     * @param {int} frame - the frame
     * @param {int} dir - direction of going through the frames
     */
     setFrame(frame, dir){
        this.animationFrame = frame;
        this.object = this.objects[frame];
        this.frameDirection = dir;
    }

    /**
     * Animates a animated object
     * @param {Scene} scene - The scene the object is in
     */
    animate(scene){
        let nextFrame = this.animationFrame+this.frameDirection;
        // Updates position and rotation of the next object
        this.objects[nextFrame].position.set(this.object.position.x,
                                            this.object.position.y,
                                            this.object.position.z);
        this.objects[nextFrame].rotation.y = this.object.rotation.y;
        // switches the objects
        scene.remove(this.object);
        this.object = this.objects[nextFrame];
        scene.add(this.object);
        
        // Gets the next frame and frame Direction
        this.animationFrame = nextFrame;
        if (this.animationFrame == 0 || this.animationFrame == this.objects.length-1) {
            this.frameDirection = -1*this.frameDirection;
        }
    }

    /**
     * Handles extra rotation and animation for Baba
     * @param {int} x - The change in x
     * @param {int} z - The change in z
     * @param {Scene} scene - The scene the object is in
     */
    handleBaba(x,z, scene){
        let rotation = Math.PI*(Math.min(0,z)) + (Math.PI/2)*x; //Calculates direction of object movement
        this.object.rotation.y = rotation;
        this.animate(scene);
    }

    /**
     * Disposes of the given object if possible
     * @param {Object} obj - The object to be disposed
     */
    disposeObj(obj) {
        if (obj.isMesh){
            obj.geometry.dispose();
            obj.material.dispose();
        }
    }

    /**
     * Disposes each node of the current object
     */
    dispose(){
        if (this.type == "Baba"){ //Baba has three models to dispose
            this.objects[0].traverse( node => this.disposeObj(node));
            this.objects[1].traverse( node => this.disposeObj(node));
            this.objects[2].traverse( node => this.disposeObj(node));
        } else {
            this.object.traverse( node => this.disposeObj(node));
        }
    }

    /**
     * Adds the current object to the scene
     * @param {Scene} scene - The scene the object is added to
     */
    addToScene(scene){
        scene.add(this.object);
    }

    /**
     * Removes current object from the scene
     * @param {Scene} scene - The scene the object is removed from
     */
    removeFromScene(scene){
        scene.remove(this.object);
    }

    /**
     * Gets the current animation frame
     * @returns The current animation frame
     */
    getFrame(){
        return this.animationFrame;
    }

    /**
     * Gets the current frame direction
     * @returns The current frame direction
     */
    getFrameDirection(){
        return this.frameDirection;
    }

    /**
     * Gets the objects current rotation
     * @returns The objects rotation
     */
    getRotation(){
        return this.object.rotation.y;
    }
}

export {Block}