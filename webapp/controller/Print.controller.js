sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, JSONModel) {
        "use strict";

        return Controller.extend("zinvoice.controller.Print", {
            onInit: function () {
                UIComponent.getRouterFor(this).getRoute('Print').attachPatternMatched(this._onRouteMatch, this);
            },
            _onRouteMatch: function (oEvent) {
                this.pdfPrint();
                var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
                this.getView().setModel(new JSONModel(), "oTableItemModel");
                this.getView().getModel('oTableItemModel').setProperty("/aTableItem", []);
                var oSettingObject = {
                    "editable": true,
                    "buttonVisible": true,
                    "buttonIrn": "Generate IRN",
                    "buttonEway": "Generate EwayBill & IRN",
                    "setEditable": true
                };
                this.getView().setModel(new JSONModel(oSettingObject), "oGenericModel");

                if(oCommonModel.getProperty('/displayObject').Action === "Print"){

                }

            },

            onRefresh: function () {
                location.reload();
            },

            onNav: function(){
                UIComponent.getRouterFor(this).navTo("Invoice");
                location.reload();
            },

            pdfPrint: function () {
                var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
                var invoice = oCommonModel.getProperty('/displayObject').BillDoc;
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                // var invoice = this.getView().byId("Orderfr").getValue();

                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?form=X&invoice=90000004";

                var url1 = "/sap/bc/http/sap/yeinv_http?";
                var url2 = "form=X&";
                var url3 = "invoice=";

                var url4 = url3 + invoice;

                var url = url1 + url2 + url4;

                var username = "ZEINV_USER";
                var password = "rmJqnvkrxzCb@EbkKMSzswFbEdMSmUnDUGcZXJ4E";
                $.ajax({
                    url: url,
                    type: "GET",
                    beforeSend: function (xhr) {
                        xhr.withCredentials = true;
                        xhr.username = username;
                        xhr.password = password;
                    },
                    success: function (result) {
                        var decodedPdfContent = atob(result);
                        var byteArray = new Uint8Array(decodedPdfContent.length);
                        for (var i = 0; i < decodedPdfContent.length; i++) {
                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray.buffer], {
                            type: 'application/pdf'
                        });
                        var _pdfurl = URL.createObjectURL(blob);

                        if (!this._PDFViewer) {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                        }
                        oBusyDialog.close();
                        this._PDFViewer.open();
                    }.bind(this)
                    
                });
            },

            onReload: function () {
                setTimeout(function(){
                    window.location.reload();
                 }, 29000);
            },

            onExit: function(){
                window.location.reload();
            }

        });
    });
