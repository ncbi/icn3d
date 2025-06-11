#!/usr/bin/env python

# by Raphael Trevizani

# Configurations such as PDB ID are in the file "config.py"
import config

# Chrome/non-headless
if config.headless == False:
	from selenium import webdriver
	from selenium.webdriver.chrome.options import Options
	from selenium.webdriver.common.action_chains import ActionChains

# Firefox/headless
elif config.headless == True:
	from selenium import webdriver
	from selenium.webdriver.firefox.options import Options
	from webdriver_manager.firefox import GeckoDriverManager
	from selenium.webdriver.common.action_chains import ActionChains

# ------------------------------------------------------------------
def configure( ):

	# Chrome/non-headless
	if config.headless == False:
		chrome_options = Options()
		path = {"download.default_directory": config.download_dir}
		chrome_options.add_experimental_option("prefs", path)
		driver = webdriver.Chrome(chrome_options=chrome_options)

	# Firefox/headless
	elif config.headless == True:

		options = set_firefox_options( config.download_dir )
		driver  = webdriver.Firefox( options = options )
	
	return driver 

# ------------------------------------------------------------------
def wait_for_download(driver):

	if not driver.current_url.startswith("chrome://downloads"):
		driver.get("chrome://downloads/")

	return driver.execute_script("""
		return document.querySelector('downloads-manager')
		.shadowRoot.querySelector('#downloadsList')
		.items.filter(e => e.state === 'COMPLETE')
		.map(e => e.filePath || e.file_path || e.fileUrl || e.file_url);
		""")

# ------------------------------------------------------------------
def del_ncbi_survey_box( driver ):

	''' Removes NCBI survey box that occasionally 
		pops up when icn3d webiste is accessed '''

	driver.implicitly_wait(10)
	
	try:
		survey_box = driver.find_element('xpath', '//*[@class="QSIWebResponsiveDialog-Layout1-SI_0HhBb7Qmlxy2ZIF_content QSIWebResponsiveDialog-Layout1-SI_0HhBb7Qmlxy2ZIF_content-medium QSIWebResponsiveDialog-Layout1-SI_0HhBb7Qmlxy2ZIF_border-radius-slightly-rounded QSIWebResponsiveDialog-Layout1-SI_0HhBb7Qmlxy2ZIF_drop-shadow-medium"]')
		driver.execute_script("arguments[0].remove();", survey_box)

		survey_frame = driver.find_element('xpath', '//*[@class="QSIWebResponsive-creative-container-fade"]')
		driver.execute_script("arguments[0].remove();", survey_frame)

		survey_shadow = driver.find_element('xpath', '//*[@class="QSIWebResponsiveShadowBox"]')
		driver.execute_script("arguments[0].remove();", survey_shadow)
	
	except:
		pass

	return

# ------------------------------------------------------------------
def click_analysis_menu( driver ):

	e = driver.find_element('xpath','//*[@id="div0_analysis"]')
	e.click()
	
	return

# ------------------------------------------------------------------
def click_interact_menu( driver ):

	f = driver.find_element('xpath','//*[@id="div0_mn6_hbondsYes"]')
	f.click()

	return

# ------------------------------------------------------------------
def mv_cursor_combo_box( driver ):

	''' If the cursor remains on top of the analysis menu, 
		selenium doesn't find the other elements. We must move
		the cursor away so the combobox closes 
	'''	
	t = driver.find_element('xpath','//*[@id="div0_dl_hbonds"]')
	action = ActionChains(driver)
	action.move_to_element(t).click().perform()

	return

# ---------------------------------
def selection_item_setA( driver, item ):

	item = '\"' + item + '\"'
	item = '//*[@id="div0_dl_hbonds"]/table[1]/tbody/tr/td[1]/div/div/select/option[contains(text(),' + item + ')]'
	selectionA = driver.find_element( 'xpath', item )
	selectionA.click()
	
	return

# ---------------------------------
def selection_item_setB( driver, item ):

	item = '\"' + item + '\"'
	selectionB = driver.find_element('xpath','//*[@id="div0_dl_hbonds"]/table[1]/tbody/tr/td[2]/div/div/select/option[contains(text(),' + item + ')]')
	selectionB.click()
	
	return

# ------------------------------------------------------------------
def interaction_network( driver ):

	''' Clicks on the 2D interaction network option'''

	interaction_net_button = driver.find_element('xpath','//*[@id="div0_hbondLineGraph"]')
	interaction_net_button.click()
	
	return 

# ------------------------------------------------------------------
def click_download_file( driver, format, headless=True  ):

	format = 'div0_linegraph_' + format.lower()
	json_button = driver.find_element('xpath','//*[@id="' + format + '"]')
	json_button.click()

	if not headless:
		wait_for_download( driver )

	return

# ------------------------------------------------------------------
def load_molecule_icn3d( driver, ptn ):

	driver.get('https://www.ncbi.nlm.nih.gov/Structure/icn3d/?pdbid=' + ptn.lower() )
	
	return

# ------------------------------------------------------------------
def set_firefox_options( download_folder ):

	options = Options()
	options.add_argument( '--headless' )
	options.set_preference("browser.download.folderList", 2)
	options.set_preference("browser.download.manager.showWhenStarting", False)
	options.set_preference("browser.download.dir", download_folder )
	options.set_preference("browser.helperApps.neverAsk.saveToDisk", "application/x-gzip")
	
	return options
	 
# ------------------------------------------------------------------
def main():
	
	driver = configure( )

	load_molecule_icn3d( driver, config.pdb )
	del_ncbi_survey_box( driver )
	click_analysis_menu( driver )
	click_interact_menu( driver )
	mv_cursor_combo_box( driver )
	selection_item_setA( driver, config.select_first_set  )
	selection_item_setB( driver, config.select_second_set )
	interaction_network( driver )
	click_download_file( driver, config.file_format, config.headless )

	return 

# ------------------------------------------------------------------
if __name__ == '__main__':
	main()
