var u = require('util');
var R = require('ramda');
var pp = require('prettyjson');

var Dataset = require('./dataset');
var Type = require('./type');


// create hash from a bunch of things
var crypto = require('crypto');

var hashOf = function(things){
	var shasum = crypto.createHash('sha224');
	things.forEach(function(x){
		shasum.update(x);
	});
	return shasum.digest('base64');
}


/*	Ensure string arguments are converted into normal form

	dataset ~> Dataset
	type ~> Type
*/
var normalize = function(f) {
	return function(d, ty, id, doc)
	{
		var dataset = Dataset.cget(d);
		var type = Type.cget(ty);
		
		if(type.isEdge){
			// we are dealing with an edge, lookup source/targets
			var s = doc[type.opts.source];
			var t = doc[type.opts.target];
		
			if(!s)
				throw new Error(u.format("Missing source field '%s'", type.opts.source));
		
			if(!t)
				throw new Error(u.format("Missing target field '%s'", type.opts.target));
		
			var source_id = dataset.normalizeId(s);
			var target_id = dataset.normalizeId(t);

			// if no id is specified, build one
			var canonical_id = id || hashOf([
				source_id.replace('/', '.'),
				type.name,
				target_id.replace('/', '.')				
			]);

			return f(dataset, type, dataset.normalizeId(canonical_id), source_id, target_id, doc);		
		}
		
		if(type.isNode){
			if(!id)
				throw new Error('Must specify id when creating a node!');
			return f(dataset, type, dataset.normalizeId(id), undefined, undefined, doc);		
		}
	} 
}

exports.ES_map = normalize(
	function(dataset, type, id, _, _, doc) {
		var body 
		return {
			index: dataset.root,
			type: type.name,
			id: id,
			body: body
		};
	}
);

exports.Neo_map = normalize(
	function(dataset, type, id, source_id, target_id, doc) {

		var base = {
			labels: [
				'T_' + type.name, // double function: ES type, Node Type
				'I_' + dataset.name, // subdataset owning this element
				'__' // meaning, this is a managed node
			],
			params: doc,
			id: id,
			source_id: source_id,
			target_id: target_id
		};

		// add edge info
		if(type.isEdge) {
			base.source = source_id;
			base.target = target_id;
		}
		
		return base;
	}	
);

exports.map = function(dataset, type, id, doc){
	return {
		ES: exports.ES_map(dataset, type, id, doc),
		Neo: exports.Neo_map(dataset, type, id, doc)
	}
}