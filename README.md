ServiceNow File Sync -- PipeFish edition
=================

## Intro

Do you hate switching contexts from your browser to your favourite text editor when developing across records within ServiceNow?

Wouldn't it be nice if you had an **Open in Editor** button that automatically downloaded code (html, javascript, jelly, css etc) and synchronized changes back up to ServiceNow?

![Alt text](https://github.com/beauholland/sn-filesync/blob/PipeFish-custom/Open%20In%20Editor.png "Open in Editor")

The **Open in Editor** UI Action has been configured to show on specific records. See **openInEditor.UI.Action.js**

The **Open in Editor** UI Action uses WebSockets to send data about the specific record / table to a listening server **server.js** 

The server component needs to be running first: Run `node server.js` to start.


NOTE: This is a **maintained** fork from [https://github.com/dynamicdan/sn-filesync](https://github.com/dynamicdan/sn-filesync) used specifically by [PipeFish](http://www.pipefish.com.au). Please review the original [readme](https://github.com/dynamicdan/sn-filesync) for more details on how to use the sync tool.




## PipeFish Intall and Setup

* Download and install [NodeJS](https://nodejs.org/en/) current
* Clone or download [PipeFish sn-filesync repo](https://github.com/beauholland/sn-filesync/tree/PipeFish-custom)
* Copy the proxy settings .npmrc file in the root to "c:\\users\\[your username]" i.e. beau.holland
* From within the sn-filesync folder run:

`npm install`

* This will populate the `node_modules` directory with dependancies. Since we are behind a proxy the .npmrc files we copied above should work. If you get authentication errors, close the command / terminal and re-open.
* Open your preferred editor (Visual Studio Code, Sublime...) and open the sn-filesync folder.
* Update the files **rttmsdev.config.json** and **riotintodev.config.json** with your username and password for each instance. 
NOTE: use "corp\\\\first.last" and include the double backslash.

```javascript
"roots": {
    "src/rttmsdev": {
        "host": "rttmsdev.service-now.com",
        "user": "corp\\firstname.lastname",
        "pass": ""
    }
},
```

* Modify **editorConfig.json** with your preferred editor option

```javascript
{
	"preferredEditor" : "code" // or "sublime" etc
}
```

* Run `node server.js` to start
* Navigate to a record, click the UI ACTION "Open in Editor"
