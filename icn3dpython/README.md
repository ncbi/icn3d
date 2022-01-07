Python Scripts based on iCn3D
=============================

Either Python scripts in the directory "icn3dpython" or Node.js scripts in the directory "icn3dnode" can be used to analyze structures in command line.

To use Python scripts, you can open iCn3D in a browser to generate a URL (or shortened URL), then follow the example scripts below to replace the original URL with your URL. Next, you can run the script with "python3 [your script].py" to get the same exported files as you do in a web browser.

Installation
------------

Install the following libraries in your computer:

    selenium
    chrome
    chromedriver

Examples
--------

* <b>Export secondary structures in JSON format</b>

    The script "batch_export_ss.py" has some comments about how to modify the script. After you modify the script, you can run the following in the command line to export the secondary structure information for any structure.

        python3 batch_export_ss.py

* <b>Export PNG images with transparent background</b>

    After you specify the directories and PDB file name as described in the script "batch_export_png.py", you can run the following in the command line to export the PNG image for any structure.

        python3 batch_export_png.py
        