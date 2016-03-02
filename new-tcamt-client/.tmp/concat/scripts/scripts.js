/*
 *
 * Copyright (c) 2011-2014- Justin Dearing (zippy1981@gmail.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) version 2 licenses.
 * This software is not distributed under version 3 or later of the GPL.
 *
 * Version 1.0.2
 *
 */

if (!document) var document = { cookie: '' }; // fix crashes on node

/**
 * Javascript class that mimics how WCF serializes a object of type MongoDB.Bson.ObjectId
 * and converts between that format and the standard 24 character representation.
 */
var ObjectId = (function () {
    var increment = Math.floor(Math.random() * (16777216));
    var pid = Math.floor(Math.random() * (65536));
    var machine = Math.floor(Math.random() * (16777216));

    var setMachineCookie = function() {
        var cookieList = document.cookie.split('; ');
        for (var i in cookieList) {
            var cookie = cookieList[i].split('=');
            var cookieMachineId = parseInt(cookie[1], 10);
            if (cookie[0] == 'mongoMachineId' && cookieMachineId && cookieMachineId >= 0 && cookieMachineId <= 16777215) {
                machine = cookieMachineId;
                break;
            }
        }
        document.cookie = 'mongoMachineId=' + machine + ';expires=Tue, 19 Jan 2038 05:00:00 GMT;path=/';
    };
    if (typeof (localStorage) != 'undefined') {
        try {
            var mongoMachineId = parseInt(localStorage['mongoMachineId']);
            if (mongoMachineId >= 0 && mongoMachineId <= 16777215) {
                machine = Math.floor(localStorage['mongoMachineId']);
            }
            // Just always stick the value in.
            localStorage['mongoMachineId'] = machine;
        } catch (e) {
            setMachineCookie();
        }
    }
    else {
        setMachineCookie();
    }

    function ObjId() {
        if (!(this instanceof ObjectId)) {
            return new ObjectId(arguments[0], arguments[1], arguments[2], arguments[3]).toString();
        }

        if (typeof (arguments[0]) == 'object') {
            this.timestamp = arguments[0].timestamp;
            this.machine = arguments[0].machine;
            this.pid = arguments[0].pid;
            this.increment = arguments[0].increment;
        }
        else if (typeof (arguments[0]) == 'string' && arguments[0].length == 24) {
            this.timestamp = Number('0x' + arguments[0].substr(0, 8)),
                this.machine = Number('0x' + arguments[0].substr(8, 6)),
                this.pid = Number('0x' + arguments[0].substr(14, 4)),
                this.increment = Number('0x' + arguments[0].substr(18, 6))
        }
        else if (arguments.length == 4 && arguments[0] != null) {
            this.timestamp = arguments[0];
            this.machine = arguments[1];
            this.pid = arguments[2];
            this.increment = arguments[3];
        }
        else {
            this.timestamp = Math.floor(new Date().valueOf() / 1000);
            this.machine = machine;
            this.pid = pid;
            this.increment = increment++;
            if (increment > 0xffffff) {
                increment = 0;
            }
        }
    };
    return ObjId;
})();

ObjectId.prototype.getDate = function () {
    return new Date(this.timestamp * 1000);
};

ObjectId.prototype.toArray = function () {
    var strOid = this.toString();
    var array = [];
    var i;
    for(i = 0; i < 12; i++) {
        array[i] = parseInt(strOid.slice(i*2, i*2+2), 16);
    }
    return array;
};

/**
 * Turns a WCF representation of a BSON ObjectId into a 24 character string representation.
 */
ObjectId.prototype.toString = function () {
    if (this.timestamp === undefined
        || this.machine === undefined
        || this.pid === undefined
        || this.increment === undefined) {
        return 'Invalid ObjectId';
    }

    var timestamp = this.timestamp.toString(16);
    var machine = this.machine.toString(16);
    var pid = this.pid.toString(16);
    var increment = this.increment.toString(16);
    return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
        '000000'.substr(0, 6 - machine.length) + machine +
        '0000'.substr(0, 4 - pid.length) + pid +
        '000000'.substr(0, 6 - increment.length) + increment;
};

/**
 * angular-treetable
 * @version v0.3.1 - 2014-12-07
 * @link http://github.com/garrettheel/angular-treetable
 * @author Garrett Heel (garrettheel@gmail.com)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
!function(){"use strict";angular.module("ngTreetable",[]).factory("ngTreetableParams",["$log",function(a){var b=function(b){var c=this;this.getNodes=function(){},this.getTemplate=function(){},this.options={},this.refresh=function(){},angular.isObject(b)&&angular.forEach(b,function(b,d){["getNodes","getTemplate","options"].indexOf(d)>-1?c[d]=b:a.warn('ngTreetableParams - Ignoring unexpected property "'+d+'".')})};return b}]).controller("TreetableController",["$scope","$element","$compile","$templateCache","$q","$http",function(a,b,c,d,e,f){var g=a.ttParams,h=b;a.compileElement=function(b,e,h){var i=(g.getTemplate(b),f.get(g.getTemplate(b),{cache:d}).then(function(a){return a.data}));return i.then(function(d){var f=a.$parent.$new();return angular.extend(f,{node:b,parentNode:h}),f._ttParentId=e,c(d)(f).get(0)})},a.addChildren=function(c,d){var f=c?c.scope().node:null,i=c?c.data("ttId"):null;c&&(c.scope().loading=!0),e.when(g.getNodes(f)).then(function(g){var j=[];angular.forEach(g,function(b){j.push(a.compileElement(b,i,f))}),e.all(j).then(function(e){var f=null!=i?h.treetable("node",i):null;b.treetable("loadBranch",f,e),d&&angular.forEach(e,function(b){a.addChildren($(b),d)}),c&&(c.scope().loading=!1)})})},a.onNodeExpand=function(){this.row.scope().loading||(h.treetable("unloadBranch",this),a.addChildren(this.row,a.shouldExpand()))},a.onNodeCollapse=function(){this.row.scope().loading||h.treetable("unloadBranch",this)},a.refresh=function(){for(var b=h.data("treetable").nodes;b.length>0;)h.treetable("removeNode",b[0].id);a.addChildren(null,a.shouldExpand())},g.refresh=a.refresh,a.getOptions=function(){var b=angular.extend({expandable:!0,onNodeExpand:a.onNodeExpand,onNodeCollapse:a.onNodeCollapse},g.options);return g.options&&angular.forEach(["onNodeCollapse","onNodeExpand"],function(c){g.options[c]&&(b[c]=function(){a[c].apply(this,arguments),g.options[c].apply(this,arguments)})}),b},a.shouldExpand=function(){return"expanded"===a.options.initialState},a.options=a.getOptions(),h.treetable(a.options),a.addChildren(null,a.shouldExpand())}]).directive("ttTable",[function(){return{restrict:"AC",scope:{ttParams:"="},controller:"TreetableController"}}]).directive("ttNode",[function(){var a=0;return{restrict:"AC",scope:{isBranch:"=",parent:"="},link:function(b,c){var d=angular.isDefined(b.isBranch)?b.isBranch:!0,e=angular.isDefined(b.parent)?b.parent:b.$parent._ttParentId;c.attr("data-tt-id",a++),c.attr("data-tt-branch",d),c.attr("data-tt-parent-id",e)}}}])}();
/*
 * jQuery treetable Plugin 3.1.0
 * http://ludo.cubicphuse.nl/jquery-treetable
 *
 * Copyright 2013, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function() {
    var $, Node, Tree, methods;

    $ = jQuery;

    Node = (function() {
        function Node(row, tree, settings) {
            var parentId;

            this.row = row;
            this.tree = tree;
            this.settings = settings;

            // TODO Ensure id/parentId is always a string (not int)
            this.id = this.row.data(this.settings.nodeIdAttr);

            // TODO Move this to a setParentId function?
            parentId = this.row.data(this.settings.parentIdAttr);
            if (parentId != null && parentId !== "") {
                this.parentId = parentId;
            }

            this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
            this.expander = $(this.settings.expanderTemplate);
            this.indenter = $(this.settings.indenterTemplate);
            this.children = [];
            this.initialized = false;
            this.treeCell.prepend(this.indenter);
        }

        Node.prototype.addChild = function(child) {
            return this.children.push(child);
        };

        Node.prototype.ancestors = function() {
            var ancestors, node;
            node = this;
            ancestors = [];
            while (node = node.parentNode()) {
                ancestors.push(node);
            }
            return ancestors;
        };

        Node.prototype.collapse = function() {
            if (this.collapsed()) {
                return this;
            }

            this.row.removeClass("expanded").addClass("collapsed");

            this._hideChildren();
            this.expander.attr("title", this.settings.stringExpand);

            if (this.initialized && this.settings.onNodeCollapse != null) {
                this.settings.onNodeCollapse.apply(this);
            }

            return this;
        };

        Node.prototype.collapsed = function() {
            return this.row.hasClass("collapsed");
        };

        // TODO destroy: remove event handlers, expander, indenter, etc.

        Node.prototype.expand = function() {
            if (this.expanded()) {
                return this;
            }

            this.row.removeClass("collapsed").addClass("expanded");

            if (this.initialized && this.settings.onNodeExpand != null) {
                this.settings.onNodeExpand.apply(this);
            }

            if ($(this.row).is(":visible")) {
                this._showChildren();
            }

            this.expander.attr("title", this.settings.stringCollapse);

            return this;
        };

        Node.prototype.expanded = function() {
            return this.row.hasClass("expanded");
        };

        Node.prototype.hide = function() {
            this._hideChildren();
            this.row.hide();
            return this;
        };

        Node.prototype.isBranchNode = function() {
            if(this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
                return true;
            } else {
                return false;
            }
        };

        Node.prototype.updateBranchLeafClass = function(){
            this.row.removeClass('branch');
            this.row.removeClass('leaf');
            this.row.addClass(this.isBranchNode() ? 'branch' : 'leaf');
        };

        Node.prototype.level = function() {
            return this.ancestors().length;
        };

        Node.prototype.parentNode = function() {
            if (this.parentId != null) {
                return this.tree[this.parentId];
            } else {
                return null;
            }
        };

        Node.prototype.removeChild = function(child) {
            var i = $.inArray(child, this.children);
            return this.children.splice(i, 1)
        };

        Node.prototype.render = function() {
            var handler,
                settings = this.settings,
                target;

            if (settings.expandable === true && this.isBranchNode()) {
                handler = function(e) {
                    $(this).parents("table").treetable("node", $(this).parents("tr").data(settings.nodeIdAttr)).toggle();
                    return e.preventDefault();
                };

                this.indenter.html(this.expander);
                target = settings.clickableNodeNames === true ? this.treeCell : this.expander;

                target.off("click.treetable").on("click.treetable", handler);
                target.off("keydown.treetable").on("keydown.treetable", function(e) {
                    if (e.keyCode == 13) {
                        handler.apply(this, [e]);
                    }
                });
            }

            this.indenter[0].style.paddingLeft = "" + (this.level() * settings.indent) + "px";

            return this;
        };

        Node.prototype.reveal = function() {
            if (this.parentId != null) {
                this.parentNode().reveal();
            }
            return this.expand();
        };

        Node.prototype.setParent = function(node) {
            if (this.parentId != null) {
                this.tree[this.parentId].removeChild(this);
            }
            this.parentId = node.id;
            this.row.data(this.settings.parentIdAttr, node.id);
            return node.addChild(this);
        };

        Node.prototype.show = function() {
            if (!this.initialized) {
                this._initialize();
            }
            this.row.show();
            if (this.expanded()) {
                this._showChildren();
            }
            return this;
        };

        Node.prototype.toggle = function() {
            if (this.expanded()) {
                this.collapse();
            } else {
                this.expand();
            }
            return this;
        };

        Node.prototype._hideChildren = function() {
            var child, _i, _len, _ref, _results;
            _ref = this.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(child.hide());
            }
            return _results;
        };

        Node.prototype._initialize = function() {
            var settings = this.settings;

            this.render();

            if (settings.expandable === true && settings.initialState === "collapsed") {
                this.collapse();
            } else {
                this.expand();
            }

            if (settings.onNodeInitialized != null) {
                settings.onNodeInitialized.apply(this);
            }

            return this.initialized = true;
        };

        Node.prototype._showChildren = function() {
            var child, _i, _len, _ref, _results;
            _ref = this.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                _results.push(child.show());
            }
            return _results;
        };

        return Node;
    })();

    Tree = (function() {
        function Tree(table, settings) {
            this.table = table;
            this.settings = settings;
            this.tree = {};

            // Cache the nodes and roots in simple arrays for quick access/iteration
            this.nodes = [];
            this.roots = [];
        }

        Tree.prototype.collapseAll = function() {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.collapse());
            }
            return _results;
        };

        Tree.prototype.expandAll = function() {
            var node, _i, _len, _ref, _results;
            _ref = this.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                node = _ref[_i];
                _results.push(node.expand());
            }
            return _results;
        };

        Tree.prototype.findLastNode = function (node) {
            if (node.children.length > 0) {
                return this.findLastNode(node.children[node.children.length - 1]);
            } else {
                return node;
            }
        };

        Tree.prototype.loadRows = function(rows) {
            var node, row, i;

            if (rows != null) {
                for (i = 0; i < rows.length; i++) {
                    row = $(rows[i]);

                    if (row.data(this.settings.nodeIdAttr) != null) {
                        node = new Node(row, this.tree, this.settings);
                        this.nodes.push(node);
                        this.tree[node.id] = node;

                        if (node.parentId != null) {
                            this.tree[node.parentId].addChild(node);
                        } else {
                            this.roots.push(node);
                        }
                    }
                }
            }

            for (i = 0; i < this.nodes.length; i++) {
                node = this.nodes[i].updateBranchLeafClass();
            }

            return this;
        };

        Tree.prototype.move = function(node, destination) {
            // Conditions:
            // 1: +node+ should not be inserted as a child of +node+ itself.
            // 2: +destination+ should not be the same as +node+'s current parent (this
            //    prevents +node+ from being moved to the same location where it already
            //    is).
            // 3: +node+ should not be inserted in a location in a branch if this would
            //    result in +node+ being an ancestor of itself.
            var nodeParent = node.parentNode();
            if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
                node.setParent(destination);
                this._moveRows(node, destination);

                // Re-render parentNode if this is its first child node, and therefore
                // doesn't have the expander yet.
                if (node.parentNode().children.length === 1) {
                    node.parentNode().render();
                }
            }

            if(nodeParent){
                nodeParent.updateBranchLeafClass();
            }
            if(node.parentNode()){
                node.parentNode().updateBranchLeafClass();
            }
            node.updateBranchLeafClass();
            return this;
        };

        Tree.prototype.removeNode = function(node) {
            // Recursively remove all descendants of +node+
            this.unloadBranch(node);

            // Remove node from DOM (<tr>)
            node.row.remove();

            // Clean up Tree object (so Node objects are GC-ed)
            delete this.tree[node.id];
            this.nodes.splice($.inArray(node, this.nodes), 1);
        }

        Tree.prototype.render = function() {
            var root, _i, _len, _ref;
            _ref = this.roots;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                root = _ref[_i];

                // Naming is confusing (show/render). I do not call render on node from
                // here.
                root.show();
            }
            return this;
        };

        Tree.prototype.sortBranch = function(node, sortFun) {
            // First sort internal array of children
            node.children.sort(sortFun);

            // Next render rows in correct order on page
            this._sortChildRows(node);

            return this;
        };

        Tree.prototype.unloadBranch = function(node) {
            var children, i;

            for (i = 0; i < node.children.length; i++) {
                this.removeNode(node.children[i]);
            }

            // Reset node's collection of children
            node.children = [];

            node.updateBranchLeafClass();

            return this;
        };

        Tree.prototype._moveRows = function(node, destination) {
            var children = node.children, i;

            node.row.insertAfter(destination.row);
            node.render();

            // Loop backwards through children to have them end up on UI in correct
            // order (see #112)
            for (i = children.length - 1; i >= 0; i--) {
                this._moveRows(children[i], node);
            }
        };

        // Special _moveRows case, move children to itself to force sorting
        Tree.prototype._sortChildRows = function(parentNode) {
            return this._moveRows(parentNode, parentNode);
        };

        return Tree;
    })();

    // jQuery Plugin
    methods = {
        init: function(options, force) {
            var settings;

            settings = $.extend({
                branchAttr: "ttBranch",
                clickableNodeNames: false,
                column: 0,
                columnElType: "td", // i.e. 'td', 'th' or 'td,th'
                expandable: false,
                expanderTemplate: "<a href='#'>&nbsp;</a>",
                indent: 19,
                indenterTemplate: "<span class='indenter'></span>",
                initialState: "collapsed",
                nodeIdAttr: "ttId", // maps to data-tt-id
                parentIdAttr: "ttParentId", // maps to data-tt-parent-id
                stringExpand: "Expand",
                stringCollapse: "Collapse",

                // Events
                onInitialized: null,
                onNodeCollapse: null,
                onNodeExpand: null,
                onNodeInitialized: null
            }, options);

            return this.each(function() {
                var el = $(this), tree;

                if (force || el.data("treetable") === undefined) {
                    tree = new Tree(this, settings);
                    tree.loadRows(this.rows).render();

                    el.addClass("treetable").data("treetable", tree);

                    if (settings.onInitialized != null) {
                        settings.onInitialized.apply(tree);
                    }
                }

                return el;
            });
        },

        destroy: function() {
            return this.each(function() {
                return $(this).removeData("treetable").removeClass("treetable");
            });
        },

        collapseAll: function() {
            this.data("treetable").collapseAll();
            return this;
        },

        collapseNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                node.collapse();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        expandAll: function() {
            this.data("treetable").expandAll();
            return this;
        },

        expandNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                if (!node.initialized) {
                    node._initialize();
                }

                node.expand();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        loadBranch: function(node, rows) {
            var settings = this.data("treetable").settings,
                tree = this.data("treetable").tree;

            // TODO Switch to $.parseHTML
            rows = $(rows);

            if (node == null) { // Inserting new root nodes
                this.append(rows);
            } else {
                var lastNode = this.data("treetable").findLastNode(node);
                rows.insertAfter(lastNode.row);
            }

            this.data("treetable").loadRows(rows);

            // Make sure nodes are properly initialized
            rows.filter("tr").each(function() {
                tree[$(this).data(settings.nodeIdAttr)].show();
            });

            if (node != null) {
                // Re-render parent to ensure expander icon is shown (#79)
                node.render().expand();
            }

            return this;
        },

        move: function(nodeId, destinationId) {
            var destination, node;

            node = this.data("treetable").tree[nodeId];
            destination = this.data("treetable").tree[destinationId];
            this.data("treetable").move(node, destination);

            return this;
        },

        node: function(id) {
            return this.data("treetable").tree[id];
        },

        removeNode: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                this.data("treetable").removeNode(node);
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        reveal: function(id) {
            var node = this.data("treetable").tree[id];

            if (node) {
                node.reveal();
            } else {
                throw new Error("Unknown node '" + id + "'");
            }

            return this;
        },

        sortBranch: function(node, columnOrFunction) {
            var settings = this.data("treetable").settings,
                prepValue,
                sortFun;

            columnOrFunction = columnOrFunction || settings.column;
            sortFun = columnOrFunction;

            if ($.isNumeric(columnOrFunction)) {
                sortFun = function(a, b) {
                    var extractValue, valA, valB;

                    extractValue = function(node) {
                        var val = node.row.find("td:eq(" + columnOrFunction + ")").text();
                        // Ignore trailing/leading whitespace and use uppercase values for
                        // case insensitive ordering
                        return $.trim(val).toUpperCase();
                    }

                    valA = extractValue(a);
                    valB = extractValue(b);

                    if (valA < valB) return -1;
                    if (valA > valB) return 1;
                    return 0;
                };
            }

            this.data("treetable").sortBranch(node, sortFun);
            return this;
        },

        unloadBranch: function(node) {
            this.data("treetable").unloadBranch(node);
            return this;
        }
    };

    $.fn.treetable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            return $.error("Method " + method + " does not exist on jQuery.treetable");
        }
    };

    // Expose classes to world
    this.TreeTable || (this.TreeTable = {});
    this.TreeTable.Node = Node;
    this.TreeTable.Tree = Tree;
}).call(this);
/*
 * jQuery File Download Plugin v1.4.3
 *
 * http://www.johnculviner.com
 *
 * Copyright (c) 2013 - John Culviner
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * !!!!NOTE!!!!
 * You must also write a cookie in conjunction with using this plugin as mentioned in the orignal post:
 * http://johnculviner.com/jquery-file-download-plugin-for-ajax-like-feature-rich-file-downloads/
 * !!!!NOTE!!!!
 */

(function($, window){
    // i'll just put them here to get evaluated on script load
    var htmlSpecialCharsRegEx = /[<>&\r\n"']/gm;
    var htmlSpecialCharsPlaceHolders = {
        '<': 'lt;',
        '>': 'gt;',
        '&': 'amp;',
        '\r': "#13;",
        '\n': "#10;",
        '"': 'quot;',
        "'": '#39;' /*single quotes just to be safe, IE8 doesn't support &apos;, so use &#39; instead */
    };

    $.extend({
        //
        //$.fileDownload('/path/to/url/', options)
        //  see directly below for possible 'options'
        fileDownload: function (fileUrl, options) {

            //provide some reasonable defaults to any unspecified options below
            var settings = $.extend({

                //
                //Requires jQuery UI: provide a message to display to the user when the file download is being prepared before the browser's dialog appears
                //
                preparingMessageHtml: null,

                //
                //Requires jQuery UI: provide a message to display to the user when a file download fails
                //
                failMessageHtml: null,

                //
                //the stock android browser straight up doesn't support file downloads initiated by a non GET: http://code.google.com/p/android/issues/detail?id=1780
                //specify a message here to display if a user tries with an android browser
                //if jQuery UI is installed this will be a dialog, otherwise it will be an alert
                //Set to null to disable the message and attempt to download anyway
                //
                androidPostUnsupportedMessageHtml: "Unfortunately your Android browser doesn't support this type of file download. Please try again with a different browser.",

                //
                //Requires jQuery UI: options to pass into jQuery UI Dialog
                //
                dialogOptions: { modal: true },

                //
                //a function to call while the dowload is being prepared before the browser's dialog appears
                //Args:
                //  url - the original url attempted
                //
                prepareCallback: function (url) { },

                //
                //a function to call after a file download dialog/ribbon has appeared
                //Args:
                //  url - the original url attempted
                //
                successCallback: function (url) { },

                //
                //a function to call after a file download dialog/ribbon has appeared
                //Args:
                //  responseHtml    - the html that came back in response to the file download. this won't necessarily come back depending on the browser.
                //                      in less than IE9 a cross domain error occurs because 500+ errors cause a cross domain issue due to IE subbing out the
                //                      server's error message with a "helpful" IE built in message
                //  url             - the original url attempted
                //
                failCallback: function (responseHtml, url) { },

                //
                // the HTTP method to use. Defaults to "GET".
                //
                httpMethod: "GET",

                //
                // if specified will perform a "httpMethod" request to the specified 'fileUrl' using the specified data.
                // data must be an object (which will be $.param serialized) or already a key=value param string
                //
                data: null,

                //
                //a period in milliseconds to poll to determine if a successful file download has occured or not
                //
                checkInterval: 100,

                //
                //the cookie name to indicate if a file download has occured
                //
                cookieName: "fileDownload",

                //
                //the cookie value for the above name to indicate that a file download has occured
                //
                cookieValue: "true",

                //
                //the cookie path for above name value pair
                //
                cookiePath: "/",

                //
                //if specified it will be used when attempting to clear the above name value pair
                //useful for when downloads are being served on a subdomain (e.g. downloads.example.com)
                //
                cookieDomain: null,

                //
                //the title for the popup second window as a download is processing in the case of a mobile browser
                //
                popupWindowTitle: "Initiating file download...",

                //
                //Functionality to encode HTML entities for a POST, need this if data is an object with properties whose values contains strings with quotation marks.
                //HTML entity encoding is done by replacing all &,<,>,',",\r,\n characters.
                //Note that some browsers will POST the string htmlentity-encoded whilst others will decode it before POSTing.
                //It is recommended that on the server, htmlentity decoding is done irrespective.
                //
                encodeHTMLEntities: true

            }, options);

            var deferred = new $.Deferred();

            //Setup mobile browser detection: Partial credit: http://detectmobilebrowser.com/
            var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();

            var isIos;                  //has full support of features in iOS 4.0+, uses a new window to accomplish this.
            var isAndroid;              //has full support of GET features in 4.0+ by using a new window. Non-GET is completely unsupported by the browser. See above for specifying a message.
            var isOtherMobileBrowser;   //there is no way to reliably guess here so all other mobile devices will GET and POST to the current window.

            if (/ip(ad|hone|od)/.test(userAgent)) {

                isIos = true;

            } else if (userAgent.indexOf('android') !== -1) {

                isAndroid = true;

            } else {

                isOtherMobileBrowser = /avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|playbook|silk|iemobile|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4));

            }

            var httpMethodUpper = settings.httpMethod.toUpperCase();

            if (isAndroid && httpMethodUpper !== "GET" && settings.androidPostUnsupportedMessageHtml) {
                //the stock android browser straight up doesn't support file downloads initiated by non GET requests: http://code.google.com/p/android/issues/detail?id=1780

                if ($().dialog) {
                    $("<div>").html(settings.androidPostUnsupportedMessageHtml).dialog(settings.dialogOptions);
                } else {
                    alert(settings.androidPostUnsupportedMessageHtml);
                }

                return deferred.reject();
            }

            var $preparingDialog = null;

            var internalCallbacks = {

                onPrepare: function (url) {

                    //wire up a jquery dialog to display the preparing message if specified
                    if (settings.preparingMessageHtml) {

                        $preparingDialog = $("<div>").html(settings.preparingMessageHtml).dialog(settings.dialogOptions);

                    } else if (settings.prepareCallback) {

                        settings.prepareCallback(url);

                    }

                },

                onSuccess: function (url) {

                    //remove the perparing message if it was specified
                    if ($preparingDialog) {
                        $preparingDialog.dialog('close');
                    }

                    settings.successCallback(url);

                    deferred.resolve(url);
                },

                onFail: function (responseHtml, url) {

                    //remove the perparing message if it was specified
                    if ($preparingDialog) {
                        $preparingDialog.dialog('close');
                    }

                    //wire up a jquery dialog to display the fail message if specified
                    if (settings.failMessageHtml) {
                        $("<div>").html(settings.failMessageHtml).dialog(settings.dialogOptions);
                    }

                    settings.failCallback(responseHtml, url);

                    deferred.reject(responseHtml, url);
                }
            };

            internalCallbacks.onPrepare(fileUrl);

            //make settings.data a param string if it exists and isn't already
            if (settings.data !== null && typeof settings.data !== "string") {
                settings.data = $.param(settings.data);
            }


            var $iframe,
                downloadWindow,
                formDoc,
                $form;

            if (httpMethodUpper === "GET") {

                if (settings.data !== null) {
                    //need to merge any fileUrl params with the data object

                    var qsStart = fileUrl.indexOf('?');

                    if (qsStart !== -1) {
                        //we have a querystring in the url

                        if (fileUrl.substring(fileUrl.length - 1) !== "&") {
                            fileUrl = fileUrl + "&";
                        }
                    } else {

                        fileUrl = fileUrl + "?";
                    }

                    fileUrl = fileUrl + settings.data;
                }

                if (isIos || isAndroid) {

                    downloadWindow = window.open(fileUrl);
                    downloadWindow.document.title = settings.popupWindowTitle;
                    window.focus();

                } else if (isOtherMobileBrowser) {

                    window.location(fileUrl);

                } else {

                    //create a temporary iframe that is used to request the fileUrl as a GET request
                    $iframe = $("<iframe>")
                        .hide()
                        .prop("src", fileUrl)
                        .appendTo("body");
                }

            } else {

                var formInnerHtml = "";

                if (settings.data !== null) {

                    $.each(settings.data.replace(/\+/g, ' ').split("&"), function () {

                        var kvp = this.split("=");

                        var key = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[0])) : decodeURIComponent(kvp[0]);
                        if (key) {
                            var value = settings.encodeHTMLEntities ? htmlSpecialCharsEntityEncode(decodeURIComponent(kvp[1])) : decodeURIComponent(kvp[1]);
                            formInnerHtml += '<input type="hidden" name="' + key + '" value="' + value + '" />';
                        }
                    });
                }

                if (isOtherMobileBrowser) {

                    $form = $("<form>").appendTo("body");
                    $form.hide()
                        .prop('method', settings.httpMethod)
                        .prop('action', fileUrl)
                        .html(formInnerHtml);

                } else {

                    if (isIos) {

                        downloadWindow = window.open("about:blank");
                        downloadWindow.document.title = settings.popupWindowTitle;
                        formDoc = downloadWindow.document;
                        window.focus();

                    } else {

                        $iframe = $("<iframe style='display: none' src='about:blank'></iframe>").appendTo("body");
                        formDoc = getiframeDocument($iframe);
                    }

                    formDoc.write("<html><head></head><body><form method='" + settings.httpMethod + "' action='" + fileUrl + "'>" + formInnerHtml + "</form>" + settings.popupWindowTitle + "</body></html>");
                    $form = $(formDoc).find('form');
                }

                $form.submit();
            }


            //check if the file download has completed every checkInterval ms
            setTimeout(checkFileDownloadComplete, settings.checkInterval);


            function checkFileDownloadComplete() {
                //has the cookie been written due to a file download occuring?

                var cookieValue = settings.cookieValue;
                if(typeof cookieValue == 'string') {
                    cookieValue = cookieValue.toLowerCase();
                }

                var lowerCaseCookie = settings.cookieName.toLowerCase() + "=" + cookieValue;

                if (document.cookie.toLowerCase().indexOf(lowerCaseCookie) > -1) {

                    //execute specified callback
                    internalCallbacks.onSuccess(fileUrl);

                    //remove cookie
                    var cookieData = settings.cookieName + "=; path=" + settings.cookiePath + "; expires=" + new Date(0).toUTCString() + ";";
                    if (settings.cookieDomain) cookieData += " domain=" + settings.cookieDomain + ";";
                    document.cookie = cookieData;

                    //remove iframe
                    cleanUp(false);

                    return;
                }

                //has an error occured?
                //if neither containers exist below then the file download is occuring on the current window
                if (downloadWindow || $iframe) {

                    //has an error occured?
                    try {

                        var formDoc = downloadWindow ? downloadWindow.document : getiframeDocument($iframe);

                        if (formDoc && formDoc.body !== null && formDoc.body.innerHTML.length) {

                            var isFailure = true;

                            if ($form && $form.length) {
                                var $contents = $(formDoc.body).contents().first();

                                try {
                                    if ($contents.length && $contents[0] === $form[0]) {
                                        isFailure = false;
                                    }
                                } catch (e) {
                                    if (e && e.number == -2146828218) {
                                        // IE 8-10 throw a permission denied after the form reloads on the "$contents[0] === $form[0]" comparison
                                        isFailure = true;
                                    } else {
                                        throw e;
                                    }
                                }
                            }

                            if (isFailure) {
                                // IE 8-10 don't always have the full content available right away, they need a litle bit to finish
                                setTimeout(function () {
                                    internalCallbacks.onFail(formDoc.body.innerHTML, fileUrl);
                                    cleanUp(true);
                                }, 100);

                                return;
                            }
                        }
                    }
                    catch (err) {

                        //500 error less than IE9
                        internalCallbacks.onFail('', fileUrl);

                        cleanUp(true);

                        return;
                    }
                }


                //keep checking...
                setTimeout(checkFileDownloadComplete, settings.checkInterval);
            }

            //gets an iframes document in a cross browser compatible manner
            function getiframeDocument($iframe) {
                var iframeDoc = $iframe[0].contentWindow || $iframe[0].contentDocument;
                if (iframeDoc.document) {
                    iframeDoc = iframeDoc.document;
                }
                return iframeDoc;
            }

            function cleanUp(isFailure) {

                setTimeout(function() {

                    if (downloadWindow) {

                        if (isAndroid) {
                            downloadWindow.close();
                        }

                        if (isIos) {
                            if (downloadWindow.focus) {
                                downloadWindow.focus(); //ios safari bug doesn't allow a window to be closed unless it is focused
                                if (isFailure) {
                                    downloadWindow.close();
                                }
                            }
                        }
                    }

                    //iframe cleanup appears to randomly cause the download to fail
                    //not doing it seems better than failure...
                    //if ($iframe) {
                    //    $iframe.remove();
                    //}

                }, 0);
            }


            function htmlSpecialCharsEntityEncode(str) {
                return str.replace(htmlSpecialCharsRegEx, function(match) {
                    return '&' + htmlSpecialCharsPlaceHolders[match];
                });
            }
            var promise = deferred.promise();
            promise.abort = function() {
                cleanUp();
                $iframe.remove();
            };
            return promise;
        }
    });

})(jQuery, this);

/******************************************************************************
 * jquery.i18n.properties
 * 
 * Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
 * MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses.
 * 
 * @version     1.0.x
 * @author      Nuno Fernandes
 * @url         www.codingwithcoffee.com
 * @inspiration Localisation assistance for jQuery (http://keith-wood.name/localisation.html)
 *              by Keith Wood (kbwood{at}iinet.com.au) June 2007
 * 
 *****************************************************************************/

(function($) {
$.i18n = {};

/** Map holding bundle keys (if mode: 'map') */
$.i18n.map = {};
    
/**
 * Load and parse message bundle files (.properties),
 * making bundles keys available as javascript variables.
 * 
 * i18n files are named <name>.js, or <name>_<language>.js or <name>_<language>_<country>.js
 * Where:
 *      The <language> argument is a valid ISO Language Code. These codes are the lower-case, 
 *      two-letter codes as defined by ISO-639. You can find a full list of these codes at a 
 *      number of sites, such as: http://www.loc.gov/standards/iso639-2/englangn.html
 *      The <country> argument is a valid ISO Country Code. These codes are the upper-case,
 *      two-letter codes as defined by ISO-3166. You can find a full list of these codes at a
 *      number of sites, such as: http://www.iso.ch/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html
 * 
 * Sample usage for a bundles/Messages.properties bundle:
 * $.i18n.properties({
 *      name:      'Messages', 
 *      language:  'en_US',
 *      path:      'bundles'
 * });
 * @param  name			(string/string[], optional) names of file to load (eg, 'Messages' or ['Msg1','Msg2']). Defaults to "Messages"
 * @param  language		(string, optional) language/country code (eg, 'en', 'en_US', 'pt_PT'). if not specified, language reported by the browser will be used instead.
 * @param  path			(string, optional) path of directory that contains file to load
 * @param  mode			(string, optional) whether bundles keys are available as JavaScript variables/functions or as a map (eg, 'vars' or 'map')
 * @param  cache        (boolean, optional) whether bundles should be cached by the browser, or forcibly reloaded on each page load. Defaults to false (i.e. forcibly reloaded)
 * @param  encoding 	(string, optional) the encoding to request for bundles. Property file resource bundles are specified to be in ISO-8859-1 format. Defaults to UTF-8 for backward compatibility.
 * @param  callback     (function, optional) callback function to be called after script is terminated
 */
$.i18n.properties = function(settings) {
	// set up settings
    var defaults = {
        name:           'Messages',
        language:       '',
        path:           '',  
        mode:           'vars',
        cache:			false,
        encoding:       'UTF-8',
        callback:       null
    };
    settings = $.extend(defaults, settings);    
    if(settings.language === null || settings.language == '') {
	   settings.language = $.i18n.browserLang();
	}
	if(settings.language === null) {settings.language='';}
	
	// load and parse bundle files
	var files = getFiles(settings.name);
	for(i=0; i<files.length; i++) {
		// 1. load base (eg, Messages.properties)
		loadAndParseFile(settings.path + files[i] + '.properties', settings);
        // 2. with language code (eg, Messages_pt.properties)
		if(settings.language.length >= 2) {
            loadAndParseFile(settings.path + files[i] + '_' + settings.language.substring(0, 2) +'.properties', settings);
		}
		// 3. with language code and country code (eg, Messages_pt_PT.properties)
        if(settings.language.length >= 5) {
            loadAndParseFile(settings.path + files[i] + '_' + settings.language.substring(0, 5) +'.properties', settings);
        }
	}
	
	// call callback
	if(settings.callback){ settings.callback(); }
};


/**
 * When configured with mode: 'map', allows access to bundle values by specifying its key.
 * Eg, jQuery.i18n.prop('com.company.bundles.menu_add')
 */
$.i18n.prop = function(key /* Add parameters as function arguments as necessary  */) {
	var value = $.i18n.map[key];
	if (value == null)
		return '[' + key + ']';
	
//	if(arguments.length < 2) // No arguments.
//    //if(key == 'spv.lbl.modified') {alert(value);}
//		return value;
	
//	if (!$.isArray(placeHolderValues)) {
//		// If placeHolderValues is not an array, make it into one.
//		placeHolderValues = [placeHolderValues];
//		for (var i=2; i<arguments.length; i++)
//			placeHolderValues.push(arguments[i]);
//	}

	// Place holder replacement
	/**
	 * Tested with:
	 *   test.t1=asdf ''{0}''
	 *   test.t2=asdf '{0}' '{1}'{1}'zxcv
	 *   test.t3=This is \"a quote" 'a''{0}''s'd{fgh{ij'
	 *   test.t4="'''{'0}''" {0}{a}
	 *   test.t5="'''{0}'''" {1}
	 *   test.t6=a {1} b {0} c
	 *   test.t7=a 'quoted \\ s\ttringy' \t\t x
	 *
	 * Produces:
	 *   test.t1, p1 ==> asdf 'p1'
	 *   test.t2, p1 ==> asdf {0} {1}{1}zxcv
	 *   test.t3, p1 ==> This is "a quote" a'{0}'sd{fgh{ij
	 *   test.t4, p1 ==> "'{0}'" p1{a}
	 *   test.t5, p1 ==> "'{0}'" {1}
	 *   test.t6, p1 ==> a {1} b p1 c
	 *   test.t6, p1, p2 ==> a p2 b p1 c
	 *   test.t6, p1, p2, p3 ==> a p2 b p1 c
	 *   test.t7 ==> a quoted \ s	tringy 		 x
	 */
	
	var i;
	if (typeof(value) == 'string') {
        // Handle escape characters. Done separately from the tokenizing loop below because escape characters are 
		// active in quoted strings.
        i = 0;
        while ((i = value.indexOf('\\', i)) != -1) {
 		   if (value[i+1] == 't')
 			   value = value.substring(0, i) + '\t' + value.substring((i++) + 2); // tab
 		   else if (value[i+1] == 'r')
 			   value = value.substring(0, i) + '\r' + value.substring((i++) + 2); // return
 		   else if (value[i+1] == 'n')
 			   value = value.substring(0, i) + '\n' + value.substring((i++) + 2); // line feed
 		   else if (value[i+1] == 'f')
 			   value = value.substring(0, i) + '\f' + value.substring((i++) + 2); // form feed
 		   else if (value[i+1] == '\\')
 			   value = value.substring(0, i) + '\\' + value.substring((i++) + 2); // \
 		   else
 			   value = value.substring(0, i) + value.substring(i+1); // Quietly drop the character
        }
		
		// Lazily convert the string to a list of tokens.
		var arr = [], j, index;
		i = 0;
		while (i < value.length) {
			if (value[i] == '\'') {
				// Handle quotes
				if (i == value.length-1)
					value = value.substring(0, i); // Silently drop the trailing quote
				else if (value[i+1] == '\'')
					value = value.substring(0, i) + value.substring(++i); // Escaped quote
				else {
					// Quoted string
					j = i + 2;
					while ((j = value.indexOf('\'', j)) != -1) {
						if (j == value.length-1 || value[j+1] != '\'') {
							// Found start and end quotes. Remove them
							value = value.substring(0,i) + value.substring(i+1, j) + value.substring(j+1);
							i = j - 1;
							break;
						}
						else {
							// Found a double quote, reduce to a single quote.
							value = value.substring(0,j) + value.substring(++j);
						}
					}
					
					if (j == -1) {
						// There is no end quote. Drop the start quote
						value = value.substring(0,i) + value.substring(i+1);
					}
				}
			}
			else if (value[i] == '{') {
				// Beginning of an unquoted place holder.
				j = value.indexOf('}', i+1);
				if (j == -1)
					i++; // No end. Process the rest of the line. Java would throw an exception
				else {
					// Add 1 to the index so that it aligns with the function arguments.
					index = parseInt(value.substring(i+1, j));
					if (!isNaN(index) && index >= 0) {
						// Put the line thus far (if it isn't empty) into the array
						var s = value.substring(0, i);
						if (s != "")
							arr.push(s);
						// Put the parameter reference into the array
						arr.push(index);
						// Start the processing over again starting from the rest of the line.
						i = 0;
						value = value.substring(j+1);
					}
					else
						i = j + 1; // Invalid parameter. Leave as is.
				}
			}
			else
				i++;
		}
		
		// Put the remainder of the no-empty line into the array.
		if (value != "")
			arr.push(value);
		value = arr;
		
		// Make the array the value for the entry.
		$.i18n.map[key] = arr;
	}
	
	if (value.length == 0)
		return "";
	if (value.lengh == 1 && typeof(value[0]) == "string")
		return value[0];
	
	var s = "";
	for (i=0; i<value.length; i++) {
		if (typeof(value[i]) == "string")
			s += value[i];
		// Must be a number
		else if (value[i] + 1 < arguments.length)
			s += arguments[value[i] + 1];
		else
			s += "{"+ value[i] +"}";
	}
	
	return s;
};

/** Language reported by browser, normalized code */
$.i18n.browserLang = function() {
	return normaliseLanguageCode(navigator.language /* Mozilla */ || navigator.userLanguage /* IE */);
}


/** Load and parse .properties files */
function loadAndParseFile(filename, settings) {
	$.ajax({
        url:        filename,
        async:      false,
        cache:		settings.cache,
        contentType:'text/plain;charset='+ settings.encoding,
        dataType:   'text',
        success:    function(data, status) {
        				parseData(data, settings.mode); 
					}
    });
}

/** Parse .properties files */
function parseData(data, mode) {
   var parsed = '';
   var parameters = data.split( /\n/ );
   var regPlaceHolder = /(\{\d+\})/g;
   var regRepPlaceHolder = /\{(\d+)\}/g;
   var unicodeRE = /(\\u.{4})/ig;
   for(var i=0; i<parameters.length; i++ ) {
       parameters[i] = parameters[i].replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
       if(parameters[i].length > 0 && parameters[i].match("^#")!="#") { // skip comments
           var pair = parameters[i].split('=');
           if(pair.length > 0) {
               /** Process key & value */
               var name = unescape(pair[0]).replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
               var value = pair.length == 1 ? "" : pair[1];
               // process multi-line values
               while(value.match(/\\$/)=="\\") {
               		value = value.substring(0, value.length - 1);
               		value += parameters[++i].replace( /\s\s*$/, '' ); // right trim
               }               
               // Put values with embedded '='s back together
               for(var s=2;s<pair.length;s++){ value +='=' + pair[s]; }
               value = value.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // trim
               
               /** Mode: bundle keys in a map */
               if(mode == 'map' || mode == 'both') {
                   // handle unicode chars possibly left out
                   var unicodeMatches = value.match(unicodeRE);
                   if(unicodeMatches) {
                     for(var u=0; u<unicodeMatches.length; u++) {
                        value = value.replace( unicodeMatches[u], unescapeUnicode(unicodeMatches[u]));
                     }
                   }
                   // add to map
                   $.i18n.map[name] = value;
               }
               
               /** Mode: bundle keys as vars/functions */
               if(mode == 'vars' || mode == 'both') {
                   value = value.replace( /"/g, '\\"' ); // escape quotation mark (")
                   
                   // make sure namespaced key exists (eg, 'some.key') 
                   checkKeyNamespace(name);
                   
                   // value with variable substitutions
                   if(regPlaceHolder.test(value)) {
                       var parts = value.split(regPlaceHolder);
                       // process function args
                       var first = true;
                       var fnArgs = '';
                       var usedArgs = [];
                       for(var p=0; p<parts.length; p++) {
                           if(regPlaceHolder.test(parts[p]) && (usedArgs.length == 0 || usedArgs.indexOf(parts[p]) == -1)) {
                               if(!first) {fnArgs += ',';}
                               fnArgs += parts[p].replace(regRepPlaceHolder, 'v$1');
                               usedArgs.push(parts[p]);
                               first = false;
                           }
                       }
                       parsed += name + '=function(' + fnArgs + '){';
                       // process function body
                       var fnExpr = '"' + value.replace(regRepPlaceHolder, '"+v$1+"') + '"';
                       parsed += 'return ' + fnExpr + ';' + '};';
                       
                   // simple value
                   }else{
                       parsed += name+'="'+value+'";';
                   }
               } // END: Mode: bundle keys as vars/functions
           } // END: if(pair.length > 0)
       } // END: skip comments
   }
   eval(parsed);
}

/** Make sure namespace exists (for keys with dots in name) */
// TODO key parts that start with numbers quietly fail. i.e. month.short.1=Jan
function checkKeyNamespace(key) {
	var regDot = /\./;
	if(regDot.test(key)) {
		var fullname = '';
		var names = key.split( /\./ );
		for(var i=0; i<names.length; i++) {
			if(i>0) {fullname += '.';}
			fullname += names[i];
			if(eval('typeof '+fullname+' == "undefined"')) {
				eval(fullname + '={};');
			}
		}
	}
}

/** Make sure filename is an array */
function getFiles(names) {
	return (names && names.constructor == Array) ? names : [names];
}

/** Ensure language code is in the format aa_AA. */
function normaliseLanguageCode(lang) {
    lang = lang.toLowerCase();
    if(lang.length > 3) {
        lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
    }
    return lang;
}

/** Unescape unicode chars ('\u00e3') */
function unescapeUnicode(str) {
  // unescape unicode codes
  var codes = [];
  var code = parseInt(str.substr(2), 16);
  if (code >= 0 && code < Math.pow(2, 16)) {
     codes.push(code);
  }
  // convert codes to text
  var unescaped = '';
  for (var i = 0; i < codes.length; ++i) {
    unescaped += String.fromCharCode(codes[i]);
  }
  return unescaped;
}

/* Cross-Browser Split 1.0.1
(c) Steven Levithan <stevenlevithan.com>; MIT License
An ECMA-compliant, uniform cross-browser split method */
var cbSplit;
// avoid running twice, which would break `cbSplit._nativeSplit`'s reference to the native `split`
if (!cbSplit) {    
  cbSplit = function(str, separator, limit) {
      // if `separator` is not a regex, use the native `split`
      if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
        if(typeof cbSplit._nativeSplit == "undefined")
          return str.split(separator, limit);
        else
          return cbSplit._nativeSplit.call(str, separator, limit);
      }
  
      var output = [],
          lastLastIndex = 0,
          flags = (separator.ignoreCase ? "i" : "") +
                  (separator.multiline  ? "m" : "") +
                  (separator.sticky     ? "y" : ""),
          separator = RegExp(separator.source, flags + "g"), // make `global` and avoid `lastIndex` issues by working with a copy
          separator2, match, lastIndex, lastLength;
  
      str = str + ""; // type conversion
      if (!cbSplit._compliantExecNpcg) {
          separator2 = RegExp("^" + separator.source + "$(?!\\s)", flags); // doesn't need /g or /y, but they don't hurt
      }
  
      /* behavior for `limit`: if it's...
      - `undefined`: no limit.
      - `NaN` or zero: return an empty array.
      - a positive number: use `Math.floor(limit)`.
      - a negative number: no limit.
      - other: type-convert, then use the above rules. */
      if (limit === undefined || +limit < 0) {
          limit = Infinity;
      } else {
          limit = Math.floor(+limit);
          if (!limit) {
              return [];
          }
      }
  
      while (match = separator.exec(str)) {
          lastIndex = match.index + match[0].length; // `separator.lastIndex` is not reliable cross-browser
  
          if (lastIndex > lastLastIndex) {
              output.push(str.slice(lastLastIndex, match.index));
  
              // fix browsers whose `exec` methods don't consistently return `undefined` for nonparticipating capturing groups
              if (!cbSplit._compliantExecNpcg && match.length > 1) {
                  match[0].replace(separator2, function () {
                      for (var i = 1; i < arguments.length - 2; i++) {
                          if (arguments[i] === undefined) {
                              match[i] = undefined;
                          }
                      }
                  });
              }
  
              if (match.length > 1 && match.index < str.length) {
                  Array.prototype.push.apply(output, match.slice(1));
              }
  
              lastLength = match[0].length;
              lastLastIndex = lastIndex;
  
              if (output.length >= limit) {
                  break;
              }
          }
  
          if (separator.lastIndex === match.index) {
              separator.lastIndex++; // avoid an infinite loop
          }
      }
  
      if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
              output.push("");
          }
      } else {
          output.push(str.slice(lastLastIndex));
      }
  
      return output.length > limit ? output.slice(0, limit) : output;
  };
  
  cbSplit._compliantExecNpcg = /()??/.exec("")[1] === undefined; // NPCG: nonparticipating capturing group
  cbSplit._nativeSplit = String.prototype.split;

} // end `if (!cbSplit)`
String.prototype.split = function (separator, limit) {
    return cbSplit(this, separator, limit);
};

})(jQuery);
                
(function(){function n(n,t){return n.set(t[0],t[1]),n}function t(n,t){return n.add(t),n}function r(n,t){for(var r=-1,e=n.length,u=-1,i=t.length,o=Array(e+i);++r<e;)o[r]=n[r];for(;++u<i;)o[r++]=t[u];return o}function e(n,t){for(var r=-1,e=n.length;++r<e&&t(n[r],r,n)!==!1;);return n}function u(n,t){for(var r=n.length;r--&&t(n[r],r,n)!==!1;);return n}function i(n,t){for(var r=-1,e=n.length;++r<e;)if(!t(n[r],r,n))return!1;return!0}function o(n,t){for(var r=-1,e=n.length,u=-1,i=[];++r<e;){var o=n[r];t(o,r,n)&&(i[++u]=o)}return i}function a(n,t){for(var r=-1,e=n.length,u=Array(e);++r<e;)u[r]=t(n[r],r,n);return u}function f(n,t){for(var r=-1,e=t.length,u=n.length;++r<e;)n[u+r]=t[r];return n}function c(n,t,r,e){var u=-1,i=n.length;for(e&&i&&(r=n[++u]);++u<i;)r=t(r,n[u],u,n);return r}function l(n,t,r,e){var u=n.length;for(e&&u&&(r=n[--u]);u--;)r=t(r,n[u],u,n);return r}function s(n,t){for(var r=-1,e=n.length;++r<e;)if(t(n[r],r,n))return!0;return!1}function p(n,t,r){var e=n[t];(r===r?r===e:e!==e)&&(r!==X||t in n)||(n[t]=r)}function h(n,t,r){var e=n[t];(r!==X&&(r===r?r!==e:e===e)||"number"==typeof t&&r===X&&!(t in n))&&(n[t]=r)}function _(n,t,r){for(var e=-1,u=n.length;++e<u;){var i=n[e],o=t(i);if(null!=o&&(a===X?o===o:r(o,a)))var a=o,f=i}return f}function v(n,t,r,e){var u;return r(n,function(n,r,i){return t(n,r,i)?(u=e?r:n,!1):void 0}),u}function g(n,t,r){for(var e=n.length,u=r?e:-1;r?u--:++u<e;)if(t(n[u],u,n))return u;return-1}function y(n,t,r){if(t!==t)return B(n,r);for(var e=r-1,u=n.length;++e<u;)if(n[e]===t)return e;return-1}function d(n,t,r,e,u){return u(n,function(n,u,i){r=e?(e=!1,n):t(r,n,u,i)}),r}function m(n,t){var r=n.length;for(n.sort(t);r--;)n[r]=n[r].value;return n}function w(n,t){for(var r,e=-1,u=n.length;++e<u;){var i=t(n[e]);i===i&&null!=i&&(r=r===X?i:r+i)}return r}function b(n,t){for(var r=-1,e=Array(n);++r<n;)e[r]=t(r);return e}function x(n,t){return a(t,function(t){return n[t]})}function j(n,t){for(var r=-1,e=n.length;++r<e&&y(t,n[r],0)>-1;);return r}function A(n,t){for(var r=n.length;r--&&y(t,n[r],0)>-1;);return r}function O(n){return n&&n.Object===Object?n:null}function R(n,t){if(n!==t){var r=null===n,e=n===X,u=n===n,i=null===t,o=t===X,a=t===t;if(n>t&&!i||!u||r&&!o&&a||e&&a)return 1;if(t>n&&!r||!a||i&&!e&&u||o&&u)return-1}return 0}function k(n,t,r){for(var e=-1,u=n.criteria,i=t.criteria,o=u.length,a=r.length;++e<o;){var f=R(u[e],i[e]);if(f){if(e>=a)return f;var c=r[e];return f*("asc"===c?1:-1)}}return n.index-t.index}function I(n,t){var r=-1,e=n.length;for(t||(t=Array(e));++r<e;)t[r]=n[r];return t}function E(n,t,r){return C(n,t,r)}function C(n,t,r,e){r||(r={});for(var u=-1,i=t.length;++u<i;){var o=t[u],a=e?e(r[o],n[o],o,r,n):n[o];p(r,o,a)}return r}function S(n){return cr[n]}function W(n){return lr[n]}function L(n){return"\\"+hr[n]}function U(n,t){return n===X?t:n}function B(n,t,r){for(var e=n.length,u=t+(r?0:-1);r?u--:++u<e;){var i=n[u];if(i!==i)return u}return-1}function $(n){var t=!1;if(null!=n&&"function"!=typeof n.toString)try{t=!!(n+"")}catch(r){}return t}function z(n,t){return n="number"==typeof n||yt.test(n)?+n:-1,t=null==t?bn:t,n>-1&&n%1==0&&t>n}function F(n){return"number"==typeof n&&n>-1&&n%1==0&&bn>=n}function q(n){return 160>=n&&n>=9&&13>=n||32==n||160==n||5760==n||6158==n||n>=8192&&(8202>=n||8232==n||8233==n||8239==n||8287==n||12288==n||65279==n)}function T(n){for(var t,r=[];!(t=n.next()).done;)r.push(t.value);return r}function N(n){var t=-1,r=Array(n.size);return n.forEach(function(n,e){r[++t]=[e,n]}),r}function D(n,t){for(var r=-1,e=n.length,u=-1,i=[];++r<e;)n[r]===t&&(n[r]=Rn,i[++u]=r);return i}function M(n){var t=-1,r=Array(n.size);return n.forEach(function(n){r[++t]=n}),r}function P(n){if(!n||!tr.test(n))return n.length;for(var t=nr.lastIndex=0;nr.test(n);)t++;return t}function Z(n){return n?n.match(nr):[]}function K(n){for(var t=-1,r=n.length;++t<r&&q(n.charCodeAt(t)););return t}function V(n){for(var t=n.length;t--&&q(n.charCodeAt(t)););return t}function G(n){return sr[n]}function J(O){function q(n){if(Xi(n)&&!vc(n)&&!(n instanceof bt)){if(n instanceof yt)return n;if(Ma.call(n,"__wrapped__"))return ru(n)}return new yt(n)}function Tn(){}function yt(n,t){this.__wrapped__=n,this.__actions__=[],this.__chain__=!!t,this.__index__=0,this.__values__=X}function bt(n){this.__wrapped__=n,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=jn,this.__views__=[]}function xt(){var n=new bt(this.__wrapped__);return n.__actions__=I(this.__actions__),n.__dir__=this.__dir__,n.__filtered__=this.__filtered__,n.__iteratees__=I(this.__iteratees__),n.__takeCount__=this.__takeCount__,n.__views__=I(this.__views__),n}function jt(){if(this.__filtered__){var n=new bt(this);n.__dir__=-1,n.__filtered__=!0}else n=this.clone(),n.__dir__*=-1;return n}function At(){var n=this.__wrapped__.value(),t=this.__dir__,r=vc(n),e=0>t,u=r?n.length:0,i=$e(0,u,this.__views__),o=i.start,a=i.end,f=a-o,c=e?a:o-1,l=this.__iteratees__,s=l.length,p=0,h=pf(f,this.__takeCount__);if(!r||vn>u||u==f&&h==f)return ne(n,this.__actions__);var _=[];n:for(;f--&&h>p;){c+=t;for(var v=-1,g=n[c];++v<s;){var y=l[v],d=y.iteratee,m=y.type,w=d(g);if(m==yn)g=w;else if(!w){if(m==gn)continue n;break n}}_[p++]=g}return _}function Ot(){}function Rt(n,t){return It(n,t)&&delete n[t]}function kt(n,t){if(mf){var r=n[t];return r===mn?X:r}return Ma.call(n,t)?n[t]:X}function It(n,t){return mf?n[t]!==X:Ma.call(n,t)}function Et(n,t,r){n[t]=mf&&r===X?mn:r}function Ct(n){var t=-1,r=n?n.length:0;for(this.__data__={hash:new Ot,map:gf?new gf:[],string:new Ot};++t<r;){var e=n[t];this.set(e[0],e[1])}}function St(n){var t=this.__data__;return Ze(n)?Rt("string"==typeof n?t.string:t.hash,n):gf?t.map["delete"](n):Mt(t.map,n)}function Wt(n){var t=this.__data__;return Ze(n)?kt("string"==typeof n?t.string:t.hash,n):gf?t.map.get(n):Pt(t.map,n)}function Lt(n){var t=this.__data__;return Ze(n)?It("string"==typeof n?t.string:t.hash,n):gf?t.map.has(n):Zt(t.map,n)}function Ut(n,t){var r=this.__data__;return Ze(n)?Et("string"==typeof n?r.string:r.hash,n,t):gf?r.map.set(n,t):Vt(r.map,n,t),this}function Bt(n){var t=-1,r=n?n.length:0;for(this.__data__=new Ct;++t<r;)this.push(n[t])}function $t(n,t){var r=n.__data__;if(Ze(t)){var e=r.__data__,u="string"==typeof t?e.string:e.hash;return u[t]===mn?0:-1}return r.has(t)?0:-1}function zt(n){var t=this.__data__;if(Ze(n)){var r=t.__data__,e="string"==typeof n?r.string:r.hash;e[n]=mn}else t.set(n,mn)}function Ft(n){var t=-1,r=n?n.length:0;for(this.__data__={array:[],map:null};++t<r;){var e=n[t];this.set(e[0],e[1])}}function qt(n){var t=this.__data__,r=t.array;return r?Mt(r,n):t.map["delete"](n)}function Tt(n){var t=this.__data__,r=t.array;return r?Pt(r,n):t.map.get(n)}function Nt(n){var t=this.__data__,r=t.array;return r?Zt(r,n):t.map.has(n)}function Dt(n,t){var r=this.__data__,e=r.array;e&&(e.length<vn-1?Vt(e,n,t):(r.array=null,r.map=new Ct(e)));var u=r.map;return u&&u.set(n,t),this}function Mt(n,t){var r=Kt(n,t);if(0>r)return!1;var e=n.length-1;return r==e?n.pop():of.call(n,r,1),!0}function Pt(n,t){var r=Kt(n,t);return 0>r?X:n[r][1]}function Zt(n,t){return Kt(n,t)>-1}function Kt(n,t){for(var r=n.length;r--;)if(n[r][0]===t)return r;return-1}function Vt(n,t,r){var e=Kt(n,t);0>e?n.push([t,r]):n[e][1]=r}function Gt(n,t){return n&&E(t,Co(t),n)}function Jt(n,t){for(var r=-1,e=null==n,u=t.length,i=Array(u);++r<u;)i[r]=e?X:Ro(n,t[r]);return i}function Xt(n,t,r,u,i,o){var a;if(r&&(a=i?r(n,u,i,o):r(n)),a!==X)return a;if(!Ji(n))return n;var f=vc(n);if(f){if(a=Fe(n),!t)return I(n,a)}else{var c=Be(n),l=c==Wn;if(c!=$n&&c!=kn&&(!l||i))return fr[c]?Te(n,c,t):i?n:{};if($(n))return i?n:{};if(a=qe(l?{}:n),!t)return Gt(a,n)}o||(o=new Ft);var s=o.get(n);return s?s:(o.set(n,a),(f?e:_r)(n,function(e,u){a[u]=Xt(e,t,r,u,n,o)}),a)}function Yt(n,t,r){if("function"!=typeof n)throw new Fa(dn);return uf(function(){n.apply(X,r)},t)}function Ht(n,t){return nr(n,t)}function nr(n,t,r){var e=-1,u=y,i=!0,o=n.length,f=[],c=t.length;if(!o)return f;r&&(t=a(t,function(n){return r(n)})),t.length>=vn&&(u=$t,i=!1,t=new Bt(t));n:for(;++e<o;){var l=n[e],s=r?r(l):l;if(i&&s===s){for(var p=c;p--;)if(t[p]===s)continue n;f.push(l)}else u(t,s,0)<0&&f.push(l)}return f}function cr(n,t){var r=!0;return Of(n,function(n,e,u){return r=!!t(n,e,u)}),r}function lr(n,t,r,e){var u=n.length;for(r=null==r?0:ho(r),0>r&&(r=-r>u?0:u+r),e=e===X||e>u?u:ho(e),0>e&&(e+=u),u=r>e?0:e>>>0,r>>>=0;u>r;)n[r++]=t;return n}function sr(n,t){var r=[];return Of(n,function(n,e,u){t(n,e,u)&&r.push(n)}),r}function pr(n,t,r,e){e||(e=[]);for(var u=-1,i=n.length;++u<i;){var o=n[u];Fi(o)&&(r||vc(o)||$i(o))?t?pr(o,t,r,e):f(e,o):r||(e[e.length]=o)}return e}function hr(n,t){return null==n?n:kf(n,t,So)}function _r(n,t){return n&&kf(n,t,Co)}function vr(n,t){return n&&If(n,t,Co)}function gr(n,t){return o(t,function(t){return Vi(n[t])})}function yr(n,t){t=Pe(t,n)?[t+""]:Jr(t);for(var r=0,e=t.length;null!=n&&e>r;)n=n[t[r++]];return r&&r==e?n:X}function dr(n,t){return Ma.call(n,t)||"object"==typeof n&&t in n&&null===nf(n)}function mr(n,t){return t in Object(n)}function wr(n){return jr(n)}function jr(n,t){for(var r=n.length,e=r,u=Array(r),i=[];e--;){var o=n[e];e&&t&&(o=a(o,function(n){return t(n)})),u[e]=t||o.length>=120?new Bt(e&&o):null}o=n[0];var f=-1,c=o?o.length:0,l=u[0];n:for(;++f<c;){var s=o[f],p=t?t(s):s;if((l?$t(l,p):y(i,p,0))<0){for(var e=r;--e;){var h=u[e];if((h?$t(h,p):y(n[e],p,0))<0)continue n}l&&l.push(p),i.push(s)}}return i}function Ar(n,t,r,e,u){return n===t?!0:null==n||null==t||!Ji(n)&&!Xi(t)?n!==n&&t!==t:Or(n,t,Ar,r,e,u)}function Or(n,t,r,e,u,i){var o=vc(n),a=vc(t),f=In,c=In;o||(f=Be(n),f==kn?f=$n:f!=$n&&(o=fo(n))),a||(c=Be(t),c==kn?c=$n:c!=$n&&(a=fo(t)));var l=f==$n&&!$(n),s=c==$n&&!$(t),p=f==c;if(p&&!o&&!l)return Ee(n,t,f,r,e,u);var h=u&ln;if(!h){var _=l&&Ma.call(n,"__wrapped__"),v=s&&Ma.call(t,"__wrapped__");if(_||v)return r(_?n.value():n,v?t.value():t,e,u,i)}if(!p)return!1;i||(i=new Ft);var g=i.get(n);if(g)return g==t;i.set(n,t);var y=(o?Ie:Ce)(n,t,r,e,u,i);return i["delete"](n),y}function Rr(n,t,r,e){var u=r.length,i=u,o=!e;if(null==n)return!i;for(n=Object(n);u--;){var a=r[u];if(o&&a[2]?a[1]!==n[a[0]]:!(a[0]in n))return!1}for(;++u<i;){a=r[u];var f=a[0],c=n[f],l=a[1];if(o&&a[2]){if(c===X&&!(f in n))return!1}else{var s=new Ft,p=e?e(c,l,f,n,t,s):X;if(!(p===X?Ar(l,c,e,cn|ln,s):p))return!1}}return!0}function kr(n){var t=typeof n;return"function"==t?n:null==n?_a:"object"==t?vc(n)?Wr(n[0],n[1]):Sr(n):ba(n)}function Ir(n){return lf(Object(n))}function Er(n){n=null==n?n:Object(n);var t=[];for(var r in n)t.push(r);return t}function Cr(n,t){var r=-1,e=zi(n)?Array(n.length):[];return Of(n,function(n,u,i){e[++r]=t(n,u,i)}),e}function Sr(n){var t=Le(n);if(1==t.length&&t[0][2]){var r=t[0][0],e=t[0][1];return function(n){return null==n?!1:n[r]===e&&(e!==X||r in Object(n))}}return function(r){return r===n||Rr(r,n,t)}}function Wr(n,t){return function(r){var e=Ro(r,n);return e===X&&e===t?Io(r,n):Ar(t,e,X,cn|ln)}}function Lr(n,t,r,u){if(n!==t){var i=vc(t)||fo(t)?X:So(t);e(i||t,function(e,o){if(i&&(o=e,e=t[o]),Ji(e))u||(u=new Ft),Ur(n,t,o,Lr,r,u);else{var a=r?r(n[o],e,o+"",n,t,u):X;a===X&&(a=e),h(n,o,a)}})}}function Ur(n,t,r,e,u,i){var o=n[r],a=t[r],f=i.get(o)||i.get(a);if(f)return void h(n,r,f);var c=u?u(o,a,r+"",n,t,i):X,l=c===X;l&&(c=a,vc(a)||fo(a)?c=vc(o)?o:Fi(o)?I(o):Xt(a):uo(a)||$i(a)?c=$i(o)?_o(o):Ji(o)?o:Xt(a):l=Vi(a)),i.set(a,c),l&&e(c,a,u,i),h(n,r,c)}function Br(n,t){return n=Object(n),c(t,function(t,r){return r in n&&(t[r]=n[r]),t},{})}function $r(n,t){var r={};return hr(n,function(n,e){t(n)&&(r[e]=n)}),r}function zr(n){return function(t){return null==t?X:t[n]}}function Fr(n){return function(t){return yr(t,n)}}function qr(n,t){return Tr(n,t)}function Tr(n,t,r){var e=-1,u=t.length,i=n;for(r&&(i=a(n,function(n){return r(n)}));++e<u;)for(var o=0,f=t[e],c=r?r(f):f;(o=y(i,c,o))>-1;)i!==n&&of.call(i,o,1),of.call(n,o,1);return n}function Nr(n,t){for(var r=n?t.length:0,e=r-1;r--;){var u=t[r];if(e==r||u!=i){var i=u;if(z(u))of.call(n,u,1);else if(Pe(u,n))delete n[u];else{var o=Jr(u),a=Ye(n,o);null!=a&&delete a[yu(o)]}}}return n}function Dr(n,t){return n+ff(_f()*(t-n+1))}function Mr(n,t,r,e){t=Pe(t,n)?[t+""]:Jr(t);for(var u=-1,i=t.length,o=i-1,a=n;null!=a&&++u<i;){var f=t[u];if(Ji(a)){var c=r;if(u!=o){var l=a[f];c=e?e(l,f,a):X,c===X&&(c=null==l?z(t[u+1])?[]:{}:l)}p(a,f,c)}a=a[f]}return n}function Pr(n,t,r){var e=-1,u=n.length;t=null==t?0:ho(t),0>t&&(t=-t>u?0:u+t),r=r===X||r>u?u:ho(r),0>r&&(r+=u),u=t>r?0:r-t>>>0,t>>>=0;for(var i=Array(u);++e<u;)i[e]=n[e+t];return i}function Zr(n,t){var r;return Of(n,function(n,e,u){return r=t(n,e,u),!r}),!!r}function Kr(n,t,r){var e=We(),u=-1;t=a(t.length?t:Array(1),function(n){return e(n)});var i=Cr(n,function(n,r,e){var i=a(t,function(t){return t(n)});return{criteria:i,index:++u,value:n}});return m(i,function(n,t){return k(n,t,r)})}function Vr(n){return Gr(n)}function Gr(n,t){for(var r=0,e=n.length,u=n[0],i=t?t(u):u,o=i,a=0,f=[u];++r<e;)u=n[r],i=t?t(u):u,(o===o?o!==i:i===i)&&(o=i,f[++a]=u);return f}function Jr(n){return vc(n)?n:Qe(n)}function Xr(n){return Yr(n)}function Yr(n,t){var r=-1,e=y,u=n.length,i=!0,o=u>=vn?new Bt:null,a=[];o?(e=$t,i=!1):o=t?[]:a;n:for(;++r<u;){var f=n[r],c=t?t(f):f;if(i&&c===c){for(var l=o.length;l--;)if(o[l]===c)continue n;t&&o.push(c),a.push(f)}else e(o,c,0)<0&&(o!==a&&o.push(c),a.push(f))}return a}function Hr(n,t){t=Pe(t,n)?[t+""]:Jr(t),n=Ye(n,t);var r=yu(t);return null!=n&&ko(n,r)?delete n[r]:!0}function Qr(n,t,r,e){for(var u=n.length,i=e?u:-1;(e?i--:++i<u)&&t(n[i],i,n););return r?Pr(n,e?0:i,e?i+1:u):Pr(n,e?i+1:0,e?u:i)}function ne(n,t){var r=n;return r instanceof bt&&(r=r.value()),c(t,function(n,t){return t.func.apply(t.thisArg,f([n],t.args))},r)}function te(n){return re(n)}function re(n,t){for(var r=-1,e=n.length;++r<e;)var u=u?f(nr(u,n[r],t),nr(n[r],u,t)):n[r];return u&&u.length?Yr(u,t):[]}function ee(n,t,r){var e=0,u=n?n.length:e;if("number"==typeof t&&t===t&&On>=u){for(;u>e;){var i=e+u>>>1,o=n[i];(r?t>=o:t>o)&&null!==o?e=i+1:u=i}return u}return ue(n,t,_a,r)}function ue(n,t,r,e){t=r(t);for(var u=0,i=n?n.length:0,o=t!==t,a=null===t,f=t===X;i>u;){var c=ff((u+i)/2),l=r(n[c]),s=l!==X,p=l===l;if(o)var h=p||e;else h=a?p&&s&&(e||null!=l):f?p&&(e||s):null==l?!1:e?t>=l:t>l;h?u=c+1:i=c}return pf(i,An)}function ie(n){var t=n.constructor,r=new t(n.byteLength),e=new Ya(r);return e.set(new Ya(n)),r}function oe(t){var r=t.constructor;return c(N(t),n,new r)}function ae(n){var t=n.constructor,r=new t(n.source,_t.exec(n));return r.lastIndex=n.lastIndex,r}function fe(n){var r=n.constructor;return c(M(n),t,new r)}function ce(n,t){var r=n.buffer,e=n.constructor;return new e(t?ie(r):r,n.byteOffset,n.length)}function le(n,t,r){for(var e=r.length,u=-1,i=sf(n.length-e,0),o=-1,a=t.length,f=Array(a+i);++o<a;)f[o]=t[o];for(;++u<e;)f[r[u]]=n[u];for(;i--;)f[o++]=n[u++];return f}function se(n,t,r){for(var e=-1,u=r.length,i=-1,o=sf(n.length-u,0),a=-1,f=t.length,c=Array(o+f);++i<o;)c[i]=n[i];for(var l=i;++a<f;)c[l+a]=t[a];for(;++e<u;)c[l+r[e]]=n[i++];return c}function pe(n,t){return function(r,e){var u=t?t():{};if(e=We(e),vc(r))for(var i=-1,o=r.length;++i<o;){var a=r[i];n(u,a,e(a),r)}else Of(r,function(t,r,i){n(u,t,e(t),i)});return u}}function he(n){return Oi(function(t,r){var e=-1,u=null==t?0:r.length,i=u>1?r[u-1]:X,o=u>2?r[2]:X;for(i="function"==typeof i?(u--,i):X,o&&Me(r[0],r[1],o)&&(i=3>u?X:i,u=1),t=Object(t);++e<u;){var a=r[e];a&&n(t,a,i)}return t})}function _e(n,t){return function(r,e){if(null==r)return r;if(!zi(r))return n(r,e);for(var u=r.length,i=t?u:-1,o=Object(r);(t?i--:++i<u)&&e(o[i],i,o)!==!1;);return r}}function ve(n){return function(t,r,e){for(var u=Object(t),i=e(t),o=i.length,a=n?o:-1;n?a--:++a<o;){var f=i[a];if(r(u[f],f,u)===!1)break}return t}}function ge(n,t){function r(){var u=this&&this!==br&&this instanceof r?e:n;return u.apply(t,arguments)}var e=me(n);return r}function ye(n){return function(t){t=go(t);var r=tr.test(t)?Z(t):X,e=r?r[0]:t.charAt(0),u=r?r.slice(1).join(""):t.slice(1);return e[n]()+u}}function de(n){return function(t){return c(pa(Go(t)),n,"")}}function me(n){return function(){var t=arguments;switch(t.length){case 0:return new n;case 1:return new n(t[0]);case 2:return new n(t[0],t[1]);case 3:return new n(t[0],t[1],t[2]);case 4:return new n(t[0],t[1],t[2],t[3]);case 5:return new n(t[0],t[1],t[2],t[3],t[4]);case 6:return new n(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new n(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var r=Af(n.prototype),e=n.apply(r,t);return Ji(e)?e:r}}function we(n){return function(){for(var t,r=arguments.length,e=n?r:-1,u=0,i=Array(r);n?e--:++e<r;){var o=i[u++]=arguments[e];if("function"!=typeof o)throw new Fa(dn);!t&&yt.prototype.thru&&"wrapper"==Se(o)&&(t=new yt([],!0))}for(e=t?-1:r;++e<r;){o=i[e];var a=Se(o),f="wrapper"==a?Cf(o):X;t=f&&Ke(f[0])&&f[1]==(on|tn|en|an)&&!f[4].length&&1==f[9]?t[Se(f[0])].apply(t,f[3]):1==o.length&&Ke(o)?t[a]():t.thru(o)}return function(){var n=arguments,e=n[0];if(t&&1==n.length&&vc(e)&&e.length>=vn)return t.plant(e).value();for(var u=0,o=r?i[u].apply(this,n):e;++u<r;)o=i[u].call(this,o);return o}}}function be(n,t,r,e,u,i,o,a,f,c){function l(){for(var m=arguments.length,w=m,b=Array(m);w--;)b[w]=arguments[w];if(e&&(b=le(b,e,u)),i&&(b=se(b,i,o)),_||g){var x=l.placeholder,j=D(b,x);if(m-=j.length,c>m){var A=a?I(a):X,O=sf(c-m,0),R=_?j:X,k=_?X:j,E=_?b:X,C=_?X:b;t|=_?en:un,t&=~(_?un:en),v||(t&=~(H|Q));var S=[n,t,r,E,R,C,k,A,f,O],W=be.apply(X,S);return Ke(n)&&Wf(W,S),W.placeholder=x,W}}var L=p?r:this,U=h?L[n]:n;return a?b=He(b,a):y&&b.length>1&&b.reverse(),s&&f<b.length&&(b.length=f),this&&this!==br&&this instanceof l&&(U=d||me(n)),U.apply(L,b)}var s=t&on,p=t&H,h=t&Q,_=t&tn,v=t&nn,g=t&rn,y=t&fn,d=h?X:me(n);return l}function xe(n){return Oi(function(t){return t=a(pr(t),We()),Oi(function(r){var e=this;return n(t,function(n){return n.apply(e,r)})})})}function je(n){return Oi(function(t,r){r=a(pr(r),We());var e=r.length;return Oi(function(u){for(var i=-1,o=pf(u.length,e),a=I(u);++i<o;)a[i]=r[i].apply(this,n(u[i],i,u));return t.apply(this,a)})})}function Ae(n,t,r){t=ho(t);var e=P(n);if(!t||e>=t)return"";var u=t-e;r=r===X?" ":r+"";var i=ra(r,af(u/P(r)));return tr.test(r)?Z(i).slice(0,u).join(""):i.slice(0,u)}function Oe(n,t,r,e){function u(){for(var t=-1,a=arguments.length,f=-1,c=e.length,l=Array(c+a);++f<c;)l[f]=e[f];for(;a--;)l[f++]=arguments[++t];var s=this&&this!==br&&this instanceof u?o:n;return s.apply(i?r:this,l)}var i=t&H,o=me(n);return u}function Re(n){var t=$a[n];return function(n,r){if(r=r?ho(r):0){var e=(+n+"e").split("e"),u=t(e[0]+"e"+(+e[1]+r));return e=(u+"e").split("e"),+(e[0]+"e"+(e[1]-r))}return t(n)}}function ke(n,t,r,e,u,i,o,a){var f=t&Q;if(!f&&"function"!=typeof n)throw new Fa(dn);var c=e?e.length:0;if(c||(t&=~(en|un),e=u=X),c-=u?u.length:0,t&un){var l=e,s=u;e=u=X}o=null==o?o:sf(ho(o),0),a=null==a?a:ho(a);var p=f?X:Cf(n),h=[n,t,r,e,u,l,s,i,o,a];if(p&&(Je(h,p),t=h[1],a=h[9]),h[9]=null==a?f?0:n.length:sf(a-c,0),t==H)var _=ge(h[0],h[2]);else _=t!=en&&t!=(H|en)||h[4].length?be.apply(X,h):Oe.apply(X,h);var v=p?Ef:Wf;return v(_,h)}function Ie(n,t,r,e,u,i){var o=-1,a=u&ln,f=u&cn,c=n.length,l=t.length;if(c!=l&&!(a&&l>c))return!1;for(;++o<c;){var p=n[o],h=t[o];if(e)var _=a?e(h,p,o,t,n,i):e(p,h,o,n,t,i);if(_!==X){if(_)continue;return!1}if(f){if(!s(t,function(n){return p===n||r(p,n,e,u,i)}))return!1}else if(p!==h&&!r(p,h,e,u,i))return!1}return!0}function Ee(n,t,r,e,u,i){switch(r){case En:case Cn:return+n==+t;case Sn:return n.name==t.name&&n.message==t.message;case Bn:return n!=+n?t!=+t:n==+t;case zn:case qn:return n==t+"";case Un:var o=N;case Fn:var a=i&ln;return o||(o=M),(a||n.size==t.size)&&e(o(n),o(t),u,i|cn)}return!1}function Ce(n,t,r,e,u,i){var o=u&ln,a=u&cn,f=Co(n),c=f.length,l=Co(t),s=l.length;if(c!=s&&!o)return!1;for(var p=c;p--;){var h=f[p];if(!(o?h in t:dr(t,h))||!a&&h!=l[p])return!1}for(var _=o;++p<c;){h=f[p];var v=n[h],g=t[h];if(e)var y=o?e(g,v,h,t,n,i):e(v,g,h,n,t,i);if(!(y===X?v===g||r(v,g,e,u,i):y))return!1;_||(_="constructor"==h)}if(!_){var d=n.constructor,m=t.constructor;if(d!=m&&"constructor"in n&&"constructor"in t&&!("function"==typeof d&&d instanceof d&&"function"==typeof m&&m instanceof m))return!1}return!0}function Se(n){for(var t=n.name+"",r=jf[t],e=r?r.length:0;e--;){var u=r[e],i=u.func;if(null==i||i==n)return u.name}return t}function We(){var n=q.iteratee||va;return n=n===va?kr:n,arguments.length?n(arguments[0],arguments[1]):n}function Le(n){for(var t=Bo(n),r=t.length;r--;)t[r][2]=Ge(t[r][1]);return t}function Ue(n,t){var r=null==n?X:n[t];return no(r)?r:X}function Be(n){return Ka.call(n)}function $e(n,t,r){for(var e=-1,u=r.length;++e<u;){var i=r[e],o=i.size;switch(i.type){case"drop":n+=o;break;case"dropRight":t-=o;break;case"take":t=pf(t,n+o);break;case"takeRight":n=sf(n,t-o)}}return{start:n,end:t}}function ze(n,t,r){if(null==n)return!1;var e=r(n,t);return e||Pe(t)||(t=Jr(t),n=Ye(n,t),null!=n&&(t=yu(t),e=r(n,t))),e||F(n&&n.length)&&z(t,n.length)&&(vc(n)||ao(n)||$i(n))}function Fe(n){var t=n.length,r=new n.constructor(t);return t&&"string"==typeof n[0]&&Ma.call(n,"index")&&(r.index=n.index,r.input=n.input),r}function qe(n){var t=n.constructor;return"function"==typeof t&&t instanceof t?new t:{}}function Te(n,t,r){var e=n.constructor;switch(t){case Nn:return ie(n);case En:case Cn:return new e(+n);case Dn:case Mn:case Pn:case Zn:case Kn:case Vn:case Gn:case Jn:case Xn:return ce(n,r);case Un:return oe(n);case Bn:case qn:return new e(n);case Fn:return fe(n);case zn:return ae(n)}}function Ne(n){var t=n?n.length:0;return t=t&&F(t)&&(vc(n)||ao(n)||$i(n))&&t||0,b(t,String)}function De(n,t,r){Pe(t,n)||(t=Jr(t),n=Ye(n,t),t=yu(t));var e=null==n?n:n[t];return null==e?X:e.apply(n,r)}function Me(n,t,r){if(!Ji(r))return!1;var e=typeof t;if("number"==e?zi(r)&&z(t,r.length):"string"==e&&t in r){var u=r[t];return n===n?n===u:u!==u}return!1}function Pe(n,t){return"number"==typeof n?!0:!vc(n)&&(ft.test(n)||!at.test(n)||null!=t&&n in Object(t))}function Ze(n){var t=typeof n;return"number"==t||"boolean"==t||"string"==t&&"__proto__"!==n||null==n}function Ke(n){var t=Se(n),r=q[t];if("function"!=typeof r||!(t in bt.prototype))return!1;if(n===r)return!0;var e=Cf(r);return!!e&&n===e[0]}function Ve(n){var t=n&&n.constructor,r="function"==typeof t&&t.prototype||Ta;return n===r}function Ge(n){return n===n&&!Ji(n)}function Je(n,t){var r=n[1],e=t[1],u=r|e,i=on>u,o=e==on&&r==tn||e==on&&r==an&&n[7].length<=t[8]||e==(on|an)&&t[7].length<=t[8]&&r==tn;if(!i&&!o)return n;e&H&&(n[2]=t[2],u|=r&H?0:nn);var a=t[3];if(a){var f=n[3];n[3]=f?le(f,a,t[4]):I(a),n[4]=f?D(n[3],Rn):I(t[4])}return a=t[5],a&&(f=n[5],n[5]=f?se(f,a,t[6]):I(a),n[6]=f?D(n[5],Rn):I(t[6])),a=t[7],a&&(n[7]=I(a)),e&on&&(n[8]=null==n[8]?t[8]:pf(n[8],t[8])),null==n[9]&&(n[9]=t[9]),n[0]=t[0],n[1]=u,n}function Xe(n,t,r,e,u,i){return Ji(n)&&(i.set(t,n),Lr(n,t,Xe,i)),n===X?Xt(t):n}function Ye(n,t){return 1==t.length?n:Ro(n,Pr(t,0,-1))}function He(n,t){for(var r=n.length,e=pf(t.length,r),u=I(n);e--;){var i=t[e];n[e]=z(i,r)?u[i]:X}return n}function Qe(n){var t=[];return go(n).replace(ct,function(n,r,e,u){t.push(e?u.replace(pt,"$1"):r||n)}),t}function nu(n){return Fi(n)?n:[]}function tu(n){return"function"==typeof n?n:_a}function ru(n){if(n instanceof bt)return n.clone();var t=new yt(n.__wrapped__,n.__chain__);return t.__actions__=I(n.__actions__),t.__index__=n.__index__,t.__values__=n.__values__,t}function eu(n,t){t=sf(ho(t),0);var r=n?n.length:0;if(!r||1>t)return[];for(var e=0,u=-1,i=Array(af(r/t));r>e;)i[++u]=Pr(n,e,e+=t);return i}function uu(n){for(var t=-1,r=n?n.length:0,e=-1,u=[];++t<r;){var i=n[t];i&&(u[++e]=i)}return u}function iu(n,t,r){return n&&n.length?(t=r||t===X?1:t,Pr(n,0>t?0:t)):[]}function ou(n,t,r){var e=n?n.length:0;return e?(t=r||t===X?1:ho(t),t=e-t,Pr(n,0,0>t?0:t)):[]}function au(n,t){return n&&n.length?Qr(n,We(t,3),!0,!0):[]}function fu(n,t){return n&&n.length?Qr(n,We(t,3),!0):[]}function cu(n,t,r,e){var u=n?n.length:0;return u?(r&&"number"!=typeof r&&Me(n,t,r)&&(r=0,e=u),lr(n,t,r,e)):[]}function lu(n,t){return n&&n.length?g(n,We(t,3)):-1}function su(n,t){return n&&n.length?g(n,We(t,3),!0):-1}function pu(n){var t=n?n.length:0;return t?pr(n):[]}function hu(n){var t=n?n.length:0;return t?pr(n,!0):[]}function _u(n){return n?n[0]:X}function vu(n,t,r){var e=n?n.length:0;return e?(r=r?ho(r):0,0>r&&(r=sf(e+r,0)),y(n,t,r)):-1}function gu(n){return ou(n,1)}function yu(n){var t=n?n.length:0;return t?n[t-1]:X}function du(n,t,r){var e=n?n.length:0;if(!e)return-1;var u=e;if(r!==X&&(u=ho(r),u=(0>u?sf(e+u,0):pf(u,e-1))+1),t!==t)return B(n,u,!0);for(;u--;)if(n[u]===t)return u;return-1}function mu(n,t){return n&&n.length&&t&&t.length?qr(n,t):n}function wu(n,t,r){return n&&n.length&&t&&t.length?Tr(n,t,We(r)):n}function bu(n,t){var r=[];if(!n||!n.length)return r;var e=-1,u=[],i=n.length;for(t=We(t,3);++e<i;){var o=n[e];t(o,e,n)&&(r.push(o),u.push(e))}return Nr(n,u),r}function xu(n){return n?vf.call(n):n}function ju(n,t,r){var e=n?n.length:0;return e?(r&&"number"!=typeof r&&Me(n,t,r)&&(t=0,r=e),Pr(n,t,r)):[]}function Au(n,t){return ee(n,t)}function Ou(n,t,r){return ue(n,t,We(r))}function Ru(n,t){var r=n?n.length:0;if(r){var e=ee(n,t);if(r>e&&(t===t?t===n[e]:n[e]!==n[e]))return e}return-1}function ku(n,t){return ee(n,t,!0)}function Iu(n,t,r){return ue(n,t,We(r),!0)}function Eu(n,t){var r=n?n.length:0;if(r){var e=ee(n,t,!0)-1,u=n[e];if(t===t?t===u:u!==u)return e}return-1}function Cu(n){return n&&n.length?Vr(n):[]}function Su(n,t){return n&&n.length?Gr(n,We(t)):[]}function Wu(n){return iu(n,1)}function Lu(n,t,r){return n&&n.length?(t=r||t===X?1:t,Pr(n,0,0>t?0:t)):[]}function Uu(n,t,r){var e=n?n.length:0;return e?(t=r||t===X?1:ho(t),t=e-t,Pr(n,0>t?0:t)):[]}function Bu(n,t){return n&&n.length?Qr(n,We(t,3),!1,!0):[]}function $u(n,t){return n&&n.length?Qr(n,We(t,3)):[]}function zu(n){return n&&n.length?Xr(n):[]}function Fu(n,t){return n&&n.length?Yr(n,We(t)):[]}function qu(n){if(!n||!n.length)return[];var t=0;return n=o(n,function(n){return Fi(n)?(t=sf(n.length,t),!0):void 0}),b(t,function(t){return a(n,zr(t))})}function Tu(n,t){if(!n||!n.length)return[];var r=qu(n);return null==t?r:a(r,function(n){return c(n,t,X,!0)})}function Nu(n,t){var r=-1,e=n?n.length:0,u={};for(!e||t||vc(n[0])||(t=[]);++r<e;){var i=n[r];t?u[i]=t[r]:i&&(u[i[0]]=i[1])}return u}function Du(n){var t=q(n);return t.__chain__=!0,t}function Mu(n,t){return t(n),n}function Pu(n,t){return t(n)}function Zu(){return Du(this)}function Ku(){return new yt(this.value(),this.__chain__)}function Vu(){this.__values__===X&&(this.__values__=po(this.value()));var n=this.__index__>=this.__values__.length,t=n?X:this.__values__[this.__index__++];return{done:n,value:t}}function Gu(){return this}function Ju(n){for(var t,r=this;r instanceof Tn;){var e=ru(r);e.__index__=0,e.__values__=X,t?u.__wrapped__=e:t=e;var u=e;r=r.__wrapped__}return u.__wrapped__=n,t}function Xu(){var n=this.__wrapped__;if(n instanceof bt){var t=n;return this.__actions__.length&&(t=new bt(this)),t=t.reverse(),t.__actions__.push({func:Pu,args:[xu],thisArg:X}),new yt(t,this.__chain__)}return this.thru(xu)}function Yu(){return ne(this.__wrapped__,this.__actions__)}function Hu(n,t,r){var e=vc(n)?i:cr;return r&&Me(n,t,r)&&(t=X),e(n,We(t,3))}function Qu(n,t){var r=vc(n)?o:sr;return r(n,We(t,3))}function ni(n,t){if(t=We(t,3),vc(n)){var r=g(n,t);return r>-1?n[r]:X}return v(n,t,Of)}function ti(n,t){if(t=We(t,3),vc(n)){var r=g(n,t,!0);return r>-1?n[r]:X}return v(n,t,Rf)}function ri(n,t){return"function"==typeof t&&vc(n)?e(n,t):Of(n,tu(t))}function ei(n,t){return"function"==typeof t&&vc(n)?u(n,t):Rf(n,tu(t))}function ui(n,t,r,e){n=zi(n)?n:Do(n),r=r&&!e?ho(r):0;var u=n.length;return 0>r&&(r=sf(u+r,0)),ao(n)?u>=r&&n.indexOf(t,r)>-1:!!u&&y(n,t,r)>-1}function ii(n,t){var r=vc(n)?a:Cr;return r(n,We(t,3))}function oi(n,t,r){var e=arguments.length<3;return"function"==typeof t&&vc(n)?c(n,t,r,e):d(n,We(t,4),r,e,Of)}function ai(n,t,r){var e=arguments.length<3;return"function"==typeof t&&vc(n)?l(n,t,r,e):d(n,We(t,4),r,e,Rf)}function fi(n,t){var r=vc(n)?o:sr;return t=We(t,3),r(n,function(n,r,e){return!t(n,r,e)})}function ci(n){var t=zi(n)?n:Do(n),r=t.length;return r>0?t[Dr(0,r-1)]:X}function li(n,t){var r=-1,e=po(n),u=e.length,i=u-1;for(t=Po(ho(t),0,u);++r<t;){var o=Dr(r,i),a=e[o];e[o]=e[r],e[r]=a}return e.length=t,e}function si(n){return li(n,jn)}function pi(n){if(null==n)return 0;if(zi(n)){var t=n.length;return t&&ao(n)?P(n):t}return Co(n).length}function hi(n,t,r){var e=vc(n)?s:Zr;return r&&Me(n,t,r)&&(t=X),e(n,We(t,3))}function _i(n,t,r,e){return null==n?[]:(vc(t)||(t=null==t?[]:[t]),r=e?X:r,vc(r)||(r=null==r?[]:[r]),Kr(n,t,r))}function vi(n,t){if("function"!=typeof t)throw new Fa(dn);return n=ho(n),function(){return--n<1?t.apply(this,arguments):void 0}}function gi(n,t,r){return t=r?X:t,t=n&&null==t?n.length:t,ke(n,on,X,X,X,X,t)}function yi(n,t){var r;if("function"!=typeof t)throw new Fa(dn);return n=ho(n),function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=X),r}}function di(n,t,r){t=r?X:t;var e=ke(n,tn,X,X,X,X,X,t);return e.placeholder=di.placeholder,e}function mi(n,t,r){t=r?X:t;var e=ke(n,rn,X,X,X,X,X,t);return e.placeholder=mi.placeholder,e}function wi(n,t,r){function e(){_&&Ha(_),l&&Ha(l),g=0,c=l=h=_=v=X}function u(t,r){r&&Ha(r),l=_=v=X,t&&(g=Qf(),s=n.apply(h,c),_||l||(c=h=X))}function i(){var n=t-(Qf()-p);0>=n||n>t?u(v,l):_=uf(i,n)}function o(){return(_&&v||l&&m)&&(s=n.apply(h,c)),e(),s}function a(){u(m,_)}function f(){if(c=arguments,p=Qf(),h=this,v=m&&(_||!y),d===!1)var r=y&&!_;else{l||y||(g=p);var e=d-(p-g),u=0>=e||e>d;u?(l&&(l=Ha(l)),g=p,s=n.apply(h,c)):l||(l=uf(a,e))}return u&&_?_=Ha(_):_||t===d||(_=uf(i,t)),r&&(u=!0,s=n.apply(h,c)),!u||_||l||(c=h=X),s}var c,l,s,p,h,_,v,g=0,y=!1,d=!1,m=!0;if("function"!=typeof n)throw new Fa(dn);return t=0>t?0:+t||0,Ji(r)&&(y=!!r.leading,d="maxWait"in r&&sf(+r.maxWait||0,t),m="trailing"in r?!!r.trailing:m),f.cancel=e,f.flush=o,f}function bi(n){return ke(n,fn)}function xi(n,t){if("function"!=typeof n||t&&"function"!=typeof t)throw new Fa(dn);var r=function(){var e=arguments,u=t?t.apply(this,e):e[0],i=r.cache;if(i.has(u))return i.get(u);var o=n.apply(this,e);return r.cache=i.set(u,o),o};return r.cache=new xi.Cache,r}function ji(n){if("function"!=typeof n)throw new Fa(dn);return function(){return!n.apply(this,arguments)}}function Ai(n){return yi(2,n)}function Oi(n,t){if("function"!=typeof n)throw new Fa(dn);return t=sf(t===X?n.length-1:ho(t),0),function(){for(var r=arguments,e=-1,u=sf(r.length-t,0),i=Array(u);++e<u;)i[e]=r[t+e];switch(t){case 0:return n.call(this,i);case 1:return n.call(this,r[0],i);case 2:return n.call(this,r[0],r[1],i)}var o=Array(t+1);for(e=-1;++e<t;)o[e]=r[e];return o[t]=i,n.apply(this,o)}}function Ri(n){if("function"!=typeof n)throw new Fa(dn);return function(t){return n.apply(this,t)}}function ki(n,t,r){var e=!0,u=!0;if("function"!=typeof n)throw new Fa(dn);return Ji(r)&&(e="leading"in r?!!r.leading:e,u="trailing"in r?!!r.trailing:u),wi(n,t,{leading:e,maxWait:+t,trailing:u})}function Ii(n,t){return t=null==t?_a:t,pc(t,n)}function Ei(n){return Xt(n)}function Ci(n,t){return Xt(n,!1,t)}function Si(n){return Xt(n,!0)}function Wi(n,t){return Xt(n,!0,t)}function Li(n,t){return n===t||n!==n&&t!==t}function Ui(n,t){return n>t}function Bi(n,t){return n>=t}function $i(n){return Fi(n)&&Ma.call(n,"callee")&&(!ef.call(n,"callee")||Ka.call(n)==kn)}function zi(n){return null!=n&&!("function"==typeof n&&Vi(n))&&F(Sf(n))}function Fi(n){return Xi(n)&&zi(n)}function qi(n){return n===!0||n===!1||Xi(n)&&Ka.call(n)==En}function Ti(n){return Xi(n)&&Ka.call(n)==Cn}function Ni(n){return!!n&&1===n.nodeType&&Xi(n)&&!uo(n)}function Di(n){return!Xi(n)||Vi(n.splice)?!pi(n):!Co(n).length}function Mi(n,t){return Ar(n,t)}function Pi(n,t,r){r="function"==typeof r?r:X;var e=r?r(n,t):X;return e===X?Ar(n,t,r):!!e}function Zi(n){return Xi(n)&&"string"==typeof n.message&&Ka.call(n)==Sn}function Ki(n){return"number"==typeof n&&cf(n)}function Vi(n){var t=Ji(n)?Ka.call(n):"";return t==Wn||t==Ln}function Gi(n){return"number"==typeof n&&n==ho(n)}function Ji(n){var t=typeof n;return!!n&&("object"==t||"function"==t);
}function Xi(n){return!!n&&"object"==typeof n}function Yi(n,t){return n===t||Rr(n,t,Le(t))}function Hi(n,t,r){return r="function"==typeof r?r:X,Rr(n,t,Le(t),r)}function Qi(n){return eo(n)&&n!=+n}function no(n){return null==n?!1:Vi(n)?Ga.test(Da.call(n)):Xi(n)&&($(n)?Ga:gt).test(n)}function to(n){return null===n}function ro(n){return null==n}function eo(n){return"number"==typeof n||Xi(n)&&Ka.call(n)==Bn}function uo(n){if(!Xi(n)||Ka.call(n)!=$n||$(n))return!1;var t=Ta;if("function"==typeof n.constructor&&(t=nf(n)),null===t)return!0;var r=t.constructor;return"function"==typeof r&&r instanceof r&&Da.call(r)==Za}function io(n){return Ji(n)&&Ka.call(n)==zn}function oo(n){return Gi(n)&&n>=-bn&&bn>=n}function ao(n){return"string"==typeof n||!vc(n)&&Xi(n)&&Ka.call(n)==qn}function fo(n){return Xi(n)&&F(n.length)&&!!ar[Ka.call(n)]}function co(n){return n===X}function lo(n,t){return t>n}function so(n,t){return t>=n}function po(n){if(!n)return[];if(zi(n))return ao(n)?Z(n):I(n);if(tf&&n[tf])return T(n[tf]());var t=Be(n),r=t==Un?N:t==Fn?M:Do;return r(n)}function ho(n){if(n===wn||n===-wn)return(0>n?-1:1)*xn;n=+n;var t=n%1;return n===n?t?n-t:n:0}function _o(n){return E(n,So(n))}function vo(n){return Po(ho(n),-bn,bn)}function go(n){return"string"==typeof n?n:null==n?"":n+""}function yo(n,t){var r=Af(n);return t?Gt(r,t):r}function mo(n,t){return v(n,We(t,3),_r,!0)}function wo(n,t){return v(n,We(t,3),vr,!0)}function bo(n,t){return null==n?n:kf(n,tu(t),So)}function xo(n,t){return null==n?n:If(n,tu(t),So)}function jo(n,t){return n&&_r(n,tu(t))}function Ao(n,t){return n&&vr(n,tu(t))}function Oo(n){return null==n?[]:gr(n,So(n))}function Ro(n,t,r){var e=null==n?X:yr(n,t);return e===X?r:e}function ko(n,t){return ze(n,t,dr)}function Io(n,t){return ze(n,t,mr)}function Eo(n,t,r){return c(Co(n),function(e,u){var i=n[u];return t&&!r?Ma.call(e,i)?e[i].push(u):e[i]=[u]:e[i]=u,e},{})}function Co(n){var t=Ve(n);if(!t&&!zi(n))return Ir(n);var r=Ne(n),e=r.length,u=!!e;for(var i in n)!dr(n,i)||u&&z(i,e)||t&&"constructor"==i||r.push(i);return r}function So(n){for(var t=-1,r=Ve(n),e=Er(n),u=e.length,i=Ne(n),o=i.length,a=!!o;++t<u;){var f=e[t];a&&z(f,o)||"constructor"==f&&(r||!Ma.call(n,f))||i.push(f)}return i}function Wo(n,t){var r={};return t=We(t,3),_r(n,function(n,e,u){r[t(n,e,u)]=n}),r}function Lo(n,t){var r={};return t=We(t,3),_r(n,function(n,e,u){r[e]=t(n,e,u)}),r}function Uo(n,t){return t=We(t),$r(n,function(n){return!t(n)})}function Bo(n){return a(Co(n),function(t){return[t,n[t]]})}function $o(n,t){return null==n?{}:$r(n,We(t))}function zo(n,t,r){if(Pe(t,n))e=null==n?X:n[t];else{t=Jr(t);var e=Ro(n,t);n=Ye(n,t)}return e===X&&(e=r),Vi(e)?e.call(n):e}function Fo(n,t,r){return null==n?n:Mr(n,t,r)}function qo(n,t,r,e){return e="function"==typeof e?e:X,null==n?n:Mr(n,t,r,e)}function To(n,t,r){var u=vc(n)||fo(n);if(t=We(t,4),null==r)if(u||Ji(n)){var i=n.constructor;r=u?vc(n)?new i:[]:Af(Vi(i)?i.prototype:X)}else r={};return(u?e:_r)(n,function(n,e,u){return t(r,n,e,u)}),r}function No(n,t){return null==n?!0:Hr(n,t)}function Do(n){return n?x(n,Co(n)):[]}function Mo(n){return null==n?x(n,So(n)):[]}function Po(n,t,r){return r===X&&(r=t,t=X),r!==X&&(r=+r,n=pf(n,r===r?r:0)),t!==X&&(t=+t,n=sf(n,t===t?t:0)),n}function Zo(n,t,r){return t=+t||0,r===X?(r=t,t=0):r=+r||0,n>=pf(t,r)&&n<sf(t,r)}function Ko(n,t,r){r&&Me(n,t,r)&&(t=r=X);var e=n===X,u=t===X;if(r===X&&(u&&"boolean"==typeof n?(r=n,n=1):"boolean"==typeof t&&(r=t,u=!0)),e&&u&&(t=1,u=!1),n=+n||0,u?(t=n,n=0):t=+t||0,r||n%1||t%1){var i=_f();return pf(n+i*(t-n+rf("1e-"+((i+"").length-1))),t)}return Dr(n,t)}function Vo(n){return Sc(go(n).toLowerCase())}function Go(n){return n=go(n),n&&n.replace(dt,S).replace(Qt,"")}function Jo(n,t,r){n=go(n),t="string"==typeof t?t:t+"";var e=n.length;return r=r===X?e:Po(ho(r),0,e),r-=t.length,r>=0&&n.indexOf(t,r)==r}function Xo(n){return n=go(n),n&&et.test(n)?n.replace(tt,W):n}function Yo(n){return n=go(n),n&&st.test(n)?n.replace(lt,"\\$&"):n}function Ho(n,t,r){n=go(n),t=ho(t);var e=P(n);if(!t||e>=t)return n;var u=(t-e)/2,i=ff(u),o=af(u);return Ae("",i,r)+n+Ae("",o,r)}function Qo(n,t,r){return n=go(n),Ae(n,t,r)+n}function na(n,t,r){return n=go(n),n+Ae(n,t,r)}function ta(n,t,r){return r||null==t?t=0:t&&(t=+t),n=aa(n),hf(n,t||(vt.test(n)?16:10))}function ra(n,t){n=go(n),t=ho(t);var r="";if(!n||1>t||t>bn)return r;do t%2&&(r+=n),t=ff(t/2),n+=n;while(t);return r}function ea(n,t,r){return n=go(n),r=Po(ho(r),0,n.length),n.lastIndexOf(t,r)==r}function ua(n,t,r){var e=q.templateSettings;r&&Me(n,t,r)&&(t=r=X),n=go(n),t=xc({},r||t,e,U);var u,i,o=xc({},t.imports,e.imports,U),a=Co(o),f=x(o,a),c=0,l=t.interpolate||mt,s="__p += '",p=za((t.escape||mt).source+"|"+l.source+"|"+(l===ot?ht:mt).source+"|"+(t.evaluate||mt).source+"|$","g"),h="//# sourceURL="+("sourceURL"in t?t.sourceURL:"lodash.templateSources["+ ++or+"]")+"\n";n.replace(p,function(t,r,e,o,a,f){return e||(e=o),s+=n.slice(c,f).replace(wt,L),r&&(u=!0,s+="' +\n__e("+r+") +\n'"),a&&(i=!0,s+="';\n"+a+";\n__p += '"),e&&(s+="' +\n((__t = ("+e+")) == null ? '' : __t) +\n'"),c=f+t.length,t}),s+="';\n";var _=t.variable;_||(s="with (obj) {\n"+s+"\n}\n"),s=(i?s.replace(Yn,""):s).replace(Hn,"$1").replace(Qn,"$1;"),s="function("+(_||"obj")+") {\n"+(_?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(u?", __e = _.escape":"")+(i?", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n":";\n")+s+"return __p\n}";var v=Bc(function(){return Function(a,h+"return "+s).apply(X,f)});if(v.source=s,Zi(v))throw v;return v}function ia(n){return go(n).toLowerCase()}function oa(n){return go(n).toUpperCase()}function aa(n,t,r){if(n=go(n),!n)return n;if(r||t===X)return n.slice(K(n),V(n)+1);if(t+="",!t)return n;var e=Z(n),u=Z(t);return e.slice(j(e,u),A(e,u)+1).join("")}function fa(n,t,r){if(n=go(n),!n)return n;if(r||t===X)return n.slice(K(n));if(t+="",!t)return n;var e=Z(n);return e.slice(j(e,Z(t))).join("")}function ca(n,t,r){if(n=go(n),!n)return n;if(r||t===X)return n.slice(0,V(n)+1);if(t+="",!t)return n;var e=Z(n);return e.slice(0,A(e,Z(t))+1).join("")}function la(n,t){var r=sn,e=pn;if(Ji(t)){var u="separator"in t?t.separator:u;r="length"in t?ho(t.length):r,e="omission"in t?go(t.omission):e}n=go(n);var i=n.length;if(tr.test(n)){var o=Z(n);i=o.length}if(r>=i)return n;var a=r-P(e);if(1>a)return e;var f=o?o.slice(0,a).join(""):n.slice(0,a);if(u===X)return f+e;if(o&&(a+=f.length-a),io(u)){if(n.slice(a).search(u)){var c,l=f;for(u.global||(u=za(u.source,go(_t.exec(u))+"g")),u.lastIndex=0;c=u.exec(l);)var s=c.index;f=f.slice(0,s===X?a:s)}}else if(n.indexOf(u,a)!=a){var p=f.lastIndexOf(u);p>-1&&(f=f.slice(0,p))}return f+e}function sa(n){return n=go(n),n&&rt.test(n)?n.replace(nt,G):n}function pa(n,t,r){return n=go(n),t=r?X:t,t===X&&(t=ur.test(n)?er:rr),n.match(t)||[]}function ha(n){return function(){return n}}function _a(n){return n}function va(n){return Xi(n)&&!vc(n)?ga(n):kr(n)}function ga(n){return Sr(Xt(n,!0))}function ya(n,t){return Wr(n,Xt(t,!0))}function da(n,t,r){var u=Co(t),i=gr(t,u);null!=r||Ji(t)&&(i.length||!u.length)||(r=t,t=n,n=this,i=gr(t,Co(t)));var o=Ji(r)&&"chain"in r?r.chain:!0,a=Vi(n);return e(i,function(r){var e=t[r];n[r]=e,a&&(n.prototype[r]=function(){var t=this.__chain__;if(o||t){var r=n(this.__wrapped__),u=r.__actions__=I(this.__actions__);return u.push({func:e,args:arguments,thisArg:n}),r.__chain__=t,r}return e.apply(n,f([this.value()],arguments))})}),n}function ma(){return br._=Va,this}function wa(){}function ba(n){return Pe(n)?zr(n):Fr(n)}function xa(n){return function(t){return null==n?X:yr(n,t)}}function ja(n,t,r){r&&Me(n,t,r)&&(t=r=X),n=+n,n=n===n?n:0,r=r===X?1:+r||0,t===X?(t=n,n=0):t=+t||0;var e=sf(af((t-n)/(r||1)),0);return b(e,function(t){return t?n+=r:n})}function Aa(n,t){if(n=ho(n),1>n||n>bn)return[];var r=jn,e=pf(n,jn);t=tu(t),n-=jn;for(var u=b(e,t);++r<n;)t(r);return u}function Oa(n){return vc(n)?a(n,String):Qe(n)}function Ra(n){var t=++Pa;return go(n)+t}function ka(n,t){var r;return n===n&&null!=n&&(r=n),t===t&&null!=t&&(r=r===X?t:r+t),r}function Ia(n){return n&&n.length?_(n,_a,Ui):X}function Ea(n,t){return n&&n.length?_(n,We(t),Ui):X}function Ca(n){return n&&n.length?_(n,_a,lo):X}function Sa(n,t){return n&&n.length?_(n,We(t),lo):X}function Wa(n){return n&&n.length?w(n,_a):X}function La(n,t){return n&&n.length?w(n,We(t)):X}O=O?xr.defaults({},O,xr.pick(br,ir)):br;var Ua=O.Date,Ba=O.Error,$a=O.Math,za=O.RegExp,Fa=O.TypeError,qa=O.Array.prototype,Ta=O.Object.prototype,Na=O.String.prototype,Da=O.Function.prototype.toString,Ma=Ta.hasOwnProperty,Pa=0,Za=Da.call(Object),Ka=Ta.toString,Va=br._,Ga=za("^"+Da.call(Ma).replace(lt,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Ja=O.Reflect,Xa=O.Symbol,Ya=O.Uint8Array,Ha=O.clearTimeout,Qa=Ja?Ja.enumerate:X,nf=Object.getPrototypeOf,tf="symbol"==typeof(tf=Xa&&Xa.iterator)?tf:X,rf=O.parseFloat,ef=($a.pow,Ta.propertyIsEnumerable),uf=O.setTimeout,of=qa.splice,af=$a.ceil,ff=$a.floor,cf=O.isFinite,lf=Object.keys,sf=$a.max,pf=$a.min,hf=O.parseInt,_f=$a.random,vf=qa.reverse,gf=Ue(O,"Map"),yf=Ue(O,"Set"),df=Ue(O,"WeakMap"),mf=Ue(Object,"create"),wf=df&&new df,bf=gf?Da.call(gf):"",xf=yf?Da.call(yf):"",jf={};q.templateSettings={escape:ut,evaluate:it,interpolate:ot,variable:"",imports:{_:q}};var Af=function(){function n(){}return function(t){if(Ji(t)){n.prototype=t;var r=new n;n.prototype=X}return r||{}}}(),Of=_e(_r),Rf=_e(vr,!0),kf=ve(),If=ve(!0);Qa&&!ef.call({valueOf:1},"valueOf")&&(Er=function(n){return T(Qa(n))});var Ef=wf?function(n,t){return wf.set(n,t),n}:_a,Cf=wf?function(n){return wf.get(n)}:wa,Sf=zr("length");(gf&&Be(new gf)!=Un||yf&&Be(new yf)!=Fn)&&(Be=function(n){var t=Ka.call(n),r=t==$n?n.constructor:null,e="function"==typeof r?Da.call(r):"";return e==bf?Un:e==xf?Fn:t});var Wf=function(){var n=0,t=0;return function(r,e){var u=Qf(),i=_n-(u-t);if(t=u,i>0){if(++n>=hn)return r}else n=0;return Ef(r,e)}}(),Lf=Oi(function(n,t){return Fi(n)?Ht(n,pr(t,!1,!0)):[]}),Uf=Oi(function(n,t){var r=yu(t);return Fi(r)&&(r=X),Fi(n)?nr(n,pr(t,!1,!0),We(r)):[]}),Bf=Oi(function(n){var t=a(n,nu);return t.length&&t[0]===n[0]?wr(t):[]}),$f=Oi(function(n){var t=yu(n),r=a(n,nu);return t===yu(r)?t=X:r.pop(),r.length&&r[0]===n[0]?jr(r,We(t)):[]}),zf=Oi(mu),Ff=Oi(function(n,t){t=a(pr(t),String);var r=Jt(n,t);return Nr(n,t.sort(R)),r}),qf=Oi(function(n){return Xr(pr(n,!1,!0))}),Tf=Oi(function(n){var t=yu(n);return Fi(t)&&(t=X),Yr(pr(n,!1,!0),We(t))}),Nf=Oi(function(n,t){return Fi(n)?Ht(n,t):[]}),Df=Oi(function(n){return te(o(n,Fi))}),Mf=Oi(function(n){var t=yu(n);return Fi(t)&&(t=X),re(o(n,Fi),We(t))}),Pf=Oi(qu),Zf=Oi(function(n){var t=n.length,r=t>1?n[t-1]:X;return r="function"==typeof r?(n.pop(),r):X,Tu(n,r)}),Kf=Oi(function(n){return n=pr(n),this.thru(function(t){return r(vc(t)?t:[Object(t)],n)})}),Vf=pe(function(n,t,r){Ma.call(n,r)?++n[r]:n[r]=1}),Gf=pe(function(n,t,r){Ma.call(n,r)?n[r].push(t):n[r]=[t]}),Jf=Oi(function(n,t,r){var e=-1,u="function"==typeof t,i=Pe(t),o=zi(n)?Array(n.length):[];return Of(n,function(n){var a=u?t:i&&null!=n?n[t]:X;o[++e]=a?a.apply(n,r):De(n,t,r)}),o}),Xf=pe(function(n,t,r){n[r]=t}),Yf=pe(function(n,t,r){n[r?0:1].push(t)},function(){return[[],[]]}),Hf=Oi(function(n,t){if(null==n)return[];var r=t.length;return r>1&&Me(n,t[0],t[1])?t=[]:r>2&&Me(t[0],t[1],t[2])&&(t.length=1),Kr(n,pr(t),[])}),Qf=Ua.now,nc=Oi(function(n,t,r){var e=H;if(r.length){var u=D(r,nc.placeholder);e|=en}return ke(n,e,t,r,u)}),tc=Oi(function(n,t){return e(pr(t),function(t){n[t]=nc(n[t],n)}),n}),rc=Oi(function(n,t,r){var e=H|Q;if(r.length){var u=D(r,rc.placeholder);e|=en}return ke(t,e,n,r,u)}),ec=xe(i),uc=Oi(function(n,t){return Yt(n,1,t)}),ic=Oi(function(n,t,r){return Yt(n,t,r)}),oc=xe(s),ac=we(),fc=we(!0),cc=xe(a),lc=je(function(n){return[n]}),sc=je(function(n,t,r){return r}),pc=Oi(function(n,t){var r=D(t,pc.placeholder);return ke(n,en,X,t,r)}),hc=Oi(function(n,t){var r=D(t,hc.placeholder);return ke(n,un,X,t,r)}),_c=Oi(function(n,t){return ke(n,an,X,X,X,pr(t))}),vc=Array.isArray,gc=he(function(n,t){E(t,Co(t),n)}),yc=he(function(n,t,r){C(t,Co(t),n,r)}),dc=Oi(function(n,t){return Jt(n,pr(t))}),mc=Oi(function(n){return n.push(X,U),xc.apply(X,n)}),wc=Oi(function(n){return n.push(X,Xe),Ac.apply(X,n)}),bc=he(function(n,t){E(t,So(t),n)}),xc=he(function(n,t,r){C(t,So(t),n,r)}),jc=he(function(n,t){Lr(n,t)}),Ac=he(function(n,t,r){Lr(n,t,r)}),Oc=Oi(function(n,t){return null==n?{}:(t=a(pr(t),String),Br(n,Ht(So(n),t)))}),Rc=Oi(function(n,t){return null==n?{}:Br(n,pr(t))}),kc=de(function(n,t,r){return t=t.toLowerCase(),n+(r?Vo(t):t)}),Ic=de(function(n,t,r){return n+(r?"-":"")+t.toLowerCase()}),Ec=de(function(n,t,r){return n+(r?" ":"")+t.toLowerCase()}),Cc=ye("toLowerCase"),Sc=ye("toUpperCase"),Wc=de(function(n,t,r){return n+(r?"_":"")+t.toLowerCase()}),Lc=de(function(n,t,r){return n+(r?" ":"")+Vo(t)}),Uc=de(function(n,t,r){return n+(r?" ":"")+t.toUpperCase()}),Bc=Oi(function(n,t){try{return n.apply(X,t)}catch(r){return Zi(r)?r:new Ba(r)}}),$c=Oi(function(n,t){return function(r){return De(r,n,t)}}),zc=Oi(function(n,t){return function(r){return De(n,r,t)}}),Fc=Re("ceil"),qc=Re("floor"),Tc=Re("round");return q.prototype=Tn.prototype,yt.prototype=Af(Tn.prototype),yt.prototype.constructor=yt,bt.prototype=Af(Tn.prototype),bt.prototype.constructor=bt,Ot.prototype=mf?mf(null):Ta,Ct.prototype["delete"]=St,Ct.prototype.get=Wt,Ct.prototype.has=Lt,Ct.prototype.set=Ut,Bt.prototype.push=zt,Ft.prototype["delete"]=qt,Ft.prototype.get=Tt,Ft.prototype.has=Nt,Ft.prototype.set=Dt,xi.Cache=Ct,q.after=vi,q.ary=gi,q.assign=gc,q.assignWith=yc,q.at=dc,q.before=yi,q.bind=nc,q.bindAll=tc,q.bindKey=rc,q.chain=Du,q.chunk=eu,q.compact=uu,q.conj=ec,q.constant=ha,q.countBy=Vf,q.create=yo,q.curry=di,q.curryRight=mi,q.debounce=wi,q.defaults=mc,q.defaultsDeep=wc,q.defer=uc,q.delay=ic,q.difference=Lf,q.differenceBy=Uf,q.disj=oc,q.drop=iu,q.dropRight=ou,q.dropRightWhile=au,q.dropWhile=fu,q.extend=bc,q.extendWith=xc,q.fill=cu,q.filter=Qu,q.flatten=pu,q.flattenDeep=hu,q.flip=bi,q.flow=ac,q.flowRight=fc,q.functions=Oo,q.groupBy=Gf,q.initial=gu,q.intersection=Bf,q.intersectionBy=$f,q.invert=Eo,q.invoke=Jf,q.iteratee=va,q.juxt=cc,q.keyBy=Xf,q.keys=Co,q.keysIn=So,q.map=ii,q.mapKeys=Wo,q.mapValues=Lo,q.matches=ga,q.matchesProperty=ya,q.memoize=xi,q.merge=jc,q.mergeWith=Ac,q.method=$c,q.methodOf=zc,q.mixin=da,q.modArgs=lc,q.modArgsSet=sc,q.negate=ji,q.omit=Oc,q.omitBy=Uo,q.once=Ai,q.pairs=Bo,q.partial=pc,q.partialRight=hc,q.partition=Yf,q.pick=Rc,q.pickBy=$o,q.property=ba,q.propertyOf=xa,q.pull=zf,q.pullAll=mu,q.pullAllBy=wu,q.pullAt=Ff,q.range=ja,q.rearg=_c,q.reject=fi,q.remove=bu,q.rest=Oi,q.reverse=xu,q.sampleSize=li,q.set=Fo,q.setWith=qo,q.shuffle=si,q.slice=ju,q.sortBy=Hf,q.sortByOrder=_i,q.sortedUniq=Cu,q.sortedUniqBy=Su,q.spread=Ri,q.tail=Wu,q.take=Lu,q.takeRight=Uu,q.takeRightWhile=Bu,q.takeWhile=$u,q.tap=Mu,q.throttle=ki,q.thru=Pu,q.times=Aa,q.toArray=po,q.toPath=Oa,q.toPlainObject=_o,q.transform=To,q.union=qf,q.unionBy=Tf,q.uniq=zu,q.uniqBy=Fu,q.unset=No,q.unzip=qu,q.unzipWith=Tu,q.values=Do,q.valuesIn=Mo,q.without=Nf,q.words=pa,q.wrap=Ii,q.xor=Df,q.xorBy=Mf,q.zip=Pf,q.zipObject=Nu,q.zipWith=Zf,q.each=ri,q.eachRight=ei,da(q,q),q.add=ka,q.attempt=Bc,q.camelCase=kc,q.capitalize=Vo,q.ceil=Fc,q.clamp=Po,q.clone=Ei,q.cloneDeep=Si,q.cloneDeepWith=Wi,q.cloneWith=Ci,q.deburr=Go,q.endsWith=Jo,q.eq=Li,q.escape=Xo,q.escapeRegExp=Yo,q.every=Hu,q.find=ni,q.findIndex=lu,q.findKey=mo,q.findLast=ti,q.findLastIndex=su,q.findLastKey=wo,q.floor=qc,q.forEach=ri,q.forEachRight=ei,q.forIn=bo,q.forInRight=xo,q.forOwn=jo,q.forOwnRight=Ao,q.get=Ro,q.gt=Ui,q.gte=Bi,q.has=ko,q.hasIn=Io,q.head=_u,q.identity=_a,q.includes=ui,q.indexOf=vu,q.inRange=Zo,q.isArguments=$i,q.isArray=vc,q.isArrayLike=zi,q.isArrayLikeObject=Fi,q.isBoolean=qi,q.isDate=Ti,q.isElement=Ni,q.isEmpty=Di,q.isEqual=Mi,q.isEqualWith=Pi,q.isError=Zi,q.isFinite=Ki,q.isFunction=Vi,q.isInteger=Gi,q.isMatch=Yi,q.isMatchWith=Hi,q.isNaN=Qi,q.isNative=no,q.isNil=ro,q.isNull=to,q.isNumber=eo,q.isObject=Ji,q.isObjectLike=Xi,q.isPlainObject=uo,q.isRegExp=io,q.isSafeInteger=oo,q.isString=ao,q.isTypedArray=fo,q.isUndefined=co,q.kebabCase=Ic,q.last=yu,q.lastIndexOf=du,q.lowerCase=Ec,q.lowerFirst=Cc,q.lt=lo,q.lte=so,q.max=Ia,q.maxBy=Ea,q.min=Ca,q.minBy=Sa,q.noConflict=ma,q.noop=wa,q.now=Qf,q.pad=Ho,q.padLeft=Qo,q.padRight=na,q.parseInt=ta,q.random=Ko,q.reduce=oi,q.reduceRight=ai,q.repeat=ra,q.result=zo,q.round=Tc,q.runInContext=J,q.sample=ci,q.size=pi,q.snakeCase=Wc,q.some=hi,q.sortedIndex=Au,q.sortedIndexBy=Ou,q.sortedIndexOf=Ru,q.sortedLastIndex=ku,q.sortedLastIndexBy=Iu,q.sortedLastIndexOf=Eu,q.startCase=Lc,q.startsWith=ea,q.sum=Wa,q.sumBy=La,q.template=ua,q.toInteger=ho,q.toLower=ia,q.toSafeInteger=vo,q.toString=go,q.toUpper=oa,q.trim=aa,q.trimLeft=fa,q.trimRight=ca,q.trunc=la,q.unescape=sa,q.uniqueId=Ra,q.upperCase=Uc,q.upperFirst=Sc,q.first=_u,da(q,function(){var n={};return _r(q,function(t,r){Ma.call(q.prototype,r)||(n[r]=t)}),n}(),{chain:!1}),q.VERSION=Y,e(["bind","bindKey","curry","curryRight","partial","partialRight"],function(n){q[n].placeholder=q}),e(["drop","take"],function(n,t){bt.prototype[n]=function(r){var e=this.__filtered__;if(e&&!t)return new bt(this);r=r===X?1:sf(ho(r),0);var u=this.clone();return e?u.__takeCount__=pf(r,u.__takeCount__):u.__views__.push({size:pf(r,jn),type:n+(u.__dir__<0?"Right":"")}),u},bt.prototype[n+"Right"]=function(t){return this.reverse()[n](t).reverse()}}),e(["filter","map","takeWhile"],function(n,t){var r=t+1,e=r!=yn;bt.prototype[n]=function(n){var t=this.clone();return t.__iteratees__.push({iteratee:We(n,3),type:r}),t.__filtered__=t.__filtered__||e,t}}),e(["head","last"],function(n,t){var r="take"+(t?"Right":"");bt.prototype[n]=function(){return this[r](1).value()[0]}}),e(["initial","tail"],function(n,t){var r="drop"+(t?"":"Right");bt.prototype[n]=function(){return this.__filtered__?new bt(this):this[r](1)}}),bt.prototype.compact=function(){return this.filter(_a)},bt.prototype.find=function(n){return this.filter(n).head()},bt.prototype.findLast=function(n){return this.reverse().find(n)},bt.prototype.reject=function(n){return n=We(n,3),this.filter(function(t){return!n(t)})},bt.prototype.slice=function(n,t){n=n?ho(n):0;var r=this;return r.__filtered__&&(n>0||0>t)?new bt(r):(0>n?r=r.takeRight(-n):n&&(r=r.drop(n)),t!==X&&(t=ho(t),r=0>t?r.dropRight(-t):r.take(t-n)),r)},bt.prototype.takeRightWhile=function(n){return this.reverse().takeWhile(n).reverse()},bt.prototype.toArray=function(){return this.take(jn)},_r(bt.prototype,function(n,t){var r=/^(?:filter|find|map|reject)|While$/.test(t),e=/^(?:head|last)$/.test(t),u=e||/^find/.test(t),i=q[e?"take"+("last"==t?"Right":""):t];i&&(q.prototype[t]=function(){var t=e?[1]:arguments,o=this.__wrapped__,a=o instanceof bt,c=t[0],l=a||vc(o),s=function(n){var r=i.apply(q,f([n],t));return e&&h?r[0]:r};l&&r&&"function"==typeof c&&1!=c.length&&(a=l=!1);var p={func:Pu,args:[s],thisArg:X},h=this.__chain__,_=!!this.__actions__.length,v=u&&!h,g=a&&!_;if(!u&&l){o=g?o:new bt(this);var y=n.apply(o,t);return y.__actions__.push(p),new yt(y,h)}return v&&g?n.apply(this,t):(y=this.thru(s),v?e?y.value()[0]:y.value():y)})}),e(["join","pop","push","replace","shift","sort","splice","split","unshift"],function(n){var t=(/^(?:replace|split)$/.test(n)?Na:qa)[n],r=/^(?:push|sort|unshift)$/.test(n)?"tap":"thru",e=/^(?:join|pop|replace|shift)$/.test(n);q.prototype[n]=function(){var n=arguments;return e&&!this.__chain__?t.apply(this.value(),n):this[r](function(r){return t.apply(r,n)})}}),_r(bt.prototype,function(n,t){var r=q[t];if(r){var e=r.name+"",u=jf[e]||(jf[e]=[]);u.push({name:t,func:r})}}),jf[be(X,Q).name]=[{name:"wrapper",func:X}],bt.prototype.clone=xt,bt.prototype.reverse=jt,bt.prototype.value=At,q.prototype.chain=Zu,q.prototype.commit=Ku,q.prototype.concat=Kf,q.prototype.next=Vu,q.prototype.plant=Ju,q.prototype.reverse=Xu,q.prototype.run=q.prototype.toJSON=q.prototype.valueOf=q.prototype.value=Yu,tf&&(q.prototype[tf]=Gu),q}var X,Y="4.0.0-pre",H=1,Q=2,nn=4,tn=8,rn=16,en=32,un=64,on=128,an=256,fn=512,cn=1,ln=2,sn=30,pn="...",hn=150,_n=16,vn=200,gn=1,yn=2,dn="Expected a function",mn="__lodash_hash_undefined__",wn=1/0,bn=9007199254740991,xn=1e308,jn=4294967295,An=jn-1,On=jn>>>1,Rn="__lodash_placeholder__",kn="[object Arguments]",In="[object Array]",En="[object Boolean]",Cn="[object Date]",Sn="[object Error]",Wn="[object Function]",Ln="[object GeneratorFunction]",Un="[object Map]",Bn="[object Number]",$n="[object Object]",zn="[object RegExp]",Fn="[object Set]",qn="[object String]",Tn="[object WeakMap]",Nn="[object ArrayBuffer]",Dn="[object Float32Array]",Mn="[object Float64Array]",Pn="[object Int8Array]",Zn="[object Int16Array]",Kn="[object Int32Array]",Vn="[object Uint8Array]",Gn="[object Uint8ClampedArray]",Jn="[object Uint16Array]",Xn="[object Uint32Array]",Yn=/\b__p \+= '';/g,Hn=/\b(__p \+=) '' \+/g,Qn=/(__e\(.*?\)|\b__t\)) \+\n'';/g,nt=/&(?:amp|lt|gt|quot|#39|#96);/g,tt=/[&<>"'`]/g,rt=RegExp(nt.source),et=RegExp(tt.source),ut=/<%-([\s\S]+?)%>/g,it=/<%([\s\S]+?)%>/g,ot=/<%=([\s\S]+?)%>/g,at=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,ft=/^\w*$/,ct=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g,lt=/[\\^$.*+?()[\]{}|]/g,st=RegExp(lt.source),pt=/\\(\\)?/g,ht=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,_t=/\w*$/,vt=/^0[xX]/,gt=/^\[object .+?Constructor\]$/,yt=/^\d+$/,dt=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,mt=/($^)/,wt=/['\n\r\u2028\u2029\\]/g,bt="\\ud800-\\udfff",xt="\\u0300-\\u036f\\ufe20-\\ufe23",jt="\\u2700-\\u27bf",At="a-z\\xdf-\\xf6\\xf8-\\xff",Ot="\\xac\\xb1\\xd7\\xf7",Rt="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",kt="\\u2018\\u2019\\u201c\\u201d",It=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",Et="A-Z\\xc0-\\xd6\\xd8-\\xde",Ct="\\ufe0e\\ufe0f",St=Ot+Rt+kt+It,Wt="["+bt+"]",Lt="["+St+"]",Ut="["+xt+"]",Bt="\\d+",$t="["+jt+"]",zt="["+At+"]",Ft="[^"+bt+St+Bt+jt+At+Et+"]",qt="(?:\\ud83c[\\udffb-\\udfff])",Tt="[^"+bt+"]",Nt="(?:\\ud83c[\\udde6-\\uddff]){2}",Dt="[\\ud800-\\udbff][\\udc00-\\udfff]",Mt="["+Et+"]",Pt="\\u200d",Zt="(?:"+zt+"|"+Ft+")",Kt="(?:"+Mt+"|"+Ft+")",Vt=qt+"?",Gt="["+Ct+"]?",Jt="(?:"+Pt+"(?:"+[Tt,Nt,Dt].join("|")+")"+Gt+Vt+")*",Xt=Gt+Vt+Jt,Yt="(?:"+[$t,Nt,Dt].join("|")+")"+Xt,Ht="(?:"+[Tt+Ut+"?",Ut,Nt,Dt,Wt].join("|")+")",Qt=RegExp(Ut,"g"),nr=RegExp(Ht+Xt,"g"),tr=RegExp("["+Pt+bt+xt+Ct+"]"),rr=/[a-zA-Z0-9]+/g,er=RegExp([Mt+"?"+zt+"+(?="+[Lt,Mt,"$"].join("|")+")",Kt+"+(?="+[Lt,Mt+Zt,"$"].join("|")+")",Mt+"?"+Zt+"+",Bt+"(?:"+Zt+"+)?",Yt].join("|"),"g"),ur=/[a-z][A-Z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,ir=["Array","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Math","Object","Reflect","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseFloat","parseInt","setTimeout"],or=-1,ar={};ar[Dn]=ar[Mn]=ar[Pn]=ar[Zn]=ar[Kn]=ar[Vn]=ar[Gn]=ar[Jn]=ar[Xn]=!0,ar[kn]=ar[In]=ar[Nn]=ar[En]=ar[Cn]=ar[Sn]=ar[Wn]=ar[Un]=ar[Bn]=ar[$n]=ar[zn]=ar[Fn]=ar[qn]=ar[Tn]=!1;var fr={};fr[kn]=fr[In]=fr[Nn]=fr[En]=fr[Cn]=fr[Dn]=fr[Mn]=fr[Pn]=fr[Zn]=fr[Kn]=fr[Un]=fr[Bn]=fr[$n]=fr[zn]=fr[Fn]=fr[qn]=fr[Vn]=fr[Gn]=fr[Jn]=fr[Xn]=!0,fr[Sn]=fr[Wn]=fr[Tn]=!1;var cr={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss"},lr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},sr={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},pr={"function":!0,object:!0},hr={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},_r=pr[typeof exports]&&exports&&!exports.nodeType?exports:null,vr=pr[typeof module]&&module&&!module.nodeType?module:null,gr=O(_r&&vr&&"object"==typeof global&&global),yr=O(pr[typeof self]&&self),dr=O(pr[typeof window]&&window),mr=vr&&vr.exports===_r?_r:null,wr=O(pr[typeof this]&&this),br=gr||dr!==(wr&&wr.window)&&dr||yr||wr||Function("return this")(),xr=J();(dr||yr||{})._=xr,"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return xr}):_r&&vr?mr?(vr.exports=xr)._=xr:_r._=xr:br._=xr}).call(this);
// Todo:
// 1) Make the button prettier
// 2) add a config option for IE users which takes a URL.  That URL should accept a POST request with a
//    JSON encoded object in the payload and return a CSV.  This is necessary because IE doesn't let you
//    download from a data-uri link
//
// Notes:  This has not been adequately tested and is very much a proof of concept at this point
function ngGridCsvExportPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.services = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;
        function showDs() {
            var keys = [];
            for (var f in grid.config.columnDefs) { keys.push(grid.config.columnDefs[f].field);}
            var csvData = '';
            function csvStringify(str) {
                if (str == null) { // we want to catch anything null-ish, hence just == not ===
                    return '';
                }
                if (typeof(str) === 'number') {
                    return '' + str;
                }
                if (typeof(str) === 'boolean') {
                    return (str ? 'TRUE' : 'FALSE') ;
                }
                if (typeof(str) === 'string') {
                    return str.replace(/"/g,'""');
                }

                return JSON.stringify(str).replace(/"/g,'""');
            }
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }
            // FIX to use display name headers
//            for (var k in keys) {
//                csvData += '"' + csvStringify(keys[k]) + '",';
//            }
            for (var f in grid.config.columnDefs) {
                csvData += '"' + csvStringify(grid.config.columnDefs[f].displayName) + '",';
            }
            csvData = swapLastCommaForNewline(csvData);
            var gridData = grid.data;
            for (var gridRow in gridData) {
                for ( k in keys) {
                    var curCellRaw;
                    if (opts != null && opts.columnOverrides != null && opts.columnOverrides[keys[k]] != null) {
                        // FIX line below to handle nested properties
//                        curCellRaw = opts.columnOverrides[keys[k]](gridData[gridRow][keys[k]]);
                        curCellRaw = opts.columnOverrides[keys[k]](services.UtilityService.evalProperty(gridData[gridRow],keys[k]));
                    }
                    else {
//                        // FIX line below to handle nested properties
//                        curCellRaw = gridData[gridRow][keys[k]];
                        curCellRaw = services.UtilityService.evalProperty(gridData[gridRow],keys[k]);
                    }
                    csvData += '"' + csvStringify(curCellRaw) + '",';
                }
                csvData = swapLastCommaForNewline(csvData);
            }
            var fp = grid.$root.find(".ngFooterPanel");
            var csvDataLinkPrevious = grid.$root.find('.ngFooterPanel .csv-data-link-span');
            if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            var csvDataLinkHtml = "<div class=\"csv-data-link-span\">";
            csvDataLinkHtml += "<br><a href=\"data:text/csv;charset=UTF-8,";
            csvDataLinkHtml += encodeURIComponent(csvData);
            csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</a></br></div>" ;
            fp.append(csvDataLinkHtml);
        }
        setTimeout(showDs, 0);
        scope.catHashKeys = function() {
            var hash = '';
            for (var idx in scope.renderedRows) {
                hash += scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        if (opts.customDataWatcher) {
            scope.$watch(opts.customDataWatcher, showDs);
        } else {
            scope.$watch(scope.catHashKeys, showDs);
        }
    };
}

/**
 * Created by haffo on 5/4/15.
 */

(function (angular) {
    'use strict';
    var mod = angular.module('table-settings', []);

//    mod.directive('table-column-toggle', [
//        function () {
//            return {
//                restrict: 'A',
//                scope: {
//                    type: '@',
//                    message: '=',
//                    dqa: '=',
//                    tree: '=',
//                    editor: '=',
//                    cursor: '=',
//                    format: '='
//                },
//                templateUrl: 'directives/table-column-toggle/table-column-toggle.html',
//                replace: false,
//                controller: 'TableColumnToggleCtrl'
//            };
//        }
//    ]);
//
//    mod
//        .controller('TableColumnToggleCtrl', ['$scope', '$filter', '$modal', '$rootScope', 'TableColumnSettings', function ($scope, $filter, $modal, $rootScope, TableColumnSettings) {
//
//        }]);


    mod.factory('ColumnSettings',
        ['StorageService', function (StorageService) {
            var options = [
                { id: "usage", label: "Usage"},
                { id: "cardinality", label: "Cardinality"},
                { id: "length", label: "Length"},
                { id: "confLength", label: "Conf. Length"},
                { id: "datatype", label: "Datatype"},
                { id: "valueSet", label: "Value Set"},
                { id: "predicate", label: "Predicate"},
                { id: "confStatement", label: "Conf. Statement"},
                { id: "defText", label: "Def. Text"},
                { id: "comment", label: "Comment"}
            ];

            var visibleColumns = StorageService.get(StorageService.TABLE_COLUMN_SETTINGS_KEY) == null ?  angular.copy(options) : angular.fromJson(StorageService.get(StorageService.TABLE_COLUMN_SETTINGS_KEY));

            var ColumnSettings = {
                options: options,
                visibleColumns: visibleColumns,
                extra: {displayProp: 'id', buttonClasses: 'btn btn-xs btn-info', buttonDefaultText: 'Columns', showCheckAll:false, showUncheckAll:false,
                    smartButtonTextConverter: function(itemText, originalItem) {
                        return 'Columns';
                    }
                },
                events:{
                    onItemSelect: function(item){
                        ColumnSettings.save();
                    },
                    onItemDeselect: function(item){
                        ColumnSettings.save();
                    }
                },
                set: function (visibleColumns) {
                    ColumnSettings.visibleColumns = visibleColumns;
                    StorageService.set(StorageService.TABLE_COLUMN_SETTINGS_KEY, angular.toJson(visibleColumns));
                },
                save: function () {
                    StorageService.set(StorageService.TABLE_COLUMN_SETTINGS_KEY, angular.toJson(ColumnSettings.visibleColumns));
                },
                isVisibleColumn: function (column) {
                    for(var i=0; i < ColumnSettings.visibleColumns.length;i++){
                        if(ColumnSettings.visibleColumns[i].id === column){
                            return true;
                        }
                    }
                    return false;
                }
            };
            return ColumnSettings;
        }]);


})(angular);
/**
 * Created by haffo on 6/9/14.
 */


if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}


if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}


var waitingDialog = (function ($) {
    // Creating modal dialog's DOM
    var $dialog = $(
            '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
            '<div class="modal-dialog modal-m">' +
            '<div class="modal-content">' +
            '<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
            '<div class="modal-body">' +
            '<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
            '</div>' +
            '</div></div></div>');

    return {
        /**
         * Opens our dialog
         * @param message Custom message
         * @param options Custom options:
         * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
         * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
         */
        show: function (message, options) {
            // Assigning defaults
            var settings = $.extend({
                dialogSize: 'm',
                progressType: ''
            }, options);
            if (typeof message === 'undefined') {
                message = 'Loading';
            }
            if (typeof options === 'undefined') {
                options = {};
            }
            // Configuring dialog
            $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
            $dialog.find('.progress-bar').attr('class', 'progress-bar');
            if (settings.progressType) {
                $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
            }
            $dialog.find('h3').text(message);
            // Opening dialog
            $dialog.modal();
        },
        /**
         * Closes dialog
         */
        hide: function () {
            $dialog.modal('hide');
        }
    }

})(jQuery);

'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module oƒf the application.
 */
var app = angular
    .module('igl', [
        'ngAnimate',
        'LocalStorageModule',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngIdle',
        'ui.bootstrap',
        'smart-table',
        'ngTreetable',
        'restangular',
        'textAngular',
        'ng-context-menu',
        'table-settings',
        'angularjs-dropdown-multiselect',
        'dndLists'
    ]);

var
//the HTTP headers to be used by all requests
    httpHeaders,

//the message to show on the login popup page
    loginMessage,

//the spinner used to show when we are still waiting for a server answer
    spinner,

//The list of messages we don't want to displat
    mToHide = ['usernameNotFound', 'emailNotFound', 'usernameFound', 'emailFound', 'loginSuccess', 'userAdded','igDocumentNotSaved','igDocumentSaved'];

//the message to be shown to the user
var msg = {};

app.config(["$routeProvider", "RestangularProvider", "$httpProvider", "KeepaliveProvider", "IdleProvider", function ($routeProvider, RestangularProvider, $httpProvider, KeepaliveProvider, IdleProvider) {


    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html'
        })
        .when('/home', {
            templateUrl: 'views/home.html'
        })
        .when('/ig', {
            templateUrl: 'views/ig.html'
        })
        .when('/doc', {
            templateUrl: 'views/doc.html'
        })
        .when('/setting', {
            templateUrl: 'views/setting.html'
        })
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html'
        })
        .when('/forgotten', {
            templateUrl: 'views/account/forgotten.html',
            controller: 'ForgottenCtrl'
        })
        .when('/issue', {
            templateUrl: 'views/issue.html',
            controller: 'IssueCtrl'
        })
        .when('/registration', {
            templateUrl: 'views/account/registration.html',
            controller: 'RegistrationCtrl'
        }).when('/useraccount', {
            templateUrl: 'views/account/userAccount.html'
        })
//        .when('/account', {
//            templateUrl: 'views/account/account.html',
//            controller: 'AccountCtrl',
//            resolve: {
//                login: ['LoginService', function(LoginService){
//                    return LoginService();
//                }]
//            }
//        })
        .when('/registerResetPassword', {
            templateUrl: 'views/account/registerResetPassword.html',
            controller: 'RegisterResetPasswordCtrl',
            resolve: {
                isFirstSetup: function() {
                    return true;
                }
            }
        })
        .when('/resetPassword', {
            templateUrl: 'views/account/registerResetPassword.html',
            controller: 'RegisterResetPasswordCtrl',
            resolve: {
                isFirstSetup: function() {
                    return false;
                }
            }
        })
        .when('/registrationSubmitted', {
            templateUrl: 'views/account/registrationSubmitted.html'
        })
        .when('/masterDTLib', {
            templateUrl: 'views/edit/masterDTLib.html'
        })
        .otherwise({
            redirectTo: '/'
        });

//    $http.defaults.headers.post['X-CSRFToken'] = $cookies['csrftoken'];

    $httpProvider.interceptors.push(["$q", function ($q) {
        return {
            request: function (config) {
//            	console.log(config.url);
//                return "http://localhost:8080/igamt"+ value;
//                if(config.url.startsWith("api")){
//                   config.url = "http://localhost:8080/igamt/"+  config.url;
//                   console.log("config.url=" + config.url);
//                }
                return config || $q.when(config);
            }
        }
    }]);


    $httpProvider.interceptors.push(["$rootScope", "$q", function ($rootScope, $q) {
        var setMessage = function (response) {
            //if the response has a text and a type property, it is a message to be shown
            if (response.data && response.data.text && response.data.type) {
                if (response.status === 401 ) {
//                        console.log("setting login message");
                    loginMessage = {
                        text: response.data.text,
                        type: response.data.type,
                        skip: response.data.skip,
                        show: true,
                        manualHandle: response.data.manualHandle
                    };

                } else  if (response.status === 503 ) {
                    msg = {
                        text: "server.down",
                        type: "danger",
                        show: true,
                        manualHandle: true
                    };
                } else {
                    msg = {
                        text: response.data.text,
                        type: response.data.type,
                        skip: response.data.skip,
                        show: true,
                        manualHandle: response.data.manualHandle
                    };
                    var found = false;
                    var i = 0;
                    while ( i < mToHide.length && !found ) {
                        if ( msg.text === mToHide[i] ) {
                            found = true;
                        }
                        i++;
                    }
                    if ( found === true) {
                        msg.show = false;
                    } else {
//                        //hide the msg in 5 seconds
//                                                setTimeout(
//                                                    function() {
//                                                        msg.show = false;
//                                                        //tell angular to refresh
//                                                        $rootScope.$apply();
//                                                    },
//                                                    10000
//                                                );
                    }
                }
            }
        };

        return {
            response: function (response) {
                setMessage(response);
                return response || $q.when(response);
            },

            responseError: function (response) {
                setMessage(response);
                return $q.reject(response);
            }
        };

    }]);

    //configure $http to show a login dialog whenever a 401 unauthorized response arrives
    $httpProvider.interceptors.push(["$rootScope", "$q", function ($rootScope, $q) {
        return {
            response: function (response) {
                return response   || $q.when(response);
            },
            responseError: function (response) {
                if (response.status === 401) {
                    //We catch everything but this one. So public users are not bothered
                    //with a login windows when browsing home.
                    if ( response.config.url !== 'api/accounts/cuser') {
                        //We don't intercept this request
                        if(response.config.url !== 'api/accounts/login') {
                            var deferred = $q.defer(),
                                req = {
                                    config: response.config,
                                    deferred: deferred
                                };
                            $rootScope.requests401.push(req);
                        }
                        $rootScope.$broadcast('event:loginRequired');
//                        return deferred.promise;

                        return  $q.when(response);
                    }
                }
                return $q.reject(response);
            }
        };
    }]);

    //intercepts ALL angular ajax http calls
    $httpProvider.interceptors.push(["$q", function ($q) {
        return {
            response: function (response) {
                //hide the spinner
                spinner = false;
                return response   || $q.when(response);
            },
            responseError: function (response) {
                //hide the spinner
                spinner = false;
                return $q.reject(response);
            }
        };


    }]);


    IdleProvider.idle(7200);
    IdleProvider.timeout(30);
    KeepaliveProvider.interval(10);


    var spinnerStarter = function (data, headersGetter) {
        spinner = true;
        return data;
    };
    $httpProvider.defaults.transformRequest.push(spinnerStarter);

    httpHeaders = $httpProvider.defaults.headers;


}]);


app.run(["$rootScope", "$location", "Restangular", "$modal", "$filter", "base64", "userInfoService", "$http", function ($rootScope, $location, Restangular, $modal, $filter, base64, userInfoService, $http) {


    //Check if the login dialog is already displayed.
    $rootScope.loginDialogShown = false;
    $rootScope.subActivePath = null;



    //make current message accessible to root scope and therefore all scopes
    $rootScope.msg = function () {
        return msg;
    };

    //make current loginMessage accessible to root scope and therefore all scopes
    $rootScope.loginMessage = function () {
//            console.log("calling loginMessage()");
        return loginMessage;
    };

    //showSpinner can be referenced from the view
    $rootScope.showSpinner = function() {
        return spinner;
    };

    /**
     * Holds all the requests which failed due to 401 response.
     */
    $rootScope.requests401 = [];

    $rootScope.$on('event:loginRequired', function () {
//            console.log("in loginRequired event");
        $rootScope.showLoginDialog();
    });

    /**
     * On 'event:loginConfirmed', resend all the 401 requests.
     */
    $rootScope.$on('event:loginConfirmed', function () {
        var i,
            requests = $rootScope.requests401,
            retry = function (req) {
                $http(req.config).then(function (response) {
                    req.deferred.resolve(response);
                });
            };

        for (i = 0; i < requests.length; i += 1) {
            retry(requests[i]);
        }
        $rootScope.requests401 = [];

        $location.url('/ig');
    });

    /*jshint sub: true */
    /**
     * On 'event:loginRequest' send credentials to the server.
     */
    $rootScope.$on('event:loginRequest', function (event, username, password) {
        httpHeaders.common['Accept'] = 'application/json';
        httpHeaders.common['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
//        httpHeaders.common['withCredentials']=true;
//        httpHeaders.common['Origin']="http://localhost:9000";
        $http.get('api/accounts/login').success(function() {
            //If we are here in this callback, login was successfull
            //Let's get user info now
            httpHeaders.common['Authorization'] = null;
            $http.get('api/accounts/cuser').then(function (result) {
                if(result.data && result.data != null) {
                    var rs = angular.fromJson(result.data);
                    userInfoService.setCurrentUser(rs);
                    $rootScope.$broadcast('event:loginConfirmed');
                }else{
                    userInfoService.setCurrentUser(null);
                }
            },function(){
                userInfoService.setCurrentUser(null);
            });
        });
    });

    /**
     * On 'logoutRequest' invoke logout on the server.
     */
    $rootScope.$on('event:logoutRequest', function () {
        httpHeaders.common['Authorization'] = null;
        userInfoService.setCurrentUser(null);
        $http.get('j_spring_security_logout');
    });

    /**
     * On 'loginCancel' clears the Authentication header
     */
    $rootScope.$on('event:loginCancel',function (){
        httpHeaders.common['Authorization'] = null;
    });

    $rootScope.$on('$routeChangeStart', function(next, current) {
//            console.log('route changing');
        // If there is a message while change Route the stop showing the message
        if (msg && msg.manualHandle === 'false'){
//                console.log('detected msg with text: ' + msg.text);
            msg.show = false;
        }
    });

    $rootScope.loadUserFromCookie = function() {
        if ( userInfoService.hasCookieInfo() === true ) {
            //console.log("found cookie!")
            userInfoService.loadFromCookie();
            httpHeaders.common['Authorization'] = userInfoService.getHthd();
        }
        else {
            //console.log("cookie not found");
        }
    };


    $rootScope.isSubActive = function (path) {
        return path === $rootScope.subActivePath;
    };

    $rootScope.setSubActive = function (path) {
        $rootScope.subActivePath = path;
    };

    $rootScope.getFullName = function () {
        if (userInfoService.isAuthenticated() === true) {
            return userInfoService.getFullName();
        }
        return '';
    };

}]);


app.controller('ErrorDetailsCtrl', ["$scope", "$modalInstance", "error", function ($scope, $modalInstance, error) {
    $scope.error = error;
    $scope.ok = function () {
        $modalInstance.close($scope.error);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


//app.filter('flavors', function() {
//    return function(input, name) {
//
//    };
//});

app.filter('flavors',function(){
    return function(inputArray,name){
        return inputArray.filter(function(item){
            return item.name === name || angular.equals(item.name,name);
        });
    };
});


app.factory('StorageService',
    ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
        var service = {
            TABLE_COLUMN_SETTINGS_KEY: 'SETTINGS_KEY',
            remove: function (key) {
                return localStorageService.remove(key);
            },

            removeList: function removeItems(key1, key2, key3) {
                return localStorageService.remove(key1, key2, key3);
            },

            clearAll: function () {
                return localStorageService.clearAll();
            },
            set: function (key, val) {
                return localStorageService.set(key, val);
            },
            get: function (key) {
                return localStorageService.get(key);
            }
        };
        return service;
    }]
);





//
//angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
//    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
//    }]).directive('carousel', [function () {
//        return {
//
//        }
//    }]);

'use strict';

angular.module('igl').factory('userInfo', ['$resource',
    function ($resource) {
        return $resource('api/accounts/cuser');
    }
]);

angular.module('igl').factory('userLoaderService', ['userInfo', '$q',
    function (userInfo, $q) {
        var load = function() {
            var delay = $q.defer();
            userInfo.get({},
                function(theUserInfo) {
                    delay.resolve(theUserInfo);
                },
                function() {
                    delay.reject('Unable to fetch user info');
                }
            );
            return delay.promise;
        };
        return {
            load: load
        };
    }
]);

angular.module('igl').factory('userInfoService', ['StorageService', 'userLoaderService',
    function(StorageService,userLoaderService) {
        var currentUser = null;
        var supervisor = false,
        author = false,
        admin = false,
        id = null,
        username = '',
        fullName= '';

        //console.log("USER ID=", StorageService.get('userID'));
       
        var loadFromCookie = function() {
            //console.log("UserID=", StorageService.get('userID'));

            id = StorageService.get('userID');
            username = StorageService.get('username');
            author = StorageService.get('author');
            supervisor = StorageService.get('supervisor');
            admin = StorageService.get('admin');
        };

        var saveToCookie = function() {
            StorageService.set('accountID', id);
            StorageService.set('username', username);
            StorageService.set('author', author);
            StorageService.set('supervisor', supervisor);
            StorageService.set('admin', admin);
            StorageService.set('fullName', fullName);
        };

        var clearCookie = function() {
            StorageService.remove('accountID');
            StorageService.remove('username');
            StorageService.remove('author');
            StorageService.remove('supervisor');
            StorageService.remove('admin');
            StorageService.remove('hthd');
            StorageService.remove('fullName');

        };

        var saveHthd = function(header) {
            StorageService.set('hthd', header);
        };

        var getHthd = function(header) {
            return StorageService.get('hthd');
        };

        var hasCookieInfo =  function() {
            if ( StorageService.get('username') === '' ) {
                return false;
            }
            else {
                return true;
            }
        };

        var getAccountID = function() {
            if ( isAuthenticated() ) {
                return currentUser.accountId.toString();
            }
            return '0';
        };

        var isAdmin = function() {
            return admin;
        };

        var isAuthor = function() {
            return author;
        };

//        var isAuthorizedVendor = function() {
//            return authorizedVendor;
//        };
//
//        var isCustomer = function() {
//            return (author || authorizedVendor);
//        };

        var isSupervisor = function() {
            return supervisor;
        };

        var isPending = function() {
            return isAuthenticated() && currentUser != null ? currentUser.pending: false;
        };

        var isAuthenticated = function() {
        	var res =  currentUser !== undefined && currentUser != null && currentUser.authenticated === true;
             return res;
        };

        var loadFromServer = function() {
            if ( !isAuthenticated() ) {
                userLoaderService.load().then(setCurrentUser);
            }
        };

        var setCurrentUser = function(newUser) {
            currentUser = newUser;
            if ( currentUser !== null && currentUser !== undefined ) {
                username = currentUser.username;
                id = currentUser.accountId;
                fullName = currentUser.fullName;
                if ( angular.isArray(currentUser.authorities)) {
                    angular.forEach(currentUser.authorities, function(value, key){
                        switch(value.authority)
                        {
                        case 'user':
                             break;
                        case 'admin':
                            admin = true;
                             break;
                        case 'author':
                            author = true;
                             break;
                        case 'supervisor':
                            supervisor = true;
                             break;
                        default:
                         }
                    });
                }
                //saveToCookie();
            }
            else {
                supervisor = false;
                author = false;
                admin = false;
                username = '';
                id = null;
                fullName = '';
                //clearCookie();
            }
        };

        var getUsername = function() {
            return username;
        };

        var getFullName = function() {
            return fullName;
        };

        return {
            saveHthd: saveHthd,
            getHthd: getHthd,
            hasCookieInfo: hasCookieInfo,
            loadFromCookie: loadFromCookie,
            getAccountID: getAccountID,
            isAdmin: isAdmin,
            isAuthor: isAuthor,
            isAuthenticated: isAuthenticated,
            isPending: isPending,
            isSupervisor: isSupervisor,
            setCurrentUser: setCurrentUser,
            loadFromServer: loadFromServer,
            getUsername: getUsername,
            getFullName: getFullName

        };
    }
]);

'use strict';

angular.module('igl').factory('Account', ['$resource',
    function ($resource) {
        return $resource('api/accounts/:id', {id: '@id'});
    }
]);

angular.module('igl').factory('LoginService', ['$resource', '$q',
    function ($resource, $q) {
        return function() {
            var myRes = $resource('api/accounts/login');
            var delay = $q.defer();
            myRes.get({},
                function(res) {
                    delay.resolve(res);
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('igl').factory('AccountLoader', ['Account', '$q',
    function (Account, $q) {
        return function(acctID) {
            var delay = $q.defer();
            Account.get({id: acctID},
                function(account) {
                    delay.resolve(account);
                },
                function() {
                    delay.reject('Unable to fetch account');
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('igl').factory(
		'CloneDeleteSvc',
		["$rootScope", "$modal", "ProfileAccessSvc", function($rootScope, $modal, ProfileAccessSvc) {

			var svc = this;
			
			svc.copySection = function(section) {
				var newSection = angular.copy(section);
				newSection.id = new ObjectId();
				var rand = Math.floor(Math.random() * 100);
				if (!$rootScope.igdocument.profile.metaData.ext) {
					$rootScope.igdocument.profile.metaData.ext = "";
				}
				newSection.sectionTitle = section.sectionTitle + "-"
				+ $rootScope.igdocument.profile.metaData.ext + "-"
				+ rand;
				newSection.label = newSection.sectionTitle;
				$rootScope.igdocument.childSections.splice(0, 0, newSection);
				$rootScope.$broadcast('event:SetToC');	
				$rootScope.$broadcast('event:openSection', newSection);	
			}
			
			svc.copySegment = function(segment) {

		          var newSegment = angular.copy(segment);
		            newSegment.id = new ObjectId().toString();
		            newSegment.label = $rootScope.createNewFlavorName(segment.label);
		            if (newSegment.fields != undefined && newSegment.fields != null && newSegment.fields.length != 0) {
		                for (var i = 0; i < newSegment.fields.length; i++) {
		                    newSegment.fields[i].id = new ObjectId().toString();
		                }
		            }
		            var dynamicMappings = newSegment['dynamicMappings'];
		            if (dynamicMappings != undefined && dynamicMappings != null && dynamicMappings.length != 0) {
		                angular.forEach(dynamicMappings, function (dynamicMapping) {
		                	dynamicMapping.id = new ObjectId().toString();
		                		angular.forEach(dynamicMapping.mappings, function (mapping) {
		                			mapping.id = new ObjectId().toString();
//			                		angular.forEach(mapping.cases, function (case) {
//			                			case.id = new ObjectId().toString();
//			                		});
		                		});
		                });
		            }
//		            $rootScope.segments.splice(0, 0, newSegment);
		            $rootScope.igdocument.profile.segments.children.splice(0, 0, newSegment);
		            $rootScope.segment = newSegment;
		            $rootScope.segment[newSegment.id] = newSegment;
		            $rootScope.recordChanged();
					$rootScope.$broadcast('event:SetToC');	
					$rootScope.$broadcast('event:openSegment', newSegment);	
			}
			
			svc.copyDatatype = function(datatype) {

		          var newDatatype = angular.copy(datatype);
		            newDatatype.id = new ObjectId().toString();
		            newDatatype.label = $rootScope.createNewFlavorName(datatype.label);
		            if (newDatatype.components != undefined && newDatatype.components != null && newDatatype.components.length != 0) {
		                for (var i = 0; i < newDatatype.components.length; i++) {
		                    newDatatype.components[i].id = new ObjectId().toString();
		                }
		            }
		            var predicates = newDatatype['predicates'];
		            if (predicates != undefined && predicates != null && predicates.length != 0) {
		                angular.forEach(predicates, function (predicate) {
		                    predicate.id = new ObjectId().toString();
		                });
		            }
		            var conformanceStatements = newDatatype['conformanceStatements'];
		            if (conformanceStatements != undefined && conformanceStatements != null && conformanceStatements.length != 0) {
		                angular.forEach(conformanceStatements, function (conformanceStatement) {
		                    conformanceStatement.id = new ObjectId().toString();
		                });
		            }
//		            $rootScope.datatypes.splice(0, 0, newDatatype);
		            $rootScope.igdocument.profile.datatypes.children.splice(0, 0, newDatatype);
		            $rootScope.datatype = newDatatype;
		            $rootScope.datatypesMap[newDatatype.id] = newDatatype;
		            $rootScope.recordChanged();
					$rootScope.$broadcast('event:SetToC');	
					$rootScope.$broadcast('event:openDatatype', newDatatype);	
			}

			svc.copyTable = function(table) {

	          var newTable = angular.copy(table);
	          newTable.id = new ObjectId().toString();
		        newTable.bindingIdentifier = $rootScope.createNewFlavorName(table.bindingIdentifier);
//		        $rootScope.newTableFakeId = $rootScope.newTableFakeId - 1;
//		        var newTable = angular.fromJson({
//		            id:new ObjectId().toString(),
//		            type: '',
//		            bindingIdentifier: '',
//		            name: '',
//		            version: '',
//		            oid: '',
//		            tableType: '',
//		            stability: '',
//		            extensibility: '',
//		            codes: []
//		        });
//		        newTable.type = 'table';
//		        newTable.bindingIdentifier = table.bindingIdentifier + $rootScope.createNewFlavorName(table.bindingIdentifier);
//		        newTable.name = table.name + '_' + $rootScope.postfixCloneTable + $rootScope.newTableFakeId;
//		        newTable.version = table.version;
//		        newTable.oid = table.oid;
//		        newTable.tableType = table.tableType;
//		        newTable.stability = table.stability;
//		        newTable.extensibility = table.extensibility;

		        newTable.codes = [];
		        for (var i = 0, len1 = table.codes.length; i < len1; i++) {
		            var newValue = {
		                    id: new ObjectId().toString(),
		                    type: 'value',
		                    value: table.codes[i].value,
		                    label: table.codes[i].label,
		                    codeSystem: table.codes[i].codeSystem,
		                    codeUsage: table.codes[i].codeUsage
		                };
		            
		            newTable.codes.push(newValue);
		        }

//		        $rootScope.tables.push(newTable);
		        $rootScope.table = newTable;
		        $rootScope.tablesMap[newTable.id] = newTable;
		        
		        $rootScope.codeSystems = [];
		        
		        for (var i = 0; i < $rootScope.table.codes.length; i++) {
		        	if($rootScope.codeSystems.indexOf($rootScope.table.codes[i].codeSystem) < 0) {
		        		if($rootScope.table.codes[i].codeSystem && $rootScope.table.codes[i].codeSystem !== ''){
		        			$rootScope.codeSystems.push($rootScope.table.codes[i].codeSystem);
		        		}
					}
		    		}
		     
		        $rootScope.igdocument.profile.tables.children.splice(0, 0, newTable);
	            $rootScope.recordChanged();
				$rootScope.$broadcast('event:SetToC');	
				$rootScope.$broadcast('event:openTable', newTable);	
			}
			
			svc.copyMessage = function(message) {
				// TODO gcr: Need to include the user identifier in the
				// new label.
				// $rootScope.igdocument.metaData.ext should be just that,
				// but is currently
				// unpopulated in the profile.
				var newMessage = angular.copy(message);
				newMessage.id = new ObjectId().toString();
				var groups = ProfileAccessSvc.Messages().getGroups(newMessage);
				angular.forEach(groups, function(group) {
					group.id = new ObjectId().toString();
				});
				newMessage.name = message.name + $rootScope.createNewFlavorName(message.name);
				$rootScope.igdocument.profile.messages.children.splice(0, 0, newMessage);
				
				return newMessage;
			}
						
			svc.deleteValueSet = function(table) {
		        $rootScope.references = [];
		        angular.forEach($rootScope.segments, function (segment) {
		            $rootScope.findTableRefs(table, segment);
		        });
		        if ($rootScope.references != null && $rootScope.references.length > 0) {
		        		abortValueSetDelete(table);
		        } else {
		        		confirmValueSetDelete(table);
		        }
			}
			
		    function abortValueSetDelete(table) {
		        var modalInstance = $modal.open({
		            templateUrl: 'ValueSetReferencesCtrl.html',
		            controller: 'ValueSetReferencesCtrl',
		            resolve: {
		                tableToDelete: function () {
		                    return table;
		                }
		            }
		        });
		        modalInstance.result.then(function (table) {
		            $scope.tableToDelete = table;
		        }, function () {
		        });
		    };
		    
		    function confirmValueSetDelete(table) {
		        var modalInstance = $modal.open({
		            templateUrl: 'ConfirmValueSetDeleteCtrl.html',
		            controller: 'ConfirmValueSetDeleteCtrl',
		            resolve: {
		                tableToDelete: function () {
		                    return table;
		                }
		            }
		        });
		        modalInstance.result.then(function (table) {
		            $scope.tableToDelete = table;
		        }, function () {
		        });
		    };
			
			function deleteValueSets(vssIdsSincerelyDead) {
//				console.log("deleteValueSets: vssIdsSincerelyDead=" + vssIdsSincerelyDead.length);
				return ProfileAccessSvc.ValueSets().removeDead(vssIdsSincerelyDead);		
			}
						
			svc.deleteDatatype = function(datatype) {
					$rootScope.references = [];
		            angular.forEach($rootScope.segments, function (segment) {
		                $rootScope.findDatatypeRefs(datatype, segment);
		            });
		            if ($rootScope.references != null && $rootScope.references.length > 0) {
		            		abortDatatypeDelete(datatype);
		            } else {
		            		confirmDatatypeDelete(datatype);
//						var dtIdsLive = ProfileAccessSvc.Datatypes().getAllDatatypeIds();
//						var idxP = _.findIndex(dtIdsLive, function (
//								child) {
//							return child.id === datatypeId;
//						});
//						dtIdsLive.splice(idxP, 1);
//		                rval = deleteDatatypes(dtIdsLive, [datatypeId]);
		            }
			}
			
			function abortDatatypeDelete(datatype) {
				var dtToDelete;
	            var modalInstance = $modal.open({
	                templateUrl: 'DatatypeReferencesCtrl.html',
	                controller: 'DatatypeReferencesCtrl',
	                resolve: {
	                    dtToDelete: function () {
	                        return datatype;
	                    }
	                }
	            });
	            modalInstance.result.then(function (datatype) {
	                dtToDelete = datatype;
	            }, function () {
	            });
	        };

	        function confirmDatatypeDelete(datatype) {
				var dtToDelete;
	            var modalInstance = $modal.open({
	                templateUrl: 'ConfirmDatatypeDeleteCtrl.html',
	                controller: 'ConfirmDatatypeDeleteCtrl',
	                resolve: {
	                    dtToDelete: function () {
	                        return datatype;
	                    }
	                }
	            });
	            modalInstance.result.then(function (datatype) {
	                dtToDelete = datatype;
	            }, function () {
	            });
	        };	
	        
	        
			function deleteDatatypes(dtIdsLive, dtsIdsSincerelyDead) {

				// Get all value sets that are contained in the sincerely dead datatypes.
				var vssIdsMerelyDead = ProfileAccessSvc.Datatypes().findValueSetsFromDatatypeIds(dtsIdsSincerelyDead);
				// then all value sets that are contained in the live datatypes.
				var vssIdsLive = ProfileAccessSvc.Datatypes().findValueSetsFromDatatypeIds(dtIdsLive);
				var vssIdsSincerelyDead = ProfileAccessSvc.ValueSets().findDead(vssIdsMerelyDead, vssIdsLive);		
				deleteValueSets(vssIdsSincerelyDead);
				
				var rval = ProfileAccessSvc.Datatypes().removeDead(dtsIdsSincerelyDead);		

//				console.log("deleteDatatypes: vssIdsMerelyDead=" + vssIdsMerelyDead.length);
//				console.log("deleteDatatypes: vssIdsLive=" + vssIdsLive.length);
//				console.log("deleteDatatypes: vssIdsSincerelyDead=" + vssIdsSincerelyDead.length);
				
				return rval;
			}

			svc.deleteSegment = function(segment) {
				$rootScope.references = ProfileAccessSvc.Segments().getParentalDependencies(segment);
	            if ($rootScope.references != null && $rootScope.references.length > 0) {
	            		abortSegmentDelete(segment);
	            } else {
	            		confirmSegmentDelete(segment);
	            }
			}
			
			function abortSegmentDelete(segment) {
				var segToDelete;
	            var modalInstance = $modal.open({
	                templateUrl: 'SegmentReferencesCtrl.html',
	                controller: 'SegmentReferencesCtrl',
	                resolve: {
	                		segToDelete: function () {
	                        return segment;
	                    }
	                }
	            });
	            modalInstance.result.then(function (segment) {
	            		segToDelete = segment;
	            }, function () {
	            });
	        };

	        function confirmSegmentDelete(segment) {
				var segToDelete;
	            var modalInstance = $modal.open({
	                templateUrl: 'ConfirmSegmentDeleteCtrl.html',
	                controller: 'ConfirmSegmentDeleteCtrl',
	                resolve: {
	                		segToDelete: function () {
	                        return segment;
	                    }
	                }
	            });
	            modalInstance.result.then(function (segment) {
	            		segToDelete = segment;
	            }, function () {
	            });
	        };	

			function deleteSegments(segmentRefsLive, segmentRefsSincerelyDead) {

				// Get all datatypes that are contained in the sincerely dead segments.
				var dtIdsMerelyDead = ProfileAccessSvc.Segments().findDatatypesFromSegmentRefs(segmentRefsSincerelyDead);

				// then all datatypes that are contained in the live segments.				
				var dtIdsLive = ProfileAccessSvc.Segments().findDatatypesFromSegmentRefs(segmentRefsLive);
				var dtsIdsSincerelyDead = ProfileAccessSvc.Datatypes().findDead(dtIdsMerelyDead, dtIdsLive);
				deleteDatatypes(dtIdsLive, dtsIdsSincerelyDead);
				
				var rval = ProfileAccessSvc.Segments().removeDead(segmentRefsSincerelyDead);				

//				console.log("deleteSegments: dtIdsMerelyDead=" + dtIdsMerelyDead.length);
//				console.log("deleteSegments: dtIdsLive=" + dtIdsLive.length);
//				console.log("deleteSegments: dtsIdsSincerelyDead=" + dtsIdsSincerelyDead.length);

				return rval;
			}

			svc.deleteMessage = function(message) {
				// We do the delete in pairs: dead and live.  dead = things we are deleting and live = things we are keeping. 
				
				// We are deleting the message so it's dead.
				// The message there is from the ToC so what we need is its reference,
				// and it must be an array of one.
				var msgDead = [message.id];
				// We are keeping the children so their live.
				var msgLive = ProfileAccessSvc.Messages().messages();
				
				// We remove the dead message from the living.
				var idxP = _.findIndex(msgLive, function (
						child) {
					return child.id === msgDead[0];
				});
				msgLive.splice(idxP, 1);
				if (0 === ProfileAccessSvc.Messages().messages().length) {
					ProfileAccessSvc.ValueSets().truncate();
					ProfileAccessSvc.Datatypes().truncate();
					ProfileAccessSvc.Segments().truncate();
					return;
				}
				// We get all segment refs that are contained in the dead message.
				var segmentRefsMerelyDead = ProfileAccessSvc.Messages()
						.getAllSegmentRefs(msgDead);
				// We get all segment refs that are contained in the live messages.
				var segmentRefsLive = ProfileAccessSvc.Messages()
				.getAllSegmentRefs(msgLive);
				// Until now, dead meant mearly dead.  We now remove those that are most sincerely dead.
				var segmentRefsSincerelyDead = ProfileAccessSvc.Segments().findDead(segmentRefsMerelyDead, segmentRefsLive);
				if (segmentRefsSincerelyDead.length === 0) {
//					console.log("Zero dead==>");			
					return;
				}
				
				var rval = deleteSegments(segmentRefsLive, segmentRefsSincerelyDead);
				
//				console.log("svc.deleteMessage: segmentRefsMerelyDead=" + segmentRefsMerelyDead.length);
//				console.log("svc.deleteMessage: segmentRefsLive=" + segmentRefsLive.length);
//				console.log("svc.deleteMessage: segmentRefsSincerelyDead=" + segmentRefsSincerelyDead.length);
//
//				console.log("svc.deleteMessage: aMsgs=" + ProfileAccessSvc.Messages().messages().length);
//				console.log("svc.deleteMessage: aSegs=" + ProfileAccessSvc.Segments().segments().length);
//				console.log("svc.deleteMessage: aDts=" + ProfileAccessSvc.Datatypes().datatypes().length);
//				console.log("svc.deleteMessage: aVss=" + ProfileAccessSvc.ValueSets().valueSets().length);
				
				return rval;
			}
			
			svc.deleteSection = function(secDead) {

				// We are keeping the children so their live.
				var secLive = $rootScope.igdocument.childSections;
				
				// We remove the dead message from the living.
				var idxP = _.findIndex(secLive, function (
						child) {
					return child.id === secDead.id;
				});
				secLive.splice(idxP, 1);
			}
	      
	        svc.findMessageIndex = function(messages, id) {
				var idxT = _.findIndex(messages.children, function(child) {
					return child.reference.id === id;
				})
				return idxT;
			}

			return svc;
		}]);
'use strict';

/**
 * @ngdoc function
 * @description
 *
 * This service is used to tranfer the state of a context menu selection between controllers.  
 * The state can be accessed but once.  It is left in its inital state. 
 */

angular.module('igl').factory('ContextMenuSvc', function () {
	
	var svc = {};
    
    svc.item = null;
    
    svc.ext = null;
    
    svc.get = function() {
    	var tmp = svc.item;
    	svc.item = null;
    	return tmp;
    };
    
    svc.put = function(item) {
    	svc.item = item;
    };
    
    return svc;
});





'use strict';

angular.module('igl').factory('Authors', ['$resource',
    function ($resource) {
        return $resource('api/shortaccounts', {filter:'accountType::author'});
    }
]);

angular.module('igl').factory('Supervisors', ['$resource',
    function ($resource) {
        return $resource('api/shortaccounts', {filter:'accountType::supervisor'});
    }
]);


angular.module('igl').factory('MultiAuthorsLoader', ['Authors', '$q',
    function (Authors, $q) {
        return function() {
            var delay = $q.defer();
            Authors.query(
                function(auth) {
                    delay.resolve(auth);
                },
                function() {
                    delay.reject('Unable to fetch list of authors');
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('igl').factory('MultiSupervisorsLoader', ['Supervisors', '$q',
    function (Supervisors, $q) {
        return function() {
            var delay = $q.defer();
            Supervisors.query(
                function(res) {
                    delay.resolve(res);
                },
                function() {
                    delay.reject('Unable to fetch list of supervisors');
                }
            );
            return delay.promise;
        };
    }
]);

angular.module('igl').factory ('ProfileAccessSvc', ["$rootScope", function($rootScope) {

	var svc = this;

	svc.Version = function() {
		return $rootScope.igdocument.profile.metaData.hl7Version;
	}

	svc.Messages = function() {
	
		var msgs = this;
	
		msgs.messages = function() {
			return $rootScope.igdocument.profile.messages.children;
		};
		
		msgs.findById = function(id) {
			return _.find(msgs.messages(), function(message) {
				return message.id === id;
			});
		}
		
		msgs.getMessageIds = function() {

			var rval = [];

			_.each($rootScope.igdocument.profile.messages.children, function(message) {
				rval.push(message.id);
			});

			return rval;
		}
		
		msgs.getAllSegmentRefs = function(messages) {

			var segRefs = [];
			
			_.each(messages, function(message) {
				var refs = msgs.getSegmentRefs(message);
				_.each(refs, function(ref){
					segRefs.push(ref);
				});
			});
			
			return _.uniq(segRefs);
		}
	
		msgs.getSegmentRefs = function(message) {
			
			var segRefs = [];
			
			_.each(message.children, function(groupORsegment) {
				var refs = fetchSegmentRefs(groupORsegment);
				_.each(refs, function(ref){
					segRefs.push(ref);
				});
			});
			
		  return _.uniq(segRefs);
		}
		
		msgs.getGroups = function(message) {
			
			var groups = [];
			
			_.each(message.children, function(groupORsegment) {
				console.log("Was a what? groupORsegment.type="
						+ groupORsegment.type + " name=" + message.name);
				var grps = fetchGroups(groupORsegment);
				_.each(grps, function(grp){
					groups.push(grp);
				});
			});
			
		  return groups;
		}
		
		function fetchGroups(groupORsegment) {

			var groups = [];
			
			if (groupORsegment.type === "group") {
				console.log("Was a group groupORsegment.type="
						+ groupORsegment.type);
				groups.push(groupORsegment);
				_.each(groupORsegment.children, function(groupORsegment1) {
					var grps = fetchGroups(groupORsegment1);
					_.each(grps, function(grp){
						groups.push(grp);
					});
				});
			} else {
				console.log("Was a segmentRef groupORsegment.type="
								+ groupORsegment.type);
			}
			
			return groups;
		}
	
		function fetchSegmentRefs(groupORsegment) {

			var segRefs = [];
			
			if (groupORsegment.type === "group") {
				_.each(groupORsegment.children, function(groupORsegment1) {
					var refs = fetchSegmentRefs(groupORsegment1);
					_.each(refs, function(ref){
						segRefs.push(ref);
					});
				});
			} else if (groupORsegment.type === "segmentRef") {
				segRefs.push(groupORsegment.ref);
			} else {
				console.log("Was neither group nor segmentRef groupORsegment.type="
								+ groupORsegment.type);
			}
			
			return segRefs;
		}
	
		return msgs;
	}

	svc.Segments = function() {
	
		var segs = this;
	
		segs.segments = function() {
			return $rootScope.igdocument.profile.segments.children;
		}
		
		segs.truncate = function() {
			segs.segments().length = 0;
		}
		
		segs.getAllSegmentIds = function() {
			var rval = [];
			_.each(segs.segments(), function(seg){
				rval.push(seg.id);
			});
			return rval;
		}
		
		segs.findByIds = function(ids) {
			var segments = [];
			_.each(ids, function(id){
				var segment = segs.findById(id);
				if (segment) {
					segments.push(segment);
				}
			});
			return segments;
		}
		
		segs.findById = function(segId) {
//			console.log("segIds=" + segs.getAllSegmentIds());
			var segments = segs.segments();
			
			var segment = _.find(segments, function(segment1) {
				return segment1.id === segId;
			});
			
			if (!segment) {
				console.log("segs.findById: segment not found, segId=" + segId);
			}
			return segment;
		}
		
		segs.findDead = function(idsDead, idsLive) {
			var segIds = _.difference(idsDead, idsLive);
			return segIds;
		}
		
		segs.removeDead = function(segIds) {
			var segments = segs.segments();
			var i = -1;
		
			_.each(ensureArray(segIds), function(id) {
				i = _.findIndex(segments, { 'id' : id });
				if (i > -1) {
					segments.splice(i, 1);
				}
			});
			
			return segments.length;
		}
		
		segs.getParentalDependencies = function(segment) {
			var messages = svc.Messages().messages();
			var rval = _.filter(messages, function(message) {
				var segRefs= svc.Messages().getSegmentRefs(message);
				return _.indexOf(segRefs, segment.id) >= 0;
			});
			return rval;
		}
		
		segs.findDatatypesFromSegmentRefs  = function(segRefs) {
			
			var dtIds = [];
			
			_.each(segRefs, function(segRef) {
				var segment = segs.findById(segRef);
				if (segment) {
					dtIds.push(segs.findDatatypesFromSegment(segment));
				} else {
					console.log("segs.findDatatypesFromSegmentRefs: Did not find seg for segRef=" + segRef);
				}
			});
			
			return _.uniq(_.flatten(dtIds));
		}
		
		segs.findDatatypesFromSegment = function(segment) {
			
			var dtIds = [];
			
			_.each(segment.fields, function(field) {
				dtIds.push(field.datatype);
			});
			
			return _.uniq(dtIds);
		}

		return segs;
	}

	svc.Datatypes = function() {
	
		var dts = this;
	
		dts.datatypes = function() {
			return $rootScope.igdocument.profile.datatypes.children;
		}
		
		dts.truncate = function() {
			dts.datatypes().length = 0;
		}
		
		dts.getAllDatatypeIds = function() {
			
			var dtIds = [];
			
			_.each(dts.datatypes(), function(datatype) {
				dtIds.push(datatype.id);
			});
			
			return dtIds;
		}
		
		dts.findById = function(id) {
			var datatype = _.find(dts.datatypes(), function(datatype) {
				return datatype.id === id;
			});
			if (!datatype) {
				console.log("dts.findById: datatype not found id=" + id);
			}
			return datatype;
		}						
		
		dts.findDead = function(idsDead, idsLive) {
			var dtIds = _.difference(idsDead, idsLive);
			return dtIds;
		}
				
		dts.removeDead = function(dtIds) {
			var datatypes = dts.datatypes();
			var i = 0;
			
			_.each(ensureArray(dtIds), function(id) {
				i = _.findIndex(datatypes, { 'id' : id });
				if (i > -1) {
					datatypes.splice(i, 1);
				}
			});
			
			return datatypes.length;
		}
		
		dts.findValueSetsFromDatatypeIds = function(dtIds) {
			
			var vsIds = [];
			
			_.each(dtIds, function(dtId) {
				var datatype = dts.findById(dtId);
				if (datatype) {
					var rvals = dts.findValueSetsFromDatatype(datatype);
					_.each(rvals, function(rval) {
						vsIds.push(rval);
					});
				} else {
					console.log("dts.findValueSetsFromDatatypeIds: Did not find dt for dtId=" + dtId);
				}
			});
			
			return _.uniq(vsIds);
		}
		
		dts.findValueSetsFromDatatype = function(datatype) {
			
			vsIds = [];
			
			_.each(datatype.components, function(component) {
				if (component.table.trim()) {
					vsIds.push(component.table);
				}
			});
			
			return _.uniq(vsIds);
		}
		
		return dts;
	}
	
	svc.ValueSets = function() {
		
		var vss = this;
		
		vss.valueSets = function() {
			return $rootScope.igdocument.profile.tables.children;
		};
				
		vss.truncate = function() {
			vss.valueSets().length = 0;
		};
		
		vss.getAllValueSetIds = function() {
			
			var vsIds = [];
			var valueSets = vss.valueSets();
			var i = 0;
			_.each(valueSets, function(valueSet) {
				if (valueSet) {
					vsIds.push(valueSet.id);
				}
			});
			
			return vsIds;
		}
		
		vss.findById = function(id) {
			var valueSet =  _.find(vss.valueSets(), function(vs) {
				return vs.id === id;
			});
			if (!valueSet) {
				console.log("vss.findById:: Did not find vs for vsId=" + dtId);
			}
			return valueSet;
		}
		
		vss.findDead = function(idsDead, idsLive) {
			var vsIds = _.difference(idsDead, idsLive);
			return vsIds;
		}
		
		vss.removeDead = function(vsIds) {			
			var valueSets = vss.valueSets();
//			console.log("b vss.removeDead=" + valueSets.length);
			
			_.each(ensureArray(vsIds), function(vsId) {
				var i = 0;
				_.each(valueSets, function(valueSet) {
					i = _.findIndex(valueSets, { 'id' : vsId });
					if (i > -1) {
						valueSets.splice(i, 1);
					}
				});
			});
			
			return valueSets.length;
		}
		
		return vss;
	}
	
	function ensureArray(possibleArray) {
		if(angular.isArray(possibleArray)) {
			return possibleArray;
		} else {
			console.log("Array ensured.");
			return [possibleArray];
		}
	}
	
	return svc;
}]);
angular.module('igl').factory(
		'ToCSvc',
		function() {

			var svc = this;
			
			function entry(id, label, position, parent, reference) { 
				this.id = id;
				this.label = label;
				this.selected = false;
				this.position = position;
				this.parent = parent;
				this.reference = reference;
			};

			svc.currentLeaf = {
				selected : false
			};

			svc.getToC = function(igdocument) {
				console.log("Getting toc...");
				toc = [];
				
//				console.log("childSections=" + igdocument.childSections.length);
				var documentMetadata = getMetadata(igdocument.metaData, "documentMetadata");
				toc.push(documentMetadata);
				var sections = getSections(igdocument.childSections, igdocument.type);
				_.each(sections, function(section){
					toc.push(section);
				});
				var conformanceProfile = getMessageInfrastructure(igdocument.profile);
				toc.push(conformanceProfile);
				return toc;
			}
			
			function getMetadata(metaData, parent) {
				var rval = new entry(parent, "Metadata", 0, parent, metaData);
				return rval;
			}
			
			function getSections(childSections, parent) {

				var rval = [];
				
 				_.each(childSections, function(childSection) {
 					var section = new entry(parent, childSection.sectionTitle, childSection.sectionPosition, childSection.type, childSection);
 					rval.push(section);	
					var sections1 = getSections(childSection.childSections, childSection.type);
					_.each(sections1, function(section1) {
						if (!section.childSections) {
							section.children = [];
						}
						section.children.push(section1);						
					});
				});
				var section2 = _.sortBy(rval, "position");
				rval = section2;
				return rval;
			}
			
			function getMessageInfrastructure(profile) {
				var rval = new entry(profile.type, profile.sectionTitle, profile.sectionPosition, 0, profile);
				var children = [];
				children.push(getMetadata(profile.metaData, "profileMetadata"));
				children.push(getTopEntry(profile.messages));
				children.push(getTopEntry(profile.segments));
				children.push(getTopEntry(profile.datatypes));
				children.push(getTopEntry(profile.tables));
				rval.children = children;
				return rval;
			}
			
			// Returns a top level entry. It can be dropped on, but cannot be
			// dragged.
			// It will accept a drop where the drag value matches its label.
			function getTopEntry(profile) {
				var children = [];
				var rval = new entry(profile.type, profile.sectionTitle, profile.sectionPosition, 0, profile);
				if (profile) {
					rval["reference"] = profile;
					if(angular.isArray(profile.children)) {
						rval["children"] = createEntries(profile.children[0].type, profile.children);
					}
				}
				return rval;
			}

			// Returns a second level set entries, These are draggable. "drag"
			function createEntries(parent, children) {
				var rval = [];
				var entry = {};
				_.each(children, function(child) {
					if(parent === "message") {
						entry = createEntry(child, child.name, parent);
//						console.log("createEntries entry.reference.name=" + entry.reference.name + " entry.parent=" + rval.parent);
					} else if (parent === "table") {
						entry = createEntry(child, child.bindingIdentifier, parent);
					} else {
						entry = createEntry(child, child.label, parent);
					}
					rval.push(entry);
				});
				if (parent === "message") {
					return rval;
				} else {
					return _.sortBy(rval, "label");
				}
			}

			function createEntry(child, label, parent) {
				
				var rval = new entry(child.id, label, child.sectionPosition, child.type, child);
				return rval;
			}

			return svc;
		})
'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the clientApp
 */
angular.module('igl')
  .controller('AboutService', ["$scope", function ($scope) {

  }]);

/*jshint bitwise: false*/

'use strict';

angular.module('igl')
	.service('base64', function base64() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    this.encode = function (input) {
        var output = '',
            chr1, chr2, chr3 = '',
            enc1, enc2, enc3, enc4 = '',
            i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = '';
            enc1 = enc2 = enc3 = enc4 = '';
        }

        return output;
    };

    this.decode = function (input) {
        var output = '',
            chr1, chr2, chr3 = '',
            enc1, enc2, enc3, enc4 = '',
            i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = '';
            enc1 = enc2 = enc3 = enc4 = '';
        }
    };
});

'use strict';

angular.module('igl').factory('i18n', function() {
    // AngularJS will instantiate a singleton by calling "new" on this function   
    var language;
    var setLanguage = function (theLanguage) {
        $.i18n.properties({
            name: 'messages',
            path: 'lang/',
            mode: 'map',
            language: theLanguage,
            callback: function () {
                language = theLanguage;
            }
        });
    };
    setLanguage('en');
    return {
        setLanguage: setLanguage
    };
});

/*angular.module('ehrRandomizerApp')
  .service('i18n', function i18n() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var self = this;
    this.setLanguage = function (language) {
        $.i18n.properties({
            name: 'messages',
            path: 'lang/',
            mode: 'map',
            language: language,
            callback: function () {
                self.language = language;
            }
        });
    };
    this.setLanguage('en');
  });*/
'use strict';

/**
 * @ngdoc function
 * @description
 * # AboutCtrl
 * Controller of the clientApp
 */
//
//// Declare factory
//angular.module('igl').factory('Profiles', function(Restangular) {
//     return Restangular.service('profiles');
//});



angular.module('igl').factory('Section', ["$http", "$q", function ($http, $q) {
    var Section = function () {
        this.data = null;
        this.type = null;
        this.sections = [];
    };
    return Section;
}]);





'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('igl')
  .controller('MainService', ["$scope", function ($scope) {
  }]);

/**
 * Created by haffo on 2/6/15.
 */

//
//
//// Declare factory
//angular.module('igl').factory('Users', function(Restangular) {
//    return Restangular.service('users');
//});
//


'use strict';

angular.module('igl').filter('bytes', [
    function () {
        return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) { return '-'; }
            if (typeof precision === 'undefined') { precision = 1; }
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        };
    }
]);

'use strict';

angular.module('igl').filter('yesno', [ function () {
    return function (input) {
        return input ? 'YES' : 'NO';
    };
}]);
angular
		.module('igl')
		.directive(
				'trunk',
				function() {
					console.log("trunk");

					var template = "<ul class='trunk'><branch ng-repeat='branch in trunk track by $index' branch='branch'></branch></ul>";

					return {
						restrict : "E",
						replace : true,
						scope : {
							trunk : '='
						},
						template : template,
					}
				})
		.directive(
				'drop',
				function() {
					console.log("drop");

					var template = "<ul dnd-list='drop'>"
							+ "<branch ng-repeat='branch in drop track by $index' index='$index' branch='branch' drop='drop'></branch>"
							+ "</ul>";

					return {
						restrict : "E",
						replace : true,
						scope : {
							drop : '='
						},
						template : template,
					}
				})
		.directive(
				"branch",
				["$compile", function($compile) {
					var branchTemplate = "<li class='branch'>"
							+ "<label for='{{branch.id}}' class='fa' ng-class=\" {'fa-caret-right': branch.selected,'fa-caret-down': !branch.selected} \" ng-click='tocSelection(branch)'>"
							+ "{{branch.label}}"
							+ "</label>"
							+ "<input type='checkbox' id='{{branch.id}}' ng-model='branch.selected'/>"
							+ "<trunk trunk='branch.children'></trunk>"
							+ "</li>";
					var branchMessageTemplate = "<li class='branch'"
							+ " context-menu context-menu-close='closedCtxSubMenu(branch)' data-target='messageHeadContextDiv.html'>"
							+ "<label for='{{branch.id}}' class='fa' ng-class=\" {'fa-caret-right': branch.selected,'fa-caret-down': !branch.selected} \" ng-click='tocSelection(branch)'>"
							+ "{{branch.label}}"
							+ "</label>"
							+ "<input type='checkbox' id='{{branch.id}}' ng-model='branch.selected'/>"
							+ "<drop drop='branch.children'></drop>"
							+ "</li>";
					var leafTemplate = "<leaf leaf='branch' index='index'></leaf>";

					var linker = function(scope, element, attrs) {
						if (angular.isArray(scope.branch.children)) {
//							 console.log("branch id=" + scope.branch.id +
//							 " label=" + scope.branch.label + " chidren=" +
//							 scope.branch.children.length);
							if (scope.branch.id === "message") {
								element.append(branchMessageTemplate);
							} else {
								element.append(branchTemplate);
							}
							$compile(element.contents())(scope);

						} else {
//							console.log("leaf0=" + scope.branch.label + " parent=" + scope.branch.parent);
							element.append(leafTemplate).show();
							$compile(element.contents())(scope);
						}
					}

					return {
						restrict : "E",
						replace : true,
						controller : "ToCCtl",
						scope : {
							index : '=',
							drop : '=',
							branch : '='
						},
						link : linker
					}
				}])
		.directive(
				"leaf",
				["$compile", function($compile) {

					var leafMetadata = "<li class='point leaf' ng-class=\" {'toc-selected' : leaf.selected, 'selected': models.selected === leaf} \" "
						+ " context-menu context-menu-close='closedCtxSubMenu(leaf)' data-target='headContextDiv.html' ng-click='tocSelection(leaf)'> "
						+ "{{leaf.label}}" 
						+ "</li>";

					var leafMessage = "<li class='point leaf' ng-class=\" {'toc-selected' : leaf.selected, 'selected': models.selected === leaf} \" "
			            + " dnd-draggable='leaf'"
			            + " dnd-effect-allowed='move'"
			            + " dnd-moved='moved(index, leaf, drop)'"
			            + " dnd-selected='models.selected = leaf'"
						+ " context-menu context-menu-close='closedCtxSubMenu(leaf)' data-target='leafContextDiv.html' ng-click='tocSelection(leaf)'> "
						+ "{{leaf.reference.name}} - {{leaf.reference.description}}" 
						+ "</li>";

					var leafValueSet = "<li class='point leaf' ng-class=\" {'toc-selected' : leaf.selected, 'selected': models.selected === leaf} \" "
						+ " context-menu context-menu-close='closedCtxSubMenu(leaf)' data-target='leafContextDiv.html' ng-click='tocSelection(leaf)'> "
						+ "{{leaf.reference.bindingIdentifier}} - {{leaf.reference.description}}" 
						+ "</li>";

					var leafSection = "<li class='point leaf' ng-class=\" {'toc-selected' : leaf.selected, 'selected': models.selected === leaf} \" "
						+ " context-menu context-menu-close='closedCtxSubMenu(leaf)' data-target='leafContextDiv.html' ng-click='tocSelection(leaf)'> "
						+ "{{leaf.reference.sectionTitle}}"

					var leafDefault = "<li class='point leaf' ng-class=\" {'toc-selected' : leaf.selected, 'selected': models.selected === leaf} \" "
						+ " context-menu context-menu-close='closedCtxSubMenu(leaf)' data-target='leafContextDiv.html' ng-click='tocSelection(leaf)'> "
						+ "{{leaf.reference.label}} - {{leaf.reference.description}}"
						+ "</li>";

					var linker = function(scope, element, attrs) {
						if (scope.leaf.parent === "documentMetadata" || scope.leaf.parent === "profileMetadata") {
							element.html(leafMetadata).show();
//							console.log("leaf1=" + scope.leaf.label + " parent=" + scope.leaf.parent);
						} else if (scope.leaf.parent === "section") {
							element.html(leafSection).show();
//							console.log("leaf1=" + scope.leaf.label + " parent=" + scope.leaf.parent);
						} else if (scope.leaf.parent === "message") {
							element.html(leafMessage).show();
//							console.log("leaf1=" + scope.leaf.label + " parent=" + scope.leaf.parent + " leaf.reference.name=" + scope.leaf.reference.name);
						} else if (scope.leaf.parent === "table") {
								element.html(leafValueSet).show();
//								console.log("leaf1=" + scope.leaf.label + " parent=" + scope.leaf.parent);
						} else {
							element.html(leafDefault).show();
//							console.log("leaf2=" + scope.leaf.label + " parent=" + scope.leaf.parent);
						}
						$compile(element.contents())(scope);
					}

					return {
						restrict : "E",
						replace : true,
						controller : "ToCCtl",
						scope : {
							index : '=',
							leaf : '=',
							drop : '='
						},
						link : linker
					}
				}])

/**
 * Created by haffo on 4/5/15.
 */
angular.module('igl').directive('click', ['$location', function($location) {
        return {
            link: function(scope, element, attrs) {
                element.on('click', function() {
                    scope.$apply(function() {
                        $location.path(attrs.clickGo);
                    });
                });
            }
        }
    }]);


//angular.module('igl').directive('csSelect', function () {
//    return {
//        require: '^stTable',
//        template: '',
//        scope: {
//            row: '=csSelect'
//        },
//        link: function (scope, element, attr, ctrl) {
//
//            element.bind('change', function (evt) {
//                scope.$apply(function () {
//                    ctrl.select(scope.row, 'single');
//                });
//            });
//
//            scope.$watch('row.isSelected', function (newValue, oldValue) {
//                if (newValue === true) {
//                    element.parent().addClass('st-selected');
//                } else {
//                    element.parent().removeClass('st-selected');
//                }
//            });
//        }
//    };
//});

/**
 * Created by haffo on 10/20/15.
 */
angular.module('igl').directive('compile', ["$compile", function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}]);
/**
 * Created by haffo on 2/13/15.
 */


angular.module('igl').directive('csSelect', function () {
    return {
        require: '^stTable',
        template: '',
        scope: {
            row: '=csSelect'
        },
        link: function (scope, element, attr, ctrl) {

            element.bind('change', function (evt) {
                scope.$apply(function () {
                    ctrl.select(scope.row, 'single');
                });
            });

            scope.$watch('row.isSelected', function (newValue, oldValue) {
                if (newValue === true) {
                    element.parent().addClass('st-selected');
                } else {
                    element.parent().removeClass('st-selected');
                }
            });
        }
    };
});
angular.module('igl').directive('windowExit', ["$window", "$templateCache", "$http", function($window, $templateCache,$http) {
    return {
        restrict: 'AE',
        //performance will be improved in compile
        compile: function(element, attrs){
            var myEvent = $window.attachEvent || $window.addEventListener,
                chkevent = $window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compatable
            myEvent(chkevent, function (e) { // For >=IE7, Chrome, Firefox
                $templateCache.removeAll();
            });
        }
    };
}]);
'use strict';

angular.module('igl')
.directive('focus', [function () {
    return {
        restrict: 'EAC',
        link: function(scope, element, attrs) {
//            element[0].focus();
        }
    };
}]);

'use strict';

angular.module('igl').directive('igCheckEmail', [ '$resource',
    function ($resource) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var Email = $resource('api/sooa/emails/:email', {email: '@email'});

                var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

                element.on('keyup', function() {
                    if ( element.val().length !== 0 && EMAIL_REGEXP.test(element.val()) ) {
                        var emailToCheck = new Email({email:element.val()});
                        emailToCheck.$get(function() {
                            scope.emailUnique  = ((emailToCheck.text === 'emailNotFound') ? 'valid' : undefined);
                            scope.emailValid = (EMAIL_REGEXP.test(element.val()) ? 'valid' : undefined);
                            if(scope.emailUnique && scope.emailValid) {
                                ctrl.$setValidity('email', true);
                            } else {
                                ctrl.$setValidity('email', false);
                            }

                        }, function() {
//                            console.log('FAILURE to check email address');
                        });
                    }
                    else {
                        scope.emailUnique  = undefined;
                        scope.emailValid = undefined;
                        ctrl.$setValidity('email', false);
                    }
                });
            }
        };
    }
]);

'use strict';

//This directive is used to make sure both passwords match
angular.module('igl').directive('igCheckEmployer', [
    function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var employer = '#' + attrs.igCheckEmployer;
                elem.add(employer).on('keyup', function () {
                    scope.$apply(function () {
//                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('noMatch', v);
                    });
                });
            }
        };
    }
]);
'use strict';

//This directive is used to make sure both passwords match
angular.module('igl').directive('igCheckPassword', [
    function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.igCheckPassword;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
//                        console.log('Pass1=', elem.val(), ' Pass2=', $(firstPassword).val());
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('noMatch', v);
                    });
                });
            }
        };
    }
]);
'use strict';

angular.module('igl').directive('igCheckPhone', [
    function () {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var NUMBER_REGEXP = /[0-9]*/;
                element.on('keyup', function() {
                     if ( element.val() &&  element.val() != null && element.val() != "") {
                             scope.phoneIsNumber  =  (NUMBER_REGEXP.test(element.val()))   && element.val() > 0 ? 'valid' : undefined;
                             scope.phoneValidLength  = element.val().length >= 7 ? 'valid' : undefined;
                             if(scope.phoneIsNumber && scope.phoneValidLength ) {
                                 ctrl.$setValidity('phone', true);
                             } else {
                                 ctrl.$setValidity('phone', false);
                             }
                     }
                     else {
                         scope.phoneIsNumber = undefined;
                         scope.phoneValidLength = undefined;
                         ctrl.$setValidity('phone', true);
                     }
                 });
            }
        };
    }
]);

'use strict';

angular.module('igl').directive('igCheckPoaDate', [
    function () {
        return {
            replace: true,
            link: function (scope, elem, attrs, ctrl) {
                var startElem = elem.find('#inputStartDate');
                var endElem = elem.find('#inputEndDate');

                var ctrlStart = startElem.inheritedData().$ngModelController;
                var ctrlEnd = endElem.inheritedData().$ngModelController;

                var checkDates = function() {
                    var sDate = new Date(startElem.val());
                    var eDate = new Date(endElem.val());
                    if ( sDate < eDate ) {
                        //console.log("Good!");
                        ctrlStart.$setValidity('datesOK', true);
                        ctrlEnd.$setValidity('datesOK', true);
                    }
                    else {
                        //console.log(":(");
                        ctrlStart.$setValidity('datesOK', false);
                        ctrlEnd.$setValidity('datesOK', false);
                    }
                };

                startElem.on('change', checkDates);
                endElem.on('change', checkDates);
            }
        };
    }
]);
'use strict';

//This directive is used to make sure the start hour of a timerange is < of the end hour 
angular.module('igl').directive('igCheckTimerange', [
    function () {
        return {
            replace: true,
            link: function (scope, elem, attrs, ctrl) {
                //elem is a div element containing all the select input
                //each one of them has a class for easy selection
                var myElem = elem.children();
                var sh = myElem.find('.shour');
                var sm = myElem.find('.sminute');
                var eh = myElem.find('.ehour');
                var em = myElem.find('.eminute');

                var ctrlSH, ctrlSM, ctrlEH, ctrlEM;
                ctrlSH = sh.inheritedData().$ngModelController;
                ctrlSM = sm.inheritedData().$ngModelController;
                ctrlEH = eh.inheritedData().$ngModelController;
                ctrlEM = em.inheritedData().$ngModelController;
               
                var newnew = true;

                var checkTimeRange = function() {
                    if ( newnew ) {
                        //We only do that once to set the $pristine field to false
                        //Because if $pristine==true, and $valid=false, the visual feedback 
                        //are not displayed
                        ctrlSH.$setViewValue(ctrlSH.$modelValue);
                        ctrlSM.$setViewValue(ctrlSM.$modelValue);
                        ctrlEH.$setViewValue(ctrlEH.$modelValue);
                        ctrlEM.$setViewValue(ctrlEM.$modelValue);
                        newnew = false;
                    }
                    //Getting a date object
                    var tmpDate = new Date();
                    //init the start time with the dummy date
                    var startTime = angular.copy(tmpDate);
                    //init the end time with the same dummy date
                    var endTime =  angular.copy(tmpDate);

                    startTime.setHours(sh.val());
                    startTime.setMinutes(sm.val());
                    endTime.setHours(eh.val());
                    endTime.setMinutes(em.val());
                    
                    if ( startTime < endTime ) {
                        //console.log("Excellent!");
                        ctrlSH.$setValidity('poaOK', true);
                        ctrlSM.$setValidity('poaOK', true);
                        ctrlEH.$setValidity('poaOK', true);
                        ctrlEM.$setValidity('poaOK', true);
                    }
                    else {
                        //console.log("Bad... :(");
                        ctrlSH.$setValidity('poaOK', false);
                        ctrlSM.$setValidity('poaOK', false);
                        ctrlEH.$setValidity('poaOK', false);
                        ctrlEM.$setValidity('poaOK', false);
                    }
                };

                sh.on('change', checkTimeRange);
                sm.on('change', checkTimeRange);
                eh.on('change', checkTimeRange);
                em.on('change', checkTimeRange);
            }
        };
    }
]);
'use strict';

angular.module('igl').directive('igCheckUsername', [ '$resource',
	function ($resource) {
	    return {
	        restrict: 'AC',
	        require: 'ngModel',
	        link: function (scope, element, attrs, ctrl) {
	            var Username = $resource('api/sooa/usernames/:username', {username: '@username'});

	            element.on('keyup', function() {
	                if ( element.val().length >= 4 ) {
	                    var usernameToCheck = new Username({username:element.val()});
	                    //var delay = $q.defer();
	                    usernameToCheck.$get(function() {
	                        scope.usernameValidLength  = (element.val() && element.val().length >= 4 && element.val().length <= 20 ? 'valid' : undefined);
	                        scope.usernameUnique  = ((usernameToCheck.text === 'usernameNotFound') ? 'valid' : undefined);

	                        if(scope.usernameValidLength && scope.usernameUnique ) {
	                            ctrl.$setValidity('username', true);
	                        } else {
	                            ctrl.$setValidity('username', false);
	                        }

	                    }, function() {
	                        //console.log("FAILURE", usernameToCheck);
	                    });
	                }
	                else {
	                    scope.usernameValidLength = undefined;
	                    scope.usernameUnique = undefined;
	                    ctrl.$setValidity('username', false);
	                }
	            });
	        }
	    };
	}
]);

'use strict';

//This directive is used to check password to make sure they meet the minimum requirements
angular.module('igl').directive('igPasswordValidate', [
	function () {
	    return {
	        require: 'ngModel',
	        link: function(scope, elm, attrs, ctrl) {
	            ctrl.$parsers.unshift(function(viewValue) {

	                scope.pwdValidLength = (viewValue && viewValue.length >= 7 ? 'valid' : undefined);
	                scope.pwdHasLowerCaseLetter = (viewValue && /[a-z]/.test(viewValue)) ? 'valid' : undefined;
	                scope.pwdHasUpperCaseLetter = (viewValue && /[A-Z]/.test(viewValue)) ? 'valid' : undefined;
	                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

	                if(scope.pwdValidLength && scope.pwdHasLowerCaseLetter && scope.pwdHasUpperCaseLetter && scope.pwdHasNumber) {
	                    ctrl.$setValidity('pwd', true);
	                    return viewValue;
	                } else {
	                    ctrl.$setValidity('pwd', false);
	                    return undefined;
	                }
	            });
	        }
	    };
	}
]);

'use strict';

//This directive is used to highlight the cehrt that is active
angular.module('igl').directive('ehrbold', [
    function () {
        return {
            restrict: 'C',
            link: function(scope, element, attrs) {
//                element.on('click', function() {
//                    element.siblings().removeClass('cehrtactive');
//                    element.siblings().children().removeClass('cehrtDeleteButtonActive');
//                    element.siblings().children().addClass('cehrtDeleteButtonNotActive');
//
//                    element.addClass('cehrtactive');
//                    element.children().removeClass('cehrtDeleteButtonNotActive');
//                    element.children().addClass('cehrtDeleteButtonActive');
//                });
            }
        };
    }
]);

'use strict';

angular.module('igl')
.directive('msg', [function () {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {
            //console.log("Dir");
            var key = attrs.key;
            if (attrs.keyExpr) {
                scope.$watch(attrs.keyExpr, function (value) {
                    key = value;
                    element.text($.i18n.prop(value));
                });
            }
            scope.$watch('language()', function (value) {
                element.text($.i18n.prop(key));
            });
        }
    };
}]);

/**
 * Created by haffo on 2/13/15.
 */
angular.module('igl').directive('stRatio',function(){
    return {
        link:function(scope, element, attr){
            var ratio=+(attr.stRatio);
            element.css('width',ratio+'%');
        }
    };
});

'use strict';

//Angular doesn't perform any validation on file input.
//We bridge the gap by linking the required directive to the
//presence of a value on the input.
angular.module('igl').directive('validTrustDocument', [
    function () {
        return {
            require:'ngModel',
            link:function(scope,el,attrs,ngModel){
                //change event is fired when file is selected
                el.bind('change', function() {
                    scope.$apply( function() {
                        ngModel.$setViewValue(el.val());
                        //console.log("validTrustDocument Val=", el.val());
                        //ngModel.$render();
                    });
                });
            }
        };
    }
]);

angular.module('igl').controller('ContextMenuCtl', ["$scope", "$rootScope", "ContextMenuSvc", function ($scope, $rootScope, ContextMenuSvc) {

    $scope.clicked = function (item) {
        ContextMenuSvc.put(item);
    };
}]);
angular.module('igl')
    .controller('SectionsListCtrl', ["$scope", "$rootScope", "CloneDeleteSvc", function ($scope, $rootScope, CloneDeleteSvc) {
    	
	    	$scope.cloneSection = function(section) {
        		CloneDeleteSvc.cloneSection(section);
	    	};
	    	
        $scope.close = function () {
            $rootScope.section = null;
            $scope.refreshTree();
            $scope.loadingSelection = false;
        };
        
        $scope.delete = function(section) {
        		CloneDeleteSvc.deleteSection(section);
        } 
}]);
angular
		.module('igl')
		.controller(
				'ToCCtl',
				[
						'$scope',
						'$rootScope',
						'$q',
						'ToCSvc',
						'ContextMenuSvc',
						'CloneDeleteSvc',
						function($scope, $rootScope, $q, ToCSvc,
								ContextMenuSvc, CloneDeleteSvc) {
							var ctl = this;
							$scope.collapsed = [];
							$scope.yesDrop = false;
							$scope.noDrop = true;
							$scope.$watch('tocData', function(newValue,
									oldValue) {
								if (!oldValue && newValue) {
									_.each($scope.tocData, function(head) {
										$scope.collapsed[head] = false;
									});
								}
							});
							$scope.moved = function (index, leaf, branch) {
								var idx = _.findLastIndex(branch, function(leaf1) {
									return leaf.id === leaf1.id;
								});
							
								if (index === idx) {
									branch.splice(index + 1, 1);
								} else {
									branch.splice(index, 1);
								}
							}
							$scope.calcOffset = function(level) {
								return "margin-left : " + level + "em";
							}

							$scope.tocSelection = function(entry) {
								// TODO gcr: See about refactoring this to
								// eliminate the switch.
								// One could use entry.reference.type to assemble
								// the $emit string.
								// Doing so would require maintaining a sync
								// with the ProfileListController.
								entry.selected = true;
								ToCSvc.currentLeaf.selected = false;
								ToCSvc.currentLeaf = entry;
								console.log("entry.parent=" + entry.parent);
								switch (entry.parent) {
								case "documentMetadata": {
									$scope.$emit('event:openDocumentMetadata',
											entry.reference);
									break;
								}
								case "profileMetadata": {
									$scope.$emit('event:openProfileMetadata',
											entry.reference);
									break;
								}
								case "message": {
									$scope.$emit('event:openMessage',
											entry.reference);
									break;
								}
								case "segment": {
									$scope.$emit('event:openSegment',
											entry.reference);
									break;
								}
								case "datatype": {
									$scope.$emit('event:openDatatype',
											entry.reference);
									break;
								}
								case "table": {
									$scope.$emit('event:openTable',
											entry.reference);
									break;
								}
								default: {
									$scope.$emit('event:openSection',
											entry.reference);
									break;
								}
								}
								return $scope.subview;
							};
							
							$scope.closedCtxSubMenu = function(leaf, $index) {
								var ctxMenuSelection = ContextMenuSvc.get();
								switch (ctxMenuSelection) {
								case "Copy":
									console.log("Copy==> node=" + leaf);
									if (leaf.reference.type === 'section') {
					        				CloneDeleteSvc.copySection(leaf.reference);
									} else if (leaf.reference.type === 'segment') {
						        			CloneDeleteSvc.copySegment(leaf.reference);
									}  else if (leaf.reference.type === 'datatype') {
						        			CloneDeleteSvc.copyDatatype(leaf.reference);
									} else if (leaf.reference.type === 'table') {
										CloneDeleteSvc.copyTable(leaf.reference);
									} else if (leaf.reference.type === 'message') {
										CloneDeleteSvc.copyMessage(leaf.reference);
									}
									break;
//								case "Copy":
//									console.log("Clone==> node=" + leaf);
//									CloneDeleteSvc.cloneMessage(
//											$rootScope.igdocument, leaf.reference);
//									$rootScope.$broadcast('event:SetToC');
//									break;
								case "Delete":
									console.log("Copy==> node=" + leaf);
									if (leaf.reference.type === 'section') {
					        				CloneDeleteSvc.deleteSection(leaf.reference);
									} else if (leaf.reference.type === 'segment') {
						        			CloneDeleteSvc.deleteSegment(leaf.reference);
									}  else if (leaf.reference.type === 'datatype') {
						        			CloneDeleteSvc.deleteDatatype(leaf.reference);
									} else if (leaf.reference.type === 'table') {
										CloneDeleteSvc.deleteValueSet(leaf.reference);
									} else if (leaf.reference.type === 'message') {
										CloneDeleteSvc.deleteMessage(leaf.reference);
									}
									break;
								default:
									console
											.log("Context menu defaulted with "
													+ ctxMenuSelection
													+ " Should be Add, clone, or Delete.");
								}
								$rootScope.$broadcast('event:SetToC');
							};

						} ])
'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the clientApp
 */
angular.module('igl')
  .controller('AboutCtrl', ["$scope", function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);

'use strict';

/* "newcap": false */

angular.module('igl')
.controller('UserProfileCtrl', ['$scope', '$resource', 'AccountLoader', 'Account', 'userInfoService', '$location',
    function ($scope, $resource, AccountLoader, Account, userInfoService, $location) {
        var PasswordChange = $resource('api/accounts/:id/passwordchange', {id:'@id'});

        $scope.accountpwd = {};

        $scope.initModel = function(data) {
            $scope.account = data;
            $scope.accountOrig = angular.copy($scope.account);
        };

        $scope.updateAccount = function() {
            //not sure it is very clean...
            //TODO: Add call back?
            new Account($scope.account).$save();

            $scope.accountOrig = angular.copy($scope.account);
        };

        $scope.resetForm = function() {
            $scope.account = angular.copy($scope.accountOrig);
        };

        //TODO: Change that: formData is only supported on modern browsers
        $scope.isUnchanged = function(formData) {
            return angular.equals(formData, $scope.accountOrig);
        };


        $scope.changePassword = function() {
            var user = new PasswordChange();
            user.username = $scope.account.username;
            user.password = $scope.accountpwd.currentPassword;
            user.newPassword = $scope.accountpwd.newPassword;
            user.id = $scope.account.id;
            //TODO: Check return value???
            user.$save().then(function(result){
                $scope.msg = angular.fromJson(result);
            });
        };

        $scope.deleteAccount = function () {
            var tmpAcct = new Account();
            tmpAcct.id = $scope.account.id;

            tmpAcct.$remove(function() {
                //console.log("Account removed");
                //TODO: Add a real check?
                userInfoService.setCurrentUser(null);
                $scope.$emit('event:logoutRequest');
                $location.url('/home');
            });
        };

        /*jshint newcap:false */
        AccountLoader(userInfoService.getAccountID()).then(
            function(data) {
                $scope.initModel(data);
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            },
            function() {
//                console.log('Error fetching account information');
            }
        );
    }
]);


angular.module('igl')
    .controller('UserAccountCtrl', ['$scope', '$resource', 'AccountLoader', 'Account', 'userInfoService', '$location', '$rootScope',
        function ($scope, $resource, AccountLoader, Account, userInfoService, $location,$rootScope) {


            $scope.accordi = { account : true, accounts:false};
            $scope.setSubActive = function (id) {
                if(id && id != null) {
                    $rootScope.setSubActive(id);
                    $('.accountMgt').hide();
                    $('#' + id).show();
                }
            };
            $scope.initAccount = function(){
                if($rootScope.subActivePath == null){
                    $rootScope.subActivePath = "account";
                }
                $scope.setSubActive($rootScope.subActivePath);
            };


        }
    ]);

'use strict';

angular.module('igl')
    .controller('AccountsListCtrl', ['$scope', 'MultiAuthorsLoader', 'MultiSupervisorsLoader','Account', '$modal', '$resource','AccountLoader','userInfoService','$location',
        function ($scope, MultiAuthorsLoader, MultiSupervisorsLoader, Account, $modal, $resource, AccountLoader, userInfoService, $location) {

            //$scope.accountTypes = [{ 'name':'Author', 'type':'author'}, {name:'Supervisor', type:'supervisor'}];
            //$scope.accountType = $scope.accountTypes[0];
            $scope.tmpAccountList = [].concat($scope.accountList);
            $scope.account = null;
            $scope.accountOrig = null;
            $scope.accountType = "author";
            $scope.scrollbarWidth = $scope.getScrollbarWidth();

//        var PasswordChange = $resource('api/accounts/:id/passwordchange', {id:'@id'});
            var PasswordChange = $resource('api/accounts/:id/userpasswordchange', {id:'@id'});
            var ApproveAccount = $resource('api/accounts/:id/approveaccount', {id:'@id'});
            var SuspendAccount = $resource('api/accounts/:id/suspendaccount', {id:'@id'});
            $scope.msg = null;

            $scope.accountpwd = {};

            $scope.updateAccount = function() {
                //not sure it is very clean...
                //TODO: Add call back?
                new Account($scope.account).$save();
                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.resetForm = function() {
                $scope.account = angular.copy($scope.accountOrig);
            };

            //TODO: Change that: formData is only supported on modern browsers
            $scope.isUnchanged = function(formData) {
                return angular.equals(formData, $scope.accountOrig);
            };

            $scope.changePassword = function() {
                var user = new PasswordChange();
                user.username = $scope.account.username;
                user.password = $scope.accountpwd.currentPassword;
                user.newPassword = $scope.accountpwd.newPassword;
                user.id = $scope.account.id;
                //TODO: Check return value???
                user.$save().then(function(result){
                    $scope.msg = angular.fromJson(result);
                });
            };

            $scope.loadAccounts = function(){
                if (userInfoService.isAuthenticated() && userInfoService.isAdmin()) {
                    $scope.msg = null;
                    new MultiAuthorsLoader().then(function (response) {
                        $scope.accountList = response;
                        $scope.tmpAccountList = [].concat($scope.accountList);
                    });
                }
            };

            $scope.initManageAccounts = function(){
                $scope.loadAccounts();
            };

            $scope.selectAccount = function(row) {
                $scope.accountpwd = {};
                $scope.account = row;
                $scope.accountOrig = angular.copy($scope.account);
            };

            $scope.deleteAccount = function() {
                $scope.confirmDelete($scope.account);
            };

            $scope.confirmDelete = function (accountToDelete) {
                var modalInstance = $modal.open({
                    templateUrl: 'ConfirmAccountDeleteCtrl.html',
                    controller: 'ConfirmAccountDeleteCtrl',
                    resolve: {
                        accountToDelete: function () {
                            return accountToDelete;
                        },
                        accountList: function () {
                            return $scope.accountList;
                        }
                    }
                });
                modalInstance.result.then(function (accountToDelete,accountList ) {
                    $scope.accountToDelete = accountToDelete;
                    $scope.accountList = accountList;
                }, function () {
                });
            };

            $scope.approveAccount = function() {
                var user = new ApproveAccount();
                user.username = $scope.account.username;
                user.id = $scope.account.id;
                user.$save().then(function(result){
                    $scope.account.pending = false;
                    $scope.msg = angular.fromJson(result);
                });
            };

            $scope.suspendAccount = function(){
                var user = new SuspendAccount();
                user.username = $scope.account.username;
                user.id = $scope.account.id;
                user.$save().then(function(result){
                    $scope.account.pending = true;
                    $scope.msg = angular.fromJson(result);
                });
            };


        }
    ]);



angular.module('igl').controller('ConfirmAccountDeleteCtrl', ["$scope", "$modalInstance", "accountToDelete", "accountList", "Account", function ($scope, $modalInstance, accountToDelete,accountList,Account) {

    $scope.accountToDelete = accountToDelete;
    $scope.accountList = accountList;
    $scope.delete = function () {
        //console.log('Delete for', $scope.accountList[rowIndex]);
        Account.remove({id:accountToDelete.id},
            function() {
                var rowIndex = $scope.accountList.indexOf(accountToDelete);
                if(index !== -1){
                    $scope.accountList.splice(rowIndex,1);
                }
                $modalInstance.close($scope.accountToDelete);
            },
            function() {
//                            console.log('There was an error deleting the account');
            }
        );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);






/**
 * Created by Jungyub on 4/01/15.
 */

angular.module('igl').controller('ConstraintsListCtrl',["$scope", "$rootScope", "Restangular", "$filter", function($scope, $rootScope, Restangular, $filter) {
	$scope.loading = false;
	$scope.tmpSegmentPredicates = [].concat($rootScope.segmentPredicates);
	$scope.tmpSegmentConformanceStatements = [].concat($rootScope.segmentConformanceStatements);
	$scope.tmpDatatypePredicates = [].concat($rootScope.datatypePredicates);
	$scope.tmpDatatypeConformanceStatements = [].concat($rootScope.datatypeConformanceStatements);
	 
	
	
	$scope.init = function() {
	};
	
}]);
/**
 * Created by haffo on 2/13/15.
 */


angular.module('igl')
    .controller('DatatypeListCtrl', ["$scope", "$rootScope", "Restangular", "ngTreetableParams", "$filter", "$http", "$modal", "$timeout", "CloneDeleteSvc", function ($scope, $rootScope, Restangular, ngTreetableParams, $filter, $http, $modal, $timeout, CloneDeleteSvc) {
        $scope.readonly = false;
        $scope.saved = false;
        $scope.message = false;
        $scope.datatypeCopy = null;
        $scope.init = function () {
       };

        $scope.copy = function (datatype) {
        		CloneDeleteSvc.copyDatatype(datatype);
        };

        $scope.recordDatatypeChange = function (type, command, id, valueType, value) {
            var datatypeFromChanges = $rootScope.findObjectInChanges("datatype", "add", $rootScope.datatype.id);
            if (datatypeFromChanges === undefined) {
                $rootScope.recordChangeForEdit2(type, command, id, valueType, value);
            }
        };

        $scope.close = function () {
            $rootScope.datatype = null;
            $scope.refreshTree();
            $scope.loadingSelection = false;
            $scope.accordion.datatypeStatus = false;
            $scope.accordion.listStatus = !$scope.accordion.datatypeStatus;
        };

        $scope.delete = function (datatype) {
        		  CloneDeleteSvc.deleteDatatype(datatype);
//            $rootScope.references = [];
//            angular.forEach($rootScope.segments, function (segment) {
//                $rootScope.findDatatypeRefs(datatype, segment);
//            });
//            if ($rootScope.references != null && $rootScope.references.length > 0) {
//                $scope.abortDelete(datatype);
//            } else {
//                $scope.confirmDelete(datatype);
//            }
			$rootScope.$broadcast('event:SetToC');
       };

//        $scope.abortDelete = function (datatype) {
//            var modalInstance = $modal.open({
//                templateUrl: 'DatatypeReferencesCtrl.html',
//                controller: 'DatatypeReferencesCtrl',
//                resolve: {
//                    dtToDelete: function () {
//                        return datatype;
//                    }
//                }
//            });
//            modalInstance.result.then(function (datatype) {
//                $scope.dtToDelete = datatype;
//            }, function () {
//            });
//        };

//        $scope.confirmDelete = function (datatype) {
//            var modalInstance = $modal.open({
//                templateUrl: 'ConfirmDatatypeDeleteCtrl.html',
//                controller: 'ConfirmDatatypeDeleteCtrl',
//                resolve: {
//                    dtToDelete: function () {
//                        return datatype;
//                    }
//                }
//            });
//            modalInstance.result.then(function (datatype) {
//                $scope.dtToDelete = datatype;
//            }, function () {
//            });
//        };


        $scope.hasChildren = function (node) {
            return node && node != null && node.datatype && $rootScope.getDatatype(node.datatype) != undefined && $rootScope.getDatatype(node.datatype).components != null && $rootScope.getDatatype(node.datatype).components.length > 0;
        };


        $scope.validateLabel = function (label, name) {
            if (label && !label.startsWith(name)) {
                return false;
            }
            return true;
        };

        $scope.onDatatypeChange = function (node) {
            $rootScope.recordChangeForEdit2('component', 'edit', node.id, 'datatype', node.datatype);
            $scope.refreshTree(); // TODO: Refresh only the node
        };

        $scope.refreshTree = function () {
            if ($scope.datatypesParams)
                $scope.datatypesParams.refresh();
        };

        $scope.goToTable = function (table) {
            $scope.$emit('event:openTable', table);
        };

        $scope.deleteTable = function (node) {
            node.table = null;
            $rootScope.recordChangeForEdit2('component', 'edit', node.id, 'table', null);
        };

        $scope.mapTable = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'TableMappingDatatypeCtrl.html',
                controller: 'TableMappingDatatypeCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.managePredicate = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'PredicateDatatypeCtrl.html',
                controller: 'PredicateDatatypeCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.manageConformanceStatement = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'ConformanceStatementDatatypeCtrl.html',
                controller: 'ConformanceStatementDatatypeCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.isSubDT = function (component) {
            if ($rootScope.datatype != null) {
                for (var i = 0, len = $rootScope.datatype.components.length; i < len; i++) {
                    if ($rootScope.datatype.components[i].id === component.id)
                        return false;
                }
            }
            return true;
        };

        $scope.findDTByComponentId = function (componentId) {
            return $rootScope.parentsMap[componentId] ? $rootScope.parentsMap[componentId].datatype : null;
        };

        $scope.countConformanceStatements = function (position) {
            var count = 0;
            if ($rootScope.datatype != null)
                for (var i = 0, len1 = $rootScope.datatype.conformanceStatements.length; i < len1; i++) {
                    if ($rootScope.datatype.conformanceStatements[i].constraintTarget.indexOf(position + '[') === 0)
                        count = count + 1;
                }

            return count;
        };

        $scope.countPredicate = function (position) {
            if ($rootScope.datatype != null)
                for (var i = 0, len1 = $rootScope.datatype.predicates.length; i < len1; i++) {
                    if ($rootScope.datatype.predicates[i].constraintTarget.indexOf(position + '[') === 0)
                        return 1;
                }

            return 0;
        };
    }]);


angular.module('igl')
    .controller('DatatypeRowCtrl', ["$scope", "$filter", function ($scope, $filter) {
        $scope.formName = "form_" + new Date().getTime();
    }]);


angular.module('igl').controller('ConfirmDatatypeDeleteCtrl', ["$scope", "$modalInstance", "dtToDelete", "$rootScope", function ($scope, $modalInstance, dtToDelete, $rootScope) {
    $scope.dtToDelete = dtToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;
        var index = $rootScope.datatypes.indexOf($scope.dtToDelete);
        if (index > -1) $rootScope.datatypes.splice(index, 1);
        if ($rootScope.datatype === $scope.dtToDelete) {
            $rootScope.datatype = null;
        }
        $rootScope.datatypesMap[$scope.dtToDelete.id] = null;
        $rootScope.references = [];
        if ($scope.dtToDelete.id < 0) { //datatype flavor
            var index = $rootScope.changes["datatype"]["add"].indexOf($scope.dtToDelete);
            if (index > -1) $rootScope.changes["datatype"]["add"].splice(index, 1);
            if ($rootScope.changes["datatype"]["add"] && $rootScope.changes["datatype"]["add"].length === 0) {
                delete  $rootScope.changes["datatype"]["add"];
            }
            if ($rootScope.changes["datatype"] && Object.getOwnPropertyNames($rootScope.changes["datatype"]).length === 0) {
                delete  $rootScope.changes["datatype"];
            }
        } else {
            $rootScope.recordDelete("datatype", "edit", $scope.dtToDelete.id);
            if ($scope.dtToDelete.components != undefined && $scope.dtToDelete.components != null && $scope.dtToDelete.components.length > 0) {

                //clear components changes
                angular.forEach($scope.dtToDelete.components, function (component) {
                    $rootScope.recordDelete("component", "edit", component.id);
                    $rootScope.removeObjectFromChanges("component", "delete", component.id);
                });
                if ($rootScope.changes["component"]["delete"] && $rootScope.changes["component"]["delete"].length === 0) {
                    delete  $rootScope.changes["component"]["delete"];
                }

                if ($rootScope.changes["component"] && Object.getOwnPropertyNames($rootScope.changes["component"]).length === 0) {
                    delete  $rootScope.changes["component"];
                }

            }

            if ($scope.dtToDelete.predicates != undefined && $scope.dtToDelete.predicates != null && $scope.dtToDelete.predicates.length > 0) {
                //clear predicates changes
                angular.forEach($scope.dtToDelete.predicates, function (predicate) {
                    $rootScope.recordDelete("predicate", "edit", predicate.id);
                    $rootScope.removeObjectFromChanges("predicate", "delete", predicate.id);
                });
                if ($rootScope.changes["predicate"]["delete"] && $rootScope.changes["predicate"]["delete"].length === 0) {
                    delete  $rootScope.changes["predicate"]["delete"];
                }

                if ($rootScope.changes["predicate"] && Object.getOwnPropertyNames($rootScope.changes["predicate"]).length === 0) {
                    delete  $rootScope.changes["predicate"];
                }

            }

            if ($scope.dtToDelete.conformanceStatements != undefined && $scope.dtToDelete.conformanceStatements != null && $scope.dtToDelete.conformanceStatements.length > 0) {
                //clear conforamance statement changes
                angular.forEach($scope.dtToDelete.conformanceStatements, function (confStatement) {
                    $rootScope.recordDelete("conformanceStatement", "edit", confStatement.id);
                    $rootScope.removeObjectFromChanges("conformanceStatement", "delete", confStatement.id);
                });
                if ($rootScope.changes["conformanceStatement"]["delete"] && $rootScope.changes["conformanceStatement"]["delete"].length === 0) {
                    delete  $rootScope.changes["conformanceStatement"]["delete"];
                }

                if ($rootScope.changes["conformanceStatement"] && Object.getOwnPropertyNames($rootScope.changes["conformanceStatement"]).length === 0) {
                    delete  $rootScope.changes["conformanceStatement"];
                }
            }
        }


        $rootScope.msg().text = "dtDeleteSuccess";
        $rootScope.msg().type = "success";
        $rootScope.msg().show = true;
        $rootScope.manualHandle = true;
        $modalInstance.close($scope.dtToDelete);

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


angular.module('igl').controller('DatatypeReferencesCtrl', ["$scope", "$modalInstance", "dtToDelete", function ($scope, $modalInstance, dtToDelete) {

    $scope.dtToDelete = dtToDelete;

    $scope.ok = function () {
        $modalInstance.close($scope.dtToDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('igl').controller('TableMappingDatatypeCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
    $scope.selectedNode = selectedNode;
    $scope.selectedTable = null;
    if (selectedNode.table != undefined) {
        $scope.selectedTable = $rootScope.tablesMap[selectedNode.table];
    }

    $scope.selectTable = function (table) {
        $scope.selectedTable = table;
    };

    $scope.mappingTable = function () {
        $scope.selectedNode.table = $scope.selectedTable.id;
        $rootScope.recordChangeForEdit2('component', 'edit', $scope.selectedNode.id, 'table', $scope.selectedTable.id);
        $scope.ok();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);

angular.module('igl').controller('ConformanceStatementDatatypeCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
	$scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];

    $scope.newConstraint = angular.fromJson({
        datatype: '',
        component_1: null,
        subComponent_1: null,
        component_2: null,
        subComponent_2: null,
        verb: null,
        constraintId: null,
        contraintType: null,
        value: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.datatype = $rootScope.datatype.name;
    
    
    $scope.initConformanceStatement = function () {
    	$scope.newConstraint = angular.fromJson({
            datatype: '',
            component_1: null,
            subComponent_1: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            constraintId: null,
            contraintType: null,
            value: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.datatype = $rootScope.datatype.name;
    }
    
    

    $scope.deleteConformanceStatement = function (conformanceStatement) {
        $rootScope.datatype.conformanceStatements.splice($rootScope.datatype.conformanceStatements.indexOf(conformanceStatement), 1);
        $rootScope.datatypeConformanceStatements.splice($rootScope.datatypeConformanceStatements.indexOf(conformanceStatement), 1);
        if (!$scope.isNewCS(conformanceStatement.id)) {
            $rootScope.recordChangeForEdit2('conformanceStatement', "delete", conformanceStatement.id, 'id', conformanceStatement.id);
        }
    };
    
    $scope.deleteConformanceStatementForComplex = function (conformanceStatement) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(conformanceStatement), 1);
    };


    $scope.isNewCS = function (id) {
        if ($rootScope.isNewObject('conformanceStatement', 'add', id)) {
            if ($rootScope.changes['conformanceStatement'] !== undefined && $rootScope.changes['conformanceStatement']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['conformanceStatement']['add'].length; i++) {
                    var tmp = $rootScope.changes['conformanceStatement']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['conformanceStatement']['add'].splice(i, 1);
                        if ($rootScope.changes["conformanceStatement"]["add"] && $rootScope.changes["conformanceStatement"]["add"].length === 0) {
                            delete  $rootScope.changes["conformanceStatement"]["add"];
                        }

                        if ($rootScope.changes["conformanceStatement"] && Object.getOwnPropertyNames($rootScope.changes["conformanceStatement"]).length === 0) {
                            delete  $rootScope.changes["conformanceStatement"];
                        }
                        return true;
                    }
                }
            }
            return true;
        }
        return false;
    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
    		datatype: '',
            component_1: null,
            subComponent_1: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            constraintId: null,
            contraintType: null,
            value: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
            
	    });
		$scope.newConstraint.datatype = $rootScope.datatype.name;
		
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }

    $scope.updateComponent_1 = function () {
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateComponent_2 = function () {
        $scope.newConstraint.subComponent_2 = null;
    };

    $scope.genPosition = function (datatype, component, subComponent) {
        var position = null;
        if (component != null && subComponent == null) {
            position = datatype + '.' + component.position;
        } else if (component != null && subComponent != null) {
            position = datatype + '.' + component.position + '.' + subComponent.position;
        }

        return position;
    };

    $scope.genLocation = function (component, subComponent) {
        var location = null;
        if (component != null && subComponent == null) {
            location = component.position + '[1]';
        } else if (component != null && subComponent != null) {
            location = component.position + '[1]' + '.' + subComponent.position + '[1]';
        }

        return location;
    };
    
    $scope.addComplexConformanceStatement = function(){
    	$scope.complexConstraint.constraintId = $scope.newComplexConstraintId;
    	$scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
    	
    	$rootScope.datatype.conformanceStatements.push($scope.complexConstraint);
    	$rootScope.datatypeConformanceStatements.push($scope.complexConstraint);
        var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: $scope.complexConstraint};
        $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
        
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        
        $scope.complexConstraint = null;
        $scope.newComplexConstraintId = '';
        $scope.newComplexConstraintClassification = 'E';
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };

    $scope.addConformanceStatement = function () {
        $rootScope.newConformanceStatementFakeId = $rootScope.newConformanceStatementFakeId - 1;

        var position_1 = $scope.genPosition($scope.newConstraint.datatype, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var position_2 = $scope.genPosition($scope.newConstraint.datatype, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);
        var location_1 = $scope.genLocation($scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var location_2 = $scope.genLocation($scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);

        if (position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                    assertion: '<Presence Path=\"' + location_1 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'a literal value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                    assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
                var cs = {
                        id: new ObjectId().toString(),
                        constraintId: $scope.newConstraint.constraintId,
                        constraintTarget: $scope.selectedNode.position + '[1]',
                        constraintClassification: $scope.newConstraint.constraintClassification,
                        description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                        assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                    $scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'formatted value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.datatype.conformanceStatements.push(cs);
                    $rootScope.datatypeConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            }
        }
        
        $scope.initConformanceStatement();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };
}]);


angular.module('igl').controller('PredicateDatatypeCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
	$scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];

    $scope.newConstraint = angular.fromJson({
        datatype: '',
        component_1: null,
        subComponent_1: null,
        component_2: null,
        subComponent_2: null,
        verb: null,
        contraintType: null,
        value: null,
        trueUsage: null,
        falseUsage: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.datatype = $rootScope.datatype.name;
    
    $scope.initPredicate = function () {
    	$scope.newConstraint = angular.fromJson({
            datatype: '',
            component_1: null,
            subComponent_1: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.datatype = $rootScope.datatype.name;
    }
    
    
    $scope.deletePredicateForComplex = function (predicate) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(predicate), 1);
    };
    
    $scope.deletePredicate = function (predicate) {
        $rootScope.datatype.predicates.splice($rootScope.datatype.predicates.indexOf(predicate), 1);
        $rootScope.datatypePredicates.splice($rootScope.datatypePredicates.indexOf(predicate), 1);
        if (!$scope.isNewCP(predicate.id)) {
            $rootScope.recordChangeForEdit2('predicate', "delete", predicate.id, 'id', predicate.id);
        }
    };

    $scope.isNewCP = function (id) {
        if ($rootScope.isNewObject("predicate", "add", id)) {
            if ($rootScope.changes['predicate'] !== undefined && $rootScope.changes['predicate']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['predicate']['add'].length; i++) {
                    var tmp = $rootScope.changes['predicate']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['predicate']['add'].splice(i, 1);

                        if ($rootScope.changes["predicate"]["add"] && $rootScope.changes["predicate"]["add"].length === 0) {
                            delete  $rootScope.changes["predicate"]["add"];
                        }

                        if ($rootScope.changes["predicate"] && Object.getOwnPropertyNames($rootScope.changes["predicate"]).length === 0) {
                            delete  $rootScope.changes["predicate"];
                        }

                        return true;
                    }
                }
            }
            return true;
        }
        return false;
    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
    		datatype: '',
            component_1: null,
            subComponent_1: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
	    });
		$scope.newConstraint.datatype = $rootScope.datatype.name;
		
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }

    $scope.updateComponent_1 = function () {
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateComponent_2 = function () {
        $scope.newConstraint.subComponent_2 = null;
    };

    $scope.genPosition = function (datatype, component, subComponent) {
        var position = null;
        if (component != null && subComponent == null) {
            position = datatype + '.' + component.position;
        } else if (component != null && subComponent != null) {
            position = datatype + '.' + component.position + '.' + subComponent.position;
        }

        return position;
    };

    $scope.genLocation = function (component, subComponent) {
        var location = null;
        if (component != null && subComponent == null) {
            location = component.position + '[1]';
        } else if (component != null && subComponent != null) {
            location = component.position + '[1]' + '.' + subComponent.position + '[1]';
        }

        return location;
    };

    $scope.deletePredicateByTarget = function () {
        for (var i = 0, len1 = $rootScope.datatype.predicates.length; i < len1; i++) {
            if ($rootScope.datatype.predicates[i].constraintTarget.indexOf($scope.selectedNode.position + '[') === 0) {
                $scope.deletePredicate($rootScope.datatype.predicates[i]);
                return true;
            }
        }
        return false;
    };
    
    $scope.addComplexConformanceStatement = function(){
        $scope.deletePredicateByTarget();
        $scope.complexConstraint.constraintId = $scope.newConstraint.datatype + '-' + $scope.selectedNode.position;
        $scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
        $rootScope.datatype.predicates.push($scope.complexConstraint);
        $rootScope.datatypePredicates.push($scope.complexConstraint);
        var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: $scope.complexConstraint};
        $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        
        $scope.complexConstraint = null;
        $scope.newComplexConstraintClassification = 'E';
        
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };
    

    $scope.updatePredicate = function () {
        $rootScope.newPredicateFakeId = $rootScope.newPredicateFakeId - 1;
        if ($scope.constraintType === 'Plain'){
        	$scope.deletePredicateByTarget();
        }
        
        var position_1 = $scope.genPosition($scope.newConstraint.datatype, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var position_2 = $scope.genPosition($scope.newConstraint.datatype, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);
        var location_1 = $scope.genLocation($scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var location_2 = $scope.genLocation($scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);

        if (position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
            	if($scope.constraintType === 'Plain'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + location_1 + '\"/>'
                    };
                	
                	$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + location_1 + '\"/>'
                    };
                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'a literal value') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'formatted value') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.datatype + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.datatype.predicates.push(cp);
                    $rootScope.datatypePredicates.push(cp);
                    var newCPBlock = {targetType: 'datatype', targetId: $rootScope.datatype.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            }
        }
        
        $scope.initPredicate();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);

/**
 * Created by haffo on 1/12/15.
 */

'use strict';

angular.module('igl')
.controller('ForgottenCtrl', ['$scope', '$resource',
    function ($scope, $resource) {
        var ForgottenRequest = $resource('api/sooa/accounts/passwordreset', {username:'@username'});

        $scope.requestResetPassword =  function() {
            var resetReq = new ForgottenRequest();
            resetReq.username = $scope.username;
            resetReq.$save(function() {
                if ( resetReq.text === 'resetRequestProcessed' ) {
                    $scope.username = '';
                }
            });
        };
    }
]);

angular.module('igl').controller(
		'HL7VersionsDlgCtrl',
		["$scope", "$rootScope", "$modal", "$log", "$http", "$httpBackend", "userInfoService", function($scope, $rootScope, $modal, $log, $http, $httpBackend,
				userInfoService) {

			$rootScope.clickSource = {};
			$scope.hl7Version = {};

			$scope.hl7Versions = function(clickSource) {
				$rootScope.clickSource = clickSource;
				if (clickSource === "btn") {
					$rootScope.hl7Version = {};
					$rootScope.igdocument = false;
				}
				var hl7VersionsInstance = $modal.open({
					templateUrl : 'hl7VersionsDlg.html',
					controller : 'HL7VersionsInstanceDlgCtrl',
					resolve : {
						hl7Versions : function() {
							return $scope.listHL7Versions();
						}
					}
				});

				hl7VersionsInstance.result.then(function(result) {
					var hl7Version = $rootScope.hl7Version;
					switch ($rootScope.clickSource) {
					case "btn": {
						$scope.createIGDocument(hl7Version, result);
						break;
					}
					case "ctx": {
						$scope.updateIGDocument(result);
						break;
					}
					}
				});
			};

			$scope.listHL7Versions = function() {
				var hl7Versions = [];
				$http.get('api/igdocuments/findVersions', {
					timeout : 60000
				}).then(function(response) {
					var len = response.data.length;
					for (var i = 0; i < len; i++) {
						hl7Versions.push(response.data[i]);
					}
				});
				return hl7Versions;
			};

			/**
			 * TODO: Handle error from server
			 * 
			 * @param msgIds
			 */
			$scope.createIGDocument = function(hl7Version, msgIds) {
				console.log("Creating igdocument...");
				var iprw = {
					"hl7Version" : hl7Version,
					"msgIds" : msgIds,
					"accountID" : userInfoService.getAccountID(), 
					"timeout" : 60000
				};
				$http.post('api/igdocuments/createIntegrationProfile', iprw)
						.then(
								function(response) {
									var igdocument = angular
											.fromJson(response.data);
									$rootScope
											.$broadcast(
													'event:openIGDocumentRequest',
													igdocument);
									$rootScope.$broadcast('event:IgsPushed',
											igdocument);
								});
				return $rootScope.igdocument;
			};

			/**
			 * TODO: Handle error from server
			 * 
			 * @param msgIds
			 */
			$scope.updateIGDocument = function(msgIds) {
				console.log("Updating igdocument...");
				var iprw = {
					"igdocument" : $rootScope.igdocument,
					"msgIds" : msgIds,
					"timeout" : 60000
				};
				$http.post('api/igdocuments/updateIntegrationProfile', iprw)
						.then(
								function(response) {
									var igdocument = angular
											.fromJson(response.data);
									$rootScope
											.$broadcast(
													'event:openIGDocumentRequest',
													igdocument);
								});
			};

			$scope.closedCtxMenu = function(node, $index) {
				console.log("closedCtxMenu");
			};

		}]);

angular.module('igl').controller(
		'HL7VersionsInstanceDlgCtrl',
		["$scope", "$rootScope", "$modalInstance", "$http", "hl7Versions", "ProfileAccessSvc", function($scope, $rootScope, $modalInstance, $http, hl7Versions,
				ProfileAccessSvc) {

			$scope.selected = {
				item : hl7Versions[0]
			};

			$scope.igdocumentVersions = [];
			var igdocumentVersions = [];

			$scope.loadIGDocumentsByVersion = function() {
				$rootScope.hl7Version = $scope.hl7Version;
				$http.post(
						'api/igdocuments/messageListByVersion', angular.fromJson({
							"hl7Version" : $scope.hl7Version,
							"messageIds" : $scope.igdocumentVersions
						})).then(function(response) {
					$scope.messagesByVersion = angular.fromJson(response.data);
					});
				};

			$scope.trackSelections = function(bool, id) {
				if (bool) {
					igdocumentVersions.push(id);
				} else {
					for (var i = 0; i < igdocumentVersions.length; i++) {
						if (igdocumentVersions[i].id == id) {
							igdocumentVersions.splice(i, 1);
						}
					}
				}
			};

			$scope.$watch(function() {
				return $rootScope.igdocument
			}, function(newValue, oldValue) {
				if ($rootScope.clickSource === "ctx") {
					$scope.hl7Version = newValue.metaData.hl7Version;
					$scope.igdocumentVersions = ProfileAccessSvc.Messages().getMessageIds();
					$scope.loadIGDocumentsByVersion();
				}
			});

//			$scope.getHL7Version = function() {
//				return ProfileAccessSvc.Version();
//			};

			$scope.hl7Versions = hl7Versions;
			$scope.ok = function() {
				$scope.igdocumentVersions = igdocumentVersions;
				$modalInstance.close(igdocumentVersions);
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		}]);

'use strict';

/* "newcap": false */

angular.module('igl')
    .controller('IdleCtrl', ["$scope", "Idle", "Keepalive", "$modal", function($scope, Idle, Keepalive, $modal){
        $scope.started = false;

        function closeModals() {
            if ($scope.warning) {
                $scope.warning.close();
                $scope.warning = null;
            }

            if ($scope.timedout) {
                $scope.timedout.close();
                $scope.timedout = null;
            }
        }

        $scope.$on('IdleStart', function() {
            closeModals();

            $scope.warning = $modal.open({
                templateUrl: 'warning-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        $scope.$on('IdleEnd', function() {
            closeModals();
        });

        $scope.$on('IdleTimeout', function() {
            closeModals();
            $scope.timedout = $modal.open({
                templateUrl: 'timedout-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        $scope.start = function() {
            closeModals();
            Idle.watch();
            $scope.started = true;
        };

        $scope.stop = function() {
            closeModals();
            Idle.unwatch();
            $scope.started = false;

        };
    }]);


/**
 * Created by haffo on 1/12/15.
 */

angular.module('igl')
    .controller('IGDocumentListCtrl', ["$scope", "$rootScope", "Restangular", "$http", "$filter", "$modal", "$cookies", "$timeout", "userInfoService", "ToCSvc", "ContextMenuSvc", "ProfileAccessSvc", "ngTreetableParams", "$interval", "ColumnSettings", "StorageService", function ($scope, $rootScope, Restangular, $http, $filter, $modal, $cookies, $timeout, userInfoService, ToCSvc, ContextMenuSvc, ProfileAccessSvc, ngTreetableParams, $interval, ColumnSettings, StorageService) {
        $scope.loading = false;
        $scope.uiGrid = {};
        $rootScope.igs = [];
        $scope.tmpIgs = [].concat($rootScope.igs);
        $scope.error = null;
        $scope.loading = false;
        $scope.columnSettings = ColumnSettings;
//        $scope.visibleColumns = angular.copy(ColumnSettings.visibleColumns);

        $scope.igDocumentMsg = {};
        $scope.igDocumentConfig = {
            selectedType: null
        };


        $scope.options = {
            'readonly': false
        };

        $scope.igDocumentTypes = [
            {
                name: "Predefined Implementation Guides", type: 'PRELOADED'
            },
            {
                name: "User Implementation Guides", type: 'USER'
            }
        ];
        $scope.loadingIGDocument = false;
        $scope.toEditIGDocumentId = null;
        $scope.verificationResult = null;
        $scope.verificationError = null;
        $scope.csWidth = null;
        $scope.predWidth = null;
        $scope.tableWidth = null;
        $scope.commentWidth = null;
        $scope.loadingSelection = false;
        $scope.accordi = {metaData: false, definition: true, igList: true, igDetails: false};

        $scope.selectIgTab = function (value) {
            if (value === 1) {
                $scope.accordi.igList = false;
                $scope.accordi.igDetails = true;
            } else {
                $scope.accordi.igList = true;
                $scope.accordi.igDetails = false;
            }
        };

        $scope.segmentsParams = new ngTreetableParams({
            getNodes: function (parent) {
                return parent ? parent.fields ? parent.fields : parent.datatype ? $rootScope.datatypesMap[parent.datatype].components : parent.children : $rootScope.segment != null ? $rootScope.segment.fields : [];
            },
            getTemplate: function (node) {
                if ($scope.options.readonly) {
                    return node.type === 'segment' ? 'SegmentReadTree.html' : node.type === 'field' ? 'SegmentFieldReadTree.html' : 'SegmentComponentReadTree.html';
                } else {
                    return node.type === 'segment' ? 'SegmentEditTree.html' : node.type === 'field' ? 'SegmentFieldEditTree.html' : 'SegmentComponentEditTree.html';
                }
            }
        });

        $scope.datatypesParams = new ngTreetableParams({
            getNodes: function (parent) {
                if (parent && parent != null) {

                    if (parent.datatype) {
                        var dt = $rootScope.datatypesMap[parent.datatype];
                        return dt.components;

                    } else {
                        return parent.components;
                    }
                } else {
                    if ($rootScope.datatype != null) {
                        return $rootScope.datatype.components;
                    } else {
                        return [];
                    }
                }
            },
            getTemplate: function (node) {
                if ($scope.options.readonly) {
                    return node.type === 'Datatype' ? 'DatatypeReadTree.html' : node.type === 'component' && !$scope.isDatatypeSubDT(node) ? 'DatatypeComponentReadTree.html' : node.type === 'component' && $scope.isDatatypeSubDT(node) ? 'DatatypeSubComponentReadTree.html' : '';
                } else {
                    return node.type === 'Datatype' ? 'DatatypeEditTree.html' : node.type === 'component' && !$scope.isDatatypeSubDT(node) ? 'DatatypeComponentEditTree.html' : node.type === 'component' && $scope.isDatatypeSubDT(node) ? 'DatatypeSubComponentEditTree.html' : '';
                }
            }
        });


        $scope.isDatatypeSubDT = function (component) {
            if ($rootScope.datatype != null) {
                for (var i = 0, len = $rootScope.datatype.components.length; i < len; i++) {
                    if ($rootScope.datatype.components[i].id === component.id)
                        return false;
                }
            }
            return true;
        };

        $rootScope.closeIGDocument = function () {
            $rootScope.igdocument = null;
            $rootScope.isEditing = false;
            $scope.selectIgTab(0);
            $rootScope.initMaps();
            $rootScope.clearChanges();
        };

        $scope.messagesParams = new ngTreetableParams({
            getNodes: function (parent) {
                if (!parent || parent == null) {
                    if ($rootScope.message != null) {
                        return $rootScope.message.children;
                    } else {
                        return [];
                    }
                } else if (parent.type === 'segmentRef') {
                    return $rootScope.segmentsMap[parent.ref].fields;
                } else if (parent.type === 'field') {
                    return $rootScope.datatypesMap[parent.datatype].components;
                } else if (parent.type === 'component') {
                    return $rootScope.datatypesMap[parent.datatype].components;
                } else if (parent.type === 'group') {
                    return parent.children;
                } else {
                    return [];
                }

            },
            getTemplate: function (node) {
                if ($scope.options.readonly) {

                    if (node.type === 'segmentRef') {
                        return 'MessageSegmentRefReadTree.html';
                    } else if (node.type === 'group') {
                        return 'MessageGroupReadTree.html';
                    } else if (node.type === 'field') {
                        return 'MessageFieldViewTree.html';
                    } else if (node.type === 'component') {
                        return 'MessageComponentViewTree.html';
                    } else {
                        return 'MessageReadTree.html';
                    }
                } else {
                    if (node.type === 'segmentRef') {
                        return 'MessageSegmentRefEditTree.html';
                    } else if (node.type === 'group') {
                        return 'MessageGroupEditTree.html';
                    } else if (node.type === 'field') {
                        return 'MessageFieldViewTree.html';
                    } else if (node.type === 'component') {
                        return 'MessageComponentViewTree.html';
                    } else {
                        return 'MessageEditTree.html';
                    }
                }
            }
//            options: {
//                initialState: 'expanded'
//            }
        });

        /**
         * init the controller
         */
        $scope.initIGDocuments = function () {
            $scope.igDocumentConfig.selectedType = StorageService.get("SelectedIgDocumentType") != null ? StorageService.get("SelectedIgDocumentType") : 'USER';
            $scope.loadIGDocuments();
            $scope.getScrollbarWidth();
            /**
             * On 'event:loginConfirmed', resend all the 401 requests.
             */
            $scope.$on('event:loginConfirmed', function (event) {
                $scope.igDocumentConfig.selectedType = StorageService.get("SelectedIgDocumentType") != null ? StorageService.get("SelectedIgDocumentType") : 'USER';
                $scope.loadIGDocuments();
            });

            $rootScope.$on('event:openIGDocumentRequest', function (event, igdocument) {
                $rootScope.igdocument = igdocument;
                $scope.openIGDocument(igdocument);
            });

            $scope.$on('event:openDatatype', function (event, datatype) {
                $scope.selectDatatype(datatype); // Should we open in a dialog ??
            });

            $scope.$on('event:openSegment', function (event, segment) {
                $scope.selectSegment(segment); // Should we open in a dialog ??
            });

            $scope.$on('event:openMessage', function (event, message) {
                console.log("event:openMessage=" + message);
                $scope.selectMessage(message); // Should we open in a dialog ??
            });

            $scope.$on('event:openTable', function (event, table) {
                $scope.selectTable(table); // Should we open in a dialog ??
            });

            $scope.$on('event:openSection', function (event, section) {
                $scope.selectSection(section); // Should we open in a dialog ??
            });

            $scope.$on('event:openDocumentMetadata', function (event, metaData) {
                $scope.selectDocumentMetaData(metaData); // Should we open in a dialog ??
            });

            $scope.$on('event:openProfileMetadata', function (event, metaData) {
                $scope.selectProfileMetaData(metaData); // Should we open in a dialog ??
            });

            $rootScope.$on('event:SetToC', function (event) {
                $rootScope.tocData = ToCSvc.getToC($rootScope.igdocument);
            });

            $rootScope.$on('event:IgsPushed', function (event, igdocument) {
                if ($scope.igDocumentConfig.selectedType === 'USER') {
                    $rootScope.igs.push(igdocument);
                } else {
                    $scope.igDocumentConfig.selectedType = 'USER';
                    $scope.loadIGDocuments();
                }
            });
        };

        $scope.selectIGDocumentType = function (selectedType) {
            $scope.igDocumentConfig.selectedType = selectedType;
            StorageService.set("SelectedIgDocumentType", selectedType);
            $scope.loadIGDocuments();
        };

        $scope.loadIGDocuments = function () {
            $scope.error = null;
            $rootScope.igs = [];
            $scope.tmpIgs = [].concat($rootScope.igs);
            if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
                waitingDialog.show('Loading IG Documents...', {dialogSize: 'sm', progressType: 'info'});
                $scope.loading = true;
                StorageService.set("SelectedIgDocumentType", $scope.igDocumentConfig.selectedType);
                $http.get('api/igdocuments', {params: {"type": $scope.igDocumentConfig.selectedType}}).then(function (response) {
                    $rootScope.igs = angular.fromJson(response.data);
                    $scope.tmpIgs = [].concat($rootScope.igs);
                    $scope.loading = false;
                    waitingDialog.hide();
                }, function (error) {
                    $scope.loading = false;
                    $scope.error = error.data;
                    waitingDialog.hide();
                });
            }
        };

        $scope.clone = function (igdocument) {
            $scope.toEditIGDocumentId = igdocument.id;
            waitingDialog.show('Copying IG Document...', {dialogSize: 'sm', progressType: 'info'});
            $http.post('api/igdocuments/' + igdocument.id + '/clone').then(function (response) {
                $scope.toEditIGDocumentId = null;
                if ($scope.igDocumentConfig.selectedType === 'USER') {
                    $rootScope.igs.push(angular.fromJson(response.data));
                } else {
                    $scope.igDocumentConfig.selectedType = 'USER';
                    $scope.loadIGDocuments();
                }
                waitingDialog.hide();
            }, function (error) {
                $scope.toEditIGDocumentId = null;
                waitingDialog.hide();
            });
        };

        $scope.findOne = function (id) {
            for (var i = 0; i < $rootScope.igs.length; i++) {
                if ($rootScope.igs[i].id === id) {
                    return  $rootScope.igs[i];
                }
            }
            return null;
        };

        $scope.show = function (igdocument) {
            $scope.toEditIGDocumentId = igdocument.id;
            try {
                if ($rootScope.igdocument != null && $rootScope.igdocument === igdocument) {
                    $scope.openIGDocument(igdocument);
                } else if ($rootScope.igdocument && $rootScope.igdocument != null && $rootScope.hasChanges()) {
                    $scope.confirmOpen(igdocument);
                    $scope.toEditIGDocumentId = null;
                } else {
                    $scope.openIGDocument(igdocument);
                }
            } catch (e) {
                $rootScope.msg().text = "igInitFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
                $scope.loadingIGDocument = false;
                $scope.toEditIGDocumentId = null;
            }
        };

        $scope.edit = function (igdocument) {
            $scope.options.readonly = false;
            $scope.show(igdocument);
        };

        $scope.view = function (igdocument) {
            $scope.options.readonly = true;
            $scope.show(igdocument);
        };

        $scope.openIGDocument = function (igdocument) {
            if (igdocument != null) {
                waitingDialog.show('Opening IG Document...', {dialogSize: 'sm', progressType: 'info'});
                $scope.selectIgTab(1);
                $timeout(function () {
                    $scope.loadingIGDocument = true;
                    $rootScope.isEditing = true;
                    $rootScope.igdocument = igdocument;
                    $rootScope.igdocument.profile.messages.children = $filter('orderBy')($rootScope.igdocument.profile.messages.children, 'label');
                    $rootScope.igdocument.profile.segments.children = $filter('orderBy')($rootScope.igdocument.profile.segments.children, 'label');
                    $rootScope.igdocument.profile.datatypes.children = $filter('orderBy')($rootScope.igdocument.profile.datatypes.children, 'label');
                    $rootScope.igdocument.profile.tables.children = $filter('orderBy')($rootScope.igdocument.profile.tables.children, 'label');
                    $rootScope.tocData = ToCSvc.getToC($rootScope.igdocument);
                    $rootScope.initMaps();
                    $rootScope.messages = $rootScope.igdocument.profile.messages.children;
                    angular.forEach($rootScope.igdocument.profile.datatypes.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                    }, $rootScope.datatypesMap);
                    angular.forEach($rootScope.igdocument.profile.segments.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                    }, $rootScope.segmentsMap);

                    angular.forEach($rootScope.igdocument.profile.tables.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                        angular.forEach(child.codes, function (code) {
                            if (code.displayName) { // TODO: Change displayName to label
                                code.label = code.displayName;
                            }
                        });
                    }, $rootScope.tablesMap);

                    $rootScope.segments = [];
                    $rootScope.tables = $rootScope.igdocument.profile.tables.children;
                    $rootScope.datatypes = $rootScope.igdocument.profile.datatypes.children;

                    angular.forEach($rootScope.igdocument.profile.messages.children, function (child) {
                        this[child.id] = child;
                        var cnt = 0;
                        angular.forEach(child.children, function (segmentRefOrGroup) {
                            $rootScope.processElement(segmentRefOrGroup);
                        });
                    }, $rootScope.messagesMap);

                    if (!$rootScope.config || $rootScope.config === null) {
                        $http.get('api/igdocuments/config').then(function (response) {
                            $rootScope.config = angular.fromJson(response.data);
                            $scope.loadingIGDocument = false;
                            $scope.toEditIGDocumentId = null;
                            $scope.selectDocumentMetaData();
                        }, function (error) {
                            $scope.loadingIGDocument = false;
                            $scope.toEditIGDocumentId = null;
                        });
                    } else {
                        $scope.loadingIGDocument = false;
                        $scope.toEditIGDocumentId = null;
                        $scope.selectDocumentMetaData();
                    }
                    waitingDialog.hide();
                }, 100);
            }
        };

        $scope.collectData = function (node, segRefOrGroups, segments, datatypes) {
            if (node) {
                if (node.type === 'message') {
                    angular.forEach(node.children, function (segmentRefOrGroup) {
                        $scope.collectData(segmentRefOrGroup, segRefOrGroups, segments, datatypes);
                    });
                } else if (node.type === 'group') {
                    segRefOrGroups.push(node);
                    if (node.children) {
                        angular.forEach(node.children, function (segmentRefOrGroup) {
                            $scope.collectData(segmentRefOrGroup, segRefOrGroups, segments, datatypes);
                        });
                    }
                    segRefOrGroups.push({ name: node.name, "type": "end-group"});
                } else if (node.type === 'segment') {
                    if (segments.indexOf(node) === -1) {
                        segments.push(node);
                    }
                    angular.forEach(node.fields, function (field) {
                        $scope.collectData(field, segRefOrGroups, segments, datatypes);
                    });
                } else if (node.type === 'segmentRef') {
                    segRefOrGroups.push(node);
                    $scope.collectData($rootScope.segmentsMap[node.ref], segRefOrGroups, segments, datatypes);
                } else if (node.type === 'component' || node.type === 'subcomponent' || node.type === 'field') {
                    $scope.collectData($rootScope.datatypesMap[node.datatype], segRefOrGroups, segments, datatypes);
                } else if (node.type === 'datatype') {
                    if (datatypes.indexOf(node) === -1) {
                        datatypes.push(node);
                    }
                    if (node.components) {
                        angular.forEach(node.children, function (component) {
                            $scope.collectData(component, segRefOrGroups, segments, datatypes);
                        });
                    }
                }
            }
        };

        $scope.confirmDelete = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentDeleteCtrl.html',
                controller: 'ConfirmIGDocumentDeleteCtrl',
                resolve: {
                    igdocumentToDelete: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function (igdocument) {
                $scope.igdocumentToDelete = igdocument;
                var idxP = _.findIndex($scope.igs, function (child) {
                    return child.id === igdocument.id;
                });
                $scope.igs.splice(idxP, 1);
            });
        };

        $scope.confirmClose = function () {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentCloseCtrl.html',
                controller: 'ConfirmIGDocumentCloseCtrl'
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };

        $scope.confirmOpen = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentOpenCtrl.html',
                controller: 'ConfirmIGDocumentOpenCtrl',
                resolve: {
                    igdocumentToOpen: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function (igdocument) {
                $scope.openIGDocument(igdocument);
            }, function () {
            });
        };
        
        
        $scope.selectMessages = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'SelectMessagesOpenCtrl.html',
                controller: 'SelectMessagesOpenCtrl',
                resolve: {
                    igdocumentToSelect: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };
        
        
        $scope.exportAsMessages = function (id, mids) {
        	var form = document.createElement("form");
            form.action = $rootScope.api('api/igdocuments/' + id + '/export/pdf/' + mids);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        }
        
        $scope.exportAs = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/igdocuments/' + id + '/export/' + format);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.exportDelta = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/igdocuments/' + id + '/delta/' + format);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.close = function () {
            if ($rootScope.hasChanges()) {
                $scope.confirmClose();
            } else {
                waitingDialog.show('Closing igdocument...', {dialogSize: 'sm', progressType: 'info'});
                $rootScope.closeIGDocument();
                waitingDialog.hide();
            }
        };

        $scope.gotoSection = function (obj, type) {
            $rootScope.section['data'] = obj;
            $rootScope.section['type'] = type;
        };

        $scope.save = function () {
            $scope.igDocumentMsg = {};
            waitingDialog.show('Saving changes...', {dialogSize: 'sm', progressType: 'success'});
            var changes = angular.toJson($rootScope.changes);
            $rootScope.igdocument.accountId = userInfoService.getAccountID();
            var data = angular.fromJson(
                    {
                        "changes": changes, "igDocument": $rootScope.igdocument
                    }
            );
            $http.post('api/igdocuments/save', data).then(function (response) {
                var saveResponse = angular.fromJson(response.data);
                $rootScope.igdocument.metaData.date = saveResponse.date;
                $rootScope.igdocument.metaData.version = saveResponse.version;
                var found = $scope.findOne($rootScope.igdocument.id);
                if (found != null) {
                    var index = $rootScope.igs.indexOf(found);
                    if (index > 0) {
                        $rootScope.igs [index] = $rootScope.igdocument;
                    }
                }
                $scope.igDocumentMsg.text = saveResponse.text;
                $scope.igDocumentMsg.type = saveResponse.type;
                $scope.igDocumentMsg.show = true;
                $rootScope.clearChanges();
                waitingDialog.hide();
            }, function (error) {
                $scope.igDocumentMsg.text = error.data.text;
                $scope.igDocumentMsg.type = error.data.type;
                $scope.igDocumentMsg.show = true;
                waitingDialog.hide();
            });
        };

        $scope.exportChanges = function () {
            var form = document.createElement("form");
            form.action = 'api/igdocuments/export/changes';
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("textarea");
            input.name = "content";
            input.value = angular.fromJson($rootScope.changes);
            form.appendChild(input);
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.viewChanges = function (changes) {
            var modalInstance = $modal.open({
                templateUrl: 'ViewIGChangesCtrl.html',
                controller: 'ViewIGChangesCtrl',
                resolve: {
                    changes: function () {
                        return changes;
                    }
                }
            });
            modalInstance.result.then(function (changes) {
                $scope.changes = changes;
            }, function () {
            });
        };


        $scope.reset = function () {
            $rootScope.changes = {};
            $rootScope.closeIGDocument();
        };


        $scope.initIGDocument = function () {
            $scope.loading = true;
            if ($rootScope.igdocument != null && $rootScope.igdocument != undefined)
                $scope.gotoSection($rootScope.igdocument.metaData, 'metaData');
            $scope.loading = false;

        };

        $scope.createGuide = function () {
            $scope.isVersionSelect = true;
        };

        $scope.listHL7Versions = function () {
            var hl7Versions = [];
            $http.get('api/igdocuments/hl7/findVersions', {
                timeout: 60000
            }).then(
                function (response) {
                    var len = response.data.length;
                    for (var i = 0; i < len; i++) {
                        hl7Versions.push(response.data[i]);
                    }
                });
            return hl7Versions;
        };

        $scope.showSelected = function (node) {
            $scope.selectedNode = node;
        };

        $scope.selectSegment = function (segment) {
            $scope.subview = "EditSegments.html";
            if (segment && segment != null) {
                $scope.loadingSelection = true;
                $rootScope.segment = segment;
                $rootScope.segment["type"] = "segment";
                $timeout(
                    function () {
                        $scope.tableWidth = null;
                        $scope.scrollbarWidth = $scope.getScrollbarWidth();
                        $scope.csWidth = $scope.getDynamicWidth(1, 3, 990);
                        $scope.predWidth = $scope.getDynamicWidth(1, 3, 990);
                        $scope.commentWidth = $scope.getDynamicWidth(1, 3, 990);
                        if ($scope.segmentsParams)
                            $scope.segmentsParams.refresh();
                        $scope.loadingSelection = false;
                    }, 100);
            }
        };

        $scope.selectDocumentMetaData = function () {
            $scope.subview = "EditDocumentMetadata.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $scope.loadingSelection = false;
                }, 100);
        };

        $scope.selectProfileMetaData = function () {
            $scope.subview = "EditProfileMetadata.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $scope.loadingSelection = false;
                }, 100);
        };

        $scope.selectDatatype = function (datatype) {
            $scope.subview = "EditDatatypes.html";
            if (datatype && datatype != null) {
                $scope.loadingSelection = true;
                $rootScope.datatype = datatype;
                $rootScope.datatype["type"] = "datatype";
                $timeout(
                    function () {
                        $scope.tableWidth = null;
                        $scope.scrollbarWidth = $scope.getScrollbarWidth();
                        $scope.csWidth = $scope.getDynamicWidth(1, 3, 890);
                        $scope.predWidth = $scope.getDynamicWidth(1, 3, 890);
                        $scope.commentWidth = $scope.getDynamicWidth(1, 3, 890);
                        if ($scope.datatypesParams)
                            $scope.datatypesParams.refresh();
                        $scope.loadingSelection = false;
                    }, 100);
            }
        };

        $scope.selectMessage = function (message) {
            $scope.subview = "EditMessages.html";
            $scope.loadingSelection = true;
            $rootScope.message = message;
            $timeout(
                function () {
                    $scope.tableWidth = null;
                    $scope.scrollbarWidth = $scope.getScrollbarWidth();
                    $scope.csWidth = $scope.getDynamicWidth(1, 3, 630);
                    $scope.predWidth = $scope.getDynamicWidth(1, 3, 630);
                    $scope.commentWidth = $scope.getDynamicWidth(1, 3, 630);
                    if ($scope.messagesParams)
                        $scope.messagesParams.refresh();
                    $scope.loadingSelection = false;
                }, 100);
        };

        $scope.selectTable = function (table) {
            $scope.subview = "EditValueSets.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $rootScope.table = table;
                    $rootScope.codeSystems = [];

                    for (var i = 0; i < $rootScope.table.codes.length; i++) {
                        if ($rootScope.codeSystems.indexOf($rootScope.table.codes[i].codeSystem) < 0) {
                            if ($rootScope.table.codes[i].codeSystem && $rootScope.table.codes[i].codeSystem !== '') {
                                $rootScope.codeSystems.push($rootScope.table.codes[i].codeSystem);
                            }
                        }
                    }
                    $scope.loadingSelection = false;
                }, 100);
        };

        $scope.selectSection = function (section) {
            $scope.subview = "EditSections.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $rootScope.section = section;
                    $scope.loadingSelection = false;
                }, 100);
        };


        $scope.getTableWidth = function () {
            if ($scope.tableWidth === null || $scope.tableWidth == 0) {
                $scope.tableWidth = $("#nodeDetailsPanel").width();
            }
            return $scope.tableWidth;
        };

        $scope.getDynamicWidth = function (a, b, otherColumsWidth) {
            var tableWidth = $scope.getTableWidth();
            if (tableWidth > 0) {
                var left = tableWidth - otherColumsWidth;
                return {"width": a * parseInt(left / b) + "px"};
            }
            return "";
        };


        $scope.getConstraintAsString = function (constraint) {
            return constraint.constraintId + " - " + constraint.description;
        };

        $scope.getConformanceStatementAsString = function (constraint) {
            return "[" + constraint.constraintId + "]" + constraint.description;
        };

        $scope.getPredicateAsString = function (constraint) {
            return constraint.description;
        };

        $scope.getConstraintsAsString = function (constraints) {
            var str = '';
            for (var index in constraints) {
                str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
            }
            return str;
        };

        $scope.getPredicatesAsMultipleLinesString = function (node) {
            var html = "";
            angular.forEach(node.predicates, function (predicate) {
                html = html + "<p>" + predicate.description + "</p>";
            });
            return html;
        };

        $scope.getPredicatesAsOneLineString = function (node) {
            var html = "";
            angular.forEach(node.predicates, function (predicate) {
                html = html + predicate.description;
            });
            return $sce.trustAsHtml(html);
        };


        $scope.getConfStatementsAsMultipleLinesString = function (node) {
            var html = "";
            angular.forEach(node.conformanceStatements, function (conStatement) {
                html = html + "<p>" + conStatement.id + " : " + conStatement.description + "</p>";
            });
            return html;
        };

        $scope.getConfStatementsAsOneLineString = function (node) {
            var html = "";
            angular.forEach(node.conformanceStatements, function (conStatement) {
                html = html + conStatement.id + " : " + conStatement.description;
            });
            return $sce.trustAsHtml(html);
        };

        $scope.getSegmentRefNodeName = function (node) {
            return node.position + "." + $rootScope.segmentsMap[node.ref].name + ":" + $rootScope.segmentsMap[node.ref].description;
        };

        $scope.getGroupNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getFieldNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getComponentNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getDatatypeNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.onColumnToggle = function (item) {
            $scope.columnSettings.save();
        };

        $scope.getFullName = function () {
            if (userInfoService.isAuthenticated() === true) {
                return userInfoService.getFullName();
            }
            return '';
        };
    }]);

angular.module('igl').controller('ViewIGChangesCtrl', ["$scope", "$modalInstance", "changes", "$rootScope", "$http", function ($scope, $modalInstance, changes, $rootScope, $http) {
    $scope.changes = changes;
    $scope.loading = false;
    $scope.exportChanges = function () {
        $scope.loading = true;
        waitingDialog.show('Exporting changes...', {dialogSize: 'sm', progressType: 'success'});
        var form = document.createElement("form");
        form.action = 'api/igdocuments/export/changes';
        form.method = "POST";
        form.target = "_target";
        form.style.display = 'none';
        form.params = document.body.appendChild(form);
        form.submit();
        waitingDialog.hide();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


angular.module('igl').controller('ConfirmIGDocumentDeleteCtrl', ["$scope", "$modalInstance", "igdocumentToDelete", "$rootScope", "$http", function ($scope, $modalInstance, igdocumentToDelete, $rootScope, $http) {
    $scope.igdocumentToDelete = igdocumentToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;
        $http.post($rootScope.api('api/igdocuments/' + $scope.igdocumentToDelete.id + '/delete')).then(function (response) {
            var index = $rootScope.igs.indexOf($scope.igdocumentToDelete);
            if (index > -1) $rootScope.igs.splice(index, 1);
            $rootScope.backUp = null;
            if ($scope.igdocumentToDelete === $rootScope.igdocument) {
                $rootScope.closeIGDocument();
            }
            $rootScope.msg().text = "igDeleteSuccess";
            $rootScope.msg().type = "success";
            $rootScope.msg().show = true;
            $rootScope.manualHandle = true;
            $scope.igdocumentToDelete = null;
            $scope.loading = false;

            $modalInstance.close($scope.igdocumentToDelete);

        }, function (error) {
            $scope.error = error;
            $scope.loading = false;
            $modalInstance.dismiss('cancel');
            $rootScope.msg().text = "igDeleteFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;

// waitingDialog.hide();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


angular.module('igl').controller('ConfirmIGDocumentCloseCtrl', ["$scope", "$modalInstance", "$rootScope", "$http", function ($scope, $modalInstance, $rootScope, $http) {
    $scope.loading = false;
    $scope.discardChangesAndClose = function () {
        $scope.loading = true;
        $http.get('api/igdocuments/' + $rootScope.igdocument.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.igdocument);
            $rootScope.igs[index] = angular.fromJson(response.data);
            $scope.loading = false;
            $scope.clear();
        }, function (error) {
            $scope.loading = false;
            $rootScope.msg().text = "igResetFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
            $modalInstance.dismiss('cancel');
        });
    };

    $scope.clear = function () {
        $rootScope.closeIGDocument();
        $modalInstance.close();
    };

    $scope.saveChangesAndClose = function () {
        $scope.loading = true;
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "igdocument": $rootScope.igdocument};
        $http.post('api/igdocuments/' + $rootScope.igdocument.id + '/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.igdocument.metaData.date = saveResponse.date;
            $rootScope.igdocument.metaData.version = saveResponse.version;
            $scope.loading = false;
            $scope.clear();
        }, function (error) {
            $rootScope.msg().text = "igSaveFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
            $scope.loading = false;
            $modalInstance.dismiss('cancel');
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);


angular.module('igl').controller('ConfirmIGDocumentOpenCtrl', ["$scope", "$modalInstance", "igdocumentToOpen", "$rootScope", "$http", function ($scope, $modalInstance, igdocumentToOpen, $rootScope, $http) {
    $scope.igdocumentToOpen = igdocumentToOpen;
    $scope.loading = false;
    $scope.discardChangesAndOpen = function () {
        $scope.loading = true;
        $http.get('api/igdocuments/' + $rootScope.igdocument.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.igdocument);
            $rootScope.igs[index] = angular.fromJson(response.data);
            $scope.loading = false;
            $modalInstance.close($scope.igdocumentToOpen);
        }, function (error) {
            $scope.loading = false;
            $rootScope.msg().text = "igResetFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
            $modalInstance.dismiss('cancel');
        });
    };

    $scope.saveChangesAndOpen = function () {
        $scope.loading = true;
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "igdocument": $rootScope.igdocument};
        $http.post('api/igdocuments/' + $rootScope.igdocument.id + '/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.igdocument.metaData.date = saveResponse.date;
            $rootScope.igdocument.metaData.version = saveResponse.version;
            $scope.loading = false;
            $modalInstance.close($scope.igdocumentToOpen);
        }, function (error) {
            $rootScope.msg().text = "igSaveFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
            $scope.loading = false;
            $modalInstance.dismiss('cancel');
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('igl').controller('SelectMessagesOpenCtrl', ["$scope", "$modalInstance", "igdocumentToSelect", "$rootScope", "$http", "$cookies", function ($scope, $modalInstance, igdocumentToSelect, $rootScope, $http, $cookies) {
    $scope.igdocumentToSelect = igdocumentToSelect;
    $scope.selectedMessagesIDs = [];
    $scope.loading = false;


    $scope.trackSelections = function(bool, id) {
		if (bool) {
			$scope.selectedMessagesIDs.push(id);
		} else {
			for (var i = 0; i < $scope.selectedMessagesIDs.length; i++) {
				if ($scope.selectedMessagesIDs[i].id == id) {
					$scope.selectedMessagesIDs.splice(i, 1);
				}
			}
		}
	};
	
	 $scope.exportAsMessages = function (id, mids) {
     	var form = document.createElement("form");
     	console.log("ID: " + id);
     	console.log("Message IDs: " + mids);
     	form.action = $rootScope.api('api/igdocuments/' + id + '/export/zip/' + mids);
     	form.method = "POST";
     	form.target = "_target";
     	var csrfInput = document.createElement("input");
     	csrfInput.name = "X-XSRF-TOKEN";
     	csrfInput.value = $cookies['XSRF-TOKEN'];
     	form.appendChild(csrfInput);
     	form.style.display = 'none';
     	document.body.appendChild(form);
     	form.submit();
     }
	 
	
	$scope.exportAsZIPforSelectedMessages = function () {
		$scope.loading = true;
		$scope.exportAsMessages($scope.igdocumentToSelect.id,$scope.selectedMessagesIDs);
        $scope.loading = false;
    };
    
    $scope.exportAsZIPDisplayforSelectedMessages = function () {
		$scope.loading = true;
		$scope.exportAsMessages($scope.igdocumentToSelect.id,$scope.selectedMessagesIDs);
        $scope.loading = false;
    };
    

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

'use strict';

angular.module('igl').controller('IssueCtrl', ['$scope', '$resource',
    function ($scope, $resource) {
        var Issue = $resource('api/sooa/issues/:id');

        $scope.clearIssue = function() {
            $scope.issue.title = '';
            $scope.issue.description = '';
            $scope.issue.email = '';
        };

        $scope.submitIssue = function() {
            var issueToReport = new Issue($scope.issue);
            issueToReport.$save(function() {
                if ( issueToReport.text === '') {
                    $scope.clearIssue();
                }
            });
        };
    }
]);

'use strict';

angular.module('igl').controller('MainCtrl', ['$scope', '$rootScope', 'i18n', '$location', 'userInfoService', '$modal','Restangular','$filter','base64','$http','Idle',
    function ($scope, $rootScope, i18n, $location, userInfoService, $modal,Restangular,$filter,base64,$http,Idle) {
        //This line fetches the info from the server if the user is currently logged in.
        //If success, the app is updated according to the role.
        userInfoService.loadFromServer();
        $rootScope.loginDialog = null;

        $scope.language = function () {
            return i18n.language;
        };

        $scope.setLanguage = function (lang) {
            i18n.setLanguage(lang);
        };

        $scope.activeWhen = function (value) {
            return value ? 'active' : '';
        };

        $scope.activeIfInList = function(value, pathsList) {
            var found = false;
            if ( angular.isArray(pathsList) === false ) {
                return '';
            }
            var i = 0;
            while ( (i < pathsList.length) && (found === false)) {
                if ( pathsList[i] === value ) {
                    return 'active';
                }
                i++;
            }
            return '';
        };

        $scope.path = function () {
            return $location.url();
        };

        $scope.login = function () {
//        console.log("in login");
            $scope.$emit('event:loginRequest', $scope.username, $scope.password);
        };

        $scope.loginReq = function () {
//        console.log("in loginReq");
            if ($rootScope.loginMessage()){
                $rootScope.loginMessage().text="";
                $rootScope.loginMessage().show=false;
            }
            $scope.$emit('event:loginRequired');
        };

        $scope.logout = function () {
            if ($rootScope.igdocument && $rootScope.igdocument != null && $rootScope.hasChanges()) {
                var modalInstance = $modal.open({
                    templateUrl: 'ConfirmLogout.html',
                    controller: 'ConfirmLogoutCtrl'
                });
                modalInstance.result.then(function () {
                    $scope.execLogout();
                }, function () {
                });
            }else{
                $scope.execLogout();
            }
        };

        $scope.execLogout = function () {
            userInfoService.setCurrentUser(null);
            $scope.username = $scope.password = null;
            $scope.$emit('event:logoutRequest');
            $rootScope.initMaps();
            $rootScope.igdocument = null;
            $location.url('/home');
        };

        $scope.cancel = function () {
            $scope.$emit('event:loginCancel');
        };

        $scope.isAuthenticated = function() {
            return userInfoService.isAuthenticated();
        };

        $scope.isPending = function() {
            return userInfoService.isPending();
        };


        $scope.isSupervisor = function() {
            return userInfoService.isSupervisor();
        };

        $scope.isVendor = function() {
            return userInfoService.isAuthorizedVendor();
        };

        $scope.isAuthor = function() {
            return userInfoService.isAuthor();
        };

        $scope.isCustomer = function() {
            return userInfoService.isCustomer();
        };

        $scope.isAdmin = function() {
            return userInfoService.isAdmin();
        };

        $scope.getRoleAsString = function() {
            if ( $scope.isAuthor() === true ) { return 'author'; }
            if ( $scope.isSupervisor() === true ) { return 'Supervisor'; }
            if ( $scope.isAdmin() === true ) { return 'Admin'; }
            return 'undefined';
        };

        $scope.getUsername = function() {
            if ( userInfoService.isAuthenticated() === true ) {
                return userInfoService.getUsername();
            }
            return '';
        };

        $rootScope.showLoginDialog = function (username, password) {

            if ($rootScope.loginDialog && $rootScope.loginDialog != null && $rootScope.loginDialog.opened) {
                $rootScope.loginDialog.dismiss('cancel');
            }

            $rootScope.loginDialog = $modal.open({
                backdrop: 'static',
                keyboard: 'false',
                controller: 'LoginCtrl',
                size: 'lg',
                templateUrl: 'views/account/login.html',
                resolve: {
                    user: function () {
                        return {username: $scope.username, password: $scope.password};
                    }
                }
            });

            $rootScope.loginDialog.result.then(function (result) {
                if (result) {
                    $scope.username = result.username;
                    $scope.password = result.password;
                    $scope.login();
                } else {
                    $scope.cancel();
                }
            });
        };

        $rootScope.started = false;

        Idle.watch();

        $rootScope.$on('IdleStart', function() {
            closeModals();
            $rootScope.warning = $modal.open({
                templateUrl: 'warning-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        $rootScope.$on('IdleEnd', function() {
            closeModals();
        });

        $rootScope.$on('IdleTimeout', function() {
            closeModals();
            if( $scope.isAuthenticated) {
                $scope.logout();
            }
            $rootScope.timedout = $modal.open({
                templateUrl: 'timedout-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        function closeModals() {
            if ($rootScope.warning) {
                $rootScope.warning.close();
                $rootScope.warning = null;
            }

            if ($rootScope.timedout) {
                $rootScope.timedout.close();
                $rootScope.timedout = null;
            }
        };

        $rootScope.start = function() {
            closeModals();
            Idle.watch();
            $rootScope.started = true;
        };

        $rootScope.stop = function() {
            closeModals();
            Idle.unwatch();
            $rootScope.started = false;

        };


        $scope.checkForIE = function() {
            var BrowserDetect = {
                init: function () {
                    this.browser = this.searchString(this.dataBrowser) || 'An unknown browser';
                    this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'an unknown version';
                    this.OS = this.searchString(this.dataOS) || 'an unknown OS';
                },
                searchString: function (data) {
                    for (var i=0;i<data.length;i++) {
                        var dataString = data[i].string;
                        var dataProp = data[i].prop;
                        this.versionSearchString = data[i].versionSearch || data[i].identity;
                        if (dataString) {
                            if (dataString.indexOf(data[i].subString) !== -1) {
                                return data[i].identity;
                            }
                        }
                        else if (dataProp) {
                            return data[i].identity;
                        }
                    }
                },
                searchVersion: function (dataString) {
                    var index = dataString.indexOf(this.versionSearchString);
                    if (index === -1) { return; }
                    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
                },
                dataBrowser: [
                    {
                        string: navigator.userAgent,
                        subString: 'Chrome',
                        identity: 'Chrome'
                    },
                    {   string: navigator.userAgent,
                        subString: 'OmniWeb',
                        versionSearch: 'OmniWeb/',
                        identity: 'OmniWeb'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'Apple',
                        identity: 'Safari',
                        versionSearch: 'Version'
                    },
                    {
                        prop: window.opera,
                        identity: 'Opera',
                        versionSearch: 'Version'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'iCab',
                        identity: 'iCab'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'KDE',
                        identity: 'Konqueror'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'Firefox',
                        identity: 'Firefox'
                    },
                    {
                        string: navigator.vendor,
                        subString: 'Camino',
                        identity: 'Camino'
                    },
                    {       // for newer Netscapes (6+)
                        string: navigator.userAgent,
                        subString: 'Netscape',
                        identity: 'Netscape'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'MSIE',
                        identity: 'Explorer',
                        versionSearch: 'MSIE'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'Gecko',
                        identity: 'Mozilla',
                        versionSearch: 'rv'
                    },
                    {       // for older Netscapes (4-)
                        string: navigator.userAgent,
                        subString: 'Mozilla',
                        identity: 'Netscape',
                        versionSearch: 'Mozilla'
                    }
                ],
                dataOS : [
                    {
                        string: navigator.platform,
                        subString: 'Win',
                        identity: 'Windows'
                    },
                    {
                        string: navigator.platform,
                        subString: 'Mac',
                        identity: 'Mac'
                    },
                    {
                        string: navigator.userAgent,
                        subString: 'iPhone',
                        identity: 'iPhone/iPod'
                    },
                    {
                        string: navigator.platform,
                        subString: 'Linux',
                        identity: 'Linux'
                    }
                ]

            };
            BrowserDetect.init();

            if ( BrowserDetect.browser === 'Explorer' ) {
                var title = 'You are using Internet Explorer';
                var msg = 'This site is not yet optimized with Internet Explorer. For the best user experience, please use Chrome, Firefox or Safari. Thank you for your patience.';
                var btns = [{result:'ok', label: 'OK', cssClass: 'btn'}];

                //$dialog.messageBox(title, msg, btns).open();



            }
        };


        $rootScope.readonly = false;
        $rootScope.igdocument = null; // current igdocument
        $rootScope.message = null; // current message
        $rootScope.datatype = null; // current datatype

        $rootScope.pages = ['list', 'edit', 'read'];
        $rootScope.context = {page: $rootScope.pages[0]};
        $rootScope.messagesMap = {}; // Map for Message;key:id, value:object
        $rootScope.segmentsMap = {};  // Map for Segment;key:id, value:object
        $rootScope.datatypesMap = {}; // Map for Datatype; key:id, value:object
        $rootScope.tablesMap = {};// Map for tables; key:id, value:object
        $rootScope.segments = [];// list of segments of the selected messages
        $rootScope.datatypes = [];// list of datatypes of the selected messages
        $rootScope.segmentPredicates = [];// list of segment level predicates of the selected messages
        $rootScope.segmentConformanceStatements = [];// list of segment level Conformance Statements of the selected messages
        $rootScope.datatypePredicates = [];// list of segment level predicates of the selected messages
        $rootScope.datatypeConformanceStatements = [];// list of segment level Conformance Statements of the selected messages
        $rootScope.tables = [];// list of tables of the selected messages
        $rootScope.postfixCloneTable = 'CA';
        $rootScope.newCodeFakeId = 0;
        $rootScope.newTableFakeId = 0;
        $rootScope.newPredicateFakeId = 0;
        $rootScope.newConformanceStatementFakeId = 0;
        $rootScope.segment = null;
        $rootScope.config= null;
        $rootScope.messagesData = [];
        $rootScope.messages = [];// list of messages
        $rootScope.customIgs=[];
        $rootScope.preloadedIgs = [];
        $rootScope.changes = {};
        $rootScope.generalInfo = {type: null, 'message': null};
        $rootScope.references =[]; // collection of element referencing a datatype to delete
        $rootScope.section = {};
        $rootScope.parentsMap = {};
        $rootScope.igChanged = false;

        $scope.scrollbarWidth = 0;


        // TODO: remove
        $rootScope.selectIGDocumentTab = function (value) {
//        $rootScope.igdocumentTabs[0] = false;
//        $rootScope.igdocumentTabs[1] = false;
//        $rootScope.igdocumentTabs[2] = false;
//        $rootScope.igdocumentTabs[3] = false;
//        $rootScope.igdocumentTabs[4] = false;
//        $rootScope.igdocumentTabs[5] = false;
//        $rootScope.igdocumentTabs[value] = true;
        };

        $scope.getScrollbarWidth = function() {
            if($scope.scrollbarWidth == 0) {
                var outer = document.createElement("div");
                outer.style.visibility = "hidden";
                outer.style.width = "100px";
                outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

                document.body.appendChild(outer);

                var widthNoScroll = outer.offsetWidth;
                // force scrollbars
                outer.style.overflow = "scroll";

                // add innerdiv
                var inner = document.createElement("div");
                inner.style.width = "100%";
                outer.appendChild(inner);

                var widthWithScroll = inner.offsetWidth;

                // remove divs
                outer.parentNode.removeChild(outer);

                $scope.scrollbarWidth = widthNoScroll - widthWithScroll;
            }

            return $scope.scrollbarWidth;
        };
        $rootScope.initMaps = function () {
            $rootScope.segment = null;
            $rootScope.datatype = null;
            $rootScope.message = null;
            $rootScope.table = null;
            $rootScope.codeSystems = [];
            $rootScope.messagesMap = {};
            $rootScope.segmentsMap = {};
            $rootScope.datatypesMap = {};
            $rootScope.tablesMap = {};
            $rootScope.segments = [];
            $rootScope.tables = [];
            $rootScope.segmentPredicates = [];
            $rootScope.segmentConformanceStatements = [];
            $rootScope.datatypePredicates = [];
            $rootScope.datatypeConformanceStatements = [];
            $rootScope.datatypes = [];
            $rootScope.messages = [];
            $rootScope.messagesData = [];
            $rootScope.newCodeFakeId = 0;
            $rootScope.newTableFakeId = 0;
            $rootScope.newPredicateFakeId = 0;
            $rootScope.newConformanceStatementFakeId = 0;
            $rootScope.clearChanges();
            $rootScope.parentsMap = [];
        };

        $rootScope.$watch(function () {
            return $location.path();
        }, function (newLocation, oldLocation) {
            $rootScope.setActive(newLocation);
        });



        $rootScope.api = function (value) {
            return  value;
        };


        $rootScope.isActive = function (path) {
            return path === $rootScope.activePath;
        };

        $rootScope.setActive = function (path) {
            if (path === '' || path === '/') {
                $location.path('/home');
            } else {
                $rootScope.activePath = path;
            }
        };

        $rootScope.clearChanges = function (path) {
//        $rootScope.changes = {};
            $rootScope.igChanged = false;
        };

        $rootScope.hasChanges = function(){
            //return Object.getOwnPropertyNames($rootScope.changes).length !== 0;
            return $rootScope.igChanged;
        };

        $rootScope.recordChanged = function(){
            $rootScope.igChanged = true;
        };

        $rootScope.recordChange = function(object,changeType) {
//        var type = object.type;
//
//
//        if($rootScope.changes[type] === undefined){
//            $rootScope.changes[type] = {};
//        }
//
//        if($rootScope.changes[type][object.id] === undefined){
//            $rootScope.changes[type][object.id] = {};
//        }
//
//        if(changeType === "datatype"){
//            $rootScope.changes[type][object.id][changeType] = object[changeType].id;
//        }else{
//            $rootScope.changes[type][object.id][changeType] = object[changeType];
//        }
//
//        console.log("Change is " + $rootScope.changes[type][object.id][changeType]);
            $rootScope.recordChanged();
        };


        $rootScope.recordChange2 = function(type,id,attr,value) {
//        if($rootScope.changes[type] === undefined){
//            $rootScope.changes[type] = {};
//        }
//        if($rootScope.changes[type][id] === undefined){
//            $rootScope.changes[type][id] = {};
//        }
//        if(attr != null) {
//            $rootScope.changes[type][id][attr] = value;
//        }else {
//            $rootScope.changes[type][id] = value;
//        }
            $rootScope.recordChanged();
        };

        $rootScope.recordChangeForEdit = function(object,changeType) {
//        var type = object.type;
//
//        if($rootScope.changes[type] === undefined){
//            $rootScope.changes[type] = {};
//        }
//
//        if($rootScope.changes[type]['edit'] === undefined){
//            $rootScope.changes[type]['edit'] = {};
//        }
//
//        if($rootScope.changes[type]['edit'][object.id] === undefined){
//            $rootScope.changes[type]['edit'][object.id] = {};
//        }
//        $rootScope.changes[type]['edit'][object.id][changeType] = object[changeType];
            $rootScope.recordChanged();
        };

        $rootScope.recordChangeForEdit2 = function(type,command,id,valueType,value) {
//        var obj = $rootScope.findObjectInChanges(type, "add", id);
//        if (obj === undefined) { // not a new object
//            if ($rootScope.changes[type] === undefined) {
//                $rootScope.changes[type] = {};
//            }
//            if ($rootScope.changes[type][command] === undefined) {
//                $rootScope.changes[type][command] = [];
//            }
//            if (valueType !== type) {
//                var obj = $rootScope.findObjectInChanges(type, command, id);
//                if (obj === undefined) {
//                    obj = {id: id};
//                    $rootScope.changes[type][command].push(obj);
//                }
//                obj[valueType] = value;
//            } else {
//                $rootScope.changes[type][command].push(value);
//            }
//        }
            $rootScope.recordChanged();
        };

        $rootScope.recordDelete = function(type,command,id) {
            if(id < 0){ // new object
                $rootScope.removeObjectFromChanges(type, "add", id);
            }else{
                $rootScope.removeObjectFromChanges(type, "edit",id);
//            if ($rootScope.changes[type] === undefined) {
//                $rootScope.changes[type] = {};
//            }
//            if ($rootScope.changes[type][command] === undefined) {
//                $rootScope.changes[type][command] = [];
//            }
//
//            if ($rootScope.changes[type]["delete"] === undefined) {
//                $rootScope.changes[type]["delete"] = [];
//            }
//
//            $rootScope.changes[type]["delete"].push({id:id});
                $rootScope.recordChanged();
            }

//        if($rootScope.changes[type]) {            //clean the changes object
//            if ($rootScope.changes[type]["add"] && $rootScope.changes[type]["add"].length === 0) {
//                delete  $rootScope.changes[type]["add"];
//            }
//            if ($rootScope.changes[type]["edit"] && $rootScope.changes[type]["edit"].length === 0) {
//                delete  $rootScope.changes[type]["edit"];
//            }
//
//            if (Object.getOwnPropertyNames($rootScope.changes[type]).length === 0) {
//                delete $rootScope.changes[type];
//            }
//        }
        };



        $rootScope.findObjectInChanges = function(type, command, id){
            if($rootScope.changes[type] !== undefined && $rootScope.changes[type][command] !== undefined) {
                for (var i = 0; i < $rootScope.changes[type][command].length; i++) {
                    var tmp = $rootScope.changes[type][command][i];
                    if (tmp.id === id) {
                        return tmp;
                    }
                }
            }
            return undefined;
        };


        $rootScope.isNewObject = function(type, command, id){
            if($rootScope.changes[type] !== undefined && $rootScope.changes[type][command] !== undefined) {
                for (var i = 0; i < $rootScope.changes[type][command].length; i++) {
                    var tmp = $rootScope.changes[type][command][i];
                    if (tmp.id === id) {
                        return true;
                    }
                }
            }
            return false;
        };


        $rootScope.removeObjectFromChanges = function(type, command, id){
            if($rootScope.changes[type] !== undefined && $rootScope.changes[type][command] !== undefined) {
                for (var i = 0; i < $rootScope.changes[type][command].length; i++) {
                    var tmp = $rootScope.changes[type][command][i];
                    if (tmp.id === id) {
                        $rootScope.changes[type][command].splice(i, 1);
                    }
                }
            }
            return undefined;
        };


        Restangular.setBaseUrl('api/');
//    Restangular.setResponseExtractor(function(response, operation) {
//        return response.data;
//    });

        $rootScope.showError = function (error) {
            var modalInstance = $modal.open({
                templateUrl: 'ErrorDlgDetails.html',
                controller: 'ErrorDetailsCtrl',
                resolve: {
                    error: function () {
                        return error;
                    }
                }
            });
            modalInstance.result.then(function (error) {
                $rootScope.error = error;
            }, function () {
            });
        };


        $rootScope.apply = function(label){ //FIXME. weak check
            return label != undefined && label != null && (label.indexOf('_') !== -1 || label.indexOf('-') !== -1);
        };

        $rootScope.isFlavor = function(label){ //FIXME. weak check
            return label != undefined && label != null && (label.indexOf('_') !== -1 || label.indexOf('-') !== -1);
        };

        $rootScope.getDatatype = function(id){
            return $rootScope.datatypesMap && $rootScope.datatypesMap[id];
        };


        $rootScope.processElement = function (element, parent) {
            try {
                if (element.type === "group" && element.children) {
                    $rootScope.parentsMap[element.id] = parent;
//            element["parent"] = parent;
                    element.children = $filter('orderBy')(element.children, 'position');
                    angular.forEach(element.children, function (segmentRefOrGroup) {
                        $rootScope.processElement(segmentRefOrGroup, element);
                    });
                } else if (element.type === "segmentRef") {
                    if (parent) {
                        $rootScope.parentsMap[element.id] = parent;
                    }
                    var ref = $rootScope.segmentsMap[element.ref];
                    //element.ref["path"] = ref.name;
                    $rootScope.processElement(ref, element);
                } else if (element.type === "segment") {
                    if ($rootScope.segments.indexOf(element) === -1) {
                        element["path"] = element["name"];
                        $rootScope.segments.push(element);
                        for (var i = 0; i < element.predicates.length; i++) {
                            if ($rootScope.segmentPredicates.indexOf(element.predicates[i]) === -1)
                                $rootScope.segmentPredicates.push(element.predicates[i]);
                        }

                        for (var i = 0; i < element.conformanceStatements.length; i++) {
                            if ($rootScope.segmentConformanceStatements.indexOf(element.conformanceStatements[i]) === -1)
                                $rootScope.segmentConformanceStatements.push(element.conformanceStatements[i]);
                        }
                        element.fields = $filter('orderBy')(element.fields, 'position');
                        angular.forEach(element.fields, function (field) {
                            $rootScope.processElement(field, element);
                        });
                    }
                } else if (element.type === "field") {
                    $rootScope.parentsMap[element.id] = parent;
//            element["datatype"] = $rootScope.datatypesMap[element.datatype.id];
                    element["path"] = parent.path + "." + element.position;
//            if(element.type === "component") {
//                element['sub'] = parent.type === 'component';
//            }
//            if (angular.isDefined(element.table) && element.table != null) {
//                var table = $rootScope.tablesMap[element.table];
//                if ($rootScope.tables.indexOf(table) === -1) {
//                    $rootScope.tables.push(table);
//                }
//            }
                    $rootScope.processElement($rootScope.datatypesMap[element.datatype], element);
                } else if (element.type === "component") {
                    $rootScope.parentsMap[element.id] = parent;
//              element["datatype"] = $rootScope.datatypesMap[element.datatype.id];
                    element["path"] = parent.path + "." + element.position;
//              if(element.type === "component") {
//                  element['sub'] = parent.type === 'component';
//              }
//              if (angular.isDefined(element.table) && element.table != null) {
//                  var table = $rootScope.tablesMap[element.table];
//                  if ($rootScope.tables.indexOf(table) === -1) {
//                      $rootScope.tables.push(table);
//                  }
//              }
                    $rootScope.processElement($rootScope.datatypesMap[element.datatype], element);
                } else if (element.type === "datatype") {
//            if ($rootScope.datatypes.indexOf(element) === -1) {
//                $rootScope.datatypes.push(element);
                    for (var i = 0; i < element.predicates.length; i++) {
                        if ($rootScope.datatypePredicates.indexOf(element.predicates[i]) === -1)
                            $rootScope.datatypePredicates.push(element.predicates[i]);
                    }

                    for (var i = 0; i < element.conformanceStatements.length; i++) {
                        if ($rootScope.datatypeConformanceStatements.indexOf(element.conformanceStatements[i]) === -1)
                            $rootScope.datatypeConformanceStatements.push(element.conformanceStatements[i]);
                    }


                    element.components = $filter('orderBy')(element.components, 'position');
                    angular.forEach(element.components, function (component) {
                        $rootScope.processElement(component, element);
                    });
//            }
                }
            }catch (e){
                throw e;
            }
        };

        $rootScope.createNewFlavorName = function(label){
            if( $rootScope.igdocument != null) {
                return label + "_" + $rootScope.igdocument.metaData["ext"] + "_" + (Math.floor(Math.random() * 10000000) + 1);
            }else{
                return null;
            }
        };


        $rootScope.isSubComponent = function(node){
            node.type === 'component' &&  $rootScope.parentsMap[node.id] && $rootScope.parentsMap[node.id].type === 'component';
        };

        $rootScope.findDatatypeRefs = function (datatype, obj) {
            if(angular.equals(obj.type,'field') || angular.equals(obj.type,'component')){
                if($rootScope.datatypesMap[obj.datatype] === datatype && $rootScope.references.indexOf(obj) === -1) {
                    $rootScope.references.push(obj);
                }
                $rootScope.findDatatypeRefs(datatype,$rootScope.datatypesMap[obj.datatype]);
            }else if(angular.equals(obj.type,'segment')){
                angular.forEach( $rootScope.segments, function (segment) {
                    angular.forEach(segment.fields, function (field) {
                        $rootScope.findDatatypeRefs(datatype,field);
                    });
                });
            } else if(angular.equals(obj.type,'datatype')){
                if(obj.components != undefined && obj.components != null && obj.components.length > 0){
                    angular.forEach(obj.components, function (component) {
                        $rootScope.findDatatypeRefs(datatype,component);
                    });
                }
            }
        };

        $rootScope.findTableRefs = function (table, obj) {
            if(angular.equals(obj.type,'field') || angular.equals(obj.type,'component')){
                if(obj.table != undefined){
                    if(obj.table === table.id && $rootScope.references.indexOf(obj) === -1) {
                        $rootScope.references.push(obj);
                    }
                }
                $rootScope.findTableRefs(table,$rootScope.datatypesMap[obj.datatype]);
            }else if(angular.equals(obj.type,'segment')){
                angular.forEach( $rootScope.segments, function (segment) {
                    angular.forEach(segment.fields, function (field) {
                        $rootScope.findTableRefs(table,field);
                    });
                });
            } else if(angular.equals(obj.type,'datatype')){
                if(obj.components != undefined && obj.components != null && obj.components.length > 0){
                    angular.forEach(obj.components, function (component) {
                        $rootScope.findTableRefs(table,component);
                    });
                }
            }
        };

        $rootScope.genRegex = function (format){
            if(format === 'YYYY'){
                return '(([0-9]{4})|(([0-9]{4})((0[1-9])|(1[0-2])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMM'){
                return '((([0-9]{4})((0[1-9])|(1[0-2])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMMDD'){
                return '((([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMMDDhh'){
                return '((([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3])))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMMDDhhmm'){
                return '((([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMMDDhhmmss'){
                return '((([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]))|(([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYYMMDDhhmmss.sss'){
                return '((([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]))';
            } else if(format === 'YYYY+-ZZZZ'){
                return '([0-9]{4}).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMM+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2])).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMMDD+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1])).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMMDDhh+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3])).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMMDDhhmm+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9]).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMMDDhhmmss+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9]).*((\\+|\\-)[0-9]{4})';
            } else if(format === 'YYYYMMDDhhmmss.sss+-ZZZZ'){
                return '([0-9]{4})((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))(([0-1][0-9])|(2[0-3]))([0-5][0-9])([0-5][0-9])\\.[0-9][0-9][0-9][0-9]((\\+|\\-)[0-9]{4})';
            } else if(format === 'ISO-compliant OID'){
                return '[0-2](\\.(0|[1-9][0-9]*))*';
            } else if(format === 'Alphanumeric'){
                return '^[a-zA-Z0-9]*$';
            }

            return format;
        };

        $rootScope.isAvailableDTForTable = function (dt) {
            if(dt != undefined){
                if(dt.name === 'IS' ||  dt.name === 'ID' ||dt.name === 'CWE' ||dt.name === 'CNE' ||dt.name === 'CE') return true;

                if(dt.components != undefined && dt.components.length > 0) return true;

            }
            return false;
        };

        $rootScope.validateNumber = function(event) {
            var key = window.event ? event.keyCode : event.which;
            if (event.keyCode == 8 || event.keyCode == 46
                || event.keyCode == 37 || event.keyCode == 39) {
                return true;
            }
            else if ( key < 48 || key > 57 ) {
                return false;
            }
            else return true;
        };


        //We check for IE when the user load the main page.
        //TODO: Check only once.
//    $scope.checkForIE();


        $rootScope.openRichTextDlg = function(obj, key, title, disabled){
            var modalInstance = $modal.open({
                templateUrl: 'RichTextCtrl.html',
                controller: 'RichTextCtrl',
                windowClass: 'app-modal-window',
                backdrop: true,
                keyboard: true,
                backdropClick: false,
                resolve: {
                    editorTarget: function () {
                        return {
                            key:key,
                            obj:obj,
                            disabled:disabled,
                            title:title
                        };
                    }
                }
            });
        };

        $rootScope.openInputTextDlg = function(obj, key,title, disabled){
            var modalInstance = $modal.open({
                templateUrl: 'InputTextCtrl.html',
                controller: 'InputTextCtrl',
                backdrop: true,
                keyboard: true,
                size: 'lg',
                backdropClick: false,
                resolve: {
                    editorTarget: function () {
                        return {
                            key:key,
                            obj:obj,
                            disabled:disabled,
                            title:title
                        };
                    }
                }
            });
        };


        $rootScope.isDuplicated = function (obj, context, list) {
            if(obj == null || obj == undefined) return false;

            return _.find(_.without(list, obj), function(item) {
                return item[context] == obj[context];
            });
        };

        $scope.init = function(){
//        $http.get('api/igdocuments/config', {timeout: 60000}).then(function (response) {
//            $rootScope.config = angular.fromJson(response.data);
//        }, function (error) {
//        });
        };

        $scope.getFullName = function () {
            if (userInfoService.isAuthenticated() === true) {
                return userInfoService.getFullName();
            }
            return '';
        };
    }]);

angular.module('igl').controller('LoginCtrl', ['$scope', '$modalInstance', 'user', function($scope, $modalInstance, user) {
    $scope.user = user;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.login = function() {
//        console.log("logging in...");
        $modalInstance.close($scope.user);
    };
}]);


angular.module('igl').controller('RichTextCtrl', ['$scope', '$modalInstance','editorTarget', function($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function() {
        $modalInstance.close($scope.editorTarget);
    };
}]);



angular.module('igl').controller('InputTextCtrl', ['$scope', '$modalInstance','editorTarget', function($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.close = function() {
        $modalInstance.close($scope.editorTarget);
    };
}]);

angular.module('igl').controller('ConfirmLogoutCtrl', ["$scope", "$modalInstance", "$rootScope", "$http", function ($scope, $modalInstance, $rootScope, $http) {
    $scope.logout = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);



/**
 * Created by haffo on 2/17/16.
 */



angular.module('igl')
    .controller('MasterDatatypeLibraryCtrl', ["$scope", "$rootScope", "Restangular", "$http", "$filter", "$modal", "$cookies", "$timeout", "userInfoService", "ToCSvc", "ContextMenuSvc", "ProfileAccessSvc", "ngTreetableParams", "$interval", "ColumnSettings", "StorageService", function ($scope, $rootScope, Restangular, $http, $filter, $modal, $cookies, $timeout, userInfoService, ToCSvc, ContextMenuSvc, ProfileAccessSvc, ngTreetableParams, $interval, ColumnSettings, StorageService) {
        $scope.loading = false;

        $scope.initMasterLibrary = {

        };


    }]);
/**
 * Created by haffo on 2/13/15.
 */

angular.module('igl')
    .controller('MessageListCtrl', ["$scope", "$rootScope", "Restangular", "ngTreetableParams", "$filter", "$http", "$modal", "$timeout", "CloneDeleteSvc", function ($scope, $rootScope, Restangular, ngTreetableParams, $filter, $http, $modal, $timeout, CloneDeleteSvc) {
        $scope.init = function () {
        };

        $scope.copy = function(message) {
        		CloneDeleteSvc.copyMessage(message);
    			$rootScope.$broadcast('event:SetToC');
        }
        
        $scope.close = function () {
            $rootScope.message = null;
            if ($scope.messagesParams)
                $scope.messagesParams.refresh();
        };

        $scope.delete = function() {
    			CloneDeleteSvc.deleteMessage(message);
    			$rootScope.$broadcast('event:SetToC');
        }
        
        $scope.goToSegment = function (segmentId) {
            $scope.$emit('event:openSegment', $rootScope.segmentsMap[segmentId]);
        };
        
        $scope.goToDatatype = function (datatype) {
            $scope.$emit('event:openDatatype', datatype);
        };
        
        $scope.goToTable = function (table) {
            $scope.$emit('event:openTable', table);
        };

        $scope.hasChildren = function (node) {
          if(node && node != null){
          	if(node.type === 'group'){
          		return node.children && node.children.length > 0;
          	}else if(node.type === 'segmentRef'){
          		return $rootScope.segmentsMap[node.ref].fields && $rootScope.segmentsMap[node.ref].fields.length > 0;
          	}else if(node.type === 'field' || node.type === 'component'){
          		return $rootScope.datatypesMap[node.datatype].components && $rootScope.datatypesMap[node.datatype].components.length > 0;
          	}
          	
          	
          	return false;
          }else {
          	return false;
          }
          
        };
        
        $scope.isSub = function (component) {
            return $scope.isSubDT(component);
        };

        $scope.isSubDT = function (component) {
            return component.type === 'component' && $rootScope.parentsMap && $rootScope.parentsMap[component.id] && $rootScope.parentsMap[component.id].type === 'component';
        };

        $scope.countConformanceStatements = function (node) {
            if (node != null && node.conformanceStatements) {
                return node.conformanceStatements.length;
            }
            return 0;
        };

        $scope.countPredicates = function (node) {
            if (node != null && node.predicates) {
                return node.predicates.length;
            }
            return 0;
        };

        $scope.manageConformanceStatement = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'ConformanceStatementMessageCtrl.html',
                controller: 'ConformanceStatementMessageCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.managePredicate = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'PredicateMessageCtrl.html',
                controller: 'PredicateMessageCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };
    }]);


angular.module('igl')
    .controller('MessageRowCtrl', ["$scope", "$filter", function ($scope, $filter) {
        $scope.formName = "form_" + new Date().getTime();
    }]);


angular.module('igl')
    .controller('MessageViewCtrl', ["$scope", "$rootScope", "Restangular", function ($scope, $rootScope, Restangular) {
        $scope.loading = false;
        $scope.msg = null;
        $scope.messageData = [];
        $scope.setData = function (node) {
            if (node) {
                if (node.type === 'message') {
                    angular.forEach(node.children, function (segmentRefOrGroup) {
                        $scope.setData(segmentRefOrGroup);
                    });
                } else if (node.type === 'group') {
                    $scope.messageData.push({ name: "-- " + node.name + " begin"});
                    if (node.children) {
                        angular.forEach(node.children, function (segmentRefOrGroup) {
                            $scope.setData(segmentRefOrGroup);
                        });
                    }
                    $scope.messageData.push({ name: "-- " + node.name + " end"});
                } else if (node.type === 'segment') {
                    $scope.messageData.push + (node);
                }
            }
        };


        $scope.init = function (message) {
            $scope.loading = true;
            $scope.msg = message;
            console.log(message.id);
            $scope.setData($scope.msg);
            $scope.loading = false;
        };

//        $scope.hasChildren = function (node) {
//            return node && node != null && node.type !== 'segment' && node.children && node.children.length > 0;
//        };

    }]);

angular.module('igl').controller('PredicateMessageCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
    $scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];
    $scope.newConstraint = angular.fromJson({
        position_T: null,
        position_1: null,
        position_2: null,
        location_T: null,
        location_1: null,
        location_2: null,
        currentNode_T: null,
        currentNode_1: null,
        currentNode_2: null,
        childNodes_T: [],
        childNodes_1: [],
        childNodes_2: [],
        verb: null,
        contraintType: null,
        value: null,
        trueUsage: null,
        falseUsage: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.location_T = $scope.selectedNode.name;
    $scope.newConstraint.location_1 = $scope.selectedNode.name;
    $scope.newConstraint.location_2 = $scope.selectedNode.name;

    for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
        if ($scope.selectedNode.children[i].type === 'group') {
            var groupModel = {
                name: $scope.selectedNode.children[i].name,
                position: $scope.selectedNode.children[i].position,
                type: 'group',
                node: $scope.selectedNode.children[i]
            };
            $scope.newConstraint.childNodes_T.push(groupModel);
            $scope.newConstraint.childNodes_1.push(groupModel);
            $scope.newConstraint.childNodes_2.push(groupModel);
        } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
            var segmentModel = {
                name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                position: $scope.selectedNode.children[i].position,
                type: 'segment',
                node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
            };
            $scope.newConstraint.childNodes_T.push(segmentModel);
            $scope.newConstraint.childNodes_1.push(segmentModel);
            $scope.newConstraint.childNodes_2.push(segmentModel);
        }
    }
    
    $scope.initPredicate = function(){
    	$scope.newConstraint = angular.fromJson({
            position_T: null,
            position_1: null,
            position_2: null,
            location_T: null,
            location_1: null,
            location_2: null,
            currentNode_T: null,
            currentNode_1: null,
            currentNode_2: null,
            childNodes_T: [],
            childNodes_1: [],
            childNodes_2: [],
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.location_T = $scope.selectedNode.name;
        $scope.newConstraint.location_1 = $scope.selectedNode.name;
        $scope.newConstraint.location_2 = $scope.selectedNode.name;

        for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
            if ($scope.selectedNode.children[i].type === 'group') {
                var groupModel = {
                    name: $scope.selectedNode.children[i].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'group',
                    node: $scope.selectedNode.children[i]
                };
                $scope.newConstraint.childNodes_T.push(groupModel);
                $scope.newConstraint.childNodes_1.push(groupModel);
                $scope.newConstraint.childNodes_2.push(groupModel);
            } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
                var segmentModel = {
                    name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'segment',
                    node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
                };
                $scope.newConstraint.childNodes_T.push(segmentModel);
                $scope.newConstraint.childNodes_1.push(segmentModel);
                $scope.newConstraint.childNodes_2.push(segmentModel);
            }
        }
    }

    $scope.deletePredicate = function (predicate) {
        $scope.selectedNode.predicates.splice($scope.selectedNode.predicates.indexOf(predicate), 1);
        if (!$scope.isNewCP(predicate.id)) {
            $rootScope.recordChanged();
        }
    };
    
    $scope.deletePredicateForComplex = function (predicate) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(predicate), 1);
    };

    $scope.isNewCP = function (id) {
        if ($rootScope.isNewObject("predicate", "add", id)) {
            if ($rootScope.changes['predicate'] !== undefined && $rootScope.changes['predicate']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['predicate']['add'].length; i++) {
                    var tmp = $rootScope.changes['predicate']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['predicate']['add'].splice(i, 1);

                        if ($rootScope.changes["predicate"]["add"] && $rootScope.changes["predicate"]["add"].length === 0) {
                            delete  $rootScope.changes["predicate"]["add"];
                        }

                        if ($rootScope.changes["predicate"] && Object.getOwnPropertyNames($rootScope.changes["predicate"]).length === 0) {
                            delete  $rootScope.changes["predicate"];
                        }


                        return true;
                    }
                }
            }
            return true;
        }
        return false;
    };

    $scope.updateLocationT = function () {
        $scope.newConstraint.location_T = $scope.newConstraint.currentNode_T.name;
        if ($scope.newConstraint.position_T != null) {
            $scope.newConstraint.position_T = $scope.newConstraint.position_T + '.' + $scope.newConstraint.currentNode_T.position + '[1]';
        } else {
            $scope.newConstraint.position_T = $scope.newConstraint.currentNode_T.position + '[1]';
        }

        $scope.newConstraint.childNodes_T = [];

        if ($scope.newConstraint.currentNode_T.type === 'group') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_T.node.children.length; i < len1; i++) {
                if ($scope.newConstraint.currentNode_T.node.children[i].type === 'group') {
                    var groupModel = {
                        name: $scope.newConstraint.currentNode_T.node.children[i].name,
                        position: $scope.newConstraint.currentNode_T.node.children[i].position,
                        type: 'group',
                        node: $scope.newConstraint.currentNode_T.node.children[i]
                    };
                    $scope.newConstraint.childNodes_T.push(groupModel);
                } else if ($scope.newConstraint.currentNode_T.node.children[i].type === 'segmentRef') {
                    var segmentModel = {
                        name: $scope.newConstraint.location_T + '.' + $rootScope.segmentsMap[$scope.newConstraint.currentNode_T.node.children[i].ref].name,
                        position: $scope.newConstraint.currentNode_T.node.children[i].position,
                        type: 'segment',
                        node: $rootScope.segmentsMap[$scope.newConstraint.currentNode_T.node.children[i].ref]
                    };
                    $scope.newConstraint.childNodes_T.push(segmentModel);
                }
            }
        } else if ($scope.newConstraint.currentNode_T.type === 'segment') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_T.node.fields.length; i < len1; i++) {
                var fieldModel = {
                    name: $scope.newConstraint.location_T + '.' + $scope.newConstraint.currentNode_T.node.fields[i].position,
                    position: $scope.newConstraint.currentNode_T.node.fields[i].position,
                    type: 'field',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_T.node.fields[i].datatype]
                };
                $scope.newConstraint.childNodes_T.push(fieldModel);
            }
        } else if ($scope.newConstraint.currentNode_T.type === 'field') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_T.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_T + '.' + $scope.newConstraint.currentNode_T.node.components[i].position,
                    position: $scope.newConstraint.currentNode_T.node.components[i].position,
                    type: 'subComponent',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_T.node.components[i].datatype]
                };
                $scope.newConstraint.childNodes_T.push(componentModel);
            }
        } else if ($scope.newConstraint.currentNode_T.type === 'subComponent') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_T.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_T + '.' + $scope.newConstraint.currentNode_T.node.components[i].position,
                    position: $scope.newConstraint.currentNode_T.node.components[i].position,
                    type: 'subComponent',
                    node: null
                };
                $scope.newConstraint.childNodes_T.push(componentModel);
            }
        }

        $scope.newConstraint.currentNode_T = null;

    };

    $scope.updateLocation1 = function () {
        $scope.newConstraint.location_1 = $scope.newConstraint.currentNode_1.name;
        if ($scope.newConstraint.position_1 != null) {
            $scope.newConstraint.position_1 = $scope.newConstraint.position_1 + '.' + $scope.newConstraint.currentNode_1.position + '[1]';
        } else {
            $scope.newConstraint.position_1 = $scope.newConstraint.currentNode_1.position + '[1]';
        }

        $scope.newConstraint.childNodes_1 = [];

        if ($scope.newConstraint.currentNode_1.type === 'group') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.children.length; i < len1; i++) {
                if ($scope.newConstraint.currentNode_1.node.children[i].type === 'group') {
                    var groupModel = {
                        name: $scope.newConstraint.currentNode_1.node.children[i].name,
                        position: $scope.newConstraint.currentNode_1.node.children[i].position,
                        type: 'group',
                        node: $scope.newConstraint.currentNode_1.node.children[i]
                    };
                    $scope.newConstraint.childNodes_1.push(groupModel);
                } else if ($scope.newConstraint.currentNode_1.node.children[i].type === 'segmentRef') {
                    var segmentModel = {
                        name: $scope.newConstraint.location_1 + '.' + $rootScope.segmentsMap[$scope.newConstraint.currentNode_1.node.children[i].ref].name,
                        position: $scope.newConstraint.currentNode_1.node.children[i].position,
                        type: 'segment',
                        node: $rootScope.segmentsMap[$scope.newConstraint.currentNode_1.node.children[i].ref]
                    };
                    $scope.newConstraint.childNodes_1.push(segmentModel);
                }
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'segment') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.fields.length; i < len1; i++) {
                var fieldModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.fields[i].position,
                    position: $scope.newConstraint.currentNode_1.node.fields[i].position,
                    type: 'field',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_1.node.fields[i].datatype]
                };
                $scope.newConstraint.childNodes_1.push(fieldModel);
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'field') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.components[i].position,
                    position: $scope.newConstraint.currentNode_1.node.components[i].position,
                    type: 'subComponent',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_1.node.components[i].datatype]
                };
                $scope.newConstraint.childNodes_1.push(componentModel);
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'subComponent') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.components[i].position,
                    position: $scope.newConstraint.currentNode_1.node.components[i].position,
                    type: 'subComponent',
                    node: null
                };
                $scope.newConstraint.childNodes_1.push(componentModel);
            }
        }

        $scope.newConstraint.currentNode_1 = null;

    };

    $scope.updateLocation2 = function () {
        $scope.newConstraint.location_2 = $scope.newConstraint.currentNode_2.name;
        if ($scope.newConstraint.position_2 != null) {
            $scope.newConstraint.position_2 = $scope.newConstraint.position_2 + '.' + $scope.newConstraint.currentNode_2.position + '[1]';
        } else {
            $scope.newConstraint.position_2 = $scope.newConstraint.currentNode_2.position + '[1]';
        }

        $scope.newConstraint.childNodes_2 = [];

        if ($scope.newConstraint.currentNode_2.type === 'group') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.children.length; i < len1; i++) {
                if ($scope.newConstraint.currentNode_2.node.children[i].type === 'group') {
                    var groupModel = {
                        name: $scope.newConstraint.currentNode_2.node.children[i].name,
                        position: $scope.newConstraint.currentNode_2.node.children[i].position,
                        type: 'group',
                        node: $scope.newConstraint.currentNode_2.node.children[i]
                    };
                    $scope.newConstraint.childNodes_2.push(groupModel);
                } else if ($scope.newConstraint.currentNode_2.node.children[i].type === 'segmentRef') {
                    var segmentModel = {
                        name: $scope.newConstraint.location_2 + '.' + $rootScope.segmentsMap[$scope.newConstraint.currentNode_2.node.children[i].ref].name,
                        position: $scope.newConstraint.currentNode_2.node.children[i].position,
                        type: 'segment',
                        node: $rootScope.segmentsMap[$scope.newConstraint.currentNode_2.node.children[i].ref]
                    };
                    $scope.newConstraint.childNodes_2.push(segmentModel);
                }
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'segment') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.fields.length; i < len1; i++) {
                var fieldModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.fields[i].position,
                    position: $scope.newConstraint.currentNode_2.node.fields[i].position,
                    type: 'field',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_2.node.fields[i].datatype]
                };
                $scope.newConstraint.childNodes_2.push(fieldModel);
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'field') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.components[i].position,
                    position: $scope.newConstraint.currentNode_2.node.components[i].position,
                    type: 'subComponent',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_2.node.components[i].datatype]
                };
                $scope.newConstraint.childNodes_2.push(componentModel);
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'subComponent') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.components[i].position,
                    position: $scope.newConstraint.currentNode_2.node.components[i].position,
                    type: 'subComponent',
                    node: null
                };
                $scope.newConstraint.childNodes_2.push(componentModel);
            }
        }

        $scope.newConstraint.currentNode_2 = null;

    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
            position_T: null,
            position_1: null,
            position_2: null,
            location_T: null,
            location_1: null,
            location_2: null,
            currentNode_T: null,
            currentNode_1: null,
            currentNode_2: null,
            childNodes_T: [],
            childNodes_1: [],
            childNodes_2: [],
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.location_T = $scope.selectedNode.name;
        $scope.newConstraint.location_1 = $scope.selectedNode.name;
        $scope.newConstraint.location_2 = $scope.selectedNode.name;

        for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
            if ($scope.selectedNode.children[i].type === 'group') {
                var groupModel = {
                    name: $scope.selectedNode.children[i].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'group',
                    node: $scope.selectedNode.children[i]
                };
                $scope.newConstraint.childNodes_T.push(groupModel);
                $scope.newConstraint.childNodes_1.push(groupModel);
                $scope.newConstraint.childNodes_2.push(groupModel);
            } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
                var segmentModel = {
                    name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'segment',
                    node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
                };
                $scope.newConstraint.childNodes_T.push(segmentModel);
                $scope.newConstraint.childNodes_1.push(segmentModel);
                $scope.newConstraint.childNodes_2.push(segmentModel);
            }
        }
        
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }
    
    $scope.addComplexConformanceStatement = function(){
        $scope.complexConstraint.constraintId = $scope.complexConstraint.constraintTarget;
        $scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
        $scope.selectedNode.predicates.push($scope.complexConstraint);
        var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: $scope.complexConstraint};
        $rootScope.recordChanged();
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        
        $scope.complexConstraint = null;
        $scope.newComplexConstraintClassification = 'E';
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId  + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.firstConstraint.constraintTarget,
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.firstConstraint.constraintTarget,
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.firstConstraint.constraintTarget,
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };
    

    $scope.addPredicate = function () {
        $rootScope.newPredicateFakeId = $rootScope.newPredicateFakeId - 1;

        if ($scope.newConstraint.position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + $scope.newConstraint.position_1 + '\"/>'
                    };
                    $scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + $scope.newConstraint.position_1 + '\"/>'
                    };
                	$scope.newComplexConstraint.push(cp);
            	}

            } else if ($scope.newConstraint.contraintType === 'a literal value') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + $scope.newConstraint.position_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                    };
                    $scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + $scope.newConstraint.position_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                    };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + $scope.newConstraint.position_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
                    $scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + $scope.newConstraint.position_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + $scope.newConstraint.position_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + $scope.newConstraint.position_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'formatted value') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + $scope.newConstraint.position_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
                    $scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + $scope.newConstraint.position_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + $scope.newConstraint.location_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
                        $scope.selectedNode.predicates.push(cp);
                        var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                        $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + $scope.newConstraint.location_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            }
            
            
            
            else if ($scope.newConstraint.contraintType === 'equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + $scope.newConstraint.location_2  + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.location_T,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$scope.selectedNode.predicates.push(cp);
                    var newCPBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cp};
                    $rootScope.recordChanged();
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
            				id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.newConstraint.position_T,
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            }
        }
        
        $scope.initPredicate();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);


angular.module('igl').controller('ConformanceStatementMessageCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
    $scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];
    
    $scope.newConstraint = angular.fromJson({
        position_1: null,
        position_2: null,
        location_1: null,
        location_2: null,
        currentNode_1: null,
        currentNode_2: null,
        childNodes_1: [],
        childNodes_2: [],
        verb: null,
        constraintId: null,
        contraintType: null,
        value: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.location_1 = $scope.selectedNode.name;
    $scope.newConstraint.location_2 = $scope.selectedNode.name;

    for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
        if ($scope.selectedNode.children[i].type === 'group') {
            var groupModel = {
                name: $scope.selectedNode.children[i].name,
                position: $scope.selectedNode.children[i].position,
                type: 'group',
                node: $scope.selectedNode.children[i]
            };
            $scope.newConstraint.childNodes_1.push(groupModel);
            $scope.newConstraint.childNodes_2.push(groupModel);
        } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
            var segmentModel = {
                name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                position: $scope.selectedNode.children[i].position,
                type: 'segment',
                node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
            };
            $scope.newConstraint.childNodes_1.push(segmentModel);
            $scope.newConstraint.childNodes_2.push(segmentModel);
        }
    }
    
    
    $scope.initConformanceStatement = function (){
    	$scope.newConstraint = angular.fromJson({
            position_1: null,
            position_2: null,
            location_1: null,
            location_2: null,
            currentNode_1: null,
            currentNode_2: null,
            childNodes_1: [],
            childNodes_2: [],
            verb: null,
            constraintId: null,
            contraintType: null,
            value: null,
	        valueSetId: null,
	        bindingStrength: 'R',
	        bindingLocation: '1',
	        constraintClassification: 'E'
        });
        $scope.newConstraint.location_1 = $scope.selectedNode.name;
        $scope.newConstraint.location_2 = $scope.selectedNode.name;

        for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
            if ($scope.selectedNode.children[i].type === 'group') {
                var groupModel = {
                    name: $scope.selectedNode.children[i].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'group',
                    node: $scope.selectedNode.children[i]
                };
                $scope.newConstraint.childNodes_1.push(groupModel);
                $scope.newConstraint.childNodes_2.push(groupModel);
            } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
                var segmentModel = {
                    name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'segment',
                    node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
                };
                $scope.newConstraint.childNodes_1.push(segmentModel);
                $scope.newConstraint.childNodes_2.push(segmentModel);
            }
        }
    }

    $scope.updateLocation1 = function () {
        $scope.newConstraint.location_1 = $scope.newConstraint.currentNode_1.name;
        if ($scope.newConstraint.position_1 != null) {
            $scope.newConstraint.position_1 = $scope.newConstraint.position_1 + '.' + $scope.newConstraint.currentNode_1.position + '[1]';
        } else {
            $scope.newConstraint.position_1 = $scope.newConstraint.currentNode_1.position + '[1]';
        }

        $scope.newConstraint.childNodes_1 = [];

        if ($scope.newConstraint.currentNode_1.type === 'group') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.children.length; i < len1; i++) {
                if ($scope.newConstraint.currentNode_1.node.children[i].type === 'group') {
                    var groupModel = {
                        name: $scope.newConstraint.currentNode_1.node.children[i].name,
                        position: $scope.newConstraint.currentNode_1.node.children[i].position,
                        type: 'group',
                        node: $scope.newConstraint.currentNode_1.node.children[i]
                    };
                    $scope.newConstraint.childNodes_1.push(groupModel);
                } else if ($scope.newConstraint.currentNode_1.node.children[i].type === 'segmentRef') {
                    var segmentModel = {
                        name: $scope.newConstraint.location_1 + '.' + $rootScope.segmentsMap[$scope.newConstraint.currentNode_1.node.children[i].ref].name,
                        position: $scope.newConstraint.currentNode_1.node.children[i].position,
                        type: 'segment',
                        node: $rootScope.segmentsMap[$scope.newConstraint.currentNode_1.node.children[i].ref]
                    };
                    $scope.newConstraint.childNodes_1.push(segmentModel);
                }
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'segment') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.fields.length; i < len1; i++) {
                var fieldModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.fields[i].position,
                    position: $scope.newConstraint.currentNode_1.node.fields[i].position,
                    type: 'field',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_1.node.fields[i].datatype]
                };
                $scope.newConstraint.childNodes_1.push(fieldModel);
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'field') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.components[i].position,
                    position: $scope.newConstraint.currentNode_1.node.components[i].position,
                    type: 'subComponent',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_1.node.components[i].datatype]
                };
                $scope.newConstraint.childNodes_1.push(componentModel);
            }
        } else if ($scope.newConstraint.currentNode_1.type === 'subComponent') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_1.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_1 + '.' + $scope.newConstraint.currentNode_1.node.components[i].position,
                    position: $scope.newConstraint.currentNode_1.node.components[i].position,
                    type: 'subComponent',
                    node: null
                };
                $scope.newConstraint.childNodes_1.push(componentModel);
            }
        }

        $scope.newConstraint.currentNode_1 = null;

    };

    $scope.updateLocation2 = function () {
        $scope.newConstraint.location_2 = $scope.newConstraint.currentNode_2.name;
        if ($scope.newConstraint.position_2 != null) {
            $scope.newConstraint.position_2 = $scope.newConstraint.position_2 + '.' + $scope.newConstraint.currentNode_2.position + '[1]';
        } else {
            $scope.newConstraint.position_2 = $scope.newConstraint.currentNode_2.position + '[1]';
        }

        $scope.newConstraint.childNodes_2 = [];

        if ($scope.newConstraint.currentNode_2.type === 'group') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.children.length; i < len1; i++) {
                if ($scope.newConstraint.currentNode_2.node.children[i].type === 'group') {
                    var groupModel = {
                        name: $scope.newConstraint.currentNode_2.node.children[i].name,
                        position: $scope.newConstraint.currentNode_2.node.children[i].position,
                        type: 'group',
                        node: $scope.newConstraint.currentNode_2.node.children[i]
                    };
                    $scope.newConstraint.childNodes_2.push(groupModel);
                } else if ($scope.newConstraint.currentNode_2.node.children[i].type === 'segmentRef') {
                    var segmentModel = {
                        name: $scope.newConstraint.location_2 + '.' + $rootScope.segmentsMap[$scope.newConstraint.currentNode_2.node.children[i].ref].name,
                        position: $scope.newConstraint.currentNode_2.node.children[i].position,
                        type: 'segment',
                        node: $rootScope.segmentsMap[$scope.newConstraint.currentNode_2.node.children[i].ref]
                    };
                    $scope.newConstraint.childNodes_2.push(segmentModel);
                }
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'segment') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.fields.length; i < len1; i++) {
                var fieldModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.fields[i].position,
                    position: $scope.newConstraint.currentNode_2.node.fields[i].position,
                    type: 'field',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_2.node.fields[i].datatype]
                };
                $scope.newConstraint.childNodes_2.push(fieldModel);
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'field') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.components[i].position,
                    position: $scope.newConstraint.currentNode_2.node.components[i].position,
                    type: 'subComponent',
                    node: $rootScope.datatypesMap[$scope.newConstraint.currentNode_2.node.components[i].datatype]
                };
                $scope.newConstraint.childNodes_2.push(componentModel);
            }
        } else if ($scope.newConstraint.currentNode_2.type === 'subComponent') {
            for (var i = 0, len1 = $scope.newConstraint.currentNode_2.node.components.length; i < len1; i++) {
                var componentModel = {
                    name: $scope.newConstraint.location_2 + '.' + $scope.newConstraint.currentNode_2.node.components[i].position,
                    position: $scope.newConstraint.currentNode_2.node.components[i].position,
                    type: 'subComponent',
                    node: null
                };
                $scope.newConstraint.childNodes_2.push(componentModel);
            }
        }

        $scope.newConstraint.currentNode_2 = null;

    };

    $scope.deleteConformanceStatement = function (conformanceStatement) {
        $scope.selectedNode.conformanceStatements.splice($scope.selectedNode.conformanceStatements.indexOf(conformanceStatement), 1);
        if (!$scope.isNewCS(conformanceStatement.id)) {
            $rootScope.recordChanged();
        }
    };
    
    $scope.deleteConformanceStatementForComplex = function (conformanceStatement) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(conformanceStatement), 1);
    };


    $scope.isNewCS = function (id) {
        if ($rootScope.isNewObject("conformanceStatement", "add", id)) {
            if ($rootScope.changes['conformanceStatement'] !== undefined && $rootScope.changes['conformanceStatement']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['conformanceStatement']['add'].length; i++) {
                    var tmp = $rootScope.changes['conformanceStatement']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['conformanceStatement']['add'].splice(i, 1);
                        if ($rootScope.changes["conformanceStatement"]["add"] && $rootScope.changes["conformanceStatement"]["add"].length === 0) {
                            delete  $rootScope.changes["conformanceStatement"]["add"];
                        }

                        if ($rootScope.changes["conformanceStatement"] && Object.getOwnPropertyNames($rootScope.changes["conformanceStatement"]).length === 0) {
                            delete  $rootScope.changes["conformanceStatement"];
                        }
                        return true;
                    }

                }
            }
            return true;
        }
        return false;
    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
            position_1: null,
            position_2: null,
            location_1: null,
            location_2: null,
            currentNode_1: null,
            currentNode_2: null,
            childNodes_1: [],
            childNodes_2: [],
            verb: null,
            constraintId: null,
            contraintType: null,
            value: null,
	        valueSetId: null,
	        bindingStrength: 'R',
	        bindingLocation: '1',
	        constraintClassification: 'E'
        });
        $scope.newConstraint.location_1 = $scope.selectedNode.name;
        $scope.newConstraint.location_2 = $scope.selectedNode.name;

        for (var i = 0, len1 = $scope.selectedNode.children.length; i < len1; i++) {
            if ($scope.selectedNode.children[i].type === 'group') {
                var groupModel = {
                    name: $scope.selectedNode.children[i].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'group',
                    node: $scope.selectedNode.children[i]
                };
                $scope.newConstraint.childNodes_1.push(groupModel);
                $scope.newConstraint.childNodes_2.push(groupModel);
            } else if ($scope.selectedNode.children[i].type === 'segmentRef') {
                var segmentModel = {
                    name: $scope.selectedNode.name + '.' + $rootScope.segmentsMap[$scope.selectedNode.children[i].ref].name,
                    position: $scope.selectedNode.children[i].position,
                    type: 'segment',
                    node: $rootScope.segmentsMap[$scope.selectedNode.children[i].ref]
                };
                $scope.newConstraint.childNodes_1.push(segmentModel);
                $scope.newConstraint.childNodes_2.push(segmentModel);
            }
        }
		
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }
    
    $scope.addComplexConformanceStatement = function(){
    	$scope.complexConstraint.constraintId = $scope.newComplexConstraintId;
    	$scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
    	
    	$scope.selectedNode.conformanceStatements.push($scope.complexConstraint);
        var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: $scope.complexConstraint};
        $rootScope.recordChanged();
        
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        
        $scope.complexConstraint = null;
        $scope.newComplexConstraintId = '';
        $scope.newComplexConstraintClassification = 'E';
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: '.',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: '.',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: '.',
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };
    

    $scope.addConformanceStatement = function () {
        $rootScope.newConformanceStatementFakeId = $rootScope.newConformanceStatementFakeId - 1;

        if ($scope.newConstraint.position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + '.',
                    assertion: '<Presence Path=\"' + $scope.newConstraint.position_1 + '\"/>'
                };
                
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'a literal value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<PlainText Path=\"' + $scope.newConstraint.position_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                    assertion: '<StringList Path=\"' + $scope.newConstraint.position_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
                var cs = {
                        id: new ObjectId().toString(),
                        constraintId: $scope.newConstraint.constraintId,
                        constraintTarget: '.',
                        constraintClassification: $scope.newConstraint.constraintClassification,
                        description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                        assertion: '<ValueSet Path=\"' + $scope.newConstraint.position_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            }  else if ($scope.newConstraint.contraintType === 'formatted value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<Format Path=\"' + $scope.newConstraint.position_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
               }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + $scope.newConstraint.location_2 + '.',
                    assertion: '<PathValue Path1=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Path2=\"' + $scope.newConstraint.position_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: '.',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + $scope.newConstraint.location_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + $scope.newConstraint.position_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$scope.selectedNode.conformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'group', targetId: $scope.selectedNode.id, obj: cs};
                    $rootScope.recordChanged();
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            }
        }
        
        $scope.initConformanceStatement();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);




'use strict';

angular.module('igl')
.controller('RegisterResetPasswordCtrl', ['$scope', '$resource', '$modal', '$routeParams', 'isFirstSetup',
    function ($scope, $resource, $modal, $routeParams, isFirstSetup) {
        $scope.agreed = false;
        $scope.displayForm = true;
        $scope.isFirstSetup = isFirstSetup;

        if ( !angular.isDefined($routeParams.username) ) {
            $scope.displayForm = false;
        }
        if ( $routeParams.username === '' ) {
            $scope.displayForm = false;
        }
        if ( !angular.isDefined($routeParams.token) ) {
            $scope.displayForm = false;
        }
        if ( $routeParams.token === '' ) {
            $scope.displayForm = false;
        }
        if ( !angular.isDefined($routeParams.userId) ) {
            $scope.displayForm = false;
        }
        if ( $routeParams.userId === '' ) {
            $scope.displayForm = false;
        }

        //to register an account for the first time
        var AcctInitPassword = $resource('api/sooa/accounts/register/:userId/passwordreset', {userId:'@userId', token:'@token'});
        //to reset the password  
        var AcctResetPassword = $resource('api/sooa/accounts/:id/passwordreset', {id:'@userId', token:'@token'});

        $scope.user = {};
        $scope.user.username = $routeParams.username;
        $scope.user.newUsername = $routeParams.username;
        $scope.user.userId = $routeParams.userId;
        $scope.user.token = $routeParams.token;



//        $scope.confirmRegistration = function() {
//            var modalInstance = $modal.open({
//                backdrop: true,
//                keyboard: true,
//                backdropClick: false,
//                controller: 'AgreementCtrl',
//                templateUrl: 'views/agreement.html'
//            });
//            modalInstance.result.then(function (result) {
//                if(result) {
//                    var initAcctPass = new AcctInitPassword($scope.user);
//                    initAcctPass.signedConfidentialityAgreement = true;
//                    initAcctPass.$save(function() {
//                        $scope.user.password = '';
//                        $scope.user.passwordConfirm = '';
//                    });
//                }
//                else {
//                    //console.log("Agreement not accepted");
//                }
//            });
//        };

        $scope.changePassword = function() {
            if($scope.agreed) {
                var resetAcctPass = new AcctResetPassword($scope.user);
                resetAcctPass.$save(function () {
                    $scope.user.password = '';
                    $scope.user.passwordConfirm = '';
                });
            }
        };
    }
]);

'use strict';

angular.module('igl')
.controller('RegistrationCtrl', ['$scope', '$resource', '$modal', '$location',
    function ($scope, $resource, $modal, $location) {
        $scope.account = {};
        $scope.registered = false;
        $scope.agreed = false;

        //Creating a type to check with the server if a username already exists.
        var Username = $resource('api/sooa/usernames/:username', {username: '@username'});
        var Email = $resource('api/sooa/emails/:email', {email: '@email'});

        var NewAccount = $resource('api/sooa/accounts/register');

        $scope.registerAccount = function() {
            if($scope.agreed) {
                //console.log("Creating account");
                var acctToRegister = new NewAccount();
                acctToRegister.accountType = 'author';
                acctToRegister.employer =  $scope.account.employer;
                acctToRegister.fullName =  $scope.account.fullName;
                acctToRegister.phone =  $scope.account.phone;
                acctToRegister.title =  $scope.account.title;
                acctToRegister.juridiction =  $scope.account.juridiction;
                acctToRegister.username =  $scope.account.username;
                acctToRegister.password =  $scope.account.password;
                acctToRegister.email =  $scope.account.email;
                acctToRegister.signedConfidentialityAgreement = true;
                acctToRegister.$save(
                    function() {
                        if (acctToRegister.text ===  'userAdded') {
                            $scope.account = {};
                            //should unfreeze the form
                            $scope.registered = true;
                            $location.path('/registrationSubmitted');
                        }else{
                            $scope.registered = false;
                        }
                    },
                    function() {
                        $scope.registered = false;
                    }
                );
                //should freeze the form - at least the button
                $scope.registered = true;
            }
        };

//        $scope.registerAccount = function() {
//            /* Check for username already in use
//               Verify email not already associated to an account
//               Will need to send an email if success
//               */
//            var modalInstance = $modal.open({
//                backdrop: true,
//                keyboard: true,
//                backdropClick: false,
//                controller: 'AgreementCtrl',
//                templateUrl: 'views/account/agreement.html'
//            });
//
//            modalInstance.result.then(function(result) {
//                if(result) {
//                    //console.log("Creating account");
//                    var acctToRegister = new NewAccount();
//                    acctToRegister.accountType = 'provider';
//                    acctToRegister.company =  $scope.account.company;
//                    acctToRegister.firstname =  $scope.account.firstname;
//                    acctToRegister.lastname =  $scope.account.lastname;
//                    acctToRegister.username =  $scope.account.username;
//                    acctToRegister.password =  $scope.account.password;
//                    acctToRegister.email =  $scope.account.email;
//                    acctToRegister.signedConfidentialityAgreement = true;
//
//                    acctToRegister.$save(
//                        function() {
//                            if (acctToRegister.text ===  'userAdded') {
//                                $scope.account = {};
//                                //should unfreeze the form
//                                $scope.registered = true;
//                                $location.path('/home');
//                            }
//                        },
//                        function() {
//                            $scope.registered = false;
//                        }
//                    );
//                    //should freeze the form - at least the button
//                    $scope.registered = true;
//                }
//                else {
//                    //console.log('Account not created');
//                }
//            });
//        };
    }
]);
//
//angular.module('igl').controller('AgreementCtrl', ['$scope', '$modalInstance',
//    function ($scope, $modalInstance) {
//
//        $scope.acceptAgreement =  function() {
//            var res = true;
//            $modalInstance.close(res);
//        };
//
//        $scope.doNotAcceptAgreement =  function() {
//            var res = false;
//            $modalInstance.close(res);
//        };
//    }
//]);

/**
 * Created by haffo on 2/13/15.
 */

angular.module('igl')
    .controller('SegmentListCtrl', ["$scope", "$rootScope", "Restangular", "ngTreetableParams", "CloneDeleteSvc", "$filter", "$http", "$modal", "$timeout", function ($scope, $rootScope, Restangular, ngTreetableParams, CloneDeleteSvc, $filter, $http, $modal, $timeout) {
//        $scope.loading = false;
        $scope.readonly = false;
        $scope.saved = false;
        $scope.message = false;
        $scope.segmentCopy = null;

        $scope.reset = function () {
//            $scope.loadingSelection = true;
//            $scope.message = "Segment " + $scope.segmentCopy.label + " reset successfully";
//            angular.extend($rootScope.segment, $scope.segmentCopy);
//             $scope.loadingSelection = false;
        };

        $scope.close = function () {
            $rootScope.segment = null;
            $scope.refreshTree();
            $scope.loadingSelection = false;
        };
        
        $scope.copy = function(segment) {
        		CloneDeleteSvc.copySegment(segment);
        }

        $scope.delete = function (segment) {
        		CloneDeleteSvc.deleteSegment(segment.id);
			$rootScope.$broadcast('event:SetToC');
        };
        
        $scope.hasChildren = function (node) {
            return node && node != null && ((node.fields && node.fields.length > 0 ) || (node.datatype && $rootScope.getDatatype(node.datatype) && $rootScope.getDatatype(node.datatype).components && $rootScope.getDatatype(node.datatype).components.length > 0));
        };


        $scope.validateLabel = function (label, name) {
            if (label && !label.startsWith(name)) {
                return false;
            }
            return true;
        };

        $scope.onDatatypeChange = function (node) {
            $rootScope.recordChangeForEdit2('field', 'edit', node.id, 'datatype', node.datatype);
            $scope.refreshTree();
        };

        $scope.refreshTree = function () {
            if ($scope.segmentsParams)
                $scope.segmentsParams.refresh();
        };

        $scope.goToTable = function (table) {
            $scope.$emit('event:openTable', table);
        };

        $scope.goToDatatype = function (datatype) {
            $scope.$emit('event:openDatatype', datatype);
        };

        $scope.deleteTable = function (node) {
            node.table = null;
            $rootScope.recordChangeForEdit2('field', 'edit', node.id, 'table', null);
        };

        $scope.mapTable = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'TableMappingSegmentCtrl.html',
                controller: 'TableMappingSegmentCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.findDTByComponentId = function (componentId) {
            return $rootScope.parentsMap && $rootScope.parentsMap[componentId] ? $rootScope.parentsMap[componentId].datatype : null;
        };

        $scope.isSub = function (component) {
            return $scope.isSubDT(component);
        };

        $scope.isSubDT = function (component) {
            return component.type === 'component' && $rootScope.parentsMap && $rootScope.parentsMap[component.id] && $rootScope.parentsMap[component.id].type === 'component';
        };

        $scope.managePredicate = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'PredicateSegmentCtrl.html',
                controller: 'PredicateSegmentCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.manageConformanceStatement = function (node) {
            var modalInstance = $modal.open({
                templateUrl: 'ConformanceStatementSegmentCtrl.html',
                controller: 'ConformanceStatementSegmentCtrl',
                windowClass: 'app-modal-window',
                resolve: {
                    selectedNode: function () {
                        return node;
                    }
                }
            });
            modalInstance.result.then(function (node) {
                $scope.selectedNode = node;
            }, function () {
            });
        };

        $scope.show = function (segment) {
            return true;
        };

        $scope.countConformanceStatements = function (position) {
            var count = 0;
            if ($rootScope.segment != null) {
                for (var i = 0, len1 = $rootScope.segment.conformanceStatements.length; i < len1; i++) {
                    if ($rootScope.segment.conformanceStatements[i].constraintTarget.indexOf(position + '[') === 0)
                        count = count + 1;
                }
            }
            return count;
        };

        $scope.countPredicate = function (position) {
            if ($rootScope.segment != null) {
                for (var i = 0, len1 = $rootScope.segment.predicates.length; i < len1; i++) {
                    if ($rootScope.segment.predicates[i].constraintTarget.indexOf(position + '[') === 0)
                        return 1;
                }
            }
            return 0;
        };
    }]);

angular.module('igl')
    .controller('SegmentRowCtrl', ["$scope", "$filter", function ($scope, $filter) {
        $scope.formName = "form_" + new Date().getTime();
    }]);

angular.module('igl').controller('TableMappingSegmentCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {

    $scope.selectedNode = selectedNode;
    $scope.selectedTable = null;
    if (selectedNode.table != undefined) {
        $scope.selectedTable = $rootScope.tablesMap[selectedNode.table];
    }

    $scope.selectTable = function (table) {
        $scope.selectedTable = table;
    };

    $scope.mappingTable = function () {
        $scope.selectedNode.table = $scope.selectedTable.id;
        $rootScope.recordChangeForEdit2('field', 'edit', $scope.selectedNode.id, 'table', $scope.selectedNode.table);
        $scope.ok();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);

angular.module('igl').controller('PredicateSegmentCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
    $scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];
    
    $scope.newConstraint = angular.fromJson({
    	segment: '',
        field_1: null,
        component_1: null,
        subComponent_1: null,
        field_2: null,
        component_2: null,
        subComponent_2: null,
        verb: null,
        contraintType: null,
        value: null,
        trueUsage: null,
        falseUsage: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.segment = $rootScope.segment.name;
    
    $scope.initPredicate = function () {
    	$scope.newConstraint = angular.fromJson({
        	segment: '',
            field_1: null,
            component_1: null,
            subComponent_1: null,
            field_2: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.segment = $rootScope.segment.name;
    }
    
    $scope.deletePredicate = function (predicate) {
        $rootScope.segment.predicates.splice($rootScope.segment.predicates.indexOf(predicate), 1);
        $rootScope.segmentPredicates.splice($rootScope.segmentPredicates.indexOf(predicate), 1);
        if (!$scope.isNewCP(predicate.id)) {
            $rootScope.recordChangeForEdit2('predicate', "delete", predicate.id, 'id', predicate.id);
        }
    };
    
    $scope.deletePredicateForComplex = function (predicate) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(predicate), 1);
    };

    $scope.isNewCP = function (id) {
        if ($rootScope.isNewObject("predicate", "add", id)) {
            if ($rootScope.changes['predicate'] !== undefined && $rootScope.changes['predicate']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['predicate']['add'].length; i++) {
                    var tmp = $rootScope.changes['predicate']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['predicate']['add'].splice(i, 1);

                        if ($rootScope.changes["predicate"]["add"] && $rootScope.changes["predicate"]["add"].length === 0) {
                            delete  $rootScope.changes["predicate"]["add"];
                        }

                        if ($rootScope.changes["predicate"] && Object.getOwnPropertyNames($rootScope.changes["predicate"]).length === 0) {
                            delete  $rootScope.changes["predicate"];
                        }


                        return true;
                    }
                }
            }
            return true;
        }
        return false;
    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
    		segment: '',
            field_1: null,
            component_1: null,
            subComponent_1: null,
            field_2: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            contraintType: null,
            value: null,
            trueUsage: null,
            falseUsage: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
	    });
		$scope.newConstraint.segment = $rootScope.segment.name;
		
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }

    $scope.updateField_1 = function () {
        $scope.newConstraint.component_1 = null;
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateComponent_1 = function () {
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateField_2 = function () {
        $scope.newConstraint.component_2 = null;
        $scope.newConstraint.subComponent_2 = null;
    };

    $scope.updateComponent_2 = function () {
        $scope.newConstraint.subComponent_2 = null;
    };


    $scope.deletePredicateByTarget = function () {
        for (var i = 0, len1 = $rootScope.segment.predicates.length; i < len1; i++) {
            if ($rootScope.segment.predicates[i].constraintTarget.indexOf($scope.selectedNode.position + '[') === 0) {
                $scope.deletePredicate($rootScope.segment.predicates[i]);
                return true;
            }
        }
        return false;
    };
    
    $scope.addComplexConformanceStatement = function(){
        $scope.deletePredicateByTarget();
        $scope.complexConstraint.constraintId = $scope.newConstraint.segment + '-' + $scope.selectedNode.position;
        $scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
        $rootScope.segment.predicates.push($scope.complexConstraint);
        $rootScope.segmentPredicates.push($scope.complexConstraint);
        var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: $scope.complexConstraint};
        $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
        
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        
        $scope.complexConstraint = null;
        $scope.newComplexConstraintClassification = 'E';
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    trueUsage: $scope.firstConstraint.trueUsage,
                    falseUsage: $scope.firstConstraint.falseUsage,
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };

    $scope.updatePredicate = function () {
        $rootScope.newPredicateFakeId = $rootScope.newPredicateFakeId - 1;
        if($scope.constraintType === 'Plain'){
        	$scope.deletePredicateByTarget();
        }

        var position_1 = $scope.genPosition($scope.newConstraint.segment, $scope.newConstraint.field_1, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var position_2 = $scope.genPosition($scope.newConstraint.segment, $scope.newConstraint.field_2, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);
        var location_1 = $scope.genLocation($scope.newConstraint.field_1, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var location_2 = $scope.genLocation($scope.newConstraint.field_2, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);

        if (position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
                if($scope.constraintType === 'Plain'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + location_1 + '\"/>'
                    };
                	
                	$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType,
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Presence Path=\"' + location_1 + '\"/>'
                    };
                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'a literal value') {
                if($scope.constraintType === 'Plain'){
                    var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                        };

                	$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                    var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                        };

                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
                if($scope.constraintType === 'Plain'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
                	$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                        };
                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                        };
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'formatted value') {
                if($scope.constraintType === 'Plain'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
                	$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                        };
                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
                if($scope.constraintType === 'Plain'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
                	$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
                }else if ($scope.constraintType === 'Complex'){
                	var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
                	$scope.newComplexConstraint.push(cp);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
            	if($scope.constraintType === 'Plain'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: $scope.newConstraint.segment + '-' + $scope.selectedNode.position,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		$rootScope.segment.predicates.push(cp);
                    $rootScope.segmentPredicates.push(cp);
                    var newCPBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cp};
                    $rootScope.recordChangeForEdit2('predicate', "add", null, 'predicate', newCPBlock);
            	}else if ($scope.constraintType === 'Complex'){
            		var cp = {
                            id: new ObjectId().toString(),
                            constraintId: 'CP' + $rootScope.newPredicateFakeId,
                            constraintTarget: $scope.selectedNode.position + '[1]',
                            constraintClassification: $scope.newConstraint.constraintClassification,
                            description: 'If the value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                            trueUsage: $scope.newConstraint.trueUsage,
                            falseUsage: $scope.newConstraint.falseUsage,
                            assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                        };
            		
            		$scope.newComplexConstraint.push(cp);
            	}
            }
        }
        
        $scope.initPredicate();
    };

    $scope.genPosition = function (segment, field, component, subComponent) {
        var position = null;
        if (field != null && component == null && subComponent == null) {
            position = segment + '-' + field.position;
        } else if (field != null && component != null && subComponent == null) {
            position = segment + '-' + field.position + '.' + component.position;
        } else if (field != null && component != null && subComponent != null) {
            position = segment + '-' + field.position + '.' + component.position + '.' + subComponent.position;
        }

        return position;
    };

    $scope.genLocation = function (field, component, subComponent) {
        var location = null;
        if (field != null && component == null && subComponent == null) {
            location = field.position + '[1]';
        } else if (field != null && component != null && subComponent == null) {
            location = field.position + '[1].' + component.position + '[1]';
        } else if (field != null && component != null && subComponent != null) {
            location = field.position + '[1].' + component.position + '[1].' + subComponent.position + '[1]';
        }

        return location;
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);

angular.module('igl').controller('ConformanceStatementSegmentCtrl', ["$scope", "$modalInstance", "selectedNode", "$rootScope", function ($scope, $modalInstance, selectedNode, $rootScope) {
    $scope.selectedNode = selectedNode;
    $scope.constraintType = 'Plain';
    $scope.firstConstraint = null;
    $scope.secondConstraint = null;
    $scope.compositeType = null;
    $scope.complexConstraint = null;
    $scope.newComplexConstraintId = '';
    $scope.newComplexConstraintClassification = 'E';
    $scope.newComplexConstraint = [];

    $scope.newConstraint = angular.fromJson({
        segment: '',
        field_1: null,
        component_1: null,
        subComponent_1: null,
        field_2: null,
        component_2: null,
        subComponent_2: null,
        verb: null,
        constraintId: null,
        contraintType: null,
        value: null,
        valueSetId: null,
        bindingStrength: 'R',
        bindingLocation: '1',
        constraintClassification: 'E'
    });
    $scope.newConstraint.segment = $rootScope.segment.name;
    
    $scope.initConformanceStatement = function () {
    	$scope.newConstraint = angular.fromJson({
            segment: '',
            field_1: null,
            component_1: null,
            subComponent_1: null,
            field_2: null,
            component_2: null,
            subComponent_2: null,
            verb: null,
            constraintId: null,
            contraintType: null,
            value: null,
            valueSetId: null,
            bindingStrength: 'R',
            bindingLocation: '1',
            constraintClassification: 'E'
        });
        $scope.newConstraint.segment = $rootScope.segment.name;
    }
    

    $scope.deleteConformanceStatement = function (conformanceStatement) {
        $rootScope.segment.conformanceStatements.splice($rootScope.segment.conformanceStatements.indexOf(conformanceStatement), 1);
        $rootScope.segmentConformanceStatements.splice($rootScope.segmentConformanceStatements.indexOf(conformanceStatement), 1);
        if (!$scope.isNewCS(conformanceStatement.id)) {
            $rootScope.recordChangeForEdit2('conformanceStatement', "delete", conformanceStatement.id, 'id', conformanceStatement.id);
        }
    };
    
    $scope.deleteConformanceStatementForComplex = function (conformanceStatement) {
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf(conformanceStatement), 1);
    };


    $scope.isNewCS = function (id) {
        if ($rootScope.isNewObject("conformanceStatement", "add", id)) {
            if ($rootScope.changes['conformanceStatement'] !== undefined && $rootScope.changes['conformanceStatement']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['conformanceStatement']['add'].length; i++) {
                    var tmp = $rootScope.changes['conformanceStatement']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['conformanceStatement']['add'].splice(i, 1);
                        if ($rootScope.changes["conformanceStatement"]["add"] && $rootScope.changes["conformanceStatement"]["add"].length === 0) {
                            delete  $rootScope.changes["conformanceStatement"]["add"];
                        }

                        if ($rootScope.changes["conformanceStatement"] && Object.getOwnPropertyNames($rootScope.changes["conformanceStatement"]).length === 0) {
                            delete  $rootScope.changes["conformanceStatement"];
                        }
                        return true;
                    }

                }
            }
            return true;
        }
        return false;
    };
    
    $scope.changeConstraintType = function () {
    	$scope.newConstraint = angular.fromJson({
	        segment: '',
	        field_1: null,
	        component_1: null,
	        subComponent_1: null,
	        field_2: null,
	        component_2: null,
	        subComponent_2: null,
	        verb: null,
	        constraintId: null,
	        contraintType: null,
	        value: null,
	        valueSetId: null,
	        bindingStrength: 'R',
	        bindingLocation: '1',
	        constraintClassification: 'E'
	    });
		$scope.newConstraint.segment = $rootScope.segment.name;
		
    	if($scope.constraintType === 'Complex'){
    		$scope.newComplexConstraint = [];
    		$scope.newComplexConstraintId = '';
    		$scope.newComplexConstraintClassification = 'E';
    	}
    }

    $scope.updateField_1 = function () {
        $scope.newConstraint.component_1 = null;
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateComponent_1 = function () {
        $scope.newConstraint.subComponent_1 = null;
    };

    $scope.updateField_2 = function () {
        $scope.newConstraint.component_2 = null;
        $scope.newConstraint.subComponent_2 = null;
    };

    $scope.updateComponent_2 = function () {
        $scope.newConstraint.subComponent_2 = null;
    };

    $scope.genPosition = function (segment, field, component, subComponent) {
        var position = null;
        if (field != null && component == null && subComponent == null) {
            position = segment + '-' + field.position;
        } else if (field != null && component != null && subComponent == null) {
            position = segment + '-' + field.position + '.' + component.position;
        } else if (field != null && component != null && subComponent != null) {
            position = segment + '-' + field.position + '.' + component.position + '.' + subComponent.position;
        }

        return position;
    };

    $scope.genLocation = function (field, component, subComponent) {
        var location = null;
        if (field != null && component == null && subComponent == null) {
            location = field.position + '[1]';
        } else if (field != null && component != null && subComponent == null) {
            location = field.position + '[1].' + component.position + '[1]';
        } else if (field != null && component != null && subComponent != null) {
            location = field.position + '[1].' + component.position + '[1].' + subComponent.position + '[1]';
        }

        return location;
    };
    
    $scope.addComplexConformanceStatement = function(){
    	$scope.complexConstraint.constraintId = $scope.newComplexConstraintId;
    	$scope.complexConstraint.constraintClassification = $scope.newComplexConstraintClassification;
    	
    	$rootScope.segment.conformanceStatements.push($scope.complexConstraint);
        $rootScope.segmentConformanceStatements.push($scope.complexConstraint);
        var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: $scope.complexConstraint};
        $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
        
        $scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.complexConstraint), 1);
        $scope.complexConstraint = null;
        $scope.newComplexConstraintId = '';
        $scope.newComplexConstraintClassification = 'E';
    };
    
    $scope.compositeConformanceStatements = function(){
    	if($scope.compositeType === 'AND'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'AND(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'AND' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<AND>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</AND>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'OR'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'OR(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: '['+ $scope.firstConstraint.description + '] ' + 'OR' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<OR>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</OR>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}else if($scope.compositeType === 'IFTHEN'){
    		var cs = {
                    id: new ObjectId().toString(),
                    constraintId: 'IFTHEN(' + $scope.firstConstraint.constraintId + ',' + $scope.secondConstraint.constraintId + ')',
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    description: 'IF ['+ $scope.firstConstraint.description + '] ' + 'THEN ' + ' [' + $scope.secondConstraint.description + ']',
                    assertion: '<IMPLY>' + $scope.firstConstraint.assertion + $scope.secondConstraint.assertion + '</IMPLY>'
            };
    		$scope.newComplexConstraint.push(cs);
    	}
    	
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.firstConstraint), 1);
    	$scope.newComplexConstraint.splice($scope.newComplexConstraint.indexOf($scope.secondConstraint), 1);
    	
    	$scope.firstConstraint = null;
        $scope.secondConstraint = null;
        $scope.compositeType = null;
    };

    $scope.addConformanceStatement = function () {
        $rootScope.newConformanceStatementFakeId = $rootScope.newConformanceStatementFakeId - 1;

        var position_1 = $scope.genPosition($scope.newConstraint.segment, $scope.newConstraint.field_1, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var position_2 = $scope.genPosition($scope.newConstraint.segment, $scope.newConstraint.field_2, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);
        var location_1 = $scope.genLocation($scope.newConstraint.field_1, $scope.newConstraint.component_1, $scope.newConstraint.subComponent_1);
        var location_2 = $scope.genLocation($scope.newConstraint.field_2, $scope.newConstraint.component_2, $scope.newConstraint.subComponent_2);


        if (position_1 != null) {
            if ($scope.newConstraint.contraintType === 'valued') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + '.',
                    assertion: '<Presence Path=\"' + location_1 + '\"/>'
                };
                
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
                
            } else if ($scope.newConstraint.contraintType === 'a literal value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<PlainText Path=\"' + location_1 + '\" Text=\"' + $scope.newConstraint.value + '\" IgnoreCase="false"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of list values') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.value + '.',
                    assertion: '<StringList Path=\"' + location_1 + '\" CSV=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'one of codes in ValueSet') {
                var cs = {
                        id: new ObjectId().toString(),
                        constraintId: $scope.newConstraint.constraintId,
                        constraintTarget: $scope.selectedNode.position + '[1]',
                        constraintClassification: $scope.newConstraint.constraintClassification,
                        description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' ' + $scope.newConstraint.contraintType + ': ' + $scope.newConstraint.valueSetId + '.',
                        assertion: '<ValueSet Path=\"' + location_1 + '\" ValueSetID=\"' + $scope.newConstraint.valueSetId + '\" BindingStrength=\"' + $scope.newConstraint.bindingStrength + '\" BindingLocation=\"' + $scope.newConstraint.bindingLocation +'\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                    $scope.newComplexConstraint.push(cs);
                }
            }  else if ($scope.newConstraint.contraintType === 'formatted value') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' valid in format: \'' + $scope.newConstraint.value + '\'.',
                    assertion: '<Format Path=\"' + location_1 + '\" Regex=\"' + $rootScope.genRegex($scope.newConstraint.value) + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'identical to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' identical to the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="EQ" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="NE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GT" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="GE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LT" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than the another node') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than the value of ' + position_2 + '.',
                    assertion: '<PathValue Path1=\"' + location_1 + '\" Operator="LE" Path2=\"' + location_2 + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="EQ" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'not-equal to') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' different with ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="NE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or greater than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or greater than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="GE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LT" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            } else if ($scope.newConstraint.contraintType === 'equal to or less than') {
                var cs = {
                    id: new ObjectId().toString(),
                    constraintId: $scope.newConstraint.constraintId,
                    constraintTarget: $scope.selectedNode.position + '[1]',
                    constraintClassification: $scope.newConstraint.constraintClassification,
                    description: 'The value of ' + position_1 + ' ' + $scope.newConstraint.verb + ' equal to or less than ' + $scope.newConstraint.value + '.',
                    assertion: '<SimpleValue Path=\"' + location_1 + '\" Operator="LE" Value=\"' + $scope.newConstraint.value + '\"/>'
                };
                if($scope.constraintType === 'Plain'){
                	$rootScope.segment.conformanceStatements.push(cs);
                    $rootScope.segmentConformanceStatements.push(cs);
                    var newCSBlock = {targetType: 'segment', targetId: $rootScope.segment.id, obj: cs};
                    $rootScope.recordChangeForEdit2('conformanceStatement', "add", null, 'conformanceStatement', newCSBlock);
                }else if ($scope.constraintType === 'Complex'){
                  	$scope.newComplexConstraint.push(cs);
                }
            }
        }
        $scope.initConformanceStatement();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedNode);
    };

}]);


angular.module('igl').controller('ConfirmSegmentDeleteCtrl', ["$scope", "$modalInstance", "segToDelete", "$rootScope", function ($scope, $modalInstance, segToDelete, $rootScope) {
    $scope.segToDelete = segToDelete;
    $scope.loading = false;
    
    $scope.delete = function () {
        $scope.loading = true;
        var index = $rootScope.segments.indexOf($scope.segToDelete);
        if (index > -1) $rootScope.segments.splice(index, 1);
        if ($rootScope.segment === $scope.segToDelete) {
            $rootScope.segment = null;
        }
        $rootScope.segmentsMap[$scope.segToDelete.id] = null;
        $rootScope.references = [];
        if ($scope.segToDelete.id < 0) {
//            var index = $rootScope.changes["segment"]["add"].indexOf($scope.segToDelete);
//            if (index > -1) $rootScope.changes["segment"]["add"].splice(index, 1);
//            if ($rootScope.changes["segment"]["add"] && $rootScope.changes["segment"]["add"].length === 0) {
//                delete  $rootScope.changes["segment"]["add"];
//            }
//            if ($rootScope.changes["segment"] && Object.getOwnPropertyNames($rootScope.changes["segment"]).length === 0) {
//                delete  $rootScope.changes["segment"];
//            }
        } else {
            $rootScope.recordDelete("segment", "edit", $scope.segToDelete.id);
//            if ($scope.segToDelete.components != undefined && $scope.segToDelete.components != null && $scope.segToDelete.components.length > 0) {
//
//                //clear components changes
//                angular.forEach($scope.dtToDelete.components, function (component) {
//                    $rootScope.recordDelete("component", "edit", component.id);
//                    $rootScope.removeObjectFromChanges("component", "delete", component.id);
//                });
//                if ($rootScope.changes["component"]["delete"] && $rootScope.changes["component"]["delete"].length === 0) {
//                    delete  $rootScope.changes["component"]["delete"];
//                }
//
//                if ($rootScope.changes["component"] && Object.getOwnPropertyNames($rootScope.changes["component"]).length === 0) {
//                    delete  $rootScope.changes["component"];
//                }
//
//            }
//
//            if ($scope.segToDelete.predicates != undefined && $scope.segToDelete.predicates != null && $scope.segToDelete.predicates.length > 0) {
//                //clear predicates changes
//                angular.forEach($scope.segToDelete.predicates, function (predicate) {
//                    $rootScope.recordDelete("predicate", "edit", predicate.id);
//                    $rootScope.removeObjectFromChanges("predicate", "delete", predicate.id);
//                });
//                if ($rootScope.changes["predicate"]["delete"] && $rootScope.changes["predicate"]["delete"].length === 0) {
//                    delete  $rootScope.changes["predicate"]["delete"];
//                }
//
//                if ($rootScope.changes["predicate"] && Object.getOwnPropertyNames($rootScope.changes["predicate"]).length === 0) {
//                    delete  $rootScope.changes["predicate"];
//                }
//
//            }
//
//            if ($scope.dtToDelete.conformanceStatements != undefined && $scope.dtToDelete.conformanceStatements != null && $scope.dtToDelete.conformanceStatements.length > 0) {
//                //clear conforamance statement changes
//                angular.forEach($scope.dtToDelete.conformanceStatements, function (confStatement) {
//                    $rootScope.recordDelete("conformanceStatement", "edit", confStatement.id);
//                    $rootScope.removeObjectFromChanges("conformanceStatement", "delete", confStatement.id);
//                });
//                if ($rootScope.changes["conformanceStatement"]["delete"] && $rootScope.changes["conformanceStatement"]["delete"].length === 0) {
//                    delete  $rootScope.changes["conformanceStatement"]["delete"];
//                }
//
//                if ($rootScope.changes["conformanceStatement"] && Object.getOwnPropertyNames($rootScope.changes["conformanceStatement"]).length === 0) {
//                    delete  $rootScope.changes["conformanceStatement"];
//                }
//            }
        }


        $rootScope.msg().text = "segDeleteSuccess";
        $rootScope.msg().type = "success";
        $rootScope.msg().show = true;
        $rootScope.manualHandle = true;
        $modalInstance.close($scope.segToDelete);

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

angular.module('igl').controller('SegmentReferencesCtrl', ["$scope", "$modalInstance", "segToDelete", function ($scope, $modalInstance, segToDelete) {

    $scope.segToDelete = segToDelete;

    $scope.ok = function () {
        $modalInstance.close($scope.segToDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

/**
 * Created by Jungyub on 4/01/15.
 */

angular.module('igl').controller('TableListCtrl', ["$scope", "$rootScope", "Restangular", "$filter", "$http", "$modal", "$timeout", "CloneDeleteSvc", function ($scope, $rootScope, Restangular, $filter, $http, $modal, $timeout, CloneDeleteSvc) {
    $scope.readonly = false;
    $scope.codeSysEditMode = false;
    $scope.codeSysForm = {};;
    $scope.saved = false;
    $scope.message = false;
    $scope.params = null;
    $scope.init = function () {
        $rootScope.$on('event:cloneTableFlavor', function(event, table) {
        	$scope.cloneTableFlavor(table);         
      });
    };

    $scope.addTable = function () {
        $rootScope.newTableFakeId = $rootScope.newTableFakeId - 1;
        var newTable = angular.fromJson({
            id: new ObjectId().toString(),
            type: 'table',
            bindingIdentifier: '',
            name: '',
            version: '',
            oid: '',
            tableType: '',
            stability: '',
            extensibility: '',
            codes: []
        });
        $rootScope.tables.push(newTable);
        $rootScope.tablesMap[newTable.id] = newTable;
        $rootScope.table = newTable;
        $rootScope.recordChangeForEdit2('table', "add", newTable.id,'table', newTable);
    };
    
    
    $scope.makeCodeSystemEditable = function () {
    	$scope.codeSysEditMode = true;
    };
    
    
    $scope.addCodeSystem = function () {
    	if($rootScope.codeSystems.indexOf($scope.codeSysForm.str) < 0){
    		if($scope.codeSysForm.str && $scope.codeSysForm.str !== ''){
    			$rootScope.codeSystems.push($scope.codeSysForm.str);
    		}
		}
    	$scope.codeSysForm.str = '';
    	$scope.codeSysEditMode = false;
    };
    
    $scope.delCodeSystem = function (value) {
    	$rootScope.codeSystems.splice($rootScope.codeSystems.indexOf(value), 1);
    }
    
    $scope.updateCodeSystem = function (table,codeSystem) {
    	for (var i = 0; i < $rootScope.table.codes.length; i++) {
    		$rootScope.table.codes[i].codeSystem = codeSystem;
    		$scope.recordChangeValue($rootScope.table.codes[i],'codeSystem',$rootScope.table.codes[i].codeSystem,table.id);
    	}
    }

    $scope.addValue = function () {
        $rootScope.newValueFakeId = $rootScope.newValueFakeId ?  $rootScope.newValueFakeId - 1: -1;
        var newValue = {
            id: new ObjectId().toString(),
            type: 'value',
            value: '',
            label: '',
            codeSystem: null,
            codeUsage: 'E'
        };


        $rootScope.table.codes.unshift(newValue);
        var newValueBlock = {targetType:'table', targetId:$rootScope.table.id, obj:newValue};
        if(!$scope.isNewObject('table', 'add', $rootScope.table.id)){
        	$rootScope.recordChangeForEdit2('value', "add", null,'value', newValueBlock);
        }
    };

    $scope.deleteValue = function (value) {
        if (!$scope.isNewValueThenDelete(value.id)) {
            $rootScope.recordChangeForEdit2('value', "delete", value.id,'id', value.id);
        }
        $rootScope.table.codes.splice($rootScope.table.codes.indexOf(value), 1);
    };

    $scope.isNewValueThenDelete = function (id) {
    	if($rootScope.isNewObject('value', 'add',id)){
    		if($rootScope.changes['value'] !== undefined && $rootScope.changes['value']['add'] !== undefined) {
    			for (var i = 0; i < $rootScope.changes['value']['add'].length; i++) {
        			var tmp = $rootScope.changes['value']['add'][i];
        			if (tmp.obj.id === id) {
                        $rootScope.changes['value']['add'].splice(i, 1);
                        if ($rootScope.changes["value"]["add"] && $rootScope.changes["value"]["add"].length === 0) {
                            delete  $rootScope.changes["value"]["add"];
                        }

                        if ($rootScope.changes["value"] && Object.getOwnPropertyNames($rootScope.changes["value"]).length === 0) {
                            delete  $rootScope.changes["value"];
                        }
                        return true;
                   }
        		}
    		}
    		return true;
    	}
    	if($rootScope.changes['value'] !== undefined && $rootScope.changes['value']['edit'] !== undefined) {
    		for (var i = 0; i < $rootScope.changes['value']['edit'].length; i++) {
    			var tmp = $rootScope.changes['value']['edit'][i];
    			if (tmp.id === id) {
                    $rootScope.changes['value']['edit'].splice(i, 1);
                    if ($rootScope.changes["value"]["edit"] && $rootScope.changes["value"]["edit"].length === 0) {
                        delete  $rootScope.changes["value"]["edit"];
                    }

                    if ($rootScope.changes["value"] && Object.getOwnPropertyNames($rootScope.changes["value"]).length === 0) {
                        delete  $rootScope.changes["value"];
                    }
                    return false;
               }
    		}
    		return false;
    	}
        return false;
    };
    
    $scope.isNewValue = function (id) {
        return $scope.isNewObject('value', 'add', id);
    };

    $scope.isNewTable = function (id) {
        return $scope.isNewObject('table', 'add',id);
    };

    $scope.close = function () {
        $rootScope.table = null;
    };

    $scope.copyTable = function (table) {
		CloneDeleteSvc.copyTable(table);
		$rootScope.$broadcast('event:SetToC');
    };

    $scope.recordChangeValue = function (value, valueType, tableId) {
        if (!$scope.isNewTable(tableId)) {
            if (!$scope.isNewValue(value.id)) {
            	$rootScope.recordChangeForEdit2('value', 'edit',value.id,valueType,value);  
            }
        }
    };

    $scope.recordChangeTable = function (table, valueType, value) {
        if (!$scope.isNewTable(table.id)) {
            $rootScope.recordChangeForEdit2('table', 'edit',table.id,valueType,value);            
        }
    };

    $scope.setAllCodeUsage = function (table, usage) {
        for (var i = 0, len = table.codes.length; i < len; i++) {
            if (table.codes[i].codeUsage !== usage) {
                table.codes[i].codeUsage = usage;
                if (!$scope.isNewTable(table.id) && !$scope.isNewValue(table.codes[i].id)) {
                    $rootScope.recordChangeForEdit2('value','edit',table.codes[i].id,'codeUsage',usage);  
                }
            }
        }
    };

    $scope.delete = function (table) {
    		CloneDeleteSvc.deleteValueSet(table);
//    		$rootScope.references = [];
//        angular.forEach($rootScope.segments, function (segment) {
//            $rootScope.findTableRefs(table, segment);
//        });
//        if ($rootScope.references != null && $rootScope.references.length > 0) {
//            $scope.abortDelete(table);
//        } else {
//            $scope.confirmDelete(table);
//        }
		$rootScope.$broadcast('event:SetToC');
   };

//    $scope.abortDelete = function (table) {
//        var modalInstance = $modal.open({
//            templateUrl: 'ValueSetReferencesCtrl.html',
//            controller: 'ValueSetReferencesCtrl',
//            resolve: {
//                tableToDelete: function () {
//                    return table;
//                }
//            }
//        });
//        modalInstance.result.then(function (table) {
//            $scope.tableToDelete = table;
//        }, function () {
//        });
//    };

//    $scope.confirmDelete = function (table) {
//        var modalInstance = $modal.open({
//            templateUrl: 'ConfirmValueSetDeleteCtrl.html',
//            controller: 'ConfirmValueSetDeleteCtrl',
//            resolve: {
//                tableToDelete: function () {
//                    return table;
//                }
//            }
//        });
//        modalInstance.result.then(function (table) {
//            $scope.tableToDelete = table;
//        }, function () {
//        });
//    };
}]);

angular.module('igl').controller('TableModalCtrl', ["$scope", function ($scope) {
    $scope.showModal = false;
    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;
    };
}]);

angular.module('igl').controller('ConfirmValueSetDeleteCtrl', ["$scope", "$modalInstance", "tableToDelete", "$rootScope", function ($scope, $modalInstance, tableToDelete, $rootScope) {
    $scope.tableToDelete = tableToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;

        if (!$scope.isNewTableThenDelete(tableToDelete.id)) {
        	$rootScope.recordChangeForEdit2('table', "delete", tableToDelete.id,'id', tableToDelete.id);
        }
        $rootScope.tables.splice($rootScope.tables.indexOf(tableToDelete), 1);
        $rootScope.tablesMap[tableToDelete.id] = undefined;
        
        
        $rootScope.generalInfo.type = 'info';
        $rootScope.generalInfo.message = "Table " + $scope.tableToDelete.bindingIdentifier + " deleted successfully";

        if ($rootScope.table === $scope.tableToDelete) {
            $rootScope.table = null;
        }

        $rootScope.references = [];
        $modalInstance.close($scope.tableToDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };




    $scope.isNewTableThenDelete = function (id) {
    	if($rootScope.isNewObject('table', 'add', id)){
    		if($rootScope.changes['table'] !== undefined && $rootScope.changes['table']['add'] !== undefined) {
    			for (var i = 0; i < $rootScope.changes['table']['add'].length; i++) {
        			var tmp = $rootScope.changes['table']['add'][i];
        			if (tmp.id == id) {
                        $rootScope.changes['table']['add'].splice(i, 1);
                        if ($rootScope.changes["table"]["add"] && $rootScope.changes["table"]["add"].length === 0) {
                            delete  $rootScope.changes["table"]["add"];
                        }

                        if ($rootScope.changes["table"] && Object.getOwnPropertyNames($rootScope.changes["table"]).length === 0) {
                            delete  $rootScope.changes["table"];
                        }
                        return true;
                   }
        		}
    		}
    		return true;
    	}
    	if($rootScope.changes['table'] !== undefined && $rootScope.changes['table']['edit'] !== undefined) {
    		for (var i = 0; i < $rootScope.changes['table']['edit'].length; i++) {
    			var tmp = $rootScope.changes['table']['edit'][i];
    			if (tmp.id === id) {
                    $rootScope.changes['table']['edit'].splice(i, 1);
                    if ($rootScope.changes["table"]["edit"] && $rootScope.changes["table"]["edit"].length === 0) {
                        delete  $rootScope.changes["table"]["edit"];
                    }

                    if ($rootScope.changes["table"] && Object.getOwnPropertyNames($rootScope.changes["table"]).length === 0) {
                        delete  $rootScope.changes["table"];
                    }
                    return false;
               }
    		}
    		return false;
    	}
        return false;
    };
}]);

angular.module('igl').controller('ValueSetReferencesCtrl', ["$scope", "$modalInstance", "tableToDelete", function ($scope, $modalInstance, tableToDelete) {

    $scope.tableToDelete = tableToDelete;

    $scope.ok = function () {
        $modalInstance.close($scope.tableToDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);