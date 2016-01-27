# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using three.js and jquery. It is based on the 3D styles of [GLmol](http://webglmol.osdn.jp/index-en.html) and [iview](http://istar.cse.cuhk.edu.hk/iview/). Here are some of the added features: picking atoms, selecting residues, shiny material for displaying, improved labeling, saving state, etc.

We provided two versions of iCn3D widgets: [simple interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=2por) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por). 

1. The simple interface has the minimum javascript code for the interface and is easy to understand. It has the basic features to change color and styles.
2. The advanced interface has a library for the interface and is more complicated to understand. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

## Usage

iCn3D page accepts the following IDs:

* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por)
* <b>mmcif</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcif=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcif=2por)
* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)

See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details on these parameters.


## Third-party libraries used

* **[JQuery and JQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some JQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: iCn3D is mainly based on iview.
* **[GLmol](http://webglmol.osdn.jp/index-en.html)**: Some features (such as drawing cartoons for nucleotides) are from GLmol.

## Download

The complete version with all libraries can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.0-dev.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.0-dev.zip)

## Building

If you want to work with the development version, then you'll need to use the Node.js build tools. We recommend using [nvm](https://github.com/creationix/nvm) (Node version manager). First, install that per the instructions in that README file, and then install the latest LTS version of Node.js, with, for example,

```
nvm install 4.2.2
nvm alias default 4.2.2   #=> Use this as default from now on
node --version            #=> expect "v4.2.2"
```

Next, clone this repository, and then perform the following setup steps in your working copy of icn3d. 

```
npm install -g gulp
npm install
```

The first line installs the gulp build tool globally, making the `gulp` command available on the command line. The next line installs all of the dependences for this project.

You only have to perform the above steps once, to set up your working directory. From then on, to build, simply enter:

```
gulp
```

Then, serve the site from an HTTP server, to test it. If you don't have one readily available, you could uses the `http-server` app, with:

```
npm install -g http-server
http-server
```

Then point your browser at http://localhost:8080/icn3d.html.

Run `gulp help` to get a list of the available tasks.

A special task "gh-pages" will build the distribution files, and then push
them to GitHub pages. Make sure, in your working clone, that you define a 
remote named "github" that points to a repo on GitHub that you have write
permission to, and then enter

```
gulp gh-pages
```


## Change log

This is a beta release. Please send all comments to wangjiy@ncbi.nlm.nih.gov. 


