sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent"
    ],
    function(BaseController,UIComponent) {
      "use strict";
  
      return BaseController.extend("zinvoice.controller.json", {
        onInit() {
          UIComponent.getRouterFor(this).getRoute('json').attachPatternMatched(this._onRouteMatch, this);
          // this.onPress();
        },
        _onRouteMatch: function (oEvent) {
          this.onPress();
          var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
          this.getView().setModel(new JSONModel(), "oTableItemModel");
          this.getView().getModel('oTableItemModel').setProperty("/aTableItem", []);
          var oSettingObject = {
              "editable": true,
              "buttonVisible": true,
              "buttonIrn": "Generate IRN",
              "buttonEway": "Generate EwayBill & IRN",
              "setEditable": true
          }
        },
        onPress : function() {
          var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
          var inv = oCommonModel.getProperty('/displayObject').BillDoc;
          var companycode = oCommonModel.getProperty('/displayObject').companycode;
            var ansh = this.getView().byId("idText").getValue();

            // https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?json=X&invoice=0090000003

           var url1 = "/sap/bc/http/sap/yeinv_http?json=X&";
           var url2 ="invoice=";
           var url3 = inv;
           var url4 = url2 + url3;
           var url5 ="&companycode=" + companycode;
           var url = url1 + url4 + url5;
            $.ajax({
              type: "post",
              
              url: url,
              contentType: "application/json; charset=utf-8",
              traditional: true,
              success: function (data) {
                console.log(data);
                oCommonModel.setProperty("/json", data);
              }
    
          });
          },
          onsave : function() {
            var oCommonModel = this.getOwnerComponent().getModel('oCommonModel');
            var inv = oCommonModel.getProperty('/displayObject').BillDoc;
            var ansh = this.getView().byId("idText").getValue();
  
              // https://my402116-api.s4hana.cloud.sap/sap/bc/http/sap/yeinv_http?json=X&invoice=0090000003
  
             var url1 = "/sap/bc/http/sap/yeinv_http?json=X&";
             var url2 ="invoice=";
             var url3 = inv;
             var url4 = url2 + url3;
             var url = url1 + url4;
              $.ajax({
                type: "post", 
                url: url,
                data: JSON.stringify(ansh),
                contentType: "application/json; charset=utf-8",
                traditional: true,
                success: function (data) {
                  console.log(data);
                  oCommonModel.setProperty("/json", data);
                }
      
            });
            }




    





      });
    }
  );
  