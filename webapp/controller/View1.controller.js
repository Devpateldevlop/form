sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/dnd/DragInfo",
    "sap/f/dnd/GridDropInfo",
    "sap/ui/core/library",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, DragInfo, GridDropInfo, coreLibrary, Filter, FilterOperator, MessageBox) => {
    "use strict";
    var DropLayout = coreLibrary.dnd.DropLayout;
    var DropPosition = coreLibrary.dnd.DropPosition;
    return Controller.extend("form.controller.View1", {
        onInit() {

        },
        onAfterRendering() {
            this.getView().getModel("selected").setSizeLimit(10000)
            this.getView().getModel("formlab").setSizeLimit(10000)
            this.loadFragment({
                name: "form.fragment.login"
            }).then(function (oDialog) {
                oDialog.open();
            });
            this.getView().getModel("selected").setData([])

            var a = new sap.ui.model.json.JSONModel({ "selected": false })
            this.getView().setModel(a, "selproperty")

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
        login: async function (oevent) {
            debugger;
            var user = this.getView().byId("user").getValue();
            var pass = this.getView().byId("password").getValue();

            if (user === "dev" && pass === "dev") {
                oevent.getSource().getParent().getParent().getParent().getParent().getParent().destroy();
                this.getView().byId("page").setVisible(true);
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1");

                try {
                    const response = await fetch("https://formapi-phi.vercel.app/api/form", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch data. Status: " + response.status);
                    }

                    const data = await response.json();
                    this.data = data;  // Store data in `this.data`

                    setTimeout(() => {
                        var that = this;

                        function createform(id) {
                            that.oForm = new sap.ui.layout.form.SimpleForm(id);
                            that.oForm.setLayout("ColumnLayout");
                            that.oForm.setColumnsM(1);
                            that.oForm.setColumnsL(4);
                            that.oForm.setColumnsXL(4);
                        }

                        var i = 0;
                        var i2 = 0;
                        var ids = ["form"];

                        data.forEach(element => {
                            if (element.label.includes("_")) {
                                debugger;
                                this.getView().byId("page").addContent(this.oForm);
                                i = i + 1;
                                createform("form" + i);
                                ids.push("form" + i);
                                this.oForm.addContent(new sap.ui.core.Title({ text: element.label.split("_")[0] }));
                            } else {
                                if (ids.length === 1 && i2 === 0) {
                                    that.oForm = new sap.ui.layout.form.SimpleForm();
                                    that.oForm.setLayout("ColumnLayout");
                                    that.oForm.setColumnsM(1);
                                    that.oForm.setColumnsL(4);
                                    that.oForm.setColumnsXL(4);
                                    i2++;
                                    this.oForm.addContent(new sap.m.Label({ text: element.label, design: "Bold" }));
                                    this.oForm.addContent(new sap.m.Input({ value: "", type: element.inputType }));
                                } else {
                                    this.oForm.addContent(new sap.m.Label({ text: element.label, design: "Bold" }));
                                    this.oForm.addContent(new sap.m.Input({ value: "", type: element.inputType }));
                                }
                            }
                        });

                        this.getView().byId("page").addContent(this.oForm);
                    }, 3000);

                } catch (error) {
                    sap.m.MessageToast.show("Error occurred: " + error.message);
                }


            } else if (user === "form" && pass === "form") {
                oevent.getSource().getParent().getParent().getParent().getParent().getParent().destroy()
                this.getView().byId('page2').setVisible(true)
                // oevent.getSource().getParent().getParent().getParent().getParent().getParent().destroy()
                // const oRouter = this.getOwnerComponent().getRouter();
                //         oRouter.navTo("RouteView2");


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
            }
        },
        selectfield: function (oevent) {
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
            this.getView().byId("send").setEnabled(false)
            var payload = this.getView().getModel("selected").getData()

            fetch("https://formapi-phi.vercel.app/api/form", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })
                .then(response => response.json())
                .then(data => {

                })
                .catch(error => {

                });

            setTimeout(() => {

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
                MessageBox.information("The Form Send In This" + `https://detfrom.netlify.app/`)

            }, 5000);
        }

    });
});