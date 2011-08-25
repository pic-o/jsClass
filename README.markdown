jsCompatible
============
Provides class functionalities for javascript



Please ensure jsCompatible, is loaded prior to this script, to make this cross-client safe 
[http://pic-o.com/blog/2011/08/jscompatible/]

Usage
-----
Just include it inside your html/php file, before any other .js file.

> `<script type="text/javascript" src="jsCompatible.js"></script>`
> `<script type="text/javascript" src="jsClass.js"></script>`

Example?
--------

	var testClass = Class._extend( {
		
		"_init" : function( ext ) { 

			//This is the constructor, default value + ext?
			
			this.attribute = this.attribute + ext; 
		
		},
		
		 
		
		//attributes/properties
		
		"test" : function() { 
			console.log(arguments); 
		},
		
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

Short-Story
-----------
This was heavily influenced by John Resig javascript wonderfully done class system [http://ejohn.org/blog/simple-javascript-inheritance/]. However i felt many things were unneeded (personal oppinion), from initializing a shared boolean flags (that i suspect might break in multi-core javascript future), to the attachment of super functions, instead of a dynamic _super call (that still works when the parent function gets changed).

With heavy experimentation, this substitude version was created.

As of now, and in fact to most people, there may not be any differance between the 2. Other then the constructor/super class changes, such as from "init" to "_init" (I believe constructors should be 'private' after used).

In theory, there may be memory benefits, and a downside of wasted ops cycle during long chains of _super calls. However, im just glad that i manage to get this to work, relatively bug free (after much experimentation, learning and struggle). So i would leave the actual comparision to others =) [Let me know if there ever was a performance comparision]

Syntax?
-------
When _extend / extending classes, note the following in your class object :

+ _init : 	This is a constructor function
+ this._super:	Works just like normal super() calls.

Additionally, the _extend function has other uses (which i do not gurentee)

+ Class._extend( [prop], [extFrom], [notStrict] ) ...
+ 
+ [prop] :Object to pass, to use as class properties.
+ [extFrom] :	Object / Class function to extend from.
+ [notStrict] :	Set to true, if the [extFrom] is not a 'Class' object. (it will throw an error otherwise)

License?
--------
### author:		
picoCreator AKA Eugene Cheah
### email:
pico.creator{at}gmail.com
### website:		
www.pic-o.com/blog
### copyright:	
cc by (CreativeCommons Attribution licenses)
[http://creativecommons.org/licenses/by/3.0/]
### cc notes:
+ Crediting me (Eugene Cheah AKA picoCreator) is required for derivatives of this work, UNLESS...
+ An exception is given for using this on a live website, (eg, using this for your blog in the background) 
in which crediting every single source file directly may be impractical (even for commercial sites). 
However this exception is only given if you drop me an email, with the link to deployment.
+ This exception however does not hold in any source release of which this code is used (Its stated in the cc license btw), hence credit should be given in this case.
+ These license requirments would be applied to all forks / merges / derivatives, of this work.

### additional notes:
I may update to add an additional open source licenses in the future / on requested =)

Remember to drop an email if you are using this for a live site, ty. (for my curiosity, to see where this code goes)