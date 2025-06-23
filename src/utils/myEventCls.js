/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class MyEventCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    onId(id, eventName, myFunction) { let me = this.icn3dui;
        if(Object.keys(window).length < 2) return;

        if(id.substr(0, 1) == '#') id = id.substr(1);
        if(document.getElementById(id)) {
            let eventArray = eventName.split(' ');
            eventArray.forEach(event => {
                document.getElementById(id).addEventListener(event, myFunction);
            });
        }
    }

    onIds(idArray, eventName, myFunction) { let me = this.icn3dui;
        let bArray = Array.isArray(idArray);
        if(bArray) {
            idArray.forEach(id => {
                me.myEventCls.onId(id, eventName, myFunction);
            });
        }
        else {
            me.myEventCls.onId(idArray, eventName, myFunction);
        }
    }

    // CSS selector such as class
/*
    onSel(selector, eventName, myFunction) { let me = this.icn3dui;
        let elemArray = document.querySelectorAll(selector); // non-live
        elemArray.forEach(elem => {
            let eventArray = eventName.split(' ');
            eventArray.forEach(event => {
                elem.addEventListener(event, myFunction);
            });
        });
    }

    onSelClass(selector, eventName, myFunction) { let me = this.icn3dui;
        selector = selector.replace(/\./gi, '');
        let classArray = selector.split(',');
        classArray.forEach(item => {
            let elemArray = document.getElementsByClassName(item.trim()); // live
            if(Array.isArray(elemArray)) {
                elemArray.forEach(elem => {
                    let eventArray = eventName.split(' ');
                    eventArray.forEach(event => {
                        elem.addEventListener(event, myFunction);
                    });
                });
            }
        });
    }
*/
}

export {MyEventCls}
