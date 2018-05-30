# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. iCn3D has a feature-rich user interface and allows users to: 
* Display and integrate annotations from NCBI resources including dbSNP, ClinVar, conserved domains, 3D domains, and binding sites
* Add custom tracks in various formats (FASTA, bed file, etc) in the annotation window
* Use a url or a state file to capture the custom display of 3D structures
* Select residues by searching sequences or select on 3D structures,  2D interactions, and 1D sequences
* Display/highlight selected residues in 3D structures,  2D interactions, and 1D sequences
* Export STL or VRML files for 3D printing
* Display NCBI pre-calculated aligned 3D structures by providing two PDB IDs or MMDB IDs.


We provided two types of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=1tup) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). 

1. The basic interface has the minimum javascript code for the interface. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html#HowToUse) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.3.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.3.zip). The "Download ZIP" link in this page does not include third-party libraries. 

## Usage

iCn3D accepts the following IDs:

* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1)
* <b>mmtfid</b>: MMTF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&showanno=1&showsets=1)
* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&showanno=1&showsets=1)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&showanno=1&showsets=1)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=1310960&show2d=1&showsets=1)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align</b>: Two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1)

iCn3D also accepts the following file types: PDB, mmCIF, Mol2, SDF, and XYZ. The files can be passed through a url, e.g., <a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb">https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb</a>:

See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html) or the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.


## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: The drawing of 3D objects is based on iview.
* **[GLmol](https://webglmol.osdn.jp/index-en.html)**: The drawing of nucleotides cartoon is based on GLmol.
* **[3Dmol](https://3dmol.csb.pitt.edu/)**: The surface generation and labeling are based on 3Dmol.
* **[NGL Viewer](https://github.com/arose/ngl)**: The Imposter shaders are based on NGL Viewer.

## Building

If you want to work with the development version, then you'll need to use the Node.js build tools. We recommend using [nvm](https://github.com/creationix/nvm) (Node version manager). First, install that per the instructions in that README file, and then install the latest LTS version of Node.js, with, for example,

```
nvm install #.#.#
nvm alias default #.#.#   #=> Use this as default from now on
node --version
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

## Change log
The production version [icn3d-2.1.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.3.zip) was release on May 30, 2018.  "Sequences and Annotations" is now able to be highlighted even if some annotations didn't show up.

The production version [icn3d-2.1.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.2.zip) was release on May 23, 2018. The surface display was improved by adding light reflection. Light was added to the display of instanced biological assemblies.

The production version [icn3d-2.1.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.1.zip) was release on May 22, 2018. The option of color by "Spectrum" was added back. 

The production version [icn3d-2.1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.0.zip) was release on May 21, 2018. The instancing method is used to display a biological assembly. It significantly improved the rendering speed by sending only the geometry of its assymmetruic unit to GPU and applying transformation matrices to display the assembly. 

The production version [icn3d-2.0.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.3.zip) was release on May 2, 2018. Removed the "Description" field when saving a set of atoms. This made "Share Link" URL shorter. Made the size of stabilizer thicker for 3D printing.

The production version [icn3d-2.0.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.2.zip) was release on April 30, 2018. Reset WebGLRenderer when WebGL context is lost in Internet Explore 11. 

The production version [icn3d-2.0.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.1.zip) was release on April 23, 2018. The bug about extra 3D domains in the "Sequences & Annotations" window was fixed. The stabilizers for 3D printing were improved. 

The production version [icn3d-2.0.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.0.zip) was release on April 17, 2018. By clicking the menu "Windows: View Sequences & Annotations", users can view all kinds of annotations: ClinVar, SNPs, CDD domains, 3D domains, binding sites, interactions, and custom tracks. Users can click the menu "View: Chemical Binding" to show the chemical binding sites. Users can also export files for 3D printing at the menu "File: 3D Printing: VRML (Color, W/ Stabilizers)".

All previous releases can be found at the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#log).

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
