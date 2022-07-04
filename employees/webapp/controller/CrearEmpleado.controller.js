sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
  ],
  function (
    Controller,
    MessageBox,
    MessageToast,
    UploadCollectionParameter,
    JSONModel,
    Device,
    History
  ) {
    return Controller.extend("logaligroup.employees.controller.CrearEmpleado", {

      onInit() {
        debugger;
        // se crea la instancia del router
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute("crearEmpleado")
          .attachMatched(this._onRouteMatched, this);
        // se crea el modelo de empleados, en sliders va a contener la informacion de min y max
        // en valuestate se tiene la informacion de todos los valuestates de la vista
        // en varios se tiene informacion de diferentes variables
        // y creado se utilizara para la informacion final que sera guardada en el servicio
        this._model = new sap.ui.model.json.JSONModel({});
        this._model.setProperty("/", {
          sliders: {},
          valueState: {},
          varios: {},
          creado: {
            UserToSalary: {
              Waers: "EUR",
            },
          },
        });
        sap.ui.getCore().setModel(this._model);
        this.getView().setModel(this._model);
      },

      _onRouteMatched(oEvent) {
        // resetear las propiedades del wizard
        const wizard = this.byId("wizardId");
        const primerPaso = wizard.getSteps()[0];
        wizard.discardProgress(primerPaso);
        wizard.goToStep(primerPaso);
        primerPaso.setValidated(false);
        // ir al paso dado despues de regresar de la vista editar por medio
        // del encode se envia la informacion del paso dado
        const pathParamenter = window.decodeURIComponent(
          oEvent.getParameter("arguments").path
        );
        if (pathParamenter !== "new") {
            // se maneja el error si no hay un previous hash cuando se accede a la ruta 
            // por medio del path paso
          const sPreviousHash = History.getInstance().getPreviousHash();
          if (!sPreviousHash) {
            this._oRouter.navTo("home");
          } else {
            const step = this.byId(pathParamenter);
            wizard.setCurrentStep(step);
          }
        }
      },

      // nav back de la vista
      onNavBackCrear() {
        this._oRouter.navTo("home");
      },

      // se ejecuta cuando se selecciona un tipo de empleado en el paso1
      onPaso2(oEvent) {
        const wizard = this.byId("wizardId");
        const step = this.byId("DatosStep");
        const tipoDeEmpleado = oEvent.getParameters().id;
        const i18n = this.getView().getModel("i18n").getResourceBundle();
        const model = this._model;
        // por el tipo dado se va a cambiar los datos del slider, la cantidad y los labels

        // Interno
        if (tipoDeEmpleado.includes("btnInterno")) {
          model.setProperty("/creado/Type", 1);
          model.setProperty("/sliders/minSaldoBruto", 12000);
          model.setProperty("/sliders/maxSaldoBruto", 80000);
          model.setProperty("/creado/UserToSalary/Ammount", 24000);
          model.setProperty("/varios/dniText", i18n.getText("dni"));
          model.setProperty(
            "/varios/saldoText",
            i18n.getText("saldoBrutoAnual")
          );
        // Autonomo
        } else if (tipoDeEmpleado.includes("btnAutonomo")) {
          model.setProperty("/creado/Type", 2);
          model.setProperty("/sliders/minSaldoBruto", 100);
          model.setProperty("/sliders/maxSaldoBruto", 2000);
          model.setProperty("/creado/UserToSalary/Ammount", 400);
          model.setProperty("/varios/dniText", i18n.getText("cif"));
          model.setProperty("/varios/saldoText", i18n.getText("precioDiario"));
          model.setProperty("/valueState/Dni", "None");
        // Gerente
        } else {
          model.setProperty("/creado/Type", 3);
          model.setProperty("/sliders/minSaldoBruto", 50000);
          model.setProperty("/sliders/maxSaldoBruto", 200000);
          model.setProperty("/creado/UserToSalary/Ammount", 70000);
          model.setProperty("/varios/dniText", i18n.getText("dni"));
          model.setProperty(
            "/varios/saldoText",
            i18n.getText("saldoBrutoAnual")
          );
        }
        // se continua con el siguiente paso
        wizard.setCurrentStep(step);
      },

      // funcion para verificar el dni que cumpla con el formato dado
      verificarDni(oEvent) {
        if (this._model.getProperty("/creado/Type") !== 2) {
          const inputDni = this.byId("inputDni");
          var dni = oEvent.getParameter("value");
          const model = this._model;
          const i18n = this.getView().getModel("i18n").getResourceBundle();
          const formatoInvalido = i18n.getText("formatoInvalido");
          var number;
          var letter;
          var letterList;
          var regularExp = /^\d{8}[a-zA-Z]$/;
          //Se comprueba que el formato es válido
          if (regularExp.test(dni) === true) {
            //Número
            number = dni.substr(0, dni.length - 1);
            //Letra
            letter = dni.substr(dni.length - 1, 1);
            number = number % 23;
            letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
            letterList = letterList.substring(number, number + 1);

            // A continuacion se cambia el value state del input y la descripcion de este.
            if (letterList !== letter.toUpperCase()) {
              //Error
              model.setProperty("/valueState/Dni", "Error");
              model.setProperty("/valueState/DniText", formatoInvalido);
            } else {
              //Correcto
              model.setProperty("/valueState/Dni", "Success");
            }
          } else {
            //Error
            model.setProperty("/valueState/Dni", "Error");
            model.setProperty("/valueState/DniText", formatoInvalido);
          }
        }
      },

      // Se ejecuta cuando se pulsa el boton "Paso 3"
      onPaso3() {
        const model = this._model;
        const i18n = this.getView().getModel("i18n").getResourceBundle();
        const object = model.getData();
        const creado = object.creado;
        const valueState = object.valueState;
        const campoSinLlenar = i18n.getText("campoSinLlenar");
        // Se hacen las verificaciones necesarias para pasar al paso 3
        // en caso de falla se cambia el value state que es dinamico y 
        // se informa el error por medio de la descripcion del input
        let isValid = true;
        //Nombre
        if (!creado.FirstName) {
          valueState.FirstName = "Error";
          valueState.FirstNameText = campoSinLlenar;
          isValid = false;
        }
        //Apellidos
        if (!creado.LastName) {
          valueState.LastName = "Error";
          valueState.LastNameText = campoSinLlenar;
          isValid = false;
        }
        //Fecha
        if (!creado.CreationDate) {
          valueState.CreationDate = "Error";
          valueState.CreationDateText = campoSinLlenar;
          isValid = false;
        }
        //DNI
        if (!creado.Dni) {
          valueState.Dni = "Error";
          valueState.DniText = campoSinLlenar;
          isValid = false;
          // condicion especial cuando el tipo es dni y no cfi 
          // vuelve a verficar que cumpla con el formato español
        } else if (valueState.Dni !== "Success" && creado.Type !== 2) {
          valueState.Dni = "Error";
          valueState.DniText = i18n.getText("formatoInvalido");
          isValid = false;
        }
        model.refresh();
        // se crea variable para saber si ya se valido el paso 2
        this._pulsoPaso3 = true;
        // se continua con el siguiente paso si no se envia un mensaje de error
        if (isValid) {
          const wizard = this.byId("wizardId");
          wizard.setCurrentStep(this.byId("InfoStep"));
        } else {
          sap.m.MessageToast.show(i18n.getText("reviseLosCampos"));
        }
      },


      // se ejecuta cuando hay un cambio en los inputs y cuando ya ocurrio el 
      // evento de que se estuvo en el paso 3 para que el value state sea dinamico
      // en caso que se quiera devolver el usuario al paso 2
      onChangeInput(oEvent) {
        debugger;
        if (this._pulsoPaso3) {
          const element = oEvent.mParameters.id.substring(49);
          this._model.setProperty("/valueState/" + element, "None");
        }
      },

      // Se ejecuta cuando se pulsa el boton "Revisar"
      // guarda la informacion de los archivos subidos
      onRevision() {
        const uploadCollection = this.byId("UploadCollection");
        const numFiles = uploadCollection.getItems().length;
        const files = uploadCollection.getItems();
        this._model.setProperty("/varios/ndocumentos", numFiles);
        if (numFiles > 0) {
          var arrayFiles = [];
          files.forEach((element) => {
            arrayFiles.push({
              DocName: element.getFileName(),
              MimeType: element.getMimeType(),
            });
          });
          this._model.setProperty("/varios/files", arrayFiles);
        } else {
          this._model.setProperty("/varios/files", []);
        }
        this._oRouter.navTo("revision");
      },

      //                           //
      // METODOS oUploadCollection //
      //                           //
      onChange: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
        // Header Token
        var oCustomerHeaderToken = new UploadCollectionParameter({
          name: "x-csrf-token",
          value: "securityTokenFromModel",
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        MessageToast.show("Event change triggered");
      },

      onFileDeleted: function (oEvent) {
        MessageToast.show("Event fileDeleted triggered");
      },

      onFilenameLengthExceed: function (oEvent) {
        MessageToast.show("Event filenameLengthExceed triggered");
      },

      onFileSizeExceed: function (oEvent) {
        MessageToast.show("Event fileSizeExceed triggered");
      },

      onTypeMissmatch: function (oEvent) {
        MessageToast.show("Event typeMissmatch triggered");
      },

      onStartUpload: function (oEvent) {
        var oUploadCollection = this.byId("UploadCollection");
        var oTextArea = this.byId("TextArea");
        var cFiles = oUploadCollection.getItems().length;
        var uploadInfo = cFiles + " file(s)";

        if (cFiles > 0) {
          oUploadCollection.upload();

          if (oTextArea.getValue().length === 0) {
            uploadInfo = uploadInfo + " without notes";
          } else {
            uploadInfo = uploadInfo + " with notes";
          }

          MessageToast.show("Method Upload is called (" + uploadInfo + ")");
          MessageBox.information("Uploaded " + uploadInfo);
          oTextArea.setValue("");
        }
      },

      onBeforeUploadStarts: function (oEvent) {
        // Header Slug
        var oCustomerHeaderSlug = new UploadCollectionParameter({
          name: "slug",
          value: oEvent.getParameter("fileName"),
        });
        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        setTimeout(function () {
          MessageToast.show("Event beforeUploadStarts triggered");
        }, 4000);
      },

      onUploadComplete: function (oEvent) {
        var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
        setTimeout(
          function () {
            var oUploadCollection = this.byId("UploadCollection");

            for (var i = 0; i < oUploadCollection.getItems().length; i++) {
              if (
                oUploadCollection.getItems()[i].getFileName() ===
                sUploadedFileName
              ) {
                oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
                break;
              }
            }

            // delay the success message in order to see other messages before
            MessageToast.show("Event uploadComplete triggered");
          }.bind(this),
          8000
        );
      },

      onSelectChange: function (oEvent) {
        var oUploadCollection = this.byId("UploadCollection");
        oUploadCollection.setShowSeparators(
          oEvent.getParameters().selectedItem.getProperty("key")
        );
      },
    });
  }
);
