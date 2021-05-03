/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class MyEventCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    onId(id, eventName, myFunction) { var me = this.icn3dui;
        if(Object.keys(window).length < 2) return;

        if(id.substr(0, 1) == '#') id = id.substr(1);
        if(document.getElementById(id)) {
            var eventArray = eventName.split(' ');
            eventArray.forEach(event => {
                document.getElementById(id).addEventListener(event, myFunction);
            });
        }
    }

    onIds(idArray, eventName, myFunction) { var me = this.icn3dui;
        var bArray = Array.isArray(idArray);
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
    onSel(selector, eventName, myFunction) { var me = this.icn3dui;
        var elemArray = document.querySelectorAll(selector); // non-live
        elemArray.forEach(elem => {
            var eventArray = eventName.split(' ');
            eventArray.forEach(event => {
                elem.addEventListener(event, myFunction);
            });
        });
    }

    onSelClass(selector, eventName, myFunction) { var me = this.icn3dui;
        selector = selector.replace(/\./gi, '');
        var classArray = selector.split(',');
        classArray.forEach(item => {
            var elemArray = document.getElementsByClassName(item.trim()); // live
            if(Array.isArray(elemArray)) {
                elemArray.forEach(elem => {
                    var eventArray = eventName.split(' ');
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
