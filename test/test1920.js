if (typeof exports === 'object') {
	var assert = require('assert');
	var alasql = require('..');
}

describe('AlaSQL "->" denylist runtime bypass', function () {
	var data = [{a: 1}];

	it('blocks constructor via computed (Op-node) right-hand side', function () {
		assert.strictEqual(alasql('SELECT {}->("con"||"structor") AS probe FROM ?', [data])[0].probe, null);
	});

	it('does not leak a live Function via two computed hops', function () {
		var probe = alasql('SELECT {}->("con"||"structor")->("con"||"structor") AS probe FROM ?', [data])[0].probe;
		assert.notStrictEqual(typeof probe, 'function');
		assert.ok(probe == null, 'chained computed constructor traversal must not resolve to a value');
	});

	it('neutralizes the full stored-JS-execution payload', function () {
		var probe;
		try {
			probe = alasql(
				'SELECT {r:({f:({}->("con"||"structor")->("con"||"structor"))}->f("return \'MARKER-STRING\'"))}->r() AS probe FROM ?',
				[data]
			)[0].probe;
		} catch (e) {
			probe = null;
		}
		assert.notStrictEqual(probe, 'MARKER-STRING');
	});

	it('blocks __proto__ traversal via computed right-hand side', function () {
		assert.strictEqual(alasql('SELECT {}->("__pro"||"to__") AS probe FROM ?', [data])[0].probe, null);
	});

	it('blocks literal constructor read', function () {
		assert.strictEqual(alasql('SELECT {}->constructor AS probe FROM ?', [data])[0].probe, null);
	});

	it('rejects prototype-chain resolution of bare function calls', function () {
		assert.throws(function () { alasql('SELECT constructor("return 1") AS probe FROM ?', [data]); }, Error);
	});

	it('still allows normal property access via ->', function () {
		var rows = [{obj: {name: 'ok'}}];
		assert.strictEqual(alasql('SELECT obj->name AS n FROM ?', [rows])[0].n, 'ok');
	});
});
