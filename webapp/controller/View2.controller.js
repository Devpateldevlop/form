sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "sap/ui/core/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, DragInfo, GridDropInfo, coreLibrary, Filter, FilterOperator) => {
    "use strict";
    var DropLayout = coreLibrary.dnd.DropLayout;
    var DropPosition = coreLibrary.dnd.DropPosition;
    return Controller.extend("form.controller.View2", {
        onInit() {

        },
        onAfterRendering() {
            this.getView().getModel("selected").setSizeLimit(10000)
            this.getView().getModel("formlab").setSizeLimit(10000)
            this.getView().byId("pag").setVisible(false)
            this.loadFragment({
                name: "form.fragment.login"
            }).then(function (oDialog) {
                oDialog.open();
            });
            this.getView().getModel("selected").setData([])

            var a = new sap.ui.model.json.JSONModel({ "selected": false })
            this.getView().setModel(a, "selproperty")

            var oGrid = this.byId("grid1");

            oGrid.addDragDropConfig(new DragInfo({
                sourceAggregation: "items"
            }));
            var that = this
            oGrid.addDragDropConfig(new GridDropInfo({
                targetAggregation: "items",
                dropPosition: DropPosition.Between,
                dropLayout: DropLayout.Horizontal,
                drop: function (oInfo) {
                    debugger

                    var dragobj = oInfo.getParameters("draffedControl").draggedControl.getBindingContext("selected").getPath().split("/").pop()
                    var dropobj = oInfo.getParameters("draffedControl").droppedControl.getBindingContext("selected").getPath().split("/").pop()

                    var arr = that.getView().getModel("selected").getData()

                    function swapObjects(arr, index1, index2) {
                        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
                    }

                    swapObjects(arr, parseInt(dragobj), parseInt(dropobj));
                    that.getView().getModel("selected").setData(arr)
                    that.getView().getModel("selected").refresh(true)



                }

            }))
        },
        onFilterData: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var oList = this.getView().byId("maingl");

            var oFilter = new Filter("label", FilterOperator.Contains, sQuery);

            var oBinding = oList.getBinding("content");

            oBinding.filter(oFilter);
        },
        ondeletesel: function (oevent) {
            debugger
            var path = oevent.getSource().getBindingContext("selected").getPath().split("/").pop()
            var obj = oevent.getSource().getBindingContext("selected").getObject()
            this.getView().getModel("selected").getData().splice(parseInt(path), 1)
            this.getView().getModel("selected").refresh(true)

            this.getView().getModel("formlab").getData().push(obj)
            this.getView().getModel("formlab").refresh(true)
        },
        login: function (oevent) {

            debugger
            var user = this.getView().byId("user").getValue()
            var pass = this.getView().byId("password").getValue()

            if (user === "dev" && pass === "dev") {
                oevent.getSource().getParent().getParent().getParent().getParent().getParent().destroy()

                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1");

            } else if (user === "form" && pass === "form") {

                this.getView().byId("pag").setVisible(true)
                oevent.getSource().getParent().getParent().getParent().getParent().getParent().destroy()

            }

        }, selectfield: function (oevent) {
            debugger
            this.getView().byId('cl').setLayout("TwoColumnsMidExpanded")
            var path = oevent.getSource().getParent().getBindingContext("formlab").getPath().split("/").pop()

            var data = this.getView().getModel("formlab").getData().splice(parseInt(path), 1)
            this.getView().getModel("formlab").refresh(true)
            data[0].width = "100%"
            data[0].visible = true
            this.getView().getModel("selected").getData().push(data[0])
            this.getView().getModel("selected").refresh(true)
            this.getView().getModel("selproperty").setProperty("/selected", false)

        }, handleClose: function () {
            debugger
            this.getView().byId('cl').setLayout("OneColumn")
        },

        onAddInput: function () {
            debugger
            this.loadFragment({
                name: "form.fragment.preview"
            }).then(function (oDialog) {
                oDialog.open();
            });
            var data = this.getView().getModel("selected").getData()

            setTimeout(() => {

                var that = this
                function createform(id) {
                    that.oForm = new sap.ui.layout.form.SimpleForm(id);
                    that.oForm.setLayout("ColumnLayout")
                    that.oForm.setColumnsM(1)
                    that.oForm.setColumnsL(4)
                    that.oForm.setColumnsXL(4)

                }
                var i = 0
                var i2 = 0
                var ids = ["form"]
                data.forEach(element => {
                    if (element.label.includes("_")) {
                        debugger
                        this.getView().byId("preview").addContent(this.oForm);
                        i = i + 1
                        createform("form" + i)
                        ids.push("form" + i)
                        this.oForm.addContent(new sap.ui.core.Title({ text: element.label.split("_")[0] }));

                        // this.getView().byId("preview").addContent(this.oForm);

                    } else {
                        if (ids.length == 1 && i2 == 0) {
                            that.oForm = new sap.ui.layout.form.SimpleForm();
                            that.oForm.setLayout("ColumnLayout")
                            that.oForm.setColumnsM(1)
                            that.oForm.setColumnsL(4)
                            that.oForm.setColumnsXL(4)
                            i2++
                            this.oForm.addContent(new sap.m.Label({ text: element.label, design: "Bold" }));
                            this.oForm.addContent(new sap.m.Input({ value: "", type: element.inputType }));
                        } else {
                            this.oForm.addContent(new sap.m.Label({ text: element.label, design: "Bold" }));
                            this.oForm.addContent(new sap.m.Input({ value: "", type: element.inputType }));
                        }
                    }
                })

                this.getView().byId("preview").addContent(this.oForm);

            }, 3000);

        },
        previewcancel: function (oevent) {
            debugger
            oevent.getSource().getParent().destroy()
        },
        opentitle: function () {
            this.loadFragment({
                name: "form.fragment.addtitle"
            }).then(function (oDialog) {
                oDialog.open();
            });
        },
        addtitle: function (oevent) {
            debugger
            this.getView().getModel("selected").getData().push({ "label": this.getView().byId("title").getValue() + "_title", "width": "50rem", "visible": false })
            this.getView().getModel("selected").refresh(true)
            oevent.getSource().getParent().destroy()

        }, sendform: function () {
            debugger
            var payload = this.getView().getModel("selected").getData()

            fetch("https://formapi-phi.vercel.app/api/form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(response => response.json())
                .then(data => {

                })
                .catch(error => {

                });

            // fetch("https://formapi-phi.vercel.app/api/form", {
            //   method: "GET",
            //   headers: {
            //     "Content-Type": "application/json"
            //   }
            // })
            //   .then(response => {
            //     if (!response.ok) {
            //       throw new Error("Failed to fetch Calendar Data");
            //     }
            //     return response.json();
            //   })
            //   .then(dataLeave => {
            //     sap.ui.core.BusyIndicator.hide();
            //     this.getOwnerComponent().getModel("LeaveRequestDataEmloyee").setData(dataLeave.leaveHistory);
            //     this.getOwnerComponent().getModel("LeaveRequestDataEmloyee").refresh(true);
            //     if (isCalendorController) {
            //       this._setPunchHistory();
            //     }
            //   })
            //   .catch(error => {
            //     sap.ui.core.BusyIndicator.hide();
            //     sap.m.MessageToast.show("Error occurred: " + error.message);
            //     if (isCalendorController) {
            //       this._setPunchHistory();
            //     }
            //   });




        }






    })
})