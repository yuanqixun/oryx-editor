

/**
 * Copyright (c) 2010
 * Daniel Schleicher
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/


if(!ORYX.Plugins) {
	ORYX.Plugins = new Object();
}

ORYX.Plugins.FragmentRepository = Clazz.extend({

				
	facade: undefined,

	construct: function(facade) {
		this.facade = facade;
		this._currentParent;
		this._canContain = undefined;
		this._canAttach  = undefined;

		this.shapeList = new Ext.tree.TreeNode({
			
		})

		var panel = new Ext.tree.TreePanel({
            cls:'shaperepository',
			loader: new Ext.tree.TreeLoader(),
			root: this.shapeList,
			autoScroll:true,
			rootVisible: false,
			lines: false,
			autoHeight: true,
			anchors: '0, -30'
		})
		var region = this.facade.addToRegion("east", panel, ORYX.I18N.ShapeRepository.title);
	
		
		// Create a Drag-Zone for Drag'n'Drop
		var DragZone = new Ext.dd.DragZone(this.shapeList.getUI().getEl(), {shadow: !Ext.isMac});
		DragZone.afterDragDrop = this.drop.bind(this, DragZone);
		//DragZone.beforeDragOver = this.beforeDragOver.bind(this, DragZone);
		DragZone.beforeDragEnter = function(){this._lastOverElement = false; return true}.bind(this);
		
		// Load all Stencilssets
		this.setStencilSets();
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED, this.setStencilSets.bind(this));

		},

		/**
		 * Load all stencilsets in the shaperepository
		 */
		setStencilSets: function() {
			// Remove all childs
			var child = this.shapeList.firstChild;
			while(child) {
				this.shapeList.removeChild(child);
				child = this.shapeList.firstChild;
			}

/*			// Go thru all Stencilsets and stencils
			this.facade.getStencilSets().values().each((function(sset) {
*/				
				// For each Stencilset create and add a new Tree-Node
				var stencilSetNode
				
				var typeTitle = "Fragment Repository";
	/*			var extensions = sset.extensions();
				if (extensions && extensions.size() > 0) {
					typeTitle += " / " + ORYX.Core.StencilSet.getTranslation(extensions.values()[0], "title");
				} 
	*/			
				this.shapeList.appendChild(stencilSetNode = new Ext.tree.TreeNode({
					text:typeTitle, 			// Stencilset Name
					allowDrag:false,
	        		allowDrop:false,           
					iconCls:'headerShapeRepImg',
		            cls:'headerShapeRep',
					singleClickExpand:true}));
				
				stencilSetNode.render();
				stencilSetNode.expand();	
				
				this.createStencilTreeNode(stencilSetNode, "description");	
				// Get Stencils from Stencilset
/*				var stencils = sset.stencils(this.facade.getCanvas().getStencil(),
											 this.facade.getRules());	
				var treeGroups = new Hash();
				
				// Sort the stencils according to their position and add them to the repository
				stencils = stencils.sortBy(function(value) { return value.position(); } );
				stencils.each((function(value) {
					
					// Show stencils in no group if there is less than 10 shapes
					if(stencils.length <= ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP) {
						this.createStencilTreeNode(stencilSetNode, value);	
						return;					
					}
					
					// Get the groups name
					var groups = value.groups();
					
					// For each Group-Entree
					groups.each((function(group) {
						
						// If there is a new group
						if(!treeGroups[group]) {
							// Create a new group
							treeGroups[group] = new Ext.tree.TreeNode({
								text:group,					// Group-Name
								allowDrag:false,
	        					allowDrop:false,            
								iconCls:'headerShapeRepImg', // Css-Class for Icon
					            cls:'headerShapeRepChild',  // CSS-Class for Stencil-Group
								singleClickExpand:true});
							
							// Add the Group to the ShapeRepository
							stencilSetNode.appendChild(treeGroups[group]);
							treeGroups[group].render();	
						}
						
						// Create the Stencil-Tree-Node
						this.createStencilTreeNode(treeGroups[group], value);	
						
					}).bind(this));
					
					
					// If there is no group
					if(groups.length == 0) {
						// Create the Stencil-Tree-Node
						this.createStencilTreeNode(stencilSetNode, value);						
					}
		
				}).bind(this));
*/			//}).bind(this));
				
			if (this.shapeList.firstChild.firstChild) {
				this.shapeList.firstChild.firstChild.expand(false, true);
			}	
		},

		createStencilTreeNode: function(parentTreeNode, stencil) {

			// Create and add the Stencil to the Group
			var newElement = new Ext.tree.TreeNode({
					text:		"Task", 		// Text of the stencil
					icon:		ORYX.PATH + "/stencilsets/bpmn2.0/icons/activity/task.png",			// Icon of the stencil
					allowDrag:	false,					// Don't use the Drag and Drop of Ext-Tree
					allowDrop:	false,
					iconCls:	'ShapeRepEntreeImg', 	// CSS-Class for Icon
					cls:		'ShapeRepEntree'		// CSS-Class for the Tree-Entree
					});

			parentTreeNode.appendChild(newElement);		
			newElement.render();	
					
			var ui = newElement.getUI();
			
			// Set the tooltip
			ui.elNode.setAttributeNS(null, "title", stencil);
			
			// Register the Stencil on Drag and Drop
			Ext.dd.Registry.register(ui.elNode, {
					node: 		ui.node,
			        handles: 	[ui.elNode, ui.textNode].concat($A(ui.elNode.childNodes)), // Set the Handles
			        isHandle: 	false,
					type:		"http://b3mn.org/stencilset/bpmn2.0#Task",			// Set Type of stencil 
					namespace:	"http://b3mn.org/stencilset/bpmn2.0#"	// Set Namespace of stencil
					});
									
		},
		
		drop: function(dragZone, target, event) {
			
			this._lastOverElement = undefined;
			
			// Hide the highlighting
			this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.added'});
			this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.attached'});
			
			// Check if drop is allowed
			var proxy = dragZone.getProxy()
			if(proxy.dropStatus == proxy.dropNotAllowed) { return }
			
			// Check if there is a current Parent
/*			if(!this._currentParent) { return }
			
			var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);
			
			var xy = event.getXY();
			var pos = {x: xy[0], y: xy[1]};

			var a = this.facade.getCanvas().node.getScreenCTM();

			// Correcting the UpperLeft-Offset
			pos.x -= a.e; pos.y -= a.f;		// Correcting the Zoom-Faktor
			pos.x /= a.a; pos.y /= a.d;
			// Correting the ScrollOffset
			pos.x -= document.documentElement.scrollLeft;
			pos.y -= document.documentElement.scrollTop;
			// Correct position of parent
			var parentAbs = this._currentParent.absoluteXY();
			pos.x -= parentAbs.x;
			pos.y -= parentAbs.y;

			// Set position
			option['position'] = pos
			
			// Set parent
			if( this._canAttach &&  this._currentParent instanceof ORYX.Core.Node ){
				option['parent'] = undefined;	
			} else {
				option['parent'] = this._currentParent;
			}
			
			
			var commandClass = ORYX.Core.Command.extend({
				construct: function(option, currentParent, canAttach, position, facade){
					this.option = option;
					this.currentParent = currentParent;
					this.canAttach = canAttach;
					this.position = position;
					this.facade = facade;
					this.selection = this.facade.getSelection();
					this.shape;
					this.parent;
				},			
				execute: function(){
					if (!this.shape) {
						this.shape 	= this.facade.createShape(option);
						this.parent = this.shape.parent;
					} else {
						this.parent.add(this.shape);
					}
						
					
					
					if( this.canAttach &&  this.currentParent instanceof ORYX.Core.Node && this.shape.dockers.length > 0){
						
						var docker = this.shape.dockers[0];
			
						if( this.currentParent.parent instanceof ORYX.Core.Node ) {
							this.currentParent.parent.add( docker.parent );
						}
													
						docker.bounds.centerMoveTo( this.position );
						docker.setDockedShape( this.currentParent );
						//docker.update();	
					}
			
					//this.currentParent.update();
					//this.shape.update();

					this.facade.setSelection([this.shape]);
					this.facade.getCanvas().update();
					this.facade.updateSelection();
					
				},
				rollback: function(){
					this.facade.deleteShape(this.shape);
					
					//this.currentParent.update();

					this.facade.setSelection(this.selection.without(this.shape));
					this.facade.getCanvas().update();
					this.facade.updateSelection();
					
				}
			});
								
			var position = this.facade.eventCoordinates( event.browserEvent );	
						
			var command = new commandClass(option, this._currentParent, this._canAttach, position, this.facade);
			
			this.facade.executeCommands([command]);
			
			this._currentParent = undefined;*/
			
			var fragmentToBeImported = {
					   "resourceId":"oryx-canvas123",
					   "properties":{
					      "id":"",
					      "name":"",
					      "documentation":"",
					      "auditing":"",
					      "monitoring":"",
					      "version":"",
					      "author":"",
					      "language":"English",
					      "namespaces":"",
					      "targetnamespace":"http://www.omg.org/bpmn20",
					      "expressionlanguage":"http://www.w3.org/1999/XPath",
					      "typelanguage":"http://www.w3.org/2001/XMLSchema",
					      "creationdate":"",
					      "modificationdate":""
					   },
					   "stencil":{
					      "id":"BPMNDiagram"
					   },
					   "childShapes":[
					      {
					         "resourceId":"oryx_C2AE5B00-4718-4FD3-A60B-8B0C300223F2",
					         "properties":{
					            "id":"",
					            "name":"",
					            "documentation":"",
					            "auditing":"",
					            "monitoring":"",
					            "categories":"",
					            "startquantity":1,
					            "completionquantity":1,
					            "status":"None",
					            "performers":"",
					            "properties":"",
					            "inputsets":"",
					            "inputs":"",
					            "outputsets":"",
					            "outputs":"",
					            "iorules":"",
					            "testtime":"After",
					            "mi_condition":"",
					            "mi_flowcondition":"All",
					            "isforcompensation":"",
					            "assignments":"",
					            "pool":"",
					            "lanes":"",
					            "looptype":"None",
					            "loopcondition":"",
					            "loopcounter":1,
					            "loopmaximum":1,
					            "callacitivity":"",
					            "activitytype":"Task",
					            "tasktype":"Send",
					            "inmessage":"",
					            "outmessage":"",
					            "implementation":"webService",
					            "resources":"",
					            "complexmi_condition":"",
					            "messageref":"",
					            "operationref":"",
					            "taskref":"",
					            "instantiate":"",
					            "script":"",
					            "script_language":"",
					            "bgcolor":"#ffffcc"
					         },
					         "stencil":{
					            "id":"Task"
					         },
					         "childShapes":[

					         ],
					         "outgoing":[

					         ],
					         "bounds":{
					            "lowerRight":{
					               "x":251,
					               "y":180
					            },
					            "upperLeft":{
					               "x":151,
					               "y":100
					            }
					         },
					         "dockers":[

					         ]
					      }
					   ],
					   "bounds":{
					      "lowerRight":{
					         "x":1485,
					         "y":1050
					      },
					      "upperLeft":{
					         "x":0,
					         "y":0
					      }
					   },
					   "stencilset":{
					      "url":ORYX.PATH + "/stencilsets/bpmn2.0/bpmn2.0.json",
					      "namespace":"http://b3mn.org/stencilset/bpmn2.0#"
					   },
					   "ssextensions":[
					      "http://oryx-editor.org/stencilsets/extensions/bpmnComplianceTemplate#"
					   ]
					}
;
		
		//We have to put the fragment on the same 
		//position where the mouse-up event occured. 
		var positionOfFragment = fragmentToBeImported.childShapes[0].bounds.upperLeft.x;
		var eventCoordinates = event.getXY();	
		
		var matrix = this.facade.getCanvas().node.getScreenCTM();

		// Correcting the UpperLeft-Offset
		eventCoordinates[0] -= matrix.e; 
		eventCoordinates[1] -= matrix.f;		// Correcting the Zoom-Faktor
		
		eventCoordinates[0] /= matrix.a; 
		eventCoordinates[1] /= matrix.d; // Correting the ScrollOffset
		eventCoordinates[0] -= document.documentElement.scrollLeft;
		eventCoordinates[1] -= document.documentElement.scrollTop;
		// Correct position of parent
/*		var parentAbs = this._currentParent.absoluteXY();
		eventCoordinates[0] -= parentAbs.x;
		eventCoordinates[1] -= parentAbs.y;
*/		
		fragmentToBeImported.childShapes[0].bounds.upperLeft.x = eventCoordinates[0];
		fragmentToBeImported.childShapes[0].bounds.upperLeft.y = eventCoordinates[1];
		
		fragmentToBeImported.childShapes[0].bounds.lowerRight.x = eventCoordinates[0] + 100;
		fragmentToBeImported.childShapes[0].bounds.lowerRight.y = eventCoordinates[1] + 80;
		
		
		this.facade.importJSON(fragmentToBeImported, true);
		
		},

		beforeDragOver: function(dragZone, target, event){

			var coord = this.facade.eventCoordinates(event.browserEvent);
			var aShapes = this.facade.getCanvas().getAbstractShapesAtPosition( coord );

			if(aShapes.length <= 0) {
				
					var pr = dragZone.getProxy();
					pr.setStatus(pr.dropNotAllowed);
					pr.sync();
					
					return false;
			}	
			
			var el = aShapes.last();
		
			
			if(aShapes.lenght == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
				
				return false;
				
			} else {
				// check containment rules
				var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);

				var stencilSet = this.facade.getStencilSets()[option.namespace];

				var stencil = stencilSet.stencil(option.type);

				if(stencil.type() === "node") {
					
					var parentCandidate = aShapes.reverse().find(function(candidate) {
						return (candidate instanceof ORYX.Core.Canvas 
								|| candidate instanceof ORYX.Core.Node
								|| candidate instanceof ORYX.Core.Edge);
					});
					
					if(  parentCandidate !== this._lastOverElement){
						
						this._canAttach  = undefined;
						this._canContain = undefined;
						
					}
					
					if( parentCandidate ) {
						//check containment rule					
							
						if (!(parentCandidate instanceof ORYX.Core.Canvas) && parentCandidate.isPointOverOffset(coord.x, coord.y) && this._canAttach == undefined) {
						
							this._canAttach = this.facade.getRules().canConnect({
													sourceShape: parentCandidate,
													edgeStencil: stencil,
													targetStencil: stencil
												});
							
							if( this._canAttach ){
								// Show Highlight
								this.facade.raiseEvent({
									type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
									highlightId: "shapeRepo.attached",
									elements: [parentCandidate],
									style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
									color: ORYX.CONFIG.SELECTION_VALID_COLOR
								});
								
								this.facade.raiseEvent({
									type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
									highlightId: "shapeRepo.added"
								});
								
								this._canContain	= undefined;
							} 					
							
						}
						
						if(!(parentCandidate instanceof ORYX.Core.Canvas) && !parentCandidate.isPointOverOffset(coord.x, coord.y)){
							this._canAttach 	= this._canAttach == false ? this._canAttach : undefined;						
						}
						
						if( this._canContain == undefined && !this._canAttach) {
												
							this._canContain = this.facade.getRules().canContain({
																containingShape:parentCandidate, 
																containedStencil:stencil
																});
																
							// Show Highlight
							this.facade.raiseEvent({
																type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 
																highlightId:'shapeRepo.added',
																elements:	[parentCandidate],
																color:		this._canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
															});	
							this.facade.raiseEvent({
																type: 		ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
																highlightId:"shapeRepo.attached"
															});						
						}
							
					
						
						this._currentParent = this._canContain || this._canAttach ? parentCandidate : undefined;
						this._lastOverElement = parentCandidate;
						var pr = dragZone.getProxy();
						pr.setStatus(this._currentParent ? pr.dropAllowed : pr.dropNotAllowed );
						pr.sync();
		
					} 
				} else { //Edge
					this._currentParent = this.facade.getCanvas();
					var pr = dragZone.getProxy();
					pr.setStatus(pr.dropAllowed);
					pr.sync();
				}		
			}
			
			
			return false
		}	
});
/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins) {	ORYX.Plugins = new Object();}ORYX.Plugins.ShapeRepository = {	facade: undefined,	construct: function(facade) {		this.facade = facade;		this._currentParent;		this._canContain = undefined;		this._canAttach  = undefined;		this.shapeList = new Ext.tree.TreeNode({					})		var panel = new Ext.tree.TreePanel({            cls:'shaperepository',			loader: new Ext.tree.TreeLoader(),			root: this.shapeList,			autoScroll:true,			rootVisible: false,			lines: false,			anchors: '0, -30'		})		var region = this.facade.addToRegion("west", panel, ORYX.I18N.ShapeRepository.title);					// Create a Drag-Zone for Drag'n'Drop		var DragZone = new Ext.dd.DragZone(this.shapeList.getUI().getEl(), {shadow: !Ext.isMac});		DragZone.afterDragDrop = this.drop.bind(this, DragZone);		DragZone.beforeDragOver = this.beforeDragOver.bind(this, DragZone);		DragZone.beforeDragEnter = function(){this._lastOverElement = false; return true}.bind(this);				// Load all Stencilssets		this.setStencilSets();				this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED, this.setStencilSets.bind(this));	},			/**	 * Load all stencilsets in the shaperepository	 */	setStencilSets: function() {		// Remove all childs		var child = this.shapeList.firstChild;		while(child) {			this.shapeList.removeChild(child);			child = this.shapeList.firstChild;		}		// Go thru all Stencilsets and stencils		this.facade.getStencilSets().values().each((function(sset) {						// For each Stencilset create and add a new Tree-Node			var stencilSetNode						var typeTitle = sset.title();			var extensions = sset.extensions();			if (extensions && extensions.size() > 0) {				typeTitle += " / " + ORYX.Core.StencilSet.getTranslation(extensions.values()[0], "title");			} 						this.shapeList.appendChild(stencilSetNode = new Ext.tree.TreeNode({				text:typeTitle, 			// Stencilset Name				allowDrag:false,        		allowDrop:false,           				iconCls:'headerShapeRepImg',	            cls:'headerShapeRep',				singleClickExpand:true}));						stencilSetNode.render();			stencilSetNode.expand();							// Get Stencils from Stencilset			var stencils = sset.stencils(this.facade.getCanvas().getStencil(),										 this.facade.getRules());				var treeGroups = new Hash();						// Sort the stencils according to their position and add them to the repository			stencils = stencils.sortBy(function(value) { return value.position(); } );			stencils.each((function(value) {								// Show stencils in no group if there is less than 10 shapes				if(stencils.length <= ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP) {					this.createStencilTreeNode(stencilSetNode, value);						return;									}								// Get the groups name				var groups = value.groups();								// For each Group-Entree				groups.each((function(group) {										// If there is a new group					if(!treeGroups[group]) {						// Create a new group						treeGroups[group] = new Ext.tree.TreeNode({							text:group,					// Group-Name							allowDrag:false,        					allowDrop:false,            							iconCls:'headerShapeRepImg', // Css-Class for Icon				            cls:'headerShapeRepChild',  // CSS-Class for Stencil-Group							singleClickExpand:true});												// Add the Group to the ShapeRepository						stencilSetNode.appendChild(treeGroups[group]);						treeGroups[group].render();						}										// Create the Stencil-Tree-Node					this.createStencilTreeNode(treeGroups[group], value);										}).bind(this));												// If there is no group				if(groups.length == 0) {					// Create the Stencil-Tree-Node					this.createStencilTreeNode(stencilSetNode, value);										}				}).bind(this));		}).bind(this));					if (this.shapeList.firstChild.firstChild) {			this.shapeList.firstChild.firstChild.expand(false, true);		}		},	createStencilTreeNode: function(parentTreeNode, stencil) {		// Create and add the Stencil to the Group		var newElement = new Ext.tree.TreeNode({				text:		stencil.title(), 		// Text of the stencil				icon:		stencil.icon(),			// Icon of the stencil				allowDrag:	false,					// Don't use the Drag and Drop of Ext-Tree				allowDrop:	false,				iconCls:	'ShapeRepEntreeImg', 	// CSS-Class for Icon				cls:		'ShapeRepEntree'		// CSS-Class for the Tree-Entree				});		parentTreeNode.appendChild(newElement);				newElement.render();							var ui = newElement.getUI();				// Set the tooltip		ui.elNode.setAttributeNS(null, "title", stencil.description());				// Register the Stencil on Drag and Drop		Ext.dd.Registry.register(ui.elNode, {				node: 		ui.node,		        handles: 	[ui.elNode, ui.textNode].concat($A(ui.elNode.childNodes)), // Set the Handles		        isHandle: 	false,				type:		stencil.id(),			// Set Type of stencil 				namespace:	stencil.namespace()		// Set Namespace of stencil				});									},		drop: function(dragZone, target, event) {				this._lastOverElement = undefined;				// Hide the highlighting		this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.added'});		this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.attached'});				// Check if drop is allowed		var proxy = dragZone.getProxy()		if(proxy.dropStatus == proxy.dropNotAllowed) { return }				// Check if there is a current Parent		if(!this._currentParent) { return }				var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);				var xy = event.getXY();		var pos = {x: xy[0], y: xy[1]};		var a = this.facade.getCanvas().node.getScreenCTM();		// Correcting the UpperLeft-Offset		pos.x -= a.e; pos.y -= a.f;		// Correcting the Zoom-Faktor		pos.x /= a.a; pos.y /= a.d;		// Correting the ScrollOffset		pos.x -= document.documentElement.scrollLeft;		pos.y -= document.documentElement.scrollTop;		// Correct position of parent		var parentAbs = this._currentParent.absoluteXY();		pos.x -= parentAbs.x;		pos.y -= parentAbs.y;		// Set position		option['position'] = pos				// Set parent		if( this._canAttach &&  this._currentParent instanceof ORYX.Core.Node ){			option['parent'] = undefined;			} else {			option['parent'] = this._currentParent;		}						var commandClass = ORYX.Core.Command.extend({			construct: function(option, currentParent, canAttach, position, facade){				this.option = option;				this.currentParent = currentParent;				this.canAttach = canAttach;				this.position = position;				this.facade = facade;				this.selection = this.facade.getSelection();				this.shape;				this.parent;			},						execute: function(){				if (!this.shape) {					this.shape 	= this.facade.createShape(option);					this.parent = this.shape.parent;				} else {					this.parent.add(this.shape);				}																	if( this.canAttach &&  this.currentParent instanceof ORYX.Core.Node && this.shape.dockers.length > 0){										var docker = this.shape.dockers[0];							if( this.currentParent.parent instanceof ORYX.Core.Node ) {						this.currentParent.parent.add( docker.parent );					}																	docker.bounds.centerMoveTo( this.position );					docker.setDockedShape( this.currentParent );					//docker.update();					}						//this.currentParent.update();				//this.shape.update();				this.facade.setSelection([this.shape]);				this.facade.getCanvas().update();				this.facade.updateSelection();							},			rollback: function(){				this.facade.deleteShape(this.shape);								//this.currentParent.update();				this.facade.setSelection(this.selection.without(this.shape));				this.facade.getCanvas().update();				this.facade.updateSelection();							}		});									var position = this.facade.eventCoordinates( event.browserEvent );								var command = new commandClass(option, this._currentParent, this._canAttach, position, this.facade);				this.facade.executeCommands([command]);				this._currentParent = undefined;	},	beforeDragOver: function(dragZone, target, event){		var coord = this.facade.eventCoordinates(event.browserEvent);		var aShapes = this.facade.getCanvas().getAbstractShapesAtPosition( coord );		if(aShapes.length <= 0) {							var pr = dragZone.getProxy();				pr.setStatus(pr.dropNotAllowed);				pr.sync();								return false;		}					var el = aShapes.last();					if(aShapes.lenght == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {						return false;					} else {			// check containment rules			var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);			var stencilSet = this.facade.getStencilSets()[option.namespace];			var stencil = stencilSet.stencil(option.type);			if(stencil.type() === "node") {								var parentCandidate = aShapes.reverse().find(function(candidate) {					return (candidate instanceof ORYX.Core.Canvas 							|| candidate instanceof ORYX.Core.Node							|| candidate instanceof ORYX.Core.Edge);				});								if(  parentCandidate !== this._lastOverElement){										this._canAttach  = undefined;					this._canContain = undefined;									}								if( parentCandidate ) {					//check containment rule																if (!(parentCandidate instanceof ORYX.Core.Canvas) && parentCandidate.isPointOverOffset(coord.x, coord.y) && this._canAttach == undefined) {											this._canAttach = this.facade.getRules().canConnect({												sourceShape: parentCandidate,												edgeStencil: stencil,												targetStencil: stencil											});												if( this._canAttach ){							// Show Highlight							this.facade.raiseEvent({								type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,								highlightId: "shapeRepo.attached",								elements: [parentCandidate],								style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,								color: ORYX.CONFIG.SELECTION_VALID_COLOR							});														this.facade.raiseEvent({								type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,								highlightId: "shapeRepo.added"							});														this._canContain	= undefined;						} 																}										if(!(parentCandidate instanceof ORYX.Core.Canvas) && !parentCandidate.isPointOverOffset(coord.x, coord.y)){						this._canAttach 	= this._canAttach == false ? this._canAttach : undefined;											}										if( this._canContain == undefined && !this._canAttach) {																	this._canContain = this.facade.getRules().canContain({															containingShape:parentCandidate, 															containedStencil:stencil															});																					// Show Highlight						this.facade.raiseEvent({															type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 															highlightId:'shapeRepo.added',															elements:	[parentCandidate],															color:		this._canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR														});							this.facade.raiseEvent({															type: 		ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,															highlightId:"shapeRepo.attached"														});											}																				this._currentParent = this._canContain || this._canAttach ? parentCandidate : undefined;					this._lastOverElement = parentCandidate;					var pr = dragZone.getProxy();					pr.setStatus(this._currentParent ? pr.dropAllowed : pr.dropNotAllowed );					pr.sync();					} 			} else { //Edge				this._currentParent = this.facade.getCanvas();				var pr = dragZone.getProxy();				pr.setStatus(pr.dropAllowed);				pr.sync();			}				}						return false	}	}ORYX.Plugins.ShapeRepository = Clazz.extend(ORYX.Plugins.ShapeRepository);/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/


if(!ORYX.Plugins) {
	ORYX.Plugins = new Object();
}

ORYX.Plugins.PropertyWindow = {

	facade: undefined,

	construct: function(facade) {
		// Reference to the Editor-Interface
		this.facade = facade;

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW, this.init.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.selectDiagram.bind(this));
		this.init();
	},
	
	init: function(){

		// The parent div-node of the grid
		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml",
			null,
			['div']);

		// If the current property in focus is of type 'Date', the date format
		// is stored here.
		this.currentDateFormat;

		// the properties array
		this.popularProperties = [];
		this.properties = [];
		
		/* The currently selected shapes whos properties will shown */
		this.shapeSelection = new Hash();
		this.shapeSelection.shapes = new Array();
		this.shapeSelection.commonProperties = new Array();
		this.shapeSelection.commonPropertiesValues = new Hash();
		
		this.updaterFlag = false;

		// creating the column model of the grid.
		this.columnModel = new Ext.grid.ColumnModel([
			{
				//id: 'name',
				header: ORYX.I18N.PropertyWindow.name,
				dataIndex: 'name',
				width: 90,
				sortable: true,
				renderer: this.tooltipRenderer.bind(this)
			}, {
				//id: 'value',
				header: ORYX.I18N.PropertyWindow.value,
				dataIndex: 'value',
				id: 'propertywindow_column_value',
				width: 110,
				editor: new Ext.form.TextField({
					allowBlank: false
				}),
				renderer: this.renderer.bind(this)
			},
			{
				header: "Pop",
				dataIndex: 'popular',
				hidden: true,
				sortable: true
			}
		]);

		// creating the store for the model.
        this.dataSource = new Ext.data.GroupingStore({
			proxy: new Ext.data.MemoryProxy(this.properties),
			reader: new Ext.data.ArrayReader({}, [
				{name: 'popular'},
				{name: 'name'},
				{name: 'value'},
				{name: 'icons'},
				{name: 'gridProperties'}
			]),
			sortInfo: {field: 'popular', direction: "ASC"},
			sortData : function(f, direction){
		        direction = direction || 'ASC';
		        var st = this.fields.get(f).sortType;
		        var fn = function(r1, r2){
		            var v1 = st(r1.data[f]), v2 = st(r2.data[f]);
					var p1 = r1.data['popular'], p2  = r2.data['popular'];
		            return p1 && !p2 ? -1 : (!p1 && p2 ? 1 : (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0)));
		        };
		        this.data.sort(direction, fn);
		        if(this.snapshot && this.snapshot != this.data){
		            this.snapshot.sort(direction, fn);
				}
		    },
			groupField: 'popular'
        });
		this.dataSource.load();
		
		this.grid = new Ext.grid.EditorGridPanel({
			clicksToEdit: 1,
			stripeRows: true,
			autoExpandColumn: "propertywindow_column_value",
			width:'auto',
			// the column model
			colModel: this.columnModel,
			enableHdMenu: false,
			view: new Ext.grid.GroupingView({
				forceFit: true,
				groupTextTpl: '{[values.rs.first().data.popular ? ORYX.I18N.PropertyWindow.oftenUsed : ORYX.I18N.PropertyWindow.moreProps]}'
			}),
			
			// the data store
			store: this.dataSource
			
		});

		region = this.facade.addToRegion('east', new Ext.Panel({
			width: 220,
			layout: "fit",
			border: false,
			title: 'Properties',
			items: [
				this.grid 
			]
		}), ORYX.I18N.PropertyWindow.title)

		// Register on Events
		this.grid.on('beforeedit', this.beforeEdit, this, true);
		this.grid.on('afteredit', this.afterEdit, this, true);
		this.grid.view.on('refresh', this.hideMoreAttrs, this, true);
		
		//this.grid.on(ORYX.CONFIG.EVENT_KEYDOWN, this.keyDown, this, true);
		
		// Renderer the Grid
		this.grid.enableColumnMove = false;
		//this.grid.render();

		// Sort as Default the first column
		//this.dataSource.sort('name');

	},
	
	// Select the Canvas when the editor is ready
	selectDiagram: function() {
		this.shapeSelection.shapes = [this.facade.getCanvas()];
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.createProperties();
	},

	specialKeyDown: function(field, event) {
		// If there is a TextArea and the Key is an Enter
		if(field instanceof Ext.form.TextArea && event.button == ORYX.CONFIG.KEY_Code_enter) {
			// Abort the Event
			return false
		}
	},
	tooltipRenderer: function(value, p, record) {
		/* Prepare tooltip */
		p.cellAttr = 'title="' + record.data.gridProperties.tooltip + '"';
		return value;
	},
	
	renderer: function(value, p, record) {
		
		this.tooltipRenderer(value, p, record);
				
		if(value instanceof Date) {
			// TODO: Date-Schema is not generic
			value = value.dateFormat(ORYX.I18N.PropertyWindow.dateFormat);
		} else if(String(value).search("<a href='") < 0) {
			// Shows the Value in the Grid in each Line
			value = String(value).gsub("<", "&lt;");
			value = String(value).gsub(">", "&gt;");
			value = String(value).gsub("%", "&#37;");
			value = String(value).gsub("&", "&amp;");

			if(record.data.gridProperties.type == ORYX.CONFIG.TYPE_COLOR) {
				value = "<div class='prop-background-color' style='background-color:" + value + "' />";
			}			

			record.data.icons.each(function(each) {
				if(each.name == value) {
					if(each.icon) {
						value = "<img src='" + each.icon + "' /> " + value;
					}
				}
			});
		}

		return value;
	},

	beforeEdit: function(option) {

		var editorGrid 		= this.dataSource.getAt(option.row).data.gridProperties.editor;
		var editorRenderer 	= this.dataSource.getAt(option.row).data.gridProperties.renderer;

		if(editorGrid) {
			// Disable KeyDown
			this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);

			option.grid.getColumnModel().setEditor(1, editorGrid);
			
			editorGrid.field.row = option.row;
			// Render the editor to the grid, therefore the editor is also available 
			// for the first and last row
			editorGrid.render(this.grid);
			
			//option.grid.getColumnModel().setRenderer(1, editorRenderer);
			editorGrid.setSize(option.grid.getColumnModel().getColumnWidth(1), editorGrid.height);
		} else {
			return false;
		}
		
		var key = this.dataSource.getAt(option.row).data.gridProperties.propId;
		
		this.oldValues = new Hash();
		this.shapeSelection.shapes.each(function(shape){
			this.oldValues[shape.getId()] = shape.properties[key];
		}.bind(this)); 
	},

	afterEdit: function(option) {
		//Ext1.0: option.grid.getDataSource().commitChanges();
		option.grid.getStore().commitChanges();

		var key 			 = option.record.data.gridProperties.propId;
		var selectedElements = this.shapeSelection.shapes;
		
		var oldValues 	= this.oldValues;	
		
		var newValue	= option.value;
		var facade		= this.facade;
		

		// Implement the specific command for property change
		var commandClass = ORYX.Core.Command.extend({
			construct: function(){
				this.key 		= key;
				this.selectedElements = selectedElements;
				this.oldValues = oldValues;
				this.newValue 	= newValue;
				this.facade		= facade;
			},			
			execute: function(){
				this.selectedElements.each(function(shape){
					if(!shape.getStencil().property(this.key).readonly()) {
						shape.setProperty(this.key, this.newValue);
					}
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			},
			rollback: function(){
				this.selectedElements.each(function(shape){
					shape.setProperty(this.key, this.oldValues[shape.getId()]);
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			}
		})		
		// Instanciated the class
		var command = new commandClass();
		
		// Execute the command
		this.facade.executeCommands([command]);


		// extended by Kerstin (start)
//
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: option.value
		});
		// extended by Kerstin (end)
	},
	
	// Cahnges made in the property window will be shown directly
	editDirectly:function(key, value){
		
		this.shapeSelection.shapes.each(function(shape){
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, value);
				//shape.update();
			}
		}.bind(this));
		
		/* Propagate changed properties */
		var selectedElements = this.shapeSelection.shapes;
		
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: value
		});

		this.facade.getCanvas().update();
		
	},
	
	// if a field becomes invalid after editing the shape must be restored to the old value
	updateAfterInvalid : function(key) {
		this.shapeSelection.shapes.each(function(shape) {
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, this.oldValues[shape.getId()]);
				shape.update();
			}
		}.bind(this));
		
		this.facade.getCanvas().update();
	},

	// extended by Kerstin (start)	
	dialogClosed: function(data) {
		var row = this.field ? this.field.row : this.row 
		this.scope.afterEdit({
			grid:this.scope.grid, 
			record:this.scope.grid.getStore().getAt(row), 
			//value:this.scope.grid.getStore().getAt(this.row).get("value")
			value: data
		})
		// reopen the text field of the complex list field again
		this.scope.grid.startEditing(row, this.col);
	},
	// extended by Kerstin (end)
	
	/**
	 * Changes the title of the property window panel according to the selected shapes.
	 */
	setPropertyWindowTitle: function() {
		if(this.shapeSelection.shapes.length == 1) {
			// add the name of the stencil of the selected shape to the title
				region.setTitle(ORYX.I18N.PropertyWindow.title +' ('+this.shapeSelection.shapes.first().getStencil().title()+')' );
		} else {
			region.setTitle(ORYX.I18N.PropertyWindow.title +' ('
							+ this.shapeSelection.shapes.length
							+ ' '
							+ ORYX.I18N.PropertyWindow.selected 
							+')');
		}
	},
	/**
	 * Sets this.shapeSelection.commonPropertiesValues.
	 * If the value for a common property is not equal for each shape the value
	 * is left empty in the property window.
	 */
	setCommonPropertiesValues: function() {
		this.shapeSelection.commonPropertiesValues = new Hash();
		this.shapeSelection.commonProperties.each(function(property){
			var key = property.prefix() + "-" + property.id();
			var emptyValue = false;
			var firstShape = this.shapeSelection.shapes.first();
			
			this.shapeSelection.shapes.each(function(shape){
				if(firstShape.properties[key] != shape.properties[key]) {
					emptyValue = true;
				}
			}.bind(this));
			
			/* Set property value */
			if(!emptyValue) {
				this.shapeSelection.commonPropertiesValues[key]
					= firstShape.properties[key];
			}
		}.bind(this));
	},
	
	/**
	 * Returns the set of stencils used by the passed shapes.
	 */
	getStencilSetOfSelection: function() {
		var stencils = new Hash();
		
		this.shapeSelection.shapes.each(function(shape) {
			stencils[shape.getStencil().id()] = shape.getStencil();
		})
		return stencils;
	},
	
	/**
	 * Identifies the common Properties of the selected shapes.
	 */
	identifyCommonProperties: function() {
		this.shapeSelection.commonProperties.clear();
		
		/* 
		 * A common property is a property, that is part of 
		 * the stencil definition of the first and all other stencils.
		 */
		var stencils = this.getStencilSetOfSelection();
		var firstStencil = stencils.values().first();
		var comparingStencils = stencils.values().without(firstStencil);
		
		
		if(comparingStencils.length == 0) {
			this.shapeSelection.commonProperties = firstStencil.properties();
		} else {
			var properties = new Hash();
			
			/* put all properties of on stencil in a Hash */
			firstStencil.properties().each(function(property){
				properties[property.namespace() + '-' + property.id() 
							+ '-' + property.type()] = property;
			});
			
			/* Calculate intersection of properties. */
			
			comparingStencils.each(function(stencil){
				var intersection = new Hash();
				stencil.properties().each(function(property){
					if(properties[property.namespace() + '-' + property.id()
									+ '-' + property.type()]){
						intersection[property.namespace() + '-' + property.id()
										+ '-' + property.type()] = property;
					}
				});
				properties = intersection;	
			});
			
			this.shapeSelection.commonProperties = properties.values();
		}
	},
	
	onSelectionChanged: function(event) {
		/* Event to call afterEdit method */
		this.grid.stopEditing();
		
		/* Selected shapes */
		this.shapeSelection.shapes = event.elements;
		
		/* Case: nothing selected */
		if(event.elements.length == 0) {
			this.shapeSelection.shapes = [this.facade.getCanvas()];
		}
		
		/* subselection available */
		if(event.subSelection){
			this.shapeSelection.shapes = [event.subSelection];
		}
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.setCommonPropertiesValues();
		
		// Create the Properties
		
		this.createProperties();
	},
	
	/**
	 * Creates the properties for the ExtJS-Grid from the properties of the
	 * selected shapes.
	 */
	createProperties: function() {
		this.properties = [];
		this.popularProperties = [];

		if(this.shapeSelection.commonProperties) {
			
			// add new property lines
			this.shapeSelection.commonProperties.each((function(pair, index) {

				var key = pair.prefix() + "-" + pair.id();
				
				// Get the property pair
				var name		= pair.title();
				var icons		= [];
				var attribute	= this.shapeSelection.commonPropertiesValues[key];
				
				var editorGrid = undefined;
				var editorRenderer = null;
				
				var refToViewFlag = false;

				if(!pair.readonly()){
					switch(pair.type()) {
						case ORYX.CONFIG.TYPE_STRING:
							// If the Text is MultiLine
							if(pair.wrapLines()) {
								// Set the Editor as TextArea
								var editorTextArea = new Ext.form.TextArea({alignment: "tl-tl", allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorTextArea.on('keyup', function(textArea, event) {
									this.editDirectly(key, textArea.getValue());
								}.bind(this));								
								
								editorGrid = new Ext.Editor(editorTextArea);
							} else {
								// If not, set the Editor as InputField
								var editorInput = new Ext.form.TextField({allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorInput.on('keyup', function(input, event) {
									this.editDirectly(key, input.getValue());
								}.bind(this));
								
								// reverts the shape if the editor field is invalid
								editorInput.on('blur', function(input) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));
								
								editorInput.on("specialkey", function(input, e) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));
								
								editorGrid = new Ext.Editor(editorInput);
							}
							break;
						case ORYX.CONFIG.TYPE_BOOLEAN:
							// Set the Editor as a CheckBox
							var editorCheckbox = new Ext.form.Checkbox();
							editorCheckbox.on('check', function(c,checked) {
								this.editDirectly(key, checked);
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorCheckbox);
							break;
						case ORYX.CONFIG.TYPE_INTEGER:
							// Set as an Editor for Integers
							var numberField = new Ext.form.NumberField({allowBlank: pair.optional(), allowDecimals:false, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));							
							
							editorGrid = new Ext.Editor(numberField);
							break;
						case ORYX.CONFIG.TYPE_FLOAT:
							// Set as an Editor for Float
							var numberField = new Ext.form.NumberField({ allowBlank: pair.optional(), allowDecimals:true, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));
							
							editorGrid = new Ext.Editor(numberField);

							break;
						case ORYX.CONFIG.TYPE_COLOR:
							// Set as a ColorPicker
							// Ext1.0 editorGrid = new gEdit(new form.ColorField({ allowBlank: pair.optional(),  msgTarget:'title' }));

							var editorPicker = new Ext.ux.ColorField({ allowBlank: pair.optional(),  msgTarget:'title', facade: this.facade });
							
							/*this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COLOR_CHANGE, function(option) {
								this.editDirectly(key, option.value);
							}.bind(this));*/
							
							editorGrid = new Ext.Editor(editorPicker);

							break;
						case ORYX.CONFIG.TYPE_CHOICE:
							var items = pair.items();
													
							var options = [];
							items.each(function(value) {
								if(value.value() == attribute)
									attribute = value.title();
									
								if(value.refToView()[0])
									refToViewFlag = true;
																
								options.push([value.icon(), value.title(), value.value()]);
															
								icons.push({
									name: value.title(),
									icon: value.icon()
								});
							});
							
							var store = new Ext.data.SimpleStore({
						        fields: [{name: 'icon'},
									{name: 'title'},
									{name: 'value'}	],
						        data : options // from states.js
						    });
							
							// Set the grid Editor

						    var editorCombo = new Ext.form.ComboBox({
								tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
						        store: store,
						        displayField:'title',
								valueField: 'value',
						        typeAhead: true,
						        mode: 'local',
						        triggerAction: 'all',
						        selectOnFocus:true
						    });
								
							editorCombo.on('select', function(combo, record, index) {
								this.editDirectly(key, combo.getValue());
							}.bind(this))
							
							editorGrid = new Ext.Editor(editorCombo);

							break;
						case ORYX.CONFIG.TYPE_DATE:
							var currFormat = ORYX.I18N.PropertyWindow.dateFormat
							if(!(attribute instanceof Date))
								attribute = Date.parseDate(attribute, currFormat)
							editorGrid = new Ext.Editor(new Ext.form.DateField({ allowBlank: pair.optional(), format:currFormat,  msgTarget:'title'}));
							break;

						case ORYX.CONFIG.TYPE_TEXT:
							
							var cf = new Ext.form.ComplexTextField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						// extended by Kerstin (start)
						case ORYX.CONFIG.TYPE_COMPLEX:
							
							var cf = new Ext.form.ComplexListField({ allowBlank: pair.optional()}, pair.complexItems(), key, this.facade);
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
						// extended by Kerstin (end)
						
						// extended by Gerardo (Start)
						case "CPNString":
							var editorInput = new Ext.form.TextField(
									{
										allowBlank: pair.optional(),
										msgTarget:'title', 
										maxLength:pair.length(), 
										enableKeyEvents: true
									});
							
							editorInput.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
								console.log(input.getValue());
								alert("huhu");
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorInput);							
							break;
						// extended by Gerardo (End)
						
						default:
							var editorInput = new Ext.form.TextField({ allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length(), enableKeyEvents: true});
							editorInput.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));
							
							editorGrid = new Ext.Editor(editorInput);
					}


					// Register Event to enable KeyDown
					editorGrid.on('beforehide', this.facade.enableEvent.bind(this, ORYX.CONFIG.EVENT_KEYDOWN));
					editorGrid.on('specialkey', this.specialKeyDown.bind(this));

				} else if(pair.type() === ORYX.CONFIG.TYPE_URL || pair.type() === ORYX.CONFIG.TYPE_DIAGRAM_LINK){
					attribute = String(attribute).search("http") !== 0 ? ("http://" + attribute) : attribute;
					attribute = "<a href='" + attribute + "' target='_blank'>" + attribute.split("://")[1] + "</a>"
				}
				
				// Push to the properties-array
				if(pair.visible()) {
					// Popular Properties are those with a refToView set or those which are set to be popular
					if (pair.refToView()[0] || refToViewFlag || pair.popular()) {
						pair.setPopular();
					} 
					
					if(pair.popular()) {
						this.popularProperties.push([pair.popular(), name, attribute, icons, {
							editor: editorGrid,
							propId: key,
							type: pair.type(),
							tooltip: pair.description(),
							renderer: editorRenderer
						}]);
					}
					else {					
						this.properties.push([pair.popular(), name, attribute, icons, {
							editor: editorGrid,
							propId: key,
							type: pair.type(),
							tooltip: pair.description(),
							renderer: editorRenderer
						}]);
					}
				}

			}).bind(this));
		}

		this.setProperties();
	},
	
	hideMoreAttrs: function(panel) {
		// TODO: Implement the case that the canvas has no attributes
		if (this.properties.length <= 0){ return }
		
		// collapse the "more attr" group
		this.grid.view.toggleGroup(this.grid.view.getGroupId(this.properties[0][0]), false);
		
		// prevent the more attributes pane from closing after a attribute has been edited
		this.grid.view.un("refresh", this.hideMoreAttrs, this);
	},

	setProperties: function() {
		var props = this.popularProperties.concat(this.properties);
		
		this.dataSource.loadData(props);
	}
}
ORYX.Plugins.PropertyWindow = Clazz.extend(ORYX.Plugins.PropertyWindow);



/**
 * Editor for complex type
 * 
 * When starting to edit the editor, it creates a new dialog where new attributes
 * can be specified which generates json out of this and put this 
 * back to the input field.
 * 
 * This is implemented from Kerstin Pfitzner
 * 
 * @param {Object} config
 * @param {Object} items
 * @param {Object} key
 * @param {Object} facade
 */


Ext.form.ComplexListField = function(config, items, key, facade){
    Ext.form.ComplexListField.superclass.constructor.call(this, config);
	this.items 	= items;
	this.key 	= key;
	this.facade = facade;
};

/**
 * This is a special trigger field used for complex properties.
 * The trigger field opens a dialog that shows a list of properties.
 * The entered values will be stored as trigger field value in the JSON format.
 */
Ext.extend(Ext.form.ComplexListField, Ext.form.TriggerField,  {
	/**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-trigger' and triggerClass will be <b>appended</b> if specified.
     */
    triggerClass:	'x-form-complex-trigger',
	readOnly:		true,
	emptyText: 		ORYX.I18N.PropertyWindow.clickIcon,
		
	/**
	 * Builds the JSON value from the data source of the grid in the dialog.
	 */
	buildValue: function() {
		var ds = this.grid.getStore();
		ds.commitChanges();
		
		if (ds.getCount() == 0) {
			return "";
		}
		
		var jsonString = "[";
		for (var i = 0; i < ds.getCount(); i++) {
			var data = ds.getAt(i);		
			jsonString += "{";	
			for (var j = 0; j < this.items.length; j++) {
				var key = this.items[j].id();
				jsonString += key + ':' + ("" + data.get(key)).toJSON();
				if (j < (this.items.length - 1)) {
					jsonString += ", ";
				}
			}
			jsonString += "}";
			if (i < (ds.getCount() - 1)) {
				jsonString += ", ";
			}
		}
		jsonString += "]";
		
		jsonString = "{'totalCount':" + ds.getCount().toJSON() + 
			", 'items':" + jsonString + "}";
		return Object.toJSON(jsonString.evalJSON());
	},
	
	/**
	 * Returns the field key.
	 */
	getFieldKey: function() {
		return this.key;
	},
	
	/**
	 * Returns the actual value of the trigger field.
	 * If the table does not contain any values the empty
	 * string will be returned.
	 */
    getValue : function(){
		// return actual value if grid is active
		if (this.grid) {
			return this.buildValue();			
		} else if (this.data == undefined) {
			return "";
		} else {
			return this.data;
		}
    },
	
	/**
	 * Sets the value of the trigger field.
	 * In this case this sets the data that will be shown in
	 * the grid of the dialog.
	 * 
	 * @param {Object} value The value to be set (JSON format or empty string)
	 */
	setValue: function(value) {	
		if (value.length > 0) {
			// set only if this.data not set yet
			// only to initialize the grid
			if (this.data == undefined) {
				this.data = value;
			}
		}
	},
	
	/**
	 * Returns false. In this way key events will not be propagated
	 * to other elements.
	 * 
	 * @param {Object} event The keydown event.
	 */
	keydownHandler: function(event) {
		return false;
	},
	
	/**
	 * The listeners of the dialog. 
	 * 
	 * If the dialog is hidded, a dialogClosed event will be fired.
	 * This has to be used by the parent element of the trigger field
	 * to reenable the trigger field (focus gets lost when entering values
	 * in the dialog).
	 */
    dialogListeners : {
        show : function(){ // retain focus styling
            this.onFocus();	
			this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			return;
        },
        hide : function(){

            var dl = this.dialogListeners;
            this.dialog.un("show", dl.show,  this);
            this.dialog.un("hide", dl.hide,  this);
			
			this.dialog.destroy(true);
			this.grid.destroy(true);
			delete this.grid;
			delete this.dialog;
			
			this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			
			// store data and notify parent about the closed dialog
			// parent has to handel this event and start editing the text field again
			this.fireEvent('dialogClosed', this.data);
			
			Ext.form.ComplexListField.superclass.setValue.call(this, this.data);
        }
    },	
	
	/**
	 * Builds up the initial values of the grid.
	 * 
	 * @param {Object} recordType The record type of the grid.
	 * @param {Object} items      The initial items of the grid (columns)
	 */
	buildInitial: function(recordType, items) {
		var initial = new Hash();
		
		for (var i = 0; i < items.length; i++) {
			var id = items[i].id();
			initial[id] = items[i].value();
		}
		
		var RecordTemplate = Ext.data.Record.create(recordType);
		return new RecordTemplate(initial);
	},
	
	/**
	 * Builds up the column model of the grid. The parent element of the
	 * grid.
	 * 
	 * Sets up the editors for the grid columns depending on the 
	 * type of the items.
	 * 
	 * @param {Object} parent The 
	 */
	buildColumnModel: function(parent) {
		var cols = [];
		for (var i = 0; i < this.items.length; i++) {
			var id 		= this.items[i].id();
			var header 	= this.items[i].name();
			var width 	= this.items[i].width();
			var type 	= this.items[i].type();
			var editor;
			
			if (type == ORYX.CONFIG.TYPE_STRING) {
				editor = new Ext.form.TextField({ allowBlank : this.items[i].optional(), width : width});
			} else if (type == ORYX.CONFIG.TYPE_CHOICE) {				
				var items = this.items[i].items();
				var select = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['select', {style:'display:none'}]);
				var optionTmpl = new Ext.Template('<option value="{value}">{value}</option>');
				items.each(function(value){ 
					optionTmpl.append(select, {value:value.value()}); 
				});				
				
				editor = new Ext.form.ComboBox(
					{ typeAhead: true, triggerAction: 'all', transform:select, lazyRender:true,  msgTarget:'title', width : width});			
			} else if (type == ORYX.CONFIG.TYPE_BOOLEAN) {
				editor = new Ext.form.Checkbox( { width : width } );
			}
					
			cols.push({
				id: 		id,
				header: 	header,
				dataIndex: 	id,
				resizable: 	true,
				editor: 	editor,
				width:		width
	        });
			
		}
		return new Ext.grid.ColumnModel(cols);
	},
	
	/**
	 * After a cell was edited the changes will be commited.
	 * 
	 * @param {Object} option The option that was edited.
	 */
	afterEdit: function(option) {
		option.grid.getStore().commitChanges();
	},
		
	/**
	 * Before a cell is edited it has to be checked if this 
	 * cell is disabled by another cell value. If so, the cell editor will
	 * be disabled.
	 * 
	 * @param {Object} option The option to be edited.
	 */
	beforeEdit: function(option) {

		var state = this.grid.getView().getScrollState();
		
		var col = option.column;
		var row = option.row;
		var editId = this.grid.getColumnModel().config[col].id;
		// check if there is an item in the row, that disables this cell
		for (var i = 0; i < this.items.length; i++) {
			// check each item that defines a "disable" property
			var item = this.items[i];
			var disables = item.disable();
			if (disables != undefined) {
				
				// check if the value of the column of this item in this row is equal to a disabling value
				var value = this.grid.getStore().getAt(row).get(item.id());
				for (var j = 0; j < disables.length; j++) {
					var disable = disables[j];
					if (disable.value == value) {
						
						for (var k = 0; k < disable.items.length; k++) {
							// check if this value disables the cell to select 
							// (id is equals to the id of the column to edit)
							var disItem = disable.items[k];
							if (disItem == editId) {
								this.grid.getColumnModel().getCellEditor(col, row).disable();
								return;
							}
						}
					}
				}		
			}
		}
		this.grid.getColumnModel().getCellEditor(col, row).enable();
		//this.grid.getView().restoreScroll(state);
	},
	
    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }	
		
		//if(!this.dialog) { 
		
			var dialogWidth = 0;
			var recordType 	= [];
			
			for (var i = 0; i < this.items.length; i++) {
				var id 		= this.items[i].id();
				var width 	= this.items[i].width();
				var type 	= this.items[i].type();	
					
				if (type == ORYX.CONFIG.TYPE_CHOICE) {
					type = ORYX.CONFIG.TYPE_STRING;
				}
						
				dialogWidth += width;
				recordType[i] = {name:id, type:type};
			}			
			
			if (dialogWidth > 800) {
				dialogWidth = 800;
			}
			dialogWidth += 22;
			
			var data = this.data;
			if (data == "") {
				// empty string can not be parsed
				data = "{}";
			}
			
			
			var ds = new Ext.data.Store({
		        proxy: new Ext.data.MemoryProxy(eval("(" + data + ")")),				
				reader: new Ext.data.JsonReader({
		            root: 'items',
		            totalProperty: 'totalCount'
		        	}, recordType)
	        });
			ds.load();
					
				
			var cm = this.buildColumnModel();
			
			this.grid = new Ext.grid.EditorGridPanel({
				store:		ds,
		        cm:			cm,
				stripeRows: true,
				clicksToEdit : 1,
				autoHeight:true,
		        selModel: 	new Ext.grid.CellSelectionModel()
		    });	
			
									
			//var gridHead = this.grid.getView().getHeaderPanel(true);
			var toolbar = new Ext.Toolbar(
			[{
				text: ORYX.I18N.PropertyWindow.add,
				handler: function(){
					var ds = this.grid.getStore();
					var index = ds.getCount();
					this.grid.stopEditing();
					var p = this.buildInitial(recordType, this.items);
					ds.insert(index, p);
					ds.commitChanges();
					this.grid.startEditing(index, 0);
				}.bind(this)
			},{
				text: ORYX.I18N.PropertyWindow.rem,
		        handler : function(){
					var ds = this.grid.getStore();
					var selection = this.grid.getSelectionModel().getSelectedCell();
					if (selection == undefined) {
						return;
					}
					this.grid.getSelectionModel().clearSelections();
		            this.grid.stopEditing();					
					var record = ds.getAt(selection[0]);
					ds.remove(record);
					ds.commitChanges();           
				}.bind(this)
			}]);			
		
			// Basic Dialog
			this.dialog = new Ext.Window({ 
				autoScroll: true,
				autoCreate: true, 
				title: ORYX.I18N.PropertyWindow.complex, 
				height: 350, 
				width: dialogWidth, 
				modal:true,
				collapsible:false,
				fixedcenter: true, 
				shadow:true, 
				proxyDrag: true,
				keys:[{
					key: 27,
					fn: function(){
						this.dialog.hide
					}.bind(this)
				}],
				items:[toolbar, this.grid],
				bodyStyle:"background-color:#FFFFFF",
				buttons: [{
	                text: ORYX.I18N.PropertyWindow.ok,
	                handler: function(){
	                    this.grid.stopEditing();	
						// store dialog input
						this.data = this.buildValue();
						this.dialog.hide()
	                }.bind(this)
	            }, {
	                text: ORYX.I18N.PropertyWindow.cancel,
	                handler: function(){
	                	this.dialog.hide()
	                }.bind(this)
	            }]
			});		
				
			this.dialog.on(Ext.apply({}, this.dialogListeners, {
	       		scope:this
	        }));
		
			this.dialog.show();	
		
	
			this.grid.on('beforeedit', 	this.beforeEdit, 	this, true);
			this.grid.on('afteredit', 	this.afterEdit, 	this, true);
			
			this.grid.render();			
	    
		/*} else {
			this.dialog.show();		
		}*/
		
	}
});





Ext.form.ComplexTextField = Ext.extend(Ext.form.TriggerField,  {

	defaultAutoCreate : {tag: "textarea", rows:1, style:"height:16px;overflow:hidden;" },

    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
		
        if(this.disabled){
            return;
        }	
		        
		var grid = new Ext.form.TextArea({
	        anchor		: '100% 100%',
			value		: this.value,
			listeners	: {
				focus: function(){
					this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
				}.bind(this)
			}
		})
		
		
		// Basic Dialog
		var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: ORYX.I18N.PropertyWindow.text, 
			height		: 500, 
			width		: 500, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			proxyDrag	: true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
					// store dialog input
					var value = grid.getValue();
					this.setValue(value);
					
					this.dataSource.getAt(this.row).set('value', value)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
		
	}
});/** * Copyright (c) 2008 * Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins) {    ORYX.Plugins = new Object();}/** * This plugin is responsible for resizing the canvas. * @param {Object} facade The editor plugin facade to register enhancements with. */ORYX.Plugins.CanvasResize = Clazz.extend({    construct: function(facade){		        this.facade = facade;		new ORYX.Plugins.CanvasResizeButton( this.facade.getCanvas(), "N", this.resize.bind(this));		new ORYX.Plugins.CanvasResizeButton( this.facade.getCanvas(), "W", this.resize.bind(this));		new ORYX.Plugins.CanvasResizeButton( this.facade.getCanvas(), "E", this.resize.bind(this));		new ORYX.Plugins.CanvasResizeButton( this.facade.getCanvas(), "S", this.resize.bind(this));    },        resize: function( position, shrink ){    	    	resizeCanvas = function(position, extentionSize, facade) {        	var canvas 		= facade.getCanvas();    		var b 			= canvas.bounds;    		var scrollNode 	= facade.getCanvas().getHTMLContainer().parentNode.parentNode;    		    		if( position == "E" || position == "W"){    			canvas.setSize({width: (b.width() + extentionSize)*canvas.zoomLevel, height: (b.height())*canvas.zoomLevel})    		} else if( position == "S" || position == "N"){    			canvas.setSize({width: (b.width())*canvas.zoomLevel, height: (b.height() + extentionSize)*canvas.zoomLevel})    		}    		if( position == "N" || position == "W"){    			    			var move = position == "N" ? {x: 0, y: extentionSize}: {x: extentionSize, y: 0 };    			// Move all children    			canvas.getChildNodes(false, function(shape){ shape.bounds.moveBy(move) })    			// Move all dockers, when the edge has at least one docked shape    			var edges = canvas.getChildEdges().findAll(function(edge){ return edge.getAllDockedShapes().length > 0})    			var dockers = edges.collect(function(edge){ return edge.dockers.findAll(function(docker){ return !docker.getDockedShape() })}).flatten();    			dockers.each(function(docker){ docker.bounds.moveBy(move)})    		} else if( position == "S" ){    			scrollNode.scrollTop += extentionSize;    		} else if( position == "E" ){    			scrollNode.scrollLeft += extentionSize;    		}    		    		canvas.update();    		facade.updateSelection();        }				var commandClass = ORYX.Core.Command.extend({			construct: function(position, extentionSize, facade){				this.position = position;				this.extentionSize = extentionSize;				this.facade = facade;			},						execute: function(){				resizeCanvas(this.position, this.extentionSize, this.facade);			},			rollback: function(){				resizeCanvas(this.position, -this.extentionSize, this.facade);			},			update:function(){			}		});				var extentionSize = ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;		if(shrink) extentionSize = -extentionSize;		var command = new commandClass(position, extentionSize, this.facade);				this.facade.executeCommands([command]);			    }    });ORYX.Plugins.CanvasResizeButton = Clazz.extend({		construct: function(canvas, position, callback){		this.canvas = canvas;		var parentNode = canvas.getHTMLContainer().parentNode.parentNode.parentNode;				window.myParent=parentNode		var scrollNode 	= parentNode.firstChild;		var svgRootNode = scrollNode.firstChild.firstChild;		// The buttons		var buttonGrow 	= ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parentNode, ['div', { 'class': 'canvas_resize_indicator canvas_resize_indicator_grow' + ' ' + position ,'title':ORYX.I18N.RESIZE.tipGrow+ORYX.I18N.RESIZE[position]}]);		var buttonShrink 	= ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parentNode, ['div', { 'class': 'canvas_resize_indicator canvas_resize_indicator_shrink' + ' ' + position ,'title':ORYX.I18N.RESIZE.tipShrink+ORYX.I18N.RESIZE[position]}]);				// Defines a callback which gives back		// a boolean if the current mouse event 		// is over the particular button area		var offSetWidth = 60;		var isOverOffset = function(event){						if(event.target!=parentNode && event.target!=scrollNode&& event.target!=scrollNode.firstChild&& event.target!=svgRootNode&& event.target!=scrollNode)				return false;						//if(inCanvas){offSetWidth=30}else{offSetWidth=30*2}			//Safari work around			var X=event.layerX			var Y=event.layerY			if((X - scrollNode.scrollLeft)<0 ||Ext.isSafari){	X+=scrollNode.scrollLeft;}			if((Y - scrollNode.scrollTop )<0 ||Ext.isSafari){ Y+=scrollNode.scrollTop ;}			if(position == "N"){				return  Y < offSetWidth+scrollNode.firstChild.offsetTop;			} else if(position == "W"){				return X < offSetWidth + scrollNode.firstChild.offsetLeft;			} else if(position == "E"){				//other offset				var offsetRight=(scrollNode.offsetWidth-(scrollNode.firstChild.offsetLeft + scrollNode.firstChild.offsetWidth));				if(offsetRight<0)offsetRight=0;				return X > scrollNode.scrollWidth-offsetRight-offSetWidth;			} else if(position == "S"){				//other offset				var offsetDown=(scrollNode.offsetHeight-(scrollNode.firstChild.offsetTop  + scrollNode.firstChild.offsetHeight));				if(offsetDown<0)offsetDown=0;				return Y > scrollNode.scrollHeight -offsetDown- offSetWidth;			}						return false;		}				var showButtons = (function() {			buttonGrow.show(); 						var x1, y1, x2, y2;			try {				var bb = this.canvas.getRootNode().childNodes[1].getBBox();				x1 = bb.x;				y1 = bb.y;				x2 = bb.x + bb.width;				y2 = bb.y + bb.height;			} catch(e) {				this.canvas.getChildShapes(true).each(function(shape) {					var absBounds = shape.absoluteBounds();					var ul = absBounds.upperLeft();					var lr = absBounds.lowerRight();					if(x1 == undefined) {						x1 = ul.x;						y1 = ul.y;						x2 = lr.x;						y2 = lr.y;					} else {						x1 = Math.min(x1, ul.x);						y1 = Math.min(y1, ul.y);						x2 = Math.max(x2, lr.x);						y2 = Math.max(y2, lr.y);					}				});			}						var w = canvas.bounds.width();			var h = canvas.bounds.height();						var isEmpty = canvas.getChildNodes().size()==0;					if(position=="N" && (y1>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL || (isEmpty && h>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))) buttonShrink.show();			else if(position=="E" && (w-x2)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL) buttonShrink.show();			else if(position=="S" && (h-y2)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL) buttonShrink.show();			else if(position=="W" && (x1>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL || (isEmpty && w>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))) buttonShrink.show();			else buttonShrink.hide();		}).bind(this);				var hideButtons = function() {			buttonGrow.hide(); 			buttonShrink.hide();		}					// If the mouse move is over the button area, show the button		scrollNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEMOVE, 	function(event){ if( isOverOffset(event) ){showButtons();} else {hideButtons()}} , false );		// If the mouse is over the button, show them		buttonGrow.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOVER, 	function(event){showButtons();}, true );		buttonShrink.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOVER, 	function(event){showButtons();}, true );		// If the mouse is out, hide the button		//scrollNode.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){button.hide()}, true )		parentNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){hideButtons()} , true );		//svgRootNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){ inCanvas = false } , true );				// Hide the button initialy		hideButtons();				// Add the callbacks		buttonGrow.addEventListener('click', function(){callback( position ); showButtons();}, true);		buttonShrink.addEventListener('click', function(){callback( position, true ); showButtons();}, true);	}	});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * @namespace Oryx name space for plugins * @name ORYX.Plugins*/if(!ORYX.Plugins)	ORYX.Plugins = new Object();/** * The view plugin offers all of zooming functionality accessible over the  * tool bar. This are zoom in, zoom out, zoom to standard, zoom fit to model. *  * @class ORYX.Plugins.View * @extends Clazz * @param {Object} facade The editor facade for plugins.*/ORYX.Plugins.View = {	/** @lends ORYX.Plugins.View.prototype */	facade: undefined,	construct: function(facade, ownPluginData) {		this.facade = facade;		//Standard Values		this.zoomLevel = 1.0;		this.maxFitToScreenLevel=1.5;		this.minZoomLevel = 0.1;		this.maxZoomLevel = 2.5;		this.diff=5; //difference between canvas and view port, s.th. like toolbar??				//Read properties		ownPluginData.properties.each( function(property) {						if (property.zoomLevel) {this.zoomLevel = Number(1.0);}					if (property.maxFitToScreenLevel) {this.maxFitToScreenLevel=Number(property.maxFitToScreenLevel);}			if (property.minZoomLevel) {this.minZoomLevel = Number(property.minZoomLevel);}			if (property.maxZoomLevel) {this.maxZoomLevel = Number(property.maxZoomLevel);}		}.bind(this));				/* Register zoom in */		this.facade.offer({			'name':ORYX.I18N.View.zoomIn,			'functionality': this.zoom.bind(this, [1.0 + ORYX.CONFIG.ZOOM_OFFSET]),			'group': ORYX.I18N.View.group,			'icon': ORYX.PATH + "images/magnifier_zoom_in.png",			'description': ORYX.I18N.View.zoomInDesc,			'index': 1,			'minShape': 0,			'maxShape': 0,			'isEnabled': function(){return this.zoomLevel < this.maxZoomLevel }.bind(this)});				/* Register zoom out */		this.facade.offer({			'name':ORYX.I18N.View.zoomOut,			'functionality': this.zoom.bind(this, [1.0 - ORYX.CONFIG.ZOOM_OFFSET]),			'group': ORYX.I18N.View.group,			'icon': ORYX.PATH + "images/magnifier_zoom_out.png",			'description': ORYX.I18N.View.zoomOutDesc,			'index': 2,			'minShape': 0,			'maxShape': 0,			'isEnabled': function(){ return this._checkSize() }.bind(this)});				/* Register zoom standard */		this.facade.offer({			'name':ORYX.I18N.View.zoomStandard,			'functionality': this.setAFixZoomLevel.bind(this, 1),			'group': ORYX.I18N.View.group,			'icon': ORYX.PATH + "images/zoom_standard.png",			'cls' : 'icon-large',			'description': ORYX.I18N.View.zoomStandardDesc,			'index': 3,			'minShape': 0,			'maxShape': 0,			'isEnabled': function(){return this.zoomLevel != 1}.bind(this)		});				/* Register zoom fit to model */		this.facade.offer({			'name':ORYX.I18N.View.zoomFitToModel,			'functionality': this.zoomFitToModel.bind(this),			'group': ORYX.I18N.View.group,			'icon': ORYX.PATH + "images/image.png",			'description': ORYX.I18N.View.zoomFitToModelDesc,			'index': 4,			'minShape': 0,			'maxShape': 0		});	},		/**	 * It sets the zoom level to a fix value and call the zooming function.	 * 	 * @param {Number} zoomLevel	 * 			the zoom level	 */	setAFixZoomLevel : function(zoomLevel) {		this.zoomLevel = zoomLevel;		this._checkZoomLevelRange();		this.zoom(1);	},		/**	 * It does the actual zooming. It changes the viewable size of the canvas 	 * and all to its child elements.	 * 	 * @param {Number} factor	 * 		the factor to adjust the zoom level	 */	zoom: function(factor) {		// TODO: Zoomen auf allen Objekten im SVG-DOM				this.zoomLevel *= factor;		var scrollNode 	= this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;		var canvas 		= this.facade.getCanvas();		var newWidth 	= canvas.bounds.width()  * this.zoomLevel;		var newHeight 	= canvas.bounds.height() * this.zoomLevel;				/* Set new top offset */		var offsetTop = (canvas.node.parentNode.parentNode.parentNode.offsetHeight - newHeight) / 2.0;			offsetTop = offsetTop > 20 ? offsetTop - 20 : 0;		canvas.node.parentNode.parentNode.style.marginTop = offsetTop + "px";		offsetTop += 5;		canvas.getHTMLContainer().style.top = offsetTop + "px";				/*readjust scrollbar*/		var newScrollTop=	scrollNode.scrollTop - Math.round((canvas.getHTMLContainer().parentNode.getHeight()-newHeight) / 2)+this.diff;		var newScrollLeft=	scrollNode.scrollLeft - Math.round((canvas.getHTMLContainer().parentNode.getWidth()-newWidth) / 2)+this.diff;				/* Set new Zoom-Level */		canvas.setSize({width: newWidth, height: newHeight}, true);				/* Set Scale-Factor */		canvas.node.setAttributeNS(null, "transform", "scale(" +this.zoomLevel+ ")");			/* Refresh the Selection */		this.facade.updateSelection();		scrollNode.scrollTop=newScrollTop;		scrollNode.scrollLeft=newScrollLeft;				/* Update the zoom-level*/		canvas.zoomLevel = this.zoomLevel;	},			/**	 * It calculates the zoom level to fit whole model into the visible area	 * of the canvas. Than the model gets zoomed and the position of the 	 * scroll bars are adjusted.	 * 	 */	zoomFitToModel: function() {				/* Get the size of the visible area of the canvas */		var scrollNode 	= this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;		var visibleHeight = scrollNode.getHeight() - 30;		var visibleWidth = scrollNode.getWidth() - 30;				var nodes = this.facade.getCanvas().getChildShapes();				if(!nodes || nodes.length < 1) {			return false;					}					/* Calculate size of canvas to fit the model */		var bounds = nodes[0].absoluteBounds().clone();		nodes.each(function(node) {			bounds.include(node.absoluteBounds().clone());		});						/* Set new Zoom Level */		var scaleFactorWidth =  visibleWidth / bounds.width();		var scaleFactorHeight = visibleHeight / bounds.height();				/* Choose the smaller zoom level to fit the whole model */		var zoomFactor = scaleFactorHeight < scaleFactorWidth ? scaleFactorHeight : scaleFactorWidth;				/*Test if maximum zoom is reached*/		if(zoomFactor>this.maxFitToScreenLevel){zoomFactor=this.maxFitToScreenLevel}		/* Do zooming */		this.setAFixZoomLevel(zoomFactor);				/* Set scroll bar position */		scrollNode.scrollTop = Math.round(bounds.upperLeft().y * this.zoomLevel) - 5;		scrollNode.scrollLeft = Math.round(bounds.upperLeft().x * this.zoomLevel) - 5;			},		/**	 * It checks if the zoom level is less or equal to the level, which is required	 * to schow the whole canvas.	 * 	 * @private	 */	_checkSize:function(){		var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;		var minForCanvas= Math.min((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));		return 1.05 > minForCanvas;			},	/**	 * It checks if the zoom level is included in the definined zoom	 * level range.	 * 	 * @private	 */	_checkZoomLevelRange: function() {		/*var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;		var maxForCanvas= Math.max((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));		if(this.zoomLevel > maxForCanvas) {			this.zoomLevel = maxForCanvas;					}*/		if(this.zoomLevel < this.minZoomLevel) {			this.zoomLevel = this.minZoomLevel;					}				if(this.zoomLevel > this.maxZoomLevel) {			this.zoomLevel = this.maxZoomLevel;					}	}};ORYX.Plugins.View = Clazz.extend(ORYX.Plugins.View);/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins) 	ORYX.Plugins = new Object();ORYX.Plugins.DragDropResize = ORYX.Plugins.AbstractPlugin.extend({	/**	 *	Constructor	 *	@param {Object} Facade: The Facade of the Editor	 */	construct: function(facade) {		this.facade = facade;		// Initialize variables		this.currentShapes 		= [];			// Current selected Shapes		//this.pluginsData 		= [];			// Available Plugins		this.toMoveShapes 		= [];			// Shapes there will be moved		this.distPoints 		= [];			// Distance Points for Snap on Grid		this.isResizing 		= false;		// Flag: If there was currently resized		this.dragEnable 		= false;		// Flag: If Dragging is enabled		this.dragIntialized 	= false;		// Flag: If the Dragging is initialized		this.edgesMovable		= true;			// Flag: If an edge is docked it is not movable		this.offSetPosition 	= {x: 0, y: 0};	// Offset of the Dragging		this.faktorXY 			= {x: 1, y: 1};	// The Current Zoom-Faktor		this.containmentParentNode;				// the current future parent node for the dragged shapes		this.isAddingAllowed 	= false;		// flag, if adding current selected shapes to containmentParentNode is allowed		this.isAttachingAllowed = false;		// flag, if attaching to the current shape is allowed				this.callbackMouseMove	= this.handleMouseMove.bind(this);		this.callbackMouseUp	= this.handleMouseUp.bind(this);				// Get the SVG-Containernode 		var containerNode = this.facade.getCanvas().getSvgContainer();				// Create the Selected Rectangle in the SVG		this.selectedRect = new ORYX.Plugins.SelectedRect(containerNode);				// Show grid line if enabled		if (ORYX.CONFIG.SHOW_GRIDLINE) {			this.vLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_VERTICAL);			this.hLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_HORIZONTAL);		}				// Get a HTML-ContainerNode		containerNode = this.facade.getCanvas().getHTMLContainer();				this.scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode;				// Create the southeastern button for resizing		this.resizerSE = new ORYX.Plugins.Resizer(containerNode, "southeast", this.facade);		this.resizerSE.registerOnResize(this.onResize.bind(this)); // register the resize callback		this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this)); // register the resize end callback		this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback				// Create the northwestern button for resizing		this.resizerNW = new ORYX.Plugins.Resizer(containerNode, "northwest", this.facade);		this.resizerNW.registerOnResize(this.onResize.bind(this)); // register the resize callback		this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this)); // register the resize end callback		this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback				// For the Drag and Drop		// Register on MouseDown-Event on a Shape		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));	},	/**	 * On Mouse Down	 *	 */	handleMouseDown: function(event, uiObj) {		// If the selection Bounds not intialized and the uiObj is not member of current selectio		// then return		if(!this.dragBounds || !this.currentShapes.member(uiObj) || !this.toMoveShapes.length) {return};				// Start Dragging		this.dragEnable = true;		this.dragIntialized = true;		this.edgesMovable = true;		// Calculate the current zoom factor		var a = this.facade.getCanvas().node.getScreenCTM();		this.faktorXY.x = a.a;		this.faktorXY.y = a.d;		// Set the offset position of dragging		var upL = this.dragBounds.upperLeft();		this.offSetPosition =  {			x: Event.pointerX(event) - (upL.x * this.faktorXY.x),			y: Event.pointerY(event) - (upL.y * this.faktorXY.y)};				this.offsetScroll	= {x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};					// Register on Global Mouse-MOVE Event		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);			// Register on Global Mouse-UP Event		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);					return;	},	/**	 * On Key Mouse Up	 *	 */	handleMouseUp: function(event) {				//disable containment highlighting		this.facade.raiseEvent({									type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,									highlightId:"dragdropresize.contain"								});										this.facade.raiseEvent({									type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,									highlightId:"dragdropresize.attached"								});		// If Dragging is finished		if(this.dragEnable) {					// and update the current selection			if(!this.dragIntialized) {								// Do Method after Dragging				this.afterDrag();									// Check if the Shape is allowed to dock to the other Shape										if ( 	this.isAttachingAllowed &&						this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node  &&						this.toMoveShapes[0].dockers.length > 0) {										// Get the position and the docker										var position 	= this.facade.eventCoordinates( event );						var docker 		= this.toMoveShapes[0].dockers[0];								//Command-Pattern for dragging several Shapes					var dockCommand = ORYX.Core.Command.extend({						construct: function(docker, position, newDockedShape, facade){							this.docker 		= docker;							this.newPosition	= position;							this.newDockedShape = newDockedShape;							this.newParent 		= newDockedShape.parent || facade.getCanvas();							this.oldPosition	= docker.parent.bounds.center();							this.oldDockedShape	= docker.getDockedShape();							this.oldParent 		= docker.parent.parent || facade.getCanvas();							this.facade			= facade;														if( this.oldDockedShape ){								this.oldPosition = docker.parent.absoluteBounds().center();							}													},									execute: function(){							this.dock( this.newDockedShape, this.newParent,  this.newPosition );														// Raise Event for having the docked shape on top of the other shape							this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_ARRANGEMENT_TOP, excludeCommand: true})															},						rollback: function(){							this.dock( this.oldDockedShape, this.oldParent, this.oldPosition );						},						dock:function( toDockShape, parent, pos ){							// Add to the same parent Shape							parent.add( this.docker.parent )																					// Set the Docker to the new Shape							this.docker.setDockedShape( undefined );							this.docker.bounds.centerMoveTo( pos )											this.docker.setDockedShape( toDockShape );								//this.docker.update();														this.facade.setSelection( [this.docker.parent] );								this.facade.getCanvas().update();							this.facade.updateSelection();																																													}					});								// Instanziate the dockCommand					var commands = [new dockCommand(docker, position, this.containmentParentNode, this.facade)];					this.facade.executeCommands(commands);																// Check if adding is allowed to the other Shape					} else if( this.isAddingAllowed ) {														// Refresh all Shapes --> Set the new Bounds					this.refreshSelectedShapes();									}								this.facade.updateSelection();											//this.currentShapes.each(function(shape) {shape.update()})				// Raise Event: Dragging is finished				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_END});			}				if (this.vLine)				this.vLine.hide();			if (this.hLine)				this.hLine.hide();		}		// Disable 		this.dragEnable = false;					// UnRegister on Global Mouse-UP/-Move Event		document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);			document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);									return;	},	/**	* On Key Mouse Move	*	*/	handleMouseMove: function(event) {		// If dragging is not enabled, go return		if(!this.dragEnable) { return };		// If Dragging is initialized		if(this.dragIntialized) {			// Raise Event: Drag will be started			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_START});			this.dragIntialized = false;						// And hide the resizers and the highlighting			this.resizerSE.hide();			this.resizerNW.hide();						// if only edges are selected, containmentParentNode must be the canvas			this._onlyEdges = this.currentShapes.all(function(currentShape) {				return (currentShape instanceof ORYX.Core.Edge);			});			//			/* If only edges are selected, check if they are movable. An Edge is//			 * movable in case it is not docked//			 *///			if(this._onlyEdges) {//				this.currentShapes.each(function(edge) {//					if(edge.isDocked()) {//						this.edgesMovable = false;//						throw $break;//					}//				}.bind(this));//			}						// Do method before Drag			this.beforeDrag();						this._currentUnderlyingNodes = [];					}					// Calculate the new position		var position = {			x: Event.pointerX(event) - this.offSetPosition.x,			y: Event.pointerY(event) - this.offSetPosition.y}		position.x 	-= this.offsetScroll.x - this.scrollNode.scrollLeft; 		position.y 	-= this.offsetScroll.y - this.scrollNode.scrollTop;				// If not the Control-Key are pressed		var modifierKeyPressed = event.shiftKey || event.ctrlKey;		if(ORYX.CONFIG.GRID_ENABLED && !modifierKeyPressed) {			// Snap the current position to the nearest Snap-Point			position = this.snapToGrid(position);		} else {			if (this.vLine)				this.vLine.hide();			if (this.hLine)				this.hLine.hide();		}		// Adjust the point by the zoom faktor 		position.x /= this.faktorXY.x;		position.y /= this.faktorXY.y;		// Set that the position is not lower than zero		position.x = Math.max( 0 , position.x)		position.y = Math.max( 0 , position.y)		// Set that the position is not bigger than the canvas		var c = this.facade.getCanvas();		position.x = Math.min( c.bounds.width() - this.dragBounds.width(), 		position.x)		position.y = Math.min( c.bounds.height() - this.dragBounds.height(), 	position.y)									// Drag this bounds		this.dragBounds.moveTo(position);		// Update all selected shapes and the selection rectangle		//this.refreshSelectedShapes();		this.resizeRectangle(this.dragBounds);		this.isAttachingAllowed = false;		//check, if a node can be added to the underlying node		var underlyingNodes = $A(this.facade.getCanvas().getAbstractShapesAtPosition(this.facade.eventCoordinates(event)));				var checkIfAttachable = this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node && this.toMoveShapes[0].dockers.length > 0		checkIfAttachable	= checkIfAttachable && underlyingNodes.length != 1							if(		!checkIfAttachable &&				underlyingNodes.length === this._currentUnderlyingNodes.length  &&				underlyingNodes.all(function(node, index){return this._currentUnderlyingNodes[index] === node}.bind(this))) {								return					} else if(this._onlyEdges) {						this.isAddingAllowed = true;			this.containmentParentNode = this.facade.getCanvas();					} else {					/* Check the containment and connection rules */			var options = {				event : event,				underlyingNodes : underlyingNodes,				checkIfAttachable : checkIfAttachable			};			this.checkRules(options);									}				this._currentUnderlyingNodes = underlyingNodes.reverse();				//visualize the containment result		if( this.isAttachingAllowed ) {						this.facade.raiseEvent({									type: 			ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,									highlightId: 	"dragdropresize.attached",									elements: 		[this.containmentParentNode],									style: 			ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,									color: 			ORYX.CONFIG.SELECTION_VALID_COLOR								});										} else {						this.facade.raiseEvent({									type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,									highlightId:"dragdropresize.attached"								});		}				if( !this.isAttachingAllowed ){			if( this.isAddingAllowed ) {				this.facade.raiseEvent({										type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,										highlightId:"dragdropresize.contain",										elements:[this.containmentParentNode],										color: ORYX.CONFIG.SELECTION_VALID_COLOR									});			} else {				this.facade.raiseEvent({										type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,										highlightId:"dragdropresize.contain",										elements:[this.containmentParentNode],										color: ORYX.CONFIG.SELECTION_INVALID_COLOR									});			}		} else {			this.facade.raiseEvent({									type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,									highlightId:"dragdropresize.contain"								});					}			// Stop the Event		//Event.stop(event);		return;	},	//	/**//	 * Rollbacks the docked shape of an edge, if the edge is not movable.//	 *///	redockEdges: function() {//		this._undockedEdgesCommand.dockers.each(function(el){//			el.docker.setDockedShape(el.dockedShape);//			el.docker.setReferencePoint(el.refPoint);//		})//	},		/**	 *  Checks the containment and connection rules for the selected shapes.	 */	checkRules : function(options) {		var event = options.event;		var underlyingNodes = options.underlyingNodes;		var checkIfAttachable = options.checkIfAttachable;		var noEdges = options.noEdges;				//get underlying node that is not the same than one of the currently selected shapes or		// a child of one of the selected shapes with the highest z Order.		// The result is a shape or the canvas		this.containmentParentNode = underlyingNodes.reverse().find((function(node) {			return (node instanceof ORYX.Core.Canvas) || 					(((node instanceof ORYX.Core.Node) || ((node instanceof ORYX.Core.Edge) && !noEdges)) 					&& (!(this.currentShapes.member(node) || 							this.currentShapes.any(function(shape) {								return (shape.children.length > 0 && shape.getChildNodes(true).member(node));							}))));		}).bind(this));										if( checkIfAttachable &&  this.containmentParentNode){							this.isAttachingAllowed	= this.facade.getRules().canConnect({												sourceShape:	this.containmentParentNode, 												edgeShape:		this.toMoveShapes[0], 												targetShape:	this.toMoveShapes[0]												});												if ( this.isAttachingAllowed	) {				var point = this.facade.eventCoordinates(event);				this.isAttachingAllowed	= this.containmentParentNode.isPointOverOffset( point.x, point.y );			}								}				if( !this.isAttachingAllowed ){			//check all selected shapes, if they can be added to containmentParentNode			this.isAddingAllowed = this.toMoveShapes.all((function(currentShape) {				if(currentShape instanceof ORYX.Core.Edge ||					currentShape instanceof ORYX.Core.Controls.Docker ||					this.containmentParentNode === currentShape.parent) {					return true;				} else if(this.containmentParentNode !== currentShape) {										if(!(this.containmentParentNode instanceof ORYX.Core.Edge) || !noEdges) {											if(this.facade.getRules().canContain({containingShape:this.containmentParentNode,															  containedShape:currentShape})) {	  								return true;						}					}				}				return false;			}).bind(this));						}				if(!this.isAttachingAllowed && !this.isAddingAllowed && 				(this.containmentParentNode instanceof ORYX.Core.Edge)) {			options.noEdges = true;			options.underlyingNodes.reverse();			this.checkRules(options);					}	},		/**	 * Redraw the selected Shapes.	 *	 */	refreshSelectedShapes: function() {		// If the selection bounds not initialized, return		if(!this.dragBounds) {return}		// Calculate the offset between the bounds and the old bounds		var upL = this.dragBounds.upperLeft();		var oldUpL = this.oldDragBounds.upperLeft();		var offset = {			x: upL.x - oldUpL.x,			y: upL.y - oldUpL.y };		// Instanciate the dragCommand		var commands = [new ORYX.Core.Command.Move(this.toMoveShapes, offset, this.containmentParentNode, this.currentShapes, this)];		// If the undocked edges command is setted, add this command		if( this._undockedEdgesCommand instanceof ORYX.Core.Command ){			commands.unshift( this._undockedEdgesCommand );		}		// Execute the commands					this.facade.executeCommands( commands );			// copy the bounds to the old bounds		if( this.dragBounds )			this.oldDragBounds = this.dragBounds.clone();	},		/**	 * Callback for Resize	 *	 */	onResize: function(bounds) {		// If the selection bounds not initialized, return		if(!this.dragBounds) {return}				this.dragBounds = bounds;		this.isResizing = true;		// Update the rectangle 		this.resizeRectangle(this.dragBounds);	},		onResizeStart: function() {		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_START});	},	onResizeEnd: function() {				if (!(this.currentShapes instanceof Array)||this.currentShapes.length<=0) {			return;		}				// If Resizing finished, the Shapes will be resize		if(this.isResizing) {						var commandClass = ORYX.Core.Command.extend({				construct: function(shape, newBounds, plugin){					this.shape = shape;					this.oldBounds = shape.bounds.clone();					this.newBounds = newBounds;					this.plugin = plugin;				},							execute: function(){					this.shape.bounds.set(this.newBounds.a, this.newBounds.b);					this.update(this.getOffset(this.oldBounds, this.newBounds));									},				rollback: function(){					this.shape.bounds.set(this.oldBounds.a, this.oldBounds.b);					this.update(this.getOffset(this.newBounds, this.oldBounds))				},								getOffset:function(b1, b2){					return {						x: b2.a.x - b1.a.x,						y: b2.a.y - b1.a.y,						xs: b2.width()/b1.width(),						ys: b2.height()/b1.height()					}				},				update:function(offset){					this.shape.getLabels().each(function(label) {						label.changed();					});										var allEdges = [].concat(this.shape.getIncomingShapes())						.concat(this.shape.getOutgoingShapes())						// Remove all edges which are included in the selection from the list						.findAll(function(r){ return r instanceof ORYX.Core.Edge }.bind(this))																	this.plugin.layoutEdges(this.shape, allEdges, offset);					this.plugin.facade.setSelection([this.shape]);					this.plugin.facade.getCanvas().update();					this.plugin.facade.updateSelection();				}			});						var bounds = this.dragBounds.clone();			var shape = this.currentShapes[0];						if(shape.parent) {				var parentPosition = shape.parent.absoluteXY();				bounds.moveBy(-parentPosition.x, -parentPosition.y);			}							var command = new commandClass(shape, bounds, this);						this.facade.executeCommands([command]);						this.isResizing = false;						this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_END});		}	},		/**	 * Prepare the Dragging	 *	 */	beforeDrag: function(){		var undockEdgeCommand = ORYX.Core.Command.extend({			construct: function(moveShapes){				this.dockers = moveShapes.collect(function(shape){ return shape instanceof ORYX.Core.Controls.Docker ? {docker:shape, dockedShape:shape.getDockedShape(), refPoint:shape.referencePoint} : undefined }).compact();			},						execute: function(){				this.dockers.each(function(el){					el.docker.setDockedShape(undefined);				})			},			rollback: function(){				this.dockers.each(function(el){					el.docker.setDockedShape(el.dockedShape);					el.docker.setReferencePoint(el.refPoint);					//el.docker.update();				})			}		});				this._undockedEdgesCommand = new undockEdgeCommand( this.toMoveShapes );		this._undockedEdgesCommand.execute();				},	hideAllLabels: function(shape) {						// Hide all labels from the shape			shape.getLabels().each(function(label) {				label.hide();			});			// Hide all labels from docked shapes			shape.getAllDockedShapes().each(function(dockedShape) {				var labels = dockedShape.getLabels();				if(labels.length > 0) {					labels.each(function(label) {						label.hide();					});				}			});			// Do this recursive for all child shapes			// EXP-NICO use getShapes			shape.getChildren().each((function(value) {				if(value instanceof ORYX.Core.Shape)					this.hideAllLabels(value);			}).bind(this));	},	/**	 * Finished the Dragging	 *	 */	afterDrag: function(){					},	/**	 * Show all Labels at these shape	 * 	 */	showAllLabels: function(shape) {			// Show the label of these shape			//shape.getLabels().each(function(label) {			for(var i=0; i<shape.length ;i++){				var label = shape[i];				label.show();			}//);			// Show all labels at docked shapes			//shape.getAllDockedShapes().each(function(dockedShape) {			var allDockedShapes = shape.getAllDockedShapes()			for(var i=0; i<allDockedShapes.length ;i++){				var dockedShape = allDockedShapes[i];								var labels = dockedShape.getLabels();				if(labels.length > 0) {					labels.each(function(label) {						label.show();					});				}			}//);			// Do this recursive			//shape.children.each((function(value) {			for(var i=0; i<shape.children.length ;i++){				var value = shape.children[i];					if(value instanceof ORYX.Core.Shape)					this.showAllLabels(value);			}//).bind(this));	},	/**	 * Intialize Method, if there are new Plugins	 *	 */	/*registryChanged: function(pluginsData) {		// Save all new Plugin, sorted by group and index		this.pluginsData = pluginsData.sortBy( function(value) {			return (value.group + "" + value.index);		});	},*/	/**	 * On the Selection-Changed	 *	 */	onSelectionChanged: function(event) {		var elements = event.elements;				// Reset the drag-variables		this.dragEnable = false;		this.dragIntialized = false;		this.resizerSE.hide();		this.resizerNW.hide();		// If there is no elements		if(!elements || elements.length == 0) {			// Hide all things and reset all variables			this.selectedRect.hide();			this.currentShapes = [];			this.toMoveShapes = [];			this.dragBounds = undefined;			this.oldDragBounds = undefined;		} else {			// Set the current Shapes			this.currentShapes = elements;			// Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)			var topLevelElements = this.facade.getCanvas().getShapesWithSharedParent(elements);			this.toMoveShapes = topLevelElements;						this.toMoveShapes = this.toMoveShapes.findAll( function(shape) { return shape instanceof ORYX.Core.Node && 																			(shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape()))});																								elements.each((function(shape){				if(!(shape instanceof ORYX.Core.Edge)) {return}								var dks = shape.getDockers() 												var hasF = elements.member(dks.first().getDockedShape());				var hasL = elements.member(dks.last().getDockedShape());							//				if(!hasL) {//					this.toMoveShapes.push(dks.last());//				}//				if(!hasF){//					this.toMoveShapes.push(dks.first())//				} 				/* Enable movement of undocked edges */				if(!hasF && !hasL) {					var isUndocked = !dks.first().getDockedShape() && !dks.last().getDockedShape()					if(isUndocked) {						this.toMoveShapes = this.toMoveShapes.concat(dks);					}				}								if( shape.dockers.length > 2 && hasF && hasL){					this.toMoveShapes = this.toMoveShapes.concat(dks.findAll(function(el,index){ return index > 0 && index < dks.length-1}))				}							}).bind(this));						// Calculate the new area-bounds of the selection			var newBounds = undefined;			this.toMoveShapes.each(function(value) {				var shape = value;				if(value instanceof ORYX.Core.Controls.Docker) {					/* Get the Shape */					shape = value.parent;				}								if(!newBounds){					newBounds = shape.absoluteBounds();				}				else {					newBounds.include(shape.absoluteBounds());				}			}.bind(this));						if(!newBounds){				elements.each(function(value){					if(!newBounds) {						newBounds = value.absoluteBounds();					} else {						newBounds.include(value.absoluteBounds());					}				});			}						// Set the new bounds			this.dragBounds = newBounds;			this.oldDragBounds = newBounds.clone();			// Update and show the rectangle			this.resizeRectangle(newBounds);			this.selectedRect.show();						// Show the resize button, if there is only one element and this is resizeable			if(elements.length == 1 && elements[0].isResizable) {				var aspectRatio = elements[0].getStencil().fixedAspectRatio() ? elements[0].bounds.width() / elements[0].bounds.height() : undefined;				this.resizerSE.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);				this.resizerSE.show();				this.resizerNW.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);				this.resizerNW.show();			} else {				this.resizerSE.setBounds(undefined);				this.resizerNW.setBounds(undefined);			}			// If Snap-To-Grid is enabled, the Snap-Point will be calculate			if(ORYX.CONFIG.GRID_ENABLED) {				// Reset all points				this.distPoints = [];				if (this.distPointTimeout)					window.clearTimeout(this.distPointTimeout)								this.distPointTimeout = window.setTimeout(function(){					// Get all the shapes, there will consider at snapping					// Consider only those elements who shares the same parent element					var distShapes = this.facade.getCanvas().getChildShapes(true).findAll(function(value){						var parentShape = value.parent;						while(parentShape){							if(elements.member(parentShape)) return false;							parentShape = parentShape.parent						}						return true;					})										// The current selection will delete from this array					//elements.each(function(shape) {					//	distShapes = distShapes.without(shape);					//});					// For all these shapes					distShapes.each((function(value) {						if(!(value instanceof ORYX.Core.Edge)) {							var ul = value.absoluteXY();							var width = value.bounds.width();							var height = value.bounds.height();							// Add the upperLeft, center and lowerRight - Point to the distancePoints							this.distPoints.push({								ul: {									x: ul.x,									y: ul.y								},								c: {									x: ul.x + (width / 2),									y: ul.y + (height / 2)								},								lr: {									x: ul.x + width,									y: ul.y + height								}							});						}					}).bind(this));									}.bind(this), 10)			}		}	},	/**	 * Adjust an Point to the Snap Points	 *	 */	snapToGrid: function(position) {		// Get the current Bounds		var bounds = this.dragBounds;				var point = {};		var ulThres = 6;		var cThres = 10;		var lrThres = 6;		var scale = this.vLine ? this.vLine.getScale() : 1;				var ul = { x: (position.x/scale), y: (position.y/scale)};		var c = { x: (position.x/scale) + (bounds.width()/2), y: (position.y/scale) + (bounds.height()/2)};		var lr = { x: (position.x/scale) + (bounds.width()), y: (position.y/scale) + (bounds.height())};		var offsetX, offsetY;		var gridX, gridY;				// For each distant point		this.distPoints.each(function(value) {			var x, y, gx, gy;			if (Math.abs(value.c.x-c.x) < cThres){				x = value.c.x-c.x;				gx = value.c.x;			}/* else if (Math.abs(value.ul.x-ul.x) < ulThres){				x = value.ul.x-ul.x;				gx = value.ul.x;			} else if (Math.abs(value.lr.x-lr.x) < lrThres){				x = value.lr.x-lr.x;				gx = value.lr.x;			} */						if (Math.abs(value.c.y-c.y) < cThres){				y = value.c.y-c.y;				gy = value.c.y;			}/* else if (Math.abs(value.ul.y-ul.y) < ulThres){				y = value.ul.y-ul.y;				gy = value.ul.y;			} else if (Math.abs(value.lr.y-lr.y) < lrThres){				y = value.lr.y-lr.y;				gy = value.lr.y;			} */			if (x !== undefined) {				offsetX = offsetX === undefined ? x : (Math.abs(x) < Math.abs(offsetX) ? x : offsetX);				if (offsetX === x)					gridX = gx;			}			if (y !== undefined) {				offsetY = offsetY === undefined ? y : (Math.abs(y) < Math.abs(offsetY) ? y : offsetY);				if (offsetY === y)					gridY = gy;			}		});						if (offsetX !== undefined) {			ul.x += offsetX;				ul.x *= scale;			if (this.vLine&&gridX)				this.vLine.update(gridX);		} else {			ul.x = (position.x - (position.x % (ORYX.CONFIG.GRID_DISTANCE/2)));			if (this.vLine)				this.vLine.hide()		}				if (offsetY !== undefined) {				ul.y += offsetY;			ul.y *= scale;			if (this.hLine&&gridY)				this.hLine.update(gridY);		} else {			ul.y = (position.y - (position.y % (ORYX.CONFIG.GRID_DISTANCE/2)));			if (this.hLine)				this.hLine.hide();		}				return ul;	},		showGridLine: function(){			},	/**	 * Redraw of the Rectangle of the SelectedArea	 * @param {Object} bounds	 */	resizeRectangle: function(bounds) {		// Resize the Rectangle		this.selectedRect.resize(bounds);	}});ORYX.Plugins.SelectedRect = Clazz.extend({	construct: function(parentId) {		this.parentId = parentId;		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", $(parentId),					['g']);		this.dashedArea = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,			['rect', {x: 0, y: 0,				'stroke-width': 1, stroke: '#777777', fill: 'none',				'stroke-dasharray': '2,2',				'pointer-events': 'none'}]);		this.hide();	},	hide: function() {		this.node.setAttributeNS(null, 'display', 'none');	},	show: function() {		this.node.setAttributeNS(null, 'display', '');	},	resize: function(bounds) {		var upL = bounds.upperLeft();		var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;		this.dashedArea.setAttributeNS(null, 'width', bounds.width() + 2*padding);		this.dashedArea.setAttributeNS(null, 'height', bounds.height() + 2*padding);		this.node.setAttributeNS(null, 'transform', "translate("+ (upL.x - padding) +", "+ (upL.y - padding) +")");	}});ORYX.Plugins.GridLine = Clazz.extend({		construct: function(parentId, direction) {		if (ORYX.Plugins.GridLine.DIR_HORIZONTAL !== direction && ORYX.Plugins.GridLine.DIR_VERTICAL !== direction) {			direction = ORYX.Plugins.GridLine.DIR_HORIZONTAL		}					this.parent = $(parentId);		this.direction = direction;		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parent,					['g']);		this.line = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,			['path', {				'stroke-width': 1, stroke: 'silver', fill: 'none',				'stroke-dasharray': '5,5',				'pointer-events': 'none'}]);		this.hide();	},	hide: function() {		this.node.setAttributeNS(null, 'display', 'none');	},	show: function() {		this.node.setAttributeNS(null, 'display', '');	},	getScale: function(){		try {			return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a;		} catch(e) {			return 1;		}	},		update: function(pos) {				if (this.direction === ORYX.Plugins.GridLine.DIR_HORIZONTAL) {			var y = pos instanceof Object ? pos.y : pos; 			var cWidth = this.parent.parentNode.parentNode.width.baseVal.value/this.getScale();			this.line.setAttributeNS(null, 'd', 'M 0 '+y+ ' L '+cWidth+' '+y);		} else {			var x = pos instanceof Object ? pos.x : pos; 			var cHeight = this.parent.parentNode.parentNode.height.baseVal.value/this.getScale();			this.line.setAttributeNS(null, 'd', 'M'+x+ ' 0 L '+x+' '+cHeight);		}				this.show();	}});ORYX.Plugins.GridLine.DIR_HORIZONTAL = "hor";ORYX.Plugins.GridLine.DIR_VERTICAL = "ver";ORYX.Plugins.Resizer = Clazz.extend({	construct: function(parentId, orientation, facade) {		this.parentId 		= parentId;		this.orientation	= orientation;		this.facade			= facade;		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(this.parentId),			['div', {'class': 'resizer_'+ this.orientation, style:'left:0px; top:0px;'}]);		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this), true);		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, 	this.handleMouseUp.bind(this), 		true);		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, 	this.handleMouseMove.bind(this), 	false);		this.dragEnable = false;		this.offSetPosition = {x: 0, y: 0};		this.bounds = undefined;		this.canvasNode = this.facade.getCanvas().node;		this.minSize = undefined;		this.maxSize = undefined;				this.aspectRatio = undefined;		this.resizeCallbacks 		= [];		this.resizeStartCallbacks 	= [];		this.resizeEndCallbacks 	= [];		this.hide();				// Calculate the Offset		this.scrollNode = this.node.parentNode.parentNode.parentNode;	},	handleMouseDown: function(event) {		this.dragEnable = true;		this.offsetScroll	= {x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};					this.offSetPosition =  {			x: Event.pointerX(event) - this.position.x,			y: Event.pointerY(event) - this.position.y};				this.resizeStartCallbacks.each((function(value) {			value(this.bounds);		}).bind(this));	},	handleMouseUp: function(event) {		this.dragEnable = false;		this.containmentParentNode = null;		this.resizeEndCallbacks.each((function(value) {			value(this.bounds);		}).bind(this));					},	handleMouseMove: function(event) {		if(!this.dragEnable) { return }				if(event.shiftKey || event.ctrlKey) {			this.aspectRatio = this.bounds.width() / this.bounds.height();		} else {			this.aspectRatio = undefined;		}		var position = {			x: Event.pointerX(event) - this.offSetPosition.x,			y: Event.pointerY(event) - this.offSetPosition.y}		position.x 	-= this.offsetScroll.x - this.scrollNode.scrollLeft; 		position.y 	-= this.offsetScroll.y - this.scrollNode.scrollTop;				position.x  = Math.min( position.x, this.facade.getCanvas().bounds.width())		position.y  = Math.min( position.y, this.facade.getCanvas().bounds.height())				var offset = {			x: position.x - this.position.x,			y: position.y - this.position.y		}				if(this.aspectRatio) {			// fixed aspect ratio			newAspectRatio = (this.bounds.width()+offset.x) / (this.bounds.height()+offset.y);			if(newAspectRatio>this.aspectRatio) {				offset.x = this.aspectRatio * (this.bounds.height()+offset.y) - this.bounds.width();			} else if(newAspectRatio<this.aspectRatio) {				offset.y = (this.bounds.width()+offset.x) / this.aspectRatio - this.bounds.height();			}		}				// respect minimum and maximum sizes of stencil		if(this.orientation==="northwest") {			if(this.bounds.width()-offset.x > this.maxSize.width) {				offset.x = -(this.maxSize.width - this.bounds.width());				if(this.aspectRatio)					offset.y = this.aspectRatio * offset.x;			}			if(this.bounds.width()-offset.x < this.minSize.width) {				offset.x = -(this.minSize.width - this.bounds.width());				if(this.aspectRatio)					offset.y = this.aspectRatio * offset.x;			}			if(this.bounds.height()-offset.y > this.maxSize.height) {				offset.y = -(this.maxSize.height - this.bounds.height());				if(this.aspectRatio)					offset.x = offset.y / this.aspectRatio;			}			if(this.bounds.height()-offset.y < this.minSize.height) {				offset.y = -(this.minSize.height - this.bounds.height());				if(this.aspectRatio)					offset.x = offset.y / this.aspectRatio;			}		} else { // defaults to southeast			if(this.bounds.width()+offset.x > this.maxSize.width) {				offset.x = this.maxSize.width - this.bounds.width();				if(this.aspectRatio)					offset.y = this.aspectRatio * offset.x;			}			if(this.bounds.width()+offset.x < this.minSize.width) {				offset.x = this.minSize.width - this.bounds.width();				if(this.aspectRatio)					offset.y = this.aspectRatio * offset.x;			}			if(this.bounds.height()+offset.y > this.maxSize.height) {				offset.y = this.maxSize.height - this.bounds.height();				if(this.aspectRatio)					offset.x = offset.y / this.aspectRatio;			}			if(this.bounds.height()+offset.y < this.minSize.height) {				offset.y = this.minSize.height - this.bounds.height();				if(this.aspectRatio)					offset.x = offset.y / this.aspectRatio;			}		}		if(this.orientation==="northwest") {			var oldLR = {x: this.bounds.lowerRight().x, y: this.bounds.lowerRight().y};			this.bounds.extend({x:-offset.x, y:-offset.y});			this.bounds.moveBy(offset);		} else { // defaults to southeast			this.bounds.extend(offset);		}		this.update();		this.resizeCallbacks.each((function(value) {			value(this.bounds);		}).bind(this));		Event.stop(event);	},		registerOnResizeStart: function(callback) {		if(!this.resizeStartCallbacks.member(callback)) {			this.resizeStartCallbacks.push(callback);		}	},		unregisterOnResizeStart: function(callback) {		if(this.resizeStartCallbacks.member(callback)) {			this.resizeStartCallbacks = this.resizeStartCallbacks.without(callback);		}	},	registerOnResizeEnd: function(callback) {		if(!this.resizeEndCallbacks.member(callback)) {			this.resizeEndCallbacks.push(callback);		}	},		unregisterOnResizeEnd: function(callback) {		if(this.resizeEndCallbacks.member(callback)) {			this.resizeEndCallbacks = this.resizeEndCallbacks.without(callback);		}	},			registerOnResize: function(callback) {		if(!this.resizeCallbacks.member(callback)) {			this.resizeCallbacks.push(callback);		}	},	unregisterOnResize: function(callback) {		if(this.resizeCallbacks.member(callback)) {			this.resizeCallbacks = this.resizeCallbacks.without(callback);		}	},	hide: function() {		this.node.style.display = "none";	},	show: function() {		if(this.bounds)			this.node.style.display = "";	},	setBounds: function(bounds, min, max, aspectRatio) {		this.bounds = bounds;		if(!min)			min = {width: ORYX.CONFIG.MINIMUM_SIZE, height: ORYX.CONFIG.MINIMUM_SIZE};		if(!max)			max = {width: ORYX.CONFIG.MAXIMUM_SIZE, height: ORYX.CONFIG.MAXIMUM_SIZE};		this.minSize = min;		this.maxSize = max;				this.aspectRatio = aspectRatio;		this.update();	},	update: function() {		if(!this.bounds) { return; }		var upL = this.bounds.upperLeft();		if(this.bounds.width() < this.minSize.width)	{ this.bounds.set(upL.x, upL.y, upL.x + this.minSize.width, upL.y + this.bounds.height())};		if(this.bounds.height() < this.minSize.height)	{ this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.minSize.height)};		if(this.bounds.width() > this.maxSize.width)	{ this.bounds.set(upL.x, upL.y, upL.x + this.maxSize.width, upL.y + this.bounds.height())};		if(this.bounds.height() > this.maxSize.height)	{ this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.maxSize.height)};		var a = this.canvasNode.getScreenCTM();				upL.x *= a.a;		upL.y *= a.d;				if(this.orientation==="northwest") {			upL.x -= 13;			upL.y -= 26;		} else { // defaults to southeast			upL.x +=  (a.a * this.bounds.width()) + 3 ;			upL.y +=  (a.d * this.bounds.height())  + 3;		}				this.position = upL;		this.node.style.left = this.position.x + "px";		this.node.style.top = this.position.y + "px";	}});/** * Implements a Command to move shapes *  */ ORYX.Core.Command.Move = ORYX.Core.Command.extend({	construct: function(moveShapes, offset, parent, selectedShapes, plugin){		this.moveShapes = moveShapes;		this.selectedShapes = selectedShapes;		this.offset 	= offset;		this.plugin		= plugin;		// Defines the old/new parents for the particular shape		this.newParents	= moveShapes.collect(function(t){ return parent || t.parent });		this.oldParents	= moveShapes.collect(function(shape){ return shape.parent });		this.dockedNodes= moveShapes.findAll(function(shape){ return shape instanceof ORYX.Core.Node && shape.dockers.length == 1}).collect(function(shape){ return {docker:shape.dockers[0], dockedShape:shape.dockers[0].getDockedShape(), refPoint:shape.dockers[0].referencePoint} });	},				execute: function(){		this.dockAllShapes()						// Moves by the offset		this.move( this.offset);		// Addes to the new parents		this.addShapeToParent( this.newParents ); 		// Set the selection to the current selection		this.selectCurrentShapes();		this.plugin.facade.getCanvas().update();		this.plugin.facade.updateSelection();	},	rollback: function(){		// Moves by the inverted offset		var offset = { x:-this.offset.x, y:-this.offset.y };		this.move( offset );		// Addes to the old parents		this.addShapeToParent( this.oldParents ); 		this.dockAllShapes(true)					// Set the selection to the current selection		this.selectCurrentShapes();		this.plugin.facade.getCanvas().update();		this.plugin.facade.updateSelection();			},	move:function(offset, doLayout){				// Move all Shapes by these offset		for(var i=0; i<this.moveShapes.length ;i++){			var value = this.moveShapes[i];								value.bounds.moveBy(offset);						if (value instanceof ORYX.Core.Node) {								(value.dockers||[]).each(function(d){					d.bounds.moveBy(offset);				})								// Update all Dockers of Child shapes				/*var childShapesNodes = value.getChildShapes(true).findAll(function(shape){ return shape instanceof ORYX.Core.Node });											var childDockedShapes = childShapesNodes.collect(function(shape){ return shape.getAllDockedShapes() }).flatten().uniq();											var childDockedEdge = childDockedShapes.findAll(function(shape){ return shape instanceof ORYX.Core.Edge });											childDockedEdge = childDockedEdge.findAll(function(shape){ return shape.getAllDockedShapes().all(function(dsh){ return childShapesNodes.include(dsh) }) });											var childDockedDockers = childDockedEdge.collect(function(shape){ return shape.dockers }).flatten();								for (var j = 0; j < childDockedDockers.length; j++) {					var docker = childDockedDockers[j];					if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {						//docker.bounds.moveBy(offset);						//docker.update();					}				}*/												var allEdges = [].concat(value.getIncomingShapes())					.concat(value.getOutgoingShapes())					// Remove all edges which are included in the selection from the list					.findAll(function(r){ return	r instanceof ORYX.Core.Edge && !this.moveShapes.any(function(d){ return d == r || (d instanceof ORYX.Core.Controls.Docker && d.parent == r)}) }.bind(this))					// Remove all edges which are between the node and a node contained in the selection from the list					.findAll(function(r){ return 	(r.dockers.first().getDockedShape() == value || !this.moveShapes.include(r.dockers.first().getDockedShape())) &&  													(r.dockers.last().getDockedShape() == value || !this.moveShapes.include(r.dockers.last().getDockedShape()))}.bind(this))																	// Layout all outgoing/incoming edges				this.plugin.layoutEdges(value, allEdges, offset);												var allSameEdges = [].concat(value.getIncomingShapes())					.concat(value.getOutgoingShapes())					// Remove all edges which are included in the selection from the list					.findAll(function(r){ return r instanceof ORYX.Core.Edge && r.dockers.first().isDocked() && r.dockers.last().isDocked() && !this.moveShapes.include(r) && !this.moveShapes.any(function(d){ return d == r || (d instanceof ORYX.Core.Controls.Docker && d.parent == r)}) }.bind(this))					// Remove all edges which are included in the selection from the list					.findAll(function(r){ return this.moveShapes.indexOf(r.dockers.first().getDockedShape()) > i ||  this.moveShapes.indexOf(r.dockers.last().getDockedShape()) > i}.bind(this))				for (var j = 0; j < allSameEdges.length; j++) {					for (var k = 1; k < allSameEdges[j].dockers.length-1; k++) {						var docker = allSameEdges[j].dockers[k];						if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {							docker.bounds.moveBy(offset);						}					}				}									/*var i=-1;				var nodes = value.getChildShapes(true);				var allEdges = [];				while(++i<nodes.length){					var edges = [].concat(nodes[i].getIncomingShapes())						.concat(nodes[i].getOutgoingShapes())						// Remove all edges which are included in the selection from the list						.findAll(function(r){ return r instanceof ORYX.Core.Edge && !allEdges.include(r) && r.dockers.any(function(d){ return !value.bounds.isIncluded(d.bounds.center)})})					allEdges = allEdges.concat(edges);					if (edges.length <= 0){ continue }					//this.plugin.layoutEdges(nodes[i], edges, offset);				}*/			}		}											},	dockAllShapes: function(shouldDocked){		// Undock all Nodes		for (var i = 0; i < this.dockedNodes.length; i++) {			var docker = this.dockedNodes[i].docker;						docker.setDockedShape( shouldDocked ? this.dockedNodes[i].dockedShape : undefined )			if (docker.getDockedShape()) {				docker.setReferencePoint(this.dockedNodes[i].refPoint);				//docker.update();			}		}	},		addShapeToParent:function( parents ){				// For every Shape, add this and reset the position				for(var i=0; i<this.moveShapes.length ;i++){			var currentShape = this.moveShapes[i];			if(currentShape instanceof ORYX.Core.Node &&			   currentShape.parent !== parents[i]) {								// Calc the new position				var unul = parents[i].absoluteXY();				var csul = currentShape.absoluteXY();				var x = csul.x - unul.x;				var y = csul.y - unul.y;				// Add the shape to the new contained shape				parents[i].add(currentShape);				// Add all attached shapes as well				currentShape.getOutgoingShapes((function(shape) {					if(shape instanceof ORYX.Core.Node && !this.moveShapes.member(shape)) {						parents[i].add(shape);					}				}).bind(this));				// Set the new position				if(currentShape instanceof ORYX.Core.Node && currentShape.dockers.length == 1){					var b = currentShape.bounds;					x += b.width()/2;y += b.height()/2					currentShape.dockers.first().bounds.centerMoveTo(x, y);				} else {					currentShape.bounds.moveTo(x, y);				}							} 						// Update the shape			//currentShape.update();					}	},	selectCurrentShapes:function(){		this.plugin.facade.setSelection( this.selectedShapes );	}});/** * Copyright (c) 2008 * Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.RenameShapes = Clazz.extend({    facade: undefined,        construct: function(facade){            this.facade = facade;		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, this.actOnDBLClick.bind(this));        this.facade.offer({		 keyCodes: [{				keyCode: 113, // F2-Key				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.renamePerF2.bind(this)         });						document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.hide.bind(this), true );				// Added in 2011 by Matthias Kunze and Tobias Pfeiffer		// Register on the event for the template plugins (see the method registerTemplate for more information)		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE, this.registerTemplate.bind(this));		// raise the event once so we have the initialized property this.label_templates		this.facade.raiseEvent({			type: ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE,			empty: true // enforces basic template (unity)		});		    },        /**     * Handle the registration of a plugin for templatization.     * This is part of a change made by Matthias Kunze and Tobias Pfeiffer in 2011      * The options are 2 functions (edit_template and render_template) that handle the templatization.     *      * edit_template is called with the oldValue of a property to be edited and changes it's appearance a bit     * so the user sees something slightly different in his editwindow, for details refer to the UMLState plugin.     *      * render_template is called with the result of the editing by the user, the template connected things are removed     * from it so it gets saved in its pure form. Again for more info please refer to the UMLState plugin.     *      * multiple templating methods are saved and are executed one after another, as one may want to use many of them.     *      * @param options, the options of the template function. It should be the edit_template and the render_template functions.     */    registerTemplate: function(options) {        // initialization        this.label_templates = this.label_templates || [];             // push the new template onto our list so it gets executed in the next renaming process        this.label_templates.push({            edit: "function" == typeof(options.edit_template) ? options.edit_template : function(a){return a;},            render: "function" == typeof(options.render_template) ? options.render_template : function(a){return a;}        });     },    	/**	 * This method handles the "F2" key down event. The selected shape are looked	 * up and the editing of title/name of it gets started.	 */	renamePerF2 : function renamePerF2() {		var selectedShapes = this.facade.getSelection();		this.actOnDBLClick(undefined, selectedShapes.first());	},		getEditableProperties: function getEditableProperties(shape) {	    // Get all properties which where at least one ref to view is set		var props = shape.getStencil().properties().findAll(function(item){ 			return (item.refToView() 					&&  item.refToView().length > 0					&&	item.directlyEditable()); 		});				// from these, get all properties where write access are and the type is String	    return props.findAll(function(item){ return !item.readonly() &&  item.type() == ORYX.CONFIG.TYPE_STRING });	},		getPropertyForLabel: function getPropertyForLabel(properties, shape, label) {	    return properties.find(function(item){ return item.refToView().any(function(toView){ return label.id == shape.id + toView })});	},		actOnDBLClick: function actOnDBLClick(evt, shape){		if( !(shape instanceof ORYX.Core.Shape) ){ return }				// Destroys the old input, if there is one		this.destroy();		var props = this.getEditableProperties(shape);				// Get all ref ids		var allRefToViews	= props.collect(function(prop){ return prop.refToView() }).flatten().compact();		// Get all labels from the shape with the ref ids		var labels			= shape.getLabels().findAll(function(label){ return allRefToViews.any(function(toView){ return label.id.endsWith(toView) }); })				// If there are no referenced labels --> return		if( labels.length == 0 ){ return } 				// Define the nearest label		var nearestLabel 	= labels.length == 1 ? labels[0] : null;			if( !nearestLabel ){		    nearestLabel = labels.find(function(label){ return label.node == evt.target || label.node == evt.target.parentNode })	        if( !nearestLabel ){		        var evtCoord 	= this.facade.eventCoordinates(evt);		        var trans		= this.facade.getCanvas().rootNode.lastChild.getScreenCTM();		        evtCoord.x		*= trans.a;		        evtCoord.y		*= trans.d;			    if (!shape instanceof ORYX.Core.Node) {			        var diff = labels.collect(function(label){						        var center 	= this.getCenterPosition( label.node ); 						        var len 	= Math.sqrt( Math.pow(center.x - evtCoord.x, 2) + Math.pow(center.y - evtCoord.y, 2));						        return {diff: len, label: label} 					        }.bind(this));						        diff.sort(function(a, b){ return a.diff > b.diff })							        nearestLabel = 	diff[0].label;                } else {			        var diff = labels.collect(function(label){						        var center 	= this.getDifferenceCenterForNode( label.node ); 						        var len 	= Math.sqrt( Math.pow(center.x - evtCoord.x, 2) + Math.pow(center.y - evtCoord.y, 2));						        return {diff: len, label: label} 					        }.bind(this));						        diff.sort(function(a, b){ return a.diff > b.diff })							        nearestLabel = 	diff[0].label;                }            }		}		// Get the particular property for the label		var prop = this.getPropertyForLabel(props, shape, nearestLabel);        this.showTextField(shape, prop, nearestLabel);	},		showTextField: function showTextField(shape, prop, label) {		// Set all particular config values		var htmlCont 	= this.facade.getCanvas().getHTMLContainer().id;	    	    // Get the center position from the nearest label		var width;		if(!(shape instanceof ORYX.Core.Node)) {		    var bounds = label.node.getBoundingClientRect();			width = Math.max(150, bounds.width);		} else {			width = shape.bounds.width();		}		if (!shape instanceof ORYX.Core.Node) {		    var center 		= this.getCenterPosition( label.node );		    center.x		-= (width/2);        } else {            var center = shape.absoluteBounds().center();		    center.x		-= (width/2);        }		var propId		= prop.prefix() + "-" + prop.id();		// Set the config values for the TextField/Area		var config 		= 	{								renderTo	: htmlCont,								// Part of the change by Matthias Kunze and Tobias Pfeiffer in order for templates to work								// give the value to each registered templating function and let the function modify it, then return it								value		: (function(value, propId, shape){									this.label_templates.forEach(function(tpl){										// Make sure bad templating functions don't break everything										try {											value = tpl.edit(value, propId, shape);										} catch(err) {											ORYX.Log.error("Unable to render label template", err, tpl.edit);										}									});									return value;								}.bind(this))(shape.properties[propId], propId, shape),								x			: (center.x < 10) ? 10 : center.x,								y			: center.y,								width		: Math.max(100, width),								style		: 'position:absolute', 								allowBlank	: prop.optional(), 								maxLength	: prop.length(),								emptyText	: prop.title(),								cls			: 'x_form_text_set_absolute',                                listeners   : {specialkey: this._specialKeyPressed.bind(this)}							};				// Depending on the property, generate 		// either an TextArea or TextField		if(prop.wrapLines()) {			config.y 		-= 30;			config['grow']	= true;			this.shownTextField = new Ext.form.TextArea(config);		} else {			config.y -= 16;						this.shownTextField = new Ext.form.TextField(config);		}				//focus		this.shownTextField.focus();				// Define event handler		//	Blur 	-> Destroy		//	Change 	-> Set new values							this.shownTextField.on( 'blur', 	this.destroy.bind(this) )		this.shownTextField.on( 'change', 	function(node, value){			var currentEl 	= shape;			var oldValue	= currentEl.properties[propId]; 			// Part of the change by Matthias Kunze and Tobias Pfeiffer in order for templates to work			// give the value to each registered templating function and modify it, then return it			var newValue	= (function(value, propId, shape){				this.label_templates.forEach(function(tpl){					// Make sure bad templating functions don't break everything					try {						value = tpl.render(value, propId, shape);					} catch(err) {						ORYX.Log.error("Unable to render label template", err, tpl.render);					}				})				return value;			}.bind(this))(value, propId, shape);			var facade		= this.facade;						if (oldValue != newValue) {				// Implement the specific command for property change				var commandClass = ORYX.Core.Command.extend({					construct: function(){						this.el = currentEl;						this.propId = propId;						this.oldValue = oldValue;						this.newValue = newValue;						this.facade = facade;					},					execute: function(){						this.el.setProperty(this.propId, this.newValue);						//this.el.update();						this.facade.setSelection([this.el]);						this.facade.getCanvas().update();						this.facade.updateSelection();					},					rollback: function(){						this.el.setProperty(this.propId, this.oldValue);						//this.el.update();						this.facade.setSelection([this.el]);						this.facade.getCanvas().update();						this.facade.updateSelection();					}				})				// Instanciated the class				var command = new commandClass();								// Execute the command				this.facade.executeCommands([command]);			}		}.bind(this) )		// Diable the keydown in the editor (that when hitting the delete button, the shapes not get deleted)		this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);	},        _specialKeyPressed: function _specialKeyPressed(field, e) {        // Enter or Ctrl+Enter pressed        var keyCode = e.getKey();        if (keyCode == 13  && (e.shiftKey || !field.initialConfig.grow)) {            field.fireEvent("change", null, field.getValue());            field.fireEvent("blur");        } else if (keyCode == e.ESC) {            field.fireEvent("blur");        }    },		getCenterPosition: function(svgNode){				var center 		= {x: 0, y:0 };		// transformation to the coordinate origin of the canvas		var trans 		= svgNode.getTransformToElement(this.facade.getCanvas().rootNode.lastChild);		var scale 		= this.facade.getCanvas().rootNode.lastChild.getScreenCTM();		var transLocal 	= svgNode.getTransformToElement(svgNode.parentNode);		var bounds = undefined;				center.x 	= trans.e - transLocal.e;		center.y 	= trans.f - transLocal.f;						try {			bounds = svgNode.getBBox();		} catch (e) {}		// Firefox often fails to calculate the correct bounding box		// in this case we fall back to the upper left corner of the shape		if (bounds === null || typeof bounds === "undefined" || bounds.width == 0 || bounds.height == 0) {			bounds = {				x: Number(svgNode.getAttribute('x')),				y: Number(svgNode.getAttribute('y')),				width: 0,				height: 0			};		}				center.x += bounds.x;		center.y += bounds.y;				center.x += bounds.width/2;		center.y += bounds.height/2;				center.x *= scale.a;		center.y *= scale.d;				return center;			},	getDifferenceCenterForNode: function getDifferenceCenterForNode(svgNode){        //for shapes that do not have multiple lables on the x-line, only the vertical difference matters        var center  = this.getCenterPosition(svgNode);        center.x = 0;        center.y = center.y + 10;        return center;    },		hide: function(e){		if (this.shownTextField && (!e || !this.shownTextField.el || e.target !== this.shownTextField.el.dom)) {			this.shownTextField.onBlur();		}	},		destroy: function(e){		if( this.shownTextField ){			this.shownTextField.destroy(); 			delete this.shownTextField; 						this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);		}	}});/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 * 
 * 
 */
ORYX.Plugins.ERDFSupport = Clazz.extend({

	facade: undefined,
	
	ERDFServletURL: '/erdfsupport',

	/**
	 * Offers the plugin functionality:
	 * 
	 */
	construct: function(facade) {
		
		this.facade = facade;
			
			
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.exp,
			'functionality': 	this.exportERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': 			ORYX.PATH + "images/erdf_export_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.expDesc,
			'index': 			0,
			'minShape': 		0,
			'maxShape': 		0
		});
					
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.imp,
			'functionality': 	this.importERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': 			ORYX.PATH + "images/erdf_import_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.impDesc,
			'index': 			1,
			'minShape': 		0,
			'maxShape': 		0
		});

	},

	
	/**
	 * Imports an AML description
	 * 
	 */
	importERDF: function(){
		this._showImportDialog();
	},		

	
	/**
	 * Imports an AML description
	 * 
	 */
	exportERDF: function(){
        // Show deprecation message
        Ext.Msg.show({
           title:ORYX.I18N.ERDFSupport.deprTitle,
           msg: ORYX.I18N.ERDFSupport.deprText,
           buttons: Ext.Msg.YESNO,
           fn: function(buttonId){
               if(buttonId === 'yes'){
                    var s   = this.facade.getERDF();
                    
                    //this.openXMLWindow( s );
                    this.openDownloadWindow(window.document.title + ".xml", s);
               }
           }.bind(this),
           icon: Ext.MessageBox.WARNING 
        });
	},
	
	/**
	 * 
	 * 
	 * @param {Object} url
	 * @param {Object} params
	 * @param {Object} successcallback
	 */
	sendRequest: function( url, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
            method			: 'POST',
            asynchronous	: false,
            parameters		: params,
			onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.result )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback();
					
				} else {
					Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.ERDFSupport.impFailed);
					ORYX.log.warn("Import ERDF failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		
		return suc;
							
	},


	loadERDF: function( erdfString, success, failed ){
		
		var s 	= erdfString;
		s 		= s.startsWith('<?xml') ? s : '<?xml version="1.0" encoding="utf-8"?>'+s+'';	
						
		var parser	= new DOMParser();			
		var doc 	=  parser.parseFromString( s ,"text/xml");
							
		if( doc.firstChild.tagName == "parsererror" ){

			Ext.MessageBox.show({
					title: 		ORYX.I18N.ERDFSupport.error,
 					msg: 		ORYX.I18N.ERDFSupport.impFailed2 + doc.firstChild.textContent.escapeHTML(),
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.ERROR
				});
																
			if(failed)
				failed();
				
		} else if( !this.hasStencilSet(doc) ){
			
			if(failed)
				failed();		
		
		} else {
			
			this.facade.importERDF( doc );
			
			if(success)
				success();
		
		}
	},

	hasStencilSet: function( doc ){
		
		var getElementsByClassNameFromDiv 	= function(doc, id){ return $A(doc.getElementsByTagName('div')).findAll(function(el){ return $A(el.attributes).any(function(attr){ return attr.nodeName == 'class' && attr.nodeValue == id }) })	}

		// Get Canvas Node
		var editorNode 		= getElementsByClassNameFromDiv( doc, '-oryx-canvas')[0];
		
		if( !editorNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noCanvas);
			return false
		}
		
		var stencilSetNode 	= $A(editorNode.getElementsByTagName('a')).find(function(node){ return node.getAttribute('rel') == 'oryx-stencilset'});

		if( !stencilSetNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noSS);
			return false
		}
		
		var stencilSetUrl	= stencilSetNode.getAttribute('href').split("/")
		stencilSetUrl		= stencilSetUrl[stencilSetUrl.length-2] + "/" + stencilSetUrl[stencilSetUrl.length-1];
		
//		var isLoaded = this.facade.getStencilSets().values().any(function(ss){ return ss.source().endsWith( stencilSetUrl ) })
//		if( !isLoaded ){
//			this.throwWarning(ORYX.I18N.ERDFSupport.wrongSS);
//			return false
//		}
				
		return true;
	},
	
	throwWarning: function( text ){
		Ext.MessageBox.show({
					title: 		ORYX.I18N.Oryx.title,
 					msg: 		text,
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.WARNING
				});
	},
	
	/**
	 * Opens a new window that shows the given XML content.
	 * 
	 * @param {Object} content The XML content to be shown.
	 */
	openXMLWindow: function(content) {
		var win = window.open(
		   'data:application/xml,' + encodeURIComponent(
		     content
		   ),
		   '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"
		);
	},
	
	/**
	 * Opens a download window for downloading the given content.
	 * 
	 */
	openDownloadWindow: function(file, content) {
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			submitForm.appendChild( this.createHiddenElement("download", content));
			submitForm.appendChild( this.createHiddenElement("file", file));
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= ORYX.PATH + "/download";
			submitForm.submit();
		}		
	},
	
	/**
	 * Creates a hidden form element to communicate parameter values.
	 * 
	 * @param {Object} name  The name of the hidden field
	 * @param {Object} value The value of the hidden field
	 */
	createHiddenElement: function(name, value) {
		var newElement = document.createElement("input");
		newElement.name=name;
		newElement.type="hidden";
		newElement.value = value;
		return newElement
	},

	/**
	 * Opens a upload dialog.
	 * 
	 */
	_showImportDialog: function( successCallback ){
	
	    var form = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [{
	            text : 		ORYX.I18N.ERDFSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            anchor:		'100%',
				xtype : 	'label' 
	        },{
	            fieldLabel: ORYX.I18N.ERDFSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
	            anchor: '100% -63'  
	        }]
	    });



		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.ERDFSupport.impERDF, 
			height: 	350, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form],
			buttons:[
				{
					text:ORYX.I18N.ERDFSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.ERDFSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							
							var erdfString =  form.items.items[2].getValue();
							this.loadERDF(erdfString, function(){loadMask.hide();dialog.hide()}.bind(this), function(){loadMask.hide();}.bind(this))
														
														
							
						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.ERDFSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});


		// Show the panel
		dialog.show();
		
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsText('UTF-8');
				form.items.items[2].setValue( text );
			}, true)

	}
	
});
/**
 * Copyright (c) 2009
 * Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

/**
 * Enables exporting and importing current model in JSON.
 */
ORYX.Plugins.JSONSupport = ORYX.Plugins.AbstractPlugin.extend({

    construct: function(){
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.offer({
            'name': ORYX.I18N.JSONSupport.exp.name,
            'functionality': this.exportJSON.bind(this),
            'group': ORYX.I18N.JSONSupport.exp.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_javascript.png",
            'description': ORYX.I18N.JSONSupport.exp.desc,
            'index': 0,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.offer({
            'name': ORYX.I18N.JSONSupport.imp.name,
            'functionality': this.showImportDialog.bind(this),
            'group': ORYX.I18N.JSONSupport.imp.group,
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': ORYX.PATH + "images/page_white_javascript.png",
            'description': ORYX.I18N.JSONSupport.imp.desc,
            'index': 1,
            'minShape': 0,
            'maxShape': 0
        });
    },
    
    exportJSON: function(){
        var json = this.facade.getSerializedJSON();
        this.openDownloadWindow(window.document.title + ".json", json);
    },
    
    /**
     * Opens a upload dialog.
     *
     */
    showImportDialog: function(successCallback){
    
        var form = new Ext.form.FormPanel({
            baseCls: 'x-plain',
            labelWidth: 50,
            defaultType: 'textfield',
            items: [{
                text: ORYX.I18N.JSONSupport.imp.selectFile,
                style: 'font-size:12px;margin-bottom:10px;display:block;',
                anchor: '100%',
                xtype: 'label'
            }, {
                fieldLabel: ORYX.I18N.JSONSupport.imp.file,
                name: 'subject',
                inputType: 'file',
                style: 'margin-bottom:10px;display:block;',
                itemCls: 'ext_specific_window_overflow'
            }, {
                xtype: 'textarea',
                hideLabel: true,
                name: 'msg',
                anchor: '100% -63'
            }]
        });
        
        // Create the panel
        var dialog = new Ext.Window({
            autoCreate: true,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            title: ORYX.I18N.JSONSupport.imp.name,
            height: 350,
            width: 500,
            modal: true,
            fixedcenter: true,
            shadow: true,
            proxyDrag: true,
            resizable: true,
            items: [form],
            buttons: [{
                text: ORYX.I18N.JSONSupport.imp.btnImp,
                handler: function(){
                
                    var loadMask = new Ext.LoadMask(Ext.getBody(), {
                        msg: ORYX.I18N.JSONSupport.imp.progress
                    });
                    loadMask.show();
                    
                    window.setTimeout(function(){
                        var json = form.items.items[2].getValue();
                        try {
                            this.facade.importJSON(json, true);
                            dialog.close();
                        } 
                        catch (error) {
                            Ext.Msg.alert(ORYX.I18N.JSONSupport.imp.syntaxError, error.message);
                        }
                        finally {
                            loadMask.hide();
                        }
                    }.bind(this), 100);
                    
                }.bind(this)
            }, {
                text: ORYX.I18N.JSONSupport.imp.btnClose,
                handler: function(){
                    dialog.close();
                }.bind(this)
            }]
        });
        
        // Show the panel
        dialog.show();
        
        // Adds the change event handler to 
        form.items.items[1].getEl().dom.addEventListener('change', function(evt){
            var text = evt.target.files[0].getAsText('UTF-8');
            form.items.items[2].setValue(text);
        }, true)
        
    }
    
});
/** * Copyright (c) 2009 * Falko Menge * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();/** * Transforms a BPMNplus diagram to its XPDL4Chor representation and * calls a transformation web service to generate BPEL4Chor from the XPDL4Chor * representation. */ORYX.Plugins.RDFExport = ORYX.Plugins.AbstractPlugin.extend({		construct: function() {		arguments.callee.$.construct.apply(this, arguments);			this.facade.offer({			'name'				: ORYX.I18N.RDFExport.rdfExport,			'functionality'		: this.exportRDF.bind(this),			'group'				: ORYX.I18N.RDFExport.group,            dropDownGroupIcon   : ORYX.PATH + "images/export2.png",			'icon'				: ORYX.PATH + "images/page_white_code.png",			'description'		: ORYX.I18N.RDFExport.rdfExportDescription,			'index'				: 0,			'minShape'			: 0,			'maxShape'			: 0		});			},	exportRDF: function() {				this.openDownloadWindow( window.document.title + ".rdf", this.getRDFFromDOM() );			}	});/**
 * Copyright (c) 2009, Matthias Kunze, Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = {};

if (!ORYX.Config)
	ORYX.Config = {};

ORYX.Config.Feedback = {
	VISIBLE_STATE: "visible",
	HIDDEN_STATE: "hidden",
	INFO: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, set eiusmod tempor incidunt et labore et dolore magna aliquam. Ut enim ad minim veniam, quis nostrud exerc. Irure dolor in reprehend incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse molestaie cillum. Tia non ob ea soluad incommod quae egen ium improb fugiend. Officia",
	CSS_FILE: ORYX.PATH + "/css/feedback.css"
}

ORYX.Plugins.Feedback = ORYX.Plugins.AbstractPlugin.extend({
	
    construct: function(facade, data){
		/*
		 * data.name == "ORYX.Plugins.Feedback"
		 * data.source == "feedback.js"
		 * data.properties ... properties defined in plugins.xml/profiles.xml [{key:value}, ...]
		 */
	
		this.facade = facade;
	
		// extract properties, we're interested in
		((data && data.properties) || []).each(function(property){
			if (property.cssfile) {ORYX.Config.Feedback.CSS_FILE = property.css_file}
		}.bind(this));
		
        // load additional css information
        var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", ORYX.Config.Feedback.CSS_FILE);
        document.getElementsByTagName("head")[0].appendChild(fileref);

        // declare HTML references
        this.elements = {
    		container: null,
    		tab: null,
    		dialog: null,
			form: null,
			info: null
    	}
        
        // create feedback tab
        this.createFeedbackTab();
        
    },
    
    /**
     * Creates the feedback tab, which is used to open the feedback dialog.
     */
    createFeedbackTab: function(){
    	this.elements.tab = document.createElement("div");
    	this.elements.tab.setAttribute("class", "tab");
		this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;")
    	
    	this.elements.container = document.createElement("div");
    	this.elements.container.setAttribute("id", "feedback");
    	
    	this.elements.container.appendChild(this.elements.tab);
    	document.body.appendChild(this.elements.container);
          	    	
    	// register events
    	Event.observe(this.elements.tab, "click", this.toggleDialog.bindAsEventListener(this));
    },
    
    /**
     * Hides or shows the feedback dialog
     */
    toggleDialog: function(event) {

		if (event) {
			Event.stop(event);			
		}

    	var dialog = this.elements.dialog || this.createDialog();
    	
    	if (ORYX.Config.Feedback.VISIBLE_STATE == dialog.state) {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;");
    		Element.hide(dialog);
    		dialog.state = ORYX.Config.Feedback.HIDDEN_STATE;
    	} 
    	else {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#215;");
    		Element.show(dialog);
    		dialog.state = ORYX.Config.Feedback.VISIBLE_STATE;
    	}

    },
    
    /**
     * Creates the feedback dialog
     */
    createDialog: function() {
    	if (this.elements.dialog) {
    		return this.elements.dialog;
    	}

		// reset the input formular
		var resetForm = function() {
			[description, title, mail].each(function(element){
				element.value = element._defaultText || "";
				element.className = "low";
			});
		}

		// wrapper for field focus behavior
		var fieldOnFocus = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == e._defaultText.strip()) {
				e.value = "";
				e.className = "high";
			}
		}		
		var fieldOnBlur = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == "") {
				e.value = e._defaultText;
				e.className = "low";
			}
		}

    	// create form and submit logic (ajax)
		this.elements.form = document.createElement("form");
		this.elements.form.action = ORYX.CONFIG.ROOT_PATH + "feedback";
		this.elements.form.method = "POST";
		this.elements.form.onsubmit = function(){
			
			try {
				
				var failure = function() {
					Ext.Msg.alert(ORYX.I18N.Feedback.failure, ORYX.I18N.Feedback.failureMsg);
	                this.facade.raiseEvent({
	                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
	                });
					// show dialog again with old information
					this.toggleDialog();
				}
				
				var success = function(transport) {
					if (transport.status < 200 || transport.status >= 400) {
						return failure(transport);
					}
					this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_STATUS,
						text:ORYX.I18N.Feedback.success
					});
					resetForm();
				}
				
			
				this.elements.form.model.value = this.facade.getSerializedJSON();
				this.elements.form.environment.value = this.getEnv();
			
				var params = {};
				$A(this.elements.form.elements).each(function(element){
					params[element.name] = element.value;
				});
				params["name"]= ORYX.Editor.Cookie.getParams().identifier;
				params["subject"] = ("[" + params["subject"] + "] " + params["title"]);
				this.facade.raiseEvent({
					type:ORYX.CONFIG.EVENT_LOADING_STATUS,
					text:ORYX.I18N.Feedback.sending
				});
				new Ajax.Request(ORYX.CONFIG.ROOT_PATH + "feedback", {
					method: "POST",
					parameters: params,
					onSuccess: success.bind(this),
					onFailure: failure.bind(this)
				});
			
				// hide dialog immediately 
				this.toggleDialog();
			}
			catch(e) {
				failure();
				ORYX.Log.warn(e);
			}
			// stop form submission through browser
			return false; 
		}.bind(this);
		
		
		// create input fields
		var fieldset = document.createElement("div");
			fieldset.className = "fieldset";
		    
		var f_subject = document.createElement("input");
		    f_subject.type = "hidden";
			f_subject.name = "subject";
			f_subject.style.display = "none";
		
		var description = document.createElement("textarea");
			description._defaultText = ORYX.I18N.Feedback.descriptionDesc;
		    description.name = "description";
		Event.observe(description, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(description, "blur", fieldOnBlur.bindAsEventListener());
		
		var title = document.createElement("input");
			title._defaultText = ORYX.I18N.Feedback.titleDesc;
			title.type = "text";
			title.name = "title";
		Event.observe(title, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(title, "blur", fieldOnBlur.bindAsEventListener());
			
		var mail = document.createElement("input");
			mail._defaultText = ORYX.I18N.Feedback.emailDesc;
			mail.type = "text";
			mail.name = "email";
		Event.observe(mail, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(mail, "blur", fieldOnBlur.bindAsEventListener());
		
		var submit = document.createElement("input");
			submit.type = "button";
			submit.className = "submit";
			submit.onclick=this.elements.form.onsubmit;
			if (ORYX.I18N.Feedback.submit) {
				submit.value = ORYX.I18N.Feedback.submit;
			}
			
		var environment = document.createElement("input");
			environment.name = "environment";
			environment.type = "hidden";
			environment.style.display = "none";
			
		var model = document.createElement("input");
			model.name = "model"
			model.type = "hidden";
			model.style.display = "none";
			
		fieldset.appendChild(f_subject);
		fieldset.appendChild(description);
		fieldset.appendChild(title);
		fieldset.appendChild(mail);
		fieldset.appendChild(environment);
		fieldset.appendChild(model);
		fieldset.appendChild(submit);
		
		// (p)reset default values of input fields
		resetForm();
			
		// create subjects
		var list = document.createElement("ul");
	    list.setAttribute("class", "subjects");
		
		var l_subjects = [];
		
		$A(ORYX.I18N.Feedback.subjects).each( function(subject, index){
			try {
				
				// create list item
				var item = document.createElement("li");
					item._subject = subject.id;
				    item.className = subject.id;
					item.innerHTML = subject.name;
					item.style.width = parseInt(100/$A(ORYX.I18N.Feedback.subjects).length)+"%"; // set width corresponding to number of subjects
				
				// add subjects to list
				l_subjects.push(item);
				list.appendChild(item);

				var handler = function(){
					l_subjects.each(function(element) {
						if (element.className.match(subject.id)) { // if current element is selected
							element.className = element._subject + " active";
							f_subject.value = subject.name;
							
							// update description, depending on subject if input field is empty
							if (description.value == description._defaultText) {
								description.value = subject.description;
							}
							
							// set _defaultText to newly selected subject
							description._defaultText = subject.description;
							
							// set info pane if appropriate
							if (subject.info && (""+subject.info).strip().length > 0) {
								this.elements.info.innerHTML = subject.info;
							}
							else {
								this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
							}
						}
						else {
							element.className = element._subject;
						}
					}.bind(this));
				}.bind(this);
				
				// choose/unchoose topics
				Event.observe(item, "click", handler);
				
				// select last item
				if (index == (ORYX.I18N.Feedback.subjects.length - 1)) {
					description.value = "";
					description._defaultText = "";
					
					handler();
				}
				
			} // if something goes wrong, we wont give up, just ignore it
			catch (e) {
				ORYX.Log.warn("Incomplete I10N for ORYX.I18N.Feedback.subjects", subject, ORYX.I18N.Feedback.subjects)
			}
		}.bind(this));
	
		this.elements.form.appendChild(list);
		this.elements.form.appendChild(fieldset);
		
		this.elements.info = document.createElement("div");
		this.elements.info.setAttribute("class", "info");
		this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
		
		var head = document.createElement("div");
			head.setAttribute("class", "head");

    	this.elements.dialog = document.createElement("div");
		this.elements.dialog.setAttribute("class", "dialog");
		this.elements.dialog.appendChild(head);
		this.elements.dialog.appendChild(this.elements.info);
		this.elements.dialog.appendChild(this.elements.form);

		
		this.elements.container.appendChild(this.elements.dialog);
		
    	return this.elements.dialog;
    },

    getEnv: function(){
        var env = "";
        
        env += "Browser: " + navigator.userAgent;
        
        env += "\n\nBrowser Plugins: ";
        if (navigator.plugins) {
            for (var i = 0; i < navigator.plugins.length; i++) {
                var plugin = navigator.plugins[i];
                env += plugin.name + ", ";
            }
        }
        
        if ((typeof(screen.width) != "undefined") && (screen.width && screen.height)) 
            env += "\n\nScreen Resolution: " + screen.width + 'x' + screen.height;
        
        return env;
    }
});
/** * Copyright (c) 2008 * Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * This plugin offer the functionality of undo/redo * Therewith the command pattern is used. *  * A Plugin which want that the changes could get undo/redo has  * to implement a command-class (which implements the method .execute(), .rollback()). * Those instance of class must be execute thru the facade.executeCommands(). If so, * those command get stored here in the undo/redo stack and can get reset/restore. * **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.Undo = Clazz.extend({		// Defines the facade    facade		: undefined,    	// Defines the undo/redo Stack	undoStack	: [],	redoStack	: [],		// Constructor     construct: function(facade){            this.facade = facade;     				// Offers the functionality of undo                        this.facade.offer({			name			: ORYX.I18N.Undo.undo,			description		: ORYX.I18N.Undo.undoDesc,			icon			: ORYX.PATH + "images/arrow_undo.png",			keyCodes: [{					metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],					keyCode: 90,					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN				}		 	],			functionality	: this.doUndo.bind(this),			group			: ORYX.I18N.Undo.group,			isEnabled		: function(){ return this.undoStack.length > 0 }.bind(this),			index			: 0		}); 		// Offers the functionality of redo        this.facade.offer({			name			: ORYX.I18N.Undo.redo,			description		: ORYX.I18N.Undo.redoDesc,			icon			: ORYX.PATH + "images/arrow_redo.png",			keyCodes: [{					metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],					keyCode: 89,					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN				}		 	],			functionality	: this.doRedo.bind(this),			group			: ORYX.I18N.Undo.group,			isEnabled		: function(){ return this.redoStack.length > 0 }.bind(this),			index			: 1		}); 				// Register on event for executing commands --> store all commands in a stack		 		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, this.handleExecuteCommands.bind(this) );    		},		/**	 * Stores all executed commands in a stack	 * 	 * @param {Object} evt	 */	handleExecuteCommands: function( evt ){				// If the event has commands		if( !evt.commands ){ return }				// Add the commands to a undo stack ...		this.undoStack.push( evt.commands );		// ...and delete the redo stack		this.redoStack = [];			},		/**	 * Does the undo	 * 	 */	doUndo: function(){		// Get the last commands		var lastCommands = this.undoStack.pop();				if( lastCommands ){			// Add the commands to the redo stack			this.redoStack.push( lastCommands );						// Rollback every command			lastCommands.each(function(command){				command.rollback();			});		}				// Update and refresh the canvas		//this.facade.getCanvas().update();		//this.facade.updateSelection();		this.facade.raiseEvent({			type 	: ORYX.CONFIG.EVENT_UNDO_ROLLBACK, 			commands: lastCommands		});	},		/**	 * Does the redo	 * 	 */	doRedo: function(){				// Get the last commands from the redo stack		var lastCommands = this.redoStack.pop();				if( lastCommands ){			// Add this commands to the undo stack			this.undoStack.push( lastCommands );						// Execute those commands			lastCommands.each(function(command){				command.execute();			});		}		// Update and refresh the canvas				//this.facade.getCanvas().update();		//this.facade.updateSelection();		this.facade.raiseEvent({			type 	: ORYX.CONFIG.EVENT_UNDO_EXECUTE, 			commands: lastCommands		});	}	});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/Array.prototype.insertFrom = function(from, to){	to 			= Math.max(0, to);	from 		= Math.min( Math.max(0, from), this.length-1 );			var el 		= this[from];	var old 	= this.without(el);	var newA 	= old.slice(0, to);	newA.push(el);	if(old.length > to ){		newA 	= newA.concat(old.slice(to))	};	return newA;}if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.Arrangement = Clazz.extend({	facade: undefined,	construct: function(facade) {		this.facade = facade;		// Z-Ordering		this.facade.offer({			'name':ORYX.I18N.Arrangement.btf,			'functionality': this.setZLevel.bind(this, this.setToTop),			'group': ORYX.I18N.Arrangement.groupZ,			'icon': ORYX.PATH + "images/shape_move_front.png",			'description': ORYX.I18N.Arrangement.btfDesc,			'index': 1,			'minShape': 1});					this.facade.offer({			'name':ORYX.I18N.Arrangement.btb,			'functionality': this.setZLevel.bind(this, this.setToBack),			'group': ORYX.I18N.Arrangement.groupZ,			'icon': ORYX.PATH + "images/shape_move_back.png",			'description': ORYX.I18N.Arrangement.btbDesc,			'index': 2,			'minShape': 1});		this.facade.offer({			'name':ORYX.I18N.Arrangement.bf,			'functionality': this.setZLevel.bind(this, this.setForward),			'group': ORYX.I18N.Arrangement.groupZ,			'icon': ORYX.PATH + "images/shape_move_forwards.png",			'description': ORYX.I18N.Arrangement.bfDesc,			'index': 3,			'minShape': 1});		this.facade.offer({			'name':ORYX.I18N.Arrangement.bb,			'functionality': this.setZLevel.bind(this, this.setBackward),			'group': ORYX.I18N.Arrangement.groupZ,			'icon': ORYX.PATH + "images/shape_move_backwards.png",			'description': ORYX.I18N.Arrangement.bbDesc,			'index': 4,			'minShape': 1});		// Aligment		this.facade.offer({			'name':ORYX.I18N.Arrangement.ab,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_BOTTOM]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_bottom.png",			'description': ORYX.I18N.Arrangement.abDesc,			'index': 1,			'minShape': 2});		this.facade.offer({			'name':ORYX.I18N.Arrangement.am,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_middle.png",			'description': ORYX.I18N.Arrangement.amDesc,			'index': 2,			'minShape': 2});		this.facade.offer({			'name':ORYX.I18N.Arrangement.at,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_TOP]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_top.png",			'description': ORYX.I18N.Arrangement.atDesc,			'index': 3,			'minShape': 2});		this.facade.offer({			'name':ORYX.I18N.Arrangement.al,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_LEFT]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_left.png",			'description': ORYX.I18N.Arrangement.alDesc,			'index': 4,			'minShape': 2});		this.facade.offer({			'name':ORYX.I18N.Arrangement.ac,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_CENTER]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_center.png",			'description': ORYX.I18N.Arrangement.acDesc,			'index': 5,			'minShape': 2});		this.facade.offer({			'name':ORYX.I18N.Arrangement.ar,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_RIGHT]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_right.png",			'description': ORYX.I18N.Arrangement.arDesc,			'index': 6,			'minShape': 2});					this.facade.offer({			'name':ORYX.I18N.Arrangement.as,			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_SIZE]),			'group': ORYX.I18N.Arrangement.groupA,			'icon': ORYX.PATH + "images/shape_align_size.png",			'description': ORYX.I18N.Arrangement.asDesc,			'index': 7,			'minShape': 2});					this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_TOP, 	this.setZLevel.bind(this, this.setToTop)	);		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACK, 	this.setZLevel.bind(this, this.setToBack)	);		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD, 	this.setZLevel.bind(this, this.setForward)	);		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD, 	this.setZLevel.bind(this, this.setBackward)	);								},		setZLevel:function(callback, event){					//Command-Pattern for dragging one docker		var zLevelCommand = ORYX.Core.Command.extend({			construct: function(callback, elements, facade){				this.callback 	= callback;				this.elements 	= elements;				// For redo, the previous elements get stored				this.elAndIndex	= elements.map(function(el){ return {el:el, previous:el.parent.children[el.parent.children.indexOf(el)-1]} })				this.facade		= facade;			},						execute: function(){								// Call the defined z-order callback with the elements				this.callback( this.elements )							this.facade.setSelection( this.elements )			},			rollback: function(){								// Sort all elements on the index of there containment				var sortedEl =	this.elAndIndex.sortBy( function( el ) {									var value 	= el.el;									var t 		= $A(value.node.parentNode.childNodes);									return t.indexOf(value.node);								}); 								// Every element get setted back bevor the old previous element				for(var i=0; i<sortedEl.length; i++){					var el			= sortedEl[i].el;					var p 			= el.parent;								var oldIndex 	= p.children.indexOf(el);					var newIndex 	= p.children.indexOf(sortedEl[i].previous);					newIndex		= newIndex || 0					p.children 	= p.children.insertFrom(oldIndex, newIndex)								el.node.parentNode.insertBefore(el.node, el.node.parentNode.childNodes[newIndex+1]);				}				// Reset the selection				this.facade.setSelection( this.elements )			}		});			// Instanziate the dockCommand		var command = new zLevelCommand(callback, this.facade.getSelection(), this.facade);		if( event.excludeCommand ){			command.execute();		} else {			this.facade.executeCommands( [command] );			}			},	setToTop: function(elements) {		// Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.		var tmpElem =  elements.sortBy( function(value, index) {			var t = $A(value.node.parentNode.childNodes);			return t.indexOf(value.node);		});		// Sortiertes Array wird nach oben verschoben.		tmpElem.each( function(value) {			var p = value.parent			p.children = p.children.without( value )			p.children.push( value );			value.node.parentNode.appendChild(value.node);					});	},	setToBack: function(elements) {		// Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.		var tmpElem =  elements.sortBy( function(value, index) {			var t = $A(value.node.parentNode.childNodes);			return t.indexOf(value.node);		});		tmpElem = tmpElem.reverse();		// Sortiertes Array wird nach unten verschoben.		tmpElem.each( function(value) {			var p = value.parent			p.children = p.children.without( value )			p.children.unshift( value );			value.node.parentNode.insertBefore(value.node, value.node.parentNode.firstChild);		});					},	setBackward: function(elements) {		// Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.		var tmpElem =  elements.sortBy( function(value, index) {			var t = $A(value.node.parentNode.childNodes);			return t.indexOf(value.node);		});		// Reverse the elements		tmpElem = tmpElem.reverse();				// Delete all Nodes who are the next Node in the nodes-Array		var compactElem = tmpElem.findAll(function(el) {return !tmpElem.some(function(checkedEl){ return checkedEl.node == el.node.previousSibling})});				// Sortiertes Array wird nach eine Ebene nach oben verschoben.		compactElem.each( function(el) {			if(el.node.previousSibling === null) { return; }			var p 		= el.parent;						var index 	= p.children.indexOf(el);			p.children 	= p.children.insertFrom(index, index-1)						el.node.parentNode.insertBefore(el.node, el.node.previousSibling);		});					},	setForward: function(elements) {		// Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.		var tmpElem =  elements.sortBy( function(value, index) {			var t = $A(value.node.parentNode.childNodes);			return t.indexOf(value.node);		});		// Delete all Nodes who are the next Node in the nodes-Array		var compactElem = tmpElem.findAll(function(el) {return !tmpElem.some(function(checkedEl){ return checkedEl.node == el.node.nextSibling})});						// Sortiertes Array wird eine Ebene nach unten verschoben.		compactElem.each( function(el) {			var nextNode = el.node.nextSibling					if(nextNode === null) { return; }			var index 	= el.parent.children.indexOf(el);			var p 		= el.parent;			p.children 	= p.children.insertFrom(index, index+1)						el.node.parentNode.insertBefore(nextNode, el.node);		});	},	alignShapes: function(way) {		var elements = this.facade.getSelection();		// Set the elements to all Top-Level elements		elements = this.facade.getCanvas().getShapesWithSharedParent(elements);		// Get only nodes		elements = elements.findAll(function(value) {			return (value instanceof ORYX.Core.Node)		});		// Delete all attached intermediate events from the array		elements = elements.findAll(function(value) {			var d = value.getIncomingShapes()			return d.length == 0 || !elements.include(d[0])		});		if(elements.length < 2) { return; }		// get bounds of all shapes.		var bounds = elements[0].absoluteBounds().clone();		elements.each(function(shape) {		        bounds.include(shape.absoluteBounds().clone());		});				// get biggest width and heigth		var maxWidth = 0;		var maxHeight = 0;		elements.each(function(shape){			maxWidth = Math.max(shape.bounds.width(), maxWidth);			maxHeight = Math.max(shape.bounds.height(), maxHeight);		});		var commandClass = ORYX.Core.Command.extend({			construct: function(elements, bounds, maxHeight, maxWidth, way, facade){				this.elements = elements;				this.bounds = bounds;				this.maxHeight = maxHeight;				this.maxWidth = maxWidth;				this.way = way;				this.facade = facade;				this.orgPos = [];			},			setBounds: function(shape, maxSize) {				if(!maxSize)					maxSize = {width: ORYX.CONFIG.MAXIMUM_SIZE, height: ORYX.CONFIG.MAXIMUM_SIZE};				if(!shape.bounds) { throw "Bounds not definined." }								var newBounds = {                    a: {x: shape.bounds.upperLeft().x - (this.maxWidth - shape.bounds.width())/2,                        y: shape.bounds.upperLeft().y - (this.maxHeight - shape.bounds.height())/2},                    b: {x: shape.bounds.lowerRight().x + (this.maxWidth - shape.bounds.width())/2,                        y: shape.bounds.lowerRight().y + (this.maxHeight - shape.bounds.height())/2}	            }								/* If the new width of shape exceeds the maximum width, set width value to maximum. */				if(this.maxWidth > maxSize.width) {					newBounds.a.x = shape.bounds.upperLeft().x - 									(maxSize.width - shape.bounds.width())/2;										newBounds.b.x =	shape.bounds.lowerRight().x + (maxSize.width - shape.bounds.width())/2				}								/* If the new height of shape exceeds the maximum height, set height value to maximum. */				if(this.maxHeight > maxSize.height) {					newBounds.a.y = shape.bounds.upperLeft().y - 									(maxSize.height - shape.bounds.height())/2;										newBounds.b.y =	shape.bounds.lowerRight().y + (maxSize.height - shape.bounds.height())/2				}								/* set bounds of shape */				shape.bounds.set(newBounds);							},						execute: function(){				// align each shape according to the way that was specified.				this.elements.each(function(shape, index) {					this.orgPos[index] = shape.bounds.upperLeft();										var relBounds = this.bounds.clone();					if (shape.parent && !(shape.parent instanceof ORYX.Core.Canvas) ) {						var upL = shape.parent.absoluteBounds().upperLeft();						relBounds.moveBy(-upL.x, -upL.y);					}										switch (this.way) {						// align the shapes in the requested way.						case ORYX.CONFIG.EDITOR_ALIGN_BOTTOM:			                shape.bounds.moveTo({								x: shape.bounds.upperLeft().x,								y: relBounds.b.y - shape.bounds.height()							}); break;						        case ORYX.CONFIG.EDITOR_ALIGN_MIDDLE:			                shape.bounds.moveTo({								x: shape.bounds.upperLeft().x,								y: (relBounds.a.y + relBounds.b.y - shape.bounds.height()) / 2							}); break;						        case ORYX.CONFIG.EDITOR_ALIGN_TOP:			                shape.bounds.moveTo({								x: shape.bounds.upperLeft().x,								y: relBounds.a.y							}); break;						        case ORYX.CONFIG.EDITOR_ALIGN_LEFT:			                shape.bounds.moveTo({								x: relBounds.a.x,								y: shape.bounds.upperLeft().y							}); break;						        case ORYX.CONFIG.EDITOR_ALIGN_CENTER:			                shape.bounds.moveTo({								x: (relBounds.a.x + relBounds.b.x - shape.bounds.width()) / 2,								y: shape.bounds.upperLeft().y							}); break;						        case ORYX.CONFIG.EDITOR_ALIGN_RIGHT:			                shape.bounds.moveTo({								x: relBounds.b.x - shape.bounds.width(),								y: shape.bounds.upperLeft().y							}); break;													case ORYX.CONFIG.EDITOR_ALIGN_SIZE:							if(shape.isResizable) {								this.orgPos[index] = {a: shape.bounds.upperLeft(), b: shape.bounds.lowerRight()};								this.setBounds(shape, shape.maximumSize);							}							break;					}					//shape.update()				}.bind(this));						this.facade.getCanvas().update();								this.facade.updateSelection();			},			rollback: function(){				this.elements.each(function(shape, index) {					if (this.way == ORYX.CONFIG.EDITOR_ALIGN_SIZE) {						if(shape.isResizable) {shape.bounds.set(this.orgPos[index]);}					} else {shape.bounds.moveTo(this.orgPos[index]);}				}.bind(this));								this.facade.getCanvas().update();								this.facade.updateSelection();			}		})				var command = new commandClass(elements, bounds, maxHeight, maxWidth, parseInt(way), this.facade);				this.facade.executeCommands([command]);		}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.Grouping = Clazz.extend({	facade: undefined,	construct: function(facade) {		this.facade = facade;		this.facade.offer({			'name':ORYX.I18N.Grouping.group,			'functionality': this.createGroup.bind(this),			'group': ORYX.I18N.Grouping.grouping,			'icon': ORYX.PATH + "images/shape_group.png",			'description': ORYX.I18N.Grouping.groupDesc,			'index': 1,			'minShape': 2,			'isEnabled': this.isEnabled.bind(this, false)});		this.facade.offer({			'name':ORYX.I18N.Grouping.ungroup,			'functionality': this.deleteGroup.bind(this),			'group': ORYX.I18N.Grouping.grouping,			'icon': ORYX.PATH + "images/shape_ungroup.png",			'description': ORYX.I18N.Grouping.ungroupDesc,			'index': 2,			'minShape': 2,			'isEnabled': this.isEnabled.bind(this, true)});					this.selectedElements = [];		this.groups = [];	},	isEnabled: function(handles) {				var selectedEl = this.selectedElements;		return	handles === this.groups.any(function(group) {					return 		group.length === selectedEl.length &&								group.all(function(grEl) { return selectedEl.member(grEl)})								});	},	onSelectionChanged: function(event) {		// Get the new selection		var newSelection = event.elements;				// Find all groups with these selection		this.selectedElements = this.groups.findAll(function(group) {				return group.any(function(grEl) { return newSelection.member(grEl)})		});				// Add the selection to them		this.selectedElements.push(newSelection)				// Do all in one level and unique		this.selectedElements = this.selectedElements.flatten().uniq();				// If there are more element, set new selection in the editor		if(this.selectedElements.length !== newSelection.length) {			this.facade.setSelection(this.selectedElements);		}	},		createGroup: function() {			var selectedElements = this.facade.getSelection();				var commandClass = ORYX.Core.Command.extend({			construct: function(selectedElements, groups, setGroupsCB, facade){				this.selectedElements = selectedElements;				this.groups = groups;				this.callback = setGroupsCB;				this.facade = facade;			},						execute: function(){				var g = this.groups.findAll(function(group) {					return !group.any(function(grEl) { return selectedElements.member(grEl)})				});								g.push(selectedElements);				this.callback(g.clone());								this.facade.setSelection(this.selectedElements);			},			rollback: function(){				this.callback(this.groups.clone());								this.facade.setSelection(this.selectedElements);			}		})				var command = new commandClass(selectedElements, this.groups.clone(), this.setGroups.bind(this), this.facade);				this.facade.executeCommands([command]);	},		deleteGroup: function() {				var selectedElements = this.facade.getSelection();				var commandClass = ORYX.Core.Command.extend({			construct: function(selectedElements, groups, setGroupsCB, facade){				this.selectedElements = selectedElements;				this.groups = groups;				this.callback = setGroupsCB;				this.facade = facade;			},						execute: function(){				// Delete all groups where all these elements are member and where the elements length the same				var groupPartition = this.groups.partition(function(group) {						return 		group.length !== selectedElements.length ||									!group.all(function(grEl) { return selectedElements.member(grEl)})					});				this.callback(groupPartition[0]);								this.facade.setSelection(this.selectedElements);			},			rollback: function(){				this.callback(this.groups.clone());								this.facade.setSelection(this.selectedElements);			}		})				var command = new commandClass(selectedElements, this.groups.clone(), this.setGroups.bind(this), this.facade);				this.facade.executeCommands([command]);		},		setGroups: function(groups) {		this.groups = groups;	}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object(); ORYX.Plugins.ShapeHighlighting = Clazz.extend({	construct: function(facade) {				this.parentNode = facade.getCanvas().getSvgContainer();				// The parent Node		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parentNode,					['g']);		this.highlightNodes = {};				facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, this.setHighlight.bind(this));		facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, this.hideHighlight.bind(this));			},	setHighlight: function(options) {		if(options && options.highlightId){			var node = this.highlightNodes[options.highlightId];						if(!node){				node= ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,					['path', {						"stroke-width": 2.0, "fill":"none"						}]);								this.highlightNodes[options.highlightId] = node;			}			if(options.elements && options.elements.length > 0) {								this.setAttributesByStyle( node, options );				this.show(node);						} else {							this.hide(node);									}					}	},		hideHighlight: function(options) {		if(options && options.highlightId && this.highlightNodes[options.highlightId]){			this.hide(this.highlightNodes[options.highlightId]);		}			},		hide: function(node) {		node.setAttributeNS(null, 'display', 'none');	},	show: function(node) {		node.setAttributeNS(null, 'display', '');	},		setAttributesByStyle: function( node, options ){				// If the style say, that it should look like a rectangle		if( options.style && options.style == ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE ){						// Set like this			var bo = options.elements[0].absoluteBounds();						var strWidth = options.strokewidth ? options.strokewidth 	: ORYX.CONFIG.BORDER_OFFSET						node.setAttributeNS(null, "d", this.getPathRectangle( bo.a, bo.b , strWidth ) );			node.setAttributeNS(null, "stroke", 		options.color 		? options.color 		: ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity 	? options.opacity 		: 0.2);			node.setAttributeNS(null, "stroke-width", 	strWidth);								} else if(options.elements.length == 1 					&& options.elements[0] instanceof ORYX.Core.Edge &&					options.highlightId != "selection") {						/* Highlight containment of edge's childs */			node.setAttributeNS(null, "d", this.getPathEdge(options.elements[0].dockers));			node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);			node.setAttributeNS(null, "stroke-width", 	ORYX.CONFIG.OFFSET_EDGE_BOUNDS);					}else {			// If not, set just the corners			node.setAttributeNS(null, "d", this.getPathByElements(options.elements));			node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 1.0);			node.setAttributeNS(null, "stroke-width", 	options.strokewidth ? options.strokewidth 	: 2.0);								}	},		getPathByElements: function(elements){		if(!elements || elements.length <= 0) {return undefined}				// Get the padding and the size		var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;				var path = ""				// Get thru all Elements		elements.each((function(element) {			if(!element) {return}			// Get the absolute Bounds and the two Points			var bounds = element.absoluteBounds();			bounds.widen(padding)			var a = bounds.upperLeft();			var b = bounds.lowerRight();						path = path + this.getPath(a ,b);														}).bind(this));		return path;			},	getPath: function(a, b){						return this.getPathCorners(a, b);		},				getPathCorners: function(a, b){		var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;						var path = ""		// Set: Upper left 		path = path + "M" + a.x + " " + (a.y + size) + " l0 -" + size + " l" + size + " 0 ";		// Set: Lower left		path = path + "M" + a.x + " " + (b.y - size) + " l0 " + size + " l" + size + " 0 ";		// Set: Lower right		path = path + "M" + b.x + " " + (b.y - size) + " l0 " + size + " l-" + size + " 0 ";		// Set: Upper right		path = path + "M" + b.x + " " + (a.y + size) + " l0 -" + size + " l-" + size + " 0 ";				return path;	},		getPathRectangle: function(a, b, strokeWidth){		var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;		var path 	= ""		var offset 	= strokeWidth / 2.0;		 		// Set: Upper left 		path = path + "M" + (a.x + offset) + " " + (a.y);		path = path + " L" + (a.x + offset) + " " + (b.y - offset);		path = path + " L" + (b.x - offset) + " " + (b.y - offset);		path = path + " L" + (b.x - offset) + " " + (a.y + offset);		path = path + " L" + (a.x + offset) + " " + (a.y + offset);		return path;	},		getPathEdge: function(edgeDockers) {		var length = edgeDockers.length;		var path = "M" + edgeDockers[0].bounds.center().x + " " 					+  edgeDockers[0].bounds.center().y;				for(i=1; i<length; i++) {			var dockerPoint = edgeDockers[i].bounds.center();			path = path + " L" + dockerPoint.x + " " +  dockerPoint.y;		}				return path;	}	}); ORYX.Plugins.HighlightingSelectedShapes = Clazz.extend({	construct: function(facade) {		this.facade = facade;		this.opacityFull = 0.9;		this.opacityLow = 0.4;		// Register on Dragging-Events for show/hide of ShapeMenu		//this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START, this.hide.bind(this));		//this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,  this.show.bind(this));			},	/**	 * On the Selection-Changed	 *	 */	onSelectionChanged: function(event) {		if(event.elements && event.elements.length > 1) {			this.facade.raiseEvent({										type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 										highlightId:'selection',										elements:	event.elements.without(event.subSelection),										color:		ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,										opacity: 	!event.subSelection ? this.opacityFull : this.opacityLow									});			if(event.subSelection){				this.facade.raiseEvent({											type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 											highlightId:'subselection',											elements:	[event.subSelection],											color:		ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,											opacity: 	this.opacityFull										});				} else {				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'subselection'});							}											} else {			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'selection'});			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'subselection'});		}			}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.DragDocker = Clazz.extend({	/**	 *	Constructor	 *	@param {Object} Facade: The Facade of the Editor	 */	construct: function(facade) {		this.facade = facade;				// Set the valid and invalid color		this.VALIDCOLOR 	= ORYX.CONFIG.SELECTION_VALID_COLOR;		this.INVALIDCOLOR 	= ORYX.CONFIG.SELECTION_INVALID_COLOR;				// Define Variables 		this.shapeSelection = undefined;		this.docker 		= undefined;		this.dockerParent   = undefined;		this.dockerSource 	= undefined;		this.dockerTarget 	= undefined;		this.lastUIObj 		= undefined;		this.isStartDocker 	= undefined;		this.isEndDocker 	= undefined;		this.undockTreshold	= 10;		this.initialDockerPosition = undefined;		this.outerDockerNotMoved = undefined;		this.isValid 		= false;				// For the Drag and Drop		// Register on MouseDown-Event on a Docker		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG, this.handleDockerDrag.bind(this));				// Register on over/out to show / hide a docker		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));							},		/**	 * MouseOut Handler	 *	 */	handleMouseOut: function(event, uiObj) {		// If there is a Docker, hide this		if(!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {			uiObj.hide()			} else if(!this.docker && uiObj instanceof ORYX.Core.Edge) {			uiObj.dockers.each(function(docker){				docker.hide();			})		}	},	/**	 * MouseOver Handler	 *	 */	handleMouseOver: function(event, uiObj) {		// If there is a Docker, show this				if(!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {			uiObj.show()			} else if(!this.docker && uiObj instanceof ORYX.Core.Edge) {			uiObj.dockers.each(function(docker){				docker.show();			})		}	},	/**	 * DockerDrag Handler	 * delegates the uiEvent of the drag event to the mouseDown function	 */	handleDockerDrag: function(event, uiObj) {		this.handleMouseDown(event.uiEvent, uiObj);	},		/**	 * MouseDown Handler	 *	 */		handleMouseDown: function(event, uiObj) {		// If there is a Docker		if(uiObj instanceof ORYX.Core.Controls.Docker && uiObj.isMovable) {						/* Buffering shape selection and clear selection*/			this.shapeSelection = this.facade.getSelection();			this.facade.setSelection();						this.docker = uiObj;			this.initialDockerPosition = this.docker.bounds.center();			this.outerDockerNotMoved = false;						this.dockerParent = uiObj.parent;						// Define command arguments			this._commandArg = {docker:uiObj, dockedShape:uiObj.getDockedShape(), refPoint:uiObj.referencePoint || uiObj.bounds.center()};			// Show the Docker			this.docker.show();						// If the Dockers Parent is an Edge, 			//  and the Docker is either the first or last Docker of the Edge			if(uiObj.parent instanceof ORYX.Core.Edge && 			   	(uiObj.parent.dockers.first() == uiObj || uiObj.parent.dockers.last() == uiObj)) {								// Get the Edge Source or Target				if(uiObj.parent.dockers.first() == uiObj && uiObj.parent.dockers.last().getDockedShape()) {					this.dockerTarget = uiObj.parent.dockers.last().getDockedShape()				} else if(uiObj.parent.dockers.last() == uiObj && uiObj.parent.dockers.first().getDockedShape()) {					this.dockerSource = uiObj.parent.dockers.first().getDockedShape()				}							} else {				// If there parent is not an Edge, undefined the Source and Target				this.dockerSource = undefined;				this.dockerTarget = undefined;							}					this.isStartDocker = this.docker.parent.dockers.first() === this.docker			this.isEndDocker = this.docker.parent.dockers.last() === this.docker								// add to canvas while dragging			this.facade.getCanvas().add(this.docker.parent);						// Hide all Labels from Docker			this.docker.parent.getLabels().each(function(label) {				label.hide();			});						// Undocked the Docker from current Shape			if ((!this.isStartDocker && !this.isEndDocker) || !this.docker.isDocked()) {								this.docker.setDockedShape(undefined)				// Set the Docker to the center of the mouse pointer				var evPos = this.facade.eventCoordinates(event);				this.docker.bounds.centerMoveTo(evPos);				//this.docker.update()				//this.facade.getCanvas().update();				this.dockerParent._update();			} else {				this.outerDockerNotMoved = true;			}						var option = {movedCallback: this.dockerMoved.bind(this), upCallback: this.dockerMovedFinished.bind(this)}							// Enable the Docker for Drag'n'Drop, give the mouseMove and mouseUp-Callback with			ORYX.Core.UIEnableDrag(event, uiObj, option);		}	},		/**	 * Docker MouseMove Handler	 *	 */	dockerMoved: function(event) {		this.outerDockerNotMoved = false;		var snapToMagnet = undefined;				if (this.docker.parent) {			if (this.isStartDocker || this.isEndDocker) {							// Get the EventPosition and all Shapes on these point				var evPos = this.facade.eventCoordinates(event);								if(this.docker.isDocked()) {					/* Only consider start/end dockers if they are moved over a treshold */					var distanceDockerPointer = 						ORYX.Core.Math.getDistancePointToPoint(evPos, this.initialDockerPosition);					if(distanceDockerPointer < this.undockTreshold) {						this.outerDockerNotMoved = true;						return;					}										/* Undock the docker */					this.docker.setDockedShape(undefined)					// Set the Docker to the center of the mouse pointer					//this.docker.bounds.centerMoveTo(evPos);					this.dockerParent._update();				}								var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);								// Get the top level Shape on these, but not the same as Dockers parent				var uiObj = shapes.pop();				if (this.docker.parent === uiObj) {					uiObj = shapes.pop();				}																// If the top level Shape the same as the last Shape, then return				if (this.lastUIObj == uiObj) {				//return;								// If the top level uiObj instance of Shape and this isn't the parent of the docker 				}				else 					if (uiObj instanceof ORYX.Core.Shape) {											// Get the StencilSet of the Edge						var sset = this.docker.parent.getStencil().stencilSet();												// Ask by the StencilSet if the source, the edge and the target valid connections.						if (this.docker.parent instanceof ORYX.Core.Edge) {														var highestParent = this.getHighestParentBeforeCanvas(uiObj);							/* Ensure that the shape to dock is not a child shape 							 * of the same edge.							 */							if(highestParent instanceof ORYX.Core.Edge 									&& this.docker.parent === highestParent) {								this.isValid = false;								this.dockerParent._update();								return;							}							this.isValid = false;							var curObj = uiObj, orgObj = uiObj;							while(!this.isValid && curObj && !(curObj instanceof ORYX.Core.Canvas)){								uiObj = curObj;								this.isValid = this.facade.getRules().canConnect({											sourceShape: this.dockerSource ? // Is there a docked source 															this.dockerSource : // than set this															(this.isStartDocker ? // if not and if the Docker is the start docker																uiObj : // take the last uiObj																undefined), // if not set it to undefined;											edgeShape: this.docker.parent,											targetShape: this.dockerTarget ? // Is there a docked target 											this.dockerTarget : // than set this														(this.isEndDocker ? // if not and if the Docker is not the start docker															uiObj : // take the last uiObj															undefined) // if not set it to undefined;										});								curObj = curObj.parent;							}														// Reset uiObj if no 							// valid parent is found							if (!this.isValid){								uiObj = orgObj;							}						}						else {							this.isValid = this.facade.getRules().canConnect({								sourceShape: uiObj,								edgeShape: this.docker.parent,								targetShape: this.docker.parent							});						}												// If there is a lastUIObj, hide the magnets						if (this.lastUIObj) {							this.hideMagnets(this.lastUIObj)						}												// If there is a valid connection, show the magnets						if (this.isValid) {							this.showMagnets(uiObj)						}												// Set the Highlight Rectangle by these value						this.showHighlight(uiObj, this.isValid ? this.VALIDCOLOR : this.INVALIDCOLOR);												// Buffer the current Shape						this.lastUIObj = uiObj;					}					else {						// If there is no top level Shape, then hide the highligting of the last Shape						this.hideHighlight();						this.lastUIObj ? this.hideMagnets(this.lastUIObj) : null;						this.lastUIObj = undefined;						this.isValid = false;					}								// Snap to the nearest Magnet				if (this.lastUIObj && this.isValid && !(event.shiftKey || event.ctrlKey)) {					snapToMagnet = this.lastUIObj.magnets.find(function(magnet){						return magnet.absoluteBounds().isIncluded(evPos)					});										if (snapToMagnet) {						this.docker.bounds.centerMoveTo(snapToMagnet.absoluteCenterXY());					//this.docker.update()					}				}			}		}		// Snap to on the nearest Docker of the same parent		if(!(event.shiftKey || event.ctrlKey) && !snapToMagnet) {			var minOffset = ORYX.CONFIG.DOCKER_SNAP_OFFSET;			var nearestX = minOffset + 1			var nearestY = minOffset + 1						var dockerCenter = this.docker.bounds.center();						if (this.docker.parent) {								this.docker.parent.dockers.each((function(docker){					if (this.docker == docker) {						return					};										var center = docker.referencePoint ? docker.getAbsoluteReferencePoint() : docker.bounds.center();										nearestX = Math.abs(nearestX) > Math.abs(center.x - dockerCenter.x) ? center.x - dockerCenter.x : nearestX;					nearestY = Math.abs(nearestY) > Math.abs(center.y - dockerCenter.y) ? center.y - dockerCenter.y : nearestY;														}).bind(this));								if (Math.abs(nearestX) < minOffset || Math.abs(nearestY) < minOffset) {					nearestX = Math.abs(nearestX) < minOffset ? nearestX : 0;					nearestY = Math.abs(nearestY) < minOffset ? nearestY : 0;										this.docker.bounds.centerMoveTo(dockerCenter.x + nearestX, dockerCenter.y + nearestY);					//this.docker.update()				} else {																				var previous = this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker)-1, 0)]					var next = this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker)+1, this.docker.parent.dockers.length-1)]										if (previous && next && previous !== this.docker && next !== this.docker){						var cp = previous.bounds.center();						var cn = next.bounds.center();						var cd = this.docker.bounds.center();												// Checks if the point is on the line between previous and next						if (ORYX.Core.Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 10)) {							// Get the rise							var raise = (Number(cn.y)-Number(cp.y))/(Number(cn.x)-Number(cp.x));							// Calculate the intersection point							var intersecX = ((cp.y-(cp.x*raise))-(cd.y-(cd.x*(-Math.pow(raise,-1)))))/((-Math.pow(raise,-1))-raise);							var intersecY = (cp.y-(cp.x*raise))+(raise*intersecX);														if(isNaN(intersecX) || isNaN(intersecY)) {return;}														this.docker.bounds.centerMoveTo(intersecX, intersecY);						}					}									}			}		}		//this.facade.getCanvas().update();		this.dockerParent._update();	},	/**	 * Docker MouseUp Handler	 *	 */	dockerMovedFinished: function(event) {				/* Reset to buffered shape selection */		this.facade.setSelection(this.shapeSelection);				// Hide the border		this.hideHighlight();				// Show all Labels from Docker		this.dockerParent.getLabels().each(function(label){			label.show();			//label.update();		});			// If there is a last top level Shape		if(this.lastUIObj && (this.isStartDocker || this.isEndDocker)){							// If there is a valid connection, the set as a docked Shape to them			if(this.isValid) {								this.docker.setDockedShape(this.lastUIObj);									this.facade.raiseEvent({					type 	:ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED, 					docker	: this.docker,					parent	: this.docker.parent,					target	: this.lastUIObj				});			}						this.hideMagnets(this.lastUIObj)		}				// Hide the Docker		this.docker.hide();				if(this.outerDockerNotMoved) {			// Get the EventPosition and all Shapes on these point			var evPos = this.facade.eventCoordinates(event);			var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);						/* Remove edges from selection */			var shapeWithoutEdges = shapes.findAll(function(node) {				return node instanceof ORYX.Core.Node;			});			shapes = shapeWithoutEdges.length ? shapeWithoutEdges : shapes;			this.facade.setSelection(shapes);		} else {			//Command-Pattern for dragging one docker			var dragDockerCommand = ORYX.Core.Command.extend({				construct: function(docker, newPos, oldPos, newDockedShape, oldDockedShape, facade){					this.docker 		= docker;					this.index			= docker.parent.dockers.indexOf(docker);					this.newPosition	= newPos;					this.newDockedShape = newDockedShape;					this.oldPosition	= oldPos;					this.oldDockedShape	= oldDockedShape;					this.facade			= facade;					this.index			= docker.parent.dockers.indexOf(docker);					this.shape			= docker.parent;									},							execute: function(){					if (!this.docker.parent){						this.docker = this.shape.dockers[this.index];					}					this.dock( this.newDockedShape, this.newPosition );					this.removedDockers = this.shape.removeUnusedDockers();					this.facade.updateSelection();				},				rollback: function(){					this.dock( this.oldDockedShape, this.oldPosition );					(this.removedDockers||$H({})).each(function(d){						this.shape.add(d.value, Number(d.key));						this.shape._update(true);					}.bind(this))					this.facade.updateSelection();				},				dock:function( toDockShape, pos ){								// Set the Docker to the new Shape					this.docker.setDockedShape( undefined );					if( toDockShape ){									this.docker.setDockedShape( toDockShape );							this.docker.setReferencePoint( pos );						//this.docker.update();							//this.docker.parent._update();									} else {						this.docker.bounds.centerMoveTo( pos );					}						this.facade.getCanvas().update();																													}			});									if (this.docker.parent){				// Instanziate the dockCommand				var command = new dragDockerCommand(this.docker, this.docker.getDockedShape() ? this.docker.referencePoint : this.docker.bounds.center(), this._commandArg.refPoint, this.docker.getDockedShape(), this._commandArg.dockedShape, this.facade);				this.facade.executeCommands( [command] );				}		}							// Update all Shapes		//this.facade.updateSelection();					// Undefined all variables		this.docker 		= undefined;		this.dockerParent   = undefined;		this.dockerSource 	= undefined;		this.dockerTarget 	= undefined;			this.lastUIObj 		= undefined;			},		/**	 * Hide the highlighting	 */	hideHighlight: function() {		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'validDockedShape'});	},	/**	 * Show the highlighting	 *	 */	showHighlight: function(uiObj, color) {				this.facade.raiseEvent({										type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 										highlightId:'validDockedShape',										elements:	[uiObj],										color:		color									});	},		showMagnets: function(uiObj){		uiObj.magnets.each(function(magnet) {			magnet.show();		});	},		hideMagnets: function(uiObj){		uiObj.magnets.each(function(magnet) {			magnet.hide();		});	},		getHighestParentBeforeCanvas: function(shape) {		if(!(shape instanceof ORYX.Core.Shape)) {return undefined;}				var parent = shape.parent;		while(parent && !(parent.parent instanceof ORYX.Core.Canvas)) {			parent = parent.parent;		}					return parent;			}	});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.AddDocker = Clazz.extend({	/**	 *	Constructor	 *	@param {Object} Facade: The Facade of the Editor	 */	construct: function(facade) {		this.facade = facade;		this.facade.offer({			'name':ORYX.I18N.AddDocker.add,			'functionality': this.enableAddDocker.bind(this),			'group': ORYX.I18N.AddDocker.group,			'icon': ORYX.PATH + "images/vector_add.png",			'description': ORYX.I18N.AddDocker.addDesc,			'index': 1,            'toggle': true,			'minShape': 0,			'maxShape': 0});		this.facade.offer({			'name':ORYX.I18N.AddDocker.del,			'functionality': this.enableDeleteDocker.bind(this),			'group': ORYX.I18N.AddDocker.group,			'icon': ORYX.PATH + "images/vector_delete.png",			'description': ORYX.I18N.AddDocker.delDesc,			'index': 2,            'toggle': true,			'minShape': 0,			'maxShape': 0});				this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));	},		enableAddDocker: function(button, pressed) {        //FIXME This should be done while construct, but this isn't possible right now!        this.addDockerButton = button;                // Unpress deleteDockerButton        if(pressed && this.deleteDockerButton)            this.deleteDockerButton.toggle(false);	},    enableDeleteDocker: function(button, pressed) {        //FIXME This should be done while construct, but this isn't possible right now!        this.deleteDockerButton = button;                // Unpress addDockerButton        if(pressed && this.addDockerButton)            this.addDockerButton.toggle(false);    },        enabledAdd: function(){        return this.addDockerButton ? this.addDockerButton.pressed : false;    },    enabledDelete: function(){        return this.deleteDockerButton ? this.deleteDockerButton.pressed : false;    },		/**	 * MouseDown Handler	 *	 */		handleMouseDown: function(event, uiObj) {		if (this.enabledAdd() && uiObj instanceof ORYX.Core.Edge) {            this.newDockerCommand({                edge: uiObj,                position: this.facade.eventCoordinates(event)            });		} else if (this.enabledDelete() &&				   uiObj instanceof ORYX.Core.Controls.Docker &&				   uiObj.parent instanceof ORYX.Core.Edge) {            this.newDockerCommand({                edge: uiObj.parent,                docker: uiObj            });		} else if ( this.enabledAdd() ){            this.addDockerButton.toggle(false);        } else if ( this.enabledDelete() ) {            this.deleteDockerButton.toggle(false);        }	},        // Options: edge (required), position (required if add), docker (required if delete)    newDockerCommand: function(options){        if(!options.edge)            return;        var commandClass = ORYX.Core.Command.extend({            construct: function(addEnabled, deleteEnabled, edge, docker, pos, facade){                this.addEnabled = addEnabled;                this.deleteEnabled = deleteEnabled;                this.edge = edge;                this.docker = docker;                this.pos = pos;                this.facade = facade;				//this.index = docker.parent.dockers.indexOf(docker);            },            execute: function(){                if (this.addEnabled) {                        this.docker = this.edge.addDocker(this.pos, this.docker);						this.index = this.edge.dockers.indexOf(this.docker);                }                else if (this.deleteEnabled) {					this.index = this.edge.dockers.indexOf(this.docker);                    this.pos = this.docker.bounds.center();                    this.edge.removeDocker(this.docker);                }                                this.facade.getCanvas().update();                this.facade.updateSelection();            },            rollback: function(){                if (this.addEnabled) {                    if (this.docker instanceof ORYX.Core.Controls.Docker) {                        this.edge.removeDocker(this.docker);                    }                }                else if (this.deleteEnabled) {                    this.edge.add(this.docker, this.index);                }                                this.facade.getCanvas().update();                this.facade.updateSelection();            }        })                var command = new commandClass(this.enabledAdd(), this.enabledDelete(), options.edge, options.docker, options.position, this.facade);                this.facade.executeCommands([command]);    }});/**
 * Copyright (c) 2010
 * Robert Böhme, Philipp Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.DockerCreation = Clazz.extend({
	
	construct: function( facade ){
		this.facade = facade;		
		this.active = false; //true-> a ghostdocker is shown; false->ghostdocker is hidden

		//visual representation of the Ghostdocker
		this.circle = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,
				['g', {"pointer-events":"none"},
					['circle', {cx: "8", cy: "8", r: "3", fill:"yellow"}]]); 	
		
		//Event registrations
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this));
		/*
		 * Double click is reserved for label access, so abort action
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)}.bind(this));
		/*
		 * click is reserved for selecting, so abort action when mouse goes up
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)}.bind(this));

	},
	
	/**
	 * MouseOut Handler
	 * 
	 *hide the Ghostpoint when Leaving the mouse from an edge
	 */
	handleMouseOut: function(event, uiObj) {
		
		if (this.active) {		
			this.hideOverlay();
			this.active = false;
		}	
	},
	
	/**
	 * MouseOver Handler
	 * 
	 *show the Ghostpoint if the edge is selected
	 */
	handleMouseOver: function(event, uiObj) {
		//show the Ghostdocker on the edge
		if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			this.showOverlay(uiObj, this.facade.eventCoordinates(event));
		}
		//ghostdocker is active
		this.active = true;
		
	},
	
	/**
	 * MouseDown Handler
	 * 
	 *create a Docker when clicking on a selected edge
	 */
	handleMouseDown: function(event, uiObj) {	
		if (event.which==1 && uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			//Timer for Doubleclick to be able to create a label
			window.clearTimeout(this.timer);
			
			this.timer = window.setTimeout(function () {
				// Give the event to enable one click creation and drag
				this.addDockerCommand({
		            edge: uiObj,
					event: event,
		            position: this.facade.eventCoordinates(event)
		        });
	
			}.bind(this),200);
			this.hideOverlay();
	
		}
	},
	
	/**
	 * MouseMove Handler
	 * 
	 *refresh the ghostpoint when moving the mouse over an edge
	 */
	handleMouseMove: function(event, uiObj) {		
			if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
				if (this.active) {	
					//refresh Ghostpoint
					this.hideOverlay();			
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));
				}else{
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));	
				}		
			}	
	},
	
	/**
	 * returns true if the edge is docked to at least one node
	 */
	isEdgeDocked: function(edge){
		return !!(edge.incoming.length || edge.outgoing.length);
	},
	
	
	/**
	 * Command for creating a new Docker
	 * 
	 * @param {Object} options
	 */
	addDockerCommand: function(options){
	    if(!options.edge)
	        return;
	    
	    var commandClass = ORYX.Core.Command.extend({
	        construct: function(edge, docker, pos, facade, options){            
	            this.edge = edge;
	            this.docker = docker;
	            this.pos = pos;
	            this.facade = facade;
				this.options= options;
	        },
	        execute: function(){
	            this.docker = this.edge.addDocker(this.pos, this.docker);
				this.index = this.edge.dockers.indexOf(this.docker);                                    
	            this.facade.getCanvas().update();
	            this.facade.updateSelection();
	            this.options.docker=this.docker;
	
	        },
	        rollback: function(){
	          
	             if (this.docker instanceof ORYX.Core.Controls.Docker) {
	                    this.edge.removeDocker(this.docker);
	             }             
	            this.facade.getCanvas().update();
	            this.facade.updateSelection(); 
	        }
	    });
	    var command = new commandClass(options.edge, options.docker, options.position, this.facade, options);    
	    this.facade.executeCommands([command]);
	
	    
		this.facade.raiseEvent({
			uiEvent:	options.event,
			type:		ORYX.CONFIG.EVENT_DOCKERDRAG}, options.docker );
	    
	},
	
	/**
	 *show the ghostpoint overlay
	 *
	 *@param {Shape} edge
	 *@param {Point} point
	 */
	showOverlay: function(edge, point){
		var best = point;
		var pair = [0,1];
		var min_distance = Infinity;
	
		// calculate the optimal point ON THE EDGE to display the docker
		for (var i=0, l=edge.dockers.length; i < l-1; i++) {
			var intersection_point = ORYX.Core.Math.getPointOfIntersectionPointLine(
				edge.dockers[i].bounds.center(),
				edge.dockers[i+1].bounds.center(),
				point,
				true // consider only the current segment instead of the whole line ("Strecke, statt Gerade") for distance calculation
			);
			
			
			if(!intersection_point) {
				continue;
			}
	
			var current_distance = ORYX.Core.Math.getDistancePointToPoint(point, intersection_point);
			if (min_distance > current_distance) {
				min_distance = current_distance;
				best = intersection_point;
			}
		}
	
		this.facade.raiseEvent({
				type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
				id: 			"ghostpoint",
				shapes: 		[edge],
				node:			this.circle,
				ghostPoint:		best,
				dontCloneNode:	true
			});			
	},
	
	/**
	 *hide the ghostpoint overlay
	 */
	hideOverlay: function() {
		
		this.facade.raiseEvent({
			type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
			id: "ghostpoint"
		});	
	}

});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();//TODO this one fails when importing a stencilset that is already loaded. Hoewver, since an asynchronous callback throws the error, the user doesn#t recognize it.ORYX.Plugins.SSExtensionLoader = {    /**     *	Constructor     *	@param {Object} Facade: The Facade of the Editor     */    construct: function(facade){        this.facade = facade;                this.facade.offer({            'name': ORYX.I18N.SSExtensionLoader.add,            'functionality': this.addSSExtension.bind(this),            'group': ORYX.I18N.SSExtensionLoader.group,            'icon': ORYX.PATH + "images/add.png",            'description': ORYX.I18N.SSExtensionLoader.addDesc,            'index': 1,            'minShape': 0,            'maxShape': 0        });    },        addSSExtension: function(facade){        this.facade.raiseEvent({            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,            text: ORYX.I18N.SSExtensionLoader.loading        });                var url = ORYX.CONFIG.SS_EXTENSIONS_CONFIG;        //var url = "/oryx/build/stencilsets/extensions/extensions.json";        new Ajax.Request(url, {            method: 'GET',            asynchronous: false,            onSuccess: (function(transport){                            try {                    eval("var jsonObject = " + transport.responseText);                    					var stencilsets = this.facade.getStencilSets();                                        var validExtensions = jsonObject.extensions.findAll(function(extension){                        var stencilset = stencilsets[extension["extends"]];												if(stencilset) return true;						else return false;                    });                                             var loadedExtensions = validExtensions.findAll(function(extension) {                    	return stencilsets.values().any(function(ss) {                     		if(ss.extensions()[extension.namespace]) return true;                    		else return false;                    	})                    });					if (validExtensions.size() == 0)						Ext.Msg.alert(ORYX.I18N.Oryx.title, 						ORYX.I18N.SSExtensionLoader.noExt);					else                     	this._showPanel(validExtensions, loadedExtensions, this._loadExtensions.bind(this));                                    }                 catch (e) {                	console.log(e);                    Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.SSExtensionLoader.failed1);				}                                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });                            }).bind(this),            onFailure: (function(transport){                Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.SSExtensionLoader.failed2);                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });            }).bind(this)        });    },		_loadExtensions: function(extensions) {		var stencilsets = this.facade.getStencilSets();				var atLeastOne = false;				// unload unselected extensions		stencilsets.values().each(function(stencilset) {			var unselected = stencilset.extensions().values().select(function(ext) { return extensions[ext.namespace] == undefined }); 			unselected.each(function(ext) {				stencilset.removeExtension(ext.namespace);				atLeastOne = true;			});		});				// load selected extensions		extensions.each(function(extension) {			var stencilset = stencilsets[extension["extends"]];						if(stencilset) {				stencilset.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER + extension.definition);				atLeastOne = true;			}		}.bind(this));				if (atLeastOne) {			stencilsets.values().each(function(stencilset) {				this.facade.getRules().initializeRules(stencilset);			}.bind(this));			this.facade.raiseEvent({				type: ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,				lazyLoaded : true			});			var selection = this.facade.getSelection();			this.facade.setSelection();			this.facade.setSelection(selection);		}	},        _showPanel: function(validExtensions, loadedExtensions, successCallback){            // Extract the data        var data = [];        validExtensions.each(function(value){            data.push([value.title, value.definition, value["extends"]])        });                // Create a new Selection Model        var sm = new Ext.grid.CheckboxSelectionModel();                // Create a new Grid with a selection box        var grid = new Ext.grid.GridPanel({        	deferRowRender: false,            id: 'oryx_new_stencilset_extention_grid',            store: new Ext.data.SimpleStore({                fields: ['title', 'definition', 'extends']            }),            cm: new Ext.grid.ColumnModel([sm, {                header: ORYX.I18N.SSExtensionLoader.panelTitle,                width: 200,                sortable: true,                dataIndex: 'title'            }]),            sm: sm,            frame: true,            width: 200,            height: 200,            iconCls: 'icon-grid',            listeners: {                "render": function(){                    this.getStore().loadData(data);                    selectItems.defer(1);                }            }        });                function selectItems() {        	// Select loaded extensions    		var selectedRecords = new Array();    		grid.store.each(function(rec) {    			if(loadedExtensions.any(function(ext) { return ext.definition == rec.get('definition') }))    				selectedRecords.push(rec);    		});    		sm.selectRecords(selectedRecords);        }               /* grid.store.on("load", function() {         	console.log("okay");         	grid.getSelectionModel().selectRecords(selectedRecords);        }, this, {delay:500});*/                                // Create a new Panel        var panel = new Ext.Panel({            items: [{                xtype: 'label',                text: ORYX.I18N.SSExtensionLoader.panelText,                style: 'margin:10px;display:block'            }, grid],            frame: true,            buttons: [{                text: ORYX.I18N.SSExtensionLoader.labelImport,                handler: function(){                    var selectionModel = Ext.getCmp('oryx_new_stencilset_extention_grid').getSelectionModel();                    var result = selectionModel.selections.items.collect(function(item){                        return item.data;                    })                    Ext.getCmp('oryx_new_stencilset_extention_window').close();                    successCallback(result);                }.bind(this)            }, {                text: ORYX.I18N.SSExtensionLoader.labelCancel,                handler: function(){                    Ext.getCmp('oryx_new_stencilset_extention_window').close();                }.bind(this)            }]        })                // Create a new Window        var window = new Ext.Window({            id: 'oryx_new_stencilset_extention_window',            width: 227,            title: ORYX.I18N.Oryx.title,            floating: true,            shim: true,            modal: true,            resizable: false,            autoHeight: true,            items: [panel]        })                // Show the window        window.show();            }};ORYX.Plugins.SSExtensionLoader = Clazz.extend(ORYX.Plugins.SSExtensionLoader);/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object(); ORYX.Plugins.SelectionFrame = Clazz.extend({	construct: function(facade) {		this.facade = facade;		// Register on MouseEvents		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.handleMouseUp.bind(this), true);		// Some initiale variables		this.position 		= {x:0, y:0};		this.size 			= {width:0, height:0};		this.offsetPosition = {x: 0, y: 0}		// (Un)Register Mouse-Move Event		this.moveCallback 	= undefined;		this.offsetScroll	= {x:0,y:0}		// HTML-Node of Selection-Frame		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.facade.getCanvas().getHTMLContainer(),			['div', {'class':'Oryx_SelectionFrame'}]);		this.hide();	},	handleMouseDown: function(event, uiObj) {		// If there is the Canvas		if( uiObj instanceof ORYX.Core.Canvas ) {			// Calculate the Offset			var scrollNode = uiObj.rootNode.parentNode.parentNode;									var a = this.facade.getCanvas().node.getScreenCTM();			this.offsetPosition = {				x: a.e,				y: a.f			}			// Set the new Position			this.setPos({x: Event.pointerX(event)-this.offsetPosition.x, y:Event.pointerY(event)-this.offsetPosition.y});			// Reset the size			this.resize({width:0, height:0});			this.moveCallback = this.handleMouseMove.bind(this);					// Register Mouse-Move Event			document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.moveCallback, false);			this.offsetScroll		= {x:scrollNode.scrollLeft,y:scrollNode.scrollTop};						// Show the Frame			this.show();								}		Event.stop(event);	},	handleMouseUp: function(event) {		// If there was an MouseMoving		if(this.moveCallback) {			// Hide the Frame			this.hide();			// Unregister Mouse-Move			document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.moveCallback, false);								this.moveCallback = undefined;			var corrSVG = this.facade.getCanvas().node.getScreenCTM();			// Calculate the positions of the Frame			var a = {				x: this.size.width > 0 ? this.position.x : this.position.x + this.size.width,				y: this.size.height > 0 ? this.position.y : this.position.y + this.size.height			}			var b = {				x: a.x + Math.abs(this.size.width),				y: a.y + Math.abs(this.size.height)			}			// Fit to SVG-Coordinates			a.x /= corrSVG.a; a.y /= corrSVG.d;			b.x /= corrSVG.a; b.y /= corrSVG.d;			// Calculate the elements from the childs of the canvas			var elements = this.facade.getCanvas().getChildShapes(true).findAll(function(value) {				var absBounds = value.absoluteBounds();				var bA = absBounds.upperLeft();				var bB = absBounds.lowerRight();				if(bA.x > a.x && bA.y > a.y && bB.x < b.x && bB.y < b.y)					return true;				return false			});			// Set the selection			this.facade.setSelection(elements);		}	},	handleMouseMove: function(event) {		// Calculate the size		var size = {			width	: Event.pointerX(event) - this.position.x - this.offsetPosition.x,			height	: Event.pointerY(event) - this.position.y - this.offsetPosition.y,		}		var scrollNode 	= this.facade.getCanvas().rootNode.parentNode.parentNode;		size.width 		-= this.offsetScroll.x - scrollNode.scrollLeft; 		size.height 	-= this.offsetScroll.y - scrollNode.scrollTop;								// Set the size		this.resize(size);		Event.stop(event);	},	hide: function() {		this.node.style.display = "none";	},	show: function() {		this.node.style.display = "";	},	setPos: function(pos) {		// Set the Position		this.node.style.top = pos.y + "px";		this.node.style.left = pos.x + "px";		this.position = pos;	},	resize: function(size) {		// Calculate the negative offset		this.setPos(this.position);		this.size = Object.clone(size);				if(size.width < 0) {			this.node.style.left = (this.position.x + size.width) + "px";			size.width = - size.width;		}		if(size.height < 0) {			this.node.style.top = (this.position.y + size.height) + "px";			size.height = - size.height;		}		// Set the size		this.node.style.width = size.width + "px";		this.node.style.height = size.height + "px";	}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object(); ORYX.Plugins.ShapeHighlighting = Clazz.extend({	construct: function(facade) {				this.parentNode = facade.getCanvas().getSvgContainer();				// The parent Node		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parentNode,					['g']);		this.highlightNodes = {};				facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, this.setHighlight.bind(this));		facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, this.hideHighlight.bind(this));			},	setHighlight: function(options) {		if(options && options.highlightId){			var node = this.highlightNodes[options.highlightId];						if(!node){				node= ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,					['path', {						"stroke-width": 2.0, "fill":"none"						}]);								this.highlightNodes[options.highlightId] = node;			}			if(options.elements && options.elements.length > 0) {								this.setAttributesByStyle( node, options );				this.show(node);						} else {							this.hide(node);									}					}	},		hideHighlight: function(options) {		if(options && options.highlightId && this.highlightNodes[options.highlightId]){			this.hide(this.highlightNodes[options.highlightId]);		}			},		hide: function(node) {		node.setAttributeNS(null, 'display', 'none');	},	show: function(node) {		node.setAttributeNS(null, 'display', '');	},		setAttributesByStyle: function( node, options ){				// If the style say, that it should look like a rectangle		if( options.style && options.style == ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE ){						// Set like this			var bo = options.elements[0].absoluteBounds();						var strWidth = options.strokewidth ? options.strokewidth 	: ORYX.CONFIG.BORDER_OFFSET						node.setAttributeNS(null, "d", this.getPathRectangle( bo.a, bo.b , strWidth ) );			node.setAttributeNS(null, "stroke", 		options.color 		? options.color 		: ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity 	? options.opacity 		: 0.2);			node.setAttributeNS(null, "stroke-width", 	strWidth);								} else if(options.elements.length == 1 					&& options.elements[0] instanceof ORYX.Core.Edge &&					options.highlightId != "selection") {						/* Highlight containment of edge's childs */			node.setAttributeNS(null, "d", this.getPathEdge(options.elements[0].dockers));			node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);			node.setAttributeNS(null, "stroke-width", 	ORYX.CONFIG.OFFSET_EDGE_BOUNDS);					}else {			// If not, set just the corners			node.setAttributeNS(null, "d", this.getPathByElements(options.elements));			node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);			node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 1.0);			node.setAttributeNS(null, "stroke-width", 	options.strokewidth ? options.strokewidth 	: 2.0);								}	},		getPathByElements: function(elements){		if(!elements || elements.length <= 0) {return undefined}				// Get the padding and the size		var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;				var path = ""				// Get thru all Elements		elements.each((function(element) {			if(!element) {return}			// Get the absolute Bounds and the two Points			var bounds = element.absoluteBounds();			bounds.widen(padding)			var a = bounds.upperLeft();			var b = bounds.lowerRight();						path = path + this.getPath(a ,b);														}).bind(this));		return path;			},	getPath: function(a, b){						return this.getPathCorners(a, b);		},				getPathCorners: function(a, b){		var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;						var path = ""		// Set: Upper left 		path = path + "M" + a.x + " " + (a.y + size) + " l0 -" + size + " l" + size + " 0 ";		// Set: Lower left		path = path + "M" + a.x + " " + (b.y - size) + " l0 " + size + " l" + size + " 0 ";		// Set: Lower right		path = path + "M" + b.x + " " + (b.y - size) + " l0 " + size + " l-" + size + " 0 ";		// Set: Upper right		path = path + "M" + b.x + " " + (a.y + size) + " l0 -" + size + " l-" + size + " 0 ";				return path;	},		getPathRectangle: function(a, b, strokeWidth){		var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;		var path 	= ""		var offset 	= strokeWidth / 2.0;		 		// Set: Upper left 		path = path + "M" + (a.x + offset) + " " + (a.y);		path = path + " L" + (a.x + offset) + " " + (b.y - offset);		path = path + " L" + (b.x - offset) + " " + (b.y - offset);		path = path + " L" + (b.x - offset) + " " + (a.y + offset);		path = path + " L" + (a.x + offset) + " " + (a.y + offset);		return path;	},		getPathEdge: function(edgeDockers) {		var length = edgeDockers.length;		var path = "M" + edgeDockers[0].bounds.center().x + " " 					+  edgeDockers[0].bounds.center().y;				for(i=1; i<length; i++) {			var dockerPoint = edgeDockers[i].bounds.center();			path = path + " L" + dockerPoint.x + " " +  dockerPoint.y;		}				return path;	}	}); ORYX.Plugins.HighlightingSelectedShapes = Clazz.extend({	construct: function(facade) {		this.facade = facade;		this.opacityFull = 0.9;		this.opacityLow = 0.4;		// Register on Dragging-Events for show/hide of ShapeMenu		//this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START, this.hide.bind(this));		//this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,  this.show.bind(this));			},	/**	 * On the Selection-Changed	 *	 */	onSelectionChanged: function(event) {		if(event.elements && event.elements.length > 1) {			this.facade.raiseEvent({										type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 										highlightId:'selection',										elements:	event.elements.without(event.subSelection),										color:		ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,										opacity: 	!event.subSelection ? this.opacityFull : this.opacityLow									});			if(event.subSelection){				this.facade.raiseEvent({											type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 											highlightId:'subselection',											elements:	[event.subSelection],											color:		ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,											opacity: 	this.opacityFull										});				} else {				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'subselection'});							}											} else {			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'selection'});			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'subselection'});		}			}});/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
 * HOW to USE the OVERLAY PLUGIN:
 * 	You can use it via the event mechanism from the editor
 * 	by using facade.raiseEvent( <option> )
 * 
 * 	As an example please have a look in the overlayexample.js
 * 
 * 	The option object should/have to have following attributes:
 * 
 * 	Key				Value-Type							Description
 * 	================================================================
 * 
 *	type 			ORYX.CONFIG.EVENT_OVERLAY_SHOW | ORYX.CONFIG.EVENT_OVERLAY_HIDE		This is the type of the event	
 *	id				<String>							You have to use an unified id for later on hiding this overlay
 *	shapes 			<ORYX.Core.Shape[]>					The Shapes where the attributes should be changed
 *	attributes 		<Object>							An object with svg-style attributes as key-value pair
 *	node			<SVGElement>						An SVG-Element could be specified for adding this to the Shape
 *	nodePosition	"N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"START"|"END"	The position for the SVG-Element relative to the 
 *														specified Shape. "START" and "END" are just using for a Edges, then
 *														the relation is the start or ending Docker of this edge.
 *	
 * 
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Overlay = Clazz.extend({

    facade: undefined,
	
	styleNode: undefined,
    
    construct: function(facade){
		
        this.facade = facade;

		this.changes = [];

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW, this.show.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE, this.hide.bind(this));	

		this.styleNode = document.createElement('style')
		this.styleNode.setAttributeNS(null, 'type', 'text/css')
		
		document.getElementsByTagName('head')[0].appendChild( this.styleNode )

    },
	
	/**
	 * Show the overlay for specific nodes
	 * @param {Object} options
	 * 
	 * 	String				options.id		- MUST - Define the id of the overlay (is needed for the hiding of this overlay)		
	 *	ORYX.Core.Shape[] 	options.shapes 	- MUST - Define the Shapes for the changes
	 * 	attr-name:value		options.changes	- Defines all the changes which should be shown
	 * 
	 * 
	 */
	show: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.shapes || !options.shapes instanceof Array ||
				!options.id	|| !options.id instanceof String || options.id.length == 0) { 
				
					return
					
		}
		
		//if( this.changes[options.id]){
		//	this.hide( options )
		//}
			

		// Checked if attributes are setted
		if( options.attributes ){
			
			// FOR EACH - Shape
			options.shapes.each(function(el){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.setAttributes( el.node , options.attributes )
				
			}.bind(this))

		}	
		
		var isSVG = true
		try {
			isSVG = options.node && options.node instanceof SVGElement;
		} catch(e){}
		
		// Checks if node is setted and if this is an SVGElement		
		if ( options.node && isSVG) {
			
			options["_temps"] = []
						
			// FOR EACH - Node
			options.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				var _temp = {}
				_temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode( true );
				
				// Add the svg node to the ORYX-Shape
				el.node.firstChild.appendChild( _temp.svg )		
				
				// If
				if (el instanceof ORYX.Core.Edge && !options.nodePosition) {
					options['nodePosition'] = "START"
				}
						
				// If the node position is setted, it has to be transformed
				if( options.nodePosition ){
					
					var b = el.bounds;
					var p = options.nodePosition.toUpperCase();
										
					// Check the values of START and END
					if( el instanceof ORYX.Core.Node && p == "START"){
						p = "NW";
					} else if(el instanceof ORYX.Core.Node && p == "END"){
						p = "SE";
					} else if(el instanceof ORYX.Core.Edge && p == "START"){
						b = el.getDockers().first().bounds
					} else if(el instanceof ORYX.Core.Edge && p == "END"){
						b = el.getDockers().last().bounds
					}

					// Create a callback for the changing the position 
					// depending on the position string
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						
						if( p == "NW" ){
							// Do Nothing
						} else if( p == "N" ) {
							x = b.width() / 2;
						} else if( p == "NE" ) {
							x = b.width();
						} else if( p == "E" ) {
							x = b.width(); y = b.height() / 2;
						} else if( p == "SE" ) {
							x = b.width(); y = b.height();
						} else if( p == "S" ) {
							x = b.width() / 2; y = b.height();
						} else if( p == "SW" ) {
							y = b.height();
						} else if( p == "W" ) {
							y = b.height() / 2;
						} else if( p == "START" || p == "END") {
							x = b.width() / 2; y = b.height() / 2;
						}						
						else {
							return
						}
						
						if( el instanceof ORYX.Core.Edge){
							x  += b.upperLeft().x ; y  += b.upperLeft().y ;
						}
						
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
					
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
					
				}
				
				// Show the ghostpoint
				if(options.ghostPoint){
					var point={x:0, y:0};
					point=options.ghostPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x -7;
						y = point.y -7;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				if(options.labelPoint){
					var point={x:0, y:0};
					point=options.labelPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x;
						y = point.y;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				
				options._temps.push( _temp )	
				
			}.bind(this))
			
			
			
		}		
	

		// Store the changes
		if( !this.changes[options.id] ){
			this.changes[options.id] = [];
		}
		
		this.changes[options.id].push( options );
				
	},
	
	/**
	 * Hide the overlay with the spefic id
	 * @param {Object} options
	 */
	hide: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.id	|| !options.id instanceof String || options.id.length == 0 ||
				!this.changes[options.id]) { 
				
					return
					
		}		
		
		
		// Delete all added attributes
		// FOR EACH - Shape
		this.changes[options.id].each(function(option){
			
			option.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.deleteAttributes( el.node )
							
			}.bind(this));

	
			if( option._temps ){
				
				option._temps.each(function(tmp){
					// Delete the added Node, if there is one
					if( tmp.svg && tmp.svg.parentNode ){
						tmp.svg.parentNode.removeChild( tmp.svg )
					}
		
					// If 
					if( tmp.callback && tmp.element){
						// It has to be unregistered from the edge
						tmp.element.bounds.unregisterCallback( tmp.callback )
					}
							
				}.bind(this))
				
			}
		
			
		}.bind(this));

		
		this.changes[options.id] = null;
		
		
	},
	
	
	/**
	 * Set the given css attributes to that node
	 * @param {HTMLElement} node
	 * @param {Object} attributes
	 */
	setAttributes: function( node, attributes ) {
		
		
		// Get all the childs from ME
		var childs = this.getAllChilds( node.firstChild.firstChild )
		
		var ids = []
		
		// Add all Attributes which have relation to another node in this document and concate the pure id out of it
		// This is for example important for the markers of a edge
		childs.each(function(e){ ids.push( $A(e.attributes).findAll(function(attr){ return attr.nodeValue.startsWith('url(#')}) )})
		ids = ids.flatten().compact();
		ids = ids.collect(function(s){return s.nodeValue}).uniq();
		ids = ids.collect(function(s){return s.slice(5, s.length-1)})
		
		// Add the node ID to the id
		ids.unshift( node.id + ' .me')
		
		var attr				= $H(attributes);
        var attrValue			= attr.toJSON().gsub(',', ';').gsub('"', '');
        var attrMarkerValue		= attributes.stroke ? attrValue.slice(0, attrValue.length-1) + "; fill:" + attributes.stroke + ";}" : attrValue;
        var attrTextValue;
        if( attributes.fill ){
            var copyAttr        = Object.clone(attributes);
        	copyAttr.fill		= "black";
        	attrTextValue		= $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '');
        }
                	
        // Create the CSS-Tags Style out of the ids and the attributes
        csstags = ids.collect(function(s, i){return "#" + s + " * " + (!i? attrValue : attrMarkerValue) + "" + (attrTextValue ? " #" + s + " text * " + attrTextValue : "") })
		
		// Join all the tags
		var s = csstags.join(" ") + "\n" 
		
		// And add to the end of the style tag
		this.styleNode.appendChild(document.createTextNode(s));
		
		
	},
	
	/**
	 * Deletes all attributes which are
	 * added in a special style sheet for that node
	 * @param {HTMLElement} node 
	 */
	deleteAttributes: function( node ) {
				
		// Get all children which contains the node id		
		var delEl = $A(this.styleNode.childNodes)
					 .findAll(function(e){ return e.textContent.include( '#' + node.id ) });
		
		// Remove all of them
		delEl.each(function(el){
			el.parentNode.removeChild(el);
		});		
	},
	
	getAllChilds: function( node ){
		
		var childs = $A(node.childNodes)
		
		$A(node.childNodes).each(function( e ){ 
		        childs.push( this.getAllChilds( e ) )
		}.bind(this))

    	return childs.flatten();
	}

    
});
/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.Edit = Clazz.extend({        construct: function(facade){            this.facade = facade;        this.clipboard = new ORYX.Plugins.Edit.ClipBoard(facade);                //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keyHandler.bind(this));                this.facade.offer({         name: ORYX.I18N.Edit.cut,         description: ORYX.I18N.Edit.cutDesc,         icon: ORYX.PATH + "images/cut.png",		 keyCodes: [{				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: 88,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN			}		 ],         functionality: this.callEdit.bind(this, this.editCut),         group: ORYX.I18N.Edit.group,         index: 1,         minShape: 1         });                 this.facade.offer({         name: ORYX.I18N.Edit.copy,         description: ORYX.I18N.Edit.copyDesc,         icon: ORYX.PATH + "images/page_copy.png",		 keyCodes: [{				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: 67,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN			}		 ],         functionality: this.callEdit.bind(this, this.editCopy, [true, false]),         group: ORYX.I18N.Edit.group,         index: 2,         minShape: 1         });                 this.facade.offer({         name: ORYX.I18N.Edit.paste,         description: ORYX.I18N.Edit.pasteDesc,         icon: ORYX.PATH + "images/page_paste.png",		 keyCodes: [{				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: 86,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN			}		 ],         functionality: this.callEdit.bind(this, this.editPaste),         isEnabled: this.clipboard.isOccupied.bind(this.clipboard),         group: ORYX.I18N.Edit.group,         index: 3,         minShape: 0,         maxShape: 0         });                 this.facade.offer({            name: ORYX.I18N.Edit.del,            description: ORYX.I18N.Edit.delDesc,            icon: ORYX.PATH + "images/cross.png",			keyCodes: [{					metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],					keyCode: 8,					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN				},				{						keyCode: 46,					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN				}			],            functionality: this.callEdit.bind(this, this.editDelete),            group: ORYX.I18N.Edit.group,            index: 4,            minShape: 1        });    },		callEdit: function(fn, args){		window.setTimeout(function(){			fn.apply(this, (args instanceof Array ? args : []));		}.bind(this), 1);	},		/**	 * Handles the mouse down event and starts the copy-move-paste action, if	 * control or meta key is pressed.	 */	handleMouseDown: function(event) {		if(this._controlPressed) {			this._controlPressed = false;			this.editCopy();//			console.log("copiedEle: %0",this.clipboard.shapesAsJson())//			console.log("mousevent: %o",event)			this.editPaste();			event.forceExecution = true;			this.facade.raiseEvent(event, this.clipboard.shapesAsJson());					}	},        /**     * The key handler for this plugin. Every action from the set of cut, copy,     * paste and delete should be accessible trough simple keyboard shortcuts.     * This method checks whether any event triggers one of those actions.     *     * @param {Object} event The keyboard event that should be analysed for     *     triggering of this plugin.     *///    keyHandler: function(event){//        //TODO document what event.which is.//        //        ORYX.Log.debug("edit.js handles a keyEvent.");//        //        // assure we have the current event.//        if (!event) //            event = window.event;//        //        //        // get the currently pressed key and state of control key.//        var pressedKey = event.which || event.keyCode;//        var ctrlPressed = event.ctrlKey;//        //        // if the object is to be deleted, do so, and return immediately.//        if ((pressedKey == ORYX.CONFIG.KEY_CODE_DELETE) ||//        ((pressedKey == ORYX.CONFIG.KEY_CODE_BACKSPACE) &&//        (event.metaKey || event.appleMetaKey))) {//        //            ORYX.Log.debug("edit.js deletes the shape.");//            this.editDelete();//            return;//        }//        //         // if control key is not pressed, we're not interested anymore.//         if (!ctrlPressed)//         return;//         //         // when ctrl is pressed, switch trough the possibilities.//         switch (pressedKey) {//         //	         // cut.//	         case ORYX.CONFIG.KEY_CODE_X://	         this.editCut();//	         break;//	         //	         // copy.//	         case ORYX.CONFIG.KEY_CODE_C://	         this.editCopy();//	         break;//	         //	         // paste.//	         case ORYX.CONFIG.KEY_CODE_V://	         this.editPaste();//	         break;//         }//    },	    /**     * Returns a list of shapes which should be considered while copying.     * Besides the shapes of given ones, edges and attached nodes are added to the result set.     * If one of the given shape is a child of another given shape, it is not put into the result.      */    getAllShapesToConsider: function(shapes){        var shapesToConsider = []; // only top-level shapes        var childShapesToConsider = []; // all child shapes of top-level shapes                shapes.each(function(shape){            //Throw away these shapes which have a parent in given shapes            isChildShapeOfAnother = shapes.any(function(s2){                return s2.hasChildShape(shape);            });            if(isChildShapeOfAnother) return;                        // This shape should be considered            shapesToConsider.push(shape);            // Consider attached nodes (e.g. intermediate events)            if (shape instanceof ORYX.Core.Node) {				var attached = shape.getOutgoingNodes();				attached = attached.findAll(function(a){ return !shapes.include(a) });                shapesToConsider = shapesToConsider.concat(attached);            }                        childShapesToConsider = childShapesToConsider.concat(shape.getChildShapes(true));        }.bind(this));                // All edges between considered child shapes should be considered        // Look for these edges having incoming and outgoing in childShapesToConsider        var edgesToConsider = this.facade.getCanvas().getChildEdges().select(function(edge){            // Ignore if already added            if(shapesToConsider.include(edge)) return false;            // Ignore if there are no docked shapes            if(edge.getAllDockedShapes().size() === 0) return false;             // True if all docked shapes are in considered child shapes            return edge.getAllDockedShapes().all(function(shape){                // Remember: Edges can have other edges on outgoing, that is why edges must not be included in childShapesToConsider                return shape instanceof ORYX.Core.Edge || childShapesToConsider.include(shape);            });        });        shapesToConsider = shapesToConsider.concat(edgesToConsider);                return shapesToConsider;    },        /**     * Performs the cut operation by first copy-ing and then deleting the     * current selection.     */    editCut: function(){        //TODO document why this returns false.        //TODO document what the magic boolean parameters are supposed to do.try {                this.editCopy(false, true);        this.editDelete(true);} catch(e){ORYX.Log.error(e)}        return false;    },        /**     * Performs the copy operation.     * @param {Object} will_not_update ??     */    editCopy: function( will_update, useNoOffset ){        var selection = this.facade.getSelection();                //if the selection is empty, do not remove the previously copied elements        if(selection.length == 0) return;                this.clipboard.refresh(selection, this.getAllShapesToConsider(selection), this.facade.getCanvas().getStencil().stencilSet().namespace(), useNoOffset);        if( will_update ) this.facade.updateSelection();    },        /**     * Performs the paste operation.     */    editPaste: function(){        // Create a new canvas with childShapes 		//and stencilset namespace to be JSON Import conform		var canvas = {            childShapes: this.clipboard.shapesAsJson(),			stencilset:{				namespace:this.clipboard.SSnamespace			}        }        // Apply json helper to iterate over json object        Ext.apply(canvas, ORYX.Core.AbstractShape.JSONHelper);                var childShapeResourceIds =  canvas.getChildShapes(true).pluck("resourceId");        var outgoings = {};        // Iterate over all shapes        canvas.eachChild(function(shape, parent){            // Throw away these references where referenced shape isn't copied            shape.outgoing = shape.outgoing.select(function(out){                return childShapeResourceIds.include(out.resourceId);            });			shape.outgoing.each(function(out){				if (!outgoings[out.resourceId]){ outgoings[out.resourceId] = [] }				outgoings[out.resourceId].push(shape)			});			            return shape;        }.bind(this), true, true);                // Iterate over all shapes        canvas.eachChild(function(shape, parent){                    	// Check if there has a valid target            if(shape.target && !(childShapeResourceIds.include(shape.target.resourceId))){                shape.target = undefined;                shape.targetRemoved = true;            }    		    		// Check if the first docker is removed    		if(	shape.dockers &&     			shape.dockers.length >= 1 &&     			shape.dockers[0].getDocker &&    			((shape.dockers[0].getDocker().getDockedShape() &&    			!childShapeResourceIds.include(shape.dockers[0].getDocker().getDockedShape().resourceId)) ||     			!shape.getShape().dockers[0].getDockedShape()&&!outgoings[shape.resourceId])) {    				    			shape.sourceRemoved = true;    		}			            return shape;        }.bind(this), true, true);		        // Iterate over top-level shapes        canvas.eachChild(function(shape, parent){            // All top-level shapes should get an offset in their bounds            // Move the shape occording to COPY_MOVE_OFFSET        	if (this.clipboard.useOffset) {	            shape.bounds = {	                lowerRight: {	                    x: shape.bounds.lowerRight.x + ORYX.CONFIG.COPY_MOVE_OFFSET,	                    y: shape.bounds.lowerRight.y + ORYX.CONFIG.COPY_MOVE_OFFSET	                },	                upperLeft: {	                    x: shape.bounds.upperLeft.x + ORYX.CONFIG.COPY_MOVE_OFFSET,	                    y: shape.bounds.upperLeft.y + ORYX.CONFIG.COPY_MOVE_OFFSET	                }	            };        	}            // Only apply offset to shapes with a target            if (shape.dockers){                shape.dockers = shape.dockers.map(function(docker, i){                    // If shape had a target but the copied does not have anyone anymore,                    // migrate the relative dockers to absolute ones.                    if( (shape.targetRemoved === true && i == shape.dockers.length - 1&&docker.getDocker) ||						(shape.sourceRemoved === true && i == 0&&docker.getDocker)){                        docker = docker.getDocker().bounds.center();                    }					// If it is the first docker and it has a docked shape, 					// just return the coordinates				   	if ((i == 0 && docker.getDocker instanceof Function && 				   		shape.sourceRemoved !== true && (docker.getDocker().getDockedShape() || ((outgoings[shape.resourceId]||[]).length > 0 && (!(shape.getShape() instanceof ORYX.Core.Node) || outgoings[shape.resourceId][0].getShape() instanceof ORYX.Core.Node)))) || 						(i == shape.dockers.length - 1 && docker.getDocker instanceof Function && 						shape.targetRemoved !== true && (docker.getDocker().getDockedShape() || shape.target))){													return {                        	x: docker.x,                         	y: docker.y,                        	getDocker: docker.getDocker						}					} else if (this.clipboard.useOffset) {	                    return {		                        x: docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET, 		                        y: docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,	                        	getDocker: docker.getDocker		                    };				   	} else {				   		return {                        	x: docker.x,                         	y: docker.y,                        	getDocker: docker.getDocker						};				   	}                }.bind(this));            } else if (shape.getShape() instanceof ORYX.Core.Node && shape.dockers && shape.dockers.length > 0 && (!shape.dockers.first().getDocker || shape.sourceRemoved === true || !(shape.dockers.first().getDocker().getDockedShape() || outgoings[shape.resourceId]))){            	            	shape.dockers = shape.dockers.map(function(docker, i){            		                    if((shape.sourceRemoved === true && i == 0&&docker.getDocker)){                    	docker = docker.getDocker().bounds.center();                    }                                        if (this.clipboard.useOffset) {	            		return {	                        x: docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET, 	                        y: docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,	                    	getDocker: docker.getDocker	                    };                    } else {	            		return {	                        x: docker.x, 	                        y: docker.y,	                    	getDocker: docker.getDocker	                    };                    }            	}.bind(this));            }                        return shape;        }.bind(this), false, true);        this.clipboard.useOffset = true;        this.facade.importJSON(canvas);    },        /**     * Performs the delete operation. No more asking.     */    editDelete: function(){        var selection = this.facade.getSelection();        		var shapes = this.getAllShapesToConsider(selection);		var command = new ORYX.Plugins.Edit.DeleteCommand(shapes, this.facade);                                       		this.facade.executeCommands([command]);    }}); ORYX.Plugins.Edit.ClipBoard = Clazz.extend({    construct: function(){        this._shapesAsJson = [];        this.selection = [];		this.SSnamespace="";		this.useOffset=true;    },    isOccupied: function(){        return this.shapesAsJson().length > 0;    },    refresh: function(selection, shapes, namespace, useNoOffset){        this.selection = selection;        this.SSnamespace=namespace;        // Store outgoings, targets and parents to restore them later on        this.outgoings = {};        this.parents = {};        this.targets = {};        this.useOffset = useNoOffset !== true;                this._shapesAsJson = shapes.map(function(shape){            var s = shape.toJSON();            s.parent = {resourceId : shape.getParentShape().resourceId};            s.parentIndex = shape.getParentShape().getChildShapes().indexOf(shape)            return s;        });    },	shapesAsJson: function() {		return this._shapesAsJson;	}});ORYX.Plugins.Edit.DeleteCommand = ORYX.Core.Command.extend({    construct: function(shapes, facade){	try {        this.shapesAsJson       = shapes;        this.facade             = facade;ORYX.Log.info("this.shapesAsJson", this.shapesAsJson);                // Store dockers of deleted shapes to restore connections        this.dockers            = this.shapesAsJson.map(function(shape){//            var shape = shapeAsJson.getShape();            var incomingDockers = shape.getIncomingShapes().map(function(s){return s.getDockers().last()})            var outgoingDockers = shape.getOutgoingShapes().map(function(s){return s.getDockers().first()})            var dockers = shape.getDockers().concat(incomingDockers, outgoingDockers).compact().map(function(docker){                return {                    object: docker,                    referencePoint: docker.referencePoint,                    dockedShape: docker.getDockedShape()                };            });            return dockers;        }).flatten();}catch(e){ORYX.Log.error(e)}    },              execute: function(){        this.shapesAsJson.each(function(shape){            // Delete shape            this.facade.deleteShape(shape); // AsJson.getShape()        }.bind(this));                this.facade.setSelection([]);        this.facade.getCanvas().update();				this.facade.updateSelection();            },    rollback: function(){        this.shapesAsJson.each(function(shape) {    		var parent = ("undefined" != typeof(shape.parent) ?  this.facade.getCanvas().getChildShapeByResourceId(shape.parent.resourceId) : this.facade.getCanvas());            parent.add(shape, shape.parentIndex);            parent.add(shape, shape.parentIndex);        }.bind(this));                //reconnect shapes        this.dockers.each(function(d) {            d.object.setDockedShape(d.dockedShape);            d.object.setReferencePoint(d.referencePoint);        }.bind(this));                this.facade.setSelection(this.selectedShapes);        this.facade.getCanvas().update();			this.facade.updateSelection();            }});/** * Copyright (c) 2009 * Jan-Felix Schwarz * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.KeysMove = ORYX.Plugins.AbstractPlugin.extend({    facade: undefined,        construct: function(facade){            this.facade = facade;        this.copyElements = [];                //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keyHandler.bind(this));		// SELECT ALL		this.facade.offer({		keyCodes: [{		 		metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: 65,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.selectAll.bind(this)         });		 		// MOVE LEFT SMALL				this.facade.offer({		keyCodes: [{		 		metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: ORYX.CONFIG.KEY_CODE_LEFT,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_LEFT, false)         });		 		 // MOVE LEFT		 this.facade.offer({		 keyCodes: [{				keyCode: ORYX.CONFIG.KEY_CODE_LEFT,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_LEFT, true)         });		 		// MOVE RIGHT SMALL			 this.facade.offer({		 keyCodes: [{		 		metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: ORYX.CONFIG.KEY_CODE_RIGHT,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_RIGHT, false)         });		 		// MOVE RIGHT			 this.facade.offer({		 keyCodes: [{				keyCode: ORYX.CONFIG.KEY_CODE_RIGHT,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_RIGHT, true)         });		 		// MOVE UP SMALL			 this.facade.offer({		 keyCodes: [{		 		metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: ORYX.CONFIG.KEY_CODE_UP,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_UP, false)         });		 		// MOVE UP			 this.facade.offer({		 keyCodes: [{				keyCode: ORYX.CONFIG.KEY_CODE_UP,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_UP, true)         });		 		// MOVE DOWN SMALL			 this.facade.offer({		 keyCodes: [{		 		metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],				keyCode: ORYX.CONFIG.KEY_CODE_DOWN,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_DOWN, false)         });		 		// MOVE DOWN			 this.facade.offer({		 keyCodes: [{				keyCode: ORYX.CONFIG.KEY_CODE_DOWN,				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 			}		 ],         functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_DOWN, true)         });		              },    	/**	 * Select all shapes in the editor	 *	 */	selectAll: function(e){    	Event.stop(e.event);		this.facade.setSelection(this.facade.getCanvas().getChildShapes(true))	},		move: function(key, far, e) {		    	Event.stop(e.event);		// calculate the distance to move the objects and get the selection.		var distance = far? 20 : 5;		var selection = this.facade.getSelection();		var currentSelection = this.facade.getSelection();		var p = {x: 0, y: 0};				// switch on the key pressed and populate the point to move by.		switch(key) {			case ORYX.CONFIG.KEY_CODE_LEFT:				p.x = -1*distance;				break;			case ORYX.CONFIG.KEY_CODE_RIGHT:				p.x = distance;				break;			case ORYX.CONFIG.KEY_CODE_UP:				p.y = -1*distance;				break;			case ORYX.CONFIG.KEY_CODE_DOWN:				p.y = distance;				break;		}				// move each shape in the selection by the point calculated and update it.		selection = selection.findAll(function(shape){ 			// Check if this shape is docked to an shape in the selection						if(shape instanceof ORYX.Core.Node && shape.dockers.length == 1 && selection.include( shape.dockers.first().getDockedShape() )){ 				return false 			} 						// Check if any of the parent shape is included in the selection			var s = shape.parent; 			do{ 				if(selection.include(s)){ 					return false				}			}while(s = s.parent); 						// Otherwise, return true			return true;					});				/* Edges must not be movable, if only edges are selected and at least 		 * one of them is docked.		 */		var edgesMovable = true;		var onlyEdgesSelected = selection.all(function(shape) {			if(shape instanceof ORYX.Core.Edge) {				if(shape.isDocked()) {					edgesMovable = false;				}				return true;				}			return false;		});				if(onlyEdgesSelected && !edgesMovable) {			/* Abort moving shapes */			return;		}				selection = selection.map(function(shape){ 			if( shape instanceof ORYX.Core.Node ){				/*if( shape.dockers.length == 1 ){					return shape.dockers.first()				} else {*/					return shape				//}			} else if( shape instanceof ORYX.Core.Edge ) {								var dockers = shape.dockers;								if( selection.include( shape.dockers.first().getDockedShape() ) ){					dockers = dockers.without( shape.dockers.first() )				}				if( selection.include( shape.dockers.last().getDockedShape() ) ){					dockers = dockers.without( shape.dockers.last() )				}								return dockers											} else {				return null			}				}).flatten().compact();				if (selection.size() > 0) {						//Stop moving at canvas borders			var selectionBounds = [ this.facade.getCanvas().bounds.lowerRight().x,			                        this.facade.getCanvas().bounds.lowerRight().y,			                        0,			                        0 ];			selection.each(function(s) {				selectionBounds[0] = Math.min(selectionBounds[0], s.bounds.upperLeft().x);				selectionBounds[1] = Math.min(selectionBounds[1], s.bounds.upperLeft().y);				selectionBounds[2] = Math.max(selectionBounds[2], s.bounds.lowerRight().x);				selectionBounds[3] = Math.max(selectionBounds[3], s.bounds.lowerRight().y);			});			if(selectionBounds[0]+p.x < 0)				p.x = -selectionBounds[0];			if(selectionBounds[1]+p.y < 0)				p.y = -selectionBounds[1];			if(selectionBounds[2]+p.x > this.facade.getCanvas().bounds.lowerRight().x)				p.x = this.facade.getCanvas().bounds.lowerRight().x - selectionBounds[2];			if(selectionBounds[3]+p.y > this.facade.getCanvas().bounds.lowerRight().y)				p.y = this.facade.getCanvas().bounds.lowerRight().y - selectionBounds[3];						if(p.x!=0 || p.y!=0) {				// Instantiate the moveCommand				var commands = [new ORYX.Core.Command.Move(selection, p, null, currentSelection, this)];				// Execute the commands							this.facade.executeCommands(commands);			}					}	},		getUndockedCommant: function(shapes){		var undockEdgeCommand = ORYX.Core.Command.extend({			construct: function(moveShapes){				this.dockers = moveShapes.collect(function(shape){ return shape instanceof ORYX.Core.Controls.Docker ? {docker:shape, dockedShape:shape.getDockedShape(), refPoint:shape.referencePoint} : undefined }).compact();			},						execute: function(){				this.dockers.each(function(el){					el.docker.setDockedShape(undefined);				})			},			rollback: function(){				this.dockers.each(function(el){					el.docker.setDockedShape(el.dockedShape);					el.docker.setReferencePoint(el.refPoint);					//el.docker.update();				})			}		});				command = new undockEdgeCommand( shapes );		command.execute();			return command;	},	//    /**//     * The key handler for this plugin. Every action from the set of cut, copy,//     * paste and delete should be accessible trough simple keyboard shortcuts.//     * This method checks whether any event triggers one of those actions.//     *//     * @param {Object} event The keyboard event that should be analysed for//     *     triggering of this plugin.//     *///    keyHandler: function(event){//        //TODO document what event.which is.//        //        ORYX.Log.debug("keysMove.js handles a keyEvent.");//        //        // assure we have the current event.//        if (!event) //            event = window.event;//        //        // get the currently pressed key and state of control key.//        var pressedKey = event.which || event.keyCode;//        var ctrlPressed = event.ctrlKey;////		// if the key is one of the arrow keys, forward to move and return.//		if ([ORYX.CONFIG.KEY_CODE_LEFT, ORYX.CONFIG.KEY_CODE_RIGHT,//			ORYX.CONFIG.KEY_CODE_UP, ORYX.CONFIG.KEY_CODE_DOWN].include(pressedKey)) {//			//			this.move(pressedKey, !ctrlPressed);//			return;//		}//		//    }	});/** * Copyright (c) 2008 * Jan-Felix Schwarz * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins)	ORYX.Plugins = new Object();ORYX.Plugins.RowLayouting = {	/**	 *	Constructor	 *	@param {Object} Facade: The Facade of the Editor	 */	construct: function(facade) {		this.facade = facade;		// Initialize variables				this.currentShapes = [];			// Current selected Shapes		this.toMoveShapes = [];				// Shapes that are moved			this.dragBounds = undefined;		this.offSetPosition = {x:0, y:0};		this.evCoord = {x:0, y:0};		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT_ROWS, this.handleLayoutRows.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));	},			/**	 * On the Selection-Changed	 *	 */	onSelectionChanged: function(event) {				var elements = event.elements;		// If there are no elements		if(!elements || elements.length == 0) {			// reset all variables			this.currentShapes = [];			this.toMoveShapes = [];			this.dragBounds = undefined;		} else {			// Set the current Shapes			this.currentShapes = elements;			// Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)			this.toMoveShapes = this.facade.getCanvas().getShapesWithSharedParent(elements);						this.toMoveShapes = this.toMoveShapes.findAll( function(shape) { return shape instanceof ORYX.Core.Node && 																			(shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape()))});							// Calculate the area-bounds of the selection			var newBounds = undefined;			elements.each(function(value) {				if(!newBounds)					newBounds = value.absoluteBounds();				else					newBounds.include(value.absoluteBounds());			});			// Set the new bounds			this.dragBounds = newBounds;		}				/*if(!this.dragBounds) {return};						var ul = this.dragBounds.upperLeft();				var offSetPosition = {			x: this.evCoord.x - ul.x,			y: this.evCoord.y - ul.y		}				this.toMoveShapes.each(function(shape) {			shape.bounds.moveBy(offSetPosition);		});*/				return;	},		handleMouseDown: function(event, uiObj) {		if(!this.dragBounds || !this.toMoveShapes.member(uiObj)) {return};				var evCoord 	= this.facade.eventCoordinates( event );		var ul = this.dragBounds.upperLeft();				this.offSetPosition = {			x: evCoord.x - ul.x,			y: evCoord.y - ul.y		}				return;	},			/**	 * On Layout Rows	 *	 */	handleLayoutRows: function(event) {		var shape = event.shape;				var offsetPos = this.offSetPosition;				var marginLeft = event.marginLeft;		var marginTop = event.marginTop;		var spacingX = event.spacingX;		var spacingY = event.spacingY;		var elements = event.shape.getChildShapes(false);				var movedShapes = this.toMoveShapes;		movedShapes.each(function(shape){			if(elements.include(shape)) shape.bounds.moveBy(offsetPos);		});				// exclude specified stencils from layouting		if (event.exclude) {			elements = elements.filter(function(element){				return !event.exclude.some(function(value){					return element.getStencil().id() == value;				});			});		}				var rowTop = marginTop;		var rowBottom = marginTop - spacingY;				if (event.horizontalLayout) {			// in case of horizontal layout: reset Y values			elements.each(function(element){				var ul = element.bounds.upperLeft();				element.bounds.moveTo(ul.x, rowTop);			})		}		else 			if (event.verticalLayout) {				// in case of vertical layout: reset X values				elements.each(function(element){					var ul = element.bounds.upperLeft();					element.bounds.moveTo(marginLeft, ul.y);				})			}				// Sort top-down		elements = elements.sortBy(function(element){			return element.bounds.upperLeft().y;		});				var insertRowOffset = 0;		var deleteRowOffset = 0;		var isNewRow = false;				// Assign shapes to rows		elements.each(function(element){					var ul = element.bounds.upperLeft();			var lr = element.bounds.lowerRight();						// save old values			var oldUlX = ul.x;			var oldUlY = ul.y;			var oldLrX = lr.x;			var oldLrY = lr.y;						if (movedShapes.include(element)) {				ul.y -= deleteRowOffset;								if ((ul.y > rowBottom) || ((element == elements.first()) && ul.y < marginTop)) {					// ul.y < marginTop wird bei nebeneinander nach oben verschobenen shapes					// mehrmals erfüllt, dadurch mehrmals neue row und untereinanderrutschen					// -> nur falls erstes element										// next row					isNewRow = false;					rowTop = rowBottom + spacingY;					if (ul.y < rowTop) {						// insert new row						//insertRowOffset += element.bounds.height() + 1;						isNewRow = true;					}				}			}			else {				ul.y += insertRowOffset;				ul.y -= deleteRowOffset;								if (ul.y > rowTop) {					// next row					isNewRow = false;					rowTop = rowBottom + spacingY;				}			}						// align shape at row top			ul.y = rowTop;			lr.y = ul.y + element.bounds.height();						if (lr.y > rowBottom) {				// extend row height and inserted rows offset				// following lines don't work as required				if (isNewRow) 					insertRowOffset += lr.y - rowBottom;				else 					if (movedShapes.include(element)) 						insertRowOffset += lr.y - rowBottom;				rowBottom = lr.y;			}						if ((ul.x != oldUlX) || (ul.y != oldUlY) || (lr.x != oldLrX) || (lr.y != oldLrY)) {				// only set bounds if ul or lr updated				if (!movedShapes.include(element)) {					// if non-moved elements are repositioned upwards also move following [moved] elements upwards					// (otherwise dropping the moved element to a row below wouldn't work correctly)					if ((oldUlY - ul.y) > deleteRowOffset) 						deleteRowOffset = oldUlY - ul.y;				}				element.bounds.set(ul.x, ul.y, lr.x, lr.y);			}		});				// Sort top-down from left to right		elements = elements.sortBy(function(element){			return element.bounds.upperLeft().y * 10000 + element.bounds.upperLeft().x;		});				rowTop = marginTop;		var rowRight = marginLeft - spacingX;		var maxRowRight = rowRight;		var maxRowBottom = 0;				// Arrange shapes on rows (align left)		elements.each(function(element){					var ul = element.bounds.upperLeft();			var lr = element.bounds.lowerRight();						// save old values			var oldUlX = ul.x;			var oldUlY = ul.y;			var oldLrX = lr.x;			var oldLrY = lr.y;						if (ul.y > rowTop) {				// next row				rowTop = ul.y;				rowRight = marginLeft - spacingX;			}						// align at right border of the row			ul.x = rowRight + spacingX;			lr.x = ul.x + element.bounds.width();			rowRight = lr.x;						if (rowRight > maxRowRight) 				maxRowRight = rowRight;			if (lr.y > maxRowBottom) 				maxRowBottom = lr.y;						if ((ul.x != oldUlX) || (ul.y != oldUlY) || (lr.x != oldLrX) || (lr.y != oldLrY)) {				// only set bounds if ul or lr updated				element.bounds.set(ul.x, ul.y, lr.x, lr.y);			}					});				if (event.shape != this.facade.getCanvas()) {			// adjust parents bounds			var ul = event.shape.bounds.upperLeft();			if (maxRowRight > marginLeft) 				event.shape.bounds.set(ul.x, ul.y, ul.x + maxRowRight + marginLeft, ul.y + rowBottom + marginTop);		}		else {			// extend canvas size if necessary			if (maxRowRight > this.facade.getCanvas().bounds.width()) {				this.facade.getCanvas().setSize({					width: (maxRowRight + marginLeft),					height: this.facade.getCanvas().bounds.height()				});			}			if (maxRowBottom > this.facade.getCanvas().bounds.height()) {				this.facade.getCanvas().setSize({					width: this.facade.getCanvas().bounds.width(),					height: (rowBottom + marginTop)				});			}		}						return;	}
};ORYX.Plugins.RowLayouting = Clazz.extend(ORYX.Plugins.RowLayouting);if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.PluginLoader = Clazz.extend({
	
    facade: undefined,
	mask: undefined,
	processURI: undefined,
	
    construct: function(facade){
		this.facade = facade;
		
		this.facade.offer({
			'name': ORYX.I18N.PluginLoad.AddPluginButtonName,
			'functionality': this.showManageDialog.bind(this),
			'group': ORYX.I18N.SSExtensionLoader.group,
			'icon': ORYX.PATH + "images/labs/script_add.png",
			'description': ORYX.I18N.PluginLoad.AddPluginButtonDesc,
			'index': 8,
			'minShape': 0,
			'maxShape': 0
		});},
	showManageDialog: function(){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
	var data=[];
	//(var plugins=this.facade.getAvailablePlugins();
	var plugins=[];
	var loadedStencilSetsNamespaces = this.facade.getStencilSets().keys();
	//get all plugins which could be acivated
	this.facade.getAvailablePlugins().each(function(match) {
	if ((!match.requires 	|| !match.requires.namespaces 	
			|| match.requires.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) )
		&&(!match.notUsesIn 	|| !match.notUsesIn.namespaces 	
				|| !match.notUsesIn.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }))){
		plugins.push( match );

	}});
	
	plugins.each(function(plugin){
			data.push([plugin.name, plugin.engaged===true]);
			})
		if(data.length==0){return};
		var reader = new Ext.data.ArrayReader({}, [
        {name: 'name'},
		{name: 'engaged'} ]);
		
		var sm = new Ext.grid.CheckboxSelectionModel({
			listeners:{
			beforerowselect: function(sm,nbr,exist,rec){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
				this.facade.activatePluginByName(rec.data.name, 
						function(sucess,err){
						this.mask.hide();

							if(!!sucess){
								sm.suspendEvents();
								sm.selectRow(nbr, true);
								sm.resumeEvents();
							}else{
								Ext.Msg.show({
		   							   title: ORYX.I18N.PluginLoad.loadErrorTitle,
									   msg: ORYX.I18N.PluginLoad.loadErrorDesc + ORYX.I18N.PluginLoad[err],
									   buttons: Ext.MessageBox.OK
									});
							}}.bind(this));
				return false;
				}.bind(this),
			rowdeselect: function(sm,nbr,rec){
						sm.suspendEvents();
						sm.selectRow(nbr, true);
						sm.resumeEvents();
					}
			}});
	    var grid2 = new Ext.grid.GridPanel({
	    		store: new Ext.data.Store({
		            reader: reader,
		            data: data
		        	}),
		        cm: new Ext.grid.ColumnModel([
		            
		            {id:'name',width:390, sortable: true, dataIndex: 'name'},
					sm]),
			sm: sm,
	        width:450,
	        height:250,
	        frame:true,
			hideHeaders:true,
	        iconCls:'icon-grid',
			listeners : {
				render: function() {
					var recs=[];
					this.grid.getStore().each(function(rec){

						if(rec.data.engaged){
							recs.push(rec);
						}
					}.bind(this));
					this.suspendEvents();
					this.selectRecords(recs);
					this.resumeEvents();
				}.bind(sm)
			}
	    });

		var newURLWin = new Ext.Window({
					title:		ORYX.I18N.PluginLoad.WindowTitle, 
					//bodyStyle:	"background:white;padding:0px", 
					width:		'auto', 
					height:		'auto',
					modal:		true
					//html:"<div style='font-weight:bold;margin-bottom:10px'></div><span></span>",
				});
		newURLWin.add(grid2);
		newURLWin.show();
		this.mask.hide();

		}
		})
			/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner, Philipp Berger * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.Save = Clazz.extend({	    facade: undefined,		processURI: undefined,	    construct: function(facade){		this.facade = facade;				this.facade.offer({			'name': ORYX.I18N.Save.save,			'functionality': this.save.bind(this,false),			'group': ORYX.I18N.Save.group,			'icon': ORYX.PATH + "images/disk.png",			'description': ORYX.I18N.Save.saveDesc,			'index': 1,			'minShape': 0,			'maxShape': 0		});						this.facade.offer({			'name': ORYX.I18N.Save.saveAs,			'functionality': this.save.bind(this,true),			'group': ORYX.I18N.Save.group,			'icon': ORYX.PATH + "images/disk_multi.png",			'description': ORYX.I18N.Save.saveAsDesc,			'index': 2,			'minShape': 0,			'maxShape': 0		});					window.onbeforeunload = this.onUnLoad.bind(this);			this.changeDifference = 0;				// Register on event for executing commands --> store all commands in a stack		 		// --> Execute		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );		// --> Rollback		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );				//TODO very critical for load time performance!!!		//this.serializedDOM = DataManager.__persistDOM(this.facade);	},		onUnLoad: function(){				if( this.changeDifference !== 0 ){					return ORYX.I18N.Save.unsavedData;					}						},			    saveSynchronously: function(forceNew){            		// Reset changes		this.changeDifference = 0;		var reqURI ='';				if (this.processURI) {			reqURI = this.processURI;		}		else {			if(!location.hash.slice(1)){				reqURI= "/backend/poem/new";			}			else{				reqURI = '/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self";			}		}		// If the  current url is the API-URL, try to find out the needed one.		/* if( reqURI.endsWith("/api") || reqURI.include("/api?") ){			// Parse params			var params = {};			window.location.search.slice(1).split("&").each(function(param){ params[param.split("=")[0]]=param.split("=")[1]})						// If there is model in param, take this			if(  params.model ){				reqURI = window.location.href.split("/api")[0] + params.model + "/self";			// If not, force to get a new one			} else {				forceNew = true;			}		}*/				if(forceNew){			var ss 		= this.facade.getStencilSets();			var source 	= ss[ss.keys()[0]].source().split('stencilsets')[1];				reqURI = '/backend/poem' + ORYX.CONFIG.ORYX_NEW_URL + "?stencilset=/stencilsets" + source ;				}		// Get the serialized svg image source        var svgClone 	= this.facade.getCanvas().getSVGRepresentation(true);        var svgDOM 		= DataManager.serialize(svgClone);		this.serializedDOM = Ext.encode(this.facade.getJSON());				// Check if this is the NEW URL		if( reqURI.include( ORYX.CONFIG.ORYX_NEW_URL ) ){						// Get the stencilset			var ss = this.facade.getStencilSets().values()[0]					// Define Default values			var defaultData = {title:ORYX.I18N.Save.newProcess, summary:'', type:ss.title(), url: reqURI, namespace: ss.namespace() }						// Create a Template			var dialog = new Ext.XTemplate(								// TODO find some nice words here -- copy from above ;)						'<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',																	'<fieldset>',								'<p class="description">' + ORYX.I18N.Save.dialogDesciption + '</p>',								'<input type="hidden" name="namespace" value="{namespace}" />',								'<p><label for="edit_model_title">' + ORYX.I18N.Save.dialogLabelTitle + '</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>',								'<p><label for="edit_model_summary">' + ORYX.I18N.Save.dialogLabelDesc + '</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>',								'<p><label for="edit_model_type">' + ORYX.I18N.Save.dialogLabelType + '</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',															'</fieldset>',												'</form>')						// Create the callback for the template			callback = function(form){										var title 		= form.elements["title"].value.strip();				title 			= title.length == 0 ? defaultData.title : title;								//added changing title of page after first save				window.document.title = title + " - Oryx";								var summary = form.elements["summary"].value.strip();					summary 	= summary.length == 0 ? defaultData.summary : summary;								var namespace	= form.elements["namespace"].value.strip();				namespace		= namespace.length == 0 ? defaultData.namespace : namespace;								win.destroy();								// Send the request out				this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM, title: title, summary: summary, type: namespace }, forceNew);							}.bind(this);						// Create a new window							win = new Ext.Window({				id:		'Propertie_Window',		        width:	'auto',		        height:	'auto',		        title:	forceNew ? ORYX.I18N.Save.saveAsTitle : ORYX.I18N.Save.save,		        modal:	true,				bodyStyle: 'background:#FFFFFF',		        html: 	dialog.apply( defaultData ),				buttons:[{					text: ORYX.I18N.Save.saveBtn,					handler: function(){						callback( $('edit_model') )										}				},{                	text: ORYX.I18N.Save.close,                	handler: function(){		               this.facade.raiseEvent({		                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE		                });						                    	win.destroy();                	}.bind(this)				}]		    });					      			win.show();					} else {						// Send the request out			this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM } );					}    },		sendSaveRequest: function(url, params, forceNew){		// Send the request to the server.		new Ajax.Request(url, {                method: 'POST',                asynchronous: false,                parameters: params,			onSuccess: (function(transport) {				var loc = transport.getResponseHeader("location");				if (loc) {					this.processURI = loc;				}				else {					this.processURI = url;				}								var modelUri="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");				location.hash="#"+modelUri;								if( forceNew ){					var newURLWin = new Ext.Window({						title:		ORYX.I18N.Save.savedAs, 						bodyStyle:	"background:white;padding:10px", 						width:		'auto', 						height:		'auto',						html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='" + loc +"' target='_blank'>" + loc + "</a></span>",						buttons:[{text:'Ok',handler:function(){newURLWin.destroy()}}]					});					newURLWin.show();				}				//raise saved event				this.facade.raiseEvent({					type:ORYX.CONFIG.EVENT_MODEL_SAVED				});				//show saved status				this.facade.raiseEvent({						type:ORYX.CONFIG.EVENT_LOADING_STATUS,						text:ORYX.I18N.Save.saved					});			}).bind(this),			onFailure: (function(transport) {				// raise loading disable event.                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.failed);								ORYX.Log.warn("Saving failed: " + transport.responseText);			}).bind(this),			on403: (function(transport) {				// raise loading disable event.                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.noRights);								ORYX.Log.warn("Saving failed: " + transport.responseText);			}).bind(this)		});					},        /**     * Saves the current process to the server.     */    save: function(forceNew, event){            // raise loading enable event        this.facade.raiseEvent({            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,			text: ORYX.I18N.Save.saving        });                // asynchronously ...        window.setTimeout((function(){                    // ... save synchronously            this.saveSynchronously(forceNew);                    }).bind(this), 10);                return true;    }	});			ORYX.Plugins.File = Clazz.extend({    facade: undefined,	        construct: function(facade){        this.facade = facade;                this.facade.offer({            'name': ORYX.I18N.File.print,            'functionality': this.print.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/printer.png",            'description': ORYX.I18N.File.printDesc,            'index': 3,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': ORYX.I18N.File.pdf,            'functionality': this.exportPDF.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/page_white_acrobat.png",            'description': ORYX.I18N.File.pdfDesc,            'index': 4,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': ORYX.I18N.File.info,            'functionality': this.info.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/information.png",            'description': ORYX.I18N.File.infoDesc,            'index': 5,            'minShape': 0,            'maxShape': 0        });    },            info: function(){            var info = '<iframe src="' + ORYX.CONFIG.LICENSE_URL + '" type="text/plain" ' + 				   'style="border:none;display:block;width:575px;height:460px;"/>' +				   '\n\n<pre style="display:inline;">Version: </pre>' + 				   '<iframe src="' + ORYX.CONFIG.VERSION_URL + '" type="text/plain" ' + 				   'style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';		this.infoBox = Ext.Msg.show({		   title: ORYX.I18N.Oryx.title,		   msg: info,		   width: 640,		   maxWidth: 640,		   maxHeight: 480,		   buttons: Ext.MessageBox.OK		});                return false;    },        exportPDF: function(){    			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.File.genPDF});		        var resource = location.href;                // Get the serialized svg image source        var svgClone = this.facade.getCanvas().getSVGRepresentation(true);                var svgDOM = DataManager.serialize(svgClone);		        // Send the svg to the server.        //TODO make this better by using content negotiation instead of format parameter.        //TODO make this better by generating svg on the server, too.        new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL, {            method: 'POST',            parameters: {                resource: resource,                data: svgDOM,                format: "pdf"            },            onSuccess: (function(request){            	this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});				                // Because the pdf may be opened in the same window as the                // process, yet the process may not have been saved, we're                // opening every other representation in a new window.                // location.href = request.responseText                window.open(request.responseText);            }).bind(this),			onFailure: (function(){				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});								Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.File.genPDFFailed);			}).bind(this)        });    },        print: function(){				Ext.Msg.show({		   title		: ORYX.I18N.File.printTitle,		   msg			: ORYX.I18N.File.printMsg,		   buttons		: Ext.Msg.YESNO,		   icon			: Ext.MessageBox.QUESTION,		   fn			:  function(btn) {	        								if (btn == "yes") {																	// Set all options for the new window									var option = $H({										width: 300,										height: 400,										toolbar: "no",										status: "no",										menubar: "yes",										dependent: "yes",										resizable: "yes",										scrollbars: "yes"									});																		// Create the new window with all the settings									var newWindow = window.open("", "PrintWindow", option.invoke('join', '=').join(','));																		// Add a style tag to the head and hide all controls									var head = newWindow.document.getElementsByTagName('head')[0];									var style = document.createElement("style");									style.innerHTML = " body {padding:0px; margin:0px} .svgcontainer { display:none; }";									head.appendChild(style);																		// Clone the svg-node and append this to the new body									newWindow.document.getElementsByTagName('body')[0].appendChild(this.facade.getCanvas().getSVGRepresentation());									var svg = newWindow.document.getElementsByTagName('body')[0].getElementsByTagName('svg')[0];																		// Set the width and height									svg.setAttributeNS(null, 'width', 1100);									svg.setAttributeNS(null, 'height', 1400);																		// Set the correct size and rotation									svg.lastChild.setAttributeNS(null, 'transform', 'scale(0.47, 0.47) rotate(270, 1510, 1470)');																		var markers = ['marker-start', 'marker-mid', 'marker-end']									var path = $A(newWindow.document.getElementsByTagName('path'));									path.each(function(pathNode){										markers.each(function(marker){											// Get the marker value											var url = pathNode.getAttributeNS(null, marker);											if (!url) {												return											};																						// Replace the URL and set them new											url = "url(about:blank#" + url.slice(5);											pathNode.setAttributeNS(null, marker, url);										});									});																		// Get the print dialog									newWindow.print();																		return true;								}							}.bind(this)			});    }   });/** * Method to load model or create new one * (moved from editor handler) */window.onOryxResourcesLoaded = function() {		if (location.hash.slice(1).length == 0 || location.hash.slice(1).indexOf('new')!=-1) {		var stencilset = ORYX.Utils.getParamFromUrl('stencilset') || ORYX.CONFIG.SSET; // || "stencilsets/bpmn2.0/bpmn2.0.json";				new ORYX.Editor({			id: 'oryx-canvas123',			stencilset: {				url: ORYX.PATH + "/" + stencilset			}		});	} else {		ORYX.Editor.createByUrl(			"/backend/poem" + location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+'json',			{				id: 'oryx-canvas123',				onFailure: function(transport) {		    	  if (403 == transport.status) {		    		  Ext.Msg.show({		                  title:'Authentication Failed',		                  msg: 'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });		    	  }		    	  else if (404 == transport.status) {		    		  Ext.Msg.show({		                  title:'Not Found',		                  msg: 'The model you requested could not be found.',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });		    	  }		    	  else {		    		  Ext.Msg.show({		                  title:'Internal Error',		                  msg: 'We\'re sorry, the model cannot be loaded due to an internal error',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });				  }			  }			}		);  	}};/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner, Philipp Berger * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.Save = Clazz.extend({	    facade: undefined,		processURI: undefined,	    construct: function(facade){		this.facade = facade;				this.facade.offer({			'name': ORYX.I18N.Save.save,			'functionality': this.save.bind(this,false),			'group': ORYX.I18N.Save.group,			'icon': ORYX.PATH + "images/disk.png",			'description': ORYX.I18N.Save.saveDesc,			'index': 1,			'minShape': 0,			'maxShape': 0		});						this.facade.offer({			'name': ORYX.I18N.Save.saveAs,			'functionality': this.save.bind(this,true),			'group': ORYX.I18N.Save.group,			'icon': ORYX.PATH + "images/disk_multi.png",			'description': ORYX.I18N.Save.saveAsDesc,			'index': 2,			'minShape': 0,			'maxShape': 0		});					window.onbeforeunload = this.onUnLoad.bind(this);			this.changeDifference = 0;				// Register on event for executing commands --> store all commands in a stack		 		// --> Execute		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );		// --> Rollback		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );				//TODO very critical for load time performance!!!		//this.serializedDOM = DataManager.__persistDOM(this.facade);	},		onUnLoad: function(){				if( this.changeDifference !== 0 ){					return ORYX.I18N.Save.unsavedData;					}						},			    saveSynchronously: function(forceNew){            		// Reset changes		this.changeDifference = 0;		var reqURI ='';				if (this.processURI) {			reqURI = this.processURI;		}		else {			if(!location.hash.slice(1)){				reqURI= "/backend/poem/new";			}			else{				reqURI = '/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self";			}		}		// If the  current url is the API-URL, try to find out the needed one.		/* if( reqURI.endsWith("/api") || reqURI.include("/api?") ){			// Parse params			var params = {};			window.location.search.slice(1).split("&").each(function(param){ params[param.split("=")[0]]=param.split("=")[1]})						// If there is model in param, take this			if(  params.model ){				reqURI = window.location.href.split("/api")[0] + params.model + "/self";			// If not, force to get a new one			} else {				forceNew = true;			}		}*/				if(forceNew){			var ss 		= this.facade.getStencilSets();			var source 	= ss[ss.keys()[0]].source().split('stencilsets')[1];				reqURI = '/backend/poem' + ORYX.CONFIG.ORYX_NEW_URL + "?stencilset=/stencilsets" + source ;				}		// Get the serialized svg image source        var svgClone 	= this.facade.getCanvas().getSVGRepresentation(true);        var svgDOM 		= DataManager.serialize(svgClone);		this.serializedDOM = Ext.encode(this.facade.getJSON());				// Check if this is the NEW URL		if( reqURI.include( ORYX.CONFIG.ORYX_NEW_URL ) ){						// Get the stencilset			var ss = this.facade.getStencilSets().values()[0]					// Define Default values			var defaultData = {title:ORYX.I18N.Save.newProcess, summary:'', type:ss.title(), url: reqURI, namespace: ss.namespace() }						// Create a Template			var dialog = new Ext.XTemplate(								// TODO find some nice words here -- copy from above ;)						'<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',																	'<fieldset>',								'<p class="description">' + ORYX.I18N.Save.dialogDesciption + '</p>',								'<input type="hidden" name="namespace" value="{namespace}" />',								'<p><label for="edit_model_title">' + ORYX.I18N.Save.dialogLabelTitle + '</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>',								'<p><label for="edit_model_summary">' + ORYX.I18N.Save.dialogLabelDesc + '</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>',								'<p><label for="edit_model_type">' + ORYX.I18N.Save.dialogLabelType + '</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',															'</fieldset>',												'</form>')						// Create the callback for the template			callback = function(form){										var title 		= form.elements["title"].value.strip();				title 			= title.length == 0 ? defaultData.title : title;								//added changing title of page after first save				window.document.title = title + " - Oryx";								var summary = form.elements["summary"].value.strip();					summary 	= summary.length == 0 ? defaultData.summary : summary;								var namespace	= form.elements["namespace"].value.strip();				namespace		= namespace.length == 0 ? defaultData.namespace : namespace;								win.destroy();								// Send the request out				this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM, title: title, summary: summary, type: namespace }, forceNew);							}.bind(this);						// Create a new window							win = new Ext.Window({				id:		'Propertie_Window',		        width:	'auto',		        height:	'auto',		        title:	forceNew ? ORYX.I18N.Save.saveAsTitle : ORYX.I18N.Save.save,		        modal:	true,				bodyStyle: 'background:#FFFFFF',		        html: 	dialog.apply( defaultData ),				buttons:[{					text: ORYX.I18N.Save.saveBtn,					handler: function(){						callback( $('edit_model') )										}				},{                	text: ORYX.I18N.Save.close,                	handler: function(){		               this.facade.raiseEvent({		                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE		                });						                    	win.destroy();                	}.bind(this)				}]		    });					      			win.show();					} else {						// Send the request out			this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM } );					}    },		sendSaveRequest: function(url, params, forceNew){		// Send the request to the server.		new Ajax.Request(url, {                method: 'POST',                asynchronous: false,                parameters: params,			onSuccess: (function(transport) {				var loc = transport.getResponseHeader("location");				if (loc) {					this.processURI = loc;				}				else {					this.processURI = url;				}								var modelUri="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");				location.hash="#"+modelUri;								if( forceNew ){					var newURLWin = new Ext.Window({						title:		ORYX.I18N.Save.savedAs, 						bodyStyle:	"background:white;padding:10px", 						width:		'auto', 						height:		'auto',						html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='" + loc +"' target='_blank'>" + loc + "</a></span>",						buttons:[{text:'Ok',handler:function(){newURLWin.destroy()}}]					});					newURLWin.show();				}				//raise saved event				this.facade.raiseEvent({					type:ORYX.CONFIG.EVENT_MODEL_SAVED				});				//show saved status				this.facade.raiseEvent({						type:ORYX.CONFIG.EVENT_LOADING_STATUS,						text:ORYX.I18N.Save.saved					});			}).bind(this),			onFailure: (function(transport) {				// raise loading disable event.                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.failed);								ORYX.Log.warn("Saving failed: " + transport.responseText);			}).bind(this),			on403: (function(transport) {				// raise loading disable event.                this.facade.raiseEvent({                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE                });				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.noRights);								ORYX.Log.warn("Saving failed: " + transport.responseText);			}).bind(this)		});					},        /**     * Saves the current process to the server.     */    save: function(forceNew, event){            // raise loading enable event        this.facade.raiseEvent({            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,			text: ORYX.I18N.Save.saving        });                // asynchronously ...        window.setTimeout((function(){                    // ... save synchronously            this.saveSynchronously(forceNew);                    }).bind(this), 10);                return true;    }	});			ORYX.Plugins.File = Clazz.extend({    facade: undefined,	        construct: function(facade){        this.facade = facade;                this.facade.offer({            'name': ORYX.I18N.File.print,            'functionality': this.print.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/printer.png",            'description': ORYX.I18N.File.printDesc,            'index': 3,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': ORYX.I18N.File.pdf,            'functionality': this.exportPDF.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/page_white_acrobat.png",            'description': ORYX.I18N.File.pdfDesc,            'index': 4,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': ORYX.I18N.File.info,            'functionality': this.info.bind(this),            'group': ORYX.I18N.File.group,            'icon': ORYX.PATH + "images/information.png",            'description': ORYX.I18N.File.infoDesc,            'index': 5,            'minShape': 0,            'maxShape': 0        });    },            info: function(){            var info = '<iframe src="' + ORYX.CONFIG.LICENSE_URL + '" type="text/plain" ' + 				   'style="border:none;display:block;width:575px;height:460px;"/>' +				   '\n\n<pre style="display:inline;">Version: </pre>' + 				   '<iframe src="' + ORYX.CONFIG.VERSION_URL + '" type="text/plain" ' + 				   'style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';		this.infoBox = Ext.Msg.show({		   title: ORYX.I18N.Oryx.title,		   msg: info,		   width: 640,		   maxWidth: 640,		   maxHeight: 480,		   buttons: Ext.MessageBox.OK		});                return false;    },        exportPDF: function(){    			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.File.genPDF});		        var resource = location.href;                // Get the serialized svg image source        var svgClone = this.facade.getCanvas().getSVGRepresentation(true);                var svgDOM = DataManager.serialize(svgClone);		        // Send the svg to the server.        //TODO make this better by using content negotiation instead of format parameter.        //TODO make this better by generating svg on the server, too.        new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL, {            method: 'POST',            parameters: {                resource: resource,                data: svgDOM,                format: "pdf"            },            onSuccess: (function(request){            	this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});				                // Because the pdf may be opened in the same window as the                // process, yet the process may not have been saved, we're                // opening every other representation in a new window.                // location.href = request.responseText                window.open(request.responseText);            }).bind(this),			onFailure: (function(){				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});								Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.File.genPDFFailed);			}).bind(this)        });    },        print: function(){				Ext.Msg.show({		   title		: ORYX.I18N.File.printTitle,		   msg			: ORYX.I18N.File.printMsg,		   buttons		: Ext.Msg.YESNO,		   icon			: Ext.MessageBox.QUESTION,		   fn			:  function(btn) {	        								if (btn == "yes") {																	// Set all options for the new window									var option = $H({										width: 300,										height: 400,										toolbar: "no",										status: "no",										menubar: "yes",										dependent: "yes",										resizable: "yes",										scrollbars: "yes"									});																		// Create the new window with all the settings									var newWindow = window.open("", "PrintWindow", option.invoke('join', '=').join(','));																		// Add a style tag to the head and hide all controls									var head = newWindow.document.getElementsByTagName('head')[0];									var style = document.createElement("style");									style.innerHTML = " body {padding:0px; margin:0px} .svgcontainer { display:none; }";									head.appendChild(style);																		// Clone the svg-node and append this to the new body									newWindow.document.getElementsByTagName('body')[0].appendChild(this.facade.getCanvas().getSVGRepresentation());									var svg = newWindow.document.getElementsByTagName('body')[0].getElementsByTagName('svg')[0];																		// Set the width and height									svg.setAttributeNS(null, 'width', 1100);									svg.setAttributeNS(null, 'height', 1400);																		// Set the correct size and rotation									svg.lastChild.setAttributeNS(null, 'transform', 'scale(0.47, 0.47) rotate(270, 1510, 1470)');																		var markers = ['marker-start', 'marker-mid', 'marker-end']									var path = $A(newWindow.document.getElementsByTagName('path'));									path.each(function(pathNode){										markers.each(function(marker){											// Get the marker value											var url = pathNode.getAttributeNS(null, marker);											if (!url) {												return											};																						// Replace the URL and set them new											url = "url(about:blank#" + url.slice(5);											pathNode.setAttributeNS(null, marker, url);										});									});																		// Get the print dialog									newWindow.print();																		return true;								}							}.bind(this)			});    }   });/** * Method to load model or create new one * (moved from editor handler) */window.onOryxResourcesLoaded = function() {		if (location.hash.slice(1).length == 0 || location.hash.slice(1).indexOf('new')!=-1) {		var stencilset = ORYX.Utils.getParamFromUrl('stencilset') || ORYX.CONFIG.SSET; // || "stencilsets/bpmn2.0/bpmn2.0.json";				new ORYX.Editor({			id: 'oryx-canvas123',			stencilset: {				url: ORYX.PATH + "/" + stencilset			}		});	} else {		ORYX.Editor.createByUrl(			"/backend/poem" + location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+'json',			{				id: 'oryx-canvas123',				onFailure: function(transport) {		    	  if (403 == transport.status) {		    		  Ext.Msg.show({		                  title:'Authentication Failed',		                  msg: 'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });		    	  }		    	  else if (404 == transport.status) {		    		  Ext.Msg.show({		                  title:'Not Found',		                  msg: 'The model you requested could not be found.',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });		    	  }		    	  else {		    		  Ext.Msg.show({		                  title:'Internal Error',		                  msg: 'We\'re sorry, the model cannot be loaded due to an internal error',		                  icon: Ext.MessageBox.WARNING,		                  closeable: false,		                  closable: false		              });				  }			  }			}		);  	}};/**
 * Copyright (c) 2009
 * Sven Wagner-Boysen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

/**
   @namespace Oryx name space for plugins
   @name ORYX.Plugins
*/
 if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
	

/**
 * This plugin provides methods to layout elements that typically contain 
 * a bunch of child elements, such as subprocesses or lanes.
 * 
 * @class ORYX.Plugins.ContainerLayouter
 * @extends ORYX.Plugins.AbstractPlugin
 * @param {Object} facade
 * 		The facade of the Editor
 */
ORYX.Plugins.ContainerLayouter = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade){
		this.facade = facade;

		// this does NOT work, because lanes and pools are loaded at start and initialized with a default size
		// if the lane was saved and had a bigger size, the dockers/edges will be corrupted, because the first 
		// positioning is handled as a resize event which triggers the layout with incorrect oldBounds!
		
		//this.facade.registerOnEvent('layout.container.minBounds', 
		//							this.handleLayoutContainerMinBounds.bind(this));
		//this.facade.registerOnEvent('layout.container.dockers', 
		//							this.handleLayoutContainerDockers.bind(this));
		
		this.hashedContainers = new Hash();
	},
	
	handleLayoutContainerDockers: function(event) {
		var sh = event.shape;
		
		if (!this.hashedContainers[sh.resourceId]) {
			this.hashedContainers[sh.resourceId] = sh.bounds.clone();
			return;
		}
		
		var offset = sh.bounds.upperLeft();
		offset.x -= this.hashedContainers[sh.resourceId].upperLeft().x;
		offset.y -= this.hashedContainers[sh.resourceId].upperLeft().y;
		
		this.hashedContainers[sh.resourceId] = sh.bounds.clone();
		
		this.moveChildDockers(sh, offset);
	},
	
	/**
	 * 
	 * 
	 * @param {Object} event
	 * 		The layout event object
	 */
	handleLayoutContainerMinBounds: function(event) {
		var shape = event.shape;
		var topOffset = event.topOffset;
		var oldBounds = shape._oldBounds;
		var options = event.options;
		var ignoreList = (options.ignoreChildsWithId ? options.ignoreChildsWithId : new Array());
		
		var childsBounds = this.retrieveChildsIncludingBounds(shape, ignoreList);
		if(!childsBounds) {return;}
		
		/* Get the upper left child shape */
		var ulShape = this.getChildShapesWithout(shape, ignoreList).find(function(node) {
			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
		});
		
		/* Ensure minimum size of the container */
		if(this.ensureContainersMinimumSize(shape, childsBounds, ulShape.absoluteBounds(), ignoreList, options)) {
			return;
		};
		
		
		var childsUl = childsBounds.upperLeft();
		var childsLr = childsBounds.lowerRight();
		var bottomTopSpaceRatio = (childsUl.y ? childsUl.y : 1) / 
				((oldBounds.height() - childsLr.y) ? (oldBounds.height() - childsLr.y) : 1);
		
		var newYValue = bottomTopSpaceRatio * (shape.bounds.height() - childsBounds.height())
						/ (1 + bottomTopSpaceRatio );
		
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape){
			var innerOffset = childShape.bounds.upperLeft().y - childsUl.y;
			childShape.bounds.moveTo({	x: childShape.bounds.upperLeft().x,	
										y: newYValue + innerOffset});
		});
		
		/* Calculate adjustment for dockers */
		var yAdjustment = ulShape.bounds.upperLeft().y - ulShape._oldBounds.upperLeft().y;
		
		/* Move docker by adjustment */
		this.moveChildDockers(shape, {x: 0, y: yAdjustment});
	},
	
	/**
	 * Ensures that the container has a minimum height and width to place all
	 * child elements inside.
	 * 
	 * @param {Object} shape
	 * 		The container.
	 * @param {Object} childsBounds
	 * 		The bounds including all children
	 * @param {Object} ulChildAbsBounds
	 * 		The absolute bounds including all children
	 */
	ensureContainersMinimumSize: function(shape, childsBounds, ulChildAbsBounds, ignoreList, options) {
		var bounds = shape.bounds;
		var ulShape = bounds.upperLeft();
		var lrShape = bounds.lowerRight();
		var ulChilds = childsBounds.upperLeft();
		var lrChilds = childsBounds.lowerRight();
		var absBounds = shape.absoluteBounds();
		if(!options) {
			options = new Object();
		}
		
		if(!shape.isResized) {
			/* Childs movement after widening the conatiner */
			var yMovement = 0;
			var xMovement = 0;
			var changeBounds = false;
			
			/* Widen the shape by the child bounds */
			var ulx = ulShape.x;
			var uly = ulShape.y;
			var lrx = lrShape.x;
			var lry = lrShape.y;
			
			if(ulChilds.x < 0) {
				ulx += ulChilds.x;
				xMovement -= ulChilds.x;
				changeBounds = true;
			}
			
			if(ulChilds.y < 0) {
				uly += ulChilds.y;
				yMovement -= ulChilds.y;
				changeBounds = true;
			}
			
			var xProtrusion = xMovement + ulChilds.x + childsBounds.width()
								- bounds.width();
			if(xProtrusion > 0) {
				lrx += xProtrusion;
				changeBounds = true;
			}
			
			var yProtrusion = yMovement + ulChilds.y + childsBounds.height()
								- bounds.height();
			if(yProtrusion > 0) {
				lry += yProtrusion;
				changeBounds = true;
			}
			
			bounds.set(ulx, uly, lrx, lry);
			
			/* Update hashed bounds for docker positioning */
			if(changeBounds) {
				this.hashedContainers[shape.resourceId] = bounds.clone();
			}
			
			this.moveChildsBy(shape, {x: xMovement, y: yMovement}, ignoreList);
			
			/* Signals that children are already move to correct position */
			return true;
		}
		
		/* Resize container to minimum size */
		
		var ulx = ulShape.x;
		var uly = ulShape.y;
		var lrx = lrShape.x;
		var lry = lrShape.y;
		changeBounds = false;
			
		/* Ensure height */
		if(bounds.height() < childsBounds.height()) {
			/* Shape was resized on upper left in height */
			if(ulShape.y != shape._oldBounds.upperLeft().y &&
				lrShape.y == shape._oldBounds.lowerRight().y) {
				uly = lry - childsBounds.height() - 1;	
				if(options.fixedY) {
					uly -= childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.y == shape._oldBounds.upperLeft().y &&
				lrShape.y != shape._oldBounds.lowerRight().y) {
				lry = uly + childsBounds.height() + 1;	
				if(options.fixedY) {
					lry += childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulyDiff = absBounds.upperLeft().y - ulChildAbsBounds.upperLeft().y;
				var lryDiff = absBounds.lowerRight().y - ulChildAbsBounds.lowerRight().y;
				uly -= ulyDiff;
				lry -= lryDiff;
				uly--;
				lry++;
				changeBounds = true;
			}
		}
		
		/* Ensure width */
		if(bounds.width() < childsBounds.width()) {
			/* Shape was resized on upper left in height */
			if(ulShape.x != shape._oldBounds.upperLeft().x &&
				lrShape.x == shape._oldBounds.lowerRight().x) {
				ulx = lrx - childsBounds.width() - 1;
				if(options.fixedX) {
					ulx -= childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.x == shape._oldBounds.upperLeft().x &&
				lrShape.x != shape._oldBounds.lowerRight().x) {
				lrx = ulx + childsBounds.width() + 1;
				if(options.fixedX) {
					lrx += childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulxDiff = absBounds.upperLeft().x - ulChildAbsBounds.upperLeft().x;
				var lrxDiff = absBounds.lowerRight().x - ulChildAbsBounds.lowerRight().x;
				ulx -= ulxDiff;
				lrx -= lrxDiff;
				ulx--;
				lrx++;
				changeBounds = true;
			}
		}
		
		/* Set minimum bounds */
		bounds.set(ulx, uly, lrx, lry);
		if(changeBounds) {
			//this.hashedContainers[shape.resourceId] = bounds.clone();
			this.handleLayoutContainerDockers({shape:shape});
		}
	},
	
	/**
	 * Moves all child shapes and related dockers of the container shape by the 
	 * relative move point.
	 * 
	 * @param {Object} shape
	 * 		The container shape
	 * @param {Object} relativeMovePoint
	 * 		The point that defines the movement
	 */
	moveChildsBy: function(shape, relativeMovePoint, ignoreList) {
		if(!shape || !relativeMovePoint) {
			return;
		}
		
		/* Move child shapes */
		this.getChildShapesWithout(shape, ignoreList).each(function(child) {
			child.bounds.moveBy(relativeMovePoint);
		});
		
		/* Move related dockers */
		//this.moveChildDockers(shape, relativeMovePoint);
	},
	
	/**
	 * Retrieves the absolute bounds that include all child shapes.
	 * 
	 * @param {Object} shape
	 */
	getAbsoluteBoundsForChildShapes: function(shape) {
//		var childsBounds = this.retrieveChildsIncludingBounds(shape);
//		if(!childsBounds) {return undefined}
//		
//		var ulShape = shape.getChildShapes(false).find(function(node) {
//			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
//		});
//		
////		var lrShape = shape.getChildShapes(false).find(function(node) {
////			return childsBounds.lowerRight().y == node.bounds.lowerRight().y;
////		});
//		
//		var absUl = ulShape.absoluteBounds().upperLeft();
//		
//		this.hashedContainers[shape.getId()].childsBounds = 
//						new ORYX.Core.Bounds(absUl.x, 
//											absUl.y,
//											absUl.x + childsBounds.width(),
//											absUl.y + childsBounds.height());
//		
//		return this.hashedContainers[shape.getId()];
	},
	
	/**
	 * Moves the docker when moving shapes.
	 * 
	 * @param {Object} shape
	 * @param {Object} offset
	 */
	moveChildDockers: function(shape, offset){
		
		if (!offset.x && !offset.y) {
			return;
		} 
		
		// Get all nodes
		shape.getChildNodes(true)
			// Get all incoming and outgoing edges
			.map(function(node){
				return [].concat(node.getIncomingShapes())
						.concat(node.getOutgoingShapes())
			})
			// Flatten all including arrays into one
			.flatten()
			// Get every edge only once
			.uniq()
			// Get all dockers
			.map(function(edge){
				return edge.dockers.length > 2 ? 
						edge.dockers.slice(1, edge.dockers.length-1) : 
						[];
			})
			// Flatten the dockers lists
			.flatten()
			.each(function(docker){
				docker.bounds.moveBy(offset);
			})
	},
	
	/**
	 * Calculates the bounds that include all child shapes of the given shape.
	 * 
	 * @param {Object} shape
	 * 		The parent shape.
	 */
	retrieveChildsIncludingBounds: function(shape, ignoreList) {
		var childsBounds = undefined;
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape, i) {
			if(i == 0) {
				/* Initialize bounds that include all direct child shapes of the shape */
				childsBounds = childShape.bounds.clone();
				return;
			}
			
			/* Include other child elements */
			childsBounds.include(childShape.bounds);			
		});
		
		return childsBounds;
	},
	
	/**
	 * Returns the direct child shapes that are not on the ignore list.
	 */
	getChildShapesWithout: function(shape, ignoreList) {
		var childs = shape.getChildShapes(false);
		return childs.findAll(function(child) {
					return !ignoreList.member(child.getStencil().id());				
				});
	}
}

ORYX.Plugins.ContainerLayouter = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ContainerLayouter);
/**
 * Copyright (c) 2009
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins) { ORYX.Plugins = {} }
if(!ORYX.Plugins.Layouter) { ORYX.Plugins.Layouter = {} }

new function(){
	
	/**
	 * Edge layouter is an implementation to layout an edge
	 * @class ORYX.Plugins.Layouter.EdgeLayouter
	 * @author Willi Tscheschner
	 */
	ORYX.Plugins.Layouter.EdgeLayouter = ORYX.Plugins.AbstractLayouter.extend({
		
		/**
		 * Layout only Edges
		 */
		layouted : [	"http://b3mn.org/stencilset/bpmn1.1#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn1.1#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink",
						"http://b3mn.org/stencilset/epc#ControlFlow",
						"http://www.signavio.com/stencilsets/processmap#ProcessLink",
						"http://www.signavio.com/stencilsets/organigram#connection"],
		
		/**
		 * Layout a set on edges
		 * @param {Object} edges
		 */
		layout: function(edges){
			edges.each(function(edge){
				this.doLayout(edge)
			}.bind(this))
		},
		
		/**
		 * Layout one edge
		 * @param {Object} edge
		 */
		doLayout: function(edge){
			// Get from and to node
			var from 	= edge.getIncomingNodes()[0]; 
			var to 		= edge.getOutgoingNodes()[0];
			
			// Return if one is null
			if (!from || !to) { return }
			
			var positions = this.getPositions(from, to, edge);
		
			if (positions.length > 0){
				this.setDockers(edge, positions[0].a, positions[0].b);
			}
				
		},
		
		/**
		 * Returns a set on positions which are not containt either 
		 * in the bounds in from or to.
		 * @param {Object} from Shape where the edge is come from
		 * @param {Object} to Shape where the edge is leading to
		 * @param {Object} edge Edge between from and to
		 */
		getPositions : function(from, to, edge){
			
			// Get absolute bounds
			var ab = from.absoluteBounds();
			var bb = to.absoluteBounds();
			
			// Get center from and to
			var a = ab.center();
			var b = bb.center();
			
			var am = ab.midPoint();
			var bm = bb.midPoint();
		
			// Get first and last reference point
			var first = Object.clone(edge.dockers.first().referencePoint);
			var last = Object.clone(edge.dockers.last().referencePoint);
			// Get the absolute one
			var aFirst = edge.dockers.first().getAbsoluteReferencePoint();
			var aLast = edge.dockers.last().getAbsoluteReferencePoint(); 
			
			// IF ------>
			// or  |
			//     V
			// Do nothing
			if (Math.abs(aFirst.x-aLast.x) < 1 || Math.abs(aFirst.y-aLast.y) < 1) {
				return []
			}
			
			// Calc center position, between a and b
			// depending on there weight
			var m = {}
			m.x = a.x < b.x ? 
					(((b.x - bb.width()/2) - (a.x + ab.width()/2))/2) + (a.x + ab.width()/2): 
					(((a.x - ab.width()/2) - (b.x + bb.width()/2))/2) + (b.x + bb.width()/2);

			m.y = a.y < b.y ? 
					(((b.y - bb.height()/2) - (a.y + ab.height()/2))/2) + (a.y + ab.height()/2): 
					(((a.y - ab.height()/2) - (b.y + bb.height()/2))/2) + (b.y + bb.height()/2);
								
								
			// Enlarge both bounds with 10
			ab.widen(5); // Wide the from less than 
			bb.widen(20);// the to because of the arrow from the edge
								
			var positions = [];
			var off = this.getOffset.bind(this);
			
			// Checks ----+
			//            |
			//            V
			if (!ab.isIncluded(b.x, a.y)&&!bb.isIncluded(b.x, a.y)) {
				positions.push({
					a : {x:b.x+off(last,bm,"x"),y:a.y+off(first,am,"y")},
					z : this.getWeight(from, a.x < b.x ? "r" : "l", to, a.y < b.y ? "t" : "b", edge)
				});
			}
						
			// Checks | 
			//        +--->
			if (!ab.isIncluded(a.x, b.y)&&!bb.isIncluded(a.x, b.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, a.y < b.y ? "b" : "t", to, a.x < b.x ? "l" : "r", edge)
				});
			}
						
			// Checks  --+
			//           |
			//           +--->
			if (!ab.isIncluded(m.x, a.y)&&!bb.isIncluded(m.x, b.y)) {
				positions.push({
					a : {x:m.x,y:a.y+off(first,am,"y")},
					b : {x:m.x,y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, "r", to, "l", edge, a.x > b.x)
				});
			}
			
			// Checks | 
			//        +---+
			//            |
			//            V
			if (!ab.isIncluded(a.x, m.y)&&!bb.isIncluded(b.x, m.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:m.y},
					b : {x:b.x+off(last,bm,"x"),y:m.y},
					z : this.getWeight(from, "b", to, "t", edge, a.y > b.y)
				});
			}	
			
			// Sort DESC of weights
			return positions.sort(function(a,b){ return a.z < b.z ? 1 : (a.z == b.z ? -1 : -1)});
		},
		
		/**
		 * Returns a offset for the pos to the center of the bounds
		 * 
		 * @param {Object} val
		 * @param {Object} pos2
		 * @param {String} dir Direction x|y
		 */
		getOffset: function(pos, pos2, dir){
			return pos[dir] - pos2[dir];
		},
		
		/**
		 * Returns a value which shows the weight for this configuration
		 * 
		 * @param {Object} from Shape which is coming from
		 * @param {String} d1 Direction where is goes
		 * @param {Object} to Shape which goes to
		 * @param {String} d2 Direction where it comes to
		 * @param {Object} edge Edge between from and to
		 * @param {Boolean} reverse Reverse the direction (e.g. "r" -> "l")
		 */
		getWeight: function(from, d1, to, d2, edge, reverse){
			
			d1 = (d1||"").toLowerCase();
			d2 = (d2||"").toLowerCase();
			
			if (!["t","r","b","l"].include(d1)){ d1 = "r"}
			if (!["t","r","b","l"].include(d2)){ d1 = "l"}
			
			// If reverse is set
			if (reverse) {
				// Reverse d1 and d2
				d1 = d1=="t"?"b":(d1=="r"?"l":(d1=="b"?"t":(d1=="l"?"r":"r")))
				d2 = d2=="t"?"b":(d2=="r"?"l":(d2=="b"?"t":(d2=="l"?"r":"r")))
			}
			
					
			var weight = 0;
			// Get rules for from "out" and to "in"
			var dr1 = this.facade.getRules().getLayoutingRules(from, edge)["out"];
			var dr2 = this.facade.getRules().getLayoutingRules(to, edge)["in"];

			var fromWeight = dr1[d1];
			var toWeight = dr2[d2];


			/**
			 * Return a true if the center 1 is in the same direction than center 2
			 * @param {Object} direction
			 * @param {Object} center1
			 * @param {Object} center2
			 */
			var sameDirection = function(direction, center1, center2){
				switch(direction){
					case "t": return Math.abs(center1.x - center2.x) < 2 && center1.y < center2.y
					case "r": return center1.x > center2.x && Math.abs(center1.y - center2.y) < 2
					case "b": return Math.abs(center1.x - center2.x) < 2 && center1.y > center2.y
					case "l": return center1.x < center2.x && Math.abs(center1.y - center2.y) < 2
					default: return false;
				}
			}

			// Check if there are same incoming edges from 'from'
			var sameIncomingFrom = from
								.getIncomingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d1, e.dockers[e.dockers.length-2].bounds.center(), e.dockers.last().bounds.center());
								});

			// Check if there are same outgoing edges from 'to'
			var sameOutgoingTo = to
								.getOutgoingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d2, e.dockers[1].bounds.center(), e.dockers.first().bounds.center());
								});
			
			// If there are equivalent edges, set 0
			//fromWeight = sameIncomingFrom ? 0 : fromWeight;
			//toWeight = sameOutgoingTo ? 0 : toWeight;
			
			// Get the sum of "out" and the direction plus "in" and the direction 						
			return (sameIncomingFrom||sameOutgoingTo?0:fromWeight+toWeight);
		},
		
		/**
		 * Removes all current dockers from the node 
		 * (except the start and end) and adds two new
		 * dockers, on the position a and b.
		 * @param {Object} edge
		 * @param {Object} a
		 * @param {Object} b
		 */
		setDockers: function(edge, a, b){
			if (!edge){ return }
			
			// Remove all dockers (implicit,
			// start and end dockers will not removed)
			edge.dockers.each(function(r){
				edge.removeDocker(r);
			});
			
			// For a and b (if exists), create
			// a new docker and set position
			[a, b].compact().each(function(pos){
				var docker = edge.createDocker(undefined, pos);
				docker.bounds.centerMoveTo(pos);
			});
			
			// Update all dockers from the edge
			edge.dockers.each(function(docker){
				docker.update()
			})
			
			// Update edge
			//edge.refresh();
			edge._update(true);
			
		}
	});
	
	
}()
if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
if (!ORYX.Config) {
	ORYX.Config = new Object();
}
/*
 * http://oryx.processwave.org/gadget/oryx_stable.xml
 */
ORYX.Config.WaveThisGadgetUri = "http://ddj0ahgq8zch6.cloudfront.net/gadget/oryx_stable.xml";
ORYX.Plugins.WaveThis = Clazz.extend({
	
	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		this.facade.offer({
			'name':				ORYX.I18N.WaveThis.name,
			'functionality': 	this.waveThis.bind(this),
			'group': 			ORYX.I18N.WaveThis.group,
			'icon': 			ORYX.PATH + "images/waveThis.png",
			'description': 		ORYX.I18N.WaveThis.desc,
            'dropDownGroupIcon':ORYX.PATH + "images/export2.png",

		});
		
		this.changeDifference = 0;
		
		// Register on events for executing commands and save, to monitor the changed status of the model 
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODEL_SAVED, function(){ this.changeDifference =0}.bind(this) );

	},
	waveThis: function(){
		var modelUri;
		if(!location.hash.slice(1)){
			Ext.Msg.alert(ORYX.I18N.WaveThis.name, ORYX.I18N.WaveThis.failUnsaved);
			return;
		}
		else{
			modelUri = ORYX.CONFIG.WEB_URL+'/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/json";
		}
		if(this.changeDifference!=0){
	        Ext.Msg.confirm(ORYX.I18N.WaveThis.name, "You have unsaved changes in your model. Proceed?", function(id){
	        	if(id=="yes"){
	        		this._openWave(modelUri);
	        	}
	        },this);
		}else{
			this._openWave(modelUri);
		}
		
	},
	_openWave: function(modelUri){
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			var createHiddenElement = function(name, value) {
				var newElement = document.createElement("input");
				newElement.name=name;
				newElement.type="hidden";
				newElement.value = value;
				return newElement
			}
			
			submitForm.appendChild( createHiddenElement("u", modelUri) );
			submitForm.appendChild( createHiddenElement("g", ORYX.Config.WaveThisGadgetUri) );
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= "https://wave.google.com/wave/wavethis?t=Oryx%20Model%20Export";
			submitForm.submit();
		}
	}
})/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins) {	ORYX.Plugins = new Object();}ORYX.Plugins.Toolbar = Clazz.extend({	facade: undefined,	plugs:	[],	construct: function(facade, ownPluginData) {		this.facade = facade;				this.groupIndex = new Hash();		ownPluginData.properties.each((function(value){			if(value.group && value.index != undefined) {				this.groupIndex[value.group] = value.index			}		}).bind(this));				Ext.QuickTips.init();		this.buttons = [];        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_BUTTON_UPDATE, this.onButtonUpdate.bind(this));        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED, this.onSelectionChanged.bind(this));        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_WINDOW_FOCUS, this.onSelectionChanged.bind(this));        Event.observe(window, "focus", function(event) {       		this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_WINDOW_FOCUS}, null);        }.bind(this));	},        /**     * Can be used to manipulate the state of a button.     * @example     * this.facade.raiseEvent({     *   type: ORYX.CONFIG.EVENT_BUTTON_UPDATE,     *   id: this.buttonId, // have to be generated before and set in the offer method     *   pressed: true     * });     * @param {Object} event     */    onButtonUpdate: function(event){        var button = this.buttons.find(function(button){            return button.id === event.id;        });                if(event.pressed !== undefined){            button.buttonInstance.toggle(event.pressed);        }    },	registryChanged: function(pluginsData) {        // Sort plugins by group and index		var newPlugs =  pluginsData.sortBy((function(value) {			return ((this.groupIndex[value.group] != undefined ? this.groupIndex[value.group] : "" ) + value.group + "" + value.index).toLowerCase();		}).bind(this));		var plugs = $A(newPlugs).findAll(function(value){										return !this.plugs.include( value )									}.bind(this));		if(plugs.length<1)			return;		this.buttons = [];		ORYX.Log.trace("Creating a toolbar.")		if(!this.toolbar){			this.toolbar = new Ext.ux.SlicedToolbar({			height: 24		});				var region = this.facade.addToRegion("north", this.toolbar, "Toolbar");		}						var currentGroupsName = this.plugs.last()?this.plugs.last().group:plugs[0].group;                // Map used to store all drop down buttons of current group        var currentGroupsDropDownButton = {};				plugs.each((function(value) {			if(!value.name) {return}			this.plugs.push(value);            // Add seperator if new group begins			if(currentGroupsName != value.group) {			    this.toolbar.add('-');				currentGroupsName = value.group;                currentGroupsDropDownButton = {};			}			//add eventtracking			var tmp = value.functionality;			value.functionality = function(){				 if ("undefined" != typeof(pageTracker) && "function" == typeof(pageTracker._trackEvent) )				 {					pageTracker._trackEvent("ToolbarButton",value.name)				}				return tmp.apply(this, arguments);			}            // If an drop down group icon is provided, a split button should be used            if(value.dropDownGroupIcon){                var splitButton = currentGroupsDropDownButton[value.dropDownGroupIcon];                                // Create a new split button if this is the first plugin using it                 if(splitButton === undefined){                    splitButton = currentGroupsDropDownButton[value.dropDownGroupIcon] = new Ext.Toolbar.SplitButton({                        cls: "x-btn-icon", //show icon only                        icon: value.dropDownGroupIcon,                        menu: new Ext.menu.Menu({                            items: [] // items are added later on                        }),                        listeners: {                          click: function(button, event){                            // The "normal" button should behave like the arrow button                            if(!button.menu.isVisible() && !button.ignoreNextClick){                                button.showMenu();                            } else {                                button.hideMenu();                            }                          }                         }                    });                                        this.toolbar.add(splitButton);                }                                // General config button which will be used either to create a normal button                // or a check button (if toggling is enabled)                var buttonCfg = {                    icon: value.icon,                    text: value.name,                    itemId: value.id,                    handler: value.toggle ? undefined : value.functionality,                    checkHandler: value.toggle ? value.functionality : undefined,                    listeners: {                        render: function(item){                            // After rendering, a tool tip should be added to component                            if (value.description) {                                new Ext.ToolTip({                                    target: item.getEl(),                                    title: value.description                                })                            }                        }                    }                }                                // Create buttons depending on toggle                if(value.toggle) {                    var button = new Ext.menu.CheckItem(buttonCfg);                } else {                    var button = new Ext.menu.Item(buttonCfg);                }                                splitButton.menu.add(button);                            } else { // create normal, simple button                var button = new Ext.Toolbar.Button({                    icon:           value.icon,         // icons can also be specified inline                    cls:            'x-btn-icon',       // Class who shows only the icon                    itemId:         value.id,					tooltip:        value.description,  // Set the tooltip                    tooltipType:    'title',            // Tooltip will be shown as in the html-title attribute                    handler:        value.toggle ? null : value.functionality,  // Handler for mouse click                    enableToggle:   value.toggle, // Option for enabling toggling                    toggleHandler:  value.toggle ? value.functionality : null // Handler for toggle (Parameters: button, active)                });                                 this.toolbar.add(button);                button.getEl().onclick = function() {this.blur()}            }			     			value['buttonInstance'] = button;			this.buttons.push(value);					}).bind(this));		this.enableButtons([]);        this.toolbar.calcSlices();		window.addEventListener("resize", function(event){this.toolbar.calcSlices()}.bind(this), false);		window.addEventListener("onresize", function(event){this.toolbar.calcSlices()}.bind(this), false);	},		onSelectionChanged: function(event) {		if(!event.elements){			this.enableButtons([]);		}else{			this.enableButtons(event.elements);		}	},	enableButtons: function(elements) {		// Show the Buttons		this.buttons.each((function(value){			value.buttonInstance.enable();									// If there is less elements than minShapes			if(value.minShape && value.minShape > elements.length)				value.buttonInstance.disable();			// If there is more elements than minShapes			if(value.maxShape && value.maxShape < elements.length)				value.buttonInstance.disable();				// If the plugin is not enabled				if(value.isEnabled && !value.isEnabled())				value.buttonInstance.disable();					}).bind(this));			}});Ext.ns("Ext.ux");Ext.ux.SlicedToolbar = Ext.extend(Ext.Toolbar, {    currentSlice: 0,    iconStandardWidth: 22, //22 px     seperatorStandardWidth: 2, //2px, minwidth for Ext.Toolbar.Fill    toolbarStandardPadding: 2,        initComponent: function(){        Ext.apply(this, {        });        Ext.ux.SlicedToolbar.superclass.initComponent.apply(this, arguments);    },        onRender: function(){        Ext.ux.SlicedToolbar.superclass.onRender.apply(this, arguments);    },        onResize: function(){        Ext.ux.SlicedToolbar.superclass.onResize.apply(this, arguments);    },        calcSlices: function(){        var slice = 0;        this.sliceMap = {};        var sliceWidth = 0;        var toolbarWidth = this.getEl().getWidth();        this.items.getRange().each(function(item, index){            //Remove all next and prev buttons            if (item.helperItem) {                item.destroy();                return;            }                        var itemWidth = item.getEl().getWidth();                        if(sliceWidth + itemWidth + 5 * this.iconStandardWidth > toolbarWidth){                var itemIndex = this.items.indexOf(item);                                this.insertSlicingButton("next", slice, itemIndex);                                if (slice !== 0) {                    this.insertSlicingButton("prev", slice, itemIndex);                }                                this.insertSlicingSeperator(slice, itemIndex);                slice += 1;                sliceWidth = 0;            }                        this.sliceMap[item.id] = slice;            sliceWidth += itemWidth;        }.bind(this));                // Add prev button at the end        if(slice > 0){            this.insertSlicingSeperator(slice, this.items.getCount()+1);            this.insertSlicingButton("prev", slice, this.items.getCount()+1);            var spacer = new Ext.Toolbar.Spacer();            this.insertSlicedHelperButton(spacer, slice, this.items.getCount()+1);            Ext.get(spacer.id).setWidth(this.iconStandardWidth);        }                this.maxSlice = slice;                // Update view        this.setCurrentSlice(this.currentSlice);    },        insertSlicedButton: function(button, slice, index){        this.insertButton(index, button);        this.sliceMap[button.id] = slice;    },        insertSlicedHelperButton: function(button, slice, index){        button.helperItem = true;        this.insertSlicedButton(button, slice, index);    },        insertSlicingSeperator: function(slice, index){        // Align right        this.insertSlicedHelperButton(new Ext.Toolbar.Fill(), slice, index);    },        // type => next or prev    insertSlicingButton: function(type, slice, index){        var nextHandler = function(){this.setCurrentSlice(this.currentSlice+1)}.bind(this);        var prevHandler = function(){this.setCurrentSlice(this.currentSlice-1)}.bind(this);                var button = new Ext.Toolbar.Button({            cls: "x-btn-icon",            icon: ORYX.CONFIG.ROOT_PATH + "images/toolbar_"+type+".png",            handler: (type === "next") ? nextHandler : prevHandler        });                this.insertSlicedHelperButton(button, slice, index);    },        setCurrentSlice: function(slice){        if(slice > this.maxSlice || slice < 0) return;                this.currentSlice = slice;        this.items.getRange().each(function(item){            item.setVisible(slice === this.sliceMap[item.id]);        }.bind(this));    }});/** * Copyright (c) 2009 * Jan-Felix Schwarz, Willi Tscheschner, Nicolas Peters, Martin Czuchra, Daniel Polak * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if(!ORYX.Plugins) {	ORYX.Plugins = new Object();}ORYX.Plugins.ShapeMenuPlugin = {	construct: function(facade) {		this.facade = facade;				this.alignGroups = new Hash();		var containerNode = this.facade.getCanvas().getHTMLContainer();		this.shapeMenu = new ORYX.Plugins.ShapeMenu(containerNode);		this.currentShapes = [];		// Register on dragging and resizing events for show/hide of ShapeMenu		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START, this.hideShapeMenu.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,  this.showShapeMenu.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_START,  (function(){			this.hideShapeMenu();			this.hideMorphMenu();		}).bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_END,  this.showShapeMenu.bind(this));				// Enable DragZone		var DragZone = new Ext.dd.DragZone(containerNode.parentNode, {shadow: !Ext.isMac});		DragZone.afterDragDrop = this.afterDragging.bind(this, DragZone);		DragZone.beforeDragOver = this.beforeDragOver.bind(this, DragZone);				// Memory of created Buttons		this.createdButtons = {};				this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED, (function(){ this.registryChanged() }).bind(this));		this.timer = null;				this.resetElements = true;	},	hideShapeMenu: function(event) {		window.clearTimeout(this.timer);		this.timer = null;		this.shapeMenu.hide();	},	showShapeMenu: function( dontGenerateNew ) {			if( !dontGenerateNew || this.resetElements ){						window.clearTimeout(this.timer);			this.timer = window.setTimeout(function(){									// Close all Buttons				this.shapeMenu.closeAllButtons();						// Show the Morph Button				this.showMorphButton(this.currentShapes);								// Show the Stencil Buttons				this.showStencilButtons(this.currentShapes);									// Show the ShapeMenu				this.shapeMenu.show(this.currentShapes);								this.resetElements = false;			}.bind(this), 300)					} else {						window.clearTimeout(this.timer);			this.timer = null;						// Show the ShapeMenu			this.shapeMenu.show(this.currentShapes);					}	},	registryChanged: function(pluginsData) {				if(pluginsData) {			pluginsData = pluginsData.each(function(value) {value.group = value.group ? value.group : 'unknown'});			this.pluginsData = pluginsData.sortBy( function(value) {				return (value.group + "" + value.index);			});					}						this.shapeMenu.removeAllButtons();		this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_RIGHT, 2);		this.createdButtons = {};				this.createMorphMenu();				if( !this.pluginsData ){			this.pluginsData = [];		}		this.baseMorphStencils = this.facade.getRules().baseMorphs();				// Checks if the stencil set has morphing attributes		var isMorphing = this.facade.getRules().containsMorphingRules();				// Create Buttons for all Stencils of all loaded stencilsets		var stencilsets = this.facade.getStencilSets();		stencilsets.values().each((function(stencilSet){						var nodes = stencilSet.nodes();			nodes.each((function(stencil) {												// Create a button for each node				var option = {type: stencil.id(), namespace: stencil.namespace(), connectingType: true};				var button = new ORYX.Plugins.ShapeMenuButton({					callback: 	this.newShape.bind(this, option),					icon: 		stencil.icon(),					align: 		ORYX.CONFIG.SHAPEMENU_RIGHT,					group:		0,					//dragcallback: this.hideShapeMenu.bind(this),					msg:		stencil.title() + " - " + ORYX.I18N.ShapeMenuPlugin.clickDrag					});								// Add button to shape menu				this.shapeMenu.addButton(button); 								// Add to the created Button Array				this.createdButtons[stencil.namespace() + stencil.type() + stencil.id()] = button;								// Drag'n'Drop will enable				Ext.dd.Registry.register(button.node.lastChild, option);							}).bind(this));					var edges = stencilSet.edges();			edges.each((function(stencil) {				// Create a button for each edge				var option = {type: stencil.id(), namespace: stencil.namespace()};				var button = new ORYX.Plugins.ShapeMenuButton({					callback: 	this.newShape.bind(this, option),					// icon: 		isMorphing ? ORYX.PATH + "images/edges.png" : stencil.icon(),					icon: 		stencil.icon(),					align: 		ORYX.CONFIG.SHAPEMENU_RIGHT,					group:		1,					//dragcallback: this.hideShapeMenu.bind(this),					msg:		(isMorphing ? ORYX.I18N.Edge : stencil.title()) + " - " + ORYX.I18N.ShapeMenuPlugin.drag				});								// Add button to shape menu				this.shapeMenu.addButton(button); 								// Add to the created Button Array				this.createdButtons[stencil.namespace() + stencil.type() + stencil.id()] = button;								// Drag'n'Drop will enable				Ext.dd.Registry.register(button.node.lastChild, option);							}).bind(this));				}).bind(this));										},		createMorphMenu: function() {				this.morphMenu = new Ext.menu.Menu({			id: 'Oryx_morph_menu',			items: []		});				this.morphMenu.on("mouseover", function() {			this.morphMenuHovered = true;		}, this);		this.morphMenu.on("mouseout", function() {			this.morphMenuHovered = false;		}, this);						// Create the button to show the morph menu		var button = new ORYX.Plugins.ShapeMenuButton({			hovercallback: 	(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER ? this.showMorphMenu.bind(this) : undefined), 			resetcallback: 	(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER ? this.hideMorphMenu.bind(this) : undefined), 			callback:		(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER ? undefined : this.toggleMorphMenu.bind(this)), 			icon: 			ORYX.PATH + 'images/wrench_orange.png',			align: 			ORYX.CONFIG.SHAPEMENU_BOTTOM,			group:			0,			msg:			ORYX.I18N.ShapeMenuPlugin.morphMsg		});								this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_BOTTOM, 1)		this.shapeMenu.addButton(button);		this.morphMenu.getEl().appendTo(button.node);		this.morphButton = button;	},		showMorphMenu: function() {		this.morphMenu.show(this.morphButton.node);		this._morphMenuShown = true;	},		hideMorphMenu: function() {		this.morphMenu.hide();		this._morphMenuShown = false;	},		toggleMorphMenu: function() {		if(this._morphMenuShown)			this.hideMorphMenu();		else			this.showMorphMenu();	},		onSelectionChanged: function(event) {		var elements = event.elements;		this.hideShapeMenu();		this.hideMorphMenu();						if( this.currentShapes.inspect() !== elements.inspect() ){			this.currentShapes = elements;			this.resetElements = true;						this.showShapeMenu();		} else {			this.showShapeMenu(true)		}			},		/**	 * Show button for morphing the selected shape into another stencil	 */	showMorphButton: function(elements) {				if(elements.length != 1) return;				var possibleMorphs = this.facade.getRules().morphStencils({ stencil: elements[0].getStencil() });		possibleMorphs = possibleMorphs.select(function(morph) {			if(elements[0].getStencil().type() === "node") {				//check containment rules				return this.facade.getRules().canContain({containingShape:elements[0].parent, containedStencil:morph});			} else { 				//check connect rules				return this.facade.getRules().canConnect({											sourceShape:	elements[0].dockers.first().getDockedShape(), 											edgeStencil:	morph, 											targetShape:	elements[0].dockers.last().getDockedShape()											});				}		}.bind(this));		if(possibleMorphs.size()<=1) return; // if morphing to other stencils is not possible, don't show button				this.morphMenu.removeAll();				// populate morph menu with the possible morph stencils ordered by their position		possibleMorphs = possibleMorphs.sortBy(function(stencil) { return stencil.position(); });		possibleMorphs.each((function(morph) {			var menuItem = new Ext.menu.Item({ 				text: morph.title(), 				icon: morph.icon(), 				disabled: morph.id()==elements[0].getStencil().id(),				disabledClass: ORYX.CONFIG.MORPHITEM_DISABLED,				handler: (function() { this.morphShape(elements[0], morph); }).bind(this) 			});			this.morphMenu.add(menuItem);		}).bind(this));				this.morphButton.prepareToShow();			},	/**	 * Show buttons for creating following shapes	 */	showStencilButtons: function(elements) {		if(elements.length != 1) return;		//TODO temporaere nutzung des stencilsets		var sset = this.facade.getStencilSets()[elements[0].getStencil().namespace()];		// Get all available edges		var edges = this.facade.getRules().outgoingEdgeStencils({canvas:this.facade.getCanvas(), sourceShape:elements[0]});				// And find all targets for each Edge		var targets = new Array();		var addedEdges = new Array();				var isMorphing = this.facade.getRules().containsMorphingRules();				edges.each((function(edge) {						if (isMorphing){				if(this.baseMorphStencils.include(edge)) {					var shallAppear = true;				} else {										// if edge is member of a morph groups where none of the base morphs is in the outgoing edges					// we want to display the button (but only for the first one)										var possibleMorphs = this.facade.getRules().morphStencils({ stencil: edge });										var shallAppear = !possibleMorphs.any((function(morphStencil) {						if(this.baseMorphStencils.include(morphStencil) && edges.include(morphStencil)) return true;						return addedEdges.include(morphStencil);					}).bind(this));									}			}			if(shallAppear || !isMorphing) {				if(this.createdButtons[edge.namespace() + edge.type() + edge.id()]) 					this.createdButtons[edge.namespace() + edge.type() + edge.id()].prepareToShow();				addedEdges.push(edge);			}						// get all targets for this edge			targets = targets.concat(this.facade.getRules().targetStencils(					{canvas:this.facade.getCanvas(), sourceShape:elements[0], edgeStencil:edge}));		}).bind(this));				targets.uniq();				var addedTargets = new Array();		// Iterate all possible target 		targets.each((function(target) {						if (isMorphing){								// continue with next target stencil				if (target.type()==="edge") return; 								// continue when stencil should not shown in the shape menu				if (!this.facade.getRules().showInShapeMenu(target)) return 								// if target is not a base morph 				if(!this.baseMorphStencils.include(target)) {										// if target is member of a morph groups where none of the base morphs is in the targets					// we want to display the button (but only for the first one)										var possibleMorphs = this.facade.getRules().morphStencils({ stencil: target });					if(possibleMorphs.size()==0) return; // continue with next target						var baseMorphInTargets = possibleMorphs.any((function(morphStencil) {						if(this.baseMorphStencils.include(morphStencil) && targets.include(morphStencil)) return true;						return addedTargets.include(morphStencil);					}).bind(this));										if(baseMorphInTargets) return; // continue with next target				}			}						// if this is reached the button shall appear in the shape menu:			if(this.createdButtons[target.namespace() + target.type() + target.id()]) 				this.createdButtons[target.namespace() + target.type() + target.id()].prepareToShow();			addedTargets.push(target);					}).bind(this));			},		beforeDragOver: function(dragZone, target, event){		if (this.shapeMenu.isVisible){			this.hideShapeMenu();		}		var coord = this.facade.eventCoordinates(event.browserEvent);		var aShapes = this.facade.getCanvas().getAbstractShapesAtPosition(coord);		if(aShapes.length <= 0) {return false;}					var el = aShapes.last();				if(this._lastOverElement == el) {						return false;					} else {			// check containment rules			var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);						// revert to original options if these were modified			if(option.backupOptions) {				for(key in option.backupOptions) {					option[key] = option.backupOptions[key];				}				delete option.backupOptions;			}			var stencilSet = this.facade.getStencilSets()[option.namespace];			var stencil = stencilSet.stencil(option.type);			var candidate = aShapes.last();			if(stencil.type() === "node") {				//check containment rules				var canContain = this.facade.getRules().canContain({containingShape:candidate, containedStencil:stencil});													// if not canContain, try to find a morph which can be contained				if(!canContain) {					var possibleMorphs = this.facade.getRules().morphStencils({stencil: stencil});					for(var i=0; i<possibleMorphs.size(); i++) {						canContain = this.facade.getRules().canContain({							containingShape:candidate, 							containedStencil:possibleMorphs[i]						});						if(canContain) {							option.backupOptions = Object.clone(option);							option.type = possibleMorphs[i].id();							option.namespace = possibleMorphs[i].namespace();							break;						}					}				}									this._currentReference = canContain ? candidate : undefined;									} else { //Edge							var curCan = candidate, orgCan = candidate;				var canConnect = false;				while(!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)){					candidate = curCan;					//check connection rules					canConnect = this.facade.getRules().canConnect({											sourceShape: this.currentShapes.first(), 											edgeStencil: stencil, 											targetShape: curCan											});						curCan = curCan.parent;				}			 	// if not canConnect, try to find a morph which can be connected				if(!canConnect) {										candidate = orgCan;					var possibleMorphs = this.facade.getRules().morphStencils({stencil: stencil});					for(var i=0; i<possibleMorphs.size(); i++) {						var curCan = candidate;						var canConnect = false;						while(!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)){							candidate = curCan;							//check connection rules							canConnect = this.facade.getRules().canConnect({														sourceShape:	this.currentShapes.first(), 														edgeStencil:	possibleMorphs[i], 														targetShape:	curCan													});								curCan = curCan.parent;						}						if(canConnect) {							option.backupOptions = Object.clone(option);							option.type = possibleMorphs[i].id();							option.namespace = possibleMorphs[i].namespace();							break;						} else {							candidate = orgCan;						}					}				}														this._currentReference = canConnect ? candidate : undefined;									}				this.facade.raiseEvent({											type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 											highlightId:'shapeMenu',											elements:	[candidate],											color:		this._currentReference ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR										});															var pr = dragZone.getProxy();			pr.setStatus(this._currentReference ? pr.dropAllowed : pr.dropNotAllowed );			pr.sync();												}				this._lastOverElement = el;				return false;	},		afterDragging: function(dragZone, target, event) {				if (!(this.currentShapes instanceof Array)||this.currentShapes.length<=0) {			return;		}		var sourceShape = this.currentShapes;				this._lastOverElement = undefined;				// Hide the highlighting		this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeMenu'});				// Check if drop is allowed		var proxy = dragZone.getProxy()		if(proxy.dropStatus == proxy.dropNotAllowed) { return this.facade.updateSelection();}						// Check if there is a current Parent		if(!this._currentReference) { return }						var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);		option['parent'] = this._currentReference;		var xy = event.getXY();		var pos = {x: xy[0], y: xy[1]};		var a = this.facade.getCanvas().node.getScreenCTM();		// Correcting the UpperLeft-Offset		pos.x -= a.e; pos.y -= a.f;		// Correcting the Zoom-Faktor		pos.x /= a.a; pos.y /= a.d;		// Correcting the ScrollOffset		pos.x -= document.documentElement.scrollLeft;		pos.y -= document.documentElement.scrollTop;		var parentAbs = this._currentReference.absoluteXY();		pos.x -= parentAbs.x;		pos.y -= parentAbs.y;				// If the ctrl key is not pressed, 		// snapp the new shape to the center 		// if it is near to the center of the other shape		if (!event.ctrlKey){			// Get the center of the shape			var cShape = this.currentShapes[0].bounds.center();			// Snapp +-20 Pixel horizontal to the center 			if (20 > Math.abs(cShape.x - pos.x)){				pos.x = cShape.x;			}			// Snapp +-20 Pixel vertical to the center 			if (20 > Math.abs(cShape.y - pos.y)){				pos.y = cShape.y;			}		}						option['position'] = pos;		option['connectedShape'] = this.currentShapes[0];		if(option['connectingType']) {			var stencilset = this.facade.getStencilSets()[option.namespace];			var containedStencil = stencilset.stencil(option.type);			var args = { sourceShape: this.currentShapes[0], targetStencil: containedStencil };			option['connectingType'] = this.facade.getRules().connectMorph(args).id();		}				if (ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true) {			delete option['connectingType'];		}					var command = new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(Object.clone(option), this._currentReference, pos, this);				this.facade.executeCommands([command]);				// Inform about completed Drag 		this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE, source:sourceShape, destination:this.currentShapes});				// revert to original options if these were modified		if(option.backupOptions) {			for(key in option.backupOptions) {				option[key] = option.backupOptions[key];			}			delete option.backupOptions;		}					this._currentReference = undefined;			},	newShape: function(option, event) {		var stencilset = this.facade.getStencilSets()[option.namespace];		var containedStencil = stencilset.stencil(option.type);		if(this.facade.getRules().canContain({			containingShape:this.currentShapes.first().parent,			"containedStencil":containedStencil
		})) {			option['connectedShape'] = this.currentShapes[0];			option['parent'] = this.currentShapes.first().parent;			option['containedStencil'] = containedStencil;					var args = { sourceShape: this.currentShapes[0], targetStencil: containedStencil };			var targetStencil = this.facade.getRules().connectMorph(args);			if (!targetStencil){ return }// Check if there can be a target shape			option['connectingType'] = targetStencil.id();			if (ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true) {				delete option['connectingType'];			}						var command = new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(option, undefined, undefined, this);					this.facade.executeCommands([command]);		}	},		/**	 * Morph a shape to a new stencil	 * {Command implemented}	 * @param {Shape} shape	 * @param {Stencil} stencil	 */	morphShape: function(shape, stencil) {				var MorphTo = ORYX.Core.Command.extend({			construct: function(shape, stencil, facade){				this.shape = shape;				this.stencil = stencil;				this.facade = facade;			},			execute: function(){								var shape = this.shape;				var stencil = this.stencil;				var resourceId = shape.resourceId;								// Serialize all attributes				var serialized = shape.serialize();				stencil.properties().each((function(prop) {					if(prop.readonly()) {						serialized = serialized.reject(function(serProp) {							return serProp.name==prop.id();						});					}				}).bind(this));						// Get shape if already created, otherwise create a new shape				if (this.newShape){					newShape = this.newShape;					this.facade.getCanvas().add(newShape);				} else {					newShape = this.facade.createShape({									type: stencil.id(),									namespace: stencil.namespace(),									resourceId: resourceId								});				}								// calculate new bounds using old shape's upperLeft and new shape's width/height				var boundsObj = serialized.find(function(serProp){					return (serProp.prefix === "oryx" && serProp.name === "bounds");				});								var changedBounds = null;								if(!this.facade.getRules().preserveBounds(shape.getStencil())) {										var bounds = boundsObj.value.split(",");					if (parseInt(bounds[0], 10) > parseInt(bounds[2], 10)) { // if lowerRight comes first, swap array items						var tmp = bounds[0];						bounds[0] = bounds[2];						bounds[2] = tmp;						tmp = bounds[1];						bounds[1] = bounds[3];						bounds[3] = tmp;					}					bounds[2] = parseInt(bounds[0], 10) + newShape.bounds.width();					bounds[3] = parseInt(bounds[1], 10) + newShape.bounds.height();					boundsObj.value = bounds.join(",");									}  else {										var height = shape.bounds.height();					var width  = shape.bounds.width();										// consider the minimum and maximum size of					// the new shape										if (newShape.minimumSize) {						if (shape.bounds.height() < newShape.minimumSize.height) {							height = newShape.minimumSize.height;						}																		if (shape.bounds.width() < newShape.minimumSize.width) {							width = newShape.minimumSize.width;						}					}										if(newShape.maximumSize) {						if(shape.bounds.height() > newShape.maximumSize.height) {							height = newShape.maximumSize.height;						}													if(shape.bounds.width() > newShape.maximumSize.width) {							width = newShape.maximumSize.width;						}					}										changedBounds = {						a : {							x: shape.bounds.a.x,							y: shape.bounds.a.y						},						b : {							x: shape.bounds.a.x + width,							y: shape.bounds.a.y + height						}											};									}								var oPos = shape.bounds.center();				if(changedBounds !== null) {					newShape.bounds.set(changedBounds);				}								// Set all related dockers				this.setRelatedDockers(shape, newShape);								// store DOM position of old shape				var parentNode = shape.node.parentNode;				var nextSibling = shape.node.nextSibling;								// Delete the old shape				this.facade.deleteShape(shape);								// Deserialize the new shape - Set all attributes				newShape.deserialize(serialized);				/*				 * Change color to default if unchanged				 * 23.04.2010				 */				if(shape.getStencil().property("oryx-bgcolor") 						&& shape.properties["oryx-bgcolor"]						&& shape.getStencil().property("oryx-bgcolor").value().toUpperCase()== shape.properties["oryx-bgcolor"].toUpperCase()){						if(newShape.getStencil().property("oryx-bgcolor")){							newShape.setProperty("oryx-bgcolor", newShape.getStencil().property("oryx-bgcolor").value());						}				}					if(changedBounds !== null) {					newShape.bounds.set(changedBounds);				}								if(newShape.getStencil().type()==="edge" || (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {					newShape.bounds.centerMoveTo(oPos);				} 								if(newShape.getStencil().type()==="node" && (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {					this.setRelatedDockers(newShape, newShape);									}								// place at the DOM position of the old shape				if(nextSibling) parentNode.insertBefore(newShape.node, nextSibling);				else parentNode.appendChild(newShape.node);								// Set selection				this.facade.setSelection([newShape]);				this.facade.getCanvas().update();				this.facade.updateSelection();				this.newShape = newShape;								this.facade.raiseEvent({					type: ORYX.CONFIG.EVENT_SHAPE_MORPHED,					shape: newShape				});							},			rollback: function(){								if (!this.shape || !this.newShape || !this.newShape.parent) {return}								// Append shape to the parent				this.newShape.parent.add(this.shape);				// Set dockers				this.setRelatedDockers(this.newShape, this.shape);				// Delete new shape				this.facade.deleteShape(this.newShape);				// Set selection				this.facade.setSelection([this.shape]);				// Update				this.facade.getCanvas().update();				this.facade.updateSelection();			},						/**			 * Set all incoming and outgoing edges from the shape to the new shape			 * @param {Shape} shape			 * @param {Shape} newShape			 */			setRelatedDockers: function(shape, newShape){								if(shape.getStencil().type()==="node") {										(shape.incoming||[]).concat(shape.outgoing||[])						.each(function(i) { 							i.dockers.each(function(docker) {								if (docker.getDockedShape() == shape) {									var rPoint = Object.clone(docker.referencePoint);									// Move reference point per percent									var rPointNew = {										x: rPoint.x*newShape.bounds.width()/shape.bounds.width(),										y: rPoint.y*newShape.bounds.height()/shape.bounds.height()									};									docker.setDockedShape(newShape);									// Set reference point and center to new position									docker.setReferencePoint(rPointNew);									if(i instanceof ORYX.Core.Edge) {										docker.bounds.centerMoveTo(rPointNew);									} else {										var absXY = shape.absoluteXY();										docker.bounds.centerMoveTo({x:rPointNew.x+absXY.x, y:rPointNew.y+absXY.y});										//docker.bounds.moveBy({x:rPointNew.x-rPoint.x, y:rPointNew.y-rPoint.y});									}								}							});							});										// for attached events					if(shape.dockers.length>0&&shape.dockers.first().getDockedShape()) {						newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());						newShape.dockers.first().setReferencePoint(Object.clone(shape.dockers.first().referencePoint));					}								} else { // is edge					newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());					newShape.dockers.first().setReferencePoint(shape.dockers.first().referencePoint);					newShape.dockers.last().setDockedShape(shape.dockers.last().getDockedShape());					newShape.dockers.last().setReferencePoint(shape.dockers.last().referencePoint);				}			}		});				// Create and execute command (for undo/redo)					var command = new MorphTo(shape, stencil, this.facade);		this.facade.executeCommands([command]);	}}ORYX.Plugins.ShapeMenuPlugin = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ShapeMenuPlugin);ORYX.Plugins.ShapeMenu = {	/***	 * Constructor.	 */	construct: function(parentNode) {		this.bounds = undefined;		this.shapes = undefined;		this.buttons = [];		this.isVisible = false;		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(parentNode),			['div', {id: ORYX.Editor.provideId(), 'class':'Oryx_ShapeMenu'}]);				this.alignContainers = new Hash();		this.numberOfButtonsPerLevel = new Hash();	},	addButton: function(button) {		this.buttons.push(button);		// lazy grafting of the align containers		if(!this.alignContainers[button.align]) {			this.alignContainers[button.align] = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.node,					['div', {'class':button.align}]);			this.node.appendChild(this.alignContainers[button.align]);						// add event listeners for hover effect			var onBubble = false;			this.alignContainers[button.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this.hoverAlignContainer.bind(this, button.align), onBubble);			this.alignContainers[button.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, this.resetAlignContainer.bind(this, button.align), onBubble);			this.alignContainers[button.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.hoverAlignContainer.bind(this, button.align), onBubble);		}		this.alignContainers[button.align].appendChild(button.node);	},	deleteButton: function(button) {		this.buttons = this.buttons.without(button);		this.node.removeChild(button.node);	},	removeAllButtons: function() {		var me = this;		this.buttons.each(function(value){			if (value.node&&value.node.parentNode)				value.node.parentNode.removeChild(value.node);		});		this.buttons = [];	},	closeAllButtons: function() {		this.buttons.each(function(value){ value.prepareToHide() });		this.isVisible = false;	},		/**	 * Show the shape menu	 */	show: function(shapes) {		//shapes = (shapes||[]).findAll(function(r){ return r && r.node && r.node.parent });		if(shapes.length <= 0 )			return		this.shapes = shapes;		var newBounds = undefined;		var tmpBounds = undefined;		this.shapes.each(function(value) {			var a = value.node.getScreenCTM();			var upL = value.absoluteXY();			a.e = a.a*upL.x;			a.f = a.d*upL.y;			tmpBounds = new ORYX.Core.Bounds(a.e, a.f, a.e+a.a*value.bounds.width(), a.f+a.d*value.bounds.height());			/*if(value instanceof ORYX.Core.Edge) {				tmpBounds.moveBy(value.bounds.upperLeft())			}*/			if(!newBounds)				newBounds = tmpBounds			else				newBounds.include(tmpBounds);		});		this.bounds = newBounds;		//this.bounds.moveBy({x:document.documentElement.scrollLeft, y:document.documentElement.scrollTop});		var bounds = this.bounds;		var a = this.bounds.upperLeft();		var left = 0,			leftButtonGroup = 0;		var top = 0,			topButtonGroup = 0;		var bottom = 0,			bottomButtonGroup;		var right = 0			rightButtonGroup = 0;		var size = 22;				this.getWillShowButtons().sortBy(function(button) {			return button.group;		});				this.getWillShowButtons().each(function(button){						var numOfButtonsPerLevel = this.getNumberOfButtonsPerLevel(button.align);			if (button.align == ORYX.CONFIG.SHAPEMENU_LEFT) {				// vertical levels				if(button.group!=leftButtonGroup) {					left = 0;					leftButtonGroup = button.group;				}				var x = Math.floor(left / numOfButtonsPerLevel)				var y = left % numOfButtonsPerLevel;								button.setLevel(x);								button.setPosition(a.x-5 - (x+1)*size, 						a.y+numOfButtonsPerLevel*button.group*size + button.group*0.3*size + y*size);								//button.setPosition(a.x-22, a.y+left*size);				left++; 			} else if (button.align == ORYX.CONFIG.SHAPEMENU_TOP) { 				// horizontal levels 				if(button.group!=topButtonGroup) {					top = 0;					topButtonGroup = button.group;				} 				var x = top % numOfButtonsPerLevel; 				var y = Math.floor(top / numOfButtonsPerLevel); 				 				button.setLevel(y); 				 				button.setPosition(a.x+numOfButtonsPerLevel*button.group*size + button.group*0.3*size + x*size, 						a.y-5 - (y+1)*size);				top++; 			} else if (button.align == ORYX.CONFIG.SHAPEMENU_BOTTOM) { 				// horizontal levels 				if(button.group!=bottomButtonGroup) {					bottom = 0;					bottomButtonGroup = button.group;				} 				var x = bottom % numOfButtonsPerLevel; 				var y = Math.floor(bottom / numOfButtonsPerLevel); 				 				button.setLevel(y); 				 				button.setPosition(a.x+numOfButtonsPerLevel*button.group*size + button.group*0.3*size + x*size, 						a.y+bounds.height() + 5 + y*size);				bottom++;			} else {				// vertical levels				if(button.group!=rightButtonGroup) {					right = 0;					rightButtonGroup = button.group;				}				var x = Math.floor(right / numOfButtonsPerLevel)				var y = right % numOfButtonsPerLevel;								button.setLevel(x);								button.setPosition(a.x+bounds.width() + 5 + x*size, 						a.y+numOfButtonsPerLevel*button.group*size + button.group*0.3*size + y*size - 5);				right++;			}			button.show();		}.bind(this));		this.isVisible = true;	},	/**	 * Hide the shape menu	 */	hide: function() {		this.buttons.each(function(button){			button.hide();		});		this.isVisible = false;		//this.bounds = undefined;		//this.shape = undefined;	},	hoverAlignContainer: function(align, evt) {		this.buttons.each(function(button){			if(button.align == align) button.showOpaque();		});	},		resetAlignContainer: function(align, evt) {		this.buttons.each(function(button){			if(button.align == align) button.showTransparent();		});	},		isHover: function() {		return 	this.buttons.any(function(value){					return value.isHover();				});	},		getWillShowButtons: function() {		return this.buttons.findAll(function(value){return value.willShow});	},		/**	 * Returns a set on buttons for that align value	 * @params {String} align	 * @params {String} group	 */	getButtons: function(align, group){		return this.getWillShowButtons().findAll(function(b){ return b.align == align && (group === undefined || b.group == group)})	},		/**	 * Set the number of buttons to display on each level of the shape menu in the specified align group.	 * Example: setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_RIGHT, 2) causes that the buttons of the right align group 	 * will be rendered in 2 rows.	 */	setNumberOfButtonsPerLevel: function(align, number) {		this.numberOfButtonsPerLevel[align] = number;	},		/**	 * Returns the number of buttons to display on each level of the shape menu in the specified align group.	 * Default value is 1	 */	getNumberOfButtonsPerLevel: function(align) {		if(this.numberOfButtonsPerLevel[align])			return Math.min(this.getButtons(align,0).length, this.numberOfButtonsPerLevel[align]);		else			return 1;	}}ORYX.Plugins.ShapeMenu = Clazz.extend(ORYX.Plugins.ShapeMenu);ORYX.Plugins.ShapeMenuButton = {		/**	 * Constructor	 * @param option A key map specifying the configuration options:	 * 					id: 	(String) The id of the parent DOM element for the new button	 * 					icon: 	(String) The url to the icon of the button	 * 					msg:	(String) A tooltip message	 * 					caption:(String) The caption of the button (attention: button width > 22, only set for single column button layouts)	 * 					align:	(String) The direction in which the button is aligned	 * 					group: 	(Integer) The button group in the specified alignment 	 * 							(buttons in the same group will be aligned side by side)	 * 					callback:		(Function) A callback that is executed when the button is clicked	 * 					dragcallback:	(Function) A callback that is executed when the button is dragged	 * 					hovercallback:	(Function) A callback that is executed when the button is hovered	 * 					resetcallback:	(Function) A callback that is executed when the button is reset	 * 					arguments:		(Array) An argument array to pass to the callback functions	 */	construct: function(option) {		if(option) {			this.option = option;			if(!this.option.arguments)				this.option.arguments = [];		} else {			//TODO error		}		this.parentId = this.option.id ? this.option.id : null;		// graft the button.		var buttonClassName = this.option.caption ? "Oryx_button_with_caption" : "Oryx_button";		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(this.parentId),			['div', {'class':buttonClassName}]);		var imgOptions = {src:this.option.icon};		if(this.option.msg){			imgOptions.title = this.option.msg;		}				// graft and update icon (not in grafting for ns reasons).		//TODO Enrich graft()-function to do this in one of the above steps.		if(this.option.icon)			ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.node,				['img', imgOptions]);				if(this.option.caption) {			var captionNode = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.node, ['span']);			ORYX.Editor.graft("http://www.w3.org/1999/xhtml", captionNode, this.option.caption);		}		var onBubble = false;		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this.hover.bind(this), onBubble);		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, this.reset.bind(this), onBubble);		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.activate.bind(this), onBubble);		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.hover.bind(this), onBubble);		this.node.addEventListener('click', this.trigger.bind(this), onBubble);		this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.move.bind(this), onBubble);		this.align = this.option.align ? this.option.align : ORYX.CONFIG.SHAPEMENU_RIGHT;		this.group = this.option.group ? this.option.group : 0;		this.hide();		this.dragStart 	= false;		this.isVisible 	= false;		this.willShow 	= false;		this.resetTimer;	},		hide: function() {		this.node.style.display = "none";		this.isVisible = false;	},	show: function() {		this.node.style.display = "";		this.node.style.opacity = this.opacity;		this.isVisible = true;	},		showOpaque: function() {		this.node.style.opacity = 1.0;	},		showTransparent: function() {		this.node.style.opacity = this.opacity;	},		prepareToShow: function() {		this.willShow = true;	},	prepareToHide: function() {		this.willShow = false;		this.hide();	},	setPosition: function(x, y) {		this.node.style.left = x + "px";		this.node.style.top = y + "px";	},		setLevel: function(level) {		if(level==0) this.opacity = 0.5;		else if(level==1) this.opacity = 0.2;		//else if(level==2) this.opacity = 0.1;		else this.opacity = 0.0;	},		setChildWidth: function(width) {		this.childNode.style.width = width + "px";	},	reset: function(evt) {		// Delete the timeout for hiding		window.clearTimeout( this.resetTimer )		this.resetTimer = window.setTimeout( this.doReset.bind(this), 100)				if(this.option.resetcallback) {			this.option.arguments.push(evt);			var state = this.option.resetcallback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}	},		doReset: function() {				if(this.node.hasClassName('Oryx_down'))			this.node.removeClassName('Oryx_down');		if(this.node.hasClassName('Oryx_hover'))			this.node.removeClassName('Oryx_hover');	},	activate: function(evt) {		this.node.addClassName('Oryx_down');		//Event.stop(evt);		this.dragStart = true;	},	isHover: function() {		return this.node.hasClassName('Oryx_hover') ? true: false;	},	hover: function(evt) {		// Delete the timeout for hiding		window.clearTimeout( this.resetTimer )		this.resetTimer = null;				this.node.addClassName('Oryx_hover');		this.dragStart = false;				if(this.option.hovercallback) {			this.option.arguments.push(evt);			var state = this.option.hovercallback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}	},	move: function(evt) {		if(this.dragStart && this.option.dragcallback) {			this.option.arguments.push(evt);			var state = this.option.dragcallback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}	},	trigger: function(evt) {		if(this.option.callback) {			//Event.stop(evt);			this.option.arguments.push(evt);			var state = this.option.callback.apply(this, this.option.arguments);			this.option.arguments.remove(evt);		}		this.dragStart = false;	},	toString: function() {		return "HTML-Button " + this.id;	}}ORYX.Plugins.ShapeMenuButton = Clazz.extend(ORYX.Plugins.ShapeMenuButton);//create command for undo/redoORYX.Plugins.ShapeMenuPlugin.CreateCommand = ORYX.Core.Command.extend({	construct: function(option, currentReference, position, plugin){		this.option = option;		this.currentReference = currentReference;		this.position = position;		this.plugin = plugin;		this.shape;		this.edge;		this.targetRefPos;		this.sourceRefPos;		/*		 * clone options parameters		 */        this.connectedShape = option.connectedShape;        this.connectingType = option.connectingType;        this.namespace = option.namespace;        this.type = option.type;        this.containedStencil = option.containedStencil;        this.parent = option.parent;        this.currentReference = currentReference;        this.shapeOptions = option.shapeOptions;	},				execute: function(){				var resume = false;				if (this.shape) {			if (this.shape instanceof ORYX.Core.Node) {				this.parent.add(this.shape);				if (this.edge) {					this.plugin.facade.getCanvas().add(this.edge);					this.edge.dockers.first().setDockedShape(this.connectedShape);					this.edge.dockers.first().setReferencePoint(this.sourceRefPos);					this.edge.dockers.last().setDockedShape(this.shape);					this.edge.dockers.last().setReferencePoint(this.targetRefPos);				}								this.plugin.facade.setSelection([this.shape]);							} else if (this.shape instanceof ORYX.Core.Edge) {				this.plugin.facade.getCanvas().add(this.shape);				this.shape.dockers.first().setDockedShape(this.connectedShape);				this.shape.dockers.first().setReferencePoint(this.sourceRefPos);			}			resume = true;		}		else {			this.shape = this.plugin.facade.createShape(this.option);			this.edge = (!(this.shape instanceof ORYX.Core.Edge)) ? this.shape.getIncomingShapes().first() : undefined;		}				if (this.currentReference && this.position) {						if (this.shape instanceof ORYX.Core.Edge) {							if (!(this.currentReference instanceof ORYX.Core.Canvas)) {					this.shape.dockers.last().setDockedShape(this.currentReference);										// @deprecated It now uses simply the midpoint					var upL = this.currentReference.absoluteXY();					var refPos = {						x: this.position.x - upL.x,						y: this.position.y - upL.y					};										this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint());				}				else {					this.shape.dockers.last().bounds.centerMoveTo(this.position);					//this.shape.dockers.last().update();				}				this.sourceRefPos = this.shape.dockers.first().referencePoint;				this.targetRefPos = this.shape.dockers.last().referencePoint;							} else if (this.edge){				this.sourceRefPos = this.edge.dockers.first().referencePoint;				this.targetRefPos = this.edge.dockers.last().referencePoint;			}		} else {			var containedStencil = this.containedStencil;			var connectedShape = this.connectedShape;			var bc = connectedShape.bounds;			var bs = this.shape.bounds;						var pos = bc.center();			if(containedStencil.defaultAlign()==="north") {				pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height()/2);			} else if(containedStencil.defaultAlign()==="northeast") {				pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width()/2);				pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height()/2);			} else if(containedStencil.defaultAlign()==="southeast") {				pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width()/2);				pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height()/2);			} else if(containedStencil.defaultAlign()==="south") {				pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height()/2);			} else if(containedStencil.defaultAlign()==="southwest") {				pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width()/2);				pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height()/2);			} else if(containedStencil.defaultAlign()==="west") {				pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width()/2);			} else if(containedStencil.defaultAlign()==="northwest") {				pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width()/2);				pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height()/2);			} else {				pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width()/2);			}						// Move shape to the new position			this.shape.bounds.centerMoveTo(pos);						// Move all dockers of a node to the position			if (this.shape instanceof ORYX.Core.Node){				(this.shape.dockers||[]).each(function(docker){					docker.bounds.centerMoveTo(pos);				})			}						//this.shape.update();			this.position = pos;						if (this.edge){				this.sourceRefPos = this.edge.dockers.first().referencePoint;				this.targetRefPos = this.edge.dockers.last().referencePoint;			}		}				this.plugin.facade.getCanvas().update();		this.plugin.facade.updateSelection();				if (!resume) {			// If there is a connected shape			if (this.edge){				// Try to layout it				this.plugin.doLayout(this.edge);			} else if (this.shape instanceof ORYX.Core.Edge){				// Try to layout it				this.plugin.doLayout(this.shape);			}		}	},	rollback: function(){		this.plugin.facade.deleteShape(this.shape);		if(this.edge) {			this.plugin.facade.deleteShape(this.edge);		}		//this.currentParent.update();		this.plugin.facade.setSelection(this.plugin.facade.getSelection().without(this.shape, this.edge));	}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins) {    ORYX.Plugins = new Object();}/** * This plugin is responsible for displaying loading indicators and to prevent * the user from accidently unloading the page by, e.g., pressing the backspace * button and returning to the previous site in history. * @param {Object} facade The editor plugin facade to register enhancements with. */ORYX.Plugins.Loading = {    construct: function(facade){            this.facade = facade;                // The parent Node        this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.facade.getCanvas().getHTMLContainer().parentNode, ['div', {            'class': 'LoadingIndicator'        }, '']);                this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_ENABLE, this.enableLoading.bind(this));        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_DISABLE, this.disableLoading.bind(this));		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_STATUS, this.showStatus.bind(this));                this.disableLoading();    },        enableLoading: function(options){		if(options.text) 			this.node.innerHTML = options.text + "...";		else			this.node.innerHTML = ORYX.I18N.Loading.waiting;		this.node.removeClassName('StatusIndicator');		this.node.addClassName('LoadingIndicator');        this.node.style.display = "block";				var pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;		this.node.style.top 		= pos.offsetTop + 'px';		this.node.style.left 		= pos.offsetLeft +'px';					    },        disableLoading: function(){        this.node.style.display = "none";    },		showStatus: function(options) {		if(options.text) {			this.node.innerHTML = options.text;			this.node.addClassName('StatusIndicator');			this.node.removeClassName('LoadingIndicator');			this.node.style.display = 'block';			var pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;			this.node.style.top 	= pos.offsetTop + 'px';			this.node.style.left 	= pos.offsetLeft +'px';															var tout = options.timeout ? options.timeout : 2000;						window.setTimeout((function(){                            this.disableLoading();                            }).bind(this), tout);		}		
	}}ORYX.Plugins.Loading = Clazz.extend(ORYX.Plugins.Loading);