ServiceNow File Sync -- PipeFish edition
=================

## Intro

Why manually copy and paste code from you local editor of choice into the correct browser tab, record, field, ServiceNow instance... There is a better way.

This FileSync watcher synchronises ServiceNow instance field values to local files and syncs file changes back to the applicable record. This enables ServiceNow developers to use their favourite integrated development environments (IDEs) and text editors like Visual Studio Code, WebStorm, Sublime and Brackets for editing JavaScript, HTML, Jelly and other code - without wasting time and interrupting development workflow copying and pasting code into a browser.

This is a **maintained** fork from [https://github.com/dynamicdan/sn-filesync](https://github.com/dynamicdan/sn-filesync) used specifically by [PipeFish](http://www.pipefish.com.au). Please review the original [readme](https://github.com/dynamicdan/sn-filesync) for more details on how to use the sync tool.

## PipeFish Intall and Setup

* Download and install [NodeJS](https://nodejs.org/en/) current
* Clone or download [PipeFish sn-filesync repo](https://github.com/beauholland/sn-filesync/tree/PipeFish-custom)
* Copy the proxy settings .npmrc file in the root to "c:\\users\\[your username]" i.e. beau.holland
* From within the sn-filesync folder run:

`npm install`

* This will populate the `node_modules` directory with dependancies. Since we are behind a proxy the .npmrc files we copied above should work. If you get authentication errors, close the command / terminal and re-open.
* Update the files **rttmsdev.config.json** and **riotintodev.config.json** with your username and password for each instance. 
NOTE: use "corp\\\\first.last" and include the double backslash.

```javascript
"roots": {
    "src/rttmsdev": {
        "host": "rttmsdev.service-now.com",
        "user": "",
        "pass": ""
    }
},
```

* Run the setup script to create **src** folder containing the different environment source files

`npm run setup`

* Use the following node run scripts within the root directory...

* `npm run portal-rttmsdev` <br>downloads all PORTAL related files for RTTMSDEV into src
* `npm run watch-rttmsdev` <br>watches for changes in src\rttmsdev and uploads
* `npm run search-rttmsdev` <br>prompts for "Table name" and "Entity name" and downloads the script files into the correct mapped folder. <br>EXAMPLE: Table name = **sys_script_include** Entity name = **RioDev** it will find the Script Include RioDevHelper and download the source file into the script_includes folder. The search script uses the starts with query params and check the name or u_name fields for a match. Each match will be downloaded locally.
* `npm run resync-rttmsdev` <br>downloads the latest source files from the instance locally. NOTE: local changes will be overwritten.
* `npm run watch-rttmsdev-css` <br>Watches changes to sass files (scss) and outputs css files. NOTE: this process only works if you have already downloaded the resources in "style_sheets" & "style_sheets_source".
* `npm run watch-rttmsdev-all` <br>Lauches both watches to monitor file changes and style sheet changes. 

NOTE: with the above script you can replace **rttmsdev** with **riotintodev** to work with our PATCH environment.