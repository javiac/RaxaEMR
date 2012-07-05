/**
 * This class listens for the user input and makes changes to the doctor/patient
 * lists as necessary.
 */
var form_num, lab_num;
Ext.define("Screener.controller.Application", {
    requires: ['Screener.store.Doctors', 'Screener.store.NewPatients', 'Screener.store.PatientList', 'Screener.store.NewPersons', 'Screener.store.IdentifierType', 'Screener.store.Location', 'Screener.view.PharmacyForm', 'Screener.view.PatientListView'],
    models:['Screener.model.Person', 'Screener.mosel.PostList'],
    extend: 'Ext.app.Controller',
    config: {
        //here we name the elements we need from the page
        refs: {
            view: 'mainView',
            topmenu: 'topmenu',
            navBar: '#navBar',
            patientView: 'patientView',
            doctorView: 'doctorView',
            labOrderForm: 'labOrderForm',
            pharmacyView: 'pharmacyView',
            labOrderView: 'labOrderView',
            pharmacyForm: 'pharmacyForm',
            newPatient: 'newPatient',
            sortPanel: 'sortPanel',
            patientList: '#patientList',
            doctorList: '#doctorList',
            expandDoctorList: '#expandDoctorList',
            currentPatients: '#currentPatients',
            doctorStore: 'doctorStore',
            "'form'+form_num": 'form' + form_num,
            formid: '#formid',
            addPatientButton: '#addPatientButton',
            showPatientsButton: '#showPatientsButton',
            showPharmacyButton: '#showPharmacyButton',
            showLabButton: '#showLabButton',
            showDoctorsButton: '#showDoctorsButton',
            savePatientButton: '#savePatientButton',
            assignButton: '#assignButton',
            sortButton: '#sortButton',
			refreshButton: '#refreshButton',
            drugSubmitButton: '#drugSubmitButton',
            addDrugFormButton: '#addDrugFormButton',
            addLabOrderButton: '#addLabOrderButton',
            removeDrugFormButton: '#removeDrugFormButton',
            sortByNameButton: '#sortByNameButton',
            sortByFIFOButton: '#sortByFIFOButton',
            sortByBMIButton: '#sortByBMIButton',
            removePatientButton: '#removePatientButton',
            removeAllPatientsButton: '#removeAllPatientsButton',
			patientListView: '#patientListViewId'
        },
        //now we define all our listening methods
        control: {
            addDrugFormButton: {
                tap: 'addDrugForm'
            },
            addLabOrderButton: {
                tap: 'addLabOrder'
            },
            addPatientButton: {
                tap: 'addPerson'
            },
            showPatientsButton: {
                tap: 'showPatients'
            },
            savePatientButton: {
                tap: 'savePerson'
            },
            showDoctorsButton: {
                tap: 'showDoctors'
            },
            showPharmacyButton: {
                tap: 'showPharmacy'
            },
            showLabButton: {
                tap: 'showLab'
            },
            assignButton: {
                tap: 'assignPatient'
            },
            sortButton: {
                tap: 'showSort'
            },
            refreshButton: {
                tap: 'refreshList'
            },
            sortByNameButton: {
                tap: 'sortByName'
            },
            sortByFIFOButton: {
                tap: 'sortByFIFO'
            },
            sortByBMIButton: {
                tap: 'sortByBMI'
            },
            patientList: {
                itemtap: 'setCurrentPatient'
            },
            doctorList: {
                itemtap: 'setCurrentDoctor'
            },
            expandDoctorList: {
                itemtap: 'expandCurrentDoctor'
            },
            currentPatients: {
                itemtap: 'currentPatientsTapped'
            },
            removePatientButton: {
                tap: 'removePatient'
            },
            removeAllPatientsButton: {
                tap: 'removeAllPatients'
            },
            removeDrugFormButton: {
                tap: 'removeDrugForm'
            },
            view: {
                init: 'init'
            }
        }
    },
    //adds the patient to the doctor using 'hasmany' association
    addToDoctor: function (patient) {
        doctorid = patient.get('doctorid');
        if (Ext.getStore('doctorStore').getAt(doctorid)) {
            //first we add the association to the patient model is linked to this doctor
            Ext.getStore('doctorStore').getAt(doctorid).patients().add(patient);
            //now we call function to increment number of patients
            Ext.getStore('doctorStore').getAt(doctorid).addPatient();
            Ext.getStore('patientStore').remove(patient);
        }
    },
    updatePatientsWaitingTitle: function () {
        Ext.getCmp('patientsWaiting').setTitle(Ext.getStore('patientStore').getCount() + ' Patients Waiting');
    },
    //called on startup
    init: function () {
        form_num = 0;
        lab_num = 0;
        var list_regEncounter = Ext.create('Screener.model.PostList', {
        	name: "Registration Encounter",
        	description: "Patients encountered Registration",
        	searchQuery: "?encounterType="+ localStorage.regUuidencountertype	
        });
		var store_regEncounter = Ext.create('Screener.store.PostLists');
        store_regEncounter.add(list_regEncounter);
        store_regEncounter.sync();
        store_regEncounter.on('write', function(){
        console.log("--Reg encounter list created--");
		
		var list_scrEncounter = Ext.create('Screener.model.PostList', {
        	name: "Screener Encounter",
        	description: "Patients encountered Screener",
        	searchQuery: "?encounterType="+localStorage.screenerUuidencountertype
        });
		var store_scrEncounter = Ext.create('Screener.store.PostLists');
        store_scrEncounter.add(list_scrEncounter);
        store_scrEncounter.sync();
        store_scrEncounter.on('write', function(){
        console.log("--Scr encounter list created--");
		
		var store_patientList = Ext.create('Screener.store.PatientList',{
		storeId: 'patientStore'});
				store_patientList.getProxy().setUrl(this.getPatientListUrl(store_regEncounter.getData().getAt(0).getData().uuid,store_scrEncounter.getData().getAt(0).getData().uuid));
				//HOST + '/ws/rest/v1/raxacore/patientlist'+'?inList='+store_regEncounter.getData().getAt(0).getData().uuid+'&notInLIst='+store_scrEncounter.getData().getAt(0).getData().uuid+'&encounterType='+localStorage.regUuidencountertype
				store_patientList.load();
				store_patientList.on('load', function(){
				console.log("----list created----");		
			}, this);
		
		
		} ,this);
		
		
		} ,this);
		
        
		
		
		
    },
	
	getPatientListUrl: function (reg_UUID, scr_UUID) {
		return(HOST + '/ws/rest/v1/raxacore/patientlist'+'?inList='+reg_UUID+'&notInLIst='+scr_UUID+'&encounterType='+localStorage.regUuidencountertype);
	},
	
    //add new drug order form 
    addDrugForm: function () {
        form_num++;
        var endOfForm = 5;
        this.getPharmacyForm().insert(endOfForm, {
            xtype: 'drugStore',
            id: 'form' + form_num,
            width: '350px',
            height: '250px'
        });
    },
    removeDrugForm: function () {
        if (form_num > 0) {
            Ext.getCmp('form' + form_num).remove({
                autoDestroy: true
            });
            Ext.getCmp('form' + form_num).hide();
            form_num--;
        }store.getData().getAt(0).getData().uuid
    },
    addLabOrder: function () {
        lab_num++;
        var endOfForm = 6;
        this.getLabOrderForm().insert(endOfForm, {
            xtype: 'labStore',
            id: 'lab' + lab_num,
            width: '350px',
            height: '70px'
        });
    },
    //opens form for creating new patient
    addPerson: function () {
        if (!this.newPatient) {
            this.newPatient = Ext.create('Screener.view.NewPatient');
            Ext.Viewport.add(this.newPatient);
        }
        //set new FIFO id so patients come and go in the queue!
        //this.getFormid().setValue(this.totalPatients);
        this.newPatient.show();
    },
    //adds new person to the NewPersons store
    savePerson: function () {
        var formp = Ext.getCmp('newPatient').saveForm();
       
        if (formp.givenname && formp.familyname && formp.choice) {
            var person = Ext.create('Screener.model.Person',{
                gender: formp.choice,
                names: [{
                    givenName: formp.givenname,
                    familyName: formp.familyname
                }]
            });
            var store = Ext.create('Screener.store.NewPersons');
            store.add(person);
            store.sync();
            store.on('write', function(){
			   this.getidentifierstype(store.getData().getAt(0).getData().uuid)
            } ,this);
            Ext.getCmp('newPatient').hide();
            Ext.getCmp('newPatient').reset();
            return store;
        }
    },
    // get IdentifierType using IdentifierType store 
    getidentifierstype:function(personUuid){
        var identifiers = Ext.create('Screener.store.IdentifierType')
        identifiers.load();
        identifiers.on('load',function(){
            this.getlocation(personUuid,identifiers.getAt(0).getData().uuid)
        },this);
    },
    // get Location using Location store
    getlocation:function(personUuid,identifierType){
        var locations = Ext.create('Screener.store.Location')
        locations.load();
        locations.on('load',function(){
            this.makePatient(personUuid,identifierType,locations.getAt(0).getData().uuid)
        },this)
    },
    // creates a new patient using NewPatients store 
    makePatient:function(personUuid,identifierType,location){
        var patient = Ext.create('Screener.model.NewPatient',{
            person : personUuid,
            identifiers : [{
                identifier : Util.getPatientIdentifier().toString(),
                identifierType : identifierType,
                location : location,
                preferred : true
            }]
        });
        var PatientStore = Ext.create('Screener.store.NewPatients')
        PatientStore.add(patient);
        PatientStore.sync();
        PatientStore.on('write', function(){
        } ,this)
    },
    //function to show screen with patient list
    showPatients: function () {
        if (!this.patientView) {
            this.patientView = Ext.create('Screener.view.PatientView');
        }
        this.getDoctorList().deselectAll();
        this.getView().push(this.patientView);
    },
    //function to show screen with doctor list
    showDoctors: function () {
        if (!this.doctorView) {
            this.doctorView = Ext.create('Screener.view.DoctorView');
        }
        this.getExpandDoctorList().deselectAll();
        this.getView().push(this.doctorView);
    },
    //function to show screen with pharmacy list
    showPharmacy: function () {
        if (!this.pharmacyView) {
            this.pharmacyView = Ext.create('Screener.view.PharmacyView');
            form_num = 0;
        }
        this.getView().push(this.pharmacyView);
        while (form_num > 0) {
            Ext.getCmp('form' + form_num).remove({
                autoDestroy: true
            });
            Ext.getCmp('form' + form_num).hide();
            form_num--;
        }
    },
    showLab: function () {
        if (!this.labOrderView) {
            this.labOrderView = Ext.create('Screener.view.LabOrderView');
        }
        this.getView().push(this.labOrderView);
        while (lab_num > 0) {
            Ext.getCmp('lab' + lab_num).remove({
                autoDestroy: true
            });
            Ext.getCmp('lab' + lab_num).hide();
            lab_num--;
        }
    },
    //keeping track of which patient/doctor is currently selected
    //if both are selected, enable the ASSIGN button
    setCurrentPatient: function (list, index, target, record) {
        this.currentPatientIndex = index;
        if (this.getDoctorList().hasSelection()) {
            this.getAssignButton().enable();
        }
    },
    setCurrentDoctor: function (list, index, target, record) {
        this.currentDoctorIndex = index;
        if (this.getPatientList().hasSelection()) {
            this.getAssignButton().enable();
        }
    },
    //shows panel, allows us to choose what we want to sort by
    showSort: function () {
        if (!this.sortView) {
            this.sortView = Ext.create('Screener.view.Sort');
            Ext.Viewport.add(this.sortView);
        }
        this.getSortPanel().show();
    },
    sortByName: function () {
        Ext.getStore('patientStore').sort('lastname');
        this.getSortPanel().hide();
    },
    sortByFIFO: function () {
        Ext.getStore('patientStore').sort('id');
        this.getSortPanel().hide();
    },
    sortByBMI: function () {
        Ext.getStore('patientStore').sort('bmi');
        this.getSortPanel().hide();
    },
	refreshList: function() {
		console.log(Ext.getStore('patientStore'))
	},
    //if patient and doctor are both selected, removes patient from list, increases numpatients for doctor,
    //and adds patient to the patients() store in the doctor
    assignPatient: function () {
        currentNumPatients = Ext.getStore('doctorStore').getAt(this.currentDoctorIndex).get('numpatients') + 1;
        Ext.getStore('doctorStore').getAt(this.currentDoctorIndex).set('numpatients', currentNumPatients);
        Ext.getStore('doctorStore').getAt(this.currentDoctorIndex).patients().add(Ext.getStore('patientStore').getAt(this.currentPatientIndex));
        Ext.getStore('patientStore').getAt(this.currentPatientIndex).set('patientid', this.currentDoctorIndex);
        Ext.getStore('patientStore').removeAt(this.currentPatientIndex);
        this.getPatientList().deselectAll();
        this.getDoctorList().deselectAll();
        this.getAssignButton().disable();
        
    },
    //opens the current doctor's waiting list
    expandCurrentDoctor: function (list, index, target, record) {
        this.currentDoctorIndex = index;
        this.getCurrentPatients().setStore(Ext.getStore('doctorStore').getAt(index).patients());
        this.getRemoveAllPatientsButton().enable();
    },
    //if a current patient is selected, allow us to remove it
    currentPatientsTapped: function (list, index, target, record) {
        this.currentPatientIndex = index;
        this.getRemovePatientButton().enable();
    },
    //removes one patient from the current doctor
    removePatient: function () {
        objectRef = this;
        Ext.Msg.confirm("Confirmation", "Are you sure you want to remove selected patient?", function (btn) {
            if (btn == 'yes') {
                objectRef.removeAPatient(Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).patients().getAt(objectRef.currentPatientIndex));
                numPatients = Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).get('numpatients');
                Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).set('numpatients', numPatients - 1);
                Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).patients().removeAt(objectRef.currentPatientIndex);
                objectRef.getRemovePatientButton().disable();
            } else {

            }
        });
    },
    //helper function to remove a single patient
    removeAPatient: function (patient) {
        patient.set('doctorid', -1);
        Ext.getStore('patientStore').add(patient);
    },
    //removes all patients from the current doctor
    removeAllPatients: function () {
        objectRef = this;
        Ext.Msg.confirm("Confirmation", "Are you sure you want to remove all patients?", function (btn) {
            if (btn == 'yes') {
                Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).patients().each(objectRef.removeAPatient);
                for (i = 0; i < Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).get('numpatients'); i++) {
                    Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).patients().removeAt(0);
                }
                Ext.getStore('doctorStore').getAt(objectRef.currentDoctorIndex).set('numpatients', 0);
            } else {

            }
        });
    }
});
