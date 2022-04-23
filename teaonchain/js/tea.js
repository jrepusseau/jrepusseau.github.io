window.onload = function() {
    if (window.location.href.indexOf('scan.html') > -1 || window.location.href.indexOf('index.html') > -1) {
        scanner();
    };

    if (window.location.href.indexOf('detail.html') > -1 || window.location.href.indexOf('navdetail.html') > -1) {
        swipetab();
    };


};


// scanner
function scanner() {
    var scanner = new Instascan.Scanner({
        video: document.getElementById('preview'),
        scanPeriod: 5,
        mirror: false
    });
    scanner.addListener('scan', function(content) {
        // alert(content);
        window.location.href = content;
    });
    Instascan.Camera.getCameras().then(function(cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[1]);
            $('[name="options"]').on('change', function() {
                if ($(this).val() == 1) {
                    if (cameras[0] != "") {
                        scanner.start(cameras[0]);
                    } else {
                        alert('No Front camera found!');
                    }
                } else if ($(this).val() == 2) {
                    if (cameras[1] != "") {
                        scanner.start(cameras[1]);
                    } else {
                        alert('No Back camera found!');
                    }
                }
            });
        } else {
            console.error('No cameras found.');
            alert('No cameras found.');
        }
    }).catch(function(e) {
        console.error(e);
        alert(e);
    });

};

// swipe tab in detail page
function swipetab() {
    $(".card").swipe({
        swipeLeft: function(event, direction, distance, duration, fingerCount) {
            $(".nav-tabs li.active").next('li').find('a').tab('show');
        },
        swipeRight: function(event, direction, distance, duration, fingerCount) {
            $(".nav-tabs li.active").prev('li').find('a').tab('show');
        },
    });

};

// side nav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";

}


var assetName= "d47473f7409c360c3daa7772c1fd1a2e12b67350b0a6a2d7fe3b2224484f4e474348414c45415645533034323032303232";




function returnTxAsset(assetidt) {
    var xtp = new XMLHttpRequest();

    xtp.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/assets/' + assetidt + '/txs', false); // false for synchronous request
    //Use the API account created on the header 
    xtp.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtp.send(null);
    //Then we retrieve the API response 
    var contentt = JSON.parse(xtp.responseText);
    // then we look for the transaction 0,1,2,3 to display them 
    
    var dateArray =[], 
    FromAddressArray =[], 
    ToAddressArray=[], 
    metatext =[]; 

    contentt.forEach((element,index) =>{

        if (index < 4) 
        {

        var xts = new XMLHttpRequest();
        xts.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/txs/' + element, false); // false for synchronous request
        xts.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
        xts.send(null);
    
        var d0 = JSON.parse(xts.responseText)
        const unixTime0 = d0.block_time;
        dateArray.push(new Date(unixTime0 * 1000));

        let infoTx = returnIO(element)
        FromAddressArray.push(stakeAddressMatch(returnStake(infoTx[0]))) ;
        ToAddressArray.push(stakeAddressMatch(returnStake(infoTx[1]))); 

        var xtpr = new XMLHttpRequest(); 
    xtpr.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/txs/' + element + '/metadata', false); // false for synchronous request
    xtpr.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtpr.send(null)



    try
    {
    var textpr = JSON.parse((xtpr.responseText).replace('[', '').replace(']', '').replace('[', '').replace(']', ''));
    metatext.push(textpr.json_metadata.msg);
    }
    catch
    {
     metatext.push("");
    }


        }
}
    )

    




/*
    

    var xtpr = new XMLHttpRequest(); // Transaction 1 
    xtpr.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/txs/' + contentt[1] + '/metadata', false); // false for synchronous request
    xtpr.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtpr.send(null)

    var textpr = JSON.parse((xtpr.responseText).replace('[', '').replace(']', '').replace('[', '').replace(']', ''));


   */

    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

   // var listdd = [dd0, dd1, dd2, dd3]
    var metadataex = ["Picking Inspection","Processing","Warehousing", "Retail", "Operation1", "Operation2","Operation3","Operation4"]


    const traceEvent = document.getElementById("traceEvent")

  /*  
    listdd.forEach((element,index) => {
    let li1 = document.createElement('li');
    li1.setAttribute("data-date", element.toLocaleDateString("en-US", options));
    li1.setAttribute("class", "event")
    let newSelect=document.createElement('select');

  let link =document.createElement('a');
   link.href= "https://cardanoscan.io/transaction/"+contentt[index];
    link.target="_blank";
    link.innerText=" > ";
    
    let infoTx = returnIO(contentt[index])
let FromAddress = stakeAddressMatch(returnStake(infoTx[0])) ;
let ToAddress=stakeAddressMatch(returnStake(infoTx[1])) ; 
    li1.innerHTML = " <h3 onclick='alert("+ +")> " + metadataex[index] + "</h3></br><p>"+FromAddress+">"+ToAddress+"</p>";
let test = [contentt[index].slice(0,9)+"...","test"];

for (var i = 0; i < test.length; i++) {
    var optn = test[i];
    var el = document.createElement("option");
    el.setAttribute("data-input", FromAddress);
    el.setAttribute("data-output", ToAddress);
    el.textContent = optn;
    el.value = optn;
    newSelect.appendChild(el);
} 
*/ 

/*
var group0=[], group1=[], group2=[], group3=[];
var index0=[], index1=[], index2=[], index3=[];
group0.push(ToAddressArray[0])
index0.push(0)

FromAddressArray.forEach((element,index) => {
   if (group0.includes(element))
 {group1.push(ToAddressArray[index])
 index1.push(index)}
})

FromAddressArray.forEach((element,index) => {
    if (group1.includes(element))
 { group2.push(ToAddressArray[index])
    index2.push(index)}
 })

 FromAddressArray.forEach((element,index) => {
    if (group2.includes(element))
  {group3.push(ToAddressArray[index])
    index3.push(index)}
 })



var Arraygroup = [group0,group1,group2,group3]



Arraygroup.forEach((element,index) => {
 
    let newSelect=document.createElement('select');
   newSelect.id="type"+index;
  
    //  element.forEach(ele =>{
    let optn = element[0];
    let el = document.createElement("option");
   // el.setAttribute("data-input", FromAddress);
   // el.setAttribute("data-output", ToAddress);
    el.textContent = optn;
   el.value="item"+index;
    // el.value = optn;
    newSelect.appendChild(el);
//})


  
    traceEvent.append(newSelect);
   // traceEvent.append(link);
  //  traceEvent.append(li1);
    })
*/




dateArray.forEach((element,index) => {

   
    let li1 = document.createElement('li');
    li1.setAttribute("data-date", element.toLocaleDateString("en-US", options));
    li1.setAttribute("class", "event")
    li1.innerHTML = "<p>"+FromAddressArray[index].slice(0,15)+">"+ToAddressArray[index].slice(0,15)+"</p>"+" <h3> " + metadataex[index] + " <a href='https://cardanoscan.io/transaction/"+contentt[index]+"' target='blank'> ></a></h3>"+
  "<p>"+metatext[index]+"</p>";


 /* let link =document.createElement('a');
   link.href= "https://cardanoscan.io/transaction/"+contentt[index];
    link.target="_blank";
    link.innerText=" > ";*/

    
     



/*
for (var i = 0; i < test.length; i++) {
    var optn = test[i];
    var el = document.createElement("option");
   // el.setAttribute("data-input", FromAddress);
   // el.setAttribute("data-output", ToAddress);
    el.textContent = optn;
    el.value = optn;
    newSelect.appendChild(el);
} */

/*let newSelect=document.createElement('button');
newSelect.type= "button";
newSelect.setAttribute("class", "btn btn-success");
newSelect.innerText=ToAddressArray[index].slice(0,15);



    traceEvent.append(newSelect);*/
    traceEvent.append(li1); 
   // traceEvent.append(link);

    
  }  )

   /* var li2 = document.createElement('li');
    li2.setAttribute("data-date", dd1.toLocaleDateString("en-US", options))
    li2.setAttribute("class", "event")
    li2.innerHTML = " <h3>Processing</h3><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>"



    traceEvent.append(li2);

    var li3 = document.createElement('li');
    li3.setAttribute("data-date", dd2.toLocaleDateString("en-US", options))
    li3.setAttribute("class", "event")
    li3.innerHTML = " <h3>Warehousing and Logistics</h3><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>"
    traceEvent.append(li3);

    var li4 = document.createElement('li');
    li4.setAttribute("data-date", dd3.toLocaleDateString("en-US", options))
    li4.setAttribute("class", "event")
    li4.innerHTML = " <h3>Retail</h3><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>"
    traceEvent.append(li4); */ 



}

function returnAsset(assetid, imgid, textid) {
    var xtv = new XMLHttpRequest();
    xtv.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/assets/' + assetid, false); // false for synchronous request
    xtv.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtv.send(null);


    var ascntr = JSON.parse(xtv.responseText);
    try {
        const myArray3 = ascntr.onchain_metadata.image.split("//");
        document.getElementById(imgid).src = 'https://ipfs.io/ipfs/' + myArray3[1];
    } catch {}

    var table = document.createElement('table');
    table.className = 'table table-striped';
    table.innerHTML = '<tr>  <td> Name </td> <td>' + ascntr.onchain_metadata.name + '</td></tr>' +
        '<tr><td> Variety </td><td>' + ascntr.onchain_metadata.harvestingProductVariety + '</td></tr>' +
        '<tr><td> Review </td><td>' + ascntr.onchain_metadata.review + '</td></tr>' +
        '<tr><td> Picking date </td><td>' + ascntr.onchain_metadata.harvestingTimeStart + '</td></tr>' +
        '<tr><td> Quantity </td><td>' + ascntr.onchain_metadata.harvestingQuantity + ascntr.onchain_metadata.harvestingQuantityUnit + '</td></tr>'
    document.getElementById(textid).appendChild(table);

    //Then we retrieve certification data

    var xtv = new XMLHttpRequest();
    xtv.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/txs/' + ascntr.onchain_metadata.certificateTx + '/metadata', false); // false for synchronous request
    xtv.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtv.send(null);


    var w;
    var contentq = JSON.parse(xtv.responseText);
    //   alert(xtx.responseText);
    var u = (contentq[0].json_metadata);

    for (var key in u) {
        var value = u[key];
        for (var n in value) {
            w = value[n];
            // console.log(y);
        }
    }
    const myArray3 = w.image.split("//");
    document.getElementById("certificateImg").src = 'https://ipfs.io/ipfs/' + myArray3[1];
    var table = document.createElement('table');
    table.className = 'table table-striped';
    table.innerHTML = '<tr>  <td> Name </td> <td>' + w.name + '</td></tr>' +
        '<tr><td> Delivered By </td><td>' + w.deliveredBy + '</td></tr>' +
        '<tr><td> Score </td><td>' + w.scorePercent + '% of Organic leaves' + '</td></tr>' +
        '<tr><td> Certfication date </td><td>' + w.certificationStart + '</td></tr>' +
        '<tr><td> Renewal date </td><td>' + w.renewalDate + '</td></tr>';
    document.getElementById("certInfo").appendChild(table);


    var xte = new XMLHttpRequest();
    xte.open("GET", 'https://cardano-mainnet.blockfrost.io/api/v0/txs/' + ascntr.onchain_metadata.derivesFromTx + '/metadata', false); // false for synchronous request
    xte.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xte.send(null);

    //We clean the data and store the data of interest in y
    var y;
    var contenth = JSON.parse(xte.responseText);
    //   alert(xtx.responseText);
    var z = (contenth[0].json_metadata);

    for (var key in z) {
        var value = z[key];
        for (var n in value) {
            y = value[n];
            // console.log(y);
        }
    }

    let placeName = document.getElementById("placeName");
    placeName.innerText = y.placeName;

    let placeAddress = document.getElementById("placeAddress");
    placeAddress.innerText = y.placeAddress;


    try {
        var propertydata = y.placeLatLong.split(", ");
    } catch {};
    //We choose OpenLayers to create the map 
    //Then we create an icon with Lat Lng 
    const iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(propertydata[1]), parseFloat(propertydata[0])])),
        name: 'Somewhere near Taiwan',
    });

    //Here we create the map 
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
            }),
            new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [iconFeature]
                }),
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://openlayers.org/en/latest/examples/data/icon.png'
                    })
                })
            })
        ],
        //Then here we create a specific view 
        view: new ol.View({
            center: ol.proj.fromLonLat([parseFloat(propertydata[1]), parseFloat(propertydata[0])]),
            zoom: 6
        })
    });
}


function returnIO(hash)
{
  
   var xhpd= new XMLHttpRequest();
    xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+hash+'/utxos', false ); // false for synchronous request
  xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xhpd.send( null );
      var dataIO = JSON.parse(xhpd.responseText)
     

    var input = dataIO.inputs[0].address; 
    var output = dataIO.outputs[0].address;  

 /* var amount1u =dataIO.inputs[0].amount[0].unit;
      var amount1q= dataIO.inputs[0].amount[0].quantity;
     try{
        var amount2u =dataIO.inputs[0].amount[1].unit;
      var amount2q=  dataIO.inputs[0].amount[1].quantity;
      }
       catch
       {  
          var amount2u ="";
               var amount2q ="";
           
         }
       
   return [input, output,amount1u,amount1q, amount2u,amount2q]; Data sturcture not ready */ 

   return [input, output, xhpd.responseText]
  
}


function returnStake(ad)
{
  
   var xhpd= new XMLHttpRequest();
    xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/addresses/'+ad, false ); // false for synchronous request
  xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xhpd.send( null );
      var dataIO = JSON.parse(xhpd.responseText)
     var stake = dataIO.stake_address;
    return stake;
  
}


function stakeAddressMatch(adr)
{
    let test = adr;
    var arr = { "stake1u9n0k2asae4k9ntlc8g2klmcy96nhqfmss3389jxg4zd38chpwx0l":"@Minting" ,"stake1uxh66rrhqw6xnmgzzwecfay88qj82dldkqnxzv24vsd2jlcntzenm":"@Farmer", "stake1uxkfxnq76mdljmpjsca8uf4cvys263vxnjdgrgecyl0r85cphcncy": "@Fund", "stake1u8rff8gxmd77vemd7gdlg3pp69vgmcnctmfwh2y856w38ushuc9q3": "@Manufacturer", "stake1uxpynvn33jd8d76xkneu8ht78x680prgxgfx8zcf8tmt2jqjf5yz5": "@TeaBranding", "stake1uxvu52cu9md7278xusj2uw5afc6vzv6vk5u2kv9dqepk6dgqpw735" : "@Retailer"}; 

    for (let i = 0; i < Object.keys(arr).length; i++) {
         if (adr == Object.keys(arr)[i])
        test = Object.values(arr)[i]; 
        if (adr == Object.values(arr)[i])
        test = Object.keys(arr)[i]; 
    }
    return test; 
}

