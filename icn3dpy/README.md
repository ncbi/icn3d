icn3dpy
=======

icn3dpy is a simple [IPython/Jupyter](http://jupyter.org/) widget to
embed an interactive [iCn3D](https://github.com/ncbi/icn3d) viewer in a notebook. Its source code is at [PyPI](https://pypi.org/project/icn3dpy/), and is also included at [iCn3D GitHub](https://github.com/ncbi/icn3d).

The 3D view of icn3dpy in Jupyter Notebook is interactive, just like in any browser. The popup windows will appear under the 3D view. If you have a predefined cutom view, you can use the predefined commands in icn3dpy as shown below.

If you experience problems, please file an [issue](https://github.com/ncbi/icn3d/issues).


Installation
------------

Install icn3dpy:

    pip install icn3dpy

Install the extension:

    jupyter labextension install jupyterlab_3dmol



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
"pdbid" as input:

    view = icn3dpy.view(q='pdbid=2bbv')

    view


"mmtfid" as input:

    view = icn3dpy.view(q='mmtfid=6vxx')

    view


"cid" as input:

    view = icn3dpy.view(q='cid=2244')

    view


Use predefined commands (see commands in [iCn3D Gallery](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#gallery) for reference):

    view = icn3dpy.view(q='mmdbid=6m0j',command='scatterplot interaction pairs | !A !E | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 6; show selection; add residue number labels')

    view


Command
-------

You can use iCn3D interactive interface to generate a custom view, then click "File > Share Link" to get the commands in the "Original URL". All iCn3D commands are listed [here](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands).


License
-------

United States Government Work


