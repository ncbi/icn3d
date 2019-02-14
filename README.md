# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. iCn3D has a feature-rich user interface and allows users to: 
* [Display and integrate annotations](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=view+annotations;+set+annotation+cdd;+set+view+detailed+view;+set+annotation+all) from NCBI resources including dbSNP, ClinVar, conserved domains, 3D domains, and binding sites
* [Add custom tracks](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1&command=view+annotations;+set+view+detailed+view;+add+track+|+chainid+1TUP_B+|+title+Custom+Key+Sites+|+text+82+R,+152+G,+155-156+RR,+180+R,+189+R;+select+.B:82,152,155-156,180,189+|+name+mutation) in various formats (FASTA, bed file, etc) in the annotation window
* Use a url (e.g., [https://d55qc.app.goo.gl/HDuWMFAVokxvHMKSA](https://d55qc.app.goo.gl/HDuWMFAVokxvHMKSA)) or a state file to capture the custom display of 3D structures. The saved static "iCn3D PNG Image" can be loaded using "File > Open File > iCn3D PNG Image" to reproduce the interactive display.
* Select residues by searching sequences or select on 3D structures,  2D interactions, and 1D sequences
* Display/highlight selected residues in 3D structures,  2D interactions, and 1D sequences
* Show [electron density map](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=3gvu&command=style+proteins+b+factor+tube;+color+b+factor;+set+map+2fofc+sigma+1.5) or [EM density map](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=6eny&command=set+emmap+percentage+20)
* Export STL or VRML files for [3D printing](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=export+stl+stabilizer+file)
* Display NCBI pre-calculated [aligned 3D structures](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1) by providing two PDB IDs or MMDB IDs


We provided two types of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=1tup) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). 

1. The basic interface has the minimum javascript code for the interface. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html#HowToUse) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.1.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.1.zip). The "Download ZIP" link in this page does not include third-party libraries. 

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

If you want to build your code easily, you'll need to install nodejs and npm.

Next, clone this repository, and then perform the following setup steps in your working copy of icn3d. 

```
npm install -g gulp
npm install
npm install jquery-ui
```

The first line installs the gulp build tool globally, making the `gulp` command available on the command line. The next two lines installs all of the dependences for this project. 

You only have to perform the above steps once, to set up your working directory. From then on, to build, simply enter:

```
gulp
```

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
