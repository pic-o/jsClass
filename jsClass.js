/********************************************************************************************************************************************************** 
source code
-name:	jsClass
-type: 	javascript	: global self loading script (Not JSON-Script compliant)
-vers:	Beta 1 (02 Aug 2011)
-Discription:
Provides class functionalities for javascript

Please ensure jsCompatible, is loaded prior to this script, to make this cross-client safe
[http://pic-o.com/blog/2011/08/jscompatible/]

-Usage:
	var testClass = Class._extend( {
		"_init" : function( ext ) { 
			//This is the constructor, default value + ext?
			this.attribute = this.attribute + ext; 
		},
		
		 //attributes/properties
		"test" : function() { console.log(arguments); },
		"attribute" : "hello",
	} );
	var c = new testClass( " world" );
	c.test( c.attribute );
	var extClass = testClass._extend( {
		"test" : function() { this._super( "Good Bye" ); }
	} );
	var e = new extClass();
	e.test();
	
	if( e instanceof testClass && extClass.prototype instanceof Class ) {
		console.log('instance of works');
	}

-Syntax?:
	When _extend / extending classes, note the following in your class object :

	> _init : 	This is a constructor function
	> this._super:	Works just like normal super() calls.

	Additionally, the _extend function has other uses (which i do not gurentee)

	> Class._extend( [prop], [extFrom], [notStrict] ) ...
	> 
	> [prop] :	Object to pass, to use as class properties.
	> [extFrom] :	Object / Class function to extend from.
	> [notStrict] :	Set to true, if the [extFrom] is not a 'Class' object. (it will throw an error otherwise)

-Main refrences:
http://ejohn.org/blog/simple-javascript-inheritance/

-ToDo:
-future suggestion:
-BUGS:
//Extending, and instanceof of classes are not functioning as expected
-documentation:		
*************************************************************** Author Details & CopyRight ****************************************************************
author: 	picoCreator
email:		pico.creator@gmail.com
website:	blog.pic-o.com
copyright:	cc by [CreativeCommons Attribution licenses]
			http://creativecommons.org/licenses/by/3.0/

cc notes:	
	+ Crediting me (Eugene Cheah AKA picoCreator) is required for derivatives of this work, UNLESS...
	+ An exception is given for using this on a live website, (eg, using this for your blog in the background) in which crediting every single source file directly may be impractical (even for commercial sites). 
	However this exception is only given if you drop me an email, with the link to deployment.
	+ This exception however does not hold in any source release of which this code is used (Its stated in the cc license btw), hence credit should be given in this case.
	+ These license requirments would be applied to all forks / merges / derivatives, of this work.

additional notes:
	+ I may update to add an additional open source licenses in the future / on requested =)
	+ Remember to drop an email if you are using this for a live site, ty. (for my curiosity, to see where this code goes)
**********************************************************************************************************************************************************/

/*****************************************
* Javascript class engine [Function run] *
*****************************************/
(function(){
	/**
	* The shared class caller, that triggers init / etc
	**/
	if(!this.Class) {
		this.Class = function Class() {};
	}
	
	/**
	* Allows instanceof to work as intended
	**/
	Class.prototype = Class;
	
	/**
	* Searches on the prototype chain, for the function which called it. 
	* Followed by checking and calling its _super() equivalent.
	**/
	if(!Class._super) {
		Class._super = function _super() {
			//"use strict"; //strict mode does not allow caller calls, lol
			
			//Gets the function caller for _super()
			
			//Non working, over the top version, lol
			//_caller = (arguments && ( arguments.caller || (arguments.callee && arguments.callee.caller))) || (_super && ( _super.caller || (_super.arguments && _super.arguments.caller)));
			var _caller  = ((_super && _super.caller) || (arguments && ( arguments.caller || (arguments.callee && arguments.callee.caller))) );
			
			if(_caller === null) {
				throw( new TypeError("Class._super(): Failed to get calling function : Caller fetch not supported!") );
			}
			
			//Finds teh caller name
			var _callName = null;
			
			//Gets the object in the prototype chain which called _super() [Search Function]
			while( _callName === null ) {
				for( var p in this ) {
					if(this[p] == _caller) {
						_callName = p;
					}
				}
				
				if( _callName === null ) { //try again?: it maybe a nested _super
					_origin = Object.getPrototypeOf( _origin );
					if( _origin === null) {
						throw( new TypeError("Class._super(): calling function not found in Class Object") );
						return;
					}
				}
			}
			
			//Gets the prototype object
			var _origin = this;
			var _proto = null;
			while( _proto === null ) {
				if( _origin.hasOwnProperty( _callName ) && _origin[_callName] == _caller ) {
					_proto = Object.getPrototypeOf( _origin );
				} else {
					_origin = Object.getPrototypeOf( _origin );
					
					if( _origin === null ) {
						throw( new TypeError("Class._super(): Class object has no prototype to call _super() for :"+_callName) );
						return;
					}	//Fail to find error : Due to inproper usage?
				}
			}
			
			//Calls it out
			if( typeof(_proto[_callName]) === "function" ) {
				return (_proto[_callName]).apply( this, arguments ); //Calls it
			} else {
				throw( new TypeError("Class._super(): Fail to find _super() target in __proto__ for: "+_callName) );
			}
		};
	}
	
	/**
	* Extends a Class from its object, or Constructor prototype object.
	* Set notStrict = true, to skip check if derived Object is not instanceof Class.
	**/
	if(!Class._extend) {
		Class._extend = function( prop, extFrom, notStrict ) {
			//"use strict"; //strict mode
			if(!extFrom) { 
				//Extends from self by default, else extends from class
				if( this.prototype && this.prototype instanceof Class) { //Class function
					extFrom = this.prototype; //Uses function proto as ref
				} else if(this instanceof Class || this === Class) { //Class object
					extFrom = this; //Uses object as ref
				} else {
					throw new Error("Class._extend() : Can only run from valid Class Functions, without [extFrom] parameter");
					return;	//Breaks
					//extFrom = Class; //Extends from class? (Graceful fallback??)
				}
				
			} else {
				
				//Its a function (Class) object, gets the "prototype"
				if( typeof(extFrom) === "function" && extFrom.prototype ) {
					extFrom = extFrom.prototype;
				}
				
				//Checks if its a valid object
				if( Object( extFrom ) === extFrom ) {
					if(!notStrict) {
						if( !(extFrom === Class || extFrom instanceof Class) ) {
							//It is not a class object, and strict inheritence is enforced
							throw( new Error("Class._extend(): Extension target is not a Class object [set notStrict = true, to skip Class check]") );
							return; //extFrom = Class; //Sets to default Class as a graceful fallback??
						}
					}
				} else {
					throw( new Error("Class._extend(): Extension object (or function prototype), Must be atleast an object") );
					return;
					//extFrom = Class;
				}
			}
			
			//Inner class obj constructor
			var _classObj = function() {  
				
				//creates a warning, for unintentional function calls. [does not work]
				/*
				if(this.constructor != _classObj) {
					console.warn(""+this+" : Bad practice, Class object not called with 'new' parameter, could cause unintentional errors");
					//return new _classObj();
				}
				*/
				
				//Calls the init() function if it exists
				if( this["_init"] !== null && typeof(this["_init"]) === "function" ) {
					//console.log("runinit");
					return (this["_init"]).apply( this, arguments );
				}
				return this;
			};
			
			//Note: Object.create, is not working as expacted in all browsers : Hence this mini hack =)
			var proto = function() {};
			proto.prototype = extFrom;
			_classObj.prototype = Object.extend( new proto(), prop );
			//this replace Object.create( extFrom, prop );
			_classObj._extend = Class._extend;	//Easy _extend function

			return _classObj; //Returns the class obj constructor
		};
	}
	
})();
