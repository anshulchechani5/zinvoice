sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox"
    ],
    function (BaseController, UIComponent, JSONModel, MessageBox) {
        "use strict";

        return BaseController.extend("zinvoice.controller.Financecancel", {
            onInit() {

                // this.getView().setModel(oModel, "view1");
                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oTableItemModel");
                this.getView().getModel('oTableItemModel').setProperty("/aTableItem", []);

                UIComponent.getRouterFor(this).getRoute('Financecancel').attachPatternMatched(this._onRouteMatch, this);
            },
            _onRouteMatch: function (oEvent) {
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


                if (oCommonModel.getProperty('/displayObject').Action === "Generate") {
                    this.onReadData();
                    this.getView().getModel("oGenericModel").setProperty("/buttonVisible", true);
                } else if (oCommonModel.getProperty('/displayObject').Action === "Display") {
                    this.onReadData();

                    this.getView().getModel("oGenericModel").setProperty("/buttonVisible", false);
                    this.getView().getModel("oGenericModel").setProperty("/setEditable", false);


                } else if (oCommonModel.getProperty('/displayObject').Action === 'Cancel') {
                    this.onReadData();
                    this.getView().getModel("oGenericModel").setProperty("/buttonIrn", "Cancel IRN");
                    this.getView().getModel("oGenericModel").setProperty("/buttonEway", "Cancel EwayBill & IRN");
                    this.getView().getModel("oGenericModel").setProperty("/setEditable", false);
                    this.getView().setModel("oGenericModel").setProperty("/buttonVisible", true);
                }

            },

            onReadData: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
                var oTableModel = this.getView().getModel('oTableItemModel');
                var aTableArr = oTableModel.getProperty("/aTableItem");
                var oModel = this.getView().getModel();
                var companycode = oCommonModel.getProperty('/displayObject').companycode;
                var billdoc = oCommonModel.getProperty('/displayObject').BillDoc;
                var FiscalYear = oCommonModel.getProperty('/displayObject').FiscalYear;
                var oFilter = new sap.ui.model.Filter("AccountingDocument", "EQ", billdoc);
                var oFilter1 = new sap.ui.model.Filter("FiscalYear", "EQ", FiscalYear);
                var oFilter2 = new sap.ui.model.Filter("CompanyCode", "EQ", companycode);

                oModel.read("/Financeinvoicedata", {
                    filters: [oFilter, oFilter1,oFilter2],
                    success: function (oresponse) {
                        oBusyDialog.close();

                        oresponse.results.map(function (item) {
                            var oGrossAmount = Number(item.IGST) + Number(item.CGST) + Number(item.SGST);
                            var obj = {
                                AccountingDocument: item.AccountingDocument,
                                AccountingDocumentItem: item.AccountingDocumentItem,
                                AccountingDocumentItemType: item.AccountingDocumentItemType,
                                AccountingDocumentItemRef: "",
                                AccountingDocumentType: item.AccountDocumentType,
                                TaxItemAcctgDocItemRef: item.TaxItemAcctgDocItemRef,
                                TransactionCurrency: item.TransactionCurrency,
                                HSNCODE: item.HSNCODE,
                                AckNo: item.AckNo,
                                AckDate: item.AckDate,
                                Irn: item.Irn,
                                IrnStatus:item.IrnStatus,
                                Ebillno:item.Ebillno,
                                EgenDat:item.EbillDate,
                                Status:item.EbillStatus,
                                BASEAMT: item.BASEAMT,
                                BITEM: item.BITEM,
                                TransactionTypeDetermination: item.TransactionTypeDetermination,
                                IGST: item.IGST,
                                CGST: item.CGST,
                                SGST: item.SGST,
                                Customer: item.Customer,
                                CustomerName: item.CustomerName,
                                GST: item.GST,
                                TOTAL_AMT: item.TOTAL_AMT,
                                GrossAmount: oGrossAmount
                            }
                            aTableArr.push(obj);
                            oTableModel.setProperty("/aTableItem", aTableArr);

                        })
                    }.bind(this)
                })

            },
            cancelIrn: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Cancelling",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oCommonModel = this.getOwnerComponent().getModel("oCommonModel")
                var invoiceType = oCommonModel.getProperty("/invoiceObject").InvoiceType;
                var oTableModel = this.getView().getModel('oTableItemModel');
                var tableModel = oTableModel.getProperty('/aTableItem');
                var companycode = oCommonModel.getProperty('/displayObject').companycode;
                var FiscalYear = oCommonModel.getProperty('/displayObject').FiscalYear;
                
                var billingdoc = tableModel[0].AccountingDocument;
                var eway = tableModel[0].Ebillno;
                var transportname = tableModel[0].TRANSPORTERNAME;
                var transdoc = tableModel[0].TransDocNo;
                var vehiclenum = tableModel[0].VEHICLENUMBER;
                var transid = tableModel[0].TRANSID;
                var distance = tableModel[0].Distance;

                // url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=3556667&DISTANCE=600";
                var irn = "x";

                var url1 = "/sap/bc/http/sap/yeinv_http?CanIrn=X";
                var url2 = "&Caneway=X";
                var url3 = "&invoice=";
                var url4 = "&InvoiceType="
                var url5 = "&companycode=";
                var url10 = "&year="
                var url6 = url3 + billingdoc;
                var url7 = url4 + invoiceType
                var url9 = url5 + companycode;
                var url11 = url10 + FiscalYear;


               

                var url = url1 + url2 + url6 + url7 + url9 + url11;

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

                        console.log(result)
                        oBusyDialog.close();
                        MessageBox.show(result, {
                            title: "Message",
                            emphasizedAction: MessageBox.Action.YES
                        });

                    }.bind(this)
                });
            },
            cancelEway: function(){
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Generating",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oTableModel = this.getView().getModel('oTableItemModel');
                var tableModel = oTableModel.getProperty('/aTableItem');
                var oCommonModel = this.getOwnerComponent().getModel("oCommonModel")
                var invoiceType = oCommonModel.getProperty("/invoiceObject").InvoiceType;
                var companycode = oCommonModel.getProperty('/displayObject').companycode;

                var billingdoc = tableModel[0].BillingDocument;
                var eway = tableModel[0].Ebillno;
                var transportname = tableModel[0].TRANSPORTERNAME;
                var transdoc = tableModel[0].TransDocNo;
                var vehiclenum = tableModel[0].VEHICLENUMBER;
                var transid = tableModel[0].TRANSID;
                var distance = tableModel[0].Distance;

                // url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=3556667&DISTANCE=600";
                var irn = "x";

                var url1 = "/sap/bc/http/sap/yeinv_http?Irn=";
                var url2 = "&Caneway=X";
                var url3 = "&invoice=";
                var url11 ="&invoiceType=";
               
                var url8 = url3 + billingdoc;
                var url9 = "&companycode=";
                var url10= url9 + companycode;
                var url12 = url11 + invoiceType;

                var url = url1 + url2 + url8 + url10 + url12;

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

                        console.log(result)
                        oBusyDialog.close();
                        MessageBox.show(result, {
                            title: "Message",
                            emphasizedAction: MessageBox.Action.YES
                        });

                    }.bind(this)
                });
            }

        });
    }
);
