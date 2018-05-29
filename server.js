/* Setup the websocket*/
var Server = require('ws').Server;
var port = process.env.PORT || 9030;
var ws = new Server({port: port});
/* module to use to we can spawn child processes */
const {spawn} = require('child_process');
var watching = false;
var envs = [];


console.log("\n==========Server started!==========\n");

/* Listen for someone who wants to sync */
ws.on('connection', function(w){
  
  /* Once the syn button has been clicked */
  w.on('message', function(msg){
  	// this is the received object which has all the required info
    var received = JSON.parse(msg);
    
    // TESTING
    console.log("Env \t ==> " + received.env);
    console.log("Table \t ==> " + received.table);
    console.log("sys_id \t ==> " + received.sys_id);

    
    // Let the ServiceNow instance know that we've received the data
    // So close the connection
    w.send("Server has received the following: " + msg);
    var env = received.env.split('.')[0];
    downloadFile(env, received.table, received.sys_id);
    if(!watching || envs.includes(env)) {
        envs.push(env);
        watching = true;
        startWatchingForChanges(env);
    }
  });
  
  w.on('close', function() {
    console.log('\nclosing connection\n');
  });

});

function startWatchingForChanges(env) {
    // spawn another child to run npm run watch-<env>
    var watch = spawn('cmd', ['/c', 'npm run watch-' + env + ' --color']);

    watch.stdout.on('data', (data) => {
        console.log(`STDOUT: ${data}`);
    });

    watch.on('close', (code) => {
        console.log("WATCHING EXITED");
        process.exit(0);
    });
}

/*
 * Function to call which will do the syncing
 *
 * This is where you can call
 * npm run search-<instance>
 * npm run watch-<instance>
 * npm run resync-<instance>
 * etc
 */
function downloadFile(env, table, sys_id) {
    var config = env+".config.json";
    var options = '--config ' + config + ' --pull "' + sys_id +'" --table ' + table;
    
    var ls = spawn('cmd', ['/c', 'node bin/app.js ' + options]);

    var file = "";

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        var string = `${data}`;

        // Get the full path of the file, where the syntool saved the downloaded file to
        if(string.includes("Saved file")) {
            file = "./" + string.split('Saved file')[1].replace(" ", "");
            console.log("FILE: " + file);
        }
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    // Once the child process exist
    // open the downloaded file in the sublime by calling another program :P
    ls.on('close', (code) => {

        console.log(`child process exited with code ${code}`);
        var pref = require('./editorConfig.json');

        // If preferred editor is vsCode then no need to call the module
        // as it can be called from command prompt
        if(pref.preferredEditor != "sublime") {
            var vsCode = spawn('cmd', ['/c', 'code ./src/' + env + ' ' + file]);
        } else {
            // preferred is sublime so gotta use open-in-editor package
            var editor = spawn('cmd', ['/c', 'node openInEditor.js ' + file]);
        }

        //process.exit(0); // dont close the parent process lol 
    });

    ls.on('error', (error) => {
        console.log(`child process errored :( ${error}`);
        process.exit(1); 
    });
}