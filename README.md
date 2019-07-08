# iCn3D Structure Viewer

## iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. iCn3D has a feature-rich user interface and allows users to: 
* [Display and integrate annotations](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=view+annotations;+set+annotation+cdd;+set+view+detailed+view;+set+annotation+all) from NCBI resources including dbSNP, ClinVar, conserved domains, 3D domains, and binding sites
* [Add custom tracks](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1&command=view+annotations;+set+view+detailed+view;+add+track+|+chainid+1TUP_B+|+title+Custom+Key+Sites+|+text+82+R,+152+G,+155-156+RR,+180+R,+189+R;+select+.B:82,152,155-156,180,189+|+name+mutation) in various formats (FASTA, bed file, etc) in the annotation window
* Use a url (e.g., [https://icn3d.page.link/uRL4mitQdG6J3gGg8](https://icn3d.page.link/uRL4mitQdG6J3gGg8)) or a state file to capture the custom display of 3D structures. The saved static "iCn3D PNG Image" can be loaded using "File > Open File > iCn3D PNG Image" to reproduce the interactive display.
* Select residues by searching sequences or select on 3D structures,  2D interactions, and 1D sequences
* Display/highlight selected residues in 3D structures,  2D interactions, and 1D sequences
* Show [electron density map](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=3gvu&command=style+proteins+b+factor+tube;+color+b+factor;+set+map+2fofc+sigma+1.5) or [EM density map](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=6eny&command=set+emmap+percentage+20)
* Export STL or VRML files for [3D printing](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=export+stl+stabilizer+file)
* Display NCBI pre-calculated [aligned 3D structures](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1) by providing two PDB IDs or MMDB IDs
* [Align a sequence to a structure](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1)


We provided two types of iCn3D widgets: [basic interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html?mmdbid=1tup) and [advanced interface](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). 

1. The basic interface has the minimum javascript code for the interface. It has the basic features such as changing color and styles.
2. The advanced interface has a library for the interface. It has many features.

Either of these widgets could be easily added to your own web pages. Please see the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html#HowToUse) for more details.

<b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.4.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.4.zip). The "Download ZIP" link in this page does not include third-party libraries. 

## Usage

iCn3D accepts the following IDs:

* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1)
* <b>mmtfid</b>: MMTF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&showanno=1&showsets=1)
* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&showanno=1&showsets=1)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&showanno=1&showsets=1)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=1310960&show2d=1&showsets=1)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align</b>: Two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1)
* <b>blast_rep_id and query_id</b>: NCBI protein accessions of a protein sequence and a chain of a 3D structure for sequence-structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1)

iCn3D also accepts the following file types: PDB, mmCIF, Mol2, SDF, and XYZ. The files can be passed through a url, e.g., <a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb">https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb</a>:

See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html) or the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

## Embed iCn3D with iframe or JavaScript libraries

iCn3D can be embedded in a web page by including the URL in HTML iframe, e.g. <iframe src="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1&width=800&height=450&showmenu=1&showcommand=1&rotate=right" width="900" height="600" style="border:none"></iframe>. This method always shows the most recent version of iCn3D.

To embed iCn3D with JavaScript libraries, the following libraries need to be included: jQuery, jQuery UI, Three.js, and iCn3D library. An html div tag to hold the 3D viewer is added. The iCn3D widget is initialized with the custom defined parameter "cfg": "var icn3dui = new iCn3DUI(cfg); icn3dui.show3DStructure();". Multiple iCn3D widgets can be embedded in a single page. 

Users can choose to show the most recent version of iCn3D, or a locked version of iCn3D. To show the most recent version, use the library files without the version postfix as shown in the [iCn3D Web API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#HowToUse). To show a locked version, use the library files with the version postfix as shown in the source code of [iCn3D page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). If the input is provided as an MMDB ID, both library files and backend cgis are versioned so that the 3D display will be stable. 

## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.


## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: The drawing of 3D objects is based on iview.
* **[GLmol](https://webglmol.osdn.jp/index-en.html)**: The drawing of nucleotides cartoon is based on GLmol.
* **[3Dmol](https://3dmol.csb.pitt.edu/)**: The surface generation and labeling are based on 3Dmol.
* **[NGL Viewer](https://github.com/arose/ngl)**: The Imposter shaders are based on NGL Viewer.
* **[LiteMol](https://github.com/dsehnal/LiteMol)**: The parser of EM density data from PDBe is based on LiteMol.

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

## Citing

To cite iCn3D, please reference:

Wang J, Youkharibache P, Zhang D, Lanczycki CJ, Geer RC, Madej T, Phan L, Ward M, Lu S, Marchler GH, Wang Y, Bryant SH, Geer LY, Marchler-Bauer A. *iCn3D, a Web-based 3D Viewer for Sharing 1D/2D/3D Representations of Biomolecular Structures.* **_Bioinformatics_. 2019** June 20; pii: btz502. [doi: 10.1093/bioinformatics/btz502](https://dx.doi.org/10.1093/bioinformatics/btz502). [PubMed PMID: 31218344](https://www.ncbi.nlm.nih.gov/pubmed/31218344), [Full Text at Oxford Academic](https://academic.oup.com/bioinformatics/advance-article/doi/10.1093/bioinformatics/btz502/5520951)