sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox"
    ],
    function (BaseController, UIComponent, JSONModel, MessageBox) {
        "use strict";

        return BaseController.extend("zinvoice.controller.FinanceInvoice", {
            onInit() {

                // this.getView().setModel(oModel, "view1");
                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oTableItemModel");
                this.getView().getModel('oTableItemModel').setProperty("/aTableItem", []);

                UIComponent.getRouterFor(this).getRoute('FinanceInvoice').attachPatternMatched(this._onRouteMatch, this);
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

            generateEwayBillIrn: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Loading",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oTableModel = this.getView().getModel('oTableItemModel');
                var tableModel = oTableModel.getProperty('/aTableItem');

                var oCommonModel = this.getOwnerComponent().getModel("oCommonModel");
                var invoiceValue = oCommonModel.getProperty("/invoiceObject").InvoiceType;
                var companycode = oCommonModel.getProperty('/displayObject').companycode;
                var FiscalYear = oCommonModel.getProperty('/displayObject').FiscalYear;
                var billingdoc = tableModel[0].AccountingDocument;
                var eway = tableModel[0].Ebillno;
                var transportname = tableModel[0].TRANSPORTERNAME;
                var transdoc = tableModel[0].TransDocNo;
                var vehiclenum = tableModel[0].VEHICLENUMBER;
                var transid = tableModel[0].TRANSID;
                var distance = tableModel[0].Distance;

                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=3556667&DISTANCE=6&transportdoc=&transportid=&vehiclenumber=";

                var url1 = "/sap/bc/http/sap/yeinv_http?Irn=X&eway=X";
                var url2 = "&invoice=";
                var url3 = "&transporter=";
                var url4 = "&DISTANCE=";
                var url5 = "&transportdoc=";
                var url6 = "&transportid=";
                var url7 = "&vehiclenumber=";
                var url8 = "&invoiceType="
                var url9 = "&year="
                var url18 ="&companycode="


                var url10 = url2 + billingdoc;
                var url11 = url3 + transportname;
                var url12 = url4 + distance;
                var url13 = url5 + transdoc;
                var url14 = url6 + transid;
                var url15 = url7 + vehiclenum;
                var url16 = url8 + invoiceValue;
                var url17 = url9 + FiscalYear;
                var url19 = url18 + companycode;

                var url = url1 + url10 + url11 + url12 + url13 + url14 + url15 + url16 + url17 +url19;

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

            generateIRN: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Generating",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oTableModel = this.getView().getModel('oTableItemModel');
                var tableModel = oTableModel.getProperty('/aTableItem');
               
                var oCommonModel = this.getOwnerComponent().getModel("oCommonModel");
                var invoiceValue = oCommonModel.getProperty("/invoiceObject").InvoiceType;
                var companycode = oCommonModel.getProperty('/displayObject').companycode;

                var billingdoc = tableModel[0].BillingDocument;
                var eway = tableModel[0].Ebillno;
                var transportname = tableModel[0].TRANSPORTERNAME;
                var transdoc = tableModel[0].TransDocNo;
                var vehiclenum = tableModel[0].VEHICLENUMBER;
                var transid = tableModel[0].TRANSID;
                var distance = tableModel[0].Distance;

                // url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=3556667&DISTANCE=600";
                // https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=3556667&DISTANCE=600&transportdoc=&transportid=&vehiclenumber=
                var irn = "x";

                var url1 = "/sap/bc/http/sap/yeinv_http?Irn=X";
                var url2 = "&eway=";
                var url3 = "&invoice=";
                var url4 = "&transporter=";
                var url5 = "&DISTANCE=";
                var url6 = "&transportdoc=";
                var url7 = "&transportid=";
                var url8 = "&vehiclenumber=";
                var url15 ="&companycode";


                var url8 = url2 + eway;
                var url9 = url3 + billingdoc;
                var url10 = url4 + transportname;
                var url11 = url5 + distance;
                var url12 = url6 + transdoc;
                var url13 = url7 + transid;
                var url14 = url8 + vehiclenum;
                var url16 = url15 + companycode;



                var url = url1 + url8 + url9 + url10 + url11 + url12 + url13 + url14 + url16;

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

            onGet: function () {
                var oTableModel = this.getView().getModel('oTableItemModel');
                var tableModel = oTableModel.getProperty('/aTableItem');
                console.log(tableModel);

                var billingdoc = tableModel[0].BillingDocument;
                var transportname = tableModel[0].TRANSPORTERNAME;
                var transdoc = tableModel[0].TransDocNo;
                var vehiclenum = tableModel[0].VEHICLENUMBER;
                var transid = tableModel[0].TRANSID;

                // var url = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?Irn=X&eway=X&invoice=90000001&transporter=X&transporterid=X";
                var url1 = "https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?";
                var url2 = "Irn=X";
                var url3 = "&eway=X";
                var url4 = "&invoice=";
                var url5 = "&transporter=";
                var url6 = "&transporterid=";

                var url7 = url4 + billingdoc;
                var url8 = url5 + transportname;
                var url9 = url6 + transid;

                var url = url1 + url2 + url3 + url7 + url8 + url9;
            }

        });
    }
);
