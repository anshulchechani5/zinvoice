/*global QUnit*/

sap.ui.define([
	"zinvoice/controller/Invoice.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Invoice Controller");

	QUnit.test("I should test the Invoice controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
