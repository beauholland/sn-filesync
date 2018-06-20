// ---- Client onclick: onClickSync()




// ---- Condition
var showEditButton = false;
// only show for DEV or PATCH
if (gs.getProperty('instance_name') == 'rttmsdev' || gs.getProperty('instance_name') == 'riotintodev') {
    var className = current.sys_class_name;
    var tablesStr= gs.getProperty('tables.open.in.editor');
    var tables= tablesStr.split(",");
    for (var i = 0; i < tables.length; i++) {
        if (tables[i] == className ) {
            showEditButton = true;
                break;
        }
    }
}
showEditButton;




// ---- Script
function onClickSync() {

	var connection = new WebSocket('ws://localhost:9030');

	enableButton = function () {
		var openInEditor = jQuery("#a40f7fe8db969300ab64d206ca96191c");
		openInEditor.text('Open in Editor');
		openInEditor.removeAttr("disabled");
	};

	disableButton = function () {
		var openInEditor = jQuery("#a40f7fe8db969300ab64d206ca96191c");
		openInEditor.text('Opening...');
		openInEditor.attr("disabled", "disabled");
	};

	disableButton();

	// Once there is a connection we can send info to the server
	connection.onopen = function () {
		console.log("Starting to sync...");
		var toSend = {};
		toSend.env = window.location.hostname;
		toSend.table = g_form.getTableName();
		toSend.sys_id = g_form.getUniqueValue();
		connection.send(JSON.stringify(toSend));
	};

	// Log errors
	connection.onerror = function (error) {
		enableButton();
		console.error('WebSocket Error ' + error);
		alert("Did you forget to run your node server so that you can listen to me...? :D");
	};

	// Log messages from the server
	connection.onmessage = function (e) {
		// hack
		setTimeout(function(){
			enableButton();
		}, 4000);
		console.log(e.data);
		connection.close();
	};

}