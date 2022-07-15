#!/usr/bin/env python3
# created by Tiejun Cheng at NCBI (chengt2@ncbi.nlm.nih.gov)

# please set up selenium, chrome, chromedriver

# please set the following directories in the code:
# /path/to/download at line 22
# /path/to/chrome at line 38
# /path/to/chromedriver at line 41
# Please set the pdbid name at line 42
# Please set the exported file name at line 43. The file name had better match the file name from interactive usage of iCn3D.

from selenium import webdriver
from pathlib import Path

import time

# chrome
options = webdriver.ChromeOptions()

# dir to save PNG
downdir = "/home/wangjiy/tmp"

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
options.binary_location = "/usr/local/chrome/89.0.4389.90/bin/chrome" # chrome binary location (required if chrome is not in the default path)

# start a broser
browser = webdriver.Chrome(executable_path='/usr/local/chromedriver/89.0.4389.23/bin/chromedriver', options=options)
#pdbid = "1KQ2" # use upper case if it's a PDB ID
pdbid = "3GVU" # Structure ID
ssfile = Path(f"{downdir}/{Path(pdbid).stem}_icn3d_panel.txt")

try:
    # send web request to icn3d
    #url = f"https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid={pdbid}&command=export secondary structure"
    url = f"https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid={pdbid}&command=view annotations; set annotation cdd; set view detailed view; select .STI:2210 | name STI; line graph interaction pairs | STI 3GVU | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5; save html div0_dl_linegraph"
    browser.get(url)

    ok = False
    attempt = 1
    while attempt <= 10: # make several attempts for large structure
        time.sleep(2)  # wait until the page is fully rendered

        # ok, PNG was downloaded
        if ssfile.exists():
            ok = True
            break

        # retry
        print(f"retry {pdbid} with attempt # {attempt}")
        attempt += 1

    browser.close()
    print(f"{pdbid} OK={ok}")
except Exception as e:
    print(f"failed to process: {url}")
    print(e)
    
