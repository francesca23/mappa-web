function initMap(data) {
    map = L.map("map");
    map.addEventListener("zoom", onZoom);
    markersLayer = new L.FeatureGroup().addTo(map);
    var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    var tiles = L.tileLayer(data.tilesUrl, { attribution: osmAttr });
    tiles.addTo(map);
}

function createLocations(data) {
    $(".locations .list").empty(); // ripulisci la sidebar
    markersLayer.clearLayers(); // ripulisci la mappa

    data.luoghi.forEach(setNumber);
    var filteredData = data.luoghi.filter(locationsFilter); // filtra dati usando locationsFilter()

    for (var i in filteredData) {
        // per ogni luogo filtrato:
        var luogo = filteredData[i];
        var listItem = createListItem(luogo); // crea elemento sidebar
        $(".locations .list").append(listItem); // e aggiungilo alla sidebar

        if (luogo.latitudine && luogo.longitudine) {
            // se ha latitudine e longitudine
            var marker = createMarker(luogo); // crea marker
            marker.addTo(markersLayer); // e aggiungilo alla mappa
            marker.on(
                "click",
                selectLocation(listItem, marker, luogo) // al click sul marker esegui selectLocation()
            );
            listItem.on(
                "click",
                selectLocation(listItem, marker, luogo) // al click sull'elemento esegui selectLocation()
            );
        }
    }
}

function setNumber(luogoData, idx) {
    if (luogoData.numero === undefined) {
        luogoData.numero = parseInt(idx) + 1;
    }
}

function createListItem(luogoData) {
    var item = $($("#listitemtmpl").html()); // carica html da template
    item.addClass(luogoData.tipologia || ""); // aggiungi la tipologia del luogo come classe CSS
    item.addClass(luogoData.contentsPath ? "hasPath" : ""); // aggiungi classe CSS "hasPath" se il luogo ha contenuti
    item.find(".nome").text(luogoData.nome); // aggiungi titolo all'elemento con classe "nome"
    item.find(".indirizzo").text(luogoData.indirizzo); // aggiungi indirizzo all'elemento con classe "indirizzo"
    item.find(".numero").text(luogoData.numero); // aggiungi numero o n. successivo all'elemento con classe "numero"
    luogoData.descrizione = luogoData.descrizione; // aggiungi descrizione all'elemento con classe "descrizione"
    return item;
}

function createMarker(luogoData) {
    var iconClass = luogoData.tipologia || ""; // aggiungi la tipologia del luogo come classe CSS
    iconClass += " " + (luogoData.tipologia || "") + (luogoData.numero || ""); // aggiungi la tipologia del luogo come classe CSS
    iconClass += luogoData.contentsPath ? " hasPath" : ""; // aggiungi classe CSS "hasPath" se il luogo ha contenuti
    
    var icon = L.divIcon({
        className: "icon " + iconClass, // crea icona marker con le classi CSS estratte dai dati
        iconSize: luogoData.dimensione || 25, // e con le dimensioni estratte dai dati
        html: luogoData.numero // senza testo
    });
    var marker = L.marker(
        // crea marker
        [luogoData.latitudine, luogoData.longitudine],
        { icon: icon }
    );
    return marker;
}

function selectLocation(listItem, marker, luogo) {
    return function() {
        selectMarker(marker);
        selectListItem(listItem, luogo);
    };
}

function selectListItem(listItem, luogo) {
    $(".location").removeClass("selected");
    listItem.addClass("selected");

    var path = luogo["contentsPath"];
    $(".details .header h2").html(luogo.nome);
    $(".details").toggleClass("hasPath", !!path);
if (path) {
        var html = $("<iframe/>", { src: "custom/contents/" + path, frameBorder: 0 })
        loadLocationHtml(html);
		$("#sidebar").animate({ left: "-100%" }, {duration: 1000})
    } else {
		$("#sidebar").animate({ left: "0%" }, {duration: 1000})
    }
}

function loadLocationHtml(html) {
    $(".details .contents").html(html);
}

function back() {
    $("#sidebar").animate({ left: "0" }, {duration: 1000});
	$("#sidebar").animate({ left: "0" }, {duration: 1000});
    $(".icon").removeClass("selected");
    $(".location").removeClass("selected");
}

function selectMarker(marker) {
    $(".icon").removeClass("selected");
    $(marker._icon).addClass("selected");
}

function locationsFilter(luogo) {
    var tipo = luogo.tipologia;
    var showInfrastrutture = $(".infrastrutture").is(":checked");
    var showPromozione = $(".promozionecreativa").is(":checked");
    var showProduzione = $(".produzionecreativa").is(":checked");
  
    // se niente è selezionato, non mostrare niente
    if (!showInfrastrutture && !showPromozione && !showProduzione) return false;

    // altrimenti mostra solo i luoghi delle tipologie selezionate
    if (!showInfrastrutture && tipo === "infrastrutture") return false;
    if (!showPromozione && tipo === "promozionecreativa") return false;
    if (!showProduzione && tipo === "produzionecreativa") return false;

    return true;
}

function onZoom(){
    $("body").attr("class", "").addClass("z"+map.getZoom());
}

var map;
var markersLayer;
var data;
var selected;
var rombo;

initMap(data);
createLocations(data);
map.fitBounds(markersLayer.getBounds(), { paddingTopLeft: [500, 0] });

$("input[type=checkbox]").on("change", function() {
    if (!data) return;
    createLocations(data);
});



