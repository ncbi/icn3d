//import * as THREE from './three/three.module.js';

// copied from https://github.com/NikLever/Learn-WebXR/blob/master/libs/ControllerGestures.js
// created by Nik Lever

class ControllerGestures extends THREE.EventDispatcher{
    constructor( renderer ){
        super();
        
        if (renderer === undefined){
            console.error('ControllerGestures must be passed a renderer');
            return;
        }
        
        const clock = new THREE.Clock();
        
        this.controller1 = renderer.xr.getController(0);
        this.controller1.userData.gestures = { index: 0 };
        this.controller1.userData.selectPressed = false;
        this.controller1.addEventListener( 'selectstart', onSelectStart );
        this.controller1.addEventListener( 'selectend', onSelectEnd );
        
        this.controller2 = renderer.xr.getController(1);
        this.controller2.userData.gestures = { index: 1 };
        this.controller2.userData.selectPressed = false;
        this.controller2.addEventListener( 'selectstart', onSelectStart );
        this.controller2.addEventListener( 'selectend', onSelectEnd );
        
        this.doubleClickLimit = 0.2;
        this.pressMinimum = 0.4;
        this.right = new THREE.Vector3(1,0,0);
        this.up = new THREE.Vector3(0,1,0);
        
        this.type = 'unknown';
        //this.touchCount = 0;

        this.prevTap = 'none';
        
        this.clock = clock;
        
        const self = this;
        
        function onSelectStart( ){
            const data = this.userData.gestures;
            
            data.startPosition = undefined;
            data.startTime = clock.getElapsedTime();
            
            if ( self.type.indexOf('tap') == -1) data.taps = 0;
            
            self.type = 'unknown';
            this.userData.selectPressed = true;
            
            //self.touchCount++;
            
            //console.log( `onSelectStart touchCount: ${ self.touchCount }` );
        }
        
        function onSelectEnd( ){
            const data = this.userData.gestures;
            
            data.endTime = clock.getElapsedTime();
            const startToEnd = data.endTime - data.startTime;
            
            //console.log(`ControllerGestures.onSelectEnd: startToEnd:${startToEnd.toFixed(2)} taps:${data.taps}`);
/*             
            if (self.type === 'swipe'){
                const direction = ( self.controller1.position.y < data.startPosition.y) ? "DOWN" : "UP";
                self.dispatchEvent( { type:'swipe', direction } );
                self.type = 'unknown';
            }else 
          
            if (self.type !== "pinch" && self.type !== "rotate" && self.type !== 'pan'){
                // if ( startToEnd < self.doubleClickLimit ){
                    self.type = "tap";
                    //data.taps++;
                // }
                // else if ( startToEnd > self.pressMinimum ){
                //     self.dispatchEvent( { type: 'press', position: self.controller1.position, matrixWorld: self.controller1.matrixWorld }   );
                //     self.type = 'unknown';
                // }
            }else{
                self.type = 'unknown';
            }
*/

            if ( startToEnd < self.doubleClickLimit ){
                data.taps++;
            }
            self.type = 'tap';

            this.userData.selectPressed = false;
            data.startPosition = undefined;
            
            //self.touchCount--;
        }
    }
    
    get multiTouch(){
        let result;
        if ( this.controller1 === undefined || this.controller2 === undefined ){   
            result = false;
        }else{
            result = this.controller1.userData.selectPressed && this.controller2.userData.selectPressed;
        }
        const self = this;
        //console.log( `ControllerGestures multiTouch: ${result} touchCount:${self.touchCount}`);
        return result;
    }
    
    get touch(){
        let result;
        if ( this.controller1 === undefined || this.controller2 === undefined ){   
            result = false;
        }else{
            result = this.controller1.userData.selectPressed || this.controller2.userData.selectPressed;
        }
        //console.log( `ControllerGestures touch: ${result}`);
        return result;
    }
    
    get debugMsg(){
        return this.type;
    }
    
    update(){
        const data1 = this.controller1.userData.gestures;
        const data2 = this.controller2.userData.gestures;
        const currentTime = this.clock.getElapsedTime();
        
        let elapsedTime;
        
        if (this.controller1.userData.selectPressed && data1.startPosition === undefined){
            elapsedTime = currentTime - data1.startTime;
            if (elapsedTime > 0.05 ) data1.startPosition = this.controller1.position.clone();
        }
        
        if (this.controller2.userData.selectPressed && data2.startPosition === undefined){
            elapsedTime = currentTime - data2.startTime;
            if (elapsedTime > 0.05 ) data2.startPosition = this.controller2.position.clone();
        }
       
        if (!this.controller1.userData.selectPressed && this.type === 'tap' ){
            //Only dispatch event after double click limit is passed
            elapsedTime = this.clock.getElapsedTime() - data1.endTime;
            if (elapsedTime > this.doubleClickLimit){
                //console.log( `ControllerGestures.update dispatchEvent taps:${data1.taps}` );
                switch( data1.taps ){
                    case 1:
                        //this.dispatchEvent( { type: 'tap', position: this.controller1.position, matrixWorld: this.controller1.matrixWorld } );
                        self.prevTap = 'tap';
                        break;
                    case 2:
                        this.dispatchEvent( { type: 'doubletap', position: this.controller1.position, matrixWorld: this.controller1.matrixWorld } );
                        self.prevTap = 'doubletap';
                        break;
                    case 3:
                        //this.dispatchEvent( { type: 'tripletap', position: this.controller1.position, matrixWorld: this.controller1.matrixWorld } );
                        break;
                    case 4:
                        //this.dispatchEvent( { type: 'quadtap', position: this.controller1.position, matrixWorld: this.controller1.matrixWorld }  );
                        break;
                }
                this.type = "unknown";
                data1.taps = 0;
            }
        }

        if (this.type === 'unknown' && this.touch){
            //if (data1.startPosition !== undefined){
                //if (this.multiTouch){

                if(self.prevTap == 'doubletap') {
                    //if (data2.startPosition !== undefined){
                        //startPosition is undefined for 1/20 sec
                        //test for pinch or rotate

                        // const startDistance = data1.startPosition.distanceTo( data2.startPosition );
                        // const currentDistance = this.controller1.position.distanceTo( this.controller2.position );
                        // const delta = currentDistance - startDistance;

                        // if ( Math.abs(delta) > 0.01 ){
                            this.type = 'pinch';
                            this.startDistance = this.controller1.position.distanceTo( this.controller2.position );
                            //this.dispatchEvent( { type: 'pinch', delta: 0, scale: 1, initialise: true } );
                            this.dispatchEvent( { type: 'pinch', delta: new THREE.Vector3(0,0,0), scale: 1, initialise: true } );
                        // }else{
                        //     const v1 = data2.startPosition.clone().sub( data1.startPosition ).normalize();
                        //     const v2 = this.controller2.position.clone().sub( this.controller1.position ).normalize();
                        //     const theta = v1.angleTo( v2 );
                        //     if (Math.abs(theta) > 0.2){
                        //         this.type = 'rotate';
                        //         this.startVector = v2.clone();
                        //         this.dispatchEvent( { type: 'rotate', theta: 0, initialise: true } );
                        //     }
                        // }
                    //}
                }else { //if(self.prevTap == 'tap') {
                    //test for swipe or pan
                    // let dist = data1.startPosition.distanceTo( this.controller1.position );
                    // elapsedTime = this.clock.getElapsedTime() - data1.startTime;
                    // const velocity = dist/elapsedTime;

                    //console.log(`dist:${dist.toFixed(3)} velocity:${velocity.toFixed(3)}`);
                    // if ( dist > 0.01 && velocity > 0.1 ){
                    //     const v = this.controller1.position.clone().sub( data1.startPosition );
                    //     let maxY = (Math.abs(v.y) > Math.abs(v.x)) && (Math.abs(v.y) > Math.abs(v.z));
                    //     if ( maxY )this.type = "swipe";
                    // }else if (dist > 0.006 && velocity < 0.03){
                        this.type = "pan";
                        this.startPosition = this.controller1.position.clone();
                        this.dispatchEvent( { type: 'pan', delta: new THREE.Vector3(0,0,0), initialise: true } );
                    // }
                }
            //}
        }else if (this.type === 'pinch' || this.type === 'pan'){
            //if (this.type === 'pinch'){
            //if (this.multiTouch){

            if(self.prevTap == 'doubletap') {
                if (this.controller2.position) {
                    const currentDistance = this.controller1.position.distanceTo( this.controller2.position );
                    // const delta = currentDistance - this.startDistance;
                    const scale = currentDistance/this.startDistance;

                    const delta = this.controller1.position.clone().sub( this.startPosition );
                    this.dispatchEvent( { type: 'pinch', delta, scale });
                }

            // }else if (this.type === 'rotate'){
            //     const v = this.controller2.position.clone().sub( this.controller1.position ).normalize();
            //     let theta = this.startVector.angleTo( v );
            //     const cross = this.startVector.clone().cross( v );
            //     if (this.up.dot(cross) > 0) theta = -theta;
            //     this.dispatchEvent( { type: 'rotate', theta } );
/*
            //}else if (this.type === 'pan'){
            } else { //if(self.prevTap == 'tap') {
                // const delta = this.controller1.position.clone().sub( this.startPosition );
                // this.dispatchEvent( { type: 'pan', delta } );

                const position = this.controller1.position.clone();
                this.dispatchEvent( { type: 'pan', position } );
*/
            }
        }
    }
}

export { ControllerGestures };