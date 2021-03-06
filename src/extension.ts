
import {window, workspace, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, Range, Position, DecorationRenderOptions, DecorationOptions, MarkedString, ViewColumn} from 'vscode'; 

import ctrl = require('./controller');
import settings = require('./settings');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	//console.log('"vscode-todo-highlighter" is now active!');
    //window.showInformationMessage('running!');

	let controller = new ctrl.Controller();
    let starter = new AutoStarter(controller); // Create & start the status bar counter
    
    var startCommand = commands.registerCommand('extension.start', () => {
        controller.run();
    });

    var startCurrentCommand = commands.registerCommand('extension.startCurrent', () => {
        controller.runOne();
    });
    
    // Add to list of disposed items when deactivated
	//context.subscriptions.push(controller);
    context.subscriptions.push(startCommand);
    context.subscriptions.push(startCurrentCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class DcOps implements DecorationRenderOptions {
    color: string;
    
    constructor(color: string) {
        this.color = color;
    }
}

class AutoStarter {
    private _controller: ctrl.Controller;
    private _disposable: Disposable;

    constructor(controller: ctrl.Controller) {
        this._controller = controller;
        //this._controller.runOne();

        // subscribe to events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this.handler, this, subscriptions);
        window.onDidChangeActiveTextEditor(this.handler, this, subscriptions);
        workspace.onDidChangeConfiguration(this.configChangeHandler, this, subscriptions);

        // update the counter for the current file
        this._controller.runOne(true);

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private handler() {
        this._controller.runOne(true);
    }

    private configChangeHandler() {
        console.log("Configuration change detected. Reload extension settings.")
        settings.Settings.isLoaded = false; // trigger reload
    }
}