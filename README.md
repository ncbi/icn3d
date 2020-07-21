# iCn3D Structure Viewer

## [Gallery with live examples](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#gallery), [Tutorial](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#Tutorial)

## About iCn3D

"I see in 3D" (iCn3D) Structure Viewer is a WebGL-based 3D viewer using Three.js and jQuery. iCn3D synchronizes the display of 3D structure, 2D interaction, and 1D sequences and annotations. Users' custom display can be saved in a short URL or a PNG image. <b>Complete package</b> of iCn3D including Three.js and jQuery can be downloaded from [https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.0.zip](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.0.zip). The "Download ZIP" link in this page does not include third-party libraries. 
* <b>View a 3D structure in iCn3D</b>: 
    Open the link https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html, input a PDB ID, and click "Load". You can also click "File" menu to "Open File" or input other IDs.

    As mentioned in the menu "Help > Transformation Hints", you can use Left mouse button for rotation, Middle mouse wheel for zooming, and Right mouse button for translation. 

    The most important point about using iCn3D is the current selection. Any operations on color, style, etc. are working on the current selection. By default, all atoms are selected. Once you select any subset, your operation will work ONLY on the subset. You can switch the selection using the toggle next to the Help menu.

* <b>Create custom 3D view</b>: 
    You first open a structure in "File" menu, then select a subset in "Select" menu, view only the selected subset by clicking "View Only Selection" in View menu, finally change styles or colors in "Style" and "Color" menus. 

    Each operation has a corresponding command as listed at https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands. These commands will show up in the command/log window right beneath the 3D display. To view all previous commands, you can click "Share Link" in "File" menu. Both the original URL and the short URL can be used to display your custom view.

* <b>Save your work</b>: 
    You can save "iCn3D PNG Image" in the menu "File > Save Files". Both the PNG file and an HTML file are saved. Click the HTML file to see the PNG image, which is linked to the custom display via a shorten URL. The downloaded "iCn3D PNG Image" itself can also be used as an input in the menu "File > Open File" to reproduce the custom display. You can combine these HTML files to generate your own galleries.
    
    You can also save "Share Link" in "File" menu to share with your colleagues. You can click "Replay Each Step > On" in "File" menu to learn how a [custom display](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?u7gp4xS9rn4hahcLA) was generated.
    
    All "Share Link" URLs can show the original view using the archived version of iCn3D by clicking "Open File > Share Link in Archived Ver." in "File" menu.    

* <b>SNPs of 2019-nCov protein</b>: 
    You can view the [SNPs of SARS-CoV-2 structures](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?X3whJjau5t91j6i98) in the menu "Windows > Sequences & Annotations > SNP".

* <b>Use iCn3D in Jupyter Notebook</b>: 
    You can use iCn3D in Jupyter Notebook with the widget "icn3dpy". The instructions are at [pypi.org/project/icn3dpy](https://pypi.org/project/icn3dpy/).

* More features are listed at [www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html): [binding site](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?JR5B), [interaction interface](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?CuXYgGLCukDeUKnJ6), [3D printing](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&command=export+stl+stabilizer+file), [transmembrane proteins](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?TuSd), [surface](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?aYAjP4S3NbrBJX3x6), [EM map](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?L4C4WYE85tYRiFeK7), [electron density map](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?QpqNZ3k65ToYFvUB6), 1D sequences and 2D interactions, [align two structures](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?wPoW56e8QnzVfuZw6), [align two chains](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?ijnf), [align a protein sequence to a structure](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?Mmm82craCwGMAxru9), [realign](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?tu166KaK8jQYUAVf7), [custom tracks](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?pUzP), [force-directed graph for interactions](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?rshvjTFXpAFu8GDa9), [solvent accessible surface area](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?xKSyfd1umbKstGh29), [symmetry](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?bGH1BfLsiGFhhTDn8), etc. 

## Embed iCn3D with iframe or JavaScript libraries

iCn3D can be embedded in a web page by including the URL in HTML iframe, e.g. <iframe src="https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&width=300&height=300&showcommand=0&mobilemenu=1&showtitle=0" width="320" height="320" style="border:none"></iframe>. This method always shows the most recent version of iCn3D.

To embed iCn3D with JavaScript libraries, the following libraries need to be included: jQuery, jQuery UI, Three.js, and iCn3D library. An html div tag to hold the 3D viewer is added. The iCn3D widget is initialized with the custom defined parameter "cfg": "var icn3dui = new iCn3DUI(cfg); icn3dui.show3DStructure();". Multiple iCn3D widgets can be embedded in a single page. Please see the source code of the [example page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/example.html) for reference.

Users can choose to show the most recent version of iCn3D, or a locked version of iCn3D. To show the most recent version, use the library files without the version postfix as shown in the [iCn3D Web API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#HowToUse). To show a locked version, use the library files with the version postfix as shown in the source code of [iCn3D page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup). If the input is provided as an MMDB ID, both library files and backend cgis are versioned so that the 3D display will be stable. 

## Data Sources

iCn3D accepts the following IDs:

* <b>mmdbid</b>: NCBI MMDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&showanno=1&show2d=1&showsets=1)
* <b>mmtfid</b>: MMTF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=1tup&showanno=1&showsets=1)
* <b>pdbid</b>: PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=1tup&showanno=1&showsets=1)
* <b>opmid</b>: Orientations of Proteins in Membranes(OPM) PDB ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?opmid=6jxr&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?opmid=6jxr&showanno=1&showsets=1)
* <b>mmcifid</b>: mmCIF ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=1tup&showanno=1&showsets=1)
* <b>gi</b>: NCBI protein gi number, [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=827343227&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=1310960&show2d=1&showsets=1)
* <b>cid</b>: PubChem Compound ID, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=2244)
* <b>align two structures</b>: two PDB IDs or MMDB IDs for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=1hho,4n7n&showalignseq=1&show2d=1&showsets=1)
* <b>align two chains</b>: any two chains for structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?chainalign=1HHO_A,4N7N_A&showalignseq=1&show2d=1&showsets=1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?chainalign=1HHO_A,4N7N_A&showalignseq=1&show2d=1&showsets=1)
* <b>blast_rep_id and query_id</b>: NCBI protein accessions of a protein sequence and a chain of a 3D structure for sequence-structure alignment, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain 1TSR_A; show selection](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=icn3d&blast_rep_id=1TSR_A&query_id=NP_001108451.1&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain 1TSR_A; show selection)

iCn3D also accepts the following file types: PDB, mmCIF, Mol2, SDF, and XYZ. The files can be passed through a url, e.g., [https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb)</a>. See the [help page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html) or the [API page](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) for more details.

## Third-party libraries used

* **[jQuery and jQuery UI](https://jquery.com/)**: used as a general tool to write Javascript code. Some jQuery UI features are used.
* **[Three.js](http://threejs.org/)**: used to set up the 3D view.
* **[D3.js](https://d3js.org/)**: used to draw force-directed graph .

## Tools based on

* **[iview](http://istar.cse.cuhk.edu.hk/iview/)**: The drawing of 3D objects is based on iview.
* **[GLmol](https://webglmol.osdn.jp/index-en.html)**: The drawing of nucleotides cartoon is based on GLmol.
* **[3Dmol](https://3dmol.csb.pitt.edu/)**: The surface generation and labeling are based on 3Dmol.
* **[NGL Viewer](https://github.com/arose/ngl)**: The Imposter shaders are based on NGL Viewer.
* **[LiteMol](https://github.com/dsehnal/LiteMol)**: The parser of EM density data from PDBe is based on LiteMol.
* **[Orientations of Proteins in Membranes (OPM)](https://opm.phar.umich.edu/)**: The membrane data of transmembrane proteins are from OPM.
* **[Force-Directed Graph](https://gist.github.com/pkerpedjiev/f2e6ebb2532dae603de13f0606563f5b)**: "2D Graph (Force-Directed)" in the menu "View > H-Bonds & Interactions" is based on Force-Directed Graph.
* **[py3Dmol](https://pypi.org/project/py3Dmol/)**: The Jupyter Notebook widget "icn3dpy" is based on py3Dmol.

## Building

If you want to build your code easily, you'll need to install nodejs and npm.

Next, clone this repository, and then perform the following setup steps in your working copy of icn3d. 

```
npm install -g gulp
npm install
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