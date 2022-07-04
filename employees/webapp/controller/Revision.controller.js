sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, History) {
    "use strict";

    return Controller.extend("logaligroup.employees.controller.Revision", {
      onInit() {
        debugger;
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute("revision")
          .attachMatched(this._onRouteMatched, this);
        this._model = sap.ui.getCore().getModel();
        this.getView().setModel(this._model);
      },

      // Se ejecuta cuando se navega a la vista.
      _onRouteMatched() {
        // excepcion cuando se navega directamente
        const sPreviousHash = History.getInstance().getPreviousHash();
        if (!sPreviousHash) {
          this._oRouter.navTo("home");
        }
        const tipoText = this.byId("tipo");
        const tipo = this._model.getProperty("/creado/Type");
        const i18n = this.getView().getModel("i18n").getResourceBundle();
        // cambia el label del tipo de empleado
        if (tipo === 1) {
          tipoText.setText(i18n.getText("btnInterno"));
        } else if (tipo === 2) {
          tipoText.setText(i18n.getText("btnAutonomo"));
        } else {
          tipoText.setText(i18n.getText("btnGerente"));
        }
      },

      // funcion para devolverse al paso del wizard dado
      onEditar(oEvent) {
        const panel = oEvent.getParameters().id;
        let path = "TipoStep";
        if (panel.includes("Panel2")) {
          path = "DatosStep";
        } else if (panel.includes("Panel3")) {
          path = "InfoStep";
        }
        this._oRouter.navTo("crearEmpleado", {
          path: window.encodeURIComponent(path),
        });
      },

      // funcion para guardar el empleado en el servicio
      onGuardar() {
        this.getView().setBusy(true);
        // cargamos el request
        const body = this._model.getProperty("/creado");
        // creamos la peticion
        this.getView()
          .getModel("odataModel")
          .create("/Users", body, {
            //funcion si es exitosa
            success: function (data) {
              this.getView().setBusy(false);
              sap.m.MessageToast.show("creacionExitosa");
              this._oRouter.navTo("home");
            }.bind(this),
            // funcion si es fallida
            error: function () {
              this.getView().setBusy(false);
              sap.m.MessageToast.show("creacionFallida");
            }.bind(this),
          });
      },

      // nav back
      onNavBack() {
        this._oRouter.navTo("home");
      },
    });
  }
);
