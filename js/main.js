var totalSalesMother =[];
var sales = [];
var mapaBueno;

var barData ={
	labels: [],
	datasets: [{
		label: 'Sales',
		data: [],
		backgroundColor: 'rgba(255, 99, 132, 0.2)',
		borderColor:'rgba(255,99,132,1)',
		borderWidth: 1
	}]
};

var donutData = {
    labels: [
        "Red",
        "Blue",
        "Yellow"
    ],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 159, 64, 1)'
            ],
			borderWidth: 1
        }]
};


let myBarChart = new Chart(salesGraph, {
	type: 'line',
	data: barData,
	options: {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			yAxes: [{
					display: true,
					ticks: {
						beginAtZero: true,
						steps: 1,
						stepValue: 1,
						max: 10
					}
				}],
			xAxes: [{
				ticks: {
					maxRotation: 0 // angle in degrees
				}
			}]
		},
		title: {
			display: true,
			text: 'Live sales Updates'
		},
		tick:{
			fontSize:10,
		},
		tooltipFillColor: "rgba(0,0,0,0.8)"
	}
});

function prepareMap(){
	google.maps.event.trigger(mapaBueno, "resize");
	var centerOfMap = {lat:36.778259, lng: -119.417931};
	mapaBueno.setCenter(centerOfMap);
}


//----  TABS STUFF  ----//
function startTabs(){
	let bigTabs = document.getElementById("big-tabs")
		bigPanels = document.getElementById("big-panels"),
		map=true;
	tabsControl(bigTabs,bigPanels,map);

	let smallTabs = document.getElementById("small-tabs"),
		smallPanels = document.getElementById("small-panels");
	tabsControl(smallTabs, smallPanels);
}

function tabsControl(tabs,panels,map){
	tabs.addEventListener("click",function(e){
		e.preventDefault();
		if(e.target.hash !== undefined){
			let panelToShow = document.getElementById(e.target.hash.slice(1));

			for(let tab of tabs.children){
				tab.classList.remove("active");
			}
			for(let panel of panels.children){
				panel.classList.remove("active");
			}
			e.target.parentElement.classList.add("active");
			panelToShow.classList.add("active");
			if(map){
				prepareMap();
			}
		}
	},true);
}


function myMap() {
	var centerOfMap = {lat:36.778259, lng: -119.417931};
	var map = new google.maps.Map(document.getElementById('map'), {
		center : centerOfMap,
		scrollwheel:  false,
		zoom : 5
	});
	var styledMapType = new google.maps.StyledMapType([{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}]);

	map.mapTypes.set('styled_map', styledMapType);
	map.setMapTypeId('styled_map');

	return map;
}



function updateBigGragh(sale){
	barData.labels.push(sale.name);
	barData.datasets[0].data.push(sale.sales);

	if(barData.labels.length > 10){
		barData.labels.shift();
		barData.datasets[0].data.shift();
	}
	myBarChart.update();
}

function updateLatestSellers(){
	let container=document.getElementById("top-3-sellers");
	let sale= totalSalesMother[totalSalesMother.length -1];
	let dl = document.createElement("dl");
	dl.classList.add("is-active");
	dl.innerHTML="<dt>"+sale.name+"</dt><dd>"+sale.sales+" Gums, at: <small>" + prettyDate(new Date(sale.time)) + "</small></dd>";

	if(container.children.length>2){
		container.removeChild(container.childNodes[2]);
	}
	container.insertBefore(dl, container.firstChild);
}

function createMarker(sale){
	var location = {lat: parseFloat(sale.latitude), lng: parseFloat(sale.longitude)};
	var marker = new google.maps.Marker({
        position: location,
		icon: {
			path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
			fillColor: 'hotpink',
			fillOpacity: 1,
			strokeColor:'white',
			strokeWeight: 1
		},
		map: mapaBueno,
		animation: google.maps.Animation.DROP,
		title: sale.name
    });
}



let totalAmmountSales=0;
let DOM_totalSales = document.getElementById("totalSales");

window.onload = init;

function init() {
	mapaBueno = myMap();
	var interval = setInterval(handleRefresh, 3000);
	handleRefresh();
	startTabs();
}

function handleRefresh() {
	$.ajax({
	    url: "https://mighty-gumball-api.herokuapp.com/mighty_gumball_api",
	    type: "GET",
	    dataType: "json",
	    data: {
	    },
	    success: function (result) {
	        updateSales(result)
	    },
	    error: function () {
	        console.log("error");
	    }
	});
}

function prettyDate(date) {
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return date.getUTCHours()+':'+date.getUTCMinutes();
}

var lastReportTime = 0;


function updateSales(sale) {
	var salesTr = document.getElementById("miniTable");
	let tr = document.createElement("tr");

	tr.innerHTML = "<td>" + sale.name + " </td><td> " + sale.sales + " </td><td> <small>" + prettyDate(new Date(sale.time)) + "</small></td>";

	//llenamos el numero grande
	totalAmmountSales+=sale.sales;
	DOM_totalSales.innerHTML=totalAmmountSales;

	if (salesTr.childElementCount == 0) {
		salesTr.appendChild(tr);

		totalSalesMother.push(sale);
		updateBigGragh(sale);
		createMarker(sale,map)
	}
	else {
		salesTr.insertBefore(tr, salesTr.firstChild);

		totalSalesMother.push(sale);
		updateBigGragh(sale);
		updateLatestSellers();
		createMarker(sale);
		bestSeller();
	}
}

function getAddress(sale,sellerDiv) {
	var latlng = new google.maps.LatLng(sale.latitude, sale.longitude);
	var geocoder = new google.maps.Geocoder;
	geocoder.geocode({'location': latlng}, function(results, status) {
    	if (status === 'OK') {
			if (results[1]) {
				let respuesta = results[1].formatted_address;
				sellerDiv.innerHTML='<p class="title">Best Seller</p><h1>'+sale.sales+'</h1><p><b>'+sale.name+'</b><br>'+respuesta+'</p>'
			}
		}
	});
}

function notUndefined(obj){
	return obj.name !== undefined;
}


function removeDuplicates(arr){
	var new_arr = [];
    var lookup  = {};

	for (var i in arr) {
		lookup[arr[i].name] = arr[i];
	}
	for (i in lookup) {
		new_arr.push(lookup[i]);
	}
	return new_arr;
}

function orderAsc(a, b) {
	return b.sales - a.sales;
}

//global variable prueba
var stores=[];
function bestSeller(){
	let sellerDiv=document.getElementById("best-seller");
	let salesSorted = totalSalesMother.sort(orderAsc);

	for(let elem of totalSalesMother){
		let checkRepeated = gatherStores(elem);
		let repeated = checkRepeated(totalSalesMother);
		if(repeated.name!=undefined){
			stores.push(repeated);
		}
	}

	var uniqueArray = removeDuplicates(stores).sort(orderAsc);
	if(uniqueArray.length>0){
		if(uniqueArray[0].sales >= salesSorted[0].sales ){
			getAddress(uniqueArray[0],sellerDiv);
			 //recibe un elemnto del array de objetos y el div destino
		}
	}else{
		getAddress(salesSorted[0],sellerDiv);//we set the values at first
	}
}

function gatherStores(elem){
	return function(array){
				let name,
					sum=elem.sales,
					latitude = elem.latitude;
					longitude = elem.longitude;
				for(let item of array){
					if(item.name === elem.name && item.time!==elem.time){
						sum+=item.sales;
						name=item.name;
					}
				}
				return {
					name:name,
					sales:sum,
					latitude:latitude,
					longitude:longitude
				};
			}
}
