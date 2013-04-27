(function(ns) {
	var equal = ns.qunit.equal, expect = ns.qunit.expect, test = ns.qunit.test;

	/**
	 * Test that the setText method sets the text in the #helloWorld div
	 */
	test("Test inheritance", function() {

		var Shape = A.Class.extend(function(x, y) {
			this.x = x;
			this.y = y;
		});
		Shape.method('print', function() {
			console.log('X=' + x + ' Y=' + y);
			return this
		});

		var Rectangel = Shape.extend(function(x, y, x1, y1) {
			Shape.call(x, y);
			this.x1 = x1;
			this.y1 = y1;
		});
		Rectangel.method('print', function() {
			this.invokesuper('print');
			console.log(' X1=' + x1 + ' Y1=' + y1 + ' A=' + angle);
			return this
		});
		Rectangel.method('resize', function(w, h) {
			x1 = x + w;
			y1 = y + h
		});

		var Transform = A.Class.extend(function(angle) {
			this.angle = x;
		});
		Rectangel.mixin(Transform);

		var shape = new Shape(10, 10);

		var rect = new Rectangel(20, 20, 40, 40);
		rect.print();

		// Expect that the text was set on the expected element
		/*
		 * equal($("#helloWorld #helloMessage").text(), magicWord, "Expected
		 * text not set in '#helloWorld #helloMessage' div");
		 */
	});

}(this));