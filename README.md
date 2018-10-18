# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. iCn3D has a feature-rich user interface and allows users to: 
* [Display and integrate annotations](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=view+annotations;+set+annotation+cdd;+set+view+detailed+view;+set+annotation+all) from NCBI resources including dbSNP, ClinVar, conserved domains, 3D domains, and binding sites
* [Add custom tracks](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1&command=view+annotations;+set+view+detailed+view;+add+track+|+chainid+1TUP_B+|+title+Custom+Key+Sites+|+text+82+R,+152+G,+155-156+RR,+180+R,+189+R;+select+.B:82,152,155-156,180,189+|+name+mutation) in various formats (FASTA, bed file, etc) in the annotation window
* Use a url (e.g., [https://d55qc.app.goo.gl/HDuWMFAVokxvHMKSA](https://d55qc.app.goo.gl/HDuWMFAVokxvHMKSA)) or a state file to capture the custom display of 3D structures
* Select residues by searching sequences or select on 3D structures,  2D interactions, and 1D sequences
* Display/highlight selected residues in 3D structures,  2D interactions, and 1D sequences
* Export STL or VRML files for [3D printing](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=export+stl+stabilizer+file)
* Display NCBI pre-calculated [aligned 3D structures](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1) by providing two PDB IDs or MMDB IDs


We provided two types of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=1tup) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). 

1. The basic interface has the minimum javascript code for the interface. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html#HowToUse) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.0.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.0.zip). The "Download ZIP" link in this page does not include third-party libraries. 

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

## Change log
The production version [icn3d-2.3.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.0.zip) was release on October 18, 2018. Added set operations (union,intersection, exclusion) in "Defined Sets"; added buttons "Helix Sets" and "Sheet Sets" in the "Sequences and Annotations" window to define helix sets and sheet sets in the window "Defined Sets"; added "Save Color" and "Apply Saved Color" in the menu "Color"; added "Save Style" and "Apply Saved Style" in the menu "Style"; added "Side Chains" in the menu "Select" to select side chains; added two options for color by "Secondary" structures: "Sheets in Green" and "Sheets in Yellow"; added color by "B-factor" that is normalized with "Original" values or "Percentile" values.

The production version [icn3d-2.2.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.5.zip) was release on September 17, 2018. A bug in loading local PDB file was fixed.

The production version [icn3d-2.2.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.4.zip) was release on September 6, 2018. The location of 2D interaction dialog was optimized.

The production version [icn3d-2.2.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.3.zip) was release on August 30, 2018. Added an option to show N- and C-terminal labels.

The production version [icn3d-2.2.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.2.zip) was release on August 9, 2018. Defined sets can be combined using "or", "and", and "not".

The production version [icn3d-2.2.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.1.zip) was release on August 3, 2018. Mouseover on the 3D structure shows the residue or atom name. Some Ajax calls are combined into one Ajax call.

The production version [icn3d-2.2.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.0.zip) was release on July 30, 2018. The smoothing algorithm was switched from Catmull-Rom spline to cubic spline to make the curves more smooth. The thickness of ribbon was decreased to make the sides of the ribbons less apparent. The radio buttons in the menus was replaced by the check sign. A "Save Image" button was added in the "Toolbar".

The production version [icn3d-2.1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.0.zip) was release on May 21, 2018. The instancing method is used to display a biological assembly. It significantly improved the rendering speed by sending only the geometry of its assymmetruic unit to GPU and applying transformation matrices to display the assembly. 

The production version [icn3d-2.0.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.0.zip) was release on April 17, 2018. By clicking the menu "Windows: View Sequences & Annotations", users can view all kinds of annotations: ClinVar, SNPs, CDD domains, 3D domains, binding sites, interactions, and custom tracks. Users can click the menu "View: Chemical Binding" to show the chemical binding sites. Users can also export files for 3D printing at the menu "File: 3D Printing: VRML (Color, W/ Stabilizers)".

All previous releases can be found at the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#log).

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 
