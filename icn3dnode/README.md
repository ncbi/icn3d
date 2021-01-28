icn3dnode
=========

iCn3D JavaScript code can be converted into Node.js to run as commands. Here shows the example for the mutation of a residue in a structure using the licensed (from Columbia University) program scap, which is free to academic use. You can run the file "interaction.js" to get the change of all kinds of interactions (such as hydrogen bonds, salt bridges/ionic interactions, contacts/interactions, halogen bonds, pi-cation interactions, and pi stacking) due to the mutation.

Installation
------------

Install the packages axios, querystring, and three:

    npm install axios
    npm install querystring
    npm install three

Example Command
---------------

In your command line, run the following:

    node interaction.js 6M0J E 501 Y

where "6M0J" is the PDB ID, "E" is the chain ID, "501" is the residue number that corresponding to the residue N501, "Y" is the mutant residue name. If it's a deletion, the mutant will be "-".


Example Output
--------------

    free energy (kcal/mol): 429.634
    Change Hbond: -1
    Change Ionic: 0
    Change Contact: 9
    Change Halegen: 0
    Change Pi-Cation: 1
    Change Pi-Stacking: 1

where "Change Hbond: -1" means the mutant has one less hydrogen bond than the wild type.
