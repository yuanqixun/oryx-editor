if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SyntaxChecker=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.active=false;
this.raisedEventIds=[];
this.facade.offer({name:ORYX.I18N.SyntaxChecker.name,functionality:this.perform.bind(this),group:ORYX.I18N.SyntaxChecker.group,icon:ORYX.PATH+"images/checker_syntax.png",description:ORYX.I18N.SyntaxChecker.desc,index:0,toggle:true,minShape:0,maxShape:0});
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,this.checkForErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT,this.resetErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT,this.doShowErrors.bind(this))
},perform:function(a,b){if(!b){this.resetErrors()
}else{this.checkForErrors({onNoErrors:function(){this.setActivated(a,false);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.noErrors,timeout:10000})
}.bind(this),onErrors:function(){this.enableDeactivationHandler(a)
}.bind(this),onFailure:function(){this.setActivated(a,false);
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SyntaxChecker.invalid)
}.bind(this)})
}},enableDeactivationHandler:function(a){var b=function(){this.setActivated(a,false);
this.resetErrors();
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b)
};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b.bind(this))
},setActivated:function(b,a){b.toggle(a);
if(a===undefined){this.active=!this.active
}else{this.active=a
}},checkForErrors:function(a){Ext.applyIf(a||{},{showErrors:true,onErrors:Ext.emptyFn,onNoErrors:Ext.emptyFn,onFailure:Ext.emptyFn});
Ext.Msg.wait(ORYX.I18N.SyntaxChecker.checkingMessage);
var b=this.facade.getStencilSets();
var d=null;
var c=false;
if(b.keys().include("http://b3mn.org/stencilset/bpmn2.0#")||b.keys().include("http://b3mn.org/stencilset/bpmn2.0conversation#")){d=this.facade.getSerializedJSON();
c=true
}else{d=this.getRDFFromDOM()
}new Ajax.Request(ORYX.CONFIG.SYNTAXCHECKER_URL,{method:"POST",asynchronous:false,parameters:{resource:location.href,data:d,context:a.context,isJson:c},onSuccess:function(e){var f=(e&&e.responseText?e.responseText:"{}").evalJSON();
Ext.Msg.hide();
if(f instanceof Object){f=$H(f);
if(f.size()>0){if(a.showErrors){this.showErrors(f)
}a.onErrors()
}else{a.onNoErrors()
}}else{a.onFailure()
}}.bind(this),onFailure:function(){Ext.Msg.hide();
a.onFailure()
}})
},doShowErrors:function(b,a){this.showErrors(b.errors)
},showErrors:function(a){if(!(a instanceof Hash)){a=new Hash(a)
}a.keys().each(function(c){var b=this.facade.getCanvas().getChildShapeByResourceId(c);
if(b){this.raiseOverlay(b,this.parseCodeToMsg(a[c]))
}}.bind(this));
this.active=!this.active;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.notice,timeout:10000})
},parseCodeToMsg:function(e){var f=e.replace(/: /g,"<br />").replace(/, /g,"<br />");
var a=f.split("<br />");
for(var b=0;
b<a.length;
b++){var d=a[b];
var c=this.parseSingleCodeToMsg(d);
if(d!=c){f=f.replace(d,c)
}}return f
},parseSingleCodeToMsg:function(a){return ORYX.I18N.SyntaxChecker[a]||a
},resetErrors:function(){this.raisedEventIds.each(function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:a})
}.bind(this));
this.raisedEventIds=[];
this.active=false
},raiseOverlay:function(a,b){var f="syntaxchecker."+this.raisedEventIds.length;
var d=ORYX.Editor.provideId();
var e=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["path",{id:d,title:"","stroke-width":5,stroke:"red",d:"M20,-5 L5,-20 M5,-5 L20,-20","line-captions":"round"}]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:f,shapes:[a],node:e,nodePosition:a instanceof ORYX.Core.Edge?"START":"NW"});
var c=new Ext.ToolTip({showDelay:50,html:b,target:d});
this.raisedEventIds.push(f);
return e
}});
ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT="checkForErrors";
ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT="resetErrors";
ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT="showErrors";
ORYX.Plugins.PetrinetSyntaxChecker=ORYX.Plugins.SyntaxChecker.extend({getRDFFromDOM:function(){return this.facade.getERDF()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.BPMN2_0={construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED,this.handleDockerDocked.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.handlePropertyChanged.bind(this));
this.facade.registerOnEvent("layout.bpmn2_0.pool",this.handleLayoutPool.bind(this));
this.facade.registerOnEvent("layout.bpmn2_0.subprocess",this.handleSubProcess.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.afterLoad.bind(this))
},afterLoad:function(){this.facade.getCanvas().getChildNodes().each(function(a){if(a.getStencil().id().endsWith("Pool")){this.handleLayoutPool({shape:a})
}}.bind(this))
},onSelectionChanged:function(c){if(c.elements&&c.elements.length===1){var a=c.elements[0];
if(a.getStencil().idWithoutNs()==="Pool"){if(a.getChildNodes().length===0){var b={type:"http://b3mn.org/stencilset/bpmn2.0#Lane",position:{x:0,y:0},namespace:a.getStencil().namespace(),parent:a};
this.facade.createShape(b);
this.facade.getCanvas().update()
}}}},hashedSubProcesses:{},handleSubProcess:function(b){var a=b.shape;
if(!this.hashedSubProcesses[a.resourceId]){this.hashedSubProcesses[a.resourceId]=a.bounds.clone();
return
}var c=a.bounds.upperLeft();
c.x-=this.hashedSubProcesses[a.resourceId].upperLeft().x;
c.y-=this.hashedSubProcesses[a.resourceId].upperLeft().y;
this.hashedSubProcesses[a.resourceId]=a.bounds.clone();
this.moveChildDockers(a,c)
},moveChildDockers:function(a,b){if(!b.x&&!b.y){return
}a.getChildNodes(true).map(function(c){return[].concat(c.getIncomingShapes()).concat(c.getOutgoingShapes())
}).flatten().uniq().map(function(c){return c.dockers.length>2?c.dockers.slice(1,c.dockers.length-1):[]
}).flatten().each(function(c){if(c.isChanged){return
}c.bounds.moveBy(b)
})
},handleDockerDocked:function(c){var d=c.parent;
var b=c.target;
if(d.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#SequenceFlow"){var a=b.getStencil().groups().find(function(e){if(e=="Gateways"){return e
}});
if(!a&&(d.properties["oryx-conditiontype"]=="Expression")){d.setProperty("oryx-showdiamondmarker",true)
}else{d.setProperty("oryx-showdiamondmarker",false)
}this.facade.getCanvas().update()
}},handlePropertyChanged:function(c){var b=c.elements;
var d=c.key;
var a=c.value;
var e=false;
b.each(function(g){if((g.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#SequenceFlow")&&(d==="oryx-conditiontype")){if(a!="Expression"){g.setProperty("oryx-showdiamondmarker",false)
}else{var h=g.getIncomingShapes();
if(!h){g.setProperty("oryx-showdiamondmarker",true)
}var f=h.find(function(k){var l=k.getStencil().groups().find(function(m){if(m=="Gateways"){return m
}});
if(l){return l
}});
if(!f){g.setProperty("oryx-showdiamondmarker",true)
}else{g.setProperty("oryx-showdiamondmarker",false)
}}e=true
}});
if(e){this.facade.getCanvas().update()
}},hashedPoolPositions:{},hashedLaneDepth:{},hashedBounds:{},handleLayoutPool:function(b){var k=b.shape;
var n=this.facade.getSelection();
var l=n.first();
l=l||k;
this.currentPool=k;
if(!(l.getStencil().id().endsWith("Pool")||l.getStencil().id().endsWith("Lane"))){return
}if(!this.hashedBounds[k.resourceId]){this.hashedBounds[k.resourceId]={}
}var d=this.getLanes(k);
if(d.length<=0){return
}if(d.length===1&&this.getLanes(d.first()).length<=0){d.first().setProperty("oryx-showcaption",d.first().properties["oryx-name"].trim().length>0);
var m=d.first().node.getElementsByTagName("rect");
m[0].setAttributeNS(null,"display","none")
}else{d.invoke("setProperty","oryx-showcaption",true);
d.each(function(p){var q=p.node.getElementsByTagName("rect");
q[0].removeAttributeNS(null,"display")
})
}var c=this.getLanes(k,true);
var h=[];
var g=[];
var f=-1;
while(++f<c.length){if(!this.hashedBounds[k.resourceId][c[f].resourceId]){g.push(c[f])
}}if(g.length>0){l=g.first()
}var a=$H(this.hashedBounds[k.resourceId]).keys();
var f=-1;
while(++f<a.length){if(!c.any(function(p){return p.resourceId==a[f]
})){h.push(this.hashedBounds[k.resourceId][a[f]]);
n=n.without(function(p){return p.resourceId==a[f]
})
}}var o,e;
if(h.length>0||g.length>0){o=this.updateHeight(k);
e=this.adjustWidth(d,k.bounds.width());
k.update()
}else{if(k==l){o=this.adjustHeight(d,undefined,k.bounds.height());
e=this.adjustWidth(d,k.bounds.width())
}else{o=this.adjustHeight(d,l);
e=this.adjustWidth(d,l.bounds.width()+(this.getDepth(l,k)*30))
}}this.setDimensions(k,e,o);
this.updateDockers(c,k);
this.hashedBounds[k.resourceId]={};
var f=-1;
while(++f<c.length){this.hashedBounds[k.resourceId][c[f].resourceId]=c[f].absoluteBounds();
this.hashedLaneDepth[c[f].resourceId]=this.getDepth(c[f],k);
this.forceToUpdateLane(c[f])
}this.hashedPoolPositions[k.resourceId]=k.bounds.clone()
},forceToUpdateLane:function(a){if(a.bounds.height()!==a._svgShapes[0].height){a.isChanged=true;
a.isResized=true;
a._update()
}},getDepth:function(c,b){var a=0;
while(c&&c.parent&&c!==b){c=c.parent;
++a
}return a
},updateDepth:function(b,a,c){var d=(a-c)*30;
b.getChildNodes().each(function(e){e.bounds.moveBy(d,0);
[].concat(children[j].getIncomingShapes()).concat(children[j].getOutgoingShapes())
})
},setDimensions:function(c,d,a){var b=c.getStencil().id().endsWith("Lane");
c.bounds.set(b?30:c.bounds.a.x,c.bounds.a.y,d?c.bounds.a.x+d-(b?30:0):c.bounds.b.x,a?c.bounds.a.y+a:c.bounds.b.y)
},setLanePosition:function(a,b){a.bounds.moveTo(30,b)
},adjustWidth:function(a,b){(a||[]).each(function(c){this.setDimensions(c,b);
this.adjustWidth(this.getLanes(c),b-30)
}.bind(this));
return b
},adjustHeight:function(d,f,b){var g=0;
if(!f&&b){var e=-1;
while(++e<d.length){g+=d[e].bounds.height()
}}var e=-1;
var a=0;
while(++e<d.length){if(d[e]===f){this.adjustHeight(this.getLanes(d[e]),undefined,d[e].bounds.height());
d[e].bounds.set({x:30,y:a},{x:d[e].bounds.width()+30,y:d[e].bounds.height()+a})
}else{if(!f&&b){var c=(d[e].bounds.height()*b)/g;
this.adjustHeight(this.getLanes(d[e]),undefined,c);
this.setDimensions(d[e],null,c);
this.setLanePosition(d[e],a)
}else{var c=this.adjustHeight(this.getLanes(d[e]),f,b);
if(!c){c=d[e].bounds.height()
}this.setDimensions(d[e],null,c);
this.setLanePosition(d[e],a)
}}a+=d[e].bounds.height()
}return a
},updateHeight:function(b){var c=this.getLanes(b);
if(c.length==0){return b.bounds.height()
}var a=0;
var d=-1;
while(++d<c.length){this.setLanePosition(c[d],a);
a+=this.updateHeight(c[d])
}this.setDimensions(b,null,a);
return a
},getOffset:function(a,c,b){var e={x:0,y:0};
var e=a.absoluteXY();
var d=this.hashedBounds[b.resourceId][a.resourceId]||(c===true?this.hashedPoolPositions[a.resourceId]:undefined);
if(d){e.x-=d.upperLeft().x;
e.y-=d.upperLeft().y
}else{return{x:0,y:0}
}return e
},getNextLane:function(a){while(a&&!a.getStencil().id().endsWith("Lane")){if(a instanceof ORYX.Core.Canvas){return null
}a=a.parent
}return a
},getParentPool:function(a){while(a&&!a.getStencil().id().endsWith("Pool")){if(a instanceof ORYX.Core.Canvas){return null
}a=a.parent
}return a
},updateDockers:function(x,r){var o=r.absoluteBounds();
var q=(this.hashedPoolPositions[r.resourceId]||o).clone();
var w=-1,v=-1,u=-1,t=-1,s;
var y={};
while(++w<x.length){if(!this.hashedBounds[r.resourceId][x[w].resourceId]){continue
}var f=x[w].getChildNodes();
var m=x[w].absoluteBounds();
var c=(this.hashedBounds[r.resourceId][x[w].resourceId]||m);
var g=this.getOffset(x[w],true,r);
var d=0;
var z=this.getDepth(x[w],r);
if(this.hashedLaneDepth[x[w].resourceId]!==undefined&&this.hashedLaneDepth[x[w].resourceId]!==z){d=(this.hashedLaneDepth[x[w].resourceId]-z)*30;
g.x+=d
}v=-1;
while(++v<f.length){if(d){f[v].bounds.moveBy(d,0)
}if(f[v].getStencil().id().endsWith("Subprocess")){this.moveChildDockers(f[v],g)
}var b=[].concat(f[v].getIncomingShapes()).concat(f[v].getOutgoingShapes()).findAll(function(k){return k instanceof ORYX.Core.Edge
});
u=-1;
while(++u<b.length){if(b[u].getStencil().id().endsWith("MessageFlow")){this.layoutEdges(f[v],[b[u]],g);
continue
}t=-1;
while(++t<b[u].dockers.length){s=b[u].dockers[t];
if(s.getDockedShape()||s.isChanged){continue
}pos=s.bounds.center();
var a=c.isIncluded(pos);
var n=!q.isIncluded(pos);
var e=t==0?a:c.isIncluded(b[u].dockers[t-1].bounds.center());
var h=t==b[u].dockers.length-1?a:c.isIncluded(b[u].dockers[t+1].bounds.center());
if(a){y[s.id]={docker:s,offset:g}
}}}}}w=-1;
var p=$H(y).keys();
while(++w<p.length){y[p[w]].docker.bounds.moveBy(y[p[w]].offset)
}},moveBy:function(b,a){b.x+=a.x;
b.y+=a.y;
return b
},getHashedBounds:function(a){return this.currentPool&&this.hashedBounds[this.currentPool.resourceId][a.resourceId]?this.hashedBounds[this.currentPool.resourceId][a.resourceId]:a.bounds.clone()
},getLanes:function(a,c){var b=a.getChildNodes(c||false).findAll(function(d){return(d.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#Lane")
});
b=b.sort(function(e,d){var f=Math.round(e.bounds.upperLeft().y);
var g=Math.round(d.bounds.upperLeft().y);
if(f==g){f=Math.round(this.getHashedBounds(e).upperLeft().y);
g=Math.round(this.getHashedBounds(d).upperLeft().y)
}return f<g?-1:(f>g?1:0)
}.bind(this));
return b
}};
ORYX.Plugins.BPMN2_0=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.BPMN2_0);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.BPMN2_0Serialization={bpmnSerializationHandlerUrl:ORYX.CONFIG.ROOT_PATH+"bpmn2_0serialization",bpmnDeserializationHandlerUrl:ORYX.CONFIG.ROOT_PATH+"bpmn2_0deserialization",bpmn2XpdlSerializationHandlerUrl:ORYX.CONFIG.ROOT_PATH+"bpmn2xpdlserialization",construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Bpmn2_0Serialization.show,functionality:this.showBpmnXml.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/source.png",description:ORYX.I18N.Bpmn2_0Serialization.showDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Bpmn2_0Serialization.download,functionality:this.downloadBpmnXml.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/source.png",description:ORYX.I18N.Bpmn2_0Serialization.downloadDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Bpmn2_0Serialization.xpdlShow,functionality:this.showXpdl.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/source.png",description:ORYX.I18N.Bpmn2_0Serialization.xpdlShowDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Bpmn2_0Serialization.xpdlDownload,functionality:this.downloadXpdl.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/source.png",description:ORYX.I18N.Bpmn2_0Serialization.xpdlDownloadDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Bpmn2_0Serialization["import"],functionality:this.showImportDialog.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/import.png",icon:ORYX.PATH+"images/source.png",description:ORYX.I18N.Bpmn2_0Serialization.importDesc,index:0,minShape:0,maxShape:0})
},showBpmnXml:function(){this.generateBpmnXml(function(a){var b=a.evalJSON();
this.showSchemaValidationEvent(b.validationEvents);
this.openXMLWindow(b.xml)
}.bind(this),this.bpmnSerializationHandlerUrl)
},downloadBpmnXml:function(){this.generateBpmnXml(function(a){var b=a.evalJSON();
this.showSchemaValidationEvent(b.validationEvents);
this.openDownloadWindow("model.bpmn",b.xml)
}.bind(this),this.bpmnSerializationHandlerUrl)
},showSchemaValidationEvent:function(a){if(a&&ORYX.CONFIG.BPMN20_SCHEMA_VALIDATION_ON){this._showErrorMessageBox("Validation",a)
}},showXpdl:function(){this.generateBpmnXml(function(a){this.openXMLWindow(a)
}.bind(this),this.bpmn2XpdlSerializationHandlerUrl)
},downloadXpdl:function(){this.generateBpmnXml(function(a){this.openDownloadWindow("model.xpdl",a)
}.bind(this),this.bpmn2XpdlSerializationHandlerUrl)
},generateBpmnXml:function(c,d){var b=new Ext.LoadMask(Ext.getBody(),{msg:"Serialization of BPMN 2.0 model"});
b.show();
var a=this.facade.getSerializedJSON();
this._sendRequest(d,"POST",{data:a},function(e){c(e);
b.hide()
}.bind(this),function(e){b.hide();
this._showErrorMessageBox(ORYX.I18N.Oryx.title,ORYX.I18N.Bpmn2_0Serialization.serialFailed);
ORYX.log.warn("Serialization of BPMN 2.0 model failed: "+e.responseText)
}.bind(this))
},showImportDialog:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.Bpmn2_0Serialization.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.Bpmn2_0Serialization.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.Bpmn2_0Serialization.name,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.Bpmn2_0Serialization.btnImp,handler:function(){var d=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.Bpmn2_0Serialization.progress});
d.show();
window.setTimeout(function(){var f=c.items.items[2].getValue();
try{this._sendRequest(this.bpmnDeserializationHandlerUrl,"POST",{data:f},function(g){this.facade.importJSON(g,true);
b.close()
}.bind(this),function(g){d.hide();
this._showErrorMessageBox(ORYX.I18N.Oryx.title,ORYX.I18N.Bpmn2_0Serialization.serialFailed);
ORYX.log.warn("Serialization of BPMN 2.0 model failed: "+g.responseText)
}.bind(this))
}catch(e){Ext.Msg.alert(ORYX.I18N.Bpmn2_0Serialization.error,e.message)
}finally{d.hide()
}}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.Bpmn2_0Serialization.btnClose,handler:function(){b.close()
}.bind(this)}]});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(d){var e=d.target.files[0].getAsText("UTF-8");
c.items.items[2].setValue(e)
},true)
},_sendRequest:function(b,f,d,e,a){var c=false;
new Ajax.Request(b,{method:f,asynchronous:false,parameters:d,onSuccess:function(g){c=true;
if(e){e(g.responseText)
}}.bind(this),onFailure:function(g){if(a){a(g)
}else{Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Bpmn2Bpel.transfFailed);
ORYX.log.warn("Serialization of BPMN 2.0 model failed: "+g.responseText)
}}.bind(this)});
return c
},_showErrorMessageBox:function(b,a){Ext.MessageBox.show({title:b,msg:a,buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.ERROR})
}};
ORYX.Plugins.BPMN2_0Serialization=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.BPMN2_0Serialization);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Bpmn2_0Choreography={construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.handleStencilSetLoaded.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,function(){if(!this._eventsRegistered){this.handleStencilSetLoaded({});
this.afterLoad()
}}.bind(this));
this.participantSize=20;
this.extensionSizeForMarker=10;
this.choreographyTasksMeta=new Hash();
this._isLayoutEnabled=false
},handleStencilSetLoaded:function(a){if(a.lazyLoaded){this._isLayoutEnabled=true
}if(this.isStencilSetExtensionLoaded("http://oryx-editor.org/stencilsets/extensions/bpmn2.0choreography#")){this.registerPluginOnEvents()
}else{this.unregisterPluginOnEvents()
}},registerPluginOnEvents:function(){this._eventsRegistered=true;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.handlePropertyChanged.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED,this.addParticipantsOnCreation.bind(this));
this.facade.registerOnEvent("layout.bpmn2_0.choreography.task",this.handleLayoutChoreographyTask.bind(this));
this.facade.registerOnEvent("layout.bpmn2_0.choreography.subprocess.expanded",this.handleLayoutChoreographySubprocessExpanded.bind(this));
this.facade.registerOnEvent("layout.bpmn2_0.choreography.subprocess.collapsed",this.handleLayoutChoreographySubprocessCollapsed.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.afterLoad.bind(this))
},unregisterPluginOnEvents:function(){this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_LOADED,this.afterLoad.bind(this))
},afterLoad:function(a){this._isLayoutEnabled=true;
this.facade.getCanvas().getChildNodes(true).each(function(d){if(!(d.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyTask"||d.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessCollapsed"||d.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessExpanded")){return
}var h=new Array();
var g=new Array();
var k=this.addOrGetChoreographyTaskMeta(d);
var f=d.getChildNodes(false).findAll(function(l){return l.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant"
});
f=f.sort(function(m,l){var n=Math.round(m.absoluteBounds().upperLeft().y);
var o=Math.round(l.absoluteBounds().upperLeft().y);
return n<o?-1:(n>o?1:0)
});
var c=0;
var e=0;
var b=0;
f.each(function(m){m.isResizable=false;
var l=(m.properties["oryx-multiple_instance"]===""?false:m.properties["oryx-multiple_instance"]);
if(m.bounds.upperLeft().y==c){h.push(m);
c=m.bounds.lowerRight().y;
if(l){e++
}}else{g.push(m);
if(l){b++
}}});
k.numOfParticipantsOnTop=h.length;
k.numOfParticipantsOnBottom=g.length;
k.numOfParticipantsExtendedOnBottom=b;
k.numOfParticipantsExtendedOnTop=e;
k.bottomYStartValue=(g.first()?g.first().bounds.upperLeft().y:d.bounds.height());
k.topYEndValue=(h.last()?h.last().bounds.lowerRight().y:0);
k.center=k.topYEndValue+(k.bottomYStartValue-k.topYEndValue)/2;
k.oldHeight=d.bounds.height();
k.oldBounds=d.bounds.clone();
k.topParticipants=h;
k.bottomParticipants=g;
d.isChanged=true
}.bind(this));
this.facade.getCanvas().update()
},handleLayoutChoreographySubprocessExpanded:function(b){if(!this._isLayoutEnabled){return
}var e=b.shape;
var f=this.addOrGetChoreographyTaskMeta(e);
var d=e.bounds.height()/e._oldBounds.height();
var a=e._labels[e.getId()+"text_name"];
if(a){var c=f.topYEndValue+5;
if(e.isResized&&d){a.y=c/d
}else{a.y=c
}}},handleLayoutChoreographySubprocessCollapsed:function(b){if(!this._isLayoutEnabled){return
}var d=b.shape;
var e=this.addOrGetChoreographyTaskMeta(d);
var a=d._svgShapes.find(function(f){return f.element.id==d.getId()+"plus_marker"
});
var c=d._svgShapes.find(function(f){return f.element.id==d.getId()+"plus_marker_border"
});
if(a&&c){a._isYLocked=true;
a.y=e.bottomYStartValue-12;
c._isYLocked=true;
c.y=e.bottomYStartValue-14
}},addParticipantsOnCreation:function(f){if(!this._isLayoutEnabled){return
}var b=f.elements[0];
if(b&&f.elements.length===1&&b._stencil&&!b.initialParticipantsAdded&&(b.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyTask"||b.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessCollapsed"||b.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessExpanded")){var e=b.getChildNodes().find(function(h){return(h.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant")
});
if(e){return
}var d={type:"http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant",position:{x:0,y:0},namespace:b.getStencil().namespace(),parent:b};
var c=this.facade.createShape(d);
c.setProperty("oryx-initiating",true);
var g={elements:[c],key:"oryx-initiating",value:true};
this.handlePropertyChanged(g);
var a={type:"http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant",position:{x:0,y:b.bounds.lowerRight().y},namespace:b.getStencil().namespace(),parent:b};
this.facade.createShape(a);
this.facade.getCanvas().update();
this.facade.setSelection([b]);
b.initialParticipantsAdded=true
}},addOrGetChoreographyTaskMeta:function(a){if(!this.choreographyTasksMeta[a.getId()]){this.choreographyTasksMeta[a.getId()]=new Object();
this.choreographyTasksMeta[a.getId()].numOfParticipantsOnTop=0;
this.choreographyTasksMeta[a.getId()].numOfParticipantsOnBottom=0;
this.choreographyTasksMeta[a.getId()].numOfParticipantsExtendedOnBottom=0;
this.choreographyTasksMeta[a.getId()].numOfParticipantsExtendedOnTop=0;
this.choreographyTasksMeta[a.getId()].bottomYStartValue=a.bounds.height();
this.choreographyTasksMeta[a.getId()].topYEndValue=0;
this.choreographyTasksMeta[a.getId()].center=a.bounds.height()/2;
this.choreographyTasksMeta[a.getId()].oldHeight=a.bounds.height();
this.choreographyTasksMeta[a.getId()].oldBounds=a.bounds.clone();
this.choreographyTasksMeta[a.getId()].topParticipants=new Array();
this.choreographyTasksMeta[a.getId()].bottomParticipants=new Array()
}return this.choreographyTasksMeta[a.getId()]
},handleResizingOfChoreographyTask:function(g,h){if(g.bounds.height()==h.oldHeight){return
}var c=h.numOfParticipantsOnTop*this.participantSize+h.numOfParticipantsExtendedOnTop*this.extensionSizeForMarker+h.numOfParticipantsOnBottom*this.participantSize+h.numOfParticipantsExtendedOnBottom*this.extensionSizeForMarker+40;
if(c>g.bounds.height()){var e=g.bounds.upperLeft();
var d=h.oldBounds.upperLeft();
var b=g.bounds.lowerRight();
var a=h.oldBounds.lowerRight();
if(e.y!=d.y){g.bounds.set(e.x,b.y-c,b.x,b.y)
}else{if(b.y!=a.y){g.bounds.set(e.x,e.y,b.x,e.y+c)
}}}var f=h.oldHeight-g.bounds.height();
h.bottomYStartValue-=f;
return true
},handleLayoutChoreographyTask:function(event){if(!this._isLayoutEnabled){return
}var choreographyTask=event.shape;
var isNew=!this.choreographyTasksMeta[choreographyTask.getId()];
var choreographyTaskMeta=this.addOrGetChoreographyTaskMeta(choreographyTask);
var isResized=this.handleResizingOfChoreographyTask(choreographyTask,choreographyTaskMeta);
var oldCountTop=choreographyTaskMeta.numOfParticipantsOnTop;
var oldCountBottom=choreographyTaskMeta.numOfParticipantsOnBottom;
if(isResized){var participants=choreographyTaskMeta.topParticipants
}else{var participants=this.getParticipants(choreographyTask,true,false);
if(!participants){return
}this.ensureParticipantsParent(choreographyTask,participants)
}var numOfParticipantsExtended=0;
participants.each(function(participant,i){participant.isResizable=false;
participant.setProperty("oryx-corners","None");
var isExtended=this.setBoundsOfParticipantDependOnProperties(participant,i,numOfParticipantsExtended,choreographyTask.bounds.width(),0);
if(isExtended){numOfParticipantsExtended++
}if(i==0){participant.setProperty("oryx-corners","Top")
}this.adjustTopBackground(participant)
}.bind(this));
var resizeFactor=participants.length-choreographyTaskMeta.numOfParticipantsOnTop;
var resizeFactorExtended=numOfParticipantsExtended-choreographyTaskMeta.numOfParticipantsExtendedOnTop;
var bounds=choreographyTask.bounds;
var ul=bounds.upperLeft();
var lr=bounds.lowerRight();
if(!isNew){bounds.set(ul.x,ul.y-resizeFactor*this.participantSize-resizeFactorExtended*this.extensionSizeForMarker,lr.x,lr.y)
}choreographyTaskMeta.topYEndValue=participants.length*this.participantSize+numOfParticipantsExtended*this.extensionSizeForMarker;
choreographyTaskMeta.numOfParticipantsExtendedOnTop=numOfParticipantsExtended;
choreographyTaskMeta.numOfParticipantsOnTop=participants.length;
choreographyTaskMeta.topParticipants=participants;
if(isResized){var participants=choreographyTaskMeta.bottomParticipants
}else{var participants=this.getParticipants(choreographyTask,false,true);
if(!participants){return
}this.ensureParticipantsParent(choreographyTask,participants)
}if(isNew){choreographyTaskMeta.bottomYStartValue=(bounds.height()-(participants.length!=0?eval(participants.map(function(p){return this.participantSize+(this.isExtended(p)?this.extensionSizeForMarker:0)
}.bind(this)).join("+")):0))
}else{choreographyTaskMeta.bottomYStartValue+=resizeFactor*this.participantSize+resizeFactorExtended*this.extensionSizeForMarker
}var bottomStartYValue=choreographyTaskMeta.bottomYStartValue;
var numOfParticipantsExtended=0;
participants.each(function(participant,i){participant.isResizable=false;
participant.setProperty("oryx-corners","None");
var isExtendedParticipant=this.setBoundsOfParticipantDependOnProperties(participant,i,numOfParticipantsExtended,choreographyTask.bounds.width(),bottomStartYValue);
if(isExtendedParticipant){numOfParticipantsExtended++
}if(i==participants.length-1){participant.setProperty("oryx-corners","Bottom")
}this.adjustTopBackground(participant)
}.bind(this));
var resizeFactor=participants.length-choreographyTaskMeta.numOfParticipantsOnBottom;
var resizeFactorExtended=numOfParticipantsExtended-choreographyTaskMeta.numOfParticipantsExtendedOnBottom;
var bounds=choreographyTask.bounds;
var ul=bounds.upperLeft();
var lr=bounds.lowerRight();
if(!isNew){bounds.set(ul.x,ul.y,lr.x,lr.y+resizeFactor*this.participantSize+resizeFactorExtended*this.extensionSizeForMarker)
}choreographyTaskMeta.numOfParticipantsExtendedOnBottom=numOfParticipantsExtended;
choreographyTaskMeta.numOfParticipantsOnBottom=participants.length;
choreographyTaskMeta.bottomParticipants=participants;
var participantsHasChanged=oldCountTop!==choreographyTaskMeta.numOfParticipantsOnTop||oldCountBottom!==choreographyTaskMeta.numOfParticipantsOnBottom;
this.ensureCenterPositionOfMagnets(choreographyTask,isResized,participantsHasChanged);
this.adjustTextFieldAndMarkerPosition(choreographyTask);
choreographyTaskMeta.oldHeight=bounds.height();
choreographyTaskMeta.oldBounds=bounds.clone()
},isExtended:function(a){return(!a||a.properties["oryx-multiple_instance"]===""?false:!!a.properties["oryx-multiple_instance"])
},setBoundsOfParticipantDependOnProperties:function(b,d,g,e,f){var a=this.isExtended(b);
var h=f+d*this.participantSize+g*this.extensionSizeForMarker;
var c=f+this.participantSize+d*this.participantSize+(a?(g+1)*this.extensionSizeForMarker:g*this.extensionSizeForMarker);
b.bounds.set(0,h,e,c);
return a
},adjustTextFieldAndMarkerPosition:function(f){var g=this.addOrGetChoreographyTaskMeta(f);
var e=f.bounds.height()/f._oldBounds.height();
var d=f._labels[f.getId()+"text_name"];
if(d){var a=g.topYEndValue+(g.bottomYStartValue-g.topYEndValue)/2;
if(f.isResized&&e){d.y=a/e
}else{d.y=a
}}var c=f._svgShapes.find(function(h){return h.element.id==f.getId()+"loop_path"
});
if(c){c._isYLocked=true;
c.y=g.bottomYStartValue-7
}var b=f._svgShapes.find(function(h){return h.element.id==f.getId()+"mi_path"
});
if(b){b._isYLocked=true;
b.y=g.bottomYStartValue-11
}},ensureCenterPositionOfMagnets:function(d,l,c){var f=this.addOrGetChoreographyTaskMeta(d);
var a=f.topYEndValue+(f.bottomYStartValue-f.topYEndValue)/2;
var b=a-f.center;
var g=d.bounds.height()/f.oldBounds.height();
if(!b&&!g){return
}var h=d.magnets.findAll(function(n){return(!n.anchorTop&&!n.anchorBottom)
});
h.each(function(o){var n=o.bounds.center().x;
var p=(o.bounds.center().y+b)/g;
o.bounds.centerMoveTo(n,p)
});
var e=d.absoluteBounds().upperLeft().y+f.topYEndValue;
var k=d.absoluteBounds().upperLeft().y+f.bottomYStartValue;
var m=new Array();
d.incoming.each(function(n){if(!(n instanceof ORYX.Core.Edge)){return
}var o=n.dockers.last();
if(e<=o.bounds.center().y&&o.bounds.center().y<=k){m.push(o)
}});
d.outgoing.each(function(n){if(!(n instanceof ORYX.Core.Edge)){return
}var o=n.dockers.first();
if(e<=o.bounds.center().y&&o.bounds.center().y<=k){m.push(o)
}});
if(c&&d.initialParticipantsAdded){m.each(function(n){var o=n.referencePoint;
n.setReferencePoint({x:o.x,y:(o.y+b)/g})
})
}f.center=a
},ensureParticipantsParent:function(a,b){if(!a||!b){return
}b.each(function(c){if(c.parent.getId()==a.getId()){return
}c.parent.remove(c);
a.add(c)
})
},getParticipants:function(b,h,e){if(b.getStencil().id()!=="http://b3mn.org/stencilset/bpmn2.0#ChoreographyTask"&&b.getStencil().id()!=="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessCollapsed"&&b.getStencil().id()!=="http://b3mn.org/stencilset/bpmn2.0#ChoreographySubprocessExpanded"){return null
}var g=this.addOrGetChoreographyTaskMeta(b);
var a=b.absoluteBounds().upperLeft().y+g.topYEndValue+(g.bottomYStartValue-g.topYEndValue)/2;
var f=b.getChildNodes(true).findAll(function(k){return(h&&k.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant"&&k.absoluteBounds().center().y<=a&&this.isParticipantOfShape(b,k))
}.bind(this));
var d=b.getChildNodes(true).findAll(function(k){return(e&&k.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant"&&k.absoluteBounds().center().y>a&&this.isParticipantOfShape(b,k))
}.bind(this));
var c=f.concat(d);
c=c.sort(function(l,k){var m=Math.round(l.absoluteBounds().upperLeft().y);
var n=Math.round(k.absoluteBounds().upperLeft().y);
return m<n?-1:(m>n?1:0)
});
return c
},isParticipantOfShape:function(b,a){var c=a.parent;
while(c.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant"){c=c.parent
}return c.getId()===b.getId()
},adjustTopBackground:function(a){var d=a.properties["oryx-corners"];
var b=$(a.getId()+"roundedBgRect");
if(!b){return
}if(d==="Top"){b.setAttributeNS(null,"fill","url(#"+a.getId()+"background_top) white")
}else{var c=a.properties["oryx-color"];
b.setAttributeNS(null,"fill",c)
}},handlePropertyChanged:function(c){var b=c.elements;
var d=c.key||c.name;
var a=c.value;
var e=false;
b.each(function(f){if(f.getStencil().id()==="http://b3mn.org/stencilset/bpmn2.0#ChoreographyParticipant"&&d==="oryx-initiating"){if(!a){f.setProperty("oryx-color","#acacac")
}else{f.setProperty("oryx-color","#ffffff")
}e=true
}});
if(e){this.facade.getCanvas().update()
}}};
ORYX.Plugins.Bpmn2_0Choreography=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.Bpmn2_0Choreography);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeRepository={facade:undefined,construct:function(c){this.facade=c;
this._currentParent;
this._canContain=undefined;
this._canAttach=undefined;
this.shapeList=new Ext.tree.TreeNode({});
var a=new Ext.tree.TreePanel({cls:"shaperepository",loader:new Ext.tree.TreeLoader(),root:this.shapeList,autoScroll:true,rootVisible:false,lines:false,anchors:"0, -30"});
var d=this.facade.addToRegion("west",a,ORYX.I18N.ShapeRepository.title);
var b=new Ext.dd.DragZone(this.shapeList.getUI().getEl(),{shadow:!Ext.isMac});
b.afterDragDrop=this.drop.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
b.beforeDragEnter=function(){this._lastOverElement=false;
return true
}.bind(this);
this.setStencilSets();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.setStencilSets.bind(this))
},setStencilSets:function(){var a=this.shapeList.firstChild;
while(a){this.shapeList.removeChild(a);
a=this.shapeList.firstChild
}this.facade.getStencilSets().values().each((function(d){var b;
var f=d.title();
var c=d.extensions();
if(c&&c.size()>0){f+=" / "+ORYX.Core.StencilSet.getTranslation(c.values()[0],"title")
}this.shapeList.appendChild(b=new Ext.tree.TreeNode({text:f,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRep",singleClickExpand:true}));
b.render();
b.expand();
var e=d.stencils(this.facade.getCanvas().getStencil(),this.facade.getRules());
var g=new Hash();
e=e.sortBy(function(h){return h.position()
});
e.each((function(k){if(e.length<=ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP){this.createStencilTreeNode(b,k);
return
}var h=k.groups();
h.each((function(l){if(!g[l]){g[l]=new Ext.tree.TreeNode({text:l,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRepChild",singleClickExpand:true});
b.appendChild(g[l]);
g[l].render()
}this.createStencilTreeNode(g[l],k)
}).bind(this));
if(h.length==0){this.createStencilTreeNode(b,k)
}}).bind(this))
}).bind(this));
if(this.shapeList.firstChild.firstChild){this.shapeList.firstChild.firstChild.expand(false,true)
}},createStencilTreeNode:function(a,b){var d=new Ext.tree.TreeNode({text:b.title(),icon:b.icon(),allowDrag:false,allowDrop:false,iconCls:"ShapeRepEntreeImg",cls:"ShapeRepEntree"});
a.appendChild(d);
d.render();
var c=d.getUI();
c.elNode.setAttributeNS(null,"title",b.description());
Ext.dd.Registry.register(c.elNode,{node:c.node,handles:[c.elNode,c.textNode].concat($A(c.elNode.childNodes)),isHandle:false,type:b.id(),namespace:b.namespace()})
},drop:function(k,g,b){this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"});
var h=k.getProxy();
if(h.dropStatus==h.dropNotAllowed){return
}if(!this._currentParent){return
}var f=Ext.dd.Registry.getHandle(g.DDM.currentTarget);
var o=b.getXY();
var l={x:o[0],y:o[1]};
var m=this.facade.getCanvas().node.getScreenCTM();
l.x-=m.e;
l.y-=m.f;
l.x/=m.a;
l.y/=m.d;
l.x-=document.documentElement.scrollLeft;
l.y-=document.documentElement.scrollTop;
var n=this._currentParent.absoluteXY();
l.x-=n.x;
l.y-=n.y;
f.position=l;
if(this._canAttach&&this._currentParent instanceof ORYX.Core.Node){f.parent=undefined
}else{f.parent=this._currentParent
}var d=ORYX.Core.Command.extend({construct:function(r,p,s,a,q){this.option=r;
this.currentParent=p;
this.canAttach=s;
this.position=a;
this.facade=q;
this.selection=this.facade.getSelection();
this.shape;
this.parent
},execute:function(){if(!this.shape){this.shape=this.facade.createShape(f);
this.parent=this.shape.parent
}else{this.parent.add(this.shape)
}if(this.canAttach&&this.currentParent instanceof ORYX.Core.Node&&this.shape.dockers.length>0){var a=this.shape.dockers[0];
if(this.currentParent.parent instanceof ORYX.Core.Node){this.currentParent.parent.add(a.parent)
}a.bounds.centerMoveTo(this.position);
a.setDockedShape(this.currentParent)
}this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.facade.deleteShape(this.shape);
this.facade.setSelection(this.selection.without(this.shape));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var e=this.facade.eventCoordinates(b.browserEvent);
var c=new d(f,this._currentParent,this._canAttach,e,this.facade);
this.facade.executeCommands([c]);
this._currentParent=undefined
},beforeDragOver:function(h,f,b){var e=this.facade.eventCoordinates(b.browserEvent);
var m=this.facade.getCanvas().getAbstractShapesAtPosition(e);
if(m.length<=0){var a=h.getProxy();
a.setStatus(a.dropNotAllowed);
a.sync();
return false
}var c=m.last();
if(m.lenght==1&&m[0] instanceof ORYX.Core.Canvas){return false
}else{var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
var k=this.facade.getStencilSets()[d.namespace];
var l=k.stencil(d.type);
if(l.type()==="node"){var g=m.reverse().find(function(n){return(n instanceof ORYX.Core.Canvas||n instanceof ORYX.Core.Node||n instanceof ORYX.Core.Edge)
});
if(g!==this._lastOverElement){this._canAttach=undefined;
this._canContain=undefined
}if(g){if(!(g instanceof ORYX.Core.Canvas)&&g.isPointOverOffset(e.x,e.y)&&this._canAttach==undefined){this._canAttach=this.facade.getRules().canConnect({sourceShape:g,edgeStencil:l,targetStencil:l});
if(this._canAttach){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.attached",elements:[g],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this._canContain=undefined
}}if(!(g instanceof ORYX.Core.Canvas)&&!g.isPointOverOffset(e.x,e.y)){this._canAttach=this._canAttach==false?this._canAttach:undefined
}if(this._canContain==undefined&&!this._canAttach){this._canContain=this.facade.getRules().canContain({containingShape:g,containedStencil:l});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.added",elements:[g],color:this._canContain?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"})
}this._currentParent=this._canContain||this._canAttach?g:undefined;
this._lastOverElement=g;
var a=h.getProxy();
a.setStatus(this._currentParent?a.dropAllowed:a.dropNotAllowed);
a.sync()
}}else{this._currentParent=this.facade.getCanvas();
var a=h.getProxy();
a.setStatus(a.dropAllowed);
a.sync()
}}return false
}};
ORYX.Plugins.ShapeRepository=Clazz.extend(ORYX.Plugins.ShapeRepository);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.PropertyWindow={facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW,this.init.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.selectDiagram.bind(this));
this.init()
},init:function(){this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",null,["div"]);
this.currentDateFormat;
this.popularProperties=[];
this.properties=[];
this.shapeSelection=new Hash();
this.shapeSelection.shapes=new Array();
this.shapeSelection.commonProperties=new Array();
this.shapeSelection.commonPropertiesValues=new Hash();
this.updaterFlag=false;
this.columnModel=new Ext.grid.ColumnModel([{header:ORYX.I18N.PropertyWindow.name,dataIndex:"name",width:90,sortable:true,renderer:this.tooltipRenderer.bind(this)},{header:ORYX.I18N.PropertyWindow.value,dataIndex:"value",id:"propertywindow_column_value",width:110,editor:new Ext.form.TextField({allowBlank:false}),renderer:this.renderer.bind(this)},{header:"Pop",dataIndex:"popular",hidden:true,sortable:true}]);
this.dataSource=new Ext.data.GroupingStore({proxy:new Ext.data.MemoryProxy(this.properties),reader:new Ext.data.ArrayReader({},[{name:"popular"},{name:"name"},{name:"value"},{name:"icons"},{name:"gridProperties"}]),sortInfo:{field:"popular",direction:"ASC"},sortData:function(c,d){d=d||"ASC";
var a=this.fields.get(c).sortType;
var b=function(f,e){var l=a(f.data[c]),k=a(e.data[c]);
var h=f.data.popular,g=e.data.popular;
return h&&!g?-1:(!h&&g?1:(l>k?1:(l<k?-1:0)))
};
this.data.sort(d,b);
if(this.snapshot&&this.snapshot!=this.data){this.snapshot.sort(d,b)
}},groupField:"popular"});
this.dataSource.load();
this.grid=new Ext.grid.EditorGridPanel({clicksToEdit:1,stripeRows:true,autoExpandColumn:"propertywindow_column_value",width:"auto",colModel:this.columnModel,enableHdMenu:false,view:new Ext.grid.GroupingView({forceFit:true,groupTextTpl:"{[values.rs.first().data.popular ? ORYX.I18N.PropertyWindow.oftenUsed : ORYX.I18N.PropertyWindow.moreProps]}"}),store:this.dataSource});
region=this.facade.addToRegion("east",new Ext.Panel({width:220,layout:"fit",border:false,title:"Properties",items:[this.grid]}),ORYX.I18N.PropertyWindow.title);
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.view.on("refresh",this.hideMoreAttrs,this,true);
this.grid.enableColumnMove=false
},selectDiagram:function(){this.shapeSelection.shapes=[this.facade.getCanvas()];
this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.createProperties()
},specialKeyDown:function(b,a){if(b instanceof Ext.form.TextArea&&a.button==ORYX.CONFIG.KEY_Code_enter){return false
}},tooltipRenderer:function(b,c,a){c.cellAttr='title="'+a.data.gridProperties.tooltip+'"';
return b
},renderer:function(b,c,a){this.tooltipRenderer(b,c,a);
if(b instanceof Date){b=b.dateFormat(ORYX.I18N.PropertyWindow.dateFormat)
}else{if(String(b).search("<a href='")<0){b=String(b).gsub("<","&lt;");
b=String(b).gsub(">","&gt;");
b=String(b).gsub("%","&#37;");
b=String(b).gsub("&","&amp;");
if(a.data.gridProperties.type==ORYX.CONFIG.TYPE_COLOR){b="<div class='prop-background-color' style='background-color:"+b+"' />"
}a.data.icons.each(function(d){if(d.name==b){if(d.icon){b="<img src='"+d.icon+"' /> "+b
}}})
}}return b
},beforeEdit:function(c){var d=this.dataSource.getAt(c.row).data.gridProperties.editor;
var a=this.dataSource.getAt(c.row).data.gridProperties.renderer;
if(d){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
c.grid.getColumnModel().setEditor(1,d);
d.field.row=c.row;
d.render(this.grid);
d.setSize(c.grid.getColumnModel().getColumnWidth(1),d.height)
}else{return false
}var b=this.dataSource.getAt(c.row).data.gridProperties.propId;
this.oldValues=new Hash();
this.shapeSelection.shapes.each(function(e){this.oldValues[e.getId()]=e.properties[b]
}.bind(this))
},afterEdit:function(e){e.grid.getStore().commitChanges();
var c=e.record.data.gridProperties.propId;
var h=this.shapeSelection.shapes;
var b=this.oldValues;
var f=e.value;
var d=this.facade;
var a=ORYX.Core.Command.extend({construct:function(){this.key=c;
this.selectedElements=h;
this.oldValues=b;
this.newValue=f;
this.facade=d
},execute:function(){this.selectedElements.each(function(k){if(!k.getStencil().property(this.key).readonly()){k.setProperty(this.key,this.newValue)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.selectedElements.each(function(k){k.setProperty(this.key,this.oldValues[k.getId()])
}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a();
this.facade.executeCommands([g]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:h,key:c,value:e.value})
},editDirectly:function(a,b){this.shapeSelection.shapes.each(function(d){if(!d.getStencil().property(a).readonly()){d.setProperty(a,b)
}}.bind(this));
var c=this.shapeSelection.shapes;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:c,key:a,value:b});
this.facade.getCanvas().update()
},updateAfterInvalid:function(a){this.shapeSelection.shapes.each(function(b){if(!b.getStencil().property(a).readonly()){b.setProperty(a,this.oldValues[b.getId()]);
b.update()
}}.bind(this));
this.facade.getCanvas().update()
},dialogClosed:function(a){var b=this.field?this.field.row:this.row;
this.scope.afterEdit({grid:this.scope.grid,record:this.scope.grid.getStore().getAt(b),value:a});
this.scope.grid.startEditing(b,this.col)
},setPropertyWindowTitle:function(){if(this.shapeSelection.shapes.length==1){region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.first().getStencil().title()+")")
}else{region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.length+" "+ORYX.I18N.PropertyWindow.selected+")")
}},setCommonPropertiesValues:function(){this.shapeSelection.commonPropertiesValues=new Hash();
this.shapeSelection.commonProperties.each(function(d){var c=d.prefix()+"-"+d.id();
var b=false;
var a=this.shapeSelection.shapes.first();
this.shapeSelection.shapes.each(function(e){if(a.properties[c]!=e.properties[c]){b=true
}}.bind(this));
if(!b){this.shapeSelection.commonPropertiesValues[c]=a.properties[c]
}}.bind(this))
},getStencilSetOfSelection:function(){var a=new Hash();
this.shapeSelection.shapes.each(function(b){a[b.getStencil().id()]=b.getStencil()
});
return a
},identifyCommonProperties:function(){this.shapeSelection.commonProperties.clear();
var d=this.getStencilSetOfSelection();
var c=d.values().first();
var b=d.values().without(c);
if(b.length==0){this.shapeSelection.commonProperties=c.properties()
}else{var a=new Hash();
c.properties().each(function(e){a[e.namespace()+"-"+e.id()+"-"+e.type()]=e
});
b.each(function(e){var f=new Hash();
e.properties().each(function(g){if(a[g.namespace()+"-"+g.id()+"-"+g.type()]){f[g.namespace()+"-"+g.id()+"-"+g.type()]=g
}});
a=f
});
this.shapeSelection.commonProperties=a.values()
}},onSelectionChanged:function(a){this.grid.stopEditing();
this.shapeSelection.shapes=a.elements;
if(a.elements.length==0){this.shapeSelection.shapes=[this.facade.getCanvas()]
}if(a.subSelection){this.shapeSelection.shapes=[a.subSelection]
}this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.setCommonPropertiesValues();
this.createProperties()
},createProperties:function(){this.properties=[];
this.popularProperties=[];
if(this.shapeSelection.commonProperties){this.shapeSelection.commonProperties.each((function(p,g){var u=p.prefix()+"-"+p.id();
var v=p.title();
var s=[];
var l=this.shapeSelection.commonPropertiesValues[u];
var a=undefined;
var b=null;
var k=false;
if(!p.readonly()){switch(p.type()){case ORYX.CONFIG.TYPE_STRING:if(p.wrapLines()){var e=new Ext.form.TextArea({alignment:"tl-tl",allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
e.on("keyup",function(x,w){this.editDirectly(u,x.getValue())
}.bind(this));
a=new Ext.Editor(e)
}else{var h=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
h.on("keyup",function(w,x){this.editDirectly(u,w.getValue())
}.bind(this));
h.on("blur",function(w){if(!w.isValid(false)){this.updateAfterInvalid(u)
}}.bind(this));
h.on("specialkey",function(w,x){if(!w.isValid(false)){this.updateAfterInvalid(u)
}}.bind(this));
a=new Ext.Editor(h)
}break;
case ORYX.CONFIG.TYPE_BOOLEAN:var t=new Ext.form.Checkbox();
t.on("check",function(x,w){this.editDirectly(u,w)
}.bind(this));
a=new Ext.Editor(t);
break;
case ORYX.CONFIG.TYPE_INTEGER:var c=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:false,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
c.on("keyup",function(w,x){this.editDirectly(u,w.getValue())
}.bind(this));
a=new Ext.Editor(c);
break;
case ORYX.CONFIG.TYPE_FLOAT:var c=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:true,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
c.on("keyup",function(w,x){this.editDirectly(u,w.getValue())
}.bind(this));
a=new Ext.Editor(c);
break;
case ORYX.CONFIG.TYPE_COLOR:var r=new Ext.ux.ColorField({allowBlank:p.optional(),msgTarget:"title",facade:this.facade});
a=new Ext.Editor(r);
break;
case ORYX.CONFIG.TYPE_CHOICE:var o=p.items();
var d=[];
o.each(function(w){if(w.value()==l){l=w.title()
}if(w.refToView()[0]){k=true
}d.push([w.icon(),w.title(),w.value()]);
s.push({name:w.title(),icon:w.icon()})
});
var f=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:d});
var q=new Ext.form.ComboBox({tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:f,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
q.on("select",function(y,w,x){this.editDirectly(u,y.getValue())
}.bind(this));
a=new Ext.Editor(q);
break;
case ORYX.CONFIG.TYPE_DATE:var n=ORYX.I18N.PropertyWindow.dateFormat;
if(!(l instanceof Date)){l=Date.parseDate(l,n)
}a=new Ext.Editor(new Ext.form.DateField({allowBlank:p.optional(),format:n,msgTarget:"title"}));
break;
case ORYX.CONFIG.TYPE_TEXT:var m=new Ext.form.ComplexTextField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:g,facade:this.facade});
m.on("dialogClosed",this.dialogClosed,{scope:this,row:g,col:1,field:m});
a=new Ext.Editor(m);
break;
case ORYX.CONFIG.TYPE_COMPLEX:var m=new Ext.form.ComplexListField({allowBlank:p.optional()},p.complexItems(),u,this.facade);
m.on("dialogClosed",this.dialogClosed,{scope:this,row:g,col:1,field:m});
a=new Ext.Editor(m);
break;
case"CPNString":var h=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
h.on("keyup",function(w,x){this.editDirectly(u,w.getValue());
console.log(w.getValue());
alert("huhu")
}.bind(this));
a=new Ext.Editor(h);
break;
default:var h=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
h.on("keyup",function(w,x){this.editDirectly(u,w.getValue())
}.bind(this));
a=new Ext.Editor(h)
}a.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
a.on("specialkey",this.specialKeyDown.bind(this))
}else{if(p.type()===ORYX.CONFIG.TYPE_URL||p.type()===ORYX.CONFIG.TYPE_DIAGRAM_LINK){l=String(l).search("http")!==0?("http://"+l):l;
l="<a href='"+l+"' target='_blank'>"+l.split("://")[1]+"</a>"
}}if(p.visible()){if(p.refToView()[0]||k||p.popular()){p.setPopular()
}if(p.popular()){this.popularProperties.push([p.popular(),v,l,s,{editor:a,propId:u,type:p.type(),tooltip:p.description(),renderer:b}])
}else{this.properties.push([p.popular(),v,l,s,{editor:a,propId:u,type:p.type(),tooltip:p.description(),renderer:b}])
}}}).bind(this))
}this.setProperties()
},hideMoreAttrs:function(a){if(this.properties.length<=0){return
}this.grid.view.toggleGroup(this.grid.view.getGroupId(this.properties[0][0]),false);
this.grid.view.un("refresh",this.hideMoreAttrs,this)
},setProperties:function(){var a=this.popularProperties.concat(this.properties);
this.dataSource.loadData(a)
}};
ORYX.Plugins.PropertyWindow=Clazz.extend(ORYX.Plugins.PropertyWindow);
Ext.form.ComplexListField=function(b,a,c,d){Ext.form.ComplexListField.superclass.constructor.call(this,b);
this.items=a;
this.key=c;
this.facade=d
};
Ext.extend(Ext.form.ComplexListField,Ext.form.TriggerField,{triggerClass:"x-form-complex-trigger",readOnly:true,emptyText:ORYX.I18N.PropertyWindow.clickIcon,buildValue:function(){var f=this.grid.getStore();
f.commitChanges();
if(f.getCount()==0){return""
}var d="[";
for(var c=0;
c<f.getCount();
c++){var e=f.getAt(c);
d+="{";
for(var a=0;
a<this.items.length;
a++){var b=this.items[a].id();
d+=b+":"+(""+e.get(b)).toJSON();
if(a<(this.items.length-1)){d+=", "
}}d+="}";
if(c<(f.getCount()-1)){d+=", "
}}d+="]";
d="{'totalCount':"+f.getCount().toJSON()+", 'items':"+d+"}";
return Object.toJSON(d.evalJSON())
},getFieldKey:function(){return this.key
},getValue:function(){if(this.grid){return this.buildValue()
}else{if(this.data==undefined){return""
}else{return this.data
}}},setValue:function(a){if(a.length>0){if(this.data==undefined){this.data=a
}}},keydownHandler:function(a){return false
},dialogListeners:{show:function(){this.onFocus();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
return
},hide:function(){var a=this.dialogListeners;
this.dialog.un("show",a.show,this);
this.dialog.un("hide",a.hide,this);
this.dialog.destroy(true);
this.grid.destroy(true);
delete this.grid;
delete this.dialog;
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
this.fireEvent("dialogClosed",this.data);
Ext.form.ComplexListField.superclass.setValue.call(this,this.data)
}},buildInitial:function(f,a){var b=new Hash();
for(var c=0;
c<a.length;
c++){var e=a[c].id();
b[e]=a[c].value()
}var d=Ext.data.Record.create(f);
return new d(b)
},buildColumnModel:function(m){var h=[];
for(var c=0;
c<this.items.length;
c++){var a=this.items[c].id();
var d=this.items[c].name();
var b=this.items[c].width();
var g=this.items[c].type();
var e;
if(g==ORYX.CONFIG.TYPE_STRING){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}else{if(g==ORYX.CONFIG.TYPE_CHOICE){var f=this.items[c].items();
var l=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",m,["select",{style:"display:none"}]);
var k=new Ext.Template('<option value="{value}">{value}</option>');
f.each(function(n){k.append(l,{value:n.value()})
});
e=new Ext.form.ComboBox({typeAhead:true,triggerAction:"all",transform:l,lazyRender:true,msgTarget:"title",width:b})
}else{if(g==ORYX.CONFIG.TYPE_BOOLEAN){e=new Ext.form.Checkbox({width:b})
}}}h.push({id:a,header:d,dataIndex:a,resizable:true,editor:e,width:b})
}return new Ext.grid.ColumnModel(h)
},afterEdit:function(a){a.grid.getStore().commitChanges()
},beforeEdit:function(h){var a=this.grid.getView().getScrollState();
var b=h.column;
var p=h.row;
var e=this.grid.getColumnModel().config[b].id;
for(var g=0;
g<this.items.length;
g++){var o=this.items[g];
var m=o.disable();
if(m!=undefined){var n=this.grid.getStore().getAt(p).get(o.id());
for(var d=0;
d<m.length;
d++){var f=m[d];
if(f.value==n){for(var c=0;
c<f.items.length;
c++){var l=f.items[c];
if(l==e){this.grid.getColumnModel().getCellEditor(b,p).disable();
return
}}}}}}this.grid.getColumnModel().getCellEditor(b,p).enable()
},onTriggerClick:function(){if(this.disabled){return
}var dialogWidth=0;
var recordType=[];
for(var i=0;
i<this.items.length;
i++){var id=this.items[i].id();
var width=this.items[i].width();
var type=this.items[i].type();
if(type==ORYX.CONFIG.TYPE_CHOICE){type=ORYX.CONFIG.TYPE_STRING
}dialogWidth+=width;
recordType[i]={name:id,type:type}
}if(dialogWidth>800){dialogWidth=800
}dialogWidth+=22;
var data=this.data;
if(data==""){data="{}"
}var ds=new Ext.data.Store({proxy:new Ext.data.MemoryProxy(eval("("+data+")")),reader:new Ext.data.JsonReader({root:"items",totalProperty:"totalCount"},recordType)});
ds.load();
var cm=this.buildColumnModel();
this.grid=new Ext.grid.EditorGridPanel({store:ds,cm:cm,stripeRows:true,clicksToEdit:1,autoHeight:true,selModel:new Ext.grid.CellSelectionModel()});
var toolbar=new Ext.Toolbar([{text:ORYX.I18N.PropertyWindow.add,handler:function(){var ds=this.grid.getStore();
var index=ds.getCount();
this.grid.stopEditing();
var p=this.buildInitial(recordType,this.items);
ds.insert(index,p);
ds.commitChanges();
this.grid.startEditing(index,0)
}.bind(this)},{text:ORYX.I18N.PropertyWindow.rem,handler:function(){var ds=this.grid.getStore();
var selection=this.grid.getSelectionModel().getSelectedCell();
if(selection==undefined){return
}this.grid.getSelectionModel().clearSelections();
this.grid.stopEditing();
var record=ds.getAt(selection[0]);
ds.remove(record);
ds.commitChanges()
}.bind(this)}]);
this.dialog=new Ext.Window({autoScroll:true,autoCreate:true,title:ORYX.I18N.PropertyWindow.complex,height:350,width:dialogWidth,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){this.dialog.hide
}.bind(this)}],items:[toolbar,this.grid],bodyStyle:"background-color:#FFFFFF",buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){this.grid.stopEditing();
this.data=this.buildValue();
this.dialog.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.dialog.hide()
}.bind(this)}]});
this.dialog.on(Ext.apply({},this.dialogListeners,{scope:this}));
this.dialog.show();
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.render()
}});
Ext.form.ComplexTextField=Ext.extend(Ext.form.TriggerField,{defaultAutoCreate:{tag:"textarea",rows:1,style:"height:16px;overflow:hidden;"},onTriggerClick:function(){if(this.disabled){return
}var b=new Ext.form.TextArea({anchor:"100% 100%",value:this.value,listeners:{focus:function(){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}.bind(this)}});
var a=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.text,height:500,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){a.hide()
}.bind(this)}],items:[b],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
a.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var c=b.getValue();
this.setValue(c);
this.dataSource.getAt(this.row).set("value",c);
this.dataSource.commitChanges();
a.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
a.hide()
}.bind(this)}]});
a.show();
b.render();
this.grid.stopEditing();
b.focus(false,100)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.CanvasResize=Clazz.extend({construct:function(a){this.facade=a;
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"N",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"W",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"E",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"S",this.resize.bind(this))
},resize:function(a,c){resizeCanvas=function(l,m,o){var f=o.getCanvas();
var n=f.bounds;
var h=o.getCanvas().getHTMLContainer().parentNode.parentNode;
if(l=="E"||l=="W"){f.setSize({width:(n.width()+m)*f.zoomLevel,height:(n.height())*f.zoomLevel})
}else{if(l=="S"||l=="N"){f.setSize({width:(n.width())*f.zoomLevel,height:(n.height()+m)*f.zoomLevel})
}}if(l=="N"||l=="W"){var g=l=="N"?{x:0,y:m}:{x:m,y:0};
f.getChildNodes(false,function(q){q.bounds.moveBy(g)
});
var k=f.getChildEdges().findAll(function(q){return q.getAllDockedShapes().length>0
});
var p=k.collect(function(q){return q.dockers.findAll(function(r){return !r.getDockedShape()
})
}).flatten();
p.each(function(q){q.bounds.moveBy(g)
})
}else{if(l=="S"){h.scrollTop+=m
}else{if(l=="E"){h.scrollLeft+=m
}}}f.update();
o.updateSelection()
};
var b=ORYX.Core.Command.extend({construct:function(f,h,g){this.position=f;
this.extentionSize=h;
this.facade=g
},execute:function(){resizeCanvas(this.position,this.extentionSize,this.facade)
},rollback:function(){resizeCanvas(this.position,-this.extentionSize,this.facade)
},update:function(){}});
var d=ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
if(c){d=-d
}var e=new b(a,d,this.facade);
this.facade.executeCommands([e])
}});
ORYX.Plugins.CanvasResizeButton=Clazz.extend({construct:function(c,h,n){this.canvas=c;
var k=c.getHTMLContainer().parentNode.parentNode.parentNode;
window.myParent=k;
var d=k.firstChild;
var b=d.firstChild.firstChild;
var a=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",k,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_grow "+h,title:ORYX.I18N.RESIZE.tipGrow+ORYX.I18N.RESIZE[h]}]);
var e=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",k,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_shrink "+h,title:ORYX.I18N.RESIZE.tipShrink+ORYX.I18N.RESIZE[h]}]);
var f=60;
var m=function(p){if(p.target!=k&&p.target!=d&&p.target!=d.firstChild&&p.target!=b&&p.target!=d){return false
}var s=p.layerX;
var r=p.layerY;
if((s-d.scrollLeft)<0||Ext.isSafari){s+=d.scrollLeft
}if((r-d.scrollTop)<0||Ext.isSafari){r+=d.scrollTop
}if(h=="N"){return r<f+d.firstChild.offsetTop
}else{if(h=="W"){return s<f+d.firstChild.offsetLeft
}else{if(h=="E"){var o=(d.offsetWidth-(d.firstChild.offsetLeft+d.firstChild.offsetWidth));
if(o<0){o=0
}return s>d.scrollWidth-o-f
}else{if(h=="S"){var q=(d.offsetHeight-(d.firstChild.offsetTop+d.firstChild.offsetHeight));
if(q<0){q=0
}return r>d.scrollHeight-q-f
}}}}return false
};
var l=(function(){a.show();
var p,v,o,u;
try{var t=this.canvas.getRootNode().childNodes[1].getBBox();
p=t.x;
v=t.y;
o=t.x+t.width;
u=t.y+t.height
}catch(s){this.canvas.getChildShapes(true).each(function(y){var A=y.absoluteBounds();
var z=A.upperLeft();
var w=A.lowerRight();
if(p==undefined){p=z.x;
v=z.y;
o=w.x;
u=w.y
}else{p=Math.min(p,z.x);
v=Math.min(v,z.y);
o=Math.max(o,w.x);
u=Math.max(u,w.y)
}})
}var x=c.bounds.width();
var r=c.bounds.height();
var q=c.getChildNodes().size()==0;
if(h=="N"&&(v>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(q&&r>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{if(h=="E"&&(x-o)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="S"&&(r-u)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="W"&&(p>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(q&&x>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{e.hide()
}}}}}).bind(this);
var g=function(){a.hide();
e.hide()
};
d.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,function(o){if(m(o)){l()
}else{g()
}},false);
a.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(o){l()
},true);
e.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(o){l()
},true);
k.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,function(o){g()
},true);
g();
a.addEventListener("click",function(){n(h);
l()
},true);
e.addEventListener("click",function(){n(h,true);
l()
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.View={facade:undefined,construct:function(b,a){this.facade=b;
this.zoomLevel=1;
this.maxFitToScreenLevel=1.5;
this.minZoomLevel=0.1;
this.maxZoomLevel=2.5;
this.diff=5;
a.properties.each(function(c){if(c.zoomLevel){this.zoomLevel=Number(1)
}if(c.maxFitToScreenLevel){this.maxFitToScreenLevel=Number(c.maxFitToScreenLevel)
}if(c.minZoomLevel){this.minZoomLevel=Number(c.minZoomLevel)
}if(c.maxZoomLevel){this.maxZoomLevel=Number(c.maxZoomLevel)
}}.bind(this));
this.facade.offer({name:ORYX.I18N.View.zoomIn,functionality:this.zoom.bind(this,[1+ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/magnifier_zoom_in.png",description:ORYX.I18N.View.zoomInDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel<this.maxZoomLevel
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomOut,functionality:this.zoom.bind(this,[1-ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/magnifier_zoom_out.png",description:ORYX.I18N.View.zoomOutDesc,index:2,minShape:0,maxShape:0,isEnabled:function(){return this._checkSize()
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomStandard,functionality:this.setAFixZoomLevel.bind(this,1),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/zoom_standard.png",cls:"icon-large",description:ORYX.I18N.View.zoomStandardDesc,index:3,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel!=1
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomFitToModel,functionality:this.zoomFitToModel.bind(this),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/image.png",description:ORYX.I18N.View.zoomFitToModelDesc,index:4,minShape:0,maxShape:0})
},setAFixZoomLevel:function(a){this.zoomLevel=a;
this._checkZoomLevelRange();
this.zoom(1)
},zoom:function(d){this.zoomLevel*=d;
var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var c=this.facade.getCanvas();
var g=c.bounds.width()*this.zoomLevel;
var a=c.bounds.height()*this.zoomLevel;
var f=(c.node.parentNode.parentNode.parentNode.offsetHeight-a)/2;
f=f>20?f-20:0;
c.node.parentNode.parentNode.style.marginTop=f+"px";
f+=5;
c.getHTMLContainer().style.top=f+"px";
var b=h.scrollTop-Math.round((c.getHTMLContainer().parentNode.getHeight()-a)/2)+this.diff;
var e=h.scrollLeft-Math.round((c.getHTMLContainer().parentNode.getWidth()-g)/2)+this.diff;
c.setSize({width:g,height:a},true);
c.node.setAttributeNS(null,"transform","scale("+this.zoomLevel+")");
this.facade.updateSelection();
h.scrollTop=b;
h.scrollLeft=e;
c.zoomLevel=this.zoomLevel
},zoomFitToModel:function(){var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var b=h.getHeight()-30;
var d=h.getWidth()-30;
var c=this.facade.getCanvas().getChildShapes();
if(!c||c.length<1){return false
}var g=c[0].absoluteBounds().clone();
c.each(function(k){g.include(k.absoluteBounds().clone())
});
var f=d/g.width();
var a=b/g.height();
var e=a<f?a:f;
if(e>this.maxFitToScreenLevel){e=this.maxFitToScreenLevel
}this.setAFixZoomLevel(e);
h.scrollTop=Math.round(g.upperLeft().y*this.zoomLevel)-5;
h.scrollLeft=Math.round(g.upperLeft().x*this.zoomLevel)-5
},_checkSize:function(){var a=this.facade.getCanvas().getHTMLContainer().parentNode;
var b=Math.min((a.parentNode.getWidth()/a.getWidth()),(a.parentNode.getHeight()/a.getHeight()));
return 1.05>b
},_checkZoomLevelRange:function(){if(this.zoomLevel<this.minZoomLevel){this.zoomLevel=this.minZoomLevel
}if(this.zoomLevel>this.maxZoomLevel){this.zoomLevel=this.maxZoomLevel
}}};
ORYX.Plugins.View=Clazz.extend(ORYX.Plugins.View);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDropResize=ORYX.Plugins.AbstractPlugin.extend({construct:function(b){this.facade=b;
this.currentShapes=[];
this.toMoveShapes=[];
this.distPoints=[];
this.isResizing=false;
this.dragEnable=false;
this.dragIntialized=false;
this.edgesMovable=true;
this.offSetPosition={x:0,y:0};
this.faktorXY={x:1,y:1};
this.containmentParentNode;
this.isAddingAllowed=false;
this.isAttachingAllowed=false;
this.callbackMouseMove=this.handleMouseMove.bind(this);
this.callbackMouseUp=this.handleMouseUp.bind(this);
var a=this.facade.getCanvas().getSvgContainer();
this.selectedRect=new ORYX.Plugins.SelectedRect(a);
if(ORYX.CONFIG.SHOW_GRIDLINE){this.vLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_VERTICAL);
this.hLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_HORIZONTAL)
}a=this.facade.getCanvas().getHTMLContainer();
this.scrollNode=this.facade.getCanvas().rootNode.parentNode.parentNode;
this.resizerSE=new ORYX.Plugins.Resizer(a,"southeast",this.facade);
this.resizerSE.registerOnResize(this.onResize.bind(this));
this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this));
this.resizerNW=new ORYX.Plugins.Resizer(a,"northwest",this.facade);
this.resizerNW.registerOnResize(this.onResize.bind(this));
this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},handleMouseDown:function(d,c){if(!this.dragBounds||!this.currentShapes.member(c)||!this.toMoveShapes.length){return
}this.dragEnable=true;
this.dragIntialized=true;
this.edgesMovable=true;
var b=this.facade.getCanvas().node.getScreenCTM();
this.faktorXY.x=b.a;
this.faktorXY.y=b.d;
var e=this.dragBounds.upperLeft();
this.offSetPosition={x:Event.pointerX(d)-(e.x*this.faktorXY.x),y:Event.pointerY(d)-(e.y*this.faktorXY.y)};
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
return
},handleMouseUp:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"});
if(this.dragEnable){if(!this.dragIntialized){this.afterDrag();
if(this.isAttachingAllowed&&this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0){var b=this.facade.eventCoordinates(d);
var e=this.toMoveShapes[0].dockers[0];
var c=ORYX.Core.Command.extend({construct:function(k,f,h,g){this.docker=k;
this.newPosition=f;
this.newDockedShape=h;
this.newParent=h.parent||g.getCanvas();
this.oldPosition=k.parent.bounds.center();
this.oldDockedShape=k.getDockedShape();
this.oldParent=k.parent.parent||g.getCanvas();
this.facade=g;
if(this.oldDockedShape){this.oldPosition=k.parent.absoluteBounds().center()
}},execute:function(){this.dock(this.newDockedShape,this.newParent,this.newPosition);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,excludeCommand:true})
},rollback:function(){this.dock(this.oldDockedShape,this.oldParent,this.oldPosition)
},dock:function(f,g,h){g.add(this.docker.parent);
this.docker.setDockedShape(undefined);
this.docker.bounds.centerMoveTo(h);
this.docker.setDockedShape(f);
this.facade.setSelection([this.docker.parent]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var a=[new c(e,b,this.containmentParentNode,this.facade)];
this.facade.executeCommands(a)
}else{if(this.isAddingAllowed){this.refreshSelectedShapes()
}}this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_END})
}if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}this.dragEnable=false;
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
return
},handleMouseMove:function(g){if(!this.dragEnable){return
}if(this.dragIntialized){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_START});
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
this._onlyEdges=this.currentShapes.all(function(c){return(c instanceof ORYX.Core.Edge)
});
this.beforeDrag();
this._currentUnderlyingNodes=[]
}var a={x:Event.pointerX(g)-this.offSetPosition.x,y:Event.pointerY(g)-this.offSetPosition.y};
a.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
a.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
var b=g.shiftKey||g.ctrlKey;
if(ORYX.CONFIG.GRID_ENABLED&&!b){a=this.snapToGrid(a)
}else{if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}a.x/=this.faktorXY.x;
a.y/=this.faktorXY.y;
a.x=Math.max(0,a.x);
a.y=Math.max(0,a.y);
var h=this.facade.getCanvas();
a.x=Math.min(h.bounds.width()-this.dragBounds.width(),a.x);
a.y=Math.min(h.bounds.height()-this.dragBounds.height(),a.y);
this.dragBounds.moveTo(a);
this.resizeRectangle(this.dragBounds);
this.isAttachingAllowed=false;
var d=$A(this.facade.getCanvas().getAbstractShapesAtPosition(this.facade.eventCoordinates(g)));
var f=this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0;
f=f&&d.length!=1;
if(!f&&d.length===this._currentUnderlyingNodes.length&&d.all(function(k,c){return this._currentUnderlyingNodes[c]===k
}.bind(this))){return
}else{if(this._onlyEdges){this.isAddingAllowed=true;
this.containmentParentNode=this.facade.getCanvas()
}else{var e={event:g,underlyingNodes:d,checkIfAttachable:f};
this.checkRules(e)
}}this._currentUnderlyingNodes=d.reverse();
if(this.isAttachingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.attached",elements:[this.containmentParentNode],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"})
}if(!this.isAttachingAllowed){if(this.isAddingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_INVALID_COLOR})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"})
}return
},checkRules:function(d){var f=d.event;
var c=d.underlyingNodes;
var e=d.checkIfAttachable;
var b=d.noEdges;
this.containmentParentNode=c.reverse().find((function(g){return(g instanceof ORYX.Core.Canvas)||(((g instanceof ORYX.Core.Node)||((g instanceof ORYX.Core.Edge)&&!b))&&(!(this.currentShapes.member(g)||this.currentShapes.any(function(h){return(h.children.length>0&&h.getChildNodes(true).member(g))
}))))
}).bind(this));
if(e&&this.containmentParentNode){this.isAttachingAllowed=this.facade.getRules().canConnect({sourceShape:this.containmentParentNode,edgeShape:this.toMoveShapes[0],targetShape:this.toMoveShapes[0]});
if(this.isAttachingAllowed){var a=this.facade.eventCoordinates(f);
this.isAttachingAllowed=this.containmentParentNode.isPointOverOffset(a.x,a.y)
}}if(!this.isAttachingAllowed){this.isAddingAllowed=this.toMoveShapes.all((function(g){if(g instanceof ORYX.Core.Edge||g instanceof ORYX.Core.Controls.Docker||this.containmentParentNode===g.parent){return true
}else{if(this.containmentParentNode!==g){if(!(this.containmentParentNode instanceof ORYX.Core.Edge)||!b){if(this.facade.getRules().canContain({containingShape:this.containmentParentNode,containedShape:g})){return true
}}}}return false
}).bind(this))
}if(!this.isAttachingAllowed&&!this.isAddingAllowed&&(this.containmentParentNode instanceof ORYX.Core.Edge)){d.noEdges=true;
d.underlyingNodes.reverse();
this.checkRules(d)
}},refreshSelectedShapes:function(){if(!this.dragBounds){return
}var d=this.dragBounds.upperLeft();
var b=this.oldDragBounds.upperLeft();
var c={x:d.x-b.x,y:d.y-b.y};
var a=[new ORYX.Core.Command.Move(this.toMoveShapes,c,this.containmentParentNode,this.currentShapes,this)];
if(this._undockedEdgesCommand instanceof ORYX.Core.Command){a.unshift(this._undockedEdgesCommand)
}this.facade.executeCommands(a);
if(this.dragBounds){this.oldDragBounds=this.dragBounds.clone()
}},onResize:function(a){if(!this.dragBounds){return
}this.dragBounds=a;
this.isResizing=true;
this.resizeRectangle(this.dragBounds)
},onResizeStart:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_START})
},onResizeEnd:function(){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}if(this.isResizing){var a=ORYX.Core.Command.extend({construct:function(f,h,g){this.shape=f;
this.oldBounds=f.bounds.clone();
this.newBounds=h;
this.plugin=g
},execute:function(){this.shape.bounds.set(this.newBounds.a,this.newBounds.b);
this.update(this.getOffset(this.oldBounds,this.newBounds))
},rollback:function(){this.shape.bounds.set(this.oldBounds.a,this.oldBounds.b);
this.update(this.getOffset(this.newBounds,this.oldBounds))
},getOffset:function(g,f){return{x:f.a.x-g.a.x,y:f.a.y-g.a.y,xs:f.width()/g.width(),ys:f.height()/g.height()}
},update:function(g){this.shape.getLabels().each(function(h){h.changed()
});
var f=[].concat(this.shape.getIncomingShapes()).concat(this.shape.getOutgoingShapes()).findAll(function(h){return h instanceof ORYX.Core.Edge
}.bind(this));
this.plugin.layoutEdges(this.shape,f,g);
this.plugin.facade.setSelection([this.shape]);
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
}});
var c=this.dragBounds.clone();
var b=this.currentShapes[0];
if(b.parent){var e=b.parent.absoluteXY();
c.moveBy(-e.x,-e.y)
}var d=new a(b,c,this);
this.facade.executeCommands([d]);
this.isResizing=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_END})
}},beforeDrag:function(){var a=ORYX.Core.Command.extend({construct:function(b){this.dockers=b.collect(function(c){return c instanceof ORYX.Core.Controls.Docker?{docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(b){b.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(b){b.docker.setDockedShape(b.dockedShape);
b.docker.setReferencePoint(b.refPoint)
})
}});
this._undockedEdgesCommand=new a(this.toMoveShapes);
this._undockedEdgesCommand.execute()
},hideAllLabels:function(a){a.getLabels().each(function(b){b.hide()
});
a.getAllDockedShapes().each(function(b){var c=b.getLabels();
if(c.length>0){c.each(function(d){d.hide()
})
}});
a.getChildren().each((function(b){if(b instanceof ORYX.Core.Shape){this.hideAllLabels(b)
}}).bind(this))
},afterDrag:function(){},showAllLabels:function(a){for(var d=0;
d<a.length;
d++){var b=a[d];
b.show()
}var f=a.getAllDockedShapes();
for(var d=0;
d<f.length;
d++){var c=f[d];
var g=c.getLabels();
if(g.length>0){g.each(function(h){h.show()
})
}}for(var d=0;
d<a.children.length;
d++){var e=a.children[d];
if(e instanceof ORYX.Core.Shape){this.showAllLabels(e)
}}},onSelectionChanged:function(b){var d=b.elements;
this.dragEnable=false;
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
if(!d||d.length==0){this.selectedRect.hide();
this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined;
this.oldDragBounds=undefined
}else{this.currentShapes=d;
var e=this.facade.getCanvas().getShapesWithSharedParent(d);
this.toMoveShapes=e;
this.toMoveShapes=this.toMoveShapes.findAll(function(f){return f instanceof ORYX.Core.Node&&(f.dockers.length===0||!d.member(f.dockers.first().getDockedShape()))
});
d.each((function(f){if(!(f instanceof ORYX.Core.Edge)){return
}var h=f.getDockers();
var k=d.member(h.first().getDockedShape());
var g=d.member(h.last().getDockedShape());
if(!k&&!g){var l=!h.first().getDockedShape()&&!h.last().getDockedShape();
if(l){this.toMoveShapes=this.toMoveShapes.concat(h)
}}if(f.dockers.length>2&&k&&g){this.toMoveShapes=this.toMoveShapes.concat(h.findAll(function(n,m){return m>0&&m<h.length-1
}))
}}).bind(this));
var c=undefined;
this.toMoveShapes.each(function(g){var f=g;
if(g instanceof ORYX.Core.Controls.Docker){f=g.parent
}if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}}.bind(this));
if(!c){d.each(function(f){if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}})
}this.dragBounds=c;
this.oldDragBounds=c.clone();
this.resizeRectangle(c);
this.selectedRect.show();
if(d.length==1&&d[0].isResizable){var a=d[0].getStencil().fixedAspectRatio()?d[0].bounds.width()/d[0].bounds.height():undefined;
this.resizerSE.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerSE.show();
this.resizerNW.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerNW.show()
}else{this.resizerSE.setBounds(undefined);
this.resizerNW.setBounds(undefined)
}if(ORYX.CONFIG.GRID_ENABLED){this.distPoints=[];
if(this.distPointTimeout){window.clearTimeout(this.distPointTimeout)
}this.distPointTimeout=window.setTimeout(function(){var f=this.facade.getCanvas().getChildShapes(true).findAll(function(h){var g=h.parent;
while(g){if(d.member(g)){return false
}g=g.parent
}return true
});
f.each((function(l){if(!(l instanceof ORYX.Core.Edge)){var h=l.absoluteXY();
var k=l.bounds.width();
var g=l.bounds.height();
this.distPoints.push({ul:{x:h.x,y:h.y},c:{x:h.x+(k/2),y:h.y+(g/2)},lr:{x:h.x+k,y:h.y+g}})
}}).bind(this))
}.bind(this),10)
}}},snapToGrid:function(h){var a=this.dragBounds;
var p={};
var o=6;
var m=10;
var q=6;
var b=this.vLine?this.vLine.getScale():1;
var l={x:(h.x/b),y:(h.y/b)};
var n={x:(h.x/b)+(a.width()/2),y:(h.y/b)+(a.height()/2)};
var g={x:(h.x/b)+(a.width()),y:(h.y/b)+(a.height())};
var f,d;
var k,e;
this.distPoints.each(function(s){var c,u,t,r;
if(Math.abs(s.c.x-n.x)<m){c=s.c.x-n.x;
t=s.c.x
}if(Math.abs(s.c.y-n.y)<m){u=s.c.y-n.y;
r=s.c.y
}if(c!==undefined){f=f===undefined?c:(Math.abs(c)<Math.abs(f)?c:f);
if(f===c){k=t
}}if(u!==undefined){d=d===undefined?u:(Math.abs(u)<Math.abs(d)?u:d);
if(d===u){e=r
}}});
if(f!==undefined){l.x+=f;
l.x*=b;
if(this.vLine&&k){this.vLine.update(k)
}}else{l.x=(h.x-(h.x%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.vLine){this.vLine.hide()
}}if(d!==undefined){l.y+=d;
l.y*=b;
if(this.hLine&&e){this.hLine.update(e)
}}else{l.y=(h.y-(h.y%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.hLine){this.hLine.hide()
}}return l
},showGridLine:function(){},resizeRectangle:function(a){this.selectedRect.resize(a)
}});
ORYX.Plugins.SelectedRect=Clazz.extend({construct:function(a){this.parentId=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",$(a),["g"]);
this.dashedArea=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["rect",{x:0,y:0,"stroke-width":1,stroke:"#777777",fill:"none","stroke-dasharray":"2,2","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","")
},resize:function(a){var c=a.upperLeft();
var b=ORYX.CONFIG.SELECTED_AREA_PADDING;
this.dashedArea.setAttributeNS(null,"width",a.width()+2*b);
this.dashedArea.setAttributeNS(null,"height",a.height()+2*b);
this.node.setAttributeNS(null,"transform","translate("+(c.x-b)+", "+(c.y-b)+")")
}});
ORYX.Plugins.GridLine=Clazz.extend({construct:function(b,a){if(ORYX.Plugins.GridLine.DIR_HORIZONTAL!==a&&ORYX.Plugins.GridLine.DIR_VERTICAL!==a){a=ORYX.Plugins.GridLine.DIR_HORIZONTAL
}this.parent=$(b);
this.direction=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parent,["g"]);
this.line=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":1,stroke:"silver",fill:"none","stroke-dasharray":"5,5","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","")
},getScale:function(){try{return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a
}catch(a){return 1
}},update:function(e){if(this.direction===ORYX.Plugins.GridLine.DIR_HORIZONTAL){var d=e instanceof Object?e.y:e;
var c=this.parent.parentNode.parentNode.width.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M 0 "+d+" L "+c+" "+d)
}else{var a=e instanceof Object?e.x:e;
var b=this.parent.parentNode.parentNode.height.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M"+a+" 0 L "+a+" "+b)
}this.show()
}});
ORYX.Plugins.GridLine.DIR_HORIZONTAL="hor";
ORYX.Plugins.GridLine.DIR_VERTICAL="ver";
ORYX.Plugins.Resizer=Clazz.extend({construct:function(c,a,b){this.parentId=c;
this.orientation=a;
this.facade=b;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":"resizer_"+this.orientation,style:"left:0px; top:0px;"}]);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this),false);
this.dragEnable=false;
this.offSetPosition={x:0,y:0};
this.bounds=undefined;
this.canvasNode=this.facade.getCanvas().node;
this.minSize=undefined;
this.maxSize=undefined;
this.aspectRatio=undefined;
this.resizeCallbacks=[];
this.resizeStartCallbacks=[];
this.resizeEndCallbacks=[];
this.hide();
this.scrollNode=this.node.parentNode.parentNode.parentNode
},handleMouseDown:function(a){this.dragEnable=true;
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
this.offSetPosition={x:Event.pointerX(a)-this.position.x,y:Event.pointerY(a)-this.position.y};
this.resizeStartCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseUp:function(a){this.dragEnable=false;
this.containmentParentNode=null;
this.resizeEndCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseMove:function(c){if(!this.dragEnable){return
}if(c.shiftKey||c.ctrlKey){this.aspectRatio=this.bounds.width()/this.bounds.height()
}else{this.aspectRatio=undefined
}var b={x:Event.pointerX(c)-this.offSetPosition.x,y:Event.pointerY(c)-this.offSetPosition.y};
b.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
b.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
b.x=Math.min(b.x,this.facade.getCanvas().bounds.width());
b.y=Math.min(b.y,this.facade.getCanvas().bounds.height());
var d={x:b.x-this.position.x,y:b.y-this.position.y};
if(this.aspectRatio){newAspectRatio=(this.bounds.width()+d.x)/(this.bounds.height()+d.y);
if(newAspectRatio>this.aspectRatio){d.x=this.aspectRatio*(this.bounds.height()+d.y)-this.bounds.width()
}else{if(newAspectRatio<this.aspectRatio){d.y=(this.bounds.width()+d.x)/this.aspectRatio-this.bounds.height()
}}}if(this.orientation==="northwest"){if(this.bounds.width()-d.x>this.maxSize.width){d.x=-(this.maxSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()-d.x<this.minSize.width){d.x=-(this.minSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()-d.y>this.maxSize.height){d.y=-(this.maxSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()-d.y<this.minSize.height){d.y=-(this.minSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}else{if(this.bounds.width()+d.x>this.maxSize.width){d.x=this.maxSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()+d.x<this.minSize.width){d.x=this.minSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()+d.y>this.maxSize.height){d.y=this.maxSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()+d.y<this.minSize.height){d.y=this.minSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}if(this.orientation==="northwest"){var a={x:this.bounds.lowerRight().x,y:this.bounds.lowerRight().y};
this.bounds.extend({x:-d.x,y:-d.y});
this.bounds.moveBy(d)
}else{this.bounds.extend(d)
}this.update();
this.resizeCallbacks.each((function(e){e(this.bounds)
}).bind(this));
Event.stop(c)
},registerOnResizeStart:function(a){if(!this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks.push(a)
}},unregisterOnResizeStart:function(a){if(this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks=this.resizeStartCallbacks.without(a)
}},registerOnResizeEnd:function(a){if(!this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks.push(a)
}},unregisterOnResizeEnd:function(a){if(this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks=this.resizeEndCallbacks.without(a)
}},registerOnResize:function(a){if(!this.resizeCallbacks.member(a)){this.resizeCallbacks.push(a)
}},unregisterOnResize:function(a){if(this.resizeCallbacks.member(a)){this.resizeCallbacks=this.resizeCallbacks.without(a)
}},hide:function(){this.node.style.display="none"
},show:function(){if(this.bounds){this.node.style.display=""
}},setBounds:function(d,b,a,c){this.bounds=d;
if(!b){b={width:ORYX.CONFIG.MINIMUM_SIZE,height:ORYX.CONFIG.MINIMUM_SIZE}
}if(!a){a={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}this.minSize=b;
this.maxSize=a;
this.aspectRatio=c;
this.update()
},update:function(){if(!this.bounds){return
}var c=this.bounds.upperLeft();
if(this.bounds.width()<this.minSize.width){this.bounds.set(c.x,c.y,c.x+this.minSize.width,c.y+this.bounds.height())
}if(this.bounds.height()<this.minSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.minSize.height)
}if(this.bounds.width()>this.maxSize.width){this.bounds.set(c.x,c.y,c.x+this.maxSize.width,c.y+this.bounds.height())
}if(this.bounds.height()>this.maxSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.maxSize.height)
}var b=this.canvasNode.getScreenCTM();
c.x*=b.a;
c.y*=b.d;
if(this.orientation==="northwest"){c.x-=13;
c.y-=26
}else{c.x+=(b.a*this.bounds.width())+3;
c.y+=(b.d*this.bounds.height())+3
}this.position=c;
this.node.style.left=this.position.x+"px";
this.node.style.top=this.position.y+"px"
}});
ORYX.Core.Command.Move=ORYX.Core.Command.extend({construct:function(b,e,c,a,d){this.moveShapes=b;
this.selectedShapes=a;
this.offset=e;
this.plugin=d;
this.newParents=b.collect(function(f){return c||f.parent
});
this.oldParents=b.collect(function(f){return f.parent
});
this.dockedNodes=b.findAll(function(f){return f instanceof ORYX.Core.Node&&f.dockers.length==1
}).collect(function(f){return{docker:f.dockers[0],dockedShape:f.dockers[0].getDockedShape(),refPoint:f.dockers[0].referencePoint}
})
},execute:function(){this.dockAllShapes();
this.move(this.offset);
this.addShapeToParent(this.newParents);
this.selectCurrentShapes();
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
},rollback:function(){var a={x:-this.offset.x,y:-this.offset.y};
this.move(a);
this.addShapeToParent(this.oldParents);
this.dockAllShapes(true);
this.selectCurrentShapes();
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
},move:function(d,a){for(var g=0;
g<this.moveShapes.length;
g++){var l=this.moveShapes[g];
l.bounds.moveBy(d);
if(l instanceof ORYX.Core.Node){(l.dockers||[]).each(function(k){k.bounds.moveBy(d)
});
var e=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(k){return k instanceof ORYX.Core.Edge&&!this.moveShapes.any(function(m){return m==k||(m instanceof ORYX.Core.Controls.Docker&&m.parent==k)
})
}.bind(this)).findAll(function(k){return(k.dockers.first().getDockedShape()==l||!this.moveShapes.include(k.dockers.first().getDockedShape()))&&(k.dockers.last().getDockedShape()==l||!this.moveShapes.include(k.dockers.last().getDockedShape()))
}.bind(this));
this.plugin.layoutEdges(l,e,d);
var h=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(k){return k instanceof ORYX.Core.Edge&&k.dockers.first().isDocked()&&k.dockers.last().isDocked()&&!this.moveShapes.include(k)&&!this.moveShapes.any(function(m){return m==k||(m instanceof ORYX.Core.Controls.Docker&&m.parent==k)
})
}.bind(this)).findAll(function(k){return this.moveShapes.indexOf(k.dockers.first().getDockedShape())>g||this.moveShapes.indexOf(k.dockers.last().getDockedShape())>g
}.bind(this));
for(var f=0;
f<h.length;
f++){for(var b=1;
b<h[f].dockers.length-1;
b++){var c=h[f].dockers[b];
if(!c.getDockedShape()&&!this.moveShapes.include(c)){c.bounds.moveBy(d)
}}}}}},dockAllShapes:function(a){for(var b=0;
b<this.dockedNodes.length;
b++){var c=this.dockedNodes[b].docker;
c.setDockedShape(a?this.dockedNodes[b].dockedShape:undefined);
if(c.getDockedShape()){c.setReferencePoint(this.dockedNodes[b].refPoint)
}}},addShapeToParent:function(e){for(var f=0;
f<this.moveShapes.length;
f++){var d=this.moveShapes[f];
if(d instanceof ORYX.Core.Node&&d.parent!==e[f]){var g=e[f].absoluteXY();
var h=d.absoluteXY();
var c=h.x-g.x;
var k=h.y-g.y;
e[f].add(d);
d.getOutgoingShapes((function(b){if(b instanceof ORYX.Core.Node&&!this.moveShapes.member(b)){e[f].add(b)
}}).bind(this));
if(d instanceof ORYX.Core.Node&&d.dockers.length==1){var a=d.bounds;
c+=a.width()/2;
k+=a.height()/2;
d.dockers.first().bounds.centerMoveTo(c,k)
}else{d.bounds.moveTo(c,k)
}}}},selectCurrentShapes:function(){this.plugin.facade.setSelection(this.selectedShapes)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RenameShapes=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,this.actOnDBLClick.bind(this));
this.facade.offer({keyCodes:[{keyCode:113,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.renamePerF2.bind(this)});
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.hide.bind(this),true);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE,this.registerTemplate.bind(this));
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE,empty:true})
},registerTemplate:function(a){this.label_templates=this.label_templates||[];
this.label_templates.push({edit:"function"==typeof(a.edit_template)?a.edit_template:function(b){return b
},render:"function"==typeof(a.render_template)?a.render_template:function(b){return b
}})
},renamePerF2:function renamePerF2(){var a=this.facade.getSelection();
this.actOnDBLClick(undefined,a.first())
},getEditableProperties:function getEditableProperties(a){var b=a.getStencil().properties().findAll(function(c){return(c.refToView()&&c.refToView().length>0&&c.directlyEditable())
});
return b.findAll(function(c){return !c.readonly()&&c.type()==ORYX.CONFIG.TYPE_STRING
})
},getPropertyForLabel:function getPropertyForLabel(c,a,b){return c.find(function(d){return d.refToView().any(function(e){return b.id==a.id+e
})
})
},actOnDBLClick:function actOnDBLClick(h,d){if(!(d instanceof ORYX.Core.Shape)){return
}this.destroy();
var e=this.getEditableProperties(d);
var f=e.collect(function(m){return m.refToView()
}).flatten().compact();
var b=d.getLabels().findAll(function(m){return f.any(function(n){return m.id.endsWith(n)
})
});
if(b.length==0){return
}var c=b.length==1?b[0]:null;
if(!c){c=b.find(function(m){return m.node==h.target||m.node==h.target.parentNode
});
if(!c){var k=this.facade.eventCoordinates(h);
var l=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
k.x*=l.a;
k.y*=l.d;
if(!d instanceof ORYX.Core.Node){var g=b.collect(function(o){var n=this.getCenterPosition(o.node);
var m=Math.sqrt(Math.pow(n.x-k.x,2)+Math.pow(n.y-k.y,2));
return{diff:m,label:o}
}.bind(this));
g.sort(function(n,m){return n.diff>m.diff
});
c=g[0].label
}else{var g=b.collect(function(o){var n=this.getDifferenceCenterForNode(o.node);
var m=Math.sqrt(Math.pow(n.x-k.x,2)+Math.pow(n.y-k.y,2));
return{diff:m,label:o}
}.bind(this));
g.sort(function(n,m){return n.diff>m.diff
});
c=g[0].label
}}}var a=this.getPropertyForLabel(e,d,c);
this.showTextField(d,a,c)
},showTextField:function showTextField(h,c,k){var g=this.facade.getCanvas().getHTMLContainer().id;
var e;
if(!(h instanceof ORYX.Core.Node)){var a=k.node.getBoundingClientRect();
e=Math.max(150,a.width)
}else{e=h.bounds.width()
}if(!h instanceof ORYX.Core.Node){var b=this.getCenterPosition(k.node);
b.x-=(e/2)
}else{var b=h.absoluteBounds().center();
b.x-=(e/2)
}var d=c.prefix()+"-"+c.id();
var f={renderTo:g,value:(function(n,m,l){this.label_templates.forEach(function(o){try{n=o.edit(n,m,l)
}catch(p){ORYX.Log.error("Unable to render label template",p,o.edit)
}});
return n
}.bind(this))(h.properties[d],d,h),x:(b.x<10)?10:b.x,y:b.y,width:Math.max(100,e),style:"position:absolute",allowBlank:c.optional(),maxLength:c.length(),emptyText:c.title(),cls:"x_form_text_set_absolute",listeners:{specialkey:this._specialKeyPressed.bind(this)}};
if(c.wrapLines()){f.y-=30;
f.grow=true;
this.shownTextField=new Ext.form.TextArea(f)
}else{f.y-=16;
this.shownTextField=new Ext.form.TextField(f)
}this.shownTextField.focus();
this.shownTextField.on("blur",this.destroy.bind(this));
this.shownTextField.on("change",function(p,q){var o=h;
var m=o.properties[d];
var r=(function(v,u,t){this.label_templates.forEach(function(w){try{v=w.render(v,u,t)
}catch(x){ORYX.Log.error("Unable to render label template",x,w.render)
}});
return v
}.bind(this))(q,d,h);
var n=this.facade;
if(m!=r){var l=ORYX.Core.Command.extend({construct:function(){this.el=o;
this.propId=d;
this.oldValue=m;
this.newValue=r;
this.facade=n
},execute:function(){this.el.setProperty(this.propId,this.newValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.el.setProperty(this.propId,this.oldValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var s=new l();
this.facade.executeCommands([s])
}}.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
},_specialKeyPressed:function _specialKeyPressed(c,b){var a=b.getKey();
if(a==13&&(b.shiftKey||!c.initialConfig.grow)){c.fireEvent("change",null,c.getValue());
c.fireEvent("blur")
}else{if(a==b.ESC){c.fireEvent("blur")
}}},getCenterPosition:function(f){var a={x:0,y:0};
var c=f.getTransformToElement(this.facade.getCanvas().rootNode.lastChild);
var h=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
var b=f.getTransformToElement(f.parentNode);
var d=undefined;
a.x=c.e-b.e;
a.y=c.f-b.f;
try{d=f.getBBox()
}catch(g){}if(d===null||typeof d==="undefined"||d.width==0||d.height==0){d={x:Number(f.getAttribute("x")),y:Number(f.getAttribute("y")),width:0,height:0}
}a.x+=d.x;
a.y+=d.y;
a.x+=d.width/2;
a.y+=d.height/2;
a.x*=h.a;
a.y*=h.d;
return a
},getDifferenceCenterForNode:function getDifferenceCenterForNode(b){var a=this.getCenterPosition(b);
a.x=0;
a.y=a.y+10;
return a
},hide:function(a){if(this.shownTextField&&(!a||!this.shownTextField.el||a.target!==this.shownTextField.el.dom)){this.shownTextField.onBlur()
}},destroy:function(a){if(this.shownTextField){this.shownTextField.destroy();
delete this.shownTextField;
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ERDFSupport=Clazz.extend({facade:undefined,ERDFServletURL:"/erdfsupport",construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.ERDFSupport.exp,functionality:this.exportERDF.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/erdf_export_icon.png",description:ORYX.I18N.ERDFSupport.expDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.ERDFSupport.imp,functionality:this.importERDF.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/import.png",icon:ORYX.PATH+"images/erdf_import_icon.png",description:ORYX.I18N.ERDFSupport.impDesc,index:1,minShape:0,maxShape:0})
},importERDF:function(){this._showImportDialog()
},exportERDF:function(){Ext.Msg.show({title:ORYX.I18N.ERDFSupport.deprTitle,msg:ORYX.I18N.ERDFSupport.deprText,buttons:Ext.Msg.YESNO,fn:function(b){if(b==="yes"){var a=this.facade.getERDF();
this.openDownloadWindow(window.document.title+".xml",a)
}}.bind(this),icon:Ext.MessageBox.WARNING})
},sendRequest:function(b,d,e,a){var c=false;
new Ajax.Request(b,{method:"POST",asynchronous:false,parameters:d,onSuccess:function(f){c=true;
if(e){e(f.result)
}}.bind(this),onFailure:function(f){if(a){a()
}else{Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.ERDFSupport.impFailed);
ORYX.log.warn("Import ERDF failed: "+f.responseText)
}}.bind(this)});
return c
},loadERDF:function(b,e,a){var c=b;
c=c.startsWith("<?xml")?c:'<?xml version="1.0" encoding="utf-8"?>'+c+"";
var f=new DOMParser();
var d=f.parseFromString(c,"text/xml");
if(d.firstChild.tagName=="parsererror"){Ext.MessageBox.show({title:ORYX.I18N.ERDFSupport.error,msg:ORYX.I18N.ERDFSupport.impFailed2+d.firstChild.textContent.escapeHTML(),buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.ERROR});
if(a){a()
}}else{if(!this.hasStencilSet(d)){if(a){a()
}}else{this.facade.importERDF(d);
if(e){e()
}}}},hasStencilSet:function(e){var a=function(f,g){return $A(f.getElementsByTagName("div")).findAll(function(h){return $A(h.attributes).any(function(k){return k.nodeName=="class"&&k.nodeValue==g
})
})
};
var b=a(e,"-oryx-canvas")[0];
if(!b){this.throwWarning(ORYX.I18N.ERDFSupport.noCanvas);
return false
}var c=$A(b.getElementsByTagName("a")).find(function(f){return f.getAttribute("rel")=="oryx-stencilset"
});
if(!c){this.throwWarning(ORYX.I18N.ERDFSupport.noSS);
return false
}var d=c.getAttribute("href").split("/");
d=d[d.length-2]+"/"+d[d.length-1];
return true
},throwWarning:function(a){Ext.MessageBox.show({title:ORYX.I18N.Oryx.title,msg:a,buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.WARNING})
},openXMLWindow:function(a){var b=window.open("data:application/xml,"+encodeURIComponent(a),"_blank","resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes")
},openDownloadWindow:function(b,c){var d=window.open("");
if(d!=null){d.document.open();
d.document.write("<html><body>");
var a=d.document.createElement("form");
d.document.body.appendChild(a);
a.appendChild(this.createHiddenElement("download",c));
a.appendChild(this.createHiddenElement("file",b));
a.method="POST";
d.document.write("</body></html>");
d.document.close();
a.action=ORYX.PATH+"/download";
a.submit()
}},createHiddenElement:function(a,b){var c=document.createElement("input");
c.name=a;
c.type="hidden";
c.value=b;
return c
},_showImportDialog:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.ERDFSupport.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.ERDFSupport.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.ERDFSupport.impERDF,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.ERDFSupport.impBtn,handler:function(){var d=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.ERDFSupport.impProgress});
d.show();
window.setTimeout(function(){var e=c.items.items[2].getValue();
this.loadERDF(e,function(){d.hide();
b.hide()
}.bind(this),function(){d.hide()
}.bind(this))
}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.ERDFSupport.close,handler:function(){b.hide()
}.bind(this)}]});
b.on("hide",function(){b.destroy(true);
delete b
});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(d){var e=d.target.files[0].getAsText("UTF-8");
c.items.items[2].setValue(e)
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.JSONSupport=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.JSONSupport.exp.name,functionality:this.exportJSON.bind(this),group:ORYX.I18N.JSONSupport.exp.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_javascript.png",description:ORYX.I18N.JSONSupport.exp.desc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.JSONSupport.imp.name,functionality:this.showImportDialog.bind(this),group:ORYX.I18N.JSONSupport.imp.group,dropDownGroupIcon:ORYX.PATH+"images/import.png",icon:ORYX.PATH+"images/page_white_javascript.png",description:ORYX.I18N.JSONSupport.imp.desc,index:1,minShape:0,maxShape:0})
},exportJSON:function(){var a=this.facade.getSerializedJSON();
this.openDownloadWindow(window.document.title+".json",a)
},showImportDialog:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.JSONSupport.imp.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.JSONSupport.imp.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.JSONSupport.imp.name,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.JSONSupport.imp.btnImp,handler:function(){var d=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.JSONSupport.imp.progress});
d.show();
window.setTimeout(function(){var f=c.items.items[2].getValue();
try{this.facade.importJSON(f,true);
b.close()
}catch(e){Ext.Msg.alert(ORYX.I18N.JSONSupport.imp.syntaxError,e.message)
}finally{d.hide()
}}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.JSONSupport.imp.btnClose,handler:function(){b.close()
}.bind(this)}]});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(d){var e=d.target.files[0].getAsText("UTF-8");
c.items.items[2].setValue(e)
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RDFExport=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.RDFExport.rdfExport,functionality:this.exportRDF.bind(this),group:ORYX.I18N.RDFExport.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_code.png",description:ORYX.I18N.RDFExport.rdfExportDescription,index:0,minShape:0,maxShape:0})
},exportRDF:function(){this.openDownloadWindow(window.document.title+".rdf",this.getRDFFromDOM())
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Config.Feedback={VISIBLE_STATE:"visible",HIDDEN_STATE:"hidden",INFO:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, set eiusmod tempor incidunt et labore et dolore magna aliquam. Ut enim ad minim veniam, quis nostrud exerc. Irure dolor in reprehend incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse molestaie cillum. Tia non ob ea soluad incommod quae egen ium improb fugiend. Officia",CSS_FILE:ORYX.PATH+"/css/feedback.css"};
ORYX.Plugins.Feedback=ORYX.Plugins.AbstractPlugin.extend({construct:function(a,b){this.facade=a;
((b&&b.properties)||[]).each(function(d){if(d.cssfile){ORYX.Config.Feedback.CSS_FILE=d.css_file
}}.bind(this));
var c=document.createElement("link");
c.setAttribute("rel","stylesheet");
c.setAttribute("type","text/css");
c.setAttribute("href",ORYX.Config.Feedback.CSS_FILE);
document.getElementsByTagName("head")[0].appendChild(c);
this.elements={container:null,tab:null,dialog:null,form:null,info:null};
this.createFeedbackTab()
},createFeedbackTab:function(){this.elements.tab=document.createElement("div");
this.elements.tab.setAttribute("class","tab");
this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#8226;");
this.elements.container=document.createElement("div");
this.elements.container.setAttribute("id","feedback");
this.elements.container.appendChild(this.elements.tab);
document.body.appendChild(this.elements.container);
Event.observe(this.elements.tab,"click",this.toggleDialog.bindAsEventListener(this))
},toggleDialog:function(b){if(b){Event.stop(b)
}var a=this.elements.dialog||this.createDialog();
if(ORYX.Config.Feedback.VISIBLE_STATE==a.state){this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#8226;");
Element.hide(a);
a.state=ORYX.Config.Feedback.HIDDEN_STATE
}else{this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#215;");
Element.show(a);
a.state=ORYX.Config.Feedback.VISIBLE_STATE
}},createDialog:function(){if(this.elements.dialog){return this.elements.dialog
}var n=function(){[o,m,d].each(function(q){q.value=q._defaultText||"";
q.className="low"
})
};
var f=function(q){var r=Event.element(q);
if(r._defaultText&&r.value.strip()==r._defaultText.strip()){r.value="";
r.className="high"
}};
var b=function(q){var r=Event.element(q);
if(r._defaultText&&r.value.strip()==""){r.value=r._defaultText;
r.className="low"
}};
this.elements.form=document.createElement("form");
this.elements.form.action=ORYX.CONFIG.ROOT_PATH+"feedback";
this.elements.form.method="POST";
this.elements.form.onsubmit=function(){try{var q=function(){Ext.Msg.alert(ORYX.I18N.Feedback.failure,ORYX.I18N.Feedback.failureMsg);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
this.toggleDialog()
};
var t=function(u){if(u.status<200||u.status>=400){return q(u)
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Feedback.success});
n()
};
this.elements.form.model.value=this.facade.getSerializedJSON();
this.elements.form.environment.value=this.getEnv();
var s={};
$A(this.elements.form.elements).each(function(u){s[u.name]=u.value
});
s.name=ORYX.Editor.Cookie.getParams().identifier;
s.subject=("["+s.subject+"] "+s.title);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Feedback.sending});
new Ajax.Request(ORYX.CONFIG.ROOT_PATH+"feedback",{method:"POST",parameters:s,onSuccess:t.bind(this),onFailure:q.bind(this)});
this.toggleDialog()
}catch(r){q();
ORYX.Log.warn(r)
}return false
}.bind(this);
var p=document.createElement("div");
p.className="fieldset";
var k=document.createElement("input");
k.type="hidden";
k.name="subject";
k.style.display="none";
var o=document.createElement("textarea");
o._defaultText=ORYX.I18N.Feedback.descriptionDesc;
o.name="description";
Event.observe(o,"focus",f.bindAsEventListener());
Event.observe(o,"blur",b.bindAsEventListener());
var m=document.createElement("input");
m._defaultText=ORYX.I18N.Feedback.titleDesc;
m.type="text";
m.name="title";
Event.observe(m,"focus",f.bindAsEventListener());
Event.observe(m,"blur",b.bindAsEventListener());
var d=document.createElement("input");
d._defaultText=ORYX.I18N.Feedback.emailDesc;
d.type="text";
d.name="email";
Event.observe(d,"focus",f.bindAsEventListener());
Event.observe(d,"blur",b.bindAsEventListener());
var h=document.createElement("input");
h.type="button";
h.className="submit";
h.onclick=this.elements.form.onsubmit;
if(ORYX.I18N.Feedback.submit){h.value=ORYX.I18N.Feedback.submit
}var c=document.createElement("input");
c.name="environment";
c.type="hidden";
c.style.display="none";
var e=document.createElement("input");
e.name="model";
e.type="hidden";
e.style.display="none";
p.appendChild(k);
p.appendChild(o);
p.appendChild(m);
p.appendChild(d);
p.appendChild(c);
p.appendChild(e);
p.appendChild(h);
n();
var g=document.createElement("ul");
g.setAttribute("class","subjects");
var a=[];
$A(ORYX.I18N.Feedback.subjects).each(function(r,q){try{var t=document.createElement("li");
t._subject=r.id;
t.className=r.id;
t.innerHTML=r.name;
t.style.width=parseInt(100/$A(ORYX.I18N.Feedback.subjects).length)+"%";
a.push(t);
g.appendChild(t);
var s=function(){a.each(function(v){if(v.className.match(r.id)){v.className=v._subject+" active";
k.value=r.name;
if(o.value==o._defaultText){o.value=r.description
}o._defaultText=r.description;
if(r.info&&(""+r.info).strip().length>0){this.elements.info.innerHTML=r.info
}else{this.elements.info.innerHTML=ORYX.I18N.Feedback.info||""
}}else{v.className=v._subject
}}.bind(this))
}.bind(this);
Event.observe(t,"click",s);
if(q==(ORYX.I18N.Feedback.subjects.length-1)){o.value="";
o._defaultText="";
s()
}}catch(u){ORYX.Log.warn("Incomplete I10N for ORYX.I18N.Feedback.subjects",r,ORYX.I18N.Feedback.subjects)
}}.bind(this));
this.elements.form.appendChild(g);
this.elements.form.appendChild(p);
this.elements.info=document.createElement("div");
this.elements.info.setAttribute("class","info");
this.elements.info.innerHTML=ORYX.I18N.Feedback.info||"";
var l=document.createElement("div");
l.setAttribute("class","head");
this.elements.dialog=document.createElement("div");
this.elements.dialog.setAttribute("class","dialog");
this.elements.dialog.appendChild(l);
this.elements.dialog.appendChild(this.elements.info);
this.elements.dialog.appendChild(this.elements.form);
this.elements.container.appendChild(this.elements.dialog);
return this.elements.dialog
},getEnv:function(){var b="";
b+="Browser: "+navigator.userAgent;
b+="\n\nBrowser Plugins: ";
if(navigator.plugins){for(var a=0;
a<navigator.plugins.length;
a++){var c=navigator.plugins[a];
b+=c.name+", "
}}if((typeof(screen.width)!="undefined")&&(screen.width&&screen.height)){b+="\n\nScreen Resolution: "+screen.width+"x"+screen.height
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Undo=Clazz.extend({facade:undefined,undoStack:[],redoStack:[],construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Undo.undo,description:ORYX.I18N.Undo.undoDesc,icon:ORYX.PATH+"images/arrow_undo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:90,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doUndo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.undoStack.length>0
}.bind(this),index:0});
this.facade.offer({name:ORYX.I18N.Undo.redo,description:ORYX.I18N.Undo.redoDesc,icon:ORYX.PATH+"images/arrow_redo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:89,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doRedo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.redoStack.length>0
}.bind(this),index:1});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,this.handleExecuteCommands.bind(this))
},handleExecuteCommands:function(a){if(!a.commands){return
}this.undoStack.push(a.commands);
this.redoStack=[]
},doUndo:function(){var a=this.undoStack.pop();
if(a){this.redoStack.push(a);
a.each(function(b){b.rollback()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_ROLLBACK,commands:a})
},doRedo:function(){var a=this.redoStack.pop();
if(a){this.undoStack.push(a);
a.each(function(b){b.execute()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_EXECUTE,commands:a})
}});
Array.prototype.insertFrom=function(e,d){d=Math.max(0,d);
e=Math.min(Math.max(0,e),this.length-1);
var b=this[e];
var a=this.without(b);
var c=a.slice(0,d);
c.push(b);
if(a.length>d){c=c.concat(a.slice(d))
}return c
};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Arrangement=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Arrangement.btf,functionality:this.setZLevel.bind(this,this.setToTop),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_front.png",description:ORYX.I18N.Arrangement.btfDesc,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.btb,functionality:this.setZLevel.bind(this,this.setToBack),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_back.png",description:ORYX.I18N.Arrangement.btbDesc,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bf,functionality:this.setZLevel.bind(this,this.setForward),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_forwards.png",description:ORYX.I18N.Arrangement.bfDesc,index:3,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bb,functionality:this.setZLevel.bind(this,this.setBackward),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_backwards.png",description:ORYX.I18N.Arrangement.bbDesc,index:4,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.ab,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_BOTTOM]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_bottom.png",description:ORYX.I18N.Arrangement.abDesc,index:1,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.am,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_middle.png",description:ORYX.I18N.Arrangement.amDesc,index:2,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.at,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_TOP]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_top.png",description:ORYX.I18N.Arrangement.atDesc,index:3,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.al,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_LEFT]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_left.png",description:ORYX.I18N.Arrangement.alDesc,index:4,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ac,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_CENTER]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_center.png",description:ORYX.I18N.Arrangement.acDesc,index:5,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ar,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_RIGHT]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_right.png",description:ORYX.I18N.Arrangement.arDesc,index:6,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.as,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_SIZE]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_size.png",description:ORYX.I18N.Arrangement.asDesc,index:7,minShape:2});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,this.setZLevel.bind(this,this.setToTop));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACK,this.setZLevel.bind(this,this.setToBack));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD,this.setZLevel.bind(this,this.setForward));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD,this.setZLevel.bind(this,this.setBackward))
},setZLevel:function(d,b){var a=ORYX.Core.Command.extend({construct:function(g,f,e){this.callback=g;
this.elements=f;
this.elAndIndex=f.map(function(h){return{el:h,previous:h.parent.children[h.parent.children.indexOf(h)-1]}
});
this.facade=e
},execute:function(){this.callback(this.elements);
this.facade.setSelection(this.elements)
},rollback:function(){var g=this.elAndIndex.sortBy(function(n){var o=n.el;
var m=$A(o.node.parentNode.childNodes);
return m.indexOf(o.node)
});
for(var f=0;
f<g.length;
f++){var h=g[f].el;
var k=h.parent;
var l=k.children.indexOf(h);
var e=k.children.indexOf(g[f].previous);
e=e||0;
k.children=k.children.insertFrom(l,e);
h.node.parentNode.insertBefore(h.node,h.node.parentNode.childNodes[e+1])
}this.facade.setSelection(this.elements)
}});
var c=new a(d,this.facade.getSelection(),this.facade);
if(b.excludeCommand){c.execute()
}else{this.facade.executeCommands([c])
}},setToTop:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.push(c);
c.node.parentNode.appendChild(c.node)
})
},setToBack:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a=a.reverse();
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.unshift(c);
c.node.parentNode.insertBefore(c.node,c.node.parentNode.firstChild)
})
},setBackward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
b=b.reverse();
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.previousSibling
})
});
a.each(function(e){if(e.node.previousSibling===null){return
}var f=e.parent;
var d=f.children.indexOf(e);
f.children=f.children.insertFrom(d,d-1);
e.node.parentNode.insertBefore(e.node,e.node.previousSibling)
})
},setForward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.nextSibling
})
});
a.each(function(f){var d=f.node.nextSibling;
if(d===null){return
}var e=f.parent.children.indexOf(f);
var g=f.parent;
g.children=g.children.insertFrom(e,e+1);
f.node.parentNode.insertBefore(d,f.node)
})
},alignShapes:function(b){var f=this.facade.getSelection();
f=this.facade.getCanvas().getShapesWithSharedParent(f);
f=f.findAll(function(h){return(h instanceof ORYX.Core.Node)
});
f=f.findAll(function(h){var k=h.getIncomingShapes();
return k.length==0||!f.include(k[0])
});
if(f.length<2){return
}var e=f[0].absoluteBounds().clone();
f.each(function(h){e.include(h.absoluteBounds().clone())
});
var d=0;
var c=0;
f.each(function(h){d=Math.max(h.bounds.width(),d);
c=Math.max(h.bounds.height(),c)
});
var a=ORYX.Core.Command.extend({construct:function(o,n,m,l,h,k){this.elements=o;
this.bounds=n;
this.maxHeight=m;
this.maxWidth=l;
this.way=h;
this.facade=k;
this.orgPos=[]
},setBounds:function(h,l){if(!l){l={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}if(!h.bounds){throw"Bounds not definined."
}var k={a:{x:h.bounds.upperLeft().x-(this.maxWidth-h.bounds.width())/2,y:h.bounds.upperLeft().y-(this.maxHeight-h.bounds.height())/2},b:{x:h.bounds.lowerRight().x+(this.maxWidth-h.bounds.width())/2,y:h.bounds.lowerRight().y+(this.maxHeight-h.bounds.height())/2}};
if(this.maxWidth>l.width){k.a.x=h.bounds.upperLeft().x-(l.width-h.bounds.width())/2;
k.b.x=h.bounds.lowerRight().x+(l.width-h.bounds.width())/2
}if(this.maxHeight>l.height){k.a.y=h.bounds.upperLeft().y-(l.height-h.bounds.height())/2;
k.b.y=h.bounds.lowerRight().y+(l.height-h.bounds.height())/2
}h.bounds.set(k)
},execute:function(){this.elements.each(function(h,k){this.orgPos[k]=h.bounds.upperLeft();
var l=this.bounds.clone();
if(h.parent&&!(h.parent instanceof ORYX.Core.Canvas)){var m=h.parent.absoluteBounds().upperLeft();
l.moveBy(-m.x,-m.y)
}switch(this.way){case ORYX.CONFIG.EDITOR_ALIGN_BOTTOM:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:l.b.y-h.bounds.height()});
break;
case ORYX.CONFIG.EDITOR_ALIGN_MIDDLE:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:(l.a.y+l.b.y-h.bounds.height())/2});
break;
case ORYX.CONFIG.EDITOR_ALIGN_TOP:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:l.a.y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_LEFT:h.bounds.moveTo({x:l.a.x,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_CENTER:h.bounds.moveTo({x:(l.a.x+l.b.x-h.bounds.width())/2,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_RIGHT:h.bounds.moveTo({x:l.b.x-h.bounds.width(),y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_SIZE:if(h.isResizable){this.orgPos[k]={a:h.bounds.upperLeft(),b:h.bounds.lowerRight()};
this.setBounds(h,h.maximumSize)
}break
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.elements.each(function(h,k){if(this.way==ORYX.CONFIG.EDITOR_ALIGN_SIZE){if(h.isResizable){h.bounds.set(this.orgPos[k])
}}else{h.bounds.moveTo(this.orgPos[k])
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a(f,e,c,d,parseInt(b),this.facade);
this.facade.executeCommands([g])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Grouping=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Grouping.group,functionality:this.createGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.PATH+"images/shape_group.png",description:ORYX.I18N.Grouping.groupDesc,index:1,minShape:2,isEnabled:this.isEnabled.bind(this,false)});
this.facade.offer({name:ORYX.I18N.Grouping.ungroup,functionality:this.deleteGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.PATH+"images/shape_ungroup.png",description:ORYX.I18N.Grouping.ungroupDesc,index:2,minShape:2,isEnabled:this.isEnabled.bind(this,true)});
this.selectedElements=[];
this.groups=[]
},isEnabled:function(a){var b=this.selectedElements;
return a===this.groups.any(function(c){return c.length===b.length&&c.all(function(d){return b.member(d)
})
})
},onSelectionChanged:function(b){var a=b.elements;
this.selectedElements=this.groups.findAll(function(c){return c.any(function(d){return a.member(d)
})
});
this.selectedElements.push(a);
this.selectedElements=this.selectedElements.flatten().uniq();
if(this.selectedElements.length!==a.length){this.facade.setSelection(this.selectedElements)
}},createGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.findAll(function(e){return !e.any(function(f){return c.member(f)
})
});
d.push(c);
this.callback(d.clone());
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},deleteGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.partition(function(e){return e.length!==c.length||!e.all(function(f){return c.member(f)
})
});
this.callback(d[0]);
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},setGroups:function(a){this.groups=a
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeHighlighting=Clazz.extend({construct:function(a){this.parentNode=a.getCanvas().getSvgContainer();
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parentNode,["g"]);
this.highlightNodes={};
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,this.setHighlight.bind(this));
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,this.hideHighlight.bind(this))
},setHighlight:function(a){if(a&&a.highlightId){var b=this.highlightNodes[a.highlightId];
if(!b){b=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":2,fill:"none"}]);
this.highlightNodes[a.highlightId]=b
}if(a.elements&&a.elements.length>0){this.setAttributesByStyle(b,a);
this.show(b)
}else{this.hide(b)
}}},hideHighlight:function(a){if(a&&a.highlightId&&this.highlightNodes[a.highlightId]){this.hide(this.highlightNodes[a.highlightId])
}},hide:function(a){a.setAttributeNS(null,"display","none")
},show:function(a){a.setAttributeNS(null,"display","")
},setAttributesByStyle:function(b,a){if(a.style&&a.style==ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE){var d=a.elements[0].absoluteBounds();
var c=a.strokewidth?a.strokewidth:ORYX.CONFIG.BORDER_OFFSET;
b.setAttributeNS(null,"d",this.getPathRectangle(d.a,d.b,c));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",c)
}else{if(a.elements.length==1&&a.elements[0] instanceof ORYX.Core.Edge&&a.highlightId!="selection"){b.setAttributeNS(null,"d",this.getPathEdge(a.elements[0].dockers));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",ORYX.CONFIG.OFFSET_EDGE_BOUNDS)
}else{b.setAttributeNS(null,"d",this.getPathByElements(a.elements));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:1);
b.setAttributeNS(null,"stroke-width",a.strokewidth?a.strokewidth:2)
}}},getPathByElements:function(a){if(!a||a.length<=0){return undefined
}var c=ORYX.CONFIG.SELECTED_AREA_PADDING;
var b="";
a.each((function(f){if(!f){return
}var g=f.absoluteBounds();
g.widen(c);
var e=g.upperLeft();
var d=g.lowerRight();
b=b+this.getPath(e,d)
}).bind(this));
return b
},getPath:function(d,c){return this.getPathCorners(d,c)
},getPathCorners:function(d,c){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
f=f+"M"+d.x+" "+(d.y+e)+" l0 -"+e+" l"+e+" 0 ";
f=f+"M"+d.x+" "+(c.y-e)+" l0 "+e+" l"+e+" 0 ";
f=f+"M"+c.x+" "+(c.y-e)+" l0 "+e+" l-"+e+" 0 ";
f=f+"M"+c.x+" "+(d.y+e)+" l0 -"+e+" l-"+e+" 0 ";
return f
},getPathRectangle:function(d,c,h){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
var g=h/2;
f=f+"M"+(d.x+g)+" "+(d.y);
f=f+" L"+(d.x+g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(d.y+g);
f=f+" L"+(d.x+g)+" "+(d.y+g);
return f
},getPathEdge:function(a){var b=a.length;
var c="M"+a[0].bounds.center().x+" "+a[0].bounds.center().y;
for(i=1;
i<b;
i++){var d=a[i].bounds.center();
c=c+" L"+d.x+" "+d.y
}return c
}});
ORYX.Plugins.HighlightingSelectedShapes=Clazz.extend({construct:function(a){this.facade=a;
this.opacityFull=0.9;
this.opacityLow=0.4
},onSelectionChanged:function(a){if(a.elements&&a.elements.length>1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"selection",elements:a.elements.without(a.subSelection),color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:!a.subSelection?this.opacityFull:this.opacityLow});
if(a.subSelection){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"subselection",elements:[a.subSelection],color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:this.opacityFull})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"selection"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDocker=Clazz.extend({construct:function(a){this.facade=a;
this.VALIDCOLOR=ORYX.CONFIG.SELECTION_VALID_COLOR;
this.INVALIDCOLOR=ORYX.CONFIG.SELECTION_INVALID_COLOR;
this.shapeSelection=undefined;
this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined;
this.isStartDocker=undefined;
this.isEndDocker=undefined;
this.undockTreshold=10;
this.initialDockerPosition=undefined;
this.outerDockerNotMoved=undefined;
this.isValid=false;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG,this.handleDockerDrag.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this))
},handleMouseOut:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.hide()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.hide()
})
}}},handleMouseOver:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.show()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.show()
})
}}},handleDockerDrag:function(b,a){this.handleMouseDown(b.uiEvent,a)
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Controls.Docker&&c.isMovable){this.shapeSelection=this.facade.getSelection();
this.facade.setSelection();
this.docker=c;
this.initialDockerPosition=this.docker.bounds.center();
this.outerDockerNotMoved=false;
this.dockerParent=c.parent;
this._commandArg={docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint||c.bounds.center()};
this.docker.show();
if(c.parent instanceof ORYX.Core.Edge&&(c.parent.dockers.first()==c||c.parent.dockers.last()==c)){if(c.parent.dockers.first()==c&&c.parent.dockers.last().getDockedShape()){this.dockerTarget=c.parent.dockers.last().getDockedShape()
}else{if(c.parent.dockers.last()==c&&c.parent.dockers.first().getDockedShape()){this.dockerSource=c.parent.dockers.first().getDockedShape()
}}}else{this.dockerSource=undefined;
this.dockerTarget=undefined
}this.isStartDocker=this.docker.parent.dockers.first()===this.docker;
this.isEndDocker=this.docker.parent.dockers.last()===this.docker;
this.facade.getCanvas().add(this.docker.parent);
this.docker.parent.getLabels().each(function(e){e.hide()
});
if((!this.isStartDocker&&!this.isEndDocker)||!this.docker.isDocked()){this.docker.setDockedShape(undefined);
var b=this.facade.eventCoordinates(d);
this.docker.bounds.centerMoveTo(b);
this.dockerParent._update()
}else{this.outerDockerNotMoved=true
}var a={movedCallback:this.dockerMoved.bind(this),upCallback:this.dockerMovedFinished.bind(this)};
ORYX.Core.UIEnableDrag(d,c,a)
}},dockerMoved:function(u){this.outerDockerNotMoved=false;
var l=undefined;
if(this.docker.parent){if(this.isStartDocker||this.isEndDocker){var o=this.facade.eventCoordinates(u);
if(this.docker.isDocked()){var b=ORYX.Core.Math.getDistancePointToPoint(o,this.initialDockerPosition);
if(b<this.undockTreshold){this.outerDockerNotMoved=true;
return
}this.docker.setDockedShape(undefined);
this.dockerParent._update()
}var s=this.facade.getCanvas().getAbstractShapesAtPosition(o);
var q=s.pop();
if(this.docker.parent===q){q=s.pop()
}if(this.lastUIObj==q){}else{if(q instanceof ORYX.Core.Shape){var t=this.docker.parent.getStencil().stencilSet();
if(this.docker.parent instanceof ORYX.Core.Edge){var v=this.getHighestParentBeforeCanvas(q);
if(v instanceof ORYX.Core.Edge&&this.docker.parent===v){this.isValid=false;
this.dockerParent._update();
return
}this.isValid=false;
var a=q,c=q;
while(!this.isValid&&a&&!(a instanceof ORYX.Core.Canvas)){q=a;
this.isValid=this.facade.getRules().canConnect({sourceShape:this.dockerSource?this.dockerSource:(this.isStartDocker?q:undefined),edgeShape:this.docker.parent,targetShape:this.dockerTarget?this.dockerTarget:(this.isEndDocker?q:undefined)});
a=a.parent
}if(!this.isValid){q=c
}}else{this.isValid=this.facade.getRules().canConnect({sourceShape:q,edgeShape:this.docker.parent,targetShape:this.docker.parent})
}if(this.lastUIObj){this.hideMagnets(this.lastUIObj)
}if(this.isValid){this.showMagnets(q)
}this.showHighlight(q,this.isValid?this.VALIDCOLOR:this.INVALIDCOLOR);
this.lastUIObj=q
}else{this.hideHighlight();
this.lastUIObj?this.hideMagnets(this.lastUIObj):null;
this.lastUIObj=undefined;
this.isValid=false
}}if(this.lastUIObj&&this.isValid&&!(u.shiftKey||u.ctrlKey)){l=this.lastUIObj.magnets.find(function(y){return y.absoluteBounds().isIncluded(o)
});
if(l){this.docker.bounds.centerMoveTo(l.absoluteCenterXY())
}}}}if(!(u.shiftKey||u.ctrlKey)&&!l){var n=ORYX.CONFIG.DOCKER_SNAP_OFFSET;
var h=n+1;
var f=n+1;
var x=this.docker.bounds.center();
if(this.docker.parent){this.docker.parent.dockers.each((function(z){if(this.docker==z){return
}var y=z.referencePoint?z.getAbsoluteReferencePoint():z.bounds.center();
h=Math.abs(h)>Math.abs(y.x-x.x)?y.x-x.x:h;
f=Math.abs(f)>Math.abs(y.y-x.y)?y.y-x.y:f
}).bind(this));
if(Math.abs(h)<n||Math.abs(f)<n){h=Math.abs(h)<n?h:0;
f=Math.abs(f)<n?f:0;
this.docker.bounds.centerMoveTo(x.x+h,x.y+f)
}else{var d=this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker)-1,0)];
var r=this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker)+1,this.docker.parent.dockers.length-1)];
if(d&&r&&d!==this.docker&&r!==this.docker){var e=d.bounds.center();
var g=r.bounds.center();
var p=this.docker.bounds.center();
if(ORYX.Core.Math.isPointInLine(p.x,p.y,e.x,e.y,g.x,g.y,10)){var w=(Number(g.y)-Number(e.y))/(Number(g.x)-Number(e.x));
var m=((e.y-(e.x*w))-(p.y-(p.x*(-Math.pow(w,-1)))))/((-Math.pow(w,-1))-w);
var k=(e.y-(e.x*w))+(w*m);
if(isNaN(m)||isNaN(k)){return
}this.docker.bounds.centerMoveTo(m,k)
}}}}}this.dockerParent._update()
},dockerMovedFinished:function(e){this.facade.setSelection(this.shapeSelection);
this.hideHighlight();
this.dockerParent.getLabels().each(function(g){g.show()
});
if(this.lastUIObj&&(this.isStartDocker||this.isEndDocker)){if(this.isValid){this.docker.setDockedShape(this.lastUIObj);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED,docker:this.docker,parent:this.docker.parent,target:this.lastUIObj})
}this.hideMagnets(this.lastUIObj)
}this.docker.hide();
if(this.outerDockerNotMoved){var d=this.facade.eventCoordinates(e);
var a=this.facade.getCanvas().getAbstractShapesAtPosition(d);
var b=a.findAll(function(g){return g instanceof ORYX.Core.Node
});
a=b.length?b:a;
this.facade.setSelection(a)
}else{var c=ORYX.Core.Command.extend({construct:function(n,h,g,m,l,k){this.docker=n;
this.index=n.parent.dockers.indexOf(n);
this.newPosition=h;
this.newDockedShape=m;
this.oldPosition=g;
this.oldDockedShape=l;
this.facade=k;
this.index=n.parent.dockers.indexOf(n);
this.shape=n.parent
},execute:function(){if(!this.docker.parent){this.docker=this.shape.dockers[this.index]
}this.dock(this.newDockedShape,this.newPosition);
this.removedDockers=this.shape.removeUnusedDockers();
this.facade.updateSelection()
},rollback:function(){this.dock(this.oldDockedShape,this.oldPosition);
(this.removedDockers||$H({})).each(function(g){this.shape.add(g.value,Number(g.key));
this.shape._update(true)
}.bind(this));
this.facade.updateSelection()
},dock:function(g,h){this.docker.setDockedShape(undefined);
if(g){this.docker.setDockedShape(g);
this.docker.setReferencePoint(h)
}else{this.docker.bounds.centerMoveTo(h)
}this.facade.getCanvas().update()
}});
if(this.docker.parent){var f=new c(this.docker,this.docker.getDockedShape()?this.docker.referencePoint:this.docker.bounds.center(),this._commandArg.refPoint,this.docker.getDockedShape(),this._commandArg.dockedShape,this.facade);
this.facade.executeCommands([f])
}}this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined
},hideHighlight:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"validDockedShape"})
},showHighlight:function(b,a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"validDockedShape",elements:[b],color:a})
},showMagnets:function(a){a.magnets.each(function(b){b.show()
})
},hideMagnets:function(a){a.magnets.each(function(b){b.hide()
})
},getHighestParentBeforeCanvas:function(a){if(!(a instanceof ORYX.Core.Shape)){return undefined
}var b=a.parent;
while(b&&!(b.parent instanceof ORYX.Core.Canvas)){b=b.parent
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.AddDocker=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.AddDocker.add,functionality:this.enableAddDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.PATH+"images/vector_add.png",description:ORYX.I18N.AddDocker.addDesc,index:1,toggle:true,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.AddDocker.del,functionality:this.enableDeleteDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.PATH+"images/vector_delete.png",description:ORYX.I18N.AddDocker.delDesc,index:2,toggle:true,minShape:0,maxShape:0});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},enableAddDocker:function(a,b){this.addDockerButton=a;
if(b&&this.deleteDockerButton){this.deleteDockerButton.toggle(false)
}},enableDeleteDocker:function(a,b){this.deleteDockerButton=a;
if(b&&this.addDockerButton){this.addDockerButton.toggle(false)
}},enabledAdd:function(){return this.addDockerButton?this.addDockerButton.pressed:false
},enabledDelete:function(){return this.deleteDockerButton?this.deleteDockerButton.pressed:false
},handleMouseDown:function(b,a){if(this.enabledAdd()&&a instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a,position:this.facade.eventCoordinates(b)})
}else{if(this.enabledDelete()&&a instanceof ORYX.Core.Controls.Docker&&a.parent instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a.parent,docker:a})
}else{if(this.enabledAdd()){this.addDockerButton.toggle(false)
}else{if(this.enabledDelete()){this.deleteDockerButton.toggle(false)
}}}}},newDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(h,f,e,g,k,d){this.addEnabled=h;
this.deleteEnabled=f;
this.edge=e;
this.docker=g;
this.pos=k;
this.facade=d
},execute:function(){if(this.addEnabled){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker)
}else{if(this.deleteEnabled){this.index=this.edge.dockers.indexOf(this.docker);
this.pos=this.docker.bounds.center();
this.edge.removeDocker(this.docker)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){if(this.addEnabled){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}}else{if(this.deleteEnabled){this.edge.add(this.docker,this.index)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(this.enabledAdd(),this.enabledDelete(),b.edge,b.docker,b.position,this.facade);
this.facade.executeCommands([c])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DockerCreation=Clazz.extend({construct:function(a){this.facade=a;
this.active=false;
this.circle=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["g",{"pointer-events":"none"},["circle",{cx:"8",cy:"8",r:"3",fill:"yellow"}]]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)
}.bind(this))
},handleMouseOut:function(b,a){if(this.active){this.hideOverlay();
this.active=false
}},handleMouseOver:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){this.showOverlay(a,this.facade.eventCoordinates(b))
}this.active=true
},handleMouseDown:function(b,a){if(b.which==1&&a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.addDockerCommand({edge:a,event:b,position:this.facade.eventCoordinates(b)})
}.bind(this),200);
this.hideOverlay()
}},handleMouseMove:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){if(this.active){this.hideOverlay();
this.showOverlay(a,this.facade.eventCoordinates(b))
}else{this.showOverlay(a,this.facade.eventCoordinates(b))
}}},isEdgeDocked:function(a){return !!(a.incoming.length||a.outgoing.length)
},addDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(f,g,h,e,d){this.edge=f;
this.docker=g;
this.pos=h;
this.facade=e;
this.options=d
},execute:function(){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.options.docker=this.docker
},rollback:function(){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(b.edge,b.docker,b.position,this.facade,b);
this.facade.executeCommands([c]);
this.facade.raiseEvent({uiEvent:b.event,type:ORYX.CONFIG.EVENT_DOCKERDRAG},b.docker)
},showOverlay:function(a,k){var e=k;
var f=[0,1];
var b=Infinity;
for(var g=0,d=a.dockers.length;
g<d-1;
g++){var c=ORYX.Core.Math.getPointOfIntersectionPointLine(a.dockers[g].bounds.center(),a.dockers[g+1].bounds.center(),k,true);
if(!c){continue
}var h=ORYX.Core.Math.getDistancePointToPoint(k,c);
if(b>h){b=h;
e=c
}}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"ghostpoint",shapes:[a],node:this.circle,ghostPoint:e,dontCloneNode:true})
},hideOverlay:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"ghostpoint"})
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SSExtensionLoader={construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.SSExtensionLoader.add,functionality:this.addSSExtension.bind(this),group:ORYX.I18N.SSExtensionLoader.group,icon:ORYX.PATH+"images/add.png",description:ORYX.I18N.SSExtensionLoader.addDesc,index:1,minShape:0,maxShape:0})
},addSSExtension:function(facade){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.SSExtensionLoader.loading});
var url=ORYX.CONFIG.SS_EXTENSIONS_CONFIG;
new Ajax.Request(url,{method:"GET",asynchronous:false,onSuccess:(function(transport){try{eval("var jsonObject = "+transport.responseText);
var stencilsets=this.facade.getStencilSets();
var validExtensions=jsonObject.extensions.findAll(function(extension){var stencilset=stencilsets[extension["extends"]];
if(stencilset){return true
}else{return false
}});
var loadedExtensions=validExtensions.findAll(function(extension){return stencilsets.values().any(function(ss){if(ss.extensions()[extension.namespace]){return true
}else{return false
}})
});
if(validExtensions.size()==0){Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.noExt)
}else{this._showPanel(validExtensions,loadedExtensions,this._loadExtensions.bind(this))
}}catch(e){console.log(e);
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.failed1)
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}).bind(this),onFailure:(function(transport){Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.failed2);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}).bind(this)})
},_loadExtensions:function(b){var c=this.facade.getStencilSets();
var d=false;
c.values().each(function(e){var f=e.extensions().values().select(function(g){return b[g.namespace]==undefined
});
f.each(function(g){e.removeExtension(g.namespace);
d=true
})
});
b.each(function(f){var e=c[f["extends"]];
if(e){e.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER+f.definition);
d=true
}}.bind(this));
if(d){c.values().each(function(e){this.facade.getRules().initializeRules(e)
}.bind(this));
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,lazyLoaded:true});
var a=this.facade.getSelection();
this.facade.setSelection();
this.facade.setSelection(a)
}},_showPanel:function(h,k,c){var e=[];
h.each(function(l){e.push([l.title,l.definition,l["extends"]])
});
var d=new Ext.grid.CheckboxSelectionModel();
var a=new Ext.grid.GridPanel({deferRowRender:false,id:"oryx_new_stencilset_extention_grid",store:new Ext.data.SimpleStore({fields:["title","definition","extends"]}),cm:new Ext.grid.ColumnModel([d,{header:ORYX.I18N.SSExtensionLoader.panelTitle,width:200,sortable:true,dataIndex:"title"}]),sm:d,frame:true,width:200,height:200,iconCls:"icon-grid",listeners:{render:function(){this.getStore().loadData(e);
g.defer(1)
}}});
function g(){var l=new Array();
a.store.each(function(m){if(k.any(function(n){return n.definition==m.get("definition")
})){l.push(m)
}});
d.selectRecords(l)
}var b=new Ext.Panel({items:[{xtype:"label",text:ORYX.I18N.SSExtensionLoader.panelText,style:"margin:10px;display:block"},a],frame:true,buttons:[{text:ORYX.I18N.SSExtensionLoader.labelImport,handler:function(){var m=Ext.getCmp("oryx_new_stencilset_extention_grid").getSelectionModel();
var l=m.selections.items.collect(function(n){return n.data
});
Ext.getCmp("oryx_new_stencilset_extention_window").close();
c(l)
}.bind(this)},{text:ORYX.I18N.SSExtensionLoader.labelCancel,handler:function(){Ext.getCmp("oryx_new_stencilset_extention_window").close()
}.bind(this)}]});
var f=new Ext.Window({id:"oryx_new_stencilset_extention_window",width:227,title:ORYX.I18N.Oryx.title,floating:true,shim:true,modal:true,resizable:false,autoHeight:true,items:[b]});
f.show()
}};
ORYX.Plugins.SSExtensionLoader=Clazz.extend(ORYX.Plugins.SSExtensionLoader);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SelectionFrame=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
this.position={x:0,y:0};
this.size={width:0,height:0};
this.offsetPosition={x:0,y:0};
this.moveCallback=undefined;
this.offsetScroll={x:0,y:0};
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.facade.getCanvas().getHTMLContainer(),["div",{"class":"Oryx_SelectionFrame"}]);
this.hide()
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Canvas){var e=c.rootNode.parentNode.parentNode;
var b=this.facade.getCanvas().node.getScreenCTM();
this.offsetPosition={x:b.e,y:b.f};
this.setPos({x:Event.pointerX(d)-this.offsetPosition.x,y:Event.pointerY(d)-this.offsetPosition.y});
this.resize({width:0,height:0});
this.moveCallback=this.handleMouseMove.bind(this);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.offsetScroll={x:e.scrollLeft,y:e.scrollTop};
this.show()
}Event.stop(d)
},handleMouseUp:function(f){if(this.moveCallback){this.hide();
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.moveCallback=undefined;
var e=this.facade.getCanvas().node.getScreenCTM();
var d={x:this.size.width>0?this.position.x:this.position.x+this.size.width,y:this.size.height>0?this.position.y:this.position.y+this.size.height};
var c={x:d.x+Math.abs(this.size.width),y:d.y+Math.abs(this.size.height)};
d.x/=e.a;
d.y/=e.d;
c.x/=e.a;
c.y/=e.d;
var g=this.facade.getCanvas().getChildShapes(true).findAll(function(b){var a=b.absoluteBounds();
var k=a.upperLeft();
var h=a.lowerRight();
if(k.x>d.x&&k.y>d.y&&h.x<c.x&&h.y<c.y){return true
}return false
});
this.facade.setSelection(g)
}},handleMouseMove:function(b){var a={width:Event.pointerX(b)-this.position.x-this.offsetPosition.x,height:Event.pointerY(b)-this.position.y-this.offsetPosition.y,};
var c=this.facade.getCanvas().rootNode.parentNode.parentNode;
a.width-=this.offsetScroll.x-c.scrollLeft;
a.height-=this.offsetScroll.y-c.scrollTop;
this.resize(a);
Event.stop(b)
},hide:function(){this.node.style.display="none"
},show:function(){this.node.style.display=""
},setPos:function(a){this.node.style.top=a.y+"px";
this.node.style.left=a.x+"px";
this.position=a
},resize:function(a){this.setPos(this.position);
this.size=Object.clone(a);
if(a.width<0){this.node.style.left=(this.position.x+a.width)+"px";
a.width=-a.width
}if(a.height<0){this.node.style.top=(this.position.y+a.height)+"px";
a.height=-a.height
}this.node.style.width=a.width+"px";
this.node.style.height=a.height+"px"
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeHighlighting=Clazz.extend({construct:function(a){this.parentNode=a.getCanvas().getSvgContainer();
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parentNode,["g"]);
this.highlightNodes={};
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,this.setHighlight.bind(this));
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,this.hideHighlight.bind(this))
},setHighlight:function(a){if(a&&a.highlightId){var b=this.highlightNodes[a.highlightId];
if(!b){b=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":2,fill:"none"}]);
this.highlightNodes[a.highlightId]=b
}if(a.elements&&a.elements.length>0){this.setAttributesByStyle(b,a);
this.show(b)
}else{this.hide(b)
}}},hideHighlight:function(a){if(a&&a.highlightId&&this.highlightNodes[a.highlightId]){this.hide(this.highlightNodes[a.highlightId])
}},hide:function(a){a.setAttributeNS(null,"display","none")
},show:function(a){a.setAttributeNS(null,"display","")
},setAttributesByStyle:function(b,a){if(a.style&&a.style==ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE){var d=a.elements[0].absoluteBounds();
var c=a.strokewidth?a.strokewidth:ORYX.CONFIG.BORDER_OFFSET;
b.setAttributeNS(null,"d",this.getPathRectangle(d.a,d.b,c));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",c)
}else{if(a.elements.length==1&&a.elements[0] instanceof ORYX.Core.Edge&&a.highlightId!="selection"){b.setAttributeNS(null,"d",this.getPathEdge(a.elements[0].dockers));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",ORYX.CONFIG.OFFSET_EDGE_BOUNDS)
}else{b.setAttributeNS(null,"d",this.getPathByElements(a.elements));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:1);
b.setAttributeNS(null,"stroke-width",a.strokewidth?a.strokewidth:2)
}}},getPathByElements:function(a){if(!a||a.length<=0){return undefined
}var c=ORYX.CONFIG.SELECTED_AREA_PADDING;
var b="";
a.each((function(f){if(!f){return
}var g=f.absoluteBounds();
g.widen(c);
var e=g.upperLeft();
var d=g.lowerRight();
b=b+this.getPath(e,d)
}).bind(this));
return b
},getPath:function(d,c){return this.getPathCorners(d,c)
},getPathCorners:function(d,c){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
f=f+"M"+d.x+" "+(d.y+e)+" l0 -"+e+" l"+e+" 0 ";
f=f+"M"+d.x+" "+(c.y-e)+" l0 "+e+" l"+e+" 0 ";
f=f+"M"+c.x+" "+(c.y-e)+" l0 "+e+" l-"+e+" 0 ";
f=f+"M"+c.x+" "+(d.y+e)+" l0 -"+e+" l-"+e+" 0 ";
return f
},getPathRectangle:function(d,c,h){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
var g=h/2;
f=f+"M"+(d.x+g)+" "+(d.y);
f=f+" L"+(d.x+g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(d.y+g);
f=f+" L"+(d.x+g)+" "+(d.y+g);
return f
},getPathEdge:function(a){var b=a.length;
var c="M"+a[0].bounds.center().x+" "+a[0].bounds.center().y;
for(i=1;
i<b;
i++){var d=a[i].bounds.center();
c=c+" L"+d.x+" "+d.y
}return c
}});
ORYX.Plugins.HighlightingSelectedShapes=Clazz.extend({construct:function(a){this.facade=a;
this.opacityFull=0.9;
this.opacityLow=0.4
},onSelectionChanged:function(a){if(a.elements&&a.elements.length>1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"selection",elements:a.elements.without(a.subSelection),color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:!a.subSelection?this.opacityFull:this.opacityLow});
if(a.subSelection){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"subselection",elements:[a.subSelection],color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:this.opacityFull})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"selection"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Overlay=Clazz.extend({facade:undefined,styleNode:undefined,construct:function(a){this.facade=a;
this.changes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW,this.show.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE,this.hide.bind(this));
this.styleNode=document.createElement("style");
this.styleNode.setAttributeNS(null,"type","text/css");
document.getElementsByTagName("head")[0].appendChild(this.styleNode)
},show:function(a){if(!a||!a.shapes||!a.shapes instanceof Array||!a.id||!a.id instanceof String||a.id.length==0){return
}if(a.attributes){a.shapes.each(function(d){if(!d instanceof ORYX.Core.Shape){return
}this.setAttributes(d.node,a.attributes)
}.bind(this))
}var c=true;
try{c=a.node&&a.node instanceof SVGElement
}catch(b){}if(a.node&&c){a._temps=[];
a.shapes.each(function(h,g){if(!h instanceof ORYX.Core.Shape){return
}var f={};
f.svg=a.dontCloneNode?a.node:a.node.cloneNode(true);
h.node.firstChild.appendChild(f.svg);
if(h instanceof ORYX.Core.Edge&&!a.nodePosition){a.nodePosition="START"
}if(a.nodePosition){var e=h.bounds;
var k=a.nodePosition.toUpperCase();
if(h instanceof ORYX.Core.Node&&k=="START"){k="NW"
}else{if(h instanceof ORYX.Core.Node&&k=="END"){k="SE"
}else{if(h instanceof ORYX.Core.Edge&&k=="START"){e=h.getDockers().first().bounds
}else{if(h instanceof ORYX.Core.Edge&&k=="END"){e=h.getDockers().last().bounds
}}}}f.callback=function(){var l=0;
var m=0;
if(k=="NW"){}else{if(k=="N"){l=e.width()/2
}else{if(k=="NE"){l=e.width()
}else{if(k=="E"){l=e.width();
m=e.height()/2
}else{if(k=="SE"){l=e.width();
m=e.height()
}else{if(k=="S"){l=e.width()/2;
m=e.height()
}else{if(k=="SW"){m=e.height()
}else{if(k=="W"){m=e.height()/2
}else{if(k=="START"||k=="END"){l=e.width()/2;
m=e.height()/2
}else{return
}}}}}}}}}if(h instanceof ORYX.Core.Edge){l+=e.upperLeft().x;
m+=e.upperLeft().y
}f.svg.setAttributeNS(null,"transform","translate("+l+", "+m+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.ghostPoint){var d={x:0,y:0};
d=a.ghostPoint;
f.callback=function(){var l=0;
var m=0;
l=d.x-7;
m=d.y-7;
f.svg.setAttributeNS(null,"transform","translate("+l+", "+m+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.labelPoint){var d={x:0,y:0};
d=a.labelPoint;
f.callback=function(){var l=0;
var m=0;
l=d.x;
m=d.y;
f.svg.setAttributeNS(null,"transform","translate("+l+", "+m+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}a._temps.push(f)
}.bind(this))
}if(!this.changes[a.id]){this.changes[a.id]=[]
}this.changes[a.id].push(a)
},hide:function(a){if(!a||!a.id||!a.id instanceof String||a.id.length==0||!this.changes[a.id]){return
}this.changes[a.id].each(function(b){b.shapes.each(function(d,c){if(!d instanceof ORYX.Core.Shape){return
}this.deleteAttributes(d.node)
}.bind(this));
if(b._temps){b._temps.each(function(c){if(c.svg&&c.svg.parentNode){c.svg.parentNode.removeChild(c.svg)
}if(c.callback&&c.element){c.element.bounds.unregisterCallback(c.callback)
}}.bind(this))
}}.bind(this));
this.changes[a.id]=null
},setAttributes:function(c,d){var h=this.getAllChilds(c.firstChild.firstChild);
var a=[];
h.each(function(m){a.push($A(m.attributes).findAll(function(n){return n.nodeValue.startsWith("url(#")
}))
});
a=a.flatten().compact();
a=a.collect(function(m){return m.nodeValue
}).uniq();
a=a.collect(function(m){return m.slice(5,m.length-1)
});
a.unshift(c.id+" .me");
var g=$H(d);
var e=g.toJSON().gsub(",",";").gsub('"',"");
var k=d.stroke?e.slice(0,e.length-1)+"; fill:"+d.stroke+";}":e;
var f;
if(d.fill){var b=Object.clone(d);
b.fill="black";
f=$H(b).toJSON().gsub(",",";").gsub('"',"")
}csstags=a.collect(function(n,m){return"#"+n+" * "+(!m?e:k)+""+(f?" #"+n+" text * "+f:"")
});
var l=csstags.join(" ")+"\n";
this.styleNode.appendChild(document.createTextNode(l))
},deleteAttributes:function(b){var a=$A(this.styleNode.childNodes).findAll(function(c){return c.textContent.include("#"+b.id)
});
a.each(function(c){c.parentNode.removeChild(c)
})
},getAllChilds:function(a){var b=$A(a.childNodes);
$A(a.childNodes).each(function(c){b.push(this.getAllChilds(c))
}.bind(this));
return b.flatten()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Edit=Clazz.extend({construct:function(a){this.facade=a;
this.clipboard=new ORYX.Plugins.Edit.ClipBoard(a);
this.facade.offer({name:ORYX.I18N.Edit.cut,description:ORYX.I18N.Edit.cutDesc,icon:ORYX.PATH+"images/cut.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:88,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCut),group:ORYX.I18N.Edit.group,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.copy,description:ORYX.I18N.Edit.copyDesc,icon:ORYX.PATH+"images/page_copy.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:67,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCopy,[true,false]),group:ORYX.I18N.Edit.group,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.paste,description:ORYX.I18N.Edit.pasteDesc,icon:ORYX.PATH+"images/page_paste.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:86,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editPaste),isEnabled:this.clipboard.isOccupied.bind(this.clipboard),group:ORYX.I18N.Edit.group,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Edit.del,description:ORYX.I18N.Edit.delDesc,icon:ORYX.PATH+"images/cross.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:8,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN},{keyCode:46,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editDelete),group:ORYX.I18N.Edit.group,index:4,minShape:1})
},callEdit:function(b,a){window.setTimeout(function(){b.apply(this,(a instanceof Array?a:[]))
}.bind(this),1)
},handleMouseDown:function(a){if(this._controlPressed){this._controlPressed=false;
this.editCopy();
this.editPaste();
a.forceExecution=true;
this.facade.raiseEvent(a,this.clipboard.shapesAsJson())
}},getAllShapesToConsider:function(b){var a=[];
var c=[];
b.each(function(e){isChildShapeOfAnother=b.any(function(g){return g.hasChildShape(e)
});
if(isChildShapeOfAnother){return
}a.push(e);
if(e instanceof ORYX.Core.Node){var f=e.getOutgoingNodes();
f=f.findAll(function(g){return !b.include(g)
});
a=a.concat(f)
}c=c.concat(e.getChildShapes(true))
}.bind(this));
var d=this.facade.getCanvas().getChildEdges().select(function(e){if(a.include(e)){return false
}if(e.getAllDockedShapes().size()===0){return false
}return e.getAllDockedShapes().all(function(f){return f instanceof ORYX.Core.Edge||c.include(f)
})
});
a=a.concat(d);
return a
},editCut:function(){try{this.editCopy(false,true);
this.editDelete(true)
}catch(a){ORYX.Log.error(a)
}return false
},editCopy:function(c,a){var b=this.facade.getSelection();
if(b.length==0){return
}this.clipboard.refresh(b,this.getAllShapesToConsider(b),this.facade.getCanvas().getStencil().stencilSet().namespace(),a);
if(c){this.facade.updateSelection()
}},editPaste:function(){var b={childShapes:this.clipboard.shapesAsJson(),stencilset:{namespace:this.clipboard.SSnamespace}};
Ext.apply(b,ORYX.Core.AbstractShape.JSONHelper);
var a=b.getChildShapes(true).pluck("resourceId");
var c={};
b.eachChild(function(d,e){d.outgoing=d.outgoing.select(function(f){return a.include(f.resourceId)
});
d.outgoing.each(function(f){if(!c[f.resourceId]){c[f.resourceId]=[]
}c[f.resourceId].push(d)
});
return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(d.target&&!(a.include(d.target.resourceId))){d.target=undefined;
d.targetRemoved=true
}if(d.dockers&&d.dockers.length>=1&&d.dockers[0].getDocker&&((d.dockers[0].getDocker().getDockedShape()&&!a.include(d.dockers[0].getDocker().getDockedShape().resourceId))||!d.getShape().dockers[0].getDockedShape()&&!c[d.resourceId])){d.sourceRemoved=true
}return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(this.clipboard.useOffset){d.bounds={lowerRight:{x:d.bounds.lowerRight.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.lowerRight.y+ORYX.CONFIG.COPY_MOVE_OFFSET},upperLeft:{x:d.bounds.upperLeft.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.upperLeft.y+ORYX.CONFIG.COPY_MOVE_OFFSET}}
}if(d.dockers){d.dockers=d.dockers.map(function(g,f){if((d.targetRemoved===true&&f==d.dockers.length-1&&g.getDocker)||(d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if((f==0&&g.getDocker instanceof Function&&d.sourceRemoved!==true&&(g.getDocker().getDockedShape()||((c[d.resourceId]||[]).length>0&&(!(d.getShape() instanceof ORYX.Core.Node)||c[d.resourceId][0].getShape() instanceof ORYX.Core.Node))))||(f==d.dockers.length-1&&g.getDocker instanceof Function&&d.targetRemoved!==true&&(g.getDocker().getDockedShape()||d.target))){return{x:g.x,y:g.y,getDocker:g.getDocker}
}else{if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}}.bind(this))
}else{if(d.getShape() instanceof ORYX.Core.Node&&d.dockers&&d.dockers.length>0&&(!d.dockers.first().getDocker||d.sourceRemoved===true||!(d.dockers.first().getDocker().getDockedShape()||c[d.resourceId]))){d.dockers=d.dockers.map(function(g,f){if((d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}.bind(this))
}}return d
}.bind(this),false,true);
this.clipboard.useOffset=true;
this.facade.importJSON(b)
},editDelete:function(){var b=this.facade.getSelection();
var a=this.getAllShapesToConsider(b);
var c=new ORYX.Plugins.Edit.DeleteCommand(a,this.facade);
this.facade.executeCommands([c])
}});
ORYX.Plugins.Edit.ClipBoard=Clazz.extend({construct:function(){this._shapesAsJson=[];
this.selection=[];
this.SSnamespace="";
this.useOffset=true
},isOccupied:function(){return this.shapesAsJson().length>0
},refresh:function(d,b,c,a){this.selection=d;
this.SSnamespace=c;
this.outgoings={};
this.parents={};
this.targets={};
this.useOffset=a!==true;
this._shapesAsJson=b.map(function(e){var f=e.toJSON();
f.parent={resourceId:e.getParentShape().resourceId};
f.parentIndex=e.getParentShape().getChildShapes().indexOf(e);
return f
})
},shapesAsJson:function(){return this._shapesAsJson
}});
ORYX.Plugins.Edit.DeleteCommand=ORYX.Core.Command.extend({construct:function(a,b){try{this.shapesAsJson=a;
this.facade=b;
ORYX.Log.info("this.shapesAsJson",this.shapesAsJson);
this.dockers=this.shapesAsJson.map(function(f){var g=f.getIncomingShapes().map(function(h){return h.getDockers().last()
});
var e=f.getOutgoingShapes().map(function(h){return h.getDockers().first()
});
var d=f.getDockers().concat(g,e).compact().map(function(h){return{object:h,referencePoint:h.referencePoint,dockedShape:h.getDockedShape()}
});
return d
}).flatten()
}catch(c){ORYX.Log.error(c)
}},execute:function(){this.shapesAsJson.each(function(a){this.facade.deleteShape(a)
}.bind(this));
this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.shapesAsJson.each(function(a){var b=("undefined"!=typeof(a.parent)?this.facade.getCanvas().getChildShapeByResourceId(a.parent.resourceId):this.facade.getCanvas());
b.add(a,a.parentIndex);
b.add(a,a.parentIndex)
}.bind(this));
this.dockers.each(function(a){a.object.setDockedShape(a.dockedShape);
a.object.setReferencePoint(a.referencePoint)
}.bind(this));
this.facade.setSelection(this.selectedShapes);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.KeysMove=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.copyElements=[];
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:65,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.selectAll.bind(this)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,true)})
},selectAll:function(a){Event.stop(a.event);
this.facade.setSelection(this.facade.getCanvas().getChildShapes(true))
},move:function(n,k,l){Event.stop(l.event);
var b=k?20:5;
var m=this.facade.getSelection();
var g=this.facade.getSelection();
var c={x:0,y:0};
switch(n){case ORYX.CONFIG.KEY_CODE_LEFT:c.x=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_RIGHT:c.x=b;
break;
case ORYX.CONFIG.KEY_CODE_UP:c.y=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_DOWN:c.y=b;
break
}m=m.findAll(function(e){if(e instanceof ORYX.Core.Node&&e.dockers.length==1&&m.include(e.dockers.first().getDockedShape())){return false
}var o=e.parent;
do{if(m.include(o)){return false
}}while(o=o.parent);
return true
});
var f=true;
var h=m.all(function(e){if(e instanceof ORYX.Core.Edge){if(e.isDocked()){f=false
}return true
}return false
});
if(h&&!f){return
}m=m.map(function(o){if(o instanceof ORYX.Core.Node){return o
}else{if(o instanceof ORYX.Core.Edge){var e=o.dockers;
if(m.include(o.dockers.first().getDockedShape())){e=e.without(o.dockers.first())
}if(m.include(o.dockers.last().getDockedShape())){e=e.without(o.dockers.last())
}return e
}else{return null
}}}).flatten().compact();
if(m.size()>0){var a=[this.facade.getCanvas().bounds.lowerRight().x,this.facade.getCanvas().bounds.lowerRight().y,0,0];
m.each(function(e){a[0]=Math.min(a[0],e.bounds.upperLeft().x);
a[1]=Math.min(a[1],e.bounds.upperLeft().y);
a[2]=Math.max(a[2],e.bounds.lowerRight().x);
a[3]=Math.max(a[3],e.bounds.lowerRight().y)
});
if(a[0]+c.x<0){c.x=-a[0]
}if(a[1]+c.y<0){c.y=-a[1]
}if(a[2]+c.x>this.facade.getCanvas().bounds.lowerRight().x){c.x=this.facade.getCanvas().bounds.lowerRight().x-a[2]
}if(a[3]+c.y>this.facade.getCanvas().bounds.lowerRight().y){c.y=this.facade.getCanvas().bounds.lowerRight().y-a[3]
}if(c.x!=0||c.y!=0){var d=[new ORYX.Core.Command.Move(m,c,null,g,this)];
this.facade.executeCommands(d)
}}},getUndockedCommant:function(b){var a=ORYX.Core.Command.extend({construct:function(c){this.dockers=c.collect(function(d){return d instanceof ORYX.Core.Controls.Docker?{docker:d,dockedShape:d.getDockedShape(),refPoint:d.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(c){c.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(c){c.docker.setDockedShape(c.dockedShape);
c.docker.setReferencePoint(c.refPoint)
})
}});
command=new a(b);
command.execute();
return command
},});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RowLayouting={construct:function(a){this.facade=a;
this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined;
this.offSetPosition={x:0,y:0};
this.evCoord={x:0,y:0};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT_ROWS,this.handleLayoutRows.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},onSelectionChanged:function(a){var c=a.elements;
if(!c||c.length==0){this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined
}else{this.currentShapes=c;
this.toMoveShapes=this.facade.getCanvas().getShapesWithSharedParent(c);
this.toMoveShapes=this.toMoveShapes.findAll(function(d){return d instanceof ORYX.Core.Node&&(d.dockers.length===0||!c.member(d.dockers.first().getDockedShape()))
});
var b=undefined;
c.each(function(d){if(!b){b=d.absoluteBounds()
}else{b.include(d.absoluteBounds())
}});
this.dragBounds=b
}return
},handleMouseDown:function(c,b){if(!this.dragBounds||!this.toMoveShapes.member(b)){return
}var d=this.facade.eventCoordinates(c);
var a=this.dragBounds.upperLeft();
this.offSetPosition={x:d.x-a.x,y:d.y-a.y};
return
},handleLayoutRows:function(p){var b=p.shape;
var k=this.offSetPosition;
var o=p.marginLeft;
var d=p.marginTop;
var r=p.spacingX;
var q=p.spacingY;
var l=p.shape.getChildShapes(false);
var n=this.toMoveShapes;
n.each(function(u){if(l.include(u)){u.bounds.moveBy(k)
}});
if(p.exclude){l=l.filter(function(u){return !p.exclude.some(function(v){return u.getStencil().id()==v
})
})
}var c=d;
var s=d-q;
if(p.horizontalLayout){l.each(function(v){var u=v.bounds.upperLeft();
v.bounds.moveTo(u.x,c)
})
}else{if(p.verticalLayout){l.each(function(v){var u=v.bounds.upperLeft();
v.bounds.moveTo(o,u.y)
})
}}l=l.sortBy(function(u){return u.bounds.upperLeft().y
});
var e=0;
var f=0;
var m=false;
l.each(function(y){var x=y.bounds.upperLeft();
var u=y.bounds.lowerRight();
var w=x.x;
var v=x.y;
var A=u.x;
var z=u.y;
if(n.include(y)){x.y-=f;
if((x.y>s)||((y==l.first())&&x.y<d)){m=false;
c=s+q;
if(x.y<c){m=true
}}}else{x.y+=e;
x.y-=f;
if(x.y>c){m=false;
c=s+q
}}x.y=c;
u.y=x.y+y.bounds.height();
if(u.y>s){if(m){e+=u.y-s
}else{if(n.include(y)){e+=u.y-s
}}s=u.y
}if((x.x!=w)||(x.y!=v)||(u.x!=A)||(u.y!=z)){if(!n.include(y)){if((v-x.y)>f){f=v-x.y
}}y.bounds.set(x.x,x.y,u.x,u.y)
}});
l=l.sortBy(function(u){return u.bounds.upperLeft().y*10000+u.bounds.upperLeft().x
});
c=d;
var a=o-r;
var t=a;
var h=0;
l.each(function(y){var x=y.bounds.upperLeft();
var u=y.bounds.lowerRight();
var w=x.x;
var v=x.y;
var A=u.x;
var z=u.y;
if(x.y>c){c=x.y;
a=o-r
}x.x=a+r;
u.x=x.x+y.bounds.width();
a=u.x;
if(a>t){t=a
}if(u.y>h){h=u.y
}if((x.x!=w)||(x.y!=v)||(u.x!=A)||(u.y!=z)){y.bounds.set(x.x,x.y,u.x,u.y)
}});
if(p.shape!=this.facade.getCanvas()){var g=p.shape.bounds.upperLeft();
if(t>o){p.shape.bounds.set(g.x,g.y,g.x+t+o,g.y+s+d)
}}else{if(t>this.facade.getCanvas().bounds.width()){this.facade.getCanvas().setSize({width:(t+o),height:this.facade.getCanvas().bounds.height()})
}if(h>this.facade.getCanvas().bounds.height()){this.facade.getCanvas().setSize({width:this.facade.getCanvas().bounds.width(),height:(s+d)})
}}return
}};
ORYX.Plugins.RowLayouting=Clazz.extend(ORYX.Plugins.RowLayouting);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.PluginLoader=Clazz.extend({facade:undefined,mask:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.PluginLoad.AddPluginButtonName,functionality:this.showManageDialog.bind(this),group:ORYX.I18N.SSExtensionLoader.group,icon:ORYX.PATH+"images/labs/script_add.png",description:ORYX.I18N.PluginLoad.AddPluginButtonDesc,index:8,minShape:0,maxShape:0})
},showManageDialog:function(){this.mask=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.Oryx.pleaseWait});
this.mask.show();
var f=[];
var c=[];
var e=this.facade.getStencilSets().keys();
this.facade.getAvailablePlugins().each(function(h){if((!h.requires||!h.requires.namespaces||h.requires.namespaces.any(function(k){return e.indexOf(k)>=0
}))&&(!h.notUsesIn||!h.notUsesIn.namespaces||!h.notUsesIn.namespaces.any(function(k){return e.indexOf(k)>=0
}))){c.push(h)
}});
c.each(function(h){f.push([h.name,h.engaged===true])
});
if(f.length==0){return
}var b=new Ext.data.ArrayReader({},[{name:"name"},{name:"engaged"}]);
var g=new Ext.grid.CheckboxSelectionModel({listeners:{beforerowselect:function(m,h,k,l){this.mask=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.Oryx.pleaseWait});
this.mask.show();
this.facade.activatePluginByName(l.data.name,function(n,o){this.mask.hide();
if(!!n){m.suspendEvents();
m.selectRow(h,true);
m.resumeEvents()
}else{Ext.Msg.show({title:ORYX.I18N.PluginLoad.loadErrorTitle,msg:ORYX.I18N.PluginLoad.loadErrorDesc+ORYX.I18N.PluginLoad[o],buttons:Ext.MessageBox.OK})
}}.bind(this));
return false
}.bind(this),rowdeselect:function(l,h,k){l.suspendEvents();
l.selectRow(h,true);
l.resumeEvents()
}}});
var d=new Ext.grid.GridPanel({store:new Ext.data.Store({reader:b,data:f}),cm:new Ext.grid.ColumnModel([{id:"name",width:390,sortable:true,dataIndex:"name"},g]),sm:g,width:450,height:250,frame:true,hideHeaders:true,iconCls:"icon-grid",listeners:{render:function(){var h=[];
this.grid.getStore().each(function(k){if(k.data.engaged){h.push(k)
}}.bind(this));
this.suspendEvents();
this.selectRecords(h);
this.resumeEvents()
}.bind(g)}});
var a=new Ext.Window({title:ORYX.I18N.PluginLoad.WindowTitle,width:"auto",height:"auto",modal:true});
a.add(d);
a.show();
this.mask.hide()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Save=Clazz.extend({facade:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Save.save,functionality:this.save.bind(this,false),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk.png",description:ORYX.I18N.Save.saveDesc,index:1,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Save.saveAs,functionality:this.save.bind(this,true),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk_multi.png",description:ORYX.I18N.Save.saveAsDesc,index:2,minShape:0,maxShape:0});
window.onbeforeunload=this.onUnLoad.bind(this);
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this))
},onUnLoad:function(){if(this.changeDifference!==0){return ORYX.I18N.Save.unsavedData
}},saveSynchronously:function(e){this.changeDifference=0;
var d="";
if(this.processURI){d=this.processURI
}else{if(!location.hash.slice(1)){d="/backend/poem/new"
}else{d="/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self"
}}if(e){var c=this.facade.getStencilSets();
var h=c[c.keys()[0]].source().split("stencilsets")[1];
d="/backend/poem"+ORYX.CONFIG.ORYX_NEW_URL+"?stencilset=/stencilsets"+h
}var g=this.facade.getCanvas().getSVGRepresentation(true);
var f=DataManager.serialize(g);
this.serializedDOM=Ext.encode(this.facade.getJSON());
if(d.include(ORYX.CONFIG.ORYX_NEW_URL)){var c=this.facade.getStencilSets().values()[0];
var a={title:ORYX.I18N.Save.newProcess,summary:"",type:c.title(),url:d,namespace:c.namespace()};
var b=new Ext.XTemplate('<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',"<fieldset>",'<p class="description">'+ORYX.I18N.Save.dialogDesciption+"</p>",'<input type="hidden" name="namespace" value="{namespace}" />','<p><label for="edit_model_title">'+ORYX.I18N.Save.dialogLabelTitle+'</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>','<p><label for="edit_model_summary">'+ORYX.I18N.Save.dialogLabelDesc+'</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>','<p><label for="edit_model_type">'+ORYX.I18N.Save.dialogLabelType+'</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',"</fieldset>","</form>");
callback=function(m){var n=m.elements.title.value.strip();
n=n.length==0?a.title:n;
window.document.title=n+" - Oryx";
var k=m.elements.summary.value.strip();
k=k.length==0?a.summary:k;
var l=m.elements.namespace.value.strip();
l=l.length==0?a.namespace:l;
win.destroy();
this.sendSaveRequest(d,{data:this.serializedDOM,svg:f,title:n,summary:k,type:l},e)
}.bind(this);
win=new Ext.Window({id:"Propertie_Window",width:"auto",height:"auto",title:e?ORYX.I18N.Save.saveAsTitle:ORYX.I18N.Save.save,modal:true,bodyStyle:"background:#FFFFFF",html:b.apply(a),buttons:[{text:ORYX.I18N.Save.saveBtn,handler:function(){callback($("edit_model"))
}},{text:ORYX.I18N.Save.close,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
win.destroy()
}.bind(this)}]});
win.show()
}else{this.sendSaveRequest(d,{data:this.serializedDOM,svg:f})
}},sendSaveRequest:function(a,c,b){new Ajax.Request(a,{method:"POST",asynchronous:false,parameters:c,onSuccess:(function(g){var f=g.getResponseHeader("location");
if(f){this.processURI=f
}else{this.processURI=a
}var e="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");
location.hash="#"+e;
if(b){var d=new Ext.Window({title:ORYX.I18N.Save.savedAs,bodyStyle:"background:white;padding:10px",width:"auto",height:"auto",html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='"+f+"' target='_blank'>"+f+"</a></span>",buttons:[{text:"Ok",handler:function(){d.destroy()
}}]});
d.show()
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_MODEL_SAVED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Save.saved})
}).bind(this),onFailure:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.failed);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this),on403:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.noRights);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this)})
},save:function(a,b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.Save.saving});
window.setTimeout((function(){this.saveSynchronously(a)
}).bind(this),10);
return true
}});
ORYX.Plugins.File=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.File.print,functionality:this.print.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/printer.png",description:ORYX.I18N.File.printDesc,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.pdf,functionality:this.exportPDF.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_acrobat.png",description:ORYX.I18N.File.pdfDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.info,functionality:this.info.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/information.png",description:ORYX.I18N.File.infoDesc,index:5,minShape:0,maxShape:0})
},info:function(){var a='<iframe src="'+ORYX.CONFIG.LICENSE_URL+'" type="text/plain" style="border:none;display:block;width:575px;height:460px;"/>\n\n<pre style="display:inline;">Version: </pre><iframe src="'+ORYX.CONFIG.VERSION_URL+'" type="text/plain" style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';
this.infoBox=Ext.Msg.show({title:ORYX.I18N.Oryx.title,msg:a,width:640,maxWidth:640,maxHeight:480,buttons:Ext.MessageBox.OK});
return false
},exportPDF:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.File.genPDF});
var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL,{method:"POST",parameters:{resource:c,data:a,format:"pdf"},onSuccess:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
window.open(d.responseText)
}).bind(this),onFailure:(function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.File.genPDFFailed)
}).bind(this)})
},print:function(){Ext.Msg.show({title:ORYX.I18N.File.printTitle,msg:ORYX.I18N.File.printMsg,buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(c){if(c=="yes"){var e=$H({width:300,height:400,toolbar:"no",status:"no",menubar:"yes",dependent:"yes",resizable:"yes",scrollbars:"yes"});
var f=window.open("","PrintWindow",e.invoke("join","=").join(","));
var b=f.document.getElementsByTagName("head")[0];
var d=document.createElement("style");
d.innerHTML=" body {padding:0px; margin:0px} .svgcontainer { display:none; }";
b.appendChild(d);
f.document.getElementsByTagName("body")[0].appendChild(this.facade.getCanvas().getSVGRepresentation());
var a=f.document.getElementsByTagName("body")[0].getElementsByTagName("svg")[0];
a.setAttributeNS(null,"width",1100);
a.setAttributeNS(null,"height",1400);
a.lastChild.setAttributeNS(null,"transform","scale(0.47, 0.47) rotate(270, 1510, 1470)");
var h=["marker-start","marker-mid","marker-end"];
var g=$A(f.document.getElementsByTagName("path"));
g.each(function(k){h.each(function(l){var m=k.getAttributeNS(null,l);
if(!m){return
}m="url(about:blank#"+m.slice(5);
k.setAttributeNS(null,l,m)
})
});
f.print();
return true
}}.bind(this)})
}});
window.onOryxResourcesLoaded=function(){if(location.hash.slice(1).length==0||location.hash.slice(1).indexOf("new")!=-1){var a=ORYX.Utils.getParamFromUrl("stencilset")||ORYX.CONFIG.SSET;
new ORYX.Editor({id:"oryx-canvas123",stencilset:{url:ORYX.PATH+"/"+a}})
}else{ORYX.Editor.createByUrl("/backend/poem"+location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+"json",{id:"oryx-canvas123",onFailure:function(b){if(403==b.status){Ext.Msg.show({title:"Authentication Failed",msg:'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{if(404==b.status){Ext.Msg.show({title:"Not Found",msg:"The model you requested could not be found.",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{Ext.Msg.show({title:"Internal Error",msg:"We're sorry, the model cannot be loaded due to an internal error",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}}}})
}};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Save=Clazz.extend({facade:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Save.save,functionality:this.save.bind(this,false),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk.png",description:ORYX.I18N.Save.saveDesc,index:1,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Save.saveAs,functionality:this.save.bind(this,true),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk_multi.png",description:ORYX.I18N.Save.saveAsDesc,index:2,minShape:0,maxShape:0});
window.onbeforeunload=this.onUnLoad.bind(this);
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this))
},onUnLoad:function(){if(this.changeDifference!==0){return ORYX.I18N.Save.unsavedData
}},saveSynchronously:function(e){this.changeDifference=0;
var d="";
if(this.processURI){d=this.processURI
}else{if(!location.hash.slice(1)){d="/backend/poem/new"
}else{d="/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self"
}}if(e){var c=this.facade.getStencilSets();
var h=c[c.keys()[0]].source().split("stencilsets")[1];
d="/backend/poem"+ORYX.CONFIG.ORYX_NEW_URL+"?stencilset=/stencilsets"+h
}var g=this.facade.getCanvas().getSVGRepresentation(true);
var f=DataManager.serialize(g);
this.serializedDOM=Ext.encode(this.facade.getJSON());
if(d.include(ORYX.CONFIG.ORYX_NEW_URL)){var c=this.facade.getStencilSets().values()[0];
var a={title:ORYX.I18N.Save.newProcess,summary:"",type:c.title(),url:d,namespace:c.namespace()};
var b=new Ext.XTemplate('<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',"<fieldset>",'<p class="description">'+ORYX.I18N.Save.dialogDesciption+"</p>",'<input type="hidden" name="namespace" value="{namespace}" />','<p><label for="edit_model_title">'+ORYX.I18N.Save.dialogLabelTitle+'</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>','<p><label for="edit_model_summary">'+ORYX.I18N.Save.dialogLabelDesc+'</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>','<p><label for="edit_model_type">'+ORYX.I18N.Save.dialogLabelType+'</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',"</fieldset>","</form>");
callback=function(m){var n=m.elements.title.value.strip();
n=n.length==0?a.title:n;
window.document.title=n+" - Oryx";
var k=m.elements.summary.value.strip();
k=k.length==0?a.summary:k;
var l=m.elements.namespace.value.strip();
l=l.length==0?a.namespace:l;
win.destroy();
this.sendSaveRequest(d,{data:this.serializedDOM,svg:f,title:n,summary:k,type:l},e)
}.bind(this);
win=new Ext.Window({id:"Propertie_Window",width:"auto",height:"auto",title:e?ORYX.I18N.Save.saveAsTitle:ORYX.I18N.Save.save,modal:true,bodyStyle:"background:#FFFFFF",html:b.apply(a),buttons:[{text:ORYX.I18N.Save.saveBtn,handler:function(){callback($("edit_model"))
}},{text:ORYX.I18N.Save.close,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
win.destroy()
}.bind(this)}]});
win.show()
}else{this.sendSaveRequest(d,{data:this.serializedDOM,svg:f})
}},sendSaveRequest:function(a,c,b){new Ajax.Request(a,{method:"POST",asynchronous:false,parameters:c,onSuccess:(function(g){var f=g.getResponseHeader("location");
if(f){this.processURI=f
}else{this.processURI=a
}var e="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");
location.hash="#"+e;
if(b){var d=new Ext.Window({title:ORYX.I18N.Save.savedAs,bodyStyle:"background:white;padding:10px",width:"auto",height:"auto",html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='"+f+"' target='_blank'>"+f+"</a></span>",buttons:[{text:"Ok",handler:function(){d.destroy()
}}]});
d.show()
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_MODEL_SAVED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Save.saved})
}).bind(this),onFailure:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.failed);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this),on403:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.noRights);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this)})
},save:function(a,b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.Save.saving});
window.setTimeout((function(){this.saveSynchronously(a)
}).bind(this),10);
return true
}});
ORYX.Plugins.File=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.File.print,functionality:this.print.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/printer.png",description:ORYX.I18N.File.printDesc,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.pdf,functionality:this.exportPDF.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_acrobat.png",description:ORYX.I18N.File.pdfDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.info,functionality:this.info.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/information.png",description:ORYX.I18N.File.infoDesc,index:5,minShape:0,maxShape:0})
},info:function(){var a='<iframe src="'+ORYX.CONFIG.LICENSE_URL+'" type="text/plain" style="border:none;display:block;width:575px;height:460px;"/>\n\n<pre style="display:inline;">Version: </pre><iframe src="'+ORYX.CONFIG.VERSION_URL+'" type="text/plain" style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';
this.infoBox=Ext.Msg.show({title:ORYX.I18N.Oryx.title,msg:a,width:640,maxWidth:640,maxHeight:480,buttons:Ext.MessageBox.OK});
return false
},exportPDF:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.File.genPDF});
var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL,{method:"POST",parameters:{resource:c,data:a,format:"pdf"},onSuccess:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
window.open(d.responseText)
}).bind(this),onFailure:(function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.File.genPDFFailed)
}).bind(this)})
},print:function(){Ext.Msg.show({title:ORYX.I18N.File.printTitle,msg:ORYX.I18N.File.printMsg,buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(c){if(c=="yes"){var e=$H({width:300,height:400,toolbar:"no",status:"no",menubar:"yes",dependent:"yes",resizable:"yes",scrollbars:"yes"});
var f=window.open("","PrintWindow",e.invoke("join","=").join(","));
var b=f.document.getElementsByTagName("head")[0];
var d=document.createElement("style");
d.innerHTML=" body {padding:0px; margin:0px} .svgcontainer { display:none; }";
b.appendChild(d);
f.document.getElementsByTagName("body")[0].appendChild(this.facade.getCanvas().getSVGRepresentation());
var a=f.document.getElementsByTagName("body")[0].getElementsByTagName("svg")[0];
a.setAttributeNS(null,"width",1100);
a.setAttributeNS(null,"height",1400);
a.lastChild.setAttributeNS(null,"transform","scale(0.47, 0.47) rotate(270, 1510, 1470)");
var h=["marker-start","marker-mid","marker-end"];
var g=$A(f.document.getElementsByTagName("path"));
g.each(function(k){h.each(function(l){var m=k.getAttributeNS(null,l);
if(!m){return
}m="url(about:blank#"+m.slice(5);
k.setAttributeNS(null,l,m)
})
});
f.print();
return true
}}.bind(this)})
}});
window.onOryxResourcesLoaded=function(){if(location.hash.slice(1).length==0||location.hash.slice(1).indexOf("new")!=-1){var a=ORYX.Utils.getParamFromUrl("stencilset")||ORYX.CONFIG.SSET;
new ORYX.Editor({id:"oryx-canvas123",stencilset:{url:ORYX.PATH+"/"+a}})
}else{ORYX.Editor.createByUrl("/backend/poem"+location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+"json",{id:"oryx-canvas123",onFailure:function(b){if(403==b.status){Ext.Msg.show({title:"Authentication Failed",msg:'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{if(404==b.status){Ext.Msg.show({title:"Not Found",msg:"The model you requested could not be found.",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{Ext.Msg.show({title:"Internal Error",msg:"We're sorry, the model cannot be loaded due to an internal error",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}}}})
}};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ContainerLayouter={construct:function(a){this.facade=a;
this.hashedContainers=new Hash()
},handleLayoutContainerDockers:function(b){var a=b.shape;
if(!this.hashedContainers[a.resourceId]){this.hashedContainers[a.resourceId]=a.bounds.clone();
return
}var c=a.bounds.upperLeft();
c.x-=this.hashedContainers[a.resourceId].upperLeft().x;
c.y-=this.hashedContainers[a.resourceId].upperLeft().y;
this.hashedContainers[a.resourceId]=a.bounds.clone();
this.moveChildDockers(a,c)
},handleLayoutContainerMinBounds:function(c){var h=c.shape;
var g=c.topOffset;
var b=h._oldBounds;
var n=c.options;
var e=(n.ignoreChildsWithId?n.ignoreChildsWithId:new Array());
var o=this.retrieveChildsIncludingBounds(h,e);
if(!o){return
}var m=this.getChildShapesWithout(h,e).find(function(p){return o.upperLeft().y==p.bounds.upperLeft().y
});
if(this.ensureContainersMinimumSize(h,o,m.absoluteBounds(),e,n)){return
}var a=o.upperLeft();
var l=o.lowerRight();
var f=(a.y?a.y:1)/((b.height()-l.y)?(b.height()-l.y):1);
var k=f*(h.bounds.height()-o.height())/(1+f);
this.getChildShapesWithout(h,e).each(function(q){var p=q.bounds.upperLeft().y-a.y;
q.bounds.moveTo({x:q.bounds.upperLeft().x,y:k+p})
});
var d=m.bounds.upperLeft().y-m._oldBounds.upperLeft().y;
this.moveChildDockers(h,{x:0,y:d})
},ensureContainersMinimumSize:function(b,n,v,m,d){var f=b.bounds;
var a=f.upperLeft();
var r=f.lowerRight();
var l=n.upperLeft();
var o=n.lowerRight();
var g=b.absoluteBounds();
if(!d){d=new Object()
}if(!b.isResized){var s=0;
var w=0;
var q=false;
var x=a.x;
var t=a.y;
var z=r.x;
var y=r.y;
if(l.x<0){x+=l.x;
w-=l.x;
q=true
}if(l.y<0){t+=l.y;
s-=l.y;
q=true
}var p=w+l.x+n.width()-f.width();
if(p>0){z+=p;
q=true
}var h=s+l.y+n.height()-f.height();
if(h>0){y+=h;
q=true
}f.set(x,t,z,y);
if(q){this.hashedContainers[b.resourceId]=f.clone()
}this.moveChildsBy(b,{x:w,y:s},m);
return true
}var x=a.x;
var t=a.y;
var z=r.x;
var y=r.y;
q=false;
if(f.height()<n.height()){if(a.y!=b._oldBounds.upperLeft().y&&r.y==b._oldBounds.lowerRight().y){t=y-n.height()-1;
if(d.fixedY){t-=n.upperLeft().y
}q=true
}else{if(a.y==b._oldBounds.upperLeft().y&&r.y!=b._oldBounds.lowerRight().y){y=t+n.height()+1;
if(d.fixedY){y+=n.upperLeft().y
}q=true
}else{if(v){var c=g.upperLeft().y-v.upperLeft().y;
var u=g.lowerRight().y-v.lowerRight().y;
t-=c;
y-=u;
t--;
y++;
q=true
}}}}if(f.width()<n.width()){if(a.x!=b._oldBounds.upperLeft().x&&r.x==b._oldBounds.lowerRight().x){x=z-n.width()-1;
if(d.fixedX){x-=n.upperLeft().x
}q=true
}else{if(a.x==b._oldBounds.upperLeft().x&&r.x!=b._oldBounds.lowerRight().x){z=x+n.width()+1;
if(d.fixedX){z+=n.upperLeft().x
}q=true
}else{if(v){var k=g.upperLeft().x-v.upperLeft().x;
var e=g.lowerRight().x-v.lowerRight().x;
x-=k;
z-=e;
x--;
z++;
q=true
}}}}f.set(x,t,z,y);
if(q){this.handleLayoutContainerDockers({shape:b})
}},moveChildsBy:function(a,c,b){if(!a||!c){return
}this.getChildShapesWithout(a,b).each(function(d){d.bounds.moveBy(c)
})
},getAbsoluteBoundsForChildShapes:function(a){},moveChildDockers:function(a,b){if(!b.x&&!b.y){return
}a.getChildNodes(true).map(function(c){return[].concat(c.getIncomingShapes()).concat(c.getOutgoingShapes())
}).flatten().uniq().map(function(c){return c.dockers.length>2?c.dockers.slice(1,c.dockers.length-1):[]
}).flatten().each(function(c){c.bounds.moveBy(b)
})
},retrieveChildsIncludingBounds:function(b,c){var a=undefined;
this.getChildShapesWithout(b,c).each(function(e,d){if(d==0){a=e.bounds.clone();
return
}a.include(e.bounds)
});
return a
},getChildShapesWithout:function(a,b){var c=a.getChildShapes(false);
return c.findAll(function(d){return !b.member(d.getStencil().id())
})
}};
ORYX.Plugins.ContainerLayouter=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ContainerLayouter);
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Plugins.Layouter){ORYX.Plugins.Layouter={}
}new function(){ORYX.Plugins.Layouter.EdgeLayouter=ORYX.Plugins.AbstractLayouter.extend({layouted:["http://b3mn.org/stencilset/bpmn1.1#SequenceFlow","http://b3mn.org/stencilset/bpmn1.1#MessageFlow","http://b3mn.org/stencilset/bpmn2.0#MessageFlow","http://b3mn.org/stencilset/bpmn2.0#SequenceFlow","http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink","http://b3mn.org/stencilset/epc#ControlFlow","http://www.signavio.com/stencilsets/processmap#ProcessLink","http://www.signavio.com/stencilsets/organigram#connection"],layout:function(a){a.each(function(b){this.doLayout(b)
}.bind(this))
},doLayout:function(b){var d=b.getIncomingNodes()[0];
var c=b.getOutgoingNodes()[0];
if(!d||!c){return
}var a=this.getPositions(d,c,b);
if(a.length>0){this.setDockers(b,a[0].a,a[0].b)
}},getPositions:function(r,s,e){var u=r.absoluteBounds();
var n=s.absoluteBounds();
var q=u.center();
var o=n.center();
var l=u.midPoint();
var d=n.midPoint();
var k=Object.clone(e.dockers.first().referencePoint);
var t=Object.clone(e.dockers.last().referencePoint);
var c=e.dockers.first().getAbsoluteReferencePoint();
var p=e.dockers.last().getAbsoluteReferencePoint();
if(Math.abs(c.x-p.x)<1||Math.abs(c.y-p.y)<1){return[]
}var g={};
g.x=q.x<o.x?(((o.x-n.width()/2)-(q.x+u.width()/2))/2)+(q.x+u.width()/2):(((q.x-u.width()/2)-(o.x+n.width()/2))/2)+(o.x+n.width()/2);
g.y=q.y<o.y?(((o.y-n.height()/2)-(q.y+u.height()/2))/2)+(q.y+u.height()/2):(((q.y-u.height()/2)-(o.y+n.height()/2))/2)+(o.y+n.height()/2);
u.widen(5);
n.widen(20);
var h=[];
var f=this.getOffset.bind(this);
if(!u.isIncluded(o.x,q.y)&&!n.isIncluded(o.x,q.y)){h.push({a:{x:o.x+f(t,d,"x"),y:q.y+f(k,l,"y")},z:this.getWeight(r,q.x<o.x?"r":"l",s,q.y<o.y?"t":"b",e)})
}if(!u.isIncluded(q.x,o.y)&&!n.isIncluded(q.x,o.y)){h.push({a:{x:q.x+f(k,l,"x"),y:o.y+f(t,d,"y")},z:this.getWeight(r,q.y<o.y?"b":"t",s,q.x<o.x?"l":"r",e)})
}if(!u.isIncluded(g.x,q.y)&&!n.isIncluded(g.x,o.y)){h.push({a:{x:g.x,y:q.y+f(k,l,"y")},b:{x:g.x,y:o.y+f(t,d,"y")},z:this.getWeight(r,"r",s,"l",e,q.x>o.x)})
}if(!u.isIncluded(q.x,g.y)&&!n.isIncluded(o.x,g.y)){h.push({a:{x:q.x+f(k,l,"x"),y:g.y},b:{x:o.x+f(t,d,"x"),y:g.y},z:this.getWeight(r,"b",s,"t",e,q.y>o.y)})
}return h.sort(function(v,m){return v.z<m.z?1:(v.z==m.z?-1:-1)
})
},getOffset:function(c,b,a){return c[a]-b[a]
},getWeight:function(m,b,n,a,d,g){b=(b||"").toLowerCase();
a=(a||"").toLowerCase();
if(!["t","r","b","l"].include(b)){b="r"
}if(!["t","r","b","l"].include(a)){b="l"
}if(g){b=b=="t"?"b":(b=="r"?"l":(b=="b"?"t":(b=="l"?"r":"r")));
a=a=="t"?"b":(a=="r"?"l":(a=="b"?"t":(a=="l"?"r":"r")))
}var f=0;
var p=this.facade.getRules().getLayoutingRules(m,d)["out"];
var o=this.facade.getRules().getLayoutingRules(n,d)["in"];
var e=p[b];
var c=o[a];
var l=function(s,r,q){switch(s){case"t":return Math.abs(r.x-q.x)<2&&r.y<q.y;
case"r":return r.x>q.x&&Math.abs(r.y-q.y)<2;
case"b":return Math.abs(r.x-q.x)<2&&r.y>q.y;
case"l":return r.x<q.x&&Math.abs(r.y-q.y)<2;
default:return false
}};
var k=m.getIncomingShapes().findAll(function(q){return q instanceof ORYX.Core.Edge
}).any(function(q){return l(b,q.dockers[q.dockers.length-2].bounds.center(),q.dockers.last().bounds.center())
});
var h=n.getOutgoingShapes().findAll(function(q){return q instanceof ORYX.Core.Edge
}).any(function(q){return l(a,q.dockers[1].bounds.center(),q.dockers.first().bounds.center())
});
return(k||h?0:e+c)
},setDockers:function(e,d,c){if(!e){return
}e.dockers.each(function(a){e.removeDocker(a)
});
[d,c].compact().each(function(b){var a=e.createDocker(undefined,b);
a.bounds.centerMoveTo(b)
});
e.dockers.each(function(a){a.update()
});
e._update(true)
}})
}();
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}if(!ORYX.Config){ORYX.Config=new Object()
}ORYX.Config.WaveThisGadgetUri="http://ddj0ahgq8zch6.cloudfront.net/gadget/oryx_stable.xml";
ORYX.Plugins.WaveThis=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.WaveThis.name,functionality:this.waveThis.bind(this),group:ORYX.I18N.WaveThis.group,icon:ORYX.PATH+"images/waveThis.png",description:ORYX.I18N.WaveThis.desc,dropDownGroupIcon:ORYX.PATH+"images/export2.png",});
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODEL_SAVED,function(){this.changeDifference=0
}.bind(this))
},waveThis:function(){var a;
if(!location.hash.slice(1)){Ext.Msg.alert(ORYX.I18N.WaveThis.name,ORYX.I18N.WaveThis.failUnsaved);
return
}else{a=ORYX.CONFIG.WEB_URL+"/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/json"
}if(this.changeDifference!=0){Ext.Msg.confirm(ORYX.I18N.WaveThis.name,"You have unsaved changes in your model. Proceed?",function(b){if(b=="yes"){this._openWave(a)
}},this)
}else{this._openWave(a)
}},_openWave:function(b){var c=window.open("");
if(c!=null){c.document.open();
c.document.write("<html><body>");
var a=c.document.createElement("form");
c.document.body.appendChild(a);
var d=function(e,f){var g=document.createElement("input");
g.name=e;
g.type="hidden";
g.value=f;
return g
};
a.appendChild(d("u",b));
a.appendChild(d("g",ORYX.Config.WaveThisGadgetUri));
a.method="POST";
c.document.write("</body></html>");
c.document.close();
a.action="https://wave.google.com/wave/wavethis?t=Oryx%20Model%20Export";
a.submit()
}}});
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
a.each((function(k){if(!k.name){return
}this.plugs.push(k);
if(f!=k.group){this.toolbar.add("-");
f=k.group;
d={}
}var h=k.functionality;
k.functionality=function(){if("undefined"!=typeof(pageTracker)&&"function"==typeof(pageTracker._trackEvent)){pageTracker._trackEvent("ToolbarButton",k.name)
}return h.apply(this,arguments)
};
if(k.dropDownGroupIcon){var m=d[k.dropDownGroupIcon];
if(m===undefined){m=d[k.dropDownGroupIcon]=new Ext.Toolbar.SplitButton({cls:"x-btn-icon",icon:k.dropDownGroupIcon,menu:new Ext.menu.Menu({items:[]}),listeners:{click:function(n,o){if(!n.menu.isVisible()&&!n.ignoreNextClick){n.showMenu()
}else{n.hideMenu()
}}}});
this.toolbar.add(m)
}var l={icon:k.icon,text:k.name,itemId:k.id,handler:k.toggle?undefined:k.functionality,checkHandler:k.toggle?k.functionality:undefined,listeners:{render:function(n){if(k.description){new Ext.ToolTip({target:n.getEl(),title:k.description})
}}}};
if(k.toggle){var g=new Ext.menu.CheckItem(l)
}else{var g=new Ext.menu.Item(l)
}m.menu.add(g)
}else{var g=new Ext.Toolbar.Button({icon:k.icon,cls:"x-btn-icon",itemId:k.id,tooltip:k.description,tooltipType:"title",handler:k.toggle?null:k.functionality,enableToggle:k.toggle,toggleHandler:k.toggle?k.functionality:null});
this.toolbar.add(g);
g.getEl().onclick=function(){this.blur()
}}k.buttonInstance=g;
this.buttons.push(k)
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
e.each((function(k){var h={type:k.id(),namespace:k.namespace(),connectingType:true};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:k.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:0,msg:k.title()+" - "+ORYX.I18N.ShapeMenuPlugin.clickDrag});
this.shapeMenu.addButton(g);
this.createdButtons[k.namespace()+k.type()+k.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this));
var d=f.edges();
d.each((function(k){var h={type:k.id(),namespace:k.namespace()};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:k.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:1,msg:(b?ORYX.I18N.Edge:k.title())+" - "+ORYX.I18N.ShapeMenuPlugin.drag});
this.shapeMenu.addButton(g);
this.createdButtons[k.namespace()+k.type()+k.id()]=g;
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
c.each((function(k){if(e){if(this.baseMorphStencils.include(k)){var l=true
}else{var h=this.facade.getRules().morphStencils({stencil:k});
var l=!h.any((function(m){if(this.baseMorphStencils.include(m)&&c.include(m)){return true
}return d.include(m)
}).bind(this))
}}if(l||!e){if(this.createdButtons[k.namespace()+k.type()+k.id()]){this.createdButtons[k.namespace()+k.type()+k.id()].prepareToShow()
}d.push(k)
}a=a.concat(this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(),sourceShape:g[0],edgeStencil:k}))
}).bind(this));
a.uniq();
var b=new Array();
a.each((function(l){if(e){if(l.type()==="edge"){return
}if(!this.facade.getRules().showInShapeMenu(l)){return
}if(!this.baseMorphStencils.include(l)){var h=this.facade.getRules().morphStencils({stencil:l});
if(h.size()==0){return
}var k=h.any((function(m){if(this.baseMorphStencils.include(m)&&a.include(m)){return true
}return b.include(m)
}).bind(this));
if(k){return
}}}if(this.createdButtons[l.namespace()+l.type()+l.id()]){this.createdButtons[l.namespace()+l.type()+l.id()].prepareToShow()
}b.push(l)
}).bind(this))
},beforeDragOver:function(n,m,b){if(this.shapeMenu.isVisible){this.hideShapeMenu()
}var l=this.facade.eventCoordinates(b.browserEvent);
var s=this.facade.getCanvas().getAbstractShapesAtPosition(l);
if(s.length<=0){return false
}var d=s.last();
if(this._lastOverElement==d){return false
}else{var h=Ext.dd.Registry.getHandle(m.DDM.currentTarget);
if(h.backupOptions){for(key in h.backupOptions){h[key]=h.backupOptions[key]
}delete h.backupOptions
}var o=this.facade.getStencilSets()[h.namespace];
var q=o.stencil(h.type);
var r=s.last();
if(q.type()==="node"){var c=this.facade.getRules().canContain({containingShape:r,containedStencil:q});
if(!c){var p=this.facade.getRules().morphStencils({stencil:q});
for(var g=0;
g<p.size();
g++){c=this.facade.getRules().canContain({containingShape:r,containedStencil:p[g]});
if(c){h.backupOptions=Object.clone(h);
h.type=p[g].id();
h.namespace=p[g].namespace();
break
}}}this._currentReference=c?r:undefined
}else{var k=r,e=r;
var f=false;
while(!f&&k&&!(k instanceof ORYX.Core.Canvas)){r=k;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:q,targetShape:k});
k=k.parent
}if(!f){r=e;
var p=this.facade.getRules().morphStencils({stencil:q});
for(var g=0;
g<p.size();
g++){var k=r;
var f=false;
while(!f&&k&&!(k instanceof ORYX.Core.Canvas)){r=k;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:p[g],targetShape:k});
k=k.parent
}if(f){h.backupOptions=Object.clone(h);
h.type=p[g].id();
h.namespace=p[g].namespace();
break
}else{r=e
}}}this._currentReference=f?r:undefined
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeMenu",elements:[r],color:this._currentReference?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
var a=n.getProxy();
a.setStatus(this._currentReference?a.dropAllowed:a.dropNotAllowed);
a.sync()
}this._lastOverElement=d;
return false
},afterDragging:function(k,f,b){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}var e=this.currentShapes;
this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeMenu"});
var h=k.getProxy();
if(h.dropStatus==h.dropNotAllowed){return this.facade.updateSelection()
}if(!this._currentReference){return
}var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
d.parent=this._currentReference;
var r=b.getXY();
var l={x:r[0],y:r[1]};
var n=this.facade.getCanvas().node.getScreenCTM();
l.x-=n.e;
l.y-=n.f;
l.x/=n.a;
l.y/=n.d;
l.x-=document.documentElement.scrollLeft;
l.y-=document.documentElement.scrollTop;
var q=this._currentReference.absoluteXY();
l.x-=q.x;
l.y-=q.y;
if(!b.ctrlKey){var m=this.currentShapes[0].bounds.center();
if(20>Math.abs(m.x-l.x)){l.x=m.x
}if(20>Math.abs(m.y-l.y)){l.y=m.y
}}d.position=l;
d.connectedShape=this.currentShapes[0];
if(d.connectingType){var p=this.facade.getStencilSets()[d.namespace];
var o=p.stencil(d.type);
var g={sourceShape:this.currentShapes[0],targetStencil:o};
d.connectingType=this.facade.getRules().connectMorph(g).id()
}if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete d.connectingType
}var c=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(Object.clone(d),this._currentReference,l,this);
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
},execute:function(){var o=this.shape;
var s=this.stencil;
var n=o.resourceId;
var h=o.serialize();
s.properties().each((function(t){if(t.readonly()){h=h.reject(function(u){return u.name==t.id()
})
}}).bind(this));
if(this.newShape){newShape=this.newShape;
this.facade.getCanvas().add(newShape)
}else{newShape=this.facade.createShape({type:s.id(),namespace:s.namespace(),resourceId:n})
}var m=h.find(function(t){return(t.prefix==="oryx"&&t.name==="bounds")
});
var p=null;
if(!this.facade.getRules().preserveBounds(o.getStencil())){var e=m.value.split(",");
if(parseInt(e[0],10)>parseInt(e[2],10)){var k=e[0];
e[0]=e[2];
e[2]=k;
k=e[1];
e[1]=e[3];
e[3]=k
}e[2]=parseInt(e[0],10)+newShape.bounds.width();
e[3]=parseInt(e[1],10)+newShape.bounds.height();
m.value=e.join(",")
}else{var r=o.bounds.height();
var f=o.bounds.width();
if(newShape.minimumSize){if(o.bounds.height()<newShape.minimumSize.height){r=newShape.minimumSize.height
}if(o.bounds.width()<newShape.minimumSize.width){f=newShape.minimumSize.width
}}if(newShape.maximumSize){if(o.bounds.height()>newShape.maximumSize.height){r=newShape.maximumSize.height
}if(o.bounds.width()>newShape.maximumSize.width){f=newShape.maximumSize.width
}}p={a:{x:o.bounds.a.x,y:o.bounds.a.y},b:{x:o.bounds.a.x+f,y:o.bounds.a.y+r}}
}var q=o.bounds.center();
if(p!==null){newShape.bounds.set(p)
}this.setRelatedDockers(o,newShape);
var l=o.node.parentNode;
var g=o.node.nextSibling;
this.facade.deleteShape(o);
newShape.deserialize(h);
if(o.getStencil().property("oryx-bgcolor")&&o.properties["oryx-bgcolor"]&&o.getStencil().property("oryx-bgcolor").value().toUpperCase()==o.properties["oryx-bgcolor"].toUpperCase()){if(newShape.getStencil().property("oryx-bgcolor")){newShape.setProperty("oryx-bgcolor",newShape.getStencil().property("oryx-bgcolor").value())
}}if(p!==null){newShape.bounds.set(p)
}if(newShape.getStencil().type()==="edge"||(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){newShape.bounds.centerMoveTo(q)
}if(newShape.getStencil().type()==="node"&&(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){this.setRelatedDockers(newShape,newShape)
}if(g){l.insertBefore(newShape.node,g)
}else{l.appendChild(newShape.node)
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
},setRelatedDockers:function(e,f){if(e.getStencil().type()==="node"){(e.incoming||[]).concat(e.outgoing||[]).each(function(g){g.dockers.each(function(l){if(l.getDockedShape()==e){var k=Object.clone(l.referencePoint);
var m={x:k.x*f.bounds.width()/e.bounds.width(),y:k.y*f.bounds.height()/e.bounds.height()};
l.setDockedShape(f);
l.setReferencePoint(m);
if(g instanceof ORYX.Core.Edge){l.bounds.centerMoveTo(m)
}else{var h=e.absoluteXY();
l.bounds.centerMoveTo({x:m.x+h.x,y:m.y+h.y})
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
this.shapes.each(function(r){var q=r.node.getScreenCTM();
var s=r.absoluteXY();
q.e=q.a*s.x;
q.f=q.d*s.y;
h=new ORYX.Core.Bounds(q.e,q.f,q.e+q.a*r.bounds.width(),q.f+q.d*r.bounds.height());
if(!f){f=h
}else{f.include(h)
}});
this.bounds=f;
var c=this.bounds;
var m=this.bounds.upperLeft();
var g=0,d=0;
var k=0,l=0;
var b=0,n;
var o=0;
rightButtonGroup=0;
var p=22;
this.getWillShowButtons().sortBy(function(a){return a.group
});
this.getWillShowButtons().each(function(q){var r=this.getNumberOfButtonsPerLevel(q.align);
if(q.align==ORYX.CONFIG.SHAPEMENU_LEFT){if(q.group!=d){g=0;
d=q.group
}var a=Math.floor(g/r);
var s=g%r;
q.setLevel(a);
q.setPosition(m.x-5-(a+1)*p,m.y+r*q.group*p+q.group*0.3*p+s*p);
g++
}else{if(q.align==ORYX.CONFIG.SHAPEMENU_TOP){if(q.group!=l){k=0;
l=q.group
}var a=k%r;
var s=Math.floor(k/r);
q.setLevel(s);
q.setPosition(m.x+r*q.group*p+q.group*0.3*p+a*p,m.y-5-(s+1)*p);
k++
}else{if(q.align==ORYX.CONFIG.SHAPEMENU_BOTTOM){if(q.group!=n){b=0;
n=q.group
}var a=b%r;
var s=Math.floor(b/r);
q.setLevel(s);
q.setPosition(m.x+r*q.group*p+q.group*0.3*p+a*p,m.y+c.height()+5+s*p);
b++
}else{if(q.group!=rightButtonGroup){o=0;
rightButtonGroup=q.group
}var a=Math.floor(o/r);
var s=o%r;
q.setLevel(a);
q.setPosition(m.x+c.width()+5+a*p,m.y+r*q.group*p+q.group*0.3*p+s*p-5);
o++
}}}q.show()
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
if(this.shape instanceof ORYX.Core.Node){(this.shape.dockers||[]).each(function(k){k.bounds.centerMoveTo(h)
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