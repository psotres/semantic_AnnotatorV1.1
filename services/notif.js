/**
 * Created by Mac on 16/09/2017.
 */

var api=require('./api');
var mqtt=require('./mqtt_pxy');
var dataStructureFile=require('./dataStructure');
var notif=function (message)
{
    if (message['pc']['m2m:sgn'])
    {
       // console.log("Notification =",message['pc']['m2m:sgn'])
        var resourcePath=message['pc']['m2m:sgn']['sur'];
        var resourceName=getNewResourcePath(resourcePath);
        if (message['pc']['m2m:sgn']['nev']['rep']['m2m:cnt'])   //Notif--New container have been created--Subscribe CNT--Make MQTT subscription
        {
            var newcnt = message['pc']['m2m:sgn']['nev']['rep']['m2m:cnt'];
            var fullresourceName = resourceName + '/' + newcnt['rn'];
            var form = {'cnt': fullresourceName};
            var dict={'rn':fullresourceName,'prn':resourceName}
            api.Resourcesubscription(fullresourceName, function (response)
            {
                api.doTopicSubscription(fullresourceName)
            })
        }
        else if(message['pc']['m2m:sgn']['nev']['rep']['m2m:cin'])                //Notif--New contentInstance have been created. parse SMD and Update
        {

            var cin=message['pc']['m2m:sgn']['nev']['rep']['m2m:cin'];
            var rootparent=message['pc']['m2m:sgn']['sur']
            var rootparentsplit=rootparent.split('/');
            var subscriptionresourceName='/'+rootparentsplit[rootparentsplit.length-2];
            rootparent=rootparent.replace('/'+rootparentsplit[rootparentsplit.length-1],'');
            subscriptionresourceName=subscriptionresourceName.replace('/','');
            var prn=retrivalParentResourceURI(rootparent);
            var smdminus='/'+rootparentsplit[rootparentsplit.length-2];
            var smdURI=rootparent.replace(smdminus,'');
            smdminus='/'+rootparentsplit[rootparentsplit.length-1];
            rootparent=rootparent.replace(smdminus,'');
            if(prn.toLowerCase()=="parkingspot")
            {
                if (subscriptionresourceName=="info")
                {

                    createDescription(cin,prn,smdURI);

                    var statusrootparent=rootparent.replace(subscriptionresourceName,'status');
                    api.latestcin(statusrootparent,function (res)
                    {
                        if(res['m2m:cin'])
                        {
                          //  console.log("Semantics for cin",res['m2m:cin']);

                            createDescription(res['m2m:cin'],prn,smdURI)
                        }


                    })
                }
                else if(subscriptionresourceName=="status")
                {
                   // var parentResource=retrivalParentResourceURI(message['pc']['m2m:sgn']['sur'])

                   // console.log('status cin=',cin)
                    createDescription(cin,prn,smdURI);

                    var inforootparent=rootparent.replace(subscriptionresourceName,'info');

                    api.latestcin(inforootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined)
                        {
                          //  console.log('info latest cin=',res['m2m:cin']);
                            var resm2mcin=JSON.parse(res['m2m:cin']['con']);
                            res['m2m:cin']['con']=resm2mcin
                           // console.log(resm2mcin);
                            createDescription(res['m2m:cin'], prn, smdURI);
                        }

                    })
                }
            }
            else if(prn.toLowerCase()=="offstreetparking")
            {
               // var smdprnresource=rootparent.replace(rootparentsplit[rootparentsplit.length-1],'');
                if (subscriptionresourceName=="info")
                {

                    createDescription(cin,prn,smdURI);
                    var availableSpotNumrootparent=rootparent.replace(subscriptionresourceName,'availableSpotNum');
                    api.latestcin(availableSpotNumrootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                    var aggregateRatingrootparent=rootparent.replace(subscriptionresourceName,'aggregateRating');
                    api.latestcin(availableSpotNumrootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'],prn, smdURI)
                        }
                    })

                }
                else if(subscriptionresourceName=="availableSpotNum")
                {
                    // var parentResource=retrivalParentResourceURI(message['pc']['m2m:sgn']['sur'])
                    createDescription(cin,prn,smdURI);
                    var inforootparent=rootparent.replace(subscriptionresourceName,'info');
                    api.latestcin(inforootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                    var aggregateRatingrootparent=rootparent.replace(subscriptionresourceName,'aggregateRating');
                    api.latestcin(availableSpotNumrootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                }
                else if(subscriptionresourceName=="aggregateRating")
                {
                    createDescription(cin,prn,smdURI);
                    var inforootparent=rootparent.replace(subscriptionresourceName,'info');
                    api.latestcin(inforootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                    var availableSpotNumrootparent=rootparent.replace(subscriptionresourceName,'availableSpotNum');
                    api.latestcin(availableSpotNumrootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {
                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                }
                else
                {
                    createDescription(cin,prn,smdURI)
                }
            }
            else if(prn.toLowerCase()=="onstreetparking")
            {
                if (subscriptionresourceName=="info")
                {

                    createDescription(cin,prn,rootparent);
                    var availableSpotNumrootparent=rootparent.replace(subscriptionresourceName,'availableSpotNum');
                    api.latestcin(availableSpotNumrootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined)
                        {

                            createDescription(res['m2m:cin'],prn,smdURI)
                        }
                    })

                }
                else if(subscriptionresourceName=="availableSpotNum")
                {
                    // var parentResource=retrivalParentResourceURI(message['pc']['m2m:sgn']['sur'])
                    createDescription(cin,prn,rootparent);
                    var inforootparent=rootparent.replace(subscriptionresourceName,'info');
                    api.latestcin(inforootparent,function (res)
                    {
                        if(res['m2m:dbg']==undefined) {

                            createDescription(res['m2m:cin'], prn,smdURI)
                        }
                    })
                }
            }


        }
        else if(message['pc']['m2m:sgn']['nev']['rep']['m2m:sub'])
        {
            var res=resourceName.split("/").join("+");
            api.doTopicSubscription(res)
            return
        }

    }
}
var createDescription=function (cin,rpn,smdprnresource)
{
   // smdprnresource=smdprnresource.replace((smdprnresource.split('/')[smdprnresource.split('/').length-1]+"/"),'');

    api.semanticDescription(smdprnresource,function (str)
    {
        var data=JSON.parse(str);
       // console.log('m2m:smd',data)
        if (data['m2m:smd'])
        {
            var sd=data['m2m:smd']['dsp'];
            sd= Base64.decode(sd);
            var newSD=ParsingSDFILE(cin,rpn,sd);
          //  console.log("New SMD= ",newSD);
            newSD=Base64.encode(newSD);
            var form={'rn':smdprnresource,'dspt':newSD};
            api.UpdateResourceAnnotation(form,function (res)
            {
                console.log('UpdateResourceAnnotation');
            })
        }
        else
        {
            var dspt = makeDSPTOnStreetParking(rpn);
            var form = {'rn': smdprnresource, 'dsp': Base64.encode(dspt) };
          //  console.log("form=",form)
            api.ResourceAnnotation(form, function (response)
            {
              //  console.log('smd Response=',response)
                var sd=(JSON.parse(response))['m2m:smd']['dsp'];
                sd= Base64.decode(sd);
                var newSD=ParsingSDFILE(cin,rpn,sd);
                newSD=Base64.encode(newSD);
                var form={'rn':smdprnresource,'dspt':newSD};
                api.UpdateResourceAnnotation(form,function (res)
                {

                    // console.log(res);
                })
            })
        }
    })
}
var retrivalParentResourceURI=function(prn)
{
    var rootparent=prn
    var rootparentsplit=rootparent.split('/');
    var subscriptionresourceName='/'+rootparentsplit[rootparentsplit.length-2]
    rootparent=rootparent.replace(subscriptionresourceName,'');
    var RootParent=rootparent.split('/')[3];
    return RootParent;
}
var getNewResourcePath=function(sur,rn)
{
    var sur1=sur
    var rootparentsplit=sur1.split('/');
    var subscriptionresourceName='/'+rootparentsplit[rootparentsplit.length-1]
    sur1=sur1.replace(subscriptionresourceName,'');
    return sur1;
}
function squash(arr)
{
    var tmp = [];
    for(var i = 0; i < arr.length; i++){
        if(tmp.indexOf(arr[i]) == -1){
            tmp.push(arr[i]);
        }
    }
    return tmp;
}
var makeDSPTOnStreetParking=function(parent)
{
    var fs = require('fs');
    var dspt="";
    if (parent.toLowerCase()==("parkingSpot").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/smartparking/ParkingSpot.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;
    }
    else if (parent.toLowerCase()==("onStreetParking").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/smartparking/OnStreetParking.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;


    }
    else if (parent.toLowerCase()==("offStreetParking").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/smartparking/OffStreetParking.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;

    }
    else if (parent.toLowerCase()==("busstop").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/busInformationSystem/busStop.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;

    }
    else if (parent.toLowerCase()==("busline").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/busInformationSystem/busLine.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;

    }
    else if (parent.toLowerCase()==("busestimation").toLowerCase())
    {
        var parkingSpotmodel  = fs.readFileSync('./model/busInformationSystem/busEstimation.xml', 'utf-8');
        dspt=parkingSpotmodel;
        return dspt;

    }
    else
    {
        dspt=""
        return dspt;
    }
}
function ParsingSDFILE(cinObject,rootParent,document) {
    var xmlDoc = document;
    var xmldom = require('xmldom');
    var DOMParser = xmldom.DOMParser;
    var semanticDescriptor = new DOMParser().parseFromString(xmlDoc, "text/xml"); //parsing xml
    var m2mcin = cinObject['con']
    var resourceName = cinObject.rn.toLowerCase(); //getting out rn
   // var m2mcin = cinObject.con; //getting out cin
    if (rootParent.toLowerCase() == "parkingspot")
    {
        if(m2mcin["status"] == undefined )
        {

            //console.log('object')
            if (m2mcin['name'] != undefined)
            {
                parseNode(semanticDescriptor.getElementsByTagName("park:hasName")[0], semanticDescriptor, m2mcin['name'])
            }
            if (m2mcin['id'] != undefined) {
                parseNode(semanticDescriptor.getElementsByTagName("park:hasId")[0], semanticDescriptor, m2mcin['id'])
            }
            if (m2mcin['type'] != undefined) {
                parseNode(semanticDescriptor.getElementsByTagName("park:hasType")[0], semanticDescriptor, m2mcin['type'])

            }
            if (m2mcin['status'] != undefined)
            {
                parseNode(semanticDescriptor.getElementsByTagName("park:hasStatusValue")[0], semanticDescriptor, m2mcin['status'])
                var datestring=new Date().toISOString()
                parseNode(semanticDescriptor.getElementsByTagName("park:hasStatusTimeStamp")[0], semanticDescriptor, datestring)
            }
            if (m2mcin['dateModified'] != undefined) {
                parseNode(semanticDescriptor.getElementsByTagName("park:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
            }

            if (m2mcin['category'] != undefined) {
                var ln = m2mcin['category'].length;
                clearNodes("park:hasCategory", semanticDescriptor);
                createNode("park:hasCategory", semanticDescriptor, ln, "string", "park:ParkingSpot", true)
                var nodes = semanticDescriptor.getElementsByTagName("park:hasCategory");
                for (var i = 0; i < ln; i++) {
                    console.log(m2mcin['category'][i]);
                    parseNode(nodes[i], semanticDescriptor, m2mcin['category'][i])
                }
            }
            if (m2mcin['refParkingSite'] != undefined) {
                var ln = m2mcin['refParkingSite'].length;
                clearNodes("park:hasRefParkingSite", semanticDescriptor);
                createNode("park:hasRefParkingSite", semanticDescriptor, ln, "string", "park:ParkingSpot", true)
                var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSite");
                for (var i = 0; i < ln; i++) {
                    parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSite'][i])
                }
                var ParkingSpot = semanticDescriptor.getElementsByTagName("park:ParkingSpot")[0];
                var newvalue = 'http://www.semanticweb.org/wise-iot/ontologies/2017/1/parkingOntology.owl#' + m2mcin['refParkingSite'][0];
                updatenodeAtrribute(ParkingSpot, semanticDescriptor, "rdf:about", newvalue);

            }
            if (m2mcin['location'] != undefined) {
                var ln = m2mcin['location']['coordinates'].length;
                clearNodes("park:hasLocation", semanticDescriptor);
                createNode("park:hasLocation", semanticDescriptor, 1, "string", "park:ParkingSpot", false)
                createNode("park:hasLocationType", semanticDescriptor, 1, "string", "park:hasLocation", true)
                parseNode(semanticDescriptor.getElementsByTagName("park:hasLocationType")[0], semanticDescriptor, m2mcin['location']['type'])
                if (typeof m2mcin['location']['coordinates'][0] === "object") {
                    for (var i = 0; i < ln; i++) {
                        dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
                        literaldataTypesNestNodes = ["double", "double"]
                        createNestedNode(dictofNodeName, m2mcin['location']['coordinates'][i], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);
                    }
                }
                else {
                    dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
                    literaldataTypesNestNodes = ["double", "double"]
                    console.log("Coordinates", m2mcin['location']['coordinates']);
                    createNestedNode(dictofNodeName, m2mcin['location']['coordinates'], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);
                }

            }
        }
        else
        {

                //console.log('stringno=',m2mcin);
                parseNode(semanticDescriptor.getElementsByTagName("park:hasStatusValue")[0], semanticDescriptor, m2mcin)
                var datestring=new Date().toISOString() ;
                console.log('datestring=',datestring)
                parseNode(semanticDescriptor.getElementsByTagName("park:hasStatusTimeStamp")[0], semanticDescriptor, datestring)

        }
        var newsmd = semanticDescriptor
        var XMLSerializer = xmldom.XMLSerializer;
        var newSD = new XMLSerializer().serializeToString(newsmd);
        return newSD

    }
    else if (rootParent.toLowerCase() == "onstreetparking") {
        if (m2mcin.type != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasType")[0], semanticDescriptor, m2mcin['type'])
        }
        if (m2mcin['id'] != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasId")[0], semanticDescriptor, m2mcin['id'])
        }
        if (m2mcin.name != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasName")[0], semanticDescriptor, m2mcin['name'])
        }
        if (m2mcin.dateModified != undefined) {
            console.log("datemodified");
            parseNode(semanticDescriptor.getElementsByTagName("park:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
        }
        if (m2mcin['category'] != undefined) {
            console.log("category");
            var ln = m2mcin['category'].length;
            if (ln != semanticDescriptor.getElementsByTagName("park:hasCategory").length) {
                clearNodes("park:hasCategory", semanticDescriptor);
                createNode("park:hasCategory", semanticDescriptor, ln, "string", "park:OnStreetParking", true)
            }
            var nodes = semanticDescriptor.getElementsByTagName("park:hasCategory");
            //console.log("category nodes= ", ln);
            for (var i = 0; i < ln; i++) {
               // console.log(m2mcin['category'][i])
                parseNode(nodes[i], semanticDescriptor, m2mcin['category'][i])
            }
        }
        if (m2mcin.areBordersMarked != undefined) {
           // console.log("areBordersMarked");
            parseNode(semanticDescriptor.getElementsByTagName("park:hasAreBordersMarked")[0], semanticDescriptor, m2mcin['areBordersMarked'])
        }
        if (m2mcin.allowedVehicleType != undefined) {
           // console.log("allowedVehicleType");
            parseNode(semanticDescriptor.getElementsByTagName("park:hasAllowedVehicleType")[0], semanticDescriptor, m2mcin['allowedVehicleType'])
        }
        if (m2mcin.requiredPermit != undefined) {
           // console.log("requiredPermit");
            var ln = m2mcin['requiredPermit'].length;
            clearNodes("park:hasRequiredPermit", semanticDescriptor);
            createNode("park:hasRequiredPermit", semanticDescriptor, ln, "string", "park:OnStreetParking", true)
            var nodes = semanticDescriptor.getElementsByTagName("park:hasRequiredPermit");
            for (var i = 0; i < nodes.length; i++) {
                parseNode(nodes[i], semanticDescriptor, m2mcin['requiredPermit'][i])
            }
        }
        if (m2mcin.chargeType != undefined)
        {
            //console.log("chargeType");
            var ln = m2mcin['chargeType'].length;
            clearNodes("park:hasChargeType", semanticDescriptor);
            createNode("park:hasChargeType", semanticDescriptor, ln, "string", "park:OnStreetParking", true)
            var nodes = semanticDescriptor.getElementsByTagName("park:hasChargeType");
            for (var i = 0; i < nodes.length; i++) {
                parseNode(nodes[i], semanticDescriptor, m2mcin['chargeType'][i])
            }
        }
        if (m2mcin.occupancyDetectionType != undefined) {
            //console.log("occupancyDetectionType");
            parseNode(semanticDescriptor.getElementsByTagName("park:hasOccupancyDetectionType")[0], semanticDescriptor, m2mcin['occupancyDetectionType'])
        }
        if (m2mcin.totalSpotNumber != undefined) {
            //console.log("totalSpotNumber");
            parseNode(semanticDescriptor.getElementsByTagName("park:hasTotalSpotNumber")[0], semanticDescriptor, m2mcin['totalSpotNumber'])
        }
        if (m2mcin.refParkingSpot != undefined) {
           // console.log("refParkingSpot");
            var ln = m2mcin['refParkingSpot'].length;
            clearNodes("park:hasRefParkingSpot", semanticDescriptor);
            createNode("park:hasRefParkingSpot", semanticDescriptor, ln, "string", "park:onStreetParking", true)
            var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSpot");
            for (var i = 0; i < nodes.length; i++) {
                parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSpot'][i])
            }
            var offStreetNode = semanticDescriptor.getElementsByTagName("park:OnStreetParking")[0];
            var newvalue = 'http://www.semanticweb.org/wise-iot/ontologies/2017/1/parkingOntology.owl#' + m2mcin['refParkingSpot'][0];
            updatenodeAtrribute(offStreetNode, semanticDescriptor, "rdf:about", newvalue);


        }
        if (m2mcin.availableSpotNumber != undefined) {
            var ln = m2mcin['availableSpotNumber'].length;
            clearNodes("park:hasAvailableSpotNumber", semanticDescriptor);
            var dictofNodeName = [["park:hasValueOfAvailableSpotNumber", "park:hasTimeStampOfAvailableSpotNumber"], [true, true]];
            var literaldataTypesNestNodes = ["string", "string"]
            if (typeof m2mcin['availableSpotNumber'][0] === "object") {
                for (var i = 0; i < ln; i++) {
                    createNestedNode(dictofNodeName, m2mcin['availableSpotNumber'][i], "park:hasAvailableSpotNumber", "park:OnStreetParking", semanticDescriptor, literaldataTypesNestNodes);
                }
            }
            else {
                createNestedNode(dictofNodeName, m2mcin['availableSpotNumber'], "park:hasAvailableSpotNumber", "park:OnStreetParking", semanticDescriptor, literaldataTypesNestNodes);
            }

        }
        if (m2mcin.permitActiveHours != undefined)                         //make rdf/xml class type for permitActiveHours sensor information
        {
          //  console.log("permitActiveHours")
            var ln = m2mcin['permitActiveHours'].length;
            clearNodes("park:hasPermiteActiveHours", semanticDescriptor);
            var dictofNodeName = [["park:hasValueOfAvailableSpotNumber", "park:hasTimeStampOfAvailableSpotNumber"], [true, true]];
            var literaldataTypesNestNodes = ["string", "string"]
            if (typeof m2mcin['permitActiveHours'][0] === "object") {
                for (var i = 0; i < ln; i++) {
                    var array = dictToArray(m2mcin['permitActiveHours'][i], true);
                  //  console.log("objToArray=", array)
                    createNestedNode(dictofNodeName, array, "park:hasPermiteActiveHours", "park:OnStreetParking", semanticDescriptor, literaldataTypesNestNodes);
                }
            }
            else {
                createNestedNode(dictofNodeName, m2mcin['permitActiveHours'], "park:hasPermiteActiveHours", "park:OnStreetParking", semanticDescriptor, literaldataTypesNestNodes);
            }

        }
        if (m2mcin.location != undefined) {
            var ln = m2mcin['location']['coordinates'].length;
            clearNodes("park:hasCoordinates", semanticDescriptor);
            parseNode(semanticDescriptor.getElementsByTagName("park:hasLocationType")[0], semanticDescriptor, m2mcin['location']['type'])
            if (typeof m2mcin['location']['coordinates'][0] === "object") {
                for (var i = 0; i < ln; i++) {
                    dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
                    literaldataTypesNestNodes = ["double", "double"]
                    createNestedNode(dictofNodeName, m2mcin['location']['coordinates'][i], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);

                }
            }
            else {
                dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
                literaldataTypesNestNodes = ["double", "double"]
                createNestedNode(dictofNodeName, m2mcin['location']['coordinates'], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);
            }
        }

        var XMLSerializer = xmldom.XMLSerializer;
        var newSD = new XMLSerializer().serializeToString(semanticDescriptor);
        return newSD
    }
    else if (rootParent.toLowerCase() == "offstreetparking") {
        if (m2mcin.name != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasName")[0], semanticDescriptor, m2mcin['name'])
        }
        if (m2mcin.id != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasId")[0], semanticDescriptor, m2mcin['id'])
        }
        if (m2mcin.type != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasType")[0], semanticDescriptor, m2mcin['type'])

        }
        if (m2mcin.status != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("park:hasStatusValue")[0], semanticDescriptor, m2mcin['status'])
        }
        if (m2mcin.refParkingSpot != undefined) {
            if (typeof m2mcin["refParkingSpot"] === "object") {
                var ln = m2mcin['refParkingSpot'].length;
                clearNodes("park:hasRefParkingSpot", semanticDescriptor);
                createNode("park:hasRefParkingSpot", semanticDescriptor, ln, "string", "park:OffStreetParking", true)
                var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSpot");
                for (var i = 0; i < nodes.length; i++) {
                    parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSpot'][i])
                }
                var offStreetNode = semanticDescriptor.getElementsByTagName("park:OffStreetParking")[0];
                var newvalue = 'http://www.semanticweb.org/wise-iot/ontologies/2017/1/parkingOntology.owl#' + m2mcin['refParkingSpot'][0];
                updatenodeAtrribute(offStreetNode, semanticDescriptor, "rdf:about", newvalue);
            }
            else {
                clearNodes("park:hasRefParkingSpot", semanticDescriptor);
                createNode("park:hasRefParkingSpot", semanticDescriptor, 1, "string", "park:OffStreetParking", true)
                var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSpot");
                parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSpot'])
                var offStreetNode = semanticDescriptor.getElementsByTagName("park:OffStreetParking")[0];
                var newvalue = 'http://www.semanticweb.org/wise-iot/ontologies/2017/1/parkingOntology.owl#' + m2mcin['refParkingSpot'];
                updatenodeAtrribute(offStreetNode, semanticDescriptor, "rdf:about", newvalue);

            }


        }
         if (m2mcin.location != undefined) {
        var ln = m2mcin['location']['coordinates'].length;
        clearNodes("park:hasCoordinates", semanticDescriptor);
        // createNode("park:hasLocation",semanticDescriptor,1,"string","park:OffStreetParking",false)
        // createNode("park:hasLocationType",semanticDescriptor,1,"string","park:hasLocation",true)
            parseNode(semanticDescriptor.getElementsByTagName("park:hasLocationType")[0], semanticDescriptor, m2mcin['location']['type'])
            if (typeof m2mcin['location']['coordinates'][0] === "object") {
           // console.log("coordinatesss")
            for (var i = 0; i < ln; i++) {
                dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
                literaldataTypesNestNodes = ["double", "double"]
                createNestedNode(dictofNodeName, m2mcin['location']['coordinates'][i], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);

              }
            }
             else {
            dictofNodeName = [["park:hasLongitude", "park:hasLatitude"], [true, true]]
            literaldataTypesNestNodes = ["double", "double"]
            createNestedNode(dictofNodeName, m2mcin['location']['coordinates'], "park:hasCoordinates", "park:hasLocation", semanticDescriptor, literaldataTypesNestNodes);
          }
         }
        if (m2mcin.availableSpotNumber != undefined) {
        var ln = m2mcin['availableSpotNumber'].length;
        clearNodes("park:hasAvailableSpotNumber", semanticDescriptor);
        var dictofNodeName = [["park:hasValueOfAvailableSpotNumber", "park:hasTimeStampOfAvailableSpotNumber"], [true, true]];
        var literaldataTypesNestNodes = ["string", "string"]
        for (var i = 0; i < ln; i++) {
            createNestedNode(dictofNodeName, m2mcin['availableSpotNumber'][i], "park:hasAvailableSpotNumber", "park:OffStreetParking", semanticDescriptor, literaldataTypesNestNodes);
        }
         }
        if (m2mcin.contactPoint != undefined) {
        if (typeof m2mcin["contactPoint"] === "object") {
            var ln = m2mcin['contactPoint'].length;
            clearNodes("park:hasContactPoint", semanticDescriptor);
            var dictofNodeName = [["park:hasTelePhone", "park:hasContactType", "hasContactOption", "hasAreaServed"], [true, true, true, true]];
            var literaldataTypesNestNodes = ["string", "string", "string", "string"]
            for (var i = 0; i < ln; i++) {
                var valuedict = [m2mcin['contactPoint'][i], "customer service", "TollFree", "US"]
                createNestedNode(dictofNodeName, valuedict, "park:hasContactPoint", "park:OffStreetParking", semanticDescriptor, literaldataTypesNestNodes);
            }
        }
        else {
            clearNodes("park:hasContactPoint", semanticDescriptor);
            var dictofNodeName = [["park:hasTelePhone", "park:hasContactType", "hasContactOption", "hasAreaServed"], [true, true, true, true]];
            var literaldataTypesNestNodes = ["string", "string", "string", "string"]
            var valuedict = [m2mcin['contactPoint'], "customer service", "TollFree", "US"]
            createNestedNode(dictofNodeName, valuedict, "park:hasContactPoint", "park:OffStreetParking", semanticDescriptor, literaldataTypesNestNodes);

        }

         }
        if (m2mcin.dateModified != undefined) {
        parseNode(semanticDescriptor.getElementsByTagName("park:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
        }
        if (m2mcin.openingHours != undefined) {

        parseNode(semanticDescriptor.getElementsByTagName("park:hasOpeningHours")[0], semanticDescriptor, m2mcin['openingHours'])
        }
        if (m2mcin.category != undefined) {
        var ln = m2mcin['category'].length;
        clearNodes("park:hasCategory", semanticDescriptor);
        createNode("park:hasCategory", semanticDescriptor, ln, "string", "park:OffStreetParking", true)
        var nodes = semanticDescriptor.getElementsByTagName("park:hasCategory");
        for (var i = 0; i < nodes.length; i++) {
            parseNode(nodes[i], semanticDescriptor, m2mcin['category'][i])
        }
        }
        if (m2mcin.refParkingSite != undefined) {
        if (typeof m2mcin["refParkingSpot"] === "object") {
            var ln = m2mcin['refParkingSite'].length;
            clearNodes("park:hasRefParkingSite", semanticDescriptor);
            createNode("park:hasRefParkingSite", semanticDescriptor, ln, "string", "park:OffStreetParking", true)
            var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSite");
            for (var i = 0; i < nodes.length; i++) {
                parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSite'][i])
            }

        }
        else {
            clearNodes("park:hasRefParkingSite", semanticDescriptor);
            createNode("park:hasRefParkingSite", semanticDescriptor, 1, "string", "park:OffStreetParking", true)
            var nodes = semanticDescriptor.getElementsByTagName("park:hasRefParkingSite");
            parseNode(nodes[i], semanticDescriptor, m2mcin['refParkingSite'])
            var offStreetNode = semanticDescriptor.getElementsByTagName("park:OffStreetParking")[0];
            var newvalue = 'http://www.semanticweb.org/wise-iot/ontologies/2017/1/parkingOntology.owl#' + m2mcin['refParkingSite'];
            updatenodeAtrribute(offStreetNode, semanticDescriptor, "rdf:about", newvalue);
        }
        }
        if (m2mcin.aggregateRating != undefined)
        {
        if (typeof m2mcin['aggregateRating'] !== "object") {
            clearNodes("park:hasAggregatedRating", semanticDescriptor);
            var dictofNodeName = [["park:hasBestRating", "park:hasRatingValue", "park:hasRatingCount"], [true, true, true]];
            var literaldataTypesNestNodes = ["string", "string", "string"]
            var dictValue = ["", m2mcin['aggregateRating'], ""]
            createNestedNode(dictofNodeName, dictValue, "park:hasAggregatedRating", "park:OffStreetParking", semanticDescriptor, literaldataTypesNestNodes);

        }
        else {
            var ln = m2mcin['aggregateRating'].length;     //length of Aggregated String
            clearNodes("park:hasAggregatedRating", semanticDescriptor);
            var dictofNodeName = [["park:hasBestRating", "park:hasRatingValue", "park:hasRatingCount"], [true, true, true]];
            var literaldataTypesNestNodes = ["string", "string", "string"]
            for (var i = 0; i < ln; i++) {
                createNestedNode(dictofNodeName, m2mcin['aggregateRating'][i], "park:hasAggregatedRating", "park:OffStreetParking", semanticDescriptor, literaldataTypesNestNodes);
            }
        }
        }
        if (m2mcin.requiredPermit != undefined) {
       // console.log("requiredPermit");
        var ln = m2mcin['requiredPermit'].length;
        clearNodes("park:hasRequiredPermit", semanticDescriptor);
        createNode("park:hasRequiredPermit", semanticDescriptor, ln, "string", "park:OffStreetParking", true)
        var nodes = semanticDescriptor.getElementsByTagName("park:hasRequiredPermit");
        for (var i = 0; i < nodes.length; i++) {
            parseNode(nodes[i], semanticDescriptor, m2mcin['requiredPermit'][i])
        }
        }
         var newsmd = semanticDescriptor
         var XMLSerializer = xmldom.XMLSerializer;
         var newSD = new XMLSerializer().serializeToString(newsmd);
         return newSD
    }
    else if(rootParent.toLowerCase()=="busstop")
    {
        if (m2mcin.name != undefined ) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasName")[0], semanticDescriptor, m2mcin['name'])
        }
        if (m2mcin['id'] != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasId")[0], semanticDescriptor, m2mcin['id'])
        }
        if (m2mcin['refBuses'] != undefined )
        {
           // console.log("refBuses");
            var ln=m2mcin['refBuses'].length;
            clearNodes("smartBus:hasRefBuses",semanticDescriptor);
            createNode("smartBus:hasRefBuses",semanticDescriptor,ln,"string","smartBus:busStop",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRefBuses");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['refBuses'][i])
            }
        }
        if (m2mcin['shortId'] != undefined ) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasShortId")[0], semanticDescriptor, m2mcin['shortID'])
        }
        if (m2mcin['busStopCount'] != undefined )
        {
           // console.log("busStopCount");
            var ln=m2mcin['busStopCount'].length;
            clearNodes("smartBus:hasBusStopCount",semanticDescriptor);
            createNode("smartBus:hasBusStopCount",semanticDescriptor,ln,"string","smartBus:busStop",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasBusStopCount");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['busStopCount'][i])
            }
        }
        if (m2mcin['location'] != undefined ) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasLatitude")[0], semanticDescriptor, m2mcin['location'][0])
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasLongitude")[0], semanticDescriptor, m2mcin['location'][1])
        }
        if (m2mcin['address'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasStreetAddress")[0], semanticDescriptor, m2mcin['address']['postalAddress']['streetAddress'])
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasAddressLocality")[0], semanticDescriptor, m2mcin['address']['postalAddress']['addressLocality'])
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasAddressRegion")[0], semanticDescriptor, m2mcin['address']['postalAddress']['addressRegion'])
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasPostalCode")[0], semanticDescriptor, m2mcin['address']['postalAddress']['postalCode'])

        }
            if (m2mcin['direction'] != undefined )
            {
                parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasDirection")[0], semanticDescriptor, m2mcin['direction'])
            }
            if (m2mcin['refBusLines'] != undefined )
            {
               // console.log("refBusLines");
                var ln=m2mcin['refBusLines'].length;
                clearNodes("smartBus:hasRefBusLines",semanticDescriptor);
                createNode("smartBus:hasRefBusLines",semanticDescriptor,ln,"string","smartBus:busStop",true)
                var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRefBusLines");
                for(var i=0;i< nodes.length;i++)
                {
                    parseNode(nodes[i],semanticDescriptor,m2mcin['refBusLines'][i])
                }
            }
            if (m2mcin.dateModified != undefined ) {
                parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
            }
        var newsmd = semanticDescriptor
        var XMLSerializer = xmldom.XMLSerializer;
        var newSD = new XMLSerializer().serializeToString(newsmd);
        return newSD
    }
    else if(rootParent.toLowerCase()=="busline")
    {
        if (m2mcin['id'] != undefined)
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasId")[0], semanticDescriptor, m2mcin['id'])
        }
        if (m2mcin['refBusStops'] != undefined)
        {
            //console.log("refBusStops");
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasRefBusStops")[0], semanticDescriptor, m2mcin['refBusStops'])
        }
        if (m2mcin['localId'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasLocalId")[0], semanticDescriptor, m2mcin['localId'])
        }
        if (m2mcin['shortId'] != undefined) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasShortId")[0], semanticDescriptor, m2mcin['shortId'])
        }
        if (m2mcin['name'] != undefined)
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasName")[0], semanticDescriptor, m2mcin['name'])
        }
        if (m2mcin['refStartBusStop'] != undefined)
        {
            console.log("refStartBusStop");
            var ln=m2mcin['refStartBusStop'].length;
           // console.log("refEndBusStop");
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasRefStartBusStop")[0], semanticDescriptor, m2mcin['refStartBusStop'])   //StartBusStops is an string composed of string array
        }
            // clearNodes("smartBus:hasRefStartBusStop",semanticDescriptor);
            // createNode("smartBus:hasRefStartBusStop",semanticDescriptor,ln,"string","smartBus:busLine",true)
            // var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRefStartBusStop");
            // for(var i=0;i< nodes.length;i++)
            // {
            //     parseNode(nodes[i],semanticDescriptor,m2mcin['refStartBusStop'][i])
            // }
        if (m2mcin['refEndBusStop'] != undefined)
        {
           // console.log("refEndBusStop");
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasRefEndBusStop")[0], semanticDescriptor, m2mcin['refEndBusStop']) //refEndBusStop is an string composed of string array
        }
        if (m2mcin['startTime'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasStartTime")[0], semanticDescriptor, m2mcin['startTime'])
        }
        if (m2mcin['endTime'] != undefined)
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasEndTime")[0], semanticDescriptor, m2mcin['endTime'])
        }
        if (m2mcin['intervalNorm'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasIntervalNorm")[0], semanticDescriptor, m2mcin['intervalNorm'])
        }
        if (m2mcin['intervalHoli'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasIntervalHoli")[0], semanticDescriptor, m2mcin['intervalHoli'])
        }
        if (m2mcin['intervalPeak'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasIntervalPeak")[0], semanticDescriptor, m2mcin['intervalPeak'])
        }

        if(m2mcin.datemodified != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
        }
        var newsmd = semanticDescriptor
        var XMLSerializer = xmldom.XMLSerializer;
        var newSD = new XMLSerializer().serializeToString(newsmd);
        return newSD
    }
    else if(rootParent.toLowerCase()=="busestimation")
    {
        if (m2mcin['name'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasName")[0], semanticDescriptor, m2mcin['name'])
        }
        if (m2mcin['id'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasId")[0], semanticDescriptor, m2mcin['id'])
        }
        if (m2mcin['refBusStop'] != undefined )
        {
           // console.log("refBusStop");
            var ln=m2mcin['refBusStop'].length;
            clearNodes("smartBus:hasRefBusStops",semanticDescriptor);
            createNode("smartBus:hasRefBusStops",semanticDescriptor,ln,"string","smartBus:busEstimation",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRefBusStops");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['refBusStops'][i])
            }
        }
        if (m2mcin['refBusLine'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasRefBusLine")[0], semanticDescriptor, m2mcin['refBusLine'])
        }
        if (m2mcin['remainingDistances'] != undefined )
        {
           // console.log("remainingDistances");
            var ln=m2mcin['remainingDistances'].length;
            clearNodes("smartBus:hasRemainingDistances",semanticDescriptor);
            createNode("smartBus:hasRemainingDistances",semanticDescriptor,ln,"string","smartBus:busEstimation",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRemainingDistances");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['remainingDistances'][i])
            }
        }

        if (m2mcin['remainingTimes'] != undefined )
        {
          //  console.log("remainingTimes");
            var ln=m2mcin['remainingTimes'].length;
            clearNodes("smartBus:hasRemainingTimes",semanticDescriptor);
            createNode("smartBus:hasRemainingTimes",semanticDescriptor,ln,"string","smartBus:busEstimation",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasRemainingTimes");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['remainingTimes'][i])
            }
        }
        if (m2mcin['destinationBusLines'] != undefined )
        {
           // console.log("destinationBusLines");
            var ln=m2mcin['destinationBusLines'].length;
            clearNodes("smartBus:hasDestinationBusLines",semanticDescriptor);
            createNode("smartBus:hasDestinationBusLines",semanticDescriptor,ln,"string","smartBus:busEstimation",true)
            var nodes=semanticDescriptor.getElementsByTagName("smartBus:hasDestinationBusLines");
            for(var i=0;i< nodes.length;i++)
            {
                parseNode(nodes[i],semanticDescriptor,m2mcin['destinationBusLines'][i])
            }
        }
        if (m2mcin['shortId'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasShortId")[0], semanticDescriptor, m2mcin['shortId'])
        }
        if (m2mcin['remainingStations'] != undefined ) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasRemainingStations")[0], semanticDescriptor, m2mcin['remainingStations'])
        }
        if (m2mcin['companyName'] != undefined ) {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasCompanyName")[0], semanticDescriptor, m2mcin['companyName'])
        }
        if (m2mcin['location'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasLatitude")[0], semanticDescriptor, m2mcin['location'][0])
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasLongitude")[0], semanticDescriptor, m2mcin['location'][1])
        }
        if (m2mcin['dateModified'] != undefined )
        {
            parseNode(semanticDescriptor.getElementsByTagName("smartBus:hasDateModified")[0], semanticDescriptor, m2mcin['dateModified'])
        }
        var newsmd = semanticDescriptor
        var XMLSerializer = xmldom.XMLSerializer;
        var newSD = new XMLSerializer().serializeToString(newsmd);
        return newSD
    }
    else
    {
        return xmlDoc;
    }

}
function testJSON(text){
    try{
        JSON.parse(text);
        return true;
    }
    catch (error){
        return false;
    }
}
var dictToArray=function (obj,keyflag) {
    var arr=[];
    for (var key in obj)
    {
        if (obj.hasOwnProperty(key)) {
            if (keyflag==true)
            {
                arr.push(key);
            }
            arr.push(obj[key]);
        }
    }
    return arr;

}
var parseNode=function(stem,xmlDoc,m2mcin)
{
    var  node=stem;
    if (node)
    {

        var textNode = node.childNodes[0];
        if (!textNode)
        {
            textNode = xmlDoc.createTextNode("");
            node.appendChild(textNode);
        }
        textNode.nodeValue = m2mcin;
        textNode.data = m2mcin.toString();
    }
    else
    {
        console.log(' node  does not exist for value--'+m2mcin);
    }

}
var createNode=function(name,xmldocument,count,dataTypeofAttribute,parentNode,flag) {
    // createNode("park:hasChargeType",semanticDescriptor,ln,"string","park:OnStreetParking",true)
    var structure = dataStructureFile.rdfTypeScheme;
    for (var i = 0; i < count; i++)
    {
        var node = xmldocument.getElementsByTagName(parentNode)[0];
        if (node)
        {
            var element = xmldocument.createElement(name)
            if (element && flag == true)
            {
                var textNode = xmldocument.createTextNode("");
                element.appendChild(textNode);
                var att = xmldocument.createAttribute(structure.type);
                att.value = structure.values[dataTypeofAttribute];        // Set the value of the class attribute
                element.setAttributeNode(att)
            }
            xmldocument.getElementsByTagName(parentNode)[0].appendChild(element);
        }
    }
}
var  createNestedNode =function(dictofNodeName,valueDict,parentNode,rootNode,xmldoc,literaldataType,flag)
{
    var structure=dataStructureFile.rdfTypeScheme;
    var node=xmldoc.getElementsByTagName(rootNode)[0];
    var  parentelement = xmldoc.createElement(parentNode)
    if(parentelement)
    {
        for(var i=0;i<dictofNodeName[0].length;i++)
        {
            var item=dictofNodeName[0][i];
            var flag=dictofNodeName[1][i];
            var  element = xmldoc.createElement(item.toString())
            if (element!=undefined && flag==true)
            {
                var  textNode = xmldoc.createTextNode("");
                element.appendChild(textNode);
                var att = xmldoc.createAttribute(structure.type);       // Create a "class" attribute
                att.value = structure.values[literaldataType[i]];              // Set the value of the class attribute
                element.setAttributeNode(att)
                parentelement.appendChild(element);
                parseNode(element,xmldoc,valueDict[i])
            }
        }
        xmldoc.getElementsByTagName(rootNode)[0].appendChild(parentelement);
    }
}
var clearNodes=function (name,xmlDoc)
{
    var ln=xmlDoc.getElementsByTagName(name).length;
    var node=xmlDoc.getElementsByTagName(name);
    for(var i=0;i<ln;i++)
        {
            var root=node[i];
            if (root)
            {
                root.parentNode.removeChild(root);
            }
        }
}
var removeWhitespace=function(xml)
{
    var loopIndex;
    for (loopIndex = 0; loopIndex < xml.childNodes.length; loopIndex++)
    {
        var currentNode = xml.childNodes[loopIndex];

        if (currentNode.nodeType == 1)
        {
            removeWhitespace(currentNode);
        }

        if (!(/\S/.test(currentNode.nodeValue)) && (currentNode.nodeType == 3))
        {
            xml.removeChild(xml.childNodes[loopIndex--]);
        }
    }

}
var updatenodeAtrribute=function (stem,xmlDoc,attribute,newValue)
{
    var  node=stem;
    //var att=node.getAttribute(attribute)
    if (node)
    {
        var textNode = node.childNodes[0];
        node.removeAttribute(attribute);
        var att = xmlDoc.createAttribute(attribute);       // Create a "class" attribute
        att.value = newValue                           // Set the value of the class attribute
        node.setAttributeNode(att)
        var att=node.getAttribute(attribute)
        //console.log("Attribute Value=",att)
        // if (!textNode)
        // {
        //     textNode = xmlDoc.createTextNode("");
        //     node.appendChild(textNode);
        //
        // }
        return node;
    }
}
var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }
        return output;
    },


    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }
        output = Base64._utf8_decode(output);
        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c =0;
        var c1 = 0;
        var c2=0;
        var c3=0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

var splitResourceArray=function (array) {

    var newArray=[];
    var j=0;
    for(var item in array)
    {
        if (item.split('/').length<=3)
        {
            newArray[j++]=item;
        }
    }
    return newArray
}
var mobiusMqttsubscribe=function (temp)
{
    api.checkResourcesubscription(temp, function (aes)
    {
        console.log('For '+temp+' AESattributes= ',aes);
        if (aes['m2m:sub']==undefined)
        {

            api.Resourcesubscription(temp, function (sub)
            {
                temp=temp.replace(csebase,'')
                mqtt.subscibeTopic(temp);
            })
        }
        else
        {
            var checksub=false
            for(var i=0;i<aes['m2m:sub'].length;i++)
            {
                var t=aes['m2m:sub'][i];
                if(t['nu'] != undefined)
                {
                    var nu=JSON.stringify(t['nu'])
                    if(nu.indexOf(serverIP)>=0)
                    {
                        console.log('notification URL=',nu);
                        checksub=true;
                        temp=temp.replace(csebase,'')
                        mqtt.subscibeTopic(temp);
                        break;
                    }
                }
            }
            if(checksub==false)
            {
                api.Resourcesubscription(temp, function (sub)
                {
                    temp=temp.replace(csebase,'')
                    mqtt.subscibeTopic(temp);
                })

            }
        }
    })
}
module.exports.mobiusMqttsubscription=mobiusMqttsubscribe
module.exports.splitArray=splitResourceArray
module.exports.notificationHandling=notif
