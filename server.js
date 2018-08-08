/* Setup the websocket*/
var Server = require('ws').Server;
var port = process.env.PORT || 9030;
var ws = new Server({port: port});

// module to use to we can spawn child processes
const {spawn} = require('child_process');

// store the list of instances we're watching
var envs = [];

// Read stdin
var readline = require('readline');
var read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var availableInstances = ['rttmsdev','riotintodev'];

if (process.argv.length > 2) {
    //
    // Have args been passed with the cli?
    //
    var argsWatch = process.argv[2];
    if(argsWatch.match(/^y(es)?$/i)) {
        var argsInstance = process.argv[3];
        var selection = parseInt(argsInstance) - 1;
        if (availableInstances.indexOf(argsInstance) !== -1) {
            // Allows sending in of instance name itself e.g. `rttmsdev`
            envs.push(argsInstance);
            startWatchingForChanges(argsInstance);
            main();
        } else {
            // fall back to checking if the supplied instance is an index of the `availableInstances` array
            if(selection >=0 && selection <= availableInstances.length) {
                envs.push(availableInstances[selection]);
                startWatchingForChanges(availableInstances[selection]);
                main();
            } else {
              console.error('Could not find the instance name or index (' + argsInstance + ') in:\n(' + availableInstances.toString() + ').\nSpecify either the instance name or its index from this array.');
            }
        }
    }

} else {

    /*
     * No args passed - ask for selecion via cli.
     *
     * What if user wants to start where he/she left off?
     * So ask the user if they want to start a watch for some instance.
     */
    read.question('Start watching an instance?(y/n)', (answer) => {
        if(answer.match(/^y(es)?$/i)) {
            console.log("\nChoose an instance to start watching\n");
            for(var i = 0; i < availableInstances.length; i++) {
                console.log("" + (i+1) + ". " + availableInstances[i]);
            }
            read.question('\nEnter number to select: ', (instance) => {
                var selection = parseInt(instance) - 1;
                if(selection >=0 && selection <= availableInstances.length) {
                    envs.push(availableInstances[selection]);
                    startWatchingForChanges(availableInstances[selection]);
                }
                read.close();
                main();
            });
        } else {
            read.close();
            main();
        }
    });

}




/*
 * Main, this is where you start listening for a "Open in Editor" Button press
 */
function main() {
    console.log("\n==========Server Started!==========\n");
    /* Listen for someone who wants to sync */
    ws.on('connection', function(w){

        /* Once the syn button has been clicked */
        w.on('message', function(msg){
            // this is the received object which has all the required info
            var received = JSON.parse(msg);

            // TESTING (print what was received)
            console.log("Env \t ==> " + received.env);
            console.log("Table \t ==> " + received.table);
            console.log("sys_id \t ==> " + received.sys_id);


            var env = received.env.split('.')[0];
            downloadFile(env, received.table, received.sys_id);
            if(!envs.includes(env)) {
                envs.push(env); // If you're already watching this instance, only start 1 watcher
                startWatchingForChanges(env);
            }

            // Let the ServiceNow instance know that we've received the data
            // So close the connection
            w.send("Server has received the following: " + msg);

        });

        w.on('close', function() {0
            console.log('\nclosing connection\n');
        });

    });

}

/*
 * Download the file, i.e use the given sys_id and table name
 * to find the js code and download it locally
 * Once downloaded will attempt to open the file in preferred editor
 */
function downloadFile(env, table, sys_id) {
    var config = env+".config.json";
    var options = '--config ' + config + ' --pull "' + sys_id +'" --table ' + table;

    // Process which is responsible for downloading the file
    var ls = spawn('cmd', ['/c', 'node bin/app.js ' + options]);

    // file to open
    var file = "";

    // Redirect the stdout to parent processes stdout.
    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        var string = `${data}`;

        // Get the full path of the file, where the syntool saved the downloaded file to
        if(string.includes("Saved file")) {
            file = "./" + string.split('Saved file')[1].replace(" ", "");
            file = file.replace("\n", "");
            file = '"' + file + '"';
            console.log("FILE: " + file);
        }
    });

    // redirect stderr from child process
    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    // Once the child process exist (i.e once download is finished)
    // open the downloaded file in the sublime by calling another program :P
    ls.on('close', (code) => {
        console.log(`Downloading process exited with code ${code}`);
        var pref = require('./editorConfig.json');

        // If preferred editor is vsCode then no need to call the module
        // as it can be called from command prompt
        if(pref.preferredEditor == "code") {
            var editor = spawn('cmd', ['/s', '/c', 'code ./src/'+ env + " " + file], {windowsVerbatimArguments: true});
        } else {
            // preferred is sublime or something else, so use open-in-editor module
            var editor = spawn('cmd', ['/s', '/c', 'node openInEditor.js ' + file], {windowsVerbatimArguments: true});
        }

        editor.stdout.on('data', (data) => {
            console.log("EDITOR: " + data);
        });

        editor.on('close', (d) => {
            console.log("OPENING EDITOR PROCESS EXITED");
        });

        //process.exit(0); // dont exit the parent process lol
    });

    ls.on('error', (error) => {
        console.log(`child process errored :( ${error}`);
        process.exit(1);
    });
}


/*
 * Start a watch-<instance> process to watch for changes
 */
function startWatchingForChanges(env) {
    // spawn another child to run npm run watch-<instance>
    process.env.FORCE_COLOR = true;

    //"inherit" so that we can keep the colours
    var watch = spawn('cmd', ['/c', 'npm run watch-' + env], {stdio: "inherit"});
    var styleswatch = spawn('cmd', ['/c', 'npm run watch-' + env + '-css'], {stdio: "inherit"});

    // watch.stdout.on('data', (data) => {
    //     process.stdout.write(data);
    // });

    watch.on('close', (code) => {
        console.log("WATCHING PROCESS EXITED");
        process.exit(0);
    });
    styleswatch.on('close', (code) => {
        console.log("STYLES (SCSS) WATCHING PROCESS EXITED");
        process.exit(0);
    });
}
