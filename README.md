# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. It is based on the 3D styles of [iview](http://istar.cse.cuhk.edu.hk/iview/) and [GLmol](https://en.osdn.jp/projects/webglmol/), and the surface generation of [3Dmol](http://3dmol.csb.pitt.edu/). iCn3D has a feature-rich user interface and allows users to: use a url or a state file to capture the custom display of 3D structures, define custom atom sets, show both 3D structure and 1D sequence together and select residues on both of them, display custom labeling, go back and forth to different stage, show highlight, etc. iCn3D can also show the aligned 3D structures by providing two PDB IDs or MMDB IDs, whose alignment has been pre-calculated at NCBI.  

We provided two versions of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=2por) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por). 

1. The basic interface has the minimum javascript code for the interface and is easy to understand. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface and is more complicated to understand. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.0.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.0.zip). The "Download ZIP" link in this page does not include these third-party libraries. 

## Usage

iCn3D page accepts the following IDs:

* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=2por)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=2por)
* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=2por)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align</b>: Two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n)

See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details on these parameters.


## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: iCn3D is mainly based on iview.
* **[GLmol](https://en.osdn.jp/projects/webglmol/)**: Drawing cartoon of nucleotides is from GLmol.
* **[3Dmol](http://3dmol.csb.pitt.edu/)**: The surface generation and labeling are from 3Dmol.

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

The beta version [icn3d-0.9.0-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.0-dev.zip) was release on Jan 17, 2016. 

The beta version [icn3d-0.9.1-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.1-dev.zip) was release on Feb 9, 2016. The surface generation was switched from the iview version (surface.js) to the more efficient 3Dmol version (ProteinSurface4.js and marchingcube.js).

The beta version [icn3d-0.9.2-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.2-dev.zip) was release on March 4, 2016. CSS namespace was added. The file simple_ui.js was reorganized to share some codes with full_ui.js. A "Schematic" style was added to show one letter residue name in the C-alpha (for protein) or phosphorus (for nucleotide) position.

The beta version [icn3d-0.9.3-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.3-dev.zip) was release on March 9, 2016. Improved the following features: "Back" and "Forward" button, Export State, Open State.

The beta version [icn3d-0.9.4-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.4-dev.zip) was release on March 14, 2016. Added "Fog" and "Slab" features.

The beta version [icn3d-0.9.5-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.5-dev.zip) was release on April 4, 2016. Enabled to import Mol2, SDF, XYZ, PDB, and mmCIF files. Added "Schematic" style for ligands. Improved the coordination between picking on 3D structure and selection on sequences.

The beta version [icn3d-0.9.6-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.6-dev.zip) was release on April 21, 2016. Enabled to export and import selection file where each custom sets of atoms are defined. Javascript files and CSS files are versioned. Developers can use the default latest version or specify the specific version in their pages.

The production version [icn3d-1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.0.zip) was release on April 28, 2016. 

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
