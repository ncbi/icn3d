# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using three.js and jquery. It is based on the 3D styles of [GLmol](http://webglmol.osdn.jp/index-en.html) and [iview](http://istar.cse.cuhk.edu.hk/iview/). Here are some of the added features: picking atoms, selecting residues, shiny material for displaying, improved labeling, saving state, etc.

We provided two versions of iCn3D widgets: [simple interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=2por) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por). Both widgets can be easily added to web pages.

1. The simple interface has the minimum javascript code for the interface and is easy to understand. It has the basic features to change color and styles.
2. The advanced interface has a library for the interface and is more complicated to understand. It has many features.

  
## Usage

iCn3D URL accepts the following IDs:
pdbid: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por)
mmcif: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcif=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcif=2por)
mmdbid: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por)
gi: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227)
cid: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)

Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.


## Third party Libraries used

* **[JQuery and JQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some JQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: iCn3D is mainly based on iview.
* **[GLmol](http://webglmol.osdn.jp/index-en.html)**: Some features (such as drawing cartoons for nucleotides) are from GLmol.


## Building

You should be able to run this out-of-the-box after cloning it, as long as you're attempting to view the files through a web server.

To build the concatenated, minified files, make sure you have Node.js and npm installed, and then perform the following setup steps in your working copy of icn3d. 

```
npm install -g gulp
npm install
```

The first line installs the gulp build tool globally, making the `gulp` command available on the command line. The next line installs all of the dependences for this project.

You only have to perform the above steps once, to set up your working directory. From then on, to build, simply enter:

```
gulp
```

Then, serve the site from an HTTP server, to test it. If you don't have one readily available, one option is to install the `http-server` app, and run it, with:

```
npm install -g http-server
http-server
```

You should then be able to see the help page from http://localhost:8080/icn3d.html.

Run `gulp help` to get a list of the available tasks.



## Change log

This is a beta release. Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
