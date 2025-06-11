icn3dpy
=======

icn3dpy is a simple [IPython/Jupyter](http://jupyter.org/) widget to
embed an interactive [iCn3D](https://github.com/ncbi/icn3d) viewer in a notebook. Its source code is at [PyPI](https://pypi.org/project/icn3dpy/), and is also included at [iCn3D GitHub](https://github.com/ncbi/icn3d/tree/master/jupyternotebook).

The 3D view of icn3dpy in Jupyter Notebook is interactive, just like in any browser. The popup windows will appear under the 3D view. If you have a predefined cutom view, you can use the predefined commands in icn3dpy as shown below.

If you experience problems, please file an [issue](https://github.com/ncbi/icn3d/issues).


Installation
------------

Install icn3dpy:

    pip install icn3dpy

Install node if node is unavailable. One way in Mac is to use "brew":

    brew update

    brew install node 

Install Jupyter Lab and the extension "jupyterlab_3dmol":

    pip install jupyterlab

    jupyter labextension install jupyterlab_3dmol
    or jupyterhub labextension install jupyterlab_3dmol



Usage
-----

Open a notebook:

    jupyter notebook

and issue Python script as follows:

    import icn3dpy

"mmdbid" as input:

    view = icn3dpy.view(q='mmdbid=6hjr')
    view

You can also try other input besides "mmdbid".
"cid" as input:

    view = icn3dpy.view(q='cid=2244')
    view

"url" as input for local PDB files, e.g., "./1TOP.pdb":

    view = icn3dpy.view(q='url=pdb|./1TOP.pdb')
    view

"url" as input for remote PDB files:

    view = icn3dpy.view(q='url=pdb|https://storage.googleapis.com/membranome-assets/pdb_files/proteins/FCG2A_HUMAN.pdb')
    view

"url" as input for iCn3D PNG Image files:

    view = icn3dpy.view(q='url=icn3dpng|https://api.figshare.com/v2/file/download/39125801')
    view

Use predefined commands (The Jupyter Notebook commands can be copied from the "Copy Commands" button in the "File > Share Link" menu of interactive iCn3D viewers in Jupyter Notebook or in a [web browser](https://www.ncbi.nlm.nih.gov/Structure/icn3d/?mmdbid=6m0j)):

    view = icn3dpy.view(q='mmdbid=6m0j',command='scatterplot interaction pairs | !A !E | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 6; show selection; add residue number labels')
    view

Embed a static image instead of an interactive 3D view to improve the performace of a page with multiple structures. The image is clickable to launch an interactive 3D view. The parameters are separated with the symbol "&" (e.g., "imageonly=1&showanno=1"). All parameters are described in the ["URL parameters" section](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#parameters):

    view = icn3dpy.view(q='mmdbid=6hjr', para='imageonly=1')
    view

Command
-------

You can use iCn3D interactive interface to generate a custom view, then click "File > Share Link" to get the commands in the "Original URL". All iCn3D commands are listed [here](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands).


License
-------

United States Government Work


