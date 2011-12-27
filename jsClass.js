/********************************************************************************************************************************************************** 
source code
-name:	jsClass
-type: 	javascript	: global self loading script (Not JSON-Script compliant)
-vers:	Beta 1.3 (27 Decm 2011)
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
	> [notStrict] :	Set to true, if the [extFrom] is not a 'Class' object / function. 
					(it will throw an error otherwise)

-Main refrences:
http://ejohn.org/blog/simple-javascript-inheritance/

-Change log
Beta 1.30 : 27 Decm 2011	: Fixed the bug again (in deeper nested _super calls)
Beta 1.20 : 24 Decm 2011	: Fixed an _origin bug on nested _super calls
Beta 1.01 :	07 Sept 2011	: Allow constructors to overide the return value, by returning a non-null value.

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
	+ An exception is given for using this on a live deployment, (eg, using this for your blog in the background) in which crediting every single page may be impractical (even for commercial sites). 
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
			
			var _origin = this; //pesky line number bug -.-"
			
			//Gets the object in the prototype chain which called _super() [Search Function]
			while( _callName === null ) {
				for( var p in _origin ) {
					if(_origin[p] == _caller) {
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
	* [extFrom] should be the class function, or its prototype object to inherit from
	* Set notStrict = true, to skip check if derived Object is not instanceof Class.
	**/
	if(!Class._extend) {
		Class._extend = function( prop, extFrom, notStrict ) {
			//"use strict"; //strict mode
			if(!extFrom) { 
				extFrom = this;	
			} 
			
			//console.warn( prop.n, 'a', extFrom.prototype );
			
			//Extracts the prototype object to extend from
			if(extFrom instanceof Class || extFrom === Class) { //Class object
				//Uses object directly as ref
			} else if( typeof(extFrom) === "function" ) { //Class function
				if( extFrom.prototype && extFrom.prototype instanceof Class ) {
					extFrom = this.prototype; //Class function
				} else if( notStrict ) {
					extFrom = this.prototype;
				} else {
					throw new Error("Class._extend() : provided function contains no valid prototype object, use [notStrict] parameter to ignore");
				}
			} else if( notStrict ) {
				extFrom = this; //not strick mode
			} else {
				throw new Error("Class._extend() : Can only run from valid Class Functions / object, without [extFrom / notStrict] parameter");
				//extFrom = Class; //Extends from class? (Graceful fallback??)
			}
			
			//obsolete??
			/*
			//Its a function (Class) object, gets the "prototype"
			if( typeof(extFrom) === "function" && extFrom.prototype ) {
				if( extFrom.prototype instanceof Class ) {
					extFrom = extFrom.prototype;
				} else if( notStrict ) {
					extFrom = extFrom.prototype;
				} else {
					throw new Error("Class._extend() : [extFrom] function contains no valid prototype object, use [notStrict] parameter to ignore");
				}
			}
			
			//Checks if its a valid object
			if( Object( extFrom ) === extFrom ) {
				if(!notStrict) { //strict mode
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
			*/
			
			if(!extFrom == null) {
				if( notStrict ) {
					extFrom = Class; //silent fallback?
				} else {
					throw new Error("Class._extend() : Failed to obtain the extFrom parameter");
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
					var _ret = (this["_init"]).apply( this, arguments );
					if(_ret) { return _ret; }
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
