sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    'sap/m/SearchField',
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent, JSONModel, SearchField,MessageBox) {
        "use strict";

        return Controller.extend("zinvoice.controller.Invoice", {
            onInit: function () {
                var companycode = {
                    comcode: "1000"
                };
                var oModel = new JSONModel({
                    dDefaultDate: new Date()
                });
                this.getView().setModel(oModel, "view");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(companycode), "oCommonModel");
                UIComponent.getRouterFor(this).getRoute('Invoice').attachPatternMatched(this._onRouteMatch, this);
                this.getOwnerComponent().setModel(new JSONModel(), "dataModel");

                var oInvoicetype = {
                    invoiceType: [
                        {
                            Key: 1,
                            Description: "Sales Invoice"
                        }, 
                        {
                            Key: 2,
                            Description: "Finance Invoice"
                        }
                    ]
                }
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(oInvoicetype), "oInvoiceModel")

                var oObject = {
                    "visible": false,
                    "visible1":false,
                }
                this.getView().setModel(new JSONModel(oObject), "oVisibleObject")
            },

            _onRouteMatch: function (oEvent) {

            },

            handleRefresh: function () {
                setTimeout(function () {
                    this.byId("pullToRefresh").hide();
                }.bind(this), 1000);
            },

            onSelect: function () {
                var value = this.getView().byId("idComboBox").getValue();

                if (value === "Finance Invoice") {
                    this.getView().getModel("oVisibleObject").setProperty("/visible", true)  
                }
                else {
                    this.getView().getModel("oVisibleObject").setProperty("/visible", false)
                   
                    
                }
            },
            onChangeAction:function(){
                var value = this.getView().byId("idActionRadioBtnGroup").getSelectedButton().getText();

                if (value === "Print" || value === "Transporter Print") {
                    this.getView().getModel("oVisibleObject").setProperty("/visible1", true)
                } else {
                    this.getView().getModel("oVisibleObject").setProperty("/visible1", false)
                }
            },

            next: function () {
                var FiscalYear = this.getView().byId("idDate").getValue();
                var companycode = this.getView().byId("id_comboBox").getValue();
                var billdoc = this.getView().byId("Orderfr").getValue();
                var radiobutton = this.getView().byId("idActionRadioBtnGroup").getSelectedButton().getText();
                var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
                var oComboBox = this.getView().byId("idComboBox").getValue();
                var oInvoiceType = {
                    InvoiceType: oComboBox
                }
                oCommonModel.setProperty("/invoiceObject", oInvoiceType)
                var oDisplay = {
                    BillDoc: billdoc,
                    Action: radiobutton,
                    FiscalYear: FiscalYear,
                    companycode:companycode

                };
                oCommonModel.setProperty('/displayObject', oDisplay);
                if (radiobutton == "Generate" && oComboBox === "Sales Invoice") {
                    UIComponent.getRouterFor(this).navTo("InvoiceDetails");
                }
                if (radiobutton === "Generate" && oComboBox === "Finance Invoice") {
                    UIComponent.getRouterFor(this).navTo("FinanceInvoice");
                }
                else if (radiobutton == "Display" && oComboBox === "Sales Invoice" ) {
                    UIComponent.getRouterFor(this).navTo("InvoiceDetails");
                }
                else if (oComboBox === "Finance Invoice" && radiobutton === "Display") {
                    UIComponent.getRouterFor(this).navTo("FinanceInvoice");
                }
                else if (oComboBox === "Finance Invoice" && radiobutton === "Cancel") {
                    UIComponent.getRouterFor(this).navTo("Financecancel");
                }
                else if (radiobutton == "Cancel" && oComboBox === "Sales Invoice"  ) {
                    UIComponent.getRouterFor(this).navTo("Cancel");
                } 
                else if (radiobutton == "Print"  ) {
                    this.pdfPrint();
                    // UIComponent.getRouterFor(this).navTo("Print");
                }
                else if (radiobutton == "Json"  ) {
                    UIComponent.getRouterFor(this).navTo("json");
                }
                else if (radiobutton == "Transporter Print"  ) {
                    this.pdfP3();
                    
                }

                

            },

            pdfP3: function () {
                var oModel = this.getView().getModel();
                var remark = this.getView().byId("remark").getValue();
                var oInvoiceType = this.getView().byId("idComboBox").getValue();
                var FiscalYear = this.getView().byId("idDate").getValue();
                var companycode = this.getView().byId("id_comboBox").getValue();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var invoice = this.getView().byId("Orderfr").getValue();
                // var invoiceto = this.getView().byId("Orderto").getValue();
                invoice = invoice.toUpperCase();
                // invoiceto = invoiceto.toUpperCase();
                console.log(invoice);
                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?form=X&invoice=90000004";

                var transport = "X";

                var url1 = "/sap/bc/http/sap/yeinv_http?";
                var url2 = "form=X&";
                var url3 = "invoice=";
                var url7 = "&Transporter=";
                var url4 = "&invoicetype=";
                var url10 = "&companycode=";
                var url22 ="&remark=";
                var url5 = url3 + invoice; 
                var url8 = url7 + transport; 
                var url6 = url4 + oInvoiceType;
                var url11 = url10 + companycode;
                var url23 = url22 + remark;
                var url = url1 + url2 + url5 + url6 + url8 + url11 +url23;

                var username = "ZEINV_USER";
                var password = "rmJqnvkrxzCb@EbkKMSzswFbEdMSmUnDUGcZXJ4E";
                $.ajax({
                    url: url,
                    cache: false,
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
                            // this._PDFViewer.removeAllPopupButtons();
                        } else {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                        }
                        oBusyDialog.close();

                        this._PDFViewer.open();
                    }.bind(this)

                });
            },

            pdfPrint: function () {
                
                
                    var oInvoiceType = this.getView().byId("idComboBox").getValue();
                    if (oInvoiceType === "Finance Invoice") {
                        this.pdfPrint1();
                    } else {
                                //  var remark = this.getView().byId("remark").getValue();
                                //    if(remark ===""){
                                //           MessageBox.error("Please Enter Remark");
                                //      }
                                    //  else{
                                        this.pdfPrint2();
                                    //  }
                                
                    }
                
               
            },

            pdfPrint1: function () {
                var oModel = this.getView().getModel();
                var oInvoiceType = this.getView().byId("idComboBox").getValue();
                var FiscalYear = this.getView().byId("idDate").getValue();
                var remark = this.getView().byId("remark").getValue();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var invoice = this.getView().byId("Orderfr").getValue();
                var companycode = this.getView().byId("id_comboBox").getValue();
                var invoiceto = this.getView().byId("Orderfr1").getValue();
                invoice = invoice.toUpperCase();
                invoiceto = invoiceto.toUpperCase();
                console.log(invoice);
                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?form=X&invoice=90000004";

                var url1 = "/sap/bc/http/sap/yeinv_http?";
                var url2 = "&form=X&";
                var url3 = "invoice=";
                var url10 ="&invoiceto=";
                var url9 = "&companycode=";
                var url4 = "&invoicetype=";
                var url5 = "&year=";
                var url22 ="&remark=";

                var url6 = url3 + invoice;
                var url11 = url10 + invoiceto;
                var url10 = url9 + companycode;
                var url7 = url4 + oInvoiceType;
                var url8 = url5 + FiscalYear;
                var url23 = url22 + remark;

                var url = url1 + url2 + url6 + url11 + url7 + url8 + url10 +url23;

                var username = "ZEINV_USER";
                var password = "rmJqnvkrxzCb@EbkKMSzswFbEdMSmUnDUGcZXJ4E";
                $.ajax({
                    url: url,
                    cache: false,
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
                            // this._PDFViewer.removeAllPopupButtons();
                        } else {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                        }
                        oBusyDialog.close();

                        this._PDFViewer.open();
                    }.bind(this)

                });
            },

            pdfPrint2: function () {
                var oModel = this.getView().getModel();
                var oInvoiceType = this.getView().byId("idComboBox").getValue();
                var FiscalYear = this.getView().byId("idDate").getValue();
                var remark = this.getView().byId("remark").getValue();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var invoice = this.getView().byId("Orderfr").getValue();
                var companycode = this.getView().byId("id_comboBox").getValue();
                var invoiceto = this.getView().byId("Orderfr1").getValue();
                invoice = invoice.toUpperCase();
                invoiceto = invoiceto.toUpperCase();
                console.log(invoice);
                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?form=X&invoice=90000004";

                var url1 = "/sap/bc/http/sap/yeinv_http?";
                var url2 = "&form=X&";
                var url3 = "&invoice=";
                var url10 ="&invoiceto=";
                var url7 = "&companycode=";
                var url4 = "&invoicetype=";
                var url21 ="&remark=";

                var url5 = url3 + invoice;
                var url22 = url10 + invoiceto;
                var url8 = url7 + companycode;
                var url6 = url4 + oInvoiceType;
                var url23 = url21 +remark;

                var url = url1 + url2 + url5 + url22 + url6 + url8 + url23 ;

                var username = "ZEINV_USER";
                var password = "rmJqnvkrxzCb@EbkKMSzswFbEdMSmUnDUGcZXJ4E";
                $.ajax({
                    url: url,
                    cache: false,
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
                            // this._PDFViewer.removeAllPopupButtons();
                        } else {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                        }
                        oBusyDialog.close();

                        this._PDFViewer.open();
                    }.bind(this)

                });
            },

            handlef4: function () {

                var idComboBox = this.getView().byId("idComboBox").getValue();

                if (idComboBox === 'Sales Invoice') {
                    this.SDINVOICE();
                }
                else {
                    this.FIINVOICE();
                }



            },
            SDINVOICE: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                
                var oInput1 = this.getView().byId("Orderfr");

                if (!this._oValueHelpDialog1) {
                    this._oValueHelpDialog1 = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("Orderfr", {
                        supportMultiselect: false,
                        supportRangesOnly: false,
                        stretch: sap.ui.Device.system.phone,
                        keys: "Orderid",
                        descriptionKey: "Orderid",
                        filtermode: "true",
                        enableBasicSearch: "true",
                        ok: function (oEvent) {
                            var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.BillingDocument;
                            oInput1.setValue(valueset);
                          
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }


                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    filterBarExpanded: false,
                    filterBarExpanded: true,
                    enableBasicSearch: true,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "BillingDocument", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "BillingDocumentItem", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n3", label: "CustomerName", control: new sap.m.Input() })],




                    search: function (oEvt) {
                        oBusyDialog.open();
                        //  var oParams = oEvt.getParameter("YY1_PACKINGTYPE");
                        var BillingDocument = oEvt.mParameters.selectionSet[0].mProperties.value;
                        var BillingDocumentItem = oEvt.mParameters.selectionSet[1].mProperties.value;
                        var CustomerName = oEvt.mParameters.selectionSet[2].mProperties.value;
                        //  sap.m.MessageToast.show("Search pressed '");

                        // if threee no  values 
                        if (BillingDocument === "" && BillingDocumentItem === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS"
                            });
                        }

                        //    if BillingDocument  value is insert then search  under block
                        else if (BillingDocumentItem === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument)]
                            });
                        }

                        //    if BillingDocumentItem  value is insert then search under block
                        else if (BillingDocument === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem)]
                            });
                        }
                        //    if CustomerName  value is insert then search under block
                        else if (BillingDocumentItem === "" && BillingDocument === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        //    if CustomerName is blank only
                        else if (CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument),
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem)]
                            });
                        }
                        //    if BillingDocumentItem is blank only 
                        else if (BillingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument),
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        //    if BillingDocument is blank only 
                        else if (BillingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem),
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        oBusyDialog.close();
                    }
                });

                this._oValueHelpDialog1.setFilterBar(oFilterBar);
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "BillingDocument", template: "BillingDocument" },
                        { label: "BillingDocumentItem", template: "BillingDocumentItem" },
                        { label: "CustomerName", template: "CustomerName" }
                    ]
                });
                var oTable = this._oValueHelpDialog1.getTable();
                oTable.setModel(oColModel, "columns");
                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/YINVOICE");
                oTable.setModel(oModel);
                oBusyDialog.close();
                this._oValueHelpDialog1.open();
            },
            FIINVOICE: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oInput1 = this.getView().byId("Orderfr");
                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("Orderfr", {
                        supportMultiselect: false,
                        supportRangesOnly: false,
                        stretch: sap.ui.Device.system.phone,
                        keys: "Orderfr",
                        descriptionKey: "Orderfr",
                        filtermode: "true",
                        ok: function (oEvent) {
                            var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.AccountingDocument;
                            oInput1.setValue(valueset);
                            this.close();
                        },
                        
                        cancel: function () {
                            this.close();
                            
                        }
                    });
                }


                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    // filterBarExpanded: false,
                    filterBarExpanded: true,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "AccountingDocument", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "AccountingDocumentItem", control: new sap.m.Input() }),
                    ],

                    search: function (oEvt) {
                        oBusyDialog.open();
                        // var oParams = oEvt.getParameter("YY1_PACKINGTYPE");
                        var AccountingDocument = oEvt.mParameters.selectionSet[0].mProperties.value;
                        var AccountingDocumentItem = oEvt.mParameters.selectionSet[1].mProperties.value;

                        // sap.m.MessageToast.show("Search pressed '");
                        // if two no  values 
                        if (AccountingDocument === "" && AccountingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata"
                            });
                        }

                        //    if AccountingDocumentItem  value is insert then search  under block
                        else if (AccountingDocument === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata", filters: [
                                    new sap.ui.model.Filter("AccountingDocumentItem", sap.ui.model.FilterOperator.Contains, AccountingDocumentItem)]
                            });
                        }

                        //    if AccountingDocument value is insert then search  under block
                        else if (AccountingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata", filters: [
                                    new sap.ui.model.Filter("AccountingDocument", sap.ui.model.FilterOperator.Contains, AccountingDocument)]
                            });
                        }

                        oBusyDialog.close();
                    }
                });

                this._oValueHelpDialog.setFilterBar(oFilterBar);
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "AccountingDocument", template: "AccountingDocument" },
                        { label: "AccountingDocumentItem", template: "AccountingDocumentItem" },

                    ]
                });
                var oTable = this._oValueHelpDialog.getTable();
                oTable.setModel(oColModel, "columns");
                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/YINVOICE");
                oTable.setModel(oModel);
                oBusyDialog.close();
                this._oValueHelpDialog.open();
            },

            handlef41: function () {

                var idComboBox = this.getView().byId("idComboBox").getValue();

                if (idComboBox === 'Sales Invoice') {
                    this.SDINVOICE1();
                }
                else {
                    this.FIINVOICE1();
                }



            },
            SDINVOICE1: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                
                var oInput1 = this.getView().byId("Orderfr1");

                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("Orderfr1", {
                        supportMultiselect: false,
                        supportRangesOnly: false,
                        stretch: sap.ui.Device.system.phone,
                        keys: "Orderid",
                        descriptionKey: "Orderid",
                        filtermode: "true",
                        enableBasicSearch: "true",
                        ok: function (oEvent) {
                            var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.BillingDocument;
                            oInput1.setValue(valueset);
                          
                            this.close();
                        },
                        cancel: function () {
                            this.close();
                        }
                    });
                }


                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    filterBarExpanded: false,
                    filterBarExpanded: true,
                    enableBasicSearch: true,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "BillingDocument", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "BillingDocumentItem", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n3", label: "CustomerName", control: new sap.m.Input() })],




                    search: function (oEvt) {
                        oBusyDialog.open();
                        //  var oParams = oEvt.getParameter("YY1_PACKINGTYPE");
                        var BillingDocument = oEvt.mParameters.selectionSet[0].mProperties.value;
                        var BillingDocumentItem = oEvt.mParameters.selectionSet[1].mProperties.value;
                        var CustomerName = oEvt.mParameters.selectionSet[2].mProperties.value;
                        //  sap.m.MessageToast.show("Search pressed '");

                        // if threee no  values 
                        if (BillingDocument === "" && BillingDocumentItem === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS"
                            });
                        }

                        //    if BillingDocument  value is insert then search  under block
                        else if (BillingDocumentItem === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument)]
                            });
                        }

                        //    if BillingDocumentItem  value is insert then search under block
                        else if (BillingDocument === "" && CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem)]
                            });
                        }
                        //    if CustomerName  value is insert then search under block
                        else if (BillingDocumentItem === "" && BillingDocument === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        //    if CustomerName is blank only
                        else if (CustomerName === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument),
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem)]
                            });
                        }
                        //    if BillingDocumentItem is blank only 
                        else if (BillingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocument", sap.ui.model.FilterOperator.EQ, BillingDocument),
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        //    if BillingDocument is blank only 
                        else if (BillingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/YEINVOICE_CDS", filters: [
                                    new sap.ui.model.Filter("BillingDocumentItem", sap.ui.model.FilterOperator.EQ, BillingDocumentItem),
                                    new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.EQ, CustomerName)]
                            });
                        }
                        oBusyDialog.close();
                    }
                });

                this._oValueHelpDialog.setFilterBar(oFilterBar);
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "BillingDocument", template: "BillingDocument" },
                        { label: "BillingDocumentItem", template: "BillingDocumentItem" },
                        { label: "CustomerName", template: "CustomerName" }
                    ]
                });
                var oTable = this._oValueHelpDialog.getTable();
                oTable.setModel(oColModel, "columns");
                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/YINVOICE");
                oTable.setModel(oModel);
                oBusyDialog.close();
                this._oValueHelpDialog.open();
            },
            FIINVOICE1: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oInput1 = this.getView().byId("Orderfr1");
                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("Orderfr1", {
                        supportMultiselect: false,
                        supportRangesOnly: false,
                        stretch: sap.ui.Device.system.phone,
                        keys: "Orderfr",
                        descriptionKey: "Orderfr",
                        filtermode: "true",
                        ok: function (oEvent) {
                            var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.AccountingDocument;
                            oInput1.setValue(valueset);
                            this.close();
                        },
                        
                        cancel: function () {
                            this.close();
                            
                        }
                    });
                }


                var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    advancedMode: true,
                    // filterBarExpanded: false,
                    filterBarExpanded: true,
                    showGoOnFB: !sap.ui.Device.system.phone,
                    filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "AccountingDocument", control: new sap.m.Input() }),
                    new sap.ui.comp.filterbar.FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n2", label: "AccountingDocumentItem", control: new sap.m.Input() }),
                    ],

                    search: function (oEvt) {
                        oBusyDialog.open();
                        // var oParams = oEvt.getParameter("YY1_PACKINGTYPE");
                        var AccountingDocument = oEvt.mParameters.selectionSet[0].mProperties.value;
                        var AccountingDocumentItem = oEvt.mParameters.selectionSet[1].mProperties.value;

                        // sap.m.MessageToast.show("Search pressed '");
                        // if two no  values 
                        if (AccountingDocument === "" && AccountingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata"
                            });
                        }

                        //    if AccountingDocumentItem  value is insert then search  under block
                        else if (AccountingDocument === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata", filters: [
                                    new sap.ui.model.Filter("AccountingDocumentItem", sap.ui.model.FilterOperator.Contains, AccountingDocumentItem)]
                            });
                        }

                        //    if AccountingDocument value is insert then search  under block
                        else if (AccountingDocumentItem === "") {
                            oTable.bindRows({
                                path: "/Financeinvoicedata", filters: [
                                    new sap.ui.model.Filter("AccountingDocument", sap.ui.model.FilterOperator.Contains, AccountingDocument)]
                            });
                        }

                        oBusyDialog.close();
                    }
                });

                this._oValueHelpDialog.setFilterBar(oFilterBar);
                var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "AccountingDocument", template: "AccountingDocument" },
                        { label: "AccountingDocumentItem", template: "AccountingDocumentItem" },

                    ]
                });
                var oTable = this._oValueHelpDialog.getTable();
                oTable.setModel(oColModel, "columns");
                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/YINVOICE");
                oTable.setModel(oModel);
                oBusyDialog.close();
                this._oValueHelpDialog.open();
            },

            onBack: function () {
                var sPreviousHash = History.getInstance().getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("page1", null, true);
                }
            }
        });
    });
