/* 
License:
You can use and/or modify Tagify as long as you leave this notice at the top.
Tagify project page: http://projects.functino.com/tagify/
*/
var Tagify = Class.create({
	initialize: function(input, options){
		
		this.input = $(input);
		this.options = Object.extend(Object.clone(Tagify.OPTIONS), options || {});
		
		this.element = new Element("div", {"class": this.options.className});
		
		// this regular expressions are used to retrieve/split the tags
		this.matchRegExp = new RegExp("[" + this.options.splitBy + "]"); 
		this.splitByRegExp = new RegExp("[^" + this.options.splitBy + "]+");
		
		// warp the input element with our div		
		this.input.wrap(this.element);

		// determine the name of the hidden-fields for the tags
		// defaults to the name of this.input appended by "_tagified[]"
		if(this.options.parameterName)
		{
			this.input_name = this.options.parameterName + "[]";
		}
		else
		{
			this.input_name = this.input.readAttribute('name') + "_tagified[]";	
		}
		
		this.options.add.each(function(it){
			this.add(it);
		}.bind(this));

		// check if there are already tags
		this._parseTags();

		// listener for backspace => remove an element
		this.input.observe('keydown', function(ev){
			if(ev.keyCode == 8 && ev.element().value.length == 0)
			{
				this._removeLast();
			}	
		}.bind(this));
		
		// after each keypress check for tags
		this.input.observe('keyup', function(ev){
			var text = ev.element().value;
			if(this.matchRegExp.test(text))
			{
				this._parseTags();	
			}
		}.bind(this));
		
		// add input value as a tag onBlur
		this.input.observe('blur', this._parseTags.bind(this));
		
		// the whole tagify-control should act as input
		this.element.observe('click', function(){
			this.input.focus();
		}.bind(this));
	},
	//adds a tag 
	add: function(word){
		
		// remove white spaces
		if(this.options.strip)
		{
			word = word.strip();
		}
		
		if(word.length == 0)
		{
			return false;
		}

		//check for duplicates		
		if(this.options.duplicates == false)
		{
			// search for the tag
			var el = this.element.select("span." + this.options.className + " input").find(function(input){
				if(input.value == word)
				{
					return true;
				}
				return false;
			});
			// use duplicateEffect if a duplicate was found
			if(el != undefined)
			{
				new this.options.duplicateEffect(el.up(), this.options.duplicateEffectOptions);
				return false;
			}					
		}
		
		// add element for the tag
		var span = (new Element("span", {"class": this.options.className})).update(word);
		// add the remove-handle
		var span_remove = new Element("span", {"class": this.options.className + "_remove"});
		span_remove.observe('click', function(ev){
			this._remove(ev.element().up()); // remove the parent of this clicked "handler-span"						
		}.bind(this));
		
		span.insert({bottom: span_remove});
		span_remove.insert({after:' '});
		this.input.insert({before: span});
	
		// add the hidden input field
		span.insert(new Element('input', {"type":"hidden", "class":this.options.className, name:this.input_name, value:word}));

		if(this.options.addEffect)
		{
			new this.options.addEffect(span, this.options.addEffectOptions);	
		}
		return true;
	},
	// searchs and removes the last added tag
	_removeLast: function(){
		var elements = $(this.element).select('span.' + this.options.className);
		if(elements.length > 0)
		{
			this._remove(elements[elements.length-1]);
		}
	},
	// remove a tag / element 
	_remove: function(el){
		// if theres an effect fire it
		if(this.options.removeEffect)
		{
			this.options.removeEffectOptions.afterFinish  = function(){
				el.remove();
			};
			new this.options.removeEffect(el, this.options.removeEffectOptions);
		}
		else
		{
			el.remove();
		}
	},
	_parseTags: function(){
		this.input.value.scan(this.splitByRegExp, function(t){
			this.add(t[0]);
		}.bind(this));
		this.input.value= "";			
	}	
});

Tagify.OPTIONS = {
	splitBy: [",;"], // String of seperators for tags
	duplicates: true, // allow or disallow duplicates
	strip: true, // strip/trim text
	parameterName: false, // name-attribute of the generated hidden input-elements, defaults to the name of the input + _tagified[]
	className: "tagify", // css-class name
	add:[], // default tags
	removeEffect: false, // effect on removal of a tag
	removeEffectOptions: {}, // options for the effect
	addEffect:false, // effect for new tags
	addEffectOptions: {},
	duplicateEffect: Effect.Highlight, // effect if a duplicate is typed in
	duplicateEffectOptions: {}
}