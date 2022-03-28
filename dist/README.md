# iCn3D Structure Viewer

## [Gallery with live examples](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#gallery), [Tutorial](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#videos)

## About iCn3D

"I see in 3D" (iCn3D) Structure Viewer is not only a web-based 3D viewer, but also a structure analysis tool interactively or in the batch mode using NodeJS scripts based on the npm package icn3d. iCn3D synchronizes the display of 3D structure, 2D interaction, and 1D sequences and annotations. Users' custom display can be saved in a short URL or a PNG image. <b>The complete package of iCn3D</b> including Three.js and jQuery is in the directory "dist" after you get the source code with the "Code" button. 
* <b>View a 3D structure in iCn3D</b>: 
    Open the link https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html, input a PDB ID, and click "Load". You can also click "File" menu to "Open File" or input other IDs.

    As mentioned in the menu "Help > Transformation Hints", you can use Left mouse button for rotation, Middle mouse wheel for zooming, and Right mouse button for translation. 

    The most important point about using iCn3D is the current selection. Any operations on color, style, etc. are working on the current selection. By default, all atoms are selected. Once you select any subset, your operation will work ONLY on the subset. You can switch the selection using the toggle next to the Help menu.

* <b>Create custom 3D view</b>: 
    You first open a structure in "File" menu, then select a subset in "Select" menu, view only the selected subset by clicking "View Only Selection" in View menu, finally change styles or colors in "Style" and "Color" menus. 

    Each operation has a corresponding command as listed at https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands. These commands will show up in the command/log window right beneath the 3D display. To view all previous commands, you can click "Share Link" in "File" menu. Both the original URL and the short URL can be used to display your custom view.

* <b>Save your work</b>: 
    You can save "iCn3D PNG Image" in the menu "File > Save Files". Both the PNG file and an HTML file are saved. Click the HTML file to see the PNG image, which is linked to the custom display via a shorten URL. The downloaded "iCn3D PNG Image" itself can also be used as an input in the menu "File > Open File" to reproduce the custom display. You can combine these HTML files to generate your own galleries.
    
    You can also save "Share Link" in "File" menu to share with your colleagues. These URLs are lifelong. You can click "Replay Each Step > On" in "File" menu to learn how a [custom display](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?u7gp4xS9rn4hahcLA) was generated.
    
    All "Share Link" URLs can show the original view using the archived version of iCn3D by clicking "Open File > Share Link in Archived Ver." in "File" menu.    

* <b>Python scripts to batch process structures</b>: 
    Python scripts can be used to process 3D structures (e.g., export secondary structures, PNG images, or analysis output) in batch mode. The example scripts are at [icn3dpython](https://github.com/ncbi/icn3d/tree/master/icn3dpython).

* <b>Node.js scripts using npm "icn3d" to batch process structures</b>: 
    You can download [npm "icn3d" package](https://www.npmjs.com/package/icn3d) to write Node.js scripts by calling iCn3D functions. These scripts can be used to process 3D structures (e.g., calculate interactions) in batch mode. The example scripts are at [icn3dnode](https://github.com/ncbi/icn3d/tree/master/icn3dnode).

* <b>Annotations for AlphaFold structures</b>: 
    For any custom structures such as AlphaFold structures, you can show [conserved domain and 3D domain annotations](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?bPSkpeshtiH1TxbP8). For AlphaFold structures, you can also show [SNP and ClinVar annotations](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?XSQ5oqDCTfEQ3iAY7).

* <b>Align AlphaFold structures</b>: 
    You can align [AlphaFold structures or PDB structures](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?chainalign=P69905_A,P01942_A,1HHO_A&showalignseq=1&bu=0) with the menu "File > Align > Multiple Chains" or "File > Align > Structure to Structure > Two AlphaFold Structures". You can also load any structures as usual, then load your custom PDB file with the menu "File > Open File > PDB File (appendable)", then relaign these structures with the meu "File > Realign Selection > by Structure Alignment".

* <b>Alternate SNPs in 3D</b>: 
    You can [alternate in 3D wild type and mutant of SNPs](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?fNpzDuUE287SBFtz8) by clicking the menu "Analysis > Sequences & Annotations", the tab "Details", the checkbox "SNP", and mouseover on SNPs.

* <b>DelPhi Electrostatic Potential</b>: 
    You can view the [DelPhi Electrostatic Potential](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?31DFceJiYw7SfStQA) in the menu "Analysis > DelPhi Potential".

* <b>Symmetry</b>:
    You can show [precalculated symmetry](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?bGH1BfLsiGFhhTDn8), or calculate [symmetry dynamically](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?6NvhQ45XrnbuXyGe6) using SymD.

* <b>Use iCn3D in Jupyter Notebook</b>: 
    You can use iCn3D in Jupyter Notebook with the widget "icn3dpy". The instructions are at [pypi.org/project/icn3dpy](https://pypi.org/project/icn3dpy/).

* <b>2D Cartoons in the chain, domain, and secondary structure levels</b>: 
    You can use click "Analysis > 2D Cartoon" to show 2D Cartoons in the [chain](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?pzmT7EMTAxXKVbZu7), [domain](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?Arh4H9VTMuHQURY5A), and [secondary structure](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?5iZSHNbXcJisp7gQ6) levels.  

* <b>Contact Map for any Selected Residues</b>:
    You can click the menu "Analysis > Contact Map" to show the interactive [contact map](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?rnMbe26tNsAjJLGK9) for any selected residues. You can export the map in PNG or SVG.

* More features are listed at [www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html): [binding site](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?JR5B), [interaction interface](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?CuXYgGLCukDeUKnJ6), [3D printing](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=export+stl+stabilizer+file), [transmembrane proteins](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?TuSd), [surface](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?aYAjP4S3NbrBJX3x6), [EM map](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?L4C4WYE85tYRiFeK7), [electron density map](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?QpqNZ3k65ToYFvUB6), 1D sequences and 2D interactions, [align two structures](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?PfsQFtZRTgFAW2LG6), [align multiple chains](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?ijnf), [align a protein sequence to a structure](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?Mmm82craCwGMAxru9), [realign](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?UccFrXLDNeVB7Jk16), [custom tracks](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?pUzP), [force-directed graph for interactions](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?rshvjTFXpAFu8GDa9), [solvent accessible surface area](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?xKSyfd1umbKstGh29), etc. 

## Embed iCn3D with iframe or JavaScript libraries

iCn3D can be embedded in a web page by including the URL in HTML iframe, e.g. <iframe src="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&width=300&height=300&showcommand=0&mobilemenu=1&showtitle=0" width="320" height="320" style="border:none"></iframe>. This method always shows the most recent version of iCn3D.

To embed iCn3D with JavaScript libraries, the following libraries need to be included: jQuery, jQuery UI, Three.js, and iCn3D library. An html div tag to hold the 3D viewer is added. The iCn3D widget is initialized with the custom defined parameter "cfg": "var icn3dui = new icn3d.iCn3DUI(cfg); icn3dui.show3DStructure();". Multiple iCn3D widgets can be embedded in a single page. Please see the source code of the [example page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/example.html) for reference.

Users can choose to show the most recent version of iCn3D, or a locked version of iCn3D. To show the most recent version, use the library files without the version postfix as shown in the [iCn3D Doc page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#HowToUse). To show a locked version, use the library files with the version postfix as shown in the source code of [iCn3D page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). If the input is provided as an MMDB ID, both library files and backend cgis are versioned so that the 3D display will be stable. 

## Data Sources

iCn3D accepts the following IDs:

* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1)
* <b>mmtfid</b>: MMTF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&showanno=1&showsets=1)
* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&showanno=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&showanno=1&showsets=1)
* <b>afid</b>: AlphaFold UniProt ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?afid=A0A061AD48&showanno=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?afid=A0A061AD48&showanno=1&showsets=1)
* <b>opmid</b>: Orientations of Proteins in Membranes(OPM) PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?opmid=6jxr&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?opmid=6jxr&showanno=1&showsets=1)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&showanno=1&showsets=1)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=1310960&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=1310960&show2d=1&showsets=1)
* <b>uniprotid</b>: UniProt ID, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?uniprotid=P0DTC2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?uniprotid=P0DTC2)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align two structures</b>: two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1)
* <b>align multiple chains</b>: any multiple chains for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?chainalign=1HHO_A,4N7N_A&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?chainalign=1HHO_A,4N7N_A&showalignseq=1&show2d=1&showsets=1)
* <b>blast_rep_id and query_id</b>: NCBI protein accessions of a protein sequence and a chain of a 3D structure for sequence-structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain 1TSR_A; show selection](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain 1TSR_A; show selection)

iCn3D also accepts the following file types: PDB, mmCIF, Mol2, SDF, XYZ, and iCn3D PNG. The files can be passed through a url, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https://files.rcsb.org/view/1gpk.pdb](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https://files.rcsb.org/view/1gpk.pdb) or [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=icn3dpng&url=https://www.ncbi.nlm.nih.gov/Structure/icn3d/pdb/3GVU.png](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=icn3dpng&url=https://www.ncbi.nlm.nih.gov/Structure/icn3d/pdb/3GVU.png). See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html) or the [Doc page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.
* **[D3.js](https://d3js.org/)**: used to draw force-directed graph.
* **[DelPhi](http://honig.c2b2.columbia.edu/delphi)**: used to calculate electrostatic potential dynamically and is <b>licensed</b> from Columbia University.
* **[DelPhiPKa](http://compbio.clemson.edu/pka_webserver)**: used to add hydrogens and partial charges to proteins and nucleotides.
* **[Open Babel](http://openbabel.org/wiki/Main_Page)**: used to add hydrogens to ligands.
* **[Antechamber](http://ambermd.org/antechamber/ac.html)**: used to add partial charges to ligands.
* **[SymD](https://symd.nci.nih.gov/)**: used to calculate symmetry dynamically.
* **[scap/Jackal](http://honig.c2b2.columbia.edu/scap)**: used to predict side chain conformation dynamically.

## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: The drawing of 3D objects is based on iview.
* **[GLmol](https://webglmol.osdn.jp/index-en.html)**: The drawing of nucleotides cartoon is based on GLmol.
* **[3Dmol](https://3dmol.csb.pitt.edu/)**: The surface generation and labeling are based on 3Dmol.
* **[NGL Viewer](https://github.com/arose/ngl)**: The Imposter shaders are based on NGL Viewer.
* **[LiteMol](https://github.com/dsehnal/LiteMol)**: The parser of EM density data from PDBe is based on LiteMol.
* **[Orientations of Proteins in Membranes (OPM)](https://opm.phar.umich.edu/)**: The membrane data of transmembrane proteins are from OPM.
* **[Force-Directed Graph](https://gist.github.com/pkerpedjiev/f2e6ebb2532dae603de13f0606563f5b)**: "2D Graph (Force-Directed)" in the menu "Analysis > H-Bonds & Interactions" is based on Force-Directed Graph.
* **[py3Dmol](https://pypi.org/project/py3Dmol/)**: The Jupyter Notebook widget "icn3dpy" is based on py3Dmol.

## Building

If you want to build your code easily, you'll need to install nodejs and npm.

Next, clone this repository, and then perform the following setup steps in your working copy of icn3d. 

```
npm config set -g production false
npm install -g gulp
npm install
npm install uglify-js@3.3.9
```

The first line sets the npm default as dev so that all modules will be installed. The second line installs the gulp build tool globally, making the `gulp` command available on the command line. The third line install all modules. The fourth line changes the version of uglify-js to an old version, which does not compress class names. 

You only have to perform the above steps once, to set up your working directory. From then on, to build, simply enter:

```
gulp
```

## Contact

Please send all comments to wangjiy@ncbi.nlm.nih.gov. 

## Citing
Bioinformatics. 2020 Jan 1;36(1):131-135. doi: 10.1093/bioinformatics/btz502.

To cite iCn3D, please reference:

Wang J, Youkharibache P, Zhang D, Lanczycki CJ, Geer RC, Madej T, Phan L, Ward M, Lu S, Marchler GH, Wang Y, Bryant SH, Geer LY, Marchler-Bauer A. *iCn3D, a Web-based 3D Viewer for Sharing 1D/2D/3D Representations of Biomolecular Structures.* **_Bioinformatics_. 2020** Jan 1; 36(1):131-135. (Epub 2019 June 20.) [doi: 10.1093/bioinformatics/btz502](https://dx.doi.org/10.1093/bioinformatics/btz502). [PubMed PMID: 31218344](https://www.ncbi.nlm.nih.gov/pubmed/31218344), [Full Text at Oxford Academic](https://academic.oup.com/bioinformatics/article/36/1/131/5520951)

Wang J, Youkharibache P, Marchler-Bauer A, Lanczycki C, Zhang D, Lu S, Madej T, Marchler GH, Cheng T, Chong LC, Zhao S, Yang K, Lin J, Cheng Z, Dunn R, Malkaram SA, Tai C-H, Enoma D, Busby B, Johnson NL, Tabaro F, Song G, Ge Y. *iCn3D: From Web-Based 3D Viewer to Structural Analysis Tool in Batch Mode.* **_Front. Mol. Biosci._ 2022** 9:831740. (Epub 2022 Feb 17.) [doi: 10.3389/fmolb.2022.831740](https://dx.doi.org/10.3389/fmolb.2022.831740). [Full Text at Frontiers](https://www.frontiersin.org/articles/10.3389/fmolb.2022.831740/full)
