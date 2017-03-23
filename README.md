# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. It is based on the 3D styles of [iview](http://istar.cse.cuhk.edu.hk/iview/) and [GLmol](https://webglmol.osdn.jp/index-en.html), and the surface generation of [3Dmol](https://3dmol.csb.pitt.edu/). iCn3D has a feature-rich user interface and allows users to: use a url or a state file to capture the custom display of 3D structures, define custom atom sets, show 3D structure, 2D interactions, and 1D sequence together and select residues on all of them, display custom labeling, go back and forth to different stage, show highlight, etc. iCn3D can also show the aligned 3D structures by providing two PDB IDs or MMDB IDs, whose alignment has been pre-calculated at NCBI.  

We provided two versions of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=2por) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por). 

1. The basic interface has the minimum javascript code for the interface and is easy to understand. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface and is more complicated to understand. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.5.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.5.zip). The "Download ZIP" link in this page does not include these third-party libraries. 

## Usage

iCn3D accepts the following IDs:

* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por&showseq=1&show2d=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por&showseq=1&show2d=1)
* <b>mmtfid</b>: MMTF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=2por)
* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=2por)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align</b>: Two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n)

iCn3D also accepts the following file types: PDB, mmCIF, Mol2, SDF, and XYZ. The files can be passed through a url, e.g., <a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb">https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb</a>:

See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html) or the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.


## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: The drawing of 3D objects is mainly based on iview.
* **[GLmol](https://webglmol.osdn.jp/index-en.html)**: The drawing of nucleotides cartoon is from GLmol.
* **[3Dmol](https://3dmol.csb.pitt.edu/)**: The surface generation and labeling are from 3Dmol.

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

Then point your browser at https://localhost:8080/icn3d.html.

Run `gulp help` to get a list of the available tasks.

A special task "gh-pages" will build the distribution files, and then push
them to GitHub pages. Make sure, in your working clone, that you define a 
remote named "github" that points to a repo on GitHub that you have write
permission to, and then enter

```
gulp gh-pages
```

## Change log

The production version [icn3d-1.3.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.5.zip) was release on March 23, 2017. The codes were optimized to show 3D structures as soon as possible. Vast+ structure alignment was optimized as well. 

The production version [icn3d-1.3.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.4.zip) was release on March 1, 2017. The backend of structure alignment was updated.

The production version [icn3d-1.3.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.3.zip) was release on November 15, 2016. Now users can save the image with "transparent" background using a single url, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por&width=300&height=300&command=set%20background%20transparent;%20export%20canvas](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por&width=300&height=300&command=set%20background%20transparent;%20export%20canvas).

The production version [icn3d-1.3.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.2.zip) was release on October 18, 2016. The atom specification in "Advanced set selection" was modified to use "$" instead of "#" in front of structure IDs. This modification avoids to the problem of showing multiple "#" in the urls of "Share Link".

The production version [icn3d-1.3.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.1.zip) was release on October 4, 2016. Partial diplay of helices or beta-sheets are enabled. The side chains, if displayed, are connected to C-alphas.

All previous releases can be found at the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#log).

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
