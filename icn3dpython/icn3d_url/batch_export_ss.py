#!/usr/bin/env python3
# created by Tiejun Cheng at NCBI (chengt2@ncbi.nlm.nih.gov)

# please set up selenium, chrome, chromedriver

# please set the following directories in the code:
# /path/to/download at line 24
# /path/to/chrome at line 40
# Please set the pdbid name at line 49
# Please set the exported file name at line 50. The file name had better match the file name from interactive usage of iCn3D.

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService 
from webdriver_manager.chrome import ChromeDriverManager

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
options.binary_location = "/usr/local/chrome/114.0.5735.106/bin/chrome" # chrome binary location (required if chrome is not in the default path)

# start a broser
#browser = webdriver.Chrome(executable_path='/usr/local/chromedriver/114.0.5735.90/bin/chromedriver', options=options)
#service = ChromeService(executable_path='/usr/local/chromedriver/114.0.5735.90/bin/chromedriver')
service = ChromeService(ChromeDriverManager().install())
browser = webdriver.Chrome(service=service, options=options)

#pdbid = "1KQ2" # use upper case if it's a PDB ID
pdbid = "A0A061AD48" # AlphaFold UniProt ID
ssfile = Path(f"{downdir}/{Path(pdbid).stem}_icn3d_ss.txt")

try:
    # send web request to icn3d
    #url = f"https://www.ncbi.nlm.nih.gov/Structure/icn3d/?mmdbid={pdbid}&command=export secondary structure"
    url = f"https://www.ncbi.nlm.nih.gov/Structure/icn3d/?afid={pdbid}&command=export secondary structure"
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
    
