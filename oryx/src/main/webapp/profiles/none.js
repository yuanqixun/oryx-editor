if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Toolbar=Clazz.extend({facade:undefined,plugs:[],construct:function(b,a){this.facade=b;
this.groupIndex=new Hash();
a.properties.each((function(c){if(c.group&&c.index!=undefined){this.groupIndex[c.group]=c.index
}}).bind(this));
Ext.QuickTips.init();
this.buttons=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_BUTTON_UPDATE,this.onButtonUpdate.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.onSelectionChanged.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_WINDOW_FOCUS,this.onSelectionChanged.bind(this));
Event.observe(window,"focus",function(c){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_WINDOW_FOCUS},null)
}.bind(this))
},onButtonUpdate:function(b){var a=this.buttons.find(function(c){return c.id===b.id
});
if(b.pressed!==undefined){a.buttonInstance.toggle(b.pressed)
}},registryChanged:function(c){var b=c.sortBy((function(g){return((this.groupIndex[g.group]!=undefined?this.groupIndex[g.group]:"")+g.group+""+g.index).toLowerCase()
}).bind(this));
var a=$A(b).findAll(function(g){return !this.plugs.include(g)
}.bind(this));
if(a.length<1){return
}this.buttons=[];
ORYX.Log.trace("Creating a toolbar.");
if(!this.toolbar){this.toolbar=new Ext.ux.SlicedToolbar({height:24});
var e=this.facade.addToRegion("north",this.toolbar,"Toolbar")
}var f=this.plugs.last()?this.plugs.last().group:a[0].group;
var d={};
a.each((function(i){if(!i.name){return
}this.plugs.push(i);
if(f!=i.group){this.toolbar.add("-");
f=i.group;
d={}
}var h=i.functionality;
i.functionality=function(){if("undefined"!=typeof(pageTracker)&&"function"==typeof(pageTracker._trackEvent)){pageTracker._trackEvent("ToolbarButton",i.name)
}return h.apply(this,arguments)
};
if(i.dropDownGroupIcon){var k=d[i.dropDownGroupIcon];
if(k===undefined){k=d[i.dropDownGroupIcon]=new Ext.Toolbar.SplitButton({cls:"x-btn-icon",icon:i.dropDownGroupIcon,menu:new Ext.menu.Menu({items:[]}),listeners:{click:function(l,m){if(!l.menu.isVisible()&&!l.ignoreNextClick){l.showMenu()
}else{l.hideMenu()
}}}});
this.toolbar.add(k)
}var j={icon:i.icon,text:i.name,itemId:i.id,handler:i.toggle?undefined:i.functionality,checkHandler:i.toggle?i.functionality:undefined,listeners:{render:function(l){if(i.description){new Ext.ToolTip({target:l.getEl(),title:i.description})
}}}};
if(i.toggle){var g=new Ext.menu.CheckItem(j)
}else{var g=new Ext.menu.Item(j)
}k.menu.add(g)
}else{var g=new Ext.Toolbar.Button({icon:i.icon,cls:"x-btn-icon",itemId:i.id,tooltip:i.description,tooltipType:"title",handler:i.toggle?null:i.functionality,enableToggle:i.toggle,toggleHandler:i.toggle?i.functionality:null});
this.toolbar.add(g);
g.getEl().onclick=function(){this.blur()
}}i.buttonInstance=g;
this.buttons.push(i)
}).bind(this));
this.enableButtons([]);
this.toolbar.calcSlices();
window.addEventListener("resize",function(g){this.toolbar.calcSlices()
}.bind(this),false);
window.addEventListener("onresize",function(g){this.toolbar.calcSlices()
}.bind(this),false)
},onSelectionChanged:function(a){if(!a.elements){this.enableButtons([])
}else{this.enableButtons(a.elements)
}},enableButtons:function(a){this.buttons.each((function(b){b.buttonInstance.enable();
if(b.minShape&&b.minShape>a.length){b.buttonInstance.disable()
}if(b.maxShape&&b.maxShape<a.length){b.buttonInstance.disable()
}if(b.isEnabled&&!b.isEnabled()){b.buttonInstance.disable()
}}).bind(this))
}});
Ext.ns("Ext.ux");
Ext.ux.SlicedToolbar=Ext.extend(Ext.Toolbar,{currentSlice:0,iconStandardWidth:22,seperatorStandardWidth:2,toolbarStandardPadding:2,initComponent:function(){Ext.apply(this,{});
Ext.ux.SlicedToolbar.superclass.initComponent.apply(this,arguments)
},onRender:function(){Ext.ux.SlicedToolbar.superclass.onRender.apply(this,arguments)
},onResize:function(){Ext.ux.SlicedToolbar.superclass.onResize.apply(this,arguments)
},calcSlices:function(){var d=0;
this.sliceMap={};
var c=0;
var a=this.getEl().getWidth();
this.items.getRange().each(function(g,e){if(g.helperItem){g.destroy();
return
}var h=g.getEl().getWidth();
if(c+h+5*this.iconStandardWidth>a){var f=this.items.indexOf(g);
this.insertSlicingButton("next",d,f);
if(d!==0){this.insertSlicingButton("prev",d,f)
}this.insertSlicingSeperator(d,f);
d+=1;
c=0
}this.sliceMap[g.id]=d;
c+=h
}.bind(this));
if(d>0){this.insertSlicingSeperator(d,this.items.getCount()+1);
this.insertSlicingButton("prev",d,this.items.getCount()+1);
var b=new Ext.Toolbar.Spacer();
this.insertSlicedHelperButton(b,d,this.items.getCount()+1);
Ext.get(b.id).setWidth(this.iconStandardWidth)
}this.maxSlice=d;
this.setCurrentSlice(this.currentSlice)
},insertSlicedButton:function(b,c,a){this.insertButton(a,b);
this.sliceMap[b.id]=c
},insertSlicedHelperButton:function(b,c,a){b.helperItem=true;
this.insertSlicedButton(b,c,a)
},insertSlicingSeperator:function(b,a){this.insertSlicedHelperButton(new Ext.Toolbar.Fill(),b,a)
},insertSlicingButton:function(e,f,b){var d=function(){this.setCurrentSlice(this.currentSlice+1)
}.bind(this);
var a=function(){this.setCurrentSlice(this.currentSlice-1)
}.bind(this);
var c=new Ext.Toolbar.Button({cls:"x-btn-icon",icon:ORYX.CONFIG.ROOT_PATH+"images/toolbar_"+e+".png",handler:(e==="next")?d:a});
this.insertSlicedHelperButton(c,f,b)
},setCurrentSlice:function(a){if(a>this.maxSlice||a<0){return
}this.currentSlice=a;
this.items.getRange().each(function(b){b.setVisible(a===this.sliceMap[b.id])
}.bind(this))
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeMenuPlugin={construct:function(c){this.facade=c;
this.alignGroups=new Hash();
var a=this.facade.getCanvas().getHTMLContainer();
this.shapeMenu=new ORYX.Plugins.ShapeMenu(a);
this.currentShapes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START,this.hideShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,this.showShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_START,(function(){this.hideShapeMenu();
this.hideMorphMenu()
}).bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_END,this.showShapeMenu.bind(this));
var b=new Ext.dd.DragZone(a.parentNode,{shadow:!Ext.isMac});
b.afterDragDrop=this.afterDragging.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
this.createdButtons={};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,(function(){this.registryChanged()
}).bind(this));
this.timer=null;
this.resetElements=true
},hideShapeMenu:function(a){window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.hide()
},showShapeMenu:function(a){if(!a||this.resetElements){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.shapeMenu.closeAllButtons();
this.showMorphButton(this.currentShapes);
this.showStencilButtons(this.currentShapes);
this.shapeMenu.show(this.currentShapes);
this.resetElements=false
}.bind(this),300)
}else{window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.show(this.currentShapes)
}},registryChanged:function(a){if(a){a=a.each(function(d){d.group=d.group?d.group:"unknown"
});
this.pluginsData=a.sortBy(function(d){return(d.group+""+d.index)
})
}this.shapeMenu.removeAllButtons();
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_RIGHT,2);
this.createdButtons={};
this.createMorphMenu();
if(!this.pluginsData){this.pluginsData=[]
}this.baseMorphStencils=this.facade.getRules().baseMorphs();
var b=this.facade.getRules().containsMorphingRules();
var c=this.facade.getStencilSets();
c.values().each((function(f){var e=f.nodes();
e.each((function(i){var h={type:i.id(),namespace:i.namespace(),connectingType:true};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:i.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:0,msg:i.title()+" - "+ORYX.I18N.ShapeMenuPlugin.clickDrag});
this.shapeMenu.addButton(g);
this.createdButtons[i.namespace()+i.type()+i.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this));
var d=f.edges();
d.each((function(i){var h={type:i.id(),namespace:i.namespace()};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:i.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:1,msg:(b?ORYX.I18N.Edge:i.title())+" - "+ORYX.I18N.ShapeMenuPlugin.drag});
this.shapeMenu.addButton(g);
this.createdButtons[i.namespace()+i.type()+i.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this))
}).bind(this))
},createMorphMenu:function(){this.morphMenu=new Ext.menu.Menu({id:"Oryx_morph_menu",items:[]});
this.morphMenu.on("mouseover",function(){this.morphMenuHovered=true
},this);
this.morphMenu.on("mouseout",function(){this.morphMenuHovered=false
},this);
var a=new ORYX.Plugins.ShapeMenuButton({hovercallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.showMorphMenu.bind(this):undefined),resetcallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.hideMorphMenu.bind(this):undefined),callback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?undefined:this.toggleMorphMenu.bind(this)),icon:ORYX.PATH+"images/wrench_orange.png",align:ORYX.CONFIG.SHAPEMENU_BOTTOM,group:0,msg:ORYX.I18N.ShapeMenuPlugin.morphMsg});
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_BOTTOM,1);
this.shapeMenu.addButton(a);
this.morphMenu.getEl().appendTo(a.node);
this.morphButton=a
},showMorphMenu:function(){this.morphMenu.show(this.morphButton.node);
this._morphMenuShown=true
},hideMorphMenu:function(){this.morphMenu.hide();
this._morphMenuShown=false
},toggleMorphMenu:function(){if(this._morphMenuShown){this.hideMorphMenu()
}else{this.showMorphMenu()
}},onSelectionChanged:function(a){var b=a.elements;
this.hideShapeMenu();
this.hideMorphMenu();
if(this.currentShapes.inspect()!==b.inspect()){this.currentShapes=b;
this.resetElements=true;
this.showShapeMenu()
}else{this.showShapeMenu(true)
}},showMorphButton:function(b){if(b.length!=1){return
}var a=this.facade.getRules().morphStencils({stencil:b[0].getStencil()});
a=a.select(function(c){if(b[0].getStencil().type()==="node"){return this.facade.getRules().canContain({containingShape:b[0].parent,containedStencil:c})
}else{return this.facade.getRules().canConnect({sourceShape:b[0].dockers.first().getDockedShape(),edgeStencil:c,targetShape:b[0].dockers.last().getDockedShape()})
}}.bind(this));
if(a.size()<=1){return
}this.morphMenu.removeAll();
a=a.sortBy(function(c){return c.position()
});
a.each((function(d){var c=new Ext.menu.Item({text:d.title(),icon:d.icon(),disabled:d.id()==b[0].getStencil().id(),disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.morphShape(b[0],d)
}).bind(this)});
this.morphMenu.add(c)
}).bind(this));
this.morphButton.prepareToShow()
},showStencilButtons:function(g){if(g.length!=1){return
}var f=this.facade.getStencilSets()[g[0].getStencil().namespace()];
var c=this.facade.getRules().outgoingEdgeStencils({canvas:this.facade.getCanvas(),sourceShape:g[0]});
var a=new Array();
var d=new Array();
var e=this.facade.getRules().containsMorphingRules();
c.each((function(i){if(e){if(this.baseMorphStencils.include(i)){var j=true
}else{var h=this.facade.getRules().morphStencils({stencil:i});
var j=!h.any((function(k){if(this.baseMorphStencils.include(k)&&c.include(k)){return true
}return d.include(k)
}).bind(this))
}}if(j||!e){if(this.createdButtons[i.namespace()+i.type()+i.id()]){this.createdButtons[i.namespace()+i.type()+i.id()].prepareToShow()
}d.push(i)
}a=a.concat(this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(),sourceShape:g[0],edgeStencil:i}))
}).bind(this));
a.uniq();
var b=new Array();
a.each((function(j){if(e){if(j.type()==="edge"){return
}if(!this.facade.getRules().showInShapeMenu(j)){return
}if(!this.baseMorphStencils.include(j)){var h=this.facade.getRules().morphStencils({stencil:j});
if(h.size()==0){return
}var i=h.any((function(k){if(this.baseMorphStencils.include(k)&&a.include(k)){return true
}return b.include(k)
}).bind(this));
if(i){return
}}}if(this.createdButtons[j.namespace()+j.type()+j.id()]){this.createdButtons[j.namespace()+j.type()+j.id()].prepareToShow()
}b.push(j)
}).bind(this))
},beforeDragOver:function(m,l,b){if(this.shapeMenu.isVisible){this.hideShapeMenu()
}var k=this.facade.eventCoordinates(b.browserEvent);
var r=this.facade.getCanvas().getAbstractShapesAtPosition(k);
if(r.length<=0){return false
}var d=r.last();
if(this._lastOverElement==d){return false
}else{var h=Ext.dd.Registry.getHandle(l.DDM.currentTarget);
if(h.backupOptions){for(key in h.backupOptions){h[key]=h.backupOptions[key]
}delete h.backupOptions
}var n=this.facade.getStencilSets()[h.namespace];
var p=n.stencil(h.type);
var q=r.last();
if(p.type()==="node"){var c=this.facade.getRules().canContain({containingShape:q,containedStencil:p});
if(!c){var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){c=this.facade.getRules().canContain({containingShape:q,containedStencil:o[g]});
if(c){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}}}this._currentReference=c?q:undefined
}else{var j=q,e=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:p,targetShape:j});
j=j.parent
}if(!f){q=e;
var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){var j=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:o[g],targetShape:j});
j=j.parent
}if(f){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}else{q=e
}}}this._currentReference=f?q:undefined
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeMenu",elements:[q],color:this._currentReference?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
var a=m.getProxy();
a.setStatus(this._currentReference?a.dropAllowed:a.dropNotAllowed);
a.sync()
}this._lastOverElement=d;
return false
},afterDragging:function(i,f,b){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}var e=this.currentShapes;
this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeMenu"});
var h=i.getProxy();
if(h.dropStatus==h.dropNotAllowed){return this.facade.updateSelection()
}if(!this._currentReference){return
}var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
d.parent=this._currentReference;
var p=b.getXY();
var j={x:p[0],y:p[1]};
var l=this.facade.getCanvas().node.getScreenCTM();
j.x-=l.e;
j.y-=l.f;
j.x/=l.a;
j.y/=l.d;
j.x-=document.documentElement.scrollLeft;
j.y-=document.documentElement.scrollTop;
var o=this._currentReference.absoluteXY();
j.x-=o.x;
j.y-=o.y;
if(!b.ctrlKey){var k=this.currentShapes[0].bounds.center();
if(20>Math.abs(k.x-j.x)){j.x=k.x
}if(20>Math.abs(k.y-j.y)){j.y=k.y
}}d.position=j;
d.connectedShape=this.currentShapes[0];
if(d.connectingType){var n=this.facade.getStencilSets()[d.namespace];
var m=n.stencil(d.type);
var g={sourceShape:this.currentShapes[0],targetStencil:m};
d.connectingType=this.facade.getRules().connectMorph(g).id()
}if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete d.connectingType
}var c=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(Object.clone(d),this._currentReference,j,this);
this.facade.executeCommands([c]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE,source:e,destination:this.currentShapes});
if(d.backupOptions){for(key in d.backupOptions){d[key]=d.backupOptions[key]
}delete d.backupOptions
}this._currentReference=undefined
},newShape:function(e,f){var a=this.facade.getStencilSets()[e.namespace];
var d=a.stencil(e.type);
if(this.facade.getRules().canContain({containingShape:this.currentShapes.first().parent,containedStencil:d})){e.connectedShape=this.currentShapes[0];
e.parent=this.currentShapes.first().parent;
e.containedStencil=d;
var b={sourceShape:this.currentShapes[0],targetStencil:d};
var c=this.facade.getRules().connectMorph(b);
if(!c){return
}e.connectingType=c.id();
if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete e.connectingType
}var g=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(e,undefined,undefined,this);
this.facade.executeCommands([g])
}},morphShape:function(a,b){var d=ORYX.Core.Command.extend({construct:function(e,g,f){this.shape=e;
this.stencil=g;
this.facade=f
},execute:function(){var m=this.shape;
var q=this.stencil;
var l=m.resourceId;
var h=m.serialize();
q.properties().each((function(r){if(r.readonly()){h=h.reject(function(s){return s.name==r.id()
})
}}).bind(this));
if(this.newShape){newShape=this.newShape;
this.facade.getCanvas().add(newShape)
}else{newShape=this.facade.createShape({type:q.id(),namespace:q.namespace(),resourceId:l})
}var k=h.find(function(r){return(r.prefix==="oryx"&&r.name==="bounds")
});
var n=null;
if(!this.facade.getRules().preserveBounds(m.getStencil())){var e=k.value.split(",");
if(parseInt(e[0],10)>parseInt(e[2],10)){var i=e[0];
e[0]=e[2];
e[2]=i;
i=e[1];
e[1]=e[3];
e[3]=i
}e[2]=parseInt(e[0],10)+newShape.bounds.width();
e[3]=parseInt(e[1],10)+newShape.bounds.height();
k.value=e.join(",")
}else{var p=m.bounds.height();
var f=m.bounds.width();
if(newShape.minimumSize){if(m.bounds.height()<newShape.minimumSize.height){p=newShape.minimumSize.height
}if(m.bounds.width()<newShape.minimumSize.width){f=newShape.minimumSize.width
}}if(newShape.maximumSize){if(m.bounds.height()>newShape.maximumSize.height){p=newShape.maximumSize.height
}if(m.bounds.width()>newShape.maximumSize.width){f=newShape.maximumSize.width
}}n={a:{x:m.bounds.a.x,y:m.bounds.a.y},b:{x:m.bounds.a.x+f,y:m.bounds.a.y+p}}
}var o=m.bounds.center();
if(n!==null){newShape.bounds.set(n)
}this.setRelatedDockers(m,newShape);
var j=m.node.parentNode;
var g=m.node.nextSibling;
this.facade.deleteShape(m);
newShape.deserialize(h);
if(m.getStencil().property("oryx-bgcolor")&&m.properties["oryx-bgcolor"]&&m.getStencil().property("oryx-bgcolor").value().toUpperCase()==m.properties["oryx-bgcolor"].toUpperCase()){if(newShape.getStencil().property("oryx-bgcolor")){newShape.setProperty("oryx-bgcolor",newShape.getStencil().property("oryx-bgcolor").value())
}}if(n!==null){newShape.bounds.set(n)
}if(newShape.getStencil().type()==="edge"||(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){newShape.bounds.centerMoveTo(o)
}if(newShape.getStencil().type()==="node"&&(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){this.setRelatedDockers(newShape,newShape)
}if(g){j.insertBefore(newShape.node,g)
}else{j.appendChild(newShape.node)
}this.facade.setSelection([newShape]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.newShape=newShape;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SHAPE_MORPHED,shape:newShape})
},rollback:function(){if(!this.shape||!this.newShape||!this.newShape.parent){return
}this.newShape.parent.add(this.shape);
this.setRelatedDockers(this.newShape,this.shape);
this.facade.deleteShape(this.newShape);
this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},setRelatedDockers:function(e,f){if(e.getStencil().type()==="node"){(e.incoming||[]).concat(e.outgoing||[]).each(function(g){g.dockers.each(function(j){if(j.getDockedShape()==e){var i=Object.clone(j.referencePoint);
var k={x:i.x*f.bounds.width()/e.bounds.width(),y:i.y*f.bounds.height()/e.bounds.height()};
j.setDockedShape(f);
j.setReferencePoint(k);
if(g instanceof ORYX.Core.Edge){j.bounds.centerMoveTo(k)
}else{var h=e.absoluteXY();
j.bounds.centerMoveTo({x:k.x+h.x,y:k.y+h.y})
}}})
});
if(e.dockers.length>0&&e.dockers.first().getDockedShape()){f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(Object.clone(e.dockers.first().referencePoint))
}}else{f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(e.dockers.first().referencePoint);
f.dockers.last().setDockedShape(e.dockers.last().getDockedShape());
f.dockers.last().setReferencePoint(e.dockers.last().referencePoint)
}}});
var c=new d(a,b,this.facade);
this.facade.executeCommands([c])
}};
ORYX.Plugins.ShapeMenuPlugin=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ShapeMenuPlugin);
ORYX.Plugins.ShapeMenu={construct:function(a){this.bounds=undefined;
this.shapes=undefined;
this.buttons=[];
this.isVisible=false;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(a),["div",{id:ORYX.Editor.provideId(),"class":"Oryx_ShapeMenu"}]);
this.alignContainers=new Hash();
this.numberOfButtonsPerLevel=new Hash()
},addButton:function(b){this.buttons.push(b);
if(!this.alignContainers[b.align]){this.alignContainers[b.align]=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["div",{"class":b.align}]);
this.node.appendChild(this.alignContainers[b.align]);
var a=false;
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hoverAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.resetAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hoverAlignContainer.bind(this,b.align),a)
}this.alignContainers[b.align].appendChild(b.node)
},deleteButton:function(a){this.buttons=this.buttons.without(a);
this.node.removeChild(a.node)
},removeAllButtons:function(){var a=this;
this.buttons.each(function(b){if(b.node&&b.node.parentNode){b.node.parentNode.removeChild(b.node)
}});
this.buttons=[]
},closeAllButtons:function(){this.buttons.each(function(a){a.prepareToHide()
});
this.isVisible=false
},show:function(e){if(e.length<=0){return
}this.shapes=e;
var f=undefined;
var h=undefined;
this.shapes.each(function(p){var o=p.node.getScreenCTM();
var q=p.absoluteXY();
o.e=o.a*q.x;
o.f=o.d*q.y;
h=new ORYX.Core.Bounds(o.e,o.f,o.e+o.a*p.bounds.width(),o.f+o.d*p.bounds.height());
if(!f){f=h
}else{f.include(h)
}});
this.bounds=f;
var c=this.bounds;
var k=this.bounds.upperLeft();
var g=0,d=0;
var i=0,j=0;
var b=0,l;
var m=0;
rightButtonGroup=0;
var n=22;
this.getWillShowButtons().sortBy(function(a){return a.group
});
this.getWillShowButtons().each(function(o){var p=this.getNumberOfButtonsPerLevel(o.align);
if(o.align==ORYX.CONFIG.SHAPEMENU_LEFT){if(o.group!=d){g=0;
d=o.group
}var a=Math.floor(g/p);
var q=g%p;
o.setLevel(a);
o.setPosition(k.x-5-(a+1)*n,k.y+p*o.group*n+o.group*0.3*n+q*n);
g++
}else{if(o.align==ORYX.CONFIG.SHAPEMENU_TOP){if(o.group!=j){i=0;
j=o.group
}var a=i%p;
var q=Math.floor(i/p);
o.setLevel(q);
o.setPosition(k.x+p*o.group*n+o.group*0.3*n+a*n,k.y-5-(q+1)*n);
i++
}else{if(o.align==ORYX.CONFIG.SHAPEMENU_BOTTOM){if(o.group!=l){b=0;
l=o.group
}var a=b%p;
var q=Math.floor(b/p);
o.setLevel(q);
o.setPosition(k.x+p*o.group*n+o.group*0.3*n+a*n,k.y+c.height()+5+q*n);
b++
}else{if(o.group!=rightButtonGroup){m=0;
rightButtonGroup=o.group
}var a=Math.floor(m/p);
var q=m%p;
o.setLevel(a);
o.setPosition(k.x+c.width()+5+a*n,k.y+p*o.group*n+o.group*0.3*n+q*n-5);
m++
}}}o.show()
}.bind(this));
this.isVisible=true
},hide:function(){this.buttons.each(function(a){a.hide()
});
this.isVisible=false
},hoverAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showOpaque()
}})
},resetAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showTransparent()
}})
},isHover:function(){return this.buttons.any(function(a){return a.isHover()
})
},getWillShowButtons:function(){return this.buttons.findAll(function(a){return a.willShow
})
},getButtons:function(b,a){return this.getWillShowButtons().findAll(function(c){return c.align==b&&(a===undefined||c.group==a)
})
},setNumberOfButtonsPerLevel:function(b,a){this.numberOfButtonsPerLevel[b]=a
},getNumberOfButtonsPerLevel:function(a){if(this.numberOfButtonsPerLevel[a]){return Math.min(this.getButtons(a,0).length,this.numberOfButtonsPerLevel[a])
}else{return 1
}}};
ORYX.Plugins.ShapeMenu=Clazz.extend(ORYX.Plugins.ShapeMenu);
ORYX.Plugins.ShapeMenuButton={construct:function(b){if(b){this.option=b;
if(!this.option.arguments){this.option.arguments=[]
}}else{}this.parentId=this.option.id?this.option.id:null;
var e=this.option.caption?"Oryx_button_with_caption":"Oryx_button";
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":e}]);
var c={src:this.option.icon};
if(this.option.msg){c.title=this.option.msg
}if(this.option.icon){ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["img",c])
}if(this.option.caption){var d=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["span"]);
ORYX.Editor.graft("http://www.w3.org/1999/xhtml",d,this.option.caption)
}var a=false;
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hover.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.reset.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.activate.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hover.bind(this),a);
this.node.addEventListener("click",this.trigger.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.move.bind(this),a);
this.align=this.option.align?this.option.align:ORYX.CONFIG.SHAPEMENU_RIGHT;
this.group=this.option.group?this.option.group:0;
this.hide();
this.dragStart=false;
this.isVisible=false;
this.willShow=false;
this.resetTimer
},hide:function(){this.node.style.display="none";
this.isVisible=false
},show:function(){this.node.style.display="";
this.node.style.opacity=this.opacity;
this.isVisible=true
},showOpaque:function(){this.node.style.opacity=1
},showTransparent:function(){this.node.style.opacity=this.opacity
},prepareToShow:function(){this.willShow=true
},prepareToHide:function(){this.willShow=false;
this.hide()
},setPosition:function(a,b){this.node.style.left=a+"px";
this.node.style.top=b+"px"
},setLevel:function(a){if(a==0){this.opacity=0.5
}else{if(a==1){this.opacity=0.2
}else{this.opacity=0
}}},setChildWidth:function(a){this.childNode.style.width=a+"px"
},reset:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=window.setTimeout(this.doReset.bind(this),100);
if(this.option.resetcallback){this.option.arguments.push(a);
var b=this.option.resetcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},doReset:function(){if(this.node.hasClassName("Oryx_down")){this.node.removeClassName("Oryx_down")
}if(this.node.hasClassName("Oryx_hover")){this.node.removeClassName("Oryx_hover")
}},activate:function(a){this.node.addClassName("Oryx_down");
this.dragStart=true
},isHover:function(){return this.node.hasClassName("Oryx_hover")?true:false
},hover:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=null;
this.node.addClassName("Oryx_hover");
this.dragStart=false;
if(this.option.hovercallback){this.option.arguments.push(a);
var b=this.option.hovercallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},move:function(a){if(this.dragStart&&this.option.dragcallback){this.option.arguments.push(a);
var b=this.option.dragcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},trigger:function(a){if(this.option.callback){this.option.arguments.push(a);
var b=this.option.callback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}this.dragStart=false
},toString:function(){return"HTML-Button "+this.id
}};
ORYX.Plugins.ShapeMenuButton=Clazz.extend(ORYX.Plugins.ShapeMenuButton);
ORYX.Plugins.ShapeMenuPlugin.CreateCommand=ORYX.Core.Command.extend({construct:function(c,b,a,d){this.option=c;
this.currentReference=b;
this.position=a;
this.plugin=d;
this.shape;
this.edge;
this.targetRefPos;
this.sourceRefPos;
this.connectedShape=c.connectedShape;
this.connectingType=c.connectingType;
this.namespace=c.namespace;
this.type=c.type;
this.containedStencil=c.containedStencil;
this.parent=c.parent;
this.currentReference=b;
this.shapeOptions=c.shapeOptions
},execute:function(){var d=false;
if(this.shape){if(this.shape instanceof ORYX.Core.Node){this.parent.add(this.shape);
if(this.edge){this.plugin.facade.getCanvas().add(this.edge);
this.edge.dockers.first().setDockedShape(this.connectedShape);
this.edge.dockers.first().setReferencePoint(this.sourceRefPos);
this.edge.dockers.last().setDockedShape(this.shape);
this.edge.dockers.last().setReferencePoint(this.targetRefPos)
}this.plugin.facade.setSelection([this.shape])
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.facade.getCanvas().add(this.shape);
this.shape.dockers.first().setDockedShape(this.connectedShape);
this.shape.dockers.first().setReferencePoint(this.sourceRefPos)
}}d=true
}else{this.shape=this.plugin.facade.createShape(this.option);
this.edge=(!(this.shape instanceof ORYX.Core.Edge))?this.shape.getIncomingShapes().first():undefined
}if(this.currentReference&&this.position){if(this.shape instanceof ORYX.Core.Edge){if(!(this.currentReference instanceof ORYX.Core.Canvas)){this.shape.dockers.last().setDockedShape(this.currentReference);
var g=this.currentReference.absoluteXY();
var e={x:this.position.x-g.x,y:this.position.y-g.y};
this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint())
}else{this.shape.dockers.last().bounds.centerMoveTo(this.position)
}this.sourceRefPos=this.shape.dockers.first().referencePoint;
this.targetRefPos=this.shape.dockers.last().referencePoint
}else{if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}}else{var c=this.containedStencil;
var a=this.connectedShape;
var f=a.bounds;
var b=this.shape.bounds;
var h=f.center();
if(c.defaultAlign()==="north"){h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="northeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="southeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="south"){h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="southwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="west"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}else{if(c.defaultAlign()==="northwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}}}}}}}this.shape.bounds.centerMoveTo(h);
if(this.shape instanceof ORYX.Core.Node){(this.shape.dockers||[]).each(function(i){i.bounds.centerMoveTo(h)
})
}this.position=h;
if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection();
if(!d){if(this.edge){this.plugin.doLayout(this.edge)
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.doLayout(this.shape)
}}}},rollback:function(){this.plugin.facade.deleteShape(this.shape);
if(this.edge){this.plugin.facade.deleteShape(this.edge)
}this.plugin.facade.setSelection(this.plugin.facade.getSelection().without(this.shape,this.edge))
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Loading={construct:function(a){this.facade=a;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.facade.getCanvas().getHTMLContainer().parentNode,["div",{"class":"LoadingIndicator"},""]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_ENABLE,this.enableLoading.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_DISABLE,this.disableLoading.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_STATUS,this.showStatus.bind(this));
this.disableLoading()
},enableLoading:function(a){if(a.text){this.node.innerHTML=a.text+"..."
}else{this.node.innerHTML=ORYX.I18N.Loading.waiting
}this.node.removeClassName("StatusIndicator");
this.node.addClassName("LoadingIndicator");
this.node.style.display="block";
var b=this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;
this.node.style.top=b.offsetTop+"px";
this.node.style.left=b.offsetLeft+"px"
},disableLoading:function(){this.node.style.display="none"
},showStatus:function(a){if(a.text){this.node.innerHTML=a.text;
this.node.addClassName("StatusIndicator");
this.node.removeClassName("LoadingIndicator");
this.node.style.display="block";
var c=this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;
this.node.style.top=c.offsetTop+"px";
this.node.style.left=c.offsetLeft+"px";
var b=a.timeout?a.timeout:2000;
window.setTimeout((function(){this.disableLoading()
}).bind(this),b)
}}};
ORYX.Plugins.Loading=Clazz.extend(ORYX.Plugins.Loading);