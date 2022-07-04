sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("logaligroup.employees.controller.Home", {
      onInit() {
        debugger;
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute("home")
          .attachMatched(this._onRouteMatched, this);
      },
      onCrearEmpleado() {
        debugger;
        this._oRouter.navTo("crearEmpleado", {
          path: window.encodeURIComponent("new"),
        });
      },
      onVerEmpleado() {
        debugger;
        this._oRouter.navTo("mostrarEmpleados");
      },
    });
  }
);
