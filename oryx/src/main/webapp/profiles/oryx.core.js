
/**
 * @namespace Oryx name space for different utility methods
 * @name ORYX.Utils
*/
ORYX.Utils = {
    /**
     * General helper method for parsing a param out of current location url
     * @example
     * // Current url in Browser => "http://oryx.org?param=value"
     * ORYX.Utils.getParamFromUrl("param") // => "value" 
     * @param {Object} name
     */
    getParamFromUrl: function(name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1];
        }
    },
	
	adjustGradient: function(gradient, reference){
		
		if (ORYX.CONFIG.DISABLE_GRADIENT && gradient){
		
			var col = reference.getAttributeNS(null, "stop-color") || "#ffffff";
			
			$A(gradient.getElementsByTagName("stop")).each(function(stop){
				if (stop == reference){ return; }
				stop.setAttributeNS(null, "stop-color", col);
			})
		}
	}
}
/**
 * @author martin.czuchra
 */

XMLNS = {
	ATOM:	"http://www.w3.org/2005/Atom",
	XHTML:	"http://www.w3.org/1999/xhtml",
	ERDF:	"http://purl.org/NET/erdf/profile",
	RDFS:	"http://www.w3.org/2000/01/rdf-schema#",
	RDF:	"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	RAZIEL: "http://b3mn.org/Raziel",

	SCHEMA: ""
};

//TODO kann kickstart sich vielleicht auch um die erzeugung von paketen/
// namespaces k�mmern? z.b. requireNamespace("ORYX.Core.SVG");
var Kickstart = {
 	started: false,
	callbacks: [],
	alreadyLoaded: [],
	PATH: '',

	load: function() { Kickstart.kick(); },

	kick: function() {
		//console.profile("loading");
		if(!Kickstart.started) {
			Kickstart.started = true;
			Kickstart.callbacks.each(function(callback){
				// call the registered callback asynchronously.
				window.setTimeout(callback, 1);
			});
		}
	},

	register: function(callback) {
		//TODO Add some mutual exclusion between kick and register calls.
		with(Kickstart) {
			if(started) window.setTimeout(callback, 1);
			else Kickstart.callbacks.push(callback)
		}
	},

	/**
	 * Loads a js, assuring that it has only been downloaded once.
	 * @param {String} url the script to load.
	 */
	require: function(url) {
		// if not already loaded, include it.
		if(Kickstart.alreadyLoaded.member(url))
			return false;
		return Kickstart.include(url);
	},

	/**
	 * Loads a js, regardless of whether it has only been already downloaded.
	 * @param {String} url the script to load.
	 */
	include: function(url) {

		// prepare a script tag and place it in html head.
		var head = document.getElementsByTagNameNS(XMLNS.XHTML, 'head')[0];
		var s = document.createElementNS(XMLNS.XHTML, "script");
		s.setAttributeNS(XMLNS.XHTML, 'type', 'text/javascript');
	   	s.src = Kickstart.PATH + url;

		//TODO macht es sinn, dass neue skript als letztes kind in den head
		// einzubinden (stichwort reihenfolge der skript tags)?
	   	head.appendChild(s);

		// remember this url.
		Kickstart.alreadyLoaded.push(url);

		return true;
	}
}

// register kickstart as the new onload event listener on current window.
// previous listener(s) are triggered to launch with kickstart.
Event.observe(window, 'load', Kickstart.load);/**
 * @author martin.czuchra
 */

var ERDF = {

	LITERAL: 0x01,
	RESOURCE: 0x02,
	DELIMITERS: ['.', '-'],
	HASH: '#',
	HYPHEN: "-",

	schemas: [],
	callback: undefined,
	log: undefined,

	init: function(callback) {
		
		// init logging.
		//ERDF.log = Log4js.getLogger("oryx");
		//ERDF.log.setLevel(Log4js.Level.ALL);
		//ERDF.log.addAppender(new ConsoleAppender(ERDF.log, false));

		//if(ERDF.log.isTraceEnabled())
		//	ERDF.log.trace("ERDF Parser is initialized.");

		// register callbacks and default schemas.
		ERDF.callback = callback;
		ERDF.registerSchema('schema', XMLNS.SCHEMA);
		ERDF.registerSchema('rdfs', XMLNS.RDFS);
	},

	run: function() {

		//if(ERDF.log.isTraceEnabled())
		//	ERDF.log.trace("ERDF Parser is running.");

		// do the work.
		return ERDF._checkProfile() && ERDF.parse();
	},
	
	parse: function() {
		
		//(ERDF.log.isDebugEnabled())
		//	ERDF.log.debug("Begin parsing document metadata.");
		
		// time measuring
		ERDF.__startTime = new Date();

		var bodies = document.getElementsByTagNameNS(XMLNS.XHTML, 'body');
		var subject = {type: ERDF.RESOURCE, value: ''};

		var result = ERDF._parseDocumentMetadata() &&
			ERDF._parseFromTag(bodies[0], subject);
			
		// time measuring
		ERDF.__stopTime = new Date();

		var duration = (ERDF.__stopTime - ERDF.__startTime)/1000.;
		//alert('ERDF parsing took ' + duration + ' s.');
		
		return result;
	},
	
	_parseDocumentMetadata: function() {

		// get links from head element.
		var heads = document.getElementsByTagNameNS(XMLNS.XHTML, 'head');
		var links = heads[0].getElementsByTagNameNS(XMLNS.XHTML, 'link');
		var metas = heads[0].getElementsByTagNameNS(XMLNS.XHTML, 'meta');

		// process links first, since they could contain schema definitions.
		$A(links).each(function(link) {
			var properties = link.getAttribute('rel');
			var reversedProperties = link.getAttribute('rev');
			var value = link.getAttribute('href');
			
			ERDF._parseTriplesFrom(
				ERDF.RESOURCE, '',
				properties,
				ERDF.RESOURCE, value);
				
			ERDF._parseTriplesFrom(
				ERDF.RESOURCE, value,
				reversedProperties,
				ERDF.RESOURCE, '');
		});

		// continue with metas.
		$A(metas).each(function(meta) {
			var property = meta.getAttribute('name');
			var value = meta.getAttribute('content');
			
			ERDF._parseTriplesFrom(
				ERDF.RESOURCE, '',
				property,
				ERDF.LITERAL, value);
		});

		return true;
	},
	
	_parseFromTag: function(node, subject, depth) {
		
		// avoid parsing non-xhtml content.
		if(node.namespaceURI != XMLNS.XHTML) { return; }
		
		// housekeeping.
		if(!depth) depth=0;
		var id = node.getAttribute('id');

		// some logging.
		//if(ERDF.log.isTraceEnabled())
		//	ERDF.log.trace(">".times(depth) + " Parsing " + node.nodeName + " ("+node.nodeType+") for data on " +
		//		((subject.type == ERDF.RESOURCE) ? ('&lt;' + subject.value + '&gt;') : '') +
		//		((subject.type == ERDF.LITERAL) ? '"' + subject.value + '"' : ''));
		
		/* triple finding! */
		
		// in a-tags...
		if(node.nodeName.endsWith(':a') || node.nodeName == 'a') {
			var properties = node.getAttribute('rel');
			var reversedProperties = node.getAttribute('rev');
			var value = node.getAttribute('href');
			var title = node.getAttribute('title');
			var content = node.textContent;

			// rel triples
			ERDF._parseTriplesFrom(
				subject.type, subject.value,
				properties,
				ERDF.RESOURCE, value,
				function(triple) {
					var label = title? title : content;
					
					// label triples
					ERDF._parseTriplesFrom(
						triple.object.type, triple.object.value,
						'rdfs.label',
						ERDF.LITERAL, label);
				});

			// rev triples
			ERDF._parseTriplesFrom(
				subject.type, subject.value,
				reversedProperties,
				ERDF.RESOURCE, '');
				
			// type triples
			ERDF._parseTypeTriplesFrom(
				subject.type, subject.value,
				properties);

		// in img-tags...
		} else if(node.nodeName.endsWith(':img') || node.nodeName == 'img') {
			var properties = node.getAttribute('class');
			var value = node.getAttribute('src');
			var alt = node.getAttribute('alt');

			ERDF._parseTriplesFrom(
				subject.type, subject.value,
				properties,
				ERDF.RESOURCE, value,
				function(triple) {
					var label = alt;
					
					// label triples
					ERDF._parseTriplesFrom(
						triple.object.type, triple.object.value,
						'rdfs.label',
						ERDF.LITERAL, label);
				});

		}
		
		// in every tag
		var properties = node.getAttribute('class');
		var title = node.getAttribute('title');
		var content = node.textContent;
		var label = title ? title : content;
		
		// regular triples
		ERDF._parseTriplesFrom(
			subject.type, subject.value,
			properties,
			ERDF.LITERAL, label);

		if(id) subject = {type: ERDF.RESOURCE, value: ERDF.HASH+id};
		
		// type triples
		ERDF._parseTypeTriplesFrom(
			subject.type, subject.value,
			properties);

		// parse all children that are element nodes.
		var children = node.childNodes;
		if(children) $A(children).each(function(_node) {
			if(_node.nodeType == _node.ELEMENT_NODE)
				ERDF._parseFromTag(_node, subject, depth+1); });
	},
	
	_parseTriplesFrom: function(subjectType, subject, properties,
		objectType, object, callback) {
		
		if(!properties) return;
		properties.toLowerCase().split(' ').each( function(property) {
			
			//if(ERDF.log.isTraceEnabled())
			//	ERDF.log.trace("Going for property " + property);

			var schema = ERDF.schemas.find( function(schema) {
				return false || ERDF.DELIMITERS.find( function(delimiter) {
					return property.startsWith(schema.prefix + delimiter);
				});
			});
			
			if(schema && object) {
				property = property.substring(
					schema.prefix.length+1, property.length);
				var triple = ERDF.registerTriple(
					new ERDF.Resource(subject),
					{prefix: schema.prefix, name: property},
					(objectType == ERDF.RESOURCE) ?
						new ERDF.Resource(object) :
						new ERDF.Literal(object));
						
				if(callback) callback(triple);
			}
		});
	},
	
	_parseTypeTriplesFrom: function(subjectType, subject, properties, callback) {
		
		if(!properties) return;
		properties.toLowerCase().split(' ').each( function(property) {
			
			//if(ERDF.log.isTraceEnabled())
			//	ERDF.log.trace("Going for property " + property);
				
			var schema = ERDF.schemas.find( function(schema) {
				return false || ERDF.DELIMITERS.find( function(delimiter) {
					return property.startsWith(ERDF.HYPHEN + schema.prefix + delimiter);
				});
			});
			
			if(schema && subject) {
				property = property.substring(schema.prefix.length+2, property.length);
				var triple = ERDF.registerTriple(
					(subjectType == ERDF.RESOURCE) ?
						new ERDF.Resource(subject) :
						new ERDF.Literal(subject),
					{prefix: 'rdf', name: 'type'},
					new ERDF.Resource(schema.namespace+property));
				if(callback) callback(triple);
			}
		});
	},
	
	/**
	 * Checks for ERDF profile declaration in head of document.
	 */
	_checkProfile: function() {

		// get profiles from head element.
		var heads = document.getElementsByTagNameNS(XMLNS.XHTML, 'head');
		var profiles = heads[0].getAttribute("profile");
		var found = false;

		// if erdf profile is contained.
		if(profiles && profiles.split(" ").member(XMLNS.ERDF)) {

			// pass check.
			//if(ERDF.log.isTraceEnabled())
			//	ERDF.log.trace("Found ERDF profile " + XMLNS.ERDF);
			return true;
			
		} else {
		
			// otherwise fail check.
			//if(ERDF.log.isFatalEnabled())
			//	ERDF.log.fatal("No ERDF profile found.");
			return false;
		}
	},
	
	__stripHashes: function(s) {
		return (s && s.substring(0, 1)=='#') ? s.substring(1, s.length) : s;
	},
	
	registerSchema: function(prefix, namespace) {
		
		// TODO check whether already registered, if so, complain.
		ERDF.schemas.push({
			prefix: prefix,
			namespace: namespace
		});
		
		//if(ERDF.log.isDebugEnabled())
		//	ERDF.log.debug("Prefix '"+prefix+"' for '"+namespace+"' registered.");
	},
	
	registerTriple: function(subject, predicate, object) {
		
		// if prefix is schema, this is a schema definition.
		if(predicate.prefix.toLowerCase() == 'schema')
			this.registerSchema(predicate.name, object.value);
			
		var triple = new ERDF.Triple(subject, predicate, object);
		ERDF.callback(triple);
		
		//if(ERDF.log.isInfoEnabled())
		//	ERDF.log.info(triple)
		
		// return the registered triple.
		return triple;
	},
	
	__enhanceObject: function() {
		
		/* Resource state querying methods */
		this.isResource = function() {
			return this.type == ERDF.RESOURCE };
		this.isLocal = function() {
			return this.isResource() && this.value.startsWith('#') };
		this.isCurrentDocument = function() {
			return this.isResource() && (this.value == '') };
		
		/* Resource getter methods.*/
		this.getId = function() {
			return this.isLocal() ? ERDF.__stripHashes(this.value) : false; };

		/* Liiteral state querying methods  */
		this.isLiteral = function() {
			return this.type == ERDF.LIITERAL };
	},
	
	serialize: function(literal) {
		
		if(!literal){
			return "";
		}else if(literal.constructor == String) {
			return literal;
		} else if(literal.constructor == Boolean) {
			return literal? 'true':'false';
		} else {
			return literal.toString();
		}
	}
};


ERDF.Triple = function(subject, predicate, object) {
	
	this.subject = subject;
	this.predicate = predicate;
	this.object = object;
	
	this.toString = function() {
		
		return "[ERDF.Triple] " +
			this.subject.toString() + ' ' +
			this.predicate.prefix + ':' + this.predicate.name + ' ' +
			this.object.toString();
		};
};

ERDF.Resource = function(uri) {
	
	this.type = ERDF.RESOURCE;
	this.value = uri;
	ERDF.__enhanceObject.apply(this);
	
	this.toString = function() {
		return '&lt;' + this.value + '&gt;';
	}
	
};

ERDF.Literal = function(literal) {
	
	this.type = ERDF.LITERAL;
	this.value = ERDF.serialize(literal);
	ERDF.__enhanceObject.apply(this);

	this.toString = function() {
		return '"' + this.value + '"';
	}
};/**
 * @author martin.czuchra
 */

/*
 * Save and triple generation behaviour. Use this area to configure
 * data management to your needs.
 */
var USE_ASYNCHRONOUS_REQUESTS =		true;
var DISCARD_UNUSED_TRIPLES =			true;
var PREFER_SPANS_OVER_DIVS =			true;
var PREFER_TITLE_OVER_TEXTNODE =		false;
var RESOURCE_ID_PREFIX =				'resource';

var SHOW_DEBUG_ALERTS_WHEN_SAVING =	false;
var SHOW_EXTENDED_DEBUG_INFORMATION =	false;

/*
 * Back end specific workarounds.
 */

var USE_ARESS_WORKAROUNDS =		true;

/*
 * Data management constants. Do not change these, as they are used
 * both internally and externally to communicate on events and to identify
 * command object actions in triple production and embedding rules.
 */

// Resource constants
var RESOURCE_CREATED =			0x01;
var RESOURCE_REMOVED =			0x02;
var RESOURCE_SAVED =				0x04;
var RESOURCE_RELOADED =			0x08;
var RESOURCE_SYNCHRONIZED = 		0x10;

// Triple constants
var TRIPLE_REMOVE =	0x01;
var TRIPLE_ADD =		0x02;
var TRIPLE_RELOAD =	0x04;
var TRIPLE_SAVE =		0x08;

var PROCESSDATA_REF = 'processdata';

// HTTP status code constants
//
//// 2xx
//const 200_OK =			'Ok';
//const 201_CREATED =		'Created';
//const 202_ACCEPTED =		'Accepted';
//const 204_NO_CONTENT =	'No Content';
//
//// 3xx
//const 301_MOVED_PERMANENTLY =	'Moved Permanently';
//const 302_MOVED_TEMPORARILY =	'Moved Temporarily';
//const 304_NOT_MODIFIED =		'Not Modified';
//
//// 4xx
//const 400_BAD_REQUEST =	'Bad Request';
//const 401_UNAUTHORIZED =	'Unauthorized';
//const 403_FORBIDDEN =		'Forbidden';
//const 404_NOT_FOUND =		'Not Found';
//const 409_CONFLICT =		'Conflict';
//
//// 5xx
//const 500_INTERNAL_SERVER_ERROR =		'Internal Server Error';
//const 501_NOT_IMPLEMENTED =			'Not Implemented';
//const 502_BAD_GATEWAY =				'Bad Gateway';
//const 503_SERVICE_UNAVAILABLE =		'Service Unavailable';
//
/**
 * The Data Management object. Use this one when interacting with page internal
 * data. Initialize data management by DataManager.init();
 * @class DataManager
 */
var DataManager = {
	
	/**
	 * The init method should be called once in the DataManagers lifetime.
	 * It causes the DataManager to initialize itself, the erdf parser, do all
	 * neccessary registrations and configurations, to run the parser and
	 * from then on deliver all resulting triples.
	 * No parameters needed are needed in a call to this method.
	 */
	init: function() {
		ERDF.init(DataManager._registerTriple);
		DataManager.__synclocal();
	},
	
	/**
	 * This triple array is meant to be the whole knowledge of the DataManager.
	 */
	_triples: [],
	
	/**
	 * This method is meant for callback from erdf parsing. It is not to be
	 * used in another way than to add triples to the triple store.
	 * @param {Object} triple the triple to add to the triple store.
	 */
	_registerTriple: function(triple) {
		DataManager._triples.push(triple)
	},
	
	/**
	 * The __synclocal method is for internal usage only.
	 * It performs synchronization with the local document, that is, the triple
	 * store is adjustet to the content of the document, which could have been
	 * changed by any other applications running on the same page.
	 */
	__synclocal: function() {
		DataManager._triples = [];
		ERDF.run();
	},
	
	/**
	 * Makes the shape passed into this method synchronize itself with the DOM.
	 * This method returns the shapes resource object for further manipulation.
	 * @param {Object} shape
	 */
	__synchronizeShape: function(shape) {

		var r = ResourceManager.getResource(shape.resourceId);
		var serialize = shape.serialize();

		// store all serialize values
		serialize.each( function(ser) {
			
			var resource = (ser.type == 'resource');
			var _triple = new ERDF.Triple(
				new ERDF.Resource(shape.resourceId),
				{prefix: ser.prefix, name: ser.name},
				resource ?
					new ERDF.Resource(ser.value) :
					new ERDF.Literal(ser.value)
			);
			DataManager.setObject(_triple);
		});
		
		return r;
	},

	__storeShape: function(shape) {
		
		// first synchronize the shape,
		var resource = DataManager.__synchronizeShape(shape);
		
		// then save the synchronized dom.
		resource.save();
	},
		
	__forceExistance: function(shape) {
		
		if(!$(shape.resourceId)) {
			
			if(!$$('.' + PROCESSDATA_REF)[0])
				DataManager.graft(XMLNS.XHTML,
					document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {'class': PROCESSDATA_REF, 'style':'display:none;'}]);
				
			// object is literal
			DataManager.graft(XMLNS.XHTML,
				$$('.' + PROCESSDATA_REF)[0], [
				
				'div', {
                    'id': shape.resourceId,
                    //This should be done in a more dynamic way!!!!!
                    'class': (shape instanceof ORYX.Core.Canvas) ? "-oryx-canvas" : undefined
                }
			]);
			
		} else {
			var resource = $(shape.resourceId)
			var children = $A(resource.childNodes)
			children.each( function(child) {
				resource.removeChild(child);
			});
		};
	},
	
	__persistShape: function(shape) {

		// a shape serialization.
		var shapeData = shape.serialize();
		
		// initialize a triple array and construct a shape resource
		// to be used in triple generation.
		var triplesArray = [];
		var shapeResource = new ERDF.Resource(shape.resourceId);

		// remove all triples for this particular shape's resource
		DataManager.removeTriples( DataManager.query(
			shapeResource, undefined, undefined));

		// for each data set in the shape's serialization
		shapeData.each( function(data) {

			// construct a triple's value
			var value = (data.type == 'resource') ?
				new ERDF.Resource(data.value) :
				new ERDF.Literal(data.value);

			// construct triple and add it to the DOM.
			DataManager.addTriple( new ERDF.Triple(
				shapeResource,
				{prefix: data.prefix, name: data.name},
				value
			));
		});
	},
	
	__persistDOM: function(facade) {

		// getChildShapes gets all shapes (nodes AND edges), deep flag
		// makes it return a flattened child hierarchy.
		
		var canvas = facade.getCanvas();
		var shapes = canvas.getChildShapes(true);
		var result = '';
		
		// persist all shapes.
		shapes.each( function(shape) {
			DataManager.__forceExistance(shape);
		});
		//DataManager.__synclocal();
		
		DataManager.__renderCanvas(facade);
		result += DataManager.serialize(
				$(ERDF.__stripHashes(facade.getCanvas().resourceId)), true);
				
		shapes.each( function(shape) {
			
			DataManager.__persistShape(shape);
			result += DataManager.serialize(
				$(ERDF.__stripHashes(shape.resourceId)), true);
		});
		
		//result += DataManager.__renderCanvas(facade);
		
		return result;
	},

	__renderCanvas: function(facade) {

		var canvas = facade.getCanvas();
		var stencilSets = facade.getStencilSets();
		var shapes = canvas.getChildShapes(true);
		
		DataManager.__forceExistance(canvas);
		
		DataManager.__persistShape(canvas);
		
		var shapeResource = new ERDF.Resource(canvas.resourceId);

		// remove all triples for this particular shape's resource
		DataManager.removeTriples( DataManager.query(
			shapeResource, undefined, undefined));

		DataManager.addTriple( new ERDF.Triple(
			shapeResource,
			{prefix: "oryx", name: "mode"},
			new ERDF.Literal("writable")
		));

		DataManager.addTriple( new ERDF.Triple(
			shapeResource,
			{prefix: "oryx", name: "mode"},
			new ERDF.Literal("fullscreen")
		));

		stencilSets.values().each(function(stencilset) {
			DataManager.addTriple( new ERDF.Triple(
				shapeResource,
				{prefix: "oryx", name: "stencilset"},
				new ERDF.Resource(stencilset.source().replace(/&/g, "%26"))
			));
			
			DataManager.addTriple( new ERDF.Triple(
				shapeResource,
				{prefix: "oryx", name: "ssnamespace"},
				new ERDF.Resource(stencilset.namespace())
			));
			
			stencilset.extensions().keys().each(function(extension) {
				DataManager.addTriple( new ERDF.Triple(
					shapeResource,
					{prefix: "oryx", name: "ssextension"},
					new ERDF.Literal(extension)
				));
			});
		});
						
		shapes.each(function(shape) {
			DataManager.addTriple( new ERDF.Triple(
				shapeResource,
				{prefix: "oryx", name: "render"},
				new ERDF.Resource("#" + shape.resourceId)
			));
		});
	},

	__counter: 0,
	__provideId: function() {
		
		while($(RESOURCE_ID_PREFIX+DataManager.__counter))
			DataManager.__counter++;
			
		return RESOURCE_ID_PREFIX+DataManager.__counter;
	},
		
	serializeDOM: function(facade) {
		
		return DataManager.__persistDOM(facade);
	},
	
	syncGlobal: function(facade) {
		
		return DataManager.__syncglobal(facade);
	},
	
	/**
	 * This method is used to synchronize local DOM with remote resources.
	 * Local changes are commited to the server, and remote changes are
	 * performed to the local document.
	 * @param {Object} facade The facade of the editor that holds certain
	 * resource representations as shapes.
	 */
	__syncglobal: function(facade) {

		// getChildShapes gets all shapes (nodes AND edges), deep flag
		// makes it return a flattened child hierarchy.
		
		var canvas = facade.getCanvas();
		var shapes = canvas.getChildShapes(true);

		// create dummy resource representations in the dom
		// for all shapes that were newly created.

		shapes.select( function(shape) {

			// select shapes without resource id.

			return !($(shape.resourceId));

		}).each( function(shape) {

			// create new resources for them.
			if(USE_ARESS_WORKAROUNDS) {
				
				/*
				 * This is a workaround due to a bug in aress. Resources are
				 * ignoring changes to raziel:type property once they are
				 * created. As long as this is not fixed, the resource is now
				 * being created using a randomly guessed id, this temporary id
				 * is then used in references and the appropriate div is being
				 * populated with properties.
				 * 
				 * AFTER THIS PHASE THE DATA IS INCONSISTENT AS REFERENCES POINT
				 * TO IDS THAT ARE UNKNOWN TO THE BACK END.
				 * 
				 * After the resource is actually created in aress, it gets an id
				 * that is persistent. All shapes are then being populated with the
				 * correct id references and stored on the server.
				 * 
				 * AFTER THE SAVE PROCESS HAS RETURNED, THE DATA IS CONSISTENT
				 * REGARDING THE ID REFERENCES AGAIN.
				 */
				
				var razielType = shape.properties['raziel-type'];
				
				var div = '<div xmlns="http://www.w3.org/1999/xhtml">' +
					'<span class="raziel-type">'+razielType+'</span></div>';

				var r = ResourceManager.__createResource(div);
				shape.resourceId = r.id();
				
			} else {
		
				var r = ResourceManager.__createResource();
				shape.resourceId = r.id();
			}

		});

		shapes.each( function(shape) {
			
			// store all shapes.
			DataManager.__storeShape(shape);
		});
	},
	
	/**
	 * This method serializes a single div into a string that satisfies the
	 * client/server communication protocol. It ingnores all elements that have
	 * an attribute named class that includes 'transient'.
	 * @param {Object} node the element to serialize.
	 * @param {Object} preserveNamespace whether to preserve the parent's
	 *                 namespace. If you are not sure about namespaces, provide
	 *                 just the element to be serialized.
	 */
	serialize: function(node, preserveNamespace) {

		if (node.nodeType == node.ELEMENT_NODE) {
			// serialize an element node.
			
			var children = $A(node.childNodes);
			var attributes = $A(node.attributes);
			var clazz = new String(node.getAttribute('class'));
			var ignore = clazz.split(' ').member('transient');

			// ignore transients.

			if(ignore)
				return '';

			// start serialization.
			
			var result = '<' + node.nodeName;
			
			// preserve namespace?
			if(!preserveNamespace) 
				result += ' xmlns="' + (node.namespaceURI ? node.namespaceURI : XMLNS.XHTML) + '" xmlns:oryx="http://oryx-editor.org"';
			
			// add all attributes.
			
			attributes.each(function(attribute) {
				result += ' ' + attribute.nodeName + '="' +
					attribute.nodeValue + '"';});
			
			// close if no children.
			
			if(children.length == 0)
				result += '/>';
				
			else {
				
				// serialize all children.
				
				result += '>';
				children.each(function(_node) {
					result += DataManager.serialize(_node, true)});
				result += '</' + node.nodeName + '>'
			}

			return result;
			
		} else if (node.nodeType == node.TEXT_NODE) {
			
			// serialize a text node.
			return  node.nodeValue;
		}
		
		//TODO serialize cdata areas also.
		//TODO work on namespace awareness.
	},

	addTriple: function(triple) {

		// assert the subject is a resource
		
		if(!triple.subject.type == ERDF.LITERAL)
			throw 'Cannot add the triple ' + triple.toString() +
				' because the subject is not a resource.'
		
		// get the element which represents this triple's subject.
		var elementId = ERDF.__stripHashes(triple.subject.value);
		var element = $(elementId);
				
		// assert the subject is inside this document.
		if(!element)
			throw 'Cannot add the triple ' + triple.toString() +
				' because the subject "'+elementId+'" is not in the document.';

		if(triple.object.type == ERDF.LITERAL)

			// object is literal
			DataManager.graft(XMLNS.XHTML, element, [
				'span', {'class': (triple.predicate.prefix + "-" +
					triple.predicate.name)}, triple.object.value.escapeHTML()
			]);
			
		else {

			// object is resource
			DataManager.graft(XMLNS.XHTML, element, [
				'a', {'rel': (triple.predicate.prefix + "-" +
					triple.predicate.name), 'href': triple.object.value}
			]);
			
		}

		return true;
	},
	
	removeTriples: function(triples) {

		// alert('Removing ' +triples.length+' triples.');

		// from all the triples select those ...
		var removed = triples.select(

			function(triple) {
				
				// TODO remove also from triple store.
				// ... that were actually removed.
				return DataManager.__removeTriple(triple);
			});
		
		// sync and return removed triples.
		// DataManager.__synclocal();
		return removed;
	},
	
	removeTriple: function(triple) {
		
		// remember whether the triple was actually removed.
		var result = DataManager.__removeTriple(triple);

		// sync and return removed triples.
		// DataManager.__synclocal();
		return result;
	},

	__removeTriple: function(triple) {
		
		// assert the subject is a resource
		if(!triple.subject.type == ERDF.LITERAL)
		
			throw 'Cannot remove the triple ' + triple.toString() +
				' because the subject is not a resource.';

		// get the element which represents this triple's subject.
		var elementId = ERDF.__stripHashes(triple.subject.value);
		var element = $(elementId);

		// assert the subject is inside this document.
		if(!element)
		
			throw 'Cannot remove the triple ' + triple.toString() +
				' because the subject is not in the document.';
	  
		if(triple.object.type == ERDF.LITERAL) {
	  
  			// continue searching actively for the triple.
			var result = DataManager.__removeTripleRecursively(triple, element);
			return result;
		}
	},

	__removeTripleRecursively: function(triple, continueFrom) {  

		// return when this node is not an element node.
		if(continueFrom.nodeType != continueFrom.ELEMENT_NODE)
			return false;
		
		var classes = new String(continueFrom.getAttribute('class'));
		var children = $A(continueFrom.childNodes);
		
		if(classes.include(triple.predicate.prefix + '-' + triple.predicate.name)) {
		  
			var content = continueFrom.textContent;
			if(	(triple.object.type == ERDF.LITERAL) &&
				(triple.object.value == content))

				continueFrom.parentNode.removeChild(continueFrom);
			
			return true;
		  
		} else {
		 
			children.each(function(_node) {
			DataManager.__removeTripleRecursively(triple, _node)});
			return false;
		}

	},

	/**
	 * graft() function
	 * Originally by Sean M. Burke from interglacial.com, altered for usage with
	 * SVG and namespace (xmlns) support. Be sure you understand xmlns before
	 * using this funtion, as it creates all grafted elements in the xmlns
	 * provided by you and all element's attribures in default xmlns. If you
	 * need to graft elements in a certain xmlns and wish to assign attributes
	 * in both that and another xmlns, you will need to do stepwise grafting,
	 * adding non-default attributes yourself or you'll have to enhance this
	 * function. Latter, I would appreciate: martin�apfelfabrik.de
	 * @param {Object} namespace The namespace in which
	 * 					elements should be grafted.
	 * @param {Object} parent The element that should contain the grafted
	 * 					structure after the function returned.
	 * @param {Object} t the crafting structure.
	 * @param {Object} doc the document in which grafting is performed.
	 */
	graft: function(namespace, parent, t, doc) {
		
	    doc = (doc || (parent && parent.ownerDocument) || document);
	    var e;
	    if(t === undefined) {
	        echo( "Can't graft an undefined value");
	    } else if(t.constructor == String) {
	        e = doc.createTextNode( t );
	    } else {
	        for(var i = 0; i < t.length; i++) {
	            if( i === 0 && t[i].constructor == String ) {
					var snared = t[i].match( /^([a-z][a-z0-9]*)\.([^\s\.]+)$/i );
	                if( snared ) {
	                    e = doc.createElementNS(namespace, snared[1]);
	                    e.setAttributeNS(null, 'class', snared[2] );
	                    continue;
	                }
	                snared = t[i].match( /^([a-z][a-z0-9]*)$/i );
	                if( snared ) {
	                    e = doc.createElementNS(namespace, snared[1]);  // but no class
	                    continue;
	                }
	
	                // Otherwise:
	                e = doc.createElementNS(namespace, "span");
	                e.setAttribute(null, "class", "namelessFromLOL" );
	            }
	
	            if( t[i] === undefined ) {
	                echo("Can't graft an undefined value in a list!");
	            } else if( t[i].constructor == String || t[i].constructor == Array) {
	                this.graft(namespace, e, t[i], doc );
	            } else if(  t[i].constructor == Number ) {
	                this.graft(namespace, e, t[i].toString(), doc );
	            } else if(  t[i].constructor == Object ) {
	                // hash's properties => element's attributes
	                for(var k in t[i]) { e.setAttributeNS(null, k, t[i][k] ); }
	            } else if(  t[i].constructor == Boolean ) {
	                this.graft(namespace, e, t[i] ? 'true' : 'false', doc );
				} else
					throw "Object " + t[i] + " is inscrutable as an graft arglet.";
	        }
	    }
		
		if(parent) parent.appendChild(e);
	
	    return Element.extend(e); // return the topmost created node
	},

	setObject: function(triple) {

		/**
		 * Erwartungen von Arvid an diese Funktion:
		 * - Es existiert genau ein triple mit dem Subjekt und Praedikat,
		 *   das uebergeben wurde, und dieses haelt uebergebenes Objekt.
		 */

		var triples = DataManager.query(
			triple.subject,
			triple.predicate,
			undefined
		);
		
		DataManager.removeTriples(triples);

		DataManager.addTriple(triple);

		return true;
	},
	
	query: function(subject, predicate, object) {

		/*
		 * Typical triple.
		 *	{value: subject, type: subjectType},
		 *	{prefix: schema.prefix, name: property},
		 *	{value: object, type: objectType});
		 */	
		 	
		return DataManager._triples.select(function(triple) {
			
			var select = ((subject) ?
				(triple.subject.type == subject.type) &&
				(triple.subject.value == subject.value) : true);
			if(predicate) {
				select = select && ((predicate.prefix) ?
					(triple.predicate.prefix == predicate.prefix) : true);
				select = select && ((predicate.name) ?
					(triple.predicate.name == predicate.name) : true);
			}
			select = select && ((object) ?
				(triple.object.type == object.type) &&
				(triple.object.value == object.value) : true);
			return select;
		});
	}
}

Kickstart.register(DataManager.init);

function assert(expr, m) { if(!expr) throw m; };

function DMCommand(action, triple) {
	
	// store action and triple.
	this.action = action;
	this.triple = triple;
	
	this.toString = function() {
		return 'Command('+action+', '+triple+')';
	};
}

function DMCommandHandler(nextHandler) {
	
	/**
	 * Private method to set the next handler in the Chain of Responsibility
	 * (see http://en.wikipedia.org/wiki/Chain-of-responsibility_pattern for
	 * details).
	 * @param {DMCommandHandler} handler The handler that is next in the chain.
	 */
	this.__setNext = function(handler) {
		var _next = this.__next;
		this.__next = nextHandler;
		return _next ? _next : true;
	};
	this.__setNext(nextHandler);

	/**
	 * Invokes the next handler. If there is no next handler, this method
	 * returns false, otherwise it forwards the result of the handling.
	 * @param {Object} command The command object to be processed.
	 */
	this.__invokeNext = function(command) {
		return this.__next ? this.__next.handle(command) : false;
	};
	
	/**
	 * Handles a command. The abstract method process() is called with the
	 * command object that has been passed. If the process method catches the
	 * command (returns true on completion), the handle() method returns true.
	 * If the process() method doesn't catch the command, the next handler will
	 * be invoked.
	 * @param {Object} command The command object to be processed.
	 */
	this.handle = function(command) {
		return this.process(command) ? true : this.__invokeNext(command);
	}
	
	/**
	 * Empty process() method returning false. If javascript knew abstract
	 * class members, this would be one.
	 * @param {Object} command The command object to process.
	 */
	this.process = function(command) { return false; };
};

/**
 * This Handler manages the addition and the removal of meta elements in the
 * head of the document.
 * @param {DMCommandHandler} next The handler that is next in the chain.
 */
function MetaTagHandler(next) {
	
	DMCommandHandler.apply(this, [next]);
	this.process = function(command) {
		
		with(command.triple) {
			
			/* assert prerequisites */
			if( !(
				(subject instanceof ERDF.Resource) &&
				(subject.isCurrentDocument()) &&
				(object instanceof ERDF.Literal)
			))	return false;
		}
		
	};
};

var chain =	new MetaTagHandler();
var command = new DMCommand(TRIPLE_ADD, new ERDF.Triple(
	new ERDF.Resource(''),
	'rdf:tool',
	new ERDF.Literal('')
));

/*
if(chain.handle(command))
	alert('Handled!');
*/

ResourceManager = {
	
	__corrupt: false,
	__latelyCreatedResource: undefined,
	__listeners: $H(),
	__token: 1,
	
	addListener: function(listener, mask) {

		if(!(listener instanceof Function))
			throw 'Resource event listener is not a function!';
		if(!(mask))
			throw 'Invalid mask for resource event listener registration.';

		// construct controller and token.
		var controller = {listener: listener, mask: mask};
		var token = ResourceManager.__token++;
		
		// add new listener.
		ResourceManager.__listeners[token] = controller;
		
		// return the token generated.
		return token;
	},
	
	removeListener: function(token) {
		
		// remove the listener with the token and return it.
		return ResourceManager.__listners.remove(token);
	},
	
	__Event: function(action, resourceId) {
		this.action = action;
		this.resourceId = resourceId;
	},
	
	__dispatchEvent: function(event) {
		
		// get all listeners. for each listener, ...
		ResourceManager.__listeners.values().each(function(controller) {
			
			// .. if listener subscribed to this type of event ...
			if(event.action & controller.mask)
				return controller.listener(event);
		});
	},

	getResource: function(id) {

		// get all possible resources for this.
		id = ERDF.__stripHashes(id);
		var resources = DataManager.query(
			new ERDF.Resource('#'+id),
			{prefix: 'raziel', name: 'entry'},
			undefined
		);

		// check for consistency.
		if((resources.length == 1) && (resources[0].object.isResource())) {
			var entryUrl = resources[0].object.value;
			return new ResourceManager.__Resource(id, entryUrl);
		}

		// else throw an error message.
		throw ('Resource with id ' +id+ ' not recognized as such. ' +
			((resources.length > 1) ?
				' There is more than one raziel:entry URL.' :
				' There is no raziel:entry URL.'));

		return false;
	},

	__createResource: function(alternativeDiv) {
		
		var collectionUrls = DataManager.query(
			new ERDF.Resource(''),
			// TODO This will become raziel:collection in near future.
			{prefix: 'raziel', name: 'collection'},
			undefined
		);

		// check for consistency.
		
		if(	(collectionUrls.length == 1) &&
			(collectionUrls[0].object.isResource())) {

			// get the collection url.
			
			var collectionUrl = collectionUrls[0].object.value;
			var resource = undefined;
			
			// if there is an old id, serialize the dummy div from there,
			// otherwise create a dummy div on the fly.
			
			var serialization = alternativeDiv? alternativeDiv : 
					'<div xmlns="http://www.w3.org/1999/xhtml"></div>';
					
			ResourceManager.__request(
				'POST', collectionUrl, serialization,

				// on success
				function() {
					
					// get div and id that have been generated by the server.
					
					var response = (this.responseXML);
					var div = response.childNodes[0];
					var id = div.getAttribute('id');
					
					// store div in DOM
					if(!$$('.' + PROCESSDATA_REF)[0])
						DataManager.graft(XMLNS.XHTML,
							document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {'class': PROCESSDATA_REF, 'style':'display:none;'}]);
				
					$$('.' + PROCESSDATA_REF)[0].appendChild(div.cloneNode(true));

					// parse local erdf data once more.
					
					DataManager.__synclocal();
					
					// get new resource object.

					resource = new ResourceManager.getResource(id);

					// set up an action informing of the creation.
					
					ResourceManager.__resourceActionSucceeded(
						this, RESOURCE_CREATED, undefined);
				},

				function() { ResourceManager.__resourceActionFailed(
					this, RESOURCE_CREATED, undefined);},
				false
			);
			
			return resource;
		}
		
		// else
		throw 'Could not create resource! raziel:collection URL is missing!';
		return false;

	},
	
	__Resource: function(id, url) {
		
		this.__id = id;
		this.__url = url;
		
		/*
		 * Process URL is no longer needed to refer to the shape element on the
		 * canvas. AReSS uses the id's to gather information on fireing
		 * behaviour now.
		 */
		
//		// find the process url.		
//		var processUrl = undefined;
//		
//		var urls = DataManager.query(
//			new ERDF.Resource('#'+this.__id),
//			{prefix: 'raziel', name: 'process'},
//			undefined
//		);
//		
//		if(urls.length == 0) { throw 'The resource with the id ' +id+ ' has no process url.'};
//		
//		urls.each( function(triple) {
//			
//			// if there are more urls, use the last one.
//			processUrl = triple.object.value;
//		});
//		
//		this.__processUrl = processUrl;
//
//		// convenience function for getting the process url.
//		this.processUrl = function() {
//			return this.__processUrl;
//		}


		// convenience finction for getting the id.
		this.id = function() {
			return this.__id;
		}

		// convenience finction for getting the entry url.
		this.url = function() {
			return this.__url;
		}
		
		this.reload = function() {
			var _url = this.__url;
			var _id = this.__id;
			ResourceManager.__request(
				'GET', _url, null,
				function() { ResourceManager.__resourceActionSucceeded(
					this, RESOURCE_RELOADED, _id); },
				function() { ResourceManager.__resourceActionFailed(
					this, RESURCE_RELOADED, _id); },
				USE_ASYNCHRONOUS_REQUESTS
			);
		};
		
		this.save = function(synchronize) {
			var _url = this.__url;
			var _id = this.__id;
			data = DataManager.serialize($(_id));
			ResourceManager.__request(
				'PUT', _url, data,
				function() { ResourceManager.__resourceActionSucceeded(
					this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE_SAVED, _id); },
				function() { ResourceManager.__resourceActionFailed(
					this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE.SAVED, _id); },
				USE_ASYNCHRONOUS_REQUESTS
			);
		};
		
		this.remove = function() {
			var _url = this.__url;
			var _id = this.__id;
			ResourceManager.__request(
				'DELETE', _url, null,
				function() { ResourceManager.__resourceActionSucceeded(
					this, RESOURCE_REMOVED, _id); },
				function() { ResourceManager.__resourceActionFailed(
					this, RESOURCE_REMOVED, _id);},
				USE_ASYNCHRONOUS_REQUESTS
			);
		};
	},

	request: function(url, requestOptions) {

		var options = {
			method:       'get',
			asynchronous: true,
			parameters:   {}
		};

		Object.extend(options, requestOptions || {});
 		
		var params = Hash.toQueryString(options.parameters);
		if (params) 
			url += (url.include('?') ? '&' : '?') + params;
   
		return ResourceManager.__request(
			options.method, 
			url, 
			options.data, 
			(options.onSuccess instanceof Function ? function() { options.onSuccess(this); } : undefined ), 
			(options.onFailure instanceof Function ? function() { options.onFailure(this); } : undefined ), 
			options.asynchronous && USE_ASYNCHRONOUS_REQUESTS,
			options.headers);
	},
	
	__request: function(method, url, data, success, error, async, headers) {
		
		// get a request object
		var httpRequest = Try.these(

			/* do the Mozilla/Safari/Opera stuff */
			function() { return new XMLHttpRequest(); },
			
			/* do the IE stuff */
			function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
			function() { return new ActiveXObject("Microsoft.XMLHTTP") }
		);

		// if there is no request object ...
        if (!httpRequest) {
			if(!this.__corrupt)
				throw 'This browser does not provide any AJAX functionality. You will not be able to use the software provided with the page you are viewing. Please consider installing appropriate extensions.';
			this.__corrupt = true;
			return false;
        }
		
		if(success instanceof Function)
			httpRequest.onload = success;
		if(error instanceof Function) {
			httpRequest.onerror = error;
		}
		
		var h = $H(headers)
		h.keys().each(function(key) {
			
			httpRequest.setRequestHeader(key, h[key]);
		}); 
		
		try {

			if(SHOW_DEBUG_ALERTS_WHEN_SAVING)
			
				alert(method + ' ' + url + '\n' +
					SHOW_EXTENDED_DEBUG_INFORMATION ? data : '');

			// TODO Remove synchronous calls to the server as soon as xenodot
			// handles asynchronous requests without failure.
	        httpRequest.open(method, url, !async?false:true);
	        httpRequest.send(data);
			
		} catch(e) {
			return false;
		}
		return true;
    },

	__resourceActionSucceeded: function(transport, action, id) {
		
		var status = transport.status;
		var response = transport.responseText;
		
		if(SHOW_DEBUG_ALERTS_WHEN_SAVING)

			alert(status + ' ' + url + '\n' +
				SHOW_EXTENDED_DEBUG_INFORMATION ? data : '');

		// if the status code is not in 2xx, throw an error.
		if(status >= 300)
			throw 'The server responded with an error: ' + status + '\n' + (SHOW_EXTENDED_DEBUG_INFORMATION ? + data : 'If you need additional information here, including the data sent by the server, consider setting SHOW_EXTENDED_DEBUG_INFORMATION to true.');

		switch(action) {
			
			case RESOURCE_REMOVED:

				// get div and id
				var response = (transport.responseXML);
				var div = response.childNodes[0];
				var id = div.getAttribute('id');
				
				// remove the resource from DOM
				var localDiv = document.getElementById(id);
				localDiv.parentNode.removeChild(localDiv);
				break;

			case RESOURCE_CREATED:

				// nothing remains to be done.
				break;
	
			case RESOURCE_SAVED | RESOURCE_SYNCHRONIZED:

				DataManager.__synclocal();

			case RESOURCE_SAVED:

				// nothing remains to be done.
				break;

			case RESOURCE_RELOADED:
			
				// get div and id
				var response = (transport.responseXML);
				var div = response.childNodes[0];
				var id = div.getAttribute('id');
				
				// remove the local resource representation from DOM
				var localDiv = document.getElementById(id)
				localDiv.parentNode.removeChild(localDiv);
				
				// store div in DOM
				if(!$$(PROCESSDATA_REF)[0])
					DataManager.graft(XMLNS.XHTML,
						document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {'class': PROCESSDATA_REF, 'style':'display:none;'}]);
				
				$$(PROCESSDATA_REF)[0].appendChild(div.cloneNode(true));
				DataManager.__synclocal();
				break;

			default:
				DataManager.__synclocal();

		}
		 
		// dispatch to all listeners ...
		ResourceManager.__dispatchEvent(

			// ... an event describing the change that happened here.
			new ResourceManager.__Event(action, id)
		);
	},

	__resourceActionFailed: function(transport, action, id) {
		throw "Fatal: Resource action failed. There is something horribly " +
			"wrong with either the server, the transport protocol or your " +
			"online status. Sure you're online?";
	}
}/**
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

/**
 * The super class for all classes in ORYX. Adds some OOP feeling to javascript.
 * See article "Object Oriented Super Class Method Calling with JavaScript" on
 * http://truecode.blogspot.com/2006/08/object-oriented-super-class-method.html
 * for a documentation on this. Fairly good article that points out errors in
 * Douglas Crockford's inheritance and super method calling approach.
 * Worth reading.
 * @class Clazz
 */
var Clazz = function() {};

/**
 * Empty constructor.
 * @methodOf Clazz.prototype
 */
Clazz.prototype.construct = function() {};

/**
 * Can be used to build up inheritances of classes.
 * @example
 * var MyClass = Clazz.extend({
 *   construct: function(myParam){
 *     // Do sth.
 *   }
 * });
 * var MySubClass = MyClass.extend({
 *   construct: function(myParam){
 *     // Use this to call constructor of super class
 *     arguments.callee.$.construct.apply(this, arguments);
 *     // Do sth.
 *   }
 * });
 * @param {Object} def The definition of the new class.
 */
Clazz.extend = function(def) {
    var classDef = function() {
        if (arguments[0] !== Clazz) { this.construct.apply(this, arguments); }
    };
    
    var proto = new this(Clazz);
    var superClass = this.prototype;
    
    for (var n in def) {
        var item = def[n];                        
        if (item instanceof Function) item.$ = superClass;
        proto[n] = item;
    }

    classDef.prototype = proto;
    
    //Give this new class the same static extend method    
    classDef.extend = this.extend;        
    return classDef;
};/**
 * @author martin.czuchra
 */
if(!ORYX) var ORYX = {};

if(!ORYX.CONFIG) ORYX.CONFIG = {};

//This is usually the name of the war file!
ORYX.CONFIG.ROOT_PATH =					"/oryx/";
ORYX.CONFIG.WEB_URL = "http://oryx-project.org";
	
ORYX.CONFIG.VERSION_URL =				ORYX.CONFIG.ROOT_PATH + "VERSION";
ORYX.CONFIG.LICENSE_URL =				ORYX.CONFIG.ROOT_PATH + "LICENSE";

ORYX.CONFIG.SERVER_HANDLER_ROOT = 		"";

ORYX.CONFIG.STENCILSET_HANDLER = 		ORYX.CONFIG.SERVER_HANDLER_ROOT + "";
    
	/* Editor-Mode */
ORYX.CONFIG.MODE_READONLY =				"readonly";
ORYX.CONFIG.MODE_FULLSCREEN =			"fullscreen";
	
		
	/* Show grid line while dragging */
ORYX.CONFIG.SHOW_GRIDLINE = true;
ORYX.CONFIG.DISABLE_GRADIENT = true;

	/* Plugins */
ORYX.CONFIG.PLUGINS_ENABLED =			true;
ORYX.CONFIG.PLUGINS_CONFIG =			ORYX.CONFIG.ROOT_PATH + "plugins.xml";
ORYX.CONFIG.PROFILE_PATH =				ORYX.CONFIG.ROOT_PATH + "profiles/";
ORYX.CONFIG.PLUGINS_FOLDER =			"Plugins/";
ORYX.CONFIG.PDF_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pdf";
ORYX.CONFIG.PNML_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pnml";
ORYX.CONFIG.SIMPLE_PNML_EXPORT_URL =	ORYX.CONFIG.ROOT_PATH + "simplepnmlexporter";
ORYX.CONFIG.DESYNCHRONIZABILITY_URL =	ORYX.CONFIG.ROOT_PATH + "desynchronizability";
ORYX.CONFIG.IBPMN2BPMN_URL =			ORYX.CONFIG.ROOT_PATH + "ibpmn2bpmn";
ORYX.CONFIG.BPMN2YAWL_URL =				ORYX.CONFIG.ROOT_PATH + "bpmn2yawl";
ORYX.CONFIG.QUERYEVAL_URL =             ORYX.CONFIG.ROOT_PATH + "query";
ORYX.CONFIG.QUERYVARIANTEVAL_URL =      ORYX.CONFIG.ROOT_PATH + "queryvarianteval";
ORYX.CONFIG.SYNTAXCHECKER_URL =			ORYX.CONFIG.ROOT_PATH + "syntaxchecker";
ORYX.CONFIG.VALIDATOR_URL =				ORYX.CONFIG.ROOT_PATH + "validator";
ORYX.CONFIG.AUTO_LAYOUTER_URL =			ORYX.CONFIG.ROOT_PATH + "layouter";
ORYX.CONFIG.SS_EXTENSIONS_FOLDER =		ORYX.CONFIG.ROOT_PATH + "stencilsets/extensions/";
ORYX.CONFIG.SS_EXTENSIONS_CONFIG =		ORYX.CONFIG.ROOT_PATH + "stencilsets/extensions/extensions.json";	
ORYX.CONFIG.ORYX_NEW_URL =				"/new";	
ORYX.CONFIG.STEP_THROUGH =				ORYX.CONFIG.ROOT_PATH + "stepthrough";
ORYX.CONFIG.STEP_THROUGH_CHECKER =		ORYX.CONFIG.ROOT_PATH + "stepthroughchecker";
ORYX.CONFIG.XFORMS_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsexport";
ORYX.CONFIG.XFORMS_EXPORT_ORBEON_URL =	ORYX.CONFIG.ROOT_PATH + "xformsexport-orbeon";
ORYX.CONFIG.XFORMS_IMPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsimport";
ORYX.CONFIG.BPEL_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "bpelexporter";
ORYX.CONFIG.BPEL4CHOR_EXPORT_URL =		ORYX.CONFIG.ROOT_PATH + "bpel4chorexporter";
ORYX.CONFIG.BPEL4CHOR2BPEL_EXPORT_URL =	ORYX.CONFIG.ROOT_PATH + "bpel4chor2bpelexporter";
ORYX.CONFIG.TREEGRAPH_SUPPORT =			ORYX.CONFIG.ROOT_PATH + "treegraphsupport";
ORYX.CONFIG.XPDL4CHOR2BPEL4CHOR_TRANSFORMATION_URL = ORYX.CONFIG.ROOT_PATH + "xpdl4chor2bpel4chor";
ORYX.CONFIG.RESOURCE_LIST =				ORYX.CONFIG.ROOT_PATH + "resourceList";
ORYX.CONFIG.BPMN_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "bpmnlayouter";
ORYX.CONFIG.EPC_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "epclayouter";
ORYX.CONFIG.BPMN2MIGRATION =			ORYX.CONFIG.ROOT_PATH + "bpmn2migration";
ORYX.CONFIG.BPMN20_SCHEMA_VALIDATION_ON = true;
//Backend plugin for the fragmentRepository client plugin.
ORYX.CONFIG.BPMN20_COMPLIANCE_TEMPLATE_SAT_SOLVER = ORYX.CONFIG.ROOT_PATH + "satSolver";
ORYX.CONFIG.JPDLIMPORTURL =				ORYX.CONFIG.ROOT_PATH + "jpdlimporter";
ORYX.CONFIG.JPDLEXPORTURL =				ORYX.CONFIG.ROOT_PATH + "jpdlexporter";
ORYX.CONFIG.CPNTOOLSEXPORTER = 			ORYX.CONFIG.ROOT_PATH + "cpntoolsexporter";
ORYX.CONFIG.CPNTOOLSIMPORTER = 			ORYX.CONFIG.ROOT_PATH + "cpntoolsimporter";
ORYX.CONFIG.BPMN2XPDLPATH =				ORYX.CONFIG.ROOT_PATH + "bpmn2xpdl";
ORYX.CONFIG.VISIOIMPORT =               ORYX.CONFIG.ROOT_PATH + "visioimport";


	/* Namespaces */
ORYX.CONFIG.NAMESPACE_ORYX =			"http://www.b3mn.org/oryx";
ORYX.CONFIG.NAMESPACE_SVG =				"http://www.w3.org/2000/svg";

	/* UI */
ORYX.CONFIG.CANVAS_WIDTH =				1485; 
ORYX.CONFIG.CANVAS_HEIGHT =				1050;
ORYX.CONFIG.CANVAS_RESIZE_INTERVAL =	300;
ORYX.CONFIG.SELECTED_AREA_PADDING =		4;
ORYX.CONFIG.CANVAS_BACKGROUND_COLOR =	"none";
ORYX.CONFIG.GRID_DISTANCE =				30;
ORYX.CONFIG.GRID_ENABLED =				true;
ORYX.CONFIG.ZOOM_OFFSET =				0.1;
ORYX.CONFIG.DEFAULT_SHAPE_MARGIN =		60;
ORYX.CONFIG.SCALERS_SIZE =				7;
ORYX.CONFIG.MINIMUM_SIZE =				20;
ORYX.CONFIG.MAXIMUM_SIZE =				10000;
ORYX.CONFIG.OFFSET_MAGNET =				15;
ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP =		14;
ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM =	12;
ORYX.CONFIG.OFFSET_EDGE_BOUNDS =		5;
ORYX.CONFIG.COPY_MOVE_OFFSET =			30;
ORYX.CONFIG.SHOW_GRIDLINE =             true;

ORYX.CONFIG.BORDER_OFFSET =				14;

ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP	=	13;

ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER = 30;
ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET = 45;

	/* Shape-Menu Align */
ORYX.CONFIG.SHAPEMENU_RIGHT =			"Oryx_Right";
ORYX.CONFIG.SHAPEMENU_BOTTOM =			"Oryx_Bottom";
ORYX.CONFIG.SHAPEMENU_LEFT =			"Oryx_Left";
ORYX.CONFIG.SHAPEMENU_TOP =				"Oryx_Top";

	/* Morph-Menu Item */
ORYX.CONFIG.MORPHITEM_DISABLED =		"Oryx_MorphItem_disabled";

	/* Property type names */
ORYX.CONFIG.TYPE_STRING =				"string";
ORYX.CONFIG.TYPE_BOOLEAN =				"boolean";
ORYX.CONFIG.TYPE_INTEGER =				"integer";
ORYX.CONFIG.TYPE_FLOAT =				"float";
ORYX.CONFIG.TYPE_COLOR =				"color";
ORYX.CONFIG.TYPE_DATE =					"date";
ORYX.CONFIG.TYPE_CHOICE =				"choice";
ORYX.CONFIG.TYPE_URL =					"url";
ORYX.CONFIG.TYPE_DIAGRAM_LINK =			"diagramlink";
ORYX.CONFIG.TYPE_COMPLEX =				"complex";
ORYX.CONFIG.TYPE_TEXT =					"text";
	
	/* Vertical line distance of multiline labels */
ORYX.CONFIG.LABEL_LINE_DISTANCE =		2;
ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT =	12;

ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER = true;

	/* Editor constants come here */
ORYX.CONFIG.EDITOR_ALIGN_BOTTOM =		0x01;
ORYX.CONFIG.EDITOR_ALIGN_MIDDLE =		0x02;
ORYX.CONFIG.EDITOR_ALIGN_TOP =			0x04;
ORYX.CONFIG.EDITOR_ALIGN_LEFT =			0x08;
ORYX.CONFIG.EDITOR_ALIGN_CENTER =		0x10;
ORYX.CONFIG.EDITOR_ALIGN_RIGHT =		0x20;
ORYX.CONFIG.EDITOR_ALIGN_SIZE =			0x30;

	/* Event types */
ORYX.CONFIG.EVENT_MOUSEDOWN =			"mousedown";
ORYX.CONFIG.EVENT_MOUSEUP =				"mouseup";
ORYX.CONFIG.EVENT_MOUSEOVER =			"mouseover";
ORYX.CONFIG.EVENT_MOUSEOUT =			"mouseout";
ORYX.CONFIG.EVENT_MOUSEMOVE =			"mousemove";
ORYX.CONFIG.EVENT_DBLCLICK =			"dblclick";
ORYX.CONFIG.EVENT_KEYDOWN =				"keydown";
ORYX.CONFIG.EVENT_KEYUP =				"keyup";

ORYX.CONFIG.EVENT_LOADED =				"editorloaded";
	
ORYX.CONFIG.EVENT_EXECUTE_COMMANDS =		"executeCommands";
ORYX.CONFIG.EVENT_STENCIL_SET_LOADED =		"stencilSetLoaded";
ORYX.CONFIG.EVENT_SELECTION_CHANGED =		"selectionchanged";
ORYX.CONFIG.EVENT_SHAPEADDED =				"shapeadded";
ORYX.CONFIG.EVENT_PROPERTY_CHANGED =		"propertyChanged";
ORYX.CONFIG.EVENT_DRAGDROP_START =			"dragdrop.start";
ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE =		"shape.menu.close";
ORYX.CONFIG.EVENT_DRAGDROP_END =			"dragdrop.end";
ORYX.CONFIG.EVENT_RESIZE_START =			"resize.start";
ORYX.CONFIG.EVENT_RESIZE_END =				"resize.end";
ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED =		"dragDocker.docked";
ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW =			"highlight.showHighlight";
ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE =			"highlight.hideHighlight";
ORYX.CONFIG.EVENT_LOADING_ENABLE =			"loading.enable";
ORYX.CONFIG.EVENT_LOADING_DISABLE =			"loading.disable";
ORYX.CONFIG.EVENT_LOADING_STATUS =			"loading.status";
ORYX.CONFIG.EVENT_OVERLAY_SHOW =			"overlay.show";
ORYX.CONFIG.EVENT_OVERLAY_HIDE =			"overlay.hide";
ORYX.CONFIG.EVENT_ARRANGEMENT_TOP =			"arrangement.setToTop";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACK =		"arrangement.setToBack";
ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD =		"arrangement.setForward";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD =	"arrangement.setBackward";
ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED =	"propertyWindow.propertyChanged";
ORYX.CONFIG.EVENT_LAYOUT_ROWS =				"layout.rows";
ORYX.CONFIG.EVENT_LAYOUT_BPEL =				"layout.BPEL";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_VERTICAL =    "layout.BPEL.vertical";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_HORIZONTAL =  "layout.BPEL.horizontal";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_SINGLECHILD = "layout.BPEL.singlechild";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_AUTORESIZE =	"layout.BPEL.autoresize";
ORYX.CONFIG.EVENT_AUTOLAYOUT_LAYOUT =		"autolayout.layout";
ORYX.CONFIG.EVENT_UNDO_EXECUTE =			"undo.execute";
ORYX.CONFIG.EVENT_UNDO_ROLLBACK =			"undo.rollback";
ORYX.CONFIG.EVENT_BUTTON_UPDATE =           "toolbar.button.update";
ORYX.CONFIG.EVENT_LAYOUT = 					"layout.dolayout";
ORYX.CONFIG.EVENT_COLOR_CHANGE = 			"color.change";
ORYX.CONFIG.EVENT_DOCKERDRAG = 				"dragTheDocker";	
ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW =		"propertywindow.show";
ORYX.CONFIG.EVENT_SHAPE_MORPHED =			"shapemorphed";
ORYX.CONFIG.EVENT_WINDOW_FOCUS =            "window.focus";  // raised by plugin toolbar.js
ORYX.CONFIG.EVENT_TBPM_BACKGROUND_UPDATE =	"tbpm.background";
ORYX.CONFIG.EVENT_MODEL_SAVED =				"model.saved";
ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE = "register.label.template";
	
	/* Selection Shapes Highlights */
ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE =				5;
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR =				"#4444FF";
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR2 =			"#9999FF";
	
ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_CORNER = 		"corner";
ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE = 	"rectangle";
	
ORYX.CONFIG.SELECTION_VALID_COLOR =					"#00FF00";
ORYX.CONFIG.SELECTION_INVALID_COLOR =				"#FF0000";


ORYX.CONFIG.DOCKER_DOCKED_COLOR =		"#00FF00";
ORYX.CONFIG.DOCKER_UNDOCKED_COLOR =		"#FF0000";
ORYX.CONFIG.DOCKER_SNAP_OFFSET =		10;
		
	/* Copy & Paste */
ORYX.CONFIG.EDIT_OFFSET_PASTE =			10;

	/* Key-Codes */
ORYX.CONFIG.KEY_CODE_X = 				88;
ORYX.CONFIG.KEY_CODE_C = 				67;
ORYX.CONFIG.KEY_CODE_V = 				86;
ORYX.CONFIG.KEY_CODE_DELETE = 			46;
ORYX.CONFIG.KEY_CODE_META =				224;
ORYX.CONFIG.KEY_CODE_BACKSPACE =		8;
ORYX.CONFIG.KEY_CODE_LEFT =				37;
ORYX.CONFIG.KEY_CODE_RIGHT =			39;
ORYX.CONFIG.KEY_CODE_UP =				38;
ORYX.CONFIG.KEY_CODE_DOWN =				40;

	// TODO Determine where the lowercase constants are still used and remove them from here.
ORYX.CONFIG.KEY_Code_enter =			12;
ORYX.CONFIG.KEY_Code_left =				37;
ORYX.CONFIG.KEY_Code_right =			39;
ORYX.CONFIG.KEY_Code_top =				38;
ORYX.CONFIG.KEY_Code_bottom =			40;

/* Supported Meta Keys */
	
ORYX.CONFIG.META_KEY_META_CTRL = 		"metactrl";
ORYX.CONFIG.META_KEY_ALT = 				"alt";
ORYX.CONFIG.META_KEY_SHIFT = 			"shift";

/* Key Actions */

ORYX.CONFIG.KEY_ACTION_DOWN = 			"down";
ORYX.CONFIG.KEY_ACTION_UP = 			"up";

/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/function printf() {		var result = arguments[0];	for (var i=1; i<arguments.length; i++)		result = result.replace('%' + (i-1), arguments[i]);	return result;}// oryx constants.var ORYX_LOGLEVEL_TRACE = 5;var ORYX_LOGLEVEL_DEBUG = 4;var ORYX_LOGLEVEL_INFO = 3;var ORYX_LOGLEVEL_WARN = 2;var ORYX_LOGLEVEL_ERROR = 1;var ORYX_LOGLEVEL_FATAL = 0;var ORYX_LOGLEVEL = 1;var ORYX_CONFIGURATION_DELAY = 100;var ORYX_CONFIGURATION_WAIT_ATTEMPTS = 10;if(!ORYX) var ORYX = {};ORYX = Object.extend(ORYX, {	//set the path in the config.js file!!!!	PATH: ORYX.CONFIG.ROOT_PATH,	//CONFIGURATION: "config.js",	URLS: [			/*		 * No longer needed, since compiled into one source file that		 * contains all of this files concatenated in the exact order		 * as defined in build.xml.		 */		/*		"scripts/Core/SVG/editpathhandler.js",		"scripts/Core/SVG/minmaxpathhandler.js",		"scripts/Core/SVG/pointspathhandler.js",		"scripts/Core/SVG/svgmarker.js",		"scripts/Core/SVG/svgshape.js",		"scripts/Core/SVG/label.js",		"scripts/Core/Math/math.js",				"scripts/Core/StencilSet/stencil.js",		"scripts/Core/StencilSet/property.js",		"scripts/Core/StencilSet/propertyitem.js",		"scripts/Core/StencilSet/rules.js",		"scripts/Core/StencilSet/stencilset.js",		"scripts/Core/StencilSet/stencilsets.js",		"scripts/Core/bounds.js",		"scripts/Core/uiobject.js",		"scripts/Core/abstractshape.js",		"scripts/Core/canvas.js",		"scripts/Core/main.js",		"scripts/Core/svgDrag.js",		"scripts/Core/shape.js",		"scripts/Core/Controls/control.js",		"scripts/Core/Controls/docker.js",		"scripts/Core/Controls/magnet.js",				"scripts/Core/node.js",		"scripts/Core/edge.js"*/	],	alreadyLoaded: [],	configrationRetries: 0,	Version: '0.1.1',	availablePlugins: [],	/**	 * The ORYX.Log logger.	 */	Log: {				__appenders: [			{				// Firebug console log appender, 				// will only react if window.console is present				append: function(level, args) {										//			messageParts[0] = (new Date()).getTime() + " "					//				+ prefix + " " + messageParts[0];					//			var message = printf.apply(null, args);										if (window.console) {						switch(level) {							case 'TRACE': 	                            args.unshift("[TRACE|" + (new Date()).getTime()+"]"); 								// missing break is intentional							case 'DEBUG':								window.console.debug.apply(window.console, args); 								break;							case 'INFO':								window.console.info.apply(window.console, args); 							break;							case 'WARN':								window.console.warn.apply(window.console, args); 								break;							case 'FATAL':								args.unshift("[FATAL]"); 								// missing break is intentional							case 'ERROR':								window.console.error.apply(window.console, args); 								break;							default:								args.unshift("["+level.toUpperCase()+"]");								window.console.log.apply(window.console, args); 						}						}				}			}		],			trace: function() {	if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_TRACE)			ORYX.Log.__log('TRACE', arguments); },		debug: function() { if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_DEBUG)			ORYX.Log.__log('DEBUG', arguments); },		info: function() { if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_INFO)			ORYX.Log.__log('INFO', arguments); },		warn: function() { if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_WARN)			ORYX.Log.__log('WARN', arguments); },		error: function() { if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_ERROR)			ORYX.Log.__log('ERROR', arguments); },		fatal: function() { if(ORYX_LOGLEVEL >= ORYX_LOGLEVEL_FATAL)			ORYX.Log.__log('FATAL', arguments); },				__log: function(prefix, args) {						ORYX.Log.__appenders.each(function(appender) {				appender.append(prefix, $A(args));			});		},				addAppender: function(appender) {			ORYX.Log.__appenders.push(appender);		}	},	/**	 * First bootstrapping layer. The Oryx loading procedure begins. In this	 * step, all preliminaries that are not in the responsibility of Oryx to be	 * met have to be checked here, such as the existance of the prototpe	 * library in the current execution environment. After that, the second	 * bootstrapping layer is being invoked. Failing to ensure that any	 * preliminary condition is not met has to fail with an error.	 */	load: function() {		var waitingpanel = new Ext.Window({renderTo:Ext.getBody(),id:'oryx-loading-panel',bodyStyle:'padding: 8px;background:white',title:ORYX.I18N.Oryx.title,width:'auto',height:'auto',modal:true,resizable:false,closable:false,html:'<span style="font-size:11px;">' + ORYX.I18N.Oryx.pleaseWait + '</span>'})		waitingpanel.show()						ORYX.Log.debug("Oryx begins loading procedure.");				// check for prototype		if( (typeof Prototype=='undefined') ||			(typeof Element == 'undefined') ||			(typeof Element.Methods=='undefined') ||			parseFloat(Prototype.Version.split(".")[0] + "." +				Prototype.Version.split(".")[1]) < 1.5)			throw("Application requires the Prototype JavaScript framework >= 1.5.3");				ORYX.Log.debug("Prototype > 1.5 found.");		// continue loading.		ORYX._load();	},	/**	 * Second bootstrapping layer. The oryx configuration is checked. When not	 * yet loaded, config.js is being requested from the server. A repeated	 * error in retrieving the configuration will result in an error to be	 * thrown after a certain time of retries. Once the configuration is there,	 * all urls that are registered with oryx loading are being requested from	 * the server. Once everything is loaded, the third layer is being invoked.	 */	_load: function() {	/*		// if configuration not there already,		if(!(ORYX.CONFIG)) {						// if this is the first attempt...			if(ORYX.configrationRetries == 0) {								// get the path and filename.				var configuration = ORYX.PATH + ORYX.CONFIGURATION;					ORYX.Log.debug("Configuration not found, loading from '%0'.",					configuration);								// require configuration file.				Kickstart.require(configuration);							// else if attempts exceeded ...			} else if(ORYX.configrationRetries >= ORYX_CONFIGURATION_WAIT_ATTEMPTS) {								throw "Tried to get configuration" +					ORYX_CONFIGURATION_WAIT_ATTEMPTS +					" times from '" + configuration + "'. Giving up."								} else if(ORYX.configrationRetries > 0){								// point out how many attempts are left...				ORYX.Log.debug("Waiting once more (%0 attempts left)",					(ORYX_CONFIGURATION_WAIT_ATTEMPTS -						ORYX.configrationRetries));			}						// any case: continue in a moment with increased retry count.			ORYX.configrationRetries++;			window.setTimeout(ORYX._load, ORYX_CONFIGURATION_DELAY);			return;		}				ORYX.Log.info("Configuration loaded.");				// load necessary scripts.		ORYX.URLS.each(function(url) {			ORYX.Log.debug("Requireing '%0'", url);			Kickstart.require(ORYX.PATH + url) });	*/		// configurate logging and load plugins.		ORYX.loadPlugins();	},	/**	 * Third bootstrapping layer. This is where first the plugin coniguration	 * file is loaded into oryx, analyzed, and where all plugins are being	 * requested by the server. Afterwards, all editor instances will be	 * initialized.	 */	loadPlugins: function() {				// load plugins if enabled.		if(ORYX.CONFIG.PLUGINS_ENABLED)			ORYX._loadPlugins()		else			ORYX.Log.warn("Ignoring plugins, loading Core only.");		// init the editor instances.		init();	},		_loadPlugins: function() {		// load plugin configuration file.		var source = ORYX.CONFIG.PLUGINS_CONFIG;		ORYX.Log.debug("Loading plugin configuration from '%0'.", source);			new Ajax.Request(source, {			asynchronous: false,			method: 'get',			onSuccess: function(result) {				/*				 * This is the method that is being called when the plugin				 * configuration was successfully loaded from the server. The				 * file has to be processed and the contents need to be				 * considered for further plugin requireation.				 */								ORYX.Log.info("Plugin configuration file loaded.");						// get plugins.xml content				var resultXml = result.responseXML;								// TODO: Describe how properties are handled.				// Get the globale Properties				var globalProperties = [];				var preferences = $A(resultXml.getElementsByTagName("properties"));				preferences.each( function(p) {					var props = $A(p.childNodes);					props.each( function(prop) {						var property = new Hash(); 												// get all attributes from the node and set to global properties						var attributes = $A(prop.attributes)						attributes.each(function(attr){property[attr.nodeName] = attr.nodeValue});										if(attributes.length > 0) { globalProperties.push(property) };									});				});								// TODO Why are we using XML if we don't respect structure anyway?				// for each plugin element in the configuration..				var plugin = resultXml.getElementsByTagName("plugin");				$A(plugin).each( function(node) {										// get all element's attributes.					// TODO: What about: var pluginData = $H(node.attributes) !?					var pluginData = new Hash();					$A(node.attributes).each( function(attr){						pluginData[attr.nodeName] = attr.nodeValue});														// ensure there's a name attribute.					if(!pluginData['name']) {						ORYX.Log.error("A plugin is not providing a name. Ingnoring this plugin.");						return;					}					// ensure there's a source attribute.					if(!pluginData['source']) {						ORYX.Log.error("Plugin with name '%0' doesn't provide a source attribute.", pluginData['name']);						return;					}										// Get all private Properties					var propertyNodes = node.getElementsByTagName("property");					var properties = [];					$A(propertyNodes).each(function(prop) {						var property = new Hash(); 												// Get all Attributes from the Node									var attributes = $A(prop.attributes)						attributes.each(function(attr){property[attr.nodeName] = attr.nodeValue});										if(attributes.length > 0) { properties.push(property) };											});										// Set all Global-Properties to the Properties					properties = properties.concat(globalProperties);										// Set Properties to Plugin-Data					pluginData['properties'] = properties;										// Get the RequieredNodes					var requireNodes = node.getElementsByTagName("requires");					var requires;					$A(requireNodes).each(function(req) {									var namespace = $A(req.attributes).find(function(attr){ return attr.name == "namespace"})						if( namespace && namespace.nodeValue ){							if( !requires ){								requires = {namespaces:[]}							}													requires.namespaces.push(namespace.nodeValue)						} 					});															// Set Requires to the Plugin-Data, if there is one					if( requires ){						pluginData['requires'] = requires;					}					// Get the RequieredNodes					var notUsesInNodes = node.getElementsByTagName("notUsesIn");					var notUsesIn;					$A(notUsesInNodes).each(function(not) {									var namespace = $A(not.attributes).find(function(attr){ return attr.name == "namespace"})						if( namespace && namespace.nodeValue ){							if( !notUsesIn ){								notUsesIn = {namespaces:[]}							}													notUsesIn.namespaces.push(namespace.nodeValue)						} 					});															// Set Requires to the Plugin-Data, if there is one					if( notUsesIn ){						pluginData['notUsesIn'] = notUsesIn;					}																				var url = ORYX.PATH + ORYX.CONFIG.PLUGINS_FOLDER + pluginData['source'];							ORYX.Log.debug("Requireing '%0'", url);							// Add the Script-Tag to the Site					//Kickstart.require(url);							ORYX.Log.info("Plugin '%0' successfully loaded.", pluginData['name']);							// Add the Plugin-Data to all available Plugins					ORYX.availablePlugins.push(pluginData);						});					},			onFailure:this._loadPluginsOnFails		});	},	_loadPluginsOnFails: function(result) {		ORYX.Log.error("Plugin configuration file not available.");	}});ORYX.Log.debug('Registering Oryx with Kickstart');Kickstart.register(ORYX.load);/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}


/**
 * EditPathHandler
 * 
 * Edit SVG paths' coordinates according to specified from-to movement and
 * horizontal and vertical scaling factors. 
 * The resulting path's d attribute is stored in instance variable d.
 * 
 * @constructor
 */
ORYX.Core.SVG.EditPathHandler = Clazz.extend({
	
	construct: function() {
		arguments.callee.$.construct.apply(this, arguments);
		
		this.x = 0;
		this.y = 0;
		this.oldX = 0;
		this.oldY = 0;
		this.deltaWidth = 1;
		this.deltaHeight = 1;
		
		this.d = "";
	},
	
	/**
	 * init
	 * 
	 * @param {float} x Target point's x-coordinate
	 * @param {float} y Target point's y-coordinate
	 * @param {float} oldX Reference point's x-coordinate
	 * @param {float} oldY Reference point's y-coordinate
	 * @param {float} deltaWidth Horizontal scaling factor
	 * @param {float} deltaHeight Vertical scaling factor
	 */
	init: function(x, y, oldX, oldY, deltaWidth, deltaHeight) {
		this.x = x;
		this.y = y;
		this.oldX = oldX;
		this.oldY = oldY;
		this.deltaWidth = deltaWidth;
		this.deltaHeight = deltaHeight;
		
		this.d = "";
	},

	/**
	 * editPointsAbs
	 * 
	 * @param {Array} points Array of absolutePoints
	 */
	editPointsAbs: function(points) {
		if(points instanceof Array) {
			var newPoints = [];
			var x, y;
			for(var i = 0; i < points.length; i++) {
				x = (parseFloat(points[i]) - this.oldX)*this.deltaWidth + this.x;
				i++;
				y = (parseFloat(points[i]) - this.oldY)*this.deltaHeight + this.y;
				newPoints.push(x);
				newPoints.push(y);
			}
			
			return newPoints;
		} else {
			//TODO error
		}
	},
	
	/**
	 * editPointsRel
	 * 
	 * @param {Array} points Array of absolutePoints
	 */
	editPointsRel: function(points) {
		if(points instanceof Array) {
			var newPoints = [];
			var x, y;
			for(var i = 0; i < points.length; i++) {
				x = parseFloat(points[i])*this.deltaWidth;
				i++;
				y = parseFloat(points[i])*this.deltaHeight;
				newPoints.push(x);
				newPoints.push(y);
			}
			
			return newPoints;
		} else {
			//TODO error
		}
	},

	/**
	 * arcAbs - A
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcAbs: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
	    var pointsAbs = this.editPointsAbs([x, y]);
		var pointsRel = this.editPointsRel([rx, ry]);
		
		this.d = this.d.concat(" A" + pointsRel[0] + " " + pointsRel[1] + 
								" " + xAxisRotation + " " + largeArcFlag + 
								" " + sweepFlag + " " + pointsAbs[0] + " " +
								pointsAbs[1] + " ");					
	},

	/**
	 * arcRel - a
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcRel: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
		var pointsRel = this.editPointsRel([rx, ry, x, y]);
		
		this.d = this.d.concat(" a" + pointsRel[0] + " " + pointsRel[1] + 
								" " + xAxisRotation + " " + largeArcFlag + 
								" " + sweepFlag + " " + pointsRel[2] + " " +
								pointsRel[3] + " ");	
	},

	/**
	 * curvetoCubicAbs - C
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicAbs: function(x1, y1, x2, y2, x, y) {
	    var pointsAbs = this.editPointsAbs([x1, y1, x2, y2, x, y]);
		
		this.d = this.d.concat(" C" + pointsAbs[0] + " " + pointsAbs[1] + 
								" " + pointsAbs[2] + " " + pointsAbs[3] + 
								" " + pointsAbs[4] + " " + pointsAbs[5] + " ");	
	},

	/**
	 * curvetoCubicRel - c
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicRel: function(x1, y1, x2, y2, x, y) {
	    var pointsRel = this.editPointsRel([x1, y1, x2, y2, x, y]);
		
		this.d = this.d.concat(" c" + pointsRel[0] + " " + pointsRel[1] + 
								" " + pointsRel[2] + " " + pointsRel[3] + 
								" " + pointsRel[4] + " " + pointsRel[5] + " ");	
	},

	/**
	 * linetoHorizontalAbs - H
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalAbs: function(x) {
	    var pointsAbs = this.editPointsAbs([x, 0]);
		
		this.d = this.d.concat(" H" + pointsAbs[0] + " ");	
	},

	/**
	 * linetoHorizontalRel - h
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalRel: function(x) {
	    var pointsRel = this.editPointsRel([x, 0]);
		
		this.d = this.d.concat(" h" + pointsRel[0] + " ");	
	},

	/**
	 * linetoAbs - L
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoAbs: function(x, y) {
	    var pointsAbs = this.editPointsAbs([x, y]);
		
		this.d = this.d.concat(" L" + pointsAbs[0] + " " + pointsAbs[1] + " ");
	},

	/**
	 * linetoRel - l
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoRel: function(x, y) {
	    var pointsRel = this.editPointsRel([x, y]);
		
		this.d = this.d.concat(" l" + pointsRel[0] + " " + pointsRel[1] + " ");
	},

	/**
	 * movetoAbs - M
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoAbs: function(x, y) {
	    var pointsAbs = this.editPointsAbs([x, y]);
		
		this.d = this.d.concat(" M" + pointsAbs[0] + " " + pointsAbs[1] + " ");
	},

	/**
	 * movetoRel - m
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoRel: function(x, y) {
	    var pointsRel;
		if(this.d === "") {
			pointsRel = this.editPointsAbs([x, y]);
		} else {
			pointsRel = this.editPointsRel([x, y]);
		}
		
		this.d = this.d.concat(" m" + pointsRel[0] + " " + pointsRel[1] + " ");
	},

	/**
	 * curvetoQuadraticAbs - Q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticAbs: function(x1, y1, x, y) {
	    var pointsAbs = this.editPointsAbs([x1, y1, x, y]);
		
		this.d = this.d.concat(" Q" + pointsAbs[0] + " " + pointsAbs[1] + " " +
								pointsAbs[2] + " " + pointsAbs[3] + " ");
	},

	/**
	 * curvetoQuadraticRel - q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticRel: function(x1, y1, x, y) {
	    var pointsRel = this.editPointsRel([x1, y1, x, y]);
		
		this.d = this.d.concat(" q" + pointsRel[0] + " " + pointsRel[1] + " " +
								pointsRel[2] + " " + pointsRel[3] + " ");
	},

	/**
	 * curvetoCubicSmoothAbs - S
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothAbs: function(x2, y2, x, y) {
	    var pointsAbs = this.editPointsAbs([x2, y2, x, y]);
		
		this.d = this.d.concat(" S" + pointsAbs[0] + " " + pointsAbs[1] + " " +
								pointsAbs[2] + " " + pointsAbs[3] + " ");
	},

	/**
	 * curvetoCubicSmoothRel - s
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothRel: function(x2, y2, x, y) {
	    var pointsRel = this.editPointsRel([x2, y2, x, y]);
		
		this.d = this.d.concat(" s" + pointsRel[0] + " " + pointsRel[1] + " " +
								pointsRel[2] + " " + pointsRel[3] + " ");
	},

	/**
	 * curvetoQuadraticSmoothAbs - T
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothAbs: function(x, y) {
	    var pointsAbs = this.editPointsAbs([x, y]);
		
		this.d = this.d.concat(" T" + pointsAbs[0] + " " + pointsAbs[1] + " ");
	},

	/**
	 * curvetoQuadraticSmoothRel - t
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothRel: function(x, y) {
	    var pointsRel = this.editPointsRel([x, y]);
		
		this.d = this.d.concat(" t" + pointsRel[0] + " " + pointsRel[1] + " ");
	},

	/**
	 * linetoVerticalAbs - V
	 * 
	 * @param {Number} y
	 */
	linetoVerticalAbs: function(y) {
	    var pointsAbs = this.editPointsAbs([0, y]);
		
		this.d = this.d.concat(" V" + pointsAbs[1] + " ");
	},

	/**
	 * linetoVerticalRel - v
	 * 
	 * @param {Number} y
	 */
	linetoVerticalRel: function(y) {
	    var pointsRel = this.editPointsRel([0, y]);
		
		this.d = this.d.concat(" v" + pointsRel[1] + " ");
	},

	/**
	 * closePath - z or Z
	 */
	closePath: function() {
	    this.d = this.d.concat(" z");
	}

});/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}


/**
 * MinMaxPathHandler
 * 
 * Determine the minimum and maximum of a SVG path's absolute coordinates.
 * For relative coordinates the absolute value is computed for consideration.
 * The values are stored in attributes minX, minY, maxX, and maxY.
 * 
 * @constructor
 */
ORYX.Core.SVG.MinMaxPathHandler = Clazz.extend({
	
	construct: function() {
		arguments.callee.$.construct.apply(this, arguments);
		
		this.minX = undefined;
		this.minY = undefined;
		this.maxX = undefined;
		this.maxY = undefined;
		
		this._lastAbsX = undefined;
		this._lastAbsY = undefined;
	},

	/**
	 * Store minimal and maximal coordinates of passed points to attributes minX, maxX, minY, maxY
	 * 
	 * @param {Array} points Array of absolutePoints
	 */
	calculateMinMax: function(points) {
		if(points instanceof Array) {
			var x, y;
			for(var i = 0; i < points.length; i++) {
				x = parseFloat(points[i]);
				i++;
				y = parseFloat(points[i]);
				
				this.minX = (this.minX !== undefined) ? Math.min(this.minX, x) : x;
				this.maxX = (this.maxX !== undefined) ? Math.max(this.maxX, x) : x;
				this.minY = (this.minY !== undefined) ? Math.min(this.minY, y) : y;
				this.maxY = (this.maxY !== undefined) ? Math.max(this.maxY, y) : y;
					
				this._lastAbsX = x;
				this._lastAbsY = y;
			}
		} else {
			//TODO error
		}
	},

	/**
	 * arcAbs - A
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcAbs: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
	    this.calculateMinMax([x, y]);
	},

	/**
	 * arcRel - a
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcRel: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
	    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoCubicAbs - C
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicAbs: function(x1, y1, x2, y2, x, y) {
	    this.calculateMinMax([x1, y1, x2, y2, x, y]);
	},

	/**
	 * curvetoCubicRel - c
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicRel: function(x1, y1, x2, y2, x, y) {
	    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1,
							  this._lastAbsX + x2, this._lastAbsY + y2,
							  this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * linetoHorizontalAbs - H
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalAbs: function(x) {
	    this.calculateMinMax([x, this._lastAbsY]);
	},

	/**
	 * linetoHorizontalRel - h
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalRel: function(x) {
	    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY]);
	},

	/**
	 * linetoAbs - L
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoAbs: function(x, y) {
	    this.calculateMinMax([x, y]);
	},

	/**
	 * linetoRel - l
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoRel: function(x, y) {
	    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * movetoAbs - M
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoAbs: function(x, y) {
	    this.calculateMinMax([x, y]);
	},

	/**
	 * movetoRel - m
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoRel: function(x, y) {
	    if(this._lastAbsX && this._lastAbsY) {
			this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
		} else {
			this.calculateMinMax([x, y]);
		}
	},

	/**
	 * curvetoQuadraticAbs - Q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticAbs: function(x1, y1, x, y) {
	    this.calculateMinMax([x1, y1, x, y]);
	},

	/**
	 * curvetoQuadraticRel - q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticRel: function(x1, y1, x, y) {
	    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1, this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoCubicSmoothAbs - S
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothAbs: function(x2, y2, x, y) {
	    this.calculateMinMax([x2, y2, x, y]);
	},

	/**
	 * curvetoCubicSmoothRel - s
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothRel: function(x2, y2, x, y) {
	    this.calculateMinMax([this._lastAbsX + x2, this._lastAbsY + y2, this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoQuadraticSmoothAbs - T
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothAbs: function(x, y) {
	    this.calculateMinMax([x, y]);
	},

	/**
	 * curvetoQuadraticSmoothRel - t
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothRel: function(x, y) {
	    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * linetoVerticalAbs - V
	 * 
	 * @param {Number} y
	 */
	linetoVerticalAbs: function(y) {
	    this.calculateMinMax([this._lastAbsX, y]);
	},

	/**
	 * linetoVerticalRel - v
	 * 
	 * @param {Number} y
	 */
	linetoVerticalRel: function(y) {
	    this.calculateMinMax([this._lastAbsX, this._lastAbsY + y]);
	},

	/**
	 * closePath - z or Z
	 */
	closePath: function() {
	    return;// do nothing
	}

});/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}


/**
 * PathHandler
 * 
 * Determine absolute points of a SVG path. The coordinates are stored 
 * sequentially in the attribute points (x-coordinates at even indices,
 * y-coordinates at odd indices).
 * 
 * @constructor
 */
ORYX.Core.SVG.PointsPathHandler = Clazz.extend({
	
	construct: function() {
		arguments.callee.$.construct.apply(this, arguments);
		
		this.points = [];
		
		this._lastAbsX = undefined;
		this._lastAbsY = undefined;
	},

	/**
	 * addPoints
	 * 
	 * @param {Array} points Array of absolutePoints
	 */
	addPoints: function(points) {
		if(points instanceof Array) {
			var x, y;
			for(var i = 0; i < points.length; i++) {
				x = parseFloat(points[i]);
				i++;
				y = parseFloat(points[i]);
				
				this.points.push(x);
				this.points.push(y);
				//this.points.push({x:x, y:y});
					
				this._lastAbsX = x;
				this._lastAbsY = y;
			}
		} else {
			//TODO error
		}
	},

	/**
	 * arcAbs - A
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcAbs: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * arcRel - a
	 * 
	 * @param {Number} rx
	 * @param {Number} ry
	 * @param {Number} xAxisRotation
	 * @param {Boolean} largeArcFlag
	 * @param {Boolean} sweepFlag
	 * @param {Number} x
	 * @param {Number} y
	 */
	arcRel: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoCubicAbs - C
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicAbs: function(x1, y1, x2, y2, x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * curvetoCubicRel - c
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicRel: function(x1, y1, x2, y2, x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * linetoHorizontalAbs - H
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalAbs: function(x) {
	    this.addPoints([x, this._lastAbsY]);
	},

	/**
	 * linetoHorizontalRel - h
	 * 
	 * @param {Number} x
	 */
	linetoHorizontalRel: function(x) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY]);
	},

	/**
	 * linetoAbs - L
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoAbs: function(x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * linetoRel - l
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	linetoRel: function(x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * movetoAbs - M
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoAbs: function(x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * movetoRel - m
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	movetoRel: function(x, y) {
	    if(this._lastAbsX && this._lastAbsY) {
			this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
		} else {
			this.addPoints([x, y]);
		}
	},

	/**
	 * curvetoQuadraticAbs - Q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticAbs: function(x1, y1, x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * curvetoQuadraticRel - q
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticRel: function(x1, y1, x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoCubicSmoothAbs - S
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothAbs: function(x2, y2, x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * curvetoCubicSmoothRel - s
	 * 
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoCubicSmoothRel: function(x2, y2, x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * curvetoQuadraticSmoothAbs - T
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothAbs: function(x, y) {
	    this.addPoints([x, y]);
	},

	/**
	 * curvetoQuadraticSmoothRel - t
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 */
	curvetoQuadraticSmoothRel: function(x, y) {
	    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
	},

	/**
	 * linetoVerticalAbs - V
	 * 
	 * @param {Number} y
	 */
	linetoVerticalAbs: function(y) {
	    this.addPoints([this._lastAbsX, y]);
	},

	/**
	 * linetoVerticalRel - v
	 * 
	 * @param {Number} y
	 */
	linetoVerticalRel: function(y) {
	    this.addPoints([this._lastAbsX, this._lastAbsY + y]);
	},

	/**
	 * closePath - z or Z
	 */
	closePath: function() {
	    return;// do nothing
	}

});/**
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

/**
 *
 * Config variables
 */
NAMESPACE_ORYX = "http://www.b3mn.org/oryx";
NAMESPACE_SVG = "http://www.w3.org/2000/svg/";

/**
 * @classDescription This class wraps the manipulation of a SVG marker.
 * @namespace ORYX.Core.SVG
 * uses Inheritance (Clazz)
 * uses Prototype 1.5.0
 *
 */

/**
 * Init package
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}

ORYX.Core.SVG.SVGMarker = Clazz.extend({

	/**
	 * Constructor
	 * @param markerElement {SVGMarkerElement}
	 */
	construct: function(markerElement) {
		arguments.callee.$.construct.apply(this, arguments);

		this.id = undefined;
		this.element = markerElement;
		this.refX = undefined;
		this.refY = undefined;
		this.markerWidth = undefined;
		this.markerHeight = undefined;
		this.oldRefX = undefined;
		this.oldRefY = undefined;
		this.oldMarkerWidth = undefined;
		this.oldMarkerHeight = undefined;
		this.optional = false;
		this.enabled = true;
		this.minimumLength = undefined;
		this.resize = false;

		this.svgShapes = [];

		this._init(); //initialisation of all the properties declared above.
	},

	/**
	 * Initializes the values that are defined in the constructor.
	 */
	_init: function() {
		//check if this.element is a SVGMarkerElement
		if(!( this.element == "[object SVGMarkerElement]")) {
			throw "SVGMarker: Argument is not an instance of SVGMarkerElement.";
		}

		this.id = this.element.getAttributeNS(null, "id");
		
		//init svg marker attributes
		var refXValue = this.element.getAttributeNS(null, "refX");
		if(refXValue) {
			this.refX = parseFloat(refXValue);
		} else {
			this.refX = 0;
		}
		var refYValue = this.element.getAttributeNS(null, "refY");
		if(refYValue) {
			this.refY = parseFloat(refYValue);
		} else {
			this.refY = 0;
		}
		var markerWidthValue = this.element.getAttributeNS(null, "markerWidth");
		if(markerWidthValue) {
			this.markerWidth = parseFloat(markerWidthValue);
		} else {
			this.markerWidth = 3;
		}
		var markerHeightValue = this.element.getAttributeNS(null, "markerHeight");
		if(markerHeightValue) {
			this.markerHeight = parseFloat(markerHeightValue);
		} else {
			this.markerHeight = 3;
		}

		this.oldRefX = this.refX;
		this.oldRefY = this.refY;
		this.oldMarkerWidth = this.markerWidth;
		this.oldMarkerHeight = this.markerHeight;

		//init oryx attributes
		var optionalAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "optional");
		if(optionalAttr) {
			optionalAttr = optionalAttr.strip();
			this.optional = (optionalAttr.toLowerCase() === "yes");
		} else {
			this.optional = false;
		}

		var enabledAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "enabled");
		if(enabledAttr) {
			enabledAttr = enabledAttr.strip();
			this.enabled = !(enabledAttr.toLowerCase() === "no");
		} else {
			this.enabled = true;
		}

		var minLengthAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "minimumLength");
		if(minLengthAttr) {
			this.minimumLength = parseFloat(minLengthAttr);
		}

		var resizeAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resize");
		if(resizeAttr) {
			resizeAttr = resizeAttr.strip();
			this.resize = (resizeAttr.toLowerCase() === "yes");
		} else {
			this.resize = false;
		}

		//init SVGShape objects
		//this.svgShapes = this._getSVGShapes(this.element);
	},

	/**
	 *
	 */
	_getSVGShapes: function(svgElement) {
		if(svgElement.hasChildNodes) {
			var svgShapes = [];
			var me = this;
			$A(svgElement.childNodes).each(function(svgChild) {
				try {
					var svgShape = new ORYX.Core.SVG.SVGShape(svgChild);
					svgShapes.push(svgShape);
				} catch (e) {
					svgShapes = svgShapes.concat(me._getSVGShapes(svgChild));
				}
			});
			return svgShapes;
		}
	},

	/**
	 * Writes the changed values into the SVG marker.
	 */
	update: function() {
		//TODO mache marker resizebar!!! aber erst wenn der rest der connectingshape funzt!

//		//update marker attributes
//		if(this.refX != this.oldRefX) {
//			this.element.setAttributeNS(null, "refX", this.refX);
//		}
//		if(this.refY != this.oldRefY) {
//			this.element.setAttributeNS(null, "refY", this.refY);
//		}
//		if(this.markerWidth != this.oldMarkerWidth) {
//			this.element.setAttributeNS(null, "markerWidth", this.markerWidth);
//		}
//		if(this.markerHeight != this.oldMarkerHeight) {
//			this.element.setAttributeNS(null, "markerHeight", this.markerHeight);
//		}
//
//		//update SVGShape objects
//		var widthDelta = this.markerWidth / this.oldMarkerWidth;
//		var heightDelta = this.markerHeight / this.oldMarkerHeight;
//		if(widthDelta != 1 && heightDelta != 1) {
//			this.svgShapes.each(function(svgShape) {
//
//			});
//		}

		//update old values to prepare the next update
		this.oldRefX = this.refX;
		this.oldRefY = this.refY;
		this.oldMarkerWidth = this.markerWidth;
		this.oldMarkerHeight = this.markerHeight;
	},
	
	toString: function() { return (this.element) ? "SVGMarker " + this.element.id : "SVGMarker " + this.element;}
 });/**
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

/**
 *
 * Config variables
 */
NAMESPACE_ORYX = "http://www.b3mn.org/oryx";
NAMESPACE_SVG = "http://www.w3.org/2000/svg/";

/**
 * @classDescription This class wraps the manipulation of a SVG basic shape or a path.
 * @namespace ORYX.Core.SVG
 * uses Inheritance (Clazz)
 * uses Prototype 1.5.0
 * uses PathParser by Kevin Lindsey (http://kevlindev.com/)
 * uses MinMaxPathHandler
 * uses EditPathHandler
 *
 */

//init package
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}

ORYX.Core.SVG.SVGShape = Clazz.extend({

	/**
	 * Constructor
	 * @param svgElem {SVGElement} An SVGElement that is a basic shape or a path.
	 */
	construct: function(svgElem) {
		arguments.callee.$.construct.apply(this, arguments);

		this.type;
		this.element = svgElem;
		this.x = undefined;
		this.y = undefined;
		this.width = undefined;
		this.height = undefined;
		this.oldX = undefined;
		this.oldY = undefined;
		this.oldWidth = undefined;
		this.oldHeight = undefined;
		this.radiusX = undefined;
		this.radiusY = undefined;
		this.isHorizontallyResizable = false;
		this.isVerticallyResizable = false;
		//this.anchors = [];
		this.anchorLeft = false;
		this.anchorRight = false;
		this.anchorTop = false;
		this.anchorBottom = false;
		
		//attributes of path elements of edge objects
		this.allowDockers = true;
		this.resizeMarkerMid = false;

		this.editPathParser;
		this.editPathHandler;

		this.init(); //initialisation of all the properties declared above.
	},

	/**
	 * Initializes the values that are defined in the constructor.
	 */
	init: function() {

		/**initialize position and size*/
		if(ORYX.Editor.checkClassType(this.element, SVGRectElement) || ORYX.Editor.checkClassType(this.element, SVGImageElement)) {
			this.type = "Rect";
			
			var xAttr = this.element.getAttributeNS(null, "x");
			if(xAttr) {
				this.oldX = parseFloat(xAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var yAttr = this.element.getAttributeNS(null, "y");
			if(yAttr) {
				this.oldY = parseFloat(yAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var widthAttr = this.element.getAttributeNS(null, "width");
			if(widthAttr) {
				this.oldWidth = parseFloat(widthAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var heightAttr = this.element.getAttributeNS(null, "height");
			if(heightAttr) {
				this.oldHeight = parseFloat(heightAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}

		} else if(ORYX.Editor.checkClassType(this.element, SVGCircleElement)) {
			this.type = "Circle";
			
			var cx = undefined;
			var cy = undefined;
			//var r = undefined;

			var cxAttr = this.element.getAttributeNS(null, "cx");
			if(cxAttr) {
				cx = parseFloat(cxAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var cyAttr = this.element.getAttributeNS(null, "cy");
			if(cyAttr) {
				cy = parseFloat(cyAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var rAttr = this.element.getAttributeNS(null, "r");
			if(rAttr) {
				//r = parseFloat(rAttr);
				this.radiusX = parseFloat(rAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			this.oldX = cx - this.radiusX;
			this.oldY = cy - this.radiusX;
			this.oldWidth = 2*this.radiusX;
			this.oldHeight = 2*this.radiusX;

		} else if(ORYX.Editor.checkClassType(this.element, SVGEllipseElement)) {
			this.type = "Ellipse";
			
			var cx = undefined;
			var cy = undefined;
			//var rx = undefined;
			//var ry = undefined;
			var cxAttr = this.element.getAttributeNS(null, "cx");
			if(cxAttr) {
				cx = parseFloat(cxAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var cyAttr = this.element.getAttributeNS(null, "cy");
			if(cyAttr) {
				cy = parseFloat(cyAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var rxAttr = this.element.getAttributeNS(null, "rx");
			if(rxAttr) {
				this.radiusX = parseFloat(rxAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var ryAttr = this.element.getAttributeNS(null, "ry");
			if(ryAttr) {
				this.radiusY = parseFloat(ryAttr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			this.oldX = cx - this.radiusX;
			this.oldY = cy - this.radiusY;
			this.oldWidth = 2*this.radiusX;
			this.oldHeight = 2*this.radiusY;

		} else if(ORYX.Editor.checkClassType(this.element, SVGLineElement)) {
			this.type = "Line";
			
			var x1 = undefined;
			var y1 = undefined;
			var x2 = undefined;
			var y2 = undefined;
			var x1Attr = this.element.getAttributeNS(null, "x1");
			if(x1Attr) {
				x1 = parseFloat(x1Attr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var y1Attr = this.element.getAttributeNS(null, "y1");
			if(y1Attr) {
				y1 = parseFloat(y1Attr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var x2Attr = this.element.getAttributeNS(null, "x2");
			if(x2Attr) {
				x2 = parseFloat(x2Attr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			var y2Attr = this.element.getAttributeNS(null, "y2");
			if(y2Attr) {
				y2 = parseFloat(y2Attr);
			} else {
				throw "Missing attribute in element " + this.element;
			}
			this.oldX = Math.min(x1,x2);
			this.oldY = Math.min(y1,y2);
			this.oldWidth = Math.abs(x1-x2);
			this.oldHeight = Math.abs(y1-y2);

		} else if(ORYX.Editor.checkClassType(this.element, SVGPolylineElement) || ORYX.Editor.checkClassType(this.element, SVGPolygonElement)) {
			this.type = "Polyline";
			
			var points = this.element.getAttributeNS(null, "points");

			if(points) {
				points = points.replace(/,/g , " ");
				var pointsArray = points.split(" ");
				pointsArray = pointsArray.without("");

				if(pointsArray && pointsArray.length && pointsArray.length > 1) {
					var minX = parseFloat(pointsArray[0]);
					var minY = parseFloat(pointsArray[1]);
					var maxX = parseFloat(pointsArray[0]);
					var maxY = parseFloat(pointsArray[1]);

					for(var i = 0; i < pointsArray.length; i++) {
						minX = Math.min(minX, parseFloat(pointsArray[i]));
						maxX = Math.max(maxX, parseFloat(pointsArray[i]));
						i++;
						minY = Math.min(minY, parseFloat(pointsArray[i]));
						maxY = Math.max(maxY, parseFloat(pointsArray[i]));
					}

					this.oldX = minX;
					this.oldY = minY;
					this.oldWidth = maxX-minX;
					this.oldHeight = maxY-minY;
				} else {
					throw "Missing attribute in element " + this.element;
				}
			} else {
				throw "Missing attribute in element " + this.element;
			}

		} else if(ORYX.Editor.checkClassType(this.element, SVGPathElement)) {
			this.type = "Path";
			
			this.editPathParser = new PathParser();
			this.editPathHandler = new ORYX.Core.SVG.EditPathHandler();
			this.editPathParser.setHandler(this.editPathHandler);
		
			var parser = new PathParser();
			var handler = new ORYX.Core.SVG.MinMaxPathHandler();
			parser.setHandler(handler);
			parser.parsePath(this.element);

			this.oldX = handler.minX;
			this.oldY = handler.minY;
			this.oldWidth = handler.maxX - handler.minX;
			this.oldHeight = handler.maxY - handler.minY;

			delete parser;
			delete handler;
		} else {
			throw "Element is not a shape.";
		}

		/** initialize attributes of oryx namespace */
		//resize
		var resizeAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resize");
		if(resizeAttr) {
			resizeAttr = resizeAttr.toLowerCase();
			if(resizeAttr.match(/horizontal/)) {
				this.isHorizontallyResizable = true;
			} else {
				this.isHorizontallyResizable = false;
			}
			if(resizeAttr.match(/vertical/)) {
				this.isVerticallyResizable = true;
			} else {
				this.isVerticallyResizable = false;
			}
		} else {
			this.isHorizontallyResizable = false;
			this.isVerticallyResizable = false;
		}

		//anchors
		var anchorAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "anchors");
		if(anchorAttr) {
			anchorAttr = anchorAttr.replace("/,/g", " ");
			var anchors = anchorAttr.split(" ").without("");
			
			for(var i = 0; i < anchors.length; i++) {
				switch(anchors[i].toLowerCase()) {
					case "left":
						this.anchorLeft = true;
						break;
					case "right":
						this.anchorRight = true;
						break;
					case "top":
						this.anchorTop = true;
						break;
					case "bottom":
						this.anchorBottom = true;
						break;
				}
			}
		}
		
		//allowDockers and resizeMarkerMid
		if(ORYX.Editor.checkClassType(this.element, SVGPathElement)) {
			var allowDockersAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "allowDockers"); 
			if(allowDockersAttr) {
				if(allowDockersAttr.toLowerCase() === "no") {
					this.allowDockers = false; 
				} else {
					this.allowDockers = true;
				}
			}
			
			var resizeMarkerMidAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resizeMarker-mid"); 
			if(resizeMarkerMidAttr) {
				if(resizeMarkerMidAttr.toLowerCase() === "yes") {
					this.resizeMarkerMid = true; 
				} else {
					this.resizeMarkerMid = false;
				}
			}
		}	
			
		this.x = this.oldX;
		this.y = this.oldY;
		this.width = this.oldWidth;
		this.height = this.oldHeight;
	},

	/**
	 * Writes the changed values into the SVG element.
	 */
	update: function() {
		
		if(this.x !== this.oldX || this.y !== this.oldY || this.width !== this.oldWidth || this.height !== this.oldHeight) {
			switch(this.type) {
				case "Rect":
					if(this.x !== this.oldX) this.element.setAttributeNS(null, "x", this.x);
					if(this.y !== this.oldY) this.element.setAttributeNS(null, "y", this.y);
				 	if(this.width !== this.oldWidth) this.element.setAttributeNS(null, "width", this.width);
					if(this.height !== this.oldHeight) this.element.setAttributeNS(null, "height", this.height);
					break;
				case "Circle":
					//calculate the radius
					//var r;
//					if(this.width/this.oldWidth <= this.height/this.oldHeight) {
//						this.radiusX = ((this.width > this.height) ? this.width : this.height)/2.0;
//					} else {
					 	this.radiusX = ((this.width < this.height) ? this.width : this.height)/2.0;
					//}
	
					this.element.setAttributeNS(null, "cx", this.x + this.width/2.0);
					this.element.setAttributeNS(null, "cy", this.y + this.height/2.0);
					this.element.setAttributeNS(null, "r", this.radiusX);
					break;
				case "Ellipse":
					this.radiusX = this.width/2;
					this.radiusY = this.height/2;
	
					this.element.setAttributeNS(null, "cx", this.x + this.radiusX);
					this.element.setAttributeNS(null, "cy", this.y + this.radiusY);
					this.element.setAttributeNS(null, "rx", this.radiusX);
					this.element.setAttributeNS(null, "ry", this.radiusY);
					break;
				case "Line":
					if(this.x !== this.oldX)
						this.element.setAttributeNS(null, "x1", this.x);
						
					if(this.y !== this.oldY)
						this.element.setAttributeNS(null, "y1", this.y);
						
					if(this.x !== this.oldX || this.width !== this.oldWidth)
						this.element.setAttributeNS(null, "x2", this.x + this.width);
					
					if(this.y !== this.oldY || this.height !== this.oldHeight)
						this.element.setAttributeNS(null, "y2", this.y + this.height);
					break;
				case "Polyline":
					var points = this.element.getAttributeNS(null, "points");
					if(points) {
						points = points.replace(/,/g, " ").split(" ").without("");
	
						if(points && points.length && points.length > 1) {
	
							//TODO what if oldWidth == 0?
							var widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth;
						    var heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight;
	
							var updatedPoints = "";
						    for(var i = 0; i < points.length; i++) {
								var x = (parseFloat(points[i])-this.oldX)*widthDelta + this.x;
								i++;
								var y = (parseFloat(points[i])-this.oldY)*heightDelta + this.y;
		    					updatedPoints += x + " " + y + " ";
						    }
							this.element.setAttributeNS(null, "points", updatedPoints);
						} else {
							//TODO error
						}
					} else {
						//TODO error
					}
					break;
				case "Path":
					//calculate scaling delta
					//TODO what if oldWidth == 0?
					var widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth;
					var heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight;
	
					//use path parser to edit each point of the path
					this.editPathHandler.init(this.x, this.y, this.oldX, this.oldY, widthDelta, heightDelta);
					this.editPathParser.parsePath(this.element);
	
					//change d attribute of path
					this.element.setAttributeNS(null, "d", this.editPathHandler.d);
					break;
			}

			this.oldX = this.x;
			this.oldY = this.y;
			this.oldWidth = this.width;
			this.oldHeight = this.height;
		}
	},
	
	isPointIncluded: function(pointX, pointY) {

		// Check if there are the right arguments and if the node is visible
		if(!pointX || !pointY || !this.isVisible()) {
			return false;
		}

		switch(this.type) {
			case "Rect":
				return (pointX >= this.x && pointX <= this.x + this.width &&
						pointY >= this.y && pointY <= this.y+this.height);
				break;
			case "Circle":
				//calculate the radius
//				var r;
//				if(this.width/this.oldWidth <= this.height/this.oldHeight) {
//					r = ((this.width > this.height) ? this.width : this.height)/2.0;
//				} else {
//				 	r = ((this.width < this.height) ? this.width : this.height)/2.0;
//				}
				return ORYX.Core.Math.isPointInEllipse(pointX, pointY, this.x + this.width/2.0, this.y + this.height/2.0, this.radiusX, this.radiusX);
				break;
			case "Ellipse":
				return ORYX.Core.Math.isPointInEllipse(pointX, pointY, this.x + this.radiusX, this.y + this.radiusY, this.radiusX, this.radiusY);			
				break;
			case "Line":
				return ORYX.Core.Math.isPointInLine(pointX, pointY, this.x, this.y, this.x + this.width, this.y + this.height);
				break;
			case "Polyline":
				var points = this.element.getAttributeNS(null, "points");
	
				if(points) {
					points = points.replace(/,/g , " ").split(" ").without("");
	
					points = points.collect(function(n) {
						return parseFloat(n);
					});
					
					return ORYX.Core.Math.isPointInPolygone(pointX, pointY, points);
				} else {
					return false;
				}
				break;
			case "Path":
				var parser = new PathParser();
				var handler = new ORYX.Core.SVG.PointsPathHandler();
				parser.setHandler(handler);
				parser.parsePath(this.element);
	
				return ORYX.Core.Math.isPointInPolygone(pointX, pointY, handler.points);

				break;
			default:
				return false;
		}
	},

	/**
	 * Returns true if the element is visible
	 * @param {SVGElement} elem
	 * @return boolean
	 */
	isVisible: function(elem) {
			
		if (!elem) {
			elem = this.element;
		}

		var hasOwnerSVG = false;
		try { 
			hasOwnerSVG = !!elem.ownerSVGElement;
		} catch(e){}
		
		if ( hasOwnerSVG ) {
			if (ORYX.Editor.checkClassType(elem, SVGGElement)) {
				if (elem.className && elem.className.baseVal == "me") 
					return true;
			}

			var fill = elem.getAttributeNS(null, "fill");
			var stroke = elem.getAttributeNS(null, "stroke");
			if (fill && fill == "none" && stroke && stroke == "none") {
				return false;
			}
			var attr = elem.getAttributeNS(null, "display");
			if(!attr)
				return this.isVisible(elem.parentNode);
			else if (attr == "none") 
				return false;
			else {
				return true;
			}
		}

		return true;
	},

	toString: function() { return (this.element) ? "SVGShape " + this.element.id : "SVGShape " + this.element;}
 });/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.SVG) {ORYX.Core.SVG = {};}

/**
 * @classDescription Class for adding text to a shape.
 * 
 */
ORYX.Core.SVG.Label = Clazz.extend({
	
	_characterSets:[
		"%W",
		"@",
		"m",
		"wDGMOQÖ#+=<>~^",
		"ABCHKNRSUVXZÜÄ&",
		"bdghnopquxöüETY1234567890ß_§${}*´`µ€",
		"aeksvyzäFLP?°²³",
		"c-",
		"rtJ\"/()[]:;!|\\",
		"fjI., ",
		"'",
		"il"
		],
	_characterSetValues:[15,14,13,11,10,9,8,7,6,5,4,3],

	/**
	 * Constructor
	 * @param options {Object} :
	 * 	textElement
	 * 
	 */
	construct: function(options) {
		arguments.callee.$.construct.apply(this, arguments);
		
		if(!options.textElement) {
			throw "Label: No parameter textElement." 
		} else if (!ORYX.Editor.checkClassType( options.textElement, SVGTextElement ) ) {
			throw "Label: Parameter textElement is not an SVGTextElement."	
		}
		
		this.invisibleRenderPoint = -5000;
		
		this.node = options.textElement;
		
		
		this.node.setAttributeNS(null, 'stroke-width', '0pt');
		this.node.setAttributeNS(null, 'letter-spacing', '-0.01px');
		
		this.shapeId = options.shapeId;
		
		this.id;
		
		this.fitToElemId;
		
		this.edgePosition;
		
		this.x;
		this.y;
		this.oldX;
		this.oldY;
		
		this.isVisible = true;
		
		this._text;
		this._verticalAlign;
		this._horizontalAlign;
		this._rotate;
		this._rotationPoint;
		
		//this.anchors = [];
		this.anchorLeft;
		this.anchorRight;
		this.anchorTop;
		this.anchorBottom;
		
		this._isChanged = true;

		//if the text element already has an id, don't change it.
		var _id = this.node.getAttributeNS(null, 'id');
		if(_id) {
			this.id = _id;
		}
		
		//initialization	
		
		//set referenced element the text is fit to
		this.fitToElemId = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'fittoelem');
		if(this.fitToElemId)
			this.fitToElemId = this.shapeId + this.fitToElemId;
		
		//set alignment	
		var alignValues = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'align');
		if(alignValues) {
			alignValues = alignValues.replace(/,/g, " ");
			alignValues = alignValues.split(" ");
			alignValues = alignValues.without("");
			
			alignValues.each((function(alignValue) {
				switch (alignValue) {
					case 'top':
					case 'middle':
					case 'bottom':
						if(!this._verticalAlign) {this._verticalAlign = alignValue;}
						break;
					case 'left':
					case 'center':
					case 'right':
						if(!this._horizontalAlign) {this._horizontalAlign = alignValue;}
						break;
				}
			}).bind(this));
		}
		
		//set edge position (only in case the label belongs to an edge)
		this.edgePosition = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'edgePosition');
		if(this.edgePosition) {
			this.edgePosition = this.edgePosition.toLowerCase();
		}
		
		
		//get offset top
		this.offsetTop = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'offsetTop') || ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP;
		if(this.offsetTop) {
			this.offsetTop = parseInt(this.offsetTop);
		}
		
		//get offset top
		this.offsetBottom = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'offsetBottom') || ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM;
		if(this.offsetBottom) {
			this.offsetBottom = parseInt(this.offsetBottom);
		}
		
				
		//set rotation
		var rotateValue = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'rotate');
		if(rotateValue) {
			try {
				this._rotate = parseFloat(rotateValue);
			} catch (e) {
				this._rotate = 0;
			}
		} else {
			this._rotate = 0;
		}
		
		//anchors
		var anchorAttr = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");
		if(anchorAttr) {
			anchorAttr = anchorAttr.replace("/,/g", " ");
			var anchors = anchorAttr.split(" ").without("");
			
			for(var i = 0; i < anchors.length; i++) {
				switch(anchors[i].toLowerCase()) {
					case "left":
						this.anchorLeft = true;
						break;
					case "right":
						this.anchorRight = true;
						break;
					case "top":
						this.anchorTop = true;
						break;
					case "bottom":
						this.anchorBottom = true;
						break;
				}
			}
		}
		
		//if no alignment defined, set default alignment
		if(!this._verticalAlign) { this._verticalAlign = 'bottom'; }
		if(!this._horizontalAlign) { this._horizontalAlign = 'left'; }

		var xValue = this.node.getAttributeNS(null, 'x');
		if(xValue) {
			this.x = parseFloat(xValue);
			this.oldX = this.x;
		} else {
			//TODO error
		}
		
		var yValue = this.node.getAttributeNS(null, 'y');
		if(yValue) {
			this.y = parseFloat(yValue);
			this.oldY = this.y;
		} else {
			//TODO error
		}
		
		//set initial text
		this.text(this.node.textContent);
	},
	
	changed: function() {
		this._isChanged = true;
	},
	
	/**
	 * Update the SVG text element.
	 */
	update: function() {
		if(this._isChanged || this.x !== this.oldX || this.y !== this.oldY) {
			if (this.isVisible) {
				this._isChanged = false;
				
				this.node.setAttributeNS(null, 'x', this.x);
				this.node.setAttributeNS(null, 'y', this.y);
				
				//this.node.setAttributeNS(null, 'font-size', this._fontSize);
				//this.node.setAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'align', this._horizontalAlign + " " + this._verticalAlign);
				
				//set horizontal alignment
				switch (this._horizontalAlign) {
					case 'left':
						this.node.setAttributeNS(null, 'text-anchor', 'start');
						break;
					case 'center':
						this.node.setAttributeNS(null, 'text-anchor', 'middle');
						break;
					case 'right':
						this.node.setAttributeNS(null, 'text-anchor', 'end');
						break;
				}
				
				this.oldX = this.x;
				this.oldY = this.y;
				
				//set rotation
				if (this._rotate !== undefined) {
					if (this._rotationPoint) 
						this.node.setAttributeNS(null, 'transform', 'rotate(' + this._rotate + ' ' + this._rotationPoint.x + ' ' + this._rotationPoint.y + ')');
					else 
						this.node.setAttributeNS(null, 'transform', 'rotate(' + this._rotate + ' ' + this.x + ' ' + this.y + ')');
				}
				
				var textLines = this._text.split("\n");
				while (textLines.last() == "") 
					textLines.pop();
				
				this.node.textContent = "";
				
				if (this.node.ownerDocument) {
					textLines.each((function(textLine, index){
						var tspan = this.node.ownerDocument.createElementNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
						tspan.textContent = textLine;
						tspan.setAttributeNS(null, 'x', this.invisibleRenderPoint);
						tspan.setAttributeNS(null, 'y', this.invisibleRenderPoint);
						
						/*
						 * Chrome's getBBox() method fails, if a text node contains an empty tspan element.
						 * So, we add a whitespace to such a tspan element.
						 */
						if(tspan.textContent === "") {
							tspan.textContent = " ";
						}
						
						//append tspan to text node
						this.node.appendChild(tspan);
					}).bind(this));
					
					//Work around for Mozilla bug 293581
					if (this.isVisible) {
						this.node.setAttributeNS(null, 'visibility', 'hidden');
					}
					
					if (this.fitToElemId) 
						window.setTimeout(this._checkFittingToReferencedElem.bind(this), 0);
					else 
						window.setTimeout(this._positionText.bind(this), 0);
				}
			} else {
				this.node.textContent = "";
			}
		}
	},
	
	_checkFittingToReferencedElem: function() {
		try {
			var tspans = $A(this.node.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan'));
			
			//only do this in firefox 3. all other browsers do not support word wrapping!!!!!
			//if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1)>=3) {
				var newtspans = [];
				
				var refNode = this.node.ownerDocument.getElementById(this.fitToElemId);
				
				if (refNode) {
				
					var refbb = refNode.getBBox();
					
					var fontSize = this.getFontSize();
					
					for (var j = 0; j < tspans.length; j++) {
						var tspan = tspans[j];
						
						var textLength = this._getRenderedTextLength(tspan, undefined, undefined, fontSize);
						
						/* Depending on the rotation of the text element, take
						 * the width or height as reference respectively. */
						var refBoxLength = (this._rotate != 0 
								&& this._rotate % 180 != 0 
								&& this._rotate % 90 == 0 ? 
										refbb.height : refbb.width);
						
						if (textLength > refBoxLength) {
						
							var startIndex = 0;
							var lastSeperatorIndex = 0;
							
							var numOfChars = this.getTrimmedTextLength(tspan.textContent);
							for (var i = 0; i < numOfChars; i++) {
								var sslength = this._getRenderedTextLength(tspan, startIndex, i-startIndex, fontSize);
								
								if (sslength > refBoxLength - 3) {
									var newtspan = this.node.ownerDocument.createElementNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
									if (lastSeperatorIndex <= startIndex) {
										lastSeperatorIndex = (i == 0) ? i : i-1;
										newtspan.textContent = tspan.textContent.slice(startIndex, lastSeperatorIndex);
										//lastSeperatorIndex = i;
									}
									else {
										newtspan.textContent = tspan.textContent.slice(startIndex, ++lastSeperatorIndex);
									}
									
									newtspan.setAttributeNS(null, 'x', this.invisibleRenderPoint);
									newtspan.setAttributeNS(null, 'y', this.invisibleRenderPoint);
									
									//insert tspan to text node
									//this.node.insertBefore(newtspan, tspan);
									newtspans.push(newtspan);
									
									startIndex = lastSeperatorIndex;
									
								}
								else {
									var curChar = tspan.textContent.charAt(i);
									if (curChar == ' ' ||
									curChar == '-' ||
									curChar == "." ||
									curChar == "," ||
									curChar == ";" ||
									curChar == ":") {
										lastSeperatorIndex = i;
									}
								}
							}
							
							tspan.textContent = tspan.textContent.slice(startIndex);
						}
						
						newtspans.push(tspan);
					}
					
					while (this.node.hasChildNodes()) 
						this.node.removeChild(this.node.childNodes[0]);
					
					while (newtspans.length > 0) {
						this.node.appendChild(newtspans.shift());
					}
				}
			//}
		} catch (e) {
			//console.log(e);
		}
		
		window.setTimeout(this._positionText.bind(this), 0);
	},
	
	/**
	 * This is a work around method for Mozilla bug 293581.
	 * Before the method getComputedTextLength works, the text has to be rendered.
	 */
	_positionText: function() {
		try {
			var tspans = this.node.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
			
			var fontSize = this.getFontSize(this.node); 
			
			var invalidTSpans = [];
			
			$A(tspans).each((function(tspan, index){
				
				if(tspan.textContent.trim() === "") {
					invalidTSpans.push(tspan);
				} else {
					//set vertical position
					var dy = 0;
					switch (this._verticalAlign) {
						case 'bottom':
							dy = -(tspans.length - index - 1) * (fontSize);
							break;
						case 'middle':
							dy = -(tspans.length / 2.0 - index - 1) * (fontSize);
							dy -= ORYX.CONFIG.LABEL_LINE_DISTANCE / 2;
							break;
						case 'top':
							dy = index * (fontSize);
							dy += fontSize;
							break;
					}
					
					tspan.setAttributeNS(null, 'dy', dy);
					
					tspan.setAttributeNS(null, 'x', this.x);
					tspan.setAttributeNS(null, 'y', this.y);
				}
				
			}).bind(this));
			
			invalidTSpans.each(function(tspan) {
				this.node.removeChild(tspan)
			}.bind(this));
			
		} catch(e) {
			//console.log(e);
			this._isChanged = true;
		}
		
		
		if(this.isVisible) {
			this.node.setAttributeNS(null, 'visibility', 'inherit');
		}				
	},
	
	/**
	 * Returns the text length of the text content of an SVG tspan element.
	 * For all browsers but Firefox 3 the values are estimated.
	 * @param {TSpanSVGElement} tspan
	 * @param {int} startIndex Optional, for sub strings
	 * @param {int} endIndex Optional, for sub strings
	 */
	_getRenderedTextLength: function(tspan, startIndex, endIndex, fontSize) {
		if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1) >= 3) {
			if(startIndex === undefined) {
//test string: abcdefghijklmnopqrstuvwxyzöäü,.-#+ 1234567890ßABCDEFGHIJKLMNOPQRSTUVWXYZ;:_'*ÜÄÖ!"§$%&/()=?[]{}|<>'~´`\^°µ@€²³
//				for(var i = 0; i < tspan.textContent.length; i++) {
//					console.log(tspan.textContent.charAt(i), tspan.getSubStringLength(i,1), this._estimateCharacterWidth(tspan.textContent.charAt(i))*(fontSize/14.0));
//				}
				return tspan.getComputedTextLength();
			} else {
				return tspan.getSubStringLength(startIndex, endIndex);
			}
		} else {
			if(startIndex === undefined) {
				return this._estimateTextWidth(tspan.textContent, fontSize);
			} else {
				return this._estimateTextWidth(tspan.textContent.substr(startIndex, endIndex).trim(), fontSize);
			}
		}
	},
	
	/**
	 * Estimates the text width for a string.
	 * Used for word wrapping in all browser but FF3.
	 * @param {Object} text
	 */
	_estimateTextWidth: function(text, fontSize) {
		var sum = 0.0;
		for(var i = 0; i < text.length; i++) {
			sum += this._estimateCharacterWidth(text.charAt(i));
		}
		
		return sum*(fontSize/14.0);
	},
	
	/**
	 * Estimates the width of a single character for font size 14.
	 * Used for word wrapping in all browser but FF3.
	 * @param {Object} character
	 */
	_estimateCharacterWidth: function(character) {
		for(var i = 0; i < this._characterSets.length; i++) {
 			if(this._characterSets[i].indexOf(character) >= 0) {
				return this._characterSetValues[i];
			}
 		}	
		return 9;
 	},
	
	getReferencedElementWidth: function() {
		var refNode = this.node.ownerDocument.getElementById(this.fitToElemId);
				
		if (refNode) {
			var refbb = refNode.getBBox();
			if(refbb) {
				return refbb.width;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},
	
	/**
	 * If no parameter is provided, this method returns the current text.
	 * @param text {String} Optional. Replaces the old text with this one.
	 */
	text: function() {
		switch (arguments.length) {
			case 0:
				return this._text
				break;
			
			case 1:
				var oldText = this._text;
				if(arguments[0]) {
					this._text = arguments[0].toString();
				} else {
					this._text = "";
				}
				if(oldText !== this._text) {
					this._isChanged = true;
				}
				break;
				
			default: 
				//TODO error
				break;
		}
	},
	
	verticalAlign: function() {
		switch(arguments.length) {
			case 0:
				return this._verticalAlign;
			case 1:
				if(['top', 'middle', 'bottom'].member(arguments[0])) {
					var oldValue = this._verticalAlign;
					this._verticalAlign = arguments[0];
					if(this._verticalAlign !== oldValue) {
						this._isChanged = true;
					}
				}
				break;
				
			default:
				//TODO error
				break;
		}
	},
	
	horizontalAlign: function() {
		switch(arguments.length) {
			case 0:
				return this._horizontalAlign;
			case 1:
				if(['left', 'center', 'right'].member(arguments[0])) {
					var oldValue = this._horizontalAlign;
					this._horizontalAlign = arguments[0];
					if(this._horizontalAlign !== oldValue) {
						this._isChanged = true;
					}	
				}
				break;
				
			default:
				//TODO error
				break;
		}
	},
	
	rotate: function() {
		switch(arguments.length) {
			case 0:
				return this._rotate;
			case 1:
				if (this._rotate != arguments[0]) {
					this._rotate = arguments[0];
					this._rotationPoint = undefined;
					this._isChanged = true;
				}
			case 2:
				if(this._rotate != arguments[0] ||
				   !this._rotationPoint ||
				   this._rotationPoint.x != arguments[1].x ||
				   this._rotationPoint.y != arguments[1].y) {
					this._rotate = arguments[0];
					this._rotationPoint = arguments[1];
					this._isChanged = true;
				}
				
		}
	},
	
	hide: function() {
		if(this.isVisible) {
			this.isVisible = false;
			this._isChanged = true;
		}
	},
	
	show: function() {
		if(!this.isVisible) {
			this.isVisible = true;
			this._isChanged = true;
		}
	},
	
	/**
	 * iterates parent nodes till it finds a SVG font-size
	 * attribute.
	 * @param {SVGElement} node
	 */
	getInheritedFontSize: function(node) {
		if(!node || !node.getAttributeNS)
			return;
			
		var attr = node.getAttributeNS(null, "font-size");
		if(attr) {
			return parseFloat(attr);
		} else if(!ORYX.Editor.checkClassType(node, SVGSVGElement)) {
			return this.getInheritedFontSize(node.parentNode);
		}
	},
	
	getFontSize: function(node) {
		var tspans = this.node.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
			
		//trying to get an inherited font-size attribute
		//NO CSS CONSIDERED!
		var fontSize = this.getInheritedFontSize(this.node); 
		
		if (!fontSize) {
			//because this only works in firefox 3, all other browser use the default line height
			if (tspans[0] && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1) >= 3) {
				fontSize = tspans[0].getExtentOfChar(0).height;
			}
			else {
				fontSize = ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT;
			}
			
			//handling of unsupported method in webkit
			if (fontSize <= 0) {
				fontSize = ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT;
			}
		}
		
		if(fontSize)
			this.node.setAttribute("oryx:fontSize", fontSize);
		
		return fontSize;
	},
	
	/**
	 * Get trimmed text length for use with
	 * getExtentOfChar and getSubStringLength.
	 * @param {String} text
	 */
	getTrimmedTextLength: function(text) {
		text = text.strip().gsub('  ', ' ');
		
		var oldLength;
		do {
			oldLength = text.length;
			text = text.gsub('  ', ' ');
		} while (oldLength > text.length);

		return text.length;
	},
	
	/**
	 * Returns the offset from
	 * edge to the label which is 
	 * positioned under the edge
	 * @return {int}
	 */
	getOffsetBottom: function(){
		return this.offsetBottom;
	},
	
		
	/**
	 * Returns the offset from
	 * edge to the label which is 
	 * positioned over the edge
	 * @return {int}
	 */
	getOffsetTop: function(){
		return this.offsetTop;
	},
	
	toString: function() { return "Label " + this.id }
 });/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}if(!ORYX.Core.Math) {ORYX.Core.Math = {};}	/** * Calculate the middle point between two given points * @param {x:double, y:double} point1 * @param {x:double, y:double} point2 * @return the middle point */ORYX.Core.Math.midPoint = function(point1, point2) {	return 	{				x: (point1.x + point2.x) / 2.0,				y: (point1.y + point2.y) / 2.0			}}			/** * Returns a TRUE if the point is over a line (defined by * point1 and point 2). In Addition a threshold can be set, * which defines the weight of those line. *  * @param {int} pointX - Point X * @param {int} pointY - Point Y * @param {int} lPoint1X - Line first Point X * @param {int} lPoint1Y - Line first Point Y * @param {int} lPoint2X - Line second Point X * @param {int} lPoint2Y - Line second Point y * @param {int} offset {optional} - maximal distance to line * @class ORYX.Core.Math.prototype */ORYX.Core.Math.isPointInLine = function (pointX, pointY, lPoint1X, lPoint1Y, lPoint2X, lPoint2Y, offset) {	offset = offset ? Math.abs(offset) : 1;		// Check if the edge is vertical	if(Math.abs(lPoint1X-lPoint2X)<=offset && Math.abs(pointX-lPoint1X)<=offset && pointY-Math.max(lPoint1Y, lPoint2Y)<=offset && Math.min(lPoint1Y, lPoint2Y)-pointY<=offset) {		return true	}	// Check if the edge is horizontal	if(Math.abs(lPoint1Y-lPoint2Y)<=offset && Math.abs(pointY-lPoint1Y)<=offset && pointX-Math.max(lPoint1X, lPoint2X)<=offset && Math.min(lPoint1X, lPoint2X)-pointX<=offset) {		return true	}	if(pointX > Math.max(lPoint1X, lPoint2X) || pointX < Math.min(lPoint1X, lPoint2X)) {		return false	}	if(pointY > Math.max(lPoint1Y, lPoint2Y) || pointY < Math.min(lPoint1Y, lPoint2Y)) {		return false	}				var s = (lPoint1Y - lPoint2Y) / (lPoint1X - lPoint2X);		return 	Math.abs(pointY - ((s * pointX) + lPoint1Y - s * lPoint1X)) < offset}/** * Get a boolean if the point is in the polygone *  */ORYX.Core.Math.isPointInEllipse = function (pointX, pointY, cx, cy, rx, ry) {	if(cx === undefined || cy === undefined || rx === undefined || ry === undefined) {		throw "ORYX.Core.Math.isPointInEllipse needs a ellipse with these properties: x, y, radiusX, radiusY"	} 	    var tx = (pointX - cx) / rx;    var ty = (pointY - cy) / ry;	    return tx * tx + ty * ty < 1.0;}	/** * Get a boolean if the point is in the polygone * @param {int} pointX * @param {int} pointY * @param {[int]} Cornerpoints of the Polygone (x,y,x,y,...) */ORYX.Core.Math.isPointInPolygone = function(pointX, pointY, polygone){	if (arguments.length < 3) {		throw "ORYX.Core.Math.isPointInPolygone needs two arguments"	}		var lastIndex = polygone.length-1;		if (polygone[0] !== polygone[lastIndex - 1] || polygone[1] !== polygone[lastIndex]) {		polygone.push(polygone[0]);		polygone.push(polygone[1]);	}		var crossings = 0;	var x1, y1, x2, y2, d;	    for (var i = 0; i < polygone.length - 3; ) {        x1=polygone[i];        y1=polygone[++i];        x2=polygone[++i];        y2=polygone[i+1];        d=(pointY - y1) * (x2 - x1) - (pointX - x1) * (y2 - y1);        if ((y1 >= pointY) != (y2 >= pointY)) {            crossings += y2 - y1 >= 0 ? d >= 0 : d <= 0;        }        if (!d && Math.min(x1,x2) <= pointX && pointX <= Math.max(x1,x2)            && Math.min(y1,y2) <= pointY && pointY <= Math.max(y1,y2)) {            return true;        }    }	return (crossings%2)?true:false;}/** *	Calculates the distance between a point and a line. It is also testable, if  *  the distance orthogonal to the line, matches the segment of the line. *   *  @param {float} lineP1 *  	The starting point of the line segment *  @param {float} lineP2 *  	The end point of the line segment *  @param {Point} point *  	The point to calculate the distance to. *  @param {boolean} toSegmentOnly *  	Flag to signal if only the segment of the line shell be evaluated. */ORYX.Core.Math.distancePointLinie = function(									lineP1, 									lineP2, 									point, 									toSegmentOnly) {		var intersectionPoint = 				ORYX.Core.Math.getPointOfIntersectionPointLine(lineP1, 																lineP2, 																point, 																toSegmentOnly);		if(!intersectionPoint) {		return null;	}		return ORYX.Core.Math.getDistancePointToPoint(point, intersectionPoint);};/** * Calculates the distance between two points. *  * @param {point} point1 * @param {point} point2 */ORYX.Core.Math.getDistancePointToPoint = function(point1, point2) {	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));};/** * Returns the intersection point of a line and a point that defines a line * orthogonal to the given line. *  *  @param {float} lineP1 *  	The starting point of the line segment *  @param {float} lineP2 *  	The end point of the line segment *  @param {Point} point *  	The point to calculate the distance to. *  @param {boolean} onSegmentOnly *  	Flag to signal if only the segment of the line shell be evaluated. */ORYX.Core.Math.getPointOfIntersectionPointLine = function(													lineP1, 													lineP2, 													point, 													onSegmentOnly) {	/* 	 * [P3 - P1 - u(P2 - P1)] dot (P2 - P1) = 0	 * u =((x3-x1)(x2-x1)+(y3-y1)(y2-y1))/(p2-p1)²	 */	var denominator = Math.pow(lineP2.x - lineP1.x, 2) 						+ Math.pow(lineP2.y - lineP1.y, 2);	if(denominator == 0) {		return undefined;	}		var u = ((point.x - lineP1.x) * (lineP2.x - lineP1.x)  			+ (point.y - lineP1.y) * (lineP2.y - lineP1.y))			/ denominator;				if(onSegmentOnly) {		if (!(0 <= u && u <= 1)) {			return undefined;		}	}		pointOfIntersection = new Object();	pointOfIntersection.x = lineP1.x + u * (lineP2.x - lineP1.x);	pointOfIntersection.y = lineP1.y + u * (lineP2.y - lineP1.y);			return pointOfIntersection;												};/**
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

/**
 * Init namespace
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.StencilSet) {ORYX.Core.StencilSet = {};}

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 * 
 * This class represents one stencil of a stencil set.
 */
ORYX.Core.StencilSet.Stencil = {

	/**
	 * Constructor
	 */
	construct: function(jsonStencil, namespace, source, stencilSet, propertyPackages, defaultPosition) {
		arguments.callee.$.construct.apply(this, arguments); // super();
		
		// check arguments and set defaults.
		if(!jsonStencil) throw "Stencilset seems corrupt.";
		if(!namespace) throw "Stencil does not provide namespace.";
		if(!source) throw "Stencil does not provide SVG source.";
		if(!stencilSet) throw "Fatal internal error loading stencilset.";
		//if(!propertyPackages) throw "Fatal internal error loading stencilset.";
		
		this._source = source;
		this._jsonStencil = jsonStencil;
		this._stencilSet = stencilSet;
		this._namespace = namespace;
		this._propertyPackages = propertyPackages;
		
		if(defaultPosition && !this._jsonStencil.position) 
			this._jsonStencil.position = defaultPosition;
		
		this._view;
		this._properties = new Hash();

		// check stencil consistency and set defaults.
		/*with(this._jsonStencil) {
			
			if(!type) throw "Stencil does not provide type.";
			if((type != "edge") && (type != "node"))
				throw "Stencil type must be 'edge' or 'node'.";
			if(!id || id == "") throw "Stencil does not provide valid id.";
			if(!title || title == "")
				throw "Stencil does not provide title";
			if(!description) { description = ""; };
			if(!groups) { groups = []; }
			if(!roles) { roles = []; }

			// add id of stencil to its roles
			roles.push(id);
		}*/
		
		//init all JSON values
		if(!this._jsonStencil.type || !(this._jsonStencil.type === "edge" || this._jsonStencil.type === "node")) {
			throw "ORYX.Core.StencilSet.Stencil(construct): Type is not defined.";
		}
		if(!this._jsonStencil.id || this._jsonStencil.id === "") {
			throw "ORYX.Core.StencilSet.Stencil(construct): Id is not defined.";
		}
		if(!this._jsonStencil.title || this._jsonStencil.title === "") {
			throw "ORYX.Core.StencilSet.Stencil(construct): Title is not defined.";
		}

		if(!this._jsonStencil.description) { this._jsonStencil.description = ""; };
		if(!this._jsonStencil.groups) { this._jsonStencil.groups = []; }
		if(!this._jsonStencil.roles) { this._jsonStencil.roles = []; }
		
		//add id of stencil to its roles
		this._jsonStencil.roles.push(this._jsonStencil.id);

		//prepend namespace to each role
		this._jsonStencil.roles.each((function(role, index) {
			this._jsonStencil.roles[index] = namespace + role;
		}).bind(this));

		//delete duplicate roles
		this._jsonStencil.roles = this._jsonStencil.roles.uniq();

		//make id unique by prepending namespace of stencil set
		this._jsonStencil.id = namespace + this._jsonStencil.id;

		this.postProcessProperties();
		
		// init serialize callback
		if(!this._jsonStencil.serialize) {
			this._jsonStencil.serialize = {};
			//this._jsonStencil.serialize = function(shape, data) { return data;};
		}
		
		// init deserialize callback
		if(!this._jsonStencil.deserialize) {
			this._jsonStencil.deserialize = {};
			//this._jsonStencil.deserialize = function(shape, data) { return data;};
		}
		
		// init layout callback
		if(!this._jsonStencil.layout) {
			this._jsonStencil.layout = []
			//this._jsonStencil.layout = function() {return true;}
		}
		
		//TODO does not work correctly, if the url does not exist
		//How to guarantee that the view is loaded correctly before leaving the constructor???
		var url = source + "view/" + jsonStencil.view;
		// override content type when this is webkit.
		
		/*
		if(Prototype.Browser.WebKit) {
			
			var req = new XMLHttpRequest;
			req.open("GET", url, false);
			req.overrideMimeType('text/xml');
			req.send(null);
			req.onload = (function() { _loadSVGOnSuccess(req.responseXML); }).bind(this);

		// else just do it.
		} else
		*/
		
		if(this._jsonStencil.view.trim().match(/</)) {
			var parser	= new DOMParser();		
			var xml 	= parser.parseFromString( this._jsonStencil.view ,"text/xml");
			
			//check if result is a SVG document
			if( ORYX.Editor.checkClassType( xml.documentElement, SVGSVGElement )) {
	
				this._view = xml.documentElement;
				
				//updating link to images
				var imageElems = this._view.getElementsByTagNameNS("http://www.w3.org/2000/svg", "image");
				$A(imageElems).each((function(imageElem) {
					var link = imageElem.getAttributeNodeNS("http://www.w3.org/1999/xlink", "href");
					if(link && link.value.indexOf("://") == -1) {
						link.textContent = this._source + "view/" + link.value;
					}
				}).bind(this));
			} else {
				throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a SVG document."
			}
		} else {
			new Ajax.Request(
				url, {
					asynchronous:false, method:'get',
					onSuccess:this._loadSVGOnSuccess.bind(this),
					onFailure:this._loadSVGOnFailure.bind(this)
			});
		}
	},

	postProcessProperties: function() {

		// add image path to icon
		if(this._jsonStencil.icon && this._jsonStencil.icon.indexOf("://") === -1) {
			this._jsonStencil.icon = this._source + "icons/" + this._jsonStencil.icon;
		} else {
			this._jsonStencil.icon = "";
		}
	
		// init property packages
		if(this._jsonStencil.propertyPackages && this._jsonStencil.propertyPackages instanceof Array) {
			this._jsonStencil.propertyPackages.each((function(ppId) {
				var pp = this._propertyPackages[ppId];
				
				if(pp) {
					pp.each((function(prop){
						var oProp = new ORYX.Core.StencilSet.Property(prop, this._namespace, this);
						this._properties[oProp.prefix() + "-" + oProp.id()] = oProp;
					}).bind(this));
				}
			}).bind(this));
		}
		
		// init properties
		if(this._jsonStencil.properties && this._jsonStencil.properties instanceof Array) {
			this._jsonStencil.properties.each((function(prop) {
				var oProp = new ORYX.Core.StencilSet.Property(prop, this._namespace, this);
				this._properties[oProp.prefix() + "-" + oProp.id()] = oProp;
			}).bind(this));
		}
		

	},

	/**
	 * @param {ORYX.Core.StencilSet.Stencil} stencil
	 * @return {Boolean} True, if stencil has the same namespace and type.
	 */
	equals: function(stencil) {
		return (this.id() === stencil.id());
	},

	stencilSet: function() {
		return this._stencilSet;
	},

	type: function() {
		return this._jsonStencil.type;
	},

	namespace: function() {
		return this._namespace;
	},

	id: function() {
		return this._jsonStencil.id;
	},
    
    idWithoutNs: function(){
        return this.id().replace(this.namespace(),"");
    },

	title: function() {
		return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "title");
	},

	description: function() {
		return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "description");
	},
	
	groups: function() {
		return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "groups");
	},
	
	position: function() {
		return (isNaN(this._jsonStencil.position) ? 0 : this._jsonStencil.position);
	},

	view: function() {
		return this._view.cloneNode(true) || this._view;
	},

	icon: function() {
		return this._jsonStencil.icon;
	},
	
	fixedAspectRatio: function() {
		return this._jsonStencil.fixedAspectRatio === true;
	},
	
	hasMultipleRepositoryEntries: function() {
		return (this.getRepositoryEntries().length > 0);
	},
	
	getRepositoryEntries: function() {
		return (this._jsonStencil.repositoryEntries) ?
			$A(this._jsonStencil.repositoryEntries) : $A([]);
	},
	
	properties: function() {
		return this._properties.values();
	},

	property: function(id) {
		return this._properties[id];
	},

	roles: function() {
		return this._jsonStencil.roles;
	},
	
	defaultAlign: function() {
		if(!this._jsonStencil.defaultAlign)
			return "east";
		return this._jsonStencil.defaultAlign;
	},

	serialize: function(shape, data) {
		return this._jsonStencil.serialize;
		//return this._jsonStencil.serialize(shape, data);
	},
	
	deserialize: function(shape, data) {
		return this._jsonStencil.deserialize;
		//return this._jsonStencil.deserialize(shape, data);
	},
	
	// in which case is targetShape used?
//	layout: function(shape, targetShape) {
//		return this._jsonStencil.layout(shape, targetShape);
//	},
	// layout property to store events for layouting in plugins
	layout: function(shape) {
		return this._jsonStencil.layout
	},
	
	addProperty: function(property, namespace) {
		if(property && namespace) {
			var oProp = new ORYX.Core.StencilSet.Property(property, namespace, this);
			this._properties[oProp.prefix() + "-" + oProp.id()] = oProp;
		}
	},
	
	removeProperty: function(propertyId) {
		if(propertyId) {
			var oProp = this._properties.values().find(function(prop) {
				return (propertyId == prop.id());
			});
			if(oProp)
				delete this._properties[oProp.prefix() + "-" + oProp.id()];
		}
	},

	_loadSVGOnSuccess: function(result) {
		
		var xml = null;
		
		/*
		 * We want to get a dom object for the requested file. Unfortunately,
		 * safari has some issues here. this is meant as a fallback for all
		 * browsers that don't recognize the svg mimetype as XML but support
		 * data: urls on Ajax calls.
		 */
		
		// responseXML != undefined.
		// if(!(result.responseXML))
		
			// get the dom by data: url.
			// xml = _evenMoreEvilHack(result.responseText, 'text/xml');
		
		// else
		
			// get it the usual way.
			xml = result.responseXML;

		//check if result is a SVG document
		if( ORYX.Editor.checkClassType( xml.documentElement, SVGSVGElement )) {

			this._view = xml.documentElement;
			
			//updating link to images
			var imageElems = this._view.getElementsByTagNameNS("http://www.w3.org/2000/svg", "image");
			$A(imageElems).each((function(imageElem) {
				var link = imageElem.getAttributeNodeNS("http://www.w3.org/1999/xlink", "href");
				if(link && link.value.indexOf("://") == -1) {
					link.textContent = this._source + "view/" + link.value;
				}
			}).bind(this));
		} else {
			throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a SVG document."
		}
	},

	_loadSVGOnFailure: function(result) {
		throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnFailure): Loading SVG document failed."
	},

	toString: function() { return "Stencil " + this.title() + " (" + this.id() + ")"; }
};

ORYX.Core.StencilSet.Stencil = Clazz.extend(ORYX.Core.StencilSet.Stencil);

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken. Even more evil version.
 * @param {Object} str
 * @param {Object} contentType
 */
function _evenMoreEvilHack(str, contentType) {
	
	/*
	 * This even more evil hack was taken from
	 * http://web-graphics.com/mtarchive/001606.php#chatty004999
	 */
	
	if (window.ActiveXObject) {
		var d = new ActiveXObject("MSXML.DomDocument");
		d.loadXML(str);
		return d;
	} else if (window.XMLHttpRequest) {
		var req = new XMLHttpRequest;
		req.open("GET", "data:" + (contentType || "application/xml") +
						";charset=utf-8," + encodeURIComponent(str), false);
		if (req.overrideMimeType) {
			req.overrideMimeType(contentType);
		}
		req.send(null);
		return req.responseXML;
	}
}

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken.
 * @param {Object} result the xml document object.
 */
function _evilSafariHack(serializedXML) {
	
	/*
	 *  The Dave way. Taken from:
	 *  http://web-graphics.com/mtarchive/001606.php
	 *  
	 *  There is another possibility to parse XML in Safari, by implementing
	 *  the DOMParser in javascript. However, in the latest nightlies of
	 *  WebKit, DOMParser is already available, but still buggy. So, this is
	 *  the best compromise for the time being.
	 */		
	
	var xml = serializedXML;
	var url = "data:text/xml;charset=utf-8," + encodeURIComponent(xml);
	var dom = null;
	
	// your standard AJAX stuff
	var req = new XMLHttpRequest();
	req.open("GET", url);
	req.onload = function() { dom = req.responseXML; }
	req.send(null);
	
	return dom;
}
	
/**
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
/**
 * Init namespace
 */
if (!ORYX) {
    var ORYX = {};
}
if (!ORYX.Core) {
    ORYX.Core = {};
}
if (!ORYX.Core.StencilSet) {
    ORYX.Core.StencilSet = {};
}

/**
 * Class Property
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.Property = Clazz.extend({

    /**
     * Constructor
     */
    construct: function(jsonProp, namespace, stencil){
        arguments.callee.$.construct.apply(this, arguments);
        
        this._jsonProp = jsonProp || ORYX.Log.error("Parameter jsonProp is not defined.");
        this._namespace = namespace || ORYX.Log.error("Parameter namespace is not defined.");
        this._stencil = stencil || ORYX.Log.error("Parameter stencil is not defined.");
        
        this._items = new Hash();
        this._complexItems = new Hash();
        
        jsonProp.id = jsonProp.id || ORYX.Log.error("ORYX.Core.StencilSet.Property(construct): Id is not defined.");
		jsonProp.id = jsonProp.id.toLowerCase();
		
        if (!jsonProp.type) {
            ORYX.Log.info("Type is not defined for stencil '%0', id '%1'. Falling back to 'String'.", stencil, jsonProp.id);
            jsonProp.type = "string";
        }
        else {
            jsonProp.type = jsonProp.type.toLowerCase();
        }
        
        jsonProp.prefix = jsonProp.prefix || "oryx";
        jsonProp.title = jsonProp.title || "";
        jsonProp.value = jsonProp.value || "";
        jsonProp.description = jsonProp.description || "";
        jsonProp.readonly = jsonProp.readonly || false;
        if(jsonProp.optional != false)
        	jsonProp.optional = true;
        
        //init refToView
        if (this._jsonProp.refToView) {
            if (!(this._jsonProp.refToView instanceof Array)) {
                this._jsonProp.refToView = [this._jsonProp.refToView];
            }
        }
        else {
            this._jsonProp.refToView = [];
        }
        
        if (jsonProp.min === undefined || jsonProp.min === null) {
            jsonProp.min = Number.MIN_VALUE;
        }
        
        if (jsonProp.max === undefined || jsonProp.max === null) {
            jsonProp.max = Number.MAX_VALUE;
        }
        
        if (!jsonProp.fillOpacity) {
            jsonProp.fillOpacity = false;
        }
        
        if (!jsonProp.strokeOpacity) {
            jsonProp.strokeOpacity = false;
        }
        
        if (jsonProp.length === undefined || jsonProp.length === null) {
            jsonProp.length = Number.MAX_VALUE;
        }
        
        if (!jsonProp.wrapLines) {
            jsonProp.wrapLines = false;
        }
        
        if (!jsonProp.dateFormat) {
            jsonProp.dataFormat = "m/d/y";
        }
        
        if (!jsonProp.fill) {
            jsonProp.fill = false;
        }
        
        if (!jsonProp.stroke) {
            jsonProp.stroke = false;
        }
        
        if(!jsonProp.inverseBoolean) {
        	jsonProp.inverseBoolean = false;
        }
		
		if(!jsonProp.directlyEditable && jsonProp.directlyEditable != false) {
        	jsonProp.directlyEditable = true;
        }
		
		if(jsonProp.visible !== false) {
			jsonProp.visible = true;
		}
		
		if(!jsonProp.popular) {
			jsonProp.popular = false;
		}
        
        if (jsonProp.type === ORYX.CONFIG.TYPE_CHOICE) {
            if (jsonProp.items && jsonProp.items instanceof Array) {
                jsonProp.items.each((function(jsonItem){
                	// why is the item's value used as the key???
                    this._items[jsonItem.value] = new ORYX.Core.StencilSet.PropertyItem(jsonItem, namespace, this);
                }).bind(this));
            }
            else {
                throw "ORYX.Core.StencilSet.Property(construct): No property items defined."
            }
            // extended by Kerstin (start)
        }
        else 
            if (jsonProp.type === ORYX.CONFIG.TYPE_COMPLEX) {
                if (jsonProp.complexItems && jsonProp.complexItems instanceof Array) {
                    jsonProp.complexItems.each((function(jsonComplexItem){
                        this._complexItems[jsonComplexItem.id] = new ORYX.Core.StencilSet.ComplexPropertyItem(jsonComplexItem, namespace, this);
                    }).bind(this));
                }
                else {
                    throw "ORYX.Core.StencilSet.Property(construct): No complex property items defined."
                }
            }
        // extended by Kerstin (end)
    },
    
    /**
     * @param {ORYX.Core.StencilSet.Property} property
     * @return {Boolean} True, if property has the same namespace and id.
     */
    equals: function(property){
        return (this._namespace === property.namespace() &&
        this.id() === property.id()) ? true : false;
    },
    
    namespace: function(){
        return this._namespace;
    },
    
    stencil: function(){
        return this._stencil;
    },
    
    id: function(){
        return this._jsonProp.id;
    },
    
    prefix: function(){
        return this._jsonProp.prefix;
    },
    
    type: function(){
        return this._jsonProp.type;
    },
    
    inverseBoolean: function() {
    	return this._jsonProp.inverseBoolean;
    },
	
	popular: function() {
		return this._jsonProp.popular;
	},
	
	setPopular: function() {
		this._jsonProp.popular = true;
	},
	
	directlyEditable: function() {
		return this._jsonProp.directlyEditable;
	},
	
	visible: function() {
		return this._jsonProp.visible;
	},
    
    title: function(){
        return ORYX.Core.StencilSet.getTranslation(this._jsonProp, "title");
    },
    
    value: function(){
        return this._jsonProp.value;
    },
    
    readonly: function(){
        return this._jsonProp.readonly;
    },
    
    optional: function(){
        return this._jsonProp.optional;
    },
    
    description: function(){
        return ORYX.Core.StencilSet.getTranslation(this._jsonProp, "description");
    },
    
    /**
     * An optional link to a SVG element so that the property affects the
     * graphical representation of the stencil.
     */
    refToView: function(){
        return this._jsonProp.refToView;
    },
    
    /**
     * If type is integer or float, min is the lower bounds of value.
     */
    min: function(){
        return this._jsonProp.min;
    },
    
    /**
     * If type ist integer or float, max is the upper bounds of value.
     */
    max: function(){
        return this._jsonProp.max;
    },
    
    /**
     * If type is float, this method returns if the fill-opacity property should
     *  be set.
     *  @return {Boolean}
     */
    fillOpacity: function(){
        return this._jsonProp.fillOpacity;
    },
    
    /**
     * If type is float, this method returns if the stroke-opacity property should
     *  be set.
     *  @return {Boolean}
     */
    strokeOpacity: function(){
        return this._jsonProp.strokeOpacity;
    },
    
    /**
     * If type is string or richtext, length is the maximum length of the text.
     * TODO how long can a string be.
     */
    length: function(){
        return this._jsonProp.length ? this._jsonProp.length : Number.MAX_VALUE;
    },
    
    wrapLines: function(){
        return this._jsonProp.wrapLines;
    },
    
    /**
     * If type is date, dateFormat specifies the format of the date. The format
     * specification of the ext library is used:
     *
     * Format  Output      Description
     *	------  ----------  --------------------------------------------------------------
     *	  d      10         Day of the month, 2 digits with leading zeros
     *	  D      Wed        A textual representation of a day, three letters
     *	  j      10         Day of the month without leading zeros
     *	  l      Wednesday  A full textual representation of the day of the week
     *	  S      th         English ordinal day of month suffix, 2 chars (use with j)
     *	  w      3          Numeric representation of the day of the week
     *	  z      9          The julian date, or day of the year (0-365)
     *	  W      01         ISO-8601 2-digit week number of year, weeks starting on Monday (00-52)
     *	  F      January    A full textual representation of the month
     *	  m      01         Numeric representation of a month, with leading zeros
     *	  M      Jan        Month name abbreviation, three letters
     *	  n      1          Numeric representation of a month, without leading zeros
     *	  t      31         Number of days in the given month
     *	  L      0          Whether its a leap year (1 if it is a leap year, else 0)
     *	  Y      2007       A full numeric representation of a year, 4 digits
     *	  y      07         A two digit representation of a year
     *	  a      pm         Lowercase Ante meridiem and Post meridiem
     *	  A      PM         Uppercase Ante meridiem and Post meridiem
     *	  g      3          12-hour format of an hour without leading zeros
     *	  G      15         24-hour format of an hour without leading zeros
     *	  h      03         12-hour format of an hour with leading zeros
     *	  H      15         24-hour format of an hour with leading zeros
     *	  i      05         Minutes with leading zeros
     *	  s      01         Seconds, with leading zeros
     *	  O      -0600      Difference to Greenwich time (GMT) in hours
     *	  T      CST        Timezone setting of the machine running the code
     *	  Z      -21600     Timezone offset in seconds (negative if west of UTC, positive if east)
     *
     * Example:
     *  F j, Y, g:i a  ->  January 10, 2007, 3:05 pm
     */
    dateFormat: function(){
        return this._jsonProp.dateFormat;
    },
    
    /**
     * If type is color, this method returns if the fill property should
     *  be set.
     *  @return {Boolean}
     */
    fill: function(){
        return this._jsonProp.fill;
    },
    
    /**
     * If type is color, this method returns if the stroke property should
     *  be set.
     *  @return {Boolean}
     */
    stroke: function(){
        return this._jsonProp.stroke;
    },
    
    /**
     * If type is choice, items is a hash map with all alternative values
     * (PropertyItem objects) with id as keys.
     */
    items: function(){
        return this._items.values();
    },
    
    item: function(value){
        return this._items[value];
    },
    
    toString: function(){
        return "Property " + this.title() + " (" + this.id() + ")";
    },
    
    // extended by Kerstin (start)
    complexItems: function(){
        return this._complexItems.values();
    },
    
    complexItem: function(id){
        return this._complexItems[id];
    },
    // extended by Kerstin (end)
    
    complexAttributeToView: function(){
        return this._jsonProp.complexAttributeToView || "";
    }
});
/**
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

/**
 * Init namespace
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.StencilSet) {ORYX.Core.StencilSet = {};}

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.PropertyItem = Clazz.extend({

	/**
	 * Constructor
	 */
	construct: function(jsonItem, namespace, property) {
		arguments.callee.$.construct.apply(this, arguments);

		if(!jsonItem) {
			throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter jsonItem is not defined.";
		}
		if(!namespace) {
			throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter namespace is not defined.";
		}
		if(!property) {
			throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter property is not defined.";
		}
		
		this._jsonItem = jsonItem;
		this._namespace = namespace;
		this._property = property;
		
		//init all values
		if(!jsonItem.value) {
			throw "ORYX.Core.StencilSet.PropertyItem(construct): Value is not defined.";
		}
		
		if(this._jsonItem.refToView) {
			if(!(this._jsonItem.refToView instanceof Array)) {
				this._jsonItem.refToView = [this._jsonItem.refToView];
			}
		} else {
			this._jsonItem.refToView = [];
		}
	},

	/**
	 * @param {ORYX.Core.StencilSet.PropertyItem} item
	 * @return {Boolean} True, if item has the same namespace and id.
	 */
	equals: function(item) {
		return (this.property().equals(item.property()) &&
			this.value() === item.value());
	},

	namespace: function() {
		return this._namespace;
	},

	property: function() {
		return this._property;
	},

	value: function() {
		return this._jsonItem.value;
	},
	
	title: function() {
		return ORYX.Core.StencilSet.getTranslation(this._jsonItem, "title");
	},

	refToView: function() {
		return this._jsonItem.refToView;
	},
	
	icon: function() {
		return (this._jsonItem.icon) ? this.property().stencil()._source + "icons/" + this._jsonItem.icon : "";
	},

	toString: function() { return "PropertyItem " + this.property() + " (" + this.value() + ")"; }
});/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.StencilSet) {ORYX.Core.StencilSet = {};}

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.ComplexPropertyItem = Clazz.extend({

	/**
	 * Constructor
	 */
	construct: function(jsonItem, namespace, property) {
		arguments.callee.$.construct.apply(this, arguments);

		if(!jsonItem) {
			throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter jsonItem is not defined.";
		}
		if(!namespace) {
			throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter namespace is not defined.";
		}
		if(!property) {
			throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter property is not defined.";
		}
		
		this._jsonItem = jsonItem;
		this._namespace = namespace;
		this._property = property;
		this._items = new Hash();
		
		//init all values
		if(!jsonItem.name) {
			throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Name is not defined.";
		}
		
		if(!jsonItem.type) {
			throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Type is not defined.";
		} else {
			jsonItem.type = jsonItem.type.toLowerCase();
		}
		
		if(jsonItem.type === ORYX.CONFIG.TYPE_CHOICE) {
			if(jsonItem.items && jsonItem.items instanceof Array) {
				jsonItem.items.each((function(item) {
					this._items[item.value] = new ORYX.Core.StencilSet.PropertyItem(item, namespace, this);
				}).bind(this));
			} else {
				throw "ORYX.Core.StencilSet.Property(construct): No property items defined."
			}
		}
	},

	/**
	 * @param {ORYX.Core.StencilSet.PropertyItem} item
	 * @return {Boolean} True, if item has the same namespace and id.
	 */
	equals: function(item) {
		return (this.property().equals(item.property()) &&
			this.name() === item.name());
	},

	namespace: function() {
		return this._namespace;
	},

	property: function() {
		return this._property;
	},

	name: function() {
		return ORYX.Core.StencilSet.getTranslation(this._jsonItem, "name");
	},
	
	id: function() {
		return this._jsonItem.id;
	},
	
	type: function() {
		return this._jsonItem.type;
	},
	
	optional: function() {
		return this._jsonItem.optional;
	},
	
	width: function() {
		return this._jsonItem.width;
	},
	
	value: function() {
		return this._jsonItem.value;
	},
	
	items: function() {
		return this._items.values();
	},
	
	disable: function() {
		return this._jsonItem.disable;
	}
});/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.StencilSet) {ORYX.Core.StencilSet = {};}

/**
 * Class Rules uses Prototpye 1.5.0 uses Inheritance
 * 
 * This class implements the API to check the stencil sets' rules.
 */
ORYX.Core.StencilSet.Rules = {

	/**
	 * Constructor
	 */
	construct: function() {
		arguments.callee.$.construct.apply(this, arguments);

		this._stencilSets = [];
		this._stencils = [];
		
		this._cachedConnectSET = new Hash();
		this._cachedConnectSE = new Hash();
		this._cachedConnectTE = new Hash();
		this._cachedCardSE = new Hash();
		this._cachedCardTE = new Hash();
		this._cachedContainPC = new Hash();
		this._cachedMorphRS = new Hash();
		
		this._connectionRules = new Hash();
		this._cardinalityRules = new Hash();
		this._containmentRules = new Hash();
		this._morphingRules = new Hash();
		this._layoutRules = new Hash();
	},
	
	/**
	 * Call this method to initialize the rules for a stencil set and all of its
	 * active extensions.
	 * 
	 * @param {Object}
	 *            stencilSet
	 */
	initializeRules: function(stencilSet) {
		
		var existingSS = this._stencilSets.find(function(ss) {
							return (ss.namespace() == stencilSet.namespace());
						});
		if (existingSS) {
			// reinitialize all rules
			var stencilsets = this._stencilSets.clone();
			stencilsets = stencilsets.without(existingSS);
			stencilsets.push(stencilSet);
			
			this._stencilSets = [];
			this._stencils = [];
			
			this._cachedConnectSET = new Hash();
			this._cachedConnectSE = new Hash();
			this._cachedConnectTE = new Hash();
			this._cachedCardSE = new Hash();
			this._cachedCardTE = new Hash();
			this._cachedContainPC = new Hash();
			this._cachedMorphRS = new Hash();
			
			this._connectionRules = new Hash();
			this._cardinalityRules = new Hash();
			this._containmentRules = new Hash();
			this._morphingRules = new Hash();
			this._layoutRules = new Hash();
			
			stencilsets.each(function(ss){
				this.initializeRules(ss);
			}.bind(this));
			return;
		}
		else {
			this._stencilSets.push(stencilSet);
			
			var jsonRules = new Hash(stencilSet.jsonRules());
			var namespace = stencilSet.namespace();
			var stencils = stencilSet.stencils();
			
			stencilSet.extensions().values().each(function(extension) {
				if(extension.rules) {
					if(extension.rules.connectionRules)
						jsonRules.connectionRules = jsonRules.connectionRules.concat(extension.rules.connectionRules);
					if(extension.rules.cardinalityRules)
						jsonRules.cardinalityRules = jsonRules.cardinalityRules.concat(extension.rules.cardinalityRules);
					if(extension.rules.containmentRules)
						jsonRules.containmentRules = jsonRules.containmentRules.concat(extension.rules.containmentRules);
					if(extension.rules.morphingRules)
						jsonRules.morphingRules = jsonRules.morphingRules.concat(extension.rules.morphingRules);
				}
				if(extension.stencils) 
					stencils = stencils.concat(extension.stencils);
			});
			
			this._stencils = this._stencils.concat(stencilSet.stencils());
			
			// init connection rules
			var cr = this._connectionRules;
			if (jsonRules.connectionRules) {
				jsonRules.connectionRules.each((function(rules){
					if (this._isRoleOfOtherNamespace(rules.role)) {
						if (!cr[rules.role]) {
							cr[rules.role] = new Hash();
						}
					}
					else {
						if (!cr[namespace + rules.role]) 
							cr[namespace + rules.role] = new Hash();
					}
					
					rules.connects.each((function(connect){
						var toRoles = [];
						if (connect.to) {
							if (!(connect.to instanceof Array)) {
								connect.to = [connect.to];
							}
							connect.to.each((function(to){
								if (this._isRoleOfOtherNamespace(to)) {
									toRoles.push(to);
								}
								else {
									toRoles.push(namespace + to);
								}
							}).bind(this));
						}
						
						var role, from;
						if (this._isRoleOfOtherNamespace(rules.role)) 
							role = rules.role;
						else 
							role = namespace + rules.role;
						
						if (this._isRoleOfOtherNamespace(connect.from)) 
							from = connect.from;
						else 
							from = namespace + connect.from;
						
						if (!cr[role][from]) 
							cr[role][from] = toRoles;
						else 
							cr[role][from] = cr[role][from].concat(toRoles);
						
					}).bind(this));
				}).bind(this));
			}
			
			// init cardinality rules
			var cardr = this._cardinalityRules;
			if (jsonRules.cardinalityRules) {
				jsonRules.cardinalityRules.each((function(rules){
					var cardrKey;
					if (this._isRoleOfOtherNamespace(rules.role)) {
						cardrKey = rules.role;
					}
					else {
						cardrKey = namespace + rules.role;
					}
					
					if (!cardr[cardrKey]) {
						cardr[cardrKey] = {};
						for (i in rules) {
							cardr[cardrKey][i] = rules[i];
						}
					}
					
					var oe = new Hash();
					if (rules.outgoingEdges) {
						rules.outgoingEdges.each((function(rule){
							if (this._isRoleOfOtherNamespace(rule.role)) {
								oe[rule.role] = rule;
							}
							else {
								oe[namespace + rule.role] = rule;
							}
						}).bind(this));
					}
					cardr[cardrKey].outgoingEdges = oe;
					var ie = new Hash();
					if (rules.incomingEdges) {
						rules.incomingEdges.each((function(rule){
							if (this._isRoleOfOtherNamespace(rule.role)) {
								ie[rule.role] = rule;
							}
							else {
								ie[namespace + rule.role] = rule;
							}
						}).bind(this));
					}
					cardr[cardrKey].incomingEdges = ie;
				}).bind(this));
			}
			
			// init containment rules
			var conr = this._containmentRules;
			if (jsonRules.containmentRules) {
				jsonRules.containmentRules.each((function(rules){
					var conrKey;
					if (this._isRoleOfOtherNamespace(rules.role)) {
						conrKey = rules.role;
					}
					else {
						conrKey = namespace + rules.role;
					}
					if (!conr[conrKey]) {
						conr[conrKey] = [];
					}
					rules.contains.each((function(containRole){
						if (this._isRoleOfOtherNamespace(containRole)) {
							conr[conrKey].push(containRole);
						}
						else {
							conr[conrKey].push(namespace + containRole);
						}
					}).bind(this));
				}).bind(this));
			}
			
			// init morphing rules
			var morphr = this._morphingRules;
			if (jsonRules.morphingRules) {
				jsonRules.morphingRules.each((function(rules){
					var morphrKey;
					if (this._isRoleOfOtherNamespace(rules.role)) {
						morphrKey = rules.role;
					}
					else {
						morphrKey = namespace + rules.role;
					}
					if (!morphr[morphrKey]) {
						morphr[morphrKey] = [];
					}
					if(!rules.preserveBounds) {
						rules.preserveBounds = false;
					}
					rules.baseMorphs.each((function(baseMorphStencilId){
						morphr[morphrKey].push(this._getStencilById(namespace + baseMorphStencilId));
					}).bind(this));
				}).bind(this));
			}
			
			// init layouting rules
			var layoutRules = this._layoutRules;
			if (jsonRules.layoutRules) {
				
				var getDirections = function(o){
					return {
							"edgeRole":o.edgeRole||undefined,
							"t": o["t"]||1,
							"r": o["r"]||1,
							"b": o["b"]||1,
							"l": o["l"]||1
						}
				}
				
				jsonRules.layoutRules.each(function(rules){
					var layoutKey;
					if (this._isRoleOfOtherNamespace(rules.role)) {
						layoutKey = rules.role;
					}
					else {
						layoutKey = namespace + rules.role;
					}
					if (!layoutRules[layoutKey]) {
						layoutRules[layoutKey] = {};
					}
					if (rules["in"]){
						layoutRules[layoutKey]["in"] = getDirections(rules["in"]);
					}
					if (rules["ins"]){
						layoutRules[layoutKey]["ins"] = (rules["ins"]||[]).map(function(e){ return getDirections(e) })
					}
					if (rules["out"]) {
						layoutRules[layoutKey]["out"] = getDirections(rules["out"]);
					}
					if (rules["outs"]){
						layoutRules[layoutKey]["outs"] = (rules["outs"]||[]).map(function(e){ return getDirections(e) })
					}
				}.bind(this));
			}			
		}
	},
	
	_getStencilById: function(id) {
		return this._stencils.find(function(stencil) {
			return stencil.id()==id;
		});
	},
	
	_cacheConnect: function(args) {
		result = this._canConnect(args);
		
		if (args.sourceStencil && args.targetStencil) {
			var source = this._cachedConnectSET[args.sourceStencil.id()];
			
			if(!source) {
				source = new Hash();
				this._cachedConnectSET[args.sourceStencil.id()] = source;
			}
			
			var edge = source[args.edgeStencil.id()];
			
			if(!edge) {
				edge = new Hash();
				source[args.edgeStencil.id()] = edge;
			}
			
			edge[args.targetStencil.id()] = result;
			
		} else if (args.sourceStencil) {
			var source = this._cachedConnectSE[args.sourceStencil.id()];
			
			if(!source) {
				source = new Hash();
				this._cachedConnectSE[args.sourceStencil.id()] = source;
			}
			
			source[args.edgeStencil.id()] = result;

		} else {
			var target = this._cachedConnectTE[args.targetStencil.id()];
			
			if(!target) {
				target = new Hash();
				this._cachedConnectTE[args.targetStencil.id()] = target;
			}
			
			target[args.edgeStencil.id()] = result;
		}
		
		return result;
	},
	
	_cacheCard: function(args) {
			
		if(args.sourceStencil) {
			var source = this._cachedCardSE[args.sourceStencil.id()]
			
			if(!source) {
				source = new Hash();
				this._cachedCardSE[args.sourceStencil.id()] = source;
			}
			
			var max = this._getMaximumNumberOfOutgoingEdge(args);
			if(max == undefined)
				max = -1;
				
			source[args.edgeStencil.id()] = max;
		}	
		
		if(args.targetStencil) {
			var target = this._cachedCardTE[args.targetStencil.id()]
			
			if(!target) {
				target = new Hash();
				this._cachedCardTE[args.targetStencil.id()] = target;
			}
			
			var max = this._getMaximumNumberOfIncomingEdge(args);
			if(max == undefined)
				max = -1;
				
			target[args.edgeStencil.id()] = max;
		}
	},
	
	/**
	 * The name of this method is misleading. 
	 * It returns the stencils that can be contained in a 
	 * stencil defined by the input parameter.  
	 */
	_cacheContain: function(args) {
		//The result variable is an array with two fields. 
		//The first field contains the result if the input
		//args.contained stencil can contain the args.containingStencil.
		//The second field returns the maximum number of time the 
		//args.containingStencil stencil can be contained in args.containedStencil
		var result = [this._canContain(args), 
					  this._getMaximumOccurrence(args.containingStencil, args.containedStencil)]
		
		//If there is no maximum number for the args.containingStencil
		//we set the second field of the result array to -1
		//which must be a common value for not defined values :-)
		if(result[1] == undefined) 
			result[1] = -1;
		
		//The rest of this method is useless besides the return statement
		//The children array isn't used anymore after it was assigned. 
		var children = this._cachedContainPC[args.containingStencil.id()];
		
		//If there are no children we create a new hashmap for future children
		//with an empty hash map
		if(!children) {
			children = new Hash();
			this._cachedContainPC[args.containingStencil.id()] = children;
		}
		

		children[args.containedStencil.id()] = result;
		
		return result;
	},
	
	/**
	 * Returns all stencils belonging to a morph group. (calculation result is
	 * cached)
	 */
	_cacheMorph: function(role) {
		
		var morphs = this._cachedMorphRS[role];
		
		if(!morphs) {
			morphs = [];
			
			if(this._morphingRules.keys().include(role)) {
				morphs = this._stencils.select(function(stencil) {
					return stencil.roles().include(role);
				});
			}
			
			this._cachedMorphRS[role] = morphs;
		}
		return morphs;
	},
	
	/** Begin connection rules' methods */
	
	/**
	 * 
	 * @param {Object}
	 *            args sourceStencil: ORYX.Core.StencilSet.Stencil | undefined
	 *            sourceShape: ORYX.Core.Shape | undefined
	 * 
	 * At least sourceStencil or sourceShape has to be specified
	 * 
	 * @return {Array} Array of stencils of edges that can be outgoing edges of
	 *         the source.
	 */
	outgoingEdgeStencils: function(args) {
		// check arguments
		if(!args.sourceShape && !args.sourceStencil) {
			return [];
		}
		
		// init arguments
		if(args.sourceShape) {
			args.sourceStencil = args.sourceShape.getStencil();
		}
		
		var _edges = [];
		
		// test each edge, if it can connect to source
		this._stencils.each((function(stencil) {
			if(stencil.type() === "edge") {
				var newArgs = Object.clone(args);
				newArgs.edgeStencil = stencil;
				if(this.canConnect(newArgs)) {
					_edges.push(stencil);
				}
			}
		}).bind(this));

		return _edges;
	},

	/**
	 * 
	 * @param {Object}
	 *            args targetStencil: ORYX.Core.StencilSet.Stencil | undefined
	 *            targetShape: ORYX.Core.Shape | undefined
	 * 
	 * At least targetStencil or targetShape has to be specified
	 * 
	 * @return {Array} Array of stencils of edges that can be incoming edges of
	 *         the target.
	 */
	incomingEdgeStencils: function(args) {
		// check arguments
		if(!args.targetShape && !args.targetStencil) {
			return [];
		}
		
		// init arguments
		if(args.targetShape) {
			args.targetStencil = args.targetShape.getStencil();
		}
		
		var _edges = [];
		
		// test each edge, if it can connect to source
		this._stencils.each((function(stencil) {
			if(stencil.type() === "edge") {
				var newArgs = Object.clone(args);
				newArgs.edgeStencil = stencil;
				if(this.canConnect(newArgs)) {
					_edges.push(stencil);
				}
			}
		}).bind(this));

		return _edges;
	},
	
	/**
	 * 
	 * @param {Object}
	 *            args edgeStencil: ORYX.Core.StencilSet.Stencil | undefined
	 *            edgeShape: ORYX.Core.Edge | undefined targetStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
	 *            ORYX.Core.Node | undefined
	 * 
	 * At least edgeStencil or edgeShape has to be specified!!!
	 * 
	 * @return {Array} Returns an array of stencils that can be source of the
	 *         specified edge.
	 */
	sourceStencils: function(args) {
		// check arguments
		if(!args || 
		   !args.edgeShape && !args.edgeStencil) {
			return [];
		}
		
		// init arguments
		if(args.targetShape) {
			args.targetStencil = args.targetShape.getStencil();
		}
		
		if(args.edgeShape) {
			args.edgeStencil = args.edgeShape.getStencil();
		}
		
		var _sources = [];
		
		// check each stencil, if it can be a source
		this._stencils.each((function(stencil) {
			var newArgs = Object.clone(args);
			newArgs.sourceStencil = stencil;
			if(this.canConnect(newArgs)) {
				_sources.push(stencil);
			}
		}).bind(this));

		return _sources;
	},
	
	/**
	 * 
	 * @param {Object}
	 *            args edgeStencil: ORYX.Core.StencilSet.Stencil | undefined
	 *            edgeShape: ORYX.Core.Edge | undefined sourceStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
	 *            ORYX.Core.Node | undefined
	 * 
	 * At least edgeStencil or edgeShape has to be specified!!!
	 * 
	 * @return {Array} Returns an array of stencils that can be target of the
	 *         specified edge.
	 */
	targetStencils: function(args) {
		// check arguments
		if(!args || 
		   !args.edgeShape && !args.edgeStencil) {
			return [];
		}
		
		// init arguments
		if(args.sourceShape) {
			args.sourceStencil = args.sourceShape.getStencil();
		}
		
		if(args.edgeShape) {
			args.edgeStencil = args.edgeShape.getStencil();
		}
		
		var _targets = [];
		
		// check stencil, if it can be a target
		this._stencils.each((function(stencil) {
			var newArgs = Object.clone(args);
			newArgs.targetStencil = stencil;
			if(this.canConnect(newArgs)) {
				_targets.push(stencil);
			}
		}).bind(this));

		return _targets;
	},

	/**
	 * 
	 * @param {Object}
	 *            args edgeStencil: ORYX.Core.StencilSet.Stencil edgeShape:
	 *            ORYX.Core.Edge |undefined sourceStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
	 *            ORYX.Core.Node |undefined targetStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
	 *            ORYX.Core.Node |undefined
	 * 
	 * At least source or target has to be specified!!!
	 * 
	 * @return {Boolean} Returns, if the edge can connect source and target.
	 */
	canConnect: function(args) {	
		// check arguments
		if(!args ||
		   (!args.sourceShape && !args.sourceStencil &&
		    !args.targetShape && !args.targetStencil) ||
		    !args.edgeShape && !args.edgeStencil) {
		   	return false; 
		}
		
		// init arguments
		if(args.sourceShape) {
			args.sourceStencil = args.sourceShape.getStencil();
		}
		if(args.targetShape) {
			args.targetStencil = args.targetShape.getStencil();
		}
		if(args.edgeShape) {
			args.edgeStencil = args.edgeShape.getStencil();
		}
		
		var result;
		
		if(args.sourceStencil && args.targetStencil) {
			var source = this._cachedConnectSET[args.sourceStencil.id()];
			
			if(!source)
				result = this._cacheConnect(args);
			else {
				var edge = source[args.edgeStencil.id()];

				if(!edge)
					result = this._cacheConnect(args);
				else {	
					var target = edge[args.targetStencil.id()];

					if(target == undefined)
						result = this._cacheConnect(args);
					else
						result = target;
				}
			}
		} else if (args.sourceStencil) {	
			var source = this._cachedConnectSE[args.sourceStencil.id()];
			
			if(!source)
				result = this._cacheConnect(args);
			else {
				var edge = source[args.edgeStencil.id()];
					
				if(edge == undefined)
					result = this._cacheConnect(args);
				else
					result = edge;
			}
		} else { // args.targetStencil
			var target = this._cachedConnectTE[args.targetStencil.id()];
			
			if(!target)
				result = this._cacheConnect(args);
			else {
				var edge = target[args.edgeStencil.id()];
					
				if(edge == undefined)
					result = this._cacheConnect(args);
				else
					result = edge;
			}
		}	
			
		// check cardinality
		if (result) {
			if(args.sourceShape) {
				var source = this._cachedCardSE[args.sourceStencil.id()];
				
				if(!source) {
					this._cacheCard(args);
					source = this._cachedCardSE[args.sourceStencil.id()];
				}
				
				var max = source[args.edgeStencil.id()];
				
				if(max == undefined) {
					this._cacheCard(args);
				}
				
				max = source[args.edgeStencil.id()];
				
				if(max != -1) {
					result = args.sourceShape.getOutgoingShapes().all(function(cs) {
								if((cs.getStencil().id() === args.edgeStencil.id()) && 
								   ((args.edgeShape) ? cs !== args.edgeShape : true)) {
									max--;
									return (max > 0) ? true : false;
								} else {
									return true;
								}
							});
				}
			} 
			
			if (args.targetShape) {
				var target = this._cachedCardTE[args.targetStencil.id()];
				
				if(!target) {
					this._cacheCard(args);
					target = this._cachedCardTE[args.targetStencil.id()];
				}
				
				var max = target[args.edgeStencil.id()];
				
				if(max == undefined) {
					this._cacheCard(args);
				}
				
				max = target[args.edgeStencil.id()];
				
				if(max != -1) {
					result = args.targetShape.getIncomingShapes().all(function(cs){
								if ((cs.getStencil().id() === args.edgeStencil.id()) &&
								((args.edgeShape) ? cs !== args.edgeShape : true)) {
									max--;
									return (max > 0) ? true : false;
								}
								else {
									return true;
								}
							});
				}
			}
		}
		
		return result;
	},
	
	/**
	 * 
	 * @param {Object}
	 *            args edgeStencil: ORYX.Core.StencilSet.Stencil edgeShape:
	 *            ORYX.Core.Edge |undefined sourceStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
	 *            ORYX.Core.Node |undefined targetStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
	 *            ORYX.Core.Node |undefined
	 * 
	 * At least source or target has to be specified!!!
	 * 
	 * @return {Boolean} Returns, if the edge can connect source and target.
	 */
	_canConnect: function(args) {
		// check arguments
		if(!args ||
		   (!args.sourceShape && !args.sourceStencil &&
		    !args.targetShape && !args.targetStencil) ||
		    !args.edgeShape && !args.edgeStencil) {
		   	return false; 
		}
		
		// init arguments
		if(args.sourceShape) {
			args.sourceStencil = args.sourceShape.getStencil();
		}
		if(args.targetShape) {
			args.targetStencil = args.targetShape.getStencil();
		}
		if(args.edgeShape) {
			args.edgeStencil = args.edgeShape.getStencil();
		}

		// 1. check connection rules
		var resultCR;
		
		// get all connection rules for this edge
		var edgeRules = this._getConnectionRulesOfEdgeStencil(args.edgeStencil);

		// check connection rules, if the source can be connected to the target
		// with the specified edge.
		if(edgeRules.keys().length === 0) {
			resultCR = false;
		} else {
			if(args.sourceStencil) {
				resultCR = args.sourceStencil.roles().any(function(sourceRole) {
					var targetRoles = edgeRules[sourceRole];

					if(!targetRoles) {return false;}
		
					if(args.targetStencil) {
						return (targetRoles.any(function(targetRole) {
							return args.targetStencil.roles().member(targetRole);
						}));
					} else {
						return true;
					}
				});
			} else { // !args.sourceStencil -> there is args.targetStencil
				resultCR = edgeRules.values().any(function(targetRoles) {
					return args.targetStencil.roles().any(function(targetRole) {
						return targetRoles.member(targetRole);
					});
				});
			}
		}
		
		return resultCR;
	},

	/** End connection rules' methods */


	/** Begin containment rules' methods */

	/**
	 * Check if a stencil can be contained by another stencil. 
	 * @param {Object}
	 *            args containingStencil: ORYX.Core.StencilSet.Stencil
	 *            containingShape: ORYX.Core.AbstractShape containedStencil:
	 *            ORYX.Core.StencilSet.Stencil containedShape: ORYX.Core.Shape
	 */
	canContain: function(args) {
		if(!args ||
		   !args.containingStencil && !args.containingShape ||
		   !args.containedStencil && !args.containedShape) {
		   	return false;
		}
		
		// init arguments
		//Useless shifts. 
		if(args.containedShape) {
			args.containedStencil = args.containedShape.getStencil();
		}
		
		if(args.containingShape) {
			args.containingStencil = args.containingShape.getStencil();
		}
		
		
		//if(args.containingStencil.type() == 'edge' || args.containedStencil.type() == 'edge')
		//	return false;
		if(args.containedStencil.type() == 'edge') 
			return false;
		
		var childValues;
		//parent is a array of roles with a corresponding array. 
		//The array has two fields (Boolean, integer). The first field tells if a corresponding
		//role can be contained within the stencil we want to put another stencil in. 
		var parent = this._cachedContainPC[args.containingStencil.id()];
		
		//ChildValues contains an array of boolean and integer.  
		//If parent is undefined we 
		if(!parent)
			childValues = this._cacheContain(args);
		else {
			//Here we get one array out of the parent array
			//by querying with the stencil id of the stencil we 
			//just want to put into another stencil. 
			childValues = parent[args.containedStencil.id()];
			
			if(!childValues)
				childValues = this._cacheContain(args);
		}

		if(!childValues[0])
			return false;
		else if (childValues[1] == -1)
			return true;
		else {
			if(args.containingShape) {
				var max = childValues[1];
				return args.containingShape.getChildShapes(false).all(function(as) {
					if(as.getStencil().id() === args.containedStencil.id()) {
						max--;
						return (max > 0) ? true : false;
					} else {
						return true;
					}
				});
			} else {
				return true;
			}
		}
	},
	
	/**
	 * This method checks if the args.containingStencil stencil
	 * can contain the args.containedStencil stencil. 
	 * @param {Object}
	 *            args containingStencil: ORYX.Core.StencilSet.Stencil
	 *            containingShape: ORYX.Core.AbstractShape containedStencil:
	 *            ORYX.Core.StencilSet.Stencil containedShape: ORYX.Core.Shape
	 */
	_canContain: function(args) {
		//Check for undefined values
		if(!args ||
		   !args.containingStencil && !args.containingShape ||
		   !args.containedStencil && !args.containedShape) {
		   	return false;
		}
		
		// Useless checks. It would be better to describe the
		//args object instead of shifting values in it. 
		if(args.containedShape) {
			args.containedStencil = args.containedShape.getStencil();
		}
		
		if(args.containingShape) {
			args.containingStencil = args.containingShape.getStencil();
		}
		
//		if(args.containingShape) {
//			if(args.containingShape instanceof ORYX.Core.Edge) {
//				// edges cannot contain other shapes
//				return false;
//			}
//		}

		
		var result;
		
		// check containment rules
		//We loop through all roles of the stencil we just moved
		//over with the mouse while draging another stencil. 
		result = args.containingStencil.roles().any((function(role) {
			//this._containmentRules is an array of an array of roles.
			//The inner array are roles that can be contained by the roles
			//named by the outer array. Example: [subprocess[sequence_end, ...]]. 
			//So the roles are the roles that can be contained within a stencil
			//with the role from the current iteration. 
			var roles = this._containmentRules[role];
			if(roles) {
				return roles.any(function(role) {
					//Here we look if the role of the current stencil allows
					//it to contain the role of the stencil we just drag. 
					//The roles of these stencils must be the same. 
					return args.containedStencil.roles().member(role);
				});
			} else {
				return false;
			}
		}).bind(this));
		
		return result;
	},
	
	/** End containment rules' methods */
	
	
	/** Begin morphing rules' methods */
	
	/**
	 * 
	 * @param {Object}
	 *           args 
	 *            stencil: ORYX.Core.StencilSet.Stencil | undefined 
	 *            shape: ORYX.Core.Shape | undefined
	 * 
	 * At least stencil or shape has to be specified
	 * 
	 * @return {Array} Array of stencils that the passed stencil/shape can be
	 *         transformed to (including the current stencil itself)
	 */
	morphStencils: function(args) {
		// check arguments
		if(!args.stencil && !args.shape) {
			return [];
		}
		
		// init arguments
		if(args.shape) {
			args.stencil = args.shape.getStencil();
		}
		
		var _morphStencils = [];
		args.stencil.roles().each(function(role) {
			this._cacheMorph(role).each(function(stencil) {
				_morphStencils.push(stencil);
			})
		}.bind(this));

		return _morphStencils.uniq();
	},
	
	/**
	 * @return {Array} An array of all base morph stencils
	 */
	baseMorphs: function() {
		var _baseMorphs = [];
		this._morphingRules.each(function(pair) {
			pair.value.each(function(baseMorph) {
				_baseMorphs.push(baseMorph);
			});
		});
		return _baseMorphs;
	},
	
	/**
	 * Returns true if there are morphing rules defines
	 * @return {boolean} 
	 */
	containsMorphingRules: function(){
		return this._stencilSets.any(function(ss){ return !!ss.jsonRules().morphingRules});
	},
	
	/**
	 * 
	 * @param {Object}
	 *            args 
	 *            sourceStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined 
	 *            sourceShape:
	 *            ORYX.Core.Node |undefined 
	 *            targetStencil:
	 *            ORYX.Core.StencilSet.Stencil | undefined 
	 *            targetShape:
	 *            ORYX.Core.Node |undefined
	 * 
	 * 
	 * @return {Stencil} Returns, the stencil for the connecting edge 
	 * or null if connection is not possible
	 */
	connectMorph: function(args) {	
		// check arguments
		if(!args ||
		   (!args.sourceShape && !args.sourceStencil &&
		    !args.targetShape && !args.targetStencil)) {
		   	return false; 
		}
		
		// init arguments
		if(args.sourceShape) {
			args.sourceStencil = args.sourceShape.getStencil();
		}
		if(args.targetShape) {
			args.targetStencil = args.targetShape.getStencil();
		}
		
		var incoming = this.incomingEdgeStencils(args);
		var outgoing = this.outgoingEdgeStencils(args);
		
		var edgeStencils = incoming.select(function(e) { return outgoing.member(e); }); // intersection of sets
		var baseEdgeStencils = this.baseMorphs().select(function(e) { return edgeStencils.member(e); }); // again: intersection of sets
		
		if(baseEdgeStencils.size()>0)
			return baseEdgeStencils[0]; // return any of the possible base morphs
		else if(edgeStencils.size()>0)
			return edgeStencils[0];	// return any of the possible stencils
		
		return null; //connection not possible
	},
	
	/**
	 * Return true if the stencil should be located in the shape menu
	 * @param {ORYX.Core.StencilSet.Stencil} morph
	 * @return {Boolean} Returns true if the morphs in the morph group of the
	 * specified morph shall be displayed in the shape menu
	 */
	showInShapeMenu: function(stencil) {
		return 	this._stencilSets.any(function(ss){
				    return ss.jsonRules().morphingRules
							.any(function(r){
								return 	stencil.roles().include(ss.namespace() + r.role) 
										&& r.showInShapeMenu !== false;
							})
				});
	},
	
	preserveBounds: function(stencil) {
		return this._stencilSets.any(function(ss) {
			return ss.jsonRules().morphingRules.any(function(r) {
				
				
				return stencil.roles().include(ss.namespace() + r.role) 
					&& r.preserveBounds;
			})
		})
	},
	
	/** End morphing rules' methods */


	/** Begin layouting rules' methods */
	
	/**
	 * Returns a set on "in" and "out" layouting rules for a given shape
	 * @param {Object} shape
	 * @param {Object} edgeShape (Optional)
	 * @return {Object} "in" and "out" with a default value of {"t":1, "r":1, "b":1, "r":1} if not specified in the json
	 */
	getLayoutingRules : function(shape, edgeShape){
		
		if (!shape||!(shape instanceof ORYX.Core.Shape)){ return }
		
		var layout = {"in":{},"out":{}};
		
		var parseValues = function(o, v){
			if (o && o[v]){
				["t","r","b","l"].each(function(d){
					layout[v][d]=Math.max(o[v][d],layout[v][d]||0);
				});
			}
			if (o && o[v+"s"] instanceof Array){
				["t","r","b","l"].each(function(d){
					var defaultRule = o[v+"s"].find(function(e){ return !e.edgeRole });
					var edgeRule;
					if (edgeShape instanceof ORYX.Core.Edge) {
						edgeRule = o[v + "s"].find(function(e){return this._hasRole(edgeShape, e.edgeRole) }.bind(this));
					}
					layout[v][d]=Math.max(edgeRule?edgeRule[d]:defaultRule[d],layout[v][d]||0);
				}.bind(this));
			}
		}.bind(this)
		
		// For each role
		shape.getStencil().roles().each(function(role) {
			// check if there are layout information
			if (this._layoutRules[role]){
				// if so, parse those information to the 'layout' variable
				parseValues(this._layoutRules[role], "in");
				parseValues(this._layoutRules[role], "out");
			}
		}.bind(this));
		
		// Make sure, that every attribute has an value,
		// otherwise set 1
		["in","out"].each(function(v){
			["t","r","b","l"].each(function(d){
					layout[v][d]=layout[v][d]!==undefined?layout[v][d]:1;
				});
		})
		
		return layout;
	},
	
	/** End layouting rules' methods */
	
	/** Helper methods */

	/**
	 * Checks wether a shape contains the given role or the role is equal the stencil id 
	 * @param {ORYX.Core.Shape} shape
	 * @param {String} role
	 */
	_hasRole: function(shape, role){
		if (!(shape instanceof ORYX.Core.Shape)||!role){ return }
		var isRole = shape.getStencil().roles().any(function(r){ return r == role});
		
		return isRole || shape.getStencil().id() == (shape.getStencil().namespace()+role);
	},

	/**
	 * 
	 * @param {String}
	 *            role
	 * 
	 * @return {Array} Returns an array of stencils that can act as role.
	 */
	_stencilsWithRole: function(role) {
		return this._stencils.findAll(function(stencil) {
			return (stencil.roles().member(role)) ? true : false;
		});
	},
	
	/**
	 * 
	 * @param {String}
	 *            role
	 * 
	 * @return {Array} Returns an array of stencils that can act as role and
	 *         have the type 'edge'.
	 */
	_edgesWithRole: function(role) {
		return this._stencils.findAll(function(stencil) {
			return (stencil.roles().member(role) && stencil.type() === "edge") ? true : false;
		});
	},
	
	/**
	 * 
	 * @param {String}
	 *            role
	 * 
	 * @return {Array} Returns an array of stencils that can act as role and
	 *         have the type 'node'.
	 */
	_nodesWithRole: function(role) {
		return this._stencils.findAll(function(stencil) {
			return (stencil.roles().member(role) && stencil.type() === "node") ? true : false;
		});
	},

	/**
	 * 
	 * @param {ORYX.Core.StencilSet.Stencil}
	 *            parent
	 * @param {ORYX.Core.StencilSet.Stencil}
	 *            child
	 * 
	 * @returns {Boolean} Returns the maximum occurrence of shapes of the
	 *          stencil's type inside the parent.
	 */
	_getMaximumOccurrence: function(parent, child) {
		var max;
		child.roles().each((function(role) {
			var cardRule = this._cardinalityRules[role];
			if(cardRule && cardRule.maximumOccurrence) {
				if(max) {
					max = Math.min(max, cardRule.maximumOccurrence);
				} else {
					max = cardRule.maximumOccurrence;
				}
			}
		}).bind(this));

		return max;
	},


	/**
	 * 
	 * @param {Object}
	 *            args sourceStencil: ORYX.Core.Node edgeStencil:
	 *            ORYX.Core.StencilSet.Stencil
	 * 
	 * @return {Boolean} Returns, the maximum number of outgoing edges of the
	 *         type specified by edgeStencil of the sourceShape.
	 */
	_getMaximumNumberOfOutgoingEdge: function(args) {
		if(!args ||
		   !args.sourceStencil ||
		   !args.edgeStencil) {
		   	return false;
		}
		
		var max;
		args.sourceStencil.roles().each((function(role) {
			var cardRule = this._cardinalityRules[role];

			if(cardRule && cardRule.outgoingEdges) {
				args.edgeStencil.roles().each(function(edgeRole) {
					var oe = cardRule.outgoingEdges[edgeRole];

					if(oe && oe.maximum) {
						if(max) {
							max = Math.min(max, oe.maximum);
						} else {
							max = oe.maximum;
						}
					}
				});
			}
		}).bind(this));

		return max;
	},
	
	/**
	 * 
	 * @param {Object}
	 *            args targetStencil: ORYX.Core.StencilSet.Stencil edgeStencil:
	 *            ORYX.Core.StencilSet.Stencil
	 * 
	 * @return {Boolean} Returns the maximum number of incoming edges of the
	 *         type specified by edgeStencil of the targetShape.
	 */
	_getMaximumNumberOfIncomingEdge: function(args) {
		if(!args ||
		   !args.targetStencil ||
		   !args.edgeStencil) {
		   	return false;
		}
		
		var max;
		args.targetStencil.roles().each((function(role) {
			var cardRule = this._cardinalityRules[role];
			if(cardRule && cardRule.incomingEdges) {
				args.edgeStencil.roles().each(function(edgeRole) {
					var ie = cardRule.incomingEdges[edgeRole];
					if(ie && ie.maximum) {
						if(max) {
							max = Math.min(max, ie.maximum);
						} else {
							max = ie.maximum;
						}
					}
				});
			}
		}).bind(this));

		return max;
	},
	
	/**
	 * 
	 * @param {ORYX.Core.StencilSet.Stencil}
	 *            edgeStencil
	 * 
	 * @return {Hash} Returns a hash map of all connection rules for
	 *         edgeStencil.
	 */
	_getConnectionRulesOfEdgeStencil: function(edgeStencil) {
		var edgeRules = new Hash();
		edgeStencil.roles().each((function(role) {
			if(this._connectionRules[role]) {
				this._connectionRules[role].each(function(cr) {
					if(edgeRules[cr.key]) {
						edgeRules[cr.key] = edgeRules[cr.key].concat(cr.value);
					} else {
						edgeRules[cr.key] = cr.value;
					}
				});
			}
		}).bind(this));
		
		return edgeRules;
	},
	
	_isRoleOfOtherNamespace: function(role) {
		return (role.indexOf("#") > 0);
	},

	toString: function() { return "Rules"; }
}
ORYX.Core.StencilSet.Rules = Clazz.extend(ORYX.Core.StencilSet.Rules);

/**
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
/**
 * Init namespace
 */
if (!ORYX) {
    var ORYX = {};
}
if (!ORYX.Core) {
    ORYX.Core = {};
}
if (!ORYX.Core.StencilSet) {
    ORYX.Core.StencilSet = {};
}

/**
 * This class represents a stencil set. It offers methods for accessing
 *  the attributes of the stencil set description JSON file and the stencil set's
 *  stencils.
 */
ORYX.Core.StencilSet.StencilSet = Clazz.extend({

    /**
     * Constructor
     * @param source {URL} A reference to the stencil set specification.
     *
     */
    construct: function(source){
        arguments.callee.$.construct.apply(this, arguments);
        
        if (!source) {
            throw "ORYX.Core.StencilSet.StencilSet(construct): Parameter 'source' is not defined.";
        }
        
        if (source.endsWith("/")) {
            source = source.substr(0, source.length - 1);
        }
		
		this._extensions = new Hash();
        
        this._source = source;
        this._baseUrl = source.substring(0, source.lastIndexOf("/") + 1);
        
        this._jsonObject = {};
        
        this._stencils = new Hash();
		this._availableStencils = new Hash();
        
		if(ORYX.CONFIG.BACKEND_SWITCH) {
			//get the url of the stencil set json file
			new Ajax.Request(source, {
	            asynchronous: false,
	            method: 'get',
	            onSuccess: this._getJSONURL.bind(this),
	            onFailure: this._cancelInit.bind(this)
	        });
		} else {
			new Ajax.Request(source, {
	            asynchronous: false,
	            method: 'get',
	            onSuccess: this._init.bind(this),
	            onFailure: this._cancelInit.bind(this)
	        });
		}
        
        if (this.errornous) 
            throw "Loading stencil set " + source + " failed.";
    },
    
    /**
     * Finds a root stencil in this stencil set. There may be many of these. If
     * there are, the first one found will be used. In Firefox, this is the
     * topmost definition in the stencil set description file.
     */
    findRootStencilName: function(){
    
        // find any stencil that may be root.
        var rootStencil = this._stencils.values().find(function(stencil){
            return stencil._jsonStencil.mayBeRoot
        });
        
		// if there is none, just guess the first.
		if (!rootStencil) {
			ORYX.Log.warn("Did not find any stencil that may be root. Taking a guess.");
			rootStencil = this._stencils.values()[0];
		}

        // return its id.
        return rootStencil.id();
    },
    
    /**
     * @param {ORYX.Core.StencilSet.StencilSet} stencilSet
     * @return {Boolean} True, if stencil set has the same namespace.
     */
    equals: function(stencilSet){
        return (this.namespace() === stencilSet.namespace());
    },
    
	/**
	 * 
	 * @param {Oryx.Core.StencilSet.Stencil} rootStencil If rootStencil is defined, it only returns stencils
	 * 			that could be (in)direct child of that stencil.
	 */
    stencils: function(rootStencil, rules, sortByGroup){
		if(rootStencil && rules) {
			var stencils = this._availableStencils.values();
			var containers = [rootStencil];
			var checkedContainers = [];
			
			var result = [];
			
			while (containers.size() > 0) {
				var container = containers.pop();
				checkedContainers.push(container);
				var children = stencils.findAll(function(stencil){
					var args = {
						containingStencil: container,
						containedStencil: stencil
					};
					return rules.canContain(args);
				});
				for(var i = 0; i < children.size(); i++) {
					if (!checkedContainers.member(children[i])) {
						containers.push(children[i]);
					}
				}
				result = result.concat(children).uniq();
			}
			
			// Sort the result to the origin order
			result = result.sortBy(function(stencil) {
				return stencils.indexOf(stencil);
			});
			
			
			if(sortByGroup) {
				result = result.sortBy(function(stencil) {
					return stencil.groups().first();
				});
			}
			
			var edges = stencils.findAll(function(stencil) {
				return stencil.type() == "edge";
			});
			result = result.concat(edges);
			
			return result;
			
		} else {
        	if(sortByGroup) {
				return this._availableStencils.values().sortBy(function(stencil) {
					return stencil.groups().first();
				});
			} else {
				return this._availableStencils.values();
			}
		}
    },
    
    nodes: function(){
        return this._availableStencils.values().findAll(function(stencil){
            return (stencil.type() === 'node')
        });
    },
    
    edges: function(){
        return this._availableStencils.values().findAll(function(stencil){
            return (stencil.type() === 'edge')
        });
    },
    
    stencil: function(id){
        return this._stencils[id];
    },
    
    title: function(){
        return ORYX.Core.StencilSet.getTranslation(this._jsonObject, "title");
    },
    
    description: function(){
        return ORYX.Core.StencilSet.getTranslation(this._jsonObject, "description");
    },
    
    namespace: function(){
        return this._jsonObject ? this._jsonObject.namespace : null;
    },
    
    jsonRules: function(){
        return this._jsonObject ? this._jsonObject.rules : null;
    },
    
    source: function(){
        return this._source;
    },
	
	extensions: function() {
		return this._extensions;
	},
	
	addExtension: function(url) {
		
		new Ajax.Request(url, {
            method: 'GET',
            asynchronous: false,
			onSuccess: (function(transport) {
				this.addExtensionDirectly(transport.responseText);
			}).bind(this),
			onFailure: (function(transport) {
				ORYX.Log.debug("Loading stencil set extension file failed. The request returned an error." + transport);
			}).bind(this),
			onException: (function(transport) {
				ORYX.Log.debug("Loading stencil set extension file failed. The request returned an error." + transport);
			}).bind(this)
		
		});
	},
	
	addExtensionDirectly: function(str){

		try {
			eval("var jsonExtension = " + str);

			if(!(jsonExtension["extends"].endsWith("#")))
					jsonExtension["extends"] += "#";
					
			if(jsonExtension["extends"] == this.namespace()) {
				this._extensions[jsonExtension.namespace] = jsonExtension;
				
				var defaultPosition = this._stencils.keys().size();
				//load new stencils
				if(jsonExtension.stencils) {
					$A(jsonExtension.stencils).each(function(stencil) {
						defaultPosition++;
						var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this, undefined, defaultPosition);            
						this._stencils[oStencil.id()] = oStencil;
						this._availableStencils[oStencil.id()] = oStencil;
					}.bind(this));
				}
				
				//load additional properties
				if (jsonExtension.properties) {
					var stencils = this._stencils.values();
					
					stencils.each(function(stencil){
						var roles = stencil.roles();
						
						jsonExtension.properties.each(function(prop){
							prop.roles.any(function(role){
								role = jsonExtension["extends"] + role;
								if (roles.member(role)) {
									prop.properties.each(function(property){
										stencil.addProperty(property, jsonExtension.namespace);
									});
									
									return true;
								}
								else 
									return false;
							})
						})
					}.bind(this));
				}
				
				//remove stencil properties
				if(jsonExtension.removeproperties) {
					jsonExtension.removeproperties.each(function(remprop) {
						var stencil = this.stencil(jsonExtension["extends"] + remprop.stencil);
						if(stencil) {
							remprop.properties.each(function(propId) {
								stencil.removeProperty(propId);
							});
						}
					}.bind(this));
				}
				
				//remove stencils
				if(jsonExtension.removestencils) {
					$A(jsonExtension.removestencils).each(function(remstencil) {
						delete this._availableStencils[jsonExtension["extends"] + remstencil];
					}.bind(this));
				}
			}
		} catch (e) {
			ORYX.Log.debug("StencilSet.addExtension: Something went wrong when initialising the stencil set extension. " + e);
		}	
	},
	
	removeExtension: function(namespace) {
		var jsonExtension = this._extensions[namespace];
		if(jsonExtension) {
			
			//unload extension's stencils
			if(jsonExtension.stencils) {
				$A(jsonExtension.stencils).each(function(stencil) {
					var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this);            
					delete this._stencils[oStencil.id()]; // maybe not ??
					delete this._availableStencils[oStencil.id()];
				}.bind(this));
			}
			
			//unload extension's properties
			if (jsonExtension.properties) {
				var stencils = this._stencils.values();
				
				stencils.each(function(stencil){
					var roles = stencil.roles();
					
					jsonExtension.properties.each(function(prop){
						prop.roles.any(function(role){
							role = jsonExtension["extends"] + role;
							if (roles.member(role)) {
								prop.properties.each(function(property){
									stencil.removeProperty(property.id);
								});
								
								return true;
							}
							else 
								return false;
						})
					})
				}.bind(this));
			}
			
			//restore removed stencil properties
			if(jsonExtension.removeproperties) {
				jsonExtension.removeproperties.each(function(remprop) {
					var stencil = this.stencil(jsonExtension["extends"] + remprop.stencil);
					if(stencil) {
						var stencilJson = $A(this._jsonObject.stencils).find(function(s) { return s.id == stencil.id() });
						remprop.properties.each(function(propId) {
							var propertyJson = $A(stencilJson.properties).find(function(p) { return p.id == propId });
							stencil.addProperty(propertyJson, this.namespace());
						}.bind(this));
					}
				}.bind(this));
			}
			
			//restore removed stencils
			if(jsonExtension.removestencils) {
				$A(jsonExtension.removestencils).each(function(remstencil) {
					var sId = jsonExtension["extends"] + remstencil;
					this._availableStencils[sId] = this._stencils[sId];
				}.bind(this));
			}
		}
		delete this._extensions[namespace];
	},
    
    __handleStencilset: function(response){
    
        try {
            // using eval instead of prototype's parsing,
            // since there are functions in this JSON.
            eval("this._jsonObject =" + response.responseText);
        } 
        catch (e) {
            throw "Stenciset corrupt: " + e;
        }
        
        // assert it was parsed.
        if (!this._jsonObject) {
            throw "Error evaluating stencilset. It may be corrupt.";
        }
        
        with (this._jsonObject) {
        
            // assert there is a namespace.
            if (!namespace || namespace === "") 
                throw "Namespace definition missing in stencilset.";
            
            if (!(stencils instanceof Array)) 
                throw "Stencilset corrupt.";
            
            // assert namespace ends with '#'.
            if (!namespace.endsWith("#")) 
                namespace = namespace + "#";
            
            // assert title and description are strings.
            if (!title) 
                title = "";
            if (!description) 
                description = "";
        }
    },
	
	_getJSONURL: function(response) {
		this._baseUrl = response.responseText.substring(0, response.responseText.lastIndexOf("/") + 1);
		this._source = response.responseText;
		new Ajax.Request(response.responseText, {
            asynchronous: false,
            method: 'get',
            onSuccess: this._init.bind(this),
            onFailure: this._cancelInit.bind(this)
        });
	},
    
    /**
     * This method is called when the HTTP request to get the requested stencil
     * set succeeds. The response is supposed to be a JSON representation
     * according to the stencil set specification.
     * @param {Object} response The JSON representation according to the
     * 			stencil set specification.
     */
    _init: function(response){
    
        // init and check consistency.
        this.__handleStencilset(response);
		
		var pps = new Hash();
		
		// init property packages
		if(this._jsonObject.propertyPackages) {
			$A(this._jsonObject.propertyPackages).each((function(pp) {
				pps[pp.name] = pp.properties;
			}).bind(this));
		}
		
		var defaultPosition = 0;
		
        // init each stencil
        $A(this._jsonObject.stencils).each((function(stencil){
        	defaultPosition++;
        	
            // instantiate normally.
            var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this, pps, defaultPosition);      
			this._stencils[oStencil.id()] = oStencil;
			this._availableStencils[oStencil.id()] = oStencil;
            
        }).bind(this));
    },
    
    _cancelInit: function(response){
        this.errornous = true;
    },
    
    toString: function(){
        return "StencilSet " + this.title() + " (" + this.namespace() + ")";
    }
});
/**
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

/**
 * Init namespace
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.StencilSet) {ORYX.Core.StencilSet = {};}

/**
 * Class StencilSets
 * uses Prototpye 1.5.0
 * uses Inheritance
 *
 * Singleton
 */
//storage for loaded stencil sets by namespace
ORYX.Core.StencilSet._stencilSetsByNamespace = new Hash();

//storage for stencil sets by url
ORYX.Core.StencilSet._stencilSetsByUrl = new Hash();	

//storage for stencil set namespaces by editor instances
ORYX.Core.StencilSet._StencilSetNSByEditorInstance = new Hash();

//storage for rules by editor instances
ORYX.Core.StencilSet._rulesByEditorInstance = new Hash();

/**
 * 
 * @param {String} editorId
 * 
 * @return {Hash} Returns a hash map with all stencil sets that are loaded by
 * 					the editor with the editorId.
 */
ORYX.Core.StencilSet.stencilSets = function(editorId) {
	var stencilSetNSs = ORYX.Core.StencilSet._StencilSetNSByEditorInstance[editorId];
	var stencilSets = new Hash();
	if(stencilSetNSs) {
		stencilSetNSs.each(function(stencilSetNS) {
			var stencilSet = ORYX.Core.StencilSet.stencilSet(stencilSetNS)
			stencilSets[stencilSet.namespace()] = stencilSet;
		});
	}
	return stencilSets;
};

/**
 * 
 * @param {String} namespace
 * 
 * @return {ORYX.Core.StencilSet.StencilSet} Returns the stencil set with the specified
 * 										namespace.
 * 
 * The method can handle namespace strings like
 *  http://www.example.org/stencilset
 *  http://www.example.org/stencilset#
 *  http://www.example.org/stencilset#ANode
 */
ORYX.Core.StencilSet.stencilSet = function(namespace) {
	ORYX.Log.trace("Getting stencil set %0", namespace);
	var splitted = namespace.split("#", 1);
	if(splitted.length === 1) {
		ORYX.Log.trace("Getting stencil set %0", splitted[0]);
		return ORYX.Core.StencilSet._stencilSetsByNamespace[splitted[0] + "#"];
	} else {
		return undefined;
	}
};

/**
 * 
 * @param {String} id
 * 
 * @return {ORYX.Core.StencilSet.Stencil} Returns the stencil specified by the id.
 * 
 * The id must be unique and contains the namespace of the stencil's stencil set.
 * e.g. http://www.example.org/stencilset#ANode
 */
ORYX.Core.StencilSet.stencil = function(id) {
	ORYX.Log.trace("Getting stencil for %0", id);
	var ss = ORYX.Core.StencilSet.stencilSet(id);
	if(ss) {
		return ss.stencil(id);
	} else {

		ORYX.Log.trace("Cannot fild stencil for %0", id);
		return undefined;
	}
};

/**
 * 
 * @param {String} editorId
 * 
 * @return {ORYX.Core.StencilSet.Rules} Returns the rules object for the editor
 * 									specified by its editor id.
 */
ORYX.Core.StencilSet.rules = function(editorId) {
	if(!ORYX.Core.StencilSet._rulesByEditorInstance[editorId]) {
		ORYX.Core.StencilSet._rulesByEditorInstance[editorId] = new ORYX.Core.StencilSet.Rules();;
	}
	return ORYX.Core.StencilSet._rulesByEditorInstance[editorId];
};

/**
 * 
 * @param {String} url
 * @param {String} editorId
 * 
 * Loads a stencil set from url, if it is not already loaded.
 * It also stores which editor instance loads the stencil set and 
 * initializes the Rules object for the editor instance.
 */
ORYX.Core.StencilSet.loadStencilSet = function(url, editorId) {
	var stencilSet = ORYX.Core.StencilSet._stencilSetsByUrl[url];

	if(!stencilSet) {
		//load stencil set
		stencilSet = new ORYX.Core.StencilSet.StencilSet(url);
		
		//store stencil set
		ORYX.Core.StencilSet._stencilSetsByNamespace[stencilSet.namespace()] = stencilSet;
		
		//store stencil set by url
		ORYX.Core.StencilSet._stencilSetsByUrl[url] = stencilSet;
	}
	
	var namespace = stencilSet.namespace();
	
	//store which editorInstance loads the stencil set
	if(ORYX.Core.StencilSet._StencilSetNSByEditorInstance[editorId]) {
		ORYX.Core.StencilSet._StencilSetNSByEditorInstance[editorId].push(namespace);
	} else {
		ORYX.Core.StencilSet._StencilSetNSByEditorInstance[editorId] = [namespace];
	}

	//store the rules for the editor instance
	if(ORYX.Core.StencilSet._rulesByEditorInstance[editorId]) {
		ORYX.Core.StencilSet._rulesByEditorInstance[editorId].initializeRules(stencilSet);
	} else {
		var rules = new ORYX.Core.StencilSet.Rules();
		rules.initializeRules(stencilSet);
		ORYX.Core.StencilSet._rulesByEditorInstance[editorId] = rules;
	}
};

/**
 * Returns the translation of an attribute in jsonObject specified by its name
 * according to navigator.language
 */
ORYX.Core.StencilSet.getTranslation = function(jsonObject, name) {
	var lang = ORYX.I18N.Language.toLowerCase();
	
	var result = jsonObject[name + "_" + lang];
	
	if(result)
		return result;
		
	result = jsonObject[name + "_" + lang.substr(0, 2)];
	
	if(result)
		return result;
		
	return jsonObject[name];
};
/**
 * Copyright (c) 2006
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}


/**
 * @classDescription With Bounds you can set and get position and size of UIObjects.
 */
ORYX.Core.Command = Clazz.extend({

	/**
	 * Constructor
	 */
	construct: function() {

	},
	
	execute: function(){
		throw "Command.execute() has to be implemented!"
	},
	
	rollback: function(){
		throw "Command.rollback() has to be implemented!"
	}
	
	
 });/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}


/**
 * @classDescription With Bounds you can set and get position and size of UIObjects.
 */
ORYX.Core.Bounds = {

	/**
	 * Constructor
	 */
	construct: function() {
		this._changedCallbacks = []; //register a callback with changedCallacks.push(this.method.bind(this));
		this.a = {};
		this.b = {};
		this.set.apply(this, arguments);
		this.suspendChange = false;
		this.changedWhileSuspend = false;
	},
	
	/**
	 * Calls all registered callbacks.
	 */
	_changed: function(sizeChanged) {
		if(!this.suspendChange) {
			this._changedCallbacks.each(function(callback) {
				callback(this, sizeChanged);
			}.bind(this));
			this.changedWhileSuspend = false;
		} else
			this.changedWhileSuspend = true;
	},
	
	/**
	 * Registers a callback that is called, if the bounds changes.
	 * @param callback {Function} The callback function.
	 */
	registerCallback: function(callback) {
		if(!this._changedCallbacks.member(callback)) {
			this._changedCallbacks.push(callback);	
		}
	},
	
	/**
	 * Unregisters a callback.
	 * @param callback {Function} The callback function.
	 */
	unregisterCallback: function(callback) {
			this._changedCallbacks = this._changedCallbacks.without(callback);
	},
	
	/**
	 * Sets position and size of the shape dependent of four coordinates
	 * (set(ax, ay, bx, by);), two points (set({x: ax, y: ay}, {x: bx, y: by});)
	 * or one bound (set({a: {x: ax, y: ay}, b: {x: bx, y: by}});).
	 */
	set: function() {
		
		var changed = false;
		
		switch (arguments.length) {
		
			case 1:
				if(this.a.x !== arguments[0].a.x) {
					changed = true;
					this.a.x = arguments[0].a.x;
				}
				if(this.a.y !== arguments[0].a.y) {
					changed = true;
					this.a.y = arguments[0].a.y;
				}
				if(this.b.x !== arguments[0].b.x) {
					changed = true;
					this.b.x = arguments[0].b.x;
				}
				if(this.b.y !== arguments[0].b.y) {
					changed = true;
					this.b.y = arguments[0].b.y;
				}
				break;
			
			case 2:
				var ax = Math.min(arguments[0].x, arguments[1].x);
				var ay = Math.min(arguments[0].y, arguments[1].y);
				var bx = Math.max(arguments[0].x, arguments[1].x);
				var by = Math.max(arguments[0].y, arguments[1].y);
				if(this.a.x !== ax) {
					changed = true;
					this.a.x = ax;
				}
				if(this.a.y !== ay) {
					changed = true;
					this.a.y = ay;
				}
				if(this.b.x !== bx) {
					changed = true;
					this.b.x = bx;
				}
				if(this.b.y !== by) {
					changed = true;
					this.b.y = by;
				}
				break;
			
			case 4:
				var ax = Math.min(arguments[0], arguments[2]);
				var ay = Math.min(arguments[1], arguments[3]);
				var bx = Math.max(arguments[0], arguments[2]);
				var by = Math.max(arguments[1], arguments[3]);
				if(this.a.x !== ax) {
					changed = true;
					this.a.x = ax;
				}
				if(this.a.y !== ay) {
					changed = true;
					this.a.y = ay;
				}
				if(this.b.x !== bx) {
					changed = true;
					this.b.x = bx;
				}
				if(this.b.y !== by) {
					changed = true;
					this.b.y = by;
				}
				break;
		}
		
		if(changed) {
			this._changed(true);
		}
	},
	
	/**
	 * Moves the bounds so that the point p will be the new upper left corner.
	 * @param {Point} p
	 * or
	 * @param {Number} x
	 * @param {Number} y
	 */
	moveTo: function() {
		
		var currentPosition = this.upperLeft();
		switch (arguments.length) {
			case 1:
				this.moveBy({
					x: arguments[0].x - currentPosition.x,
					y: arguments[0].y - currentPosition.y
				});
				break;
			case 2:
				this.moveBy({
					x: arguments[0] - currentPosition.x,
					y: arguments[1] - currentPosition.y
				});
				break;
			default:
				//TODO error
		}
		
	},
	
	/**
	 * Moves the bounds relatively by p.
	 * @param {Point} p
	 * or
	 * @param {Number} x
	 * @param {Number} y
	 * 
	 */
	moveBy: function() {
		var changed = false;
		
		switch (arguments.length) {
			case 1:
				var p = arguments[0];
				if(p.x !== 0 || p.y !== 0) {
					changed = true;
					this.a.x += p.x;
					this.b.x += p.x;
					this.a.y += p.y;
					this.b.y += p.y;
				}
				break;	
			case 2:
				var x = arguments[0];
				var y = arguments[1];
				if(x !== 0 || y !== 0) {
					changed = true;
					this.a.x += x;
					this.b.x += x;
					this.a.y += y;
					this.b.y += y;
				}
				break;	
			default:
				//TODO error
		}
		
		if(changed) {
			this._changed();
		}
	},
	
	/***
	 * Includes the bounds b into the current bounds.
	 * @param {Bounds} b
	 */
	include: function(b) {
		
		if( (this.a.x === undefined) && (this.a.y === undefined) &&
			(this.b.x === undefined) && (this.b.y === undefined)) {
			return b;
		};
		
		var cx = Math.min(this.a.x,b.a.x);
		var cy = Math.min(this.a.y,b.a.y);
		
		var dx = Math.max(this.b.x,b.b.x);
		var dy = Math.max(this.b.y,b.b.y);

		
		this.set(cx, cy, dx, dy);
	},
	
	/**
	 * Relatively extends the bounds by p.
	 * @param {Point} p
	 */
	extend: function(p) {
		
		if(p.x !== 0 || p.y !== 0) {
			// this is over cross for the case that a and b have same coordinates.
			//((this.a.x > this.b.x) ? this.a : this.b).x += p.x;
			//((this.b.y > this.a.y) ? this.b : this.a).y += p.y;
			this.b.x += p.x;
			this.b.y += p.y;
			
			this._changed(true);
		}
	},
	
	/**
	 * Widens the scope of the bounds by x.
	 * @param {Number} x
	 */
	widen: function(x) {
		if (x !== 0) {
			this.suspendChange = true;
			this.moveBy({x: -x, y: -x});
			this.extend({x: 2*x, y: 2*x});
			this.suspendChange = false;
			if(this.changedWhileSuspend) {
				this._changed(true);
			}
		}
	},
	
	/**
	 * Returns the upper left corner's point regardless of the
	 * bound delimiter points.
	 */
	upperLeft: function() {
		
		return {x:this.a.x, y:this.a.y};
	},
	
	/**
	 * Returns the lower Right left corner's point regardless of the
	 * bound delimiter points.
	 */
	lowerRight: function() {
		
		return {x:this.b.x, y:this.b.y};
	},
	
	/**
	 * @return {Number} Width of bounds.
	 */
	width: function() {
		return this.b.x - this.a.x;
	},
	
	/**
	 * @return {Number} Height of bounds.
	 */
	height: function() {
		return this.b.y - this.a.y;
	},
	
	/**
	 * @return {Point} The center point of this bounds.
	 */
	center: function() {
		return {
			x: (this.a.x + this.b.x)/2.0, 
			y: (this.a.y + this.b.y)/2.0
		};
	},

	
	/**
	 * @return {Point} The center point of this bounds relative to upperLeft.
	 */
	midPoint: function() {
		return {
			x: (this.b.x - this.a.x)/2.0, 
			y: (this.b.y - this.a.y)/2.0
		};
	},
		
	/**
	 * Moves the center point of this bounds to the new position.
	 * @param p {Point} 
	 * or
	 * @param x {Number}
	 * @param y {Number}
	 */
	centerMoveTo: function() {
		var currentPosition = this.center();
		
		switch (arguments.length) {
			
			case 1:
				this.moveBy(arguments[0].x - currentPosition.x,
							arguments[0].y - currentPosition.y);
				break;
			
			case 2:
				this.moveBy(arguments[0] - currentPosition.x,
							arguments[1] - currentPosition.y);
				break;
		}
	},
	
	isIncluded: function(point, offset) {
		
		var pointX, pointY, offset;

		// Get the the two Points	
		switch(arguments.length) {
			case 1:
				pointX = arguments[0].x;
				pointY = arguments[0].y;
				offset = 0;
				
				break;
			case 2:
				if(arguments[0].x && arguments[0].y) {
					pointX = arguments[0].x;
					pointY = arguments[0].y;
					offset = Math.abs(arguments[1]);
				} else {
					pointX = arguments[0];
					pointY = arguments[1];
					offset = 0;
				}
				break;
			case 3:
				pointX = arguments[0];
				pointY = arguments[1];
				offset = Math.abs(arguments[2]);
				break;
			default:
				throw "isIncluded needs one, two or three arguments";
		}
				
		var ul = this.upperLeft();
		var lr = this.lowerRight();
		
		if(pointX >= ul.x - offset 
			&& pointX <= lr.x + offset && pointY >= ul.y - offset 
			&& pointY <= lr.y + offset)
			return true;
		else 
			return false;
	},
	
	/**
	 * @return {Bounds} A copy of this bounds.
	 */
	clone: function() {
		
		//Returns a new bounds object without the callback
		// references of the original bounds
		return new ORYX.Core.Bounds(this);
	},
	
	toString: function() {
		
		return "( "+this.a.x+" | "+this.a.y+" )/( "+this.b.x+" | "+this.b.y+" )";
	},
	
	serializeForERDF: function() {

		return this.a.x+","+this.a.y+","+this.b.x+","+this.b.y;
	}
 };
 
ORYX.Core.Bounds = Clazz.extend(ORYX.Core.Bounds);/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}/** * @classDescription Abstract base class for all objects that have a graphical representation * within the editor. * @extends Clazz */ORYX.Core.UIObject = {	/**	 * Constructor of the UIObject class.	 */	construct: function(options) {					this.isChanged = true;			//Flag, if UIObject has been changed since last update.		this.isResized = true;		this.isVisible = true;			//Flag, if UIObject's display attribute is set to 'inherit' or 'none'		this.isSelectable = false;		//Flag, if UIObject is selectable.		this.isResizable = false;		//Flag, if UIObject is resizable.		this.isMovable = false;			//Flag, if UIObject is movable.				this.id = ORYX.Editor.provideId();	//get unique id		this.parent = undefined;		//parent is defined, if this object is added to another uiObject.		this.node = undefined;			//this is a reference to the SVG representation, either locally or in DOM.		this.children = [];				//array for all add uiObjects				this.bounds = new ORYX.Core.Bounds();		//bounds with undefined values		this._changedCallback = this._changed.bind(this);	//callback reference for calling _changed		this.bounds.registerCallback(this._changedCallback);	//set callback in bounds				if(options && options.eventHandlerCallback) {			this.eventHandlerCallback = options.eventHandlerCallback;		}	},		/**	 * Sets isChanged flag to true. Callback for the bounds object.	 */	_changed: function(bounds, isResized) {		this.isChanged = true;		if(this.bounds == bounds)			this.isResized = isResized || this.isResized;	},		/**	 * If something changed, this method calls the refresh method that must be implemented by subclasses.	 */	update: function() {		if(this.isChanged) {			this.refresh();			this.isChanged = false;						//call update of all children			this.children.each(function(value) {				value.update();			});		}	},		/**	 * Is called in update method, if isChanged is set to true. Sub classes should call the super class method.	 */	refresh: function() {			},		/**	 * @return {Array} Array of all child UIObjects.	 */	getChildren: function() {		return this.children.clone();	},		/**	 * @return {Array} Array of all parent UIObjects.	 */	getParents: function(){		var parents = [];		var parent = this.parent;		while(parent){			parents.push(parent);			parent = parent.parent;		}		return parents;	},		/**	 * Returns TRUE if the given parent is one of the UIObjects parents or the UIObject themselves, otherwise FALSE.	 * @param {UIObject} parent	 * @return {Boolean} 	 */	isParent: function(parent){		var cparent = this;		while(cparent){			if (cparent === parent){				return true;			}			cparent = cparent.parent;		}		return false;	},		/**	 * @return {String} Id of this UIObject	 */	getId: function() {		return this.id;	},		/**	 * Method for accessing child uiObjects by id.	 * @param {String} id	 * @param {Boolean} deep	 * 	 * @return {UIObject} If found, it returns the UIObject with id.	 */	getChildById: function(id, deep) {		return this.children.find(function(uiObj) {			if(uiObj.getId() === id) {				return uiObj;			} else {				if(deep) {					var obj = uiObj.getChildById(id, deep);					if(obj) {						return obj;					}				}			}		});	},		/**	 * Adds an UIObject to this UIObject and sets the parent of the	 * added UIObject. It is also added to the SVG representation of this	 * UIObject.	 * @param {UIObject} uiObject	 */	add: function(uiObject) {		//add uiObject, if it is not already a child of this object		if (!(this.children.member(uiObject))) {			//if uiObject is child of another parent, remove it from that parent.			if(uiObject.parent) {				uiObject.remove(uiObject);			}						//add uiObject to children			this.children.push(uiObject);						//set parent reference			uiObject.parent = this;						//add uiObject.node to this.node			uiObject.node = this.node.appendChild(uiObject.node);						//register callback to get informed, if child is changed			uiObject.bounds.registerCallback(this._changedCallback);								if(this.eventHandlerCallback)				this.eventHandlerCallback({type:ORYX.CONFIG.EVENT_SHAPEADDED,shape:uiObject})			//uiObject.update();		} else {			ORYX.Log.info("add: ORYX.Core.UIObject is already a child of this object.");		}	},		/**	 * Removes UIObject from this UIObject. The SVG representation will also	 * be removed from this UIObject's SVG representation.	 * @param {UIObject} uiObject	 */	remove: function(uiObject) {		//if uiObject is a child of this object, remove it.		if (this.children.member(uiObject)) {			//remove uiObject from children			this.children = this._uiObjects.without(uiObject);						//delete parent reference of uiObject			uiObject.parent = undefined;						//delete uiObject.node from this.node			uiObject.node = this.node.removeChild(uiObject.node);						//unregister callback to get informed, if child is changed			uiObject.bounds.unregisterCallback(this._changedCallback);		} else {			ORYX.Log.info("remove: ORYX.Core.UIObject is not a child of this object.");		}			},		/**	 * Calculates absolute bounds of this UIObject.	 */	absoluteBounds: function() {		if(this.parent) {			var absUL = this.absoluteXY();			return new ORYX.Core.Bounds(absUL.x, absUL.y,							absUL.x + this.bounds.width(),							absUL.y + this.bounds.height());		} else {			return this.bounds.clone();		}	},	/**	 * @return {Point} The absolute position of this UIObject.	 */	absoluteXY: function() {		if(this.parent) {			var pXY = this.parent.absoluteXY();					return {x: pXY.x + this.bounds.upperLeft().x , y: pXY.y + this.bounds.upperLeft().y};					} else {			return {x: this.bounds.upperLeft().x , y: this.bounds.upperLeft().y};		}	},	/**	 * @return {Point} The absolute position from the Center of this UIObject.	 */	absoluteCenterXY: function() {		if(this.parent) {			var pXY = this.parent.absoluteXY();					return {x: pXY.x + this.bounds.center().x , y: pXY.y + this.bounds.center().y};					} else {			return {x: this.bounds.center().x , y: this.bounds.center().y};		}	},		/**	 * Hides this UIObject and all its children.	 */	hide: function() {		this.node.setAttributeNS(null, 'display', 'none');		this.isVisible = false;		this.children.each(function(uiObj) {			uiObj.hide();			});	},		/**	 * Enables visibility of this UIObject and all its children.	 */	show: function() {		this.node.setAttributeNS(null, 'display', 'inherit');		this.isVisible = true;		this.children.each(function(uiObj) {			uiObj.show();			});			},		addEventHandlers: function(node) {				node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this._delegateEvent.bind(this), false);		node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this._delegateEvent.bind(this), false);			node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this._delegateEvent.bind(this), false);		node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this._delegateEvent.bind(this), false);		node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, this._delegateEvent.bind(this), false);		node.addEventListener('click', this._delegateEvent.bind(this), false);		node.addEventListener(ORYX.CONFIG.EVENT_DBLCLICK, this._delegateEvent.bind(this), false);				},			_delegateEvent: function(event) {		if(this.eventHandlerCallback) {			this.eventHandlerCallback(event, this);		}	},		toString: function() { return "UIObject " + this.id } }; ORYX.Core.UIObject = Clazz.extend(ORYX.Core.UIObject);/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}

/**
 * Top Level uiobject.
 * @class ORYX.Core.AbstractShape
 * @extends ORYX.Core.UIObject
 */
ORYX.Core.AbstractShape = ORYX.Core.UIObject.extend(
/** @lends ORYX.Core.AbstractShape.prototype */
{

	/**
	 * Constructor
	 */
	construct: function(options, stencil) {
		
		arguments.callee.$.construct.apply(this, arguments);
		
		this.resourceId = ORYX.Editor.provideId(); //Id of resource in DOM
		
		// stencil reference
		this._stencil = stencil;
		// if the stencil defines a super stencil that should be used for its instances, set it.
		if (this._stencil._jsonStencil.superId){
			stencilId = this._stencil.id()
			superStencilId = stencilId.substring(0, stencilId.indexOf("#") + 1) + stencil._jsonStencil.superId;
			stencilSet =  this._stencil.stencilSet();
			this._stencil = stencilSet.stencil(superStencilId);
		}
		
		//Hash map for all properties. Only stores the values of the properties.
		this.properties = new Hash();
		this.propertiesChanged = new Hash();

		// List of properties which are not included in the stencilset, 
		// but which gets (de)serialized
		this.hiddenProperties = new Hash();
		
		
		//Initialization of property map and initial value.
		this._stencil.properties().each((function(property) {
			var key = property.prefix() + "-" + property.id();
			this.properties[key] = property.value();
			this.propertiesChanged[key] = true;
		}).bind(this));
		
		// if super stencil was defined, also regard stencil's properties:
		if (stencil._jsonStencil.superId) {
			stencil.properties().each((function(property) {
				var key = property.prefix() + "-" + property.id();
				var value = property.value();
				var oldValue = this.properties[key];
				this.properties[key] = value;
				this.propertiesChanged[key] = true;

				// Raise an event, to show that the property has changed
				// required for plugins like processLink.js
				//window.setTimeout( function(){

					this._delegateEvent({
							type	: ORYX.CONFIG.EVENT_PROPERTY_CHANGED, 
							name	: key, 
							value	: value,
							oldValue: oldValue
						});

				//}.bind(this), 10)

			}).bind(this));
		}

	},

	layout: function() {

	},
	
	/**
	 * Returns the stencil object specifiing the type of the shape.
	 */
	getStencil: function() {
		return this._stencil;
	},
	
	/**
	 * 
	 * @param {Object} resourceId
	 */
	getChildShapeByResourceId: function(resourceId) {

		resourceId = ERDF.__stripHashes(resourceId);
		
		return this.getChildShapes(true).find(function(shape) {
					return shape.resourceId == resourceId
				});
	},
	/**
	 * 
	 * @param {Object} deep
	 * @param {Object} iterator
	 */
	getChildShapes: function(deep, iterator) {
		var result = [];

		this.children.each(function(uiObject) {
			if(uiObject instanceof ORYX.Core.Shape && uiObject.isVisible ) {
				if(iterator) {
					iterator(uiObject);
				}
				result.push(uiObject);
				if(deep) {
					result = result.concat(uiObject.getChildShapes(deep, iterator));
				} 
			}
		});

		return result;
	},
    
    /**
     * @param {Object} shape
     * @return {boolean} true if any of shape's childs is given shape
     */
    hasChildShape: function(shape){
        return this.getChildShapes().any(function(child){
            return (child === shape) || child.hasChildShape(shape);
        });
    },
	
	/**
	 * 
	 * @param {Object} deep
	 * @param {Object} iterator
	 */
	getChildNodes: function(deep, iterator) {
		var result = [];

		this.children.each(function(uiObject) {
			if(uiObject instanceof ORYX.Core.Node && uiObject.isVisible) {
				if(iterator) {
					iterator(uiObject);
				}
				result.push(uiObject);
			}
			if(uiObject instanceof ORYX.Core.Shape) {
				if(deep) {
					result = result.concat(uiObject.getChildNodes(deep, iterator));
				}
			}
		});

		return result;
	},
	
	/**
	 * 
	 * @param {Object} deep
	 * @param {Object} iterator
	 */
	getChildEdges: function(deep, iterator) {
		var result = [];

		this.children.each(function(uiObject) {
			if(uiObject instanceof ORYX.Core.Edge && uiObject.isVisible) {
				if(iterator) {
					iterator(uiObject);
				}
				result.push(uiObject);
			}
			if(uiObject instanceof ORYX.Core.Shape) {
				if(deep) {
					result = result.concat(uiObject.getChildEdges(deep, iterator));
				}
			}
		});

		return result;
	},
	
	/**
	 * Returns a sorted array of ORYX.Core.Node objects.
	 * Ordered in z Order, the last object has the highest z Order.
	 */
	//TODO deep iterator
	getAbstractShapesAtPosition: function() {
		var x, y;
		switch (arguments.length) {
			case 1:
				x = arguments[0].x;
				y = arguments[0].y;
				break;
			case 2:	//two or more arguments
				x = arguments[0];
				y = arguments[1];
				break;
			default:
				throw "getAbstractShapesAtPosition needs 1 or 2 arguments!"
		}

		if(this.isPointIncluded(x, y)) {

			var result = [];
			result.push(this);

			//check, if one child is at that position						
			
			
			var childNodes = this.getChildNodes();
			var childEdges = this.getChildEdges();
			
			[childNodes, childEdges].each(function(ne){
				var nodesAtPosition = new Hash();
				
				ne.each(function(node) {
					if(!node.isVisible){ return }
					var candidates = node.getAbstractShapesAtPosition( x , y );
					if(candidates.length > 0) {
						var nodesInZOrder = $A(node.node.parentNode.childNodes);
						var zOrderIndex = nodesInZOrder.indexOf(node.node);
						nodesAtPosition[zOrderIndex] = candidates;
					}
				});
				
				nodesAtPosition.keys().sort().each(function(key) {
					result = result.concat(nodesAtPosition[key]);
				});
 			});
						
			return result;
			
		} else {
			return [];
		}
	},
	
	/**
	 * 
	 * @param key {String} Must be 'prefix-id' of property
	 * @param value {Object} Can be of type String or Number according to property type.
	 */
	setProperty: function(key, value, force) {
		var oldValue = this.properties[key];
		if(oldValue !== value || force === true) {
			this.properties[key] = value;
			this.propertiesChanged[key] = true;
			this._changed();
			
			// Raise an event, to show that the property has changed
			//window.setTimeout( function(){

			if (!this._isInSetProperty) {
				this._isInSetProperty = true;
				
				this._delegateEvent({
						type	: ORYX.CONFIG.EVENT_PROPERTY_CHANGED, 
						elements : [this],
						name	: key, 
						value	: value,
						oldValue: oldValue
					});
				
				delete this._isInSetProperty;
			}
			//}.bind(this), 10)
		}
	},

	/**
	 * 
	 * @param {String} Must be 'prefix-id' of property
	 * @param {Object} Can be of type String or Number according to property type.
	 */
	setHiddenProperty: function(key, value) {
		// IF undefined, Delete
		if (value === undefined) {
			delete this.hiddenProperties[key];
			return;
		}
		var oldValue = this.hiddenProperties[key];
		if(oldValue !== value) {
			this.hiddenProperties[key] = value;
		}
	},
	/**
	 * Calculate if the point is inside the Shape
	 * @param {Point}
	 */
	isPointIncluded: function(pointX, pointY, absoluteBounds) {
		var absBounds = absoluteBounds ? absoluteBounds : this.absoluteBounds();
		return absBounds.isIncluded(pointX, pointY);
				
	},
	
	/**
	 * Get the serialized object
	 * return Array with hash-entrees (prefix, name, value)
	 * Following values will given:
	 * 		Type
	 * 		Properties
	 */
	serialize: function() {
		var serializedObject = [];
		
		// Add the type
		serializedObject.push({name: 'type', prefix:'oryx', value: this.getStencil().id(), type: 'literal'});	
	
		// Add hidden properties
		this.hiddenProperties.each(function(prop){
			serializedObject.push({name: prop.key.replace("oryx-", ""), prefix: "oryx", value: prop.value, type: 'literal'});
		}.bind(this));
		
		// Add all properties
		this.getStencil().properties().each((function(property){
			
			var prefix = property.prefix();	// Get prefix
			var name = property.id();		// Get name
			
			//if(typeof this.properties[prefix+'-'+name] == 'boolean' || this.properties[prefix+'-'+name] != "")
				serializedObject.push({name: name, prefix: prefix, value: this.properties[prefix+'-'+name], type: 'literal'});

		}).bind(this));
		
		return serializedObject;
	},
		
		
	deserialize: function(serialize){
		// Search in Serialize
		var initializedDocker = 0;
		
		// Sort properties so that the hidden properties are first in the list
		serialize = serialize.sort(function(a,b){ return Number(this.properties.keys().member(a.prefix+"-"+a.name)) > Number(this.properties.keys().member(b.prefix+"-"+b.name)) ? -1 : 0 }.bind(this));
		
		serialize.each((function(obj){
			
			var name 	= obj.name;
			var prefix 	= obj.prefix;
			var value 	= obj.value;
            
            // Complex properties can be real json objects, encode them to a string
            if(Ext.type(value) === "object") value = Ext.encode(value);

			switch(prefix + "-" + name){
				case 'raziel-parent': 
							// Set parent
							if(!this.parent) {break};
							
							// Set outgoing Shape
							var parent = this.getCanvas().getChildShapeByResourceId(value);
							if(parent) {
								parent.add(this);
							}
							
							break;											
				default:
							// Set property
							if(this.properties.keys().member(prefix+"-"+name)) {
								this.setProperty(prefix+"-"+name, value);
							} else if(!(name === "bounds"||name === "parent"||name === "target"||name === "dockers"||name === "docker"||name === "outgoing"||name === "incoming")) {
								this.setHiddenProperty(prefix+"-"+name, value);
							}
					
			}
		}).bind(this));
	},
	
	toString: function() { return "ORYX.Core.AbstractShape " + this.id },
    
    /**
     * Converts the shape to a JSON representation.
     * @return {Object} A JSON object with included ORYX.Core.AbstractShape.JSONHelper and getShape() method.
     */
    toJSON: function(){
        var json = {
            resourceId: this.resourceId,
            properties: Ext.apply({}, this.properties, this.hiddenProperties).inject({}, function(props, prop){
              var key = prop[0];
              var value = prop[1];
                
              //If complex property, value should be a json object
              if(this.getStencil().property(key)
                && this.getStencil().property(key).type() === ORYX.CONFIG.TYPE_COMPLEX 
                && Ext.type(value) === "string"){
                  try {value = Ext.decode(value);} catch(error){}
              }
              
              //Takes "my_property" instead of "oryx-my_property" as key
              key = key.replace(/^[\w_]+-/, "");
              props[key] = value;
              
              return props;
            }.bind(this)),
            stencil: {
                id: this.getStencil().idWithoutNs()
            },
            childShapes: this.getChildShapes().map(function(shape){
                return shape.toJSON()
            })
        };
        
        if(this.getOutgoingShapes){
            json.outgoing = this.getOutgoingShapes().map(function(shape){
                return {
                    resourceId: shape.resourceId
                };
            });
        }
        
        if(this.bounds){
            json.bounds = { 
                lowerRight: this.bounds.lowerRight(), 
                upperLeft: this.bounds.upperLeft() 
            };
        }
        
        if(this.dockers){
            json.dockers = this.dockers.map(function(docker){
                var d = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center();
                d.getDocker = function(){return docker;};
                return d;
            })
        }
        
        Ext.apply(json, ORYX.Core.AbstractShape.JSONHelper);
        
        // do not pollute the json attributes (for serialization), so put the corresponding
        // shape is encapsulated in a method
        json.getShape = function(){
            return this;
        }.bind(this);
        
        return json;
    }
 });
 
/**
 * @namespace Collection of methods which can be used on a shape json object (ORYX.Core.AbstractShape#toJSON()).
 * @example
 * Ext.apply(shapeAsJson, ORYX.Core.AbstractShape.JSONHelper);
 */
ORYX.Core.AbstractShape.JSONHelper = {
     /**
      * Iterates over each child shape.
      * @param {Object} iterator Iterator function getting a child shape and his parent as arguments.
      * @param {boolean} [deep=false] Iterate recursively (childShapes of childShapes)
      * @param {boolean} [modify=false] If true, the result of the iterator function is taken as new shape, return false to delete it. This enables modifying the object while iterating through the child shapes.
      * @example
      * // Increases the lowerRight x value of each direct child shape by one. 
      * myShapeAsJson.eachChild(function(shape, parentShape){
      *     shape.bounds.lowerRight.x = shape.bounds.lowerRight.x + 1;
      *     return shape;
      * }, false, true);
      */
     eachChild: function(iterator, deep, modify){
         if(!this.childShapes) return;
         
         var newChildShapes = []; //needed if modify = true
         
         this.childShapes.each(function(shape){
             var res = iterator(shape, this);
             if(res) newChildShapes.push(res); //if false is returned, and modify = true, current shape is deleted.
             
             if(deep) shape.eachChild(iterator, deep, modify);
         }.bind(this));
         
         if(modify) this.childShapes = newChildShapes;
     },
     
     getChildShapes: function(deep){
         var allShapes = this.childShapes;
         
         if(deep){
             this.eachChild(function(shape){
                 allShapes = allShapes.concat(shape.getChildShapes(deep));
             }, true);
         }
         
         return allShapes;
     },
     
     /**
      * @return {String} Serialized JSON object
      */
     serialize: function(){
         return Ext.encode(this);
     }
 }
/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}/**   @namespace Namespace for the Oryx core elements.   @name ORYX.Core*/if(!ORYX.Core) {ORYX.Core = {};}/** * @class Oryx canvas. * @extends ORYX.Core.AbstractShape * */ORYX.Core.Canvas = ORYX.Core.AbstractShape.extend({    /** @lends ORYX.Core.Canvas.prototype */	/**	 * Defines the current zoom level	 */	zoomLevel:1,	/**	 * Constructor	 */	construct: function(options) {		arguments.callee.$.construct.apply(this, arguments);		if(!(options && options.width && options.height)) {					ORYX.Log.fatal("Canvas is missing mandatory parameters options.width and options.height.");			return;		}					//TODO: set document resource id		this.resourceId = options.id;		this.nodes = [];				this.edges = [];				//init svg document		this.rootNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", options.parentNode,			['svg', {id: this.id, width: options.width, height: options.height},				['defs', {}]			]);					this.rootNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");		this.rootNode.setAttribute("xmlns:svg", "http://www.w3.org/2000/svg");		this._htmlContainer = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", options.parentNode,			['div', {id: "oryx_canvas_htmlContainer", style:"position:absolute; top:5px"}]);				this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.rootNode,			['g', {},				['g', {"class": "stencils"},					['g', {"class": "me"}],					['g', {"class": "children"}],					['g', {"class": "edge"}]				],				['g', {"class":"svgcontainer"}]			]);				/*		var off = 2 * ORYX.CONFIG.GRID_DISTANCE;		var size = 3;		var d = "";		for(var i = 0; i <= options.width; i += off)			for(var j = 0; j <= options.height; j += off)				d = d + "M" + (i - size) + " " + j + " l" + (2*size) + " 0 m" + (-size) + " " + (-size) + " l0 " + (2*size) + " m0" + (-size) + " ";									ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node.firstChild.firstChild,			['path', {d:d , stroke:'#000000', 'stroke-width':'0.15px'},]);		*/				//Global definition of default font for shapes		//Definitions in the SVG definition of a stencil will overwrite these settings for		// that stencil.		/*if(navigator.platform.indexOf("Mac") > -1) {			this.node.setAttributeNS(null, 'stroke', 'black');			this.node.setAttributeNS(null, 'stroke-width', '0.5px');			this.node.setAttributeNS(null, 'font-family', 'Skia');			//this.node.setAttributeNS(null, 'letter-spacing', '2px');			this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);		} else {			this.node.setAttributeNS(null, 'stroke', 'none');			this.node.setAttributeNS(null, 'font-family', 'Verdana');			this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);		}*/				this.node.setAttributeNS(null, 'stroke', 'black');		this.node.setAttributeNS(null, 'font-family', 'Verdana, sans-serif');		this.node.setAttributeNS(null, 'font-size-adjust', 'none');		this.node.setAttributeNS(null, 'font-style', 'normal');		this.node.setAttributeNS(null, 'font-variant', 'normal');		this.node.setAttributeNS(null, 'font-weight', 'normal');		this.node.setAttributeNS(null, 'line-heigth', 'normal');				this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);					this.bounds.set(0,0,options.width, options.height);				this.addEventHandlers(this.rootNode.parentNode);				//disable context menu		this.rootNode.oncontextmenu = function() {return false;};	},		focus: function(){				// Get a href		if (!this.headerA){			this.headerA = Ext.get("oryx_editor_header").child("a").dom		}				// Focus it and blurs it		this.headerA.focus();		this.headerA.blur();	},		update: function() {				this.nodes.each(function(node) {			this._traverseForUpdate(node);		}.bind(this));				// call stencil's layout callback		// (needed for row layouting of xforms)		//this.getStencil().layout(this);				var layoutEvents = this.getStencil().layout();				if(layoutEvents) {			layoutEvents.each(function(event) {						// setup additional attributes				event.shape = this;				event.forceExecution = true;				event.target = this.rootNode;								// do layouting								this._delegateEvent(event);			}.bind(this))		}				this.nodes.invoke("_update");				this.edges.invoke("_update", true);				/*this.children.each(function(child) {			child._update();		});*/	},		_traverseForUpdate: function(shape) {		var childRet = shape.isChanged;		shape.getChildNodes(false, function(child) {			if(this._traverseForUpdate(child)) {				childRet = true;			}		}.bind(this));				if(childRet) {			shape.layout();			return true;		} else {			return false;		}	},		layout: function() {							},		/**	 * 	 * @param {Object} deep	 * @param {Object} iterator	 */	getChildNodes: function(deep, iterator) {		if(!deep && !iterator) {			return this.nodes.clone();		} else {			var result = [];			this.nodes.each(function(uiObject) {				if(iterator) {					iterator(uiObject);				}				result.push(uiObject);								if(deep && uiObject instanceof ORYX.Core.Shape) {					result = result.concat(uiObject.getChildNodes(deep, iterator));				}			});				return result;		}	},		/**	 * buggy crap! use base class impl instead! 	 * @param {Object} iterator	 *//*	getChildEdges: function(iterator) {		if(iterator) {			this.edges.each(function(edge) {				iterator(edge);			});		}				return this.edges.clone();	},*/		/**	 * Overrides the UIObject.add method. Adds uiObject to the correct sub node.	 * @param {UIObject} uiObject	 */	add: function(uiObject) {		//if uiObject is child of another UIObject, remove it.		if(uiObject instanceof ORYX.Core.UIObject) {			if (!(this.children.member(uiObject))) {				//if uiObject is child of another parent, remove it from that parent.				if(uiObject.parent) {					uiObject.parent.remove(uiObject);				}				//add uiObject to the Canvas				this.children.push(uiObject);				//set parent reference				uiObject.parent = this;				//add uiObject.node to this.node depending on the type of uiObject				if(uiObject instanceof ORYX.Core.Shape) {					if(uiObject instanceof ORYX.Core.Edge) {						uiObject.addMarkers(this.rootNode.getElementsByTagNameNS(NAMESPACE_SVG, "defs")[0]);						uiObject.node = this.node.childNodes[0].childNodes[2].appendChild(uiObject.node);						this.edges.push(uiObject);					} else {						uiObject.node = this.node.childNodes[0].childNodes[1].appendChild(uiObject.node);						this.nodes.push(uiObject);					}				} else {	//UIObject					uiObject.node = this.node.appendChild(uiObject.node);				}				uiObject.bounds.registerCallback(this._changedCallback);									if(this.eventHandlerCallback)					this.eventHandlerCallback({type:ORYX.CONFIG.EVENT_SHAPEADDED,shape:uiObject})			} else {								ORYX.Log.warn("add: ORYX.Core.UIObject is already a child of this object.");			}		} else {			ORYX.Log.fatal("add: Parameter is not of type ORYX.Core.UIObject.");		}	},	/**	 * Overrides the UIObject.remove method. Removes uiObject.	 * @param {UIObject} uiObject	 */	remove: function(uiObject) {		//if uiObject is a child of this object, remove it.		if (this.children.member(uiObject)) {			//remove uiObject from children			this.children = this.children.without(uiObject);			//delete parent reference of uiObject			uiObject.parent = undefined;			//delete uiObject.node from this.node			if(uiObject instanceof ORYX.Core.Shape) {				if(uiObject instanceof ORYX.Core.Edge) {					uiObject.removeMarkers();					uiObject.node = this.node.childNodes[0].childNodes[2].removeChild(uiObject.node);					this.edges = this.edges.without(uiObject);				} else {					uiObject.node = this.node.childNodes[0].childNodes[1].removeChild(uiObject.node);					this.nodes = this.nodes.without(uiObject);				}			} else {	//UIObject					uiObject.node = this.node.removeChild(uiObject.node);			}			uiObject.bounds.unregisterCallback(this._changedCallback);		} else {			ORYX.Log.warn("remove: ORYX.Core.UIObject is not a child of this object.");		}	},        /**     * Creates shapes out of the given collection of shape objects and adds them to the canvas.     * @example      * canvas.addShapeObjects({         bounds:{ lowerRight:{ y:510, x:633 }, upperLeft:{ y:146, x:210 } },         resourceId:"oryx_F0715955-50F2-403D-9851-C08CFE70F8BD",         childShapes:[],         properties:{},         stencil:{           id:"Subprocess"         },         outgoing:[{resourceId: 'aShape'}],         target: {resourceId: 'aShape'}       });     * @param {Object} shapeObjects      * @param {Function} [eventHandler] An event handler passed to each newly created shape (as eventHandlerCallback)     * @return {Array} A collection of ORYX.Core.Shape     * @methodOf ORYX.Core.Canvas.prototype     */    addShapeObjects: function(shapeObjects, eventHandler){        if(!shapeObjects) return;                /*FIXME This implementation is very evil! At first, all shapes are created on          canvas. In a second step, the attributes are applied. There must be a distinction          between the configuration phase (where the outgoings, for example, are just named),          and the creation phase (where the outgoings are evaluated). This must be reflected          in code to provide a nicer API/ implementation!!! */                var addShape = function(shape, parent){            // Try to create a new Shape            try {                // Create a new Stencil                var stencil = ORYX.Core.StencilSet.stencil(this.getStencil().namespace() + shape.stencil.id );                    // Create a new Shape                var ShapeClass = (stencil.type() == "node") ? ORYX.Core.Node : ORYX.Core.Edge;                var newShape = new ShapeClass(                  {'eventHandlerCallback': eventHandler},                  stencil);                                // Set the resource id                newShape.resourceId = shape.resourceId;                                // Set parent to json object to be used later                // Due to the nested json structure, normally shape.parent is not set/ must not be set.                 // In special cases, it can be easier to set this directly instead of a nested structure.                shape.parent = "#" + ((shape.parent && shape.parent.resourceId) || parent.resourceId);                                // Add the shape to the canvas                this.add( newShape );                return {                  json: shape,                  object: newShape                };            } catch(e) {                ORYX.Log.warn("LoadingContent: Stencil could not create.");            }        }.bind(this);                /** Builds up recursively a flatted array of shapes, including a javascript object and json representation         * @param {Object} shape Any object that has Object#childShapes         */        var addChildShapesRecursively = function(shape){            var addedShapes = [];                        shape.childShapes.each(function(childShape){  			  /*  			   *  workaround for Chrome, for some reason an undefined shape is given  			   */            	var xy=addShape(childShape, shape);  			  if(!(typeof xy ==="undefined")){  					addedShapes.push(xy);  			  }              addedShapes = addedShapes.concat(addChildShapesRecursively(childShape));            });                        return addedShapes;        }.bind(this);        var shapes = addChildShapesRecursively({            childShapes: shapeObjects,             resourceId: this.resourceId        });                            // prepare deserialisation parameter        shapes.each(            function(shape){            	var properties = [];                for(field in shape.json.properties){                    properties.push({                      prefix: 'oryx',                      name: field,                      value: shape.json.properties[field]                    });                  }                                    // Outgoings                  shape.json.outgoing.each(function(out){                    properties.push({                      prefix: 'raziel',                      name: 'outgoing',                      value: "#"+out.resourceId                    });                  });                                    // Target                   // (because of a bug, the first outgoing is taken when there is no target,                  // can be removed after some time)                  if(shape.object instanceof ORYX.Core.Edge) {	                  var target = shape.json.target || shape.json.outgoing[0];	                  if(target){	                    properties.push({	                      prefix: 'raziel',	                      name: 'target',	                      value: "#"+target.resourceId	                    });	                  }                  }                                    // Bounds                  if (shape.json.bounds) {                      properties.push({                          prefix: 'oryx',                          name: 'bounds',                          value: shape.json.bounds.upperLeft.x + "," + shape.json.bounds.upperLeft.y + "," + shape.json.bounds.lowerRight.x + "," + shape.json.bounds.lowerRight.y                      });                  }                                    //Dockers [{x:40, y:50}, {x:30, y:60}] => "40 50 30 60  #"                  if(shape.json.dockers){                    properties.push({                      prefix: 'oryx',                      name: 'dockers',                      value: shape.json.dockers.inject("", function(dockersStr, docker){                        return dockersStr + docker.x + " " + docker.y + " ";                      }) + " #"                    });                  }                                    //Parent                  properties.push({                    prefix: 'raziel',                    name: 'parent',                    value: shape.json.parent                  });                              shape.__properties = properties;	         }.bind(this)        );          // Deserialize the properties from the shapes        // This can't be done earlier because Shape#deserialize expects that all referenced nodes are already there                // first, deserialize all nodes        shapes.each(function(shape) {        	if(shape.object instanceof ORYX.Core.Node) {        		shape.object.deserialize(shape.__properties);        	}        });                // second, deserialize all edges        shapes.each(function(shape) {        	if(shape.object instanceof ORYX.Core.Edge) {        		shape.object.deserialize(shape.__properties);        	}        });               return shapes.pluck("object");    },        /**     * Updates the size of the canvas, regarding to the containg shapes.     */    updateSize: function(){        // Check the size for the canvas        var maxWidth    = 0;        var maxHeight   = 0;        var offset      = 100;        this.getChildShapes(true, function(shape){            var b = shape.bounds;            maxWidth    = Math.max( maxWidth, b.lowerRight().x + offset)            maxHeight   = Math.max( maxHeight, b.lowerRight().y + offset)        });                 if( this.bounds.width() < maxWidth || this.bounds.height() < maxHeight ){            this.setSize({width: Math.max(this.bounds.width(), maxWidth), height: Math.max(this.bounds.height(), maxHeight)})        }    },	getRootNode: function() {		return this.rootNode;	},		getSvgContainer: function() {		return this.node.childNodes[1];	},		getHTMLContainer: function() {		return this._htmlContainer;	},		/**	 * Return all elements of the same highest level	 * @param {Object} elements	 */	getShapesWithSharedParent: function(elements) {		// If there is no elements, return []		if(!elements || elements.length < 1) { return [] }		// If there is one element, return this element		if(elements.length == 1) { return elements}		return elements.findAll(function(value){			var parentShape = value.parent;			while(parentShape){				if(elements.member(parentShape)) return false;				parentShape = parentShape.parent			}			return true;		});			},	setSize: function(size, dontSetBounds) {		if(!size || !size.width || !size.height){return}				if(this.rootNode.parentNode){			this.rootNode.parentNode.style.width = size.width + 'px';			this.rootNode.parentNode.style.height = size.height + 'px';		}				this.rootNode.setAttributeNS(null, 'width', size.width);		this.rootNode.setAttributeNS(null, 'height', size.height);		//this._htmlContainer.style.top = "-" + (size.height + 4) + 'px';				if( !dontSetBounds ){			this.bounds.set({a:{x:0,y:0},b:{x:size.width/this.zoomLevel,y:size.height/this.zoomLevel}})				}	},		/**	 * Returns an SVG document of the current process.	 * @param {Boolean} escapeText Use true, if you want to parse it with an XmlParser,	 * 					false, if you want to use the SVG document in browser on client side.	 */	getSVGRepresentation: function(escapeText) {		// Get the serialized svg image source        var svgClone = this.getRootNode().cloneNode(true);				this._removeInvisibleElements(svgClone);				var x1, y1, x2, y2;		try {			var bb = this.getRootNode().childNodes[1].getBBox();			x1 = bb.x;			y1 = bb.y;			x2 = bb.x + bb.width;			y2 = bb.y + bb.height;		} catch(e) {			this.getChildShapes(true).each(function(shape) {				var absBounds = shape.absoluteBounds();				var ul = absBounds.upperLeft();				var lr = absBounds.lowerRight();				if(x1 == undefined) {					x1 = ul.x;					y1 = ul.y;					x2 = lr.x;					y2 = lr.y;				} else {					x1 = Math.min(x1, ul.x);					y1 = Math.min(y1, ul.y);					x2 = Math.max(x2, lr.x);					y2 = Math.max(y2, lr.y);				}			});		}				var margin = 50;				var width, height, tx, ty;		if(x1 == undefined) {			width = 0;			height = 0;			tx = 0;			ty = 0;		} else {			width = x2 - x1;			height = y2 - y1;			tx = -x1+margin/2;			ty = -y1+margin/2;		}		 				        // Set the width and height        svgClone.setAttributeNS(null, 'width', width + margin);        svgClone.setAttributeNS(null, 'height', height + margin);				svgClone.childNodes[1].firstChild.setAttributeNS(null, 'transform', 'translate(' + tx + ", " + ty + ')');				//remove scale factor		svgClone.childNodes[1].removeAttributeNS(null, 'transform');				try{			var svgCont = svgClone.childNodes[1].childNodes[1];			svgCont.parentNode.removeChild(svgCont);		} catch(e) {}		if(escapeText) {			$A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan')).each(function(elem) {				elem.textContent = elem.textContent.escapeHTML();			});						$A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text')).each(function(elem) {				if(elem.childNodes.length == 0)					elem.textContent = elem.textContent.escapeHTML();			});		}				// generating absolute urls for the pdf-exporter		$A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'image')).each(function(elem) {			var href = elem.getAttributeNS("http://www.w3.org/1999/xlink","href");						if(!href.match("^(http|https)://")) {				href = window.location.protocol + "//" + window.location.host + href;				elem.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);			}		});						// escape all links		$A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'a')).each(function(elem) {			elem.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", (elem.getAttributeNS("http://www.w3.org/1999/xlink","href")||"").escapeHTML());		});		        return svgClone;	},		/**   	* Removes all nodes (and its children) that has the	* attribute visibility set to "hidden"	*/	_removeInvisibleElements: function(element) {		var index = 0;		while(index < element.childNodes.length) {			var child = element.childNodes[index];			if(child.getAttributeNS &&				child.getAttributeNS(null, "visibility") === "hidden") {				element.removeChild(child);			} else {				this._removeInvisibleElements(child);				index++; 			}		}			},		/**	 * This method checks all shapes on the canvas and removes all shapes that	 * contain invalid bounds values or dockers values(NaN)	 */	/*cleanUp: function(parent) {		if (!parent) {			parent = this;		}		parent.getChildShapes().each(function(shape){			var a = shape.bounds.a;			var b = shape.bounds.b;			if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {				parent.remove(shape);			}			else {				shape.getDockers().any(function(docker) {					a = docker.bounds.a;					b = docker.bounds.b;					if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {						parent.remove(shape);						return true;					}					return false;				});				shape.getMagnets().any(function(magnet) {					a = magnet.bounds.a;					b = magnet.bounds.b;					if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {						parent.remove(shape);						return true;					}					return false;				});				this.cleanUp(shape);			}		}.bind(this));	},*/	_delegateEvent: function(event) {		if(this.eventHandlerCallback && ( event.target == this.rootNode || event.target == this.rootNode.parentNode )) {			this.eventHandlerCallback(event, this);		}	},		toString: function() { return "Canvas " + this.id },        /**     * Calls {@link ORYX.Core.AbstractShape#toJSON} and adds some stencil set information.     */    toJSON: function() {        var json = arguments.callee.$.toJSON.apply(this, arguments);        //		if(ORYX.CONFIG.STENCILSET_HANDLER.length > 0) {//			json.stencilset = {//				url: this.getStencil().stencilSet().namespace()//	        };//		} else {			json.stencilset = {				url: this.getStencil().stencilSet().source(),				namespace: this.getStencil().stencilSet().namespace()	        };	//		}                        return json;    } });/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/var idCounter = 0;var ID_PREFIX = "resource";/** * Main initialization method. To be called when loading * of the document, including all scripts, is completed. */function init() {	/* When the blank image url is not set programatically to a local	 * representation, a spacer gif on the site of ext is loaded from the	 * internet. This causes problems when internet or the ext site are not	 * available. */	Ext.BLANK_IMAGE_URL = ORYX.PATH + 'lib/ext-2.0.2/resources/images/default/s.gif';			ORYX.Log.debug("Querying editor instances");	// Hack for WebKit to set the SVGElement-Classes	ORYX.Editor.setMissingClasses();        // If someone wants to create the editor instance himself    if (window.onOryxResourcesLoaded) {        window.onOryxResourcesLoaded();    }     // Else if this is a newly created model    else if(window.location.pathname.include(ORYX.CONFIG.ORYX_NEW_URL)){        new ORYX.Editor({            id: 'oryx-canvas123',            fullscreen: true,            stencilset: {                url: ORYX.PATH + ORYX.Utils.getParamFromUrl("stencilset")            }        });    }     // Else fetch the model from server and display editor    else {        //HACK for distinguishing between different backends		// Backend of 2008 uses /self URL ending	    var modelUrl = window.location.href.replace(/#.*/g, "");		if(modelUrl.endsWith("/self")) {			modelUrl = modelUrl.replace("/self","/json");		} else {			modelUrl += "&data";		}        ORYX.Editor.createByUrl(modelUrl, {            id: modelUrl        });    }}/**   @namespace Global Oryx name space   @name ORYX*/if(!ORYX) {var ORYX = {};}/** * The Editor class. * @class ORYX.Editor * @extends Clazz * @param {Object} config An editor object, passed to {@link ORYX.Editor#loadSerialized} * @param {String} config.id Any ID that can be used inside the editor. If fullscreen=false, any HTML node with this id must be present to render the editor to this node. * @param {boolean} [config.fullscreen=true] Render editor in fullscreen mode or not. * @param {String} config.stencilset.url Stencil set URL. * @param {String} [config.stencil.id] Stencil type used for creating the canvas.   * @param {Object} config.properties Any properties applied to the canvas.*/ORYX.Editor = {    /** @lends ORYX.Editor.prototype */	// Defines the global dom event listener 	DOMEventListeners: new Hash(),	// Defines the selection	selection: [],		// Defines the current zoom level	zoomLevel:1.0,	construct: function(config) {		// initialization.		this._eventsQueue 	= [];		this.loadedPlugins 	= [];		this.pluginsData 	= [];						//meta data about the model for the signavio warehouse		//directory, new, name, description, revision, model (the model data)				this.modelMetaData = config;				var model = config;		if(config.model) {			model = config.model;		}				this.id = model.resourceId;        if(!this.id) {        	this.id = model.id;        	if(!this.id) {        		this.id = ORYX.Editor.provideId();        	}        }                // Defines if the editor should be fullscreen or not		this.fullscreen = model.fullscreen || true;				// Initialize the eventlistener		this._initEventListener();		// Load particular stencilset		if(ORYX.CONFIG.BACKEND_SWITCH) {			var ssUrl = (model.stencilset.namespace||model.stencilset.url).replace("#", "%23");        	ORYX.Core.StencilSet.loadStencilSet(ORYX.CONFIG.STENCILSET_HANDLER + ssUrl, this.id);		} else {			var ssUrl = model.stencilset.url;        	ORYX.Core.StencilSet.loadStencilSet(ssUrl, this.id);		}		                //TODO load ealier and asynchronous??        this._loadStencilSetExtensionConfig();                //Load predefined StencilSetExtensions        if(!!ORYX.CONFIG.SSEXTS){        	ORYX.CONFIG.SSEXTS.each(function(ssext){                this.loadSSExtension(ssext.namespace);            }.bind(this));        }		// CREATES the canvas		this._createCanvas(model.stencil ? model.stencil.id : null, model.properties);		// GENERATES the whole EXT.VIEWPORT		this._generateGUI();		// Initializing of a callback to check loading ends		var loadPluginFinished 	= false;		var loadContentFinished = false;		var initFinished = function(){				if( !loadPluginFinished || !loadContentFinished ){ return }			this._finishedLoading();		}.bind(this)				// disable key events when Ext modal window is active		ORYX.Editor.makeExtModalWindowKeysave(this._getPluginFacade());				// LOAD the plugins		window.setTimeout(function(){			this.loadPlugins();			loadPluginFinished = true;			initFinished();		}.bind(this), 100);		// LOAD the content of the current editor instance		window.setTimeout(function(){            this.loadSerialized(model);            this.getCanvas().update();			loadContentFinished = true;			initFinished();		}.bind(this), 200);	},		_finishedLoading: function() {		if(Ext.getCmp('oryx-loading-panel')){			Ext.getCmp('oryx-loading-panel').hide()		}				// Do Layout for viewport		this.layout.doLayout();		// Generate a drop target		new Ext.dd.DropTarget(this.getCanvas().rootNode.parentNode);				// Fixed the problem that the viewport can not 		// start with collapsed panels correctly		if (ORYX.CONFIG.PANEL_RIGHT_COLLAPSED === true){			this.layout_regions.east.collapse();		}		if (ORYX.CONFIG.PANEL_LEFT_COLLAPSED === true){			this.layout_regions.west.collapse();		}				// Raise Loaded Event		this.handleEvents( {type:ORYX.CONFIG.EVENT_LOADED} )			},		_initEventListener: function(){		// Register on Events				document.documentElement.addEventListener(ORYX.CONFIG.EVENT_KEYDOWN, this.catchKeyDownEvents.bind(this), true);		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_KEYUP, this.catchKeyUpEvents.bind(this), true);		// Enable Key up and down Event		this._keydownEnabled = 	true;		this._keyupEnabled =  	true;		this.DOMEventListeners[ORYX.CONFIG.EVENT_MOUSEDOWN] = [];		this.DOMEventListeners[ORYX.CONFIG.EVENT_MOUSEUP] 	= [];		this.DOMEventListeners[ORYX.CONFIG.EVENT_MOUSEOVER] = [];		this.DOMEventListeners[ORYX.CONFIG.EVENT_MOUSEOUT] 	= [];		this.DOMEventListeners[ORYX.CONFIG.EVENT_SELECTION_CHANGED] = [];		this.DOMEventListeners[ORYX.CONFIG.EVENT_MOUSEMOVE] = [];					},		/**	 * Generate the whole viewport of the	 * Editor and initialized the Ext-Framework	 * 	 */	_generateGUI: function() {		//TODO make the height be read from eRDF data from the canvas.		// default, a non-fullscreen editor shall define its height by layout.setHeight(int) 				// Defines the layout hight if it's NOT fullscreen		var layoutHeight 	= 400;			var canvasParent	= this.getCanvas().rootNode.parentNode;		// DEFINITION OF THE VIEWPORT AREAS		this.layout_regions = {								// DEFINES TOP-AREA				north	: new Ext.Panel({ //TOOO make a composite of the oryx header and addable elements (for toolbar), second one should contain margins					region	: 'north',					cls		: 'x-panel-editor-north',					autoEl	: 'div',					border	: false				}),									// DEFINES RIGHT-AREA				east	: new Ext.Panel({					region	: 'east',					layout	: 'fit',					cls		: 'x-panel-editor-east',					/*layout: 'accordion',					layoutConfig: {		               // layout-specific configs go here						titleCollapse: true,						animate: true,						activeOnTop: true	                },*/					autoEl	: 'div',					border	:false,					cmargins: {left:0, right:0},					collapsible	: true,					width	: ORYX.CONFIG.PANEL_RIGHT_WIDTH || 200,					split	: true,					title	: "East"				}),												// DEFINES BOTTOM-AREA				south	: new Ext.Panel({					region	: 'south',					cls		: 'x-panel-editor-south',					autoEl	: 'div',					border	: false				}),												// DEFINES LEFT-AREA				west	: new Ext.Panel({					region	: 'west',					layout	: 'anchor',					autoEl	: 'div',					cls		: 'x-panel-editor-west',					collapsible	: true,					width	: ORYX.CONFIG.PANEL_LEFT_WIDTH || 200,					autoScroll:true,					cmargins: {left:0, right:0},					split	: true,					title	: "West"				}),												// DEFINES CENTER-AREA (FOR THE EDITOR)				center	: new Ext.Panel({					region	: 'center',					cls		: 'x-panel-editor-center',					autoScroll: true,					items	: {						layout	: "fit",						autoHeight: true,						el		: canvasParent					}				})		}				// Hide every region except the center		for (region in this.layout_regions) {			if ( region != "center" ) {				//this.layout_regions[ region ].hide();			}		}				// Config for the Ext.Viewport 		var layout_config = {			layout: 'border',			items: [				this.layout_regions.north,				this.layout_regions.east,				this.layout_regions.south,				this.layout_regions.west,				this.layout_regions.center			]		}		// IF Fullscreen, use a viewport		if (this.fullscreen) {			this.layout = new Ext.Viewport( layout_config )				// IF NOT, use a panel and render it to the given id		} else {			layout_config.renderTo 	= this.id;			layout_config.height 	= layoutHeight;			this.layout = new Ext.Panel( layout_config )		}				//Generates the ORYX-Header		this._generateHeader();						// Set the editor to the center, and refresh the size	 	canvasParent.parentNode.setAttributeNS(null, 'align', 'center');	 	canvasParent.setAttributeNS(null, 'align', 'left');		this.getCanvas().setSize({			width	: ORYX.CONFIG.CANVAS_WIDTH,			height	: ORYX.CONFIG.CANVAS_HEIGHT		});									},		_generateHeader: function(){				var headerPanel = new Ext.Panel({			height		: 30,			autoHeight	: false,			border		: false,			html		: "<div id='oryx_editor_header'><a href=\""+ORYX.CONFIG.WEB_URL+"\" target=\"_blank\"><img src='"+ORYX.PATH+"images/oryx.small.gif' border=\"0\" /></a><div style='clear: both;'></div></div>" 		});		var maActive 	= ORYX.MashupAPI && ORYX.MashupAPI.isUsed;		var maKey		= maActive ? ORYX.MashupAPI.key : "";		var maCanRun	= maActive ? ORYX.MashupAPI.canRun : false;			var maIsRemoteM	= maActive ? ORYX.MashupAPI.isModelRemote : true;					var maModelImage= maIsRemoteM ? "<img src='"+ORYX.PATH+"images/page_white_put.png'/>" : "";		var maModelAuthI= maActive ? "<span class='mashupinfo'><img src='"+ORYX.PATH+"images/" +( maCanRun ? "plugin_error" : "plugin") +".png'/>" + maModelImage + "</span>" : "";						// Callback if the user changes		var fn = function(val){						var publicText = ORYX.I18N.Oryx.notLoggedOn;			var user = val && val.identifier && val.identifier != "public" ? decodeURI(val.identifier.gsub('"', "")).replace(/\+/g," ") : "";						if( user.length <= 0 ){				user 	= 	publicText;			}						var content = 	"<div id='oryx_editor_header'>" +								"<a href=\""+ORYX.CONFIG.WEB_URL+"\" target=\"_blank\">" +									"<img src='"+ORYX.PATH+"images/oryx.small.gif' border=\"0\" />" + 								"</a>" + 								"<span class='openid " + (publicText == user ? "not" : "") + "'>" + 									user + 									maModelAuthI + 								"</span>" + 								"<div style='clear: both;'/>" + 							"</div>";						if( headerPanel.body ){				headerPanel.body.dom.innerHTML = content;			} else {				headerPanel.html = content			}		};					ORYX.Editor.Cookie.onChange(fn);		fn(ORYX.Editor.Cookie.getParams());				// The oryx header		this.addToRegion("north", headerPanel );	},		/**	 * adds a component to the specified region	 * 	 * @param {String} region	 * @param {Ext.Component} component	 * @param {String} title, optional	 * @return {Ext.Component} dom reference to the current region or null if specified region is unknown	 */	addToRegion: function(region, component, title) {				if (region.toLowerCase && this.layout_regions[region.toLowerCase()]) {			var current_region = this.layout_regions[region.toLowerCase()];						current_region.add(component);									ORYX.Log.debug("original dimensions of region %0: %1 x %2", current_region.region, current_region.width, current_region.height)			// update dimensions of region if required.			if  (!current_region.width && component.initialConfig && component.initialConfig.width) {				ORYX.Log.debug("resizing width of region %0: %1", current_region.region, component.initialConfig.width)					current_region.setWidth(component.initialConfig.width)			}			if  (component.initialConfig && component.initialConfig.height) {				ORYX.Log.debug("resizing height of region %0: %1", current_region.region, component.initialConfig.height)				var current_height = current_region.height || 0;				current_region.height = component.initialConfig.height + current_height;				current_region.setHeight(component.initialConfig.height + current_height)			}												// set title if provided as parameter.            if (typeof title == "string") {                    switch(region.toLowerCase()) {                    case "east":                            if (current_region.title != "East"){                                    title = current_region.title + " and " + title;                                    current_region.setTitle(title);                            }                            current_region.setTitle(title);                            break;                    case "west":                            if (current_region.title != "West"){                                    title = current_region.title + " and " + title;                                    current_region.setTitle(title);                            }                            current_region.setTitle(title);                            break;                    default :                            current_region.setTitle(title);                    }            }			            //If we we want to put more than one content pane into the east region            //we have to add a layout that can handle this. 			if (region.toLowerCase() == 'east' && current_region.items.length >= 2 ) {				var layout = new Ext.layout.Accordion( current_region.layoutConfig );            	current_region.setLayout( layout );								var items = current_region.items.clone();						} 						//This renders the layout			current_region.ownerCt.doLayout();			current_region.show();			if(Ext.isMac)				ORYX.Editor.resizeFix();						return current_region;											}				return null;	},		getAvailablePlugins: function(){		var curAvailablePlugins=ORYX.availablePlugins.clone();		curAvailablePlugins.each(function(plugin){			if(this.loadedPlugins.find(function(loadedPlugin){				return loadedPlugin.type==this.name;			}.bind(plugin))){				plugin.engaged=true;			}else{				plugin.engaged=false;			}			}.bind(this));		return curAvailablePlugins;	},	loadScript: function (url, callback){	    var script = document.createElement("script")	    script.type = "text/javascript";	    if (script.readyState){  //IE	        script.onreadystatechange = function(){	            if (script.readyState == "loaded" || script.readyState == "complete"){	                script.onreadystatechange = null;	                callback();	            }        	};    	} else {  //Others	        script.onload = function(){	            callback();	        };		}	    script.src = url;		document.getElementsByTagName("head")[0].appendChild(script);	},	/**	 * activate Plugin	 * 	 * @param {String} name	 * @param {Function} callback	 * 		callback(sucess, [errorCode])	 * 			errorCodes: NOTUSEINSTENCILSET, REQUIRESTENCILSET, NOTFOUND, YETACTIVATED	 */	activatePluginByName: function(name, callback, loadTry){		var match=this.getAvailablePlugins().find(function(value){return value.name==name});		if(match && (!match.engaged || (match.engaged==='false'))){						var loadedStencilSetsNamespaces = this.getStencilSets().keys();				var facade = this._getPluginFacade();				var newPlugin;				var me=this;				ORYX.Log.debug("Initializing plugin '%0'", match.name);									if (!match.requires 	|| !match.requires.namespaces 	|| match.requires.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) ){						if(!match.notUsesIn 	|| !match.notUsesIn.namespaces 	|| !match.notUsesIn.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 })){						try {												var className 	= eval(match.name);							var newPlugin = new className(facade, match);							newPlugin.type = match.name;														// If there is an GUI-Plugin, they get all Plugins-Offer-Meta-Data							if (newPlugin.registryChanged) 								newPlugin.registryChanged(me.pluginsData);														// If there have an onSelection-Method it will pushed to the Editor Event-Handler							if (newPlugin.onSelectionChanged) 								me.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, newPlugin.onSelectionChanged.bind(newPlugin));							this.loadedPlugins.push(newPlugin);							this.loadedPlugins.each(function(loaded){								if(loaded.registryChanged)									loaded.registryChanged(this.pluginsData);							}.bind(me));							callback(true);											} catch(e) {						ORYX.Log.warn("Plugin %0 is not available", match.name);						if(!!loadTry){							callback(false,"INITFAILED");							return;						}						this.loadScript("plugins/scripts/"+match.source, this.activatePluginByName.bind(this,match.name,callback,true));					}					}else{						callback(false,"NOTUSEINSTENCILSET");						ORYX.Log.info("Plugin need a stencilset which is not loaded'", match.name);					}												} else {					callback(false,"REQUIRESTENCILSET");					ORYX.Log.info("Plugin need a stencilset which is not loaded'", match.name);				}						}else{				callback(false, match?"NOTFOUND":"YETACTIVATED");				//TODO error handling			}	},	/**	 *  Laden der Plugins	 */	loadPlugins: function() {				// if there should be plugins but still are none, try again.		// TODO this should wait for every plugin respectively.		/*if (!ORYX.Plugins && ORYX.availablePlugins.length > 0) {			window.setTimeout(this.loadPlugins.bind(this), 100);			return;		}*/				var me = this;		var newPlugins = [];		var loadedStencilSetsNamespaces = this.getStencilSets().keys();		// Available Plugins will be initalize		var facade = this._getPluginFacade();				// If there is an Array where all plugins are described, than only take those		// (that comes from the usage of oryx with a mashup api)		if( ORYX.MashupAPI && ORYX.MashupAPI.loadablePlugins && ORYX.MashupAPI.loadablePlugins instanceof Array ){					// Get the plugins from the available plugins (those who are in the plugins.xml)			ORYX.availablePlugins = $A(ORYX.availablePlugins).findAll(function(value){										return ORYX.MashupAPI.loadablePlugins.include( value.name )									})						// Add those plugins to the list, which are only in the loadablePlugins list			ORYX.MashupAPI.loadablePlugins.each(function( className ){				if( !(ORYX.availablePlugins.find(function(val){ return val.name == className }))){					ORYX.availablePlugins.push( {name: className } );				}			})		}						ORYX.availablePlugins.each(function(value) {			ORYX.Log.debug("Initializing plugin '%0'", value.name);				if( (!value.requires 	|| !value.requires.namespaces 	|| value.requires.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) ) &&					(!value.notUsesIn 	|| !value.notUsesIn.namespaces 	|| !value.notUsesIn.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) )&&					//We assume if there is no engaged attribute in an XML					//node of a plugin the plugin is activated by default.					//If there is an engaged attribute and it is set to true					//the plugin will not be loaded					(!value.engaged || value.engaged=="true" )){				try {					var className 	= eval(value.name);					if( className ){						var plugin		= new className(facade, value);						plugin.type		= value.name;						newPlugins.push( plugin );						plugin.engaged=true;					}				} catch(e) {					ORYX.Log.warn("Plugin %0 is not available", value.name);				}										} else {				ORYX.Log.info("Plugin need a stencilset which is not loaded'", value.name);			}					});		newPlugins.each(function(value) {			// If there is an GUI-Plugin, they get all Plugins-Offer-Meta-Data			if(value.registryChanged)				value.registryChanged(me.pluginsData);			// If there have an onSelection-Method it will pushed to the Editor Event-Handler			if(value.onSelectionChanged)				me.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, value.onSelectionChanged.bind(value));		});		this.loadedPlugins = newPlugins;				// Hack for the Scrollbars		if(Ext.isMac) {			ORYX.Editor.resizeFix();		}				this.registerPluginsOnKeyEvents();				this.setSelection();			},    /**     * Loads the stencil set extension file, defined in ORYX.CONFIG.SS_EXTENSIONS_CONFIG     */    _loadStencilSetExtensionConfig: function(){        // load ss extensions        new Ajax.Request(ORYX.CONFIG.SS_EXTENSIONS_CONFIG, {            method: 'GET',            asynchronous: false,            onSuccess: (function(transport) {                var jsonObject = Ext.decode(transport.responseText);                this.ss_extensions_def = jsonObject;            }).bind(this),            onFailure: (function(transport) {                ORYX.Log.error("Editor._loadStencilSetExtensionConfig: Loading stencil set extension configuration file failed." + transport);            }).bind(this)        });    },	/**	 * Creates the Canvas	 * @param {String} [stencilType] The stencil type used for creating the canvas. If not given, a stencil with myBeRoot = true from current stencil set is taken.	 * @param {Object} [canvasConfig] Any canvas properties (like language).	 */	_createCanvas: function(stencilType, canvasConfig) {        if (stencilType) {            // Add namespace to stencilType            if (stencilType.search(/^http/) === -1) {                stencilType = this.getStencilSets().values()[0].namespace() + stencilType;            }        }        else {            // Get any root stencil type            stencilType = this.getStencilSets().values()[0].findRootStencilName();        }        		// get the stencil associated with the type		var canvasStencil = ORYX.Core.StencilSet.stencil(stencilType);					if (!canvasStencil) 			ORYX.Log.fatal("Initialisation failed, because the stencil with the type %0 is not part of one of the loaded stencil sets.", stencilType);				// create all dom		// TODO fix border, so the visible canvas has a double border and some spacing to the scrollbars		var div = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", null, ['div']);		// set class for custom styling		div.addClassName("ORYX_Editor");								// create the canvas		this._canvas = new ORYX.Core.Canvas({			width					: ORYX.CONFIG.CANVAS_WIDTH,			height					: ORYX.CONFIG.CANVAS_HEIGHT,			'eventHandlerCallback'	: this.handleEvents.bind(this),			id						: this.id,			parentNode				: div		}, canvasStencil);                if (canvasConfig) {          // Migrate canvasConfig to an RDF-like structure          //FIXME this isn't nice at all because we don't want rdf any longer          var properties = [];          for(field in canvasConfig){            properties.push({              prefix: 'oryx',              name: field,              value: canvasConfig[field]            });          }                      this._canvas.deserialize(properties);        }					},	/**	 * Returns a per-editor singleton plugin facade.	 * To be used in plugin initialization.	 */	_getPluginFacade: function() {		// if there is no pluginfacade already created:		if(!(this._pluginFacade))			// create it.			this._pluginFacade = {				activatePluginByName:		this.activatePluginByName.bind(this),				//deactivatePluginByName:		this.deactivatePluginByName.bind(this),				getAvailablePlugins:	this.getAvailablePlugins.bind(this),				offer:					this.offer.bind(this),				getStencilSets:			this.getStencilSets.bind(this),				getRules:				this.getRules.bind(this),				loadStencilSet:			this.loadStencilSet.bind(this),				createShape:			this.createShape.bind(this),				deleteShape:			this.deleteShape.bind(this),				getSelection:			this.getSelection.bind(this),				setSelection:			this.setSelection.bind(this),				updateSelection:		this.updateSelection.bind(this),				getCanvas:				this.getCanvas.bind(this),								importJSON:				this.importJSON.bind(this),				importERDF:				this.importERDF.bind(this),				getERDF:				this.getERDF.bind(this),                getJSON:                this.getJSON.bind(this),                getSerializedJSON:      this.getSerializedJSON.bind(this),								executeCommands:		this.executeCommands.bind(this),								registerOnEvent:		this.registerOnEvent.bind(this),				unregisterOnEvent:		this.unregisterOnEvent.bind(this),				raiseEvent:				this.handleEvents.bind(this),				enableEvent:			this.enableEvent.bind(this),				disableEvent:			this.disableEvent.bind(this),								eventCoordinates:		this.eventCoordinates.bind(this),				addToRegion:			this.addToRegion.bind(this),								getModelMetaData:		this.getModelMetaData.bind(this)			};		// return it.		return this._pluginFacade;	},	/**	 * Implementes the command pattern	 * (The real usage of the command pattern	 * is implemented and shown in the Plugins/undo.js)	 *	 * @param <Oryx.Core.Command>[] Array of commands	 */	executeCommands: function(commands){				// Check if the argument is an array and the elements are from command-class		if ( 	commands instanceof Array 	&& 				commands.length > 0 		&& 				commands.all(function(command){ return command instanceof ORYX.Core.Command }) ) {					// Raise event for executing commands			this.handleEvents({				type		: ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,				commands	: commands			});						// Execute every command			commands.each(function(command){				command.execute();			})					}	},	    /**     * Returns JSON of underlying canvas (calls ORYX.Canvas#toJSON()).     * @return {Object} Returns JSON representation as JSON object.     */    getJSON: function(){        var canvas = this.getCanvas().toJSON();        canvas.ssextensions = this.getStencilSets().values()[0].extensions().keys();        return canvas;    },        /**     * Serializes a call to toJSON().     * @return {String} Returns JSON representation as string.     */    getSerializedJSON: function(){        return Ext.encode(this.getJSON());    },	    /**	 * @return {String} Returns eRDF representation.	 * @deprecated Use ORYX.Editor#getJSON instead, if possible.	 */	getERDF:function(){		// Get the serialized dom        var serializedDOM = DataManager.serializeDOM( this._getPluginFacade() );				// Add xml definition if there is no		serializedDOM = '<?xml version="1.0" encoding="utf-8"?>' +						'<html xmlns="http://www.w3.org/1999/xhtml" ' +						'xmlns:b3mn="http://b3mn.org/2007/b3mn" ' +						'xmlns:ext="http://b3mn.org/2007/ext" ' +						'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +						'xmlns:atom="http://b3mn.org/2007/atom+xhtml">' +						'<head profile="http://purl.org/NET/erdf/profile">' +						'<link rel="schema.dc" href="http://purl.org/dc/elements/1.1/" />' +						'<link rel="schema.dcTerms" href="http://purl.org/dc/terms/ " />' +						'<link rel="schema.b3mn" href="http://b3mn.org" />' +						'<link rel="schema.oryx" href="http://oryx-editor.org/" />' +						'<link rel="schema.raziel" href="http://raziel.org/" />' +						'<base href="' +						location.href.split("?")[0] +						'" />' +						'</head><body>' +						serializedDOM +						'</body></html>';				return serializedDOM;					},    	/**	* Imports shapes in JSON as expected by {@link ORYX.Editor#loadSerialized}	* @param {Object|String} jsonObject The (serialized) json object to be imported	* @param {boolean } [noSelectionAfterImport=false] Set to true if no shapes should be selected after import	* @throws {SyntaxError} If the serialized json object contains syntax errors	*/	importJSON: function(jsonObject, noSelectionAfterImport) {		        try {            jsonObject = this.renewResourceIds(jsonObject);        } catch(error){            throw error;        }     		//check, if the imported json model can be loaded in this editor		// (stencil set has to fit)        if (!jsonObject.stencilset) {        	Ext.Msg.alert(ORYX.I18N.JSONImport.title, ORYX.I18N.JSONImport.invalidJSON);        	return null;        }		if(jsonObject.stencilset.namespace && jsonObject.stencilset.namespace !== this.getCanvas().getStencil().stencilSet().namespace()) {			Ext.Msg.alert(ORYX.I18N.JSONImport.title, String.format(ORYX.I18N.JSONImport.wrongSS, jsonObject.stencilset.namespace, this.getCanvas().getStencil().stencilSet().namespace()));			return null;		} else {			var commandClass = ORYX.Core.Command.extend({			construct: function(jsonObject, loadSerializedCB, noSelectionAfterImport, facade){				this.jsonObject = jsonObject;				this.noSelection = noSelectionAfterImport;				this.facade = facade;				this.shapes;				this.connections = [];				this.parents = new Hash();				this.selection = this.facade.getSelection();				this.loadSerialized = loadSerializedCB;			},						execute: function(){								if (!this.shapes) {					// Import the shapes out of the serialization							this.shapes	= this.loadSerialized( this.jsonObject );												//store all connections					this.shapes.each(function(shape) {												if (shape.getDockers) {							var dockers = shape.getDockers();							if (dockers) {								if (dockers.length > 0) {									this.connections.push([dockers.first(), dockers.first().getDockedShape(), dockers.first().referencePoint]);								}								if (dockers.length > 1) {									this.connections.push([dockers.last(), dockers.last().getDockedShape(), dockers.last().referencePoint]);								}							}						}												//store parents						this.parents[shape.id] = shape.parent;					}.bind(this));				} else {					this.shapes.each(function(shape) {						this.parents[shape.id].add(shape);					}.bind(this));										this.connections.each(function(con) {						con[0].setDockedShape(con[1]);						con[0].setReferencePoint(con[2]);						//con[0].update();					});				}								//this.parents.values().uniq().invoke("update");				this.facade.getCanvas().update();									if(!this.noSelection)					this.facade.setSelection(this.shapes);				else					this.facade.updateSelection();				},				rollback: function(){					var selection = this.facade.getSelection();										this.shapes.each(function(shape) {						selection = selection.without(shape);						this.facade.deleteShape(shape);					}.bind(this));										/*this.parents.values().uniq().each(function(parent) {						if(!this.shapes.member(parent))							parent.update();					}.bind(this));*/										this.facade.getCanvas().update();										this.facade.setSelection(selection);				}			})						var command = new commandClass(jsonObject, 											this.loadSerialized.bind(this),											noSelectionAfterImport,											this._getPluginFacade());						this.executeCommands([command]);							return command.shapes.clone();		}	},        /**     * This method renew all resource Ids and according references.     * Warning: The implementation performs a substitution on the serialized object for     * easier implementation. This results in a low performance which is acceptable if this     * is only used when importing models.     * @param {Object|String} jsonObject     * @throws {SyntaxError} If the serialized json object contains syntax errors.     * @return {Object} The jsonObject with renewed ids.     * @private     */    renewResourceIds: function(jsonObject){        // For renewing resource ids, a serialized and object version is needed        if(Ext.type(jsonObject) === "string"){            try {                var serJsonObject = jsonObject;                jsonObject = Ext.decode(jsonObject);            } catch(error){                throw new SyntaxError(error.message);            }        } else {            var serJsonObject = Ext.encode(jsonObject);        }                        // collect all resourceIds recursively        var collectResourceIds = function(shapes){            if(!shapes) return [];                        return shapes.map(function(shape){                return collectResourceIds(shape.childShapes).concat(shape.resourceId);            }).flatten();        }        var resourceIds = collectResourceIds(jsonObject.childShapes);                // Replace each resource id by a new one        resourceIds.each(function(oldResourceId){            var newResourceId = ORYX.Editor.provideId();            serJsonObject = serJsonObject.gsub('"'+oldResourceId+'"', '"'+newResourceId+'"')        });                return Ext.decode(serJsonObject);    },		/**	 * Import erdf structure to the editor	 *	 */	importERDF: function( erdfDOM ){		var serialized = this.parseToSerializeObjects( erdfDOM );					if(serialized)			return this.importJSON(serialized, true);	},	/**	 * Parses one model (eRDF) to the serialized form (JSON)	 * 	 * @param {Object} oneProcessData	 * @return {Object} The JSON form of given eRDF model, or null if it couldn't be extracted 	 */	parseToSerializeObjects: function( oneProcessData ){				// Firefox splits a long text node into chunks of 4096 characters.		// To prevent truncation of long property values the normalize method must be called		if(oneProcessData.normalize) oneProcessData.normalize();		try {			var xsl = "";			var source=ORYX.PATH + "lib/extract-rdf.xsl";			new Ajax.Request(source, {				asynchronous: false,				method: 'get',				onSuccess: function(transport){					xsl = transport.responseText				}.bind(this),				onFailure: (function(transport){					ORYX.Log.error("XSL load failed" + transport);				}).bind(this)			});			var domParser = new DOMParser();			var xmlObject = oneProcessData;			var xslObject = domParser.parseFromString(xsl, "text/xml");        	var xsltProcessor = new XSLTProcessor();        	var xslRef = document.implementation.createDocument("", "", null);        	xsltProcessor.importStylesheet(xslObject);                    var new_rdf = xsltProcessor.transformToFragment(xmlObject, document);            var serialized_rdf = (new XMLSerializer()).serializeToString(new_rdf);			}catch(e){			Ext.Msg.alert("Oryx", error);			var serialized_rdf = "";		}                        // Firefox 2 to 3 problem?!            serialized_rdf = !serialized_rdf.startsWith("<?xml") ? "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf : serialized_rdf;        var req = new Ajax.Request(ORYX.CONFIG.ROOT_PATH+"rdf2json", {          method: 'POST',          asynchronous: false,          onSuccess: function(transport) {              Ext.decode(transport.responseText);          },          parameters: {              rdf: serialized_rdf          }        });                return Ext.decode(req.transport.responseText);	},    /**     * Loads serialized model to the oryx.     * @example     * editor.loadSerialized({     *    resourceId: "mymodel1",     *    childShapes: [     *       {     *          stencil:{ id:"Subprocess" },     *          outgoing:[{resourceId: 'aShape'}],     *          target: {resourceId: 'aShape'},     *          bounds:{ lowerRight:{ y:510, x:633 }, upperLeft:{ y:146, x:210 } },     *          resourceId: "myshape1",     *          childShapes:[],     *          properties:{},     *       }     *    ],     *    properties:{     *       language: "English"     *    },     *    stencilset:{     *       url:ORYX.PATH + "/stencilsets/bpmn1.1/bpmn1.1.json"     *    },     *    stencil:{     *       id:"BPMNDiagram"     *    }     * });     * @param {Object} model Description of the model to load.     * @param {Array} [model.ssextensions] List of stenctil set extensions.     * @param {String} model.stencilset.url     * @param {String} model.stencil.id      * @param {Array} model.childShapes     * @param {Array} [model.properties]     * @param {String} model.resourceId     * @return {ORYX.Core.Shape[]} List of created shapes     * @methodOf ORYX.Editor.prototype     */    loadSerialized: function( model ){        var canvas  = this.getCanvas();              // Bugfix (cf. http://code.google.com/p/oryx-editor/issues/detail?id=240)        // Deserialize the canvas' stencil set extensions properties first!        this.loadSSExtensions(model.ssextensions);        var shapes = this.getCanvas().addShapeObjects(model.childShapes, this.handleEvents.bind(this));                if(model.properties) {        	for(key in model.properties) {        		var prop = model.properties[key];        		if (!(typeof prop === "string")) {        			prop = Ext.encode(prop);        		}            	this.getCanvas().setProperty("oryx-" + key, prop);            }        }                        this.getCanvas().updateSize();        return shapes;    },        /**     * Calls ORYX.Editor.prototype.ss_extension_namespace for each element     * @param {Array} ss_extension_namespaces An array of stencil set extension namespaces.     */    loadSSExtensions: function(ss_extension_namespaces){        if(!ss_extension_namespaces) return;        ss_extension_namespaces.each(function(ss_extension_namespace){            this.loadSSExtension(ss_extension_namespace);        }.bind(this));    },		/**	* Loads a stencil set extension.	* The stencil set extensions definiton file must already	* be loaded when the editor is initialized.	*/	loadSSExtension: function(ss_extension_namespace) {								if (this.ss_extensions_def) {			var extension = this.ss_extensions_def.extensions.find(function(ex){				return (ex.namespace == ss_extension_namespace);			});						if (!extension) {				return;			}						var stencilset = this.getStencilSets()[extension["extends"]];						if (!stencilset) {				return;			}						stencilset.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER + extension["definition"])			//stencilset.addExtension("/oryx/build/stencilsets/extensions/" + extension["definition"])			this.getRules().initializeRules(stencilset);						this._getPluginFacade().raiseEvent({				type: ORYX.CONFIG.EVENT_STENCIL_SET_LOADED			});		}			},	disableEvent: function(eventType){		if(eventType == ORYX.CONFIG.EVENT_KEYDOWN) {			this._keydownEnabled = false;		}		if(eventType == ORYX.CONFIG.EVENT_KEYUP) {			this._keyupEnabled = false;		}		if(this.DOMEventListeners.keys().member(eventType)) {			var value = this.DOMEventListeners.remove(eventType);			this.DOMEventListeners['disable_' + eventType] = value;		}	},	enableEvent: function(eventType){		if(eventType == ORYX.CONFIG.EVENT_KEYDOWN) {			this._keydownEnabled = true;		}				if(eventType == ORYX.CONFIG.EVENT_KEYUP) {			this._keyupEnabled = true;		}				if(this.DOMEventListeners.keys().member("disable_" + eventType)) {			var value = this.DOMEventListeners.remove("disable_" + eventType);			this.DOMEventListeners[eventType] = value;		}	},	/**	 *  Methods for the PluginFacade	 */	registerOnEvent: function(eventType, callback) {		if(!(this.DOMEventListeners.keys().member(eventType))) {			this.DOMEventListeners[eventType] = [];		}		this.DOMEventListeners[eventType].push(callback);	},	unregisterOnEvent: function(eventType, callback) {		if(this.DOMEventListeners.keys().member(eventType)) {			this.DOMEventListeners[eventType] = this.DOMEventListeners[eventType].without(callback);		} else {			// Event is not supported			// TODO: Error Handling		}	},	getSelection: function() {		return this.selection;	},	getStencilSets: function() { 		return ORYX.Core.StencilSet.stencilSets(this.id); 	},		getRules: function() {		return ORYX.Core.StencilSet.rules(this.id);	},		loadStencilSet: function(source) {		try {			ORYX.Core.StencilSet.loadStencilSet(source, this.id);			this.handleEvents({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});		} catch (e) {			ORYX.Log.warn("Requesting stencil set file failed. (" + e + ")");		}	},	offer: function(pluginData) {		if(!this.pluginsData.member(pluginData)){			this.pluginsData.push(pluginData);		}	},		/**	 * It creates an new event or adds the callback, if already existing,	 * for the key combination that the plugin passes in keyCodes attribute	 * of the offer method.	 * 	 * The new key down event fits the schema:	 * 		key.event[.metactrl][.alt][.shift].'thekeyCode'	 */	registerPluginsOnKeyEvents: function() {		this.pluginsData.each(function(pluginData) {						if(pluginData.keyCodes) {								pluginData.keyCodes.each(function(keyComb) {					var eventName = "key.event";										/* Include key action */					eventName += '.' + keyComb.keyAction;										if(keyComb.metaKeys) {						/* Register on ctrl or apple meta key as meta key */						if(keyComb.metaKeys.							indexOf(ORYX.CONFIG.META_KEY_META_CTRL) > -1) {								eventName += "." + ORYX.CONFIG.META_KEY_META_CTRL;						}													/* Register on alt key as meta key */						if(keyComb.metaKeys.							indexOf(ORYX.CONFIG.META_KEY_ALT) > -1) {								eventName += '.' + ORYX.CONFIG.META_KEY_ALT;						}												/* Register on shift key as meta key */						if(keyComb.metaKeys.							indexOf(ORYX.CONFIG.META_KEY_SHIFT) > -1) {								eventName += '.' + ORYX.CONFIG.META_KEY_SHIFT;						}							}										/* Register on the actual key */					if(keyComb.keyCode)	{						eventName += '.' + keyComb.keyCode;					}										/* Register the event */					ORYX.Log.debug("Register Plugin on Key Event: %0", eventName);					this.registerOnEvent(eventName,pluginData.functionality);								}.bind(this));			}		}.bind(this));	},	setSelection: function(elements, subSelectionElement, force) {				if (!elements) { elements = [] }				elements = elements.compact().findAll(function(n){ return n instanceof ORYX.Core.Shape });				if (elements.first() instanceof ORYX.Core.Canvas) {			elements = [];		}				if (!force && elements.length === this.selection.length && this.selection.all(function(r){ return elements.include(r) })){			return;		}				this.selection = elements;		this._subSelection = subSelectionElement;				this.handleEvents({type:ORYX.CONFIG.EVENT_SELECTION_CHANGED, elements:elements, subSelection: subSelectionElement})	},		updateSelection: function() {		this.setSelection(this.selection, this._subSelection, true);		/*var s = this.selection;		this.setSelection();		this.setSelection(s);*/	},	getCanvas: function() {		return this._canvas;	},		/**	*	option = {	*		type: string,	*		position: {x:int, y:int},	*		connectingType:	uiObj-Class	*		connectedShape: uiObj	*		draggin: bool	*		namespace: url	*       parent: ORYX.Core.AbstractShape	*		template: a template shape that the newly created inherits properties from.	*		}	*/	createShape: function(option) {		if(option && option.serialize && option.serialize instanceof Array){					var type = option.serialize.find(function(obj){return (obj.prefix+"-"+obj.name) == "oryx-type"});			var stencil = ORYX.Core.StencilSet.stencil(type.value);					if(stencil.type() == 'node'){				var newShapeObject = new ORYX.Core.Node({'eventHandlerCallback':this.handleEvents.bind(this)}, stencil);				} else {				var newShapeObject = new ORYX.Core.Edge({'eventHandlerCallback':this.handleEvents.bind(this)}, stencil);				}					this.getCanvas().add(newShapeObject);			newShapeObject.deserialize(option.serialize);					return newShapeObject;		}		// If there is no argument, throw an exception		if(!option || !option.type || !option.namespace) { throw "To create a new shape you have to give an argument with type and namespace";}				var canvas = this.getCanvas();		var newShapeObject;		// Get the shape type		var shapetype = option.type;		// Get the stencil set		var sset = ORYX.Core.StencilSet.stencilSet(option.namespace);		// Create an New Shape, dependents on an Edge or a Node		if(sset.stencil(shapetype).type() == "node") {			newShapeObject = new ORYX.Core.Node({'eventHandlerCallback':this.handleEvents.bind(this)}, sset.stencil(shapetype))		} else {			newShapeObject = new ORYX.Core.Edge({'eventHandlerCallback':this.handleEvents.bind(this)}, sset.stencil(shapetype))		}				// when there is a template, inherit the properties.		if(option.template) {			newShapeObject._jsonStencil.properties = option.template._jsonStencil.properties;			newShapeObject.postProcessProperties();		}		// Add to the canvas		if(option.parent && newShapeObject instanceof ORYX.Core.Node) {			option.parent.add(newShapeObject);		} else {			canvas.add(newShapeObject);		}						// Set the position		var point = option.position ? option.position : {x:100, y:200};					var con;		// If there is create a shape and in the argument there is given an ConnectingType and is instance of an edge		if(option.connectingType && option.connectedShape && !(newShapeObject instanceof ORYX.Core.Edge)) {			// there will be create a new Edge			con = new ORYX.Core.Edge({'eventHandlerCallback':this.handleEvents.bind(this)}, sset.stencil(option.connectingType));						// And both endings dockers will be referenced to the both shapes			con.dockers.first().setDockedShape(option.connectedShape);						var magnet = option.connectedShape.getDefaultMagnet()			var cPoint = magnet ? magnet.bounds.center() : option.connectedShape.bounds.midPoint();			con.dockers.first().setReferencePoint( cPoint );			con.dockers.last().setDockedShape(newShapeObject);			con.dockers.last().setReferencePoint(newShapeObject.getDefaultMagnet().bounds.center());								// The Edge will be added to the canvas and be updated			canvas.add(con);				//con.update();					} 				// Move the new Shape to the position		if(newShapeObject instanceof ORYX.Core.Edge && option.connectedShape) {			newShapeObject.dockers.first().setDockedShape(option.connectedShape);						if( option.connectedShape instanceof ORYX.Core.Node ){				newShapeObject.dockers.first().setReferencePoint(option.connectedShape.getDefaultMagnet().bounds.center());									newShapeObject.dockers.last().bounds.centerMoveTo(point);						} else {				newShapeObject.dockers.first().setReferencePoint(option.connectedShape.bounds.midPoint());											}		} else {						var b = newShapeObject.bounds			if( newShapeObject instanceof ORYX.Core.Node && newShapeObject.dockers.length == 1){				b = newShapeObject.dockers.first().bounds			}						b.centerMoveTo(point);						var upL = b.upperLeft();			b.moveBy( -Math.min(upL.x, 0) , -Math.min(upL.y, 0) )						var lwR = b.lowerRight();			b.moveBy( -Math.max(lwR.x-canvas.bounds.width(), 0) , -Math.max(lwR.y-canvas.bounds.height(), 0) )					}				// Update the shape		if (newShapeObject instanceof ORYX.Core.Edge) {			newShapeObject._update(false);		}				// And refresh the selection		if(!(newShapeObject instanceof ORYX.Core.Edge)) {			this.setSelection([newShapeObject]);		}				if(con && con.alignDockers) {			con.alignDockers();		} 		if(newShapeObject.alignDockers) {			newShapeObject.alignDockers();		}		return newShapeObject;	},		deleteShape: function(shape) {				if (!shape || !shape.parent){ return }				//remove shape from parent		// this also removes it from DOM		shape.parent.remove(shape);				//delete references to outgoing edges		shape.getOutgoingShapes().each(function(os) {			var docker = os.getDockers().first();			if(docker && docker.getDockedShape() == shape) {				docker.setDockedShape(undefined);			}		});				//delete references to incoming edges		shape.getIncomingShapes().each(function(is) {			var docker = is.getDockers().last();			if(docker && docker.getDockedShape() == shape) {				docker.setDockedShape(undefined);			}		});				//delete references of the shape's dockers		shape.getDockers().each(function(docker) {			docker.setDockedShape(undefined);		});	},		/**	 * Returns an object with meta data about the model.	 * Like name, description, ...	 * 	 * Empty object with the current backend.	 * 	 * @return {Object} Meta data about the model	 */	getModelMetaData: function() {		return this.modelMetaData;	},	/* Event-Handler Methods */		/**	* Helper method to execute an event immediately. The event is not	* scheduled in the _eventsQueue. Needed to handle Layout-Callbacks.	*/	_executeEventImmediately: function(eventObj) {		if(this.DOMEventListeners.keys().member(eventObj.event.type)) {			this.DOMEventListeners[eventObj.event.type].each((function(value) {				value(eventObj.event, eventObj.arg);					}).bind(this));		}	},	_executeEvents: function() {		this._queueRunning = true;		while(this._eventsQueue.length > 0) {			var val = this._eventsQueue.shift();			this._executeEventImmediately(val);		}		this._queueRunning = false;	},		/**	 * Leitet die Events an die Editor-Spezifischen Event-Methoden weiter	 * @param {Object} event Event , welches gefeuert wurde	 * @param {Object} uiObj Target-UiObj	 */	handleEvents: function(event, uiObj) {				ORYX.Log.trace("Dispatching event type %0 on %1", event.type, uiObj);		switch(event.type) {			case ORYX.CONFIG.EVENT_MOUSEDOWN:				this._handleMouseDown(event, uiObj);				break;			case ORYX.CONFIG.EVENT_MOUSEMOVE:				this._handleMouseMove(event, uiObj);				break;			case ORYX.CONFIG.EVENT_MOUSEUP:				this._handleMouseUp(event, uiObj);				break;			case ORYX.CONFIG.EVENT_MOUSEOVER:				this._handleMouseHover(event, uiObj);				break;			case ORYX.CONFIG.EVENT_MOUSEOUT:				this._handleMouseOut(event, uiObj);				break;		}		/* Force execution if necessary. Used while handle Layout-Callbacks. */		if(event.forceExecution) {			this._executeEventImmediately({event: event, arg: uiObj});		} else {			this._eventsQueue.push({event: event, arg: uiObj});		}				if(!this._queueRunning) {			this._executeEvents();		}				// TODO: Make this return whether no listener returned false.		// So that, when one considers bubbling undesireable, it won't happen.		return false;	},	catchKeyUpEvents: function(event) {		if(!this._keyupEnabled) {			return;		}		/* assure we have the current event. */        if (!event)             event = window.event;        		// Checks if the event comes from some input field		if ( ["INPUT", "TEXTAREA"].include(event.target.tagName.toUpperCase()) ){			return;		}				/* Create key up event type */		var keyUpEvent = this.createKeyCombEvent(event,	ORYX.CONFIG.KEY_ACTION_UP);				ORYX.Log.debug("Key Event to handle: %0", keyUpEvent);		/* forward to dispatching. */		this.handleEvents({type: keyUpEvent, event:event});	},		/**	 * Catches all key down events and forward the appropriated event to 	 * dispatching concerning to the pressed keys.	 * 	 * @param {Event} 	 * 		The key down event to handle	 */	catchKeyDownEvents: function(event) {		if(!this._keydownEnabled) {			return;		}		/* Assure we have the current event. */        if (!event)             event = window.event;        		/* Fixed in FF3 */		// This is a mac-specific fix. The mozilla event object has no knowledge		// of meta key modifier on osx, however, it is needed for certain		// shortcuts. This fix adds the metaKey field to the event object, so		// that all listeners that registered per Oryx plugin facade profit from		// this. The original bug is filed in		// https://bugzilla.mozilla.org/show_bug.cgi?id=418334		//if (this.__currentKey == ORYX.CONFIG.KEY_CODE_META) {		//	event.appleMetaKey = true;		//}		//this.__currentKey = pressedKey;				// Checks if the event comes from some input field		if ( ["INPUT", "TEXTAREA"].include(event.target.tagName.toUpperCase()) ){			return;		}				/* Create key up event type */		var keyDownEvent = this.createKeyCombEvent(event, ORYX.CONFIG.KEY_ACTION_DOWN);				ORYX.Log.debug("Key Event to handle: %0", keyDownEvent);				/* Forward to dispatching. */		this.handleEvents({type: keyDownEvent,event: event});	},		/**	 * Creates the event type name concerning to the pressed keys.	 * 	 * @param {Event} keyDownEvent	 * 		The source keyDownEvent to build up the event name	 */	createKeyCombEvent: function(keyEvent, keyAction) {		/* Get the currently pressed key code. */        var pressedKey = keyEvent.which || keyEvent.keyCode;		//this.__currentKey = pressedKey;				/* Event name */		var eventName = "key.event";				/* Key action */		if(keyAction) {			eventName += "." + keyAction;		}				/* Ctrl or apple meta key is pressed */		if(keyEvent.ctrlKey || keyEvent.metaKey) {			eventName += "." + ORYX.CONFIG.META_KEY_META_CTRL;		}				/* Alt key is pressed */		if(keyEvent.altKey) {			eventName += "." + ORYX.CONFIG.META_KEY_ALT;		}				/* Alt key is pressed */		if(keyEvent.shiftKey) {			eventName += "." + ORYX.CONFIG.META_KEY_SHIFT;		}				/* Return the composed event name */		return  eventName + "." + pressedKey;	},	_handleMouseDown: function(event, uiObj) {				// get canvas.		var canvas = this.getCanvas();		// Try to get the focus		canvas.focus()			// find the shape that is responsible for this element's id.		var element = event.currentTarget;		var elementController = uiObj;		// gather information on selection.		var currentIsSelectable = (elementController !== null) &&			(elementController !== undefined) && (elementController.isSelectable);		var currentIsMovable = (elementController !== null) &&			(elementController !== undefined) && (elementController.isMovable);		var modifierKeyPressed = event.shiftKey || event.ctrlKey;		var noObjectsSelected = this.selection.length === 0;		var currentIsSelected = this.selection.member(elementController);		// Rule #1: When there is nothing selected, select the clicked object.		if(currentIsSelectable && noObjectsSelected) {			this.setSelection([elementController]);			ORYX.Log.trace("Rule #1 applied for mouse down on %0", element.id);		// Rule #3: When at least one element is selected, and there is no		// control key pressed, and the clicked object is not selected, select		// the clicked object.		} else if(currentIsSelectable && !noObjectsSelected &&			!modifierKeyPressed && !currentIsSelected) {			this.setSelection([elementController]);			//var objectType = elementController.readAttributes();			//alert(objectType[0] + ": " + objectType[1]);			ORYX.Log.trace("Rule #3 applied for mouse down on %0", element.id);		// Rule #4: When the control key is pressed, and the current object is		// not selected, add it to the selection.		} else if(currentIsSelectable && modifierKeyPressed			&& !currentIsSelected) {							var newSelection = this.selection.clone();			newSelection.push(elementController)			this.setSelection(newSelection)			ORYX.Log.trace("Rule #4 applied for mouse down on %0", element.id);		// Rule #6		} else if(currentIsSelectable && currentIsSelected &&			modifierKeyPressed) {			var newSelection = this.selection.clone();			this.setSelection(newSelection.without(elementController))			ORYX.Log.trace("Rule #6 applied for mouse down on %0", elementController.id);		// Rule #5: When there is at least one object selected and no control		// key pressed, we're dragging.		/*} else if(currentIsSelectable && !noObjectsSelected			&& !modifierKeyPressed) {			if(this.log.isTraceEnabled())				this.log.trace("Rule #5 applied for mouse down on "+element.id);*/		// Rule #2: When clicked on something that is neither		// selectable nor movable, clear the selection, and return.		} else if (!currentIsSelectable && !currentIsMovable) {						this.setSelection([]);						ORYX.Log.trace("Rule #2 applied for mouse down on %0", element.id);			return;		// Rule #7: When the current object is not selectable but movable,		// it is probably a control. Leave the selection unchanged but set		// the movedObject to the current one and enable Drag. Dockers will		// be processed in the dragDocker plugin.		} else if(!currentIsSelectable && currentIsMovable && !(elementController instanceof ORYX.Core.Controls.Docker)) {						// TODO: If there is any moveable elements, do this in a plugin			//ORYX.Core.UIEnableDrag(event, elementController);			ORYX.Log.trace("Rule #7 applied for mouse down on %0", element.id);				// Rule #8: When the element is selectable and is currently selected and no 		// modifier key is pressed		} else if(currentIsSelectable && currentIsSelected &&			!modifierKeyPressed) {						this._subSelection = this._subSelection != elementController ? elementController : undefined;									this.setSelection(this.selection, this._subSelection);						ORYX.Log.trace("Rule #8 applied for mouse down on %0", element.id);		}						// prevent event from bubbling, return.		//Event.stop(event);		return;	},	_handleMouseMove: function(event, uiObj) {		return;	},	_handleMouseUp: function(event, uiObj) {		// get canvas.		var canvas = this.getCanvas();		// find the shape that is responsible for this elemement's id.		var elementController = uiObj;		//get event position		var evPos = this.eventCoordinates(event);		//Event.stop(event);	},	_handleMouseHover: function(event, uiObj) {		return;	},	_handleMouseOut: function(event, uiObj) {		return;	},	/**	 * Calculates the event coordinates to SVG document coordinates.	 * @param {Event} event	 * @return {SVGPoint} The event coordinates in the SVG document	 */	eventCoordinates: function(event) {		var canvas = this.getCanvas();		var svgPoint = canvas.node.ownerSVGElement.createSVGPoint();		svgPoint.x = event.clientX;		svgPoint.y = event.clientY;		var matrix = canvas.node.getScreenCTM();		return svgPoint.matrixTransform(matrix.inverse());	}};ORYX.Editor = Clazz.extend(ORYX.Editor);/** * Creates a new ORYX.Editor instance by fetching a model from given url and passing it to the constructur * @param {String} modelUrl The JSON URL of a model. * @param {Object} config Editor config passed to the constructur, merged with the response of the request to modelUrl */ORYX.Editor.createByUrl = function(modelUrl, config){    if(!config) config = {};        new Ajax.Request(modelUrl, {      method: 'GET',      onSuccess: function(transport) {        var editorConfig = Ext.decode(transport.responseText);        editorConfig = Ext.applyIf(editorConfig, config);        new ORYX.Editor(editorConfig);              if ("function" == typeof(config.onSuccess)) {		  	config.onSuccess(transport);	    }      }.bind(this),      onFailure: function(transport) {    	if ("function" == typeof(config.onFailure)) {    	  config.onFailure(transport);    	}      }.bind(this)    });}// TODO Implement namespace awareness on attribute level./** * graft() function * Originally by Sean M. Burke from interglacial.com, altered for usage with * SVG and namespace (xmlns) support. Be sure you understand xmlns before * using this funtion, as it creates all grafted elements in the xmlns * provided by you and all element's attribures in default xmlns. If you * need to graft elements in a certain xmlns and wish to assign attributes * in both that and another xmlns, you will need to do stepwise grafting, * adding non-default attributes yourself or you'll have to enhance this * function. Latter, I would appreciate: martin�apfelfabrik.de * @param {Object} namespace The namespace in which * 					elements should be grafted. * @param {Object} parent The element that should contain the grafted * 					structure after the function returned. * @param {Object} t the crafting structure. * @param {Object} doc the document in which grafting is performed. */ORYX.Editor.graft = function(namespace, parent, t, doc) {    doc = (doc || (parent && parent.ownerDocument) || document);    var e;    if(t === undefined) {        throw "Can't graft an undefined value";    } else if(t.constructor == String) {        e = doc.createTextNode( t );    } else {        for(var i = 0; i < t.length; i++) {            if( i === 0 && t[i].constructor == String ) {                var snared;                snared = t[i].match( /^([a-z][a-z0-9]*)\.([^\s\.]+)$/i );                if( snared ) {                    e = doc.createElementNS(namespace, snared[1] );                    e.setAttributeNS(null, 'class', snared[2] );                    continue;                }                snared = t[i].match( /^([a-z][a-z0-9]*)$/i );                if( snared ) {                    e = doc.createElementNS(namespace, snared[1] );  // but no class                    continue;                }                // Otherwise:                e = doc.createElementNS(namespace, "span" );                e.setAttribute(null, "class", "namelessFromLOL" );            }            if( t[i] === undefined ) {                throw "Can't graft an undefined value in a list!";            } else if( t[i].constructor == String || t[i].constructor == Array ) {                this.graft(namespace, e, t[i], doc );            } else if(  t[i].constructor == Number ) {                this.graft(namespace, e, t[i].toString(), doc );            } else if(  t[i].constructor == Object ) {                // hash's properties => element's attributes                for(var k in t[i]) { e.setAttributeNS(null, k, t[i][k] ); }            } else {			}        }    }	if(parent) {	    parent.appendChild( e );	} else {	}    return e; // return the topmost created node};ORYX.Editor.provideId = function() {	var res = [], hex = '0123456789ABCDEF';	for (var i = 0; i < 36; i++) res[i] = Math.floor(Math.random()*0x10);	res[14] = 4;	res[19] = (res[19] & 0x3) | 0x8;	for (var i = 0; i < 36; i++) res[i] = hex[res[i]];	res[8] = res[13] = res[18] = res[23] = '-';	return "oryx_" + res.join('');};/** * When working with Ext, conditionally the window needs to be resized. To do * so, use this class method. Resize is deferred until 100ms, and all subsequent * resizeBugFix calls are ignored until the initially requested resize is * performed. */ORYX.Editor.resizeFix = function() {	if (!ORYX.Editor._resizeFixTimeout) {		ORYX.Editor._resizeFixTimeout = window.setTimeout(function() {			window.resizeBy(1,1);			window.resizeBy(-1,-1);			ORYX.Editor._resizefixTimeout = null;		}, 100); 	}};ORYX.Editor.Cookie = {		callbacks:[],			onChange: function( callback, interval ){			this.callbacks.push(callback);		this.start( interval )		},		start: function( interval ){				if( this.pe ){			return;		}				var currentString = document.cookie;				this.pe = new PeriodicalExecuter( function(){						if( currentString != document.cookie ){				currentString = document.cookie;				this.callbacks.each(function(callback){ callback(this.getParams()) }.bind(this));			}					}.bind(this), ( interval || 10000 ) / 1000);		},		stop: function(){		if( this.pe ){			this.pe.stop();			this.pe = null;		}	},			getParams: function(){		var res = {};				var p = document.cookie;		p.split("; ").each(function(param){ res[param.split("=")[0]] = param.split("=")[1];});				return res;	},			toString: function(){		return document.cookie;	}};/** * Workaround for SAFARI/Webkit, because * when trying to check SVGSVGElement of instanceof there is  * raising an error *  */ORYX.Editor.SVGClassElementsAreAvailable = true;ORYX.Editor.setMissingClasses = function() {		try {		SVGElement;	} catch(e) {		ORYX.Editor.SVGClassElementsAreAvailable = false;		SVGSVGElement 		= document.createElementNS('http://www.w3.org/2000/svg', 'svg').toString();		SVGGElement 		= document.createElementNS('http://www.w3.org/2000/svg', 'g').toString();		SVGPathElement 		= document.createElementNS('http://www.w3.org/2000/svg', 'path').toString();		SVGTextElement 		= document.createElementNS('http://www.w3.org/2000/svg', 'text').toString();		//SVGMarkerElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'marker').toString();		SVGRectElement 		= document.createElementNS('http://www.w3.org/2000/svg', 'rect').toString();		SVGImageElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'image').toString();		SVGCircleElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'circle').toString();		SVGEllipseElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'ellipse').toString();		SVGLineElement	 	= document.createElementNS('http://www.w3.org/2000/svg', 'line').toString();		SVGPolylineElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'polyline').toString();		SVGPolygonElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'polygon').toString();			}	}ORYX.Editor.checkClassType = function( classInst, classType ) {		if( ORYX.Editor.SVGClassElementsAreAvailable ){		return classInst instanceof classType	} else {		return classInst == classType	}};ORYX.Editor.makeExtModalWindowKeysave = function(facade) {	Ext.override(Ext.Window,{		beforeShow : function(){			delete this.el.lastXY;			delete this.el.lastLT;			if(this.x === undefined || this.y === undefined){				var xy = this.el.getAlignToXY(this.container, 'c-c');				var pos = this.el.translatePoints(xy[0], xy[1]);				this.x = this.x === undefined? pos.left : this.x;				this.y = this.y === undefined? pos.top : this.y;			}			this.el.setLeftTop(this.x, this.y);				if(this.expandOnShow){				this.expand(false);			}				if(this.modal){				facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);				Ext.getBody().addClass("x-body-masked");				this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));				this.mask.show();			}		},		afterHide : function(){	        this.proxy.hide();	        if(this.monitorResize || this.modal || this.constrain || this.constrainHeader){	            Ext.EventManager.removeResizeListener(this.onWindowResize, this);	        }	        if(this.modal){	            this.mask.hide();	            facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);	            Ext.getBody().removeClass("x-body-masked");	        }	        if(this.keyMap){	            this.keyMap.disable();	        }	        this.fireEvent("hide", this);	    },	    beforeDestroy : function(){	    	if(this.modal)	    		facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);	        Ext.destroy(	            this.resizer,	            this.dd,	            this.proxy,	            this.mask	        );	        Ext.Window.superclass.beforeDestroy.call(this);	    }	});}/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}ORYX.Core.UIEnableDrag = function(event, uiObj, option) {	this.uiObj = uiObj;	var upL = uiObj.bounds.upperLeft();	var a = uiObj.node.getScreenCTM();	this.faktorXY= {x: a.a, y: a.d};		this.scrollNode = uiObj.node.ownerSVGElement.parentNode.parentNode;		this.offSetPosition =  {		x: Event.pointerX(event) - (upL.x * this.faktorXY.x),		y: Event.pointerY(event) - (upL.y * this.faktorXY.y)};	this.offsetScroll	= {x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};			this.dragCallback = ORYX.Core.UIDragCallback.bind(this);	this.disableCallback = ORYX.Core.UIDisableDrag.bind(this);	this.movedCallback = option ? option.movedCallback : undefined;	this.upCallback = option ? option.upCallback : undefined;		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);	document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, 	this.dragCallback , false);};ORYX.Core.UIDragCallback = function(event) {	var position = {		x: Event.pointerX(event) - this.offSetPosition.x,		y: Event.pointerY(event) - this.offSetPosition.y}	position.x 	-= this.offsetScroll.x - this.scrollNode.scrollLeft; 	position.y 	-= this.offsetScroll.y - this.scrollNode.scrollTop;	position.x /= this.faktorXY.x;	position.y /= this.faktorXY.y;	this.uiObj.bounds.moveTo(position);	//this.uiObj.update();	if(this.movedCallback)		this.movedCallback(event);		Event.stop(event);};ORYX.Core.UIDisableDrag = function(event) {	document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.dragCallback, false);	document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);		if(this.upCallback)		this.upCallback(event);			this.upCallback = undefined;	this.movedCallback = undefined;				Event.stop(event);	};/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}/** * @classDescription Base class for Shapes. * @extends ORYX.Core.AbstractShape */ORYX.Core.Shape = {	/**	 * Constructor	 */	construct: function(options, stencil) {		// call base class constructor		arguments.callee.$.construct.apply(this, arguments);				this.dockers = [];		this.magnets = [];				this._defaultMagnet;				this.incoming = [];		this.outgoing = [];				this.nodes = [];				this._dockerChangedCallback = this._dockerChanged.bind(this);				//Hash map for all labels. Labels are not treated as children of shapes.		this._labels = new Hash();				// create SVG node		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg",			null,			['g', {id:this.id},				['g', {"class": "stencils"},					['g', {"class": "me"}],					['g', {"class": "children", style:"overflow:hidden"}],					['g', {"class": "edge"}]				],				['g', {"class": "controls"},					['g', {"class": "dockers"}],					['g', {"class": "magnets"}]								]			]);	},	/**	 * If changed flag is set, refresh method is called.	 */	update: function() {		//if(this.isChanged) {			//this.layout();
		//}	},		/**	 * !!!Not called from any sub class!!!	 */	_update: function() {	},		/**	 * Calls the super class refresh method	 *  and updates the svg elements that are referenced by a property.	 */	refresh: function() {		//call base class refresh method		arguments.callee.$.refresh.apply(this, arguments);				if(this.node.ownerDocument) {			//adjust SVG to properties' values			var me = this;			this.propertiesChanged.each((function(propChanged) {				if(propChanged.value) {					var prop = this.properties[propChanged.key];					var property = this.getStencil().property(propChanged.key);					this.propertiesChanged[propChanged.key] = false;					//handle choice properties					if(property.type() == ORYX.CONFIG.TYPE_CHOICE) {						//iterate all references to SVG elements						property.refToView().each((function(ref) {							//if property is referencing a label, update the label							if(ref !== "") {								var label = this._labels[this.id + ref];								if (label) {									// if a choice is not valid anymore (due to changed stencil set), choose the default value									if ("undefined" == typeof(property.item(prop)) || !property.item(prop)) {										label.text(property.value()); // standard value of the stencil set									}									else {										label.text(property.item(prop).value());									}								}							}						}).bind(this));													//if the choice's items are referencing SVG elements						// show the selected and hide all other referenced SVG						// elements						var refreshedSvgElements = new Hash();						property.items().each((function(item) {							item.refToView().each((function(itemRef) {								if(itemRef == "") { this.propertiesChanged[propChanged.key] = true; return; }																var svgElem = this.node.ownerDocument.getElementById(this.id + itemRef);									if(!svgElem) { this.propertiesChanged[propChanged.key] = true; return; }																								/* Do not refresh the same svg element multiple times */								if(!refreshedSvgElements[svgElem.id] || prop == item.value()) {									svgElem.setAttributeNS(null, 'display', ((prop == item.value()) ? 'inherit' : 'none'));									refreshedSvgElements[svgElem.id] = svgElem;								}																// Reload the href if there is an image-tag								if(ORYX.Editor.checkClassType(svgElem, SVGImageElement)) {									svgElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', svgElem.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));								}							}).bind(this));						}).bind(this));											} else { //handle properties that are not of type choice						//iterate all references to SVG elements						property.refToView().each((function(ref) {							//if the property does not reference an SVG element,							// do nothing							if(ref === "") { this.propertiesChanged[propChanged.key] = true; return; }									var refId = this.id + ref;							//get the SVG element							var svgElem = this.node.ownerDocument.getElementById(refId);							//if the SVG element can not be found							if(!svgElem || !(svgElem.ownerSVGElement)) { 								//if the referenced SVG element is a SVGAElement, it cannot								// be found with getElementById (Firefox bug).								// this is a work around								if(property.type() === ORYX.CONFIG.TYPE_URL || property.type() === ORYX.CONFIG.TYPE_DIAGRAM_LINK) {									var svgElems = this.node.ownerDocument.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'a');																		svgElem = $A(svgElems).find(function(elem) {										return elem.getAttributeNS(null, 'id') === refId;									});																		if(!svgElem) { this.propertiesChanged[propChanged.key] = true; return; } 								} else {									this.propertiesChanged[propChanged.key] = true;									return;								}												}														if (property.complexAttributeToView()) {								var label = this._labels[refId];								if (label) {									try {								    	propJson = prop.evalJSON();								    	var value = propJson[property.complexAttributeToView()]								    	label.text(value ? value : prop);								    } catch (e) {								    	label.text(prop);								    }								}															} else {								switch (property.type()) {									case ORYX.CONFIG.TYPE_BOOLEAN:																					if (typeof prop == "string")											prop = prop === "true"											svgElem.setAttributeNS(null, 'display', (!(prop === property.inverseBoolean())) ? 'inherit' : 'none');																				break;									case ORYX.CONFIG.TYPE_COLOR:										if(property.fill()) {											if (svgElem.tagName.toLowerCase() === "stop"){												svgElem.setAttributeNS(null, "stop-color", prop);																								// Adjust stop color of the others												if (svgElem.parentNode.tagName.toLowerCase() === "radialgradient"){													ORYX.Utils.adjustGradient(svgElem.parentNode, svgElem);												}											} else {												svgElem.setAttributeNS(null, 'fill', prop);											}										}										if(property.stroke()) {											svgElem.setAttributeNS(null, 'stroke', prop);										}										break;									case ORYX.CONFIG.TYPE_STRING:										var label = this._labels[refId];										if (label) {											label.text(prop);										}										break;									case ORYX.CONFIG.TYPE_INTEGER:										var label = this._labels[refId];										if (label) {											label.text(prop);										}										break;									case ORYX.CONFIG.TYPE_FLOAT:										if(property.fillOpacity()) {											svgElem.setAttributeNS(null, 'fill-opacity', prop);										} 										if(property.strokeOpacity()) {											svgElem.setAttributeNS(null, 'stroke-opacity', prop);										}										if(!property.fillOpacity() && !property.strokeOpacity()) {											var label = this._labels[refId];											if (label) {												label.text(prop);											}										}										break;									case ORYX.CONFIG.TYPE_URL:									case ORYX.CONFIG.TYPE_DIAGRAM_LINK:										//TODO what is the dafault path?										var hrefAttr = svgElem.getAttributeNodeNS('http://www.w3.org/1999/xlink', 'xlink:href');										if(hrefAttr) {											hrefAttr.textContent = prop;										} else {											svgElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', prop);										}											break;								}							}						}).bind(this));																	}									}			}).bind(this));						//update labels			this._labels.values().each(function(label) {				label.update();			});		}	},		layout: function() {		//this.getStencil().layout(this)		var layoutEvents = this.getStencil().layout()		if(this instanceof ORYX.Core.Node && layoutEvents) {			layoutEvents.each(function(event) {								// setup additional attributes				event.shape = this;				event.forceExecution = true;								// do layouting				this._delegateEvent(event);			}.bind(this))					}	},		/**	 * Returns an array of Label objects.	 */	getLabels: function() {		return this._labels.values();	},	/**	 * Returns an array of dockers of this object.	 */	getDockers: function() {		return this.dockers;	},		getMagnets: function() {		return this.magnets;	},		getDefaultMagnet: function() {		if(this._defaultMagnet) {			return this._defaultMagnet;		} else if (this.magnets.length > 0) {			return this.magnets[0];		} else {			return undefined;		}	},	getParentShape: function() {		return this.parent;	},		getIncomingShapes: function(iterator) {		if(iterator) {			this.incoming.each(iterator);		}		return this.incoming;	},		getIncomingNodes: function(iterator) {        return this.incoming.select(function(incoming){            var isNode = (incoming instanceof ORYX.Core.Node);            if(isNode && iterator) iterator(incoming);            return isNode;        });    },			getOutgoingShapes: function(iterator) {		if(iterator) {			this.outgoing.each(iterator);		}		return this.outgoing;	},        getOutgoingNodes: function(iterator) {        return this.outgoing.select(function(out){            var isNode = (out instanceof ORYX.Core.Node);            if(isNode && iterator) iterator(out);            return isNode;        });    },		getAllDockedShapes: function(iterator) {		var result = this.incoming.concat(this.outgoing);		if(iterator) {			result.each(iterator);		}		return result	},	getCanvas: function() {		if(this.parent instanceof ORYX.Core.Canvas) {			return this.parent;		} else if(this.parent instanceof ORYX.Core.Shape) {			return this.parent.getCanvas();		} else {			return undefined;		}	},		/**	 * 	 * @param {Object} deep	 * @param {Object} iterator	 */	getChildNodes: function(deep, iterator) {		if(!deep && !iterator) {			return this.nodes.clone();		} else {			var result = [];			this.nodes.each(function(uiObject) {				if(!uiObject.isVisible){return}				if(iterator) {					iterator(uiObject);				}				result.push(uiObject);								if(deep && uiObject instanceof ORYX.Core.Shape) {					result = result.concat(uiObject.getChildNodes(deep, iterator));				}			});				return result;		}	},		/**	 * Overrides the UIObject.add method. Adds uiObject to the correct sub node.	 * @param {UIObject} uiObject	 * @param {Number} index	 */	add: function(uiObject, index) {		//parameter has to be an UIObject, but		// must not be an Edge.		if(uiObject instanceof ORYX.Core.UIObject 			&& !(uiObject instanceof ORYX.Core.Edge)) {						if (!(this.children.member(uiObject))) {				//if uiObject is child of another parent, remove it from that parent.				if(uiObject.parent) {					uiObject.parent.remove(uiObject);				}				//add uiObject to this Shape				if(index != undefined)					this.children.splice(index, 0, uiObject);				else					this.children.push(uiObject);				//set parent reference				uiObject.parent = this;				//add uiObject.node to this.node depending on the type of uiObject				var parent;				if(uiObject instanceof ORYX.Core.Node) {					parent = this.node.childNodes[0].childNodes[1];					this.nodes.push(uiObject);				} else if(uiObject instanceof ORYX.Core.Controls.Control) {					var ctrls = this.node.childNodes[1];					if(uiObject instanceof ORYX.Core.Controls.Docker) {						parent = ctrls.childNodes[0];						if (this.dockers.length >= 2){							this.dockers.splice(index!==undefined?Math.min(index, this.dockers.length-1):this.dockers.length-1, 0, uiObject);						} else {							this.dockers.push(uiObject);						}					} else if(uiObject instanceof ORYX.Core.Controls.Magnet) {						parent = ctrls.childNodes[1];						this.magnets.push(uiObject);					} else {						parent = ctrls;					}				} else {	//UIObject					parent = this.node;				}				if(index != undefined && index < parent.childNodes.length)					uiObject.node = parent.insertBefore(uiObject.node, parent.childNodes[index]);				else					uiObject.node = parent.appendChild(uiObject.node);									this._changed();				//uiObject.bounds.registerCallback(this._changedCallback);												if(this.eventHandlerCallback)					this.eventHandlerCallback({type:ORYX.CONFIG.EVENT_SHAPEADDED,shape:uiObject})								} else {				ORYX.Log.warn("add: ORYX.Core.UIObject is already a child of this object.");			}		} else {			ORYX.Log.warn("add: Parameter is not of type ORYX.Core.UIObject.");		}	},	/**	 * Overrides the UIObject.remove method. Removes uiObject.	 * @param {UIObject} uiObject	 */	remove: function(uiObject) {		//if uiObject is a child of this object, remove it.		if (this.children.member(uiObject)) {			//remove uiObject from children			this.children = this.children.without(uiObject);			//delete parent reference of uiObject			uiObject.parent = undefined;			//delete uiObject.node from this.node			if(uiObject instanceof ORYX.Core.Shape) {				if(uiObject instanceof ORYX.Core.Edge) {					uiObject.removeMarkers();					uiObject.node = this.node.childNodes[0].childNodes[2].removeChild(uiObject.node);				} else {					uiObject.node = this.node.childNodes[0].childNodes[1].removeChild(uiObject.node);					this.nodes = this.nodes.without(uiObject);				}			} else if(uiObject instanceof ORYX.Core.Controls.Control) {				if (uiObject instanceof ORYX.Core.Controls.Docker) {					uiObject.node = this.node.childNodes[1].childNodes[0].removeChild(uiObject.node);					this.dockers = this.dockers.without(uiObject);				} else if (uiObject instanceof ORYX.Core.Controls.Magnet) {					uiObject.node = this.node.childNodes[1].childNodes[1].removeChild(uiObject.node);					this.magnets = this.magnets.without(uiObject);				} else {					uiObject.node = this.node.childNodes[1].removeChild(uiObject.node);				}			}			this._changed();			//uiObject.bounds.unregisterCallback(this._changedCallback);		} else {			ORYX.Log.warn("remove: ORYX.Core.UIObject is not a child of this object.");		}	},		/**	 * Calculate the Border Intersection Point between two points	 * @param {PointA}	 * @param {PointB}	 */	getIntersectionPoint: function() {					var pointAX, pointAY, pointBX, pointBY;				// Get the the two Points			switch(arguments.length) {			case 2:				pointAX = arguments[0].x;				pointAY = arguments[0].y;				pointBX = arguments[1].x;				pointBY = arguments[1].y;				break;			case 4:				pointAX = arguments[0];				pointAY = arguments[1];				pointBX = arguments[2];				pointBY = arguments[3];				break;			default:				throw "getIntersectionPoints needs two or four arguments";		}								// Defined an include and exclude point		var includePointX, includePointY, excludePointX, excludePointY;		var bounds = this.absoluteBounds();				if(this.isPointIncluded(pointAX, pointAY, bounds)){			includePointX = pointAX;			includePointY = pointAY;		} else {			excludePointX = pointAX;			excludePointY = pointAY;		}		if(this.isPointIncluded(pointBX, pointBY, bounds)){			includePointX = pointBX;			includePointY = pointBY;		} else {			excludePointX = pointBX;			excludePointY = pointBY;		}						// If there is no inclue or exclude Shape, than return		if(!includePointX || !includePointY || !excludePointX || !excludePointY) {			return undefined;		}		var midPointX = 0;		var midPointY = 0;						var refPointX, refPointY;				var minDifferent = 1;		// Get the UpperLeft and LowerRight		//var ul = bounds.upperLeft();		//var lr = bounds.lowerRight();				var i = 0;				while(true) {			// Calculate the midpoint of the current to points				var midPointX = Math.min(includePointX, excludePointX) + ((Math.max(includePointX, excludePointX) - Math.min(includePointX, excludePointX)) / 2.0);			var midPointY = Math.min(includePointY, excludePointY) + ((Math.max(includePointY, excludePointY) - Math.min(includePointY, excludePointY)) / 2.0);									// Set the new midpoint by the means of the include of the bounds			if(this.isPointIncluded(midPointX, midPointY, bounds)){				includePointX = midPointX;				includePointY = midPointY;			} else {				excludePointX = midPointX;				excludePointY = midPointY;			}									// Calc the length of the line			var length = Math.sqrt(Math.pow(includePointX - excludePointX, 2) + Math.pow(includePointY - excludePointY, 2))			// Calc a point one step from the include point			refPointX = includePointX + ((excludePointX - includePointX) / length),			refPointY = includePointY + ((excludePointY - includePointY) / length)											// If the reference point not in the bounds, break			if(!this.isPointIncluded(refPointX, refPointY, bounds)) {				break			}												}		// Return the last includepoint		return {x:refPointX , y:refPointY};	},           /**     * Calculate if the point is inside the Shape     * @param {PointX}     * @param {PointY}      */    isPointIncluded: function(){		return  false	},        /**     * Calculate if the point is over an special offset area     * @param {Point}     */    isPointOverOffset: function(){		return  this.isPointIncluded.apply( this , arguments )	},			_dockerChanged: function() {	},			/**	 * Create a Docker for this Edge	 *	 */	createDocker: function(index, position) {		var docker = new ORYX.Core.Controls.Docker({eventHandlerCallback: this.eventHandlerCallback});		docker.bounds.registerCallback(this._dockerChangedCallback);		if(position) {			docker.bounds.centerMoveTo(position);		}		this.add(docker, index);				return docker	},	/**	 * Get the serialized object	 * return Array with hash-entrees (prefix, name, value)	 * Following values will given:	 * 		Bounds	 * 		Outgoing Shapes	 * 		Parent	 */	serialize: function() {		var serializedObject = arguments.callee.$.serialize.apply(this);		// Add the bounds		serializedObject.push({name: 'bounds', prefix:'oryx', value: this.bounds.serializeForERDF(), type: 'literal'});		// Add the outgoing shapes		this.getOutgoingShapes().each((function(followingShape){			serializedObject.push({name: 'outgoing', prefix:'raziel', value: '#'+ERDF.__stripHashes(followingShape.resourceId), type: 'resource'});					}).bind(this));		// Add the parent shape, if the parent not the canvas		//if(this.parent instanceof ORYX.Core.Shape){			serializedObject.push({name: 'parent', prefix:'raziel', value: '#'+ERDF.__stripHashes(this.parent.resourceId), type: 'resource'});			//}							return serializedObject;	},					deserialize: function(serialze){		arguments.callee.$.deserialize.apply(this, arguments);				// Set the Bounds		var bounds = serialze.find(function(ser){ return (ser.prefix+"-"+ser.name) == 'oryx-bounds'});		if(bounds) {			var b = bounds.value.replace(/,/g, " ").split(" ").without("");			if(this instanceof ORYX.Core.Edge){				this.dockers.first().bounds.centerMoveTo(parseFloat(b[0]), parseFloat(b[1]));				this.dockers.last().bounds.centerMoveTo(parseFloat(b[2]), parseFloat(b[3]));			} else {				this.bounds.set(parseFloat(b[0]), parseFloat(b[1]), parseFloat(b[2]), parseFloat(b[3]));			}					}	},			/**	 * Private methods.	 */	/**	 * Child classes have to overwrite this method for initializing a loaded	 * SVG representation.	 * @param {SVGDocument} svgDocument	 */	_init: function(svgDocument) {		//adjust ids		this._adjustIds(svgDocument, 0);	},	_adjustIds: function(element, idIndex) {		if(element instanceof Element) {			var eid = element.getAttributeNS(null, 'id');			if(eid && eid !== "") {				element.setAttributeNS(null, 'id', this.id + eid);			} else {				element.setAttributeNS(null, 'id', this.id + "_" + this.id + "_" + idIndex);				idIndex++;			}						// Replace URL in fill attribute			var fill = element.getAttributeNS(null, 'fill');			if (fill&&fill.include("url(#")){				fill = fill.replace(/url\(#/g, 'url(#'+this.id);				element.setAttributeNS(null, 'fill', fill);			}						if(element.hasChildNodes()) {				for(var i = 0; i < element.childNodes.length; i++) {					idIndex = this._adjustIds(element.childNodes[i], idIndex);				}			}		}		return idIndex;	},	toString: function() { return "ORYX.Core.Shape " + this.getId() }};ORYX.Core.Shape = ORYX.Core.AbstractShape.extend(ORYX.Core.Shape);/**
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

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.Controls) {ORYX.Core.Controls = {};}


/**
 * @classDescription Abstract base class for all Controls.
 */
ORYX.Core.Controls.Control = ORYX.Core.UIObject.extend({
	
	toString: function() { return "Control " + this.id; }
 });/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}if(!ORYX.Core.Controls) {ORYX.Core.Controls = {};}/** * @classDescription Represents a movable docker that can be bound to a shape. Dockers are used * for positioning shape objects. * @extends {Control} *  * TODO absoluteXY und absoluteCenterXY von einem Docker liefern falsche Werte!!! */ORYX.Core.Controls.Docker = ORYX.Core.Controls.Control.extend({	/**	 * Constructor	 */	construct: function() {		arguments.callee.$.construct.apply(this, arguments);				this.isMovable = true;				// Enables movability		this.bounds.set(0, 0, 16, 16);		// Set the bounds		this.referencePoint = undefined;		// Refrenzpoint 		this._dockedShapeBounds = undefined;				this._dockedShape = undefined;		this._oldRefPoint1 = undefined;		this._oldRefPoint2 = undefined;				//this.anchors = [];		this.anchorLeft;		this.anchorRight;		this.anchorTop;		this.anchorBottom;		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg",			null,			['g']);		// The DockerNode reprasentation		this._dockerNode = ORYX.Editor.graft("http://www.w3.org/2000/svg",			this.node,			['g', {"pointer-events":"all"},					['circle', {cx:"8", cy:"8", r:"8", stroke:"none", fill:"none"}],					['circle', {cx:"8", cy:"8", r:"3", stroke:"black", fill:"red", "stroke-width":"1"}]				]);					// The ReferenzNode reprasentation			this._referencePointNode = ORYX.Editor.graft("http://www.w3.org/2000/svg",			this.node,				['g', {"pointer-events":"none"},				['circle', {cx: this.bounds.upperLeft().x, cy: this.bounds.upperLeft().y, r: 3, fill:"red", "fill-opacity":0.4}]]);		// Hide the Docker		this.hide();				//Add to the EventHandler		this.addEventHandlers(this.node);		// Buffer the Update Callback for un-/register on Event-Handler 		this._updateCallback = this._changed.bind(this);	},		update: function() {		// If there have an DockedShape			if(this._dockedShape) {			if(this._dockedShapeBounds && this._dockedShape instanceof ORYX.Core.Node) {				// Calc the delta of width and height of the lastBounds and the current Bounds				var dswidth = this._dockedShapeBounds.width();				var dsheight = this._dockedShapeBounds.height();				if(!dswidth)					dswidth = 1;				if(!dsheight)					dsheight = 1;					var widthDelta = 	this._dockedShape.bounds.width() 	/ dswidth;				var heightDelta = 	this._dockedShape.bounds.height() 	/ dsheight;								// If there is an different				if(widthDelta !== 1.0 || heightDelta !== 1.0) {					// Set the delta					this.referencePoint.x *= widthDelta;					this.referencePoint.y *= heightDelta;				}					// Clone these bounds				this._dockedShapeBounds = this._dockedShape.bounds.clone();							}						// Get the first and the last Docker of the parent Shape			var dockerIndex = this.parent.dockers.indexOf(this)			var dock1 = this;			var dock2 = this.parent.dockers.length > 1 ? 							(dockerIndex === 0?							// If there is the first element							 	this.parent.dockers[dockerIndex + 1]:	// then take the next docker								this.parent.dockers[dockerIndex - 1]):  // if not, then take the docker before							undefined;						// Calculate the first absolute Refenzpoint 			var absoluteReferenzPoint1 = dock1.getDockedShape() ? 				dock1.getAbsoluteReferencePoint() : 				dock1.bounds.center();			// Calculate the last absolute Refenzpoint 			var absoluteReferenzPoint2 = dock2 && dock2.getDockedShape() ? 				dock2.getAbsoluteReferencePoint() : 				dock2 ? 					dock2.bounds.center() :					undefined;			// If there is no last absolute Referenzpoint					if(!absoluteReferenzPoint2) {				// Calculate from the middle of the DockedShape				var center = this._dockedShape.absoluteCenterXY();				var minDimension = this._dockedShape.bounds.width() * this._dockedShape.bounds.height(); 				absoluteReferenzPoint2 = {					x: absoluteReferenzPoint1.x + (center.x - absoluteReferenzPoint1.x) * -minDimension,					y: absoluteReferenzPoint1.y + (center.y - absoluteReferenzPoint1.y) * -minDimension				}			}						var newPoint = undefined;						/*if (!this._oldRefPoint1 || !this._oldRefPoint2 ||				absoluteReferenzPoint1.x !== this._oldRefPoint1.x ||				absoluteReferenzPoint1.y !== this._oldRefPoint1.y ||				absoluteReferenzPoint2.x !== this._oldRefPoint2.x ||				absoluteReferenzPoint2.y !== this._oldRefPoint2.y) {*/								// Get the new point for the Docker, calucalted by the intersection point of the Shape and the two points				newPoint = this._dockedShape.getIntersectionPoint(absoluteReferenzPoint1, absoluteReferenzPoint2);								// If there is new point, take the referencepoint as the new point				if(!newPoint) {					newPoint = this.getAbsoluteReferencePoint();				}								if(this.parent && this.parent.parent) {					var grandParentPos = this.parent.parent.absoluteXY();					newPoint.x -= grandParentPos.x;					newPoint.y -= grandParentPos.y;				}								// Set the bounds to the new point				this.bounds.centerMoveTo(newPoint)							this._oldRefPoint1 = absoluteReferenzPoint1;				this._oldRefPoint2 = absoluteReferenzPoint2;			} 			/*else {				newPoint = this.bounds.center();			}*/							//	}				// Call the super class		arguments.callee.$.update.apply(this, arguments);	},	/**	 * Calls the super class refresh method and updates the view of the docker.	 */	refresh: function() {		arguments.callee.$.refresh.apply(this, arguments);				// Refresh the dockers node		var p = this.bounds.upperLeft();		this._dockerNode.setAttributeNS(null, 'transform','translate(' + p.x + ', ' + p.y + ')');				// Refresh the referencepoints node		p = Object.clone(this.referencePoint);				if(p && this._dockedShape){			var upL 			if(this.parent instanceof ORYX.Core.Edge) {				upL = this._dockedShape.absoluteXY();			} else {				upL = this._dockedShape.bounds.upperLeft();
			}			p.x += upL.x;			p.y += upL.y;		} else {			p = this.bounds.center();		}					this._referencePointNode.setAttributeNS(null, 'transform','translate(' + p.x + ', ' + p.y + ')');	},	/**	 * Set the reference point	 * @param {Object} point	 */		setReferencePoint: function(point) {		// Set the referencepoint		if(this.referencePoint !== point &&			(!this.referencePoint || 			!point ||			this.referencePoint.x !== point.x || 			this.referencePoint.y !== point.y)) {							this.referencePoint = point;			this._changed();					}				// Update directly, because the referencepoint has no influence of the bounds		//this.refresh();	},		/**	 * Get the absolute referencepoint	 */	getAbsoluteReferencePoint: function() {		if(!this.referencePoint || !this._dockedShape) {			return undefined;		} else {			var absUL = this._dockedShape.absoluteXY();			return {							x: this.referencePoint.x + absUL.x,						y: this.referencePoint.y + absUL.y					}		}	},			/**	 * Set the docked Shape from the docker	 * @param {Object} shape	 */	setDockedShape: function(shape) {		// If there is an old docked Shape		if(this._dockedShape) {			this._dockedShape.bounds.unregisterCallback(this._updateCallback)						// Delete the Shapes from the incoming and outgoing array			// If this Docker the incoming of the Shape			if(this === this.parent.dockers.first()) {								this.parent.incoming = this.parent.incoming.without(this._dockedShape);				this._dockedShape.outgoing = this._dockedShape.outgoing.without(this.parent);						// If this Docker the outgoing of the Shape				} else if (this === this.parent.dockers.last()){					this.parent.outgoing = this.parent.outgoing.without(this._dockedShape);				this._dockedShape.incoming = this._dockedShape.incoming.without(this.parent);										}					}				// Set the new Shape		this._dockedShape = shape;		this._dockedShapeBounds = undefined;		var referencePoint = undefined;				// If there is an Shape, register the updateCallback if there are changes in the shape bounds		if(this._dockedShape) {						// Add the Shapes to the incoming and outgoing array			// If this Docker the incoming of the Shape			if(this === this.parent.dockers.first()) {								this.parent.incoming.push(shape);				shape.outgoing.push(this.parent);						// If this Docker the outgoing of the Shape				} else if (this === this.parent.dockers.last()){					this.parent.outgoing.push(shape);				shape.incoming.push(this.parent);										}						// Get the bounds and set the new referencepoint			var bounds = this.bounds;			var absUL = shape.absoluteXY();						/*if(shape.parent){				var b = shape.parent.bounds.upperLeft();				absUL.x -= b.x;				absUL.y -= b.y;
			}*/						referencePoint = {				x: bounds.center().x - absUL.x,				y: bounds.center().y - absUL.y			}										this._dockedShapeBounds = this._dockedShape.bounds.clone();						this._dockedShape.bounds.registerCallback(this._updateCallback);						// Set the color of the docker as docked			this.setDockerColor(ORYX.CONFIG.DOCKER_DOCKED_COLOR);						} else {			// Set the color of the docker as undocked			this.setDockerColor(ORYX.CONFIG.DOCKER_UNDOCKED_COLOR);		}		// Set the referencepoint		this.setReferencePoint(referencePoint);		this._changed();		//this.update();	},		/**	 * Get the docked Shape	 */	getDockedShape: function() {		return this._dockedShape;	},	/**	 * Returns TRUE if the docker has a docked shape	 */	isDocked: function() {		return !!this._dockedShape;	},			/**	 * Set the Color of the Docker	 * @param {Object} color	 */	setDockerColor: function(color) {		this._dockerNode.lastChild.setAttributeNS(null, "fill", color);	},		/**	 * Hides this UIObject and all its children.	 */	hide: function() {		this.node.setAttributeNS(null, 'visibility', 'hidden');				this.children.each(function(uiObj) {			uiObj.hide();			});					},		/**	 * Enables visibility of this UIObject and all its children.	 */	show: function() {		this.node.setAttributeNS(null, 'visibility', 'visible');				this.children.each(function(uiObj) {			uiObj.show();			});			},		toString: function() { return "Docker " + this.id }});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if(!ORYX) {var ORYX = {};}if(!ORYX.Core) {ORYX.Core = {};}if(!ORYX.Core.Controls) {ORYX.Core.Controls = {};}/** * @classDescription Represents a magnet that is part of another shape and can * be attached to dockers. Magnets are used for linking edge objects * to other Shape objects. * @extends {Control} */ORYX.Core.Controls.Magnet = ORYX.Core.Controls.Control.extend({			/**	 * Constructor	 */	construct: function() {		arguments.callee.$.construct.apply(this, arguments);				//this.anchors = [];		this.anchorLeft;		this.anchorRight;		this.anchorTop;		this.anchorBottom;				this.bounds.set(0, 0, 16, 16);				//graft magnet's root node into owner's control group.		this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg",			null,			['g', {"pointer-events":"all"},					['circle', {cx:"8", cy:"8", r:"4", stroke:"none", fill:"red", "fill-opacity":"0.3"}],				]);					this.hide();	},		update: function() {		arguments.callee.$.update.apply(this, arguments);				//this.isChanged = true;	},		_update: function() {				arguments.callee.$.update.apply(this, arguments);				//this.isChanged = true;	},		refresh: function() {		arguments.callee.$.refresh.apply(this, arguments);		var p = this.bounds.upperLeft();		/*if(this.parent) {			var parentPos = this.parent.bounds.upperLeft();			p.x += parentPos.x;			p.y += parentPos.y;		}*/				this.node.setAttributeNS(null, 'transform','translate(' + p.x + ', ' + p.y + ')');	},		show: function() {		//this.refresh();		arguments.callee.$.show.apply(this, arguments);	},		toString: function() {		return "Magnet " + this.id;	}});/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **//** * Init namespaces */if (!ORYX) {    var ORYX = {};}if (!ORYX.Core) {    ORYX.Core = {};}/** * @classDescription Abstract base class for all Nodes. * @extends ORYX.Core.Shape */ORYX.Core.Node = {    /**     * Constructor     * @param options {Object} A container for arguments.     * @param stencil {Stencil}     */    construct: function(options, stencil){        arguments.callee.$.construct.apply(this, arguments);                this.isSelectable = true;        this.isMovable = true;		this._dockerUpdated = false;                this._oldBounds = new ORYX.Core.Bounds(); //init bounds with undefined values        this._svgShapes = []; //array of all SVGShape objects of        // SVG representation                //TODO vielleicht in shape verschieben?        this.minimumSize = undefined; // {width:..., height:...}        this.maximumSize = undefined;                //TODO vielleicht in shape oder uiobject verschieben?        // vielleicht sogar isResizable ersetzen?        this.isHorizontallyResizable = false;        this.isVerticallyResizable = false;                this.dataId = undefined;                this._init(this._stencil.view());    },            /**     * This method checks whether the shape is resized correctly and calls the     * super class update method.     */    _update: function(){				this.dockers.invoke("update");		if (this.isChanged) {			var bounds = this.bounds;            var oldBounds = this._oldBounds;									if (this.isResized) {							var widthDelta = bounds.width() / oldBounds.width();				var heightDelta = bounds.height() / oldBounds.height();								//iterate over all relevant svg elements and resize them				this._svgShapes.each(function(svgShape){					//adjust width					if (svgShape.isHorizontallyResizable) {						svgShape.width = svgShape.oldWidth * widthDelta;					}					//adjust height					if (svgShape.isVerticallyResizable) {						svgShape.height = svgShape.oldHeight * heightDelta;					}										//check, if anchors are set					var anchorOffset;					var leftIncluded = svgShape.anchorLeft;					var rightIncluded = svgShape.anchorRight;										if (rightIncluded) {						anchorOffset = oldBounds.width() - (svgShape.oldX + svgShape.oldWidth);						if (leftIncluded) {							svgShape.width = bounds.width() - svgShape.x - anchorOffset;						}						else {							svgShape.x = bounds.width() - (anchorOffset + svgShape.width);						}					}					else 						if (!leftIncluded) {							svgShape.x = widthDelta * svgShape.oldX;							if (!svgShape.isHorizontallyResizable) {								svgShape.x = svgShape.x + svgShape.width * widthDelta / 2 - svgShape.width / 2;							}						}										var topIncluded = svgShape.anchorTop;					var bottomIncluded = svgShape.anchorBottom;										if (bottomIncluded) {						anchorOffset = oldBounds.height() - (svgShape.oldY + svgShape.oldHeight);						if (topIncluded) {							svgShape.height = bounds.height() - svgShape.y - anchorOffset;						}						else {							// Hack for choreography task layouting							if (!svgShape._isYLocked) {								svgShape.y = bounds.height() - (anchorOffset + svgShape.height);							}						}					}					else 						if (!topIncluded) {							svgShape.y = heightDelta * svgShape.oldY;							if (!svgShape.isVerticallyResizable) {								svgShape.y = svgShape.y + svgShape.height * heightDelta / 2 - svgShape.height / 2;							}						}				});								//check, if the current bounds is unallowed horizontally or vertically resized				var p = {					x: 0,					y: 0				};				if (!this.isHorizontallyResizable && bounds.width() !== oldBounds.width()) {					p.x = oldBounds.width() - bounds.width();				}				if (!this.isVerticallyResizable && bounds.height() !== oldBounds.height()) {					p.y = oldBounds.height() - bounds.height();				}				if (p.x !== 0 || p.y !== 0) {					bounds.extend(p);				}								//check, if the current bounds are between maximum and minimum bounds				p = {					x: 0,					y: 0				};				var widthDifference, heightDifference;				if (this.minimumSize) {									ORYX.Log.debug("Shape (%0)'s min size: (%1x%2)", this, this.minimumSize.width, this.minimumSize.height);					widthDifference = this.minimumSize.width - bounds.width();					if (widthDifference > 0) {						p.x += widthDifference;					}					heightDifference = this.minimumSize.height - bounds.height();					if (heightDifference > 0) {						p.y += heightDifference;					}				}				if (this.maximumSize) {									ORYX.Log.debug("Shape (%0)'s max size: (%1x%2)", this, this.maximumSize.width, this.maximumSize.height);					widthDifference = bounds.width() - this.maximumSize.width;					if (widthDifference > 0) {						p.x -= widthDifference;					}					heightDifference = bounds.height() - this.maximumSize.height;					if (heightDifference > 0) {						p.y -= heightDifference;					}				}				if (p.x !== 0 || p.y !== 0) {					bounds.extend(p);				}								//update magnets								var widthDelta = bounds.width() / oldBounds.width();				var heightDelta = bounds.height() / oldBounds.height();								var leftIncluded, rightIncluded, topIncluded, bottomIncluded, center, newX, newY;								this.magnets.each(function(magnet){					leftIncluded = magnet.anchorLeft;					rightIncluded = magnet.anchorRight;					topIncluded = magnet.anchorTop;					bottomIncluded = magnet.anchorBottom;										center = magnet.bounds.center();										if (leftIncluded) {						newX = center.x;					}					else 						if (rightIncluded) {							newX = bounds.width() - (oldBounds.width() - center.x)						}						else {							newX = center.x * widthDelta;						}										if (topIncluded) {						newY = center.y;					}					else 						if (bottomIncluded) {							newY = bounds.height() - (oldBounds.height() - center.y);						}						else {							newY = center.y * heightDelta;						}										if (center.x !== newX || center.y !== newY) {						magnet.bounds.centerMoveTo(newX, newY);					}				});								//set new position of labels				this.getLabels().each(function(label){					leftIncluded = label.anchorLeft;					rightIncluded = label.anchorRight;					topIncluded = label.anchorTop;					bottomIncluded = label.anchorBottom;															if (leftIncluded) {										}					else 						if (rightIncluded) {							label.x = bounds.width() - (oldBounds.width() - label.oldX)						}						else {							label.x *= widthDelta;						}										if (topIncluded) {										}					else 						if (bottomIncluded) {							label.y = bounds.height() - (oldBounds.height() - label.oldY);						}						else {							label.y *= heightDelta;						}				});								//update docker				var docker = this.dockers[0];				if (docker) {					docker.bounds.unregisterCallback(this._dockerChangedCallback);					if (!this._dockerUpdated) {						docker.bounds.centerMoveTo(this.bounds.center());						this._dockerUpdated = false;					}										docker.update();					docker.bounds.registerCallback(this._dockerChangedCallback);				}				this.isResized = false;			}                        this.refresh();						this.isChanged = false;						this._oldBounds = this.bounds.clone();        }				this.children.each(function(value) {			if(!(value instanceof ORYX.Core.Controls.Docker)) {				value._update();			}		});				if (this.dockers.length > 0&&!this.dockers.first().getDockedShape()) {			this.dockers.each(function(docker){				docker.bounds.centerMoveTo(this.bounds.center())			}.bind(this))		}				/*this.incoming.each((function(edge) {			if(!(this.dockers[0] && this.dockers[0].getDockedShape() instanceof ORYX.Core.Node))				edge._update(true);		}).bind(this));				this.outgoing.each((function(edge) {			if(!(this.dockers[0] && this.dockers[0].getDockedShape() instanceof ORYX.Core.Node))				edge._update(true);		}).bind(this)); */    },        /**     * This method repositions and resizes the SVG representation     * of the shape.     */    refresh: function(){        arguments.callee.$.refresh.apply(this, arguments);                /** Movement */        var x = this.bounds.upperLeft().x;        var y = this.bounds.upperLeft().y;                //set translation in transform attribute        /*var attributeTransform = document.createAttributeNS(ORYX.CONFIG.NAMESPACE_SVG, "transform");        attributeTransform.nodeValue = "translate(" + x + ", " + y + ")";        this.node.firstChild.setAttributeNode(attributeTransform);*/		// Move owner element		this.node.firstChild.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");		// Move magnets		this.node.childNodes[1].childNodes[1].setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");                /** Resize */                //iterate over all relevant svg elements and update them        this._svgShapes.each(function(svgShape){            svgShape.update();        });    },        _dockerChanged: function(){		var docker = this.dockers[0];                //set the bounds of the the association        this.bounds.centerMoveTo(docker.bounds.center());        		this._dockerUpdated = true;        //this._update(true);    },        /**     * This method traverses a tree of SVGElements and returns     * all SVGShape objects. For each basic shape or path element     * a SVGShape object is initialized.     *     * @param svgNode {SVGElement}     * @return {Array} Array of SVGShape objects     */    _initSVGShapes: function(svgNode){        var svgShapes = [];        try {            var svgShape = new ORYX.Core.SVG.SVGShape(svgNode);            svgShapes.push(svgShape);        }         catch (e) {            //do nothing        }                if (svgNode.hasChildNodes()) {            for (var i = 0; i < svgNode.childNodes.length; i++) {                svgShapes = svgShapes.concat(this._initSVGShapes(svgNode.childNodes[i]));            }        }                return svgShapes;    },        /**     * Calculate if the point is inside the Shape     * @param {PointX}     * @param {PointY}      * @param {absoluteBounds} optional: for performance     */    isPointIncluded: function(pointX, pointY, absoluteBounds){        // If there is an arguments with the absoluteBounds        var absBounds = absoluteBounds && absoluteBounds instanceof ORYX.Core.Bounds ? absoluteBounds : this.absoluteBounds();                if (!absBounds.isIncluded(pointX, pointY)) {			return false;		} else {					}			                //point = Object.clone(point);        var ul = absBounds.upperLeft();        var x = pointX - ul.x;        var y = pointY - ul.y;					var i=0;		do {			var isPointIncluded = this._svgShapes[i++].isPointIncluded( x, y );		} while( !isPointIncluded && i < this._svgShapes.length)				return isPointIncluded;        /*return this._svgShapes.any(function(svgShape){            return svgShape.isPointIncluded(point);        });*/    },         /**     * Calculate if the point is over an special offset area     * @param {Point}     */    isPointOverOffset: function( pointX, pointY ){       		var isOverEl = arguments.callee.$.isPointOverOffset.apply( this , arguments );				if (isOverEl) {							        // If there is an arguments with the absoluteBounds	        var absBounds = this.absoluteBounds();	        absBounds.widen( - ORYX.CONFIG.BORDER_OFFSET );				        if ( !absBounds.isIncluded( pointX, pointY )) {	            return true;	        }				}				return false;			},	       serialize: function(){        var result = arguments.callee.$.serialize.apply(this);                // Add the docker's bounds        // nodes only have at most one docker!        this.dockers.each((function(docker){			if (docker.getDockedShape()) {				var center = docker.referencePoint;				center = center ? center : docker.bounds.center();				result.push({					name: 'docker',					prefix: 'oryx',					value: $H(center).values().join(','),					type: 'literal'				});			}        }).bind(this));                // Get the spezific serialized object from the stencil        try {            //result = this.getStencil().serialize(this, result);			var serializeEvent = this.getStencil().serialize();						/*			 * call serialize callback by reference, result should be found			 * in serializeEvent.result			 */			if(serializeEvent.type) {				serializeEvent.shape = this;				serializeEvent.data = result;				serializeEvent.result = undefined;				serializeEvent.forceExecution = true;								this._delegateEvent(serializeEvent);								if(serializeEvent.result) {					result = serializeEvent.result;				}			}        }         catch (e) {        }        return result;    },        deserialize: function(data){    	arguments.callee.$.deserialize.apply(this, [data]);			    try {            //data = this.getStencil().deserialize(this, data);			var deserializeEvent = this.getStencil().deserialize();						/*			 * call serialize callback by reference, result should be found			 * in serializeEventInfo.result			 */			if(deserializeEvent.type) {				deserializeEvent.shape = this;				deserializeEvent.data = data;				deserializeEvent.result = undefined;				deserializeEvent.forceExecution = true;								this._delegateEvent(deserializeEvent);				if(deserializeEvent.result) {					data = deserializeEvent.result;				}			}        }         catch (e) {        }				// Set the outgoing shapes		var outgoing = data.findAll(function(ser){ return (ser.prefix+"-"+ser.name) == 'raziel-outgoing'});		outgoing.each((function(obj){			// TODO: Look at Canvas			if(!this.parent) {return};											// Set outgoing Shape			var next = this.getCanvas().getChildShapeByResourceId(obj.value);																				if(next){				if(next instanceof ORYX.Core.Edge) {					//Set the first docker of the next shape					next.dockers.first().setDockedShape(this);					next.dockers.first().setReferencePoint(next.dockers.first().bounds.center());				} else if(next.dockers.length > 0) { //next is a node and next has a docker					next.dockers.first().setDockedShape(this);					//next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});				}			}						}).bind(this));                if (this.dockers.length === 1) {            var dockerPos;            dockerPos = data.find(function(entry){                return (entry.prefix + "-" + entry.name === "oryx-dockers");            });                        if (dockerPos) {                var points = dockerPos.value.replace(/,/g, " ").split(" ").without("").without("#");				if (points.length === 2 && this.dockers[0].getDockedShape()) {                    this.dockers[0].setReferencePoint({                        x: parseFloat(points[0]),                        y: parseFloat(points[1])                    });                }                else {                    this.dockers[0].bounds.centerMoveTo(parseFloat(points[0]), parseFloat(points[1]));                }            }        }    },        /**     * This method excepts the SVGDoucment that is the SVG representation     * of this shape.     * The bounds of the shape are calculated, the SVG representation's upper left point     * is moved to 0,0 and it the method sets if this shape is resizable.     *     * @param {SVGDocument} svgDocument     */    _init: function(svgDocument){        arguments.callee.$._init.apply(this, arguments);		        var svgNode = svgDocument.getElementsByTagName("g")[0]; //outer most g node        // set all required attributes        var attributeTitle = svgDocument.ownerDocument.createAttributeNS(null, "title");        attributeTitle.nodeValue = this.getStencil().title();        svgNode.setAttributeNode(attributeTitle);                var attributeId = svgDocument.ownerDocument.createAttributeNS(null, "id");        attributeId.nodeValue = this.id;        svgNode.setAttributeNode(attributeId);                //         var stencilTargetNode = this.node.childNodes[0].childNodes[0]; //<g class=me>"        svgNode = stencilTargetNode.appendChild(svgNode);                // Add to the EventHandler        this.addEventHandlers(svgNode);                /**set minimum and maximum size*/        var minSizeAttr = svgNode.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "minimumSize");        if (minSizeAttr) {            minSizeAttr = minSizeAttr.replace("/,/g", " ");            var minSizeValues = minSizeAttr.split(" ");            minSizeValues = minSizeValues.without("");                        if (minSizeValues.length > 1) {                this.minimumSize = {                    width: parseFloat(minSizeValues[0]),                    height: parseFloat(minSizeValues[1])                };            }            else {                //set minimumSize to (1,1), so that width and height of the stencil can never be (0,0)                this.minimumSize = {                    width: 1,                    height: 1                };            }        }                var maxSizeAttr = svgNode.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "maximumSize");        if (maxSizeAttr) {            maxSizeAttr = maxSizeAttr.replace("/,/g", " ");            var maxSizeValues = maxSizeAttr.split(" ");            maxSizeValues = maxSizeValues.without("");                        if (maxSizeValues.length > 1) {                this.maximumSize = {                    width: parseFloat(maxSizeValues[0]),                    height: parseFloat(maxSizeValues[1])                };            }        }                if (this.minimumSize && this.maximumSize &&        (this.minimumSize.width > this.maximumSize.width ||        this.minimumSize.height > this.maximumSize.height)) {                    //TODO wird verschluckt!!!            throw this + ": Minimum Size must be greater than maxiumSize.";        }                /**get current bounds and adjust it to upperLeft == (0,0)*/        //initialize all SVGShape objects        this._svgShapes = this._initSVGShapes(svgNode);                //get upperLeft and lowerRight of stencil        var upperLeft = {            x: undefined,            y: undefined        };        var lowerRight = {            x: undefined,            y: undefined        };        var me = this;        this._svgShapes.each(function(svgShape){            upperLeft.x = (upperLeft.x !== undefined) ? Math.min(upperLeft.x, svgShape.x) : svgShape.x;            upperLeft.y = (upperLeft.y !== undefined) ? Math.min(upperLeft.y, svgShape.y) : svgShape.y;            lowerRight.x = (lowerRight.x !== undefined) ? Math.max(lowerRight.x, svgShape.x + svgShape.width) : svgShape.x + svgShape.width;            lowerRight.y = (lowerRight.y !== undefined) ? Math.max(lowerRight.y, svgShape.y + svgShape.height) : svgShape.y + svgShape.height;                        /** set if resizing is enabled */            //TODO isResizable durch die beiden anderen booleans ersetzen?            if (svgShape.isHorizontallyResizable) {                me.isHorizontallyResizable = true;                me.isResizable = true;            }            if (svgShape.isVerticallyResizable) {                me.isVerticallyResizable = true;                me.isResizable = true;            }            if (svgShape.anchorTop && svgShape.anchorBottom) {                me.isVerticallyResizable = true;                me.isResizable = true;            }            if (svgShape.anchorLeft && svgShape.anchorRight) {                me.isHorizontallyResizable = true;                me.isResizable = true;            }        });                //move all SVGShapes by -upperLeft        this._svgShapes.each(function(svgShape){            svgShape.x -= upperLeft.x;            svgShape.y -= upperLeft.y;            svgShape.update();        });                //set bounds of shape        //the offsets are also needed for positioning the magnets and the docker        var offsetX = upperLeft.x;        var offsetY = upperLeft.y;                lowerRight.x -= offsetX;        lowerRight.y -= offsetY;        upperLeft.x = 0;        upperLeft.y = 0;                //prevent that width or height of initial bounds is 0        if (lowerRight.x === 0) {            lowerRight.x = 1;        }        if (lowerRight.y === 0) {            lowerRight.y = 1;        }                this._oldBounds.set(upperLeft, lowerRight);        this.bounds.set(upperLeft, lowerRight);                /**initialize magnets */                var magnets = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "magnets");                if (magnets && magnets.length > 0) {                    magnets = $A(magnets[0].getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "magnet"));                        var me = this;            magnets.each(function(magnetElem){                var magnet = new ORYX.Core.Controls.Magnet({                    eventHandlerCallback: me.eventHandlerCallback                });                var cx = parseFloat(magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cx"));                var cy = parseFloat(magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cy"));                magnet.bounds.centerMoveTo({                    x: cx - offsetX,                    y: cy - offsetY                });                                //get anchors                var anchors = magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");                if (anchors) {                    anchors = anchors.replace("/,/g", " ");                    anchors = anchors.split(" ").without("");                    for(var i = 0; i < anchors.length; i++) {						switch(anchors[i].toLowerCase()) {							case "left":								magnet.anchorLeft = true;								break;							case "right":								magnet.anchorRight = true;								break;							case "top":								magnet.anchorTop = true;								break;							case "bottom":								magnet.anchorBottom = true;								break;						}					}                }                                me.add(magnet);                                //check, if magnet is default magnet                if (!this._defaultMagnet) {                    var defaultAttr = magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "default");                    if (defaultAttr && defaultAttr.toLowerCase() === "yes") {                        me._defaultMagnet = magnet;                    }                }            });        }        else {            // Add a Magnet in the Center of Shape			            var magnet = new ORYX.Core.Controls.Magnet();            magnet.bounds.centerMoveTo(this.bounds.width() / 2, this.bounds.height() / 2);            this.add(magnet);        }                /**initialize docker */        var dockerElem = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "docker");                if (dockerElem && dockerElem.length > 0) {            dockerElem = dockerElem[0];            var docker = this.createDocker();            var cx = parseFloat(dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cx"));            var cy = parseFloat(dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cy"));            docker.bounds.centerMoveTo({                x: cx - offsetX,                y: cy - offsetY            });                        //get anchors            var anchors = dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");            if (anchors) {                anchors = anchors.replace("/,/g", " ");                anchors = anchors.split(" ").without("");                				for(var i = 0; i < anchors.length; i++) {					switch(anchors[i].toLowerCase()) {						case "left":							docker.anchorLeft = true;							break;						case "right":							docker.anchorRight = true;							break;						case "top":							docker.anchorTop = true;							break;						case "bottom":							docker.anchorBottom = true;							break;					}				}            }        }                /**initialize labels*/        var textElems = svgNode.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text');        $A(textElems).each((function(textElem){            var label = new ORYX.Core.SVG.Label({                textElement: textElem,				shapeId: this.id            });            label.x -= offsetX;            label.y -= offsetY;            this._labels[label.id] = label;        }).bind(this));    },		/**	 * Override the Method, that a docker is not shown	 *	 */	createDocker: function() {		var docker = new ORYX.Core.Controls.Docker({eventHandlerCallback: this.eventHandlerCallback});		docker.bounds.registerCallback(this._dockerChangedCallback);				this.dockers.push( docker );		docker.parent = this;		docker.bounds.registerCallback(this._changedCallback);						return docker			},	        toString: function(){        return this._stencil.title() + " " + this.id    }};ORYX.Core.Node = ORYX.Core.Shape.extend(ORYX.Core.Node);/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/NAMESPACE_SVG = "http://www.w3.org/2000/svg";NAMESPACE_ORYX = "http://www.b3mn.org/oryx";/** * Init namespaces */if (!ORYX) {    var ORYX = {};}if (!ORYX.Core) {    ORYX.Core = {};}/** * @classDescription Abstract base class for all connections. * @extends {ORYX.Core.Shape} * @param options {Object} * * TODO da die verschiebung der Edge nicht ueber eine *  translation gemacht wird, die sich auch auf alle kind UIObjects auswirkt, *  muessen die kinder hier beim verschieben speziell betrachtet werden. *  Das sollte ueberarbeitet werden. * */ORYX.Core.Edge = {    /**     * Constructor     * @param {Object} options     * @param {Stencil} stencil     */    construct: function(options, stencil){        arguments.callee.$.construct.apply(this, arguments);                this.isMovable = true;        this.isSelectable = true;        this._dockerUpdated = false;                this._markers = new Hash(); //a hash map of SVGMarker objects where keys are the marker ids        this._paths = [];        this._interactionPaths = [];        this._dockersByPath = new Hash();        this._markersByPath = new Hash();				/* Data structures to store positioning information of attached child nodes */ 		this.attachedNodePositionData = new Hash();                //TODO was muss hier initial erzeugt werden?        var stencilNode = this.node.childNodes[0].childNodes[0];        stencilNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", stencilNode, ['g', {            "pointer-events": "painted"        }]);                //Add to the EventHandler        this.addEventHandlers(stencilNode);                        this._oldBounds = this.bounds.clone();                //load stencil        this._init(this._stencil.view());                if (stencil instanceof Array) {            this.deserialize(stencil);        }            },        _update: function(force){		if(this._dockerUpdated || this.isChanged || force) {						this.dockers.invoke("update");				        if (this.bounds.width() === 0 || this.bounds.height() === 0) {	        	            this.bounds.moveBy({	                x: this.bounds.width() === 0 ? -1 : 0,	                y: this.bounds.height() === 0 ? -1 : 0	            });	            	            this.bounds.extend({	                x: this.bounds.width() === 0 ? 2 : 0,	                y: this.bounds.height() === 0 ? 2 : 0	            });	            	        }	        	        // TODO: Bounds muss abhaengig des Eltern-Shapes gesetzt werden	        var upL = this.bounds.upperLeft();	        var oldUpL = this._oldBounds.upperLeft();	        var oldWidth = this._oldBounds.width() === 0 ? this.bounds.width() : this._oldBounds.width();	        var oldHeight = this._oldBounds.height() === 0 ? this.bounds.height() : this._oldBounds.height();	        var diffX = upL.x - oldUpL.x;	        var diffY = upL.y - oldUpL.y;	        var diffWidth = this.bounds.width() / oldWidth;	        var diffHeight = this.bounds.height() / oldHeight;	        	        this.dockers.each((function(docker){	            // Unregister on BoundsChangedCallback	            docker.bounds.unregisterCallback(this._dockerChangedCallback);	            	            // If there is any changes at the edge and is there is not an DockersUpdate	            // set the new bounds to the docker	            if (!this._dockerUpdated) {	                docker.bounds.moveBy(diffX, diffY);	                	                if (diffWidth !== 1 || diffHeight !== 1) {	                    var relX = docker.bounds.upperLeft().x - upL.x;	                    var relY = docker.bounds.upperLeft().y - upL.y;	                    	                    docker.bounds.moveTo(upL.x + relX * diffWidth, upL.y + relY * diffHeight);	                }	            }	            // Do Docker update and register on DockersBoundChange	            docker.update();	            docker.bounds.registerCallback(this._dockerChangedCallback);	            	        }).bind(this));	        	        if (this._dockerUpdated) {	            var a = this.dockers.first().bounds.center();	            var b = this.dockers.first().bounds.center();	            	            this.dockers.each((function(docker){	                var center = docker.bounds.center();	                a.x = Math.min(a.x, center.x);	                a.y = Math.min(a.y, center.y);	                b.x = Math.max(b.x, center.x);	                b.y = Math.max(b.y, center.y);	            }).bind(this));	            	            //set the bounds of the the association	            this.bounds.set(Object.clone(a), Object.clone(b));	        }						//reposition labels			this.getLabels().each(function(label) {				switch (label.edgePosition) {					case "freeMoved" :			        	label.x=label.x;			        	label.y=label.y;				        	break;					case "starttop":						var angle = this._getAngle(this.dockers[0], this.dockers[1]);						var pos = this.dockers.first().bounds.center();												if (angle <= 90 || angle > 270) {							label.horizontalAlign("left");							label.verticalAlign("bottom");							label.x = pos.x + label.getOffsetTop();							label.y = pos.y - label.getOffsetTop();							label.rotate(360 - angle, pos);						} else {							label.horizontalAlign("right");							label.verticalAlign("bottom");							label.x = pos.x - label.getOffsetTop();							label.y = pos.y - label.getOffsetTop();							label.rotate(180 - angle, pos);						}												break;					case "startbottom":						var angle = this._getAngle(this.dockers[0], this.dockers[1]);						var pos = this.dockers.first().bounds.center();												if (angle <= 90 || angle > 270) {							label.horizontalAlign("left");							label.verticalAlign("top");							label.x = pos.x + label.getOffsetBottom();							label.y = pos.y + label.getOffsetBottom();							label.rotate(360 - angle, pos);						} else {							label.horizontalAlign("right");							label.verticalAlign("top");							label.x = pos.x - label.getOffsetBottom();							label.y = pos.y + label.getOffsetBottom();							label.rotate(180 - angle, pos);						}												break;					case "midtop":						var numOfDockers = this.dockers.length;						if(numOfDockers%2 == 0) {							var angle = this._getAngle(this.dockers[numOfDockers/2-1], this.dockers[numOfDockers/2])							var pos1 = this.dockers[numOfDockers/2-1].bounds.center();							var pos2 = this.dockers[numOfDockers/2].bounds.center();							var pos = {x:(pos1.x + pos2.x)/2.0, y:(pos1.y+pos2.y)/2.0};														label.horizontalAlign("center");							label.verticalAlign("bottom");							label.x = pos.x;							label.y = pos.y - label.getOffsetTop();															if (angle <= 90 || angle > 270) {								label.rotate(360 - angle, pos);							} else {								label.rotate(180 - angle, pos);							}						} else {							var index = parseInt(numOfDockers/2);							var angle = this._getAngle(this.dockers[index], this.dockers[index+1])							var pos = this.dockers[index].bounds.center();														if (angle <= 90 || angle > 270) {								label.horizontalAlign("left");								label.verticalAlign("bottom");								label.x = pos.x + label.getOffsetTop();								label.y = pos.y - label.getOffsetTop();								label.rotate(360 - angle, pos);							} else {								label.horizontalAlign("right");								label.verticalAlign("bottom");								label.x = pos.x - label.getOffsetTop();								label.y = pos.y - label.getOffsetTop();								label.rotate(180 - angle, pos);							}						}												break;					case "midbottom":						var numOfDockers = this.dockers.length;						if(numOfDockers%2 == 0) {							var angle = this._getAngle(this.dockers[numOfDockers/2-1], this.dockers[numOfDockers/2])							var pos1 = this.dockers[numOfDockers/2-1].bounds.center();							var pos2 = this.dockers[numOfDockers/2].bounds.center();							var pos = {x:(pos1.x + pos2.x)/2.0, y:(pos1.y+pos2.y)/2.0};														label.horizontalAlign("center");							label.verticalAlign("top");							label.x = pos.x;							label.y = pos.y + label.getOffsetTop();														if (angle <= 90 || angle > 270) {								label.rotate(360 - angle, pos);							} else {								label.rotate(180 - angle, pos);							}						} else {							var index = parseInt(numOfDockers/2);							var angle = this._getAngle(this.dockers[index], this.dockers[index+1])							var pos = this.dockers[index].bounds.center();														if (angle <= 90 || angle > 270) {								label.horizontalAlign("left");								label.verticalAlign("top");								label.x = pos.x + label.getOffsetBottom();								label.y = pos.y + label.getOffsetBottom();								label.rotate(360 - angle, pos);							} else {								label.horizontalAlign("right");								label.verticalAlign("top");								label.x = pos.x - label.getOffsetBottom();								label.y = pos.y + label.getOffsetBottom();								label.rotate(180 - angle, pos);							}						}												break;					case "endtop":						var length = this.dockers.length;						var angle = this._getAngle(this.dockers[length-2], this.dockers[length-1]);						var pos = this.dockers.last().bounds.center();												if (angle <= 90 || angle > 270) {							label.horizontalAlign("right");							label.verticalAlign("bottom");							label.x = pos.x - label.getOffsetTop();							label.y = pos.y - label.getOffsetTop();							label.rotate(360 - angle, pos);						} else {							label.horizontalAlign("left");							label.verticalAlign("bottom");							label.x = pos.x + label.getOffsetTop();							label.y = pos.y - label.getOffsetTop();							label.rotate(180 - angle, pos);						}												break;					case "endbottom":						var length = this.dockers.length;						var angle = this._getAngle(this.dockers[length-2], this.dockers[length-1]);						var pos = this.dockers.last().bounds.center();												if (angle <= 90 || angle > 270) {							label.horizontalAlign("right");							label.verticalAlign("top");							label.x = pos.x - label.getOffsetBottom();							label.y = pos.y + label.getOffsetBottom();							label.rotate(360 - angle, pos);						} else {							label.horizontalAlign("left");							label.verticalAlign("top");							label.x = pos.x + label.getOffsetBottom();							label.y = pos.y + label.getOffsetBottom();							label.rotate(180 - angle, pos);						}												break;			}			}.bind(this));			this.children.each(function(value) {				if(value instanceof ORYX.Core.Node) {					this.calculatePositionOfAttachedChildNode.call(this, value);				}			}.bind(this));						this.refreshAttachedNodes();			this.refresh();						this.isChanged = false;			this._dockerUpdated = false;						this._oldBounds = this.bounds.clone();        }		    },		/**	 *  Moves a point to the upperLeft of a node's bounds.	 *  	 *  @param {point} point	 *  	The point to move	 *  @param {ORYX.Core.Bounds} bounds	 *  	The Bounds of the related noe	 */	movePointToUpperLeftOfNode: function(point, bounds) {		point.x -= bounds.width()/2;		point.y -= bounds.height()/2;	},		/**	 * Refreshes the visual representation of edge's attached nodes.	 */		refreshAttachedNodes: function() {		this.attachedNodePositionData.values().each(function(nodeData) {			var startPoint = nodeData.segment.docker1.bounds.center();			var endPoint = nodeData.segment.docker2.bounds.center();			this.relativizePoint(startPoint);			this.relativizePoint(endPoint);						var newNodePosition = new Object();						/* Calculate new x-coordinate */			newNodePosition.x = startPoint.x 								+ nodeData.relativDistanceFromDocker1									* (endPoint.x - startPoint.x);						/* Calculate new y-coordinate */			newNodePosition.y = startPoint.y 								+ nodeData.relativDistanceFromDocker1									* (endPoint.y - startPoint.y);						/* Convert new position to the upper left of the node */			this.movePointToUpperLeftOfNode(newNodePosition, nodeData.node.bounds);						/* Move node to its new position */			nodeData.node.bounds.moveTo(newNodePosition);			nodeData.node._update();										}.bind(this));	},		/**	 * Calculates the position of an edge's child node. The node is placed on 	 * the path of the edge.	 * 	 * @param {node}	 * 		The node to calculate the new position	 * @return {Point}	 * 		The calculated upper left point of the node's shape.	 */	calculatePositionOfAttachedChildNode: function(node) {		/* Initialize position */		var position = new Object();		position.x = 0;		position.y = 0;				/* Case: Node was just added */		if(!this.attachedNodePositionData[node.getId()]) {			this.attachedNodePositionData[node.getId()] = new Object();			this.attachedNodePositionData[node.getId()]					.relativDistanceFromDocker1 = 0;			this.attachedNodePositionData[node.getId()].node = node;			this.attachedNodePositionData[node.getId()].segment = new Object();			this.findEdgeSegmentForNode(node);		}else if(node.isChanged) {			this.findEdgeSegmentForNode(node);		}							},		/**	 * Finds the appropriate edge segement for a node.	 * The segment is choosen, which has the smallest distance to the node.	 * 	 * @param {ORYX.Core.Node} node	 * 		The concerning node	 */	findEdgeSegmentForNode: function(node) {		var length = this.dockers.length;		var smallestDistance = undefined;				for(i=1;i<length;i++) {			var lineP1 = this.dockers[i-1].bounds.center();			var lineP2 = this.dockers[i].bounds.center();			this.relativizePoint(lineP1);			this.relativizePoint(lineP2);			//position übergeben hier			var nodeCenterPoint = node.bounds.center();			var distance = ORYX.Core.Math.distancePointLinie(															lineP1,															lineP2, 															nodeCenterPoint, 															true);						if((distance || distance == 0) && ((!smallestDistance && smallestDistance != 0) 						|| distance < smallestDistance)) {								smallestDistance = distance;								this.attachedNodePositionData[node.getId()].segment.docker1 = 													this.dockers[i-1];				this.attachedNodePositionData[node.getId()].segment.docker2 = 													this.dockers[i];				}						/* Either the distance does not match the segment or the distance			 * between docker1 and docker2 is 0			 * 			 * In this case choose the nearest docker as attaching point.			 * 			 */			if(!distance && !smallestDistance && smallestDistance != 0) {				(ORYX.Core.Math.getDistancePointToPoint(nodeCenterPoint, lineP1)					< ORYX.Core.Math.getDistancePointToPoint(nodeCenterPoint, lineP2)) ?					this.attachedNodePositionData[node.getId()].relativDistanceFromDocker1 = 0 :					this.attachedNodePositionData[node.getId()].relativDistanceFromDocker1 = 1;				this.attachedNodePositionData[node.getId()].segment.docker1 = 													this.dockers[i-1];				this.attachedNodePositionData[node.getId()].segment.docker2 = 													this.dockers[i];			}		}				/* Calculate position on edge segment for the node */		if(smallestDistance || smallestDistance == 0) {			this.attachedNodePositionData[node.getId()].relativDistanceFromDocker1 =			this.getLineParameterForPosition(					this.attachedNodePositionData[node.getId()].segment.docker1,					this.attachedNodePositionData[node.getId()].segment.docker2,					node);		}	},		/**	 * Returns the value of the scalar to determine the position of the node on 	 * line defined by docker1 and docker2.	 * 	 * @param {point} docker1	 * 		The docker that defines the start of the line segment	 * @param {point} docker2	 * 		The docker that defines the end of the line segment	 * @param {ORYX.Core.Node} node	 * 		The concerning node	 * 	 * @return {float} positionParameter	 * 		The scalar value to determine the position on the line	 */	getLineParameterForPosition: function(docker1, docker2, node) {		var dockerPoint1 = docker1.bounds.center();		var dockerPoint2 = docker2.bounds.center();		this.relativizePoint(dockerPoint1);		this.relativizePoint(dockerPoint2);				var intersectionPoint = ORYX.Core.Math.getPointOfIntersectionPointLine(									dockerPoint1,									dockerPoint2,									node.bounds.center(), true);		if(!intersectionPoint) {			return 0;		}				var relativeDistance = 			ORYX.Core.Math.getDistancePointToPoint(intersectionPoint, dockerPoint1) /			ORYX.Core.Math.getDistancePointToPoint(dockerPoint1, dockerPoint2);				return relativeDistance;	},	/**	 * Makes point relative to the upper left of the edge's bound.	 * 	 * @param {point} point	 * 		The point to relativize	 */	relativizePoint: function(point) {		point.x -= this.bounds.upperLeft().x;		point.y -= this.bounds.upperLeft().y;			},        refresh: function(){        //call base class refresh method        arguments.callee.$.refresh.apply(this, arguments);                //TODO consider points for marker mids        var lastPoint;        this._paths.each((function(path, index){            var dockers = this._dockersByPath[path.id];            var c = undefined;			var d = undefined;            if (lastPoint) {                d = "M" + lastPoint.x + " " + lastPoint.y;            }            else {                c = dockers[0].bounds.center();                lastPoint = c;                                d = "M" + c.x + " " + c.y;            }                        for (var i = 1; i < dockers.length; i++) {                // for each docker, draw a line to the center                c = dockers[i].bounds.center();                d = d + "L" + c.x + " " + c.y + " ";                lastPoint = c;            }                        path.setAttributeNS(null, "d", d);            this._interactionPaths[index].setAttributeNS(null, "d", d);                    }).bind(this));						/* move child shapes of an edge */		if(this.getChildNodes().length > 0) {	        var x = this.bounds.upperLeft().x;	        var y = this.bounds.upperLeft().y;	        			this.node.firstChild.childNodes[1].setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");		}		    },        /**     * Calculate the Border Intersection Point between two points     * @param {PointA}     * @param {PointB}     */    getIntersectionPoint: function(){            var length = Math.floor(this.dockers.length / 2)                return ORYX.Core.Math.midPoint(this.dockers[length - 1].bounds.center(), this.dockers[length].bounds.center())    },            /**     * Calculate if the point is inside the Shape     * @param {PointX}     * @param {PointY}      */    isPointIncluded: function(pointX, pointY){            var isbetweenAB = this.absoluteBounds().isIncluded(pointX, pointY, 												ORYX.CONFIG.OFFSET_EDGE_BOUNDS);        		var isPointIncluded = undefined;		        if (isbetweenAB && this.dockers.length > 0) {					var i = 0;			var point1, point2;									do {							point1 = this.dockers[i].bounds.center();				point2 = this.dockers[++i].bounds.center();								isPointIncluded = ORYX.Core.Math.isPointInLine(pointX, pointY, 											point1.x, point1.y, 											point2.x, point2.y, 											ORYX.CONFIG.OFFSET_EDGE_BOUNDS);							} while (!isPointIncluded && i < this.dockers.length - 1)					}				return isPointIncluded;    },          /**     * Calculate if the point is over an special offset area     * @param {Point}     */    isPointOverOffset: function(){		return  false	},		/**	* Returns the angle of the line between two dockers	* (0 - 359.99999999)	*/	_getAngle: function(docker1, docker2) {		var p1 = docker1.absoluteCenterXY();		var p2 = docker2.absoluteCenterXY();				if(p1.x == p2.x && p1.y == p2.y)			return 0;		var angle = Math.asin(Math.sqrt(Math.pow(p1.y-p2.y, 2))					/(Math.sqrt(Math.pow(p2.x-p1.x, 2)+Math.pow(p1.y-p2.y, 2))))					*180/Math.PI;				if(p2.x >= p1.x && p2.y <= p1.y)			return angle;		else if(p2.x < p1.x && p2.y <= p1.y)			return 180 - angle;		else if(p2.x < p1.x && p2.y > p1.y)			return 180 + angle;		else			return 360 - angle;	},	        alignDockers: function(){        this._update(true);                var firstPoint = this.dockers.first().bounds.center();        var lastPoint = this.dockers.last().bounds.center();                var deltaX = lastPoint.x - firstPoint.x;        var deltaY = lastPoint.y - firstPoint.y;                var numOfDockers = this.dockers.length - 1;                this.dockers.each((function(docker, index){            var part = index / numOfDockers;            docker.bounds.unregisterCallback(this._dockerChangedCallback);            docker.bounds.moveTo(firstPoint.x + part * deltaX, firstPoint.y + part * deltaY);            docker.bounds.registerCallback(this._dockerChangedCallback);        }).bind(this));                this._dockerChanged();    },    	add: function(shape){        arguments.callee.$.add.apply(this, arguments);				// If the new shape is a Docker which is not contained		if (shape instanceof ORYX.Core.Controls.Docker && this.dockers.include(shape)){			// Add it to the dockers list ordered by paths					var pathArray = this._dockersByPath.values()[0];			if (pathArray) {				pathArray.splice(this.dockers.indexOf(shape), 0, shape);			}						/* Perform nessary adjustments on the edge's child shapes */			this.handleChildShapesAfterAddDocker(shape);		}	},		/**	 * Performs nessary adjustments on the edge's child shapes.	 * 	 * @param {ORYX.Core.Controls.Docker} docker	 * 		The added docker	 */	handleChildShapesAfterAddDocker: function(docker) {		/* Ensure type of Docker */		if(!docker instanceof ORYX.Core.Controls.Docker) {return undefined;}				var index = this.dockers.indexOf(docker);		if(!(0 < index && index < this.dockers.length - 1)) {		/* Exception: Expect added docker between first and last node of the edge */			return undefined;		} 					/* Get child nodes concerning the segment of the new docker */		var startDocker = this.dockers[index-1];		var endDocker = this.dockers[index+1];				/* Adjust the position of edge's child nodes */		var segmentElements = 			this.getAttachedNodePositionDataForSegment(startDocker, endDocker);				var lengthSegmentPart1 = ORYX.Core.Math.getDistancePointToPoint(										startDocker.bounds.center(),										docker.bounds.center());		var lengthSegmentPart2 = ORYX.Core.Math.getDistancePointToPoint(										endDocker.bounds.center(),										docker.bounds.center());												if(!(lengthSegmentPart1 + lengthSegmentPart2)) {return;}				var relativDockerPosition = lengthSegmentPart1 / (lengthSegmentPart1 + lengthSegmentPart2);					segmentElements.each(function(nodePositionData) {			/* Assign child node to the new segment */			if(nodePositionData.value.relativDistanceFromDocker1 < relativDockerPosition) {				/* Case: before added Docker */				nodePositionData.value.segment.docker2 = docker;				nodePositionData.value.relativDistanceFromDocker1 = 					nodePositionData.value.relativDistanceFromDocker1 / relativDockerPosition;			} else {				/* Case: after added Docker */				nodePositionData.value.segment.docker1 = docker;				var newFullDistance = 1 - relativDockerPosition;				var relativPartOfSegment = 							nodePositionData.value.relativDistanceFromDocker1							- relativDockerPosition;								nodePositionData.value.relativDistanceFromDocker1 = 										relativPartOfSegment / newFullDistance;							}		})				/* Update attached nodes visual representation */		this.refreshAttachedNodes();	},		/**	 *	Returns elements from {@link attachedNodePositiondata} that match the	 *  segement defined by startDocker and endDocker.	 *  	 *  @param {ORYX.Core.Controls.Docker} startDocker	 *  	The docker defining the begin of the segment.	 *  @param {ORYX.Core.Controls.Docker} endDocker	 *  	The docker defining the begin of the segment.	 *  	 *  @return {Hash} attachedNodePositionData	 *  	Child elements matching the segment	 */	getAttachedNodePositionDataForSegment: function(startDocker, endDocker) {		/* Ensure that the segment is defined correctly */		if(!((startDocker instanceof ORYX.Core.Controls.Docker) 			&& (endDocker instanceof ORYX.Core.Controls.Docker))) {				return [];			}					/* Get elements of the segment */		var elementsOfSegment = 			this.attachedNodePositionData.findAll(function(nodePositionData) {				return nodePositionData.value.segment.docker1 === startDocker &&						nodePositionData.value.segment.docker2 === endDocker;			});				/* Return a Hash in each case */		if(!elementsOfSegment) {return [];}				return elementsOfSegment;	},		/**	 * Removes an edge's child shape	 */	remove: function(shape) {		arguments.callee.$.remove.apply(this, arguments);				if(this.attachedNodePositionData[shape.getId()]) {			delete this.attachedNodePositionData[shape.getId()];		}				/* Adjust child shapes if neccessary */		if(shape instanceof ORYX.Core.Controls.Docker) {			this.handleChildShapesAfterRemoveDocker(shape);		}	},		/**	 * 	Adjusts the child shapes of an edges after a docker was removed.	 * 		 *  @param{ORYX.Core.Controls.Docker} docker	 *  	The removed docker.	 */	handleChildShapesAfterRemoveDocker: function(docker) {		/* Ensure docker type */		if(!(docker instanceof ORYX.Core.Controls.Docker)) {return;}				this.attachedNodePositionData.each(function(nodePositionData) {			if(nodePositionData.value.segment.docker1 === docker) {				/* The new start of the segment is the predecessor of docker2. */				var index = this.dockers.indexOf(nodePositionData.value.segment.docker2);				if(index == -1) {return;}				nodePositionData.value.segment.docker1 = this.dockers[index - 1];			} 			else if(nodePositionData.value.segment.docker2 === docker) {				/* The new end of the segment is the successor of docker1. */				var index = this.dockers.indexOf(nodePositionData.value.segment.docker1);				if(index == -1) {return;}				nodePositionData.value.segment.docker2 = this.dockers[index + 1];			}		}.bind(this));				/* Update attached nodes visual representation */		this.refreshAttachedNodes();	},		/**     *@deprecated Use the .createDocker() Method and set the point via the bounds     */    addDocker: function(position, exDocker){        var lastDocker;		var result;        this._dockersByPath.any((function(pair){            return pair.value.any((function(docker, index){                if (!lastDocker) {                    lastDocker = docker;                    return false;                }                else {                    var point1 = lastDocker.bounds.center();                    var point2 = docker.bounds.center();                                        if (ORYX.Core.Math.isPointInLine(position.x, position.y, point1.x, point1.y, point2.x, point2.y, 10)) {                        var path = this._paths.find(function(path){                            return path.id === pair.key;                        });                        if (path) {                            var allowAttr = path.getAttributeNS(NAMESPACE_ORYX, 'allowDockers');                            if (allowAttr && allowAttr.toLowerCase() === "no") {                                return true;                            }                        }                        var newDocker = (exDocker) ? exDocker : this.createDocker(this.dockers.indexOf(lastDocker) + 1, position);						newDocker.bounds.centerMoveTo(position);                        if(exDocker)							this.add(newDocker, this.dockers.indexOf(lastDocker) + 1);                        // Remove new Docker from 'to add' dockers						//pair.value = pair.value.without(newDocker);						//pair.value.splice(this.dockers.indexOf(lastDocker) + 1, 0, newDocker);						// Remove the Docker from the Docker list and add the Docker to the new position                        //this.dockers = this.dockers.without(newDocker);                        //this.dockers.splice(this.dockers.indexOf(lastDocker) + 1, 0, newDocker);                        //this._update(true);						result = newDocker;                        return true;                    }                    else {                        lastDocker = docker;                        return false;                    }                }            }).bind(this));        }).bind(this));		return result;    },        removeDocker: function(docker){        if (this.dockers.length > 2 && !(this.dockers.first() === docker)) {            this._dockersByPath.any((function(pair){                if (pair.value.member(docker)) {                    if (docker === pair.value.last()) {                        return true;                    }                    else {                        this.remove(docker);                        this._dockersByPath[pair.key] = pair.value.without(docker);                        this.isChanged = true;                        this._dockerChanged();                        return true;                    }                }                return false;            }).bind(this));        }    },		/**	 * Removes all dockers from the edge which are on 	 * the line between two dockers	 * @return {Object} Removed dockers in an indicied array 	 * (key is the removed position of the docker, value is docker themselve)	 */	removeUnusedDockers:function(){		var marked = $H({});				this.dockers.each(function(docker, i){			if (i==0||i==this.dockers.length-1){ return }			var previous = this.dockers[i-1];						/* Do not consider already removed dockers */			if(marked.values().indexOf(previous) != -1 && this.dockers[i-2]) {				previous = this.dockers[i-2];			}			var next = this.dockers[i+1];						var cp = previous.getDockedShape() && previous.referencePoint ? previous.getAbsoluteReferencePoint() : previous.bounds.center();			var cn = next.getDockedShape() && next.referencePoint ? next.getAbsoluteReferencePoint() : next.bounds.center();			var cd = docker.bounds.center();						if (ORYX.Core.Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 1)){				marked[i] = docker;			}		}.bind(this))				marked.each(function(docker){			this.removeDocker(docker.value);		}.bind(this))				if (marked.values().length > 0){			this._update(true);		}				return marked;	},        /**     * Initializes the Edge after loading the SVG representation of the edge.     * @param {SVGDocument} svgDocument     */    _init: function(svgDocument){        arguments.callee.$._init.apply(this, arguments);                var minPointX, minPointY, maxPointX, maxPointY;                //init markers        var defs = svgDocument.getElementsByTagNameNS(NAMESPACE_SVG, "defs");        if (defs.length > 0) {            defs = defs[0];            var markerElements = $A(defs.getElementsByTagNameNS(NAMESPACE_SVG, "marker"));            var marker;            var me = this;            markerElements.each(function(markerElement){                try {                    marker = new ORYX.Core.SVG.SVGMarker(markerElement.cloneNode(true));                    me._markers[marker.id] = marker;                    var textElements = $A(marker.element.getElementsByTagNameNS(NAMESPACE_SVG, "text"));                    var label;                    textElements.each(function(textElement){                        label = new ORYX.Core.SVG.Label({                            textElement: textElement,							shapeId: this.id                        });                        me._labels[label.id] = label;                    });                }                 catch (e) {                }            });        }                        var gs = svgDocument.getElementsByTagNameNS(NAMESPACE_SVG, "g");        if (gs.length <= 0) {            throw "Edge: No g element found.";        }        var g = gs[0];                        g.setAttributeNS(null, "id", null);                var isFirst = true;                $A(g.childNodes).each((function(path, index){            if (ORYX.Editor.checkClassType(path, SVGPathElement)) {                path = path.cloneNode(false);                                var pathId = this.id + "_" + index;                path.setAttributeNS(null, "id", pathId);                this._paths.push(path);                                //check, if markers are set and update the id                var markersByThisPath = [];                var markerUrl = path.getAttributeNS(null, "marker-start");                                if (markerUrl && markerUrl !== "") {                    markerUrl = markerUrl.strip();                    markerUrl = markerUrl.replace(/^url\(#/, '');                    var markerStartId = this.id.concat(markerUrl.replace(/\)$/, ''));                    path.setAttributeNS(null, "marker-start", "url(#" + markerStartId + ")");                                        markersByThisPath.push(this._markers[markerStartId]);                }                                markerUrl = path.getAttributeNS(null, "marker-mid");                                if (markerUrl && markerUrl !== "") {                    markerUrl = markerUrl.strip();                    markerUrl = markerUrl.replace(/^url\(#/, '');                    var markerMidId = this.id.concat(markerUrl.replace(/\)$/, ''));                    path.setAttributeNS(null, "marker-mid", "url(#" + markerMidId + ")");                                        markersByThisPath.push(this._markers[markerMidId]);                }                                markerUrl = path.getAttributeNS(null, "marker-end");                                if (markerUrl && markerUrl !== "") {                    markerUrl = markerUrl.strip();                    markerUrl = markerUrl.replace(/^url\(#/, '');                    var markerEndId = this.id.concat(markerUrl.replace(/\)$/, ''));                    path.setAttributeNS(null, "marker-end", "url(#" + markerEndId + ")");                                        markersByThisPath.push(this._markers[markerEndId]);                }                                this._markersByPath[pathId] = markersByThisPath;                                //init dockers                var parser = new PathParser();                var handler = new ORYX.Core.SVG.PointsPathHandler();                parser.setHandler(handler);                parser.parsePath(path);                                if (handler.points.length < 4) {                    throw "Edge: Path has to have two or more points specified.";                }                                this._dockersByPath[pathId] = [];                				for (var i = 0; i < handler.points.length; i += 2) {					//handler.points.each((function(point, pIndex){					var x = handler.points[i];					var y = handler.points[i+1];					if (isFirst || i > 0) {						var docker = new ORYX.Core.Controls.Docker({							eventHandlerCallback: this.eventHandlerCallback						});						docker.bounds.centerMoveTo(x,y);						docker.bounds.registerCallback(this._dockerChangedCallback);						this.add(docker, this.dockers.length);												//this._dockersByPath[pathId].push(docker);												//calculate minPoint and maxPoint						if (minPointX) {							minPointX = Math.min(x, minPointX);							minPointY = Math.min(y, minPointY);						}						else {							minPointX = x;							minPointY = y;						}												if (maxPointX) {							maxPointX = Math.max(x, maxPointX);							maxPointY = Math.max(y, maxPointY);						}						else {							maxPointX = x;							maxPointY = y;						}					}					//}).bind(this));				}                isFirst = false;            }        }).bind(this));                this.bounds.set(minPointX, minPointY, maxPointX, maxPointY);                if (this.bounds.width() === 0 || this.bounds.height() === 0) {            this.bounds.extend({                x: this.bounds.width() === 0 ? 2 : 0,                y: this.bounds.height() === 0 ? 2 : 0            });                        this.bounds.moveBy({                x: this.bounds.width() === 0 ? -1 : 0,                y: this.bounds.height() === 0 ? -1 : 0            });                    }                this._oldBounds = this.bounds.clone();                //add paths to this.node        this._paths.reverse();        var paths = [];        this._paths.each((function(path){            paths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(path));        }).bind(this));                this._paths = paths;                //init interaction path        this._paths.each((function(path){            var iPath = path.cloneNode(false);			iPath.setAttributeNS(null, "id", undefined);            iPath.setAttributeNS(null, "stroke-width", 10);            iPath.setAttributeNS(null, "visibility", "hidden");            iPath.setAttributeNS(null, "stroke-dasharray", null);            iPath.setAttributeNS(null, "stroke", "black");            iPath.setAttributeNS(null, "fill", "none");            this._interactionPaths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(iPath));        }).bind(this));                this._paths.reverse();        this._interactionPaths.reverse();				/**initialize labels*/        var textElems = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text');        		$A(textElems).each((function(textElem){            var label = new ORYX.Core.SVG.Label({                textElement: textElem,				shapeId: this.id            });            this.node.childNodes[0].childNodes[0].appendChild(label.node);            this._labels[label.id] = label;        }).bind(this)); 		        //set title        this.node.childNodes[0].childNodes[0].setAttributeNS(null, "title", this.getStencil().title());                this.propertiesChanged.each(function(pair){            pair.value = true;        });		        //this._update(true);    },        /**     * Adds all necessary markers of this Edge to the SVG document.     * Has to be called, while this.node is part of DOM.     */    addMarkers: function(defs){        this._markers.each(function(marker){            if (!defs.ownerDocument.getElementById(marker.value.id)) {                marker.value.element = defs.appendChild(marker.value.element);            }        });    },        /**     * Removes all necessary markers of this Edge from the SVG document.     * Has to be called, while this.node is part of DOM.     */    removeMarkers: function(){        var svgElement = this.node.ownerSVGElement;        if (svgElement) {            var defs = svgElement.getElementsByTagNameNS(NAMESPACE_SVG, "defs");            if (defs.length > 0) {                defs = defs[0];                this._markers.each(function(marker){                    var foundMarker = defs.ownerDocument.getElementById(marker.value.id);                    if (foundMarker) {                        marker.value.element = defs.removeChild(marker.value.element);                    }                });            }        }    },        /**     * Calls when a docker has changed     */    _dockerChanged: function(){            //this._update(true);		this._dockerUpdated = true;            },        serialize: function(){        var result = arguments.callee.$.serialize.apply(this);                //add dockers triple        var value = "";        this._dockersByPath.each((function(pair){            pair.value.each(function(docker){                var position = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center();                value = value.concat(position.x + " " + position.y + " ");            });                        value += " # ";        }).bind(this));        result.push({            name: 'dockers',            prefix: 'oryx',            value: value,            type: 'literal'        });                //add parent triple dependant on the dockedShapes        //TODO change this when canvas becomes a resource/*        var source = this.dockers.first().getDockedShape();        var target = this.dockers.last().getDockedShape();        var sharedParent;        if (source && target) {            //get shared parent            while (source.parent) {                source = source.parent;                if (source instanceof ORYX.Core.Canvas) {                    sharedParent = source;                    break;                }                else {                    var targetParent = target.parent;                    var found;                    while (targetParent) {                        if (source === targetParent) {                            sharedParent = source;                            found = true;                            break;                        }                        else {                            targetParent = targetParent.parent;                        }                    }                    if (found) {                        break;                    }                }            }        }        else             if (source) {                sharedParent = source.parent;            }            else                 if (target) {                    sharedParent = target.parent;                }*/                //if (sharedParent) {/*            result.push({                name: 'parent',                prefix: 'raziel',                //value: '#' + ERDF.__stripHashes(sharedParent.resourceId),                value: '#' + ERDF.__stripHashes(this.getCanvas().resourceId),                type: 'resource'            });*/        //}				//serialize target and source		var lastDocker = this.dockers.last();				var target = lastDocker.getDockedShape();				if(target) {			result.push({				name: 'target',				prefix: 'raziel',				value: '#' + ERDF.__stripHashes(target.resourceId),				type: 'resource'			});		}                try {            //result = this.getStencil().serialize(this, result);			var serializeEvent = this.getStencil().serialize();						/*			 * call serialize callback by reference, result should be found			 * in serializeEvent.result			 */			if(serializeEvent.type) {				serializeEvent.shape = this;				serializeEvent.data = result;				serializeEvent.result = undefined;				serializeEvent.forceExecution = true;								this._delegateEvent(serializeEvent);								if(serializeEvent.result) {					result = serializeEvent.result;				}			}        }         catch (e) {        }        return result;    },        deserialize: function(data){        try {            //data = this.getStencil().deserialize(this, data);						var deserializeEvent = this.getStencil().deserialize();						/*			 * call serialize callback by reference, result should be found			 * in serializeEventInfo.result			 */			if(deserializeEvent.type) {				deserializeEvent.shape = this;				deserializeEvent.data = data;				deserializeEvent.result = undefined;				deserializeEvent.forceExecution = true;								this._delegateEvent(deserializeEvent);				if(deserializeEvent.result) {					data = deserializeEvent.result;				}			}        }         catch (e) {        }        		// Set the outgoing shapes		var target = data.find(function(ser) {return (ser.prefix+"-"+ser.name) == 'raziel-target'});		var targetShape;		if(target) {			targetShape = this.getCanvas().getChildShapeByResourceId(target.value);		}				var outgoing = data.findAll(function(ser){ return (ser.prefix+"-"+ser.name) == 'raziel-outgoing'});		outgoing.each((function(obj){			// TODO: Look at Canvas			if(!this.parent) {return};											// Set outgoing Shape			var next = this.getCanvas().getChildShapeByResourceId(obj.value);																		if(next){				if(next == targetShape) {					// If this is an edge, set the last docker to the next shape					this.dockers.last().setDockedShape(next);					this.dockers.last().setReferencePoint({x: next.bounds.width() / 2.0, y: next.bounds.height() / 2.0});				} else if(next instanceof ORYX.Core.Edge) {					//Set the first docker of the next shape					next.dockers.first().setDockedShape(this);					//next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});				} /*else if(next.dockers.length > 0) { //next is a node and next has a docker					next.dockers.first().setDockedShape(this);					next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});				}*/			}						}).bind(this));		        arguments.callee.$.deserialize.apply(this, [data]);                var oryxDockers = data.find(function(obj){            return (obj.prefix === "oryx" &&            obj.name === "dockers");        });		        if (oryxDockers) {            var dataByPath = oryxDockers.value.split("#").without("").without(" ");                        dataByPath.each((function(data, index){                var values = data.replace(/,/g, " ").split(" ").without("");                                //for each docker two values must be defined                if (values.length % 2 === 0) {                    var path = this._paths[index];                                        if (path) {                        if (index === 0) {                            while (this._dockersByPath[path.id].length > 2) {                                this.removeDocker(this._dockersByPath[path.id][1]);                            }                        }                        else {                            while (this._dockersByPath[path.id].length > 1) {                                this.removeDocker(this._dockersByPath[path.id][0]);                            }                        }                                                var dockersByPath = this._dockersByPath[path.id];                                                if (index === 0) {                            //set position of first docker                            var x = parseFloat(values.shift());                            var y = parseFloat(values.shift());                                                        if (dockersByPath.first().getDockedShape()) {                                dockersByPath.first().setReferencePoint({                                    x: x,                                    y: y                                });                            }                            else {                                dockersByPath.first().bounds.centerMoveTo(x, y);                            }                        }                                                //set position of last docker                        y = parseFloat(values.pop());                        x = parseFloat(values.pop());                                                if (dockersByPath.last().getDockedShape()) {                            dockersByPath.last().setReferencePoint({                                x: x,                                y: y                            });                        }                        else {                            dockersByPath.last().bounds.centerMoveTo(x, y);                        }                                                //add additional dockers                        for (var i = 0; i < values.length; i++) {                            x = parseFloat(values[i]);                            y = parseFloat(values[++i]);                                                        var newDocker = this.createDocker();                            newDocker.bounds.centerMoveTo(x, y);                                                        //this.dockers = this.dockers.without(newDocker);                            //this.dockers.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);                            //dockersByPath.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);						}                    }                }            }).bind(this));        }        else {            this.alignDockers();        }		this._changed();    },        toString: function(){        return this.getStencil().title() + " " + this.id;    },        /**     * @return {ORYX.Core.Shape} Returns last docked shape or null.     */    getTarget: function(){        return this.dockers.last() ? this.dockers.last().getDockedShape() : null;    },		/**	 * @return {ORYX.Core.Shape} Returns the first docked shape or null	 */	getSource: function() {		return this.dockers.first() ? this.dockers.first().getDockedShape() : null;	},		/**	 * Checks whether the edge is at least docked to one shape.	 * 	 * @return {boolean} True if edge is docked	 */	isDocked: function() {		var isDocked = false;		this.dockers.each(function(docker) {			if(docker.isDocked()) {				isDocked = true;				throw $break;			}		});		return isDocked;	},        /**     * Calls {@link ORYX.Core.AbstractShape#toJSON} and add a some stencil set information.     */    toJSON: function() {        var json = arguments.callee.$.toJSON.apply(this, arguments);                if(this.getTarget()) {            json.target = {                resourceId: this.getTarget().resourceId            };        }                return json;    }};ORYX.Core.Edge = ORYX.Core.Shape.extend(ORYX.Core.Edge);/**
 * Copyright (c) 2008
 * Willi Tscheschner
 * 
 **/

if(!ORYX){ var ORYX = {} }
if(!ORYX.Plugins){ ORYX.Plugins = {} }

/**
   This abstract plugin class can be used to build plugins on.
   It provides some more basic functionality like registering events (on*-handlers)...
   @example
    ORYX.Plugins.MyPlugin = ORYX.Plugins.AbstractPlugin.extend({
        construct: function() {
            // Call super class constructor
            arguments.callee.$.construct.apply(this, arguments);
            
            [...]
        },
        [...]
    });
   
   @class ORYX.Plugins.AbstractPlugin
   @constructor Creates a new instance
   @author Willi Tscheschner
*/
ORYX.Plugins.AbstractPlugin = Clazz.extend({
    /** 
     * The facade which offer editor-specific functionality
     * @type Facade
     * @memberOf ORYX.Plugins.AbstractPlugin.prototype
     */
	facade: null,
	
	construct: function( facade ){
		this.facade = facade;
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.onLoaded.bind(this));
	},
        
    /**
       Overwrite to handle load event. TODO: Document params!!!
       @methodOf ORYX.Plugins.AbstractPlugin.prototype
    */
	onLoaded: function(){},
	
    /**
       Overwrite to handle selection changed event. TODO: Document params!!!
       @methodOf ORYX.Plugins.AbstractPlugin.prototype
    */
	onSelectionChanged: function(){},
	
    /**
       Show overlay on given shape.
       @methodOf ORYX.Plugins.AbstractPlugin.prototype
       @example
       showOverlay(
           myShape,
           { stroke: "green" },
           ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
               "title": "Click the element to execute it!",
               "stroke-width": 2.0,
               "stroke": "black",
               "d": "M0,-5 L5,0 L0,5 Z",
               "line-captions": "round"
           }])
       )
       @param {Oryx.XXX.Shape[]} shapes One shape or array of shapes the overlay should be put on
       @param {Oryx.XXX.Attributes} attributes some attributes...
       @param {Oryx.svg.node} svgNode The svg node which should be used as overlay
       @param {String} [svgNode="NW"] The svg node position where the overlay should be placed
    */
	showOverlay: function(shapes, attributes, svgNode, svgNodePosition ){
		
		if( !(shapes instanceof Array) ){
			shapes = [shapes]
		}
		
		// Define Shapes
		shapes = shapes.map(function(shape){
			var el = shape;
			if( typeof shape == "string" ){
				el = this.facade.getCanvas().getChildShapeByResourceId( shape );
				el = el || this.facade.getCanvas().getChildById( shape, true );
			}
			return el;
		}.bind(this)).compact();
		
		// Define unified id
		if( !this.overlayID ){
			this.overlayID = this.type + ORYX.Editor.provideId();
		}
		
		this.facade.raiseEvent({
			type		: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
			id			: this.overlayID,
			shapes		: shapes,
			attributes 	: attributes,
			node		: svgNode,
			nodePosition: svgNodePosition || "NW"
		});
		
	},
	
    /**
       Hide current overlay.
       @methodOf ORYX.Plugins.AbstractPlugin.prototype
    */
	hideOverlay: function(){
		this.facade.raiseEvent({
			type	: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
			id		: this.overlayID
		});		
	},
	
    /**
       Does a transformation with the given xslt stylesheet.
       @methodOf ORYX.Plugins.AbstractPlugin.prototype
       @param {String} data The data (e.g. eRDF) which should be transformed
       @param {String} stylesheet URL of a stylesheet which should be used for transforming data.
    */
	doTransform: function( data, stylesheet ) {		
		
		if( !stylesheet || !data ){
			return ""
		}

        var parser 		= new DOMParser();
        var parsedData 	= parser.parseFromString(data, "text/xml");
		source=stylesheet;
		new Ajax.Request(source, {
			asynchronous: false,
			method: 'get',
			onSuccess: function(transport){
				xsl = transport.responseText
			}.bind(this),
			onFailure: (function(transport){
				ORYX.Log.error("XSL load failed" + transport);
			}).bind(this)
		});
        var xsltProcessor = new XSLTProcessor();
		var domParser = new DOMParser();
		var xslObject = domParser.parseFromString(xsl, "text/xml");
        xsltProcessor.importStylesheet(xslObject);
        
        try {
        	
            var newData 		= xsltProcessor.transformToFragment(parsedData, document);
            var serializedData 	= (new XMLSerializer()).serializeToString(newData);
            
           	/* Firefox 2 to 3 problem?! */
            serializedData = !serializedData.startsWith("<?xml") ? "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serializedData : serializedData;
            
            return serializedData;
            
        }catch (error) {
            return -1;
        }
        
	},
	
	/**
	 * Opens a new window that shows the given XML content.
	 * @methodOf ORYX.Plugins.AbstractPlugin.prototype
	 * @param {Object} content The XML content to be shown.
	 * @example
	 * openDownloadWindow( "my.xml", "<exampleXML />" );
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
     * @methodOf ORYX.Plugins.AbstractPlugin.prototype
     * @param {String} filename The content's file name
     * @param {String} content The content to download
     */
	openDownloadWindow: function(filename, content) {
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
			
			submitForm.appendChild( createHiddenElement("download", content) );
			submitForm.appendChild( createHiddenElement("file", filename) );
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= ORYX.PATH + "/download";
			submitForm.submit();
		}		
	},
    
    /**
     * Serializes DOM.
     * @methodOf ORYX.Plugins.AbstractPlugin.prototype
     * @type {String} Serialized DOM
     */
    getSerializedDOM: function(){
        // Force to set all resource IDs
        var serializedDOM = DataManager.serializeDOM( this.facade );

        //add namespaces
        serializedDOM = '<?xml version="1.0" encoding="utf-8"?>' +
        '<html xmlns="http://www.w3.org/1999/xhtml" ' +
        'xmlns:b3mn="http://b3mn.org/2007/b3mn" ' +
        'xmlns:ext="http://b3mn.org/2007/ext" ' +
        'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
        'xmlns:atom="http://b3mn.org/2007/atom+xhtml">' +
        '<head profile="http://purl.org/NET/erdf/profile">' +
        '<link rel="schema.dc" href="http://purl.org/dc/elements/1.1/" />' +
        '<link rel="schema.dcTerms" href="http://purl.org/dc/terms/ " />' +
        '<link rel="schema.b3mn" href="http://b3mn.org" />' +
        '<link rel="schema.oryx" href="http://oryx-editor.org/" />' +
        '<link rel="schema.raziel" href="http://raziel.org/" />' +
        '<base href="' +
        location.href.split("?")[0] +
        '" />' +
        '</head><body>' +
        serializedDOM +
        '</body></html>';
        
        return serializedDOM;
    },
    
    /**
     * Sets the editor in read only mode: Edges/ dockers cannot be moved anymore,
     * shapes cannot be selected anymore.
     * @methodOf ORYX.Plugins.AbstractPlugin.prototype
     */
    enableReadOnlyMode: function(){
        //Edges cannot be moved anymore
        this.facade.disableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);
        
        // Stop the user from editing the diagram while the plugin is active
        this._stopSelectionChange = function(){
            if(this.facade.getSelection().length > 0) {
                this.facade.setSelection([]);
            }
        };
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this));
    },
    /**
     * Disables read only mode, see @see
     * @methodOf ORYX.Plugins.AbstractPlugin.prototype
     * @see ORYX.Plugins.AbstractPlugin.prototype.enableReadOnlyMode
     */
    disableReadOnlyMode: function(){
        // Edges can be moved now again
        this.facade.enableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);
        
        if (this._stopSelectionChange) {
            this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this));
            this._stopSelectionChange = undefined;
        }
    },
    
    /**
     * Extracts RDF from DOM.
     * @methodOf ORYX.Plugins.AbstractPlugin.prototype
     * @type {String} Extracted RFD. Null if there are transformation errors.
     */
    getRDFFromDOM: function(){
        //convert to RDF
		try {
			var xsl = "";
			source=ORYX.PATH + "lib/extract-rdf.xsl";
			new Ajax.Request(source, {
				asynchronous: false,
				method: 'get',
				onSuccess: function(transport){
					xsl = transport.responseText
				}.bind(this),
				onFailure: (function(transport){
					ORYX.Log.error("XSL load failed" + transport);
				}).bind(this)
			});
			/*
			 var parser = new DOMParser();
			 var parsedDOM = parser.parseFromString(this.getSerializedDOM(), "text/xml");
			 var xsltPath = ORYX.PATH + "lib/extract-rdf.xsl";
			 var xsltProcessor = new XSLTProcessor();
			 var xslRef = document.implementation.createDocument("", "", null);
			 xslRef.async = false;
			 xslRef.load(xsltPath);
			 xsltProcessor.importStylesheet(xslRef);
			 try {
			 var rdf = xsltProcessor.transformToDocument(parsedDOM);
			 return (new XMLSerializer()).serializeToString(rdf);
			 } catch (error) {
			 Ext.Msg.alert("Oryx", error);
			 return null;
			 }*/
			var domParser = new DOMParser();
			var xmlObject = domParser.parseFromString(this.getSerializedDOM(), "text/xml");
			var xslObject = domParser.parseFromString(xsl, "text/xml");
			var xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(xslObject);
			var result = xsltProcessor.transformToFragment(xmlObject, document);
			
			var serializer = new XMLSerializer();
			
			return serializer.serializeToString(result);
		}catch(e){
			Ext.Msg.alert("Oryx", error);
			return "";
		}

		
    },
    
    /**
	 * Checks if a certain stencil set is loaded right now.
	 * 
	 */
	isStencilSetExtensionLoaded: function(stencilSetExtensionNamespace) {
		return this.facade.getStencilSets().values().any(
			function(ss){ 
				return ss.extensions().keys().any(
					function(extensionKey) {
						return extensionKey == stencilSetExtensionNamespace;
					}.bind(this)
				);
			}.bind(this)
		);
	},
	
	/**
	 * Raises an event so that registered layouters does
	 * have the posiblility to layout the given shapes 
	 * For further reading, have a look into the AbstractLayouter
	 * class
	 * @param {Object} shapes
	 */
	doLayout: function(shapes){
		// Raises a do layout event
		this.facade.raiseEvent({
			type		: ORYX.CONFIG.EVENT_LAYOUT,
			shapes		: shapes
		});
	},
	
	
	/**
	 * Does a primitive layouting with the incoming/outgoing 
	 * edges (set the dockers to the right position) and if 
	 * necessary, it will be called the real layouting 
	 * @param {ORYX.Core.Node} node
	 * @param {Array} edges
	 */
	layoutEdges : function(node, allEdges, offset){		
		
		// Find all edges, which are related to the node and
		// have more than two dockers
		var edges = allEdges
			// Find all edges with more than two dockers
			.findAll(function(r){ return r.dockers.length > 2 }.bind(this))
			
		if (edges.length > 0) {
										
			// Get the new absolute center
			var center = node.absoluteXY();
			
			var ulo = {x: center.x - offset.x, y:center.y - offset.y}			
			
			center.x += node.bounds.width()/2;
			center.y += node.bounds.height()/2;
			
			// Get the old absolute center
			oldCenter = Object.clone(center);
			oldCenter.x -= offset ? offset.x : 0;
			oldCenter.y -= offset ? offset.y : 0;
			
			var ul = {x: center.x - (node.bounds.width() / 2), y: center.y - (node.bounds.height() / 2)}
			var lr = {x: center.x + (node.bounds.width() / 2), y: center.y + (node.bounds.height() / 2)}
			
			
			/**
			 * Align the bounds if the center is 
			 * the same than the old center
			 * @params {Object} bounds
			 * @params {Object} bounds2
			 */
			var align = function(bounds, bounds2){
				var xdif = bounds.center().x-bounds2.center().x;
				var ydif = bounds.center().y-bounds2.center().y;
				if (Math.abs(xdif) < 3){
					bounds.moveBy({x:(offset.xs?(((offset.xs*(bounds.center().x-ulo.x))+offset.x+ulo.x)-bounds.center().x):offset.x)-xdif, y:0});		
				} else if (Math.abs(ydif) < 3){
					bounds.moveBy({x:0, y:(offset.ys?(((offset.ys*(bounds.center().y-ulo.y))+offset.y+ulo.y)-bounds.center().y):offset.y)-ydif});		
				}
			};
									
			/**						
			 * Returns a TRUE if there are bend point which overlay the shape
			 */
			var isBendPointIncluded = function(edge){
				// Get absolute bounds
				var ab = edge.dockers.first().getDockedShape();
				var bb = edge.dockers.last().getDockedShape();
				
				if (ab) {
					ab = ab.absoluteBounds();
					ab.widen(5);
				}
				
				if (bb) {
					bb = bb.absoluteBounds();
					bb.widen(20); // Wide with 20 because of the arrow from the edge
				}
				
				return edge.dockers
						.any(function(docker, i){ 
							var c = docker.bounds.center();
									// Dont count first and last
							return 	i != 0 && i != edge.dockers.length-1 && 
									// Check if the point is included to the absolute bounds
									((ab && ab.isIncluded(c)) || (bb && bb.isIncluded(c)))
						})
			}
			// For every edge, check second and one before last docker
			// if there are horizontal/vertical on the same level
			// and if so, align the the bounds 
			edges.each(function(edge){
				if (edge.dockers.first().getDockedShape() === node){
					var second = edge.dockers[1];
					if (align(second.bounds, edge.dockers.first().bounds)){ second.update(); }
				} else if (edge.dockers.last().getDockedShape() === node) {
					var beforeLast = edge.dockers[edge.dockers.length-2];
					if (align(beforeLast.bounds, edge.dockers.last().bounds)){ beforeLast.update(); }									
				}
				edge._update(true);
				edge.removeUnusedDockers();
				if (isBendPointIncluded(edge)){
					this.doLayout(edge);
					return;
				}
			}.bind(this))
		}	

		// Find all edges, which have only to dockers 
		// and is located horizontal/vertical.
		// Do layout with those edges
		allEdges.each(function(edge){
				// Find all edges with two dockers
				if (edge.dockers.length == 2){
					var p1 = edge.dockers.first().bounds.center();
					var p2 = edge.dockers.last().bounds.center();
					// Find all horizontal/vertical edges
					if (Math.abs(p1.x - p2.x) < 2 || Math.abs(p1.y - p2.y) < 2){
						edge.dockers.first().update();
						edge.dockers.last().update();
						this.doLayout(edge);
					}
				}
			}.bind(this));
	}
});/**
 * Copyright (c) 2009
 * Willi Tscheschner
 * 
 **/

if(!ORYX){ var ORYX = {} }
if(!ORYX.Plugins){ ORYX.Plugins = {} }

/**
   This abstract plugin implements the core behaviour of layout
   
   @class ORYX.Plugins.AbstractLayouter
   @constructor Creates a new instance
   @author Willi Tscheschner
*/
ORYX.Plugins.AbstractLayouter = ORYX.Plugins.AbstractPlugin.extend({
	
	/**
	 * 'layouted' defined all types of shapes which will be layouted. 
	 * It can be one value or an array of values. The value
	 * can be a Stencil ID (as String) or an class type of either 
	 * a ORYX.Core.Node or ORYX.Core.Edge
     * @type Array|String|Object
     * @memberOf ORYX.Plugins.AbstractLayouter.prototype
	 */
	layouted : [],
	
	/**
	 * Constructor
	 * @param {Object} facade
	 * @memberOf ORYX.Plugins.AbstractLayouter.prototype
	 */
	construct: function( facade ){
		arguments.callee.$.construct.apply(this, arguments);
			
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT, this._initLayout.bind(this));
	},
	
	/**
	 * Proofs if this shape should be layouted or not
	 * @param {Object} shape
     * @memberOf ORYX.Plugins.AbstractLayouter.prototype
	 */
	isIncludedInLayout: function(shape){
		if (!(this.layouted instanceof Array)){
			this.layouted = [this.layouted].compact();
		}
		
		// If there are no elements
		if (this.layouted.length <= 0) {
			// Return TRUE
			return true;
		}
		
		// Return TRUE if there is any correlation between 
		// the 'layouted' attribute and the shape themselve.
		return this.layouted.any(function(s){
			if (typeof s == "string") {
				return shape.getStencil().id().include(s);
			} else {
				return shape instanceof s;
			}
		})
	},
	
	/**
	 * Callback to start the layouting
	 * @param {Object} event Layout event
	 * @param {Object} shapes Given shapes
     * @memberOf ORYX.Plugins.AbstractLayouter.prototype
	 */
	_initLayout: function(event){
		
		// Get the shapes
		var shapes = [event.shapes].flatten().compact();
		
		// Find all shapes which should be layouted
		var toLayout = shapes.findAll(function(shape){
			return this.isIncludedInLayout(shape) 
		}.bind(this))
		
		// If there are shapes left 
		if (toLayout.length > 0){
			// Do layout
			this.layout(toLayout);
		}
	},
	
	/**
	 * Implementation of layouting a set on shapes
	 * @param {Object} shapes Given shapes
     * @memberOf ORYX.Plugins.AbstractLayouter.prototype
	 */
	layout: function(shapes){
		throw new Error("Layouter has to implement the layout function.")
	}
});