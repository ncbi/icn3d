#!/usr/bin/env python3
# created by Tiejun Cheng at NCBI (chengt2@ncbi.nlm.nih.gov)

# please set up selenium, chrome, chromedriver

# please set the following directories in the code:
# /path/to/download at line 20
# /path/to/chrome at line 36
# /path/to/chromedriver at line 39
# Please set the pdbfile name at line 40

from selenium import webdriver

import time

# chrome
options = webdriver.ChromeOptions()

# dir to save PNG
downdir = "/path/to/download"

prefs = {
    "download.default_directory": downdir,  # default download location
    "profile.default_content_setting_values.automatic_downloads": 1,  # disable "Download multiple files" prompt
}

# fmt: off
options.add_experimental_option("prefs", prefs)
options.add_experimental_option("excludeSwitches", ["enable-automation"]) # disable the notification 'Chrome is being controlled by automated test software'
options.add_experimental_option('useAutomationExtension', False) # disable the notification 'Chrome is being controlled by automated test software'
options.add_argument("--headless") # or options.headless = True (no visual browser window, default to 800x600)
options.add_argument("--no-sandbox") # bypass OS security model
options.add_argument("--disable-gpu") # applicable to windows os only
options.add_argument("--disable-extensions") # disable extensions
options.add_argument("--window-size=320,320") # start with specific window size (300x300 viewport/image size)
options.binary_location = "/path/to/chrome" # chrome binary location (required if chrome is not in the default path)

# start a broser
browser = webdriver.Chrome(executable_path='/path/to/chromedriver', options=options)
pdbfile = "1GPK.pdb" # use upper case if it's a PDB ID
pngfile = Path(f"{downdir}/{Path(pdbfile).stem}_icn3d_loadable.png")

try:
    # send web request to icn3d
    url = f"https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mobilemenu=1&showcommand=0&type=pdb&url=https://files.rcsb.org/view/{pdbfile}&command=export+canvas+1;+color+spectrum"
    browser.get(url)

    ok = False
    attempt = 1
    while attempt <= 10: # make several attempts for large structure
        time.sleep(2)  # wait until the page is fully rendered

        # ok, PNG was downloaded
        if pngfile.exists():
            ok = True
            break

        # retry
        print(f"retry {pdbfile} with attempt # {attempt}")
        attempt += 1

    browser.close()
    print(f"{pdbfile} OK={ok}")
except Exception as e:
    print(f"failed to process: {url}")
    print(e)