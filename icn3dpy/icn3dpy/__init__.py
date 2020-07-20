import IPython.display
import time, json
from urllib.parse import unquote

class view(object):
    '''A class for constructing embedded iCn3D viewer in ipython notebooks.
       The 3D view of icn3dpy in Jupyter Notebook is interactive, 
       just like in any browser. The popup windows will appear 
       under the 3D view. If you have a predefined cutom view, 
       you can use the predefined commands in icn3dpy.
    '''
    def __init__(self,width=640,height=480,q="",para="",command="",full=1,v=""):
        '''Create a iCn3D view.
            width -- width of 3D canvas in pixels
            height -- height of 3D canvas in pixels
            q -- query, e.g., q='mmdbid=1kq2'
            para -- iCn3D parameters (e.g., para='showanno=1&show2d=1') defined at www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#parameters
            command -- iCn3D commands (e.g., command='color spectrum') defined at www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands
            full -- 1: full version using icn3d_all_full.min.js, 0: simple version using icn3d_all_simple.min.js
            v -- version of iCn3D, e.g., v='2.18.0'
        '''
        if v != '':
            v = '_' + v
        
        if full == 1:
            jsfile = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/es5/icn3d_all_full' + v + '.min.js'
            css1file = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/lib/jquery-ui' + v + '.min.css'
            css2file = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d_full_ui' + v + '.css'
        else:
            jsfile = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/es5/icn3d_all_simple' + v + '.min.js'
            css1file = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/lib/jquery-ui' + v + '.min.css'
            css2file = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d_simple_ui' + v + '.css'
        
        divid = "icn3dviewerUNIQUEID"
        warnid = "icn3dwarningUNIQUEID"
        self.uniqueid = None
        self.startjs = '''<div id="%s" style="position: relative; width: %dpx; min-height: %dpx; height: auto">
        <p id="%s" style="background-color:#ffcccc;color:black">You appear to be running in JupyterLab (or JavaScript failed to load for some other reason).  You need to install the extension: <br>
        <tt>jupyter labextension install jupyterlab_3dmol</tt></p>
        </div>\n''' % (divid,width,height+50,warnid)
        self.startjs += '<script>\n'
        self.endjs = '</script>'
        
        self.updatejs = '' # code added since last show
        #load iCn3D, but only once, can't use jquery :-(
        #https://medium.com/@vschroeder/javascript-how-to-execute-code-from-an-asynchronously-loaded-script-although-when-it-is-not-bebcbd6da5ea
        self.startjs += """
var loadScriptAsync = function(uri){
  return new Promise((resolve, reject) => {
    var tag = document.createElement('script');
    tag.src = uri;
    //tag.async = true;
    tag.onload = () => {
      resolve();
    };
  var firstScriptTag = document.getElementsByTagName('link')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
};

var loadCssAsync = function(uri){
  return new Promise((resolve, reject) => {
var tag = document.createElement('link');
tag.rel = 'stylesheet';
tag.href = uri;
//tag.async = true;
tag.onload = () => {
  resolve();
};
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
};

if(typeof js === 'undefined') {
  js = loadScriptAsync("%s");
  
  css1 = loadCssAsync("%s");
  css2 = loadCssAsync("%s");
}

var viewerUNIQUEID = null;
var warn = document.getElementById("%s");
if(warn) {
    warn.parentNode.removeChild(warn);
}

css1
.then(function() { return css2; })
.then(function() { return js; })
.then(function() {
""" % (jsfile,css1file,css2file,warnid)

        self.endjs = "});\n" + self.endjs
        
        inputid='';
        if q != '':
            queryArray = q.split("=")
            inputid = queryArray[0] + ": \"" + queryArray[1] + "\", "
        
        para = para.replace("=", ":")
        para = para.replace("&", ",")
        command = unquote(command)

        self.startjs += 'cfg = {divid: "%s", %swidth: "%spx", height: "%spx", mobilemenu: 1, notebook: 1, command: \'%s\', %s};\n' % (divid, inputid, width, height, command, para)

        self.startjs += 'viewerUNIQUEID = new iCn3DUI(cfg);\n'
        
        self.endjs = "viewerUNIQUEID.show3DStructure();\n" + self.endjs;
        
    def _make_html(self):
        self.uniqueid = str(time.time()).replace('.','')
        self.updatejs = ''
        html = (self.startjs+self.endjs).replace('UNIQUEID',self.uniqueid)
        return html    

    def _repr_html_(self):
        html = self._make_html()
        return IPython.display.publish_display_data({'application/3dmoljs_load.v0':html, 'text/html': html})
