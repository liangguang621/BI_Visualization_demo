# BI Visualization Demo #
Edit on: 1/23/2018 1:31:45 PM  

----------

**BI Visualization Demo** is targeting to release a runnable demo, which makes you can directly operate on it to address your business.

> **How To Use** 

This web app demo is a python based web application, powered by [web.py](http://webpy.org/). The technical set front-end used: CSS - [Bootstrap](http://www.runoob.com/bootstrap/bootstrap-tab-plugin.html), Javascript - [jQuery](http://jquery.com/), Visualization libs - [Echarts](http://echarts.baidu.com/). And the back-end database is the python built-in sqlite3.

Enviroment configuration:

- Python==2.7.13
- jQuery==3.2.1
- Bootstrap==3.3.7 
- Echarts==3.6.2

and jQuery, Bootstrap, and Echarts components are already in this repo. The only thing you need to make sure is Python and the library dependency. See the [*requirements.txt*](./requirements.txt), type the codes:

	pip install -r path/to/requirements.txt

After the dependency installed, then you just need to type commands to let the web app started.

	cd path/to/the_repo_folder
	python webService.py xxxx  # if leave xxxx blank, the default port will be 8080
	
if the screen shows [http://0.0.0.0:8080](http://localhost:8080), means you has successfully running the web app.

> **The App's Content**

This demo is a integral project from back-end to front-end. There is a sample database you should put in your repo's root - [test.db](https://pan.baidu.com/s/1dkqUJ0), the access password is: **w75r**.

