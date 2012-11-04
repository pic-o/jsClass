/********************************************************************************************************************************************************** 
File:	jsClass.js
Provides class functionalities for javascript

Script type: 	
javascript, global self loading script (Not JSON-Script compliant)

Version:	
Beta 1.5 (04 Nov 2011)

Standars Mode Only!:
Ensure that standards mode is set for the page, before running this (as IE will be a pain otherwise)
	(start code)
	<!DOCTYPE html> 
	<html>
	<head>
	...
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	...
	(end code)

Notes:
Please ensure jsCompatible, is loaded prior to this script, to make this cross-client safe

[http://pic-o.com/blog/2011/08/jscompatible/]

Demo Usage:
	(start code)
	//----------------------------------------//
	// Creating the base class to extend from //
	//----------------------------------------//
	var testClass = Class._extend( {
		"_init" : function( ext ) { 
			//This is the constructor, default value + ext?
			this.attribute = this.attribute + ext; 
		},
		 //attributes/properties
		"test" : function() { console.log(arguments); },
		"attribute" : "hello",
	} );
	
	//---------------------------------------//
	// Testing the base class, created above //
	//---------------------------------------//
	var c = new testClass( " world" );
	c.test( c.attribute );
	
	//--------------------------------------------//
	// Extending the base class (and changing it) //
	//--------------------------------------------//
	var extClass = testClass._extend( {
		"test" : function() { this._super( "Good Bye" ); }
	} );
	
	//----------------------------//
	// Testing the extended class //
	//----------------------------//
	var e = new extClass();
	e.test();
	
	//------------------------------------------------//
	// Proving that the instance of inheritance works //
	//------------------------------------------------//
	if( e instanceof testClass && extClass.prototype instanceof Class ) {
		console.log('instance of works');
	}
	(end code)


Syntax?:
	When _extend / extending classes, note the following in your class object :

	> _init : 	This is a constructor function
	> this._super:	Works just like normal super() calls.

	Additionally, the _extend function has other uses.

	> Class._extend( [prop], [extFrom], [notStrict] ) ...
	> 
	> [prop] :	Object to pass, to use as class properties.
	> [extFrom] :	Object / Class function to extend from.
	> [notStrict] :	Set to true, if the [extFrom] is not a 'Class' object / function. 
					(it will throw an error otherwise)

Main refrences:
http://ejohn.org/blog/simple-javascript-inheritance/

Change log:
Beta 1.50 [04 Nove 2012]    - Refactored and tested against IE standard mode : <!DOCTYPE html> / <meta http-equiv="X-UA-Compatible" content="IE=edge">
Beta 1.41 [04 Nove 2012]    - Reverted back to "_extend" parameter
Beta 1.40 [29 Aprl 2012]    - Updated to the "_extend" parameter instead.
Beta 1.30 [27 Decm 2011]    - Fixed the bug again (in deeper nested _super calls)
Beta 1.20 [24 Decm 2011]    - Fixed an _origin bug on nested _super calls
Beta 1.01 [07 Sept 2011]    - Allow constructors to overide the return value, by returning a non-null value.

Future suggestion:

BUGS:

***********************************************************************************************************************************************************
Author Details & CopyRight:
author		- picoCreator AKA Eugene Cheah
email		- pico.creator@gmail.com
website		- blog.pic-o.com
copyright	- cc by [CreativeCommons Attribution licenses]
			http://creativecommons.org/licenses/by/3.0/
			
CC notes: 	
+ Crediting me (Eugene Cheah AKA picoCreator) is required for derivatives of this work, UNLESS...
+ An exception is given for using this on a live deployment, (eg, using this for your blog in the background) in which crediting every single page may be impractical (even for commercial sites). 
+ However this exception is only given if you drop me an email, with the link to deployment.
+ This exception however does not hold in any source release of which this code is used (Its stated in the cc license btw), hence credit should be given in this case.
+ These license requirments would be applied to all forks / merges / derivatives, of this work.

Additional Copyright Notes:
+ I may update to add an additional open source licenses in the future / on requested =)
+ Remember to drop an email if you are using this for a live site, ty. (for my curiosity, to see where this code goes)
+ This copyright applies only to the file "jsClass.js", NOT the whole asac framework
**********************************************************************************************************************************************************/

/*****************************************
* Class: Class
* Javascript class engine [Function run]
*****************************************/
(function(){
	/**
	* The shared class caller, that triggers init / etc
	**/
	var Class;
	if(!window.Class || (typeof(window.Class) !== 'function') ) {
		Class = function Class() {};
		window.Class = Class;
	} else {
		Class = window.Class;
	}
	
	/**
	* Variable: Class.prototype
	* [Refers to self] Allows instanceof to work as intended
	**/
	Class.prototype = Class;
	
	if(!Class.prototype._super) {
		/**
		* Function: Class._super
		* Searches on the prototype chain, for the function which called it. 
		* Followed by checking and calling its _super() equivalent.
		**/
		function _super() {
			//"use strict"; //strict mode does not allow caller calls, lol
			
			//Gets the function caller for _super()
			
			//Non working, over the top version, lol
			//_caller = (arguments && ( arguments.caller || (arguments.callee && arguments.callee.caller))) || (_super && ( _super.caller || (_super.arguments && _super.arguments.caller)));
			var _caller  = ( (_super && _super.caller) || (arguments && ( arguments.caller || (arguments.callee && arguments.callee.caller))) );
			
			if(_caller === null || typeof(_caller) !== "function" ) {
				throw new TypeError("Class._super(): Failed to get calling function : Caller fetch not supported! (If this is IE, ensure it is in standards mode)");
			}
			
			//Finds teh caller name
			var _callName = null,
				_origin = this, //pesky line number bug -.-"
				_proto;
			
			//Gets the object in the prototype chain which called _super() [Search Function]
			while( _callName === null ) {
				
				//finds the orginal caller, and the object it came from in the prototype chain
				for( var p in _origin ) {
					if( _origin.hasOwnProperty(p) && _origin[p] == _caller ) { 
						_callName = p;
						break;
					}
				}
				
				if( _callName === null ) { //try again?: it maybe a nested _super
					_proto = Object.getPrototypeOf( _origin );
					if( _origin == _proto ) {
						throw new Error("Reached end of prototype chain, unable to find caller function");
					}
					_origin = _proto;
					
					if( _origin === null) {
						throw new TypeError("Class._super(): calling function not found in Class Object");
						return;
					}
				}
			}
			
			//Scans for the correct prototype object
			/*
			var _proto = null;
			while( _proto === null ) {
				if( _origin.hasOwnProperty( _callName ) && _origin[_callName] == _caller ) {
					_proto = Object.getPrototypeOf( _origin );
					
					if(!_proto) {
						throw new Error("Object.getPrototypeOf : failure");
					}
				} else {
					_nxt = Object.getPrototypeOf( _origin );
					if( _origin == _nxt ) {
						throw new Error("Reached end of prototype chain, unable to find '_super()' : "+_callName);
					}
					_origin = _nxt;
					
					if( _origin === null ) {
						throw( new TypeError("Class._super(): Class object has no prototype to call '_super()' for :"+_callName) );
					}	//Fail to find error : Due to inproper usage?
				}
			}
			*/
			//Goes one more level
			_proto = Object.getPrototypeOf( _origin ); 
			if(_proto === null) {
				throw new TypeError("Class._super(): Class object has no prototype to call '_super()' for :"+_callName);
			} else if(_proto == Class || _proto == _origin) {
				throw new Error("Reached end of prototype chain, unable to find '_super()' : "+_callName);
			}
			
			//Calls it out
			if( typeof(_proto[_callName]) === "function" ) {
				return (_proto[_callName]).apply( this, arguments ); //Calls it
			} else {
				throw( new TypeError("Class._super(): Fail to call _super() target [not a function] in __proto__ for: "+_callName) );
			}
		};
		Class.prototype._super = _super;
	}
	
	if(!Class.prototype._extend) {
		/**
		* Function: Class._extend
		* Extends a Class from its object, or Constructor prototype object.
		*
		* Arguments:
		* prop		- Class property object (to create)
		* extFrom	- Should be the class function, or its prototype object to inherit from
		* notStrict - [default false] Skip several checks that requires "extFrom" to be instanceof Class.
		**/
		Class.prototype._extend = function( prop, extFrom, notStrict ) {
			//"use strict"; //strict mode
			if( Object(extFrom) !== extFrom ) { 
				extFrom = this;	
			} 
			
			//console.warn( prop.n, 'a', extFrom.prototype );
			//console.log( extFrom? extFrom.prototype : null );
			//Extracts the prototype object to extend from
			if(extFrom === Class) { //Class object
				//ignore root Class extension
			} else if( typeof(extFrom) === "function" ) { //Class function
				if( extFrom.prototype && extFrom.prototype instanceof Class ) {
					extFrom = extFrom.prototype; //Class function
				} else if( notStrict ) {
					extFrom = extFrom.prototype;
				} else {
					throw new Error("Class._extend() : provided function contains no valid prototype object, use [notStrict] parameter to ignore");
				}
			} else if( extFrom instanceof Class ) {
				//extending an object, ignores
			} else if( notStrict ) {
				extFrom = this; //not strick mode
			} else {
				throw new Error("Class._extend() : Can only run from valid Class Functions / object, without [extFrom / notStrict] parameter");
				//extFrom = Class; //Extends from class? (Graceful fallback??)
			}
			
			//Inner class obj constructor
			var _classObj = function() {  
				
				//creates a warning, for unintentional function calls. [does not work]
				//if(this.constructor != _classObj) {
				//	throw( new TypeError("Bad practice, Class object not called with 'new' parameter, could cause unintentional errors"));
				//}
				
				//Calls the init() function if it exists
				if( this["_init"] !== null && typeof(this["_init"]) === "function" ) {
					return ((this["_init"]).apply( this, arguments ) || this);
				}
				return this;
			};
			
			//Note: Object.create, is not working as expacted in all browsers : Hence this mini hack =)
			var proto = function() {};
			proto.prototype = extFrom;
			
			//if( Object.extend ) //{
			//	_classObj.prototype = Object.extend( new proto(), prop );
			//} else //{
				_classObj.prototype = (function extend(destination, source) {
					for (var property in source) {
						destination[property] = source[property];
					}
					return destination;
				})( new proto(), prop ); //inserts the property
			//}
			
			//this replace Object.create( extFrom, prop );
			if(_classObj._extend !== Class._extend) {
				_classObj._extend = Class._extend; //Easy _extend function
			}
			
			//console.log("ClassLog: ", { o: classObj, e:extFrom } );
			return _classObj; //Returns the class obj constructor
		};
	}
})();
