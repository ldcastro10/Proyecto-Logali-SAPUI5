sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  return Controller.extend(
    "logaligroup.employees.controller.MostrarEmpleados",
    {
      onInit() {
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute("mostrarEmpleados")
          .attachMatched(this._onRouteMatched, this);
        this._viewMostrarEmpleados = this.byId("viewMostrarEmpleados");
      },

      onNavBack() {
        this._oRouter.navTo("home");
      },

      // se ejecuta cuando se selecciona un empleado
      seleccionarEmpleado(oEvent) {
        const detalleEmpleado = this.byId("detalleEmpleado");
        // despliega el detalle
        this._viewMostrarEmpleados.to(detalleEmpleado);
        //contexto del empleado seleccionado
        const context = oEvent
          .getParameter("listItem")
          .getBindingContext("odataModel");
        this.employeeId = context.getProperty("EmployeeId");
        // se hace el bien del usuario
        detalleEmpleado.bindElement(
          "odataModel>/Users(EmployeeId='" +
            this.employeeId +
            "',SapId='" +
            this.getOwnerComponent().SapId +
            "')"
        );
      },

      // se ejecuta cuando se pulsa en "Ascenso" de un empleado
      onAscensoEmpleado(oEvent) {
        // se crea el dialogo
        if (!this.ascensoDialog) {
          this.ascensoDialog = sap.ui.xmlfragment(
            "logaligroup/employees/fragment/AscensoEmpleado",
            this
          );
          this.getView().addDependent(this.ascensoDialog);
        }
        // se crea el modelo
        this.ascensoDialog.setModel(
          new sap.ui.model.json.JSONModel({}),
          "aumentoModel"
        );
        this.ascensoDialog.open();
      },
      cerrarAumentoDialog() {
        this.ascensoDialog.close();
      },

      // se ejecuta cuando se el elimina un empleado
      eliminarEmpleado(oEvent) {
        // dialogo para confirmacion
        sap.m.MessageBox.confirm(
          this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("confirmacionEliminar"),
          {
            title: this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("confirm"),
            onClose: function (oAction) {
              if (oAction === "OK") {
                this.getView()
                  .getModel("odataModel")
                  // remueve el elemento
                  .remove(
                    "/Users(EmployeeId='" +
                      this.employeeId +
                      "',SapId='" +
                      this.getOwnerComponent().SapId +
                      "')",
                    {
                      //funcion si es exitoso
                      success: function (data) {
                        sap.m.MessageToast.show(
                          this.getView()
                            .getModel("i18n")
                            .getResourceBundle()
                            .getText("eliminado")
                        );
                        this._viewMostrarEmpleados.to(
                          this.byId("detalleEmpleado")
                        );
                      }.bind(this),
                      // funcion error
                      error: function (e) {
                        sap.base.Log.info(e);
                      }.bind(this),
                    }
                  );
              }
            }.bind(this),
          }
        );
      },

      // funcion para añadir un aumento
      añadirAumento(oEvent) {
        var aumentoModel = this.ascensoDialog.getModel("aumentoModel");
        var odata = aumentoModel.getData();
        // cuerpo del request
        var body = {
          Ammount: odata.Ammount,
          CreationDate: odata.CreationDate,
          Comments: odata.Comments,
          SapId: this.getOwnerComponent().SapId,
          EmployeeId: this.employeeId,
        };
        // crear la peticion de crear un nuevo salario en el sevicio
        this.getView().setBusy(true);
        this.getView()
          .getModel("odataModel")
          .create("/Salaries", body, {
            // funcion exitosa
            success: function () {
              this.getView().setBusy(false);
              sap.m.MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("okAscenso")
              );
              this.cerrarAumentoDialog();
            }.bind(this),
            // funcion error
            error: function () {
              this.getView().setBusy(false);
              sap.m.MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("errorAscenso")
              );
            }.bind(this),
          });
      },

      //                           //
      // METODOS oUploadCollection //
      //                           //
      onChange(oEvent) {
        var oUploadCollection = oEvent.getSource();
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
          name: "x-csrf-token",
          value: this.getView().getModel("odataModel").getSecurityToken(),
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
      },

      onBeforeUploadStart(oEvent) {
        var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
          name: "slug",
          value:
            this.getOwnerComponent().SapId +
            ";" +
            this.employeeId +
            ";" +
            oEvent.getParameter("fileName"),
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      },

      onUploadComplete(oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
      },

      onFileDeleted(oEvent) {
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent
          .getParameter("item")
          .getBindingContext("odataModel")
          .getPath();
        this.getView()
          .getModel("odataModel")
          .remove(sPath, {
            success: function () {
              oUploadCollection.getBinding("items").refresh();
            },
            error: function () {},
          });
      },

      downloadFile(oEvent) {
        var sPath = oEvent
          .getSource()
          .getBindingContext("odataModel")
          .getPath();
        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
      },
    }
  );
});
