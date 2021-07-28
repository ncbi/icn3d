## Change Log
[icn3d-3.3.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.3.4.zip) was release on July 28, 2021. The license of scap for side chain prediction was waived by Dr. Barry Honig. Replaced 'var' with 'let' in iCn3D JavaScript files.

[icn3d-3.3.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.3.2.zip) was release on July 14, 2021. Now users can choose the color gradient and show the color legend for the "Custom Color" button in the Sequences & Annotations window.

[icn3d-3.3.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.3.1.zip) was release on July 7, 2021. Enabled to use as an input a URL containing a saved iCn3D PNG image in the menu "File > Open File > URL (Same Host)". Fixed a bug in displaying an assembly with multiple copies of a structure.

[icn3d-3.3.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.3.0.zip) was release on June 30, 2021. Added the feature to show contact map for any selected residues in the menu "Analysis > Contact Map".

[icn3d-3.2.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.2.3.zip) was release on June 25, 2021. Enabled to set the URL parameter "menumode" to "1" to show icons for those menus requiring internet access or license.

[icn3d-3.2.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.2.2.zip) was release on June 20, 2021. Skipped the secondary structure calculation when the input is a PDB file of nucleotides.

[icn3d-3.2.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.2.1.zip) was release on June 18, 2021. Export all classes so that functions in these classes can be manually modified as shown in the file example.html.

[icn3d-3.2.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.2.0.zip) was release on June 8, 2021. Added the option to load UniProt ID in the menu "File > Retrieve by ID > UniProt ID".

[icn3d-3.1.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.6.zip) was release on June 4, 2021. Fixed file export in 3D printing due to the change of Geometry to BufferGeometry in three.js version 128.

[icn3d-3.1.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.5.zip) was release on June 2, 2021. Added an option to load predefined alignments in the menu "File > Align > Multiple Chains". Enabled to change the shininess, lights, and thickness in the menu "Style > Preferences".

[icn3d-3.1.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.4.zip) was release on May 27, 2021. Remove "alert" in the npm icn3d package. 

[icn3d-3.1.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.3.zip) was release on May 25, 2021. Switched residue numbers from integers to strings such as "100A". 

[icn3d-3.1.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.2.zip) was release on May 17, 2021. iCn3D could hide the features requiring licenses, such as "Analysis > DelPhi Potential" and "Analysis > Mutaion" using the URL parameter "hidelicense=1".

[icn3d-3.1.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.1.zip) was release on May 10, 2021. Fixed the URL parameters in full.html.

[icn3d-3.1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.1.0.zip) was release on May 7, 2021. Added icn3d.module.js in the build directory. Upgraded three.js from version 103 to version 128. THREE.Geometry was replaced with THREE.BufferGeometry.

[icn3d-3.0.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-3.0.0.zip) was release on May 3, 2021. iCn3D version 3.0.0 was converted to ES6 with classes and is available in npm with the package "icn3d". Users can use npm to install icn3d and generate Node.js scripts by calling icn3d functions. All previously embedded iCn3D will not be affected. To embed iCn3D version 3, iCn3D JavaScript and CSS library files were renamed from "icn3d_full_ui" to "icn3d". A global variable "icn3d" was used to access the class iCn3DUI: "var icn3dui = new icn3d.iCn3DUI(cfg)".

[icn3d-2.24.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.6.zip) was release on March 22, 2021. Broke large files into small ones and stopped upgrading the basic/simple UI.

[icn3d-2.24.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.5.zip) was release on March 4, 2021. Changed the default 3D view (https://www.ncbi.nlm.nih.gov/Structure/icn3d/index.html) from the basic view (https://www.ncbi.nlm.nih.gov/Structure/icn3d/simple.html) to the advanced view (https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html).

[icn3d-2.24.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.4.zip) was release on February 12, 2021. Added an option to save a sharable link with your note/window title in the menu "File > Share Link".

[icn3d-2.24.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.3.zip) was release on February 9, 2021. Added a few more Node.js scripts in icn3dnode to retrieve ligand-protein and protein-protein interactions, change of interactions, binding site and domain information in the command line.

[icn3d-2.24.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.2.zip) was release on February 3, 2021. Enabled to show multiple mutations together in the menu "Analysis > Mutation". 

[icn3d-2.24.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.1.zip) was release on February 1, 2021. Enabled to show multiple mutations together ( https://structure.ncbi.nlm.nih.gov/icn3d/share.html?tKz5GiA2pTVQEWwy6). Fixed the alternation in multiple chain alignment. 

[icn3d-2.24.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.24.0.zip) was release on January 27, 2021. Converted the interaction part of iCn3D to Node.js (in the directory icn3dnode) to allow batch-mode analysis. Expanded the chain-chain alignment to multiple chain alignment in the menu "File > Align > Multiple Chains". You could focus on part of the chains for the multiple chain alignment.

[icn3d-2.23.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.23.2.zip) was release on January 8, 2021. Adjust the chain IDs according to the data from the backend cgi that aligns a sequence to a structure. 

[icn3d-2.23.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.23.1.zip) was release on January 6, 2021. Added version number and improved Principle Axes view. 

[icn3d-2.23.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.23.0.zip) was release on December 22, 2020. Use PDB residue numbers when the input is MMDB ID. 

[icn3d-2.22.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.22.2.zip) was release on December 15, 2020. Enabled to show secondary structures for a PDB file containing multiple structures. 

[icn3d-2.22.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.22.1.zip) was release on December 1, 2020. Added cartoons for glycan display by default. The cartoons can be toggled in the menu "Style > Glycans". 

[icn3d-2.22.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.22.0.zip) was release on November 24, 2020. Users now can alternate  wild type and mutant, and their interaction networks in 3D for each SNP/ClinVar in the "Sequences & Annotation" window. 

[icn3d-2.21.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.21.0.zip) was release on November 17, 2020. Symmetry can be calculated dynamically for selected residues using SymD. The menu is at "Analysis > Symmetry (SymD, dynamic)". Speeded up the loading of VAST+ structure alignment.

[icn3d-2.20.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.20.2.zip) was release on October 29, 2020. Fixed the DelPhi potential map in VAST+ alignment. Added back the usage tracking.

[icn3d-2.20.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.20.1.zip) was release on October 13, 2020. Reverted the label scale to 0.3. Updated the LICENSE.

[icn3d-2.20.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.20.0.zip) was release on October 6, 2020. Users can show electrostatic potential on surface or as equipotential map for any subsets of proteins/nucleotides/membrane/ligands. The PQR file (modified PDB file with partial charges and radii) can also be downloaded. The display of helices, tubes, and axes were improved. Users can change the helix display at the menu "Style > Two-color Helix".

[icn3d-2.19.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.19.1.zip) was release on September 15, 2020. Added shade to 3D display using multiple lights.

[icn3d-2.19.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.19.0.zip) was release on August 12, 2020. DelPhi potential map can be displayed for PDB structures at "Analysis > DelPhi Potential". The PDB file can be loaded in the URL with "pdbid=" or at "File > Open File". The DelPhi potential file can be calculated at DelPhi Web Server and be exported as a Cube file. The potential file can be accessed in a URL if it is located in the same host as iCn3D.

[icn3d-2.18.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.4.zip) was release on August 10, 2020. Fixed bugs in recently modified dropdown menus.

[icn3d-2.18.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.3.zip) was release on August 3, 2020. Moved "H-Bonds & Interactions" to "Analysis" menu and merged "Windows" menu with "Analysis" menu. Changed the default dialog color to blue. Users can change it at the menu "Style > Dialog Color".

[icn3d-2.18.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.2.zip) was release on July 28, 2020. Use strict mode and shrink code size.

[icn3d-2.18.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.1.zip) was release on July 23, 2020. Fixed the issue in the Jupyter Notebook widget icn3dpy; fixed the synchronized issue of the function show3DStructure().

[icn3d-2.18.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.18.0.zip) was release on July 20, 2020. Showed SNPs for SARS-CoV-2 proteins; generated icn3dpy (the Jupyter Notebook widget of iCn3D) at https://pypi.org/project/icn3dpy; added "2D Interaction Map" in the menu "View > H-Bonds & Interactions"; added the shrink/expand icon in each orange dialog/window.

[icn3d-2.17.7](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.7.zip) was release on July 7, 2020. Added iCn3D tutorial videos and slides.

[icn3d-2.17.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.6.zip) was release on June 29, 2020. All "Share Link" URLs can show the original view using the archived version of iCn3D at "File > Open File > Share Link URL in Fixed Ver.".

[icn3d-2.17.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.5.zip) was release on June 26, 2020. Made a versioned full_[version].html file so that "Share Link" URL could point to a fixed version by replacing "full.html" with "full_[version].html".

[icn3d-2.17.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.4.zip) was release on June 24, 2020. Users now can select options for cross structure interaction in alignment. Get ClinVar annotations from database.

[icn3d-2.17.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.3.zip) was release on June 18, 2020. Added the track "Cross-Linkages" for glycans, etc.

[icn3d-2.17.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.2.zip) was release on June 17, 2020. Added pinger to log usage.

[icn3d-2.17.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.1.zip) was release on June 15, 2020. Enabled to accept RID from BLAST result page.

[icn3d-2.17.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.17.0.zip) was release on June 12, 2020. Users can now show "2D Interaction Graph" and also "Highlight Interactions in Table" in the menu "View > H-Bonds & Interactions". Users can also replay the share link step by step to learn how to generate a custom display in the menu "File > Replay Each Step".

[icn3d-2.16.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.16.4.zip) was release on June 8, 2020. Enabled to turn force off in 2D Graph so that users can manually arrange the nodes.

[icn3d-2.16.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.16.3.zip) was release on June 5, 2020. Added halogen bonds, pi-cation, and pi-stacking interactions in the menu "View > H-Bonds & Interaction" and showed the interactions in sorted tables.

[icn3d-2.16.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.16.2.zip) was release on May 29, 2020. Added the following features: 1. save contents in any dialog/window using the save icon next to the closeicon, 2. set names for each tab/window using the menu "Windows > Your Note / Window Title", 3. select by property (such as residue type, solvent accessibilty, etc) in the "Select" menu, 4. Use a custom file to define the color or tube size for each residue by clicking the button "Custom Color / Tube" in the "Sequences & Annotations" window.

[icn3d-2.16.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.16.1.zip) was release on May 27, 2020. Enabled to show gaps when adding multiple sequence alignment data as tracks. 

[icn3d-2.16.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.16.0.zip) was release on May 21, 2020. Enabled to show interactions using force-directed graph in the menu "View > H-Bonds & Interactions > Force-Directed Graph". Enabled to calculate Solvent Accessible Surface Area (SASA) in the menu "View > Surface Area", or color by SASA in the menu "Color > Solvent Accessibility". Fixed ClinVar and SNP annotations.

[icn3d-2.15.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.15.3.zip) was release on May 8, 2020. Enabled to update the short "Share Link" URL; enabled to save in a sharable URL the "Side by Side" view, which is useful to view two aligned structures.

[icn3d-2.15.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.15.2.zip) was release on May 5, 2020. Fixed the display of electron density map and EM map.

[icn3d-2.15.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.15.1.zip) was release on April 27, 2020. Improved the unionHash function to speed up selection. Improved the message when loading a list of commands.

[icn3d-2.15.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.15.0.zip) was release on April 21, 2020. Enabled to show the same structure "Side by Side" in two views in the "View" menu. Each view has the same orientation, but can have independent 3D display. Enabled to add multiple sequence alignments as tracks when clicking "Add Track" in the "Sequences & Annotations" window. Added "Hide Selection" in the "View" menu. Improved selection on "H-Bonds & Interactions". Improved the UI for "Realign Selection" in the "File" menu. The gallery shows COVID-19-related structures at the top. 

[icn3d-2.14.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.14.0.zip) was release on April 15, 2020. Added the features to load Electron Density data in the menu "File > Open File > Electron Density (DSN6)", resize the 3D window, realign two structures in the menu "File > Realign", color residues with custom colors in the menu "Color > Residue > Custom", and add custom colors when aligning a sequence to a structure.

[icn3d-2.13.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.13.1.zip) was release on March 26, 2020. Showed membranes for transmembrane proteins in VAST+ alignment.

[icn3d-2.13.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.13.0.zip) was release on March 23, 2020. Added the "Symmetry" feature in the View menu.

[icn3d-2.12.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.12.1.zip) was release on March 12, 2020. Fixed a bug on hydrogen bonds between residues with the same residue number but different chain names. Removed duplicated names in the menu of "Defined Sets".

[icn3d-2.12.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.12.0.zip) was release on March 2, 2020. Enabled to realign selected residues in VAST+ structure alignment. The option "Realign Selection" is in the View menu.

[icn3d-2.11.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.5.zip) was release on Fearuary 11, 2020. Add colors to aligned sequence track based on Blosum62.

[icn3d-2.11.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.4.zip) was release on January 14, 2020. The compiling tool gulp was upgraded to version 4.

[icn3d-2.11.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.3.zip) was release on January 7, 2020. A bug was fixed to have predefined sets available for hydrogen bonds/interations.

[icn3d-2.11.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.2.zip) was release on December 20, 2019. Added the style Backbone and added 'use strict' to each function.

[icn3d-2.11.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.1.zip) was release on December 19, 2019. Fixed a bug in chain alignment due to the introduction of membranes.

[icn3d-2.11.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.11.0.zip) was release on December 16, 2019. Enabled to show membranes for transmembrane proteins for data from PDB or MMDB by aligning the coordinates to the data from Orientations of Proteins in Membranes (OPM) database. Users could adjust the location of the membrane as well.

[icn3d-2.10.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.10.1.zip) was release on December 9, 2019. Enabled to select the currently displayed set in the Select menu and fixed some bugs on H-Bonds & Interactions.

[icn3d-2.10.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.10.0.zip) was release on December 5, 2019. Enabled to show each hydrogen bond and contact in 3D using the menu "View > H-Bonds & Interactions".

[icn3d-2.9.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.9.2.zip) was release on November 18, 2019. Added Transmembrane track if the input is opmid. Added angle constraint for hydrogen bonds.

[icn3d-2.9.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.9.1.zip) was release on November 14, 2019. Enable to select regions between two X-Y membranes for transmembrane proteins.

[icn3d-2.9.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.9.0.zip) was release on November 8, 2019. Display membranes for transmembrane proteins using data from Orientations of Proteins in Membranes (OPM). The feature is at "File > Retrieve by ID > OPM PDB ID".

[icn3d-2.8.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.8.3.zip) was release on November 5, 2019. Display/output salt bridges; color helices and sheets with spectrum in the menu "Color > Secondary > Spectrum".

[icn3d-2.8.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.8.2.zip) was release on October 29, 2019. Reduced the size of three.js (version 103) library. Added links to dbSNP in the mouseover texts of SNP annotations.  

[icn3d-2.8.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.8.1.zip) was release on October 21, 2019. Fixed the 2D interaction display in structure alignment. The bug was introduced in the last release.  

[icn3d-2.8.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.8.0.zip) was release on October 10, 2019. Allowed to align any chain to another chain in the menu "File > Align > Chain to Chain".  

[icn3d-2.7.19](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.19.zip) was release on September 9, 2019. Fixed the input width and height with "%". 

[icn3d-2.7.18](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.18.zip) was release on September 4, 2019. Added the option to view in Full Screen mode by clicking the expansion icon in the top-right corner when "mobilemenu" is turned on, or by clicking "Full Screen" in the View menu. 

[icn3d-2.7.17](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.17.zip) was release on September 3, 2019. Made it easy to save interactive work by clicking "File > Save Files > iCn3D PNG Images". This saves both "iCn3D PNG Image" and an HTML file with a clickable PNG image, which is link to the custom display via a sharable link. 

[icn3d-2.7.16](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.16.zip) was release on August 29, 2019. Fixed the transparent display by switching three.js from version 107 to 103. 

[icn3d-2.7.15](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.15.zip) was release on August 21, 2019. Added an example page to embed multiple iCn3D viewers in one page. 

[icn3d-2.7.14](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.14.zip) was release on August 21, 2019. Enabled the mobile style menu with the URL parameter "mobilemenu=1". 

[icn3d-2.7.13](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.13.zip) was release on August 14, 2019. Fixed the calculations on contacting atoms by considering the centers of atoms and not radii of atoms. Minimized the code size by retrieving some rarely used code on the fly. 

[icn3d-2.7.12](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.12.zip) was release on August 8, 2019. The backend to retrieve ClinVar annotation was fixed.

[icn3d-2.7.11](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.11.zip) was release on August 6, 2019. Added "Label Scale" in the View menu to scale all labels.

[icn3d-2.7.10](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.10.zip) was release on August 5, 2019. Improved the display of binding sites with fog and slab.

[icn3d-2.7.9](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.9.zip) was release on August 1, 2019. Fixed the effect of Fog on sticks and spheres.

[icn3d-2.7.8](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.8.zip) was release on July 31, 2019. Fixed SNP annotation in the sequences and annotations window.

[icn3d-2.7.7](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.7.zip) was release on July 30, 2019. Added the option to show or hide hydrogens when displaying PubChem compounds.

[icn3d-2.7.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.6.zip) was release on July 18, 2019. Enabled to show disulfide bonds when a custom pdb file is input; added the option to output pairs for disulfide bonds, hydrogen bonds, and interacting/contacting residues by distance.

[icn3d-2.7.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.5.zip) was release on July 16, 2019. Added a Gallery section. Fixed the picking and centering issues in some Mac computers. Optimized the width and height of embedded iCn3D viewer.

[icn3d-2.7.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.4.zip) was release on July 8, 2019. Included Miniland1333's fix on clickTab for the basic display; auto-detected lipids and treated them as chemicals; improved the display of modified PDB files; mouseover showed the structure names when there are more than one structures.

[icn3d-2.7.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.3.zip) was release on June 6, 2019. Improved the display of transparent surfaces.

[icn3d-2.7.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.2.zip) was release on June 5, 2019. Fixed the display of transparent surfaces.

[icn3d-2.7.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.1.zip) was release on June 3, 2019. Fixed the sequence display when there are insertion codes or missing coordinates.

[icn3d-2.7.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.7.0.zip) was release on May 20, 2019. "Share Link" can be used to reproduce a custom display when the input is a known ID. "iCn3D PNG Image" can be saved and opened in the File menu to reproduce a custom display for all cases, even when the input is a PDB file or other files.

[icn3d-2.6.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.6.zip) was release on May 16, 2019. The sequence display was fixed when the input is a MMTF ID or a mmCIF ID.

[icn3d-2.6.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.5.zip) was release on May 14, 2019. The sequence display was fixed when the input is a pdb file.

[icn3d-2.6.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.4.zip) was release on April 29, 2019. jQuery was upgraded to version 3.4.0.

[icn3d-2.6.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.3.zip) was release on April 23, 2019. Showed SNP annotations for more 3D structures.

[icn3d-2.6.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.2.zip) was release on April 15, 2019. Enabled to show large structure such as HIV-1 capsid (3J3Q): (https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=3j3q).

[icn3d-2.6.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.1.zip) was release on April 1, 2019. Enabled to link from BLAST result page to iCn3D.

[icn3d-2.6.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.6.0.zip) was release on March 19, 2019. Users can now align any sequence to a hit structure by clicking "Align > Sequence to Structure" in the File menu. The default color scheme is color by sequence "Conservation" for sequence-structure or structure-structure alignments.

[icn3d-2.5.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.3.zip) was release on March 12, 2019. Added commands for up arraow and down arrow after picking a residue. 

[icn3d-2.5.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.2.zip) was release on March 5, 2019. The style Lines was fixed by replacing THREE.Line with THREE.LineSegments. 

[icn3d-2.5.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.1.zip) was release on February 14, 2019. Change log was moved to the file CHANGELOG.md. Share Link was changed from https://d55qc.app.goo.gl/### to https://icn3d.page.link/###. All previous share links still work. iCn3D library file was renamed from full_ui_all_#.#.#.min.js to icn3d_full_ui_#.#.#.min.js. Both files are available to make it backward compatible. 

[icn3d-2.5.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.5.0.zip) was release on January 31, 2019. Updated Three.js from version 80 to version 99. Enabled the basic version (simple_ui_all.min.js) to hide the Tools menu and title. Fixed a bug in picking an atom for distance or labeling.

[icn3d-2.4.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.4.3.zip) was release on January 22, 2019. Non-standard proteins or nucleotides were still displayed as "Biopolymer" in 2D interactions and were displayed in the style of protein or nucleotide in 3D. The usage tracking was implemented in iCn3D.

[icn3d-2.4.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.4.2.zip) was release on January 16, 2019. Non-standard proteins or nucleotides were displayed as "Biopolymer" in 2D interactions and were displayed in the style of "Stick" in 3D. A new kind of annotation "Disulfie Bonds" was added to the "Sequences and Annotations" window.

[icn3d-2.4.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.4.1.zip) was release on January 7, 2019. Enabled users to show EM density map for any subset of an EM structure.

[icn3d-2.4.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.4.0.zip) was release on December 17, 2018. Enabled users to show electron density map for any subset of a crystal structure.

[icn3d-2.3.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.4.zip) was release on December 12, 2018. Enabled users to load a saved iCn3D PNG image into iCn3D to reproduce the display using the URL embedded in the image.

[icn3d-2.3.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.3.zip) was release on December 6, 2018. Made the list of interacting residues consistent in "File -> Save Files -> Interaction List" and in the "Sequences and Annotations" window.

[icn3d-2.3.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.2.zip) was release on October 30, 2018. Water molecules were enabled to be shown when the structure is not a biological assembly. Gene symbols were shown for each chain in the "Sequences and Annotations" window.

[icn3d-2.3.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.1.zip) was release on October 25, 2018. The color of the the first residue in a coil was fixed.

[icn3d-2.3.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.3.0.zip) was release on October 18, 2018. Added set operations (union,intersection, exclusion) in "Defined Sets"; added buttons "Helix Sets" and "Sheet Sets" in the "Sequences and Annotations" window to define helix sets and sheet sets in the window "Defined Sets"; added "Save Color" and "Apply Saved Color" in the menu "Color"; added "Save Style" and "Apply Saved Style" in the menu "Style"; added "Side Chains" in the menu "Select" to select side chains; added two options for color by "Secondary" structures: "Sheets in Green" and "Sheets in Yellow"; added color by "B-factor" that is normalized with "Original" values or "Percentile" values.

[icn3d-2.2.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.5.zip) was release on September 17, 2018. A bug in loading local PDB file was fixed.

[icn3d-2.2.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.4.zip) was release on September 6, 2018. The location of 2D interaction dialog was optimized.

[icn3d-2.2.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.3.zip) was release on August 30, 2018. Added an option to show N- and C-terminal labels.

[icn3d-2.2.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.2.zip) was release on August 9, 2018. Defined sets can be combined using "or", "and", and "not".

[icn3d-2.2.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.1.zip) was release on August 3, 2018. Mouseover on the 3D structure shows the residue or atom name. Some Ajax calls are combined into one Ajax call.

[icn3d-2.2.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.2.0.zip) was release on July 30, 2018. The smoothing algorithm was switched from Catmull-Rom spline to cubic spline to make the curves more smooth. The thickness of ribbon was decreased to make the sides of the ribbons less apparent. The radio buttons in the menus was replaced by the check sign. A "Save Image" button was added in the "Toolbar".

[icn3d-2.1.8](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.8.zip) was release on July 12, 2018. Checked the code with the strict mode.

[icn3d-2.1.7](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.7.zip) was release on June 28, 2018. Simplified the addition of custom text as a track in the Sequences and Annotations window.

[icn3d-2.1.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.6.zip) was release on June 21, 2018. A color picker was added to the color menu.

[icn3d-2.1.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.5.zip) was release on June 18, 2018. 3D printing are enabled for biological assemblies.

[icn3d-2.1.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.4.zip) was release on June 7, 2018. The retrieval of transformation matrix from mmCIF was fixed for Mac.

[icn3d-2.1.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.3.zip) was release on May 30, 2018.  "Sequences and Annotations" is now able to be highlighted even if some annotations didn't show up.

[icn3d-2.1.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.2.zip) was release on May 23, 2018. The surface display was improved by adding light reflection. Light was added to the display of instanced biological assemblies.

[icn3d-2.1.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.1.zip) was release on May 22, 2018. The option of color by "Spectrum" was added back.

[icn3d-2.1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.1.0.zip) was release on May 21, 2018. The instancing method is used to display a biological assembly. It significantly improved the rendering speed by sending only the geometry of its assymmetruic unit to GPU and applying transformation matrices to display the assembly.

[icn3d-2.0.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.3.zip) was release on May 2, 2018. Removed the "Description" field when saving a set of atoms. This made "Share Link" URL shorter. Made the size of stabilizer thicker for 3D printing.

[icn3d-2.0.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.2.zip) was release on April 30, 2018. Reset WebGLRenderer when WebGL context is lost in Internet Explore 11.

[icn3d-2.0.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.1.zip) was release on April 23, 2018. The bug about extra 3D domains in the "Sequences & Annotations" window was fixed. The stabilizers for 3D printing were improved.

[icn3d-2.0.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-2.0.0.zip) was release on April 17, 2018. By clicking the menu "Windows: View Sequences & Annotations", users can view all kinds of annotations: ClinVar, SNPs, CDD domains, 3D domains, binding sites, interactions, and custom tracks. Users can click the menu "View: Chemical Binding" to show the chemical binding sites. Users can also export files for 3D printing at the menu "File: 3D Printing: VRML (Color, W/ Stabilizers)".

[icn3d-1.4.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.4.1.zip) was release on November 3, 2017. The version of THREE.js in the zip file was fixed.

[icn3d-1.4.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.4.0.zip) was release on November 2, 2017. The rendering speed has been significantly improved by using the Imposter shaders from NGL Viewer. A bug in "Share Link" was fixed.

[icn3d-1.3.10](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.10.zip) was release on October 27, 2017. The "Save File" issue in Chrome 60 and after was fixed.

[icn3d-1.3.9](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.9.zip) was release on September 5, 2017. The handling of residues with insertion codes was fixed in structure alignment.

[icn3d-1.3.8](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.8.zip) was release on August 7, 2017. The handling of residues with insertion codes was fixed.

[icn3d-1.3.7](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.7.zip) was release on April 18, 2017. A bug in the output order of commands was fixed.

[icn3d-1.3.6](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.6.zip) was release on April 10, 2017. A bug introduced in the version of icn3d-1.3.5 was fixed in the function unionHash.

[icn3d-1.3.5](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.5.zip) was release on March 23, 2017. The codes were optimized to show 3D structures as soon as possible. Vast+ structure alignment was optimized as well.

[icn3d-1.3.4](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.4.zip) was release on March 1, 2017. The backend of structure alignment was updated.

[icn3d-1.3.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.3.zip) was release on November 15, 2016. Now users can save the image with "transparent" background using a single url, e.g., [](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&width=300&height=300&command=set%20background%20transparent;%20export%20canvas)https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=1tup&width=300&height=300&command=set%20background%20transparent;%20export%20canvas.

[icn3d-1.3.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.2.zip) was release on October 18, 2016. The atom specification in "Advanced set selection" was modified to use "$" instead of "#" in front of structure IDs. This modification avoids to the problem of showing multiple "#" in the urls of "Share Link".

[icn3d-1.3.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.3.1.zip) was release on October 4, 2016. Partial diplay of helices or beta-sheets are enabled. The side chains, if displayed, are connected to C-alphas.

[icn3d-1.2.3](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.2.3.zip) was release on September 13, 2016. The MMTF format started to support https.

[icn3d-1.2.2](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.2.2.zip) was release on August 18, 2016. Added a switch button to switch between all atoms and selected atoms. When the mode is "selected atoms", the switch and the text "selection" next to it are colored in orange. The menu "Style", "Color", and "Surface" are colored in orange and only apply to selected atoms.

[icn3d-1.2.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.2.1.zip) was release on August 18, 2016. Some bugs were fixed.

[icn3d-1.2.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.2.0.zip) was release on August 17, 2016. The dialog of 2D interactions was added to show the interactions among different chains. Both the nodes (chains) and lines (interactions) can be selected. Secondary structures will be calculated if the input PDB file has no defined secondary structure information. The previous files src/icn3d.js, src/full_ui.js, and src/simple_ui.js were separated into small files.

[icn3d-1.1.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.1.1.zip) was release on July 25, 2016. Some bugs were fixed.

[icn3d-1.1.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.1.0.zip) was release on July 18, 2016. The new binary MMTF file format was supported. A new "Analysis" menu was added with an option to show disulfide bonds. Users can also input data from a url, either through the UI or through a encoded url parameter "?type=pdb&url=...", e.g., [](https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb)https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?type=pdb&url=https%3A%2F%2Ffiles.rcsb.org%2Fview%2F1gpk.pdb.

[icn3d-1.0.1](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.0.1.zip) was release on May 16, 2016.

[icn3d-1.0.0](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-1.0.0.zip) was release on April 28, 2016.

The beta version [icn3d-0.9.6-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.6-dev.zip) was release on April 21, 2016. Enabled to export and import selection file where each custom sets of atoms are defined. Javascript files and CSS files are versioned. Developers can use the default latest version or specify the specific version in their pages.

The beta version [icn3d-0.9.5-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.5-dev.zip) was release on April 4, 2016. Enabled to import Mol2, SDF, XYZ, PDB, and mmCIF files. Added "Schematic" style for chemicals. Improved the coordination between pk on 3D structure and selection on sequences.

The beta version [icn3d-0.9.4-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.4-dev.zip) was release on March 14, 2016. Added "Fog" and "Slab" features.

The beta version [icn3d-0.9.3-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.3-dev.zip) was release on March 9, 2016. Improved the following features: "Back" and "Forward" button, Export State, Open State.

The beta version [icn3d-0.9.2-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.2-dev.zip) was release on March 4, 2016. CSS namespace was added. The file simple_ui.js was reorganized to share some codes with full_ui.js. A "Schematic" style was added to show one letter residue name in the C-alpha (for protein) or O3' (for nucleotide) position.

The beta version [icn3d-0.9.1-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.1-dev.zip) was release on Feb 9, 2016. The surface generation was switched from the iview version (surface.js) to the more efficient 3Dmol version (ProteinSurface4.js and marchingcube.js).

The beta version [icn3d-0.9.0-dev](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d-0.9.0-dev.zip) was release on Jan 17, 2016.

