// This is only for sublime
var openInEditor = require('open-in-editor');
var config = require('./editorConfig.json');
var file = process.argv[2];
console.log(file);
var editor = openInEditor.configure({
	editor: config.preferredEditor
}, function(err) {
	console.error('Something went when applying configurations:\n' + err);
});
editor.open(file).
	then(function() {
		console.log('Success!');
	}, function(err) {
		console.error('Something went wrong when opening the editor:\n' + err);
	});