Python Scripts by Following Interactive Steps 
=============================================

Python Scripts can scrape data from iCn3D by mimicing a user to click on different menus. An example script is shown below with the following clicks. Once a structure is loaded, the script first clicks the menu "Analysis > Interaction". It then selects two sets from the popup window, and clicks "2D Interaction Network". In the resulting page, it clicks the button "JSON" to output the JSON file for the interaction. A sharable link for all steps except the last one is [https://structure.ncbi.nlm.nih.gov/icn3d/share.html?yZkg6dofei1AZwVC6](https://structure.ncbi.nlm.nih.gov/icn3d/share.html?yZkg6dofei1AZwVC6). The last button click has no associated commands, and thus can not be reproduced in the sharable link.

Installation
------------

Install the following libraries in your computer:

    selenium
    webdriver-manager

Examples
--------

* <b>Download JSON File for Interactions</b>

    You can make changes (e.g., PDB ID) in the configuration script "config.py", then run "downloadInteraction.py" in the command line to download JSON file for interactions.

        python3 downloadInteraction.py
   