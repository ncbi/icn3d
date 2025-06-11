    // import any classes from icn3d.module.js to be used in your class
    import {LoadScript} from './icn3d.module.js';

    // class name starts with a upper-case letter
    class LoadStateFile {
        // pass the instance of the class iCn3D
        constructor(icn3d) {
            this.icn3d = icn3d;
        }

        // functions start with a lower-case letter
        // use "ic" to access the instance of iCn3D class
        async loadStateFile(fileStr) { var ic = this.icn3d;
            // "ic" has a lot of class instances such as "loadScriptCls"
            await ic.loadScriptCls.loadScript(fileStr, true);
        }
    }

    // export your class
    export {LoadStateFile}
    