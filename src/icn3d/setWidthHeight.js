/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.setWidthHeight = function(width, height) {
    //this.renderer.setSize(width, height);
    if(this.scaleFactor === undefined) this.scaleFactor = 1.0;

    //antialiasing by render twice large:
    //https://stackoverflow.com/questions/17224795/antialiasing-not-working-in-three-js
    this.renderer.setSize(width*this.scaleFactor, height*this.scaleFactor);
    this.renderer.domElement.style.width = width*this.scaleFactor + "px";
    this.renderer.domElement.style.height = height*this.scaleFactor + "px";
    this.renderer.domElement.width = width*this.scaleFactor;
    this.renderer.domElement.height = height*this.scaleFactor;

    //this.container.widthInv  = 1 / (this.scaleFactor*width);
    //this.container.heightInv = 1 / (this.scaleFactor*height);

    this.container.whratio = width / height;
};
